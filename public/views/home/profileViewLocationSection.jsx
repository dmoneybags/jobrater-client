import React, { createElement, useState, useEffect } from 'react';
import { DatabaseCalls } from 'applicantiq_core/Core/databaseCalls';
import { LocalStorageHelper } from 'applicantiq_core/Core/localStorageHelper';
import { validateLocation } from 'applicantiq_core/Core/userValidation'
import { showError, showSuccess } from '../helperViews/notifications';
import { validateLocationData } from 'applicantiq_core/Core/userValidation';
import { LocationObjectFactory } from 'applicantiq_core/Core/location'

export const ProfileViewLocationSection = ({user, setShowingId, reloadFunc}) => {
    const [wontShareLocation, setWontShareLocation] = useState(user.location === null);
    const [validationData, setValidationData] = useState({
        streetValid: true,
        cityValid: true,
        zipCodeValid: true,
        stateCodeValid: true,
    })
    const [street, setStreet] = useState(user?.location?.addressStr ?? '')
    const [city, setCity] = useState(user?.location?.city ?? '');
    const [zipCode, setZipCode] = useState(user?.location?.zipCode ?? '');
    const [stateCode, setStateCode] = useState(user?.location?.stateCode ?? '');
    const updateLocation = async () => {
        console.log("sending request to update preferences");
        const locationJson = {
            street: street,
            city: city,
            zipCode: zipCode,
            stateCode: stateCode
        }
        //copy to another object because I'm not sure 
        const validationDataCopy = validationData;
        //This function edits it in place
        validateLocationData(locationJson, validationDataCopy);
        console.log("validated data to: ");
        console.log(validationDataCopy);
        //set it back to the stateful var
        setValidationData({
            streetValid: validationDataCopy.streetValid, 
            cityValid: validationDataCopy.cityValid,
            zipCodeValid: validationData.zipCodeValid,
            stateCodeValid: validationData.stateCodeValid
        });
        //check if all values are true
        const valid = Object.values(validationDataCopy).every(value => Boolean(value));
        if (!valid){
            showError("Fix invalid fields");
            return;
        }

        console.log("Checking location...");
        let response;
        try {
            //call mapbox to validate location
            response = await validateLocation({
                "street": street,
                "city": city,
                "zipCode": zipCode,
                "stateCode": stateCode
            });
        } catch {
            showError("Couldn't load location, check fields and try again");
            return;
        }
        try {
            //Just taking latitude and longitude for now
            const rereadLocation = await DatabaseCalls.sendMessageToUpdateUserLocation({
                "addressStr": street,
                "city": city,
                "zipCode": zipCode,
                "stateCode": stateCode,
                "latitude": response["coordinates"][1], 
                "longitude": response["coordinates"][0]
            });
            const newUser = user;
            newUser.location = rereadLocation;
            await LocalStorageHelper.setActiveUser(newUser);
            reloadFunc();
            showSuccess("Updated Location");
        } catch (err) {
            showError(err);
        }
    }
    const deleteLocation = async () => {
        try {
            await DatabaseCalls.sendMessageToDeleteUserLocation();
            const newUser = user;
            newUser.location = null;
            await LocalStorageHelper.setActiveUser(newUser);
            reloadFunc();
            showSuccess("Updated Preferences");
        } catch (err) {
            showError(err);
        }
    }
    useEffect(() => {
        console.log("Setting Validation Data to: ");
        console.log(validationData);
    }, [validationData])
    useEffect(() => {
        console.log("Loading location input with view:");
        console.log(user);
    }, [])
    return (
        <div className='p-2'>
            <div className="control checkbox-item">
                <label 
                className="checkbox"
                >
                    <input 
                    type="checkbox" 
                    checked={wontShareLocation}
                    onChange={()=>setWontShareLocation(!wontShareLocation)}
                    />
                    I do not wish to share my location
                </label>
            </div>
            <div className="field mt-4">
                <label className="label">Street</label>
                <div className="control is-expanded">
                    <input
                        className={`input signup-input is-small ${validationData.streetValid ? "":"is-danger"}`}
                        name='street'
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        required
                        disabled={wontShareLocation}
                    />
                    {!validationData.streetValid && <p class="help is-danger">Invalid street</p>}
                </div>
            </div>
            <div className="field is-grouped is-grouped-centered">
                <div className="field">
                    <label className="label">City</label>
                    <div className="control is-expanded">
                        <input
                            className={`input signup-input is-small ${validationData.cityValid ? "":"is-danger"}`}
                            type="text"
                            placeholder=""
                            name='city'
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            required
                            disabled={wontShareLocation}
                        />
                    </div>
                    {!validationData.cityValid && <p class="help is-danger">Invalid city</p>}
                </div>
                <div className="field">
                    <label className="label">Zip Code</label>
                    <div className="control is-expanded">
                        <input
                            className={`input signup-input is-small ${validationData.zipCodeValid ? "":"is-danger"}`}
                            placeholder=""
                            name='zipCode'
                            value={zipCode}
                            onChange={(e) => setZipCode(e.target.value)}
                            required
                            disabled={wontShareLocation}
                        />
                        {!validationData.zipCodeValid && <p class="help is-danger">Invalid zip code</p>}
                    </div>
                </div>
                <div className="field">
                    <label className="label">State Code</label>
                    <div className="control is-expanded">
                        <input
                            className={`input signup-input is-small ${validationData.stateCodeValid ? "":"is-danger"}`}
                            placeholder=""
                            name='stateCode'
                            value={stateCode}
                            onChange={(e) => setStateCode(e.target.value)}
                            required
                            disabled={wontShareLocation}
                        />
                        {!validationData.stateCodeValid && <p class="help is-danger">Invalid state</p>}
                    </div>
                </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                <button 
                className='button is-danger m-1'
                onClick={()=>setShowingId(0)}
                >Cancel</button>
                <button 
                className='button is-info m-1'
                onClick={async ()=>{
                    if (wontShareLocation){
                        if (user.location){
                            deleteLocation();
                        } else {
                            showSuccess("Updated Preferences")
                        }
                    } else {
                        updateLocation();
                    }
                }}
                >
                Update</button>
            </div>
        </div>
    )
}