import React, { createElement, useState, useEffect } from 'react';
import { WindowingFunctions } from '../../../src/background/windowingFunctions'

export const PopupLinkView = () => {
    const [loadingWindow, setLoadingWindow] = useState(false);
    return (
        <div style={{width: "350px", height: "250px", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column"}}>
            <p className="is-size-2 has-text-white">
                applicantIQ <span><i className="fas fa-lightbulb"></i></span>
            </p>
            <p>Version 0.2.1</p>
            <p>&copy; Daniel DeMoney, All Rights Reserved</p>
            <button 
            className={`button is-focused m-3 is-large ${loadingWindow ? "is-loading":""}`}
            onClick={async ()=>{
                setLoadingWindow(true);
                await WindowingFunctions.createOrRefreshWindow();
                setLoadingWindow(false);
            }}
            >
                Open Popup
            </button>
        </div>
    )
}