import React, { createElement, useState, useEffect } from 'react';
import { CircleRater } from '../helperViews/circleRater';
import { RatingFunctions } from '../../../src/content/ratingFunctions';
import { HelperFunctions } from '../../../src/content/helperFunctions';
import { SelectResumeModal } from './selectResumeModal';
import glassdoorIcon from '../../../src/assets/images/glassdoor_icon.png';
import { LocalStorageHelper } from '../../../src/content/localStorageHelper';
import { JobView } from './jobView';
import { showFullscreenPopup } from '../helperViews/popup';
import { PaymentFrequency } from '../../../src/content/job';

export const LatestJobView = ({job, user}) => {
    const [showingPopup, setShowingPopup] = useState(false);
    return (
        <div className='latest-job-container p-3'>
            <SelectResumeModal showingPopup={showingPopup} setShowingPopup={setShowingPopup} callbackFunction={()=>showFullscreenPopup(JobView, {job: job, user: user}, job.jobName, job.company.companyName, ()=>{})}/>
            <p className='job-title mb-2' style={{color: 'white', fontSize: '20px'}}>Job Score:</p>
            <div className='columns is-flex'>
                <div className='column is-half'>
                    <CircleRater rating={RatingFunctions.getRating(job, user.preferences)} size={160} thickness={5} circleThickness={15} fontSize={48} />
                </div>
                <div className='column is-half'>
                    {job.mode && <div className='latest-job-item'>
                        <i 
                        className={`fa-solid ${RatingFunctions.getModeRating(job, user.preferences) ? "fa-check" : "fa-x"} fa-xl latest-job-item-icon`}
                        style={{color: RatingFunctions.getModeRating(job, user.preferences) ? "green" : "red"}}
                        >
                        </i>
                        <p className='latest-job-item-text'>{job.mode.str}</p>
                    </div>}
                    {!job.mode && <div className='latest-job-item'>
                        <i 
                        className={`fa-solid fa-question fa-xl latest-job-item-icon`}
                        style={{color: "yellow"}}
                        >
                        </i>
                        <p className='latest-job-item-text'>No WFH Info</p>
                    </div>}
                    {job.paymentBase !== 0 && job.paymentBase !== null && <div className='latest-job-item'>
                        <i 
                        className={`fa-solid fa-dollar-sign fa-xl latest-job-item-icon`}
                        style={{color: HelperFunctions.ratingToColor(RatingFunctions.getPaymentRating(job, user.preferences))}}
                        >
                        </i>
                        <p className='latest-job-item-text'>{"$" + job.paymentBase + (job.paymentHigh ? ` - ${job.paymentHigh}`:"") + (PaymentFrequency.getPerFrequencyStr(job.paymentFreq.str))}</p>
                    </div>}
                    {!job.paymentBase && <div className='latest-job-item'>
                        <i 
                        className={`fa-solid fa-question fa-xl latest-job-item-icon`}
                        style={{color: "yellow"}}
                        >
                        </i>
                        <p className='latest-job-item-text'>No Salary Info</p>
                    </div>}
                    {job.careerStage && <div className='latest-job-item'>
                        <i 
                        className={`fa-solid ${RatingFunctions.getCareerStageRating(job, user.preferences) ? "fa-check" : "fa-x"} fa-xl latest-job-item-icon`}
                        style={{color: RatingFunctions.getCareerStageRating(job, user.preferences) ? "green" : "red"}}
                        >
                        </i>
                        <p className='latest-job-item-text'>{job.careerStage}</p>
                    </div>}
                    <div className='latest-job-item'>
                        <i 
                        className={`fa-solid fa-user fa-xl latest-job-item-icon`}
                        // we add 0.01 below to not have the value be 0 and result in grey
                        style={{color: HelperFunctions.ratingToColor(RatingFunctions.getApplicantsRating(job) + 0.01)}}
                        >
                        </i>
                        <p className='latest-job-item-text'>{job.applicants + " Applicants"}</p>
                    </div>
                    <div className='latest-job-item'>
                        <img 
                        src={glassdoorIcon}
                        className='latest-job-item-icon'
                        style={{height: "24px", width: "24px"}}
                        >
                        </img>
                        <p className='latest-job-item-text'>{job.company.overallRating > 0.01 ? job.company.overallRating + "/5 Glassdoor": "No Glassdoor info"}</p>
                    </div>
                </div>
            </div>
            <p className='job-title' style={{color: 'white', fontSize: '20px'}}>Resume Score:</p>
            <div className='columns is-flex'>
                <div className='column is-half mt-2'>
                    <CircleRater rating={0} size={160} thickness={5} circleThickness={15} fontSize={48} />
                </div>
                <div className='column is-half' style={{marginTop: "-10px", fontSize: "14px"}}>
                    <p style={{color: 'white'}}>Pros:</p>
                    <hr style={{ width: '80%', margin: '0', backgroundColor: 'grey', borderWidth: "1px", opacity: 0.2}}/>
                    <div className='shining-rectangle' style={{width: "90px"}}></div>
                    <div className='shining-rectangle' style={{width: "110px"}}></div>
                    <div className='shining-rectangle' style={{width: "70px"}}></div>
                    <p style={{color: 'white'}}>Cons:</p>
                    <hr style={{ width: '80%', margin: '0', backgroundColor: 'grey', borderWidth: "1px", opacity: 0.2}}/>
                    <div className='shining-rectangle' style={{width: "100px"}}></div>
                    <div className='shining-rectangle' style={{width: "80px"}}></div>
                    <div className='shining-rectangle' style={{width: "70px"}}></div>
                    <p style={{color: 'white'}}>Tips:</p>
                    <hr style={{ width: '80%', margin: '0', backgroundColor: 'grey', borderWidth: "1px", opacity: 0.2}}/>
                    <div className='shining-rectangle' style={{width: "60px"}}></div>
                    <div className='shining-rectangle' style={{width: "80px"}}></div>
                    <div className='shining-rectangle' style={{width: "70px"}}></div>
                </div>
            </div>
            <div class="buttons is-centered" style={{marginTop: "-10px", marginBottom: "7px"}}>
                <button 
                id="evaluateButton" 
                className="button is-focused is-centered "
                onClick={async ()=>{
                    const resumes = await LocalStorageHelper.readResumes();
                    console.log(`Found resumes of ${resumes}`);
                    if (!resumes || !resumes.length){
                        console.log("Showing popup");
                        setShowingPopup(true);
                    } else {
                        console.log("Loading job view");
                        showFullscreenPopup(JobView, {job: job, user: user}, job.jobName, job.company.companyName, ()=>{})
                    }
                }}
                >
                    View Job
                </button>
            </div>
        </div>
    )
}