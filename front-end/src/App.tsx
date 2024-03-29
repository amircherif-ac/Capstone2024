import React, { useState } from "react";
import Signup from "./pages/login/Signup";
import Signin from "./pages/login/Signin";
import { BrowserRouter as Router, Routes, Route, Navigate, redirect, useNavigate } from "react-router-dom";
import { Socket } from "socket.io-client";
import Peer from "peerjs";
import Dashboard from "./pages/dashboard/Dashboard";
import { User } from "models";
import {FontSizeProvider } from "./globalFontSlider";
import Layout from "./layout";


interface State {
    webSocket?: Socket
    peerConnection?: Peer
    thisUser?: User
    fontSize?: number; 
}

const RootAppComponent = () => {
    const [state, setState] = useState<State>({})

    const setUserState = (user: User, socket: Socket, peerConnection: Peer) => {
        setState({
            webSocket: socket,
            peerConnection: peerConnection,
            thisUser: user
        })
    }

    return (
       <FontSizeProvider>
        <Router>
        <Layout>
            <Routes>
                <Route path="/Signup" element={<Signup />}></Route>
                <Route path="/Signin" element={<Signin setUserState={setUserState.bind(this)} />}></Route>
                <Route path="/" element={<Navigate to="/signin" />}></Route>
                <Route path="/home" element={<Dashboard thisUser={state?.thisUser} webSocket={state?.webSocket} peerConnection={state?.peerConnection} />} />
            </Routes>
            </Layout>
        </Router>
       </FontSizeProvider>
    );

}

export default RootAppComponent;
