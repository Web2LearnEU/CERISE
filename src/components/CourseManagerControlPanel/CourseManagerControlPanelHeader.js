import React from 'react';
import { useTheme } from "@mui/material/styles";
import { Avatar, Box, Grid, Typography } from "@mui/material";

const CourseManagerControlPanelHeader = ({ keycloak }) => {
    const theme = useTheme();

    return (
        <>
            {keycloak.tokenParsed && (
                <Box
                    sx={{
                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.dark} 90%)`,
                        padding: '3rem',
                        color: 'white',
                        borderBottomLeftRadius: '12px',
                        borderBottomRightRadius: '12px',
                    }}
                >
                    <Grid container spacing={3} justifyContent="center" alignItems="center">

                        {/* Profile Photo Section */}
                        <Grid item xs={12} sm={12} md={3} display="flex" justifyContent="center">
                            <Avatar
                                src="https://cdn-icons-png.flaticon.com/512/9523/9523747.png"
                                alt="Course Manager Profile"
                                sx={{
                                    width: 300,
                                    height: 300,
                                    border: '6px solid rgba(93, 175, 91, 0.7)',
                                    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)',
                                }}
                            />
                        </Grid>

                        {/* Title and Info Section */}
                        <Grid item xs={12} sm={12} md={9} textAlign="center">
                            <Typography variant="h3" fontWeight={700} sx={{ mb: 2 }}>
                                Control Panel
                            </Typography>
                            <Typography variant="subtitle1" component="div" sx={{ maxWidth: '80%', margin: '0 auto', fontSize: '1.1rem' }}>
                                Manage your courses, track progress, and handle students' applications for course enrollment and completion.
                            </Typography>

                            {/* User Info Section */}
                            <Grid container spacing={3} sx={{ marginTop: 4 }}>
                                <Grid item xs={12} sm={6}>
                                    <Box
                                        sx={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.1)', // Transparent white
                                            padding: 3,
                                            borderRadius: '15px',
                                            color: 'white',
                                            textAlign: 'center',
                                            boxShadow: '0 6px 15px rgba(0, 0, 0, 0.15)', // Subtle shadow for card effect
                                            border: '1px solid rgba(255, 255, 255, 0.2)',
                                        }}
                                    >
                                        <Typography variant="h5" fontWeight={600} sx={{ fontSize: '1.25rem', mb: 1 }}>
                                            Full Name
                                        </Typography>
                                        <Typography variant="body1" sx={{ fontSize: '1.1rem' }}>
                                            {`${keycloak.idTokenParsed.given_name} ${keycloak.idTokenParsed.family_name}`}
                                        </Typography>
                                    </Box>
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <Box
                                        sx={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.1)', // Transparent white
                                            padding: 3,
                                            borderRadius: '15px',
                                            color: 'white',
                                            textAlign: 'center',
                                            boxShadow: '0 6px 15px rgba(0, 0, 0, 0.15)', // Subtle shadow for card effect
                                            border: '1px solid rgba(255, 255, 255, 0.2)',
                                        }}
                                    >
                                        <Typography variant="h5" fontWeight={600} sx={{ fontSize: '1.25rem', mb: 1 }}>
                                            University
                                        </Typography>
                                        <Typography variant="body1" sx={{ fontSize: '1.1rem' }}>
                                            {keycloak.idTokenParsed.university}
                                        </Typography>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </Box>
            )}
        </>
    );
};

export default CourseManagerControlPanelHeader;
