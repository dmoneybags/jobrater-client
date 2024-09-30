//(c) 2024 Daniel DeMoney. All rights reserved.
export class LocationObject {
    /**
     * Class LocationObject
     * 
     * Simple struct representing address data
     * 
     * No support for latitude and longitude currently but coming soon
     * 
     * @property {string} addressStr - the street number and name IE: 112 Adrian pl
     * @property {string} city - the city of the location IE: Los Gatos
     * @property {string} zipCode - the zip code of the location IE: 95032
     * @property {string} stateCode - the stateCode of the location IE: CA
     * @property {number} latitude - the latitude of the location
     * @property {number} longitude - the longitude of the location
     */
    addressStr : string;
    city: string;
    zipCode: string;
    stateCode: string;
    latitude: number | null;
    longitude: number | null;
    constructor(addressStr: string, city: string, zipCode: string, stateCode: string, latitude: number | null, 
        longitude: number | null
    ){
        this.addressStr = addressStr;
        this.city = city;
        this.zipCode = zipCode;
        this.stateCode = stateCode;
        this.latitude = latitude;
        this.longitude = longitude;
    }
}
/**
 * class LocationObjectFactory
 * 
 * A collection of functions that create location objects from other structs (JSON)
 */
export class LocationObjectFactory {
    /**
     * generateLocationFromJson
     * 
     * generates a location object from a json response from the server
     * 
     * @param {Record<string, any>} json_object 
     * @returns {LocationObject}
     */
    static generateLocationFromJson(json_object:Record<string, any>): LocationObject {
        if (json_object["addressStr"] && typeof json_object["addressStr"] !== "string"){throw new TypeError("Invalid data passed to contructor: " + json_object)}
        const addressStr: string | null = json_object["addressStr"] ? json_object["addressStr"] : null;
        const city: string | null = json_object["city"] ? json_object["city"] : null;
        const zipCode: string | null = json_object["zipCode"] ? json_object["zipCode"] : null;
        const stateCode: string | null = json_object["stateCode"] ? json_object["stateCode"] : null;
        const latitude: number | null = json_object["latitude"] ? json_object["latitude"] : null;
        const longitude: number | null = json_object["longitude"] ? json_object["longitude"] : null;
        if (!addressStr && !city && !zipCode && !stateCode && !latitude && !longitude){
            return null;
        }
        return new LocationObject(addressStr, city, zipCode, stateCode, latitude, longitude);
    }
}