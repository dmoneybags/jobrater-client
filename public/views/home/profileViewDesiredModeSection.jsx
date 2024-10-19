import React, { createElement, useState, useEffect } from 'react';
import { DatabaseCalls } from '@applicantiq/applicantiq_core/Core/databaseCalls';
import { LocalStorageHelper } from '@applicantiq/applicantiq_core/Core/localStorageHelper';
import { showError, showSuccess } from '../helperViews/notifications';

export const ProfileViewDesiredModeSection = ({user, setShowingId, reloadFunc}) => {
    const [desiresOnsite, setDesiresOnsite] = useState(user.preferences.desiresOnsite);
    const [desiresHybrid, setDesiresHybrid] = useState(user.preferences.desiresHybrid);
    const [desiresRemote, setDesiresRemote] = useState(user.preferences.desiresRemote);
    const updatePreference = async () => {
        if (!desiresOnsite && !desiresHybrid && !desiresRemote){
            showError("Please select one mode");
            return;
        }
        if (desiresOnsite && desiresHybrid && desiresRemote){
            showError("Please select your top two modes");
            return;
        }
        try {
            const updateJson = {
                desiresOnsite: desiresOnsite, 
                desiresHybrid: desiresHybrid,
                desiresRemote: desiresRemote
            }
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
            <div class="checkboxes checkbox-selector">
                <div className="control checkbox-item">
                    <label class="checkbox">
                        <input 
                        type="checkbox" 
                        name="desiresOnsite"
                        checked={desiresOnsite}
                        onChange={(e) => {
                            setDesiresOnsite(e.target.checked)
                        }}
                        />
                        On Site
                    </label>
                </div>
                <div className="control checkbox-item">
                    <label class="checkbox">
                        <input 
                        type="checkbox" 
                        name="desiresHybrid"
                        checked={desiresHybrid}
                        onChange={(e) => {
                            setDesiresHybrid(e.target.checked)
                        }}
                        />
                        Hybrid
                    </label>
                </div>
                <div className="control checkbox-item">
                    <label class="checkbox">
                        <input 
                        type="checkbox" 
                        name="desiresRemote"
                        checked={desiresRemote}
                        onChange={(e) => {
                            console.log(e.target.checked);
                            setDesiresRemote(e.target.checked)
                        }}
                        />
                        Remote
                    </label>
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