import React, { useEffect, useState } from 'react';
import { User } from '../../content/user';
import { Resume, ResumeFactory } from '../../content/resume';
import { ResumeComparison } from '../../content/resumeComparison';
import { DatabaseCalls } from '../../content/databaseCalls';
import { LocalStorageHelper } from '../../content/localStorageHelper';
import { login, register, getSalt } from '../../content/auth';
import { genSaltSync } from 'bcryptjs';
import { EMPTYJOB } from '../../content/job';
import { loadResume } from './loadMockResumes';
import { useNavigate } from 'react-router-dom';

export const JobDebugView = () => {
    const [activeTab, setActiveTab] = useState('jobData');

    const [job, setJob] = useState(
        EMPTYJOB
    );
    
    useEffect(() => {
        const handleMessage = (message, sender, sendResponse) => {
            console.log("POPUP SCRIPT GOT MESSAGE OF");
            console.log(message)
            if (message.action === 'NEW_JOB') {
                sendResponse({ status: "success", message: "Recieved new job message" });
                console.log("Recieved message to show job!");

                setJob(message.payload);
            }
        }
        
        // Listen for messages from the content script
        chrome.runtime.onMessage.addListener(handleMessage);
        // Send a message to grab the most recent job on job load
        chrome.runtime.sendMessage({ action: 'getData', key: "latestJob" }, (response) => {
            console.log("Most recent job sent when component mounted", response);
            if (response.success && response.message){
                console.log("Setting most recent job");
                setJob(response.message);
            }
        });

        // Cleanup function to remove the event listener
        return () => {
            chrome.runtime.onMessage.removeListener(handleMessage);
        };
    }, []);

    useEffect(() => {
        // This will run whenever the `job` state changes
        console.log("Updated job state:", job);
    }, [job]);

    return (
    <div id="jobDebugView" style={{
        width: "600px",
        margin: "20px"
    }}>
        <div className="tabs">
                <ul>
                    <li className={activeTab === 'jobData' ? 'is-active' : ''}>
                        <a onClick={() => setActiveTab('jobData')}>Job</a>
                    </li>
                    <li className={activeTab === 'resume' ? 'is-active' : ''}>
                        <a onClick={() => setActiveTab('resume')}>Res</a>
                    </li>
                    <li className={activeTab === 'signUp' ? 'is-active' : ''}>
                        <a onClick={() => setActiveTab('signUp')}>SU</a>
                    </li>
                    <li className={activeTab === 'login' ? 'is-active' : ''}>
                        <a onClick={() => setActiveTab('login')}>Login</a>
                    </li>
                    <li className={activeTab === 'auth' ? 'is-active' : ''}>
                        <a onClick={() => setActiveTab('auth')}>Auth</a>
                    </li>
                    <li className={activeTab === 'ls' ? 'is-active' : ''}>
                        <a onClick={() => setActiveTab('ls')}>LS</a>
                    </li>
                </ul>
        </div>
        {activeTab === 'jobData' && (
            <JobDataView job={job}/>
        )}
        {activeTab === 'resume' && (
            <ResumeView job={job}/>
        )}
        {activeTab === 'signUp' && (
            <SignUpView/>
        )}
        {activeTab === 'login' && (
            <LoginView/>
        )}
        {activeTab === 'auth' && (
            <AuthView />
        )}
        {activeTab === 'ls' && (
            <LocalStorageView />
        )}
    </div>)
};
const JobDataView = ({ job }) => {
    return (
        <>
            <table id="jobData" className="table">
                <thead>
                    <tr>
                        <th colSpan="2"><h1>Job Data</h1></th>
                    </tr>
                </thead>
                <tbody>
                    <tr><td>jobId:</td><td>{job["jobId"] ?? "NOT FOUND"}</td></tr>
                    <tr><td>applicants:</td><td>{job["applicants"] ?? "NOT FOUND"}</td></tr>
                    <tr><td>careerStage:</td><td>{job["careerStage"] ?? "NOT FOUND"}</td></tr>
                    <tr><td>jobName:</td><td>{job["jobName"] ?? "NOT FOUND"}</td></tr>
                    <tr><td>description:</td><td>{job["description"]?.substring(0, 60) + "..." ?? "NOT FOUND"}...</td></tr>
                    <tr><td>paymentBase:</td><td>{job["paymentBase"] ?? "NOT FOUND"}</td></tr>
                    <tr><td>paymentFreq:</td><td>{job["paymentFreq"]?.["str"] ?? "NOT FOUND"}</td></tr>
                    <tr><td>paymentHigh:</td><td>{job["paymentHigh"] ?? "NOT FOUND"}</td></tr>
                    <tr><td>locationStr:</td><td>{job["locationStr"] ?? "NOT FOUND"}</td></tr>
                    <tr><td>mode:</td><td>{job["mode"]?.["str"] ?? "NOT FOUND"}</td></tr>
                    <tr><td>jobPostedAt:</td><td>{job["jobPostedAt"] ?? "NOT FOUND"}</td></tr>
                    <tr><td>timeAdded:</td><td>{job["timeAdded"] ?? "NOT FOUND"}</td></tr>
                </tbody>
            </table>

            <table id="companyData" className="table">
                <thead>
                    <tr>
                        <th colSpan="2"><h1>Company Data</h1></th>
                    </tr>
                </thead>
                <tbody>
                    <tr><td>companyName:</td><td>{job["company"]["companyName"] ?? "NOT FOUND"}</td></tr>
                    <tr><td>businessOutlookRating:</td><td>{job["company"]["businessOutlookRating"] ?? "NOT FOUND"}</td></tr>
                    <tr><td>careerOpportunitiesRating:</td><td>{job["company"]["careerOpportunitiesRating"] ?? "NOT FOUND"}</td></tr>
                    <tr><td>ceoRating:</td><td>{job["company"]["ceoRating"] ?? "NOT FOUND"}</td></tr>
                    <tr><td>compensationAndBenefitsRating:</td><td>{job["company"]["compensationAndBenefitsRating"] ?? "NOT FOUND"}</td></tr>
                    <tr><td>cultureAndValuesRating:</td><td>{job["company"]["cultureAndValuesRating"] ?? "NOT FOUND"}</td></tr>
                    <tr><td>diversityAndInclusionRating:</td><td>{job["company"]["diversityAndInclusionRating"] ?? "NOT FOUND"}</td></tr>
                    <tr><td>seniorManagementRating:</td><td>{job["company"]["seniorManagementRating"] ?? "NOT FOUND"}</td></tr>
                    <tr><td>workLifeBalanceRating:</td><td>{job["company"]["workLifeBalanceRating"] ?? "NOT FOUND"}</td></tr>
                    <tr><td>overallRating:</td><td>{job["company"]["overallRating"] ?? "NOT FOUND"}</td></tr>
                </tbody>
            </table>

            <div>
                {job["location"] ? (
                    <table id="locationData" className="table">
                        <thead>
                            <tr>
                                <th colSpan="2"><h1>Location Data</h1></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td>addressStr:</td><td>{job["location"]["addressStr"] ?? "NOT FOUND"}</td></tr>
                            <tr><td>city:</td><td>{job["location"]["city"] ?? "NOT FOUND"}</td></tr>
                            <tr><td>zipCode:</td><td>{job["location"]["zipCode"] ?? "NOT FOUND"}</td></tr>
                            <tr><td>stateCode:</td><td>{job["location"]["stateCode"] ?? "NOT FOUND"}</td></tr>
                            <tr><td>latitude:</td><td>{job["location"]["latitude"] ?? "NOT FOUND"}</td></tr>
                            <tr><td>longitude:</td><td>{job["location"]["longitude"] ?? "NOT FOUND"}</td></tr>
                        </tbody>
                    </table>
                ) : (
                    <p>Location not found</p>
                )}
            </div>
            </>
    );
}
const SignUpView = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const user = new User(null, formData["email"], null, formData["firstName"], formData["lastName"], null, null);
        register(user, formData["password"], formData["password"], genSaltSync(1))
    };
    return (
        <div style={{width: "600px"}}>
            <h1 className='is-size-2'>Test Signup</h1>
            <hr />
            <form onSubmit={handleSubmit}>
                <div className="field">
                    <label className="label" htmlFor="firstName">First Name</label>
                    <div className="control">
                        <input
                            className="input"
                            type="text"
                            id="firstName"
                            name="firstName"
                            placeholder="Andrew"
                            value={formData.firstName}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>
                <div className="field">
                    <label className="label" htmlFor="lastName">Last Name</label>
                    <div className="control">
                        <input
                            className="input"
                            type="text"
                            id="lastName"
                            name="lastName"
                            placeholder="Andrew"
                            value={formData.lastName}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>
                <div className="field">
                    <label className="label" htmlFor="email">Email</label>
                    <div className="control">
                        <input
                            className="input"
                            type="email"
                            id="email"
                            name="email"
                            placeholder="Email input"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>
                <div className="field">
                    <label className="label" htmlFor="password">Password</label>
                    <div className="control">
                        <input
                            className="input"
                            type="password"
                            id="password"
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>
                <div className="control">
                    <button className="button is-link" type="submit">Submit</button>
                </div>
            </form>
        </div>
    );
}
const LoginView = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        getSalt(formData["email"])
        .then((salt) => {
            login(formData["email"], formData["password"], salt);
        })
        .catch(() => {
            console.log("Failed to get salt");
        })
    };
    return (
        <div style={{width: "600px"}}>
            <h1 className='is-size-2'>Test Login</h1>
            <hr />
            <form onSubmit={handleSubmit}>
                <div className="field">
                    <label className="label" htmlFor="email">Email</label>
                    <div className="control">
                        <input
                            className="input"
                            type="email"
                            id="email"
                            name="email"
                            placeholder="Email input"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>
                <div className="field">
                    <label className="label" htmlFor="password">Password</label>
                    <div className="control">
                        <input
                            className="input"
                            type="password"
                            id="password"
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>
                <div className="control">
                    <button className="button is-link" type="submit">Submit</button>
                </div>
            </form>
        </div>
    );
}

