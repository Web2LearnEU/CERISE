import {useTheme} from '@mui/material/styles';
import {useLocation, useNavigate} from 'react-router-dom';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import CssBaseline from '@mui/material/CssBaseline';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

import HomeIcon from '@mui/icons-material/Home';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import LoginIcon from '@mui/icons-material/Login';

import {Main, AppBar, DrawerHeader, Footer} from '../components/LayoutComponents';
import FooterContent from '../components/FooterContent';
import {useKeycloak} from "@react-keycloak/web";

export default function LayoutUnAuth({children}) {
    const theme = useTheme();
    const location = useLocation();
    const navigate = useNavigate()
    const {keycloak} = useKeycloak()

    // Group your desired navigation items and their details here
    // You can apply checks and optional rendering based on authentication status, roles, etc. with custom functions (using the Keycloak instance)
    const navItems = [
        {
            title: 'Homepage',
            icon: <HomeIcon sx={{color: 'white'}} />,
            path: '/',
        },
        {
            title: 'Sign In',
            icon: <LoginIcon sx={{color: 'white'}} />,
            path: '/sign-in',
            onClick: () => keycloak.login(),
        },
        {
            title: 'Register',
            icon: <PersonAddIcon sx={{color: 'white'}}/>,
            path: '/register',
        },
    ];


    return (
        <>
            <Box sx={{display: 'flex', flexDirection: 'column', minHeight: `calc(100vh - 60px)`}}>
                <CssBaseline/>
                <AppBar position="fixed">
                    <Toolbar>
                        <Grid container alignItems="center" spacing={2}>
                            <Grid item>
                                <Typography color={'white'} variant={'h6'}>CERISE Digital Wallet</Typography>
                            </Grid>
                            
                            <Grid item sx={{ ml: 'auto' }}>
                                <Stack direction={'row'} spacing={1} alignItems="center">
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
                                            }}
                                        >
                                            {menuItem.title}
                                        </Button>
                                    ))}
                                </Stack>
                            </Grid>
                        </Grid>
                    </Toolbar>
                </AppBar>

                <Main sx={{background: '#fefefe', flexGrow: 1}}>
                    <DrawerHeader/>
                    {children}
                </Main>
            </Box>

            <Footer sx={{position: 'sticky', mt: 'auto'}}>
                <FooterContent />
            </Footer>
        </>
    );
}
