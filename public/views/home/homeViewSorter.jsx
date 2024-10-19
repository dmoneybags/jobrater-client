import React, { createElement, useState, useEffect, useRef } from 'react';
import { Job } from '@applicantiq/applicantiq_core/Core/job';
import { useSpring, animated } from '@react-spring/web';
import { LocalStorageHelper } from '@applicantiq/applicantiq_core/Core/localStorageHelper';
import { RatingFunctions } from '@applicantiq/applicantiq_core/Core/ratingFunctions';

export const HomeViewSorter = ({jobs, setJobs, user, bestResumeScores}) => {
    const [isExpanded, setExpanded] = useState(false);
    const [isSorted, setIsSorted] = useState(false);
    const [sortOrder, setSortOrder] = useState('Descending');
    const [sortBy, setSortBy] = useState('salary');
    const internalUpdateRef = useRef(false);
    const expandAnimation = useSpring({
        height: isExpanded ? '130px' : '30px', // Expands to 150px when opened
        config: { tension: 200, friction: 20 },
    });
    const sort = () => {
        console.log("Sorting jobs");
        //react weird reference thingy you have to copy
        const jobsCopy = [...jobs];
        setIsSorted(true);
        internalUpdateRef.current = true;

        switch (sortBy){
            case "salary":
                const sortedSalaryJobs = jobsCopy.sort((a, b) => {
                    if (!a.paymentBase) return 1;
                    if (!b.paymentBase) return -1;
                    return sortOrder === "Descending" ? 
                    Job.getPaymentAmount(b.paymentBase, b.paymentFreq.str) - Job.getPaymentAmount(a.paymentBase, a.paymentFreq.str) : 
                    Job.getPaymentAmount(a.paymentBase, a.paymentFreq.str) - Job.getPaymentAmount(b.paymentBase, b.paymentFreq.str);
                });
                console.log(sortedSalaryJobs);
                setJobs(sortedSalaryJobs);
                break;
            case "resume":
                const sortedResumeJobs = jobsCopy.sort((a, b) => {
                    if (!bestResumeScores[a.jobId]) return 1;
                    if (!bestResumeScores[b.jobId]) return -1;
                    return sortOrder === "Descending" ? 
                    bestResumeScores[b.jobId] - bestResumeScores[a.jobId] : 
                    bestResumeScores[a.jobId] - bestResumeScores[b.jobId];
                });
                console.log(sortedResumeJobs);
                setJobs(sortedResumeJobs);
                break;
            case "job score":
                const sortedJobScoreJobs = jobsCopy.sort((a, b) => {
                    return sortOrder === "Descending" ? 
                    RatingFunctions.getRating(b, user.preferences) - RatingFunctions.getRating(a, user.preferences) : 
                    RatingFunctions.getRating(a, user.preferences) - RatingFunctions.getRating(b, user.preferences);
                });
                console.log(sortedJobScoreJobs);
                setJobs(sortedJobScoreJobs);
                break;
            case "applicants":
                const sortedApplicantJobs = jobsCopy.sort((a, b) => {
                    if (a.applicants != 0 && !a.applicants) return 1;
                    if (b.applicants != 0 && !b.applicants) return -1;
                    return sortOrder === "Descending" ? 
                    b.applicants - a.applicants : 
                    a.applicants - b.applicants;
                });
                console.log(sortedApplicantJobs);
                setJobs(sortedApplicantJobs);
                break;
            case "time posted":
                const sortedTimePostedJobs = jobsCopy.sort((a, b) => {
                    if (!a.jobPostedAt) return 1;
                    if (!b.jobPostedAt) return -1;
                    return sortOrder === "Descending" ? 
                    b.jobPostedAt.getTime() - a.jobPostedAt.getTime() : 
                    a.jobPostedAt.getTime() - b.jobPostedAt.getTime();
                });
                console.log(sortedTimePostedJobs);
                setJobs(sortedTimePostedJobs);
                break;
        }
    }
    useEffect(() => {
        if (internalUpdateRef.current) {
            console.log("Jobs updated internally:", jobs);
            internalUpdateRef.current = false;
        } else {
            console.log("Jobs updated externally:", jobs);
            setIsSorted(false);
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
                >
                    Sort
                </p>
                <i class="fa-solid fa-sort" 
                style={{
                    position: "absolute", 
                    right: "27px", 
                    top: "15px", 
                    transform: "translateY(-50%)",
                    fontSize: "14px",
                    cursor: "pointer",
                    color: isSorted ? "rgb(0,255,0)" : "white"
                }}
                onClick={()=>{
                    if (isExpanded){
                        setExpanded(false);
                    }
                }}
                >
                </i>
                {isExpanded && <div style={{padding: "10px"}}>
                    <div style={{display: "flex"}}>
                        <div>
                            <p>Sort by <span>
                                <div class="select is-small">
                                    <select value={sortBy} onChange={(e)=>{setSortBy(e.target.value)}}>
                                        <option value="salary" selected>Salary (base)</option>
                                        <option value="resume">Resume Score</option>
                                        <option value="job score">Job Score</option>
                                        <option value="applicants">Applicants</option>
                                        <option value="time posted">Time Posted</option>
                                    </select>
                                </div>
                                </span>
                            </p>
                        </div>
                        <div style={{marginLeft: "22px"}}>
                            <div class="control has-icons-left">
                                <div class="select is-small">
                                    <select value={sortOrder} onChange={(e)=>{
                                        console.log("Setting sort order to");
                                        console.log(e.target.value);
                                        setSortOrder(e.target.value)}}
                                    >
                                        <option value="Descending" selected>Descending</option>
                                        <option value="Ascending">Ascending</option>
                                    </select>
                                </div>
                                <div class="icon is-small is-left">
                                    <i class={`fa-solid ${sortOrder === "Descending" ? "fa-arrow-down" : "fa-arrow-up"}`}></i>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='mt-3' style={{display: "flex", justifyContent: "center"}}>
                        <button 
                        className='button is-success is-small m-2'
                        onClick={sort}
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
                            setIsSorted(false);
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