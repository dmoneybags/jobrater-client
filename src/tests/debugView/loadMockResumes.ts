import { Resume, ResumeFactory } from "../../content/resume"


export const loadResume = async(file: File): Promise<Resume> => {
    const resume : Resume = await ResumeFactory.generateFromFile(file);
    return resume;
}
