//(c) 2024 Daniel DeMoney. All rights reserved.
import { ScrapingError } from "@applicantiq/applicantiq_core/Core/errors";
import { HelperFunctions } from "@applicantiq/applicantiq_core/Core/helperFunctions";
import { Job, JobFactory } from "@applicantiq/applicantiq_core/Core/job";

export class IndeedFunctions {
    static urlMatchesIndeed(url: string):boolean {
        return url.includes("indeed.com");
    }
    static getJobTitle(): string{
        const jobTitleEl = document.getElementsByClassName("jobsearch-JobInfoHeader-title")[0];
        let job = (jobTitleEl.textContent ?? "").trim();
        if (job === ""){
            throw new ScrapingError("Job is empty");
        }
        if (job.endsWith(" - job post")) {
            job = job.slice(0, -11); // Remove the last 11 characters
        }
        console.log("Job: " + job);
        return job;
    }
    static getCompanyTitle(): string{
        const companyNameEl = document.querySelector('[data-testid="inlineHeader-companyName"]');
        const company = companyNameEl.textContent ?? "";
        if (company === ""){
            throw new ScrapingError("company is empty");
        }
        if (company.length > 255){
            throw new ScrapingError("company name includes css");
        }
        console.log("company: " + company);
        return company;
    }
    static getLocationStr(): string{
        let locationStrEl = document.querySelector('[data-testid="job-location"]');
        if (!locationStrEl){
            locationStrEl = document.querySelector('[data-testid="inlineHeader-companyLocation"]')
        }
        const locationStr = (locationStrEl.textContent ?? "").trim();
        if (locationStr === ""){
            return null
        }
        console.log("locationStr: " + locationStr);
        return locationStr;
    }
    static getPaymentInfo(): Record<string, any>{
        const paymentData: Record<string, number | string | null> = {paymentBase: null, paymentHigh: null, paymentFreq: null}
        const salaryInfoContainer = document.getElementById("salaryInfoAndJobType");
        const salaryStr = (salaryInfoContainer.textContent ?? "").trim();
        if (salaryStr === ""){
            return paymentData;
        }
        if (salaryStr.includes("year")){
            paymentData["paymentFreq"]  = "yr";
        }
        if (salaryStr.includes("hour")){
            paymentData["paymentFreq"]  = "hr";
        }
        if (salaryStr.includes("month")){
            paymentData["paymentFreq"]  = "month";
        }
        //Find our 2 numbers in the string by matching a regular expression
        const regex = /[\d,]+\.?\d*/g;
        const matches = salaryStr.match(regex);
        
        if (matches) {
            // Convert matched strings to numbers and return as an array
            const amounts: number[] = matches.map(match => parseFloat(match.replace(/,/g, '')));
            paymentData["paymentBase"] = Math.floor(amounts[0]/1000);
            if (amounts.length > 1){
                paymentData["paymentHigh"] = Math.floor(amounts[1]/1000);
            }
        }
        return paymentData;
    }
    static getMode(): string {
        const modeEl = document.querySelector('[data-testid="In-person-tile"]');
        if (!modeEl){
            return null;
        }
        const modeStr = (modeEl.textContent ?? "").trim();
        if (modeStr === ""){
            return null
        }
        console.log("modeStr: " + modeStr);
        return modeStr;
    }
    static getJobDescription(): string {
        const descriptionEl = document.getElementById("jobDescriptionText");
        return descriptionEl.textContent;
    }
    static getJobInfo():Job {
        const jobName = IndeedFunctions.getJobTitle();
        const company = IndeedFunctions.getCompanyTitle();
        const locationStr = IndeedFunctions.getLocationStr();
        const paymentData = IndeedFunctions.getPaymentInfo();
        const mode = IndeedFunctions.getMode();
        const description = IndeedFunctions.getJobDescription();
        const jobJson: Record<string, any> = {
            jobName: jobName, applicants: null, careerStage: null,
            description: description, company: {companyName: company}, paymentFreq: paymentData["paymentFreq"],
            paymentBase: paymentData["paymentBase"], paymentHigh: paymentData["paymentHigh"], locationStr: locationStr,
            mode: mode, jobPostedAt: Math.floor(Date.now() / 1000), timeAdded: Math.floor(Date.now() / 1000)
        }
        return jobJson;
    }
    //Called every single time a new job is loaded. Grabs information on the job and sets it in the DB. 
    //View will then render the db.
    static IndeedJobLoaded = (jobId: string, attempts: number = 5): Promise<Job> => {
        return new Promise((resolve, reject) => {
            HelperFunctions.waitForDocumentLoaded()
                .then(async () => {
                    console.log("New Job Loaded");
                    //Grabs the data directly from the linkedin website
                    var jobDataJson: Record<string, any> = {};
                    try{
                        jobDataJson = await HelperFunctions.tryWithRetry(IndeedFunctions.getJobInfo, attempts);
                    } catch (error){
                        if (error instanceof ScrapingError){
                            console.error(`Failed to get Indeed after ${attempts} retries`);
                            reject(error)
                        } 
                        throw error;
                    }
                    //Store the job ID as a UUID for our db
                    jobDataJson["jobId"] = jobId;
                    console.log("Generated job with json of: ");
                    console.log(jobDataJson);
                    const job: Job = JobFactory.generateFromJson(jobDataJson);
                    resolve(job);
                });
        })
    }
}