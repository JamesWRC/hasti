export default function isValidProjectName(name: string): boolean {
    const regex = /^[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*(_[a-zA-Z0-9]+)*$/;
    return regex.test(name);
}