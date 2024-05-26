import { GetContentResponse } from "@/backend/interfaces/project/request";
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