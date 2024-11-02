import { User } from '@applicantiq/applicantiq_core/Core/user';
import { Company, CompanyFactory } from "@applicantiq/applicantiq_core/Core/company";
import { LocationObject } from "@applicantiq/applicantiq_core/Core/location"
import { PaymentFrequency, Mode, Job } from "@applicantiq/applicantiq_core/Core/job";
import { UserPreferences } from "@applicantiq/applicantiq_core/Core/userPreferences";

//Mock file for objects used in our tests
export class MockObjects {
    static dandemoneyUser: User = new User(null, "dandemoney@gmail.com", null, "Daniel", "DeMoney", null, null);
    static appleWithDataCompany : Company = CompanyFactory.generateFromJson({
        companyName: "Apple",
        businessOutlookRating: 4.2,
        careerOpportunitiesRating: 3.4,
        ceoRating: 3.7,
        compensationAndBenefitsRating: 4.1,
        cultureAndValuesRating: 4.0,
        diversityAndInclusionRating: 4.9,
        seniorManagementRating: 1.3,
        workLifeBalanceRating: 4.8,
        overallRating: 2.1
    });
    static initechWithDataCompany : Company = CompanyFactory.generateFromJson({
        companyName: "Initech",
        businessOutlookRating: 4.2,
        careerOpportunitiesRating: 3.4,
        ceoRating: 3.7,
        compensationAndBenefitsRating: 4.1,
        cultureAndValuesRating: 4.0,
        diversityAndInclusionRating: 4.9,
        seniorManagementRating: 1.3,
        workLifeBalanceRating: 4.8,
        overallRating: 2.1
    });
    static initechSoftwareEngineerJob : Job = new Job(
        "1252154224", 
        49, 
        "Director", 
        "Software Engineer", 
        MockObjects.initechWithDataCompany, 
        "BLORG NINEEEE",
        123000, 
        new PaymentFrequency("yr"),
        141000, 
        "Remote", 
        new Mode("Remote"), 
        new Date(), 
        null, 
        null
    );
    static appleSoftwareEngineerJob: Job = new Job(
        "1252154223", 
        49, 
        null, 
        "Software Engineer", 
        MockObjects.appleWithDataCompany, 
        "blorg nine 90",
        null, 
        null,
        null, 
        null, 
        new Mode("Remote"), 
        new Date("2024-08-23T17:53:43.000Z"), 
        new Date("2024-08-23T17:53:43.000Z"), 
        null
    );
    static appleWithNullValuesCompany: Company = CompanyFactory.generateFromJson({
        companyName: "Apple",
        businessOutlookRating: 0,
        careerOpportunitiesRating: 0,
        ceoRating: 0,
        compensationAndBenefitsRating: 0,
        cultureAndValuesRating: 0,
        diversityAndInclusionRating: 0,
        seniorManagementRating: 0,
        workLifeBalanceRating: 0,
        overallRating: 0
    });
    static appleNullValuesBigHossJob: Job = new Job(
        "1252154290", 
        49, 
        "Associate", 
        "Big Hoss", 
        MockObjects.appleWithNullValuesCompany, 
        //Random description, just for testing purposes
        `Company Overview: At [Company Name], we specialize in creating stunning, custom-designed wedding cakes that make every couple’s big day even sweeter. We pride ourselves on our attention to detail, high-quality ingredients, and exceptional customer service. We are seeking an enthusiastic and motivated Entry-Level Sales Representative to join our team and help couples bring their wedding cake dreams to life!

        Responsibilities:

        Assist couples and wedding planners in selecting and customizing their wedding cakes.
        Respond to customer inquiries via phone, email, and in-person consultations.
        Provide detailed information about our cake designs, flavors, and pricing options.
        Help manage appointments, consultations, and cake tastings.
        Collaborate with the bakery team to ensure accurate order details and timely production.
        Follow up with clients to confirm orders and address any last-minute changes or concerns.
        Maintain records of client preferences and orders in our CRM system.
        Support marketing efforts, including attending bridal expos and distributing promotional materials.`,
        121000, 
        new PaymentFrequency("yr"),
        140000, 
        "Cupertino, CA", 
        new Mode("Hybrid"), 
        new Date(), 
        null, 
        null
    )
    static appleLocation: LocationObject = new LocationObject(
        "One Apple Park Way", "Cupertino", "95014", "CA", 37.334606, -122.009102
    )
    static preferences: UserPreferences = new UserPreferences(
        null, 80000, new PaymentFrequency("yr"), 30, false, true, true, "Hybrid", true,
        false, false, [],[]
    )
    static ericdemoneyUserWithPreferences: User = new User(null, "ericdemoney@gmail.com", null, "Daniel", "DeMoney", null, MockObjects.preferences);
    static oracleJobDescription = `Job Title: Entry-Level Sales Representative - HCM Software

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
}
