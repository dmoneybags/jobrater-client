import React, { createElement, useState, useEffect } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { HelperFunctions } from '@applicantiq/applicantiq_core/Core/helperFunctions';

export const HorizontalBubbleRaterView = ({width, height, rating, ratingDisplayFunc, invert=false, color1=null, color2=null}) => {
    const { animatedRating } = useSpring({
        from: { animatedRating: 0 },
        animatedRating: rating,
        config: {tension: 170, friction: 26}
    })
    const getColor1 = () => {
        return invert ? HelperFunctions.ratingToColor(Math.max(0.01, 1 - rating - 0.15)) : 
        HelperFunctions.ratingToColor(Math.max(0.01, rating - 0.15))
    }
    const getColor2 = () => {
        return invert ? HelperFunctions.ratingToColor(Math.max(1 - rating, 0.01)) :
                HelperFunctions.ratingToColor(Math.max(rating, 0.01))
    }
    return (
        <div style={{position: "relative"}}>
            <div className='horizontal-bubble-back-bubble' 
            style={{
                height: String(height) + "px", 
                width: String(width) + "px"}}>

            </div>
            <animated.div className='horizontal-bubble-front-bubble' 
            style={{
                height: String(height) + "px", 
                width: animatedRating.to((n) => `${width * n}px`),
                '--color1': color1 ?? getColor1(),
                '--color2': color2 ?? getColor2()
                }}>

            </animated.div>
        </div>
    )
}