export interface AnalyzeUnit {
    parse(): Promise<void>;
    execute(): Promise<void>;
}
