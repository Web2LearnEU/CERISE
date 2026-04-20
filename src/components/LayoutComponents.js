import {styled} from "@mui/material/styles";
import MuiAppBar from "@mui/material/AppBar";

export const Main = styled('main')(({ theme }) => ({
    flexGrow: 1,
}));

export const AppBar = styled(MuiAppBar)(({ theme }) => ({
    background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
}));

export const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: 'flex-end',
}));

export const Footer = styled(MuiAppBar)(({ theme }) => ({
    background: `linear-gradient(to right, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
}));