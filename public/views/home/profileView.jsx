import React, { createElement, useState, useEffect } from 'react';
import { HomeViewNavBar } from './homeViewNavBar';
import { PreferenceRow } from './preferenceRow';
import { ProfileViewDesiredPaySection } from './profileViewDesiredPaySection';
import { LocalStorageHelper } from '@applicantiq/applicantiq_core/Core/localStorageHelper';
import { HelperFunctions } from '@applicantiq/applicantiq_core/Core/helperFunctions';
import { showError } from '../helperViews/notifications';
import { Spinner } from '../helperViews/loadingSpinner'
import { ProfileViewDesiredCommuteSection } from './profileViewDesiredCommuteSection';
import { ProfileViewDesiredModeSection } from './profileViewDesiredModeSection';
import { ProfileViewDesiredCareerStageSection } from './profileViewDesiredCareerStageSection';
import { ProfileViewLocationSection } from './profileViewLocationSection';
import { ProfileViewDesiredKeywordsSection } from './profileViewDesiredKeywordsSection';

export const ProfileView = () => {
    const [user, setUser] = useState(null);
    const [showingId, setIdShowing] = useState(0);
    const asyncLoadData = async () => {
        try {
            await HelperFunctions.downloadDataIfNecessary();
            const readUser = await LocalStorageHelper.getActiveUser();
            console.log("Loading profile view with:");
            console.log(readUser);
            setUser(readUser);
        } catch (err){
            showError(err);
        }
    }
    useEffect(()=>{
        asyncLoadData();
    },[]);

    return (
        <div className='main-container main-home-view'>
            <HomeViewNavBar/>
            <div style={{display: "flex", justifyContent: "center"}}>
                <p className='has-text-white is-size-3' style={{textAlign: "center"}}>Profile Data</p>
            </div>
            <div style={{width: "100%", padding:"10px"}}>
                {user && (
                    <>
                    {/* payment */}
                    <PreferenceRow id={1} title={"Desired Pay"} height={"200px"} idShowing={showingId} setIdShowing={setIdShowing} content={
                        <ProfileViewDesiredPaySection user={user} setShowingId={setIdShowing} reloadFunc={asyncLoadData}/>
                    }/>
                    {/* Desired Commute */}
                    <PreferenceRow id={2} title={"Desired Commute"} height={"200px"} idShowing={showingId} setIdShowing={setIdShowing} content={
                        <ProfileViewDesiredCommuteSection user={user} setShowingId={setIdShowing} reloadFunc={asyncLoadData}/>
                    }/>
                    {/* work from home */}
                    <PreferenceRow id={3} title={"Desired WFH Policy"} height={"200px"} idShowing={showingId} setIdShowing={setIdShowing} content={
                        <ProfileViewDesiredModeSection user={user} setShowingId={setIdShowing} reloadFunc={asyncLoadData}/>
                    }/>
                    {/* career stage */}
                    <PreferenceRow id={4} title={"Career Stage"} height={"160px"} idShowing={showingId} setIdShowing={setIdShowing} content={
                        <ProfileViewDesiredCareerStageSection user={user} setShowingId={setIdShowing} reloadFunc={asyncLoadData}/>
                    }/>
                    {/* keywords */}
                    <PreferenceRow id={5} title={"Desired Keywords"} height={"400px"} idShowing={showingId} setIdShowing={setIdShowing} content={
                        <ProfileViewDesiredKeywordsSection user={user} setShowingId={setIdShowing} reloadFunc={asyncLoadData}/>
                    }/>
                    {/* location */}
                    <PreferenceRow id={6} title={"Location Data"} height={"320px"} idShowing={showingId} setIdShowing={setIdShowing} content={
                        <ProfileViewLocationSection user={user} setShowingId={setIdShowing} reloadFunc={asyncLoadData}/>
                    }/>
                    </>
                )
                }
                {!user &&
                    <Spinner/>
                }
            </div>
        </div>
    )
}