import React, { createElement, useState, useEffect } from 'react';
import { HelperFunctions } from "../../../src/content/helperFunctions";
import { Job } from "../../../src/content/job";
import { RatingFunctions } from "../../../src/content/ratingFunctions";
import { UserPreferences } from "../../../src/content/userPreferences";

export class RatingBulletPointsGenerator {
    static getGradientNumberSpan = (rating, shownRating, invert=false) =>{
        if (invert){
            return <span className="job-view-rating-number" style={{
                '--color1': HelperFunctions.ratingToColor(Math.max(0.01, 1 - rating - 0.15)),
                '--color2': HelperFunctions.ratingToColor(Math.max(1 - rating, 0.01))
            }}>{Math.floor(shownRating * 100)}%</span>
        }
        return <span className="job-view-rating-number" style={{
            '--color1': HelperFunctions.ratingToColor(Math.max(0.01, rating - 0.15)),
            '--color2': HelperFunctions.ratingToColor(Math.max(rating,0.01))
        }}>{Math.floor(shownRating * 100)}%</span>
    }
    static addSalaryBulletPoint = (job, preferences, ratings) => {
        const percentOfDesiredPay = Job.getPaymentAmount(job.paymentBase, job.paymentFreq.str)/preferences.desiredPay;
        const rating = RatingFunctions.getPaymentRating(job, preferences);
        console.log({rating});
        const jobSalary = Job.getPaymentAmount(job.paymentBase, job.paymentFreq.str)
        if (jobSalary === preferences.desiredPay){
            ratings.pros.push(<p className="rating-bp pro">Matches your desired pay</p>);
        } else if (jobSalary > preferences.desiredPay){
            ratings.pros.push(<p className="rating-bp pro">
                {RatingBulletPointsGenerator.getGradientNumberSpan(rating, Math.abs(percentOfDesiredPay - 1), false)} higher than your desired pay (on average)
            </p>);
        } else {
            ratings.cons.push(<p className="rating-bp con">
                {RatingBulletPointsGenerator.getGradientNumberSpan(rating + 0.5, Math.abs(percentOfDesiredPay - 1), true)} lower than your desired pay (on average)
            </p>);
        }
    }
    static addCareerStageBulletPoint = (job, preferences, ratings) => {
        const rating = RatingFunctions.getCareerStageRating(job, preferences);
        if (rating){
            ratings.pros.push(<p className="rating-bp pro">{job.careerStage}</p>);
            return;
        }
        ratings.cons.push(<p className="rating-bp con">{job.careerStage}</p>);
    }
    static addModeBulletPoint = (job, preferences, ratings) => {
        const rating = RatingFunctions.getModeRating(job, preferences);
        if (rating){
            ratings.pros.push(<p className="rating-bp pro">{job.mode.str}</p>);
            return;
        }
        ratings.cons.push(<p className="rating-bp con">{job.mode.str}</p>);
    }
    static addApplicantsBulletPoint = (job, ratings) => {
        if (job.applicants < 25){
            ratings.pros.push(<p className="rating-bp pro">Low Number of Applicants</p>);
            return;
        }
        if (job.applicants > 75){
            ratings.cons.push(<p className="rating-bp con">High Number of Applicants</p>);
            return;
        }
    }
    static addCompanyRatingBulletPoint = (job, ratings) => {
        if (job.company.overallRating > 4){
            ratings.pros.push(<p className="rating-bp pro">Great Glassdoor rating</p>);
            return;
        }
        if (job.company.overallRating > 3.5){
            ratings.pros.push(<p className="rating-bp pro">Good Glassdoor rating</p>);
            return;
        }
        if (job.company.overallRating > 3.0){
            ratings.cons.push(<p className="rating-bp con">Average Glassdoor rating</p>);
            return;
        }
        ratings.cons.push(<p className="rating-bp con">Poor Glassdoor rating</p>);
        return;
    }
    static getRatingBulletPoints = (job, preferences) => {
        const ratings = {
            pros: [],
            cons: []
        };
        if (job.paymentBase){
            RatingBulletPointsGenerator.addSalaryBulletPoint(job, preferences, ratings);
        }
        if (job.mode){
            RatingBulletPointsGenerator.addModeBulletPoint(job, preferences, ratings);
        }
        if (job.careerStage){
            RatingBulletPointsGenerator.addCareerStageBulletPoint(job, preferences, ratings);
        }
        if (job.applicants){
            RatingBulletPointsGenerator.addApplicantsBulletPoint(job, ratings);
        }
        if (job.company.overallRating){
            RatingBulletPointsGenerator.addCompanyRatingBulletPoint(job, ratings);
        }
        return ratings;
    }
}