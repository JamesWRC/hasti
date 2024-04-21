
// Check if the given variable is not a string
// Mainly used for a type guard for prisma calls on compile.
export default function isNotString(variable: any): boolean {
    return typeof variable !== "string";
}
