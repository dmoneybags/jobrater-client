import React, { createElement, useState, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import 'pdfjs-dist/build/pdf.worker.mjs';
import { DatabaseCalls } from '../../../src/content/databaseCalls';
import { HelperFunctions } from '../../../src/content/helperFunctions';

//height and width are passed numbers but represent pixels
export const HighlightedResumeView = ({resumeComparison, resume, width, height}) => {
    //Not 0 indexed, 1 indexed
    const [pageNum, setPageNum] = useState(1);
    const [pdfUrl, setUrl] = useState(null);
    const [numPages, setNumPages] = useState(0);
    const [highlightedRegions, setHighlightedRegions] = useState([]);
    const [currentPopupData, setCurrentPopupData] = useState(null);
    /**
     * highlightSentence
     * 
     * highlights the sentence of the page
     * 
     * translates the coordinates from the textFragments to ground truth coordinates
     * 
     * @param {*} textFragments: list of fragments from page.getTextContent.items  
     * @param {*} resumeSentenceComparison: ResumeSentenceComparison object from the ResumeComparison parent
     * @param {*} viewport: the viewport for our pdf
     * @param {*} context: the context of the canvas
     */
    const highlightSentence = (textFragments, resumeSentenceComparison, viewport, context) => {
        const newRegions = [];
        for (let item of textFragments){
            const bounds = item.transform;
            const x = bounds[4];
            const y = bounds[5];
            //We upscale our viewport to get a clearer image, we have to translate our coords
            //because of that
            const itemWidth = item.width * viewport.scale;
            const itemHeight = item.height * viewport.scale;

            // Highlighting the sentence 
            const color = HelperFunctions.ratingToColor(Math.max(resumeSentenceComparison.similarity + 0.2, 1), 0.3)
            context.fillStyle = color;
            console.debug(resumeSentenceComparison.resumeSentence);
            console.debug(`Beginning x: ${x}`);
            console.debug(`Beginning y: ${y}`);
            console.debug(`Width: ${itemWidth}`);
            console.debug(`Height: ${itemHeight}`);
            //Cluster fuck
            //Each pixel of height from the text fragment is worth 1.42 on our plane
            //their plane has an offset of positive 27.27
            //I forget why we divide by 1.51
            const renderedHeight = (((height * 1.42) - y) + 27.27)/1.51;
            context.fillRect(x * 0.64, renderedHeight, itemWidth, itemHeight);

            console.debug(`Rendered ${resumeSentenceComparison.resumeSentence} to be at position: ${renderedHeight}`);
            newRegions.push({
                x: x * 0.64,
                y: renderedHeight,
                width: itemWidth,
                height: itemHeight,
                resumeSentenceComparison: resumeSentenceComparison,
            });
        }
        setHighlightedRegions((prevRegions) => [...prevRegions, ...newRegions]);
    }
    /**
     * findAndHighlightSentence
     * 
     * Finds the sentence out of the fragments are highlights the individual fragments
     * 
     * @param {*} textFragments: list of fragments from page.getTextContent.items  
     * @param {*} resumeSentenceComparison: ResumeSentenceComparison object from the ResumeComparison parent
     * @param {*} viewport: the viewport for our pdf
     * @param {*} context: the context of the canvas
     * @returns 
     */
    const findAndHighlightSentence = (resumeSentenceComparison, textFragments, viewport, context) => {
        //flag just for printing if we were not able to find the sentence
        let highlightedSentence = false;
        const sentence = resumeSentenceComparison.resumeSentence;
        //Holds our "candidates" for what could potentially be our sentences, basically
        //a list of fragments that could or could not be a sentence based on the words
        let candidateList = [];
        console.debug(`Finding and highlighting ${sentence}`);
        let i = 0;
        console.debug("FRAGMENTS");
        //Initial loop to load in the first candidates
        for (let fragment of textFragments){
            //set an index to the fragment to have a representation of order
            fragment.index = i;
            //If either the start of the sentence matches the start of the fragment or vice versa
            if ((sentence.startsWith(fragment.str) || (fragment.str.startsWith(sentence))) && 
            ((fragment.str != '') && 
            fragment.str && 
            fragment.str.length)){
                //we short circuit if the fragment starts with our sentence, this means the fragment is longer than the sentence and therefore
                //a match
                if (fragment.str.startsWith(sentence)){
                    highlightSentence([fragment], resumeSentenceComparison, viewport, context);
                    console.debug("Short circuiting and highlighting:");
                    console.debug(sentence);
                    console.debug(fragment);
                    return;
                }
                console.debug(`ACCEPTED: ${sentence} does start with ${fragment.str}`);
                console.debug(fragment);
                const fragList = [
                    fragment
                ];
                console.debug(fragList);
                //add our candidate
                const candidateData = {fragList: fragList, length: fragment.str.length};
                console.debug(candidateData);
                candidateList.push(candidateData);
                console.debug(candidateList);
                continue;
            } else {
                console.debug(`REJECTED: ${sentence} does not start with ${fragment.str}`);
            }
            i++;
        }
        //Just for debugging
        for (let fragment of textFragments){
            console.debug(fragment);
        }
        console.debug(`Got ${candidateList.length} candidates`);
        console.debug(candidateList);
        let j = 0;
        //We prune candidates as we find them to be valid
        //we return once we highlight or drop out when all candidates are invalid
        while (candidateList.length){
            console.debug(`LOOPED ${j} TIMES`);
            for (let i = candidateList.length - 1; i >= 0; i-- ){
                const candidate = candidateList[i];
                console.debug(`EVALUATING CANDIDATE:`);
                console.debug(candidate);
                if (candidate.length === sentence.length){
                    console.debug(`HIGHLIGHTING!!!!!!!`);
                    console.debug(candidate);
                    console.debug(sentence);

                    highlightSentence(candidate.fragList, resumeSentenceComparison, viewport, context);
                    highlightedSentence = true;
                    //remove candidate
                    candidateList.splice(i, 1);
                    //might not want to return
                    return;
                }
                const sentenceRemaining = sentence.substring(candidate.length, sentence.length);
                console.debug(`WORKING ON SENTENCE RATING OF ${sentenceRemaining}`);
                let foundMatch = false;
                for (let fragment of textFragments){
                    //similar to first check
                    if (fragment.str.startsWith(sentenceRemaining) && fragment.index >= candidate.fragList[candidate.fragList.length - 1].index){
                        console.debug(`SHORT CIRCUITING AND HIGHLIGHTING: `);
                        console.debug(fragment);
                        candidate.fragList.push(fragment);
                        console.debug(candidate.fragList);
                        highlightSentence(candidate.fragList, resumeSentenceComparison, viewport, context);
                        return;
                    }
                    if (
                        sentenceRemaining.startsWith(fragment.str) && 
                        fragment.str && 
                        fragment.str.length && 
                        fragment.index >= candidate.fragList[candidate.fragList.length - 1].index)
                        {
                        console.debug(`FOUND A MATCH BETWEEN ${sentenceRemaining} and ${fragment.str}`);
                        console.debug(`new fragment index ${fragment.index}`)
                        console.debug(`fragment index ${candidate.fragList[candidate.fragList.length - 1].index}`)
                        console.debug(`Next frag would have been:`);
                        console.debug(textFragments[candidate.fragList[candidate.fragList.length - 1].index + 1]);
                        console.debug(fragment.str.length);
                        candidate.fragList.push(fragment);
                        candidate.length += fragment.str.length;
                        console.debug(`UPDATED LENGTH TO ${candidate.length}`)
                        console.debug(`STILL SEARCHING FOR ${sentence.length - candidate.length} characters`)
                        foundMatch = true;
                        break;
                    }
                }
                //remove candidate
                if (!foundMatch){
                    console.debug("COULD NOT FIND MATCH FOR");
                    console.debug(candidate);
                    console.debug(sentence);
                    candidateList.splice(i, 1);
                }
            }
        }
        if (!highlightedSentence){
            console.warn("COULD NOT FIND A HIGHLIGHTABLE MATCH FOR:")
            console.warn(sentence);
        }
    }
    const highlightSentences = (page, context, viewport) => {
        page.getTextContent().then((textContent) => {
            console.debug("EVALUATING SENTENCES OF:");
            for(const resumeSentenceComparison of resumeComparison.resumeSentenceComparisons){
                console.debug(resumeSentenceComparison.resumeSentence);
            }
            for(const resumeSentenceComparison of resumeComparison.resumeSentenceComparisons){
                findAndHighlightSentence(resumeSentenceComparison, textContent.items, viewport, context);
            }
        })
    }
    const asyncLoadData = async(curPage) => {
        const fullResume = await DatabaseCalls.sendMessageToReadResume(resume.id);
        const blob = new Blob([fullResume.fileContent], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setUrl(url);
        const pdfContainer = document.getElementById('pdf-container');
    
        // Clear the old canvas if it exists
        while (pdfContainer.firstChild) {
            pdfContainer.removeChild(pdfContainer.firstChild);
        }
        const loadingTask = pdfjsLib.getDocument(url);
        loadingTask.promise.then((pdf) => {
            setNumPages(pdf.numPages);
            pdf.getPage(curPage).then((page) => {
                // Calculate scale factor based on the desired fixed size
                const viewport = page.getViewport({ scale: 1 });
                const scale = Math.min(width / viewport.width, height / viewport.height);
                const scaledViewport = page.getViewport({ scale });

                // Create a canvas for each page
                const canvas = document.createElement('canvas');
                canvas.id = "resume-pdf-canvas";
                const context = canvas.getContext('2d');

                const ratio = window.devicePixelRatio || 1;
                canvas.width = width * ratio;
                canvas.height = height * ratio;

                canvas.style.width = width + 'px';
                canvas.style.height = height + 'px';

                context.scale(ratio, ratio);

                // Append the canvas to the container
                pdfContainer.appendChild(canvas);

                // Render the PDF page into the canvas
                page.render({
                    canvasContext: context, 
                    viewport: scaledViewport
                }).promise.then(()=>{
                    if (resumeComparison){
                        highlightSentences(page, context, scaledViewport);
                    }
                })
            });
        });
    }
    useEffect(() => {
        setPageNum(1);
        if (pdfUrl){
            console.log("Destructing pdfurl...")
            URL.revokeObjectURL(pdfUrl);
        }
        asyncLoadData(1);
        return () => {
            // Cleanup URL object to avoid memory leaks
            URL.revokeObjectURL(pdfUrl);
        };
    }, [resume])
    
    return (
        <div style={{height: height, width: width, position: 'relative'}}>
            <div id="pdf-container" style={{height: height, width: width}}>
                {highlightedRegions.map((region, index) => (
                <div
                    key={index}
                    style={{
                        position: 'absolute',
                        top: `${region.y}px`,
                        left: `${region.x}px`,
                        width: `${region.width}px`,
                        height: `${region.height}px`,
                        cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                        //if the user is hovering on a different sentence
                        if (!currentPopupData || currentPopupData.resumeSentenceComparison.resumeSentence !== region.resumeSentenceComparison.resumeSentence){
                            setCurrentPopupData({
                                resumeSentenceComparison: region.resumeSentenceComparison,
                                x: e.clientX,
                                y: e.clientY
                            })
                        }
                    }}
                    onMouseLeave={(e) => {
                        setCurrentPopupData(null);
                    }}
                />
                ))}
                {currentPopupData && <div
                style={{
                    position: "absolute",
                    left: String(Math.max(125, Math.min(currentPopupData.x, 275))) + "px",
                    //header size
                    top: String(currentPopupData.y - 60) + "px",
                    transform: 'translateX(-50%)',
                    backgroundColor: "white",
                    color: "black",
                    borderRadius: "5px",
                    fontSize: "10px",
                    zIndex: 899,
                    width: "250px",
                    padding: "10px",
                    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)"
                }}
                >
                    <p>Matches job description sentence of:</p>
                    <p>
                    {
                    currentPopupData.resumeSentenceComparison.descriptionSentence.length < 150 ? 
                    currentPopupData.resumeSentenceComparison.descriptionSentence :
                    currentPopupData.resumeSentenceComparison.descriptionSentence.substring(0, 150) + "..."
                    }
                    </p>
                </div>}
            </div>
            {pageNum <= numPages - 1 && <button
            onClick={()=>{
                console.log("Setting pageNum to:");
                setCurrentPopupData(null);
                setPageNum(pageNum + 1);
                asyncLoadData(pageNum + 1);
            }}
            style={{
                position: 'absolute',
                bottom: '10px',
                right: '10px',
                backgroundColor: '#fff',
                border: 'none',
                cursor: 'pointer',
                zIndex: 900
            }}
            >
            <i className="fa fa-arrow-right" style={{ fontSize: '24px' }}></i>
            </button>}
            {pageNum > 1 && <button
            onClick={()=>{
                console.log("Setting pageNum to:");
                setCurrentPopupData(null);
                setPageNum(pageNum - 1);
                asyncLoadData(pageNum - 1);
            }}
            style={{
                position: 'absolute',
                bottom: '10px',
                left: '10px',
                backgroundColor: '#fff',
                border: 'none',
                cursor: 'pointer',
                zIndex: 900
            }}
            >
            <i className="fa fa-arrow-left" style={{ fontSize: '24px' }}></i>
            </button>}
        </div>
    )
}