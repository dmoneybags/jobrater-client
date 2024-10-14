import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HomeViewNavBar } from './homeViewNavBar';
import { LocalStorageHelper } from '../../../src/content/localStorageHelper';
import '../../../src/assets/css/switch.css';

export const SettingsView = () => {
    const [showingSignOutPopup, setShowingSignOutPopup] = useState(false);
    const signOut = async () => {
        setShowingSignOutPopup(true);
        await LocalStorageHelper.__sendMessageToBgScript(
            { action: 'clearAllData'}
        )
    }
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
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                <p className='has-text-white is-size-3' style={{ textAlign: "center" }}>Settings:</p>
                <div className='setting-row'>
                    <p className='setting-text has-text-white is-size-4'>Auto-save every job: </p>
                    <div className='setting-switch'>
                        <label class="switch">
                            <input type="checkbox" />
                            <span class="slider round"></span>
                        </label>
                    </div>
                </div>
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
                }}
                >
                    Delete Account
                </button>
            </div>
        </div>
    )
}