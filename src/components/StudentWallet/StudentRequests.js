import { useState, useEffect } from "react";
import { Typography, Card, CardContent, Grid, Box, Avatar, Container, Button, Alert } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

function StudentRequests({requestsError, requests}) {
    const [expanded, setExpanded] = useState({});
    const getGridSize = () => {
        if (requests.length === 2) return 6;
        if (requests.length === 3) return 4;
        if (requests.length === 4) return 6;
        return 3; // For 5 or more requests
    };

    const toggleExpanded = (id) => {
        setExpanded((prevState) => ({ ...prevState, [id]: !prevState[id] }));
    };

    return (
        <Container maxWidth="xl" sx={{ my: 5 }}>
            <Typography variant="h4" fontWeight={600} color="primary" gutterBottom>
                Course Requests
            </Typography>
            {(requests.length < 1 && !requestsError) &&
                <Alert severity="warning" sx={{mb: 2, width: '100%'}}>
                    There are currently no Course Requests.
                </Alert>
            }
            {requestsError && (
                <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
                    Something went wrong while fetching your requests. Please try again later.
                </Alert>
            )}
            <Grid container spacing={2}>
                {requests.map((request) => (
                    <Grid item xs={12} sm={6} md={getGridSize()} key={request.id}>
                        <Card
                            variant="outlined"
                            sx={{
                                borderRadius: '15px',
                                backgroundColor: '#f5f5f5',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                padding: 2,
                            }}
                        >
                            <CardContent>
                                <Box display="flex" flexDirection="column" alignItems="center" textAlign="center">
                                    <Avatar
                                        sx={{
                                            bgcolor: 'rgba(65, 113, 63, 0.8)',
                                            width: 80,
                                            height: 80,
                                            mb: 2,
                                        }}
                                    >
                                        {request.is_approved ? (
                                            <CheckCircleIcon style={{ color: 'white', fontSize: '40px' }} />
                                        ) : (
                                            <CancelIcon style={{ color: 'white', fontSize: '40px' }} />
                                        )}
                                    </Avatar>
                                    <Typography variant="body2" sx={{ mb: 1, color: request.is_approved ? "green" : "red" }}>
                                        {request.is_approved ? "Request Approved" : "Pending Approval"}
                                    </Typography>
                                    <Typography variant="h6" fontWeight={600} color="textPrimary">
                                        {request.course.name}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                                        {request.course.university}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        {expanded[request.id]
                                            ? request.course.description
                                            : `${request.course.description.substring(0, 250)}...`}
                                    </Typography>
                                    {request.course.description.length > 500 && (
                                        <Button
                                            size="small"
                                            onClick={() => toggleExpanded(request.id)}
                                            sx={{ mt: 1 }}
                                        >
                                            {expanded[request.id] ? "Read Less" : "Read More"}
                                        </Button>
                                    )}
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
}

export default StudentRequests;
