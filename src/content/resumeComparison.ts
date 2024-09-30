//(c) 2024 Daniel DeMoney. All rights reserved.
const NUMSENTENCESLOADED = 30

export class ResumeComparison{
    __resumeTxt: string
    __descriptionTxt: string;
    __resumeSentences: string[];
    __descriptionSentences: string[];
    resumeId: Number;
    jobId: String;
    resumeSentenceComparisons: ResumeSentenceComparison[];
    similarityMatrix: number[][];
    sortedIndexList: number[][];
    matchScore: number;
    pros: string[];
    cons: string[];
    tips: string[];
    constructor(resumeId: Number, jobId: String, resumeTxt: string, descriptionTxt: string, resumeSentences: string[], descriptionSentences: string[], 
        similarityMatrix: number[][], sortedIndexList: number[][], matchScore: number, pros: string[], cons: string[], tips: string[]){
        console.log("CREATING RESUME COMPARISON");
        console.log("Similarity matrix");
        console.log(typeof similarityMatrix);
        console.log(similarityMatrix);
        console.log("Sorted index list");
        console.log(typeof sortedIndexList);
        console.log(sortedIndexList);
        console.log("Resume Sentences");
        console.log(resumeSentences)
        this.__resumeTxt = resumeTxt;
        this.__descriptionTxt = descriptionTxt;
        this.__resumeSentences = resumeSentences;
        this.__descriptionSentences = descriptionSentences;
        this.resumeId = resumeId;
        this.jobId = jobId;
        //we'll fill this later
        this.resumeSentenceComparisons = [];
        this.similarityMatrix = similarityMatrix;
        this.sortedIndexList = sortedIndexList;
        this.matchScore = matchScore;
        this.pros = pros;
        this.cons = cons;
        this.tips = tips;
        //Current implementation will be not allowing any duplicate sentences from job or resume
        const jobIndexSeen: number[] = [];
        const resumeIndexSeen: number[] =[];
        let i: number = 0;
        for (const indexPair of sortedIndexList){
            //indexPair is a combo of jobDescription sentence index at 0 and resumeSentence index at 1
            const jobDescriptionIndex: number = indexPair[0];
            const resumeIndex: number = indexPair[1];
            if (!jobIndexSeen.includes(jobDescriptionIndex) && !resumeIndexSeen.includes(resumeIndex)){
                this.resumeSentenceComparisons.push(
                    new ResumeSentenceComparison(
                        i, this.similarityMatrix[jobDescriptionIndex][resumeIndex],
                        this.__resumeSentences[resumeIndex], this.__descriptionSentences[jobDescriptionIndex],
                        resumeIndex, jobDescriptionIndex)
                    );
                jobIndexSeen.push(jobDescriptionIndex);
                resumeIndexSeen.push(resumeIndex);
            }
            i += 1;
            if (i >= NUMSENTENCESLOADED){
                break;
            }
        }
    }
}
class ResumeSentenceComparison{
    //0, best match, 1, 2nd best match, 2 3rd best match
    place: number;
    //How similar the sentences are
    similarity: number;
    resumeSentence: string;
    descriptionSentence: string;
    resumeSentenceIndex: number;
    descriptionSentenceIndex: number;
    constructor(place: number, similarity: number, resumeSentence: string, descriptionSentence: string, 
        resumeSentenceIndex: number, descriptionSentenceIndex: number){
            this.place = place;
            this.similarity = similarity;
            this.resumeSentence = resumeSentence;
            this.descriptionSentence = descriptionSentence;
            this.resumeSentenceIndex = resumeSentenceIndex;
            this.descriptionSentenceIndex = descriptionSentenceIndex;
        }
}