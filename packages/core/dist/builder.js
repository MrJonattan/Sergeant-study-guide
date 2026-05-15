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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVpbGRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9idWlsZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O0dBR0c7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBeUpILHNCQTJFQztBQWxPRCx1Q0FBeUI7QUFDekIsMkNBQTZCO0FBQzdCLG1DQVNpQjtBQUNqQixxQ0FNa0I7QUFFbEIsZ0RBQWdEO0FBQ2hELGdCQUFnQjtBQUNoQixnREFBZ0Q7QUFFaEQsNERBQTREO0FBQzVELE1BQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxJQUFJLElBQUksSUFBSSxFQUFFLENBQUMsV0FBVyxFQUFFLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFFMUcsTUFBTSxhQUFhLEdBQUc7SUFDcEIsYUFBYTtJQUNiLDZCQUE2QjtJQUM3QixnQkFBZ0I7SUFDaEIsYUFBYTtJQUNiLGVBQWU7SUFDZixlQUFlO0lBQ2YsdUJBQXVCO0lBQ3ZCLHdCQUF3QjtJQUN4Qiw0QkFBNEI7SUFDNUIscUJBQXFCO0lBQ3JCLHNCQUFzQjtJQUN0QixpQkFBaUI7SUFDakIsd0JBQXdCO0lBQ3hCLHNCQUFzQjtJQUN0Qix5QkFBeUI7SUFDekIsNEJBQTRCO0lBQzVCLHlCQUF5QjtJQUN6Qiw2QkFBNkI7SUFDN0IseUJBQXlCO0lBQ3pCLHdCQUF3QjtJQUN4QiwwQkFBMEI7SUFDMUIsd0JBQXdCO0lBQ3hCLHVCQUF1QjtJQUN2QiwrQkFBK0I7SUFDL0Isd0JBQXdCO0lBQ3hCLDZCQUE2QjtJQUM3QixpQkFBaUI7SUFDakIscUJBQXFCO0NBQ3RCLENBQUM7QUFFRixNQUFNLG1CQUFtQixHQUF1QjtJQUM5QyxFQUFFLEVBQUUsRUFBRSxlQUFlLEVBQUUsS0FBSyxFQUFFLHFCQUFxQixFQUFFLFFBQVEsRUFBRSxD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SUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxnQkFBZ0I7SUFDckUsTUFBTSxXQUFXLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLDBCQUEwQjtJQUNqRyxNQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBRXJFLEtBQUssQ0FBQztRQUNKLFdBQVc7UUFDWCxTQUFTO1FBQ1QsTUFBTSxFQUFFLElBQUksRUFBRSxzQ0FBc0M7S0FDckQsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQnVpbGQgcGlwZWxpbmUgZm9yIE5ZUEQgU2VyZ2VhbnQgU3R1ZHkgR3VpZGVcbiAqIFJlYWRzIGNoYXB0ZXIgbWFya2Rvd24gZmlsZXMgYW5kIGdlbmVyYXRlcyBzdHJ1Y3R1cmVkIEpTT04gb3V0cHV0XG4gKi9cblxuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7XG4gIFN0dWR5RGF0YSxcbiAgQ2hhcHRlcixcbiAgU2VjdGlvbixcbiAgUXVlc3Rpb24sXG4gIEV4YW1RdWVzdGlvbixcbiAgU2VyZ2VhbnRGb2N1cyxcbiAgU2VyZ2VhbnRDYXRlZ29yeSxcbiAgU3R1ZHlEYXRhU2NoZW1hLFxufSBmcm9tICcuL3R5cGVzJztcbmltcG9ydCB7XG4gIHBhcnNlUmV2aWV3UXVlc3Rpb25zLFxuICBwYXJzZVByYWN0aWNlRXhhbSxcbiAgZXh0cmFjdFNlcmdlYW50Rm9jdXMsXG4gIGNsZWFuUmVhZG1lLFxuICBwYXJzZVNlY3Rpb25GaWxlLFxufSBmcm9tICcuL3BhcnNlcic7XG5cbi8vIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxuLy8gQ29uZmlndXJhdGlvblxuLy8g4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXG5cbi8vIEF1dG8tZ2VuZXJhdGUgdmVyc2lvbiBmcm9tIGdpdCBjb21taXQgb3IgdXNlIGVudiB2YXJpYWJsZVxuY29uc3QgREFUQV9WRVJTSU9OID0gcHJvY2Vzcy5lbnYuREFUQV9WRVJTSU9OIHx8IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKS5zcGxpdCgnVCcpWzBdLnJlcGxhY2UoLy0vZywgJycpO1xuXG5jb25zdCBDSEFQVEVSX09SREVSID0gW1xuICAnMjAwLWdlbmVyYWwnLFxuICAnMjAyLWR1dGllcy1yZXNwb25zaWJpbGl0aWVzJyxcbiAgJzIwNy1jb21wbGFpbnRzJyxcbiAgJzIwOC1hcnJlc3RzJyxcbiAgJzIwOS1zdW1tb25zZXMnLFxuICAnMjEwLXByaXNvbmVycycsXG4gICcyMTEtY291cnQtYXBwZWFyYW5jZXMnLFxuICAnMjEyLWNvbW1hbmQtb3BlcmF0aW9ucycsXG4gICcyMTMtbW9iaWxpemF0aW9uLWVtZXJnZW5jeScsXG4gICcyMTQtcXVhbGl0eS1vZi1saWZlJyxcbiAgJzIxNS1qdXZlbmlsZS1tYXR0ZXJzJyxcbiAgJzIxNi1haWRlZC1jYXNlcycsXG4gICcyMTctdmVoaWNsZS1jb2xsaXNpb25zJyxcbiAgJzIxOC1wcm9wZXJ0eS1nZW5lcmFsJyxcbiAgJzIxOS1kZXBhcnRtZW50LXByb3BlcnR5JyxcbiAgJzIyMC1jaXR5d2lkZS1pbmNpZGVudC1tZ210JyxcbiAgJzIyMS10YWN0aWNhbC1vcGVyYXRpb25zJyxcbiAgJzMwMy1kdXRpZXMtcmVzcG9uc2liaWxpdGllcycsXG4gICczMDQtZ2VuZXJhbC1yZWd1bGF0aW9ucycsXG4gICczMDUtdW5pZm9ybXMtZXF1aXBtZW50JyxcbiAgJzMxOC1kaXNjaXBsaW5hcnktbWF0dGVycycsXG4gICczMTktY2l2aWxpYW4tcGVyc29ubmVsJyxcbiAgJzMyMC1wZXJzb25uZWwtbWF0dGVycycsXG4gICczMjQtbGVhdmUtcGF5cm9sbC10aW1la2VlcGluZycsXG4gICczMjktY2FyZWVyLWRldmVsb3BtZW50JyxcbiAgJzMzMC1tZWRpY2FsLWhlYWx0aC13ZWxsbmVzcycsXG4gICczMzEtZXZhbHVhdGlvbnMnLFxuICAnMzMyLWVtcGxveWVlLXJpZ2h0cycsXG5dO1xuXG5jb25zdCBTRVJHRUFOVF9DQVRFR09SSUVTOiBTZXJnZWFudENhdGVnb3J5W10gPSBbXG4gIHsgaWQ6ICdwcmlzb25lci1tZ210JywgbGFiZWw6ICdQcmlzb25lciBNYW5hZ2VtZW50JywgY2hhcHRlcnM6IFsnMjEwLXByaXNvbmVycyddIH0sXG4gIHsgaWQ6ICdhcnJlc3QtcHJvY2Vzc2luZycsIGxhYmVsOiAnQXJyZXN0IFByb2Nlc3NpbmcnLCBjaGFwdGVyczogWycyMDgtYXJyZXN0cyddIH0sXG4gIHsgaWQ6ICdzdXBlcnZpc29yLXJlc3BvbnNlJywgbGFiZWw6ICdTdXBlcnZpc29yIFJlc3BvbnNlJywgY2hhcHRlcnM6IFsnMjEyLWNvbW1hbmQtb3BlcmF0aW9ucyddIH0sXG4gIHsgaWQ6ICdkb2N1bWVudGF0aW9uJywgbGFiZWw6ICdEb2N1bWVudGF0aW9uICYgUmVwb3J0cycsIGNoYXB0ZXJzOiBbJzIxMi1jb21tYW5kLW9wZXJhdGlvbnMnXSB9LFxuICB7IGlkOiAncHJvcGVydHktZXZpZGVuY2UnLCBsYWJlbDogJ1Byb3BlcnR5ICYgRXZpZGVuY2UnLCBjaGFwdGVyczogWycyMTgtcHJvcGVydHktZ2VuZXJhbCcsICcyMTktZGVwYXJ0bWVudC1wcm9wZXJ0eSddIH0sXG4gIHsgaWQ6ICdjb3VydC1sZWdhbCcsIGxhYmVsOiAnQ291cnQgJiBMZWdhbCcsIGNoYXB0ZXJzOiBbJzIxMS1jb3VydC1hcHBlYXJhbmNlcyddIH0sXG4gIHsgaWQ6ICd1c2Utb2YtZm9yY2UnLCBsYWJlbDogJ1VzZSBvZiBGb3JjZScsIGNoYXB0ZXJzOiBbJzIyMS10YWN0aWNhbC1vcGVyYXRpb25zJ10gfSxcbiAgeyBpZDogJ2p1dmVuaWxlJywgbGFiZWw6ICdKdXZlbmlsZSBQcm9jZWR1cmVzJywgY2hhcHRlcnM6IFsnMjE1LWp1dmVuaWxlLW1hdHRlcnMnXSB9LFxuICB7IGlkOiAncGVyc29ubmVsLWxlYXZlJywgbGFiZWw6ICdQZXJzb25uZWwgJiBMZWF2ZScsIGNoYXB0ZXJzOiBbJzMxOS1jaXZpbGlhbi1wZXJzb25uZWwnLCAnMzI0LWxlYXZlLXBheXJvbGwtdGltZWtlZXBpbmcnLCAnMzI5LWNhcmVlci1kZXZlbG9wbWVudCddIH0sXG4gIHsgaWQ6ICdlcXVpcG1lbnQtdW5pZm9ybXMnLCBsYWJlbDogJ0VxdWlwbWVudCAmIFVuaWZvcm1zJywgY2hhcHRlcnM6IFsnMzA1LXVuaWZvcm1zLWVxdWlwbWVudCddIH0sXG4gIHsgaWQ6ICdjb21tYW5kLW9wcycsIGxhYmVsOiAnQ29tbWFuZCBPcGVyYXRpb25zJywgY2hhcHRlcnM6IFsnMjEyLWNvbW1hbmQtb3BlcmF0aW9ucycsICcyMjAtY2l0eXdpZGUtaW5jaWRlbnQtbWdtdCddIH0sXG4gIHsgaWQ6ICdxb2wtZW5mb3JjZW1lbnQnLCBsYWJlbDogJ1F1YWxpdHkgb2YgTGlmZScsIGNoYXB0ZXJzOiBbJzIxNC1xdWFsaXR5LW9mLWxpZmUnXSB9LFxuICB7IGlkOiAnbW9iaWxpemF0aW9uJywgbGFiZWw6ICdNb2JpbGl6YXRpb24gJiBFbWVyZ2VuY3knLCBjaGFwdGVyczogWycyMTMtbW9iaWxpemF0aW9uLWVtZXJnZW5jeSddIH0sXG4gIHsgaWQ6ICdkaXNjaXBsaW5hcnknLCBsYWJlbDogJ0Rpc2NpcGxpbmFyeSBNYXR0ZXJzJywgY2hhcHRlcnM6IFsnMzE4LWRpc2NpcGxpbmFyeS1tYXR0ZXJzJywgJzMzMi1lbXBsb3llZS1yaWdodHMnXSB9LFxuICB7IGlkOiAnY29tcGxhaW50cycsIGxhYmVsOiAnQ29tcGxhaW50cyAmIEludmVzdGlnYXRpb25zJywgY2hhcHRlcnM6IFsnMjA3LWNvbXBsYWludHMnXSB9LFxuICB7IGlkOiAnbWVkaWNhbC13ZWxsbmVzcycsIGxhYmVsOiAnTWVkaWNhbCAmIFdlbGxuZXNzJywgY2hhcHRlcnM6IFsnMzMwLW1lZGljYWwtaGVhbHRoLXdlbGxuZXNzJ10gfSxcbiAgeyBpZDogJ2dlbmVyYWwtcmVndWxhdGlvbnMnLCBsYWJlbDogJ0dlbmVyYWwgUmVndWxhdGlvbnMnLCBjaGFwdGVyczogWyczMDQtZ2VuZXJhbC1yZWd1bGF0aW9ucyddIH0sXG5dO1xuXG4vLyDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcbi8vIEhlbHBlciBGdW5jdGlvbnNcbi8vIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxuXG5mdW5jdGlvbiByZWFkRmlsZShmaWxlUGF0aDogc3RyaW5nKTogc3RyaW5nIHwgbnVsbCB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGZzLnJlYWRGaWxlU3luYyhmaWxlUGF0aCwgJ3V0ZjgnKTtcbiAgfSBjYXRjaCB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cblxuLy8g4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXG4vLyBDaGFwdGVyIEJ1aWxkZXJcbi8vIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxuXG5mdW5jdGlvbiBidWlsZENoYXB0ZXIoY2hhcHRlcklkOiBzdHJpbmcsIGNoYXB0ZXJzRGlyOiBzdHJpbmcpOiBDaGFwdGVyIHwgbnVsbCB7XG4gIGNvbnN0IGRpciA9IHBhdGguam9pbihjaGFwdGVyc0RpciwgY2hhcHRlcklkKTtcbiAgaWYgKCFmcy5leGlzdHNTeW5jKGRpcikpIHtcbiAgICBjb25zb2xlLndhcm4oYFdhcm5pbmc6IENoYXB0ZXIgZGlyZWN0b3J5IG5vdCBmb3VuZDogJHtkaXJ9YCk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBjb25zdCByZWFkbWUgPSBjbGVhblJlYWRtZShyZWFkRmlsZShwYXRoLmpvaW4oZGlyLCAnUkVBRE1FLm1kJykpIHx8ICcnKTtcbiAgY29uc3Qga2V5VGVybXMgPSByZWFkRmlsZShwYXRoLmpvaW4oZGlyLCAna2V5LXRlcm1zLm1kJykpIHx8ICcnO1xuICBjb25zdCByZXZpZXdSYXcgPSByZWFkRmlsZShwYXRoLmpvaW4oZGlyLCAncmV2aWV3LXF1ZXN0aW9ucy5tZCcpKSB8fCAnJztcblxuICAvLyBSZWFkIHNlY3Rpb24gZmlsZXNcbiAgY29uc3Qgc2VjdGlvbkZpbGVzID0gZnNcbiAgICAucmVhZGRpclN5bmMoZGlyKVxuICAgIC5maWx0ZXIoKGYpID0+IGYuc3RhcnRzV2l0aCgnc2VjdGlvbi0nKSAmJiBmLmVuZHNXaXRoKCcubWQnKSlcbiAgICAuc29ydCgpO1xuXG4gIGNvbnN0IHNlY3Rpb25zOiBTZWN0aW9uW10gPSBzZWN0aW9uRmlsZXMubWFwKChmKSA9PlxuICAgIHBhcnNlU2VjdGlvbkZpbGUoZiwgZnMucmVhZEZpbGVTeW5jKHBhdGguam9pbihkaXIsIGYpLCAndXRmOCcpKVxuICApO1xuXG4gIC8vIEV4dHJhY3QgU2VyZ2VhbnQgRm9jdXMgY2FsbG91dHMgZnJvbSBhbGwgc2VjdGlvbnNcbiAgY29uc3Qgc2VyZ2VhbnRGb2N1czogU2VyZ2VhbnRGb2N1c1tdID0gW107XG4gIGZvciAoY29uc3Qgc2VjdGlvbiBvZiBzZWN0aW9ucykge1xuICAgIGNvbnN0IGV4dHJhY3RlZCA9IGV4dHJhY3RTZXJnZWFudEZvY3VzKHNlY3Rpb24uY29udGVudCwgc2VjdGlvbi5maWxlbmFtZSk7XG4gICAgc2VyZ2VhbnRGb2N1cy5wdXNoKC4uLmV4dHJhY3RlZCk7XG4gIH1cblxuICAvLyBFeHRyYWN0IHRpdGxlIGZyb20gUkVBRE1FXG4gIGNvbnN0IHRpdGxlTWF0Y2ggPSByZWFkbWUubWF0Y2goL14jXFxzKy4qP+KAlFxccysoLiopL20pO1xuICBjb25zdCBzZWN0aW9uTnVtID0gY2hhcHRlcklkLnNwbGl0KCctJylbMF07XG5cbiAgY29uc3QgY2hhcHRlcjogQ2hhcHRlciA9IHtcbiAgICBpZDogY2hhcHRlcklkIGFzIGAke3N0cmluZ30tJHtzdHJpbmd9YCxcbiAgICBzZWN0aW9uTnVtLFxuICAgIHRpdGxlOiB0aXRsZU1hdGNoID8gdGl0bGVNYXRjaFsxXS50cmltKCkgOiBjaGFwdGVySWQsXG4gICAgcmVhZG1lLFxuICAgIHNlY3Rpb25zLFxuICAgIGtleVRlcm1zLFxuICAgIHJldmlld1F1ZXN0aW9uczogcmV2aWV3UmF3LFxuICAgIHF1ZXN0aW9uczogcGFyc2VSZXZpZXdRdWVzdGlvbnMocmV2aWV3UmF3KSxcbiAgICBzZXJnZWFudEZvY3VzLFxuICB9O1xuXG4gIHJldHVybiBjaGFwdGVyO1xufVxuXG4vLyDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcbi8vIE1haW4gQnVpbGQgRnVuY3Rpb25cbi8vIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxuXG5leHBvcnQgaW50ZXJmYWNlIEJ1aWxkT3B0aW9ucyB7XG4gIHByb2plY3RSb290OiBzdHJpbmc7XG4gIG91dHB1dERpcjogc3RyaW5nO1xuICBmb3JtYXQ/OiAnanNvbicgfCAnanMnO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYnVpbGQob3B0aW9uczogQnVpbGRPcHRpb25zKTogU3R1ZHlEYXRhIHtcbiAgY29uc3QgeyBwcm9qZWN0Um9vdCwgb3V0cHV0RGlyLCBmb3JtYXQgPSAnanNvbicgfSA9IG9wdGlvbnM7XG5cbiAgY29uc3QgY2hhcHRlcnNEaXIgPSBwYXRoLmpvaW4ocHJvamVjdFJvb3QsICdjaGFwdGVycycpO1xuICBjb25zdCBhc3NldHNEaXIgPSBwYXRoLmpvaW4ocHJvamVjdFJvb3QsICdhc3NldHMnKTtcblxuICBjb25zb2xlLmxvZygnQnVpbGRpbmcgc3R1ZHkgZ3VpZGUuLi4nKTtcbiAgY29uc29sZS5sb2coYCAgQ2hhcHRlcnMgZGlyZWN0b3J5OiAke2NoYXB0ZXJzRGlyfWApO1xuICBjb25zb2xlLmxvZyhgICBPdXRwdXQgZGlyZWN0b3J5OiAke291dHB1dERpcn1gKTtcblxuICAvLyBCdWlsZCBhbGwgY2hhcHRlcnNcbiAgY29uc3QgY2hhcHRlcnM6IENoYXB0ZXJbXSA9IFtdO1xuICBmb3IgKGNvbnN0IGNoYXB0ZXJJZCBvZiBDSEFQVEVSX09SREVSKSB7XG4gICAgY29uc3QgY2hhcHRlciA9IGJ1aWxkQ2hhcHRlcihjaGFwdGVySWQsIGNoYXB0ZXJzRGlyKTtcbiAgICBpZiAoY2hhcHRlcikge1xuICAgICAgY2hhcHRlcnMucHVzaChjaGFwdGVyKTtcbiAgICB9XG4gIH1cblxuICAvLyBMb2FkIHN0YXRpYyBhc3NldHNcbiAgY29uc3QgY2hlYXRTaGVldCA9IHJlYWRGaWxlKHBhdGguam9pbihhc3NldHNEaXIsICdxdWljay1yZWZlcmVuY2UtY2hlYXQtc2hlZXQubWQnKSkgfHwgJyc7XG4gIGNvbnN0IGV4YW1SYXcgPSByZWFkRmlsZShwYXRoLmpvaW4oYXNzZXRzRGlyLCAnbWFzdGVyLXByYWN0aWNlLWV4YW0ubWQnKSkgfHwgJyc7XG4gIGNvbnN0IGV4YW1RdWVzdGlvbnMgPSBwYXJzZVByYWN0aWNlRXhhbShleGFtUmF3KTtcblxuICAvLyBCdWlsZCBzdHVkeSBkYXRhXG4gIGNvbnN0IHN0dWR5RGF0YTogU3R1ZHlEYXRhID0ge1xuICAgIGNoYXB0ZXJzLFxuICAgIGNoZWF0U2hlZXQsXG4gICAgZXhhbVF1ZXN0aW9ucyxcbiAgICB0b3RhbFF1ZXN0aW9uczogY2hhcHRlcnMucmVkdWNlKChzdW0sIGMpID0+IHN1bSArIGMucXVlc3Rpb25zLmxlbmd0aCwgMCksXG4gICAgc2VyZ2VhbnRDYXRlZ29yaWVzOiBTRVJHRUFOVF9DQVRFR09SSUVTLFxuICAgIHZlcnNpb246IERBVEFfVkVSU0lPTixcbiAgfTtcblxuICAvLyBWYWxpZGF0ZSBhZ2FpbnN0IHNjaGVtYVxuICB0cnkge1xuICAgIFN0dWR5RGF0YVNjaGVtYS5wYXJzZShzdHVkeURhdGEpO1xuICAgIGNvbnNvbGUubG9nKCcgIOKckyBEYXRhIHZhbGlkYXRpb24gcGFzc2VkJyk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcignICDinJcgRGF0YSB2YWxpZGF0aW9uIGZhaWxlZDonLCBlcnJvcik7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdHZW5lcmF0ZWQgZGF0YSBmYWlsZWQgc2NoZW1hIHZhbGlkYXRpb24nKTtcbiAgfVxuXG4gIC8vIENyZWF0ZSBvdXRwdXQgZGlyZWN0b3J5IGlmIG5lZWRlZFxuICBmcy5ta2RpclN5bmMob3V0cHV0RGlyLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcblxuICAvLyBXcml0ZSBvdXRwdXRcbiAgY29uc3Qgb3V0cHV0UGF0aCA9IHBhdGguam9pbihvdXRwdXREaXIsICdkYXRhLmpzb24nKTtcbiAgZnMud3JpdGVGaWxlU3luYyhvdXRwdXRQYXRoLCBKU09OLnN0cmluZ2lmeShzdHVkeURhdGEsIG51bGwsIDIpKTtcbiAgY29uc29sZS5sb2coYCAg4pyTIFdyb3RlICR7b3V0cHV0UGF0aH1gKTtcblxuICAvLyBBbHNvIHdyaXRlIEpTIGZvcm1hdCBmb3Igd2ViIGNvbXBhdGliaWxpdHlcbiAgaWYgKGZvcm1hdCA9PT0gJ2pzJykge1xuICAgIGNvbnN0IGpzUGF0aCA9IHBhdGguam9pbihvdXRwdXREaXIsICdkYXRhLmpzJyk7XG4gICAgY29uc3QganNDb250ZW50ID0gYHdpbmRvdy5TVFVEWV9EQVRBID0gJHtKU09OLnN0cmluZ2lmeShzdHVkeURhdGEpfTtcXG53aW5kb3cuU0VSR0VBTlRfQ0FURUdPUklFUyA9ICR7SlNPTi5zdHJpbmdpZnkoU0VSR0VBTlRfQ0FURUdPUklFUyl9O2A7XG4gICAgZnMud3JpdGVGaWxlU3luYyhqc1BhdGgsIGpzQ29udGVudCk7XG4gICAgY29uc29sZS5sb2coYCAg4pyTIFdyb3RlICR7anNQYXRofWApO1xuICB9XG5cbiAgLy8gUHJpbnQgc3VtbWFyeVxuICBjb25zdCB0b3RhbFNlcmdlYW50Rm9jdXMgPSBjaGFwdGVycy5yZWR1Y2UoKHN1bSwgYykgPT4gc3VtICsgYy5zZXJnZWFudEZvY3VzLmxlbmd0aCwgMCk7XG4gIGNvbnNvbGUubG9nKCdcXG5CdWlsZCBTdW1tYXJ5OicpO1xuICBjb25zb2xlLmxvZyhgICBDaGFwdGVyczogJHtjaGFwdGVycy5sZW5ndGh9YCk7XG4gIGNvbnNvbGUubG9nKGAgIFRvdGFsIHF1ZXN0aW9uczogJHtzdHVkeURhdGEudG90YWxRdWVzdGlvbnN9YCk7XG4gIGNvbnNvbGUubG9nKGAgIEV4YW0gcXVlc3Rpb25zOiAke2V4YW1RdWVzdGlvbnMubGVuZ3RofWApO1xuICBjb25zb2xlLmxvZyhgICBTZXJnZWFudCBGb2N1cyBjYWxsb3V0czogJHt0b3RhbFNlcmdlYW50Rm9jdXN9YCk7XG5cbiAgaWYgKGNoYXB0ZXJzLmxlbmd0aCA8IENIQVBURVJfT1JERVIubGVuZ3RoKSB7XG4gICAgY29uc3QgYnVpbHQgPSBuZXcgU2V0KGNoYXB0ZXJzLm1hcCgoYykgPT4gYy5pZCkpO1xuICAgIGNvbnN0IG1pc3NpbmcgPSBDSEFQVEVSX09SREVSLmZpbHRlcigoaWQpID0+ICFidWlsdC5oYXMoaWQpKTtcbiAgICBjb25zb2xlLndhcm4oYFxcbiAg4pqgIFdhcm5pbmc6IEV4cGVjdGVkICR7Q0hBUFRFUl9PUkRFUi5sZW5ndGh9IGNoYXB0ZXJzIGJ1dCBidWlsdCAke2NoYXB0ZXJzLmxlbmd0aH1gKTtcbiAgICBjb25zb2xlLndhcm4oYCAgTWlzc2luZzogJHttaXNzaW5nLmpvaW4oJywgJyl9YCk7XG4gIH1cblxuICByZXR1cm4gc3R1ZHlEYXRhO1xufVxuXG4vLyDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcbi8vIENMSSBFbnRyeSBQb2ludFxuLy8g4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXG5cbmlmIChyZXF1aXJlLm1haW4gPT09IG1vZHVsZSkge1xuICAvLyBfX2Rpcm5hbWUgaXMgcGFja2FnZXMvY29yZS9kaXN0LCBzbyBnbyB1cCAyIGxldmVscyB0byByZWFjaCBwYWNrYWdlcy9jb3JlLCB0aGVuIHVzZSBwYXJlbnQgYXMgcHJvamVjdCByb290XG4gIGNvbnN0IHBhY2thZ2VEaXIgPSBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi4vLi4nKTsgLy8gcGFja2FnZXMvY29yZVxuICBjb25zdCBwcm9qZWN0Um9vdCA9IHByb2Nlc3MuYXJndlsyXSB8fCBwYXRoLnJlc29sdmUocGFja2FnZURpciwgJy4uJyk7IC8vIHBhcmVudCBvZiBwYWNrYWdlcy9jb3JlXG4gIGNvbnN0IG91dHB1dERpciA9IHByb2Nlc3MuYXJndlszXSB8fCBwYXRoLmpvaW4ocHJvamVjdFJvb3QsICdidWlsZCcpO1xuXG4gIGJ1aWxkKHtcbiAgICBwcm9qZWN0Um9vdCxcbiAgICBvdXRwdXREaXIsXG4gICAgZm9ybWF0OiAnanMnLCAvLyBEZWZhdWx0IHRvIEpTIGZvciB3ZWIgY29tcGF0aWJpbGl0eVxuICB9KTtcbn1cbiJdfQ==