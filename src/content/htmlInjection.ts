import { WindowingFunctions } from "../background/windowingFunctions";
import { LocalStorageHelper } from "@applicantiq/applicantiq_core/Core/localStorageHelper";

export class HtmlInjection {
    static addFontAwesome = () => {
        const fontAwesomeLink = document.createElement('link');
        fontAwesomeLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css'; // Font Awesome CDN
        fontAwesomeLink.rel = 'stylesheet';
        document.head.appendChild(fontAwesomeLink); // Append Font Awesome to the document head
    };
    static addIndeedBtn = (jobId: string) => {
        const btnContainer = document.getElementById("jobsearch-ViewJobButtons-container");
        const previousBtn = document.getElementById("ApplicantIQbtn");
        if (previousBtn) {
            previousBtn.remove();  // Remove the previous button
        }
        const button = document.createElement('button');
        button.id = "ApplicantIQbtn"
        button.innerText = 'View in ApplicantIQ';
    
        const rootStyles = getComputedStyle(document.documentElement);
        const fontFamily = rootStyles.getPropertyValue('--artdeco-reset-typography-font-family-sans');
        button.className = "css-199trha eu4oa1w0";
        
        // Apply the font and styles to the button
        button.style.fontFamily = fontFamily;
        button.style.color = "white";
        button.style.backgroundColor = "black";
        button.style.marginRight = "10px";
        button.style.marginLeft = "10px";
        button.style.height = "42px";
        button.style.borderRadius = "10px";
    
        button.addEventListener('click', async () => {
            chrome.runtime.sendMessage({ action: 'openPopup' , options: {latestJob: jobId}});
        });
        btnContainer.appendChild(button);
    }
    static addLinkedInBtn = (jobId: string) => {
        const element = document.querySelector('.jobs-s-apply.jobs-s-apply--fadein.inline-flex.mr2');
        const btnContainer = element.parentElement;
        const previousBtn = btnContainer.querySelector('#ApplicantIQbtn');

        if (previousBtn) {
            previousBtn.remove();  // Remove the previous button
        }
        
        const button = document.createElement('button');
        button.id = "ApplicantIQbtn"
        button.innerText = 'View in ApplicantIQ ';
    
        const icon = document.createElement('i'); // Create the Font Awesome icon
        icon.className = 'fas fa-lightbulb'; // Add the lightbulb icon class from Font Awesome
        icon.style.marginLeft = "10px"; 
    
        const rootStyles = getComputedStyle(document.documentElement);
        const fontFamily = rootStyles.getPropertyValue('--artdeco-reset-typography-font-family-sans');
        button.className = "artdeco-button";
        
        // Apply the font and styles to the button
        button.style.fontFamily = fontFamily;
        button.style.color = "white";
        button.style.backgroundColor = "black";
        button.style.marginRight = "10px";
        button.style.marginLeft = "10px";
    
        button.appendChild(icon); // Append the icon to the button
        button.addEventListener('click', async () => {
            chrome.runtime.sendMessage({ action: 'openPopup' , options: {latestJob: jobId}});
        });
        btnContainer.appendChild(button);
    }
    static addViewInApplicantIQbtn = (jobId: string) => {
        if (jobId.startsWith("li")){
            HtmlInjection.addFontAwesome();
            HtmlInjection.addLinkedInBtn(jobId);
        } else if (jobId.startsWith("in")){
            HtmlInjection.addIndeedBtn(jobId);
        }
    };
}