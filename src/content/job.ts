//(c) 2024 Daniel DeMoney. All rights reserved.
import { LocationObject, LocationObjectFactory } from "./location";
import { Company, CompanyFactory } from "./company";
import { UserPreferences } from "./userPreferences";
import { UserSpecificJobData, UserSpecificJobDataFactory } from "./userSpecificJobData";

export const EMPTYJOB = {
    "mode": {},
    "paymentFreq": {},
    "company": {},
    "location": {}
}
/**
 * PaymentFrequency
 * 
 * Simple enum to represent the payment frequencies in a job
 */
export class PaymentFrequency {
    str: string
    constructor(paymentStr: string){
        const paymentStrs = ["hr","yr", "month"];
        if (!paymentStrs.includes(paymentStr)){
            console.log(paymentStr);
            throw new Error("Invalid payment Str");
        }
        this.str = paymentStr;
    }
    static getPerFrequencyStr(str: string): string {
        switch (str) {
            case "yr":
                return "K";
            case "hr":
                return "/hr";
            case "month":
                return "K/month";
            default:
                throw new Error("Invalid payment frequency");
        }
    }
}
/**
 * Mode
 * 
 * Simple enum to represent the payment WFM policy in a job
 */
export class Mode {
    str: string
    constructor(modeStr: string){
        const modes = ["Remote", "Hybrid", "On-site"]
        if (!modes.includes(modeStr)){
            console.log(modeStr);
            if (modeStr === null){
                throw new Error("Mode is null!")
            }
            throw new Error("Invalid Mode Str");
        }
        this.str = modeStr
    }
}

/**
 * Job
 * 
 * Representation of all the data we hold on a job INCLUDING foreign key objects.
 * 
 * so job, the company associated with the job, and the location of the job
 * 
 * @property {string} jobId: the string job id for the job. current implementation is just the 
 * linkedin unique url slug, this may very change in the future.
 * @property {number} applicants: the number of applicants in the "# people applied" on linkedin
 * @property {string} careerStage: the careerStage of the company such as the associate, director, etc str on linkedin
 * @property {string} jobName: the name of the job
 * @property {Company} company: the company object associated with the job
 * @property {number} paymentBase: lower level amount of the payment ex "100k-120k per yr" 100k is the base
 * @property {PaymentFrequency} paymentFreq: the payment frequency of the job. It is a separate enum
 * @property {number} paymentHigh: in previous example 120k would be the paymentHigh
 * @property {string} locationStr: the string given for the location of the job on linkedin. 
 * Used with the google places api to find the jobs direct location.
 * @property {Mode} mode: the element of the mode enum that has the work from home policy of the job
 * @property {number} jobPostedAt: unix timestamp of when job was posted
 * Linkedin will say something like posted 2 weeks ago
 * @property {LocationObject} location: the location object for th job. will be null for remote jobs
 * @property {UserSpecificJobData} userSpecificJobData: the data specific to a user for the job instance, null
 * for pure job instances
 */
