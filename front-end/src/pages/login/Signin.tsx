import { Login, School } from "@mui/icons-material";
import { Button, FormControl, FormGroup, TextField } from "@mui/material";
import React from "react";
import loginImage from "../../assets/montreal4k.jpg";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios, { AxiosResponse } from "axios";
import { io, Socket } from "socket.io-client";
import { GetUserResponse, LoginRequest, LoginResponse, User } from "models";
import Peer from "peerjs";

type LoginFormValues = {
    email: string;
    password: string;
    isErrored: boolean;
};

export type Props = {
    setUserState: (user: User, socket: Socket, peerConnection: Peer) => void;
};

const errorMessage: string = "E-mail or password incorrect. Please try again.";

export default function Signin(props: Props) {
    const redirect = useNavigate();
    const [currentFormValues, setFormValues] = useState<LoginFormValues>({
        email: "",
        password: "",
        isErrored: false,
    });

    const handleEmailChangedValue = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setFormValues({
            ...currentFormValues,
            isErrored: false,
            email: event.target.value,
        });
    };

    const handlePasswordChangedValue = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setFormValues({
            ...currentFormValues,
            isErrored: false,
            password: event.target.value,
        });
    };

    const handleEnterKeyPress = (event: React.KeyboardEvent) => {
        if (event.key === "Enter") {
            handleSubmit();
        }
    };

    const connectToServerWebsocket = (
        accessToken: string,
        peerID: string
    ): Promise<Socket> => {
        let url = "";

        if (process.env.REACT_APP_WEBSOCKET_SERVER_HOST !== undefined) {
            url = process.env.REACT_APP_WEBSOCKET_SERVER_HOST;
        }
        console.log(process.env.REACT_APP_WEBSOCKET_SERVER_HOST);
        url += "?accessToken=" + accessToken + "&peerID=" + peerID;

        return new Promise((resolve, reject) => {
            try {
                let connection = io(url);

                resolve(connection);
            } catch (err) {
                reject(err);
            }
        });
    };

    const connectToPeerServer = (): Promise<[Peer, string]> => {
        console.log(process.env.REACT_APP_PEERJS_HOST);
        let peerConnection = new Peer({
            port: parseInt(
                process.env.REACT_APP_PEERJS_PORT !== undefined
                    ? process.env.REACT_APP_PEERJS_PORT
                    : "3001"
            ),
            host: process.env.REACT_APP_PEERJS_HOST,
        });

        return new Promise((resolve) => {
            peerConnection.on("open", (thisPeerID) => {
                console.log(`logged in to peerjs server as ${thisPeerID}`);

                resolve([peerConnection, thisPeerID]);
            });
        });
    };

    // Get data when user clicks submit
    const handleSubmit = () => {
        axios
            .post<LoginRequest, AxiosResponse<LoginResponse>>(
                process.env.REACT_APP_BACKEND_API_HOST + "/api/user/login",
                {
                    email: currentFormValues.email,
                    username: "",
                    schoolID: "",
                    password: currentFormValues.password,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                }
            )
            .then(async (response) => {
                const [peerConnection, peerID] = await connectToPeerServer();
                const socket = await connectToServerWebsocket(
                    response.data.accessToken,
                    peerID
                );

                sessionStorage.setItem(
                    "accessToken",
                    response.data.accessToken
                );

                let moreUserDetails = await axios.get<
                    any,
                    AxiosResponse<GetUserResponse>
                >(
                    process.env.REACT_APP_BACKEND_API_HOST +
                        "/api/user/" +
                        response.data.userID,
                    {
                        timeout: 5000,
                        headers: {
                            Authorization: `Bearer ${response.data.accessToken}`,
                        },
                    }
                );

                sessionStorage.setItem("userID", String(response.data.userID));
                sessionStorage.setItem("username", response.data.username);
                sessionStorage.setItem("peerID", peerID);
                sessionStorage.setItem("email", moreUserDetails.data.email);
                sessionStorage.setItem("role", moreUserDetails.data.role);
                sessionStorage.setItem("roleID", moreUserDetails.data.roleID);
                sessionStorage.setItem(
                    "firstName",
                    moreUserDetails.data.firstName
                );
                sessionStorage.setItem(
                    "lastName",
                    moreUserDetails.data.lastName
                );

                let thisUser: User = {
                    id: response.data.userID.toString(),
                    name: response.data.username,
                    peerID: peerID,
                    accessToken: response.data.accessToken,
                    email: moreUserDetails.data.email,
                    firstName: moreUserDetails.data.firstName,
                    lastName: moreUserDetails.data.lastName,
                    role: moreUserDetails.data.role,
                    roleID: moreUserDetails.data.roleID,
                };

                props.setUserState(thisUser, socket, peerConnection);
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
        <div className="w-screen flex flex-row">
            <img src={loginImage} className="fixed"></img>
            <div
                className="min-w-[600px] bg-primary w-1/4 z-10 shadow-black shadow-2xl
                    flex flex-col items-center h-screen fixed overflow-y-auto overflow-x-hidden"
            >
                <div className="text-white flex flex-row mt-5 flow-up-animation">
                    <School className="text-5xl mt-5 mr-5"></School>
                    <h1 className="text-white font-jakarta-sans text-5xl mt-5 ml-1 mb-5 mr-5">
                        Study Hero
                    </h1>
                </div>
                <div className="w-5/6 bg-white rounded-xl m-40 flow-up-animation flex flex-col shadow-black shadow-md">
                    <FormGroup onKeyDown={handleEnterKeyPress}>
                        <FormControl className="m-10" variant="filled">
                            <h1 className="text-xl font-jakarta-sans mb-5">
                                Login
                            </h1>
                            <TextField
                                error={currentFormValues.isErrored}
                                label="E-mail"
                                className="font-jakarta-sans mb-5"
                                onChange={handleEmailChangedValue}
                            ></TextField>
                            <TextField
                                type="password"
                                error={currentFormValues.isErrored}
                                helperText={
                                    currentFormValues.isErrored
                                        ? errorMessage
                                        : ""
                                }
                                label="Password"
                                className="font-jakarta-sans mb-5"
                                onChange={handlePasswordChangedValue}
                            ></TextField>
                            <Button
                                className="w-[150px] h-[50px] flex flex-row bg-secondary transition ease-in-out
                            hover:-translate-y hover:bg-indigo-500 
                            duration-300"
                                variant="contained"
                                onClick={handleSubmit}
                            >
                                Sign In
                                <Login className="ml-5" />
                            </Button>
                        </FormControl>
                    </FormGroup>
                    <h1 className="font-jakarta-sans text-md mr-10 ml-10 mb-10">
                        Don't have an account? Click{" "}
                        <a href="/signup" className="underline text-blue-500">
                            here
                        </a>{" "}
                        to register.
                    </h1>
                </div>
            </div>
        </div>
    );
}
