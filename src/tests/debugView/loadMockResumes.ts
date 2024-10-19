import { Resume, ResumeFactory } from "applicantiq_core/Core/resume"


export const loadResume = async(file: File): Promise<Resume> => {
    const resume : Resume = await ResumeFactory.generateFromFile(file);
    return resume;
}
