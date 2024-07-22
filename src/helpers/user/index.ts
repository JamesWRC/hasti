export default function isValidProjectName(name: string): boolean {
    const regex = /^(?!-)[A-Za-z0-9_-]{1,100}$/;

    return regex.test(name);
}