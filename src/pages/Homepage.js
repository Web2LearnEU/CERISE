import HomepageItemFullWidth from "../components/Homepage/HomepageItemFullWidth";
import { homepageItems } from "../components/Homepage/homepageItems";
import { Container, Box, Typography } from "@mui/material";

// This is the component for the Homepage.
// It renders the content of homepageItems.js in separate sub-components.

const Homepage = () => {
    return (
        <div data-testid={"homepageOverall"}>
            {/* Hero Banner Section */}
            <Box sx={{
                backgroundColor: 'white',
                py: 4,
                textAlign: 'center'
            }}>
                <Container maxWidth="lg">
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        mb: 2
                    }}>
                        <img
                            src="/favicon.ico"
                            alt="CERISE Logo"
                            style={{
                                height: '120px',
                                width: '120px'
                            }}
                        />
                    </Box>
                    <Typography
                        variant="h5"
                        component="h1"
                        sx={{
                            color: 'rgba(65, 113, 63, 1)',
                            fontWeight: 400,
                            mb: 2
                        }}
                    >
                        Strengthening Higher Education through Green Skills Recognition
                    </Typography>
                    <Typography
                        variant="h3"
                        component="h2"
                        sx={{
                            color: 'rgba(65, 113, 63, 1)',
                            fontWeight: 700,
                            fontSize: { xs: '1.75rem', md: '2.5rem' }
                        }}
                    >
                        CERISE Digital Wallet
                    </Typography>
                </Container>
            </Box>

            {/* Homepage Items Section */}
            {homepageItems.map((service, index) => (
                <div data-testid={"homepageItem"} key={index}>
                    <HomepageItemFullWidth title={service.title} description={service.description} icon={service.icon}
                        image={service.image} link={service.link} index={index} key={service.id} />
                </div>
            ))}
        </div>
    );
}

export default Homepage;