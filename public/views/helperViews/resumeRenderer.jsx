import React, { createElement } from 'react';
import { ResumePdfRenderer } from './resumePdfRenderer';
import { ResumeWordRenderer } from './resumeWordRenderer';

export const ResumeRenderer = ({fullResume: resume}) => {
    if (resume.fileType === "pdf"){
        return (
            //Render our PDF
            <ResumePdfRenderer resume={resume}/>
        )
    } else if (resume.fileType === "docx"){
        return (
            <ResumeWordRenderer resume={resume}/>
        )
    }
}