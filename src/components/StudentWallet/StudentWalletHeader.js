import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Grid,
    Box,
    Typography,
    Avatar,
    Button,
    Switch,
    FormControlLabel,
    CircularProgress,
    Snackbar,
    Alert,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { useKeycloak } from '@react-keycloak/web';

const StudentWalletHeader = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const { keycloak } = useKeycloak();
    const [isPublic, setIsPublic] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const username = keycloak.tokenParsed?.preferred_username;

    const handleToggleChange = (event) => {
        const newValue = event.target.checked;
        setLoading(true);
        setError('');
        setSuccess('');

        axios
            .put(`base/student/${username}/profile?public=${newValue}`)
            .then((response) => {
                console.log('PUT response:', response);
                setSuccess(`Profile set to ${newValue ? 'Public' : 'Not Public'}`);
            })
            .catch((error) => {
                console.error('PUT error:', error);
                setError('Failed to update profile visibility.');
            })
            .finally(() => {
                // Re-fetch actual value from backend
                axios
                    .get(`base/students/${username}`)
                    .then((response) => {
                        console.log('GET response:', response);
                        setIsPublic(response.data.is_profile_public);
                    })
                    .catch((error) => {
                        console.error('Failed to re-fetch visibility status', error);
                    })
                    .finally(() => {
                        setLoading(false);
                    });
            });
    };


    useEffect(() => {
        if (!username) return;
        axios
            .get(`base/students/${username}`)
            .then((response) => {
                setIsPublic(response.data.is_profile_public); // Assuming 'public' is the field returned
            })
            .catch((error) => {
                console.error('Failed to fetch visibility status', error);
            });
    }, [username]);

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
                        <Grid
                            item
                            xs={12}
                            sm={12}
                            md={3}
                            display="flex"
                            justifyContent="center"
                            alignItems="center"
                        >
                            <Avatar
                                src="https://cdn-icons-png.flaticon.com/512/4796/4796932.png"
                                alt="Student Profile"
                                sx={{
                                    width: 250,
                                    height: 250,
                                    border: '5px solid rgba(255, 255, 255, 0.8)',
                                    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3)',
                                }}
                            />
                        </Grid>

                        {/* Title and Info Section */}
                        <Grid item xs={12} sm={12} md={9} textAlign="center">
                            <Box display="flex" justifyContent="center" alignItems="center" gap={2}>
                                <Typography variant="h3" fontWeight={700} sx={{ mb: 2 }}>
                                    Digital Wallet
                                </Typography>
                                <Button
                                    variant="contained"
                                    sx={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                        color: 'white',
                                        fontWeight: 600,
                                        ':hover': {
                                            backgroundColor: 'rgba(255, 255, 255, 0.3)',
                                        },
                                    }}
                                    onClick={() => navigate(`/report/${username}`)}
                                >
                                    Generate Report
                                </Button>
                            </Box>

                            {/* Public Toggle */}
                            <Box mt={2} display="flex" justifyContent="center" alignItems="center" gap={1}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={isPublic}
                                            onChange={handleToggleChange}
                                            color="default"
                                        />
                                    }
                                    label={isPublic ? 'Public Profile' : 'Not Public'}
                                    sx={{ color: 'white' }}
                                />
                                {loading && <CircularProgress size={20} color="inherit" />}
                            </Box>

                            <Typography
                                variant="subtitle1"
                                component="div"
                                sx={{ maxWidth: '80%', margin: '0 auto', fontSize: '1.1rem' }}
                            >
                                Here you can find all your info, courses, and achievements in one place! Track your
                                green skills, manage credentials, and explore new opportunities.
                            </Typography>

                            {/* User Info Section */}
                            <Grid container spacing={3} sx={{ marginTop: 4 }}>
                                <Grid item xs={12} sm={6}>
                                    <Box
                                        sx={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                            padding: 3,
                                            borderRadius: '15px',
                                            color: 'white',
                                            textAlign: 'center',
                                            boxShadow: '0 6px 15px rgba(0, 0, 0, 0.15)',
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
                                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                            padding: 3,
                                            borderRadius: '15px',
                                            color: 'white',
                                            textAlign: 'center',
                                            boxShadow: '0 6px 15px rgba(0, 0, 0, 0.15)',
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

                    {/* Feedback Messages */}
                    <Snackbar open={!!error} autoHideDuration={5000} onClose={() => setError('')}>
                        <Alert severity="error">{error}</Alert>
                    </Snackbar>
                    <Snackbar open={!!success} autoHideDuration={4000} onClose={() => setSuccess('')}>
                        <Alert severity="success">{success}</Alert>
                    </Snackbar>
                </Box>
            )}
        </>
    );
};

export default StudentWalletHeader;
