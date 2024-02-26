import React, { useState } from "react";
import { Button, TextField, Card, CardContent } from "@mui/material";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Container } from "@mui/system";
import { useNavigate } from "react-router-dom";
import axios, { AxiosResponse } from "axios";

interface SignupFormValues {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    password: string;
    isErrored: boolean;
}

export type Props = {};

type RegisterResponse = {
    accessToken: string;
    userID: number;
    username: string;
};

const errorMessage: string = "This email or username is already used.";

export default function Signup(props: Props) {
    const redirect = useNavigate();

    const emailRegex = new RegExp('^[a-zA-Z0-9._:$!%-]+@(concordia.ca|encs.concordia.ca|live.concordia.ca|ece.concordia.ca)$')

    const [currentFormValues, setFormValues] = useState<SignupFormValues>({
        firstName: "",
        lastName: "",
        username: "",
        email: "",
        password: "",
        isErrored: false,
    });

    const handleFirstNameChangeValue = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setFormValues({
            ...currentFormValues,
            isErrored: false,
            firstName: event.target.value,
        });
    };

    const handleLastNameChangeValue = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setFormValues({
            ...currentFormValues,
            isErrored: false,
            lastName: event.target.value,
        });
    };

    const handleUsernameChangeValue = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setFormValues({
            ...currentFormValues,
            isErrored: false,
            username: event.target.value,
        });

    };

    const handleEmailChangeValue = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setFormValues({
            ...currentFormValues,
            isErrored: false,
            email: event.target.value,
        });
    };

    const handlePasswordChangeValue = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setFormValues({
            ...currentFormValues,
            isErrored: false,
            password: event.target.value,
        });
    };

    // Get data when user clicks submit
    const handleSubmit = () => {
        console.log(
            process.env.REACT_APP_BACKEND_API_HOST + "/api/user/register"
        );
                    // call fucntion here
        // setMessagingUserName(event.target.value);
        // Validate the email
        if (!emailRegex.test(currentFormValues.email)) {
            setFormValues({
                ...currentFormValues,
                isErrored: true
            })
            return
        }

        type CreateSignupResponse = {
            email: string;
            firstName: string;
            lastName: string;
            username: string;
            schoolID: string;
            password: string;
        };



        axios
            .post<CreateSignupResponse, AxiosResponse<RegisterResponse>>(
                process.env.REACT_APP_BACKEND_API_HOST + "/api/user/register",
                {
                    firstName: currentFormValues.firstName,
                    lastName: currentFormValues.lastName,
                    username: currentFormValues.username,
                    email: currentFormValues.email,
                    password: currentFormValues.password,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                }
            )
            .then((response) => {
                sessionStorage.setItem(
                    "accessToken",
                    response.data.accessToken
                );
                sessionStorage.setItem("userID", String(response.data.userID));
                sessionStorage.setItem("username", response.data.username);
                redirect("/home");
            })
            .catch(function (error) {
                console.log(error);
                setFormValues({
                    ...currentFormValues,
                    isErrored: true,
                });
            });
    };

    return (
        <Container maxWidth="md">
            <Grid
                container
                direction="column"
                justifyContent="center"
                style={{ minHeight: "75vh" }}
            >
                <Card>
                    <CardContent>
                        <Typography
                            variant="h4"
                            marginBottom={2}
                            textAlign="center"
                        >
                            Sign up
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="First Name"
                                    onChange={handleFirstNameChangeValue}
                                    required
                                    fullWidth
                                    autoFocus
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Last Name"
                                    onChange={handleLastNameChangeValue}
                                    required
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    error={currentFormValues.isErrored}
                                    label="Username"
                                    onChange={handleUsernameChangeValue}
                                    required
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    error={currentFormValues.isErrored}
                                    label="Email Address"
                                    onChange={handleEmailChangeValue}
                                    helperText={
                                        currentFormValues.isErrored
                                            ? errorMessage
                                            : ""
                                    }
                                    required
                                    fullWidth
                                    autoComplete="email"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Password"
                                    onChange={handlePasswordChangeValue}
                                    type="password"
                                    required
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    sx={{ marginTop: 1 }}
                                    onClick={handleSubmit}
                                >
                                    Sign Up
                                </Button>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
                <div className="w-100 text center mt-2">
                    Already have an account?
                    <a href="/Signin">Log in</a>
                </div>
            </Grid>
        </Container>
    );
}
