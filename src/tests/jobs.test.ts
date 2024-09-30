//Tests for the file job.ts
import { Job, JobFactory } from "../content/job"
import { MockObjects } from "./mocks/objects";
describe("Job.ts file tests", () => {
    it("tests that companies can properly load values", () => {
        const job : Job = MockObjects.appleSoftwareEngineerJob
        const jobJson: Record<string, any> = job.toJson();
        const rereadJob: Job = JobFactory.generateFromJson(jobJson);
        expect(rereadJob).toEqual(job);
    })
})
