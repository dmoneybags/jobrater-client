//(c) 2024 Daniel DeMoney. All rights reserved.
import { json } from "stream/consumers";
import { LocationObject, LocationObjectFactory } from "./location";
import { UserPreferences, UserPreferencesFactory } from "./userPreferences";

export class User {
    /**
     * Class User
     * 
     * Representation of a user. 
     * 
     * users that auth with google will not store a password or salt and traditional users will not store
     * a google id.
     * 
     * Location will be stored once a user provides it but users will have the option to not place an address
     *
     * @property {string} userId - the hex 32 char uuid of the user
     * @property {string} email - the email of the user
     * @property {string | null } googleId - the googleid of the user if the user chooses to auth with google
     * @property {string} firstName - the first name of the user
     * @property {string} lastName - the last name of the user
     * @property {LocationObject | null} location - location of the user if they choose to provide it
     */
    userId: string;
    email: string;
    googleId: string | null;
    firstName: string;
    lastName: string;
    location: LocationObject | null;
    //OPTIONAL BEHAVIOUR FOR DEBUG AND TESTING ONLY
    preferences: UserPreferences | null;
    constructor(userId: string, email: string, googleId: string | null, 
        firstName: string, lastName: string, location: LocationObject | null,
        preferences: UserPreferences | null
    ){
        this.userId = userId;
        this.email = email;
        this.googleId = googleId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.location = location;
        this.preferences = preferences;
    }
    toJson(){
        return {
            userId: this.userId,
            email: this.email,
            googleId: this.googleId,
            firstName: this.firstName,
            lastName: this.lastName,
            location: this.location,
            //OPTIONAL BEHAVIOUR FOR DEBUG AND TESTING ONLY
            preferences: this.preferences ? this.preferences.toJson() : null
        }
    }
}
export class UserFactory {
    /**
     * generateFromJson
     * 
     * generates a user object with json response from server
     * 
     * @param {Record<string, any>} json_object 
     * @returns {User}
     */
    static generateFromJson(json_object: Record<string, any>):User {
        const userId: string = json_object["userId"];
        const email: string = json_object["email"];
        const googleId: string | null = json_object["googleId"];
        const firstName: string = json_object["firstName"];
        const lastName: string = json_object["lastName"];
        const location: LocationObject | null = json_object["location"] ? LocationObjectFactory.generateLocationFromJson(json_object["location"]) : null;
        const preferences: UserPreferences | null = json_object["preferences"] ? UserPreferencesFactory.generateFromJson(json_object["preferences"]) : null;
        return new User(userId, email, googleId, firstName, lastName, location, preferences)
    }
}