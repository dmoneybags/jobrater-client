import React, { createElement, useState, useEffect } from 'react';
import { showError } from '../helperViews/notifications';

//db can support 10 but ui problems
const MAXKEYWORDS = 5

export const KeywordInputView = ({formData, setFormData, handleChange}) => {
    const [currentPositiveKeyword, setCurrentPositiveKeyword] = useState('');
    const [currentNegativeKeyword, setCurrentNegativeKeyword] = useState('');
    const addPositiveKeyword = (keyword) => {
        const currentPositiveKeywords = formData["positiveKeywords"];
        currentPositiveKeywords.push(keyword);
        setFormData(prevFormData => ({
            ...prevFormData,
            positiveKeywords: currentPositiveKeywords,
        }));
    }
    const addNegativeKeyword = (keyword) => {
        const currentNegativeKeywords = formData["negativeKeywords"];
        currentNegativeKeywords.push(keyword);
        setFormData(prevFormData => ({
            ...prevFormData,
            negativeKeywords: currentNegativeKeywords,
        }));
    }
    return (
        <form style={{width: "100%"}}>
            <div className="field">
                <p className="control is-expanded">
                    <p style={{textAlign: "center", padding: "10px"}}>What are you looking for?</p>
                </p>
                <hr style={{width: '80%', margin: "auto"}} />
            </div>
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
                            if (formData.positiveKeywords.includes(currentPositiveKeyword)){
                                showError(`You already added ${currentPositiveKeyword}`);
                                return;
                            }
                            if (formData.positiveKeywords.length >= MAXKEYWORDS){
                                showError("Cannot add more than 5 keywords");
                                return;
                            }
                            addPositiveKeyword(currentPositiveKeyword);
                            setCurrentPositiveKeyword("");
                        }}
                        >
                        Add
                        </button>
                    </div>
                </div>
            </div>
            <div id='positiveKeywordBox' className='keyword-box'>
                {formData.positiveKeywords.map((keyword, index) => 
                    <div key={index} className="button is-small is-info" style={{ display: "inline-flex", alignItems: "center", margin: "4px", height: "20px" }}>
                        {keyword}
                        <i 
                            className="fas fa-times" 
                            style={{ cursor: "pointer", fontSize: "10px", marginLeft: "4px"}}
                            onClick={()=>{
                                let currentPositiveKeywords = formData["positiveKeywords"];
                                currentPositiveKeywords = currentPositiveKeywords.filter(positiveKeyword=> positiveKeyword !== keyword);
                                setFormData(prevFormData => ({
                                    ...prevFormData,
                                    positiveKeywords: currentPositiveKeywords,
                                }));
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
                            onChange={(e) => {setCurrentNegativeKeyword(e.target.value)}}
                        />
                    </div>
                    <div class="control">
                        <button 
                        class="button is-info" 
                        style={{height:"30px"}}
                        onClick={(e) => {
                            e.preventDefault();
                            if (formData.negativeKeywords.includes(currentNegativeKeyword)){
                                showError(`You already added ${currentNegativeKeyword}`);
                                return;
                            }
                            if (formData.negativeKeywords.length >= MAXKEYWORDS){
                                showError("Cannot add more than 5 keywords");
                                return;
                            }
                            if (!currentNegativeKeyword.length){
                                return;
                            }
                            addNegativeKeyword(currentNegativeKeyword);
                            setCurrentNegativeKeyword("");
                        }}
                        >
                        Add
                        </button>
                    </div>
                </div>
            </div>
            <div id='negativeKeywordBox' className='keyword-box'>
                {formData.negativeKeywords.map((keyword, index) => 
                    <div key={index} className="button is-small is-info" style={{ display: "inline-flex", alignItems: "center", margin: "4px", height: "20px" }}>
                    {keyword}
                        <i 
                            className="fas fa-times" 
                            style={{ cursor: "pointer", fontSize: "10px", marginLeft: "4px"}}
                            onClick={()=>{
                                let currentNegativeKeywords = formData["negativeKeywords"];
                                currentNegativeKeywords = currentNegativeKeywords.filter(positiveKeyword=> positiveKeyword !== keyword);
                                setFormData(prevFormData => ({
                                    ...prevFormData,
                                    negativeKeywords: currentNegativeKeywords,
                                }));
                            }}
                        ></i>
                    </div>
                )}
            </div>
        </form>
    )
}