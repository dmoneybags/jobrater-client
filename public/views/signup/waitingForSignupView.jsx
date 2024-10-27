import React, { createElement, useState } from 'react';

export const WaitingForSignupView = ({showingPopup, setShowingPopup}) => {
    return (
        <div 
        className={`popup ${showingPopup ? 'show' : ''} select-resume-popup p-4`}
        >
            <i 
            className='fas fa-x' 
            style={{
                position: "absolute", 
                left: "5%", 
                top: "5%",
                cursor: "pointer"
            }}
            onClick={()=>{
                setShowingPopup(false);
            }}></i>
            <p className='has-text-white is-size-4'
                style={{
                    fontSize: "24px", 
                    marginTop: "5%",
                    width: "100%",
                    textAlign: "center"
                }}
                >Waiting for signup completion...</p>
            <hr style={{width: "80%", marginBlockStart: "0.25em", marginBlockEnd: "0.25em"}}/>
            <p className='mb-3'>Complete the signup flow in the opened webpage</p>
            <div className="spinner-container">
                <div className="spinner" style={{width: "150px", height: "150px"}}></div>
            </div>
            <button 
            className='button is-link mt-3' 
            style={{width: "200px", textWrap: "wrap"}}
            onClick={()=>{
                const signupUrl = 'https://applicantiq.org/signup';
                chrome.tabs.create({ url: signupUrl });
            }}
            >
                Click here to reopen signup window
            </button>
        </div>
    )
}