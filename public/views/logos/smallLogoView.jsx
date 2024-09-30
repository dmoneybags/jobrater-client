import React, { createElement, useState, useEffect } from 'react';

export const SmallLogoView = ({color}) => {
    return (
        <p className="is-size-3 main-logo" style={{"color": color, "paddingTop": 0}}>applicantIQ</p>
    )
}