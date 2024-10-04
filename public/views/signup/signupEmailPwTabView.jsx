import React, { createElement, useState, useEffect } from 'react';

export const SignupEmailPwTabView = ({formData, handleChange, validEmail}) => {
    return (
        <form className="email-input-container">
            <div className="field is-grouped is-grouped-centered">
                <div className="field">
                    <label className="label" htmlFor="firstName">First Name</label>
                    <div className="control is-expanded">
                        <input
                            className={`input signup-input ${formData.validationData.firstNameValid ? "":"is-danger"}`}
                            type="text"
                            id="firstName"
                            name="firstName"
                            placeholder="Josh"
                            value={formData.firstName}
                            onChange={handleChange}
                            maxLength={255}
                            required
                        />
                    </div>
                </div>
                <div className="field">
                    <label className="label" htmlFor="lastName">Last Name</label>
                    <div className="control is-expanded">
                        <input
                            className={`input signup-input ${formData.validationData.lastNameValid ? "":"is-danger"}`}
                            type="text"
                            id="lastName"
                            name="lastName"
                            placeholder="Ferguson"
                            value={formData.lastName}
                            onChange={handleChange}
                            maxLength={255}
                            required
                        />
                    </div>
                </div>
            </div>
            <div className="field">
                <label className="label" htmlFor="email">Email</label>
                <div className="control is-expanded">
                    <input
                        className={`input signup-input ${(formData.validationData.emailFilled && validEmail) ? "":"is-danger"}`}
                        type="email"
                        id="email"
                        name="email"
                        placeholder="Email input"
                        value={formData.email}
                        onChange={handleChange}
                        maxLength={255}
                        required
                    />
                </div>
            </div>
            {!validEmail && <p class="help is-danger">This email is invalid</p>}
            <div className="field">
                <label className="label" htmlFor="password">Password</label>
                <div className="control is-expanded">
                    <input
                        className={`input signup-input ${formData.validationData.passwordValid ? "":"is-danger"}`}
                        type="password"
                        id="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        maxLength={255}
                        required
                    />
                </div>
                {!formData.validationData.passwordValid && <p class="help is-danger">Password must be 8 characters, have an Uppercase letter, number, and symbol.</p>}
            </div>
            <div className="field">
                <label className="label" htmlFor="confirm-password">Confirm Password</label>
                <div className="control is-expanded">
                    <input
                        className={`input signup-input ${formData.validationData.confirmPasswordValid ? "":"is-danger"}`}
                        type="password"
                        id="confirm-password"
                        name="confirmPassword"
                        placeholder="Password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        maxLength={255}
                        required
                    />
                </div>
                {!formData.validationData.confirmPasswordValid && <p class="help is-danger">Passwords don't match</p>}
            </div>
        </form>
    )
}