import React, { createElement, useState, useEffect } from 'react';
import { ArrowSliderSelectorView } from '../helperViews/arrowSliderSelectorView';

export const PreferencesTabView = ({formData, setFormData, handleChange}) => {
    const [desiredPay, setDesiredPay] = useState(formData.desiredPaySliderValue);
    const [desiredCommute, setDesireCommute] = useState(formData.desiredCommuteSliderValue);

    const [desiresOnsite, setDesiresOnsite] = useState(formData.desiresOnsite);
    const [desiresHybrid, setDesiresHybrid] = useState(formData.desiresHybrid);
    const [desiresRemote, setDesiresRemote] = useState(formData.desiresRemote);

    //function to show the pay amount in our pay slider 
    const desiredPayDisplay = (value) => {
        const min = formData.desiredPaymentFreq === 'yr' ? 30000 : 14;
        const max = formData.desiredPaymentFreq === 'yr' ? 400000 : 190;
        const displayValue = value * (max - min) + min;
        return  formData.desiredPaymentFreq === 'yr' ? "$" + String(Math.floor(displayValue / 1000)) + "K": "$" + Math.floor(displayValue);
    }

    //function to show the commute amount in our commute slider 
    const desiredCommuteDisplay = (value) => {
        const min = 10;
        const max = 90;
        const displayValue = value * (max - min) + min;
        return String(Math.floor(displayValue)) + " minutes each way"; 
    }

    // Update formData when desiredPay changes
    useEffect(() => {
        const min = formData.desiredPaymentFreq === 'yr' ? 30000 : 14;
        const max = formData.desiredPaymentFreq === 'yr' ? 400000 : 190;
        const value = desiredPay * (max - min) + min;
        setFormData(prevFormData => ({
            ...prevFormData,
            desiredPay: value,
            desiredPaySliderValue: desiredPay
        }));
    }, [desiredPay]);

    // Update formData when desiredCommute changes
    useEffect(() => {
        const min = 10;
        const max = 90;
        const value = desiredCommute * (max - min) + min;
        setFormData(prevFormData => ({
            ...prevFormData,
            desiredCommute: value,
            //little confusing... desiredCommute is actually the 0 to 1 value
            desiredCommuteSliderValue: desiredCommute
        }));
    }, [desiredCommute]);

    useEffect(() => {
        setFormData(prevFormData => ({
            ...prevFormData,
            desiresOnsite: desiresOnsite,
            desiresRemote: desiresRemote,
            desiresHybrid: desiresHybrid
        }));
    }, [desiresOnsite, desiresRemote, desiresHybrid])

    return (
        <form>
           <div className="field is-grouped">
                <p className="control is-expanded">
                    <p>Desired pay per:</p>
                </p>
                <p className="control">
                    <div className="select is-small">
                        <select
                        name="desiredPaymentFreq" // Ensure the name matches what is expected in handleChange
                        value={formData.desiredPaymentFreq} // Use the formData to set the value
                        onChange={handleChange} // Call the handleChange function on change
                        >
                            <option value="yr">year</option>
                            <option value="hr">hour</option>
                        </select>
                    </div>
                </p>
            </div>
            <ArrowSliderSelectorView value ={desiredPay} setValue={setDesiredPay} displayFunc={desiredPayDisplay} mainColor='white' bgColor='#23d160' />
            <div className='field'>
                <p className="control is-expanded">
                    <p>Preferred max commute length:</p>
                </p>
            </div>
            <ArrowSliderSelectorView value ={desiredCommute} setValue={setDesireCommute} displayFunc={desiredCommuteDisplay} mainColor='white' bgColor='#23d160' />
            <div className='field'>
                <p className="control is-expanded">
                    <p>Desired work from home modes:</p>
                </p>
            </div>
            <div class="checkboxes checkbox-selector">
                <div className="control checkbox-item">
                    <label class="checkbox">
                        <input 
                        type="checkbox" 
                        name="desiresOnsite"
                        checked={formData.desiresOnsite}
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
                        checked={formData.desiresHybrid}
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
                        checked={formData.desiresRemote}
                        onChange={(e) => {
                            console.log(e.target.checked);
                            setDesiresRemote(e.target.checked)
                        }}
                        />
                        Remote
                    </label>
                </div>
            </div>
        </form>
    )
}