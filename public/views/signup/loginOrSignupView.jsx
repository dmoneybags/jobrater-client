import React, { createElement, useState, useEffect, useReducer } from 'react';
import { LogoView } from '../logos/logoView';
import '../../../src/assets/css/signup.css'
import { PrivacyStatement } from '../footer/privacyStatement';
import { Link } from 'react-router-dom';
import { LoginFormView } from './loginFormView';
import { SignupFormView } from './signupFormView';

export const LoginOrSignupView = () => {
    const [isSigningIn, setIsSigningIn] = useState(false);
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    const handleSignInClick = () => {
        setIsSigningIn(true);
    };
    const handleLogInClick = () => {
        setIsLoggingIn(true);
    };
    return (
        <div>
            <LogoView/>
            <hr />
            {(!isSigningIn && !isLoggingIn) && <p className='tag-line'>
                <span className='typing-text'>Now the powers back in your hands...</span>
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
                {isSigningIn && <SignupFormView/>}
            </div>
            {(!isSigningIn && !isLoggingIn) && <PrivacyStatement/>}
        </div>
    )
}