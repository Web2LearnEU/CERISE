import React from 'react';
import ReactDOM from 'react-dom/client';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {ReactKeycloakProvider} from "@react-keycloak/web";
import my_keycloak from "./Keycloak";
import AppUnAuth from "./AppUnAuth";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
   ( window.location.pathname === '/register') ? (
            <ReactKeycloakProvider authClient={my_keycloak} initOptions={{}}>
                <React.StrictMode>
                    <BrowserRouter basename={''}>
                        <Routes>
                            <Route path={'/*'} element={<AppUnAuth/>}/>
                        </Routes>
                    </BrowserRouter>
                </React.StrictMode>
            </ReactKeycloakProvider>) :
        // Wrapping the application with ReactKeycloakProvider
        (<ReactKeycloakProvider authClient={my_keycloak}  initOptions={{}}>
            <React.StrictMode>
                <BrowserRouter basename={''}>
                    <Routes>
                        <Route path={'/*'} element={<App/>}/>
                    </Routes>
                </BrowserRouter>
            </React.StrictMode>
        </ReactKeycloakProvider>)
)
;

reportWebVitals();
