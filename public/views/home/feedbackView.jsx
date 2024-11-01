import React, { createElement, useState } from 'react';
import { DatabaseCalls } from '@applicantiq/applicantiq_core/Core/databaseCalls';
import { HomeViewNavBar } from './homeViewNavBar';
import { showSuccess, showError } from '../helperViews/notifications';

export const FeedbackView = () => {
    const [stars, setStars] = useState(0);
    const [highlightedStars, setHighLightedStars] = useState(0);
    const [feedback, setFeedback] = useState("");
    const [jobRatingImprovements, setJobRatingImprovements] = useState("");
    const submit = async () => {
        if (!feedback.length || !stars){
            throw new Error("Please add some feedback and give us a rating");
        }
        await DatabaseCalls.sendMessageToSubmitFeedback({stars: stars, feedback: feedback, jobRatingImprovements: jobRatingImprovements});
    }
    return (
        <div className='main-container main-home-view'>
            <HomeViewNavBar/>
            <p className='has-text-white is-size-3' style={{ textAlign: "center", width: "100%" }}>Send Feedback</p>
            <form className='p-4'>
                <p style={{ textAlign: "center", width: "100%" }}>How has your experience with applicantIQ been?</p>
                <div style={{
                    display: "flex", 
                    width: "100%", 
                    justifyContent: "center", 
                    gap: "5px", 
                    marginTop: "20px", 
                    marginBottom: "30px"
                    }}>
                    <i 
                    className={`${(stars > 0 || highlightedStars > 0) ? "fa-solid": "fa-regular"} fa-lg fa-star has-text-link`}
                    style={{cursor: "pointer", opacity: highlightedStars > 0 && stars <= 0 ? 0.5 : 1}}
                    onClick={()=>{
                        setStars(1);
                    }}
                    onMouseEnter={() => setHighLightedStars(1)}
                    onMouseLeave={() => setHighLightedStars(0)}
                    >
                    </i>
                    <i 
                    className={`${(stars > 1 || highlightedStars > 1) ? "fa-solid": "fa-regular"} fa-lg fa-star has-text-link`}
                    style={{cursor: "pointer", opacity: highlightedStars > 1 && stars <= 1 ? 0.5 : 1}}
                    onClick={()=>{
                        setStars(2);
                    }}
                    onMouseEnter={() => setHighLightedStars(2)}
                    onMouseLeave={() => setHighLightedStars(0)}
                    >
                    </i>
                    <i 
                    className={`${(stars > 2 || highlightedStars > 2) ? "fa-solid": "fa-regular"} fa-lg fa-star has-text-link`}
                    style={{cursor: "pointer", opacity: highlightedStars > 2 && stars <= 2 ? 0.5 : 1}}
                    onClick={()=>{
                        setStars(3);
                    }}
                    onMouseEnter={() => setHighLightedStars(3)}
                    onMouseLeave={() => setHighLightedStars(0)}
                    >
                    </i>
                    <i 
                    className={`${(stars > 3 || highlightedStars > 3) ? "fa-solid": "fa-regular"} fa-lg fa-star has-text-link`}
                    style={{cursor: "pointer", opacity: highlightedStars > 3 && stars <= 3 ? 0.5 : 1}}
                    onClick={()=>{
                        setStars(4);
                    }}
                    onMouseEnter={() => setHighLightedStars(4)}
                    onMouseLeave={() => setHighLightedStars(0)}
                    >
                    </i>
                    <i 
                    className={`${(stars > 4 || highlightedStars > 4) ? "fa-solid": "fa-regular"} fa-lg fa-star has-text-link`}
                    style={{cursor: "pointer", opacity: highlightedStars > 4 && stars <= 4 ? 0.5 : 1}}
                    onClick={()=>{
                        setStars(5);
                    }}
                    onMouseEnter={() => setHighLightedStars(5)}
                    onMouseLeave={() => setHighLightedStars(0)}
                    >
                    </i>
                </div>
                <p style={{ textAlign: "center", width: "100%" }}>Type any feedback below:</p>
                <textarea 
                className="textarea mt-4 has-fixed-size" 
                placeholder="e.g. I'd like example feature" 
                maxLength={512}
                style={{marginBottom: "30px"}}
                value={feedback}
                onChange={(e)=>setFeedback(e.target.value)}
                >
                </textarea>
                <p style={{ textAlign: "center", width: "100%" }}>Is there anything we could add to the Job Rating to make it more accurate?</p>
                <input 
                className="input mt-4" 
                type='text'
                placeholder="e.g. Include the hours of the job" 
                maxLength={128}
                style={{marginBottom: "30px"}}
                value={jobRatingImprovements}
                onChange={(e)=>setJobRatingImprovements(e.target.value)}
                >
                </input>
                <div style={{display: "flex", justifyContent: "center", width: "100%"}}>
                    <button 
                    className='button is-link'
                    onClick={async (e)=>{
                        e.preventDefault();
                        try {
                            await submit();
                            showSuccess("Feedback submitted!");
                            setStars(0);
                            setFeedback("");
                            setJobRatingImprovements("");
                        } catch (err) {
                            showError(err);
                        }
                    }}
                    >
                        Submit
                    </button>
                </div>
            </form>
        </div>
    )
}