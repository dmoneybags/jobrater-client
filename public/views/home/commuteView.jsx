import React, { createElement, useState, useEffect, useRef } from 'react';
import { RatingFunctions } from '../../../src/content/ratingFunctions';
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
    useEffect(()=>{
        console.log("loading commute view with data of");
        console.log(commuteData);
    },[])
    const gradientColorStyles = isMorning
    ? {}
    : { "--color1": "#6500FF", "--color2": "#2800FF" };
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
        <div id="map">
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
                        <p className='job-view-rating-number'>Morning</p>
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
                        <p className='job-view-rating-number' style={{"--color1": "#6500FF", "--color2": "#00EFFF"}}>Evening</p>
                    </button>
                </p>
            </div>
            <div className='p-2'>
                <p className='is-size-5'><span className='is-size-4'>Traffic:</span> on average adds <span className='job-view-rating-number is-size-4' style={gradientColorStyles}>{getTrafficMinutes()}</span> minutes</p>
                <p className='is-size-5'>
                    <span className='is-size-4'>Time: </span>
                    <span className='job-view-rating-number is-size-4' 
                    style={gradientColorStyles}>{isMorning ? commuteData.arrivingTrafficDuration.text : commuteData.leavingTrafficDuration.text}</span>
                    </p>
                <div className='p-2 has-text-centered'>
                    <div>
                        <HorizontalBubbleRaterView width={362.5} height={15} rating={
                            1 - RatingFunctions.getCommuteRating(isMorning ? 
                            commuteData.arrivingTrafficDuration.value : commuteData.leavingTrafficDuration.value, 
                            user.preferences)}
                            invert={true}
                            color1={isMorning ? "#ff7e5f" : "#6500FF"}
                            color2={isMorning ? "#feb47b" : "#00EFFF"}
                        />
                    </div>
                </div>
            </div>
        </div>
    </>
}