import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Paper, Modal, Button, Avatar, Alert, TextField, Tab, Tabs, Snackbar, FormControl, InputLabel, Select, MenuItem, Chip, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { useTheme } from "@mui/material/styles";
import axios from 'axios';
import { useKeycloak } from "@react-keycloak/web";

const CourseManagerCourses = () => {
    const theme = useTheme();
    const { keycloak, initialized } = useKeycloak();
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [requests, setRequests] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [expanded, setExpanded] = useState({});
    const [expandedSkills, setExpandedSkills] = useState({}); // per-course skills expand state
    const [noRequests, setNoRequests] = useState(false);
    const [tabIndex, setTabIndex] = useState(0);
    const [attendingStudents, setAttendingStudents] = useState([]);
    const [completedStudents, setCompletedStudents] = useState([]);
    const [grades, setGrades] = useState({}); // Store grades for attending students
    const [isAddCourseModalOpen, setIsAddCourseModalOpen] = useState(false);
    const [editingCourseId, setEditingCourseId] = useState(null); // Track which course is being edited
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [courseToDelete, setCourseToDelete] = useState(null);
    const [newCourse, setNewCourse] = useState({
        name: '',
        description: '',
        university: keycloak?.idTokenParsed?.university || '',
        course_skills: []
    });
    const [availableSkills, setAvailableSkills] = useState([]);
    const [courseSkills, setCourseSkills] = useState({}); // Store skills for each course
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    // Helper function to show alerts
    const showAlert = (message, severity = 'success') => {
        setSnackbar({
            open: true,
            message,
            severity
        });
    };

    // Handle snackbar close
    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    // Fetch skills for a specific course
    const fetchCourseSkills = async (courseId) => {
        try {
            const response = await axios.get(`/uc2/course/${courseId}/skills`);
            // API returns an array of objects shaped like: { skill: { id, name, ... } }
            // Flatten to a plain array of skill objects for easier rendering
            const skillsArray = Array.isArray(response.data)
                ? response.data
                    .map((wrapper) => wrapper && wrapper.skill)
                    .filter((s) => Boolean(s))
                : [];
            return skillsArray;
        } catch (error) {
            console.error(`Error fetching skills for course ${courseId}:`, error);
            return [];
        }
    };

    // Fetch courses managed by the course manager
    useEffect(() => {
        const fetchCoursesAndSkills = async () => {
            try {
                const response = await axios.get(`/uc1/course_manager/${keycloak.idTokenParsed.preferred_username}/courses`);
                const coursesData = response.data;
                setCourses(coursesData);

                // Fetch skills for each course
                const skillsPromises = coursesData.map(async (course) => {
                    const skills = await fetchCourseSkills(course.course.id);
                    return { courseId: course.course.id, skills };
                });

                const skillsResults = await Promise.all(skillsPromises);
                const skillsMap = {};
                skillsResults.forEach(({ courseId, skills }) => {
                    skillsMap[courseId] = skills;
                });
                setCourseSkills(skillsMap);
            } catch (error) {
                console.error("Error fetching courses:", error);
            }
        };

        if (initialized) {
            fetchCoursesAndSkills();
        }
    }, [initialized]);

    // Fetch available skills for dropdown
    useEffect(() => {
        axios.get('/uc4/green/filter')
            .then(response => {
                setAvailableSkills(response.data);
            })
            .catch(error => console.error("Error fetching skills:", error));
    }, []);

    // Fetch requests for the selected course
    const fetchRequests = (courseId) => {
        axios.get(`/uc1/courses/${courseId}/requests`)
            .then(response => {
                console.log(response.data);
                setRequests(response.data);
                setNoRequests(response.data.length === 0);
            })
            .catch(error => console.error("Error fetching requests:", error));
    };

    // Fetch attending students
    const fetchAttendingStudents = (courseId) => {
        axios.get(`/uc2/course/${courseId}/students/attending`)
            .then(response => {
                console.log("Attending students:", response.data);
                setAttendingStudents(response.data);
            })
            .catch(error => console.error("Error fetching attending students:", error));
    };

    // Fetch completed students
    const fetchCompletedStudents = (courseId) => {
        axios.get(`/uc2/course/${courseId}/students/completed?is_completed=true`)
            .then(response => {
                console.log(courseId)
                console.log("Completed students:", response.data);
                setCompletedStudents(response.data);
            })
            .catch(error => console.error("Error fetching completed students:", error));
    };

    // Function to open the modal and load requests for the selected course
    const handleOpenModal = (course) => {
        setSelectedCourse(course);
        fetchRequests(course.course.id);
        fetchAttendingStudents(course.course.id);
        fetchCompletedStudents(course.course.id);
        setIsModalOpen(true);
    };

    // Function to accept a student's request and re-fetch requests after acceptance
    const handleRequest = (courseId, requestId, answer) => {
        axios.post(`/uc1/courses/${courseId}/requests/${requestId}`, { answer })
            .then(() => {
                fetchRequests(courseId); // Re-fetch requests after the action
                showAlert(`Request ${answer === "yes" ? "accepted" : "denied"} successfully.`, 'success');
            })
            .catch(error => {
                console.error(`Error ${answer === "yes" ? "accepting" : "denying"} request:`, error);
                showAlert(`Failed to ${answer === "yes" ? "accept" : "deny"} request. Please try again.`, 'error');
            });
    };

    useEffect(() => {
        // Initialize grades for each attending student
        const initialGrades = attendingStudents.reduce((acc, student) => {
            acc[student.student.id] = ""; // Default grade is an empty string
            return acc;
        }, {});
        setGrades(initialGrades);
    }, [attendingStudents]);

    // Handle grade input change
    const handleGradeChange = (studentId, value) => {
        if (value === "" || (value >= 5 && value <= 10)) {
            setGrades(prevGrades => ({
                ...prevGrades,
                [studentId]: value,
            }));
        }
    };

    // Handle course completion
    const handleCompleteCourse = (studentId, username) => {
        const grade = grades[studentId];
        if (!grade) {
            showAlert("Please assign a grade before completing.", 'warning');
            return;
        }

        axios.put(`/uc2/student/${username}/completed/course/${selectedCourse.course.id}`, {
            grade: parseInt(grade, 10),
        })
            .then(() => {
                showAlert("Course completed successfully!", 'success');
                fetchCompletedStudents(selectedCourse.course.id); // Refresh the completed students
                fetchAttendingStudents(selectedCourse.course.id); // Refresh attending students
            })
            .catch(error => {
                console.error("Error marking course as completed:", error);
                showAlert("Failed to complete the course. Please try again.", 'error');
            });
    };

    // Toggle expanded state for each course description
    const toggleExpanded = (id) => {
        setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    // Toggle expanded state for each course skills list
    const toggleSkillsExpanded = (courseId) => {
        setExpandedSkills((prev) => ({ ...prev, [courseId]: !prev[courseId] }));
    };

    // Helper function to refresh courses list
    const refreshCourses = async () => {
        if (!initialized || !keycloak?.idTokenParsed?.preferred_username) {
            return;
        }
        try {
            const response = await axios.get(`/uc1/course_manager/${keycloak.idTokenParsed.preferred_username}/courses`);
            const coursesData = response.data;
            setCourses(coursesData);

            // Refresh skills for each course
            const skillsPromises = coursesData.map(async (course) => {
                const skills = await fetchCourseSkills(course.course.id);
                return { courseId: course.course.id, skills };
            });

            const skillsResults = await Promise.all(skillsPromises);
            const skillsMap = {};
            skillsResults.forEach(({ courseId, skills }) => {
                skillsMap[courseId] = skills;
            });
            setCourseSkills(skillsMap);
        } catch (error) {
            console.error("Error fetching courses:", error);
        }
    };

    // Handle opening edit modal
    const handleEditCourse = (course) => {
        setEditingCourseId(course.course.id);
        // Get current skills for this course and extract skill names
        const currentSkills = courseSkills[course.course.id] || [];
        const skillNames = currentSkills.map(skill => skill.name);
        setNewCourse({
            name: course.course.name,
            description: course.course.description,
            university: course.course.university || keycloak?.idTokenParsed?.university || '',
            course_skills: skillNames
        });
        setIsAddCourseModalOpen(true);
    };

    // Handle closing edit/add modal and resetting state
    const handleCloseCourseModal = () => {
        setIsAddCourseModalOpen(false);
        setEditingCourseId(null);
        setNewCourse({
            name: '',
            description: '',
            university: keycloak?.idTokenParsed?.university || '',
            course_skills: []
        });
    };

    // Handle adding or updating a course
    const handleAddCourse = () => {
        if (editingCourseId) {
            // Update existing course (with skills)
            const courseData = {
                name: newCourse.name,
                description: newCourse.description,
                course_skills: newCourse.course_skills
            };

            axios.put(`/uc2/course/${editingCourseId}/update`, courseData)
                .then(() => {
                    showAlert("Course updated successfully!", 'success');
                    handleCloseCourseModal();
                    refreshCourses();
                })
                .catch(error => {
                    console.error("Error updating course:", error);
                    showAlert("Failed to update course. Please try again.", 'error');
                });
        } else {
            // Create new course
            const courseData = {
                name: newCourse.name,
                description: newCourse.description,
                university: newCourse.university,
                course_skills: newCourse.course_skills
            };

            axios.post(`/uc1/coursemanager/${keycloak.idTokenParsed.preferred_username}/creates/course`, courseData)
                .then(() => {
                    showAlert("Course created successfully!", 'success');
                    handleCloseCourseModal();
                    refreshCourses();
                })
                .catch(error => {
                    console.error("Error creating course:", error);
                    showAlert("Failed to create course. Please try again.", 'error');
                });
        }
    };

    // Handle delete course confirmation
    const handleDeleteClick = (course) => {
        setCourseToDelete(course);
        setIsDeleteDialogOpen(true);
    };

    // Handle confirmed delete
    const handleConfirmDelete = () => {
        if (courseToDelete) {
            const courseId = courseToDelete.course.id;
            axios.delete(`/uc2/course/${courseId}/delete`)
                .then(() => {
                    showAlert("Course deleted successfully!", 'success');
                    setIsDeleteDialogOpen(false);
                    setCourseToDelete(null);
                    refreshCourses();
                })
                .catch(error => {
                    console.error("Error deleting course:", error);
                    showAlert("Failed to delete course. Please try again.", 'error');
                    setIsDeleteDialogOpen(false);
                    setCourseToDelete(null);
                });
        }
    };

    // Handle skill selection change
    const handleSkillChange = (event) => {
        const selectedSkillNames = event.target.value;
        setNewCourse(prev => ({
            ...prev,
            course_skills: selectedSkillNames
        }));
    };

    // Handle removing a skill from the course
    const handleRemoveSkill = (skillToRemove) => {
        setNewCourse(prev => ({
            ...prev,
            course_skills: prev.course_skills.filter(skill => skill !== skillToRemove)
        }));
    };

    return (
        <Box sx={{ padding: '2rem' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" fontWeight={600} color={theme.palette.primary.main}>
                    Managed Courses
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                        setEditingCourseId(null);
                        setNewCourse({
                            name: '',
                            description: '',
                            university: keycloak?.idTokenParsed?.university || '',
                            course_skills: []
                        });
                        setIsAddCourseModalOpen(true);
                    }}
                    sx={{ ml: 2 }}
                >
                    ADD COURSE
                </Button>
            </Box>

            {courses.length === 0 ? (
                <Alert severity="info" sx={{ mb: 3 }}>
                    No courses are currently being managed. Click "ADD COURSE" to create your first course.
                </Alert>
            ) : (
                <Grid container spacing={3}>
                    {courses.map(course => (
                        <Grid item xs={12} sm={6} md={4} key={course.course.id}>
                            <Paper
                                sx={{
                                    padding: '1.5rem',
                                    textAlign: 'center',
                                    borderRadius: '12px',
                                    boxShadow: '0 6px 15px rgba(0, 0, 0, 0.15)',
                                    cursor: 'pointer',
                                    transition: '0.3s',
                                    position: 'relative',
                                    '&:hover': { boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3)' }
                                }}
                                onClick={() => handleOpenModal(course)}
                            >
                                {/* Edit and Delete buttons */}
                                <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 0.5 }}>
                                    <Button
                                        size="small"
                                        variant="contained"
                                        color="primary"
                                        startIcon={<Edit />}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleEditCourse(course);
                                        }}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        size="small"
                                        variant="contained"
                                        color="error"
                                        startIcon={<Delete />}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteClick(course);
                                        }}
                                    >
                                        Delete
                                    </Button>
                                </Box>

                                <Avatar
                                    sx={{
                                        bgcolor: theme.palette.secondary.main,
                                        width: 80,
                                        height: 80,
                                        margin: '0 auto 1rem auto'
                                    }}
                                >
                                    {course.course.name.charAt(0)}
                                </Avatar>
                                <Typography variant="h6" fontWeight={500}>{course.course.name}</Typography>
                                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                                    {expanded[course.course.id]
                                        ? course.course.description
                                        : `${course.course.description.substring(0, 100)}...`}
                                </Typography>

                                {/* Skills Labels */}
                                {courseSkills[course.course.id] && courseSkills[course.course.id].length > 0 && (
                                    <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5, justifyContent: 'center' }}>
                                        {(() => {
                                            const sortedSkills = [...courseSkills[course.course.id]].sort((a, b) => a.name.localeCompare(b.name));
                                            return (expandedSkills[course.course.id] ? sortedSkills : sortedSkills.slice(0, 3));
                                        })().map((skill, index) => (
                                            <Chip
                                                key={index}
                                                label={skill.name}
                                                size="small"
                                                sx={{
                                                    fontSize: '0.75rem',
                                                    height: '24px',
                                                    bgcolor: theme.palette.primary.light,
                                                    color: theme.palette.primary.contrastText,
                                                    '& .MuiChip-label': {
                                                        px: 1
                                                    }
                                                }}
                                            />
                                        ))}
                                        {courseSkills[course.course.id].length > 3 && (
                                            <Button
                                                size="small"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleSkillsExpanded(course.course.id);
                                                }}
                                                sx={{
                                                    ml: 0.5,
                                                    textTransform: 'none',
                                                    minWidth: 'auto',
                                                    fontSize: '0.8rem'
                                                }}
                                            >
                                                {expandedSkills[course.course.id] ? 'Show less' : 'Show more'}
                                            </Button>
                                        )}
                                    </Box>
                                )}

                                {course.course.description.length > 100 && (
                                    <Button
                                        size="small"
                                        onClick={(e) => {
                                            e.stopPropagation(); // Prevent modal open
                                            toggleExpanded(course.course.id);
                                        }}
                                        sx={{ mt: 1 }}
                                    >
                                        {expanded[course.course.id] ? "Read Less" : "Read More"}
                                    </Button>
                                )}
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Modal for displaying course details */}
            <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '80%',
                        bgcolor: 'background.paper',
                        borderRadius: '12px',
                        boxShadow: 24,
                        p: 4,
                        maxHeight: '80vh',
                        overflowY: 'auto',
                    }}
                >
                    <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
                        {selectedCourse && selectedCourse.course.name}
                    </Typography>
                    <Tabs
                        value={tabIndex}
                        onChange={(e, newIndex) => setTabIndex(newIndex)}
                        textColor="primary"
                        indicatorColor="primary"
                        sx={{ mb: 3 }}
                    >
                        <Tab label="Attendance Requests" />
                        <Tab label="Students Attending" />
                        <Tab label="Students Completed" />
                    </Tabs>
                    {tabIndex === 0 && (
                        <>
                            {noRequests ? (
                                <Alert severity="info" sx={{ mb: 2 }}>
                                    No attendance requests for this course.
                                </Alert>
                            ) : (
                                requests.map(request => (
                                    <Paper
                                        key={request.id}
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            p: 2,
                                            mb: 2,
                                            borderRadius: '8px',
                                            backgroundColor: 'rgba(245, 245, 245, 0.9)',
                                            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
                                        }}
                                    >
                                        <Box>
                                            <Typography variant="body1" fontWeight={500}>
                                                {request.student.name} {request.student.surname}
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary">
                                                {request.student.email}
                                            </Typography>
                                        </Box>
                                        <Box>
                                            <Button
                                                variant="contained"
                                                color="success"
                                                onClick={() => handleRequest(selectedCourse.course.id, request.id, "yes")}
                                                sx={{ mr: 1 }}
                                            >
                                                Accept
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                color="error"
                                                onClick={() => handleRequest(selectedCourse.course.id, request.id, "no")}
                                            >
                                                Deny
                                            </Button>
                                        </Box>
                                    </Paper>
                                ))
                            )}
                        </>
                    )}
                    {tabIndex === 1 && (
                        <Box>
                            {attendingStudents.length === 0 ? (
                                <Alert severity="info" sx={{ mb: 2 }}>
                                    No students are attending this course.
                                </Alert>
                            ) : (
                                attendingStudents.map(student => (
                                    <Paper
                                        key={student.student.id}
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            p: 2,
                                            mb: 2,
                                            borderRadius: '8px',
                                            backgroundColor: 'rgba(245, 245, 245, 0.9)',
                                            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
                                        }}
                                    >
                                        <Box>
                                            <Typography variant="body1" fontWeight={500}>
                                                {student.student.name} {student.student.surname}
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary">
                                                {student.student.email}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <TextField
                                                label="Grade (5-10)"
                                                variant="outlined"
                                                size="small"
                                                value={grades[student.student.id] || ""}
                                                onChange={(e) =>
                                                    handleGradeChange(student.student.id, e.target.value)
                                                }
                                                sx={{ width: 150 }} // Increased width
                                                type="number"
                                                inputProps={{ min: 5, max: 10 }}
                                            />
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                onClick={() =>
                                                    handleCompleteCourse(
                                                        student.student.id,
                                                        student.student.username
                                                    )
                                                }
                                            >
                                                Complete
                                            </Button>
                                        </Box>
                                    </Paper>
                                ))
                            )}
                        </Box>
                    )}
                    {tabIndex === 2 && (
                        <Box>
                            {completedStudents.length === 0 ? (
                                <Alert severity="info" sx={{ mb: 2 }}>
                                    No students have completed this course.
                                </Alert>
                            ) : (
                                completedStudents.map(student => (
                                    <Paper
                                        key={student.student.id}
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            p: 2,
                                            mb: 2,
                                            borderRadius: '8px',
                                            backgroundColor: 'rgba(245, 245, 245, 0.9)',
                                            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
                                        }}
                                    >
                                        <Box>
                                            <Typography variant="body1" fontWeight={500}>
                                                {student.student.name} {student.student.surname}
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary">
                                                {student.student.email}
                                            </Typography>
                                        </Box>
                                    </Paper>
                                ))
                            )}
                        </Box>
                    )}
                    <Button onClick={() => setIsModalOpen(false)} sx={{ mt: 3 }}>
                        Close
                    </Button>
                </Box>
            </Modal>

            {/* Modal for adding/editing a course */}
            <Modal open={isAddCourseModalOpen} onClose={handleCloseCourseModal}>
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '90%',
                        maxWidth: '600px',
                        bgcolor: 'background.paper',
                        borderRadius: '12px',
                        boxShadow: 24,
                        p: 4,
                        maxHeight: '80vh',
                        overflowY: 'auto',
                    }}
                >
                    <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>
                        {editingCourseId ? 'Edit Course' : 'Add New Course'}
                    </Typography>

                    <TextField
                        fullWidth
                        label="Course Name"
                        value={newCourse.name}
                        onChange={(e) => setNewCourse(prev => ({ ...prev, name: e.target.value }))}
                        sx={{ mb: 2 }}
                        required
                    />

                    <TextField
                        fullWidth
                        label="Course Description"
                        value={newCourse.description}
                        onChange={(e) => setNewCourse(prev => ({ ...prev, description: e.target.value }))}
                        multiline
                        rows={3}
                        sx={{ mb: 2 }}
                        required
                    />

                    {!editingCourseId && (
                        <TextField
                            fullWidth
                            label="University"
                            value={newCourse.university}
                            sx={{ mb: 2 }}
                            required
                            disabled
                            helperText="University is automatically set from your profile"
                        />
                    )}

                    <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle1" sx={{ mb: 1 }}>
                            Course Skills
                        </Typography>
                        <FormControl fullWidth sx={{ mb: 1 }}>
                            <InputLabel id="skills-select-label">Select Skills</InputLabel>
                            <Select
                                labelId="skills-select-label"
                                id="skills-select"
                                multiple
                                value={newCourse.course_skills}
                                onChange={handleSkillChange}
                                label="Select Skills"
                                renderValue={(selected) => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {selected.map((value) => (
                                            <Chip key={value} label={value} size="small" />
                                        ))}
                                    </Box>
                                )}
                                MenuProps={{
                                    PaperProps: {
                                        style: {
                                            maxHeight: 300,
                                        },
                                    },
                                }}
                            >
                                {[...availableSkills].sort((a, b) => a.name.localeCompare(b.name)).map((skill) => (
                                    <MenuItem key={skill.id} value={skill.name}>
                                        {skill.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>
                            Click outside or press Escape to close the list
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
                        <Button
                            variant="outlined"
                            onClick={handleCloseCourseModal}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleAddCourse}
                            disabled={!newCourse.name || !newCourse.description || (!editingCourseId && !newCourse.university)}
                        >
                            {editingCourseId ? 'Update Course' : 'Create Course'}
                        </Button>
                    </Box>
                </Box>
            </Modal>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
            >
                <DialogTitle>Delete Course</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete "{courseToDelete?.course?.name}"? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsDeleteDialogOpen(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleConfirmDelete} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar for alerts */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                sx={{
                    bottom: { xs: 80, sm: 80 }, // Position above footer
                    left: 16
                }}
            >
                <Alert
                    onClose={handleSnackbarClose}
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default CourseManagerCourses;
