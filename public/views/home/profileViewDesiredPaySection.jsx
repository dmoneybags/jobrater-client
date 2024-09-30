import React, { createElement, useState, useEffect } from 'react';
import { ArrowSliderSelectorView } from '../helperViews/arrowSliderSelectorView'
import { DatabaseCalls } from '../../../src/content/databaseCalls';
import { LocalStorageHelper } from '../../../src/content/localStorageHelper';
import { showError, showSuccess } from '../helperViews/notifications';

export const ProfileViewDesiredPaySection = ({user, setShowingId, reloadFunc}) => {
    //function to show the pay amount in our pay slider 
    const getSliderValueFromPay = (initialDesiredPay, initialDesiredPayFreq) =>{
        const min = initialDesiredPayFreq === 'yr' ? 30000 : 14;
        const max = initialDesiredPayFreq === 'yr' ? 400000 : 190;
        return (initialDesiredPay - min)/(max - min)
    }
    const [desiredPay, setDesiredPay] = useState(user.preferences.desiredPay)
    const [desiredPaySliderValue, setDesiredPaySliderValue] = useState(getSliderValueFromPay(user.preferences.desiredPay, user.preferences.desiredPaymentFreq.str));
    const [desiredPaymentFreq, setDesiredPaymentFreq] = useState(user?.preferences?.desiredPaymentFreq.str ?? "yr");

    const desiredPayDisplay = (value) => {
        const min = desiredPaymentFreq === 'yr' ? 30000 : 14;
        const max = desiredPaymentFreq === 'yr' ? 400000 : 190;
        const displayValue = value * (max - min) + min;
        return desiredPaymentFreq === 'yr' ? "$" + String(Math.floor(displayValue / 1000)) + "K": "$" + Math.floor(displayValue);
    }
    const updatePreference = async () => {
        try {
            const updateJson = {desiredPay: desiredPay, desiredPaymentFreq: desiredPaymentFreq}
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
        const min = desiredPaymentFreq === 'yr' ? 30000 : 14;
        const max = desiredPaymentFreq === 'yr' ? 400000 : 190;
        const value = desiredPaySliderValue * (max - min) + min;
        setDesiredPay(value);
    }, [desiredPaySliderValue]);
    return (
        <div className='p-2'>
            <div className="field is-grouped">
                <p className="control is-expanded">
                    <p>Desired pay per:</p>
                </p>
                <p className="control">
                    <div className="select is-small">
                        <select
                        name="desiredPaymentFreq" // Ensure the name matches what is expected in handleChange
                        value={desiredPaymentFreq} // Use the formData to set the value
                        onChange={(e) => setDesiredPaymentFreq(e.target.value)} // Call the handleChange function on change
                        >
                            <option value="yr">year</option>
                            <option value="hr">hour</option>
                        </select>
                    </div>
                </p>
            </div>
            <ArrowSliderSelectorView value ={desiredPaySliderValue} setValue={setDesiredPaySliderValue} displayFunc={desiredPayDisplay} mainColor='white' bgColor='#23d160' />
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