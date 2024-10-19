//Tests for the file Company.ts
import { Company, CompanyFactory } from "@applicantiq/applicantiq_core/Core/company"
import { MockObjects } from "./mocks/objects";
describe("Company.ts file tests", () => {
    it("tests that companies can properly load values", () => {
        const company : Company = MockObjects.appleWithDataCompany
        const companyStr : string = JSON.stringify(company);
        const companyJson2 : Record<string, any> = JSON.parse(companyStr);
        expect(companyJson2).toEqual(company);
    })
})
