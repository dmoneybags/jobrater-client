import { LocalStorageHelper } from '@applicantiq/applicantiq_core/Core/localStorageHelper';

const link = "rgb(71,88,246)";

/**
 * Helper to set multiple styles on an element.
 */
const setStyles = (element, styles) => {
    Object.assign(element.style, styles);
};

/**
 * Creates an SVG icon with a specified path and styles.
 */
const createSvgIcon = () => {
    const svgIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svgIcon.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svgIcon.setAttribute("viewBox", "0 0 384 512");
    setStyles(svgIcon, { width: "16px", height: "16px" });

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute(
        "d",
        "M272 384c9.6-31.9 29.5-59.1 49.2-86.2c0 0 0 0 0 0c5.2-7.1 10.4-14.2 15.4-21.4c19.8-28.5 31.4-63 31.4-100.3C368 78.8 289.2 0 192 0S16 78.8 16 176c0 37.3 11.6 71.9 31.4 100.3c5 7.2 10.2 14.3 15.4 21.4c0 0 0 0 0 0c19.8 27.1 39.7 54.4 49.2 86.2l160 0zM192 512c44.2 0 80-35.8 80-80l0-16-160 0 0 16c0 44.2 35.8 80 80 80zM112 176c0 8.8-7.2 16-16 16s-16-7.2-16-16c0-61.9 50.1-112 112-112c8.8 0 16 7.2 16 16s-7.2 16-16 16c-44.2 0-80 35.8-80 80z"
    );
    path.style.fill = "white";
    svgIcon.appendChild(path);

    return svgIcon;
};

const createSvgX = () => {
    const svgIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svgIcon.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svgIcon.setAttribute("viewBox", "0 0 384 512");
    setStyles(svgIcon, { width: "16px", height: "16px" });

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute(
        "d",
        "M376.6 84.5c11.3-13.6 9.5-33.8-4.1-45.1s-33.8-9.5-45.1 4.1L192 206 56.6 43.5C45.3 29.9 25.1 28.1 11.5 39.4S-3.9 70.9 7.4 84.5L150.3 256 7.4 427.5c-11.3 13.6-9.5 33.8 4.1 45.1s33.8 9.5 45.1-4.1L192 306 327.4 468.5c11.3 13.6 31.5 15.4 45.1 4.1s15.4-31.5 4.1-45.1L233.7 256 376.6 84.5z"
    );
    path.style.fill = "white";
    svgIcon.appendChild(path);

    return svgIcon;
}

/**
 * Creates a button with given text, styles, and event handlers.
 */
const createButton = (text, onClick, additionalStyles = {}) => {
    const button = document.createElement('button');
    button.innerText = text;
    setStyles(button, {
        backgroundColor: "white",
        borderRadius: "15px",
        color: link,
        fontSize: "24px",
        fontWeight: "600",
        padding: "10px",
        margin: "auto",
        paddingLeft: "20px",
        paddingRight: "20px",
        transition: "transform 0.2s ease",
        ...additionalStyles,
    });

    button.onmouseover = () => (button.style.transform = "scale(1.05)");
    button.onmouseout = () => (button.style.transform = "scale(1)");
    button.addEventListener('click', onClick);

    return button;
};

/**
 * Builds the Resume Rater Banner.
 */
export const ResumeRaterBanner = (jobId) => {
    const banner = document.createElement('div');
    banner.id = 'resume-rater-banner';
    setStyles(banner, {
        margin: "24px auto 20px",
        borderRadius: "0.8rem",
        backgroundColor: link,
        padding: "10px",
        minHeight: "110px",
        position: "relative",
        zIndex: "9999"
    });

    const title = document.createElement('p');
    title.innerText = "applicantIQ";
    setStyles(title, { color: "white", fontSize: "16px" });
    title.appendChild(createSvgIcon());

    const evaluateDiv = document.createElement('div');
    setStyles(evaluateDiv, { display: "flex", alignItems: "center", width: "100%" });

    const evaluateTitle = document.createElement('p');
    evaluateTitle.innerText = "Get My AI Resume Score:";
    setStyles(evaluateTitle, { color: "white", fontSize: "24px" });

    const evaluateButton = createButton("Evaluate ✨", async () => {
        await LocalStorageHelper.__sendMessageToBgScript({ action: "storeData", key: "latestJob", value: null });
        chrome.runtime.sendMessage({ action: 'openPopup', options: { evaluateResume: jobId } });
    });

    evaluateDiv.append(evaluateTitle, evaluateButton);
    banner.append(title, evaluateDiv);

    return banner;
};

/**
 * Builds the First Timer Banner.
 */
export const FirstTimerBanner = () => {
    const banner = document.createElement('div');
    banner.id = 'first-timer-banner';
    setStyles(banner, {
        width: "400px",
        borderRadius: "2rem",
        backgroundColor: link,
        minHeight: "200px",
        position: "fixed",
        top: "10px",
        right: "10px",
        zIndex: "9999",
    });
    const container = document.createElement('div');
    setStyles(container, {
        padding: "10px",
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column"
    })

    banner.prepend(container);

    const closeButton = createSvgX();
    setStyles(closeButton, {
        position: "absolute", // Positioned relative to the banner
        top: "10px",          // 10px from the top of the banner
        left: "10px",         // 10px from the left of the banner
        cursor: "pointer",
        zIndex: "9999"
    });
    closeButton.addEventListener("click", () => {
        banner.remove();
        LocalStorageHelper.__sendMessageToBgScript({ action: 'storeData', key: "firstLogin", value: false });;
    });

    banner.prepend(closeButton);

    const title = document.createElement('p');
    title.innerText = "applicantIQ";
    setStyles(title, { color: "white", fontSize: "16px", textAlign: "center" });
    title.appendChild(createSvgIcon());

    const textBox = document.createElement('p');
    textBox.innerText = "Thank you for downloading applicantIQ! Navigate to any job and click on the 'Evaluate' button to see your AI resume score. Click on the browser extensions icon in the top of the browser to see all your jobs.";
    setStyles(textBox, {
        width: "100%",
        padding: "10px",
        color: "white",
        fontSize: "20px",
        textAlign: "center",
        fontWeight: "600"
    });

    const gotItButton = createButton("Got It!", () => {
        banner.remove();
        LocalStorageHelper.__sendMessageToBgScript({ action: 'storeData', key: "firstLogin", value: false });;
    });

    container.append(title, textBox, gotItButton);
    document.body.appendChild(banner);
};