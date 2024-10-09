//(c) 2024 Daniel DeMoney. All rights reserved.
import { PaymentFrequency } from "./job";

export class UserPreferences {
    userId: string;
    desiredPay: number;
    desiredPaymentFreq: PaymentFrequency;
    //In minutes
    desiredCommute: number;
    desiresRemote: boolean;
    desiresHybrid: boolean;
    desiresOnsite: boolean;
    desiredCareerStage: string;
    autoActiveOnNewJobLoaded: boolean;
    autoCompareResumeOnNewJobLoaded: boolean;
    saveEveryJobByDefault: boolean;
    positiveKeywords: string[];
    negativeKeywords: string[];
    constructor(userId: string, desiredPay: number, desiredPaymentFreq: PaymentFrequency, desiredCommute: number,
        desiresRemote: boolean, desiresHybrid: boolean, desiresOnsite: boolean, desiredCareerStage: string, autoActiveOnNewJobLoaded: boolean,
        autoCompareResumeOnNewJobLoaded: boolean, saveEveryJobByDefault: boolean, positiveKeywords: string[], negativeKeywords: string[]){
            this.userId = userId;
            this.desiredPay = desiredPay;
            this.desiredPaymentFreq = desiredPaymentFreq;
            this.desiredCommute = desiredCommute;
            this.desiresRemote = desiresRemote;
            this.desiresHybrid = desiresHybrid;
            this.desiresOnsite = desiresOnsite;
            this.desiredCareerStage = desiredCareerStage;
            this.autoActiveOnNewJobLoaded = autoActiveOnNewJobLoaded;
            this.autoCompareResumeOnNewJobLoaded = autoCompareResumeOnNewJobLoaded
            this.saveEveryJobByDefault = saveEveryJobByDefault;
            this.positiveKeywords = positiveKeywords;
            this.negativeKeywords = negativeKeywords;
        }
    toJson(){
        return {
            userId: this.userId,
            desiredPay: this.desiredPay,
            desiredPaymentFreq: this.desiredPaymentFreq.str,
            desiredCommute: this.desiredCommute,
            desiresRemote: this.desiresRemote,
            desiresHybrid: this.desiresHybrid,
            desiresOnsite: this.desiresOnsite,
            desiredCareerStage: this.desiredCareerStage,
            autoActiveOnNewJobLoaded: this.autoActiveOnNewJobLoaded,
            autoCompareResumeOnNewJobLoaded: this.autoCompareResumeOnNewJobLoaded,
            saveEveryJobByDefault: this.saveEveryJobByDefault,
            positiveKeywords: this.positiveKeywords,
            negativeKeywords: this.negativeKeywords
        }
    }
}
export class UserPreferencesFactory {
    static generateFromJson(json_object: Record<string, any>):UserPreferences{
        return new UserPreferences(
            json_object["userId"],
            json_object["desiredPay"],
            new PaymentFrequency(json_object["desiredPaymentFreq"]),
            json_object["desiredCommute"],
            json_object["desiresRemote"],
            json_object["desiresHybrid"],
            json_object["desiresOnsite"],
            json_object["desiredCareerStage"],
            json_object["autoActiveOnNewJobLoaded"],
            json_object["autoCompareResumeOnNewJobLoaded"],
            json_object["saveEveryJobByDefault"],
            json_object["positiveKeywords"],
            json_object["negativeKeywords"],
        )
    }
}