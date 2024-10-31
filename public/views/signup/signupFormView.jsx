import React, { createElement, useState, useEffect } from 'react';
import { DotProgressBarView } from '../helperViews/dotProgressBarView';
import { validateRawSignUpData, validateLocation , validateRawSignUpDataAllowEmpty} from '@applicantiq/applicantiq_core/Core/userValidation'
import { showError } from '../helperViews/notifications';
import { LocationObjectFactory } from '@applicantiq/applicantiq_core/Core/location';
import { User } from '@applicantiq/applicantiq_core/Core/user';
import { UserPreferences } from '@applicantiq/applicantiq_core/Core/userPreferences';
import { PaymentFrequency } from '@applicantiq/applicantiq_core/Core/job';
import { register } from '@applicantiq/applicantiq_core/Core/auth';
import { useNavigate } from 'react-router-dom';
import { genSaltSync } from 'bcryptjs';
import { LocalStorageHelper } from '@applicantiq/applicantiq_core/Core/localStorageHelper';
import { EmailConfirmationPopup } from './emailConfirmationPopup';
import { DatabaseCalls } from '@applicantiq/applicantiq_core/Core/databaseCalls'

const NUMTABS = 5

export const SignupFormView = () => {
    return (
        <p>Oops! signup is now handled through the website</p>
    )
}