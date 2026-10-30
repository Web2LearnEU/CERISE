// Web2learn 2026-10-30: CERISE admin panel (realm role cerise-admin).
// Backend: /base/admin/users (cerise users/admin_views.py). Temporary passwords are shown once.
import React, { useEffect, useMemo, useState } from 'react';
import {
    Alert, Box, Button, Chip, CircularProgress, Container, Dialog, DialogActions, DialogContent,
    DialogTitle, IconButton, InputAdornment, MenuItem, Paper, Stack, Tab, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Tabs, TextField, Tooltip, Typography, Autocomplete
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useNavigate } from 'react-router-dom';
import { useKeycloak } from '@react-keycloak/web';
import axios from 'axios';

const ROLE_LABEL = { 'student': 'Student', 'course-manager': 'Course manager', 'recruiter': 'Recruiter' };
const EMPTY = { role: 'course-manager', username: '', name: '', surname: '', email: '', university: '' };

function errText(err) {
    const d = err?.response?.data;
    if (!d) return err?.message || 'Request failed';
    if (typeof d === 'string') return d;
    if (d.detail) return d.detail;
    return Object.entries(d).map(([k, v]) => `${k}: ${v}`).join(' · ');
}

export default function AdminPanel() {
    const navigate = useNavigate();
    const { keycloak, initialized } = useKeycloak();
    const [allowed, setAllowed] = useState(false);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [info, setInfo] = useState('');
    const [tab, setTab] = useState('all');
    const [query, setQuery] = useState('');
    const [busy, setBusy] = useState('');
    const [createOpen, setCreateOpen] = useState(false);
    const [form, setForm] = useState(EMPTY);
    const [formError, setFormError] = useState('');
    const [universities, setUniversities] = useState([]);
    const [secret, setSecret] = useState(null); // {username, temporary_password, title}
    const [editUser, setEditUser] = useState(null); // user being edited (copy)
    const [editError, setEditError] = useState('');

    useEffect(() => {
        if (initialized) {
            const roles = keycloak?.tokenParsed?.realm_access?.roles || [];
            if (roles.includes('cerise-admin')) setAllowed(true); else navigate('/');
        }
    }, [initialized]);

    const load = () => {
        setLoading(true); setError('');
        axios.get('/base/admin/users')
            .then(r => setUsers(r.data))
            .catch(e => setError(errText(e)))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        if (!allowed) return;
        load();
        axios.get('/base/universities').then(r => setUniversities(r.data?.universities || [])).catch(() => {});
    }, [allowed]);

    const shown = useMemo(() => {
        const q = query.trim().toLowerCase();
        return users.filter(u =>
            (tab === 'all' || (tab === 'disabled' ? !u.enabled : u.role === tab)) &&
            (!q || [u.username, u.name, u.surname, u.email, u.university].join(' ').toLowerCase().includes(q)));
    }, [users, tab, query]);

    const counts = useMemo(() => ({
        all: users.length,
        'student': users.filter(u => u.role === 'student').length,
        'course-manager': users.filter(u => u.role === 'course-manager').length,
        'recruiter': users.filter(u => u.role === 'recruiter').length,
        disabled: users.filter(u => !u.enabled).length,
    }), [users]);

    const setEnabled = (u, enabled) => {
        if (!window.confirm(`${enabled ? 'Enable' : 'Disable'} ${u.username}?`)) return;
        setBusy(u.username); setError(''); setInfo('');
        axios.post(`/base/admin/users/${encodeURIComponent(u.username)}/enabled`, { enabled })
            .then(() => {
                setUsers(list => list.map(x => x.username === u.username ? { ...x, enabled } : x));
                setInfo(`${u.username} ${enabled ? 'enabled' : 'disabled'}.`);
            })
            .catch(e => setError(errText(e)))
            .finally(() => setBusy(''));
    };

    const resetPassword = (u) => {
        if (!window.confirm(`Set a new temporary password for ${u.username}? Their current password stops working and they are logged out.`)) return;
        setBusy(u.username); setError(''); setInfo('');
        axios.post(`/base/admin/users/${encodeURIComponent(u.username)}/reset-password`, {})
            .then(r => setSecret({ ...r.data, title: 'New temporary password' }))
            .catch(e => setError(errText(e)))
            .finally(() => setBusy(''));
    };

    const saveEdit = () => {
        setEditError(''); setBusy('__edit__');
        const { username, name, surname, email, university } = editUser;
        axios.patch(`/base/admin/users/${encodeURIComponent(username)}`, { name, surname, email, university })
            .then(r => {
                setUsers(list => list.map(x => x.username === username ? { ...x, ...r.data } : x));
                setEditUser(null); setInfo(`${username} updated.`);
            })
            .catch(e => setEditError(errText(e)))
            .finally(() => setBusy(''));
    };

    const createLogin = (u) => {
        if (!window.confirm(`Create a login for ${u.username} with a temporary password?`)) return;
        setBusy(u.username); setError(''); setInfo('');
        axios.post(`/base/admin/users/${encodeURIComponent(u.username)}/create-login`, {})
            .then(r => {
                setSecret({ ...r.data, title: 'Login created' });
                setUsers(list => list.map(x => x.username === u.username ? { ...x, in_keycloak: true, enabled: true } : x));
            })
            .catch(e => setError(errText(e)))
            .finally(() => setBusy(''));
    };

    const createUser = () => {
        setFormError(''); setBusy('__create__');
        axios.post('/base/admin/users', form)
            .then(r => {
                setCreateOpen(false); setForm(EMPTY);
                setSecret({ ...r.data, title: `${ROLE_LABEL[r.data.role]} created` });
                load();
            })
            .catch(e => setFormError(errText(e)))
            .finally(() => setBusy(''));
    };

    if (!allowed) return null;

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'center' }} spacing={2} sx={{ mb: 2 }}>
                <Typography variant="h4" color="primary">Admin · Users</Typography>
                <Stack direction="row" spacing={1}>
                    <Button startIcon={<RefreshIcon />} onClick={load} disabled={loading}>Refresh</Button>
                    <Button variant="contained" startIcon={<PersonAddIcon />} onClick={() => { setForm(EMPTY); setFormError(''); setCreateOpen(true); }}>
                        Add user
                    </Button>
                </Stack>
            </Stack>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
            {info && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setInfo('')}>{info}</Alert>}

            <Paper sx={{ mb: 2 }}>
                <Tabs value={tab} onChange={(e, v) => setTab(v)} variant="scrollable">
                    <Tab value="all" label={`All (${counts.all})`} />
                    <Tab value="student" label={`Students (${counts['student']})`} />
                    <Tab value="course-manager" label={`Course managers (${counts['course-manager']})`} />
                    <Tab value="recruiter" label={`Recruiters (${counts['recruiter']})`} />
                    <Tab value="disabled" label={`Disabled (${counts.disabled})`} />
                </Tabs>
            </Paper>

            <TextField fullWidth size="small" placeholder="Search username, name, email, university" value={query}
                       onChange={e => setQuery(e.target.value)} sx={{ mb: 2 }}
                       InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }} />

            {loading ? <Box sx={{ textAlign: 'center', py: 6 }}><CircularProgress /></Box> : (
                <TableContainer component={Paper}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Username</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Role</TableCell>
                                <TableCell>University</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {shown.map(u => (
                                <TableRow key={u.role + u.username} hover>
                                    <TableCell sx={{ fontFamily: 'monospace' }}>{u.username}</TableCell>
                                    <TableCell>{u.name} {u.surname}</TableCell>
                                    <TableCell>{u.email}</TableCell>
                                    <TableCell><Chip size="small" label={ROLE_LABEL[u.role] || u.role} /></TableCell>
                                    <TableCell>{u.university}</TableCell>
                                    <TableCell>
                                        {!u.in_keycloak ? <Chip size="small" color="warning" label="No login account" />
                                            : u.enabled ? <Chip size="small" color="success" variant="outlined" label="Enabled" />
                                                : <Chip size="small" color="error" label="Disabled" />}
                                    </TableCell>
                                    <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                                            <Button size="small" disabled={busy === u.username} onClick={() => { setEditError(''); setEditUser({ ...u }); }}>Edit</Button>
                                            {!u.in_keycloak && (
                                                <Button size="small" variant="outlined" disabled={busy === u.username} onClick={() => createLogin(u)}>Create login</Button>
                                            )}
                                        {u.in_keycloak && (
                                            <>
                                                <Button size="small" disabled={busy === u.username} onClick={() => resetPassword(u)}>Reset password</Button>
                                                {u.enabled
                                                    ? <Button size="small" color="error" disabled={busy === u.username} onClick={() => setEnabled(u, false)}>Disable</Button>
                                                    : <Button size="small" color="success" disabled={busy === u.username} onClick={() => setEnabled(u, true)}>Enable</Button>}
                                            </>
                                        )}
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {shown.length === 0 && (
                                <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>No users</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Create user */}
            <Dialog open={createOpen} onClose={() => setCreateOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>Add user</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        {formError && <Alert severity="error">{formError}</Alert>}
                        <TextField select label="Role" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                            <MenuItem value="course-manager">Course manager</MenuItem>
                            <MenuItem value="recruiter">Recruiter</MenuItem>
                            <MenuItem value="student">Student</MenuItem>
                        </TextField>
                        <TextField label="Username" value={form.username} helperText="lowercase letters, digits, . _ -"
                                   onChange={e => setForm({ ...form, username: e.target.value.toLowerCase() })} />
                        <Stack direction="row" spacing={2}>
                            <TextField fullWidth label="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                            <TextField fullWidth label="Surname" value={form.surname} onChange={e => setForm({ ...form, surname: e.target.value })} />
                        </Stack>
                        <TextField label="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                        {form.role !== 'recruiter' && (
                            <Autocomplete freeSolo options={universities} value={form.university}
                                          onInputChange={(e, v) => setForm(f => ({ ...f, university: v }))}
                                          renderInput={params => <TextField {...params} label="University" />} />
                        )}
                        <Alert severity="info">A temporary password is generated and shown once. The user must change it at first login.</Alert>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={createUser} disabled={busy === '__create__'}>Create</Button>
                </DialogActions>
            </Dialog>

            {/* Edit user */}
            <Dialog open={!!editUser} onClose={() => setEditUser(null)} fullWidth maxWidth="sm">
                <DialogTitle>Edit {editUser?.username}</DialogTitle>
                <DialogContent>
                    {editUser && (
                        <Stack spacing={2} sx={{ mt: 1 }}>
                            {editError && <Alert severity="error">{editError}</Alert>}
                            <TextField label="Username" value={editUser.username} disabled helperText="The username can't be changed (courses, requests and CVs are linked to it)" />
                            <Stack direction="row" spacing={2}>
                                <TextField fullWidth label="Name" value={editUser.name || ''} onChange={e => setEditUser({ ...editUser, name: e.target.value })} />
                                <TextField fullWidth label="Surname" value={editUser.surname || ''} onChange={e => setEditUser({ ...editUser, surname: e.target.value })} />
                            </Stack>
                            <TextField label="Email" type="email" value={editUser.email || ''} onChange={e => setEditUser({ ...editUser, email: e.target.value })} />
                            {editUser.role !== 'recruiter' && (
                                <Autocomplete freeSolo options={universities} value={editUser.university || ''}
                                              onInputChange={(e, v) => setEditUser(f => ({ ...f, university: v }))}
                                              renderInput={params => <TextField {...params} label="University" />} />
                            )}
                            <Alert severity="info">Changes are saved in CERISE and in the user's Keycloak login{editUser.in_keycloak ? '' : ' (this user has no login yet)'}.</Alert>
                        </Stack>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditUser(null)}>Cancel</Button>
                    <Button variant="contained" onClick={saveEdit} disabled={busy === '__edit__'}>Save</Button>
                </DialogActions>
            </Dialog>

            {/* Temporary password, shown once */}
            <Dialog open={!!secret} onClose={() => setSecret(null)} fullWidth maxWidth="sm">
                <DialogTitle>{secret?.title}</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <TextField label="Username" value={secret?.username || ''} InputProps={{ readOnly: true }} />
                        <TextField label="Temporary password" value={secret?.temporary_password || ''}
                                   InputProps={{
                                       readOnly: true, sx: { fontFamily: 'monospace' },
                                       endAdornment: (
                                           <InputAdornment position="end">
                                               <Tooltip title="Copy">
                                                   <IconButton onClick={() => navigator.clipboard?.writeText(secret?.temporary_password || '')}><ContentCopyIcon /></IconButton>
                                               </Tooltip>
                                           </InputAdornment>
                                       )
                                   }} />
                        {secret && secret.enabled === false &&
                            <Alert severity="warning">This account is disabled. Enable it so the user can log in.</Alert>}
                        <Alert severity="warning">
                            Shown only now. Send it to the user over a different channel than the username
                            (e.g. username by email, password by phone). They must set a new password at first login.
                        </Alert>
                    </Stack>
                </DialogContent>
                <DialogActions><Button variant="contained" onClick={() => setSecret(null)}>Done</Button></DialogActions>
            </Dialog>
        </Container>
    );
}
