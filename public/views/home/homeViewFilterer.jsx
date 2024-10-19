import React, { createElement, useState, useEffect, useRef } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { LocalStorageHelper } from '@applicantiq/applicantiq_core/Core/localStorageHelper';
import { showError } from '../helperViews/notifications';

export const HomeViewFilterer = ({jobs, setJobs, user}) => {
    const [isExpanded, setExpanded] = useState(false);
    const [isFiltered, setIsFiltered] = useState(false);
    const [filterByApplied, setFilterByApplied] = useState(false);
    const [filterByFavorited, setFilterByFavorited] = useState(false);
    const [filterByRemote, setFilterByRemote] = useState(false);
    const [filterByHybrid, setFilterByHybrid] = useState(false);
    const [filterByOnsite, setFilterByOnsite] = useState(false);
    const [numFilteredTo, setNumFilteredTo] = useState(false);
    const [currentKeyword, setCurrentKeyword] = useState([]);
    const [currentKeywords, setCurrentKeywords] = useState([]);
    const internalUpdateRef = useRef(false);
    const expandAnimation = useSpring({
        height: isExpanded ? '330px' : '30px', // Expands to 150px when opened
        config: { tension: 200, friction: 20 },
    });
    const filter = async () => {
        const rereadJobs = await LocalStorageHelper.readJobs();
        let filteredJobs = [...rereadJobs];
        let hasFiltered = false
        if (filterByRemote || filterByHybrid || filterByOnsite){
            hasFiltered = true;
            internalUpdateRef.current = true;
            const acceptableModes = [];
            if (filterByRemote){
                acceptableModes.push("Remote");
            }
            if (filterByHybrid){
                acceptableModes.push("Hybrid");
            }
            if (filterByOnsite){
                acceptableModes.push("On-site");
            }
            filteredJobs = filteredJobs.filter(job => acceptableModes.includes(job.mode?.str));
        }
        if (filterByApplied) {
            hasFiltered = true;
            internalUpdateRef.current = true;
            filteredJobs = filteredJobs.filter(job => job.userSpecificJobData?.hasApplied);
        }
        if (filterByFavorited) {
            hasFiltered = true
            internalUpdateRef.current = true;
            filteredJobs = filteredJobs.filter(job => job.userSpecificJobData?.isFavorite);
        }
        if (currentKeywords.length){
            hasFiltered = true;
            internalUpdateRef.current = true;
            filteredJobs = filteredJobs.filter(job => {
                // Check if any keyword is included in job description or jobName
                return currentKeywords.some(keyword => 
                    job.description?.toLowerCase().includes(keyword.toLowerCase()) || 
                    job.jobName?.toLowerCase().includes(keyword.toLowerCase())
                );
            });
        }
        setIsFiltered(hasFiltered);
        setNumFilteredTo(filteredJobs.length);
        setJobs(filteredJobs);
    }
    useEffect(() => {
        if (internalUpdateRef.current) {
            console.log("Jobs updated internally:", jobs);
            internalUpdateRef.current = false;
        } else {
            console.log("Jobs updated externally:", jobs);
            //Otherwise when we sort it breaks it
            if (jobs && jobs.length > numFilteredTo){
                setIsFiltered(false);
            }
        }
    }, [jobs])
    return (
        <>
            <animated.div 
            className='homeview-scroll-control'
            style={{ ...expandAnimation, cursor: isExpanded ? "auto" : "pointer" }}
            onClick={()=>{
                if (!isExpanded){
                    setExpanded(true);
                }
            }}
            >
                <p 
                style={{
                    fontWeight: "bold", 
                    fontSize: "14px", 
                    cursor: "pointer"
                }}
                onClick={()=>{
                    if (isExpanded){
                        setExpanded(false);
                    }
                }}
                >Filter</p>
                <i class="fa-solid fa-sliders" 
                style={{
                    position: "absolute", 
                    right: "24px", 
                    top: "15px", 
                    transform: "translateY(-50%)",
                    fontSize: "14px",
                    cursor: "pointer",
                    color: isFiltered ? "rgb(0,255,0)" : "white",
                }}
                onClick={()=>{
                    if (isExpanded){
                        setExpanded(false);
                    }
                }}
                ></i>
                {isExpanded && <div style={{padding: "10px"}}>
                    <div style={{display: "flex", justifyContent: "center"}}>
                        <div className="checkboxes mr-6" style={{flexDirection: "column"}}>
                            <label class="checkbox">
                                <input 
                                type="checkbox" 
                                className='mr-2'
                                checked={filterByApplied}
                                onChange={(e)=>{setFilterByApplied(e.target.checked)}}
                                />
                                Applied to
                            </label>
                            <label class="checkbox">
                                <input 
                                type="checkbox" 
                                className='mr-2'
                                checked={filterByFavorited}
                                onChange={(e)=>{setFilterByFavorited(e.target.checked)}}
                                />
                                Favorited
                            </label>
                        </div>
                        <div className="checkboxes ml-6" style={{flexDirection: "column"}}>
                            <label class="checkbox">
                                <input 
                                type="checkbox" 
                                className='mr-2'
                                checked={filterByRemote}
                                onChange={(e)=>{setFilterByRemote(e.target.checked)}}
                                />
                                Remote
                            </label>
                            <label class="checkbox">
                                <input 
                                type="checkbox" 
                                className='mr-2'
                                checked={filterByHybrid}
                                onChange={(e)=>{setFilterByHybrid(e.target.checked)}}
                                />
                                Hybrid
                            </label>
                            <label class="checkbox">
                                <input 
                                type="checkbox" 
                                className='mr-2'
                                checked={filterByOnsite}
                                onChange={(e)=>{setFilterByOnsite(e.target.checked)}}
                                />
                                On Site
                            </label>
                        </div>
                    </div>
                    <div className="field mt-3">
                        <label className="label is-size-6">Filter by Keywords:</label>
                        <div className='field has-addons'>
                            <div className="control is-expanded">
                                <input
                                    style={{height:"30px"}}
                                    className='input'
                                    placeholder="ex: 'contract', 'agile'"
                                    name='keywordInput'
                                    value={currentKeyword}
                                    maxLength={32}
                                    onChange={(e) => {setCurrentKeyword(e.target.value)}}
                                />
                            </div>
                            <div class="control">
                                <button 
                                class="button is-info" 
                                style={{height:"30px"}}
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (currentKeywords.includes(currentKeyword)){
                                        showError(`You already added ${currentKeyword}`);
                                        return;
                                    }
                                    if (currentKeywords.length >= 5){
                                        showError("Cannot add more than 5 keywords");
                                        return;
                                    }
                                    if (!currentKeyword.length){
                                        return;
                                    }
                                    const currentKeywordsCopy = currentKeywords;
                                    currentKeywordsCopy.push(currentKeyword);
                                    setCurrentKeywords(currentKeywordsCopy);
                                    setCurrentKeyword("");
                                }}
                                >
                                Add
                                </button>
                            </div>
                        </div>
                        <div className='keyword-box'>
                            {currentKeywords.map((keyword, index) => 
                                <div key={index} className="button is-small is-info" style={{ display: "inline-flex", alignItems: "center", margin: "4px", height: "20px" }}>
                                {keyword}
                                    <i 
                                        className="fas fa-times" 
                                        style={{ cursor: "pointer", fontSize: "10px", marginLeft: "4px"}}
                                        onClick={()=>{
                                            const currentKeywordsCopy = currentKeywords.filter(curKeyword => curKeyword !== keyword);
                                            setCurrentKeywords(currentKeywordsCopy);
                                        }}
                                    ></i>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className='mt-3' style={{display: "flex", justifyContent: "center"}}>
                        <button 
                        className='button is-success is-small m-2'
                        onClick={filter}
                        >
                            Apply
                        </button>
                        <button 
                        className='button is-danger is-small m-2'
                        onClick={async ()=>{
                            //react weirdness
                            console.log("resetting jobs");
                            const rereadJobs = await LocalStorageHelper.readJobs();
                            setJobs(rereadJobs);
                            setIsFiltered(false);
                            setExpanded(false);
                        }}
                        >
                            Clear
                        </button>
                    </div>
                </div>}
            </animated.div>
            <hr className='job-row-divider'/>
        </>
    )
}