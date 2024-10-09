//(c) 2024 Daniel DeMoney. All rights reserved.
import { Job, EMPTYJOB, JobFactory } from "./job";
import { Resume } from "./resume";
import { User } from "./user";
import { ResumeComparison } from "./resumeComparison";
import { LocalStorageError } from "./errors";

const JOBLIMIT = 100
const RESUMELIMIT = 5

export class LocalStorageHelper {
    /**
     * __sendMessageToBgScript
     * 
     * sends a message to our backend in a promisified format to read from localStorage
     * 
     * @param message {Record<string, any>} the data to send, will include an action of getData or setData
     * @returns {Promise<any>} whether or not the request suceeded/data from request
     */
    static __sendMessageToBgScript(message: Record<string, any>):Promise<any> {
        return new Promise((resolve, reject) => {
          chrome.runtime.sendMessage(message, (response) => {
            if (chrome.runtime.lastError) {
                console.log(chrome.runtime.lastError);
              reject(new Error(String(chrome.runtime.lastError)));
            } else {
              resolve(response);
            }
          });
        });
    }
    /**
     * readJobs
     * 
     * reads jobs from localStorage 
     * @returns {Job[]} the list of jobs read from localStorage, will be empty list if none were found
     */
    static readJobs = async ():Promise<Job[]> =>{
        const response = await LocalStorageHelper.__sendMessageToBgScript({ action: 'getData', key: "jobs" });
        if (!response["success"]){
            throw new LocalStorageError("Failed grabbing data from bg script")
        }
        const jobs: Job[] = response["message"];
        //rehydrate dates
        for (const job of jobs){
            job.jobPostedAt = new Date(job.jobPostedAt);
            job.timeAdded = new Date(job.timeAdded);
            if (job.userSpecificJobData){
                job.userSpecificJobData.timeSelected = new Date(job.userSpecificJobData.timeSelected);
            }
        }
        if (jobs === undefined || jobs.length === 0){
            console.warn("No jobs found in local storage");
            return [];
        }
        return jobs;
    }
    /**
     * saveJobs
     * 
     * saves the jobs to localStorage
     * 
     * @param {Job[]} jobs - the jobs we are saving 
     */
    static saveJobs = async(jobs: Job[]):Promise<void> =>{
        console.log("Setting Jobs...");
        console.log(`Setting ${jobs.length} jobs`);
        await LocalStorageHelper.__sendMessageToBgScript({ action: 'storeData', key: "jobs", value: jobs });
    }
    /**
     * addJob
     * 
     * adds a job to our job list in localStorage
     * 
     * @param {Job} job the job we are adding to our job list
     */
    static addJob = async(job: Job):Promise<void> => {
        const jobs: Job[] = await LocalStorageHelper.readJobs();
        jobs.unshift(job);
        await LocalStorageHelper.saveJobs(jobs);
    }
    /**
     * getActiveUser
     * 
     * grabs representation of active user from localstorage
     * 
     * @returns {User | null} User in active storage if we didnt find it, returns null
     */
    static getActiveUser = async (): Promise<User | null> => {
        const response : Record<string, User | null> = await LocalStorageHelper.__sendMessageToBgScript({ action: 'getData', key: "activeUser" });
        if (!response["success"]){
            throw new LocalStorageError("Failed grabbing data from bg script")
        }
        const user: User = response["message"];
        if (!user){
            console.warn("Failed to get user from localStorage, returning null");
            return null;
        }
        return user;
    }
    /**
     * setToken
     * 
     * Sets the auth token in local storage
     * @param token : string, the string token recieved from the server
     */
    static setToken = async (token : string, expirationDate: Number): Promise<void> => {
        console.log("Setting auth token to " + token);
        await LocalStorageHelper.__sendMessageToBgScript({ action: 'storeData', key: "authToken", value: token });
        await LocalStorageHelper.__sendMessageToBgScript({ action: 'storeData', key: "authTokenExpirationDate", value: expirationDate });
    }
    /** 
    getToken

    returns the users token if found, else null
    @returns {string | null} the token or null
    */
    static getToken = async (): Promise<string | null> => {
        console.log("Getting token..");
        const response : Record<string, string | null> = await LocalStorageHelper.__sendMessageToBgScript({ action: 'getData', key: "authToken" });
        if (!response["success"]){
            throw new LocalStorageError("Failed grabbing data from bg script")
        }
        const token = response["message"];
        console.log(`Got token back of ${token}`);
        if (!token){
            console.warn("NO TOKEN LOADED")
        }
        return token
    }
    /** 
    getTokenExpiration

    returns the users token if found, else null
    @returns {string | null} the token or null
    */
    static getTokenExpiration = async (): Promise<number | null> => {
        console.log("Getting token..");
        const response : Record<string, string | null> = await LocalStorageHelper.__sendMessageToBgScript({ action: 'getData', key: "authTokenExpirationDate" });
        if (!response["success"]){
            throw new LocalStorageError("Failed grabbing data from bg script")
        }
        const expirationDate = Number(response["message"]);
        console.log(`Got token expiration back of ${expirationDate}`);
        if (!expirationDate){
            console.warn("NO TOKEN LOADED")
        }
        return expirationDate;
    }
    /**
     * setActiveUser
     * 
     * Sets users data in localStorage after login/register
     * @param {User} user: the user object we are setting active user to
     * @see: TODO add user jobs to localstorage
     * @see: add expiration data to data
     */
    static setActiveUser = async (user: User) => {
        console.log("SETTING ACTIVE USER TO " + JSON.stringify(user));
        await LocalStorageHelper.__sendMessageToBgScript({ action: 'storeData', key: "activeUser", value: user });
    }
    /**
     * readResumes
     * 
     * reads resumes from localStorage 
     * @returns {Resume[]} the list resumes jobs read from localStorage, will be empty list if none were found
     */
    static readResumes = async ():Promise<Resume[]> =>{
        const response = await LocalStorageHelper.__sendMessageToBgScript({ action: 'getData', key: "resumes" });
        if (!response["success"]){
            throw new LocalStorageError("Failed grabbing data from bg script")
        }
        const resumes: Resume[] = response["message"];
        if (resumes === undefined || resumes.length === 0){
            console.warn("No resumes found in local storage");
            return [];
        }
        //reload their serialized date strings to objects
        for (const resume of resumes){
            resume.uploadDate = new Date(resume.uploadDate);
        }
        resumes.sort((a, b) => b.uploadDate.getTime() - a.uploadDate.getTime());
        return resumes;
    }
    /**
     * saveResumes
     * 
     * saves the resumes to localStorage
     * 
     * @param {Resume[]} resumes - the resumes we are saving 
     */
    static saveResumes = async(resumes: Resume[]):Promise<void> =>{
        console.log("Setting Resumes...");
        console.log(`Setting ${resumes.length} resumes`);
        //lets not store the text and bytes haha
        for (const resume of resumes){
            resume.fileContent = null;
            resume.fileText = null;
        }
        if (resumes.length > RESUMELIMIT){
            console.warn("Too many resumes passed, cutting length to " + RESUMELIMIT)
            resumes.splice(resumes.length - RESUMELIMIT, RESUMELIMIT);
        }
        await LocalStorageHelper.__sendMessageToBgScript({ action: 'storeData', key: "resumes", value: resumes });
    }
    /**
     * addResume
     * 
     * adds a resume to our resume list in localStorage
     * 
     * @param {Resume} resume the resume we are adding to our resume list
     */
    static addResume = async(resume: Resume):Promise<void> => {
        const resumes: Resume[] = await LocalStorageHelper.readResumes();
        resumes.push(resume);
        await LocalStorageHelper.saveResumes(resumes);
    }
    /**
     * setUserData
     * 
     * called when a user logs in, after request is made to grab userData from the server this function
     * is called to set it in localStorage
     * !IMPORTANT: overrides all data previously in localStorage
     */
    static setUserData = async(userData: Record<string, any>) => {
        if ('resumes' in userData){
            userData.resumes.forEach((resume: Resume) => {
                resume.fileContent = null;
                resume.fileText = null;
            })
        }
        const keys = ["user", "jobs", "resumes", "bestResumeScores"]
        for (let key of keys) {
            if (key in userData){
                LocalStorageHelper.__sendMessageToBgScript({ action: "storeData", key: key, value: userData[key]});
            } else {
                //This will never occur for user only the list items
                LocalStorageHelper.__sendMessageToBgScript({ action: "storeData", key: key, value: []});
            }
        }
        const unixTime = Math.floor(Date.now() / 1000);
        console.debug(`Setting user data last grabbed to ${unixTime}`)
        LocalStorageHelper.__sendMessageToBgScript({ action: "storeData", key: "userDataLastGrabbed", value: unixTime});
    }
    static jobExistsInLocalStorage = async(jobId: string):Promise<boolean> => {
        console.debug("Checking if job exists in localStorage");
        console.debug(jobId);
        let jobs = await LocalStorageHelper.readJobs();
        console.debug(jobs);
        console.debug("recieved jobs from backend")
        for (const job of jobs){
            if (job.jobId === jobId){
                console.debug("Found job that matches the job id")
                console.debug(job);
                return true;
            }
        }
        console.log("couldn't find job");
        return false;
    }
    static moveJobToFront = async(jobId: string):Promise<void> => {
        console.log(`Moving ${jobId} to the front`)
        let jobs = await LocalStorageHelper.readJobs();
        let newestJob = null
        for (const job of jobs){
            if (job.jobId === jobId){
                newestJob = job;
            }
        }
        if (!newestJob){
            console.warn(`Got request to move jobId ${jobId} to front but couldn't find it`);
            return;
        }
        jobs = jobs.filter(job => job.jobId !== jobId);
        jobs.unshift(newestJob);
        await LocalStorageHelper.saveJobs(jobs);
    }
}