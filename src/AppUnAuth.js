import {Route, Routes} from 'react-router-dom';
import {ThemeProvider, createTheme} from '@mui/material/styles';
import axios from "axios";

import Homepage from "./pages/Homepage";
import Register from "./pages/Register";
import LayoutUnAuth from "./Layout/LayoutUnAuth";

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
    axios.defaults.baseURL = process.env.REACT_APP_BE_URL

    return (
        <ThemeProvider theme={theme}>
            <LayoutUnAuth>
                <Routes>
                    <Route path="/register" element={<Register/>}/>
                </Routes>
            </LayoutUnAuth>
        </ThemeProvider>
    );
}

export default App;
