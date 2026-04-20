import { useState, useEffect } from 'react';
import axios from 'axios';
import { useKeycloak } from "@react-keycloak/web";
import { useTheme } from "@mui/material/styles";
import {
    Box,
    Typography,
    Paper,
    TextField,
    Button,
    Checkbox,
    FormControlLabel,
    Chip,
    Modal,
    Container,
    Grid,
    Avatar,
    Divider
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import LoopIcon from '@mui/icons-material/Loop';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import StudentWalletCourseCyclesOverview from "./StudentWalletCourseCyclesOverview";
import StudentWalletCourseCyclesProgress from "./StudentWalletCourseCyclesProgress";
import StudentWalletCVandJob from "./StudentWalletCVandJob";

function StudentWalletCourses({ requests, approvedCourses, setApprovedCourses, refreshData }) {
    const theme = useTheme();
    const { keycloak } = useKeycloak();

    const [completedCourses, setCompletedCourses] = useState([]);

    // State for storing approved courses, error state, and modal data
    // const [approvedCourses, setApprovedCourses] = useState([]);
    const [availableCourses, setAvailableCourses] = useState([]);
    const [applicationStatus, setApplicationStatus] = useState({}); // Track application status by course ID
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [skills, setSkills] = useState({ green: [], other: [] });
    const [greenSkillsOnly, setGreenSkillsOnly] = useState(false);
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [jobSkills, setJobSkills] = useState([]);

    // const indexOfLastJob = currentPage * jobsPerPage;
    // const indexOfFirstJob = indexOfLastJob - jobsPerPage;
    // const currentJobs = jobResults.slice(indexOfFirstJob, indexOfLastJob);
    // const totalPages = Math.ceil(jobResults.length / jobsPerPage);


    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    // Fetch skills
    useEffect(() => {
        axios
            .get(`/uc2/student/${keycloak.idTokenParsed.preferred_username}/skill/base?skill_type=all`, {
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            .then((response) => {
                setJobSkills({ skills: response.data.map(skill => skill.name) });
                // Categorize skills based on `is_green`
                const greenSkills = response.data.filter(skill => skill.is_green);
                const otherSkills = response.data.filter(skill => !skill.is_green);

                setSkills({ green: greenSkills, other: otherSkills });
            })
            .catch((error) => {
                console.error("Error fetching skills:", error);
            });
    }, []);

    // Fetch approved courses for "Ongoing Courses" section
    useEffect(() => {
        axios
            .get(`/uc2/students/${keycloak.idTokenParsed.preferred_username}/courses?is_completed=false`, {
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            .then((response) => {
                console.log(response.data)
                const courses = response.data.map((course) => ({
                    id: course.course.id,
                    title: course.course.name,
                    grade: course.grade,
                    university: course.course.university
                }));
                setApprovedCourses(courses);
            })
            .catch((error) => {
                console.error("Error fetching completed courses:", error);
            });
    }, []);

    // Fetch completed courses
    useEffect(() => {
        axios
            .get(`/uc2/students/${keycloak.idTokenParsed.preferred_username}/courses?is_completed=true`, {
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            .then((response) => {
                const courses = response.data.map((course) => ({
                    id: course.course.id,
                    title: course.course.name,
                    grade: course.grade,
                    university: course.course.university
                }));
                setCompletedCourses(courses);
            })
            .catch((error) => {
                console.error("Error fetching completed courses:", error);
            });
    }, []);

    // Fetch available courses and their associated skills
    useEffect(() => {
        const fetchCoursesWithSkills = async () => {
            try {
                // const courseResponse = await axios.get(`/uc1/university/${keycloak.idTokenParsed.university}/courses`);
                const courseResponse = await axios.get(`/uc1/courses/with/cycles/university/${keycloak.idTokenParsed.university}`);

                const courses = courseResponse.data;

                const coursesWithSkills = await Promise.all(
                    courses.map(async (course) => {
                        try {
                            const skillsResponse = await axios.get(`/uc2/course/${course.id}/skills`);
                            return { ...course, skills: skillsResponse.data };
                        } catch (error) {
                            console.error(`Error fetching skills for course ${course.id}:`, error);
                            return { ...course, skills: [] };
                        }
                    })
                );

                setAvailableCourses(coursesWithSkills);
                setFilteredCourses(coursesWithSkills);
            } catch (error) {
                console.error("Error fetching courses:", error);
            }
        };

        fetchCoursesWithSkills();
    }, []);

    // Update filteredCourses based on search term and green skills filter
    useEffect(() => {
        let filtered = availableCourses.filter((course) =>
            course.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (greenSkillsOnly) {
            filtered = filtered.filter((course) =>
                course.skills.some((skill) => skill.skill.is_green)
            );
        }

        // Sort alphabetically by course name
        filtered.sort((a, b) => a.name.localeCompare(b.name));

        setFilteredCourses(filtered);
    }, [searchTerm, greenSkillsOnly, availableCourses]);

    // Function to apply for a course
    const handleApply = (courseId) => {
        const username = keycloak.idTokenParsed.preferred_username;
        axios.post(`/uc1/courses/${courseId}/apply/students/${username}`, {}, {
            headers: { 'Content-Type': 'application/json' },
        })
            .then(() => {
                setApplicationStatus(prevStatus => ({ ...prevStatus, [courseId]: 'success' }));
                refreshData(); // Trigger re-fetch after successful application
            })
            .catch(() => {
                setApplicationStatus(prevStatus => ({ ...prevStatus, [courseId]: 'error' }));
            });
    };

    return (
        <>

            <Container maxWidth="xl" sx={{ my: 3 }}>

                <StudentWalletCVandJob jobSkills={jobSkills} />

                <StudentWalletCourseCyclesProgress username={keycloak.idTokenParsed.preferred_username}
                    refreshData={refreshData} />

                <Grid container spacing={2} sx={{ marginTop: 2, display: 'flex' }}>
                    {/* Courses Enrolled - 2/3 of the width */}
                    <Grid item xs={12} sm={12} md={8}>
                        <Paper
                            variant="outlined"
                            elevation={0}
                            style={{
                                padding: '20px',
                                borderRadius: '25px',
                                backgroundColor: '#f5f5f5',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                            }}
                        >
                            <Typography variant="h4" fontWeight={600} style={{ color: '#41713F' }}>
                                Courses Enrolled
                            </Typography>

                            {/* Flex container for Completed and Ongoing Courses */}
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    marginTop: 4,
                                }}
                            >
                                {/* Completed Courses Section */}
                                <Box sx={{ flex: 1, paddingRight: 2 }}>
                                    <Typography
                                        variant="h5"
                                        fontWeight={600}
                                        textAlign={'center'}
                                        sx={{ color: '#41713F' }}
                                    >
                                        Completed Courses
                                    </Typography>
                                    <Grid container spacing={2} sx={{ marginTop: 1 }}>
                                        {completedCourses.map((course) => (
                                            <Grid item xs={6} key={course.id}>
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                    }}
                                                >
                                                    <Avatar
                                                        sx={{
                                                            bgcolor: 'rgba(65, 113, 63, 0.8)',
                                                            width: 80,
                                                            height: 80,
                                                            marginBottom: 1,
                                                        }}
                                                    >
                                                        <SchoolIcon style={{ color: 'white', fontSize: '40px' }} />
                                                    </Avatar>
                                                    <Typography
                                                        variant="body2"
                                                        sx={{ textAlign: 'center', color: '#333' }}
                                                    >
                                                        {course.title} <br />(<span style={{ fontWeight: 500 }}>{course.university}</span>)
                                                    </Typography>
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            textAlign: 'center',
                                                            color: theme.palette.text.secondary,
                                                        }}
                                                    >
                                                        Grade: {course.grade}
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                        ))}
                                        {completedCourses.length === 0 && (
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    textAlign: 'center',
                                                    width: '100%',
                                                    color: theme.palette.text.secondary
                                                }}
                                            >
                                                No completed courses available.
                                            </Typography>
                                        )}
                                    </Grid>
                                </Box>

                                {/* Vertical Divider */}
                                <Divider orientation="vertical" flexItem sx={{ marginX: 2, borderColor: '#ddd' }} />

                                {/* Ongoing Courses Section with dynamic approved courses */}
                                <Box sx={{ flex: 1, paddingLeft: 2 }}>
                                    <Typography
                                        variant="h5"
                                        fontWeight={600}
                                        textAlign={'center'}
                                        sx={{ color: '#41713F' }}
                                    >
                                        Ongoing Courses
                                    </Typography>
                                    <Grid container spacing={2} sx={{ marginTop: 1 }}>
                                        {approvedCourses.map((course) => (
                                            <Grid item xs={6} key={course.id}>
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                    }}
                                                >
                                                    <Avatar
                                                        sx={{
                                                            bgcolor: 'rgba(65, 113, 63, 0.8)',
                                                            width: 80,
                                                            height: 80,
                                                            marginBottom: 1,
                                                        }}
                                                    >
                                                        <LoopIcon style={{ color: 'white', fontSize: '40px' }} />
                                                    </Avatar>
                                                    <Typography
                                                        variant="body2"
                                                        sx={{ textAlign: 'center', color: '#333' }}
                                                    >
                                                        {course.title} <br />(<span style={{ fontWeight: 500 }}>{course.university}</span>)
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                        ))}
                                        {approvedCourses.length === 0 && (
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    textAlign: 'center',
                                                    width: '100%',
                                                    color: theme.palette.text.secondary
                                                }}
                                            >
                                                No ongoing courses available.
                                            </Typography>
                                        )}
                                    </Grid>
                                </Box>
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Green Skills Section - 1/3 of the width */}
                    <Grid item xs={12} sm={12} md={4}>
                        <Paper
                            elevation={0}
                            style={{
                                padding: '20px',
                                borderRadius: '25px',
                                backgroundColor: 'rgba(93, 175, 91, 0.2)',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                            }}
                        >
                            <Typography variant="h4" fontWeight={600} style={{ color: theme.palette.secondary.main }}>
                                Acquired Skills
                            </Typography>

                            {/* Green Skills Section */}
                            <Box sx={{ marginTop: 2 }}>
                                <Typography variant="h5" fontWeight={600} sx={{ color: '#41713F', mb: 1 }}>
                                    Green Skills
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {skills.green.map(skill => (
                                        <Chip
                                            key={skill.id}
                                            label={skill.name}
                                            sx={{ bgcolor: 'rgba(65, 113, 63, 0.8)', color: 'white' }}
                                        />
                                    ))}
                                    {skills.green.length === 0 && (
                                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                            No green skills acquired yet.
                                        </Typography>
                                    )}
                                </Box>
                            </Box>

                            {/* Other Skills Section */}
                            <Box sx={{ marginTop: 2 }}>
                                <Typography variant="h5" fontWeight={600}
                                    sx={{ color: theme.palette.primary.main, mb: 1 }}>
                                    Other Skills
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {skills.other.map(skill => (
                                        <Chip
                                            key={skill.id}
                                            label={skill.name}
                                            sx={{
                                                bgcolor: 'rgba(150, 150, 150, 0.8)',
                                                color: 'white',
                                            }}
                                        />
                                    ))}
                                    {skills.other.length === 0 && (
                                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                            No other skills acquired yet.
                                        </Typography>
                                    )}
                                </Box>
                            </Box>

                            {/* Modal Trigger */}
                            <Typography variant="body1" sx={{ marginTop: 2 }}>
                                Want to get more Green Skills?{' '}
                                <Button onClick={handleOpen} sx={{ fontWeight: 600, textTransform: 'none' }}>
                                    Find courses!
                                </Button>
                            </Typography>

                            <Modal open={open} onClose={handleClose}>
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        transform: 'translate(-50%, -50%)',
                                        width: '80%',
                                        height: '80vh',
                                        bgcolor: 'background.paper',
                                        boxShadow: 24,
                                        borderRadius: 2,
                                        overflowY: 'auto',
                                        p: 4,
                                        pt: 0
                                    }}
                                >
                                    <Box
                                        sx={{
                                            position: 'sticky',
                                            top: 0,
                                            bgcolor: 'background.paper',
                                            zIndex: 2,
                                            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
                                            p: 2,
                                        }}
                                    >
                                        <Box display="flex" justifyContent="space-between" alignItems="center">
                                            <Typography variant="h4">Available Courses</Typography>
                                            <Box display="flex" alignItems="center" gap={2}>
                                                <TextField
                                                    variant="outlined"
                                                    placeholder="Search courses..."
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    size="small"
                                                    sx={{ width: '300px' }}
                                                />
                                                <FormControlLabel
                                                    control={
                                                        <Checkbox
                                                            checked={greenSkillsOnly}
                                                            onChange={(e) => setGreenSkillsOnly(e.target.checked)}
                                                        />
                                                    }
                                                    label="Green Skills Only"
                                                />
                                            </Box>
                                        </Box>
                                    </Box>

                                    {/* Course List */}
                                    <Box sx={{ p: 2 }}>
                                        {filteredCourses.map((course) => (
                                            <Paper
                                                key={course.id}
                                                sx={{
                                                    display: 'flex',
                                                    flexDirection: 'column', // Arrange items in a column to ensure description and skills are stacked
                                                    p: 2,
                                                    mb: 2,
                                                    borderRadius: '8px',
                                                    backgroundColor: 'rgba(245, 245, 245, 0.9)',
                                                    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
                                                }}
                                            >
                                                {/* Course Name and Description */}
                                                <Box sx={{ marginBottom: 2 }}>
                                                    <Typography variant="body1" fontWeight={500}>
                                                        {course.name}
                                                        {String(course.course_cycle || '').trim() ? (
                                                            <> (<i>{String(course.course_cycle).trim()}</i> course cycle)</>
                                                        ) : null}
                                                    </Typography>
                                                    <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                                                        {course.description || 'No description available'}
                                                    </Typography>
                                                </Box>

                                                {/* Associated Skills Section */}
                                                <Box sx={{ marginBottom: 2 }}>
                                                    <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                                                        Skills Associated with this Course:
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                                        {course.skills && course.skills.length > 0 ? (
                                                            course.skills.map((skill) => (
                                                                <Chip
                                                                    key={skill.skill.id}
                                                                    label={skill.skill.name}
                                                                    sx={{
                                                                        bgcolor: skill.skill.is_green
                                                                            ? 'rgba(65, 113, 63, 0.8)'
                                                                            : 'rgba(150, 150, 150, 0.8)',
                                                                        color: 'white',
                                                                    }}
                                                                />
                                                            ))
                                                        ) : (
                                                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                                                This course does not have any associated skills yet.
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                </Box>

                                                {/* Application Status */}
                                                <Box sx={{ textAlign: 'right', ml: 2 }}>
                                                    {applicationStatus[course.id] === 'success' ? (
                                                        <Box display="flex" alignItems="center" justifyContent="flex-end">
                                                            <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                                                            <Typography variant="body2" color="success.main" fontWeight={600}>
                                                                Request Created
                                                            </Typography>
                                                        </Box>
                                                    ) : applicationStatus[course.id] === 'error' ? (
                                                        <Box display="flex" alignItems="center" justifyContent="flex-end">
                                                            <ErrorIcon color="error" sx={{ mr: 1 }} />
                                                            <Typography variant="body2" color="error.main" fontWeight={600}>
                                                                Request Failed — You may have already applied to this course.
                                                            </Typography>
                                                        </Box>
                                                    ) : (
                                                        <Button
                                                            variant="contained"
                                                            color="primary"
                                                            size="small"
                                                            onClick={() => handleApply(course.id)}
                                                            sx={{ fontWeight: 600 }}
                                                        >
                                                            APPLY TO COURSE
                                                        </Button>
                                                    )}
                                                </Box>
                                            </Paper>
                                        ))}
                                    </Box>
                                </Box>
                            </Modal>
                        </Paper>
                    </Grid>
                </Grid>

                <StudentWalletCourseCyclesOverview university={keycloak.idTokenParsed.university} />

            </Container>
        </>
    );
}

export default StudentWalletCourses;
