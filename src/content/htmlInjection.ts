export class HtmlInjection {
    static addFontAwesome = () => {
        const fontAwesomeLink = document.createElement('link');
        fontAwesomeLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css'; // Font Awesome CDN
        fontAwesomeLink.rel = 'stylesheet';
        document.head.appendChild(fontAwesomeLink); // Append Font Awesome to the document head
    };
    static addViewInApplicantIQbtn = (jobId: string) => {
        HtmlInjection.addFontAwesome();
        const element = document.querySelector('.jobs-s-apply.jobs-s-apply--fadein.inline-flex.mr2');
        const btnContainer = element.parentElement;
        const previousBtn = btnContainer.querySelector('#ApplicantIQbtn');

        if (previousBtn) {
            return;
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
        button.addEventListener('click', () => {
            chrome.runtime.sendMessage({ action: 'openPopup' , options: {latestJob: jobId}});
        });
        btnContainer.appendChild(button);
    };
}