import React, { createElement, useState } from 'react';

export const WelcomePopupView = ({showingPopup, setShowingPopup}) => {
    const [slide, setSlide] = useState(0);
    return (
        <div className={`popup ${showingPopup ? 'show' : ''} select-resume-popup p-2`}>
            {slide === 0 && <p className='is-size-4 has-text-white mb-4 m-6'>Welcome To ApplicantIQ!</p>}
            {slide === 1 && <p className='is-size-4 has-text-white mb-4 m-6'>Don't be shy!</p>}
            {slide === 2 && <p className='is-size-4 has-text-white mb-4 m-6'>Free Tier Limits</p>}
            {slide === 3 && <p className='is-size-4 has-text-white mb-4 m-6'>Our Only Ask</p>}
            <div className='p-2' style={{height: "150px"}}>
                {slide === 0 && <p className='has-text-white mb-4'>Navigate to any job on LinkedIn and check this window to see data on the job's fit for you, your resumes fit to the job, and much more!</p>}
                {slide === 1 && <p className='has-text-white mb-4'>Any feedback is greatly appreciated. Click on the text bubble in the top left to submit feedback and help applicantIQ become better.</p>}
                {slide === 2 && <p className='has-text-white mb-4'>Your account is on the basic free tier. Free users are given 3 resume ratings per day which resets 24 hours after the first resume rating used the previous day. You can upgrade from the settings tab at any time.</p>}
                {slide === 3 && <p className='has-text-white mb-4'>If applicantIQ is able to help you in your job search, we only ask that you post on LinkedIn to let your network know. Our mission is to help as many people as possible find their next job.</p>}
            </div>
            {slide < 3 && <button 
            className='button is-success is-medium m-5'
            onClick={()=>{setSlide(slide + 1)}}
            >
                Next
            </button>}
            {slide === 3 && <button 
            className='button is-success is-medium m-5'
            onClick={()=>{setShowingPopup(false)}}
            >
                Got it!
            </button>}
        </div>
    )
}