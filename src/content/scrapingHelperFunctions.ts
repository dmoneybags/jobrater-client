import { DatabaseCalls } from "./databaseCalls";
import { LocalStorageHelper } from "./localStorageHelper";

export class ScrapingHelperFunctions {
    static isAuthed = async():Promise<boolean> =>{
        console.log("Checking if user is authorized");
        if (await LocalStorageHelper.getToken() === null || await LocalStorageHelper.getToken() === undefined){
            return false;
        }
        console.log("Found token...");
        const timestampInSeconds = Math.floor(Date.now() / 1000);
        const expirationDate = await LocalStorageHelper.getTokenExpiration();
        if (isNaN(expirationDate)){
            return false;
        }
        if (timestampInSeconds > expirationDate){
            return false;
        }
        return await DatabaseCalls.sendMessageToVerifyToken();
    }
}