import React, { useState, useEffect, useRef } from 'react';

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
            const rect = containerRef.current.getBoundingClientRect();
            let newPosition = e.clientX - rect.left;
            newPosition = Math.max(0, Math.min(rect.width, newPosition)); // Constrain position
            setValue(newPosition / rect.width); // Update value based on position
            setPosition(newPosition); // Update position
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        const handleGlobalMouseMove = (e) => {
            if (isDragging) {
                handleMouseMove(e); // Track mouse movements even outside the container
            }
        };

        const handleGlobalMouseUp = () => {
            if (isDragging) {
                setIsDragging(false); // Stop dragging when the mouse is released
            }
        };

        // Attach global listeners during dragging
        if (isDragging) {
            window.addEventListener('mousemove', handleGlobalMouseMove);
            window.addEventListener('mouseup', handleGlobalMouseUp);
        }

        // Cleanup listeners when dragging stops
        return () => {
            window.removeEventListener('mousemove', handleGlobalMouseMove);
            window.removeEventListener('mouseup', handleGlobalMouseUp);
        };
    }, [isDragging]);

    useEffect(() => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const newPosition = value * rect.width;
            setPosition(newPosition); // Update position on value change
        }
    }, [value]);

    return (
        <div
            ref={containerRef}
            className="arrow-slider-container"
            style={{ cursor: isDragging ? 'grabbing' : 'pointer' }}
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
            ></div>
        </div>
    );
};