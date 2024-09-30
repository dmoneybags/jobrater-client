import React, { createElement, useState, useEffect, useRef } from 'react';

export const ArrowSliderSelectorView = ({value, setValue, displayFunc, mainColor='#23d160', bgColor='#23d160'}) => {
    const [position, setPosition] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef(null);

    const handleMouseDown = (e) => {
        setIsDragging(true);
    };

    const handleMouseMove = (e) => {
        if (isDragging) {
            e.stopPropagation();
            // Calculate the new position based on mouse movement
            const rect = e.target.closest('.arrow-slider-container').getBoundingClientRect();
            let newPosition = e.movementX + position;
            // Constrain the position within the slider bounds
            newPosition = Math.max(0, Math.min(rect.width, newPosition));
            setValue(newPosition/rect.width)
            setPosition(newPosition);
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    useEffect(()=>{
        //grab our own recatangle
        if (containerRef.current) {
            //get the dimensions
            const rect = containerRef.current.getBoundingClientRect();
            const newPosition = value * rect.width;
            setPosition(newPosition);
        }
    }, [])


    return (
        <div
            ref={containerRef}
            className="arrow-slider-container"
            style={{ cursor: isDragging ? 'grabbing' : 'pointer' }}
            
            onMouseOut={handleMouseUp}
        >
            <p className='arrow-slider-text' style={{ color: mainColor }}>{displayFunc(value)}</p>
            <hr className="arrow-slider-main-bar" style={{ backgroundColor: bgColor }} />
            <div
                className="arrow-slider-circle"
                style={{
                    backgroundColor: mainColor,
                    left: `${position}px`,
                }}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
            ></div>
        </div>
    )
}