import React, { createElement, useState, useEffect } from 'react';
import '../../../src/assets/css/helper.css'

export const DotProgressBarView = ({totalNum, selected}) => {
    const elements = Array.from({ length: totalNum }, (_, index) => (
        <div class="circle" style={{ backgroundColor: index === selected ? 'white' : '#969696' }}></div>
    ));
    return (
        <div class="circle-container">
            {elements}
        </div>
    )   
}