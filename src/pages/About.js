import React from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import SchoolIcon from '@mui/icons-material/School';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import GroupsIcon from '@mui/icons-material/Groups';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import DescriptionIcon from '@mui/icons-material/Description';
import ScienceIcon from '@mui/icons-material/Science';
import BuildIcon from '@mui/icons-material/Build';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import { useTheme } from "@mui/material/styles";

const VideoPlayer = ({ title, filename }) => {
    const [isPlaying, setIsPlaying] = React.useState(false);
    const videoRef = React.useRef(null);
    const theme = useTheme();
    const handlePlayClick = () => {
        setIsPlaying(true);
        if (videoRef.current) {
            videoRef.current.play();
        }
    };

    return (
        <Card sx={{
            overflow: 'hidden',
            transition: 'all 0.3s ease',
            '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: 8
            }
        }}>
            <Box sx={{
                position: 'relative',
                backgroundColor: '#000',
                cursor: isPlaying ? 'default' : 'pointer'
            }}
                onClick={!isPlaying ? handlePlayClick : undefined}>
                {!isPlaying && (
                    <Box sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            backgroundColor: 'rgba(0,0,0,0.5)'
                        }
                    }}>
                        <PlayCircleIcon sx={{
                            fontSize: 80,
                            color: 'white',
                            '&:hover': {
                                transform: 'scale(1.1)',
                                transition: 'transform 0.2s ease'
                            }
                        }} />
                    </Box>
                )}
                <video
                    ref={videoRef}
                    width="100%"
                    height="auto"
                    controls={isPlaying}
                    onLoadedMetadata={() => {
                        // Try to use the first frame as thumbnail
                        if (videoRef.current && !isPlaying) {
                            videoRef.current.currentTime = 0.1;
                        }
                    }}
                    style={{ display: 'block' }}
                >
                    <source src={`/videos/${filename}`} type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            </Box>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                    {title}
                </Typography>
            </CardContent>
        </Card>
    );
};

