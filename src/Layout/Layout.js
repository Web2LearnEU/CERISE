import { useEffect, useMemo } from 'react';
import { useTheme } from '@mui/material/styles';
import { useKeycloak } from "@react-keycloak/web";
import { useLocation, useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import CssBaseline from '@mui/material/CssBaseline';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';

import HomeIcon from '@mui/icons-material/Home';
import WalletIcon from '@mui/icons-material/Wallet';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import LoginIcon from '@mui/icons-material/Login';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import InfoIcon from '@mui/icons-material/Info';

import { Main, AppBar, DrawerHeader, Footer } from '../components/LayoutComponents';
import FooterContent from '../components/FooterContent';
import MenuButton from "./MenuButton";
import { appbarMenuButtonItems } from "./appbarMenuButtonItems";

export default function Layout({ children }) {
    const { keycloak, initialized } = useKeycloak();
    const theme = useTheme();
    const location = useLocation();
    const navigate = useNavigate();

    const baseNavItems = [
        {
            title: 'Homepage',
            icon: <HomeIcon sx={{ color: 'white' }} />,
            path: '/',
        },
        {
            title: 'About',
            icon: <InfoIcon sx={{ color: 'white' }} />,
            path: '/about',
        },
    ];

    const authenticatedNavItems = useMemo(() => {
        if (!keycloak.authenticated) return [];

        const roles = keycloak?.tokenParsed?.realm_access?.roles || [];
        const items = [];

        if (roles.includes('student')) {
            items.push({
                title: 'My Wallet',
                icon: <WalletIcon sx={{ color: 'white' }} />,
                path: '/wallet',
            });
        }
        if (roles.includes('course-manager')) {
            items.push({
                title: 'Control Panel',
                icon: <DashboardIcon sx={{ color: 'white' }} />,
                path: '/control-panel',
            });
        }
        if (roles.includes('recruiter')) {
            items.push({
                title: 'Candidate Search',
                icon: <PersonSearchIcon sx={{ color: 'white' }} />,
                path: '/candidate-search',
            });
        }
        return items;
    }, [keycloak.authenticated, keycloak?.tokenParsed]);

    const unauthenticatedNavItems = useMemo(() => {
        if (keycloak.authenticated) return [];

        return [
            {
                title: 'Sign In',
                icon: <LoginIcon sx={{ color: 'white' }} />,
                path: '/sign-in',
                onClick: () => keycloak.login(),
            },
            {
                title: 'Register',
                icon: <PersonAddIcon sx={{ color: 'white' }} />,
                path: '/register',
            },
        ];
    }, [keycloak.authenticated]);

    // Combine base, authenticated, and unauthenticated navigation items
    const navItems = useMemo(() => [
        ...baseNavItems,
        ...authenticatedNavItems,
        ...unauthenticatedNavItems,
    ], [baseNavItems, authenticatedNavItems, unauthenticatedNavItems]);

    const handleSignOut = () => {
        keycloak.logout({ redirectUri: window.location.origin + '/' });
    };

    // Redirect authenticated users from unauthenticated pages (e.g., Sign In, Register)
    useEffect(() => {
        const restrictedUnauthenticatedPaths = ['/sign-in', '/register'];
        if (keycloak.authenticated && restrictedUnauthenticatedPaths.includes(location.pathname)) {
            navigate('/'); // Redirect to homepage or any other appropriate route
        }
    }, [keycloak.authenticated, location.pathname, navigate]);

    return (
        <>
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: `calc(100vh - 60px)` }}>
                <CssBaseline />
                <AppBar position="fixed">
                    <Toolbar sx={{ py: { xs: 1, md: 1.5 }, minHeight: { xs: 'auto', md: 64 } }}>
                        <Grid container alignItems="center" spacing={2} sx={{ flexDirection: { xs: 'column', md: 'row' } }}>
                            {/* First row on mobile: Title and Welcome message */}
                            <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'space-between', md: 'flex-start' }, width: { xs: '100%', md: 'auto' } }}>
                                <Typography color={'white'} variant={'h6'}>CERISE Digital Wallet</Typography>

                                {keycloak.authenticated && (
                                    <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1 }}>
                                        <Typography
                                            sx={{ color: 'white', fontSize: '0.875rem' }}
                                        >
                                            Welcome, {keycloak?.tokenParsed?.preferred_username}
                                        </Typography>
                                        <MenuButton subLinks={appbarMenuButtonItems} signout={handleSignOut} />
                                    </Box>
                                )}
                            </Grid>

                            {/* Second row on mobile: Menu buttons and (on desktop) Welcome message */}
                            <Grid item xs={12} md={6} sx={{
                                ml: { md: 'auto' },
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                justifyContent: { xs: 'center', md: 'flex-end' },
                                width: { xs: '100%', md: 'auto' }
                            }}>
                                <Stack direction={'row'} spacing={1} alignItems="center" sx={{ flexWrap: 'wrap', justifyContent: { xs: 'center', md: 'flex-start' } }}>
                                    {navItems.map(menuItem => (
                                        <Button
                                            key={menuItem.path}
                                            onClick={() => menuItem.onClick ? menuItem.onClick() : navigate(menuItem.path)}
                                            startIcon={menuItem.icon}
                                            sx={{
                                                color: 'white',
                                                backgroundColor: location.pathname === menuItem.path ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                                                '&:hover': {
                                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                                },
                                                fontSize: { xs: '0.60rem', sm: '0.875rem' },
                                                padding: { xs: '4px 8px', sm: '6px 16px' }
                                            }}
                                        >
                                            {menuItem.title}
                                        </Button>
                                    ))}
                                </Stack>

                                {keycloak.authenticated && (
                                    <>
                                        <Divider
                                            orientation="vertical"
                                            flexItem
                                            sx={{
                                                borderColor: 'rgba(255, 255, 255, 0.5)',
                                                height: '24px',
                                                alignSelf: 'center',
                                                mx: 1,
                                                display: { xs: 'none', md: 'block' }
                                            }}
                                        />
                                        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
                                            <Typography
                                                style={{ color: 'white' }}
                                            >
                                                Welcome, {keycloak?.tokenParsed?.preferred_username}
                                            </Typography>
                                            <MenuButton subLinks={appbarMenuButtonItems} signout={handleSignOut} />
                                        </Box>
                                    </>
                                )}
                            </Grid>
                        </Grid>
                    </Toolbar>
                </AppBar>

                <Main sx={{ background: '#fefefe', flexGrow: 1 }}>
                    <DrawerHeader />
                    {children}
                </Main>
            </Box>

            <Footer sx={{ position: 'sticky', mt: 'auto' }}>
                <FooterContent />
            </Footer>
        </>
    );
}
