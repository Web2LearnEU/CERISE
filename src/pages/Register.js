import React, { useState, useEffect } from 'react';
import {
    TextField,
    Button,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Typography,
    Avatar,
    Container,
    Snackbar,
    Alert
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useKeycloak } from "@react-keycloak/web";

const Register = () => {
    const { keycloak } = useKeycloak(); // Check for authentication
    const [userType, setUserType] = useState('');
    const [universities, setUniversities] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        surname: '',
        username: '',
        email: '',
        password: '',
        university: '',
    });
    const [signUpSuccess, setSignUpSuccess] = useState(false);
    const [signUpError, setSignUpError] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // If the user is authenticated, redirect to the homepage
        if (keycloak.authenticated) {
            window.location.assign("/");
        }
    }, [keycloak.authenticated]);

    useEffect(() => {
        // Fetch universities from API
        const fetchUniversities = async () => {
            try {
                const response = await axios.get('base/universities');
                setUniversities(response.data.universities || []);
            } catch (error) {
                console.error('Failed to fetch universities:', error);
                // Optionally set a default empty array or show an error
            }
        };
        fetchUniversities();
    }, []);

    // Handle change for all form fields
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    // Handle change for user type dropdown
    const handleUserTypeChange = (e) => {
        setUserType(e.target.value);
        setFormData({
            name: '',
            surname: '',
            username: '',
            email: '',
            password: '',
            university: '',
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        let endpoint;
        let payload = { ...formData };

        if (userType === 'student') {
            endpoint = 'base/register/students';
            payload.is_verified = true;
        } else if (userType === 'recruiter') {
            endpoint = 'base/register/recruiters';
            delete payload.university;
        } else if (userType === 'course_manager') {
            endpoint = 'base/register/course_managers';
        } else {
            return;
        }

        try {
            const response = await axios.post(endpoint, payload);
            setSignUpSuccess(true);  // Trigger success snackbar
        } catch {
            setSignUpError(true);
        }
    };

    const handleCloseSnackbar = () => {
        setSignUpSuccess(false);
        navigate("/");  // Redirect to homepage
    };

    return (
        <Container sx={{ mx: 'auto', textAlign: 'center', my: 5 }}>
            <Avatar sx={{ bgcolor: 'secondary.main', mx: 'auto', mb: 1 }}>
                <LockOutlinedIcon />
            </Avatar>
            <Typography variant="h5" component="h1" gutterBottom>
                Register
            </Typography>

            <FormControl fullWidth margin="normal">
                <InputLabel>User Type</InputLabel>
                <Select
                    value={userType}
                    onChange={handleUserTypeChange}
                    label="User Type"
                >
                    <MenuItem value="student">Student</MenuItem>
                    <MenuItem value="recruiter">Recruiter</MenuItem>
                    <MenuItem value="course_manager">Course Manager</MenuItem>
                </Select>
            </FormControl>

            <form onSubmit={handleSubmit}>
                <TextField
                    fullWidth
                    margin="normal"
                    label="Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                />
                <TextField
                    fullWidth
                    margin="normal"
                    label="Surname"
                    name="surname"
                    value={formData.surname}
                    onChange={handleChange}
                    required
                />
                <TextField
                    fullWidth
                    margin="normal"
                    label="Username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                />
                <TextField
                    fullWidth
                    margin="normal"
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
                <TextField
                    fullWidth
                    margin="normal"
                    label="Password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />

                {userType !== 'recruiter' && (
                    <FormControl fullWidth margin="normal" required={userType !== 'recruiter'}>
                        <InputLabel id="university-label">University</InputLabel>
                        <Select
                            labelId="university-label"
                            id="university-select"
                            value={formData.university}
                            name="university"
                            label="University"
                            onChange={handleChange}
                        >
                            {universities.map((uni) => (
                                <MenuItem key={uni} value={uni}>
                                    {uni}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                )}

                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    sx={{ mt: 3 }}
                >
                    Register
                </Button>
            </form>

            {/* Success Snackbar */}
            <Snackbar
                open={signUpSuccess}
                autoHideDuration={3000}
                onClose={handleCloseSnackbar}
            >
                <Alert variant="filled" onClose={handleCloseSnackbar} severity="success">
                    The user has been successfully registered! You will be navigated to the Homepage.
                </Alert>
            </Snackbar>

            {/* Error Snackbar */}
            <Snackbar
                open={signUpError}
                autoHideDuration={4000}
                onClose={() => setSignUpError(false)}
            >
                <Alert variant="filled" onClose={() => setSignUpError(false)} severity="error">
                    Registration failed. Please check your input and try again.
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default Register;
