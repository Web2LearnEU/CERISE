import React, {useEffect, useState} from 'react';
import {useNavigate} from "react-router-dom";
import {useKeycloak} from "@react-keycloak/web";
import CourseManagerControlPanelHeader from "../components/CourseManagerControlPanel/CourseManagerControlPanelHeader";
import CourseManagerCourses from "../components/CourseManagerControlPanel/CourseManagerCourses";

const CourseManagerControlPanel = () => {
    const navigate = useNavigate();
    const {keycloak, initialized} = useKeycloak();
    const [allowed, setAllowed] = useState(false);

    useEffect(() => {
        if (initialized) {
            if (keycloak.tokenParsed.realm_access.roles.includes("course-manager")) {
                setAllowed(true);
            } else {
                navigate("/");
            }
        }
    }, [initialized]);
    return (
        <>
            {allowed &&
                <>
                    <CourseManagerControlPanelHeader keycloak={keycloak}/>
                    <CourseManagerCourses/>
                </>}
        </>
    );
}

export default CourseManagerControlPanel;