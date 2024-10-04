import React, { createElement, useState, useEffect } from 'react';
import { HomeViewNavBar } from './homeViewNavBar';
import { LocalStorageHelper } from '../../../src/content/localStorageHelper';
import { Spinner } from '../helperViews/loadingSpinner'
import { HelperFunctions } from '../../../src/content/helperFunctions';
import { loadResume } from '../../../src/tests/debugView/loadMockResumes';
import { DatabaseCalls } from '../../../src/content/databaseCalls';
import { showError } from '../helperViews/notifications';
import { showFullscreenPopup } from '../helperViews/popup';
import { HighlightedResumeView } from '../helperViews/highlightedResumeView';

export const ResumesView = () => {
    const [resumes, setResumes] = useState(null);
    const [resumesLoaded, setResumesLoaded] = useState(false);
    const [uploadedResume, setUploadedResume] = useState(null);
    const [waitingForResumeReponse, setWaitingForResumeResponse] = useState(false);
    const [showingPopup, setShowingPopup] = useState(false);
    const [uploadedResumeName, setUploadedResumeName] = useState(null);
    const [nameInvalid, setNameInvalid] = useState(false);

    const asyncLoadData = async() =>{
        //Make sure our data is up to date
        await HelperFunctions.downloadDataIfNecessary();
        const resumes = await LocalStorageHelper.readResumes();
        setResumes(resumes);
        setResumesLoaded(true);
    };
    const handleFileChange = async (event) => {
        if (event.target.files.length > 0) {
            try {
                //Make our button show the loading
                setWaitingForResumeResponse(true);
                const resume = await loadResume(event.target.files[event.target.files.length - 1]);
                if (resume.fileType !== "pdf"){
                    throw new Error("Only PDFs are accepted");
                }
                //set our state uploaded resume value to the resume uploaded
                //needed because we'll need it when we submit
                setUploadedResume(resume);
                setShowingPopup(true);
            } catch (err) {
                //cleanup
                setUploadedResumeName('');
                setUploadedResume(null);
                setShowingPopup(false);
                setWaitingForResumeResponse(false);
                showError(err);
            }
        }
    };
    const handleResumeSubmit = async() => {
        try{
            //copy uploadedresume, we don't need to manipulate past this
            const resume = uploadedResume;
            //set our name from the input
            resume.name = uploadedResumeName;
            resume.isDefault = resumes.length === 0;
            console.log("sending resume to be added to db");
            console.log(resume.toJson());
            const finishedResume = await DatabaseCalls.sendMessageToAddResume(resume);
            console.log("added Resume")
            //add the resume in local storage for quick retrieval
            await LocalStorageHelper.addResume(finishedResume);
            await asyncLoadData();
        } catch (err) {
            showError(err);
        } finally {
            //cleanup
            setWaitingForResumeResponse(false);
            setShowingPopup(false);
            setUploadedResumeName('');
            setUploadedResume(null);
        }
    }
    const updateResumeName = (e) => {
        setUploadedResumeName(e.target.value);
    }
    const renderDefaultResume = (resumeId) => {
        console.log("Rendering Default Resume");
        const updatedItems = resumes.map(resume => 
            resume.id === resumeId 
                ? {...resume, isDefault: true}
                : {...resume, isDefault: false}
        )
        console.log(updatedItems);
        setResumes(updatedItems);
    }
    const getResumeDateStr = (resume) => {
        const dateUTC = new Date(resume.uploadDate);
        const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        return new Intl.DateTimeFormat('en-US', {
            timezone: userTimeZone,
            weekday: 'long',  // e.g., 'Monday'
            year: 'numeric',  // e.g., '2024'
            month: 'long',    // e.g., 'August'
            day: 'numeric'    // e.g., '27'
        }).format(dateUTC) ?? "No date found";
    }
    const deleteResume = async (resume) => {
        setResumesLoaded(false);
        try {
            await DatabaseCalls.sendMessageToDeleteResume(resume);
            const userData = await DatabaseCalls.getUserData();
            console.log("Read back user data of");
            console.log(userData);
            await LocalStorageHelper.setUserData(userData);
            const resumes = await LocalStorageHelper.readResumes();
            console.log("Got resumes from localStorage of");
            console.log(resumes);
            setResumes(resumes);
            setResumesLoaded(true);
        } catch (err) {
            showError(err);
            setResumesLoaded(true);
        }
    }
    useEffect(() => {
        asyncLoadData();
    }, [])
    return (
        <div className='main-container main-home-view'>
            {/* begin popup */}
            <div className={`popup ${showingPopup ? 'show' : ''}`}>
                <p>Enter a name for this resume</p>
                <input type="text" 
                className={`input ${nameInvalid ? "is-danger" : ""}`}
                style={{padding: "10px", margin: "10px"}}
                value = {uploadedResumeName}
                placeholder='ex: Systems Engineering Focused'
                onChange={updateResumeName}
                maxLength={50}
                required
                />
                <button class="button is-success is-dark" 
                onClick={() => {
                    setNameInvalid(uploadedResumeName === '' || !uploadedResumeName);
                    if (uploadedResumeName === '' || !uploadedResumeName){
                        return;
                    }
                    handleResumeSubmit();
                }}>
                    Submit
                </button>
            </div>
            {/* end popup */}
            <HomeViewNavBar/>
            <div className='m-3' style={{"overflow": "auto"}}>
                <div className='resume-header-container'>
                    <p className='is-size-3 has-text-white'>My Resumes</p>
                    <label className="custom-file-upload">
                        <input
                            className="hidden-file-input"
                            type="file"
                            name="resume"
                            onChange={handleFileChange}
                        />
                        <span className={`button is-success is-rounded ${waitingForResumeReponse ? "is-loading" : ""}`}>Upload Resume</span>
                    </label>
                </div>
                <hr />
                {resumesLoaded ? (
                    <div>
                        {resumes.length !== 0 ? (
                            resumes.map((resume) => (
                                <div key={resume.id} className='resume-row'>
                                    <i class="fa-solid fa-address-book resume-row-icon has-text-link fa-xl"></i>
                                    <div className='resume-row-text'>
                                        <p>{(resume.name != '' && resume.name ? resume.name : resume.fileName).substring(0, 36) +
                                        ((resume.name != '' && resume.name ? resume.name : resume.fileName).length >= 36 ? "..." : "")}</p>
                                        <p style={{fontSize: "10px"}}>Uploaded: {getResumeDateStr(resume)}</p>
                                    </div>
                                    <div className="resume-row-view-btn">
                                        <button 
                                        className={`button is-link is-small is-outlined is-rounded`}
                                        onClick={async ()=>{
                                            const fullResume = await DatabaseCalls.sendMessageToReadResume(resume.id);
                                            showFullscreenPopup(HighlightedResumeView, 
                                                {
                                                resumeComparison: null,
                                                resume: fullResume,
                                                height: 530,
                                                width: 400
                                                }, 
                                                fullResume.name ?? fullResume.fileName, "",
                                                () => {}, false);
                                        }}
                                        >
                                            View
                                        </button>
                                        <button 
                                        className={`button is-success is-small ${resume.isDefault ? "":"is-outlined"} is-rounded`}
                                        onClick={async ()=>{
                                            if (!resume.isDefault){
                                                try {
                                                    await DatabaseCalls.sendMessageToUpdateResume(resume.id, {isDefault: !resume.isDefault});
                                                    renderDefaultResume(resume.id);
                                                } catch (err) {
                                                    showError(err)
                                                }
                                            }
                                        }}
                                        >
                                            {resume.isDefault ? "Default":"Make Default"}
                                        </button>
                                    </div>
                                    <button 
                                    className="fas fa-times fa-circle-times fa-xl has-text-danger resume-row-delete"
                                    onClick={()=>{deleteResume(resume)}}
                                    ></button>
                                </div>
                            ))
                        ) : (
                            <div className="has-text-centered">
                                <p>No Resumes Loaded</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <Spinner />
                )}
            </div>
        </div>
    )
}