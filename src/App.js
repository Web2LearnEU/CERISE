import { Route, Routes } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import axios from "axios";
import { useKeycloak } from "@react-keycloak/web";

import Homepage from "./pages/Homepage";
import Layout from "./Layout/Layout";
import StudentWallet from "./pages/StudentWallet";
import CourseManagerControlPanel from "./pages/CourseManagerControlPanel";
import Register from "./pages/Register";
import CandidateSearch from "./pages/CandidateSearch";
import StudentWalletDownload from "./components/StudentWallet/StudentWalletDownload";
import { useEffect } from "react";
import About from './pages/About';
import AdminPanel from './pages/AdminPanel';
import my_keycloak from "./Keycloak";

// Web2learn 2026-10-30 (w2l: bearer token): the backend now requires a Keycloak token.
// Attach a fresh access token to every API request (refresh if it expires within 30 s).
axios.interceptors.request.use(async (config) => {
    if (my_keycloak.authenticated) {
        try {
            await my_keycloak.updateToken(30);
        } catch (e) {
            my_keycloak.login();
            return Promise.reject(e);
        }
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${my_keycloak.token}`;
    }
    return config;
});

// Set primary color here
let primary = 'rgba(65, 113, 63, 1)'

// Set secondary color here
let secondary = 'rgba(65, 113, 63, 1)'

// Set middle color here
let middle = '#285D22'

// Dashboard theme setup here
// You can set your colors in order to be reusable
const theme = createTheme({
    palette: {
        primary: {
            main: primary
        },
        secondary: {
            main: secondary
        },
        gradient: {
            main: `linear-gradient(270deg, ${primary} 55%, rgba(255,255,255,1) 100%)`
        }
    },
    typography: {
        fontFamily: [
            'Poppins',
            'Segoe UI',
            'Roboto',
            'Jura'
        ].join(','),
    }
});

function App() {
    const { keycloak, initialized } = useKeycloak();
    axios.defaults.baseURL = process.env.REACT_APP_BE_URL || ''

    useEffect(() => {
        if (initialized && window.location.hash.includes('iss=')) {
            window.history.replaceState(null, '', window.location.pathname + window.location.search);
        }
    }, [initialized]);

    return (
        <ThemeProvider theme={theme}>
            <Layout>
                <Routes>
                    <Route path="/" element={<Homepage />} />
                    <Route path="/wallet" element={<StudentWallet />} />
                    <Route path="/report/:username" element={<StudentWalletDownload />} />
                    <Route path="/control-panel" element={<CourseManagerControlPanel />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/candidate-search" element={<CandidateSearch />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/admin" element={<AdminPanel />} />
                </Routes>
            </Layout>
        </ThemeProvider>
    );
}

export default App;
