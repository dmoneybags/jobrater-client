import React, { createElement, useState, useEffect } from 'react';

export const ResumeTabView = ({resumeComparison}) => {
    const [activeTab, setActiveTab] = useState("pros");
    const renderBullets = () => {
        switch (activeTab){
            case "pros":
                return (
                    <div className='resume-bp-container'>
                        {resumeComparison.pros.map((pro) => {
                        return <p className="rating-bp pro" style={{fontSize: "14px"}}>{pro}</p>
                        })}
                    </div>
                )
            case "cons":
                return (
                    <div className='resume-bp-container'>
                        {resumeComparison.cons.map((con) => {
                        return <p className="rating-bp con" style={{fontSize: "14px"}}>{con}</p>
                    })}
                    </div>
                )
            case "tips":
                return (
                    <div className='resume-bp-container'>
                        {resumeComparison.tips.map((tip) => {
                        return <p className="rating-bp tip" style={{fontSize: "14px"}}>{tip}</p>
                    })}
                    </div>
                )
        }
    }
    return (
        <div style={{marginTop: "25px", minHeight: "calc(100vh - 272px)", backgroundColor: 'black', marginLeft: "-7px", width: "100vw"}}>
            <div className="field has-addons job-nav-bar" style={{
                width: "100vw",
                margin: "auto",
                position: "relative"
            }}>
                <p className='control job-nav-bar-item'>
                    <button 
                    className={`button ${activeTab === "pros" ? "is-focused":""}`} style={{width: "100%"}}
                    onClick={() => {
                        setActiveTab("pros");
                    }}
                    >
                        Pros
                    </button>
                </p>
                <p className={`control job-nav-bar-item ${activeTab === "resume" ? "is-focused":""}`}>
                    <button 
                    className={`button ${activeTab === "cons" ? "is-focused":""}`}
                    style={{width: "100%"}}
                    onClick={() => {
                        setActiveTab("cons");
                    }}
                    >
                        Cons
                    </button>
                </p>
                <p className={`control job-nav-bar-item ${activeTab === "company" ? "is-focused":""}`}>
                    <button 
                    className={`button ${activeTab === "tips" ? "is-focused":""}`} 
                    style={{width: "100%"}}
                    onClick={() => {
                        setActiveTab("tips");
                    }}
                    >
                        Tips
                    </button>
                </p>
            </div>
            {renderBullets()}
        </div>
    )
}