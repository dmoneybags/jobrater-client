import React, { createElement } from 'react';

export const PopupHeaderView = ({exitCallbackFn = () => {}, title, subtitle, id}) => {
    return (
        <nav 
        className="navbar is-link is-fixed-top" 
        role="navigation" 
        aria-label="main navigation"
        style={{height: "70px"}}
        >
            <div className='has-text-white is-size-6 popup-title-container'>
                <p className='popup-title' style={{fontSize: title.length > 45 ? "12px" : "18px"}}>{title}</p>
                <p className='popup-subtitle'>{subtitle.length > 32 ? subtitle.substring(0, 32) + "..." : subtitle}</p>
            </div>
            <i 
            className="fa-solid fa-share icon minimize-icon fa-xl fa-flip-horizontal" 
            style={{cursor: "pointer"}}
            onClick={()=>{
                exitCallbackFn();
                document.body.style.overflow = 'visible';
                const popup = document.getElementById(id);
                if (popup) {
                    popup.remove();
                }
            }}
            ></i>
        </nav>
    )
}