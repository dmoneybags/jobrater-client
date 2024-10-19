import React, { createElement, useState, useEffect, useRef } from 'react';
import { loadResume } from '../../../src/tests/debugView/loadMockResumes';
import { showError } from '../helperViews/notifications';
import { DatabaseCalls } from 'applicantiq_core/Core/databaseCalls';
import { LocalStorageHelper } from 'applicantiq_core/Core/localStorageHelper';

export const SelectResumeModal = ({showingPopup, setShowingPopup, callbackFunction}) => {
    const popupRef = useRef(null);
    const [uploadedResume, setUploadedResume] = useState(null);
    const [resumeName, setResumeName] = useState('');
    const [nameInvalid, setNameInvalid] = useState(false);
    const [fileInvalid, setFileInvalid] = useState(false);
    const [handlingSubmit, setHandlingSubmit] = useState(false);

    const handleFileChange = async (event) => {
        if (event.target.files.length > 0) {
            try {
                //Make our button show the loading
                const resume = await loadResume(event.target.files[event.target.files.length - 1]);
                if (resume.fileType !== "pdf"){
                    throw new Error("Only PDFs are accepted");
                }
                //set our state uploaded resume value to the resume uploaded
                //needed because we'll need it when we submit
                setUploadedResume(resume);
            } catch (err) {
                showError(err);
            }
        }
    };
    const handleSubmit = async () => {
        setFileInvalid(uploadedResume === null);
        console.log("Submitting resume with name" + resumeName);
        setNameInvalid(resumeName === '');
        if (uploadedResume === null || resumeName === ''){
            return;
        }
        setHandlingSubmit(true);
        try {
            uploadedResume.name = resumeName;
            console.log("sending resume to be added to db");
            console.log(uploadedResume.toJson());
            const finishedResume = await DatabaseCalls.sendMessageToAddResume(uploadedResume);
            console.log("added Resume")
            //add the resume in local storage for quick retrieval
            await LocalStorageHelper.addResume(finishedResume);
            setHandlingSubmit(false);
            callbackFunction();
        } catch (err) {
            showError(err);
            setHandlingSubmit(false);
        }
    }
    return (
        <div className={`popup ${showingPopup ? 'show' : ''} select-resume-popup p-2`} ref={popupRef}>
            <i class="fa-solid fa-x icon minimize-icon"
            onClick={()=>{
                popupRef.current.classList.remove('show');
                setShowingPopup(false);
            }}></i>
            <p className='has-text-success is-size-4 pt-1'>Resume Upload</p>
            <hr style={{width: "80%", height:"1px"}}/>
            <label className="custom-file-upload">
                <input
                    className="hidden-file-input"
                    type="file"
                    name="resume"
                    onChange={handleFileChange}
                />
                <span 
                id="evaluateButton" 
                className="button is-focused is-centered is-medium"
                >
                    Upload File
                </span>
            </label>
            <p className={`p-2 mb-2 ${fileInvalid ? "has-text-danger":""}`} style={{fontSize: "10px"}}>{fileInvalid ? "Please upload a file" : `File Uploaded: ${uploadedResume?.fileName ?? "None"}`}</p>
            <label className="label" htmlFor="firstName" style={{alignSelf: "flex-start", marginLeft: "20px"}}>Resume Name:</label>
            <div className="control is-expanded">
                <input
                    id="resume-name-input"
                    className={`input m-2 ${nameInvalid ? "is-danger":""}`}
                    value={resumeName}
                    onChange={(e)=>setResumeName(e.target.value)}
                    maxLength={50}
                    style={{width: "250px"}}
                    type="text"
                    placeholder="ex: Sales Focused"
                    required
                />
            </div>
            <button className={`is-success button m-5 is-medium ${handlingSubmit ? "is-loading" : ""}`} onClick={handleSubmit}>Submit</button>
        </div>
    )
}