import Keycloak from "keycloak-js";

// Localhost deployment configuration
const my_keycloak = new Keycloak({
    "realm": "cerise",
    "url": process.env.REACT_APP_KC_URL,
    "clientId": process.env.REACT_APP_KC_CLIENT_ID || "dashboard_dev"
})

// Server deployment configuration
// const my_keycloak = new Keycloak({
//     "realm": "", // Replace with your values
//     "url": "", // Replace with your values
//     "clientId": "" // Replace with your values
// })

export default my_keycloak