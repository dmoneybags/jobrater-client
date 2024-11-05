import React, { createElement, useState, useEffect } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { HelperFunctions } from '@applicantiq/applicantiq_core/Core/helperFunctions';

export const CircleRater = ({rating, size, thickness, mainColor, bgColor, circleThickness, fontSize, innerText = null}) => {
    const computedMainColor = mainColor || HelperFunctions.ratingToColor(rating);
    const computedBgColor = bgColor || HelperFunctions.ratingToColor(rating, 0.2);
    const circumference = size * Math.PI;
    const dashOffsetValue = circumference - (size * Math.PI * rating - (circleThickness ?? thickness))
    const fontSizeStr = String(fontSize) + "px";
    const { dashOffset } = useSpring({
        dashOffset: dashOffsetValue,
        from: { dashOffset: circumference },
        config: { duration: 2000 },
    });
    const getRatingPoints = () => {
        // Calculate the angle in radians
        const theta = (2 * Math.PI) * rating - (Math.PI/2);
        const fullCircleRadius = size - thickness/2
        // Calculate x and y on the unit circle
        const x = Math.cos(theta) * (fullCircleRadius)/2;
        const y = Math.sin(theta) * (fullCircleRadius)/2;
        // Translate x and y to position relative to the top-left corner
        const point = [x + fullCircleRadius/2 - thickness, y + fullCircleRadius/2]
        return point;
    }
    return (
            <div className='circle-rater-outer-circle' style={{width: String(size) + "px", height: String(size) + "px", borderColor: computedBgColor, borderWidth: String(thickness) + "px"}}>
                <div style={{position:"absolute", width: String(size) + "px", height: String(size) + "px", top: String(-thickness) + "px", left: String(-thickness) + "px"}}>
                {rating > 0.001 && <div className='circle-rater-rating-circle' 
                    style={{top: String(getRatingPoints()[1]) + "px", left: String(getRatingPoints()[0]) + "px", height: String(circleThickness ?? thickness) + "px", width: String(circleThickness ?? thickness) + "px", backgroundColor: computedMainColor}}>
                    </div>}
                    <p className='circle-rater-inner-text' style={{color: computedMainColor, fontSize: fontSizeStr || 'inherit'}}>
                        {innerText ? innerText : (rating > 0.001 ? Math.floor(rating * 100) : "?")}
                    </p>
                </div>
                <svg height={size} width={size} className='rating-fill' style={{top: String(-thickness) + "px", left: String(-thickness) + "px"}}>
                    <animated.circle className='rating-fill-circle' style={{stroke: computedMainColor}} cx={size/2} cy={size/2} r={size/2 * 0.96} strokeDashoffset={dashOffset} strokeDasharray={circumference} fill="none"/>
                </svg>
            </div>
    )
}