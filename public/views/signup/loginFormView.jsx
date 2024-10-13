import React, { createElement, useState, useEffect } from 'react';
import { login, getSalt } from '../../../src/content/auth';
import { showError } from '../helperViews/notifications';
import { useNavigate } from 'react-router-dom';
import { DatabaseCalls } from '../../../src/content/databaseCalls';
import { LocalStorageHelper } from '../../../src/content/localStorageHelper';
import { ForgotPasswordPopup } from './forgotPasswordPopup'

export const LoginFormView = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [waitingForLogIn, setWaitingForLogIn] = useState(false);
    const [validEmail, setValidEmail] = useState(true);
    const [showingForgotPassword, setShowingForgotPassword] = useState(false);
    //redirecting to home
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        //on each change set our form data values
        setFormData({ ...formData, [name]: value });
        const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
        setValidEmail(emailRegex.test({ ...formData, [name]: value }["email"]));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const salt = await getSalt(formData["email"]);
            //assuming the resolution will always be success, if any other resolutions are added this
            //could break (only resolve on accurate login)
            await login(formData["email"], formData["password"], salt);
            //Have to clear expiration time and force client to regrab
            await LocalStorageHelper.__sendMessageToBgScript({ action: "storeData", key: "userDataLastGrabbed", value: 0});
            console.log("Logged in! redirecting...");
            // Navigate to the current path, forcing a reload
            navigate("/", { replace: true });
            // Force reload
            window.location.reload();
        } catch (err) {
            showError(err);
            return;
        }
    };
    return (
        <>
        <ForgotPasswordPopup showingForgotPassword={showingForgotPassword} setShowingForgotPassword={setShowingForgotPassword}/>
        <form onSubmit={handleSubmit}>
            <div className="field">
                <label className="label" htmlFor="email">Email</label>
                <div className="control">
                    <input
                        className="input"
                        type="email"
                        id="email"
                        name="email"
                        placeholder="Email input"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>
            </div>
            {!validEmail && <p class="help is-danger">This email is invalid</p>}
            <div className="field">
                <label className="label" htmlFor="password">Password</label>
                <div className="control">
                    <input
                        className="input"
                        type="password"
                        id="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>
            </div>
            <p 
            className='has-text-link m-3' 
            style={{cursor: "pointer", textAlign: "center"}} 
            onClick={async ()=>{setShowingForgotPassword(true)}}>
                Forgot Password
            </p>
        </form>
        <button 
        className={`button is-success centered-btn ${waitingForLogIn ? 'is-loading' : ''}`}  
        onClick={async (e) => {
            setWaitingForLogIn(true);
            handleSubmit(e);
            setWaitingForLogIn(false);
        }}>
            Submit
        </button>
        </>
    )
}