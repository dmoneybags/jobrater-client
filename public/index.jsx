import React, { createElement, useState, useEffect } from 'react';
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


const BASEURL = "extension://jdmbkjofpaobeedpmoeoocbjnhpfalmm";

const DEBUG = false;

const MainView = ({ContentView}) => {
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    console.log("Loading main view...");
    // Check if the user is authorized when the component mounts
    const checkAuth = async () => {
      const authStatus = await ScrapingHelperFunctions.isAuthed();
      //Remove after testing auth routes
      setIsAuthed(authStatus);
    };

    checkAuth();
    chrome.action.setBadgeText({ text: '' }); // clear badge
  }, []); // Empty dependency array means this effect runs once when the component mounts

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

  return (
    <>
      <div className="app-container">
        {isAuthed ? <ContentView /> : <LoginOrSignupView />}
      </div>
    </>
  );
}

const App = () => {
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