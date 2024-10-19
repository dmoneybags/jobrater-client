//Tests for the file job.ts
import { LocationObject } from "@applicantiq/applicantiq_core/Core/location"
import { MockObjects } from "./mocks/objects";
describe("Job.ts file tests", () => {
    it("tests that companies can properly load values", () => {
        const location : LocationObject = MockObjects.appleLocation
        const locationStr : string = JSON.stringify(location);
        const locationJson : Record<string, any> = JSON.parse(locationStr);
        expect(locationJson).toEqual(location);
    })
})
