import React, { createElement, useState } from 'react';

export const WelcomePopupView = ({showingPopup, setShowingPopup}) => {
    return (
        <div className={`popup ${showingPopup ? 'show' : ''} select-resume-popup p-2`}>
            <p className='is-size-4 has-text-white mb-4'>Welcome To ApplicantIQ!</p>
            <p className='has-text-white mb-4'>Navigate to any job on LinkedIn and check the popup window to see data on the job's fit for you, your resumes fit to the job, and much more!</p>
            <button 
            className='button is-success'
            onClick={()=>{setShowingPopup(false)}}
            >
                Got it!
            </button>
        </div>
    )
}