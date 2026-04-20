import {Container, Grid, Typography, Box} from "@mui/material";

const FooterContent = () => {
    return (
        <Container maxWidth="xl">
            <Grid
                container
                spacing={3}
                py={4}
                alignItems="center"
                justifyContent="center"
            >
                <Grid item xs={12} md="auto">
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
                        }}
                    >
                        <img
                            style={{maxHeight: '50px', width: 'auto', border: '1px solid white'}}
                            src="/images/eu_logo.png"
                            alt="EU logo"
                        />
                    </Box>
                </Grid>

                <Grid item xs={12} md>
                    <Typography
                        variant="caption"
                        fontWeight={400}
                        textAlign="center"
                        display="block"
                        px={{xs: 2, md: 0}}
                    >
                        Funded by the European Union. Views and opinions expressed are however those of the author(s)
                        only and do not necessarily reflect those of the European Union or the European Education and
                        Culture Executive Agency (EACEA). Neither the European Union nor EACEA can be held responsible
                        for them.
                    </Typography>
                </Grid>
            </Grid>
        </Container>
    );
};

export default FooterContent;
