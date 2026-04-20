import React, {useEffect, useState} from 'react';
import {
    Box,
    Typography,
    Chip,
    Modal,
    Grid,
    Container,
    Alert,
    Paper,
    Button,
    Collapse,
    CircularProgress,
    Stack
} from '@mui/material';
import {useTheme} from '@mui/material/styles';
import {useNavigate} from "react-router-dom";
import {useKeycloak} from "@react-keycloak/web";
import axios from 'axios'

const CandidateSearch = () => {
    const navigate = useNavigate();
    const {keycloak, initialized} = useKeycloak();
    const [allowed, setAllowed] = useState(false);

    const theme = useTheme();
    const [greenSkills, setGreenSkills] = useState([]);
    const [selectedSkill, setSelectedSkill] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (initialized) {
            if (keycloak.tokenParsed.realm_access.roles.includes("recruiter")) {
                setAllowed(true);
            } else {
                navigate("/");
            }
        }
    }, [initialized]);

    useEffect(() => {
        if (allowed) {
            axios.get('/uc4/green/skills/students')
                .then(response => {
                    setGreenSkills(response.data);
                })
                .catch(error => {
                    console.log(error);
                });
        }
    }, [allowed]);

    const handleOpenModal = (skill) => {
        setSelectedSkill(skill);
        setIsModalOpen(true);
    };

    const [expandedStudent, setExpandedStudent] = useState(null);
    const [academicProfiles, setAcademicProfiles] = useState({});

    const fetchAcademicProfile = async (username) => {
        setAcademicProfiles((prev) => ({...prev, [username]: {loading: true}}));

        try {
            const universityRes = await axios.get(`/base/students/${username}`);
            const completedCoursesRes = await axios.get(`/uc2/students/${username}/courses?is_completed=true`);
            const attendingCoursesRes = await axios.get(`/uc2/students/${username}/courses?is_completed=false`);

            setAcademicProfiles((prev) => ({
                ...prev,
                [username]: {
                    university: universityRes.data.university,
                    completedCourses: completedCoursesRes.data,
                    attendingCourses: attendingCoursesRes.data,
                    loading: false
                }
            }));
        } catch (error) {
            console.error("Error fetching academic profile:", error);
            setAcademicProfiles((prev) => ({...prev, [username]: {error: true, loading: false}}));
        }
    };

    const handleToggleProfile = (username) => {
        if (expandedStudent === username) {
            setExpandedStudent(null);
        } else {
            setExpandedStudent(username);
            if (!academicProfiles[username]) {
                fetchAcademicProfile(username);
            }
        }
    };

    return (
        <>
            {allowed && <Box
                sx={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    mb: 5,
                    backgroundColor: 'rgba(65, 113, 63, 0.9)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    color: 'white',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(204, 204, 204, 0.5)',
                        zIndex: 1,
                    },
                }}
            >
                <Container
                    sx={{
                        zIndex: 2,
                        width: '100%',
                        maxWidth: 'md',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        px: 2,
                        py: 4
                    }}
                >
                    <Typography variant="h4" fontWeight={600} sx={{mb: 5}}>
                        Welcome, <span style={{color: theme.palette.secondary.main}}>{keycloak.tokenParsed.name}</span>!
                    </Typography>
                    <Typography variant="h4" fontWeight={600} sx={{mb: 2}}>
                        Search for job candidates based on their green skills
                    </Typography>
                    <Typography variant="body1" sx={{mb: 3}}>
                        Connect with professionals who have expertise in sustainability and environmental solutions.
                    </Typography>

                    <Grid container spacing={1} justifyContent="center">
                        {greenSkills.map((skill, index) => (
                            <Grid item key={index} xs="auto">
                                <Chip
                                    label={skill.name
                                        .split(' ')
                                        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                                        .join(' ')
                                    }
                                    onClick={() => handleOpenModal(skill)}
                                    sx={{
                                        backgroundColor: theme.palette.primary.main,
                                        color: 'white',
                                        fontWeight: 500,
                                        '&:hover': {backgroundColor: theme.palette.primary.dark},
                                        fontSize: '1rem',
                                    }}
                                    clickable
                                />
                            </Grid>
                        ))}
                    </Grid>
                </Container>

                <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
                    <Box
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '90%',
                            maxWidth: 800,
                            maxHeight: '90vh',
                            bgcolor: 'background.paper',
                            borderRadius: '12px',
                            boxShadow: 24,
                            p: {xs: 2, sm: 4},
                            overflowY: 'auto'
                        }}
                    >
                        <Typography variant="h5" fontWeight={600} sx={{mb: 2}}>
                            Students who have acquired this green skill
                        </Typography>

                        {selectedSkill && selectedSkill.students.length > 0 ? (
                            selectedSkill.students.map((student) => (
                                <Paper
                                    key={student.id}
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        p: 2,
                                        mb: 2,
                                        borderRadius: '8px',
                                        backgroundColor: 'rgba(245, 245, 245, 0.9)',
                                        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
                                    }}
                                >
                                    <Box sx={{ display: 'flex', flexDirection: {xs: 'column', sm: 'row'}, justifyContent: 'space-between', alignItems: {xs: 'flex-start', sm: 'center'} }}>
                                        <Box>
                                            <Typography variant="body1" fontWeight={500}>
                                                {student.name} {student.surname}
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary">
                                                <strong>Username</strong>: {student.username}
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary">
                                                <strong>Email</strong>: {student.email}
                                            </Typography>
                                        </Box>

                                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: { xs: 2, sm: 0 } }}>
                                            <Button
                                                variant="outlined"
                                                color="primary"
                                                onClick={() => handleToggleProfile(student.username)}
                                            >
                                                QUICK OVERVIEW
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                color="primary"
                                                onClick={() => window.open(`${window.location.origin}/report/${student.username}`, '_blank')}
                                            >
                                                ACADEMIC PROFILE
                                            </Button>
                                        </Stack>
                                    </Box>

                                    <Collapse in={expandedStudent === student.username} timeout="auto" unmountOnExit>
                                        <Box sx={{
                                            mt: 2,
                                            p: 2,
                                            borderRadius: '8px',
                                            backgroundColor: 'rgba(230, 230, 230, 0.5)'
                                        }}>
                                            {academicProfiles[student.username]?.loading ? (
                                                <Box sx={{display: 'flex', justifyContent: 'center', p: 2}}>
                                                    <CircularProgress size={24}/>
                                                </Box>
                                            ) : academicProfiles[student.username]?.error ? (
                                                <Alert severity="error">Failed to load academic profile.</Alert>
                                            ) : (
                                                <>
                                                    <Typography variant="body2" fontWeight={600}>
                                                        University: {academicProfiles[student.username]?.university || "N/A"}
                                                    </Typography>

                                                    <Typography variant="body2" fontWeight={600} sx={{mt: 1}}>
                                                        Completed Courses:
                                                    </Typography>
                                                    {academicProfiles[student.username]?.completedCourses.length > 0 ? (
                                                        academicProfiles[student.username].completedCourses.map((course) => (
                                                            <Typography key={course.course.id} variant="body2">
                                                                - {course.course.name} (<strong>{course.grade}</strong>/10)
                                                            </Typography>
                                                        ))
                                                    ) : (
                                                        <Typography variant="body2" color="textSecondary">
                                                            No completed courses.
                                                        </Typography>
                                                    )}

                                                    <Typography variant="body2" fontWeight={600} sx={{mt: 1}}>
                                                        Attending Courses:
                                                    </Typography>
                                                    {academicProfiles[student.username]?.attendingCourses.length > 0 ? (
                                                        academicProfiles[student.username].attendingCourses.map((course) => (
                                                            <Typography key={course.course.id} variant="body2">
                                                                - {course.course.name}
                                                            </Typography>
                                                        ))
                                                    ) : (
                                                        <Typography variant="body2" color="textSecondary">
                                                            No attending courses.
                                                        </Typography>
                                                    )}
                                                </>
                                            )}
                                        </Box>
                                    </Collapse>
                                </Paper>
                            ))
                        ) : (
                            <Alert severity="info" sx={{mb: 2}}>
                                No students have acquired this skill yet.
                            </Alert>
                        )}

                        <Button onClick={() => setIsModalOpen(false)} sx={{mt: 3}}>
                            Close
                        </Button>
                    </Box>
                </Modal>
            </Box>}
        </>
    );
};

export default CandidateSearch;
