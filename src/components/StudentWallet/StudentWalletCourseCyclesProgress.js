import React, {useEffect, useState} from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    LinearProgress,
    Divider,
    Button,
    Collapse
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import LoopIcon from '@mui/icons-material/Loop';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import AssignmentIcon from '@mui/icons-material/Assignment';

import axios from 'axios';

function StudentWalletCourseCyclesProgress({username, refreshData}) {
    const [cycles, setCycles] = useState([]);
    const [expanded, setExpanded] = useState({});
    const [applicationStatus, setApplicationStatus] = useState({});

    useEffect(() => {
        axios.get(`/uc1/course/cycles/student/${username}/info`)
            .then(res => setCycles(res.data))
            .catch(() => setCycles([]));
    }, [username]);

    const handleToggleDetails = (index) => {
        setExpanded(prev => ({...prev, [index]: !prev[index]}));
    };

    const handleApply = (courseId) => {
        axios.post(`/uc1/courses/${courseId}/apply/students/${username}`)
            .then(() => {
                setApplicationStatus(prev => ({...prev, [courseId]: 'success'}));
                refreshData()
            })
            .catch(() => {
                setApplicationStatus(prev => ({...prev, [courseId]: 'error'}));
            });
    };

    return (
        <Paper
            elevation={0}
            variant="outlined"
            sx={{
                p: 3,
                mt: 4,
                borderRadius: '25px',
                backgroundColor: 'rgba(245, 245, 245, 0.6)',
            }}
        >
            <Typography variant="h4" fontWeight={600} sx={{mb: 3, color: '#41713F'}}>
                Progress Across Course Cycles
            </Typography>

            {cycles.length === 0 ? (
                <Typography variant="body1" color="text.secondary">
                    You need to complete courses in order to display Course Cycles progress.
                </Typography>
            ) : (
                cycles.map((cycle, index) => {
                    const completedCourses = cycle.courses.filter(c => c.is_completed === true).length;
                    const totalCourses = cycle.courses.length;
                    const progress = (completedCourses / totalCourses) * 100;

                    return (
                        <Box key={index} sx={{mb: 4}}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                <Typography variant="h6" fontWeight={600} sx={{color: '#41713F'}}>
                                    {cycle.name}
                                </Typography>
                                <Button
                                    onClick={() => handleToggleDetails(index)}
                                    size="small"
                                    sx={{textTransform: 'none', fontWeight: 600}}
                                >
                                    {expanded[index] ? 'Hide Details' : 'Show Details'}
                                </Button>
                            </Box>

                            <Box sx={{mb: 2}}>
                                <LinearProgress
                                    variant="determinate"
                                    value={progress}
                                    sx={{height: 10, borderRadius: 5, backgroundColor: '#e0e0e0'}}
                                />
                                <Typography variant="body2" sx={{mt: 1, color: 'text.secondary'}}>
                                    {completedCourses} out of {totalCourses} courses completed
                                </Typography>
                            </Box>

                            <Collapse in={expanded[index]}>
                                <Grid container spacing={2}>
                                    {cycle.courses.map(course => (
                                        <Grid item xs={12} sm={6} md={4} key={course.course_id}>
                                            <Paper
                                                elevation={0}
                                                variant="outlined"
                                                sx={{
                                                    p: 2,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    gap: 2,
                                                    borderRadius: '10px'
                                                }}
                                            >
                                                <Box display="flex" alignItems="center" gap={2}>
                                                    {course.is_completed === true ? (
                                                        <SchoolIcon sx={{color: 'green'}}/>
                                                    ) : course.is_completed === false ? (
                                                        <LoopIcon sx={{color: '#1976d2'}}/>
                                                    ) : (
                                                        <AssignmentIcon sx={{color: '#757575'}}/>
                                                    )}
                                                    <Box>
                                                        <Typography variant="body1" fontWeight={500}>
                                                            {course.course_name}
                                                        </Typography>
                                                        {course.is_completed === true && (
                                                            <Typography variant="body2" color="text.secondary">
                                                                Grade: {course.grade}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                </Box>

                                                {course.is_completed === null && (
                                                    <Box sx={{textAlign: 'right'}}>
                                                        {applicationStatus[course.course_id] === 'success' ? (
                                                            <Box display="flex" alignItems="center"
                                                                 justifyContent="flex-end">
                                                                <CheckCircleIcon color="success" sx={{mr: 1}}/>
                                                                <Typography variant="body2" color="success.main"
                                                                            fontWeight={600}>
                                                                    Request Created
                                                                </Typography>
                                                            </Box>
                                                        ) : applicationStatus[course.course_id] === 'error' ? (
                                                            <Box display="flex" alignItems="center"
                                                                 justifyContent="flex-end">
                                                                <ErrorIcon color="error" sx={{mr: 1}}/>
                                                                <Typography variant="body2" color="error.main"
                                                                            fontWeight={600}>
                                                                    Request Failed
                                                                </Typography>
                                                            </Box>
                                                        ) : (
                                                            <Button
                                                                variant="contained"
                                                                color="primary"
                                                                size="small"
                                                                onClick={() => handleApply(course.course_id)}
                                                                sx={{fontWeight: 600}}
                                                            >
                                                                APPLY TO COURSE
                                                            </Button>
                                                        )}
                                                    </Box>
                                                )}
                                            </Paper>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Collapse>

                            <Divider sx={{mt: 3}}/>
                        </Box>
                    );
                })
            )}
        </Paper>
    );
}

export default StudentWalletCourseCyclesProgress;
