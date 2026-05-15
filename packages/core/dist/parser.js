"use strict";
/**
 * Markdown parser for study guide content
 * Handles review questions, exam questions, callouts, and section parsing
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseReviewQuestions = parseReviewQuestions;
exports.parsePracticeExam = parsePracticeExam;
exports.extractSergeantFocus = extractSergeantFocus;
exports.cleanReadme = cleanReadme;
exports.parseSectionFile = parseSectionFile;
function parseReviewQuestions(md) {
    if (!md)
        return [];
    const questions = [];
    // Split by --- or ## Question or ### Question boundaries
    const blocks = md.split(/\n---\n|\n(?=##?#?\s+Q(?:uestion\s+)?\d)/).filter((b) => b.trim());
    for (const block of blocks) {
        if (!block.includes('<details>'))
            continue;
        // Extract question number and text from any format:
        // A: ### Question N / ## Question N  (with or without bold text)
        // B: **N. text**
        // C: **N.** text
        const fmtA = block.match(/##?#?\s+(?:Question\s+)?(\d+)\s*\n+(?:\*\*)?([\s\S]*?)(?:\*\*)?\s*?\n([\s\S]*?)<details>/);
        const fmtB = block.match(/\*\*(\d+)\.\s+([\s\S]*?)\*\*\s*\n([\s\S]*?)<details>/);
        const fmtC = block.match(/\*\*(\d+)\.\*\*\s+([\s\S]*?)\n([\s\S]*?)<details>/);
        const fmt = fmtA || fmtB || fmtC;
        if (!fmt)
            continue;
        const num = parseInt(fmt[1], 10);
        const text = fmt[2].replace(/\*\*/g, '').trim();
        const optionsBlock = fmt[3];
        // Extract answer block
        const ansBlock = block.match(/<details>[\s\S]*?<summary>Answer<\/summary>\s*\n([\s\S]*?)<\/details>/);
        if (!ansBlock)
            continue;
        const answerBlock = ansBlock[1].trim();
        // Parse options from any format: "- A) text", "A) text", "A. text", "- A. text"
        const options = [];
        const optRe = /^[\s-]*([A-D])[.)]\s*(.+)/gm;
        let om;
        while ((om = optRe.exec(optionsBlock)) !== null) {
            options.push(`${om[1]}) ${om[2].trim()}`);
        }
        // Parse answer letter: **B)**, **B.**, **Correct Answer: B)**, **B) text**
        const ansM = answerBlock.match(/\*\*(?:Correct Answer:\s*)?([A-D])[.)]/);
        const answer = ansM ? ansM[1] : '';
        const explanation = answerBlock
            .replace(/\*\*(?:Correct Answer:\s*)?[A-D][.)][^*]*\*\*\s*\n?/g, '')
            .replace(/\*\*Reference:.*?\*\*/g, '')
            .trim();
        // For open-ended questions (no options), store as free-response
        const isMultipleChoice = options.length > 0;
        questions.push({
            number: num,
            text,
            options,
            answer,
            answerFull: answer ? `${answer}) ${explanation.split('\n')[0]}` : '',
            explanation,
            type: isMultipleChoice ? 'mc' : 'open',
        });
    }
    return questions;
}
// ─────────────────────────────────────────────
// Practice Exam Parser
// ─────────────────────────────────────────────
function parsePracticeExam(md) {
    if (!md)
        return [];
    const answerMap = new Map();
    // Try 4-column format first: | N | A | source | explanation |
    const keyRe = /\|\s*(\d+)\s*\|\s*([A-D])\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|/g;
    let km;
    while ((km = keyRe.exec(md)) !== null) {
        answerMap.set(parseInt(km[1], 10), {
            answer: km[2],
            source: km[3].trim(),
            explanation: km[4].trim(),
        });
    }
    // Fallback: 3-column table (no explanation)
    if (answerMap.size === 0) {
        const keyRe3 = /\|\s*(\d+)\s*\|\s*([A-D])\s*\|\s*(.*?)\s*\|/g;
        while ((km = keyRe3.exec(md)) !== null) {
            answerMap.set(parseInt(km[1], 10), {
                answer: km[2],
                source: km[3].trim(),
                explanation: '',
            });
        }
    }
    const questions = [];
    const qBlocks = md.split(/\n---\n/);
    for (const block of qBlocks) {
        const qm = block.match(/\*\*(\d+)\.\s+([\s\S]*?)\*\*\s*\n([\s\S]*)/);
        if (!qm)
            continue;
        const num = parseInt(qm[1], 10);
        const options = [];
        const optRe = /- ([A-D]\).+)/g;
        let om;
        while ((om = optRe.exec(qm[3])) !== null) {
            options.push(om[1]);
        }
        if (options.length === 0)
            continue;
        const info = answerMap.get(num) || { answer: '', source: '', explanation: '' };
        questions.push({
            number: num,
            text: qm[2].trim(),
            options,
            answer: info.answer || '',
            source: info.source || '',
            explanation: info.explanation || '',
        });
    }
    return questions;
}
// ─────────────────────────────────────────────
// Sergeant Focus Callout Extractor
// ─────────────────────────────────────────────
function extractSergeantFocus(content, filename) {
    const callouts = [];
    // Match blockquote callouts: > **Sergeant Focus:** text
    const matches = content.match(/^>\s+\*\*Sergeant Focus:\*\*\s*(.+)/gm) || [];
    for (const match of matches) {
        const text = match.replace(/^>\s+\*\*Sergeant Focus:\*\*\s*/, '').trim();
        if (text.length >= 20) {
            callouts.push({
                filename,
                text,
            });
        }
    }
    return callouts;
}
// ─────────────────────────────────────────────
// README Cleaner
// ─────────────────────────────────────────────
function cleanReadme(md) {
    return md
        .replace(/## Study Files\n[\s\S]*?(?=\n## )/g, '')
        .replace(/## Study Guide Files\n[\s\S]*?(?=\n## )/g, '')
        .replace(/## Chapter Contents\n[\s\S]*?(?=\n## |\n---|\n$)/g, '')
        .replace(/## Study Tips\n[\s\S]*?(?=\n## )/g, '')
        .replace(/## Study Content\n[\s\S]*?(?=\n## )/g, '')
        .replace(/\[([^\]]+)\]\([^)]*\.md\)/g, '$1')
        .replace(/`?section-[\w-]+\.md`?/g, '')
        .replace(/`?key-terms\.md`?/g, '')
        .replace(/`?review-questions\.md`?/g, '')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}
// ─────────────────────────────────────────────
// Section File Parser
// ─────────────────────────────────────────────
function parseSectionFile(filename, content) {
    return {
        filename,
        content,
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3BhcnNlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7OztHQUdHOztBQW9CSCxvREE4REM7QUFNRCw4Q0EwREM7QUFNRCxvREFpQkM7QUFNRCxrQ0FhQztBQU1ELDRDQUtDO0FBbkxELFNBQWdCLG9CQUFvQixDQUFDLEVBQVU7SUFDN0MsSUFBSSxDQUFDLEVBQUU7UUFBRSxPQUFPLEVBQUUsQ0FBQztJQUVuQixNQUFNLFNBQVMsR0FBZSxFQUFFLENBQUM7SUFFakMseURBQXlEO0lBQ3pELE1BQU0sTUFBTSxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUMsMENBQTBDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO0lBRTVGLEtBQUssTUFBTSxLQUFLLElBQUksTUFBTSxFQUFFLENBQUM7UUFDM0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDO1lBQUUsU0FBUztRQUUzQyxvREFBb0Q7UUFDcEQsaUVBQWlFO1FBQ2pFLGlCQUFpQjtRQUNqQixpQkFBaUI7UUFDakIsTUFBTSxJQUFJLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQywwRkFBMEYsQ0FBQyxDQUFDO1FBQ3JILE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsc0RBQXNELENBQUMsQ0FBQztRQUNqRixNQUFNLElBQUksR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLG1EQUFtRCxDQUFDLENBQUM7UUFFOUUsTUFBTSxHQUFHLEdBQUcsSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLENBQUM7UUFDakMsSUFBSSxDQUFDLEdBQUc7WUFBRSxTQUFTO1FBRW5CLE1BQU0sR0FBRyxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDakMsTUFBTSxJ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Q0FBQyxDQUFDO1FBQ0wsQ0FBQztJQUNILENBQUM7SUFFRCxPQUFPLFFBQVEsQ0FBQztBQUNsQixDQUFDO0FBRUQsZ0RBQWdEO0FBQ2hELGlCQUFpQjtBQUNqQixnREFBZ0Q7QUFFaEQsU0FBZ0IsV0FBVyxDQUFDLEVBQVU7SUFDcEMsT0FBTyxFQUFFO1NBQ04sT0FBTyxDQUFDLG9DQUFvQyxFQUFFLEVBQUUsQ0FBQztTQUNqRCxPQUFPLENBQUMsMENBQTBDLEVBQUUsRUFBRSxDQUFDO1NBQ3ZELE9BQU8sQ0FBQyxtREFBbUQsRUFBRSxFQUFFLENBQUM7U0FDaEUsT0FBTyxDQUFDLG1DQUFtQyxFQUFFLEVBQUUsQ0FBQztTQUNoRCxPQUFPLENBQUMsc0NBQXNDLEVBQUUsRUFBRSxDQUFDO1NBQ25ELE9BQU8sQ0FBQyw0QkFBNEIsRUFBRSxJQUFJLENBQUM7U0FDM0MsT0FBTyxDQUFDLHlCQUF5QixFQUFFLEVBQUUsQ0FBQztTQUN0QyxPQUFPLENBQUMsb0JBQW9CLEVBQUUsRUFBRSxDQUFDO1NBQ2pDLE9BQU8sQ0FBQywyQkFBMkIsRUFBRSxFQUFFLENBQUM7U0FDeEMsT0FBTyxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUM7U0FDMUIsSUFBSSxFQUFFLENBQUM7QUFDWixDQUFDO0FBRUQsZ0RBQWdEO0FBQ2hELHNCQUFzQjtBQUN0QixnREFBZ0Q7QUFFaEQsU0FBZ0IsZ0JBQWdCLENBQUMsUUFBZ0IsRUFBRSxPQUFlO0lBQ2hFLE9BQU87UUFDTCxRQUFRO1FBQ1IsT0FBTztLQUNSLENBQUM7QUFDSixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBNYXJrZG93biBwYXJzZXIgZm9yIHN0dWR5IGd1aWRlIGNvbnRlbnRcbiAqIEhhbmRsZXMgcmV2aWV3IHF1ZXN0aW9ucywgZXhhbSBxdWVzdGlvbnMsIGNhbGxvdXRzLCBhbmQgc2VjdGlvbiBwYXJzaW5nXG4gKi9cblxuaW1wb3J0IHtcbiAgUXVlc3Rpb24sXG4gIEV4YW1RdWVzdGlvbixcbiAgU2VjdGlvbixcbiAgU2VyZ2VhbnRGb2N1cyxcbn0gZnJvbSAnLi90eXBlcyc7XG5cbi8vIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxuLy8gUmV2aWV3IFF1ZXN0aW9uIFBhcnNlclxuLy8g4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXG5cbmludGVyZmFjZSBQYXJzZWRRdWVzdGlvbiB7XG4gIG51bWJlcjogbnVtYmVyO1xuICB0ZXh0OiBzdHJpbmc7XG4gIG9wdGlvbnNCbG9jazogc3RyaW5nO1xuICBhbnN3ZXJCbG9jazogc3RyaW5nO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VSZXZpZXdRdWVzdGlvbnMobWQ6IHN0cmluZyk6IFF1ZXN0aW9uW10ge1xuICBpZiAoIW1kKSByZXR1cm4gW107XG5cbiAgY29uc3QgcXVlc3Rpb25zOiBRdWVzdGlvbltdID0gW107XG5cbiAgLy8gU3BsaXQgYnkgLS0tIG9yICMjIFF1ZXN0aW9uIG9yICMjIyBRdWVzdGlvbiBib3VuZGFyaWVzXG4gIGNvbnN0IGJsb2NrcyA9IG1kLnNwbGl0KC9cXG4tLS1cXG58XFxuKD89IyM/Iz9cXHMrUSg/OnVlc3Rpb25cXHMrKT9cXGQpLykuZmlsdGVyKChiKSA9PiBiLnRyaW0oKSk7XG5cbiAgZm9yIChjb25zdCBibG9jayBvZiBibG9ja3MpIHtcbiAgICBpZiAoIWJsb2NrLmluY2x1ZGVzKCc8ZGV0YWlscz4nKSkgY29udGludWU7XG5cbiAgICAvLyBFeHRyYWN0IHF1ZXN0aW9uIG51bWJlciBhbmQgdGV4dCBmcm9tIGFueSBmb3JtYXQ6XG4gICAgLy8gQTogIyMjIFF1ZXN0aW9uIE4gLyAjIyBRdWVzdGlvbiBOICAod2l0aCBvciB3aXRob3V0IGJvbGQgdGV4dClcbiAgICAvLyBCOiAqKk4uIHRleHQqKlxuICAgIC8vIEM6ICoqTi4qKiB0ZXh0XG4gICAgY29uc3QgZm10QSA9IGJsb2NrLm1hdGNoKC8jIz8jP1xccysoPzpRdWVzdGlvblxccyspPyhcXGQrKVxccypcXG4rKD86XFwqXFwqKT8oW1xcc1xcU10qPykoPzpcXCpcXCopP1xccyo/XFxuKFtcXHNcXFNdKj8pPGRldGFpbHM+Lyk7XG4gICAgY29uc3QgZm10QiA9IGJsb2NrLm1hdGNoKC9cXCpcXCooXFxkKylcXC5cXHMrKFtcXHNcXFNdKj8pXFwqXFwqXFxzKlxcbihbXFxzXFxTXSo/KTxkZXRhaWxzPi8pO1xuICAgIGNvbnN0IGZtdEMgPSBibG9jay5tYXRjaCgvXFwqXFwqKFxcZCspXFwuXFwqXFwqXFxzKyhbXFxzXFxTXSo/KVxcbihbXFxzXFxTXSo/KTxkZXRhaWxzPi8pO1xuXG4gICAgY29uc3QgZm10ID0gZm10QSB8fCBmbXRCIHx8IGZtdEM7XG4gICAgaWYgKCFmbXQpIGNvbnRpbnVlO1xuXG4gICAgY29uc3QgbnVtID0gcGFyc2VJbnQoZm10WzFdLCAxMCk7XG4gICAgY29uc3QgdGV4dCA9IGZtdFsyXS5yZXBsYWNlKC9cXCpcXCovZywgJycpLnRyaW0oKTtcbiAgICBjb25zdCBvcHRpb25zQmxvY2sgPSBmbXRbM107XG5cbiAgICAvLyBFeHRyYWN0IGFuc3dlciBibG9ja1xuICAgIGNvbnN0IGFuc0Jsb2NrID0gYmxvY2subWF0Y2goLzxkZXRhaWxzPltcXHNcXFNdKj88c3VtbWFyeT5BbnN3ZXI8XFwvc3VtbWFyeT5cXHMqXFxuKFtcXHNcXFNdKj8pPFxcL2RldGFpbHM+Lyk7XG4gICAgaWYgKCFhbnNCbG9jaykgY29udGludWU7XG4gICAgY29uc3QgYW5zd2VyQmxvY2sgPSBhbnNCbG9ja1sxXS50cmltKCk7XG5cbiAgICAvLyBQYXJzZSBvcHRpb25zIGZyb20gYW55IGZvcm1hdDogXCItIEEpIHRleHRcIiwgXCJBKSB0ZXh0XCIsIFwiQS4gdGV4dFwiLCBcIi0gQS4gdGV4dFwiXG4gICAgY29uc3Qgb3B0aW9uczogc3RyaW5nW10gPSBbXTtcbiAgICBjb25zdCBvcHRSZSA9IC9eW1xccy1dKihbQS1EXSlbLildXFxzKiguKykvZ207XG4gICAgbGV0IG9tOiBSZWdFeHBFeGVjQXJyYXkgfCBudWxsO1xuICAgIHdoaWxlICgob20gPSBvcHRSZS5leGVjKG9wdGlvbnNCbG9jaykpICE9PSBudWxsKSB7XG4gICAgICBvcHRpb25zLnB1c2goYCR7b21bMV19KSAke29tWzJdLnRyaW0oKX1gKTtcbiAgICB9XG5cbiAgICAvLyBQYXJzZSBhbnN3ZXIgbGV0dGVyOiAqKkIpKiosICoqQi4qKiwgKipDb3JyZWN0IEFuc3dlcjogQikqKiwgKipCKSB0ZXh0KipcbiAgICBjb25zdCBhbnNNID0gYW5zd2VyQmxvY2subWF0Y2goL1xcKlxcKig/OkNvcnJlY3QgQW5zd2VyOlxccyopPyhbQS1EXSlbLildLyk7XG4gICAgY29uc3QgYW5zd2VyID0gYW5zTSA/IGFuc01bMV0gOiAnJztcbiAgICBjb25zdCBleHBsYW5hdGlvbiA9IGFuc3dlckJsb2NrXG4gICAgICAucmVwbGFjZSgvXFwqXFwqKD86Q29ycmVjdCBBbnN3ZXI6XFxzKik/W0EtRF1bLildW14qXSpcXCpcXCpcXHMqXFxuPy9nLCAnJylcbiAgICAgIC5yZXBsYWNlKC9cXCpcXCpSZWZlcmVuY2U6Lio/XFwqXFwqL2csICcnKVxuICAgICAgLnRyaW0oKTtcblxuICAgIC8vIEZvciBvcGVuLWVuZGVkIHF1ZXN0aW9ucyAobm8gb3B0aW9ucyksIHN0b3JlIGFzIGZyZWUtcmVzcG9uc2VcbiAgICBjb25zdCBpc011bHRpcGxlQ2hvaWNlID0gb3B0aW9ucy5sZW5ndGggPiAwO1xuXG4gICAgcXVlc3Rpb25zLnB1c2goe1xuICAgICAgbnVtYmVyOiBudW0sXG4gICAgICB0ZXh0LFxuICAgICAgb3B0aW9ucyxcbiAgICAgIGFuc3dlcixcbiAgICAgIGFuc3dlckZ1bGw6IGFuc3dlciA/IGAke2Fuc3dlcn0pICR7ZXhwbGFuYXRpb24uc3BsaXQoJ1xcbicpWzBdfWAgOiAnJyxcbiAgICAgIGV4cGxhbmF0aW9uLFxuICAgICAgdHlwZTogaXNNdWx0aXBsZUNob2ljZSA/ICdtYycgOiAnb3BlbicsXG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4gcXVlc3Rpb25zO1xufVxuXG4vLyDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcbi8vIFByYWN0aWNlIEV4YW0gUGFyc2VyXG4vLyDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlUHJhY3RpY2VFeGFtKG1kOiBzdHJpbmcpOiBFeGFtUXVlc3Rpb25bXSB7XG4gIGlmICghbWQpIHJldHVybiBbXTtcblxuICBjb25zdCBhbnN3ZXJNYXAgPSBuZXcgTWFwPG51bWJlciwgeyBhbnN3ZXI6IHN0cmluZzsgc291cmNlOiBzdHJpbmc7IGV4cGxhbmF0aW9uOiBzdHJpbmcgfT4oKTtcblxuICAvLyBUcnkgNC1jb2x1bW4gZm9ybWF0IGZpcnN0OiB8IE4gfCBBIHwgc291cmNlIHwgZXhwbGFuYXRpb24gfFxuICBjb25zdCBrZXlSZSA9IC9cXHxcXHMqKFxcZCspXFxzKlxcfFxccyooW0EtRF0pXFxzKlxcfFxccyooLio/KVxccypcXHxcXHMqKC4qPylcXHMqXFx8L2c7XG4gIGxldCBrbTogUmVnRXhwRXhlY0FycmF5IHwgbnVsbDtcbiAgd2hpbGUgKChrbSA9IGtleVJlLmV4ZWMobWQpKSAhPT0gbnVsbCkge1xuICAgIGFuc3dlck1hcC5zZXQocGFyc2VJbnQoa21bMV0sIDEwKSwge1xuICAgICAgYW5zd2VyOiBrbVsyXSxcbiAgICAgIHNvdXJjZToga21bM10udHJpbSgpLFxuICAgICAgZXhwbGFuYXRpb246IGttWzRdLnRyaW0oKSxcbiAgICB9KTtcbiAgfVxuXG4gIC8vIEZhbGxiYWNrOiAzLWNvbHVtbiB0YWJsZSAobm8gZXhwbGFuYXRpb24pXG4gIGlmIChhbnN3ZXJNYXAuc2l6ZSA9PT0gMCkge1xuICAgIGNvbnN0IGtleVJlMyA9IC9cXHxcXHMqKFxcZCspXFxzKlxcfFxccyooW0EtRF0pXFxzKlxcfFxccyooLio/KVxccypcXHwvZztcbiAgICB3aGlsZSAoKGttID0ga2V5UmUzLmV4ZWMobWQpKSAhPT0gbnVsbCkge1xuICAgICAgYW5zd2VyTWFwLnNldChwYXJzZUludChrbVsxXSwgMTApLCB7XG4gICAgICAgIGFuc3dlcjoga21bMl0sXG4gICAgICAgIHNvdXJjZToga21bM10udHJpbSgpLFxuICAgICAgICBleHBsYW5hdGlvbjogJycsXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBjb25zdCBxdWVzdGlvbnM6IEV4YW1RdWVzdGlvbltdID0gW107XG4gIGNvbnN0IHFCbG9ja3MgPSBtZC5zcGxpdCgvXFxuLS0tXFxuLyk7XG5cbiAgZm9yIChjb25zdCBibG9jayBvZiBxQmxvY2tzKSB7XG4gICAgY29uc3QgcW0gPSBibG9jay5tYXRjaCgvXFwqXFwqKFxcZCspXFwuXFxzKyhbXFxzXFxTXSo/KVxcKlxcKlxccypcXG4oW1xcc1xcU10qKS8pO1xuICAgIGlmICghcW0pIGNvbnRpbnVlO1xuXG4gICAgY29uc3QgbnVtID0gcGFyc2VJbnQocW1bMV0sIDEwKTtcbiAgICBjb25zdCBvcHRpb25zOiBzdHJpbmdbXSA9IFtdO1xuICAgIGNvbnN0IG9wdFJlID0gLy0gKFtBLURdXFwpLispL2c7XG4gICAgbGV0IG9tOiBSZWdFeHBFeGVjQXJyYXkgfCBudWxsO1xuICAgIHdoaWxlICgob20gPSBvcHRSZS5leGVjKHFtWzNdKSkgIT09IG51bGwpIHtcbiAgICAgIG9wdGlvbnMucHVzaChvbVsxXSk7XG4gICAgfVxuXG4gICAgaWYgKG9wdGlvbnMubGVuZ3RoID09PSAwKSBjb250aW51ZTtcblxuICAgIGNvbnN0IGluZm8gPSBhbnN3ZXJNYXAuZ2V0KG51bSkgfHwgeyBhbnN3ZXI6ICcnLCBzb3VyY2U6ICcnLCBleHBsYW5hdGlvbjogJycgfTtcblxuICAgIHF1ZXN0aW9ucy5wdXNoKHtcbiAgICAgIG51bWJlcjogbnVtLFxuICAgICAgdGV4dDogcW1bMl0udHJpbSgpLFxuICAgICAgb3B0aW9ucyxcbiAgICAgIGFuc3dlcjogaW5mby5hbnN3ZXIgfHwgJycsXG4gICAgICBzb3VyY2U6IGluZm8uc291cmNlIHx8ICcnLFxuICAgICAgZXhwbGFuYXRpb246IGluZm8uZXhwbGFuYXRpb24gfHwgJycsXG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4gcXVlc3Rpb25zO1xufVxuXG4vLyDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcbi8vIFNlcmdlYW50IEZvY3VzIENhbGxvdXQgRXh0cmFjdG9yXG4vLyDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcblxuZXhwb3J0IGZ1bmN0aW9uIGV4dHJhY3RTZXJnZWFudEZvY3VzKGNvbnRlbnQ6IHN0cmluZywgZmlsZW5hbWU6IHN0cmluZyk6IFNlcmdlYW50Rm9jdXNbXSB7XG4gIGNvbnN0IGNhbGxvdXRzOiBTZXJnZWFudEZvY3VzW10gPSBbXTtcblxuICAvLyBNYXRjaCBibG9ja3F1b3RlIGNhbGxvdXRzOiA+ICoqU2VyZ2VhbnQgRm9jdXM6KiogdGV4dFxuICBjb25zdCBtYXRjaGVzID0gY29udGVudC5tYXRjaCgvXj5cXHMrXFwqXFwqU2VyZ2VhbnQgRm9jdXM6XFwqXFwqXFxzKiguKykvZ20pIHx8IFtdO1xuXG4gIGZvciAoY29uc3QgbWF0Y2ggb2YgbWF0Y2hlcykge1xuICAgIGNvbnN0IHRleHQgPSBtYXRjaC5yZXBsYWNlKC9ePlxccytcXCpcXCpTZXJnZWFudCBGb2N1czpcXCpcXCpcXHMqLywgJycpLnRyaW0oKTtcbiAgICBpZiAodGV4dC5sZW5ndGggPj0gMjApIHtcbiAgICAgIGNhbGxvdXRzLnB1c2goe1xuICAgICAgICBmaWxlbmFtZSxcbiAgICAgICAgdGV4dCxcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBjYWxsb3V0cztcbn1cblxuLy8g4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXG4vLyBSRUFETUUgQ2xlYW5lclxuLy8g4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXG5cbmV4cG9ydCBmdW5jdGlvbiBjbGVhblJlYWRtZShtZDogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIG1kXG4gICAgLnJlcGxhY2UoLyMjIFN0dWR5IEZpbGVzXFxuW1xcc1xcU10qPyg/PVxcbiMjICkvZywgJycpXG4gICAgLnJlcGxhY2UoLyMjIFN0dWR5IEd1aWRlIEZpbGVzXFxuW1xcc1xcU10qPyg/PVxcbiMjICkvZywgJycpXG4gICAgLnJlcGxhY2UoLyMjIENoYXB0ZXIgQ29udGVudHNcXG5bXFxzXFxTXSo/KD89XFxuIyMgfFxcbi0tLXxcXG4kKS9nLCAnJylcbiAgICAucmVwbGFjZSgvIyMgU3R1ZHkgVGlwc1xcbltcXHNcXFNdKj8oPz1cXG4jIyApL2csICcnKVxuICAgIC5yZXBsYWNlKC8jIyBTdHVkeSBDb250ZW50XFxuW1xcc1xcU10qPyg/PVxcbiMjICkvZywgJycpXG4gICAgLnJlcGxhY2UoL1xcWyhbXlxcXV0rKVxcXVxcKFteKV0qXFwubWRcXCkvZywgJyQxJylcbiAgICAucmVwbGFjZSgvYD9zZWN0aW9uLVtcXHctXStcXC5tZGA/L2csICcnKVxuICAgIC5yZXBsYWNlKC9gP2tleS10ZXJtc1xcLm1kYD8vZywgJycpXG4gICAgLnJlcGxhY2UoL2A/cmV2aWV3LXF1ZXN0aW9uc1xcLm1kYD8vZywgJycpXG4gICAgLnJlcGxhY2UoL1xcbnszLH0vZywgJ1xcblxcbicpXG4gICAgLnRyaW0oKTtcbn1cblxuLy8g4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXG4vLyBTZWN0aW9uIEZpbGUgUGFyc2VyXG4vLyDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlU2VjdGlvbkZpbGUoZmlsZW5hbWU6IHN0cmluZywgY29udGVudDogc3RyaW5nKTogU2VjdGlvbiB7XG4gIHJldHVybiB7XG4gICAgZmlsZW5hbWUsXG4gICAgY29udGVudCxcbiAgfTtcbn1cbiJdfQ==