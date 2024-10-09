import React, { createElement, useState, useEffect } from 'react';
import { JobViewJobTab } from './jobViewJobTab';
import { ResumeViewJobTab } from './jobViewResumeTab';
import { CompanyViewJobTab } from './jobViewCompanyTab';
import { LocationViewJobTab } from './jobViewLocationTab';

export const JobView = ({job, user, mainViewReloadFunc}) => {
    const [activeTab, setActiveTab] = useState("job");
    const [isLoadingComparison, setIsLoadingComparison] = useState(false);
    return (
        <div className='latest-job-container'>
            <div className="field has-addons job-nav-bar">
                <p className='control job-nav-bar-item'>
                    <button 
                    className={`button ${activeTab === "job" ? "is-focused":""}`} style={{width: "100%"}}
                    onClick={() => {
                        setActiveTab("job");
                    }}
                    >
                        Job
                    </button>
                </p>
                <p className={`control job-nav-bar-item ${activeTab === "resume" ? "is-focused":""}`}>
                    <button 
                    className={`button ${activeTab === "resume" ? "is-focused":""}`}
                    style={{width: "100%"}}
                    onClick={() => {
                        setActiveTab("resume");
                    }}
                    >
                        Resume
                    </button>
                </p>
                <p className={`control job-nav-bar-item ${activeTab === "company" ? "is-focused":""}`}>
                    <button 
                    className={`button ${activeTab === "company" ? "is-focused":""}`} 
                    style={{width: "100%"}}
                    onClick={() => {
                        setActiveTab("company");
                    }}
                    >
                        Company
                    </button>
                </p>
                <p className={`control job-nav-bar-item ${activeTab === "location" ? "is-focused":""}`}>
                    <button 
                    className={`button ${activeTab === "location" ? "is-focused":""}`} 
                    style={{width: "100%"}}
                    onClick={() => {
                        setActiveTab("location");
                    }}
                    >
                        Location
                    </button>
                </p>
            </div>
            {activeTab === "job" && <JobViewJobTab job={job} user={user} mainViewReloadFunc={mainViewReloadFunc}/>}
            {activeTab === "resume" && <ResumeViewJobTab job={job} user={user} isLoadingComparison={isLoadingComparison} setIsLoadingComparison={setIsLoadingComparison} mainViewReloadFunc={mainViewReloadFunc}/>}
            {activeTab === "company" && <CompanyViewJobTab job={job}/>}
            {activeTab === "location" && <LocationViewJobTab job={job} user={user}/>}
        </div>
    )
}