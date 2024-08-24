export type {User} from "@prisma/client";

/** 
 * TEMP user type: Only used for users that are created when another user imports a users repo.
 *                 These 'TEMP' user will be upgraded to a USER type when they login.
 */
export enum UserType {
    TEMP = 'temp', 
    USER = 'user',
    ADMIN = 'admin',
}

export enum UserTypePermissions {
    TEMP = -1, 
    USER = 25,
    ADMIN = 100,
}

export function getUserType(type: string): UserType {
    const values = Object.values(UserType);
    for(const t in values){
        if(values[t] === type.toLowerCase()){
            return values[t];
        }
    }
    return UserType.USER
}

export function getUserTypePermissions(type: UserType): number {
    return UserTypePermissions[type.toUpperCase() as keyof typeof UserTypePermissions];
}


export function getAllUserTypes(caseSensitive:Boolean=true): string[] {
    const ret: string[] = [];
    const tValues = Object.values(UserType);
    for(const t in tValues){
        if(caseSensitive){
          ret.push(tValues[t][0].toUpperCase() + tValues[t].slice(1)) 
        }else{
          ret.push(tValues[t]);
        }
    }
    return ret;
  }


export interface UserJWTPayload {
    provider: string,
    user: { //Keep this updated with the User model in the prisma schema
        id: string;
        name: string;
        username: string;
        image: string;
        githubID: number;
        type: UserType;
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