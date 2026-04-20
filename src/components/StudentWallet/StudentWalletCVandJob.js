import React, {useEffect, useState} from 'react';
import {
    Box,
    Button,
    Chip,
    Modal,
    Paper,
    Typography,
    Alert,
    Input,
    Stack,
    Snackbar,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions
} from "@mui/material";

import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';

import axios from "axios";
import {useKeycloak} from "@react-keycloak/web";

function StudentWalletCVandJob({jobSkills}) {
    const {keycloak} = useKeycloak();
    const username = keycloak.idTokenParsed.preferred_username;

    const [jobSearchModalOpen, setJobSearchModalOpen] = useState(false);
    const [jobResults, setJobResults] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [cvFile, setCvFile] = useState(null);
    const [hasCv, setHasCv] = useState(false);
    const [cvSkills, setCvSkills] = useState([]);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [deleteSuccess, setDeleteSuccess] = useState(false);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const jobsPerPage = 5;
    const backendUrl = process.env.REACT_APP_BE_URL;

    useEffect(() => {
        axios.get(`${backendUrl}uc4/get/student/${username}/cv/`)
            .then(() => {
                setHasCv(true);
                axios.get(`${backendUrl}uc4/get/student/${username}/skills/from/cv`)
                    .then(res => setCvSkills(res.data))
                    .catch(() => alert("Failed to extract skills from CV."));
            })
            .catch(() => setHasCv(false));
    }, [username]);

    const handleJobSearch = () => {
        const fallback = () => {
            setJobResults([]);
            setJobSearchModalOpen(true);
        };

        const mergedSkills = Array.from(new Set([...(jobSkills.skills || []), ...(cvSkills.skills || [])]));

        if (mergedSkills.length === 0) {
            axios.get(`/uc1/green/job/posts`)
                .then(res => {
                    setJobResults(res.data);
                    setJobSearchModalOpen(true);
                })
                .catch(fallback);
        } else {
            axios.post(`/uc1/green/job/posts/search`, {skills: mergedSkills}, {
                headers: {'Content-Type': 'application/json'},
            })
                .then(res => {
                    setJobResults(res.data);
                    setJobSearchModalOpen(true);
                })
                .catch(fallback);
        }

        setCurrentPage(1);
    };

    const handleUploadCv = () => {
        if (!cvFile) return;
        const formData = new FormData();
        formData.append("cv", cvFile);

        axios.post(`${backendUrl}uc4/upload/student/${username}/cv/`, formData)
            .then(() => {
                setUploadSuccess(true);
                setHasCv(true);
                axios.get(`${backendUrl}uc4/get/student/${username}/skills/from/cv`)
                    .then(res => setCvSkills(res.data))
                    .catch(() => alert("Failed to extract skills from CV."));
            })
            .catch(() => alert("Failed to upload CV."));
    };

    const handleDownloadCv = () => {
        axios.get(`${backendUrl}uc4/get/student/${username}/cv/`, {
            responseType: 'blob'
        }).then((response) => {
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `StudentCV_${username}.pdf`);
            document.body.appendChild(link);
            link.click();
        }).catch(() => alert("No CV found or download failed."));
    };

    const handleDeleteCv = () => {
        axios.delete(`${backendUrl}uc4/clear/student/${username}/cv`)
            .then(() => {
                setDeleteSuccess(true);
                setHasCv(false);
                setCvSkills([]);
            })
            .catch(() => alert("Failed to delete CV."));
    };

    return (<>
        {/* Upload/Download CV Controls */}
        <Paper
            elevation={0}
            variant="outlined"
            sx={{
                p: 3, mt: 4, borderRadius: '25px', backgroundColor: 'rgba(245, 245, 245, 0.6)',
            }}
        >
            <Stack
                direction={{xs: 'column', sm: 'row'}}
                spacing={2}
                alignItems={{xs: 'stretch', sm: 'center'}}
                justifyContent="space-between"
                flexWrap="wrap"
            >
                {/* Left Button Group */}
                <Stack
                    direction={{xs: 'column', sm: 'row'}}
                    spacing={2}
                    alignItems={{xs: 'stretch', sm: 'center'}}
                    flex={1}
                    flexWrap="wrap"
                >
                    <Input
                        type="file"
                        onChange={(e) => setCvFile(e.target.files[0])}
                        sx={{minWidth: '200px'}}
                    />
                    <Button variant="contained" onClick={handleUploadCv}>
                        {hasCv ? 'Upload New CV' : 'Upload CV'}
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={handleDownloadCv}
                        disabled={!hasCv}
                    >
                        Download CV
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={() => setConfirmDeleteOpen(true)}
                        disabled={!hasCv}
                    >
                        Delete CV
                    </Button>
                </Stack>

                {/* Right-Aligned Button */}
                <Box mt={{xs: 2, sm: 0}}>
                    <Button
                        variant="contained"
                        color="secondary"
                        size="small"
                        sx={{fontWeight: 600, whiteSpace: 'nowrap'}}
                        onClick={handleJobSearch}
                    >
                        Search for a job
                    </Button>
                </Box>
            </Stack>


            {/* CV Skills Display */}
            {cvSkills.skills && cvSkills.skills.length > 0 && (<Box sx={{mt: 3}}>
                <Typography variant="h6" fontWeight={600} sx={{mt: 2, mb: 1, color: '#41713F'}}>
                    Skills Extracted from Uploaded CV
                </Typography>
                <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 1}}>
                    {cvSkills.skills.map((skill, idx) => (
                        <Chip key={idx} label={skill} sx={{bgcolor: 'rgba(65, 113, 63, 0.2)'}}/>))}
                </Box>
            </Box>)}
        </Paper>

        {/* Upload Success Snackbar */}
        <Snackbar
            open={uploadSuccess}
            autoHideDuration={3000}
            onClose={() => setUploadSuccess(false)}
            anchorOrigin={{vertical: 'bottom', horizontal: 'left'}}
        >
            <Alert onClose={() => setUploadSuccess(false)} severity="success" variant="filled" sx={{width: '100%'}}>
                CV uploaded successfully!
            </Alert>
        </Snackbar>

        {/* Delete Success Snackbar */}
        <Snackbar
            open={deleteSuccess}
            autoHideDuration={3000}
            onClose={() => setDeleteSuccess(false)}
            anchorOrigin={{vertical: 'bottom', horizontal: 'left'}}
        >
            <Alert onClose={() => setDeleteSuccess(false)} severity="success" variant="filled" sx={{width: '100%'}}>
                CV deleted successfully.
            </Alert>
        </Snackbar>

        {/* Job Modal */}
        <Modal open={jobSearchModalOpen} onClose={() => setJobSearchModalOpen(false)}>
            <Box
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '80%',
                    maxHeight: '80vh',
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                    borderRadius: 2,
                    p: 4,
                    overflowY: 'auto',
                }}
            >
                <Typography variant="h4" fontWeight={600} sx={{mb: 3}}>
                    {jobSkills.skills?.length > 0 || cvSkills.length > 0 ? 'Job Recommendations Based on Your Skills' : 'Job Results'}
                </Typography>

                {/* Close Button */}
                <IconButton
                    aria-label="close"
                    onClick={() => setJobSearchModalOpen(false)}
                    sx={{
                        position: 'absolute', top: 8, right: 8, color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <CloseIcon/>
                </IconButton>

                {/* Pagination Logic */}
                {(() => {
                    const indexOfLastJob = currentPage * jobsPerPage;
                    const indexOfFirstJob = indexOfLastJob - jobsPerPage;
                    const currentJobs = jobResults.slice(indexOfFirstJob, indexOfLastJob);
                    const totalPages = Math.ceil(jobResults.length / jobsPerPage);

                    return (<>
                        {currentJobs.length > 0 ? (currentJobs.map((job, index) => (<Paper
                            key={index}
                            sx={{
                                mb: 2, p: 2, borderRadius: 2, backgroundColor: 'rgba(245, 245, 245, 0.9)',
                            }}
                        >
                            <Box
                                sx={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1
                                }}
                            >
                                <Typography variant="h6" fontWeight={600}>
                                    {job.title || 'Job Title'}
                                </Typography>
                                {job.field && (<Chip
                                    label={job.field}
                                    size="small"
                                    sx={{
                                        bgcolor: 'rgba(65, 113, 63, 0.15)', color: '#41713F', fontWeight: 500
                                    }}
                                />)}
                            </Box>
                            <Typography variant="body2" sx={{color: 'text.secondary', mb: 1}}>
                                {job.description || 'No description available.'}
                            </Typography>
                            <Typography variant="body2" sx={{color: 'text.secondary'}}>
                                                <span style={{fontWeight: 500}}>
                                                    Location
                                                </span>: {job.location || 'N/A'}
                            </Typography>
                            {job.email && (<Typography variant="body2" sx={{color: 'text.secondary'}}>
                                  <span style={{fontWeight: 500}}>
                                    To apply send your CV to
                                  </span>:&nbsp;
                                    <a href={`mailto:${job.email}`}
                                       style={{textDecoration: 'underline', color: 'inherit'}}>
                                        {job.email}
                                    </a>
                                </Typography>

                            )}
                        </Paper>))) : (<Alert severity="error" sx={{mb: 2}}>
                            Failed to load job listings. Please try again later.
                        </Alert>)}

                        {/* Pagination Controls */}
                        {totalPages > 1 && (<Box sx={{display: 'flex', justifyContent: 'center', mt: 3, gap: 1}}>
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </Button>
                            <Typography variant="body2" sx={{alignSelf: 'center'}}>
                                Page {currentPage} of {totalPages}
                            </Typography>
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </Button>
                        </Box>)}
                    </>);
                })()}
            </Box>
        </Modal>

        <Dialog
            open={confirmDeleteOpen}
            onClose={() => setConfirmDeleteOpen(false)}
        >
            <DialogTitle>Confirm CV Deletion</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Are you sure you want to delete your CV? This action cannot be undone.
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setConfirmDeleteOpen(false)}>Cancel</Button>
                <Button
                    onClick={() => {
                        setConfirmDeleteOpen(false);
                        handleDeleteCv();
                    }}
                    color="error"
                    variant="contained"
                >
                    Delete
                </Button>
            </DialogActions>
        </Dialog>
    </>);
}

export default StudentWalletCVandJob;
