import {Convoy} from "convoy.js";
const CONVOY_API_KEY = process.env.NODE_ENV === 'production' ? process.env.CONVOY_API_KEY : process.env.DEV_CONVOY_API_KEY;
const CONVOY_PROJECT_ID = process.env.NODE_ENV === 'production' ? process.env.CONVOY_PROJECT_ID : process.env.DEV_CONVOY_PROJECT_ID;

const CONVOY_API_URI = process.env.CONVOY_API_URI;


function getConvoyAPIKey() {
    if(CONVOY_API_KEY === undefined){
        throw new Error("CONVOY_API_KEY is undefined")
    }

    return CONVOY_API_KEY;
}

function getConvoyProjectID() {
    if(CONVOY_PROJECT_ID === undefined){
        throw new Error("CONVOY_PROJECT_ID is undefined")
    }

    return CONVOY_PROJECT_ID;
}

function getConvoyAPIURI() {
    if(CONVOY_API_URI === undefined){
        throw new Error("CONVOY_API_URI is undefined")
    }
    return CONVOY_API_URI;
}

const convoy = new Convoy({
    api_key: getConvoyAPIKey(),
    project_id: getConvoyProjectID(),
    uri: getConvoyAPIURI()
});

export default convoy
