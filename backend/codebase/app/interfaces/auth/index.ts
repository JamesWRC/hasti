
export enum AuthCheckType {
    USER_OK = "user_ok",
    TOKEN_EXIST = "token_exist",
    DECRYPT = "decrypt",
    ALL_OK = "all_ok",
}

export function getAuthCheckType(type: string): AuthCheckType|null {
    const values = Object.values(AuthCheckType);
    for(const t in values){
        if(values[t] === type.toLowerCase()){
            return values[t];
        }
    }

    return null
}

export function getAllAuthCheckTypes(caseSensitive:Boolean=true): string[] {
    const ret: string[] = [];
    const tValues = Object.values(AuthCheckType);
    for(const t in tValues){
        if(caseSensitive){
          ret.push(tValues[t][0].toUpperCase() + tValues[t].slice(1)) 
        }else{
          ret.push(tValues[t]);
        }
    }
    return ret;
  }



export interface CheckAuthResponse {
    success: boolean;
    message: string;
    check: AuthCheckType;
}