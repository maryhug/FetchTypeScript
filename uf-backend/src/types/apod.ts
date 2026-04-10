export interface ApodEntry {
    id:          number;
    date:        string;
    title:       string;
    explanation: string;
    url:         string;
    hdurl?:      string;
    media_type:  "image" | "video";
    copyright?:  string;
}