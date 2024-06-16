import { IoTClassifications, Project, ProjectAllInfo, getAllHaInstallTypes } from "@/backend/interfaces/project";
import { GetContentResponse } from "@/backend/interfaces/project/request";
import { RepoAnalytics } from "@/backend/interfaces/repoAnalytics";
import axios from "axios";

/**
 * Decodes a Base64 encoded string to its original string format.
 * Handles different environments (Node.js and browser).
 * Provides error handling for incorrectly formatted Base64 strings.
 * @param base64String The Base64 encoded string to decode.
 * @returns The decoded string or null if an error occurs.
 */
export function base64ToString(base64String: string): string | null {
    try {
        console.log('base64String:', base64String)
        return Buffer.from(base64String, 'base64').toString()
    } catch (error) {
        console.error("Error decoding Base64 string:", error);
        return null;
    }
}


export async function downloadHASTIData(projectID: string, contentSHA: string):Promise<GetContentResponse> {
    try {
        // Replace 'your-api-url' with the actual URL of the API you want to call
        // const response = await fetch('your-api-url');
        // const data = await response.text(); // or .json() if the response is JSON

        const response = await axios({
            url: `${process.env.API_URL}/api/v1/projects/${projectID}/content/${contentSHA}`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: 60000,
            timeoutErrorMessage: 'Request timed out. Please try again.',
        })

        const data: GetContentResponse = response.data;
        const content = base64ToString(data.content);
        if(content){
            downloadToFile(content, 'HASTI.md', 'text/markdown');
        }else{
            console.error('Error decoding the Base64 content:', content);
            return Promise.resolve({ success: false, content: '', sha: '' });
        }
        return data

    } catch (error) {
        console.error('Error fetching or downloading the data:', error);
        return Promise.resolve({ success: false, content: '', sha: '' });
    }
}

function downloadToFile(content: string, filename: string, contentType: string) {
    // Create a Blob from the data
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);

    // Create an anchor element and trigger download
    const element = document.createElement('a');
    element.href = url;
    element.download = filename;
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();

    // Clean up
    document.body.removeChild(element);
    URL.revokeObjectURL(url);
}


export function getProjectWorksWithList(project:ProjectAllInfo): string[]{
    let worksWith: string[] = []

    if(project){
        const worksWithOS: boolean = project.worksWithOS;
        const worksWithContainer: boolean = project.worksWithContainer;
        const worksWithCore: boolean = project.worksWithCore;
        const worksWithSupervised: boolean = project.worksWithSupervised;

        let worksWithCount: number = 0

        if (worksWithOS) {
          worksWithCount++
          worksWith.push('OS')
        }
        if (worksWithContainer) {
          worksWithCount++
          worksWith.push('Container')
        }
        if (worksWithCore) {
          worksWithCount++
          worksWith.push('Core')
        }
        if (worksWithSupervised) {
          worksWithCount++
          worksWith.push('Supervised')
        }
        // If all are selected, set to ANY
        if (worksWithCount === getAllHaInstallTypes().length - 1) {
          worksWithCount = 1
          worksWith = ['All']
        }
    }      
    console.log('worksWith:', worksWith)
    return worksWith
}

export function getProjectActivity(repoAnalytics: RepoAnalytics | null, project: ProjectAllInfo): string {
    const statuses: string[] = ['New', 'Active', 'Inactive', 'Beta', 'Deprecated', 'Archived',]
    // Determine if the project is active or not based on the last commit date
    // If project created within the last 6 months, set to NEW
    // If the last commit date is within the last 1 year, set to ACTIVE
    // If the last commit date is over 1 year, set to INACTIVE
    // If repo is archived, set to ARCHIVED
    // TODO: Add beta and deprecated
    let projStatus = 'Active'
    if (repoAnalytics && repoAnalytics.lastCommit) {
      const lastCommitDate = new Date(repoAnalytics.lastCommit)
      const sixMonthsAgo = new Date()
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
      const oneYearAgo = new Date()
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

      if (lastCommitDate < sixMonthsAgo) {
        projStatus = 'New'
      } else if (lastCommitDate < oneYearAgo) {
        projStatus = 'Inactive'
      }

      if (project && project.repo.archived) {
        projStatus = 'Archived'
      }

    }

    return projStatus
}

export function getProjectStars(repoAnalytics: RepoAnalytics | null): number {
    let projStars:number = 0
    if (repoAnalytics && repoAnalytics.stars) {
        projStars = repoAnalytics.stars
    }
    return projStars
}


