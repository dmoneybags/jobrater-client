import React, { createElement, useEffect } from 'react';

export const ResumeWordRenderer = ({resume}) => {
    useEffect(() => {
        const blob = new Blob([resume.fileContent], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });

        // Use FileReader to read the Blob as an ArrayBuffer
        const reader = new FileReader();
        reader.onload = function(event) {
            const arrayBuffer = event.target.result;

            // Use Mammoth to convert ArrayBuffer to HTML
            mammoth.convertToHtml({ arrayBuffer: arrayBuffer })
                .then(function(result) {
                    const html = result.value; // The generated HTML
                    document.getElementById('docx-container').innerHTML = html;
                })
                .catch(function(err) {
                    console.error('Error converting .docx to HTML:', err);
                });
        };
        reader.readAsArrayBuffer(blob);
    }, [])
    return (
        <div id="word-container">
            <iframe id="word-iframe" style={{width: "100%", position: "absolute", top: "50px", height: "550px"}} frameborder="0"></iframe>
        </div>
    )
}