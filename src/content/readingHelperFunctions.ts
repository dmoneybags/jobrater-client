//(c) 2024 Daniel DeMoney. All rights reserved.
import { DatabaseCalls } from "@applicantiq/applicantiq_core/Core/databaseCalls";
import { LocalStorageHelper } from "@applicantiq/applicantiq_core/Core/localStorageHelper";

export class ReadingHelperFunctions {
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