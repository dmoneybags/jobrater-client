import { execSync } from 'child_process';
import { register } from '@applicantiq/applicantiq_core/Core/auth';
import { genSaltSync } from 'bcryptjs';
import { User } from '@applicantiq/applicantiq_core/Core/user';
import { DatabaseCalls } from '@applicantiq/applicantiq_core/Core/databaseCalls';
import { Resume, ResumeFactory } from "@applicantiq/applicantiq_core/Core/resume";
import { promisify } from 'util';
import * as fs from 'fs';

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

//Num seconds we will wait in between each action
//for example DELAYLOW of 3 seconds and high of 10 means we wait
//a minimum of 3 seconds and a of max 10 between each action
const DELAYLOW = 3
const DELAYHIGH = 10

function getRandomInt(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
}

const USER = new User(null, `user${getRandomInt(1, 1000000)}@gmail.com`, null, "john", "doe", null, null);

const oracleJobDescription = `Job Title: Entry-Level Sales Representative - HCM Software

Location: San Jose

Company: Oracle

About Oracle:
Oracle is a global leader in cloud solutions and enterprise software, dedicated to empowering businesses through innovative technologies. Our Human Capital Management (HCM) software helps organizations manage their workforce effectively, enabling them to drive growth and achieve strategic goals.

Job Overview:
We are seeking a motivated and enthusiastic Entry-Level Sales Representative to join our HCM software sales team. In this role, you will be responsible for engaging with mid-sized organizations to understand their human resource needs and promote Oracle’s HCM solutions. This position offers a great opportunity to kickstart your career in sales within the technology sector.

Key Responsibilities:

Identify and research potential clients within the mid-sized business sector to generate leads.
Conduct outreach via phone, email, and social media to introduce Oracle's HCM software and its benefits.
Develop and maintain relationships with prospective clients to understand their needs and provide tailored solutions.
Assist in the preparation and delivery of sales presentations and product demonstrations.
Collaborate with senior sales team members to strategize and implement sales initiatives.
Track and manage sales activities and customer interactions using CRM software.
Stay informed about industry trends, competitor offerings, and product updates.
Participate in training programs to enhance product knowledge and sales skills.
Qualifications:

Bachelor’s degree in Business, Marketing, or a related field (or equivalent experience).
Strong communication and interpersonal skills.
Ability to learn quickly and adapt to changing environments.
Proficient in using Microsoft Office Suite (Word, Excel, PowerPoint).
Previous experience in sales or customer service is a plus but not required.
A passion for technology and a desire to pursue a career in sales.
What We Offer:

Comprehensive training program to equip you with the knowledge and skills needed for success.
Opportunities for career advancement within Oracle.
Competitive salary and commission structure.
Benefits package including health, dental, and retirement plans.
A dynamic and supportive work environment.
How to Apply:
Interested candidates should submit their resume and a cover letter outlining their interest in the position to [Application Email/Link].`

describe(`Tests the servers ability to handle stress. Do not run with other tests. I've had to say this mutliple times to some members of the 
    of the team so please try to remember this is to be ran on a 'production-esque' server (10 workers, ~8gb ram)"
    `, ()=>{
        it("registers all our mock users", async ()=>{
            const registerWithWait = async () => {
                const waitTime = getRandomInt(DELAYLOW, DELAYHIGH) * 1000; // Get wait time in milliseconds
                await new Promise(resolve => setTimeout(resolve, waitTime)); // Wait for the random time
                console.log(USER.email)
                return register(USER, "Xdfgh1012#", "Xdfgh1012#", genSaltSync()); // Return the register promise
            }
            await registerWithWait();
        }, 60000)
        it("adds a resume for the user", async () =>{
            const fileBuffer  = await readFile("./src/tests/mocks/resume.pdf");
            const file  = new File([fileBuffer], "resume.pdf", {
                type: 'application/pdf'
            })
            const resume = await ResumeFactory.generateFromFile(file);
            await DatabaseCalls.sendMessageToAddResume(resume);
            const userData = await DatabaseCalls.getUserData();
            const resumes = userData["resumes"];
            expect(resumes.length).toBe(1);
            const rereadResume = resumes[0];
            expect(rereadResume.fileName).toBe(resume.fileName);
            expect(rereadResume.fileContent).toEqual(resume.fileContent);
            return expect(rereadResume.fileType).toBe(resume.fileType);
        }, 60000)
        it("submits resume comparisons", async () =>{
            for (let i = 0; i < 3; i++){
                const waitTime = getRandomInt(DELAYLOW, DELAYHIGH) * 1000; // Get wait time in milliseconds
                await new Promise(resolve => setTimeout(resolve, waitTime)); 
                const fileBuffer  = await readFile("./src/tests/mocks/resume.pdf");
                const file  = new File([fileBuffer], "resume.pdf", {
                    type: 'application/pdf'
                })
                const resume = await ResumeFactory.generateFromFile(file);
                const startTime = Date.now(); // Start time tracking before the request
                await DatabaseCalls.sendMessageToCompareResumesFromRequest(oracleJobDescription, "91259182491", resume);
                const elapsedTime = Date.now() - startTime; // Calculate elapsed time after the request
                
                // Check that it took less than 7 seconds
                expect(elapsedTime).toBeLessThan(7000);
            }
        }, 120000)
    })