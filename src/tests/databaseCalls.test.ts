//Tests for the file databaseCalls
import { execSync } from 'child_process';
import { DatabaseCalls } from "../content/databaseCalls";
import { Company, CompanyFactory } from '../content/company';
import { Job, JobFactory, Mode, PaymentFrequency } from '../content/job';
import { User } from '../content/user';
import { register } from '../content/auth';
import { genSaltSync } from 'bcryptjs';
import { LocationObject } from '../content/location';
import { MockObjects } from './mocks/objects';
import { promisify } from 'util';
import * as fs from 'fs';
import { Resume, ResumeFactory } from '../content/resume';
import { HelperFunctions } from '../content/helperFunctions';
import { ResumeComparison } from '../content/resumeComparison';

const readFile = promisify(fs.readFile);

describe("DatabaseCalls.ts file tests", () => {
    beforeAll(() => {
        // clear our db
        execSync('buildjobrater -BD', { stdio: 'inherit' });
        HelperFunctions.delaySync(10000);
    });
    it("tests that we properly get info back when company doesn't exist", () => {
        return expect(DatabaseCalls.checkIfCompanyExists("Initech")).resolves.toEqual(false);
    })
    it("tests that we cannot add a job without a token", ()=> {
        const company: Company = MockObjects.initechWithDataCompany;
        const job: Job = MockObjects.initechSoftwareEngineerJob;
        return expect(DatabaseCalls.sendMessageToAddJob(job)).rejects.toEqual("401");
    })
    it("Tests that we can add a job with a token", async () => {

        const mockUser: User = MockObjects.dandemoneyUser;

        await register(mockUser, "Xdfgh1012#", "Xdfgh1012#", genSaltSync());
        console.log("registered user");
        const company: Company = MockObjects.initechWithDataCompany;
        const job: Job = MockObjects.initechSoftwareEngineerJob;
        return expect(DatabaseCalls.sendMessageToAddJob(job)).resolves.not.toThrow();
    }, 7100)
    it("tests that we can add jobs with null values", async ()=>{
        const job: Job = MockObjects.appleSoftwareEngineerJob;
        await expect(DatabaseCalls.sendMessageToAddJob(job)).resolves.not.toThrow();
    }, 7100)
    it("tests that we can properly read the job back with foriegn keys after a read", async ()=>{
        const company: Company = MockObjects.appleWithDataCompany;
        const job: Job = MockObjects.appleNullValuesBigHossJob;
        await DatabaseCalls.sendMessageToAddJob(job)
        .then((responseJson) => {
            const finishedJobJson: Record<string, any> = responseJson["job"];
            console.log(finishedJobJson);
            const rereadJob : Job = JobFactory.generateFromJson(finishedJobJson);
            //Check job values
            expect(rereadJob.jobId).toEqual(job.jobId);
            expect(rereadJob.applicants).toEqual(job.applicants);
            expect(rereadJob.careerStage).toEqual(job.careerStage);
            expect(rereadJob.jobName).toEqual(job.jobName);
            expect(rereadJob.paymentFreq).toEqual(job.paymentFreq);
            expect(rereadJob.paymentBase).toEqual(job.paymentBase);
            expect(rereadJob.paymentHigh).toEqual(job.paymentHigh);
            expect(rereadJob.mode).toEqual(job.mode);
        });
    }, 7000)
    it("tests that we cannot add a duplicate job", async ()=>{
        const company: Company = MockObjects.appleWithDataCompany;
        const job: Job = MockObjects.appleNullValuesBigHossJob;
        await expect(DatabaseCalls.sendMessageToAddJob(job)).rejects.toEqual("409");
    })
    it("tests that the company is added into the database after adding a job", async ()=>{
        const companyName: string = "Apple";
        await expect(DatabaseCalls.checkIfCompanyExists(companyName)).resolves.toEqual(true)
    })
    it("tests that we can properly load userdata after a login", async ()=>{
        await DatabaseCalls.getUserData()
        .then((json) => {

            const company: Company = MockObjects.appleWithDataCompany;
            const job: Job = MockObjects.appleNullValuesBigHossJob;
            const jobs: Job[] = json["jobs"];
            expect(jobs.length).toBe(3);
            const rereadJob = jobs[0];
            //Check job values
            expect(rereadJob.jobId).toEqual(job.jobId);
            expect(rereadJob.applicants).toEqual(job.applicants);
            expect(rereadJob.careerStage).toEqual(job.careerStage);
            expect(rereadJob.jobName).toEqual(job.jobName);
            expect(rereadJob.paymentFreq).toEqual(job.paymentFreq);
            expect(rereadJob.paymentBase).toEqual(job.paymentBase);
            expect(rereadJob.paymentHigh).toEqual(job.paymentHigh);
            expect(rereadJob.mode).toEqual(job.mode);

            const rereadUser: User = json["user"];
            const user: User = MockObjects.dandemoneyUser;
            expect(user.email).toEqual(rereadUser.email);
            expect(user.firstName).toEqual(rereadUser.firstName);
            expect(user.lastName).toEqual(rereadUser.lastName);
        })
    })
    it("tests that we can add a resume", async ()=>{
        const fileBuffer : Buffer = await readFile("./src/tests/mocks/resume.pdf");
        const file : File = new File([fileBuffer], "resume.pdf", {
            type: 'application/pdf'
        })
        const resume : Resume = await ResumeFactory.generateFromFile(file);
        await DatabaseCalls.sendMessageToAddResume(resume);
        const userData = await DatabaseCalls.getUserData();
        const resumes: Resume[] = userData["resumes"];
        expect(resumes.length).toBe(1);
        const rereadResume : Resume = resumes[0];
        expect(rereadResume.fileName).toBe(resume.fileName);
        expect(rereadResume.fileContent).toEqual(resume.fileContent);
        return expect(rereadResume.fileType).toBe(resume.fileType);
    }, 10000)
    it("tests that we can add a resume comparison", async() => {
        const job: Job = MockObjects.appleNullValuesBigHossJob;
        //hardcoded resume id, we only add one resume before this so we can assume its 1
        const resumeComparison: ResumeComparison = await DatabaseCalls.sendMessageToCompareResumeByIds(1, job.jobId);
        expect(resumeComparison.resumeId === 1);
        expect(resumeComparison.jobId === job.jobId);
        expect(resumeComparison.pros.length);
        expect(resumeComparison.cons.length);
        expect(resumeComparison.matchScore);
        expect(resumeComparison.similarityMatrix);
        expect(resumeComparison.sortedIndexList);
    })
    it("tests that we can read back the resume we just added", async() => {
        const job: Job = MockObjects.appleNullValuesBigHossJob;
        const resumeComparison = await DatabaseCalls.sendMessageToReadSpecificResumeComparison(String(1), job.jobId);
        expect(resumeComparison.resumeId === 1);
        expect(resumeComparison.jobId === job.jobId);
        expect(resumeComparison.pros.length);
        expect(resumeComparison.cons.length);
        expect(resumeComparison.matchScore);
        expect(resumeComparison.similarityMatrix);
        expect(resumeComparison.sortedIndexList);
    })
    //Should always be last we use the user for other tests
    it("tests that we can delete a user", async ()=> {
        await DatabaseCalls.sendMessageToDeleteUser()
        .then(async () => {
            await expect(DatabaseCalls.getUserData()).rejects.toEqual("401");
        })
    })
})