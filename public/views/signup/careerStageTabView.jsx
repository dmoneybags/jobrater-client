import React, { createElement, useState, useEffect } from 'react';

export const CareerStageTabView = ({formData, setFormData, handleChange}) => {
    const [careerStage, setCareerStage] = useState(formData.desiredCareerStage);

    const handleCareerStageBtnClick = (event) => {
        event.preventDefault();
        setCareerStage(event.currentTarget.name);
    }
    useEffect(()=>{
        setFormData(prevFormData => ({
            ...prevFormData,
            desiredCareerStage: careerStage,
        }));
    }, [careerStage])
    return (
        <form style={{width: "100%"}}>
            <div className="field">
                <p className="control is-expanded">
                    <p style={{textAlign: "center", padding: "10px"}}>Career Stage</p>
                </p>
                {!formData.validationData.careerStageValid && <p class="help is-danger">Please select a career stage</p>}
                <hr style={{width: '80%', margin: "auto"}} />
            </div>
            <div class="field">
                <p class="control">
                    <button className={`button is-fullwidth ${careerStage === "Entry level" ? "is-focused":""}`} name="Entry level" onClick={(e) => {handleCareerStageBtnClick(e)}}>
                        <span>Entry Level</span>
                    </button>
                </p>
            </div>

            <div class="field">
                <p class="control">
                    <button className={`button is-fullwidth ${careerStage === "Mid-Senior level" ? "is-focused":""}`} name="Mid-Senior level" onClick={(e) => {handleCareerStageBtnClick(e)}}>
                        <span>Mid Level</span>
                    </button>
                </p>
            </div>

            <div class="field">
                <p class="control">
                    <button className={`button is-fullwidth ${careerStage === "Executive" ? "is-focused":""}`} name="Executive" onClick={(e) => {handleCareerStageBtnClick(e)}}>
                        <span>Senior Level</span>
                    </button>
                </p>
            </div>
        </form>
    )
}