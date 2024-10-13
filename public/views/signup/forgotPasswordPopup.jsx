import React, { createElement, useState, useEffect } from 'react';
import { showError, showSuccess } from '../helperViews/notifications';
import { DatabaseCalls } from '../../../src/content/databaseCalls';
import { getStrengthValues } from '../../../src/content/userValidation';
import { getSalt } from '../../../src/content/auth';
import bcrypt from 'bcryptjs';

export const ForgotPasswordPopup = ({showingForgotPassword, setShowingForgotPassword}) => {
    const [email, setEmail] = useState('');
    const [confirmationCode, setConfirmationCode] = useState('');
    const [validated, setValidated] = useState(false);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [validPassword, setValidPassword] = useState(true);
    const [confirmPasswordValid, setConfirmPasswordValid] = useState(true);
    const [temporaryToken, setTemporaryToken] = useState('');
    return (
        <div className={`popup ${showingForgotPassword ? 'show' : ''} select-resume-popup p-2`}>
            <i className="fa-solid fa-x icon minimize-icon"
            style={{cursor: "pointer"}}
            onClick={()=>{
                setConfirmationCode('');
                setValidated(false);
                setPassword('');
                setConfirmPassword('');
                setTemporaryToken('');
                setShowingForgotPassword(false);
            }}></i>
            {!validated && <>
            <p className='has-text-white is-size-4'>Validate Email Address</p>
            <p className='is-size-7'>Enter the email address you signed up with and we will send a validation code.</p>
            <div className='field has-addons mt-5'>
                <div className="control is-expanded">
                    <input
                        className='input'
                        name='email'
                        value={email}
                        onChange={(e) => {setEmail(e.target.value)}}
                    />
                </div>
                <div class="control">
                    <button 
                    className="button is-success"
                    onClick={async () => {
                        try {
                            await DatabaseCalls.sendMessageToAddConfirmationCode(email, true);
                            showSuccess("Validation code sent.")
                        } catch (err) {
                            showError(err);
                        }
                    }}
                    >
                    Send
                    </button>
                </div>
            </div>
            <p className='has-text-white is-size-6'>Validation Code</p>
            <input 
            type="text" 
            className='input mt-1'
            maxLength={6}
            value={confirmationCode}
            onChange={(e)=>{setConfirmationCode(e.target.value)}}
            style={{width: "200px", textAlign: "center"}}
            />
            <button 
            className='button is-success is-large mt-6'
            onClick={async ()=>{
                try {
                    const token = await DatabaseCalls.sendMessageToEvaluateConfirmationCode(email, confirmationCode, true);
                    setTemporaryToken(token);
                    showSuccess("Validated Email");
                    setValidated(true);
                } catch (err) {
                    showError(err);
                }
            }}
            >
            Submit
            </button>
            </>
            }
            {validated && <>
                <p className='has-text-white is-size-4'>Reset Password</p>
                <div className="field mt-4">
                    <label className="label" htmlFor="password">New Password</label>
                    <div className="control is-expanded">
                        <input
                            className={`input signup-input ${validPassword ? "":"is-danger"}`}
                            type="password"
                            id="password"
                            name="password"
                            placeholder="Password"
                            autocomplete="new-password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                if (e.target.value.length){
                                    setValidPassword(!getStrengthValues(e.target.value).includes(false));
                                }
                            }}
                            maxLength={255}
                            required
                        />
                        {!validPassword && <p class="help is-danger" style={{width: "200px"}}>Password must be 8 characters, have an uppercase letter and symbol.</p>}
                    </div>
                </div>
                <div className="field">
                    <label className="label" htmlFor="confirm-password">Confirm Password</label>
                    <div className="control is-expanded">
                        <input
                            className={`input signup-input ${confirmPasswordValid ? "":"is-danger"}`}
                            type="password"
                            id="confirm-password"
                            name="confirmPassword"
                            placeholder="Password"
                            autocomplete="new-password"
                            value={confirmPassword}
                            onChange={(e) => {
                                setConfirmPassword(e.target.value);
                                if (e.target.value.length){
                                    setConfirmPasswordValid(e.target.value === password);
                                }
                            }}
                            maxLength={255}
                            required
                        />
                    </div>
                    {!confirmPasswordValid && <p class="help is-danger">Passwords don't match</p>}
                </div>
                <button 
                className='button is-success is-large mt-4'
                onClick={async ()=>{
                    if (getStrengthValues(password).includes(false)){
                        showError("Password is too weak");
                        return;
                    }
                    if (!confirmPasswordValid){
                        showError("Passwords don't match");
                        return;
                    }
                    try {
                        const salt = await getSalt(email);
                        const hashedPW = bcrypt.hashSync(password, salt);
                        await DatabaseCalls.sendMessageToResetPassword(temporaryToken, hashedPW);
                        showSuccess("Successfully reset password");
                        setConfirmationCode('');
                        setValidated(false);
                        setPassword('');
                        setConfirmPassword('');
                        setTemporaryToken('');
                        setShowingForgotPassword(false);
                    } catch (err) {
                        showError(err);
                    }
                }}
                >
                Submit
                </button>
            </>}
        </div>
        )
    }
