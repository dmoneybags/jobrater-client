//(c) 2024 Daniel DeMoney. All rights reserved.
/*
Execution flow:

ContentScript:
Scrapes page for current job
\/
\/
databaseCalls
Is called to validate if the company data already exists in our db 
is called to add company/job to db

SignUp.html
\/
\/
databaseCalls
is called to validate if a user already exists 
returns tokens
adds new users to db
*/
import { UserFactory, User } from "./user";
import { Job, JobFactory } from "./job"
import { Resume, ResumeFactory } from "./resume";
import { setTokenHeader } from "./auth";
import { HelperFunctions } from "./helperFunctions";
import { LocalStorageHelper } from "./localStorageHelper";
import { ResumeComparison } from "./resumeComparison";
import { UserSpecificJobData, UserSpecificJobDataFactory } from "./userSpecificJobData";
import { UserPreferences, UserPreferencesFactory } from "./userPreferences";
import { LocationObjectFactory } from "./location";
import { json } from "stream/consumers";

const isProduction = CLIENT_ENV.ENVIRONMENT === 'production';
const DATABASESERVER = isProduction ? CLIENT_ENV.PROD_API_URL:CLIENT_ENV.DEV_API_URL;

export class DatabaseCalls{
    /**
     * checkIfCompanyExists
     * 
     * Asychronously queries our db to check if a company has already been scraped
     * 
     * @param {string} company: the string company name we are checking
     * @returns {Promise<boolean>}: will resolve to true or false depending on if the company exists
     */
    static checkIfCompanyExists = (company: string):Promise<boolean> => {
        //create a promise to resolve it asynchronously
        return new Promise(async (resolve, reject) => {
            //Our python program runs on port 5000 on our local server
            var xhr: XMLHttpRequest = new XMLHttpRequest();
            //call an http request
            console.log("Sending Request to get company");
            xhr.open('GET', DATABASESERVER + 'databases/read_company?company=' + encodeURIComponent(company), true);
            await setTokenHeader(xhr);
            xhr.onload = function () {
                //It suceeded
                if (xhr.status == 200){
                    console.log("Recieved the company from the db");
                    resolve(true);
                } else {
                    resolve(false);
                }
            };
            //Couldnt load the http request
            xhr.onerror = function () {
                console.error('Request failed. Network error');
                reject(xhr.statusText);
            };
            //send our response
            xhr.send();
        });
    }
    /**
     * sendMessageToAddJob
     * 
     * we send our jobjson to server and server adds it to db and sends it back with all fk data
     * 
     * will check before if company is in db, if company is not in db will scrape glassdoor and add page source to request
     * 
     * If glassdoor request fails, page source will be null and server will attempt to scrape
     * 
     * @param {Job} job
     * @returns {Promise<Record<string, any>>} contains the finished job under the "job" keyword
     */
    static sendMessageToAddJob = (job: Job):Promise<Record<string, any>> => {
        const jobJson: Record<string, any> = job.toJson();
        console.log("Sending message to add job");
        console.log(jobJson);
        //create a promise to resolve it asynchronously
        return new Promise(async (resolve, reject) => {
            //glassdoor page source
            let gdPageSource = null;
            let gdUrl = null;
            let noCompanies = false;
            if (job?.company?.companyName){
                const companyExists = await DatabaseCalls.checkIfCompanyExists(job.company.companyName);
                if (!companyExists){
                    const gdData = await LocalStorageHelper.__sendMessageToBgScript({action: "scrapeGd", company: job.company.companyName});
                    gdPageSource = gdData.gdPageSource;
                    gdUrl = gdData.gdUrl;
                    noCompanies = gdData.noCompanies;
                }
            }
            const activeUser = await LocalStorageHelper.getActiveUser();
            //Our database program runs on port 5001 on our local server
            var xhr = new XMLHttpRequest();
            //call an http request
            xhr.open('POST', DATABASESERVER + 'databases/add_job' + (activeUser.preferences.saveEveryJobByDefault ? "?addUserJob=1":""), true);
            xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
            await setTokenHeader(xhr);
            xhr.onload = function () {
                //It suceeded
                if (xhr.status === 200) {
                    //change it to json
                    var response: string = xhr.responseText;
                    const responseJson: Record<string, any> = JSON.parse(response);
                    console.log("Add Job Request Suceeded");
                    resolve(responseJson);
                } else {
                    //Didnt get a sucessful message
                    console.log('Request failed. Status:', xhr.status);
                    reject(String(xhr.status));
                }
            };
            //Couldnt load the http request
            xhr.onerror = function () {
                console.error('Request failed. Network error');
                reject(String(xhr.status));
            };
            //send our response
            xhr.send(
                JSON.stringify({job: jobJson, gdPageSource: gdPageSource, gdUrl: gdUrl, noCompanies: noCompanies})
            );
        });
    };
    /**
     * getUserData
     * 
     * Gets user data from db using the token to identify the user
     * 
     * INVALIDATES CACHE AND CLEARS IT!
     * 
     * @returns {Promise<Record<string, any>>} user, jobs, and resumes
     */
    static getUserData = (): Promise<Record<string, any>> => {
        return new Promise(async (resolve, reject) => {
            const xhr: XMLHttpRequest = new XMLHttpRequest();
            xhr.open('GET', `${DATABASESERVER}databases/get_user_data`, true);
            await setTokenHeader(xhr);
            xhr.onload = () => {
                if (xhr.status === 200) {
                    try {
                        const response: Record<string, any> = JSON.parse(xhr.responseText);
                        console.log(`Read user data of ${xhr.responseText}`);
                        const jsonJobs: Record<string, any>[] = response["jobs"];
                        const jsonResumes: Record<string, any>[] = response["resumes"];
                        const jobs : Job[] = jsonJobs.map((job) => JobFactory.generateFromJson(job));
                        const resumes : Resume[] = jsonResumes.map((resume) => ResumeFactory.generateFromJson(resume));
                        const bestResumeScores: Record<string, number | null> = response["bestResumeScores"];
                        resolve({
                            user: UserFactory.generateFromJson(response["user"]),
                            jobs: jobs,
                            resumes: resumes,
                            bestResumeScores: bestResumeScores
                        });
                    } catch (error) {
                        console.error('Error parsing JSON response', error);
                        console.log(xhr.responseText);
                        reject(new Error('Invalid JSON response'));
                    }
                } else if (xhr.status === 404) {
                    console.log('User not found in db');
                    reject(new Error(`User not found`));
                } else {
                    console.error(`Request failed. Status: ${xhr.status}`);
                    reject(String(xhr.status));
                }
            };
    
            xhr.onerror = () => {
                console.error('Request failed. Network error');
                reject('Network error');
            };
    
            xhr.send();
        });
    };
    /**
     * sendMessageToDeleteUser
     * 
     * sends message to delete user. The user is loaded from the token
     * 
     * @returns {Promise<string>}
     */
    static sendMessageToDeleteUser = ():Promise<string> => {
        //create a promise to resolve it asynchronously
        return new Promise(async (resolve, reject) => {
            //Our python program runs on port 5007 on our local server
            var xhr = new XMLHttpRequest();
            //call an http request
            xhr.open('POST', DATABASESERVER + 'databases/delete_user', true);
            await setTokenHeader(xhr);
            xhr.onload = function () {
                //It suceeded
                if (xhr.status === 200) {
                    //change it to json
                    var response: string = xhr.responseText;
                    console.log(response)
                    //resolve the token
                    resolve(response);
                } else {
                    //Didnt get a sucessful message
                    console.error('Request failed. Status:', xhr.status);
                    reject(String(xhr.status));
                }
            };
            //Couldnt load the http request
            xhr.onerror = function () {
                console.error('Request failed. Network error');
                reject('Network error');
            };
            //send our response
            xhr.send();
        });
    }
    /**
     * sendMessageToAddResume
     * 
     * Sends a message to our backend to add a resume
     * 
     * @param {Resume} resume, the resume we are going to add
     * @returns {Resume} the more processed resume our backend returned
     */
    static sendMessageToAddResume = (resumeObj: Resume):Promise<Resume> => {
        //create a promise to resolve it asynchronously
        return new Promise(async (resolve, reject) => {
            //Our python program runs on port 5007 on our local server
            var xhr = new XMLHttpRequest();
            //call an http request
            xhr.open('POST', DATABASESERVER + 'databases/add_resume', true);
            xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
            await setTokenHeader(xhr);
            xhr.onload = function () {
                //It suceeded
                if (xhr.status === 200) {
                    //change it to json
                    const response: string = xhr.responseText;
                    const responseJson: Record<string, any> = JSON.parse(response);
                    //resolve the token
                    resolve(ResumeFactory.generateFromJson(responseJson));
                } else {
                    //Didnt get a sucessful message
                    console.error('Request failed. Status:', xhr.status);
                    reject(String(xhr.status));
                }
            };
            //Couldnt load the http request
            xhr.onerror = function () {
                console.error('Request failed. Network error');
                reject('Network error');
            };
            //send our response
            xhr.send(JSON.stringify({
                resume: resumeObj.toJson()
            }));
        });
    }
    /**
     * sendMessageToReplaceResume
     * 
     * Sends a message to our backend to replace a resume with a new resume
     * 
     * @param {Resume} resume, the resume we are going to add
     * @param {Number} oldID, the id of the resume we are deleting
     * @returns {Resume} the more processed resume our backend returned
     */
    static sendMessageToReplaceResume = (resumeObj: Resume, oldId: Number):Promise<Resume> => {
        //create a promise to resolve it asynchronously
        return new Promise(async (resolve, reject) => {
            //Our python program runs on port 5007 on our local server
            var xhr = new XMLHttpRequest();
            //call an http request
            xhr.open('POST', DATABASESERVER + 'databases/add_resume', true);
            xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
            await setTokenHeader(xhr);
            xhr.onload = function () {
                //It suceeded
                if (xhr.status === 200) {
                    //change it to json
                    const response: string = xhr.responseText;
                    const responseJson: Record<string, any> = JSON.parse(response);
                    //resolve the token
                    resolve(ResumeFactory.generateFromJson(responseJson));
                } else {
                    //Didnt get a sucessful message
                    console.error('Request failed. Status:', xhr.status);
                    reject(String(xhr.status));
                }
            };
            //Couldnt load the http request
            xhr.onerror = function () {
                console.error('Request failed. Network error');
                reject('Network error');
            };
            //send our response
            xhr.send(JSON.stringify({
                resume: resumeObj.toJson(),
                replace: true,
                oldId: oldId
            }));
        });
    }
    /**
     * sendMessageToDeleteResume
     * 
     * Sends a message to our backend to delete a resume
     * 
     * @param {Resume} resume, the resume we are going to add
     * @returns {Promise<string>}
     */
    static sendMessageToDeleteResume = (resume: Resume):Promise<string> => {
        //create a promise to resolve it asynchronously
        return new Promise(async (resolve, reject) => {
            //Our python program runs on port 5007 on our local server
            var xhr = new XMLHttpRequest();
            //call an http request
            xhr.open('POST', DATABASESERVER + 'databases/delete_resume?resumeId=' + String(resume.id), true);
            await setTokenHeader(xhr);
            xhr.onload = function () {
                //It suceeded
                if (xhr.status === 200) {
                    //change it to json
                    const response: string = xhr.responseText;
                    resolve(response);
                } else {
                    //Didnt get a sucessful message
                    console.error('Request failed. Status:', xhr.status);
                    reject(String(xhr.status));
                }
            };
            //Couldnt load the http request
            xhr.onerror = function () {
                console.error('Request failed. Network error');
                reject('Network error');
            };
            //send our response
            xhr.send();
        });
    }
    /**
     * sendMessageToCompareResumes
     * 
     * sends a message to our backend to compare each of a users resumes to a
     * job description 
     * 
     * the json comes in in the form of 
     * 
     * {
     *  resumeId{
     *      {
     *      similarityMatrix
     *      sortedIndexList
     *      jobDescriptionSentences
     *      resumeSentences
     *      }
     *  }
     * }
     * @param {string} jobDescription
     * @returns {Record<string, any>} comparison data
     */
    static sendMessageToCompareResumes = (jobDescription: string) => {
        //create a promise to resolve it asynchronously
        return new Promise(async (resolve, reject) => {
            //Our python program runs on port 5007 on our local server
            var xhr = new XMLHttpRequest();
            //call an http request
            xhr.open('POST', DATABASESERVER + 'databases/compare_resumes', true);
            xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
            await setTokenHeader(xhr);
            xhr.onload = function () {
                //It suceeded
                if (xhr.status === 200) {
                    //change it to json
                    const response: string = xhr.responseText;
                    resolve(JSON.parse(response));
                } else {
                    //Didnt get a sucessful message
                    console.error('Request failed. Status:', xhr.status);
                    reject(String(xhr.status));
                }
            };
            //Couldnt load the http request
            xhr.onerror = function () {
                console.error('Request failed. Network error');
                reject('Network error');
            };
            //send our response
            xhr.send(
                JSON.stringify({
                    jobDescription: jobDescription
                })
            );
        });
    }
    /**
     * sendMessageToCompareResumes
     * 
     * sends a message to our backend to compare a resume sent on the request to a job description
     * 
     * the json comes in in the form of 
     * 
     * {
     *  resumeId{
     *      {
     *      similarityMatrix
     *      sortedIndexList
     *      jobDescriptionSentences
     *      resumeSentences
     *      }
     *  }
     * }
     * @param {string} jobDescription
     * @param {Resume} resume
     * @returns {Record<string, any>} comparison data
     */
    static sendMessageToCompareResumesFromRequest = (jobDescription: string, jobId: string, resume: Resume) => {
        console.log("Sending message to compare resumes");
        //create a promise to resolve it asynchronously
        return new Promise(async (resolve, reject) => {
            var xhr = new XMLHttpRequest();
            //call an http request
            xhr.open('POST', DATABASESERVER + 'databases/compare_resumes_from_request', true);
            xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
            await setTokenHeader(xhr);
            xhr.onload = function () {
                //It suceeded
                if (xhr.status === 200) {
                    //change it to json
                    const response: string = xhr.responseText;
                    console.log("Got successful response");
                    const responseJson: Record<string, any> = JSON.parse(response);
                    console.log("Before processing:", JSON.parse(JSON.stringify(responseJson)));
                    console.log("After: ")
                    console.log(responseJson);
                    responseJson["similarityMatrix"] = HelperFunctions.parseArrayString(responseJson["similarityMatrix"])
                    responseJson["sortedIndexList"] = HelperFunctions.parseArrayString(responseJson["sortedIndexList"])
                    resolve(responseJson);
                } else {
                    //Didnt get a sucessful message
                    console.error('Request failed. Status:', xhr.status);
                    reject(String(xhr.status));
                }
            };
            //Couldnt load the http request
            xhr.onerror = function () {
                console.error('Request failed. Network error');
                reject('Network Error');
            };
            //send our response
            xhr.send(
                JSON.stringify({
                    jobDescription: jobDescription,
                    jobId: jobId,
                    resume: resume.toJson()
                })
            );
        });
    }
    static sendMessageToCompareResumeByIds = async (resumeId: number, jobId: string):Promise<ResumeComparison> => {
        return new Promise(async (resolve, reject) => {
            var xhr = new XMLHttpRequest();
            //call an http request
            console.log("sending request to compare resume by id");
            xhr.open('GET', DATABASESERVER + 'databases/compare_resume_by_ids?resumeId=' + resumeId + "&" + "jobId=" + jobId, true);
            await setTokenHeader(xhr);
            xhr.onload = function () {
                //It suceeded
                if (xhr.status === 200) {
                    //change it to json
                    const response: string = xhr.responseText;
                    const resumeComparisonJson: Record<string, any> = JSON.parse(response);
                    //NOTE: setting the resume text and job description text to null here, don't think I'll need it
                    resolve(new ResumeComparison(
                        resumeComparisonJson["resumeId"], resumeComparisonJson["jobId"], null, null, resumeComparisonJson["resumeSentences"], 
                        resumeComparisonJson["jobDescriptionSentences"], HelperFunctions.parseArrayString(resumeComparisonJson["similarityMatrix"]), 
                        HelperFunctions.parseArrayString(resumeComparisonJson["sortedIndexList"]),
                        resumeComparisonJson["matchScore"], resumeComparisonJson["pros"], resumeComparisonJson["cons"], resumeComparisonJson["tips"]
                    ));
                } else {
                    //Didnt get a sucessful message
                    console.error('Request failed. Status:', xhr.status);
                    reject(String(xhr.status));
                }
            };
            //Couldnt load the http request
            xhr.onerror = function () {
                console.error('Request failed. Network error');
                reject('Network Error');
            };
            //send our response
            xhr.send();
        });
    }
    static sendMessageToVerifyToken = async ():Promise<boolean> => {
        return new Promise(async (resolve, reject) => {
            var xhr = new XMLHttpRequest();
            //call an http request
            xhr.open('GET', DATABASESERVER + 'api/verify_token', true);
            xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
            await setTokenHeader(xhr);
            xhr.onload = function () {
                //It suceeded
                if (xhr.status === 200) {
                    //change it to json
                    const response: string = xhr.responseText;
                    resolve(response === "AUTHED");
                } else {
                    //Didnt get a sucessful message
                    console.error('Request failed. Status:', xhr.status);
                    reject(String(xhr.status));
                }
            };
            //Couldnt load the http request
            xhr.onerror = function () {
                console.error('Request failed. Network error');
                reject('Network Error');
            };
            //send our response
            xhr.send();
        });
    }
    static sendMessageToGetCommuteData = async (originLat: Number, originLng: Number, 
        destinationLat: Number, destinationLng: Number):Promise<Record<string, any>> => {
        return new Promise(async (resolve, reject) => {
            var xhr = new XMLHttpRequest();
            //call an http request
            xhr.open('GET', DATABASESERVER + 'api/directions?originLat=' + String(originLat) 
                        + '&originLng=' + String(originLng) + '&destLat=' + String(destinationLat)
                        + '&destLng=' + String(destinationLng), true);

            await setTokenHeader(xhr);
            xhr.onload = function () {
                //It suceeded
                if (xhr.status === 200) {
                    //change it to json
                    const response: string = xhr.responseText;
                    const responseJson: Record<string, any> = JSON.parse(response);
                    const binaryString = responseJson.mapImage;
                    const binaryData: Uint8Array = new Uint8Array(
                        binaryString.split('').map((char: string) => char.charCodeAt(0))
                      );
                    const imageBlob = new Blob([binaryData], { type: 'image/png' });
                    const imageUrl = URL.createObjectURL(imageBlob);
                    responseJson.mapUrl = imageUrl;
                    resolve(responseJson);
                } else {
                    //Didnt get a sucessful message
                    console.error('Request failed. Status:', xhr.status);
                    reject(String(xhr.status));
                }
            };
            //Couldnt load the http request
            xhr.onerror = function () {
                console.error('Request failed. Network error');
                reject('Network Error');
            };
            //send our response
            xhr.send();
        });
    }
    static sendMessageToGetRelocationData = async (location: Location):Promise<Record<string, any>> => {
        return new Promise(async (resolve, reject) => {
            var xhr = new XMLHttpRequest();
            //call an http request
            //post just bc I want req body
            xhr.open('POST', DATABASESERVER + 'api/get_relocation_data', true);
            xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
            await setTokenHeader(xhr);
            xhr.onload = function () {
                //It suceeded
                if (xhr.status === 200) {
                    //change it to json
                    const response: string = xhr.responseText;
                    const responseJson: Record<string, any> = JSON.parse(response);
                    const binaryString = responseJson.mapImage;
                    const binaryData: Uint8Array = new Uint8Array(
                        binaryString.split('').map((char: string) => char.charCodeAt(0))
                      );
                    const imageBlob = new Blob([binaryData], { type: 'image/png' });
                    const imageUrl = URL.createObjectURL(imageBlob);
                    responseJson.mapUrl = imageUrl;
                    resolve(responseJson);
                } else {
                    //Didnt get a sucessful message
                    console.error('Request failed. Status:', xhr.status);
                    reject(String(xhr.status));
                }
            };
            //Couldnt load the http request
            xhr.onerror = function () {
                console.error('Request failed. Network error');
                reject('Network Error');
            };
            //send our response
            xhr.send(JSON.stringify({"location":location}));
        });
    }
    static sendMessageToReadResume = async(resumeId: string):Promise<Resume> => {
        return new Promise(async (resolve, reject) => {
            //Our python program runs on port 5007 on our local server
            var xhr = new XMLHttpRequest();
            //call an http request
            xhr.open('GET', DATABASESERVER + 'databases/read_resume?resumeId=' + resumeId, true);
            xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
            await setTokenHeader(xhr);
            xhr.onload = function () {
                //It suceeded
                if (xhr.status === 200) {
                    //change it to json
                    const response: string = xhr.responseText;
                    const resumeJson: Record<string, any> = JSON.parse(response);
                    resolve(ResumeFactory.generateFromJson(resumeJson));
                } else {
                    //Didnt get a sucessful message
                    console.error('Request failed. Status:', xhr.status);
                    reject(String(xhr.status));
                }
            };
            //Couldnt load the http request
            xhr.onerror = function () {
                console.error('Request failed. Network error');
                reject('Network Error');
            };
            //send our response
            xhr.send();
        });
    }
    static sendMessageToUpdateResume = async(resumeId: string, updateJson: Record<string, any>):Promise<Resume> => {
        return new Promise(async (resolve, reject) => {
            var xhr = new XMLHttpRequest();
            //call an http request
            xhr.open('POST', DATABASESERVER + 'databases/update_resume?resumeId=' + resumeId, true);
            xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
            await setTokenHeader(xhr);
            xhr.onload = function () {
                //It suceeded
                if (xhr.status === 200) {
                    //change it to json
                    const response: string = xhr.responseText;
                    const resumeJson: Record<string, any> = JSON.parse(response);
                    resolve(ResumeFactory.generateFromJson(resumeJson));
                } else {
                    //Didnt get a sucessful message
                    console.error('Request failed. Status:', xhr.status);
                    reject(String(xhr.status));
                }
            };
            //Couldnt load the http request
            xhr.onerror = function () {
                console.error('Request failed. Network error');
                reject('Network Error');
            };
            //send our response
            xhr.send(JSON.stringify(updateJson));
        });
    }
    static sendMessageToUpdateUserJob = async(jobId: string, updateJson: Record<string, any>):Promise<UserSpecificJobData> => {
        return new Promise(async (resolve, reject) => {
            var xhr = new XMLHttpRequest();
            xhr.open('POST', DATABASESERVER + 'databases/update_user_job?jobId=' + jobId, true);
            await setTokenHeader(xhr);
            xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
            xhr.onload = function () {
                //It suceeded
                if (xhr.status === 200) {
                    var response: string = xhr.responseText;
                    console.log(response)
                    const userSpecificJobDataJson: Record<string, any> = JSON.parse(response);
                    resolve(UserSpecificJobDataFactory.generateWithJson(userSpecificJobDataJson));
                } else {
                    //Didnt get a sucessful message
                    console.error('Request failed. Status:', xhr.status);
                    reject(String(xhr.status));
                }
            };
            //Couldnt load the http request
            xhr.onerror = function () {
                console.error('Request failed. Network error');
                reject('Network Error');
            };
            //send our response
            xhr.send(JSON.stringify({updateDict:updateJson}));
        })
    }
    static sendMessageToAddUserJob = async(jobId: string):Promise<Job> => {
        return new Promise(async (resolve, reject) => {
            var xhr = new XMLHttpRequest();
            xhr.open('POST', DATABASESERVER + 'databases/add_user_job?jobId=' + jobId, true);
            await setTokenHeader(xhr);
            xhr.onload = function () {
                //It suceeded
                if (xhr.status === 200) {
                    var response: string = xhr.responseText;
                    const responseJson: Record<string, any> = JSON.parse(response);
                    console.log("Added user job");
                    console.log(responseJson)
                    //resolve the token
                    resolve(JobFactory.generateFromJson(responseJson));
                } else {
                    //Didnt get a sucessful message
                    console.error('Request failed. Status:', xhr.status);
                    reject(String(xhr.status));
                }
            };
            //Couldnt load the http request
            xhr.onerror = function () {
                console.error('Request failed. Network error');
                reject('Network Error');
            };
            //send our response
            xhr.send();
        })
    }
    static sendMessageToDeleteUserJob = async(jobId: string):Promise<string> => {
        return new Promise(async (resolve, reject) => {
            var xhr = new XMLHttpRequest();
            xhr.open('POST', DATABASESERVER + 'databases/delete_user_job?jobId=' + jobId, true);
            await setTokenHeader(xhr);
            xhr.onload = function () {
                //It suceeded
                if (xhr.status === 200) {
                    var response: string = xhr.responseText;
                    console.log(response)
                    //resolve the token
                    resolve(response);
                } else {
                    //Didnt get a sucessful message
                    console.error('Request failed. Status:', xhr.status);
                    reject(String(xhr.status));
                }
            };
            //Couldnt load the http request
            xhr.onerror = function () {
                console.error('Request failed. Network error');
                reject('Network Error');
            };
            //send our response
            xhr.send();
        })
    }
    static sendMessageToUpdateUserLocation = async(updateJson: Record<string, any>, user_id: string) => {
        return new Promise(async (resolve, reject) => {
            console.log("Sending request to update user location");
            console.log({updateJson: updateJson});
            var xhr = new XMLHttpRequest();
            xhr.open('POST', DATABASESERVER + 'databases/update_user_location', true);
            await setTokenHeader(xhr);
            xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
            xhr.onload = function () {
                //It suceeded
                if (xhr.status === 200) {
                    var response: string = xhr.responseText;
                    console.log(response)
                    //resolve the token
                    const responseJson = JSON.parse(response);
                    resolve(LocationObjectFactory.generateLocationFromJson(responseJson));
                } else {
                    //Didnt get a sucessful message
                    console.error('Request failed. Status:', xhr.status);
                    reject(String(xhr.status));
                }
            };
            //Couldnt load the http request
            xhr.onerror = function () {
                console.error('Request failed. Network error');
                reject('Network Error');
            };
            //send our response
            xhr.send(JSON.stringify({updateJson: updateJson}));
        })
    }
    static sendMessageToDeleteUserLocation = async() => {
        return new Promise(async (resolve, reject) => {
            var xhr = new XMLHttpRequest();
            xhr.open('POST', DATABASESERVER + 'databases/delete_user_location', true);
            await setTokenHeader(xhr);
            xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
            xhr.onload = function () {
                //It suceeded
                if (xhr.status === 200) {
                    var response: string = xhr.responseText;
                    console.log(response);
                    resolve(response);
                } else {
                    //Didnt get a sucessful message
                    console.error('Request failed. Status:', xhr.status);
                    reject(String(xhr.status));
                }
            };
            //Couldnt load the http request
            xhr.onerror = function () {
                console.error('Request failed. Network error');
                reject('Network Error');
            };
            //send our response
            xhr.send();
        })
    }
    static sendMessageToUpdateUserPreferences = async(updateJson: Record<string, any>, user_id: string) => {
        return new Promise(async (resolve, reject) => {
            console.log("Sending request to update user preferences");
            console.log({updateJson: updateJson});
            var xhr = new XMLHttpRequest();
            xhr.open('POST', DATABASESERVER + 'databases/update_user_preferences', true);
            await setTokenHeader(xhr);
            xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
            xhr.onload = function () {
                //It suceeded
                if (xhr.status === 200) {
                    var response: string = xhr.responseText;
                    console.log(response)
                    //resolve the token
                    const responseJson = JSON.parse(response);
                    resolve(UserPreferencesFactory.generateFromJson(responseJson));
                } else {
                    //Didnt get a sucessful message
                    console.error('Request failed. Status:', xhr.status);
                    reject(String(xhr.status));
                }
            };
            //Couldnt load the http request
            xhr.onerror = function () {
                console.error('Request failed. Network error');
                reject('Network Error');
            };
            //send our response
            xhr.send(JSON.stringify({updateJson: updateJson}));
        })
    }
    static sendMessageToUpdateUserKeywords = async(positiveKeywords: string[], negativeKeywords: string[]) => {
        return new Promise(async (resolve, reject) => {
            console.log("Sending request to update user keywords");
            console.log({positiveKeywords: positiveKeywords, negativeKeywords: negativeKeywords});
            var xhr = new XMLHttpRequest();
            xhr.open('POST', DATABASESERVER + 'databases/update_user_keywords', true);
            await setTokenHeader(xhr);
            xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
            xhr.onload = function () {
                //It suceeded
                if (xhr.status === 200) {
                    var response: string = xhr.responseText;
                    resolve(response);
                } else {
                    //Didnt get a sucessful message
                    console.error('Request failed. Status:', xhr.status);
                    reject(String(xhr.status));
                }
            };
            //Couldnt load the http request
            xhr.onerror = function () {
                console.error('Request failed. Network error');
                reject('Network Error');
            };
            //send our response
            xhr.send(JSON.stringify({positiveKeywords: positiveKeywords, negativeKeywords: negativeKeywords}));
        })
    }
    static sendMessageToReadSpecificResumeComparison = async(resumeId: string, jobId: string):Promise<ResumeComparison | null> => {
        return new Promise(async (resolve, reject) => {
            console.log("Sending request to get resume comparison");
            console.log({ResumeID: resumeId});
            console.log({JobId: jobId});
            //Our python program runs on port 5007 on our local server
            var xhr = new XMLHttpRequest();
            //call an http request
            xhr.open('GET', DATABASESERVER + 'databases/get_specific_resume_comparison?' + "jobId=" + jobId + "&" + 'resumeId=' + resumeId, true);
            await setTokenHeader(xhr);
            xhr.onload = function () {
                //It suceeded
                if (xhr.status === 200) {
                    //change it to json
                    const response: string = xhr.responseText;
                    const resumeComparisonJson: Record<string, any> = JSON.parse(response);
                    //NOTE: setting the resume text and job description text to null here, don't think I'll need it
                    resolve(new ResumeComparison(
                        resumeComparisonJson["resumeId"], resumeComparisonJson["jobId"], null, null, resumeComparisonJson["resumeSentences"], 
                        resumeComparisonJson["jobDescriptionSentences"], HelperFunctions.parseArrayString(resumeComparisonJson["similarityMatrix"]), 
                        HelperFunctions.parseArrayString(resumeComparisonJson["sortedIndexList"]),
                        resumeComparisonJson["matchScore"], resumeComparisonJson["pros"], resumeComparisonJson["cons"], resumeComparisonJson["tips"]
                    ));
                } else if (xhr.status === 404){
                    resolve(null);
                } else {
                    //Didnt get a sucessful message
                    console.error('Request failed. Status:', xhr.status);
                    reject(String(xhr.status));
                }
            };
            //Couldnt load the http request
            xhr.onerror = function () {
                console.error('Request failed. Network error');
                reject('Network Error');
            };
            //send our response
            xhr.send();
        });
    }
    static sendMessageToAddConfirmationCode = async(email: string, forgotPassword: boolean = false):Promise<string> => {
        return new Promise(async (resolve, reject) => {
            var xhr = new XMLHttpRequest();
            xhr.open('POST', DATABASESERVER + 'api/send_email_confirmation?email=' + email + `${forgotPassword ? "&forgotPassword=1":""}`, true);
            xhr.onload = function () {
                //It suceeded
                if (xhr.status === 200) {
                    var response: string = xhr.responseText;
                    console.log(response);
                    resolve(response);
                } else {
                    //Didnt get a sucessful message
                    console.error('Request failed. Status:', xhr.status);
                    reject(String(xhr.responseText));
                }
            };
            //Couldnt load the http request
            xhr.onerror = function () {
                console.error('Request failed. Network error');
                reject('Network Error');
            };
            //send our response
            xhr.send();
        })
    }
    static sendMessageToEvaluateConfirmationCode = async(email: string, confirmationCode: string, forgotPassword: boolean = false):Promise<string> => {
        return new Promise(async (resolve, reject) => {
            var xhr = new XMLHttpRequest();
            xhr.open('POST', DATABASESERVER + 'api/evaluate_email_confirmation?email=' + email + "&" + "confirmationCode=" + confirmationCode + `${forgotPassword ? "&forgotPassword=1":""}`, true);
            xhr.onload = function () {
                //It suceeded
                console.log("Evaluated confirmation code to be " + String(xhr.status))
                if (xhr.status === 200) {
                    var response: string = xhr.responseText;
                    console.log(response);
                    resolve(response);
                } else {
                    //Didnt get a sucessful message
                    console.error('Request failed. Status:', xhr.status);
                    reject(xhr.responseText);
                }
            };
            //Couldnt load the http request
            xhr.onerror = function () {
                console.error('Request failed. Network error');
                reject('Network Error');
            };
            //send our response
            xhr.send();
        })
    }
    //pw must be hashed with appropriate salt beforehand
    static sendMessageToResetPassword = async(temporaryToken: string, newPassword: string):Promise<string> => {
        return new Promise(async (resolve, reject) => {
            var xhr = new XMLHttpRequest();
            xhr.open('POST', DATABASESERVER + 'api/reset_password', true);
            console.log(`Setting temporary token to ${temporaryToken}`)
            xhr.setRequestHeader("Authorization", temporaryToken);
            xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
            xhr.onload = function () {
                //It suceeded
                console.log("Evaluated confirmation code to be " + String(xhr.status))
                if (xhr.status === 200) {
                    var response: string = xhr.responseText;
                    console.log(response);
                    resolve(response);
                } else {
                    //Didnt get a sucessful message
                    console.error('Request failed. Status:', xhr.status);
                    reject(xhr.responseText);
                }
            };
            //Couldnt load the http request
            xhr.onerror = function () {
                console.error('Request failed. Network error');
                reject('Network Error');
            };
            //send our response
            xhr.send(JSON.stringify({newPassword: newPassword}));
        })
    }
}