function About(props) {
    const theme = useTheme();
    const videos = [
        { title: 'CERISE Use Case 1', filename: 'CERISE v.1.0.mp4' },
        { title: 'CERISE Use Cases 2-4', filename: 'CERISE video UseCase 2-4 v0.2.mp4' },
        { title: 'CERISE Use Cases 5-6', filename: 'UseCase 5&6.mp4' }
    ];

    const outcomes = [
        { text: 'Publication on Green skills initiatives carried out by European HEIs and EU projects.', icon: <DescriptionIcon /> },
        { text: 'Study on the potential of the foreseen system', icon: <ScienceIcon /> },
        { text: 'The CERISE methodology', icon: <AutoAwesomeIcon /> },
        { text: 'CERISE digital tool at prototype level', icon: <BuildIcon /> }
    ];

    const partners = [
        { name: 'University of Luxembourg', country: 'LU', role: 'Coordinator' },
        { name: 'Web2Learn', country: 'GR' },
        { name: 'National Technical University of Athens', country: 'GR' },
        { name: 'University of Lorraine', country: 'FR' },
        { name: 'University of Information Technology and Management in Rzeszów', country: 'PL' },
        { name: 'Kaunas University of Technology', country: 'LT' }
    ];

    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: '#fafafa' }}>
            {/* Hero Header */}
            <Box sx={{
                background: 'linear-gradient(to right, var(--primary), var(--middle))',
                py: 5,
                mb: 6
            }}>
                <Container maxWidth="xl">
                    <Box sx={{ textAlign: 'center' }}>
                        <LocalFloristIcon sx={{ fontSize: 80, color: 'white', mb: 2 }} />
                        <Typography variant="h2" component="h1" sx={{ color: 'white', fontWeight: 'bold', mb: 2 }}>
                            About CERISE
                        </Typography>
                        <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)', maxWidth: '800px', mx: 'auto' }}>
                            Strengthening Higher Education (HE) through Green Skills Recognition
                        </Typography>
                    </Box>
                </Container>
            </Box>

            <Container maxWidth="xl">
                {/* Description Section */}
                <Box sx={{ mb: 8 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <SchoolIcon sx={{ fontSize: 40, color: theme.palette.primary.main, mr: 2 }} />
                        <Typography variant="h4" component="h2" sx={{ color: theme.palette.primary.main, fontWeight: 'bold' }}>
                            Project Description
                        </Typography>
                    </Box>
                    <Box sx={{ ml: { xs: 0, md: 7 } }}>
                        <Typography variant="body1" paragraph sx={{ fontSize: '1.15rem', lineHeight: 1.9, color: '#555' }}>
                            The project aims to strengthen the capacity of European higher education institutions (HEIs) in delivering courses and services that enhance and recognise green skills and expand green culture. In particular, the project focuses on supporting HE curricula development to advance HE students' green skills and attitudes through a technological tool that will foster the recognition of green skills in the HE sector.
                        </Typography>
                        <Typography variant="body1" paragraph sx={{ fontSize: '1.15rem', lineHeight: 1.9, color: '#555' }}>
                            CERISE aspires to raise awareness of the green transition and promote the importance of green and digital capabilities for HEIs by expanding green skills and culture among students, learners, job seekers, employees, and educational institutions. CERISE's innovative potential is reflected in the connection of its online system with the pan-European ESCO green skills taxonomy that contributes to the standardisation and interoperability of these types of technical tools at EU level.
                        </Typography>
                    </Box>
                </Box>

                {/* Key Project Outcomes Section */}
                <Box sx={{ mb: 8 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                        <AutoAwesomeIcon sx={{ fontSize: 40, color: theme.palette.primary.main, mr: 2 }} />
                        <Typography variant="h4" component="h2" sx={{ color: theme.palette.primary.main, fontWeight: 'bold' }}>
                            Key Project Outcomes
                        </Typography>
                    </Box>
                    <Grid container spacing={3}>
                        {outcomes.map((outcome, index) => (
                            <Grid item xs={12} sm={6} key={index}>
                                <Card sx={{
                                    height: '100%',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-8px)',
                                        boxShadow: 6
                                    },
                                    borderLeft: '4px solid var(--secondary)'
                                }}>
                                    <CardContent sx={{ p: 3 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                                            <Box sx={{
                                                backgroundColor: theme.palette.primary.main,
                                                color: 'white',
                                                borderRadius: '50%',
                                                p: 1,
                                                mr: 2,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                {outcome.icon}
                                            </Box>
                                            <Typography variant="body1" sx={{
                                                fontSize: '1.05rem',
                                                lineHeight: 1.7,
                                                color: '#333',
                                                fontWeight: 500
                                            }}>
                                                {outcome.text}
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>

                {/* Partnership Section */}
                <Box sx={{ mb: 8 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                        <GroupsIcon sx={{ fontSize: 40, color: theme.palette.primary.main, mr: 2 }} />
                        <Typography variant="h4" component="h2" sx={{ color: theme.palette.primary.main, fontWeight: 'bold' }}>
                            Partnership
                        </Typography>
                    </Box>
                    <Grid container spacing={2}>
                        {partners.map((partner, index) => (
                            <Grid item xs={12} sm={6} md={4} key={index}>
                                <Card sx={{
                                    height: '100%',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: 4
                                    },
                                    background: partner.role ? 'linear-gradient(135deg, var(--primary) 0%, var(--middle) 100%)' : 'white',
                                    color: partner.role ? 'white' : 'inherit'
                                }}>
                                    <CardContent sx={{ textAlign: 'center', p: 3 }}>
                                        {partner.role && (
                                            <Chip
                                                label={partner.role}
                                                size="small"
                                                sx={{
                                                    mb: 2,
                                                    backgroundColor: 'white',
                                                    color: theme.palette.primary.main,
                                                    fontWeight: 'bold'
                                                }}
                                            />
                                        )}
                                        <Typography variant="h6" sx={{
                                            fontWeight: 'bold',
                                            color: partner.role ? 'white' : theme.palette.primary.main,
                                            mb: 1
                                        }}>
                                            {partner.name}
                                        </Typography>
                                        <Chip
                                            label={partner.country}
                                            size="small"
                                            sx={{
                                                backgroundColor: partner.role ? 'rgba(255,255,255,0.3)' : theme.palette.secondary.main,
                                                color: 'white',
                                                fontWeight: 'bold'
                                            }}
                                        />
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>

                {/* Videos Section */}
                <Box sx={{ mb: 8 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                        <VideoLibraryIcon sx={{ fontSize: 40, color: theme.palette.primary.main, mr: 2 }} />
                        <Typography variant="h4" component="h2" sx={{ color: theme.palette.primary.main, fontWeight: 'bold' }}>
                            Project Videos
                        </Typography>
                    </Box>
                    <Grid container spacing={4}>
                        {videos.map((video, index) => (
                            <Grid item xs={12} md={4} key={index}>
                                <VideoPlayer title={video.title} filename={video.filename} />
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            </Container>
        </Box>
    );
}

export default About;