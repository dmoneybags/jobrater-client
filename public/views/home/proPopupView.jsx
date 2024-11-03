import { DatabaseCalls } from '@applicantiq/applicantiq_core/Core/databaseCalls';
import { FreeUserDataHelperFunctions } from '@applicantiq/applicantiq_core/Core/freeUserDataHelperFunctions'
import React, { createElement, useEffect, useState } from 'react';

export const ProPopupView = ({showingPopup, setShowingPopup, sender=""}) => {
    const [freeData, setFreeData] = useState(null);
    const [trialExpired, setTrialExpired] = useState(false);
    useEffect(()=>{
        DatabaseCalls.sendMessageToGetFreeUserData()
        .then((freeData) => {
            setFreeData(freeData);
            // Check if freeData.CreatedAt is 14 or more days ago
            const createdAtDate = new Date(freeData.CreatedAt);
            const currentDate = new Date();
            const diffInDays = (currentDate - createdAtDate) / (1000 * 60 * 60 * 24);

            if (diffInDays >= 14) {
                setTrialExpired(true);
            }
        })
    }, []);
    return (
        <div 
        className={`popup ${showingPopup ? 'show' : ''} select-resume-popup p-4`}
        style={{backgroundColor: "black"}}
        >
            <i 
            className='fas fa-x' 
            style={{
                position: "absolute", 
                left: "5%", 
                top: "5%",
                pointer: "cursor"
            }}
            onClick={()=>{
                setShowingPopup(false);
            }}></i>
            {freeData && <>
            <p className='job-view-rating-number is-size-3'
                style={{
                    '--color1': "var(--bulma-link)", 
                    '--color2': "var(--bulma-info)", 
                    fontSize: "24px", 
                    marginTop: "5%",
                    width: "100%",
                    textAlign: "center"
                }}
                >Upgrade To Pro</p>
            <hr style={{width: "80%", marginBlockStart: "0.25em", marginBlockEnd: "0.25em"}}/>
            {sender === "resumeRating" && <p className='is-size-7 pr-2 pl-2'>You've used all your free resume ratings for today. Upgrade to Pro and get unlimited ratings.</p>}
            {sender === "resumeUpload" && <p className='is-size-7 pr-2 pl-2'>Free users can only upload one resume at a time. Upgrade to Pro and get unlimited uploads.</p>}
            <div 
            className='content'
            style={{
                textAlign: "left",
                marginTop: "10px",
                marginBottom: "10px",
                color: "white"
            }}
            >
                <ul style={{fontSize: "14px"}}>
                    <li>Get unlimited resume ratings</li>
                    <li>Upload unlimited resumes</li>
                    <li>Unlimited access to commute data</li>
                    <li>Access to zip code specific rent and income data</li>
                    {FreeUserDataHelperFunctions.isDiscountable(freeData?.CreatedAt) && <li>$6.99 lifetime subscription if you sign up by {FreeUserDataHelperFunctions.getDateFromStrDate(freeData.CreatedAt, 7)}</li>}
                </ul>
                <div style={{width: "100%", display: "flex", justifyContent: "center"}}>
                    {!FreeUserDataHelperFunctions.isDiscountable(freeData?.CreatedAt) && <a className='button is-focused mt-2' href="https://applicantiq.org/checkout" target="_blank">Upgrade for $9.99/month</a>}
                    {FreeUserDataHelperFunctions.isDiscountable(freeData?.CreatedAt) && <a className='button is-focused mt-2' href="https://applicantiq.org/checkout" target="_blank">Upgrade for &nbsp;<span style={{textDecoration: "line-through"}}>$9.99</span><span className="gradient-text">&nbsp;$6.99</span>/month</a>}
                </div>
            </div>
            {sender === "resumeRating" && <p 
            className='is-size-7 pr-4 pl-4'
            style={{
                textAlign: "center"
            }}
            > 
                {!trialExpired && <>You've used your 3 daily resume ratings, {FreeUserDataHelperFunctions.getExpireOrResetStr(freeData)}</>}
                {trialExpired && <>Your 2 week introductory period has passed, upgrade to pro to keep using resume ratings</>}
            </p>}
            </>}
        </div>
    )
}