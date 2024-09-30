import { LocationObject } from "./location";
import { UserPreferences } from "./userPreferences";

export class LocationHelperFunctions {
    static isCommutable = (location: LocationObject, userLocation: LocationObject):boolean => {
        const latDiff = Math.abs(location.latitude - userLocation.latitude);
        const lngDiff = Math.abs(location.longitude - userLocation.longitude);

        return !(latDiff >= 1 || lngDiff >= 1)
    }
}