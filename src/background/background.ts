//(c) 2024 Daniel DeMoney. All rights reserved.
/*
Execution

background.js
Listens for: tab changes with the required linkedin urls 
Executes: processing the query to get the job id 
Sends: a message to contentscript to scrape the job
*/

import { GlassdoorScrapingFunctions } from "../content/glassdoor";
import { WindowingFunctions } from "./windowingFunctions";

/*
First order data needed:

*from url
Job UUID
*Scraping
Job Title
Company
salary range
remote/hybrid/in person

Second order data needed:

Glassdoor data
Job site location
company financials
company overview

Tertiary data needed:

commute time
*/
// Listen for tab updates to specific LinkedIn job URLs
// The event is fired everytime a user changes tabs

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    // Check for URL matches
    if (tab.url && (tab.url.includes("linkedin.com/jobs/search") || 
        tab.url.includes("linkedin.com/jobs/collections/") || 
        tab.url.includes("linkedin.com/jobs/view/"))) {
        
        console.log("GOT TAB CHANGE MESSAGE");
        
        if (changeInfo.status === 'complete') {
            let jobId = null;
            
            // Check if the URL is from the `/view/` path
            if (tab.url.includes("linkedin.com/jobs/view/")) {
                // Extract the jobId from the URL path after `/view/`
                const urlParts = tab.url.split('/');
                jobId = urlParts[urlParts.indexOf("view") + 1]; // Job ID follows 'view'
            } else {
                // Process the URL query string to get the jobId in the `currentJobId` form
                const queryParameters = tab.url.split("?")[1];
                const urlParameters = new URLSearchParams(queryParameters);
                jobId = urlParameters.get("currentJobId");
            }
            
            if (jobId) {
                console.log("Job ID found:", jobId);
                // Send a message to contentScript to scrape pages and enter it in the DB
                console.log("Sending message to content script to scrape");
                chrome.tabs.sendMessage(tabId, {
                    type: "NEW",
                    company: "LINKEDIN",
                    jobId: jobId
                }).then(response => {
                    console.log('Message sent successfully:', response);
                }).catch(error => {
                    console.error('Error sending message to content script:', error);
                });
            } else {
                console.error("No jobId found in the URL");
            }
        }
    }
});
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    console.debug("BG LISTENER GOT MESSAGE OF: ");
    console.debug(message);
    if (message.action === 'storeData') {
        try {
            chrome.storage.local.set({ [message["key"]]: message["value"] }, function() {
                console.debug('Data is stored in background script');
                console.debug(`Key: ${message["key"]}`);
                console.debug(`Value: ${message["value"]}`);
                sendResponse({ success: true, message: 'Data stored successfully' });
            });
        } catch (error) {
            console.error('Error storing data:', error);
            sendResponse({ success: false, message: 'Failed to store data', error: error.message });
        }
        return true;
    } else if (message.action === 'getData'){
        try {
            chrome.storage.local.get(message["key"], function(result) {
                console.debug('Data read from background script');
                console.debug(`Key: ${message["key"]}`);
                console.debug(`Value:`);
                console.debug(result);
                sendResponse({ success: true, message: result[message["key"]]});
            });
        } catch (error) {
            console.error('Error getting data:', error);
            sendResponse({ success: false, message: 'Failed to store data', error: error.message });
        }
        return true;
    } else if (message.action === 'clearAllData'){
        try {
            chrome.storage.local.clear();
            console.log("Cleared LocalStorage")
        } catch (error) {
            console.error('Error clearing data:', error);
            sendResponse({ success: false, message: 'Failed to store data', error: error.message });
        }
        return true;
    } else if (message.action === 'scrapeGd'){
        const company = message.company;
        if (!company){
            sendResponse({ success: false, message: 'Failed to read company arg', error: "NO COMPANY" });
        }
        GlassdoorScrapingFunctions.scrape(company).then((companyData) => {
            const gdPageSource = companyData.pageSource;
            const gdUrl = companyData.url;
            const noCompanies = companyData.noCompanies;
            sendResponse({gdPageSource: gdPageSource, gdUrl: gdUrl, noCompanies: noCompanies})
        })
        //we're going to resolve asynchrously
        return true;
    } else if (message.action === 'showNotification'){
        chrome.action.setBadgeBackgroundColor({ color: [228, 51, 37, 255] });
        chrome.notifications.create("NEW_JOB_NOTIFICATION", {
            type: 'basic',
            iconUrl: chrome.runtime.getURL('icons/logo_128.png'),  
            title: message?.notificationTitle ?? "",
            message: message?.notifactionText ?? "",
            priority: 2
          }, function(notificationId) {
            console.log('Notification created with ID:', notificationId);
          });
        // Get the current badge text (if any)
        chrome.action.getBadgeText({}, function(currentBadgeText) {
            let count = parseInt(currentBadgeText) || 0; // Convert to number, default to 0 if NaN
            count++; // Increment the count
            chrome.action.setBadgeText({ text: count.toString() }); // Update badge
        });
        sendResponse({ success: true, message: 'Notification shown'});
    } else if (message.action === 'openPopup') {
        if (message.options){
            WindowingFunctions.createOrRefreshWindow(message.options);
        } else {
            WindowingFunctions.createOrRefreshWindow();
        }
        sendResponse({ success: true, message: 'Popup shown'});
    }
});