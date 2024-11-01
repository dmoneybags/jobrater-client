import React, { createElement, useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { SmallLogoView } from '../logos/smallLogoView';
import '../../../src/assets/css/home.css';

export const HomeViewNavBar = () => {
    return (
        <nav className="navbar is-link is-fixed-top" role="navigation" aria-label="main navigation">
            <Link to="/" className='nav-logo-container'>
                <SmallLogoView color={"white"}/>
            </Link>
            <Link to="/feedback" className="fa-solid fa-comment-alt icon feedback-icon fa-xl absolute-hoverable-icon">
                <div className="hover-text" style={{marginTop: "20px", marginLeft: "18px", padding: "8px"}}>
                    Feedback
                </div>
            </Link>
            <Link to="/resumes" class="fa-solid fa-address-book icon home-icon fa-xl absolute-hoverable-icon">
                <div className="hover-text" style={{marginTop: "20px", padding: "8px"}}>
                    Resumes
                </div>
            </Link>
            <Link to="/settings" class="fa-solid fa-cog icon settings-icon fa-xl absolute-hoverable-icon">
                <div className="hover-text" style={{marginTop: "20px", padding: "8px"}}>
                    Settings
                </div>
            </Link>
            <Link to="/profile" class="fa-solid fa-user icon profile-icon fa-xl absolute-hoverable-icon">
                <div className="hover-text" style={{marginTop: "20px", padding: "8px"}}>
                    Profile
                </div>
            </Link>
        </nav>
    )
}