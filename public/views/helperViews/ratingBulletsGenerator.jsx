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
    static addTimePostedAgoBulletPoint = (job, ratings) => {
        const dateConsideredRecently = Math.floor(Date.now()/1000) - (5 * HelperFunctions.getTimeFrameSeconds("day"));
        //hacky but for some reason it gets implicitly converted to str, we love javascript!
        if (typeof job.jobPostedAt == "string"){
            job.jobPostedAt = new Date(job.jobPostedAt);
        }
        if (Math.floor(job.jobPostedAt.getTime() / 1000) > dateConsideredRecently){
            ratings.pros.push(<p className="rating-bp pro">Posted Recently</p>);
        }
    }
    static addNearbyBulletPoint = (job, user, ratings) => {
        function areLocationsNearby(userLocation, jobLocation, thresholdKm = 30) {
            // Approximate conversion factors for latitude and longitude to kilometers
            const kmPerDegreeLat = 111; // 1 degree latitude ≈ 111 km
            const kmPerDegreeLon = 111 * Math.cos(userLocation.latitude * Math.PI / 180); // Adjust by latitude
        
            // Calculate the difference in latitudes and longitudes
            const dLat = (jobLocation.latitude - userLocation.latitude) * kmPerDegreeLat;
            const dLon = (jobLocation.longitude - userLocation.longitude) * kmPerDegreeLon;
        
            // Use Pythagoras' theorem to calculate the distance
            const distanceKm = Math.sqrt(dLat * dLat + dLon * dLon);
        
            // Return true if distance is within the threshold, otherwise false
            return distanceKm <= thresholdKm;
        }
        if (areLocationsNearby(user.location, job.location)){
            ratings.pros.push(<p className="rating-bp pro">Nearby</p>);
        }
    }
    static getRatingBulletPoints = (job, user) => {
        const ratings = {
            pros: [],
            cons: []
        };
        if (job.paymentBase){
            RatingBulletPointsGenerator.addSalaryBulletPoint(job, user.preferences, ratings);
        }
        if (job.mode){
            RatingBulletPointsGenerator.addModeBulletPoint(job, user.preferences, ratings);
        }
        if (job.careerStage){
            RatingBulletPointsGenerator.addCareerStageBulletPoint(job, user.preferences, ratings);
        }
        if (job.applicants){
            RatingBulletPointsGenerator.addApplicantsBulletPoint(job, ratings);
        }
        if (job.company.overallRating){
            RatingBulletPointsGenerator.addCompanyRatingBulletPoint(job, ratings);
        }
        if (job.jobPostedAt){
            RatingBulletPointsGenerator.addTimePostedAgoBulletPoint(job, ratings);
        }
        if (job.location && user.location){
            RatingBulletPointsGenerator.addNearbyBulletPoint(job, user, ratings)
        }
        return ratings;
    }
}