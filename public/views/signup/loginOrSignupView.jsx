import React, { createElement, useState, useEffect, useReducer } from 'react';
import { LogoView } from '../logos/logoView';
import '../../../src/assets/css/signup.css'
import { PrivacyStatement } from '../footer/privacyStatement';
import { Link } from 'react-router-dom';
import { LoginFormView } from './loginFormView';
import { SignupFormView } from './signupFormView';
import { WaitingForSignupView } from './waitingForSignupView';
import { WaitingForLoginView } from './waitingForLoginView';

export const LoginOrSignupView = () => {
    //Legacy
    const [isSigningIn, setIsSigningIn] = useState(false);
    //current
    const [showingSignUpPopup, setShowingSignUpPopup] = useState(false);
    const [showingLoginPopup, setShowingLoginPopup] = useState(false);
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    const handleSignInClick = () => {
        const signupUrl = 'https://applicantiq.org/signup';
        chrome.tabs.create({ url: signupUrl });
        setShowingSignUpPopup(true);
    };
    const handleLogInClick = () => {
        const loginUrl = 'https://applicantiq.org/login';
        chrome.tabs.create({ url: loginUrl });
        setShowingLoginPopup(true);
    };
    return (
        <div>
            <LogoView/>
            <WaitingForSignupView showingPopup={showingSignUpPopup} setShowingPopup={setShowingSignUpPopup}/>
            <WaitingForLoginView showingPopup={showingLoginPopup} setShowingPopup={setShowingLoginPopup}/>
            <hr />
            {(!isSigningIn && !isLoggingIn) && <p className='tag-line'>
                <span className='typing-text'>Now the power's back in your hands...</span>
            </p>}
            <div 
            className='auth-container'
            style={{
                justifyContent: (isSigningIn || isLoggingIn) ? "flex-start" : "center"
            }}
            >
                {(isSigningIn || isLoggingIn) && <i 
                class="fas fa-arrow-left"
                onClick={() => {
                    setIsLoggingIn(false);
                    setIsSigningIn(false);
                }}
                >
                </i>}
                {!isLoggingIn && <button 
                id="signinbutton" 
                onClick={handleSignInClick}
                className={`button ${isSigningIn ? "is-ghost are-small" : "is-link is-large"}  signup-btn`}>
                    Sign Up
                </button>}
                {!isSigningIn && <button 
                id="logininbutton"  
                onClick={handleLogInClick}
                className={`button ${isLoggingIn ? "is-ghost are-small has-text-primary" : "is-success is-large"} login-btn`}>
                    Log In
                </button>}   
                {isLoggingIn && <LoginFormView/>}
            </div>
            {(!isSigningIn && !isLoggingIn) && <PrivacyStatement/>}
        </div>
    )
}