import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HomeViewNavBar } from './homeViewNavBar';
import { LocalStorageHelper } from '@applicantiq/applicantiq_core/Core/localStorageHelper';
import { DatabaseCalls } from '@applicantiq/applicantiq_core/Core/databaseCalls';
import { showError, showSuccess } from '../helperViews/notifications'
import { FreeUserDataHelperFunctions } from '@applicantiq/applicantiq_core/Core/freeUserDataHelperFunctions';
import '../../../src/assets/css/switch.css';

export const SettingsView = () => {
    const [showingSignOutPopup, setShowingSignOutPopup] = useState(false);
    const [showingDeletePopup, setShowingDeletePopup] = useState(false);
    const [saveEveryJobByDefault, setSaveEveryJobByDefault] = useState(false);
    const [loadEveryJobByDefault, setLoadEveryJobByDefault] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [subscriptionData, setSubscriptionData] = useState(null);
    //data if they dont have a subscription, free resume ratings left, etc
    const [freeData, setFreeData] = useState(null);
    const capitalizeFirstLetter = (val) => {
        return String(val).charAt(0).toUpperCase() + String(val).slice(1);
    }
    const signOut = async () => {
        setShowingSignOutPopup(true);
        await LocalStorageHelper.__sendMessageToBgScript(
            { action: 'clearAllData'}
        )
    }
    useEffect(()=>{
        const asyncLoadSubscriptionData = async () => {
            const subscription = await DatabaseCalls.sendMessageToGetSubscription();
            console.log(subscription);
            if (Object.keys(subscription).length === 0 || Math.floor(Date.now() / 1000) > subscription?.currentPeriodEnd){
                setIsSubscribed(false)
                const freeData = await DatabaseCalls.sendMessageToGetFreeUserData();
                console.log(freeData);
                setFreeData(freeData);
            } else {
                setIsSubscribed(true);
                setSubscriptionData(subscription);
            }
        }
        const asyncGetPreferences = async () => {
            const activeUser = await LocalStorageHelper.getActiveUser();
            setLoadEveryJobByDefault(activeUser.preferences.autoActiveOnNewJobLoaded);
            setSaveEveryJobByDefault(activeUser.preferences.saveEveryJobByDefault);
        }
        asyncGetPreferences();
        asyncLoadSubscriptionData();
    }, [])
    return (
        <div className='main-container main-home-view'>
            <HomeViewNavBar/>
            {/* begin popup */}
            <div 
            className={`popup ${showingSignOutPopup ? 'show' : ''}`}
            style={{zIndex: "10000", padding: "10px", minHeight: "200px", height: "150px"}}
            >
                <p>Successfully Signed Out</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: "10px"}}>
                    <button 
                    className="button is-success" 
                    style={{ margin: '0 10px' }}
                    onClick={()=>window.close()}
                    >
                        OK
                    </button>
                </div>
            </div>
            {/* end popup */}
            {/* begin popup */}
            <div 
            className={`popup ${showingDeletePopup ? 'show' : ''}`}
            style={{zIndex: "10000", padding: "10px", minHeight: "200px", height: "150px"}}
            >
                <p>Are you sure you want to delete your account?</p>
                <p className='is-size-7 has-text-danger'>This is irreversible, all data will be lost.</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: "10px"}}>
                    <button 
                    className="button is-danger" 
                    style={{ margin: '0 10px' }}
                    onClick={async ()=>{
                        try {
                            await DatabaseCalls.sendMessageToDeleteUser();
                            await LocalStorageHelper.__sendMessageToBgScript(
                                { action: 'clearAllData'}
                            )
                            window.close();
                        } catch (err){
                            showError(err);
                        }
                    }}
                    >
                        OK
                    </button>
                    <button 
                    className="button is-focused" 
                    style={{ margin: '0 10px' }}
                    onClick={()=>setShowingDeletePopup(false)}
                    >
                        Cancel
                    </button>
                </div>
            </div>
            {/* end popup */}
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                <p className='has-text-white is-size-3' style={{ textAlign: "center" }}>Settings:</p>
                <div className='setting-row' style={{display: "flex", width: "400px", alignItems: "flex-start"}}>
                    <p className='is-size-4 pr-4 has-text-white'>Plan:</p>
                    <div>
                        <p className='is-size-4 has-text-white'>{
                        // hacky
                        isSubscribed ? capitalizeFirstLetter(subscriptionData?.subscriptionObject?.subscriptionType) : "Basic"
                        }</p>
                        <ul className='is-size-7' style={{width: "180px"}}>
                            {!isSubscribed && 
                            <>
                            {/* capital casing is a relic of the sql column, sorry not sorry */}
                            <li className='mb-2'>{freeData?.FreeRatingsLeft} free resume ratings left, resets on {FreeUserDataHelperFunctions.getDateFromStrDate(freeData?.LastReload, 1)}</li>
                            {FreeUserDataHelperFunctions.isDiscountable(freeData?.CreatedAt) && <li>$6.99 lifetime subscription offer still valid until {FreeUserDataHelperFunctions.getDateFromStrDate(freeData?.CreatedAt, 7)}</li>}
                            {!FreeUserDataHelperFunctions.isDiscountable(freeData?.CreatedAt) && <li>Get unlimited ratings with Pro for $9.99/month</li>}
                            </>}
                            {isSubscribed && 
                            <>
                            <li className='mb-2'>{FreeUserDataHelperFunctions.centsToDollar(subscriptionData?.subscriptionObject?.price)} per month</li>
                            <li>{subscriptionData?.isActive ? "Renewing" : "Expiring"} on {FreeUserDataHelperFunctions.getRenewDateStr(subscriptionData.currentPeriodEnd)}</li>
                            </>}
                        </ul>
                    </div>
                    <div className='setting-switch' style={{left: "285px", marginTop: "20px", top: "unset"}}>
                        <a className='button is-link' href="https://applicantiq.org/account" target='_blank'>{isSubscribed ? "Change" : "Upgrade"}</a>
                    </div>
                </div>
                <div className='setting-row'>
                    <p className='setting-text has-text-white is-size-4'>
                        Auto-save every job
                        <div className='hoverable-icon-container ml-2'> 
                            <i className="fas fa-info-circle" style={{fontSize: "12px", marginLeft: "5px"}}></i>
                            <div className="hover-text" style={{width: "200px"}}>Automatically saves every job to your profile that is loaded in the plugin. If not on, you'll have to click on save job under the jobs score.</div>
                        </div>
                    </p>
                    <div className='setting-switch'>
                        <label class="switch">
                            <input 
                            type="checkbox"
                            checked={saveEveryJobByDefault}
                            onChange={async (e) => {
                                DatabaseCalls.sendMessageToUpdateUserPreferences({saveEveryJobByDefault: e.target.checked});
                                setSaveEveryJobByDefault(e.target.checked);
                                const activeUser = await LocalStorageHelper.getActiveUser();
                                activeUser.preferences.saveEveryJobByDefault = e.target.checked;
                                LocalStorageHelper.setActiveUser(activeUser);
                            }} 
                            />
                            <span class="slider round"></span>
                        </label>
                    </div>
                </div>
                {/* <div className='setting-row'>
                    <p className='setting-text has-text-white is-size-4'>
                        Auto-load all jobs
                        <div className='hoverable-icon-container ml-2'> 
                            <i className="fas fa-info-circle" style={{fontSize: "12px", marginLeft: "5px"}}></i>
                            <div className="hover-text" style={{width: "200px"}}>If on, every time you load a webpage with a new job, it will be sent to the popup. If not you will have to click on the view in ApplicantIQ button to send it to the popup</div>
                        </div>
                    </p>
                    <div className='setting-switch'>
                        <label class="switch">
                            <input 
                            type="checkbox" 
                            checked={loadEveryJobByDefault}
                            onChange={async (e) => {
                                DatabaseCalls.sendMessageToUpdateUserPreferences({autoActiveOnNewJobLoaded: e.target.checked});
                                setLoadEveryJobByDefault(e.target.checked);
                                const activeUser = await LocalStorageHelper.getActiveUser();
                                activeUser.preferences.autoActiveOnNewJobLoaded = e.target.checked;
                                LocalStorageHelper.setActiveUser(activeUser);
                            }}
                            />
                            <span class="slider round"></span>
                        </label>
                    </div>
                </div> */}
                <button 
                className='button is-link mt-6'
                onClick={()=>{
                    signOut();
                }}
                >
                    Sign Out
                </button>
                <button 
                className='button is-danger mt-5'
                onClick={()=>{
                    setShowingDeletePopup(true)
                }}
                >
                    Delete Account
                </button>
            </div>
        </div>
    )
}