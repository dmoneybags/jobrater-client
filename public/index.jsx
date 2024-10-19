import React, { createElement, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';
import { JobDebugView } from '../src/tests/debugView/debugView'
import { ScrapingHelperFunctions } from '../src/content/scrapingHelperFunctions'
import '../src/assets/css/base.css'
import { HashRouter, Routes, Route } from "react-router-dom";
import { HomeView } from './views/home/homeView';
import { Spinner } from './views/helperViews/loadingSpinner'
import { LoginOrSignupView } from './views/signup/loginOrSignupView';
import { ResumesView } from './views/home/resumesView';
import { SettingsView } from './views/home/settingsView';
import { ProfileView } from './views/home/profileView';
import { PopupLinkView } from './views/popup/popupLinkView';
import { LocalStorageHelper } from '@applicantiq/applicantiq_core/Core/localStorageHelper';
import { WindowingFunctions } from '../src/background/windowingFunctions';

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
      const asyncSetLatestJob = async () => {
        //spaghetti code but basically first we check if the job is in local storage
        //if its a new job we first check if content script is loading it, else we send a request to scrape
        const jobExists = await LocalStorageHelper.jobExistsInLocalStorage(params.get("latestJob"));
        if (jobExists){
          //get the jobs from localstorage
          const jobs = await LocalStorageHelper.readJobs();
          for (const job of jobs){
            //look for our match
            if (params.get("latestJob") === job.jobId){
              //just latest job
              let latestJobMessage = {action: 'storeData', key: "latestJob", value: job };
              await LocalStorageHelper.__sendMessageToBgScript({latestJobMessage});
              break;
            }
          }
        } else {
          const isLoadingJobResp = await LocalStorageHelper.__sendMessageToBgScript({action: "getData", key: "loadingJob"});
          const isLoading = isLoadingJobResp.message?.isLoading ?? false;
          const currrentTabMessage = await LocalStorageHelper.__sendMessageToBgScript({action: "getData", key: "currentTab"});
          const currentTab = currrentTabMessage.message;
          if (!isLoading && currentTab){
            console.log("Sending message to content script to scrape");
            console.log(currentTab);
            chrome.tabs.sendMessage(currentTab, {
                type: "NEW",
                company: "LINKEDIN",
                jobId: params.get("latestJob")
            }).then(response => {
                console.log('Message sent successfully:', response);
            }).catch(error => {
                console.error('Error sending message to content script:', error);
            });
          }
        }
      }
      asyncSetLatestJob();
    }
    // Check if the user is authorized when the component mounts
    const checkAuth = async () => {
      const authStatus = await ScrapingHelperFunctions.isAuthed();
      //Remove after testing auth routes
      setIsAuthed(authStatus);
    };

    checkAuth();
    chrome.action.setBadgeText({ text: '' }); // clear badge
  }, []); // Empty dependency array means this effect runs once when the component mounts

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
          <Route path="*" element={<p>{"404 " + location.href + " not found"}</p>} />            
      </Routes>
    </HashRouter>
  );
};

export default App;
const container = document.getElementById('app');
const root = createRoot(container);
root.render(<App />);