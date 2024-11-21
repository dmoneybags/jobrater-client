import { DatabaseCalls } from "@applicantiq/applicantiq_core/Core/databaseCalls";
import { LocalStorageHelper } from "@applicantiq/applicantiq_core/Core/localStorageHelper";

const setApplied = async (job) => {
    const updateJson = {"hasApplied": true}
    const updatedUserSpecificData = await DatabaseCalls.sendMessageToUpdateUserJob(job.jobId, updateJson)
    console.log("Got updated user data");
    console.log(updatedUserSpecificData);
    const updatedJob = job;
    updatedJob.userSpecificJobData = updatedUserSpecificData;
    const jobs = await LocalStorageHelper.readJobs();
    const updatedJobs = jobs.map(j => (j.jobId === updatedJob.jobId ? updatedJob : j));
    await LocalStorageHelper.saveJobs(updatedJobs);
    let popupMessage = {action: 'REFRESH'};
    chrome.runtime.sendMessage(popupMessage)
    .then(response => {
        console.log("Sent message to popup script");
        console.log("Response from popup:", response);
    })
    .catch(error => {
        console.error("Error:", error);
    });
}

export const addApplyEventListener = (job) => {
    if (job.jobId.startsWith("li")){
        const button = document.querySelector(".jobs-apply-button");
        button.addEventListener("click", ()=>{setApplied(job)}, { capture: true })
    }
    if (job.jobId.startsWith("in")){
        const buttonContainer = document.querySelector("#jobsearch-ViewJobButtons-container");
        if (buttonContainer) {
            const button = Array.from(buttonContainer.querySelectorAll('button')).find(btn =>
                btn.textContent.includes('Apply')
            );
            if (button) {
                button.addEventListener("click", ()=>{setApplied(job)}, { capture: true })
            }
        } else {
            throw new Error('Button container not found!');
        }
    }
}