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
/* Returns a promise that will be resolved*/
/* Resolves true if user clicked the ok, false if they clicked false*/
export const asynchronousBlockingPopup = (text, subtext, okText, okFunction, cancelText, cancelFunction) => {
    return new Promise((resolve, reject) => {
        const popup = document.createElement('div');
        popup.className = 'popup';
        popup.style.zIndex = "10000";
        popup.style.padding = "10px";
        popup.style.minHeight = "200px";
        popup.style.height = "150px";
        document.body.prepend(popup);

        ReactDOM.render(
            <>
                <p className='has-text-white'>{text}</p>
                <p className='is-size-7'>{subtext}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: "10px"}}>
                    <button 
                    className="button is-focused" 
                    style={{ margin: '0 10px' }}
                    onClick={() =>{
                        okFunction();
                        popup.classList.remove('show');
                        resolve(true);
                    }}
                    >
                        {okText}
                    </button>
                    <button 
                    className="button" 
                    style={{ margin: '0 10px' }}
                    onClick={()=>{
                        cancelFunction();
                        popup.classList.remove('show');
                        resolve(false);
                    }}
                    >
                        {cancelText}
                    </button>
                </div>
            </>,
            popup
        );
        // Trigger the animation
        requestAnimationFrame(() => {
            popup.classList.add('show');
        });
    })
}