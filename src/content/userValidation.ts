//(c) 2024 Daniel DeMoney. All rights reserved.
/*
Execution flow:

SignUp.html: prompts user to sign up

\/
\/

userValidation.js: ensures data passed to sign up and login functions is valid

GROUND TRUTH, SQL DB and USER_COLUMNS IN database_functions.py
*/
import { sign } from "crypto";
import { User } from "./user"
import { request } from "http";

const MINIMUMPASSWORDLENGTH: number = 8;
const isProduction = CLIENT_ENV.ENVIRONMENT === 'production';
const server = isProduction ? CLIENT_ENV.PROD_API_URL:CLIENT_ENV.DEV_API_URL;
/**
 * validateEmail
 * 
 * Called when a user enters their email, returns true for valid email false for invalid email
 * 
 * @param {string} email - email we are attmepting to validate
 * @returns {boolean}
 */
const validateEmail = (email: string) => {
    const regEx : RegExp= /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
    //return true if we find a match false if not
    return regEx.test(email);
}
/**
 * getStrengthValues
 * 
 * Tests the password on 3 tests (has special characters, length is correct, and has caps)
 * 
 * @param {string} password - the string password of the user, unhashed
 * @returns {boolean[]} result for each test as given in the order above
 */
const getStrengthValues = (password: string): boolean[]  => {
    //return values are 
    //0: whether or not the string contains a special character
    //1: whether or not the string is over 8 characters
    //2: is there a caps
    let returnValues: boolean[] = [false, false, false];
    const specialCharactersPattern: RegExp = /[!@#$%^&*(),.?":{}|<>]/;
    const capsCharactersPattern: RegExp = /[A-Z]/;
    returnValues[0] = specialCharactersPattern.test(password);
    console.log("passwordLength: " + password.length);
    returnValues[1] = password.length >= MINIMUMPASSWORDLENGTH;
    returnValues[2] = capsCharactersPattern.test(String(capsCharactersPattern));
    console.log("PASSWORD CONTAINS SPECIAL CHARACTER: " + returnValues[0] + 
        ", PASSWORD is long enough: " + returnValues[1] + 
        ", PASSWORD HAS CAPS " + returnValues[2]);
    return returnValues;
}
/**
 * validateUserJson
 * 
 * ensures that a users data is valid before registration
 * 
 * returns json descibing the validity
 * 
 * @param {user} user 
 * @param {string} password
 * @param {string} retypedPassword 
 * @returns {Record<string, any>} 
 * {
 *  isValid: whether or not data is valid
 *  message: why its invalid
 *  code: code that corresponds to that invalid reason
 * }
 */
export const validateUser = (user: User, password: string, retypedPassword: string) => {
    if (!validateEmail(user.email)){
        return {
            isValid: false,
            message: "invalid email",
            code: 1
        }
    }
    if (getStrengthValues(password).includes(false)){
        return {
            isValid: false,
            message: "weak password",
            code: 2
        }
    }
    if (password !== retypedPassword){
        return {
            isValid: false,
            message: "passwords don't match",
            code: 3
        }
    }
    return {
        isValid: true,
        message: "Valid user data",
        code: 0
    }
}
export const validateLocationData = (locationJson: Record<string, any>, validationData: Record<string, any>,) => {
    validationData.streetValid = /^\d+\s[A-Za-z ]+$/.test(locationJson.street);
    validationData.cityValid = /^[A-Za-z\s-]{2,}$/.test(locationJson.city);
    validationData.zipCodeValid = /^\d{5}$/.test(locationJson.zipCode);
    validationData.stateCodeValid = /^[A-Z]{2}$/.test(locationJson.stateCode);
}
/**
 * validateRawSignUpData
 * 
 * Validates the raw data from the signup sheet consisting of:
 * 
 * {
    "firstName": "Andrew",
    "lastName": "Jackson",
    "email": "D@gmail.com",
    "password": "pw",
    "confirmPassword": "pw",
    "desiredPaymentFreq": "year",
    "desiredPay": 186831.68316831684,
    "desiredPaySliderValue": 0.42386941396842387,
    "desiredCommute": 28.496119882258498,
    "desiredCommuteSliderValue": 0.23120149852823121,
    "street": "",
    "city": "",
    "zipCode": "",
    "stateCode": "",
    "desiresRemote": false,
    "desiresHybrid": "on",
    "desiresOnsite": "on",
    "wontShareLocation": true,
    "latitude": 0,
    "longitude": 0,
    "validationData": {
        "firstNameValid": true,
        "lastNameValid": true,
        "emailFilled": true,
        "passwordValid": true,
        "confirmPasswordValid": true,
        "streetValid": true,
        "cityValid": true,
        "zipCodeValid": true,
        "stateCodeValid": true,
        "modesValid": true
    }
}
*/
export const validateRawSignUpData = (signUpJson: Record<string, any>):Record<string, any> => {
    const validationData = {
        "firstNameValid": true,
        "lastNameValid": true,
        "emailFilled": true,
        "passwordValid": true,
        "confirmPasswordValid": true,
        "streetValid": true,
        "cityValid": true,
        "zipCodeValid": true,
        "stateCodeValid": true,
        "modesValid": true,
        "careerStageValid": true
    }
    validationData.firstNameValid = (signUpJson.firstName.length < 255 && signUpJson.firstName.length > 0);
    validationData.lastNameValid = (signUpJson.lastName.length < 255 && signUpJson.lastName.length > 0);
    validationData.emailFilled = signUpJson.email.length > 0;
    //a little confusing but checking that there are no falses in strength values
    validationData.passwordValid = !(getStrengthValues(signUpJson.password).includes(false));
    validationData.confirmPasswordValid = signUpJson.password === signUpJson.confirmPassword;
    validationData.modesValid = signUpJson.desiresRemote || signUpJson.desiresOnsite || signUpJson.desiresHybrid;
    validationData.careerStageValid = signUpJson.desiredCareerStage != '';
    if (!signUpJson.wontShareLocation){
        validateLocationData(signUpJson, validationData);
    }
    return validationData;
}
export const validateRawSignUpDataAllowEmpty = (signUpJson: Record<string, any>): Record<string, any> => {
    const validationData = {
        "firstNameValid": true,
        "lastNameValid": true,
        "emailValid": true,
        "passwordValid": true,
        "confirmPasswordValid": true,
        "streetValid": true,
        "cityValid": true,
        "zipCodeValid": true,
        "stateCodeValid": true,
        "modesValid": true,
        "careerStageValid": true
    }

    // Allow empty strings (''), but if not empty, apply the length validation
    validationData.firstNameValid = signUpJson.firstName.length === 0 || (signUpJson.firstName.length < 255 && signUpJson.firstName.length > 0);
    validationData.lastNameValid = signUpJson.lastName.length === 0 || (signUpJson.lastName.length < 255 && signUpJson.lastName.length > 0);
    validationData.emailValid = signUpJson.email.length === 0 || /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(signUpJson.email);

    // Same validation for password and confirm password, as they are critical
    validationData.passwordValid = signUpJson.password.length === 0 || !(getStrengthValues(signUpJson.password).includes(false));
    validationData.confirmPasswordValid = signUpJson.confirmPassword.length === 0 || signUpJson.password === signUpJson.confirmPassword;

    if (!signUpJson.wontShareLocation) {
        validationData.streetValid = signUpJson.street.length === 0 || /^\d+\s[A-Za-z ]+$/.test(signUpJson.street);
        validationData.cityValid = signUpJson.city.length === 0 || /^[A-Za-z\s-]{2,}$/.test(signUpJson.city);
        validationData.zipCodeValid = signUpJson.zipCode.length === 0 || /^\d{5}$/.test(signUpJson.zipCode);
        validationData.stateCodeValid = signUpJson.stateCode.length === 0 || /^[A-Z]{2}$/.test(signUpJson.stateCode);
    }

    return validationData;
}
/**
 * validateLocation
 * 
 * @param {Record<string, any>} address form of:
 *      {
 *          street: "112 adrian pl"
 *          city: "Los Gatos"
 *          zipCode: "95032"
 *          stateCode: "CA"
 *      }
 */
export const validateLocation = async(address: Record<string, any>):Promise<Record<string, any>> => {
    try {
        const response = await fetch(`${server}api/verify_address?searchJson=${JSON.stringify(address)}`);
        const responseJson = await response.json();
        return responseJson;
    } catch {
        console.log("Failed grabbing location");
        return null;
    }
}