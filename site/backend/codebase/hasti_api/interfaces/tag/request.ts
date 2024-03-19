export interface TagSearchResponse {
    facet_counts:   any[];
    found:          number;
    hits:           Hit[];
    out_of:         number;
    page:           number;
    request_params: RequestParams;
    search_cutoff:  boolean;
    search_time_ms: number;
}

export interface Hit {
    document:        Document;
    highlight:       Highlight;
    highlights:      any[];
    text_match:      number;
    text_match_info: TextMatchInfo;
}

export interface Document {
    name:          string;
    projectsUsing: number;
    type:          string;
}

export interface Highlight {
}

export interface TextMatchInfo {
    best_field_score:  string;
    best_field_weight: number;
    fields_matched:    number;
    score:             string;
    tokens_matched:    number;
}

export interface RequestParams {
    collection_name: string;
    per_page:        number;
    q:               string;
}