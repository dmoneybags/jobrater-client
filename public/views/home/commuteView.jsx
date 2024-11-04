import React, { createElement, useState, useEffect, useRef } from 'react';
import { RatingFunctions } from '@applicantiq/applicantiq_core/Core/ratingFunctions';
import { HelperFunctions } from '@applicantiq/applicantiq_core/Core/helperFunctions';
import { HorizontalBubbleRaterView } from '../helperViews/horizontalBubbleRaterView';

export const CommuteView = ({mapUrl, commuteData, user, job}) => {
    const [isMorning, setIsMorning] = useState(true);
    const getTrafficMinutes = () =>{
        if (isMorning){
            const trafficSeconds = commuteData.arrivingTrafficDuration.value - commuteData.arrivingDuration.value;
            return String(Math.abs(Math.floor(trafficSeconds/60)));
        }
        const trafficSeconds = commuteData.leavingTrafficDuration.value - commuteData.leavingDuration.value;
        return String(Math.abs(Math.floor(trafficSeconds/60)));
    }
    const getTrafficColors = (minutesInTraffic) => {
        const maxMinutes = 30
        const rating = (1 - Math.min(Number(minutesInTraffic)/maxMinutes, 1)) + 0.01
        return {"--color1": HelperFunctions.ratingToColor(rating), "--color2": HelperFunctions.ratingToColor(Math.min(rating + 0.1, 1))}
    }
    const getCommuteColors = (secondsInCommute) => {
        const maxMinutes = user.preferences.desiredCommute + 20;
        const rating = (1 - Math.min(Number(secondsInCommute/60)/maxMinutes, 1)) + 0.01
        return {"--color1": HelperFunctions.ratingToColor(rating), "--color2": HelperFunctions.ratingToColor(Math.min(rating + 0.1, 1))}
    }
    useEffect(()=>{
        console.log("loading commute view with data of");
        console.log(commuteData);
    },[])
    return <>
        <div style={{
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: "10px"
        }}>
            <p className='is-size-3 has-text-white'>Commute:</p>
            <button 
                className="button is-link" 
                onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${job.company.companyName}+${job.locationStr}`, "_blank")}
            >
                View on Google Maps
            </button>
        </div>
        <div id="map" style={{display: "flex", justifyContent: "center"}}>
            <img id="mapImage" alt="Map displaying directions" src={mapUrl}/>
        </div>
        <div style={{height: "300px", backgroundColor: 'black', marginLeft: "-7px", width: "100vw"}}>
            <div className="field has-addons job-nav-bar" style={{
                width: "100vw",
                margin: "auto",
                position: "relative"
            }}>
                <p className='control job-nav-bar-item' style={{width: "50vw"}}>
                    <button 
                    className={`button ${isMorning ? "is-focused":""}`} style={{width: "100%"}}
                    onClick={() => {
                        setIsMorning(true);
                    }}
                    >
                        <p className='has-text-white'>Morning</p>
                    </button>
                </p>
                <p className='control job-nav-bar-item' style={{width: "50vw"}}>
                    <button 
                    className={`button ${!isMorning ? "is-focused":""}`}
                    style={{width: "100%"}}
                    onClick={() => {
                        setIsMorning(false);
                    }}
                    >
                        <p className='has-text-white'>Evening</p>
                    </button>
                </p>
            </div>
            <div className='p-2'>
                <p className='is-size-5 has-text-white'>
                    <span className='is-size-4'>Time: </span>
                    <span className='job-view-rating-number is-size-4' 
                    style={getCommuteColors(isMorning ? commuteData.arrivingTrafficDuration.value : commuteData.leavingTrafficDuration.value)}>
                        {isMorning ? commuteData.arrivingTrafficDuration.text : commuteData.leavingTrafficDuration.text}
                    </span>
                </p>
                <p className='is-size-4 has-text-white'>Traffic Flow<div className='hoverable-icon-container'> 
                        <i className="fas fa-info-circle ml-1 mr-1" style={{fontSize: "12px"}}></i>
                        <div className="hover-text" style={{width: "200px", bottom: "100%"}}>Traffic Flow is the direction the commute goes relative to traffic. Going with traffic means you will be caught in traffic more often and going against traffic means you are less likely to be caught in traffic.</div>
                    </div>:&nbsp;
                    <span className={`
                    ${(isMorning ? commuteData.arrivingTrafficDirection: commuteData.leavingTrafficDirection) === "Against" ? "gradient-text":""}
                    ${(isMorning ? commuteData.arrivingTrafficDirection: commuteData.leavingTrafficDirection) === "With" ? "gradient-text-negative":""}
                    ${(isMorning ? commuteData.arrivingTrafficDirection: commuteData.leavingTrafficDirection) === "Neutral" ? "gradient-text-neutral":""}
                    `}>
                        {isMorning ? commuteData.arrivingTrafficDirection : commuteData.leavingTrafficDirection}
                    </span>
                </p>
                <p className='is-size-5'>
                    <span className='is-size-4 has-text-white'>
                        Traffic:
                    </span> on average adds 
                    <span className='job-view-rating-number is-size-4' style={getTrafficColors(getTrafficMinutes())}>&nbsp;{getTrafficMinutes()}&nbsp;</span> 
                    minutes
                </p>
            </div>
        </div>
    </>
}