export class Job {
    jobId : string;
    applicants: number | null;
    careerStage: string | null;
    jobName: string;
    company: Company;
    description: string;
    paymentBase: number | null;
    paymentFreq: PaymentFrequency | null;
    paymentHigh: number | null;
    locationStr: string | null;
    mode: Mode | null;
    jobPostedAt: Date;
    timeAdded: Date | null;
    location: LocationObject | null;
    userSpecificJobData: UserSpecificJobData | null;
    constructor(jobId : string, applicants: number | null, careerStage: string | null, jobName: string, company: Company, description: string, paymentBase: number | null,
        paymentFreq: PaymentFrequency | null, paymentHigh: number | null, locationStr: string | null, mode: Mode, jobPostedAt: Date, timeAdded: Date | null, 
        location: LocationObject | null, userSpecificJobData: UserSpecificJobData | null = null){
        this.jobId = jobId;
        this.applicants = applicants;
        this.careerStage = careerStage;
        this.description = description;
        this.jobName = jobName;
        this.company = company;
        this.paymentFreq = paymentFreq;
        this.paymentBase = paymentBase;
        this.paymentHigh = paymentHigh;
        this.locationStr = locationStr;
        this.mode = mode;
        this.jobPostedAt = jobPostedAt;
        this.timeAdded = timeAdded;
        this.location = location;
        this.userSpecificJobData = userSpecificJobData;
    }
    toJson() {
        return {
            jobId: this.jobId,
            applicants: this.applicants,
            careerStage: this.careerStage,
            jobName: this.jobName,
            company: this.company,
            description: this.description,
            //paymentFreq is passed below
            paymentBase: this.paymentBase,
            paymentHigh: this.paymentHigh,
            paymentFreq: this.paymentFreq?.str,
            locationStr: this.locationStr,
            //mode is passed below
            mode: this.mode?.str ?? null,
            jobPostedAt: Math.floor(this.jobPostedAt.getTime() / 1000),
            timeAdded: Math.floor(((this.timeAdded ?? new Date()).getTime()) / 1000),
            location: this.location,
            userSpecificJobData: this?.userSpecificJobData?.toJson() ?? null
        }
    }
    static getPaymentAmount(payAmt: number, frequency: string):number{
        if (frequency === "hr"){
            return payAmt * 40 * 52
        } else if (frequency === "yr"){
            return payAmt * 1000
        } else if (frequency === "month"){
            return payAmt * 12
        } else {
            console.warn("couldn't calculate payment for frequency:")
            console.warn(frequency);
            return 0;
        }
    }
}
export class JobFactory {
    /** 
    * generateFromJson
    * 
    * Creates a job item from the formatted json passed by our content script
    * 
    * @param {Record<string, any>} jsonObject: the formatted json
    * 
    * @returns {Job}
    */
    static generateFromJson(jsonObject: Record<string, any>):Job{
        console.log("Generating job with json of")
        console.log(jsonObject);
        const jobId: string = jsonObject["jobId"];
        const applicants: number | null = jsonObject["applicants"];
        const careerStage: string = jsonObject["careerStage"];
        const description: string = jsonObject["description"];
        const jobName: string = jsonObject["jobName"];
        var company: Company
        try {
            company = CompanyFactory.generateFromJson(jsonObject["company"])
        } catch (error) {
            console.log("Could not generate company with error");
            console.log(error);
            console.log(jsonObject["company"]);
            company = CompanyFactory.generateEmptyCompany(jsonObject["company"]["companyName"])
        }
        const paymentFreq: PaymentFrequency | null = jsonObject["paymentFreq"] ? new PaymentFrequency(jsonObject["paymentFreq"]) : null;
        const paymentBase: number | null = jsonObject["paymentBase"];
        const paymentHigh: number | null = jsonObject["paymentHigh"];
        const locationStr: string | null = jsonObject["locationStr"];
        const mode: Mode | null = (jsonObject["mode"] !== "" && jsonObject["mode"]) ? new Mode(jsonObject["mode"]) : null;
        const jobPostedAt: Date = new Date(Number(jsonObject["jobPostedAt"]) * 1000);
        //
        const timeAdded: Date = new Date(Number(jsonObject["timeAdded"]) * 1000);
        var location: LocationObject | null;
        try {
            location = LocationObjectFactory.generateLocationFromJson(jsonObject["location"]);
        } catch (error) {
            console.log("Could not generate location with error");
            console.log(error);
            location = null;
        }
        var userSpecificJobData: UserSpecificJobData | null;
        try {
            userSpecificJobData = UserSpecificJobDataFactory.generateWithJson(jsonObject["userSpecificJobData"]);
        } catch (error) {
            console.log("Could not generate userSpecificJobData");
            userSpecificJobData = null;
        }
        return new Job(jobId, applicants, careerStage, jobName, company, description, paymentBase, paymentFreq, paymentHigh, 
            locationStr, mode, jobPostedAt, timeAdded, location, userSpecificJobData
        )
    }
}