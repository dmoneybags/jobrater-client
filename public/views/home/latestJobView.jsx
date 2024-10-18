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

export const LatestJobView = ({job, user, mainViewReloadFunc}) => {
    const [showingPopup, setShowingPopup] = useState(false);
    return (
        <div className='latest-job-container p-3'>
            <SelectResumeModal showingPopup={showingPopup} setShowingPopup={setShowingPopup} callbackFunction={()=>showFullscreenPopup(JobView, {job: job, user: user}, job.jobName, job.company.companyName, ()=>{})}/>
            <p className='job-title mb-2' style={{color: 'white', fontSize: '20px'}}>Job Score:</p>
            <div style={{display: "flex", alignItems: "center", flexDirection: "column"}}>
                <div>
                    <CircleRater rating={RatingFunctions.getRating(job, user.preferences)}  size={200} thickness={8} circleThickness={25} fontSize={64} />
                </div>
                <div 
                style={{width: "110px", whiteSpace: "nowrap", overflow: "visible"}}
                className='m-2 mb-6 mt-4'
                >
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
                    {job.paymentBase !== 0 && job.paymentBase !== null && job.paymentFreq?.str && <div className='latest-job-item'>
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
                    {/* <div className='latest-job-item'>
                        <img 
                        src={glassdoorIcon}
                        className='latest-job-item-icon'
                        style={{height: "24px", width: "24px"}}
                        >
                        </img>
                        <p className='latest-job-item-text'>{job.company.overallRating > 0.01 ? job.company.overallRating + "/5 Glassdoor": "No Glassdoor info"}</p>
                    </div> */}
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
                        showFullscreenPopup(JobView, {job: job, user: user, mainViewReloadFunc: mainViewReloadFunc}, job.jobName, job.company.companyName, ()=>{
                            LocalStorageHelper.__sendMessageToBgScript({action: "storeData", key: "latestJob", value: null});
                        })
                    }
                }}
                >
                    View Job
                </button>
            </div>
        </div>
    )
}