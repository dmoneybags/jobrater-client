import React, { createElement, useState, useEffect } from 'react';
import { useSpring, animated } from '@react-spring/web';

export const PreferenceRow = ({id, title, height, idShowing, setIdShowing, content}) => {
    const expandAnimation = useSpring({
        height: id === idShowing ? height : '35px', // Expands to 150px when opened
        config: { tension: 200, friction: 20 },
    });
    return (
        <animated.div className='preference-row' style={expandAnimation}>
            <p className='is-size-5'>{title}</p>
            <button 
            className='button is-info is-small' 
            style={{
                position: "absolute", 
                top: "5px", 
                right: "10px", 
                height: "25px"}}
            onClick={() => {id === idShowing ? setIdShowing(0) : setIdShowing(id)}}
            >
            Edit</button>
            {id === idShowing && content}
        </animated.div>
    )
}