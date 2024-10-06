import React, { createElement, useState, useEffect } from 'react';
import { DotProgressBarView } from '../helperViews/dotProgressBarView';
import { SignupEmailPwTabView } from './signupEmailPwTabView';
import { PreferencesTabView } from './preferencesTabView';
import { CareerStageTabView } from './careerStageTabView';
import { LocationInputView } from './locationInputView';
import { validateRawSignUpData, validateLocation , validateRawSignUpDataAllowEmpty} from '../../../src/content/userValidation'
import { showError } from '../helperViews/notifications';
import { LocationObjectFactory } from '../../../src/content/location';
import { User } from '../../../src/content/user';
import { UserPreferences } from '../../../src/content/userPreferences';
import { PaymentFrequency } from '../../../src/content/job';
import { register } from '../../../src/content/auth';
import { useNavigate } from 'react-router-dom';
import { genSaltSync } from 'bcryptjs';
import { LocalStorageHelper } from '../../../src/content/localStorageHelper';

export const SignupFormView = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        desiredPaymentFreq: 'yr',
        desiredPay: 30000,
        desiredPaySliderValue: 0,
        desiredCommute: 0,
        desiredCommuteSliderValue: 0,
        street: '',
        city: '',
        zipCode: '',
        stateCode: '',
        desiresRemote: false,
        desiresHybrid: false,
        desiresOnsite: false,
        desiredCareerStage: '',
        wontShareLocation: false,
        street: '',
        zipCode: '',
        stateCode: '',
        city: '',
        latitude: 0,
        longitude: 0,
        //oh its a long one :)
        //set it as true for first run so no ugly red stuff shows up
        validationData: {
            firstNameValid: true,
            lastNameValid: true,
            emailValid: true,
            passwordValid: true,
            confirmPasswordValid: true,
            streetValid: true,
            cityValid: true,
            zipCodeValid: true,
            stateCodeValid: true,
            modesValid: true,
            careerStageValid: true
        }
    });

    const [selectedTab, setSelectedTab] = useState(0);

    const [waitingForSignIn, setWaitingForSignIn] = useState(false);
    //redirecting to home
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        const newValidationData = validateRawSignUpDataAllowEmpty({ ...formData, [name]: value });
        setFormData(prevFormData => ({
            ...prevFormData,
            validationData: newValidationData
        }));
    };

    const attemptSignUp = async (event) => {
        event.stopPropagation();
        event.preventDefault();
        console.log("=========== ATTEMPTING TO SIGN UP USER =============")
        console.debug("formData current state:");
        console.debug(formData);
        const newValidationData = validateRawSignUpData(formData);
        console.debug("validation data new state:");
        console.debug(newValidationData);
        setFormData(prevFormData => ({
            ...prevFormData,
            validationData: newValidationData
        }));

        if (Object.values(newValidationData).includes(false)){
            showError("Can't sign up, some fields are invalid or not filled");
            return;
        }

        let location = null
        if (!formData.wontShareLocation){
            console.log("Checking location...");
            let response;
            try {
                //call mapbox to validate location
                response = await validateLocation({
                    "street": formData.street,
                    "city": formData.city,
                    "zipCode": formData.zipCode,
                    "stateCode": formData.stateCode
                });
            } catch {
                showError("Couldn't load location, check fields and try again");
                return;
            }
            location = LocationObjectFactory.generateLocationFromJson({
                "addressStr": formData.street,
                "city": formData.city,
                "zipCode": formData.zipCode,
                "stateCode": formData.stateCode,
                "latitude": response["coordinates"][1], 
                "longitude": response["coordinates"][0]
            });
        }

        //Create out user object with our form data
        const user = new User(null, formData["email"], null, formData["firstName"], formData["lastName"], location,
            new UserPreferences(null, formData["desiredPay"], new PaymentFrequency(formData["desiredPaymentFreq"]), formData["desiredCommute"], formData["desiresRemote"],
        formData["desiresHybrid"], formData["desiresOnsite"], formData["desiredCareerStage"], true, true, true)
        );

        const salt = genSaltSync(4);
        let res = "";

        try {
            res = await register(user, formData["password"], formData["confirmPassword"], salt);
        } catch (err) {
            showError(err);
            return;
        }

        if (res === "Success"){
            console.log("Signed in! redirecting...");
            //Have to clear expiration time and force client to regrab
            await LocalStorageHelper.__sendMessageToBgScript({ action: "storeData", key: "userDataLastGrabbed", value: 0});
            // Navigate to the current path, forcing a reload
            navigate("/", { replace: true, state: { firstLogin: true } });
            // Force reload
            window.location.reload();
        } else {
            console.log("Recieved unknown res of ");
            console.log(res);
        }
    }
    return (
        <>
            <DotProgressBarView totalNum={4} selected={selectedTab}/>
            {selectedTab > 0 && <i
            onClick={() => {setSelectedTab(Math.max(selectedTab - 1, 0))}}
            className='fas fa-angle-left fa-xl signup-backward-arrow has-text-link'
            ></i>
            }
            {selectedTab < 3 && <i
            onClick={() => {setSelectedTab(Math.min(selectedTab + 1, 3))}}
            className='fas fa-angle-right fa-xl signup-forward-arrow has-text-link'
            ></i>}
            {selectedTab === 0 && <SignupEmailPwTabView formData={formData} handleChange={handleChange}/>}
            {selectedTab === 1 && <PreferencesTabView formData={formData} setFormData={setFormData} handleChange={handleChange}/>}
            {selectedTab === 2 && <CareerStageTabView formData={formData} setFormData={setFormData} handleChange={handleChange}/>}
            {selectedTab === 3 && <LocationInputView formData={formData} setFormData={setFormData} handleChange={handleChange}/>}
            {selectedTab === 3 && <button 
            className={`button is-link ${waitingForSignIn ? 'is-loading' : ''}`} 
            style={{ 
            width: "30%", 
            display: "block", 
            margin: "20px auto 0 auto" 
            }}
            onClick={async (e)=>{
                setWaitingForSignIn(true);
                console.log("Set waiting for sign in")
                attemptSignUp(e);
                //if we got here we also failed but due to an expected reason
                setWaitingForSignIn(false);
            }}
            >Submit</button>}
        </>
    )
}