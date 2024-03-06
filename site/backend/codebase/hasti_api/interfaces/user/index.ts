
export interface UserJWTPayload {
    provider: string,
    user: { //Keep this updated with the User model in the prisma schema
        id: string;
        name: string;
        username: string;
        image: string;
        githubID: number;
    };
}


export interface UserJWT {
    payload:{
        payload: UserJWTPayload;
        exp: number;
        iat: number;
        nbf: number;
    }
    protectedHeader: {
        alg?: string | undefined;
        typ?: string | undefined;
    }

}