/**
 * Build pipeline for NYPD Sergeant Study Guide
 * Reads chapter markdown files and generates structured JSON output
 */
import { StudyData } from './types';
export interface BuildOptions {
    projectRoot: string;
    outputDir: string;
    format?: 'json' | 'js';
}
export declare function build(options: BuildOptions): StudyData;
