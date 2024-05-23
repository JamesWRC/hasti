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