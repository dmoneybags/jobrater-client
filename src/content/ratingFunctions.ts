//(c) 2024 Daniel DeMoney. All rights reserved.
import { HelperFunctions } from "./helperFunctions";
import { Job } from "./job";
import { UserPreferences } from "./userPreferences";

export class RatingFunctions {
    /**
     * getPaymentRating
     */
    static getPaymentRating(job: Job, preferences: UserPreferences):number{
        const calculatedPaymentBase = Job.getPaymentAmount(job.paymentBase, job.paymentFreq.str);
        const calculatedPaymentHigh = Job.getPaymentAmount(job.paymentHigh, job.paymentFreq.str);
        const payRating = Math.min(((calculatedPaymentBase + calculatedPaymentHigh)/2)/(preferences.desiredPay * 1.5), 1);
        return payRating;
    }
    /**
     * getModeRating
     */
    static getModeRating(job: Job, preferences: UserPreferences):number{
        switch(job.mode.str){
            case "Remote":
                if (preferences.desiresRemote){
                    return 1;
                } else {
                    return 0;
                }
            case "Hybrid":
                if (preferences.desiresHybrid){
                    return 1;
                } else {
                    return 0;
                }
            case "On-site":
                if (preferences.desiresOnsite){
                    return 1;
                } else {
                    return 0;
                }
            default:
                return 0;
        }
    }
    /**
     * getApplicantsRating
     */
    static getApplicantsRating(job: Job):number{
        console.debug(`Applicants: ${job.applicants}`)
        return 1 - Math.min(job.applicants/100, 1);
    }
    /**
     * getTimePostedAgoRating
     */
    static getTimePostedAgoRating(job: Job):number{
        const timeDelta = Math.floor(Date.now() / 1000) - Math.floor(new Date(job.jobPostedAt).getTime() / 1000);
        const sixWeeksSeconds = HelperFunctions.getTimeFrameSeconds("week") *  6;
        const rating = Math.min(1 - timeDelta/sixWeeksSeconds, 1);
        return rating;
    }
    /**
     * getCareerStageRating
     */
    static getCareerStageRating(job: Job, preferences: UserPreferences):number{
        switch (preferences.desiredCareerStage){
            case "Entry level":
                if (job.careerStage === "Entry level" || job.careerStage === "Associate" || job.careerStage === "Internship"){
                    return 1;
                }
                break;
            case "Mid-Senior level":
                if (job.careerStage === "Mid-Senior level"){
                    return 1;
                }
                break;
            case "Executive":
                if (job.careerStage === "Executive" || job.careerStage === "Director"){
                    return 1;
                }
                break;
        }
        return 0;
    }
    /**
     * getCommuteRating
     */
    static getCommuteRating(commuteSeconds: number, preferences: UserPreferences):number{
        //Desired commmute comes in minutes
        const rating = 1 - Math.min(1, (commuteSeconds/(preferences.desiredCommute * 1.2 * 60)))
        console.debug("commuteSeconds");
        console.debug(commuteSeconds);
        console.debug("preferences");
        console.debug(preferences);
        console.debug("commuteRating");
        console.debug(rating)
        return rating;
    }
    /**
     * getCareerStageRating
     */
    //pass
    /** 
     * getRating
     * 
     * Static function becuase its quicker than loading all stuff from local storage into custom objects.
     * 
     * Takes arg of a job and a users preferences and returns a number 0-1
    */
    static getRating(job: Job, preferences: UserPreferences):number {
        try {
            let ratings = [];
            //add check for if payment frequency exists
            //PAY RATING
            if (job.paymentFreq?.str){
                const payRating = RatingFunctions.getPaymentRating(job, preferences);
                console.debug(`Pay rating ${payRating}`)
                ratings.push(payRating);
            } else {
                console.debug("Couldn't get pay rating");
            }
            //END PAY RATING

            //MODE RATING
            if (job.mode?.str){
                const modeRating = RatingFunctions.getModeRating(job, preferences);
                ratings.push(modeRating);
                console.debug(`Mode rating ${modeRating}`)
            } else {
                console.debug("Couldn't get mode rating")
            }
            //END MODE RATING

            //APPLICANTS RATING
            const applicantsRating = RatingFunctions.getApplicantsRating(job);
            ratings.push(applicantsRating);
            console.debug(`Applicants rating ${applicantsRating}`);
            //END APPLICANTS RATING

            //JOB POSTED AT RATING
            if (job.jobPostedAt){
                const timePostedAgoRating = RatingFunctions.getTimePostedAgoRating(job);
                ratings.push(timePostedAgoRating);
                console.debug(`TimePostedAgo rating ${timePostedAgoRating}`);
            } else {
                console.debug("Couldn't get time posted ago rating");
            }
            //END JOB POSTED AT RATING

            //CAREER STAGE RATING
            if (job.careerStage){
                const careerStageRating = RatingFunctions.getCareerStageRating(job, preferences);
                ratings.push(careerStageRating);
                console.debug(`CareerStageRating rating ${careerStageRating}`);
            } else {
                console.debug("Couldn't get career stage rating");
            }
            //END CAREER STAGE RATING

            //OVERALL COMPANY RATING
            //Check that it actually has company data in glassdoor
            if (job.company.overallRating > 0.5){
                ratings.push(job.company.overallRating/5);
                console.debug(`Overall company rating: ${job.company.overallRating}`)
            } else {
                console.debug("Couldn't get overall company rating")
            }
            //END OVERALL COMPANY RATING

            //OVERALL AMOUNT OF INFORMATION RATING
            //4 is hardcoded change if we add more
            const amountOfInformationRating = Math.min(ratings.length, 6)/6
            ratings.push(amountOfInformationRating);
            console.debug(`Amount of information rating ${amountOfInformationRating}`)
            console.debug("Ratings:")
            console.debug(ratings);
            const rating = Math.min(ratings.reduce((sum, current) => sum + current, 0) / ratings.length, 1.000000000000001)
            console.debug(`Rated ${job.jobName} at ${job.company.companyName} to be ${rating}`);
            return rating;
        } catch (err) {
            console.debug(err);
            console.warn(`Coudln't get rating for ${job.jobName} returning 0`)
            return 0;
        }
    }
    static getJobRatingStr = (rating: number):string => {
        if (rating < 0.25){
            return "Poor";
        }
        if (rating < 0.5){
            return "Not great";
        }
        if (rating < 0.65){
            return "Fair";
        }
        if (rating < 0.8){
            return "Good";
        }
        return "Great!";
    }
}