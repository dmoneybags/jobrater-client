import { LocalStorageHelper } from "./localStorageHelper";
import { DatabaseCalls } from "./databaseCalls";
export class HelperFunctions {
    /**
     * getTimeFrameSeconds
     * 
     * returns the amount of seconds in a timeFrame
     * 
     * @param {string} timeFrame: the string timeframe
     * @returns {number} the number of seconds in the timeframe
     */
    static getTimeFrameSeconds = (timeFrame: string):number => {
        let seconds: number = 0;
        switch (timeFrame) {
            case 'months':
                seconds = 7 * 24 * 3600;
                break;
            case 'month':
                seconds = 7 * 24 * 3600;
                break;
            case 'weeks':
                seconds = 7 * 24 * 3600;
                break;
            case 'week':
                seconds = 7 * 24 * 3600;
                break;
            case 'days':
                seconds = 24 * 3600;
                break;
            case 'day':
                seconds = 24 * 3600;
                break;
            case 'hours':
                seconds = 3600;
                break;
            case 'hour':
                seconds = 3600;
                break;
            case 'minutes':
                seconds = 60;
                break;
            case 'minute':
                seconds = 60;
                break;
            default:
                console.error('Unsupported timeframe');
                break;
        }
        return seconds;
    }
    static waitForDocumentLoaded = (): Promise<void> => {
        return new Promise<void>((resolve) => {
            if (document.readyState === 'complete' || document.readyState === 'interactive') {
                resolve();
            } else {
                document.addEventListener('DOMContentLoaded', () => resolve(), { once: true });
            }
        });
    }
    static async tryWithRetryPromise(task: () => Promise<any>, retries: number = 1, delay: number = 500): Promise<void> {
        try {
            return await task();
        } catch (error) {
            if (retries > 0) {
                console.log(`Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                return await HelperFunctions.tryWithRetryPromise(task, retries - 1, delay);
            } else {
                throw error;
            }
        }
    }
    static async tryWithRetry<T>(task: () => T, retries: number = 1, delay: number = 500): Promise<T> {
        const executeTask = async () => {
            try {
                return task();
            } catch (error) {
                if (retries > 0) {
                    console.log(`Retrying in ${delay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    return HelperFunctions.tryWithRetry(task, retries - 1, delay);
                } else {
                    throw error;
                }
            }
        };
    
        return executeTask();
    }
    //IMPORTANT only works for matrices (2d)
    static parseArrayString(input: string): number[][] {
        console.debug("Parsing array str of");
        console.debug(input);
        const mainArr: number[][] = [];
        const innerElements = input.substring(1, input.length - 1);
        console.debug("innerElements");
        console.debug(innerElements);
        for (const element of innerElements.split("\n")){
            console.debug("element");
            console.debug(element);
            const innerElement = element.substring(element.indexOf('[') + 1, element.length - 1);
            console.debug("innerElement");
            console.debug(innerElement);
            let innerNumbersStr = innerElement.split(" ");
            console.debug("innerNumbersStr");
            console.debug(innerNumbersStr);
            innerNumbersStr = innerNumbersStr.filter((word) => word !== "");
            console.debug(innerNumbersStr);
            const row = innerNumbersStr.map((numberStr) => Number(numberStr));
            console.debug("row");
            console.debug(row);
            mainArr.push(row);
        }
        return mainArr;
    }
    static ratingToColor(rating: number, alpha: number = 1):string{
        if (rating <= 0){
            return `rgba(128,128,128,${alpha})`
        }
        const invertedRating = 1 - rating;
        return `rgba(${2.0 * invertedRating * 255}, ${2.0 * (1 - invertedRating) * 255}, 0, ${alpha})`
    }
    /**
     * downloadDataIfNecessary
     * 
     * Very important helper function. Downloads the data from the server if we see its been longer than an hour seince we grabbed it
     * 
     * returns true if we had to grab it, false if not
     * 
     * @returns {Promise<boolean>}
     */
    static async downloadDataIfNecessary(force=false): Promise<boolean> {
        if (force){
            console.warn("FORCING GRABBING DATA FROM SERVER")
        }
        try {
            const unixTime = Math.floor(Date.now() / 1000);
            const expirationTimeStrMessage = await LocalStorageHelper.__sendMessageToBgScript({action: "getData", key: "userDataLastGrabbed"});
            const expirationTimeStr = expirationTimeStrMessage.message;
            const expirationTime = expirationTimeStr ? parseInt(expirationTimeStr, 10) : null;
            if (!expirationTime || isNaN(expirationTime)){
                console.warn("Couldn't parse expiration time of:")
                console.warn(expirationTime);
            }
            if (!expirationTime || isNaN(expirationTime) || (unixTime > expirationTime + 1000) || force) {
                console.log("Grabbing data from server...");
                const userData = await DatabaseCalls.getUserData();
                await LocalStorageHelper.setUserData(userData);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to download data:', error);
            return false;
        }
    }
    static delaySync = (ms: number) =>{
        const start = Date.now();
        while (Date.now() - start < ms) {
          // Busy wait
        }
      }
    
}