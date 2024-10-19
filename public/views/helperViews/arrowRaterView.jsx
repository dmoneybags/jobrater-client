import React, { createElement, useState, useEffect } from 'react';
import { HelperFunctions } from '@applicantiq/applicantiq_core/Core/helperFunctions';

export const ArrowRaterView = ({rating, width, text}) => {
    return (
        <div style={{width: String(width) + "px", position: "relative"}}>
            <hr className="arrow-slider-main-bar job-view-rating-bar" 
            style={{
                position: "absolute",
                left: "0px",
                width: String(width * rating) + "px", 
                height: "2px",
                background: `linear-gradient(to right, ${HelperFunctions.ratingToColor(Math.max(0, rating - 0.2))}, ${HelperFunctions.ratingToColor(rating)})`}}/>
            <i class="fa-solid fa-play" style={{
                position: "absolute",
                left: String(width * rating) + "px",
                color: HelperFunctions.ratingToColor(rating),
                transform: "translate(-50%, -50%)"
            }}></i>
            <p className='is-size-4 job-view-rating-number' style={{left: String(300 * 0.45) + "px"}}>{text}</p>
        </div>
    )
}