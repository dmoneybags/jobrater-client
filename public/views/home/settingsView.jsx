import React, { useState } from 'react';
import { HomeViewNavBar } from './homeViewNavBar';

export const SettingsView = () => {
    return (
        <div className='main-container main-home-view'>
            <HomeViewNavBar/>
            <div style={{display: "flex", justifyContent: "center"}}>
                <p className='has-text-white is-size-3' style={{textAlign: "center"}}>Settings coming soon!</p>
            </div>
        </div>
    )
}