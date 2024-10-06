import React, { createElement, useState, useEffect } from 'react';

export const LocationInputView = ({formData, setFormData, handleChange}) => {
    const [wontShareLocation, setSharesLocation] = useState(false);

    const handleCheckboxChange = (event) => {
        setSharesLocation(event.target.checked);
    }
    useEffect(()=>{
        setFormData(prevFormData => ({
            ...prevFormData,
            wontShareLocation: wontShareLocation,
        }));
    }, [wontShareLocation])
    return (
        <form style={{width: "100%"}}>
            <div className="field">
                <p className="control is-expanded">
                    <p style={{textAlign: "center", padding: "10px"}}>Location Data</p>
                </p>
                <hr style={{width: '80%', margin: "auto"}} />
            </div>
            <div className="control checkbox-item">
                <label 
                className="checkbox"
                checked={wontShareLocation}
                onChange={handleCheckboxChange}
                >
                    <input type="checkbox" />
                    I do not wish to share my location
                </label>
            </div>
            <div className="field mt-4">
                <label className="label">Street</label>
                <div className="control is-expanded">
                    <input
                        className={`input signup-input is-small ${formData.validationData.streetValid ? "":"is-danger"}`}
                        placeholder="123 Sesame Street"
                        name='street'
                        value={formData.street}
                        onChange={handleChange}
                        required
                        disabled={wontShareLocation}
                    />
                </div>
                {!formData.validationData.streetValid && <p class="help is-danger">Invalid street</p>}
            </div>
            <div className="field is-grouped is-grouped-centered">
                <div className="field">
                    <label className="label">City</label>
                    <div className="control is-expanded">
                        <input
                            className={`input is-small ${formData.validationData.cityValid ? "":"is-danger"}`}
                            type="text"
                            placeholder="San Jose"
                            name='city'
                            value={formData.city}
                            onChange={handleChange}
                            style={{width: "120px", height: "30px"}}
                            required
                            disabled={wontShareLocation}
                        />
                    </div>
                    {!formData.validationData.cityValid && <p class="help is-danger">Invalid city</p>}
                </div>
                <div className="field">
                    <label className="label">State</label>
                    <div className="control is-expanded">
                        <input
                            className={`input is-small ${formData.validationData.stateCodeValid ? "":"is-danger"}`}
                            placeholder="CA"
                            name='stateCode'
                            value={formData.stateCode}
                            onChange={handleChange}
                            style={{width: "40px", height: "30px"}}
                            maxLength={2}
                            required
                            disabled={wontShareLocation}
                        />
                    </div>
                    {!formData.validationData.stateCodeValid && <p class="help is-danger">Invalid state</p>}
                </div>
                <div className="field">
                    <label className="label">Zip Code</label>
                    <div className="control is-expanded">
                        <input
                            className={`input signup-input is-small ${formData.validationData.zipCodeValid ? "":"is-danger"}`}
                            placeholder="123456"
                            name='zipCode'
                            value={formData.zipCode}
                            onChange={handleChange}
                            required
                            disabled={wontShareLocation}
                        />
                    </div>
                    {!formData.validationData.zipCodeValid && <p class="help is-danger">Invalid zip code</p>}
                </div>
            </div>
        </form>
    )
}