import React, { createElement, useState, useEffect } from 'react';
import { DatabaseCalls } from '@applicantiq/applicantiq_core/Core/databaseCalls';
import { showError, showSuccess } from '../helperViews/notifications';

export const EmailConfirmationPopup = ({email, waitingForEmailConfirmation, setWaitingForEmailConfirmation, attemptSignUp}) => {
    const [confirmationCode, setConfirmationCode] = useState('');
    return (
        <div className={`popup ${waitingForEmailConfirmation ? 'show' : ''} select-resume-popup p-2`}>
            <i className="fa-solid fa-x icon minimize-icon"
            style={{cursor: "pointer"}}
            onClick={()=>{
                setWaitingForEmailConfirmation(false);
            }}></i>
            <p className='has-text-white is-size-4'>Validate Email Address</p>
            <p className='is-size-6'>Check your email and enter the validation code below</p>
            <p className='has-text-link m-3' style={{cursor: "pointer"}} onClick={async ()=>{
                await DatabaseCalls.sendMessageToAddConfirmationCode(email);
                showSuccess("Resent Code");
                }}>Resend Code</p>
            <input 
            type="text" 
            className='input mt-5'
            maxLength={6}
            value={confirmationCode}
            onChange={(e)=>{setConfirmationCode(e.target.value)}}
            style={{width: "200px", textAlign: "center"}}
            />
            <button 
            className='button is-success is-large mt-6'
            onClick={async ()=>{
                try {
                    const resp = await DatabaseCalls.sendMessageToEvaluateConfirmationCode(email, confirmationCode);
                    attemptSignUp();
                } catch (err) {
                    showError(err);
                }
            }}
            >
            Submit
            </button>
        </div>
    )
}