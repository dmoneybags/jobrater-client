//(c) 2024 Daniel DeMoney. All rights reserved.
export class UserSpecificJobData {
    isFavorite: boolean;
    hasApplied: boolean;
    timeSelected: Date | null;
    constructor(isFavorite: boolean, hasApplied: boolean, timeSelected: Date | null) {
        this.isFavorite = isFavorite;
        this.hasApplied = hasApplied;
        this.timeSelected = timeSelected;
    }
    toJson(): Record<string, any> {
        return {
            isFavorite: this.isFavorite,
            hasApplied: this.hasApplied,
            timeSelected: this.timeSelected ? Math.floor(this.timeSelected.getTime() / 1000) : null
        };
    }
}
export class UserSpecificJobDataFactory {
    static generateWithJson(jsonObject: Record<string, any>): UserSpecificJobData {
        return new UserSpecificJobData(
            jsonObject.isFavorite,
            jsonObject.hasApplied,
            jsonObject.timeSelected ? new Date(jsonObject.timeSelected * 1000) : null
        );
    }
}