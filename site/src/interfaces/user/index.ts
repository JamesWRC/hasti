
import { Session } from "next-auth";
export interface HastiUser {
    id: string
    name: string
    email: string
    image: string
}

export interface HastiSession extends Session{
    user: HastiUser; // Assuming user could be null if not authenticated
    expires: string;
    jwt: string;
    // Add any other properties you expect in the session object
}

export { Session };
