import React, { useState } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { CircleRater } from '../helperViews/circleRater';
import { RatingFunctions } from '../../../src/content/ratingFunctions';
import { showFullscreenPopup } from '../helperViews/popup';
import { JobView } from './jobView';
import { DatabaseCalls } from '../../../src/content/databaseCalls';
import { LocalStorageHelper } from '../../../src/content/localStorageHelper';
import { showError } from '../helperViews/notifications';
import { LatestJobView } from './latestJobView';

export const JobRowView = ({ job, user, resumeScore, reloadFunc }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showingDeletePopup, setShowingDeletePopup] = useState(false);
    // Toggle expanded state
    const toggleExpand = () => setIsExpanded(!isExpanded);
    // Animation for rotating the arrow
    const arrowAnimation = useSpring({
        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
        config: { tension: 200, friction: 20 },
    });
    // Animation for expanding/collapsing the view
    const expandAnimation = useSpring({
        height: isExpanded ? '170px' : '70px', // Expands to 150px when opened
        config: { tension: 200, friction: 20 },
    });
    const updateUserJob = async (updateJson) => {
        const updatedUserSpecificData = await DatabaseCalls.sendMessageToUpdateUserJob(job.jobId, updateJson)
        console.log("Got updated user data");
        console.log(updatedUserSpecificData);
        const updatedJob = job;
        updatedJob.userSpecificJobData = updatedUserSpecificData;
        const jobs = await LocalStorageHelper.readJobs();
        const updatedJobs = jobs.map(j => (j.jobId === updatedJob.jobId ? updatedJob : j));
        await LocalStorageHelper.saveJobs(updatedJobs);
        reloadFunc();
    }

    return (
        <>
        {/* begin popup */}
        <div 
        className={`popup ${showingDeletePopup ? 'show' : ''}`}
        style={{zIndex: "10000", padding: "10px", minHeight: "200px", height: "150px"}}
        >
            <p>{`Are you sure you want to delete ${job?.jobName ?? "this job"} at ${job?.company?.companyName ?? "company not found"}?`}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: "10px"}}>
                <button 
                className="button" style={{ margin: '0 10px' }}
                onClick={async ()=>{
                    await DatabaseCalls.sendMessageToDeleteUserJob(job.jobId);
                    await LocalStorageHelper.__sendMessageToBgScript({action: "storeData", key: "latestJob", value: null});
                    setShowingDeletePopup(false);
                    reloadFunc({force: true});
                }}
                >
                    Delete
                </button>
                <button 
                className="button" 
                style={{ margin: '0 10px' }}
                onClick={()=>setShowingDeletePopup(false)}
                >
                    Cancel
                </button>
            </div>
        </div>
        {/* end popup */}
        <animated.div className='job-row' style={expandAnimation}>
            <p className='job-row-title'>
                {job.jobName.length > 26 ? job.jobName.substring(0, 26) + "..." : job.jobName}
                {job?.userSpecificJobData?.isFavorite && (
                    <i className="fas fa-star ml-1" style={{ color: "#FFF700" }}></i>
                )}
                {job?.userSpecificJobData?.hasApplied && (
                    <i className="fas fa-check-circle ml-1" style={{ color: "rgb(0, 255, 0)" }}></i>
                )}
            </p>
            <hr className='job-row-job-name-divider' />
            <p className='job-row-subtitle'>
                {job.company.companyName.length > 26 ? job.company.companyName.substring(0, 26) + "..." : job.company.companyName}
            </p>

            {/* Clickable down arrow with rotation animation */}
            <animated.i 
                className="fa fa-angle-down job-row-open-icon" 
                style={arrowAnimation}
                onClick={toggleExpand}
            ></animated.i>

            <i className='fa-solid fa-briefcase job-row-resume-icon has-text-link absolute-hoverable-icon'>
                <div className="hover-text" style={{marginTop: "5px"}}>Job Score</div>
            </i>

            <div className='resume-rater-container'>
                <CircleRater rating={RatingFunctions.getRating(job, user.preferences)} size={40} thickness={2} circleThickness={5} />
            </div>
            <i className='fa-solid fa-address-book job-row-briefcase-icon has-text-link absolute-hoverable-icon'>
                <div className="hover-text" style={{marginTop: "5px"}}>Resume Score</div>
            </i>
            <div className='job-rater-container'>
                <CircleRater rating={(resumeScore ?? 0) / 100} size={40} thickness={2} circleThickness={5} />
            </div>

            {/* Expanding and collapsing view */}
            {isExpanded && (
                <div className='job-row-expanded-view'>
                    <ul style={{ listStyleType: 'disc', fontSize: "12px", marginLeft: "10px", marginBottom: "5px"}}>
                        <li>{job?.mode?.str ?? "No WFH Info"}</li>
                        {job.paymentBase !== 0 && job.paymentBase !== null &&
                            <li>{"$" + job.paymentBase + (job.paymentHigh ? ` - ${job.paymentHigh}`:"") + (job.paymentFreq.str === "yr" ? "K":"/hr")}</li>
                        }
                        {!job.paymentBase && <li>No Salary Info</li>}
                        <li>{job?.locationStr ?? "No location info"}</li>
                    </ul>
                    <div className='icon-container'>
                        <button 
                        className='button is-success is-small'
                        onClick={async () => {
                            const resumes = await LocalStorageHelper.readResumes();
                            if (!resumes.length){
                                //Makes sure a user uploads a resume first by putting the gate that makes them upload a resume first
                                showFullscreenPopup(LatestJobView, { job: job, user: user }, job.jobName, job.company.companyName, () => {});
                            } else {
                                showFullscreenPopup(JobView, { job: job, user: user }, job.jobName, job.company.companyName, () => {})
                            }
                        }}
                        >
                        View Job
                        </button>
                        <div className='icon-box'>
                            <div className='hoverable-icon-container'>
                                <i 
                                className={`${job?.userSpecificJobData?.isFavorite ? "fa" : "far"} fa-star icon`}
                                style={{color: "#FFF700", position: "static", fontSize: "16px"}}
                                onClick={ async ()=>{
                                    try {
                                        console.log("Clicked on is favorite...");
                                        const updateJson = {"isFavorite": !job?.userSpecificJobData?.isFavorite}
                                        updateUserJob(updateJson);
                                    } catch (err) {
                                        showError(err);
                                    }
                                }}
                                ></i> 
                                <div className="hover-text">Favorite</div>
                            </div>
                            <div className='hoverable-icon-container'>
                                <i 
                                className={`${job?.userSpecificJobData?.hasApplied ? "fa" : "far"} fa-check-circle icon`}
                                style={{color: "rgb(0, 255, 0)", position: "static", fontSize: "16px"}}
                                onClick={ async ()=>{
                                    try {
                                        console.log("Clicked on has applied...");
                                        const updateJson = {"hasApplied": !job?.userSpecificJobData?.hasApplied}
                                        updateUserJob(updateJson);
                                    } catch (err) {
                                        showError(err);
                                    }
                                }}
                                ></i> 
                                <div className="hover-text">Mark that you applied</div>
                            </div>
                            <div className='hoverable-icon-container'>
                                <i 
                                className="fa fa-x icon"
                                style={{color: "red", position: "static", fontSize: "16px"}}
                                onClick={()=>{setShowingDeletePopup(true)}}
                                ></i>
                                <div className="hover-text">Delete Job</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </animated.div>
        </>
    );
};