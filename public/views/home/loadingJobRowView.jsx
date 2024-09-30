import React, { createElement, useState, useEffect } from 'react';
import { Spinner } from '../helperViews/loadingSpinner'

export const LoadingJobRowView = ({jobName, companyName}) => { 
    return (
    <div className='job-row'>
        <p className='job-row-title'>
            {jobName.length > 26 ? jobName.substring(0, 26) + "..." : jobName}
        </p>
        <hr className='job-row-job-name-divider' />
        <p className='job-row-subtitle'>
            {companyName.length > 26 ? companyName.substring(0, 26) + "..." : companyName}
        </p>

        <i className='fa-solid fa-briefcase job-row-resume-icon has-text-link absolute-hoverable-icon'>
            <div className="hover-text" style={{marginTop: "5px"}}>Job Score</div>
        </i>

        <div className='resume-rater-container'>
            <Spinner/>
        </div>
        <i className='fa-solid fa-address-book job-row-briefcase-icon has-text-link absolute-hoverable-icon'>
            <div className="hover-text" style={{marginTop: "5px"}}>Resume Score</div>
        </i>
        <div className='job-rater-container'>
            <Spinner/>
        </div>
    </div>
    )
}