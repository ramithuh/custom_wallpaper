import fs from 'fs/promises';
import path from 'path';
import { formatDate } from 'date-fns';

export interface TodoCompletion {
    total: number;
    done: number;
    percentage: number;
}

export type TodoCompletionMap = Record<string, TodoCompletion>;

export async function getTodoCompletionMap(): Promise<TodoCompletionMap> {
    const todosDir = path.join(process.cwd(), 'src/data/todos');
    const completionMap: TodoCompletionMap = {};

    try {
        const files = await fs.readdir(todosDir);
        const mdFiles = files.filter(f => f.endsWith('.md'));

        for (const file of mdFiles) {
            const dateStr = file.replace('.md', ''); // e.g., "2026-01-03"
            const filePath = path.join(todosDir, file);

            try {
                const content = await fs.readFile(filePath, 'utf8');
                const lines = content.split('\n');

                let total = 0;
                let done = 0;

                for (const line of lines) {
                    const trimmed = line.trim();
                    if (trimmed.startsWith('- [') || trimmed.startsWith('* [')) {
                        total++;
                        if (trimmed.includes('[x]')) {
                            done++;
                        }
                    }
                }

                if (total > 0) {
                    completionMap[dateStr] = {
                        total,
                        done,
                        percentage: (done / total) * 100,
                    };
                }
            } catch (err) {
                console.error(`Error reading todo file ${file}:`, err);
            }
        }
    } catch (err) {
        // Directory might not exist yet
        console.error('Error reading todos directory:', err);
    }

    return completionMap;
}
export function getInterpolatedColor(percentage: number): string {
    if (percentage <= 0) return 'rgba(255, 255, 255, 0.1)';

    // Scale between Mint (Emerald 100ish) and Deep Emerald (Emerald 800ish)
    // Percentage 1-100
    const p = percentage / 100;

    // Emerald Hue is ~160
    // Saturation: 70% -> 90%
    // Lightness: 85% -> 25%
    const h = 160;
    const s = Math.round(70 + (20 * p));
    const l = Math.round(85 - (60 * p));

    return `hsl(${h}, ${s}%, ${l}%)`;
}
