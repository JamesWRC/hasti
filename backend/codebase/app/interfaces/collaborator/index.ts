export enum CollaboratorType {
    USER = 'user', 
    ORGANIZATION = 'organization',
}

export function getCollaboratorType(type: string): CollaboratorType {
    const values = Object.values(CollaboratorType);
    for(const t in values){
        if(values[t] === type.toLowerCase()){
            return values[t];
        }
    }
    return CollaboratorType.USER
}


export function getAllCollaboratorTypes(caseSensitive:Boolean=true): string[] {
    const ret: string[] = [];
    const tValues = Object.values(CollaboratorType);
    for(const t in tValues){
        if(caseSensitive){
          ret.push(tValues[t][0].toUpperCase() + tValues[t].slice(1)) 
        }else{
          ret.push(tValues[t]);
        }
    }
    return ret;
  }
