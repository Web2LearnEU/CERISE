import React, { useEffect, useState } from 'react';
import {
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Typography,
    Paper,
    Grid,
    Box,
    Button,
    Divider
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import axios from 'axios';

const StudentWalletCourseCyclesOverview = ({university}) => {
    const [courseCycles, setCourseCycles] = useState([]);
    const [cyclePage, setCyclePage] = useState(1);
    const [expandedDescriptions, setExpandedDescriptions] = useState({});

    useEffect(() => {
        axios.get(`/uc1/course/cycles/university/${university}`)
            .then(response => {
                setCourseCycles(response.data);
            })
            .catch(() => {
                setCourseCycles([]);
            });
    }, []);

    const totalPages = Math.ceil(courseCycles.length / 3);

    const toggleDescription = (courseId) => {
        setExpandedDescriptions((prev) => ({
            ...prev,
            [courseId]: !prev[courseId],
        }));
    };

    const PaginationControls = () => (
        <Box display="flex" justifyContent="center" mb={2} gap={2}>
            <Button
                variant="outlined"
                onClick={() => setCyclePage((prev) => Math.max(prev - 1, 1))}
                disabled={cyclePage === 1}
            >
                Previous
            </Button>
            <Typography variant="body2" sx={{ alignSelf: 'center' }}>
                Page {cyclePage} of {totalPages}
            </Typography>
            <Button
                variant="outlined"
                onClick={() => setCyclePage((prev) => Math.min(prev + 1, totalPages))}
                disabled={cyclePage === totalPages}
            >
                Next
            </Button>
        </Box>
    );

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
            <Accordion elevation={0} sx={{ backgroundColor: 'transparent', boxShadow: 'none' }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h4" fontWeight={600} style={{ color: '#41713F' }}>
                        Course Cycles overview
                    </Typography>
                </AccordionSummary>

                <AccordionDetails>
                    {totalPages > 1 && <PaginationControls />}

                    {courseCycles.slice((cyclePage - 1) * 3, cyclePage * 3).map((cycle, index) => (
                        <Box key={index} sx={{ mb: 4 }}>
                            <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: '#41713F' }}>
                                {cycle.name}
                            </Typography>

                            <Grid container spacing={2}>
                                {cycle.courses.map((course) => {
                                    const isExpanded = expandedDescriptions[course.id];
                                    const shortDescription = course.description?.substring(0, 100);
                                    const shouldShowToggle = course.description?.length > 100;

                                    return (
                                        <Grid item xs={12} key={course.id}>
                                            <Paper sx={{ p: 1.5, backgroundColor: '#fff', borderRadius: 2 }}>
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                                                    <Typography
                                                        fontWeight={600}
                                                        variant="body1"
                                                        sx={{ mr: 1, minWidth: '200px', flexShrink: 0 }}
                                                    >
                                                        {course.name}
                                                    </Typography>

                                                    <Typography variant="body2" color="textSecondary" sx={{ flexGrow: 1, mt: '-2px' }}>
                                                        {isExpanded ? course.description : shortDescription}
                                                        {shouldShowToggle && (
                                                            <Button
                                                                size="small"
                                                                onClick={() => toggleDescription(course.id)}
                                                                sx={{ ml: 1, textTransform: 'none' }}
                                                            >
                                                                {isExpanded ? 'Less' : 'More...'}
                                                            </Button>
                                                        )}
                                                    </Typography>
                                                </Box>
                                            </Paper>
                                        </Grid>
                                    );
                                })}
                            </Grid>

                            <Divider sx={{ mt: 4 }} />
                        </Box>
                    ))}

                    {totalPages > 1 && <PaginationControls />}
                </AccordionDetails>
            </Accordion>
        </Paper>
    );
}

export default StudentWalletCourseCyclesOverview;
