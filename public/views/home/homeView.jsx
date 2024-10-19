import React, { createElement, useState, useEffect } from 'react';
import { useLocation } from "react-router-dom";
import { HomeViewNavBar } from './homeViewNavBar';
import { JobRowView } from './jobRowView';
import { WelcomePopupView } from './welcomePopupView';
import { LocalStorageHelper } from 'applicantiq_core/Core/localStorageHelper'
import { Spinner } from '../helperViews/loadingSpinner'
import { HelperFunctions } from 'applicantiq_core/Core/helperFunctions';
import { showFullscreenPopup } from '../helperViews/popup';
import { LatestJobView } from './latestJobView';
import { LoadingJobRowView } from './loadingJobRowView';
import { HomeViewSorter } from './homeViewSorter';
import { HomeViewFilterer } from './homeViewFilterer';

export const HomeView = () => {
    const [jobs, setJobs] = useState(undefined);
    const [user, setUser] = useState(undefined);
    const [jobsSet, setJobsSet] = useState(false);
    const [loadingJob, setLoadingJob] = useState(false);
    const [loadingJobName, setLoadingJobName] = useState('');
    const [loadingCompanyName, setLoadingCompanyName] = useState('');
    const [latestJob, setLatestJob] = useState(null);
    const [bestResumeScores, setBestResumeScores] = useState(null);
    const location = useLocation();
    const firstLogin = location.state?.firstLogin ?? false;
    const [showingWelcomePopup, setShowingWelcomePopup] = useState(firstLogin);

    const asyncLoadData = async ({force=false, showLatestJob=true} = {}) => {
        await HelperFunctions.downloadDataIfNecessary(force);
        const curJobs = await LocalStorageHelper.readJobs();
        console.log("Setting jobs to:");
        console.log(curJobs);
        setJobs(curJobs);
        const lsBestResumeScores = await LocalStorageHelper.__sendMessageToBgScript({action: "getData", key: "bestResumeScores"});
        console.log("Best Resume Scores");
        console.log(lsBestResumeScores.message);
        setBestResumeScores(lsBestResumeScores.message);
        const readUser = await LocalStorageHelper.getActiveUser();
        setUser(readUser);
        setJobsSet(true);
        const lsLatestJobResp = await LocalStorageHelper.__sendMessageToBgScript({action: "getData", key: "latestJob"});
        const lsLatestJob = lsLatestJobResp.message;
        setLatestJob(lsLatestJob);
        console.log("Our popup read the latest job of: ");
        console.log(lsLatestJob);
        if (lsLatestJob && showLatestJob){
            console.log("SHOWING LATEST JOB POPUP")
            showFullscreenPopup(LatestJobView, {job: lsLatestJob, user: readUser, mainViewReloadFunc: asyncLoadData}, lsLatestJob.jobName, 
                lsLatestJob.company.companyName, async ()=>{
                //Should we await?
                await LocalStorageHelper.__sendMessageToBgScript({action: "storeData", key: "latestJob", value: null});
            });
        }
        const isLoadingJobResp = await LocalStorageHelper.__sendMessageToBgScript({action: "getData", key: "loadingJob"});
        console.log("Response when checking if we're loading a job: ");
        console.log(isLoadingJobResp);
        setLoadingJob(isLoadingJobResp.message?.isLoading ?? false);
        setLoadingJobName(isLoadingJobResp.message?.jobName ?? '');
        setLoadingCompanyName(isLoadingJobResp.message?.companyName ?? '');
    };

    const handleMessage = (message, sender, sendResponse) => {
        console.debug("POPUP SCRIPT GOT MESSAGE OF");
        console.debug(message);
        if (message.action === 'NEW_JOB' || message.action === 'REFRESH') {
            setLoadingJob(false);
            setLoadingJobName('');
            setLoadingCompanyName('');
            sendResponse({ status: "success", message: "Recieved new job message" });
            console.log("Recieved message to show job!");
            //Message payload will have job but we can just reload
            if (message.action === 'REFRESH'){
                asyncLoadData({showLatestJob: false});
            } else {
                asyncLoadData();
            }
            
        }
        if (message.action === "NEW_JOB_LOADING"){
            sendResponse({ status: "success", message: "Recieved new job loading message" });
            console.log("Recieved message that new job is loading");
            setLoadingJob(true);
            setLoadingJobName(message.payload.jobName);
            setLoadingCompanyName(message.payload.companyName);
        }
    }

    useEffect(() => {
        chrome.runtime.onMessage.addListener(handleMessage);
        asyncLoadData();
    }, [])
    return (
        <div className='main-container has-navbar-fixed-top'>
            <HomeViewNavBar/>
            <WelcomePopupView showingPopup={showingWelcomePopup} setShowingPopup={setShowingWelcomePopup}/>
            <div className='job-row-container main-home-view'>
                <div style={{position: "sticky", top:"52px", zIndex: "9999"}}>
                    <HomeViewSorter jobs={jobs} setJobs={setJobs} user={user} bestResumeScores={bestResumeScores}/>
                    <HomeViewFilterer jobs={jobs} setJobs={setJobs} user={user}/>
                </div>
                {jobsSet && (
                    <>
                        {loadingJob && <LoadingJobRowView jobName={loadingJobName} companyName={loadingCompanyName}/>}
                        {!jobs || jobs.length === 0 ? 
                        <p className='no-jobs-text'>No Jobs Loaded</p>
                        :
                        (jobs.map((job) => (
                            job && (
                                <React.Fragment key={job.jobId}>
                                    <JobRowView 
                                        job={job} 
                                        user={user} 
                                        resumeScore={bestResumeScores ? bestResumeScores[job.jobId] : undefined} 
                                        reloadFunc={asyncLoadData} 
                                    />
                                    <hr className='job-row-divider'/>
                                </React.Fragment>
                            )
                        )))}
                    </>
                )}
                {!jobsSet && (
                    <div style={{paddingTop: "30px"}}>
                        <Spinner/>
                    </div>
                )}
            </div>
        </div>
    );
}