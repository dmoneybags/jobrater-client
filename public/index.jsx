import React, { createElement, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';
import { JobDebugView } from '../src/tests/debugView/debugView'
import { ReadingHelperFunctions } from '../src/content/readingHelperFunctions'
import '../src/assets/css/base.css'
import { HashRouter, Routes, Route } from "react-router-dom";
import { HomeView } from './views/home/homeView';
import { Spinner } from './views/helperViews/loadingSpinner'
import { LoginOrSignupView } from './views/signup/loginOrSignupView';
import { ResumesView } from './views/home/resumesView';
import { SettingsView } from './views/home/settingsView';
import { ProfileView } from './views/home/profileView';
import { FeedbackView } from './views/home/feedbackView';
import { PopupLinkView } from './views/popup/popupLinkView';
import { LocalStorageHelper } from '@applicantiq/applicantiq_core/Core/localStorageHelper';
import { asyncSetLatestJob } from './views/home/homeView';

const BASEURL = "extension://jdmbkjofpaobeedpmoeoocbjnhpfalmm";

const DEBUG = false;

const MainView = ({ContentView}) => {
  const [isAuthed, setIsAuthed] = useState(false);
  const [windowType, setWindowType] = useState(null);
  const location = useLocation();

  useEffect(() => {
    console.log("Loading main view...");

    const params = new URLSearchParams(window.location.search)
    console.log("With params:");
    console.log(params);

    if (params.get("windowType") === "detached") {
      setWindowType('detached');
    } else {
      setWindowType('popup');
    }

    //anyone who calls the main view can set the latest job to show the user a cetrain job
    if (params.get("latestJob")){
      console.log("Got latest job arg of:");
      console.log(params.get("latestJob"));
      asyncSetLatestJob(params.get("latestJob"));
    }

    // Check if the user is authorized when the component mounts
    const checkAuth = async () => {
      const authStatus = await ReadingHelperFunctions.isAuthed();
      //Remove after testing auth routes
      setIsAuthed(authStatus);
    };

    checkAuth();
    chrome.action.setBadgeText({ text: '' }); // clear badge
  }, []); 

  //UNUSED
  if (isAuthed === null) {
    // Optionally, you could render a loading spinner or nothing while checking auth status
    return(
      <>
        <div style={{paddingTop: "40px"}}>
          <Spinner/>
        </div>
      </>
    );
  }
  if (windowType === "detached"){
    return (
      <>
        <div className="app-container">
          {isAuthed ? <ContentView /> : <LoginOrSignupView />}
        </div>
      </>
    );
  }
  return (
    <PopupLinkView/>
  )
}

const App = () => {  
  // Conditionally render based on windowType
  return (
    <HashRouter>
      <Routes>
        {/* if were debugging show the debug view */}
          <Route path="/" element = {DEBUG ? <JobDebugView/>:<MainView ContentView={HomeView}/>}/>
          <Route path="/resumes" element = {<MainView ContentView={ResumesView}/>}/>
          <Route path="/settings" element = {<MainView ContentView={SettingsView}/>}/>
          <Route path="/profile" element = {<MainView ContentView={ProfileView}/>}/>
          <Route path="/feedback" element = {<MainView ContentView={FeedbackView}/>}/>
          <Route path="*" element={<p>{"404 " + location.href + " not found"}</p>} />            
      </Routes>
    </HashRouter>
  );
};

export default App;
const container = document.getElementById('app');
const root = createRoot(container);
root.render(<App />);