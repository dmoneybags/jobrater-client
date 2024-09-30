import React, { createElement, useState, useEffect, useRef } from 'react';
import { CircleRater } from '../helperViews/circleRater';

export const RelocationView = ({mapUrl, relocationData, user, job}) => {
    useEffect(()=>{
        console.log("Loading Relocation View with props:");
        console.log(relocationData);
        console.log(user);
        console.log(job);
    }, [])
    return (<>
        <div style={{
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: "10px"
        }}>
            <p className='is-size-6 has-text-white has-text-weight-bold'>Relocation likely Necessary:</p>
            <button 
                className="button is-small is-link" 
                onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${job.company.companyName}+${job.locationStr}`, "_blank")}
            >
                View on Google Maps
            </button>
        </div>
        <div id="map">
            <img id="mapImage" alt="Map displaying directions" src={mapUrl}/>
        </div>
        <p className='has-text-white is-size-4'>{`${job.location.city}, ${job.location.stateCode}`}</p>
        <div style={{
            display: "flex",
            justifyContent: "space-between", /* Ensure equal spacing */
            width: "100%",
        }}>
            <div style={{
                flex: "1", 
                display: "flex", 
                flexDirection: "column", 
                alignItems: "center",
                textAlign: "center"
            }}>
                <p>Walkability</p>
                <CircleRater rating={relocationData.walkability?.walkscore/100 ?? 0} size={40} thickness={3} fontSize={14} circleThickness={5}/>
            </div>
            <div style={{
                flex: "1", 
                display: "flex", 
                flexDirection: "column", 
                alignItems: "center",
                textAlign: "center"
            }}>
                <p>Transit</p>
                <CircleRater rating={relocationData.walkability?.transit?.score/100 ?? 0} size={40} thickness={3} fontSize={14} circleThickness={5}/>
            </div>
            <div style={{
                flex: "1", 
                display: "flex", 
                flexDirection: "column", 
                alignItems: "center",
                textAlign: "center"
            }}>
                <p>Biking</p>
                <CircleRater rating={relocationData.walkability?.bike?.score/100 ?? 0} size={40} thickness={3} fontSize={14} circleThickness={5}/>
            </div>
        </div>
        <div style={{
            display: "flex",
            justifyContent: "space-between", /* Ensure equal spacing */
            width: "100%",
            marginTop: "5px"
        }}>
            <div style={{
                flex: "1", 
                display: "flex", 
                flexDirection: "column", 
                alignItems: "center",
                textAlign: "center"
            }}>
                <p>One Bedroom Rent</p>
                <p className='is-size-4 has-text-white'>${relocationData?.fmr?.toLocaleString('en-US') ?? "Not Found"}</p>
            </div>
            <div style={{
                flex: "1", 
                display: "flex", 
                flexDirection: "column", 
                alignItems: "center",
                textAlign: "center"
            }}>
                <p>Household Income</p>
                <p className='is-size-4 has-text-white'>${relocationData?.income?.toLocaleString('en-US') ?? "Not Found"}</p>
            </div>
        </div>
    </>
    )
}