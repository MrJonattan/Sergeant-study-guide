"use strict";
/**
 * Build pipeline for NYPD Sergeant Study Guide
 * Reads chapter markdown files and generates structured JSON output
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.build = build;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const types_1 = require("./types");
const parser_1 = require("./parser");
// ─────────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────────
// Auto-generate version from git commit or use env variable
const DATA_VERSION = process.env.DATA_VERSION || new Date().toISOString().split('T')[0].replace(/-/g, '');
const CHAPTER_ORDER = [
    '200-general',
    '202-duties-responsibilities',
    '203-ethics-and-conduct',
    '207-complaints',
    '208-arrests',
    '209-summonses',
    '210-prisoners',
    '211-court-appearances',
    '212-command-operations',
    '213-mobilization-emergency',
    '214-quality-of-life',
    '215-juvenile-matters',
    '216-aided-cases',
    '217-vehicle-collisions',
    '218-property-general',
    '219-department-property',
    '220-citywide-incident-mgmt',
    '221-tactical-operations',
    '303-duties-responsibilities',
    '304-general-regulations',
    '305-uniforms-equipment',
    '318-disciplinary-matters',
    '319-civilian-personnel',
    '320-personnel-matters',
    '324-leave-payroll-timekeeping',
    '329-career-development',
    '330-medical-health-wellness',
    '331-evaluations',
    '332-employee-rights',
];
const SERGEANT_CATEGORIES = [
    { id: 'prisoner-mgmt', label: 'Prisoner Management', chapters: ['210-prisoners'] },
    { id: 'arrest-processing', label: 'Arrest Processing', chapters: ['208-arrests'] },
    { id: 'supervisor-response', label: 'Supervisor Response', chapters: ['212-command-operations'] },
    { id: 'documentation', label: 'Documentation & Reports', chapters: ['212-command-operations'] },
    { id: 'property-evidence', label: 'Property & Evidence', chapters: ['218-property-general', '219-department-property'] },
    { id: 'court-legal', label: 'Court & Legal', chapters: ['211-court-appearances'] },
    { id: 'use-of-force', label: 'Use of Force', chapters: ['221-tactical-operations'] },
    { id: 'juvenile', label: 'Juvenile Procedures', chapters: ['215-juvenile-matters'] },
    { id: 'personnel-leave', label: 'Personnel & Leave', chapters: ['319-civilian-personnel', '324-leave-payroll-timekeeping', '329-career-development'] },
    { id: 'equipment-uniforms', label: 'Equipment & Uniforms', chapters: ['305-uniforms-equipment'] },
    { id: 'command-ops', label: 'Command Operations', chapters: ['212-command-operations', '220-citywide-incident-mgmt'] },
    { id: 'qol-enforcement', label: 'Quality of Life', chapters: ['214-quality-of-life'] },
    { id: 'mobilization', label: 'Mobilization & Emergency', chapters: ['213-mobilization-emergency'] },
    { id: 'disciplinary', label: 'Disciplinary Matters', chapters: ['318-disciplinary-matters', '332-employee-rights'] },
    { id: 'complaints', label: 'Complaints & Investigations', chapters: ['207-complaints'] },
    { id: 'medical-wellness', label: 'Medical & Wellness', chapters: ['330-medical-health-wellness'] },
    { id: 'general-regulations', label: 'General Regulations', chapters: ['304-general-regulations'] },
];
// ─────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────
function readFile(filePath) {
    try {
        return fs.readFileSync(filePath, 'utf8');
    }
    catch {
        return null;
    }
}
// ─────────────────────────────────────────────
// Chapter Builder
// ─────────────────────────────────────────────
function buildChapter(chapterId, chaptersDir) {
    const dir = path.join(chaptersDir, chapterId);
    if (!fs.existsSync(dir)) {
        console.warn(`Warning: Chapter directory not found: ${dir}`);
        return null;
    }
    const readme = (0, parser_1.cleanReadme)(readFile(path.join(dir, 'README.md')) || '');
    const keyTerms = readFile(path.join(dir, 'key-terms.md')) || '';
    const reviewRaw = readFile(path.join(dir, 'review-questions.md')) || '';
    // Read section files
    const sectionFiles = fs
        .readdirSync(dir)
        .filter((f) => f.startsWith('section-') && f.endsWith('.md'))
        .sort();
    const sections = sectionFiles.map((f) => (0, parser_1.parseSectionFile)(f, fs.readFileSync(path.join(dir, f), 'utf8')));
    // Extract Sergeant Focus callouts from all sections
    const sergeantFocus = [];
    for (const section of sections) {
        const extracted = (0, parser_1.extractSergeantFocus)(section.content, section.filename);
        sergeantFocus.push(...extracted);
    }
    // Extract title from README
    const titleMatch = readme.match(/^#\s+.*?—\s+(.*)/m);
    const sectionNum = chapterId.split('-')[0];
    const chapter = {
        id: chapterId,
        sectionNum,
        title: titleMatch ? titleMatch[1].trim() : chapterId,
        readme,
        sections,
        keyTerms,
        reviewQuestions: reviewRaw,
        questions: (0, parser_1.parseReviewQuestions)(reviewRaw),
        sergeantFocus,
    };
    return chapter;
}
function build(options) {
    const { projectRoot, outputDir, format = 'json' } = options;
    const chaptersDir = path.join(projectRoot, 'chapters');
    const assetsDir = path.join(projectRoot, 'assets');
    console.log('Building study guide...');
    console.log(`  Chapters directory: ${chaptersDir}`);
    console.log(`  Output directory: ${outputDir}`);
    // Build all chapters
    const chapters = [];
    for (const chapterId of CHAPTER_ORDER) {
        const chapter = buildChapter(chapterId, chaptersDir);
        if (chapter) {
            chapters.push(chapter);
        }
    }
    // Load static assets
    const cheatSheet = readFile(path.join(assetsDir, 'quick-reference-cheat-sheet.md')) || '';
    const examRaw = readFile(path.join(assetsDir, 'master-practice-exam.md')) || '';
    const examQuestions = (0, parser_1.parsePracticeExam)(examRaw);
    // Build study data
    const studyData = {
        chapters,
        cheatSheet,
        examQuestions,
        totalQuestions: chapters.reduce((sum, c) => sum + c.questions.length, 0),
        sergeantCategories: SERGEANT_CATEGORIES,
        version: DATA_VERSION,
    };
    // Validate against schema
    try {
        types_1.StudyDataSchema.parse(studyData);
        console.log('  ✓ Data validation passed');
    }
    catch (error) {
        console.error('  ✗ Data validation failed:', error);
        throw new Error('Generated data failed schema validation');
    }
    // Create output directory if needed
    fs.mkdirSync(outputDir, { recursive: true });
    // Write output
    const outputPath = path.join(outputDir, 'data.json');
    fs.writeFileSync(outputPath, JSON.stringify(studyData, null, 2));
    console.log(`  ✓ Wrote ${outputPath}`);
    // Also write JS format for web compatibility
    if (format === 'js') {
        const jsPath = path.join(outputDir, 'data.js');
        const jsContent = `window.STUDY_DATA = ${JSON.stringify(studyData)};\nwindow.SERGEANT_CATEGORIES = ${JSON.stringify(SERGEANT_CATEGORIES)};`;
        fs.writeFileSync(jsPath, jsContent);
        console.log(`  ✓ Wrote ${jsPath}`);
    }
    // Print summary
    const totalSergeantFocus = chapters.reduce((sum, c) => sum + c.sergeantFocus.length, 0);
    console.log('\nBuild Summary:');
    console.log(`  Chapters: ${chapters.length}`);
    console.log(`  Total questions: ${studyData.totalQuestions}`);
    console.log(`  Exam questions: ${examQuestions.length}`);
    console.log(`  Sergeant Focus callouts: ${totalSergeantFocus}`);
    if (chapters.length < CHAPTER_ORDER.length) {
        const built = new Set(chapters.map((c) => c.id));
        const missing = CHAPTER_ORDER.filter((id) => !built.has(id));
        console.warn(`\n  ⚠ Warning: Expected ${CHAPTER_ORDER.length} chapters but built ${chapters.length}`);
        console.warn(`  Missing: ${missing.join(', ')}`);
    }
    return studyData;
}
// ─────────────────────────────────────────────
// CLI Entry Point
// ─────────────────────────────────────────────
if (require.main === module) {
    // __dirname is packages/core/dist, so go up 2 levels to reach packages/core, then use parent as project root
    const packageDir = path.resolve(__dirname, '../..'); // packages/core
    const projectRoot = process.argv[2] || path.resolve(packageDir, '..'); // parent of packages/core
    const outputDir = process.argv[3] || path.join(projectRoot, 'build');
    build({
        projectRoot,
        outputDir,
        format: 'js', // Default to JS for web compatibility
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVpbGRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9idWlsZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O0dBR0c7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBMEpILHNCQTJFQztBQW5PRCx1Q0FBeUI7QUFDekIsMkNBQTZCO0FBQzdCLG1DQVNpQjtBQUNqQixxQ0FNa0I7QUFFbEIsZ0RBQWdEO0FBQ2hELGdCQUFnQjtBQUNoQixnREFBZ0Q7QUFFaEQsNERBQTREO0FBQzVELE1BQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxJQUFJLElBQUksSUFBSSxFQUFFLENBQUMsV0FBVyxFQUFFLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFFMUcsTUFBTSxhQUFhLEdBQUc7SUFDcEIsYUFBYTtJQUNiLDZCQUE2QjtJQUM3Qix3QkFBd0I7SUFDeEIsZ0JBQWdCO0lBQ2hCLGFBQWE7SUFDYixlQUFlO0lBQ2YsZUFBZTtJQUNmLHVCQUF1QjtJQUN2Qix3QkFBd0I7SUFDeEIsNEJBQTRCO0lBQzVCLHFCQUFxQjtJQUNyQixzQkFBc0I7SUFDdEIsaUJBQWlCO0lBQ2pCLHdCQUF3QjtJQUN4QixzQkFBc0I7SUFDdEIseUJBQXlCO0lBQ3pCLDRCQUE0QjtJQUM1Qix5QkFBeUI7SUFDekIsNkJBQTZCO0lBQzdCLHlCQUF5QjtJQUN6Qix3QkFBd0I7SUFDeEIsMEJBQTBCO0lBQzFCLHdCQUF3QjtJQUN4Qix1QkFBdUI7SUFDdkIsK0JBQStCO0lBQy9CLHdCQUF3QjtJQUN4Qiw2QkFBNkI7SUFDN0IsaUJBQWlCO0lBQ2pCLHFCQUFxQjtDQUN0QixDQUFDO0FBRUYsTUFBTSxtQkFBbUIsR0FBdUI7SUFDOUMsRUFBRSxFQUFFLEVBQUUsZUFBZSxFQUFFLEtBQUssRUFBRSxxQkFBcUIsRUFB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QU0sVUFBVSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsZ0JBQWdCO0lBQ3JFLE1BQU0sV0FBVyxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQywwQkFBMEI7SUFDakcsTUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUVyRSxLQUFLLENBQUM7UUFDSixXQUFXO1FBQ1gsU0FBUztRQUNULE1BQU0sRUFBRSxJQUFJLEVBQUUsc0NBQXNDO0tBQ3JELENBQUMsQ0FBQztBQUNMLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEJ1aWxkIHBpcGVsaW5lIGZvciBOWVBEIFNlcmdlYW50IFN0dWR5IEd1aWRlXG4gKiBSZWFkcyBjaGFwdGVyIG1hcmtkb3duIGZpbGVzIGFuZCBnZW5lcmF0ZXMgc3RydWN0dXJlZCBKU09OIG91dHB1dFxuICovXG5cbmltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQge1xuICBTdHVkeURhdGEsXG4gIENoYXB0ZXIsXG4gIFNlY3Rpb24sXG4gIFF1ZXN0aW9uLFxuICBFeGFtUXVlc3Rpb24sXG4gIFNlcmdlYW50Rm9jdXMsXG4gIFNlcmdlYW50Q2F0ZWdvcnksXG4gIFN0dWR5RGF0YVNjaGVtYSxcbn0gZnJvbSAnLi90eXBlcyc7XG5pbXBvcnQge1xuICBwYXJzZVJldmlld1F1ZXN0aW9ucyxcbiAgcGFyc2VQcmFjdGljZUV4YW0sXG4gIGV4dHJhY3RTZXJnZWFudEZvY3VzLFxuICBjbGVhblJlYWRtZSxcbiAgcGFyc2VTZWN0aW9uRmlsZSxcbn0gZnJvbSAnLi9wYXJzZXInO1xuXG4vLyDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcbi8vIENvbmZpZ3VyYXRpb25cbi8vIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxuXG4vLyBBdXRvLWdlbmVyYXRlIHZlcnNpb24gZnJvbSBnaXQgY29tbWl0IG9yIHVzZSBlbnYgdmFyaWFibGVcbmNvbnN0IERBVEFfVkVSU0lPTiA9IHByb2Nlc3MuZW52LkRBVEFfVkVSU0lPTiB8fCBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCkuc3BsaXQoJ1QnKVswXS5yZXBsYWNlKC8tL2csICcnKTtcblxuY29uc3QgQ0hBUFRFUl9PUkRFUiA9IFtcbiAgJzIwMC1nZW5lcmFsJyxcbiAgJzIwMi1kdXRpZXMtcmVzcG9uc2liaWxpdGllcycsXG4gICcyMDMtZXRoaWNzLWFuZC1jb25kdWN0JyxcbiAgJzIwNy1jb21wbGFpbnRzJyxcbiAgJzIwOC1hcnJlc3RzJyxcbiAgJzIwOS1zdW1tb25zZXMnLFxuICAnMjEwLXByaXNvbmVycycsXG4gICcyMTEtY291cnQtYXBwZWFyYW5jZXMnLFxuICAnMjEyLWNvbW1hbmQtb3BlcmF0aW9ucycsXG4gICcyMTMtbW9iaWxpemF0aW9uLWVtZXJnZW5jeScsXG4gICcyMTQtcXVhbGl0eS1vZi1saWZlJyxcbiAgJzIxNS1qdXZlbmlsZS1tYXR0ZXJzJyxcbiAgJzIxNi1haWRlZC1jYXNlcycsXG4gICcyMTctdmVoaWNsZS1jb2xsaXNpb25zJyxcbiAgJzIxOC1wcm9wZXJ0eS1nZW5lcmFsJyxcbiAgJzIxOS1kZXBhcnRtZW50LXByb3BlcnR5JyxcbiAgJzIyMC1jaXR5d2lkZS1pbmNpZGVudC1tZ210JyxcbiAgJzIyMS10YWN0aWNhbC1vcGVyYXRpb25zJyxcbiAgJzMwMy1kdXRpZXMtcmVzcG9uc2liaWxpdGllcycsXG4gICczMDQtZ2VuZXJhbC1yZWd1bGF0aW9ucycsXG4gICczMDUtdW5pZm9ybXMtZXF1aXBtZW50JyxcbiAgJzMxOC1kaXNjaXBsaW5hcnktbWF0dGVycycsXG4gICczMTktY2l2aWxpYW4tcGVyc29ubmVsJyxcbiAgJzMyMC1wZXJzb25uZWwtbWF0dGVycycsXG4gICczMjQtbGVhdmUtcGF5cm9sbC10aW1la2VlcGluZycsXG4gICczMjktY2FyZWVyLWRldmVsb3BtZW50JyxcbiAgJzMzMC1tZWRpY2FsLWhlYWx0aC13ZWxsbmVzcycsXG4gICczMzEtZXZhbHVhdGlvbnMnLFxuICAnMzMyLWVtcGxveWVlLXJpZ2h0cycsXG5dO1xuXG5jb25zdCBTRVJHRUFOVF9DQVRFR09SSUVTOiBTZXJnZWFudENhdGVnb3J5W10gPSBbXG4gIHsgaWQ6ICdwcmlzb25lci1tZ210JywgbGFiZWw6ICdQcmlzb25lciBNYW5hZ2VtZW50JywgY2hhcHRlcnM6IFsnMjEwLXByaXNvbmVycyddIH0sXG4gIHsgaWQ6ICdhcnJlc3QtcHJvY2Vzc2luZycsIGxhYmVsOiAnQXJyZXN0IFByb2Nlc3NpbmcnLCBjaGFwdGVyczogWycyMDgtYXJyZXN0cyddIH0sXG4gIHsgaWQ6ICdzdXBlcnZpc29yLXJlc3BvbnNlJywgbGFiZWw6ICdTdXBlcnZpc29yIFJlc3BvbnNlJywgY2hhcHRlcnM6IFsnMjEyLWNvbW1hbmQtb3BlcmF0aW9ucyddIH0sXG4gIHsgaWQ6ICdkb2N1bWVudGF0aW9uJywgbGFiZWw6ICdEb2N1bWVudGF0aW9uICYgUmVwb3J0cycsIGNoYXB0ZXJzOiBbJzIxMi1jb21tYW5kLW9wZXJhdGlvbnMnXSB9LFxuICB7IGlkOiAncHJvcGVydHktZXZpZGVuY2UnLCBsYWJlbDogJ1Byb3BlcnR5ICYgRXZpZGVuY2UnLCBjaGFwdGVyczogWycyMTgtcHJvcGVydHktZ2VuZXJhbCcsICcyMTktZGVwYXJ0bWVudC1wcm9wZXJ0eSddIH0sXG4gIHsgaWQ6ICdjb3VydC1sZWdhbCcsIGxhYmVsOiAnQ291cnQgJiBMZWdhbCcsIGNoYXB0ZXJzOiBbJzIxMS1jb3VydC1hcHBlYXJhbmNlcyddIH0sXG4gIHsgaWQ6ICd1c2Utb2YtZm9yY2UnLCBsYWJlbDogJ1VzZSBvZiBGb3JjZScsIGNoYXB0ZXJzOiBbJzIyMS10YWN0aWNhbC1vcGVyYXRpb25zJ10gfSxcbiAgeyBpZDogJ2p1dmVuaWxlJywgbGFiZWw6ICdKdXZlbmlsZSBQcm9jZWR1cmVzJywgY2hhcHRlcnM6IFsnMjE1LWp1dmVuaWxlLW1hdHRlcnMnXSB9LFxuICB7IGlkOiAncGVyc29ubmVsLWxlYXZlJywgbGFiZWw6ICdQZXJzb25uZWwgJiBMZWF2ZScsIGNoYXB0ZXJzOiBbJzMxOS1jaXZpbGlhbi1wZXJzb25uZWwnLCAnMzI0LWxlYXZlLXBheXJvbGwtdGltZWtlZXBpbmcnLCAnMzI5LWNhcmVlci1kZXZlbG9wbWVudCddIH0sXG4gIHsgaWQ6ICdlcXVpcG1lbnQtdW5pZm9ybXMnLCBsYWJlbDogJ0VxdWlwbWVudCAmIFVuaWZvcm1zJywgY2hhcHRlcnM6IFsnMzA1LXVuaWZvcm1zLWVxdWlwbWVudCddIH0sXG4gIHsgaWQ6ICdjb21tYW5kLW9wcycsIGxhYmVsOiAnQ29tbWFuZCBPcGVyYXRpb25zJywgY2hhcHRlcnM6IFsnMjEyLWNvbW1hbmQtb3BlcmF0aW9ucycsICcyMjAtY2l0eXdpZGUtaW5jaWRlbnQtbWdtdCddIH0sXG4gIHsgaWQ6ICdxb2wtZW5mb3JjZW1lbnQnLCBsYWJlbDogJ1F1YWxpdHkgb2YgTGlmZScsIGNoYXB0ZXJzOiBbJzIxNC1xdWFsaXR5LW9mLWxpZmUnXSB9LFxuICB7IGlkOiAnbW9iaWxpemF0aW9uJywgbGFiZWw6ICdNb2JpbGl6YXRpb24gJiBFbWVyZ2VuY3knLCBjaGFwdGVyczogWycyMTMtbW9iaWxpemF0aW9uLWVtZXJnZW5jeSddIH0sXG4gIHsgaWQ6ICdkaXNjaXBsaW5hcnknLCBsYWJlbDogJ0Rpc2NpcGxpbmFyeSBNYXR0ZXJzJywgY2hhcHRlcnM6IFsnMzE4LWRpc2NpcGxpbmFyeS1tYXR0ZXJzJywgJzMzMi1lbXBsb3llZS1yaWdodHMnXSB9LFxuICB7IGlkOiAnY29tcGxhaW50cycsIGxhYmVsOiAnQ29tcGxhaW50cyAmIEludmVzdGlnYXRpb25zJywgY2hhcHRlcnM6IFsnMjA3LWNvbXBsYWludHMnXSB9LFxuICB7IGlkOiAnbWVkaWNhbC13ZWxsbmVzcycsIGxhYmVsOiAnTWVkaWNhbCAmIFdlbGxuZXNzJywgY2hhcHRlcnM6IFsnMzMwLW1lZGljYWwtaGVhbHRoLXdlbGxuZXNzJ10gfSxcbiAgeyBpZDogJ2dlbmVyYWwtcmVndWxhdGlvbnMnLCBsYWJlbDogJ0dlbmVyYWwgUmVndWxhdGlvbnMnLCBjaGFwdGVyczogWyczMDQtZ2VuZXJhbC1yZWd1bGF0aW9ucyddIH0sXG5dO1xuXG4vLyDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcbi8vIEhlbHBlciBGdW5jdGlvbnNcbi8vIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxuXG5mdW5jdGlvbiByZWFkRmlsZShmaWxlUGF0aDogc3RyaW5nKTogc3RyaW5nIHwgbnVsbCB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGZzLnJlYWRGaWxlU3luYyhmaWxlUGF0aCwgJ3V0ZjgnKTtcbiAgfSBjYXRjaCB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cblxuLy8g4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXG4vLyBDaGFwdGVyIEJ1aWxkZXJcbi8vIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxuXG5mdW5jdGlvbiBidWlsZENoYXB0ZXIoY2hhcHRlcklkOiBzdHJpbmcsIGNoYXB0ZXJzRGlyOiBzdHJpbmcpOiBDaGFwdGVyIHwgbnVsbCB7XG4gIGNvbnN0IGRpciA9IHBhdGguam9pbihjaGFwdGVyc0RpciwgY2hhcHRlcklkKTtcbiAgaWYgKCFmcy5leGlzdHNTeW5jKGRpcikpIHtcbiAgICBjb25zb2xlLndhcm4oYFdhcm5pbmc6IENoYXB0ZXIgZGlyZWN0b3J5IG5vdCBmb3VuZDogJHtkaXJ9YCk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBjb25zdCByZWFkbWUgPSBjbGVhblJlYWRtZShyZWFkRmlsZShwYXRoLmpvaW4oZGlyLCAnUkVBRE1FLm1kJykpIHx8ICcnKTtcbiAgY29uc3Qga2V5VGVybXMgPSByZWFkRmlsZShwYXRoLmpvaW4oZGlyLCAna2V5LXRlcm1zLm1kJykpIHx8ICcnO1xuICBjb25zdCByZXZpZXdSYXcgPSByZWFkRmlsZShwYXRoLmpvaW4oZGlyLCAncmV2aWV3LXF1ZXN0aW9ucy5tZCcpKSB8fCAnJztcblxuICAvLyBSZWFkIHNlY3Rpb24gZmlsZXNcbiAgY29uc3Qgc2VjdGlvbkZpbGVzID0gZnNcbiAgICAucmVhZGRpclN5bmMoZGlyKVxuICAgIC5maWx0ZXIoKGYpID0+IGYuc3RhcnRzV2l0aCgnc2VjdGlvbi0nKSAmJiBmLmVuZHNXaXRoKCcubWQnKSlcbiAgICAuc29ydCgpO1xuXG4gIGNvbnN0IHNlY3Rpb25zOiBTZWN0aW9uW10gPSBzZWN0aW9uRmlsZXMubWFwKChmKSA9PlxuICAgIHBhcnNlU2VjdGlvbkZpbGUoZiwgZnMucmVhZEZpbGVTeW5jKHBhdGguam9pbihkaXIsIGYpLCAndXRmOCcpKVxuICApO1xuXG4gIC8vIEV4dHJhY3QgU2VyZ2VhbnQgRm9jdXMgY2FsbG91dHMgZnJvbSBhbGwgc2VjdGlvbnNcbiAgY29uc3Qgc2VyZ2VhbnRGb2N1czogU2VyZ2VhbnRGb2N1c1tdID0gW107XG4gIGZvciAoY29uc3Qgc2VjdGlvbiBvZiBzZWN0aW9ucykge1xuICAgIGNvbnN0IGV4dHJhY3RlZCA9IGV4dHJhY3RTZXJnZWFudEZvY3VzKHNlY3Rpb24uY29udGVudCwgc2VjdGlvbi5maWxlbmFtZSk7XG4gICAgc2VyZ2VhbnRGb2N1cy5wdXNoKC4uLmV4dHJhY3RlZCk7XG4gIH1cblxuICAvLyBFeHRyYWN0IHRpdGxlIGZyb20gUkVBRE1FXG4gIGNvbnN0IHRpdGxlTWF0Y2ggPSByZWFkbWUubWF0Y2goL14jXFxzKy4qP+KAlFxccysoLiopL20pO1xuICBjb25zdCBzZWN0aW9uTnVtID0gY2hhcHRlcklkLnNwbGl0KCctJylbMF07XG5cbiAgY29uc3QgY2hhcHRlcjogQ2hhcHRlciA9IHtcbiAgICBpZDogY2hhcHRlcklkIGFzIGAke3N0cmluZ30tJHtzdHJpbmd9YCxcbiAgICBzZWN0aW9uTnVtLFxuICAgIHRpdGxlOiB0aXRsZU1hdGNoID8gdGl0bGVNYXRjaFsxXS50cmltKCkgOiBjaGFwdGVySWQsXG4gICAgcmVhZG1lLFxuICAgIHNlY3Rpb25zLFxuICAgIGtleVRlcm1zLFxuICAgIHJldmlld1F1ZXN0aW9uczogcmV2aWV3UmF3LFxuICAgIHF1ZXN0aW9uczogcGFyc2VSZXZpZXdRdWVzdGlvbnMocmV2aWV3UmF3KSxcbiAgICBzZXJnZWFudEZvY3VzLFxuICB9O1xuXG4gIHJldHVybiBjaGFwdGVyO1xufVxuXG4vLyDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcbi8vIE1haW4gQnVpbGQgRnVuY3Rpb25cbi8vIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxuXG5leHBvcnQgaW50ZXJmYWNlIEJ1aWxkT3B0aW9ucyB7XG4gIHByb2plY3RSb290OiBzdHJpbmc7XG4gIG91dHB1dERpcjogc3RyaW5nO1xuICBmb3JtYXQ/OiAnanNvbicgfCAnanMnO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYnVpbGQob3B0aW9uczogQnVpbGRPcHRpb25zKTogU3R1ZHlEYXRhIHtcbiAgY29uc3QgeyBwcm9qZWN0Um9vdCwgb3V0cHV0RGlyLCBmb3JtYXQgPSAnanNvbicgfSA9IG9wdGlvbnM7XG5cbiAgY29uc3QgY2hhcHRlcnNEaXIgPSBwYXRoLmpvaW4ocHJvamVjdFJvb3QsICdjaGFwdGVycycpO1xuICBjb25zdCBhc3NldHNEaXIgPSBwYXRoLmpvaW4ocHJvamVjdFJvb3QsICdhc3NldHMnKTtcblxuICBjb25zb2xlLmxvZygnQnVpbGRpbmcgc3R1ZHkgZ3VpZGUuLi4nKTtcbiAgY29uc29sZS5sb2coYCAgQ2hhcHRlcnMgZGlyZWN0b3J5OiAke2NoYXB0ZXJzRGlyfWApO1xuICBjb25zb2xlLmxvZyhgICBPdXRwdXQgZGlyZWN0b3J5OiAke291dHB1dERpcn1gKTtcblxuICAvLyBCdWlsZCBhbGwgY2hhcHRlcnNcbiAgY29uc3QgY2hhcHRlcnM6IENoYXB0ZXJbXSA9IFtdO1xuICBmb3IgKGNvbnN0IGNoYXB0ZXJJZCBvZiBDSEFQVEVSX09SREVSKSB7XG4gICAgY29uc3QgY2hhcHRlciA9IGJ1aWxkQ2hhcHRlcihjaGFwdGVySWQsIGNoYXB0ZXJzRGlyKTtcbiAgICBpZiAoY2hhcHRlcikge1xuICAgICAgY2hhcHRlcnMucHVzaChjaGFwdGVyKTtcbiAgICB9XG4gIH1cblxuICAvLyBMb2FkIHN0YXRpYyBhc3NldHNcbiAgY29uc3QgY2hlYXRTaGVldCA9IHJlYWRGaWxlKHBhdGguam9pbihhc3NldHNEaXIsICdxdWljay1yZWZlcmVuY2UtY2hlYXQtc2hlZXQubWQnKSkgfHwgJyc7XG4gIGNvbnN0IGV4YW1SYXcgPSByZWFkRmlsZShwYXRoLmpvaW4oYXNzZXRzRGlyLCAnbWFzdGVyLXByYWN0aWNlLWV4YW0ubWQnKSkgfHwgJyc7XG4gIGNvbnN0IGV4YW1RdWVzdGlvbnMgPSBwYXJzZVByYWN0aWNlRXhhbShleGFtUmF3KTtcblxuICAvLyBCdWlsZCBzdHVkeSBkYXRhXG4gIGNvbnN0IHN0dWR5RGF0YTogU3R1ZHlEYXRhID0ge1xuICAgIGNoYXB0ZXJzLFxuICAgIGNoZWF0U2hlZXQsXG4gICAgZXhhbVF1ZXN0aW9ucyxcbiAgICB0b3RhbFF1ZXN0aW9uczogY2hhcHRlcnMucmVkdWNlKChzdW0sIGMpID0+IHN1bSArIGMucXVlc3Rpb25zLmxlbmd0aCwgMCksXG4gICAgc2VyZ2VhbnRDYXRlZ29yaWVzOiBTRVJHRUFOVF9DQVRFR09SSUVTLFxuICAgIHZlcnNpb246IERBVEFfVkVSU0lPTixcbiAgfTtcblxuICAvLyBWYWxpZGF0ZSBhZ2FpbnN0IHNjaGVtYVxuICB0cnkge1xuICAgIFN0dWR5RGF0YVNjaGVtYS5wYXJzZShzdHVkeURhdGEpO1xuICAgIGNvbnNvbGUubG9nKCcgIOKckyBEYXRhIHZhbGlkYXRpb24gcGFzc2VkJyk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcignICDinJcgRGF0YSB2YWxpZGF0aW9uIGZhaWxlZDonLCBlcnJvcik7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdHZW5lcmF0ZWQgZGF0YSBmYWlsZWQgc2NoZW1hIHZhbGlkYXRpb24nKTtcbiAgfVxuXG4gIC8vIENyZWF0ZSBvdXRwdXQgZGlyZWN0b3J5IGlmIG5lZWRlZFxuICBmcy5ta2RpclN5bmMob3V0cHV0RGlyLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcblxuICAvLyBXcml0ZSBvdXRwdXRcbiAgY29uc3Qgb3V0cHV0UGF0aCA9IHBhdGguam9pbihvdXRwdXREaXIsICdkYXRhLmpzb24nKTtcbiAgZnMud3JpdGVGaWxlU3luYyhvdXRwdXRQYXRoLCBKU09OLnN0cmluZ2lmeShzdHVkeURhdGEsIG51bGwsIDIpKTtcbiAgY29uc29sZS5sb2coYCAg4pyTIFdyb3RlICR7b3V0cHV0UGF0aH1gKTtcblxuICAvLyBBbHNvIHdyaXRlIEpTIGZvcm1hdCBmb3Igd2ViIGNvbXBhdGliaWxpdHlcbiAgaWYgKGZvcm1hdCA9PT0gJ2pzJykge1xuICAgIGNvbnN0IGpzUGF0aCA9IHBhdGguam9pbihvdXRwdXREaXIsICdkYXRhLmpzJyk7XG4gICAgY29uc3QganNDb250ZW50ID0gYHdpbmRvdy5TVFVEWV9EQVRBID0gJHtKU09OLnN0cmluZ2lmeShzdHVkeURhdGEpfTtcXG53aW5kb3cuU0VSR0VBTlRfQ0FURUdPUklFUyA9ICR7SlNPTi5zdHJpbmdpZnkoU0VSR0VBTlRfQ0FURUdPUklFUyl9O2A7XG4gICAgZnMud3JpdGVGaWxlU3luYyhqc1BhdGgsIGpzQ29udGVudCk7XG4gICAgY29uc29sZS5sb2coYCAg4pyTIFdyb3RlICR7anNQYXRofWApO1xuICB9XG5cbiAgLy8gUHJpbnQgc3VtbWFyeVxuICBjb25zdCB0b3RhbFNlcmdlYW50Rm9jdXMgPSBjaGFwdGVycy5yZWR1Y2UoKHN1bSwgYykgPT4gc3VtICsgYy5zZXJnZWFudEZvY3VzLmxlbmd0aCwgMCk7XG4gIGNvbnNvbGUubG9nKCdcXG5CdWlsZCBTdW1tYXJ5OicpO1xuICBjb25zb2xlLmxvZyhgICBDaGFwdGVyczogJHtjaGFwdGVycy5sZW5ndGh9YCk7XG4gIGNvbnNvbGUubG9nKGAgIFRvdGFsIHF1ZXN0aW9uczogJHtzdHVkeURhdGEudG90YWxRdWVzdGlvbnN9YCk7XG4gIGNvbnNvbGUubG9nKGAgIEV4YW0gcXVlc3Rpb25zOiAke2V4YW1RdWVzdGlvbnMubGVuZ3RofWApO1xuICBjb25zb2xlLmxvZyhgICBTZXJnZWFudCBGb2N1cyBjYWxsb3V0czogJHt0b3RhbFNlcmdlYW50Rm9jdXN9YCk7XG5cbiAgaWYgKGNoYXB0ZXJzLmxlbmd0aCA8IENIQVBURVJfT1JERVIubGVuZ3RoKSB7XG4gICAgY29uc3QgYnVpbHQgPSBuZXcgU2V0KGNoYXB0ZXJzLm1hcCgoYykgPT4gYy5pZCkpO1xuICAgIGNvbnN0IG1pc3NpbmcgPSBDSEFQVEVSX09SREVSLmZpbHRlcigoaWQpID0+ICFidWlsdC5oYXMoaWQpKTtcbiAgICBjb25zb2xlLndhcm4oYFxcbiAg4pqgIFdhcm5pbmc6IEV4cGVjdGVkICR7Q0hBUFRFUl9PUkRFUi5sZW5ndGh9IGNoYXB0ZXJzIGJ1dCBidWlsdCAke2NoYXB0ZXJzLmxlbmd0aH1gKTtcbiAgICBjb25zb2xlLndhcm4oYCAgTWlzc2luZzogJHttaXNzaW5nLmpvaW4oJywgJyl9YCk7XG4gIH1cblxuICByZXR1cm4gc3R1ZHlEYXRhO1xufVxuXG4vLyDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcbi8vIENMSSBFbnRyeSBQb2ludFxuLy8g4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXG5cbmlmIChyZXF1aXJlLm1haW4gPT09IG1vZHVsZSkge1xuICAvLyBfX2Rpcm5hbWUgaXMgcGFja2FnZXMvY29yZS9kaXN0LCBzbyBnbyB1cCAyIGxldmVscyB0byByZWFjaCBwYWNrYWdlcy9jb3JlLCB0aGVuIHVzZSBwYXJlbnQgYXMgcHJvamVjdCByb290XG4gIGNvbnN0IHBhY2thZ2VEaXIgPSBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi4vLi4nKTsgLy8gcGFja2FnZXMvY29yZVxuICBjb25zdCBwcm9qZWN0Um9vdCA9IHByb2Nlc3MuYXJndlsyXSB8fCBwYXRoLnJlc29sdmUocGFja2FnZURpciwgJy4uJyk7IC8vIHBhcmVudCBvZiBwYWNrYWdlcy9jb3JlXG4gIGNvbnN0IG91dHB1dERpciA9IHByb2Nlc3MuYXJndlszXSB8fCBwYXRoLmpvaW4ocHJvamVjdFJvb3QsICdidWlsZCcpO1xuXG4gIGJ1aWxkKHtcbiAgICBwcm9qZWN0Um9vdCxcbiAgICBvdXRwdXREaXIsXG4gICAgZm9ybWF0OiAnanMnLCAvLyBEZWZhdWx0IHRvIEpTIGZvciB3ZWIgY29tcGF0aWJpbGl0eVxuICB9KTtcbn1cbiJdfQ==