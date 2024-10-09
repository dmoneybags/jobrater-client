//(c) 2024 Daniel DeMoney. All rights reserved.
/*
Execution

background.js
Listens for: tab changes with the required linkedin urls 
Executes: processing the query to get the job id 
Sends: a message to contentscript to scrape the job
\/
\/
contentScript.js
Listens for: requests with the type NEW
Executes: scraping for linkedin and glassdoor
Sends: a message for db to handle the job
*/


//Runs all the content after we get new jobloaded message, basically grabbing all our data and putting it in our db
//ISSUES:
//topbox has trouble being grabbed when the page first loads in
//TO DO:
//CRUD Methods X
//Will do later: Add competitiveness algo taking, applicants, company and job prestige, required experience
//Get company address X
//Google maps api
//User data
//UI
//Payments
//deployment
//question: what to do on addJob with no token?
import { LinkedInScrapingFunctions } from "./linkedinScrapingFunctions";
import { EMPTYJOB, Job, JobFactory } from "./job"
import { DatabaseCalls } from "./databaseCalls";
import { LocalStorageHelper } from "./localStorageHelper";
import { HtmlInjection } from "./htmlInjection";

//MAIN
(() => {
    const handleJobPromise = (promise:Promise<Job>) => {
        promise
        .then((jobread:Job):void => {
            let popupMessage : Record<string, any> = {action: 'NEW_JOB_LOADING', payload: {
                jobName: jobread.jobName, companyName: jobread?.company?.companyName ?? "No Company"}};
            //Send out message to our popup
            chrome.runtime.sendMessage(popupMessage)
            .then(response => {
                console.log("Sent message to popup script");
                console.log("Response from popup:", response);
            })
            .catch(error => {
                console.error("Error:", error);
            });

            LocalStorageHelper.__sendMessageToBgScript({ action: 'storeData', key: "loadingJob", value: {
                isLoading: true, jobName: jobread.jobName, companyName: jobread?.company?.companyName ?? "No Company"} })

            DatabaseCalls.sendMessageToAddJob(jobread)
            .then((responseJson: Record<string, any>) => {
                const completeJob: Job = JobFactory.generateFromJson(responseJson["job"]);
                //LocalStorageHelper.addJob(completeJob);
                //if its not loaded it wont show so lets store it in our bg script too

                LocalStorageHelper.__sendMessageToBgScript({ action: 'storeData', key: "loadingJob", value: {
                    isLoading: false, jobName: jobread.jobName, companyName: jobread?.company?.companyName ?? "No Company"} })
                let bgMessage : Record<string, any> = {action: 'storeData', key: "latestJob", value: completeJob };
                chrome.runtime.sendMessage(bgMessage)
                .then(response => {
                    console.log("Sent message to background script");
                    console.log("Response from background:", response);
                })
                .catch(error => {
                    console.error("Error:", error);
                });

                let popupMessage : Record<string, any> = {action: 'NEW_JOB', payload: completeJob };
                //Send out message to our popup
                chrome.runtime.sendMessage(popupMessage)
                .then(response => {
                    console.log("Sent message to popup script");
                    console.log("Response from popup:", response);
                })
                .catch(error => {
                    console.error("Error:", error);
                });
                let notificationMessage : Record<string, any> = {
                    action: "showNotification", 
                    notificationTitle: jobread.jobName + " loaded in ApplicantIQ",
                    notifactionText: "Check the popup window to see the jobs ratings"
                }
                chrome.runtime.sendMessage(notificationMessage)
                .then(response => {
                    console.log("Sent message to bg script to show notification");
                    console.log("Response from bg:", response);
                })
                .catch(error => {
                    console.error("Error:", error);
                });
            })
            .catch((err) => {
                LocalStorageHelper.__sendMessageToBgScript({ action: 'storeData', key: "loadingJob", value: {
                    isLoading: false, jobName: jobread.jobName, companyName: jobread?.company?.companyName ?? "No Company"} });
                    
                console.log("ERR sending message to add job");
                console.warn(err);
                //user went on the same job twice
                if (err === "409"){
                    //need to get job by id and move it to the front
                    //we do this earlier before we send the message
                    //here we can just return
                    return
                }
                let bgMessage : Record<string, any> = {action: 'storeData', key: "latestJob", value: null };

                chrome.runtime.sendMessage(bgMessage)
                .then(response => {
                    console.log("Sent message to background script");
                    console.log("Response from background:", response);
                })

            })
        })
        .catch((err) => {
            console.log("ERR executing scrape");
            console.warn(err);

            let bgMessage : Record<string, any> = {action: 'storeData', key: "latestJob", value: null };
            chrome.runtime.sendMessage(bgMessage)
            .then(response => {
                console.log("Sent message to background script");
                console.log("Response from background:", response);
            })
        })
    }


    //No job is loaded yet
    let currentJob: string = "";
    //Listener that activates every time a new job message is sent from background
    //seeing a new url that corresponds to a job url
    chrome.runtime.onMessage.addListener(async (obj, sender, response) => {
        console.log("NEW JOB MESSAGE RECIEVED");
        //Only arg to the message is the job id
        const { type, company, jobId } = obj;
        //Add button to page
        HtmlInjection.addViewInApplicantIQbtn(jobId);
        currentJob = jobId;
        //check if we already have job in localStorage
        if (await LocalStorageHelper.jobExistsInLocalStorage(jobId)){
            console.log("Job already exists in local storage");
            await LocalStorageHelper.moveJobToFront(jobId);
            let popupMessage : Record<string, any> = {action: 'REFRESH'};
            //Send out message to our popup
            chrome.runtime.sendMessage(popupMessage)
            .then(response => {
                console.log("Sent message to popup script");
                console.log("Response from popup:", response);
            })
            .catch(error => {
                console.error("Error:", error);
            });
            return;
        }
        console.log("job Id loaded" + jobId);
        response({ status: 'acknowledged' });
        if (type === "NEW") {
            try {
                switch (company){
                    case "LINKEDIN":
                        handleJobPromise(LinkedInScrapingFunctions.LinkedInJobLoaded(jobId));
                }
            } catch (error){
                console.error('error adding job:', error);
                let message : Record<string, any> = {type: 'NEW_JOB', payload: ""};
                chrome.runtime.sendMessage(message)
                .then(() => {
                    console.log("Sent new job message to UI");
                })
                throw error;
            }
        }
        return true;
    });
})();