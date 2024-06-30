import { User } from "@/backend/interfaces/user"
import { DocumentSchema } from "typesense/lib/Typesense/Documents";

export interface ProjectSearchResponse extends Document{
    IoTClassification:   string;
    activityRating:      number;
    backgroundImage:     string;
    claimed:             boolean;
    contentImages:       any[];
    contentSHA:          string;
    createdAt:           Date;
    description:         string;
    iconImage:           string;
    id:                  string;
    overallRating:       number;
    popularityRating:    number;
    projectType:         ProjectType;
    published:           boolean;
    repoID:              string;
    tagNames:            string[];
    title:               string;
    updatedAt:           Date;
    userID:              string;
    usingHastiMD:        boolean;
    worksWithContainer:  boolean;
    worksWithCore:       boolean;
    worksWithHAVersion:  string;
    worksWithOS:         boolean;
    worksWithSupervised: boolean;
}


// Document With User
export interface DocumentWithUser extends ProjectSearchResponse{
    user: User | null;
}

export enum ProjectType {
    Integration = "integration",
    ProjectTypeIntegration = "# integration",
}

export interface Highlight {
}

export interface RequestParams {
    collection_name: string;
    first_q:         string;
    per_page:        number;
    q:               string;
}
