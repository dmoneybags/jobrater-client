import React, { createElement, useState, useEffect, useRef } from 'react';
import { LocalStorageHelper } from '@applicantiq/applicantiq_core/Core/localStorageHelper';
import { HelperFunctions } from '@applicantiq/applicantiq_core/Core/helperFunctions';
import { DatabaseCalls } from '@applicantiq/applicantiq_core/Core/databaseCalls';
import { HighlightedResumeView } from '../helperViews/highlightedResumeView';
import { HorizontalBubbleRaterView } from '../helperViews/horizontalBubbleRaterView';
import { showError } from '../helperViews/notifications'
import { ResumeTabView } from './resumeTabView';
import { showFullscreenPopup } from '../helperViews/popup';
import { Spinner } from '../helperViews/loadingSpinner'
import { loadResume } from '../../../src/tests/debugView/loadMockResumes';

export const ResumeViewJobTab = ({job, user, isLoadingComparison, setIsLoadingComparison, mainViewReloadFunc}) => {
    const [resumes, setResumes] = useState(null);
    const [currentResume, setCurrentResume] = useState(null);
    const [currentResumeComparison, setCurrentResumeComparison] = useState(null);
    //Used to make sure rendering on load is clean, set to true after we fetch the data
    //on load
    const [loadedData, setLoadedData] = useState(false);
    //popup vars
    const [showingUploadResumePopup, setShowingUploadResumePopup] = useState(false);
    const [uploadedResumeName, setUploadedResumeName] = useState(null);
    const [isReplacing, setIsReplacing] = useState(false);
    const [reuploadedResume, setReuploadedResume] = useState(null);
    const [waitingForReupload, setWaitingForReupload] = useState(false);
    const fileInputRef = useRef(null);
    //end popup vars
    //We should always have a resume loaded at this point. If not it will error.
    const asyncLoadData = async ({force=false, changeResume=true} = {}) => {
        console.log("Loading resume view");
        await HelperFunctions.downloadDataIfNecessary(force);
        const rereadResumes = await LocalStorageHelper.readResumes();
        console.log("Loaded resumes of:");
        console.log(rereadResumes);
        setResumes(rereadResumes);
        if (changeResume){
            let defaultResume = null;
            for (let resume of rereadResumes){
                if(resume.isDefault){
                    defaultResume = resume;
                    setCurrentResume(defaultResume);
                    console.log("setting current resume to");
                    console.log(defaultResume);
                    break;
                }
            }
            if (!defaultResume){
                setCurrentResume(rereadResumes[0]);
            }
        }
    }
    const asyncLoadResumeComparison = async () => {
        console.debug("GETTING RESUME COMPARISON");
        console.debug("FOR JOB:");
        console.debug(job);
        //Can be null
        try {
            const resumeComparison = await DatabaseCalls.sendMessageToReadSpecificResumeComparison(currentResume.id, job.jobId);
            console.log("Setting resume comparison to");
            console.log(resumeComparison);
            setCurrentResumeComparison(resumeComparison);
            setLoadedData(true);
        } catch (err) {
            showError(err);
        }
    }
    //can pass an id to make sure a specific resume is read, if not we read the current resume
    const getResumeComparison = async ({id=null} = {}) => {
        setIsLoadingComparison(true);
        try {
            const resumeComparison = await DatabaseCalls.sendMessageToCompareResumeByIds(id ?? currentResume.id, job.jobId);
            console.log("Setting resume comparison to");
            console.log(resumeComparison);
            setCurrentResumeComparison(resumeComparison);
            setIsLoadingComparison(false);
            //force us to regrab data from server
            asyncLoadData({force: true, changeResume: false})
            const lsBestResumeScoresMessage = await LocalStorageHelper.__sendMessageToBgScript({action: "getData", key: "bestResumeScores"});
            const lsBestResumeScores = lsBestResumeScoresMessage.message;
            if (lsBestResumeScores[job.jobId]){
                if (resumeComparison.matchScore > lsBestResumeScores[job.jobId]){
                    lsBestResumeScores[job.jobId] = resumeComparison.matchScore;
                    console.log("Setting best resume scores of:");
                    console.log(lsBestResumeScores);
                    await LocalStorageHelper.__sendMessageToBgScript({action: "storeData", key: "bestResumeScores", value: lsBestResumeScores});
                    return;
                }
            }
            console.log("Setting best resume scores of:");
            console.log({
                ...lsBestResumeScores,
                [job.jobId]: resumeComparison.matchScore, // Correct way to set dynamic property keys
            });
            await LocalStorageHelper.__sendMessageToBgScript({action: "storeData", key: "bestResumeScores", value: {
                ...lsBestResumeScores,
                [job.jobId]: resumeComparison.matchScore, // Correct way to set dynamic property keys
            }});
            
        } catch (err){
            setIsLoadingComparison(false);
            showError(err);
        }
        mainViewReloadFunc({force: true, showLatestJob: false});
    }
    const showResumeParserPopoup = () => {
        showFullscreenPopup(HighlightedResumeView, 
            {
            resumeComparison: currentResumeComparison,
            resume: currentResume,
            height: 530,
            width: 400
            }, 
            "ATS Parsing View", "",
            () => {}, false);
    }
    const handleFileChange = async (event) => {
        console.log("Handling file upload");
        if (event.target.files.length > 0) {
            console.log("Got Files");
            try {
                const resume = await loadResume(event.target.files[0]);
                if (resume.fileType !== "pdf"){
                    throw new Error("Only PDFs are accepted");
                }
                //set our state uploaded resume value to the resume uploaded
                //needed because we'll need it when we submit
                setReuploadedResume(resume);
                console.log("Set uploaded resume to " + resume.fileName);
            } catch (err) {
                showError(err);
            }
        }
    };
    const handleNewResumeSubmit = async () => {
        if (!reuploadedResume){
            showError("Please upload a file");
            return;
        }
        try {
            setWaitingForReupload(true);
            let rereadResume = null;
            if (isReplacing){
                reuploadedResume.name = currentResume.name;
                rereadResume = await DatabaseCalls.sendMessageToReplaceResume(reuploadedResume, currentResume.id);
            } else {
                reuploadedResume.name = uploadedResumeName;
                rereadResume = await DatabaseCalls.sendMessageToAddResume(reuploadedResume);
            }
            //force a regrab
            await asyncLoadData({force: true});
            setCurrentResume(rereadResume);
            setWaitingForReupload(false);
            setShowingUploadResumePopup(false);
            //reset to defaults
            setReuploadedResume(null);
            setIsReplacing(false);
            setUploadedResumeName("");
            setShowingUploadResumePopup(false);
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = null;
            }
            //have to pass the id because the state isnt updated by then
            getResumeComparison({id: rereadResume.id});
        } catch (err) {
            setWaitingForReupload(false);
            showError(err);
        }
    }
    useEffect(()=>{
        asyncLoadData();
    }, [])
    useEffect(()=>{
        if (currentResume){
            console.log("Changed current resume to:");
            console.log(currentResume.name ?? currentResume.fileName);
            asyncLoadResumeComparison();
        }
    }, [currentResume])
    //Catch if user switches tabs mid comparison check
    useEffect(()=>{
        if (!isLoadingComparison && !currentResumeComparison && currentResume){
            console.debug("User switched tabs, checking if we loaded the comparison");
            asyncLoadResumeComparison();
        }
    }, [isLoadingComparison])
    return (
        <div className='pr-2 pl-2'>
            {/* begin popup */}
            <div 
            className={`popup ${showingUploadResumePopup ? 'show' : ''}`}
            style={{
                height: "350px", 
                width: "300px",
                boxShadow: "0 0 200px rgba(0, 0, 0, 0.912)"}}
            >
                <i className="fa-solid fa-x" 
                style={{position: "absolute", top: "15px", right: "15px", cursor: "pointer"}}
                onClick={()=>{
                    //reset to defaults
                    setReuploadedResume(null);
                    setIsReplacing(false);
                    setUploadedResumeName("");
                    setShowingUploadResumePopup(false);
                    // Reset file input
                    if (fileInputRef.current) {
                        fileInputRef.current.value = null;
                    }
                }}
                ></i>
                <p className='has-text-white is-size-3 m-3'>Re-Evaluate</p>
                <label className="custom-file-upload" style={{margin: "15px"}}>
                    <input
                        className="hidden-file-input"
                        type="file"
                        name="resume"
                        ref={fileInputRef}
                        onChange={(e)=>{handleFileChange(e)}}
                    />
                    <span className={`button is-success is-rounded`}>Upload Resume</span>
                </label>
                {reuploadedResume && <p>{reuploadedResume.fileName}</p>}
                <label className="checkbox p-2">
                    <input 
                        type="checkbox" 
                        checked={isReplacing} 
                        onChange={(e) => setIsReplacing(!isReplacing)} 
                    />
                    <p className='ml-2' style={{ display: 'inline' }}>
                        Replace current resume
                    </p>
                </label>
                {!isReplacing && <input type="text" 
                className='input'
                style={{padding: "10px", margin: "10px", width: "80%"}}
                value = {uploadedResumeName}
                placeholder='ex: IOS Focused'
                onChange={(e) => setUploadedResumeName(e.target.value)}
                maxLength={50}
                required
                />}
                <button class={`button is-success is-dark ${waitingForReupload ? "is-loading" : ""}`} onClick={handleNewResumeSubmit}>
                    Submit
                </button>
            </div>
            {/* end popup */}
            {currentResume && (
                <>
                <div style={{ display: "flex", width: "100%", alignItems: "center", flexDirection:"column"}}>
                    <div class="control has-icons-left">
                        <div className="select is-rounded is-small">
                        <select
                            value={currentResume?.name ?? currentResume?.fileName}  // Set the default value based on currentResume
                            onChange={(e) => {
                                const selectedResume = resumes[e.target.selectedIndex];
                                setCurrentResume(selectedResume);
                            }}
                        >
                            {resumes.map((resume, index) => (
                                <option key={index} value={resume.name ?? resume.fileName}>
                                    {resume.name ?? resume.fileName}
                                </option>
                            ))}
                        </select>
                        </div>
                        <span class="icon is-small is-left">
                            <i class="fas fa-address-book"></i>
                        </span>
                    </div>
                    {!currentResumeComparison && loadedData && <>
                    <button 
                    id="evaluateButton" 
                    className={`button is-focused is-centered is-large m-3 ${isLoadingComparison ? "is-loading":""}`}
                    onClick={()=>{
                        getResumeComparison();
                    }}
                    >
                        Evaluate Resume
                    </button>
                    <HighlightedResumeView resumeComparison={null} resume={currentResume} height={340} width={260}/>
                    </>}
                </div>
                {currentResumeComparison && 
                <>
                    <div style={{height: "100px", marginTop: "15px"}}>
                        <div 
                        className='resume-tab-match-score job-view-rating-number'
                        style={{
                            '--color1': HelperFunctions.ratingToColor(Math.max(0.01, currentResumeComparison.matchScore/100 - 0.15)),
                            '--color2': HelperFunctions.ratingToColor(Math.max(currentResumeComparison.matchScore/100, 0.01))
                        }}
                        >
                            {currentResumeComparison.matchScore}
                            <span style={{ fontSize: '24px' }}>%</span>
                        </div>
                        <div style={{display: "flex", justifyContent: "space-between"}}>
                            <div style={{width: "250px"}}>
                                <p className='has-text-white is-size-3'>
                                    Resume Match 
                                    <div className='hoverable-icon-container ml-2'> 
                                        <i className="fas fa-info-circle" style={{fontSize: "12px"}}></i>
                                        <div className="hover-text" style={{width: "200px"}}>The Resume Score is calculated using LLMs (Large Language models). Because of this even identical resumes may get a slightly variable score. Treat the score as a guide, not an absolute.</div>
                                    </div>
                                </p>
                            </div>
                        </div>
                        <HorizontalBubbleRaterView height={30} width={250} rating={currentResumeComparison.matchScore/100}/>
                    </div>
                    <div style={{display: "flex", justifyContent: "center", marginTop: "10px", gap: "20px"}}>
                        {/* <button className='button is-success' onClick={showResumeParserPopoup}> */}
                            {/* View ATS Parsing */}
                        {/* </button> */}
                        <button className='button is-link' onClick={()=>{setShowingUploadResumePopup(true)}}>
                            Reupload Resume
                        </button>
                    </div>
                    <ResumeTabView resumeComparison={currentResumeComparison}/>
                </>
                }
                </>
            )}
            {!currentResume && <Spinner/>}
        </div>
    )
}