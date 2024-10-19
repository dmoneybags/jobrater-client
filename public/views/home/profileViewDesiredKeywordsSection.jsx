import React, { createElement, useState, useEffect } from 'react';
import { DatabaseCalls } from '@applicantiq/applicantiq_core/Core/databaseCalls';
import { LocalStorageHelper } from '@applicantiq/applicantiq_core/Core/localStorageHelper';
import { showError, showSuccess } from '../helperViews/notifications';

const MAXKEYWORDS = 5;

export const ProfileViewDesiredKeywordsSection = ({user, setShowingId, reloadFunc}) => {
    const [currentPositiveKeyword, setCurrentPositiveKeyword] = useState('');
    const [currentNegativeKeyword, setCurrentNegativeKeyword] = useState('');
    const [currentPositiveKeywords, setCurrentPositiveKeywords] = useState(user.preferences.positiveKeywords);
    const [currentNegativeKeywords, setCurrentNegativeKeywords] = useState(user.preferences.negativeKeywords);
    return (
        <>
            <div className="field mt-4">
                <label className="label is-size-6">I am looking for:</label>
                <div className='field has-addons'>
                    <div className="control is-expanded">
                        <input
                            style={{height:"30px"}}
                            className='input'
                            placeholder="ex: 'c++', 'AI', 'dev-ops'"
                            name='positiveKeywordInput'
                            value={currentPositiveKeyword}
                            maxLength={20}
                            onChange={(e) => {setCurrentPositiveKeyword(e.target.value)}}
                        />
                    </div>
                    <div class="control">
                        <button 
                        class="button is-info" 
                        style={{height:"30px"}}
                        onClick={(e) => {
                            e.preventDefault();
                            if (!currentPositiveKeyword.length){
                                return;
                            }
                            if (currentPositiveKeywords.includes(currentPositiveKeyword)){
                                showError(`You already added ${currentPositiveKeyword}`);
                                return;
                            }
                            if (currentPositiveKeywords.length >= MAXKEYWORDS){
                                showError("Cannot add more than 5 keywords");
                                return;
                            }
                            const currentPositiveKeywordsCopy = currentPositiveKeywords;
                            currentPositiveKeywordsCopy.push(currentPositiveKeyword);
                            setCurrentPositiveKeywords(currentPositiveKeywordsCopy);
                            setCurrentPositiveKeyword("");
                        }}
                        >
                        Add
                        </button>
                    </div>
                </div>
            </div>
            <div id='positiveKeywordBox' className='keyword-box'>
                {currentPositiveKeywords.map((keyword, index) => 
                    <div key={index} className="button is-small is-info" style={{ display: "inline-flex", alignItems: "center", margin: "4px", height: "20px" }}>
                        {keyword}
                        <i 
                            className="fas fa-times" 
                            style={{ cursor: "pointer", fontSize: "10px", marginLeft: "4px"}}
                            onClick={()=>{
                                const currentPositiveKeywordsCopy = currentPositiveKeywords.filter(positiveKeyword => positiveKeyword !== keyword);
                                setCurrentPositiveKeywords(currentPositiveKeywordsCopy);
                            }}
                        ></i>
                    </div>
                )}
            </div>
            <div className="field mt-4">
                <label className="label is-size-6">I am looking to stay away from:</label>
                <div className='field has-addons'>
                    <div className="control is-expanded">
                        <input
                            style={{height:"30px"}}
                            className='input'
                            placeholder="ex: 'contract', 'agile'"
                            name='negativeKeywordInput'
                            value={currentNegativeKeyword}
                            maxLength={20}
                            onChange={(e) => {setCurrentNegativeKeyword(e.target.value)}}
                        />
                    </div>
                    <div class="control">
                        <button 
                        class="button is-info" 
                        style={{height:"30px"}}
                        onClick={(e) => {
                            e.preventDefault();
                            if (currentNegativeKeywords.includes(currentNegativeKeyword)){
                                showError(`You already added ${currentNegativeKeyword}`);
                                return;
                            }
                            if (currentNegativeKeywords.length >= MAXKEYWORDS){
                                showError("Cannot add more than 5 keywords");
                                return;
                            }
                            if (!currentNegativeKeyword.length){
                                return;
                            }
                            const currentNegativeKeywordsCopy = currentNegativeKeywords;
                            currentNegativeKeywordsCopy.push(currentNegativeKeyword);
                            setCurrentNegativeKeywords(currentNegativeKeywordsCopy);
                            setCurrentNegativeKeyword("");
                        }}
                        >
                        Add
                        </button>
                    </div>
                </div>
            </div>
            <div id='negativeKeywordBox' className='keyword-box'>
                {currentNegativeKeywords.map((keyword, index) => 
                    <div key={index} className="button is-small is-info" style={{ display: "inline-flex", alignItems: "center", margin: "4px", height: "20px" }}>
                    {keyword}
                        <i 
                            className="fas fa-times" 
                            style={{ cursor: "pointer", fontSize: "10px", marginLeft: "4px"}}
                            onClick={()=>{
                                const currentNegativeKeywordsCopy = currentNegativeKeywords.filter(positiveKeyword=> positiveKeyword !== keyword);
                                setCurrentNegativeKeywords(currentNegativeKeywordsCopy);
                            }}
                        ></i>
                    </div>
                )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                <button 
                className='button is-danger m-1'
                onClick={()=>setShowingId(0)}
                >Cancel</button>
                <button 
                className='button is-info m-1'
                onClick={async ()=>{
                    try {
                        await DatabaseCalls.sendMessageToUpdateUserKeywords(currentPositiveKeywords, currentNegativeKeywords);
                        const activeUser = await LocalStorageHelper.getActiveUser();
                        //overly careful copy because I forget react behaviour setting soemthing to a state value
                        activeUser.preferences.positiveKeywords = [...currentPositiveKeywords];
                        activeUser.preferences.negativeKeywords = [...currentNegativeKeywords];
                        await LocalStorageHelper.setActiveUser(activeUser);
                        reloadFunc();
                        showSuccess("Updated Keywords");
                    } catch (err) {
                        showError(err);
                    }
                }}
                >
                Update</button>
            </div>
        </>
    )
}