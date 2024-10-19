import React, { createElement, useState, useEffect } from 'react';
import { CircleRater } from "../helperViews/circleRater";
import { RatingFunctions } from 'applicantiq_core/Core/ratingFunctions';
import { HelperFunctions } from 'applicantiq_core/Core/helperFunctions';
import { RatingBulletPointsGenerator } from '../helperViews/ratingBulletsGenerator';
import { PaymentFrequency } from 'applicantiq_core/Core/job';
import { LocalStorageHelper } from 'applicantiq_core/Core/localStorageHelper';
import { DatabaseCalls } from 'applicantiq_core/Core/databaseCalls';
import { showError, showSuccess } from '../helperViews/notifications';
import glassdoorIcon from '../../../src/assets/images/glassdoor_icon.png';

export const JobViewJobTab = ({job, user, mainViewReloadFunc}) => {
    const [bulletPoints, setBulletPoints] = useState(null);
    const [jobSaved, setJobSaved] = useState(false);
    useEffect(()=>{
        const setJobSavedAsync = async() => {
            const jobExists = await LocalStorageHelper.jobExistsInLocalStorage(job.jobId)
            setJobSaved(jobExists);
        }
        const newBulletPoints = RatingBulletPointsGenerator.getRatingBulletPoints(job, user);
        setBulletPoints(newBulletPoints);
        setJobSavedAsync();
    }, [])
    return (
        <div className='p-3' style={{"height": "490px"}}>
            <div className='columns is-flex'>
                <div className='column is-half'>
                    <CircleRater rating={RatingFunctions.getRating(job, user.preferences)} size={160} thickness={5} circleThickness={15} fontSize={48} />
                </div>
                <div 
                className='column is-half'
                style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between"
                }}
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
            <p className='is-size-3 has-text-white has-text-centered p-2'>Job fit: <span style={{color: HelperFunctions.ratingToColor(RatingFunctions.getRating(job, user.preferences))}}>
                    {RatingFunctions.getJobRatingStr(RatingFunctions.getRating(job, user.preferences))}
                </span>
            </p>
            <div style={{
                display: "flex",
                width: "100%",
                justifyContent: "center",
                marginTop: "-10px"
            }}>
                {!jobSaved && <button 
                className='button is-link is-small'
                onClick={async ()=>{
                    try {
                        console.log("Adding Job");
                        console.log(job);
                        const reReadJob = await DatabaseCalls.sendMessageToAddUserJob(job.jobId);
                        console.log("Returned job of");
                        console.log(reReadJob);
                        LocalStorageHelper.addJob(reReadJob);
                        setJobSaved(true);
                        showSuccess("Job successfully saved!");
                    } catch (err) {
                        showError(err)
                    }
                    mainViewReloadFunc({force: true, showLatestJob: false});
                }}
                >
                    Save Job
                </button>}
                {jobSaved && <button 
                className='button is-focused is-small'
                onClick={()=>{window.open(`https://www.linkedin.com/jobs/view/${job.jobId}`)}}
                >
                    Visit Job On LinkedIn
                </button>}
            </div>
            <hr style={{margin: "5px", backgroundColor: "hsl(0deg 0% 33.33%)"}}/>
            <div className="columns" style={{ display: "flex"}}>
                <div className="column" style={{ flex: "1 1 50%" }}>
                    <p className='has-text-centered is-size-4' style={{ color: HelperFunctions.ratingToColor(1) }}>Pros</p>
                    <div style={{height: "140px", overflowY: "auto", overflowX: "hidden"}}>
                        {bulletPoints?.pros && bulletPoints.pros.map((pro, index) => (
                            <div key={index}>
                                {pro}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="column" style={{ flex: "1 1 50%" }}>
                    <p className='has-text-centered is-size-4' style={{ color: HelperFunctions.ratingToColor(0.1) }}>Cons</p>
                    <div style={{height: "140px", overflowY: "auto", overflowX: "hidden" }}>
                        {bulletPoints?.cons && bulletPoints.cons.map((con, index) => (
                            <div key={index}>
                                {con}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}


{/* <div className='job-view-rating-item'>
    <div style={{width: "100vw", display: "block"}}>
        <p className='p-2 has-text-white is-size-4 pb-4'><i class="fas fa-dollar" style={{padding: "10px"}}></i>Salary:</p>
        <div style={{height: "15px"}}>
            <ArrowRaterView width={300} rating={0.4} text={"$70,000"}/>
        </div>
        <p className='p-2 has-text-white is-size-6'><span style={{color: HelperFunctions.ratingToColor(0.2)}}>20%</span> Lower than your desired salary.</p>
    </div>
</div> */}