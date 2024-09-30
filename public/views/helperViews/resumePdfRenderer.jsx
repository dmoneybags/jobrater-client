import React, { createElement, useEffect } from 'react';

export const ResumePdfRenderer = ({resume}) => {
    useEffect(() => {
        // Create a Blob from the Uint8Array
        const blob = new Blob([resume.fileContent], { type: 'application/pdf' });

        // Create an object URL from the Blob
        const url = URL.createObjectURL(blob);

        // Set the src of the iframe to the object URL
        document.getElementById('pdf-iframe').src = url;
    }, [])
    return (
        <div id="pdf-container">
            <iframe id="pdf-iframe" style={{width: "100%", height: "550px"}} frameborder="0"></iframe>
        </div>
    )
}