const ResumeView = ({ job }) => {
    const [resumeComparison, setResumeComparison] = useState(
        null
    );
    const [resume, setResume] = useState(
        null
    );
    const [fileName, setFileName] = useState('No file selected');

    const handleFileChange = async (event) => {
        if (event.target.files.length > 0) {
            console.log("Handling file change");
            setFileName(event.target.files[0].name);
            console.log("Set File Name");
            const resume = await loadResume(event.target.files[0]);
            console.log("Loaded Resume");
            setResume(resume);
            console.log("set Resume");
        } else {
            setFileName('No file selected');
        }
    };

    useEffect(() => {
        const compareResumes = async () => {
            console.log("set Resume");
            if (!resume) {
                console.log("No Resume Loaded");
                return;
            }
            if (job["description"] && resume) {
                try {
                    const responseJson = await DatabaseCalls.sendMessageToCompareResumesFromRequest(job["description"], job["jobId"], resume);
                    const resumeComparison = new ResumeComparison(
                        resume.id,
                        job.jobId,
                        resume.fileText,
                        job["description"],
                        responseJson["resumeSentences"],
                        responseJson["jobDescriptionSentences"],
                        responseJson["similarityMatrix"],
                        responseJson["sortedIndexList"],
                        Number(responseJson["matchScore"]),
                        responseJson["pros"],
                        responseJson["cons"],
                        responseJson["tips"]
                    );
                    setResumeComparison(resumeComparison);
                } catch (error) {
                    console.error("Error comparing resumes:", error);
                }
            } else {
                console.log("No job description");
            }
        };
    
        compareResumes();
    
    }, [job, resume]);

    return <>
        <table id="resumeData" className="table">
            <div className="file has-name is-boxed is-info">
                <label className="file-label">
                    <input
                        className="file-input"
                        type="file"
                        name="resume"
                        onChange={handleFileChange}
                    />
                    <span className="file-cta">
                        <span className="file-icon">
                            <i className="fas fa-upload"></i>
                        </span>
                        <span className="file-label">
                            Choose a file…
                        </span>
                    </span>
                    <span className="file-name">
                        {fileName}
                    </span>
                </label>
            </div>
            <p>Data from LLM: </p>
            {resumeComparison !== null && (
                <>
                    <p className="is-size-2 has-text-link">Resume Match Score: {resumeComparison.matchScore}</p>
                    <thead>
                        <tr>
                            <th colSpan="2"><h1>Pros:</h1></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <th><abbr title="conItem">Pros:</abbr></th>
                        </tr>
                        {resumeComparison.pros.map((pro) => (
                            <tr>
                                <td>{pro}</td>
                            </tr>
                        ))}
                    </tbody>
                    <thead>
                        <tr>
                            <th colSpan="2"><h1>Cons:</h1></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <th><abbr title="conItem">arrayItem</abbr></th>
                        </tr>
                        {resumeComparison.cons.map((con) => (
                            <tr>
                                <td>{con}</td>
                            </tr>
                        ))}
                    </tbody>
                    <thead>
                        <tr>
                            <th colSpan="2"><h1>Tips:</h1></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <th><abbr title="TipItem">arrayItem</abbr></th>
                        </tr>
                        {resumeComparison.tips.map((tip) => (
                            <tr>
                                <td>{tip}</td>
                            </tr>
                        ))}
                    </tbody>
                </>
            )}
            <thead>
                <tr>
                    <th colSpan="2"><h1>Resume Sentence Data</h1></th>
                </tr>
            </thead>
            <tbody>
            {resumeComparison !== null && (
                <>
                    <tr>
                        <th><abbr title="ResumeSentence">Resume</abbr></th>
                        <th><abbr title="JobSentence">Job</abbr></th>
                        <th><abbr title="SimilarityValue">Similarity</abbr></th>
                    </tr>
                    {resumeComparison.resumeSentenceComparisons.map((resumeSentenceComparison) => (
                        <tr key={resumeSentenceComparison.place}>
                            <td>{resumeSentenceComparison.resumeSentence}</td>
                            <td>{resumeSentenceComparison.descriptionSentence}</td>
                            <td>{resumeSentenceComparison.similarity}</td>
                        </tr>
                    ))}
                </>
            )}
            {resumeComparison === null && (
                <h1>Resume Comparison Data is null</h1>
            )}
            </tbody>
        </table>
    </>
}
const AuthView = () => {
    const navigate = useNavigate();
    const [token, setToken] = useState(null);
    const [tokenExpiration, setTokenExpiration] = useState(0);
    const [activeUser, setActiveUser] = useState({});

    useEffect(() => {
        // Define an async function within useEffect
        const fetchData = async () => {
            const token = await LocalStorageHelper.getToken();
            setToken(token);
            const authTokenExpirationDate = await LocalStorageHelper.getTokenExpiration();
            setTokenExpiration(authTokenExpirationDate);
            const activeUser = await LocalStorageHelper.getActiveUser();
            setActiveUser(activeUser);
        };

        // Call the async function
        fetchData();
    }, []);
    return (<div style={{width: "600px", color: "white", overflowWrap: "break-word", padding: "10px"}}>
        <h1>Auth info</h1>
        <hr />
        <p>Token: {token}</p>
        <hr />
        <p>Token expirary Date: {tokenExpiration}</p>
        <hr />
        <p>Active User: {JSON.stringify(activeUser, null, 4)}</p>
        <hr />
        <button className='button is-danger' onClick={async () => {
            await LocalStorageHelper.__sendMessageToBgScript(
                { action: 'storeData', key: "authToken", value: null }
            )
            await LocalStorageHelper.__sendMessageToBgScript(
                { action: 'storeData', key: "authTokenExpirationDate", value: 0 }
            )
            await LocalStorageHelper.__sendMessageToBgScript(
                { action: 'storeData', key: "activeUser", value: null }
            )
            navigate('/');
        }
        }>Clear auth</button>
    </div>
    )
}
const LocalStorageView = () => {
    const styles = {
        table: {
          backgroundColor: "#222",
          border: "2px solid #FF0051",
          color: "#00FF41",
          fontFamily: "'Courier New', Courier, monospace",
          fontSize: "8px"
        },
        th: {
          backgroundColor: "#FF0051",
          color: "#fff",
          padding: "12px",
          textAlign: "left",
        },
        td: {
          border: "1px solid #444",
          padding: "12px",
          textAlign: "left",
        },
        tr: {
          backgroundColor: "#1a1a1a",
          color: "#00FF41",
        },
      };
    const [jobs, setJobs] = useState(null);
    const [resumes, setResumes] = useState(null);
    const asyncLoadData = async () => {
        const jobs = await LocalStorageHelper.readJobs();
        setJobs(jobs);
        const resumes = await LocalStorageHelper.readResumes();
        setResumes(resumes);
    }
    useEffect(() => {
        asyncLoadData();
    }, []);
    return (
        <>
            <p>Data In Local Storage</p>
            {jobs?.length > 0 && <section className="section" style={{height: "300px", overflow: "scroll"}}>
                <div className="container">
                    <table className="table is-fullwidth" style={styles.table}>
                    <thead>
                    </thead>
                    <tbody>
                        <tr style={styles.tr}>
                        {Object.keys(jobs[0]).map((key) => {
                            <td>{key}</td>
                        })}
                        </tr>
                        {jobs.map((job, index) => (
                        <tr key={index}>
                            {Object.keys(job).map((key) => (
                                <td key={key}>{JSON.stringify(job[key], null, 4).substring(0, 200)}</td>
                            ))}
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
            </section>}
            <button className='button is-danger' onClick={async () => {
                await LocalStorageHelper.__sendMessageToBgScript(
                    { action: 'clearAllData'}
                )
            }
            }>Clear Local Storage</button>
        </>
    );
}
  