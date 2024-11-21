import React, { createElement, useState, useEffect } from 'react';
import { useLocation } from "react-router-dom";
import { HomeViewNavBar } from './homeViewNavBar';
import { JobRowView } from './jobRowView';
import { WelcomePopupView } from './welcomePopupView';
import { LocalStorageHelper } from '@applicantiq/applicantiq_core/Core/localStorageHelper'
import { Spinner } from '../helperViews/loadingSpinner'
import { HelperFunctions } from '@applicantiq/applicantiq_core/Core/helperFunctions';
import { showFullscreenPopup } from '../helperViews/popup';
import { LatestJobView } from './latestJobView';
import { LoadingJobRowView } from './loadingJobRowView';
import { HomeViewSorter } from './homeViewSorter';
import { HomeViewFilterer } from './homeViewFilterer';
import { DatabaseCalls } from '@applicantiq/applicantiq_core/Core/databaseCalls';
import { showError } from '../helperViews/notifications';
import { JobView } from './jobView';

export const getJobFromLocalStorage = async (jobId) => {
    //get the jobs from localstorage
    const jobs = await LocalStorageHelper.readJobs();
    for (const job of jobs){
      //look for our match
      if (jobId === job.jobId){
        return job;
      }
    }
    return null;
}

export const asyncSetLatestJob = async (newLatestJobId) => {
    //spaghetti code but basically first we check if the job is in local storage
    //if its a new job we first check if content script is loading it, else we send a request to read
    const jobExists = await LocalStorageHelper.jobExistsInLocalStorage(newLatestJobId);
    if (jobExists){
      const job = await getJobFromLocalStorage(newLatestJobId);
      if (!job) {
        console.error("Failed to get job from local storage, can't show latest job");
        return;
      }
      let latestJobMessage = {action: 'storeData', key: "latestJob", value: job };
      await LocalStorageHelper.__sendMessageToBgScript({latestJobMessage});
    } else {
      const isLoadingJobResp = await LocalStorageHelper.__sendMessageToBgScript({action: "getData", key: "loadingJob"});
      const isLoading = isLoadingJobResp.message?.isLoading ?? false;
      const currrentTabMessage = await LocalStorageHelper.__sendMessageToBgScript({action: "getData", key: "currentTab"});
      const currentTab = currrentTabMessage.message;
      if (!isLoading && currentTab){
        console.log("Sending message to content script to read");
        console.log(currentTab);
        chrome.tabs.sendMessage(currentTab, {
            type: "NEW",
            company: "LINKEDIN",
            jobId: newLatestJobId
        }).then(response => {
            console.log('Message sent successfully:', response);
        }).catch(error => {
            console.error('Error sending message to content script:', error);
        });
      }
    }
  }

export const HomeView = () => {
    const [jobs, setJobs] = useState(undefined);
    const [user, setUser] = useState(undefined);
    const [jobsSet, setJobsSet] = useState(false);
    const [loadingJob, setLoadingJob] = useState(false);
    const [loadingJobTimeout, setLoadingJobTimeout] = useState(null);
    const [loadingJobName, setLoadingJobName] = useState('');
    const [loadingCompanyName, setLoadingCompanyName] = useState('');
    const [latestJob, setLatestJob] = useState(null);
    const [bestResumeScores, setBestResumeScores] = useState(null);
    const location = useLocation();
    const firstLogin = location.state?.firstLogin ?? false;
    const [showingWelcomePopup, setShowingWelcomePopup] = useState(firstLogin);

    //You can pass first login through location state or search params
    //this is the search params way
    const isLoadingFirstTime = async () => {
        const urlParams = new URLSearchParams(window.location.search);
        const firstLoginParam = urlParams.get('firstLogin');
        const firstTime = firstLoginParam === 'true';
        setShowingWelcomePopup(firstTime);
    
        if (firstTime) {
            await HelperFunctions.downloadDataIfNecessary(true);
    
            // Remove 'firstLogin' parameter from the URL
            urlParams.delete('firstLogin');
            const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
            window.history.replaceState({}, document.title, newUrl);
        }
        
        return firstTime;
    };

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
        if (loadingJob){
            const timeoutId = setTimeout(() => {
                setLoadingJob(false);
                setLoadingJobName('');
                setLoadingCompanyName('');
                showError("Failed To Job Load");
            }, 15000)
            setLoadingJobTimeout(timeoutId);
        } else {
            if (loadingJobTimeout){
                clearTimeout(loadingJobTimeout);
                setLoadingJobTimeout(null);
            }
        }
    }, [loadingJob]);

    //The useEffect to go straight to resume evaluation if they click the button on the page
    useEffect(() => {
        if (!jobsSet) return;
        //need to define callback to update main view if user wants to save job, could be more modular
        const saveJobInLs = (job) => {
            const asyncSaveJob = async () => {
                try {
                    console.log("Adding Job");
                    console.log(job);
                    const reReadJob = await DatabaseCalls.sendMessageToAddUserJob(job.jobId);
                    console.log("Returned job of");
                    console.log(reReadJob);
                    LocalStorageHelper.addJob(reReadJob);
                } catch (err) {
                    showError(err)
                }
                asyncLoadData({force: true, showLatestJob: false});
            }
            asyncSaveJob();
        }

        //Get the params of the url
        const params = new URLSearchParams(window.location.search);
        console.log("PARAMS:");
        console.log(params);
        //Check if were going straight to evaluate resume
        if (params.get("evaluateResume")){
            console.log("EVALUATING RESUME");
            //Set the latest job to the id passed in the query string
            asyncSetLatestJob(params.get("evaluateResume"));
            //async wrapper function (We love that useEffects cant be async)
            const asyncShowPopup = async() => {
                //Get the job back from local storage
                const job = await getJobFromLocalStorage(params.get("evaluateResume"));
                //will happen if the job is still loading, if so its just one more click for the user
                if (!job){
                    console.warn("Job is still loading, showing regular popup");
                    return;
                }
                const user = await LocalStorageHelper.getActiveUser();
                //Remove evaluate resume because we're done with it
                params.delete('evaluateResume');
                const newUrl = `${window.location.pathname}?${params.toString()}`;
                window.history.replaceState({}, document.title, newUrl);
                //show the popup with forcing resume eval
                showFullscreenPopup(JobView, {job: job, user: user, mainViewReloadFunc: asyncLoadData, getResumeScore: true}, job.jobName, job.company.companyName, ()=>{
                    LocalStorageHelper.__sendMessageToBgScript({action: "storeData", key: "latestJob", value: null});
                    const promptSave = async () => {
                        const jobExists = await LocalStorageHelper.jobExistsInLocalStorage(job.jobId);
                        if (!jobExists){
                            asynchronousBlockingPopup(
                                `Save ${job.jobName} at ${job.company?.companyName ?? "no company loaded"}?`, 
                                "", 
                                "Save", 
                                ()=>{
                                    saveJobInLs(job);
                                }, 
                                "Exit", 
                                ()=>{});
                        }
                    }
                    promptSave();
                }, true)
            }
            asyncShowPopup();
        }
    }, [jobsSet])

    useEffect(() => {
        chrome.runtime.onMessage.addListener(handleMessage);
        //Not the prettiest but we need to make sure we download
        //the data from the server if its the users first time,
        //before we load the rest
        //Would prefer asyn await
        isLoadingFirstTime()
        .then((firstTime)=>{
            asyncLoadData({showLatestJob: !firstTime});
        })
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