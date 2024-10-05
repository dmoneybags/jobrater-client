import React, { createElement, useState, useEffect, useRef } from 'react';
import { HorizontalBubbleRaterView } from '../helperViews/horizontalBubbleRaterView';
import { HelperFunctions } from '../../../src/content/helperFunctions';
import { GlassdoorScrapingFunctions } from '../../../src/content/glassdoor'
import glassdoorLogo from '../../../src/assets/images/cdnlogo.com_glassdoor.svg';

const ratingAttributeNames = ["businessOutlookRating", "careerOpportunitiesRating",
   "ceoRating", "compensationAndBenefitsRating", "cultureAndValuesRating", "diversityAndInclusionRating",
   "seniorManagementRating", "workLifeBalanceRating"
]
const printableRatingNames = {
    "businessOutlookRating": "Business Outlook",
    "careerOpportunitiesRating": "Career Opportunities",
    "ceoRating": "CEO",
    "compensationAndBenefitsRating": "Compensation and Benefits",
    "cultureAndValuesRating": "Culture and Values",
    "diversityAndInclusionRating": "Diversity and Inclusion",
    "seniorManagementRating": "Senior Management",
    "workLifeBalanceRating": "Work Life Balance"
}
const outOfOneRatings = {"businessOutlookRating":"","ceoRating":""}
const ratingDescriptions = {
    "businessOutlookRating": "This rating reflects employees' confidence in the company's future growth and stability. It assesses how optimistic workers are about the company's prospects and market position.",
    "careerOpportunitiesRating": "This rating evaluates how well the company supports professional development and internal growth. It measures the availability of promotions and chances for skill enhancement.",
    "ceoRating": "This score represents employees' approval of the CEO's leadership and vision. It assesses how well the CEO aligns with the company's goals and workers' expectations.",
    "compensationAndBenefitsRating": "This rating measures employee satisfaction with pay, bonuses, and perks. It reflects how well compensation matches industry standards and employees' expectations.",
    "cultureAndValuesRating": "This score evaluates the company's work environment and ethical standards. It reflects how well employees resonate with the company's mission and core values.",
    "diversityAndInclusionRating": "This rating assesses how inclusive the workplace is for diverse backgrounds. It measures the company's efforts to promote equal opportunities and create a welcoming environment.",
    "seniorManagementRating": "This score reflects employees' perceptions of the leadership team's effectiveness. It evaluates how well senior management communicates, leads, and supports employees.",
    "workLifeBalanceRating": "This rating measures how well employees can balance their professional and personal lives. It reflects the company's flexibility with schedules, time off, and workload management."
}

export const CompanyViewJobTab = ({job}) => {
    useEffect(()=>{
        console.log("Loading company view with:");
        console.log(job.company);
    }, [])
    return (
        <div className='pr-2 pl-2'>
            {job.company.overallRating > 0.08 && (<>
                <div style={{height: "80px", marginTop: "15px"}}>
                    <div 
                    className='resume-tab-match-score job-view-rating-number'
                    style={{
                        '--color1': HelperFunctions.ratingToColor(Math.max(0.01, job.company.overallRating/5 - 0.15)),
                        '--color2': HelperFunctions.ratingToColor(Math.max(job.company.overallRating/5, 0.01))
                    }}
                    >
                        {job.company.overallRating}
                        <span style={{ fontSize: '24px' }}>/5</span>
                    </div>
                    <div style={{display: "flex", justifyContent: "space-between"}}>
                        <div style={{width: "250px", height: "48px"}}>
                            <p className={`has-text-white ${job.company.companyName.length > 12 ? "is-size-6" : "is-size-3"}`}>
                                {job.company.companyName}
                            </p>
                        </div>
                    </div>
                    <HorizontalBubbleRaterView height={30} width={250} rating={job.company.overallRating/5}/>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
                    <p style={{ marginRight: '5px' }}>Powered by</p>
                    <img src={glassdoorLogo} alt="Glassdoor logo" style={{ width: '80px' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
                    <button 
                    className='button is-link'
                    onClick={() => window.open(job.company.glassdoorUrl, "_blank")}
                    >
                        View on Glassdoor
                    </button>
                </div>
                <div style={{height: "300px", overflowY: "scroll", overflowX: "hidden", padding: "10px"}}>
                    {ratingAttributeNames.map((attributeName)=>{
                        // we will get values like -0.1 and 0.1 for faulty record
                        return (job.company[attributeName] > 0.12 && (<div style={{position: "relative"}}>
                            <hr style={{ width: '90%', margin: '0 auto' }} />
                            <p className='has-text-white'>{printableRatingNames[attributeName]}</p>
                            <p style={{fontSize: "12px", width: "250px"}}>{ratingDescriptions[attributeName]}</p>
                            <div 
                            className='resume-tab-match-score job-view-rating-number'
                            style={{
                                '--color1': HelperFunctions.ratingToColor(Math.max(0.01, job.company[attributeName]/((attributeName in outOfOneRatings) ? 1:5) - 0.15)),
                                '--color2': HelperFunctions.ratingToColor(Math.max(job.company[attributeName]/((attributeName in outOfOneRatings) ? 1:5), 0.01)),
                                top: "50%",
                                transform: "translateY(-50%)",
                                marginRight: "5px",
                                fontSize: Math.floor(job.company[attributeName]/((attributeName in outOfOneRatings) ? 1:5) * 100) === 100 ? "50px" : "64px"
                            }}
                            >
                                {Math.floor(job.company[attributeName]/((attributeName in outOfOneRatings) ? 1:5) * 100)}
                                <span style={{ fontSize: '24px' }}>%</span>
                            </div>
                        </div>))
                        }
                    )}
                </div>
            </>)}
            {job.company.overallRating < 0.08 && (
                <div style={{display: "flex", justifyContent: "center"}}>
                    <p className='has-text-white is-size-3' style={{textAlign: "center"}}>Could not find Glassdoor data</p>
                </div>
            )}
        </div>
    )
}