import React, { createElement, useState, useEffect } from 'react';
import { DatabaseCalls } from '@applicantiq/applicantiq_core/Core/databaseCalls';
import { LocalStorageHelper } from '@applicantiq/applicantiq_core/Core/localStorageHelper';
import { showError, showSuccess } from '../helperViews/notifications';

export const ProfileViewDesiredCareerStageSection = ({user, setShowingId, reloadFunc}) => {
    const [desiredCareerStage, setDesiredCareerStage] = useState(user.preferences.desiredCareerStage);
    const handleCareerStageBtnClick = (event) => {
        event.preventDefault();
        setDesiredCareerStage(event.currentTarget.name);
    }
    const updatePreference = async () => {
        try {
            const updateJson = {desiredCareerStage: desiredCareerStage}
            const newPreferences = await DatabaseCalls.sendMessageToUpdateUserPreferences(updateJson, user.userId);
            //copy
            const newUser = user;
            newUser.preferences = newPreferences;
            await LocalStorageHelper.setActiveUser(newUser);
            reloadFunc();
            showSuccess("Updated Preferences");
        } catch (err) {
            showError(err);
        }
    }
    return (
        <div className='p-2'>
            <div style={{ display: 'flex', gap: '10px' }}>
                <div class="field">
                    <p class="control">
                        <button className={`button ${desiredCareerStage === "Entry level" ? "is-focused":""}`} name="Entry level" onClick={(e) => {handleCareerStageBtnClick(e)}}>
                            <span>Entry Level</span>
                        </button>
                    </p>
                </div>

                <div class="field">
                    <p class="control">
                        <button className={`button ${desiredCareerStage === "Mid-Senior level" ? "is-focused":""}`} name="Mid-Senior level" onClick={(e) => {handleCareerStageBtnClick(e)}}>
                            <span>Mid Level</span>
                        </button>
                    </p>
                </div>

                <div class="field">
                    <p class="control">
                        <button className={`button is-fullwidth ${desiredCareerStage === "Executive" ? "is-focused":""}`} name="Executive" onClick={(e) => {handleCareerStageBtnClick(e)}}>
                            <span>Senior Level</span>
                        </button>
                    </p>
                </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                <button 
                className='button is-danger m-1'
                onClick={()=>setShowingId(0)}
                >Cancel</button>
                <button 
                className='button is-info m-1'
                onClick={updatePreference}
                >
                Update</button>
            </div>
        </div>
    )
}