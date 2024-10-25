import React, { createElement, useState, useEffect, useRef } from 'react';
import { CommuteView } from './commuteView';
import { RelocationView } from './relocationView';
import { DatabaseCalls } from '@applicantiq/applicantiq_core/Core/databaseCalls';
import { showError } from '../helperViews/notifications';
import { Spinner } from '../helperViews/loadingSpinner';
import { LocationHelperFunctions } from '@applicantiq/applicantiq_core/Core/locationHelperFunctions'
import { Link } from 'react-router-dom';
import { ProPopupView } from './proPopupView';

export const LocationViewJobTab = ({job, user}) => {
    const [commuteData, setCommuteData] = useState(null);
    const [relocationData, setRelocationData] = useState(null);
    const [mapUrl, setMapUrl] = useState(null);
    const [isCommutable, setIsCommutable] = useState(true);
    const [isSubscribed, setIsSubscribed] = useState(true);
    const [showingProPopup, setShowingProPopup] = useState(false);
    const getCommuteData = async () => {
        try {
            const originLat = user.location.latitude;
            const originLng = user.location.longitude;
            const destLat = job.location.latitude;
            const destLng = job.location.longitude
            const commuteData = await DatabaseCalls.sendMessageToGetCommuteData(originLat, originLng, destLat, destLng);
            setCommuteData(commuteData);
            setMapUrl(commuteData.mapUrl);
        } catch (err) {
            //Need to stop spinner on error
            if (err === "402"){
                setIsSubscribed(false);
                setShowingProPopup(true);
            } else {
                showError(err);
            }
        }
    }
    const getRelocationData = async () => {
        try {
            console.log("Sending message to get location data");
            const relocationData = await DatabaseCalls.sendMessageToGetRelocationData(job.location);
            console.log("Got relocation data!");
            setRelocationData(relocationData);
            setMapUrl(relocationData.mapUrl);
        } catch (err) {
            if (err === "402"){
                setIsSubscribed(false);
                setShowingProPopup(true);
            } else {
                //Need to stop spinner on error
                showError(err);
            }
        }
    }

    useEffect(()=>{
        if (job.mode?.str !== "Remote" && job.location && job.location.latitude && user.location) {
            //set it to static var to use in stack
            const canCommute = LocationHelperFunctions.isCommutable(job.location, user.location);
            console.log(`This job is${canCommute ? "" : " NOT"} commutable`)
            setIsCommutable(canCommute);
            if (!job.mode || job.mode.str !== "Remote"){
                if (job.location && user.location && canCommute){
                    getCommuteData();
                //Not commutable
                } else if (job.location && user.location){
                    getRelocationData();
                }
            }
        }
    }, [])
    return (
        <>
        {(job.location && job.mode?.str !== "Remote") &&
            <div className='pr-2 pl-2'>
                <ProPopupView showingPopup={showingProPopup} setShowingPopup={setShowingProPopup}/>
                {isSubscribed && <>
                    {job.location && user.location && <>
                        {isCommutable && mapUrl && user.location &&
                        <CommuteView mapUrl={mapUrl} commuteData={commuteData} user={user} job={job}/>
                        }
                        {!isCommutable && mapUrl && 
                        <RelocationView mapUrl={mapUrl} relocationData={relocationData} user={user} job={job}/>
                        }
                        {!mapUrl && <Spinner/>}
                    </>}
                    {job.location && !user.location &&
                        <>
                            <div style={{display: "flex", justifyContent: "center"}}>
                                <p className='has-text-white is-size-5' style={{textAlign: "center"}}>Share your location to get data on commute times and traffic</p>
                            </div>
                        </>
                    }
                    {!job.location && <>
                        <div style={{display: "flex", justifyContent: "center"}}>
                            <p className='has-text-white is-size-3'>No Location Found</p>
                        </div>
                    </>}
                </>}
                {!isSubscribed && <div className='pr-2 pl-2'>
                    <div style={{display: "flex", justifyContent: "center"}}>
                        <p className='has-text-white is-size-3' style={{textAlign: "center"}}>Location data is a Pro feature.</p>
                    </div>
                </div>}
            </div>
        }
        {job.mode?.str === "Remote" &&
            <div className='pr-2 pl-2'>
                <div style={{display: "flex", justifyContent: "center"}}>
                    <p className='has-text-white is-size-3' style={{textAlign: "center"}}>Job is remote, no commute necessary!</p>
                </div>
            </div>
        }
        {!job.location && job.mode?.str !== "Remote" &&
            <div className='pr-2 pl-2'>
                <div style={{display: "flex", justifyContent: "center"}}>
                    <p className='has-text-white is-size-3' style={{textAlign: "center"}}>Could not find job location</p>
                </div>
        </div>}
        </>
    )
}