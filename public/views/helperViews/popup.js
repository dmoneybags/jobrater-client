import React from 'react';
import ReactDOM from 'react-dom';
import { PopupHeaderView } from './popupHeaderView';
import { HashRouter } from 'react-router-dom';

const HEADERSIZE = "70px"

export const showFullscreenPopup = (Component, props, title, subtitle, exitCallback = () => {}, overwrite = true) => {
    document.body.style.overflow = 'hidden';
    const popup = document.createElement('div');
    popup.className = 'popup-fullscreen';
    popup.id = 'fullscreen-popup';

    if (document.getElementById('fullscreen-popup')){
        //document.body.style.overflow = 'visible';
        const curPopup = document.getElementById("fullscreen-popup");
        if (curPopup && overwrite) {
            curPopup.remove();
        } else if (curPopup) {
            let iterator = 1;
            let zIndex = Number(window.getComputedStyle(curPopup).zIndex);
            do {
                popup.id = 'fullscreen-popup' + String(iterator++);
                popup.style.setProperty('z-index', String(++zIndex), 'important')
            } while(document.getElementById('fullscreen-popup' + String(iterator)))
        }
    }
    
    document.body.prepend(popup);
    console.log("Setting up full screen popup view...");
    console.log("with props:");
    console.log(props);

    ReactDOM.render(
        <>
            <HashRouter>
                <PopupHeaderView exitCallbackFn={exitCallback} title={title} subtitle={subtitle} id={popup.id}/>
                <div style={{marginTop: HEADERSIZE}}>
                    <Component {...props}/>
                </div>
            </HashRouter>
        </>,
        popup
    );

    // Trigger the animation
    requestAnimationFrame(() => {
        popup.classList.add('show');
    });
}