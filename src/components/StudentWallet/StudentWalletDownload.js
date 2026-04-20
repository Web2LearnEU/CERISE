import React, { useEffect, useRef, useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Divider,
    CircularProgress,
    Button
} from '@mui/material';
import EnergySavingsLeafIcon from '@mui/icons-material/EnergySavingsLeaf';
import { useKeycloak } from '@react-keycloak/web';
import {useNavigate, useParams} from 'react-router-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import DownloadIcon from '@mui/icons-material/Download';
import axios from 'axios'

const StudentWalletDownload = () => {
    const { keycloak, initialized } = useKeycloak();
    const { username: rawUsername } = useParams();
    const username = rawUsername.split('#')[0];

    const navigate = useNavigate();
    const componentRef = useRef();
    const [loading, setLoading] = useState(true);
    const [completedCourses, setCompletedCourses] = useState([]);
    const [ongoingCourses, setOngoingCourses] = useState([]);
    const [skills, setSkills] = useState([]);
    const [studentInfo, setStudentInfo] = useState({})

    useEffect(() => {
        // if (initialized) {
            // const username = keycloak.tokenParsed.preferred_username;

            const fetchData = async () => {
                console.log(username)
                try {
                    const completedRes = await axios.get(`/uc2/students/${username}/courses?is_completed=true`);
                    const ongoingRes = await axios.get(`/uc2/students/${username}/courses?is_completed=false`);
                    const skillsRes = await axios.get(`/uc2/student/${username}/skill/base?skill_type=all`);
                    const studentInfoRes = await axios.get(`/base/students/${username}`);

                    setCompletedCourses(completedRes.data);
                    setOngoingCourses(ongoingRes.data);
                    setSkills(skillsRes.data);
                    setStudentInfo(studentInfoRes.data)
                    setLoading(false);
                } catch (error) {
                    console.error("Error loading student wallet:", error);
                    setLoading(false);
                }
            };
            fetchData();
        // }
    }, [keycloak]);

    const handleDownloadPDF = async () => {
        if (componentRef.current) {
            const canvas = await html2canvas(componentRef.current, {
                scale: 2,
                useCORS: true,
                windowWidth: componentRef.current.scrollWidth,
                windowHeight: componentRef.current.scrollHeight,
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            const imgProps = {
                width: pdfWidth,
                height: (canvas.height * pdfWidth) / canvas.width
            };

            let position = 0;
            let heightLeft = imgProps.height;

            // Add first page
            pdf.addImage(imgData, 'PNG', 0, position, imgProps.width, imgProps.height);
            heightLeft -= pdfHeight;

            // Add extra pages if needed
            while (heightLeft > 0) {
                position = heightLeft - imgProps.height;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgProps.width, imgProps.height);
                heightLeft -= pdfHeight;
            }

            pdf.save('Digital_Wallet.pdf');
            navigate('/wallet');
        }
    };


    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 4 }}>
            {/* Download Button */}
            <Box display="flex" justifyContent="flex-end" mb={2}>
                <Button
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    onClick={handleDownloadPDF}
                >
                    Download PDF
                </Button>
            </Box>

            <Box ref={componentRef}>
                {/* Student Info */}
                <Paper elevation={3} sx={{p: 3, mb: 4}}>
                    <Typography variant="h5" fontWeight={600} gutterBottom>
                        Student Information
                    </Typography>
                    <Divider sx={{mb: 2}}/>
                    <Typography variant="body1"><strong>Name:</strong> {studentInfo.name} {studentInfo.surname}</Typography>
                    <Typography variant="body1"><strong>University:</strong> {studentInfo.university}
                    </Typography>
                    <Typography variant="body1"><strong>Email:</strong> {studentInfo.email}</Typography>
                </Paper>

                {/* Completed Courses */}
                <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
                    <Typography variant="h6" fontWeight={500} gutterBottom>
                        ✅ Completed Courses
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    {completedCourses.length > 0 ? (
                        <Grid container spacing={2}>
                            {completedCourses.map(course => (
                                <Grid item xs={12} sm={6} md={4} key={course.id}>
                                    <Paper sx={{ p: 2 }}>
                                        <Typography fontWeight={500}>{course.course.name}</Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            Grade: {course.grade}
                                        </Typography>
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>
                    ) : (
                        <Typography color="textSecondary">No completed courses.</Typography>
                    )}
                </Paper>

                {/* Ongoing Courses */}
                <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
                    <Typography variant="h6" fontWeight={500} gutterBottom>
                        🔄 Ongoing Courses
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    {ongoingCourses.length > 0 ? (
                        <Grid container spacing={2}>
                            {ongoingCourses.map(course => (
                                <Grid item xs={12} sm={6} md={4} key={course.id}>
                                    <Paper sx={{ p: 2 }}>
                                        <Typography fontWeight={500}>{course.course.name}</Typography>
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>
                    ) : (
                        <Typography color="textSecondary">No ongoing courses.</Typography>
                    )}
                </Paper>

                {/* Acquired Green Skills */}
                <Paper elevation={2} sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight={500} gutterBottom>
                        📘 Acquired Skills
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    {skills.length > 0 ? (
                        <Grid container spacing={2}>
                            {skills.map(skill => (
                                <Grid item xs={12} key={skill.id}>
                                    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                            <Typography fontWeight={600} variant="body1">
                                                {skill.name
                                                    .split(' ')
                                                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                                    .join(' ')
                                                }
                                            </Typography>
                                            {skill.is_green && (
                                                <EnergySavingsLeafIcon
                                                    sx={{ color: 'green', ml: 1 }}
                                                    fontSize="small"
                                                    titleAccess="Green Skill"
                                                />
                                            )}
                                        </Box>
                                        <Typography variant="body2" color="textSecondary">
                                            {skill.description}
                                        </Typography>
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>
                    ) : (
                        <Typography color="textSecondary">No skills acquired yet.</Typography>
                    )}
                </Paper>
            </Box>
        </Box>
    );
};

export default StudentWalletDownload;
