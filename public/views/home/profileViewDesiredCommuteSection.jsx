import React, { createElement, useState, useEffect } from 'react';
import { ArrowSliderSelectorView } from '../helperViews/arrowSliderSelectorView'
import { DatabaseCalls } from 'applicantiq_core/Core/databaseCalls';
import { LocalStorageHelper } from 'applicantiq_core/Core/localStorageHelper';
import { showError, showSuccess } from '../helperViews/notifications';

export const ProfileViewDesiredCommuteSection = ({user, setShowingId, reloadFunc}) => {
    const getSliderValueFromCommute = (initialDesiredCommute) => {
        const min = 10;
        const max = 90;
        return (initialDesiredCommute - min)/(max - min)
    }
    const [desiredCommute, setDesiredCommute] = useState(user.preferences.desiredCommute)
    const [desiredCommuteSliderValue, setDesiredCommuteSliderValue] = useState(getSliderValueFromCommute(user.preferences.desiredCommute))
    const desiredCommuteDisplay = (value) => {
        const min = 10;
        const max = 90;
        const displayValue = value * (max - min) + min;
        return String(Math.floor(displayValue)) + " minutes each way"; 
    }
    const updatePreference = async () => {
        try {
            const updateJson = {desiredCommute: desiredCommute}
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
    useEffect(() => {
        const min = 10;
        const max = 90;
        const value = desiredCommuteSliderValue * (max - min) + min;
        setDesiredCommute(value);
    }, [desiredCommuteDisplay]);
    return (
        <div className='p-2'>
            <div className='field'>
                <p className="control is-expanded">
                    <p>Preferred max commute length:</p>
                </p>
            </div>
            <ArrowSliderSelectorView value ={desiredCommuteSliderValue} setValue={setDesiredCommuteSliderValue} displayFunc={desiredCommuteDisplay} mainColor='white' bgColor='#23d160' />
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
