import React, { createElement, useState, useEffect } from 'react';
import { CircleRater } from "../helperViews/circleRater";
import { RatingFunctions } from '../../../src/content/ratingFunctions';
import { HelperFunctions } from '../../../src/content/helperFunctions';
import { RatingBulletPointsGenerator } from '../helperViews/ratingBulletsGenerator';

export const JobViewJobTab = ({job, user}) => {
    const [bulletPoints, setBulletPoints] = useState(null);
    useEffect(()=>{
        const newBulletPoints = RatingBulletPointsGenerator.getRatingBulletPoints(job, user);
        setBulletPoints(newBulletPoints);
    }, [])
    return (
        <div className='p-3' style={{"height": "490px"}}>
            <div style={{
                display: "flex",
                width: "100%",
                justifyContent: "center",
                marginTop: "-10px"
            }}>
                <CircleRater rating={RatingFunctions.getRating(job, user.preferences)} size={200} thickness={8} circleThickness={25} fontSize={64}/>
            </div>
            <p className='is-size-3 has-text-white has-text-centered p-2'>Job fit: <span style={{color: HelperFunctions.ratingToColor(RatingFunctions.getRating(job, user.preferences))}}>
                    {RatingFunctions.getJobRatingStr(RatingFunctions.getRating(job, user.preferences))}
                </span>
            </p>
            <div style={{
                display: "flex",
                width: "100%",
                justifyContent: "center",
                marginTop: "-10px"
            }}>
                <button 
                className='button is-focused is-small'
                onClick={()=>{window.open(`https://www.linkedin.com/jobs/collections/recommended/?currentJobId=${job.jobId}`)}}
                >
                    Visit Job
                </button>
            </div>
            <hr style={{margin: "5px", backgroundColor: "hsl(0deg 0% 33.33%)"}}/>
            <div className="columns" style={{ display: "flex"}}>
                <div className="column" style={{ flex: "1 1 50%" }}>
                    <p className='has-text-centered is-size-4' style={{ color: HelperFunctions.ratingToColor(1) }}>Pros</p>
                    <div style={{height: "130px", overflowY: "auto", overflowX: "hidden"}}>
                        {bulletPoints?.pros && bulletPoints.pros.map((pro, index) => (
                            <div key={index}>
                                {pro}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="column" style={{ flex: "1 1 50%" }}>
                    <p className='has-text-centered is-size-4' style={{ color: HelperFunctions.ratingToColor(0.1) }}>Cons</p>
                    <div style={{height: "130px", overflowY: "auto", overflowX: "hidden" }}>
                        {bulletPoints?.cons && bulletPoints.cons.map((con, index) => (
                            <div key={index}>
                                {con}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}


{/* <div className='job-view-rating-item'>
    <div style={{width: "100vw", display: "block"}}>
        <p className='p-2 has-text-white is-size-4 pb-4'><i class="fas fa-dollar" style={{padding: "10px"}}></i>Salary:</p>
        <div style={{height: "15px"}}>
            <ArrowRaterView width={300} rating={0.4} text={"$70,000"}/>
        </div>
        <p className='p-2 has-text-white is-size-6'><span style={{color: HelperFunctions.ratingToColor(0.2)}}>20%</span> Lower than your desired salary.</p>
    </div>
</div> */}