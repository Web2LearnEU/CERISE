// StudentWallet.js
import { useKeycloak } from "@react-keycloak/web";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import StudentWalletHeader from "../components/StudentWallet/StudentWalletHeader";
import StudentWalletCourses from "../components/StudentWallet/StudentWalletCourses";
import StudentRequests from "../components/StudentWallet/StudentRequests";

function StudentWallet() {
    const navigate = useNavigate();
    const { keycloak, initialized } = useKeycloak();
    const [allowed, setAllowed] = useState(false);

    // State for requests and approved courses
    const [requests, setRequests] = useState([]);
    const [requestsError, setRequestsError] = useState(false);
    const [approvedCourses, setApprovedCourses] = useState([]);

    useEffect(() => {
        if (initialized) {
            if (keycloak.tokenParsed.realm_access.roles.includes("student")) {
                setAllowed(true);
                fetchRequestsAndCourses();
            } else {
                navigate("/");
            }
        }
    }, [initialized]);

    // Function to fetch requests and approved courses
    const fetchRequestsAndCourses = () => {
        const username = keycloak.idTokenParsed.preferred_username;
        axios.get(`/uc1/student/${username}/requests`)
            .then(response => {
                const approved = response.data.filter(course => course.is_approved);
                setRequests(response.data);
                setApprovedCourses(approved);
            })
            .catch(() => setRequestsError(true));
    };

    return (
        <>
            {allowed && <>
                <StudentWalletHeader keycloak={keycloak} />
                <StudentWalletCourses
                    keycloak={keycloak}
                    requests={requests}
                    approvedCourses={approvedCourses}
                    setApprovedCourses={setApprovedCourses}
                    refreshData={fetchRequestsAndCourses}
                />
                <StudentRequests
                    requestsError={requestsError}
                    requests={requests}
                />
            </>}
        </>
    );
}

export default StudentWallet;
