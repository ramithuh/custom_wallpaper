import fs from 'fs/promises';
import path from 'path';

export interface CategoryProgress {
    total: number;
    done: number;
    percentage: number;
}

export interface TodoTask {
    task: string;
    done: boolean;
}

export interface TrifectaCompletion {
    work: CategoryProgress;
    fitness: CategoryProgress;
    mind: CategoryProgress;
}

export interface CategorizedTodos {
    work: TodoTask[];
    fitness: TodoTask[];
    mind: TodoTask[];
}

export type TodoCompletionMap = Record<string, TrifectaCompletion>;

export async function getTodoCompletionMap(): Promise<TodoCompletionMap> {
    const todosDir = path.join(process.cwd(), 'src/data/todos');
    const completionMap: TodoCompletionMap = {};

    try {
        const files = await fs.readdir(todosDir);
        const mdFiles = files.filter(f => f.endsWith('.md'));

        for (const file of mdFiles) {
            const dateStr = file.replace('.md', '');
            const filePath = path.join(todosDir, file);

            try {
                const content = await fs.readFile(filePath, 'utf8');
                const { completion } = parseCategorizedContent(content);
                completionMap[dateStr] = completion;
            } catch (err) {
                console.error(`Error reading todo file ${file}:`, err);
            }
        }
    } catch (err) {
        console.error('Error reading todos directory:', err);
    }

    return completionMap;
}

export function parseCategorizedContent(content: string): { completion: TrifectaCompletion, tasks: CategorizedTodos } {
    const lines = content.split('\n');
    const tasks: CategorizedTodos = {
        work: [],
        fitness: [],
        mind: [],
    };

    let currentCategory: keyof CategorizedTodos = 'work';

    for (const line of lines) {
        const trimmed = line.trim();
        if (headerMatches(trimmed, 'fitness')) currentCategory = 'fitness';
        else if (headerMatches(trimmed, 'mind')) currentCategory = 'mind';
        else if (headerMatches(trimmed, 'work')) currentCategory = 'work';
        else if (trimmed.startsWith('- [') || trimmed.startsWith('* [')) {
            const done = trimmed.includes('[x]');
            const task = trimmed.replace(/^[-*]\s*\[[x ]\]\s*/, '').trim();
            if (task) {
                tasks[currentCategory].push({ task, done });
            }
        }
    }

    const completion: TrifectaCompletion = {
        work: calculateProgress(tasks.work),
        fitness: calculateProgress(tasks.fitness),
        mind: calculateProgress(tasks.mind),
    };

    return { completion, tasks };
}

function calculateProgress(tasks: TodoTask[]): CategoryProgress {
    const total = tasks.length;
    const done = tasks.filter(t => t.done).length;
    return {
        total,
        done,
        percentage: total > 0 ? (done / total) * 100 : 0
    };
}

function headerMatches(line: string, category: string): boolean {
    const trimmed = line.trim().toLowerCase();
    return (trimmed.startsWith('##') || trimmed.startsWith('#')) && trimmed.includes(category);
}

export function getInterpolatedColor(percentage: number, type: 'work' | 'fitness' | 'mind'): string {
    if (percentage <= 0) return 'rgba(255, 255, 255, 0.05)';

    const p = percentage / 100;
    const p = percentage / 100;
    let h = 140; // Work: Neon Green
    let s_start = 60, s_end = 90;
    let l_start = 80, l_end = 40; // Darker end for better contrast

    if (type === 'fitness') {
        h = 10; // Fitness: Bright Red-Orange
        l_start = 85; l_end = 50;
    } else if (type === 'mind') {
        h = 260; // Mind: Deep Purple/Blue
        l_start = 90; l_end = 55;
    }

    const s = Math.round(s_start + ((s_end - s_start) * p));
    const l = Math.round(l_start - ((l_start - l_end) * p));

    return `hsl(${h}, ${s}%, ${l}%)`;
}

export function getTrifectaColors(completion: TrifectaCompletion | undefined): { work: string, fitness: string, mind: string } {
    if (!completion) {
        const dim = 'rgba(255, 255, 255, 0.05)';
        return { work: dim, fitness: dim, mind: dim };
    }

    return {
        work: getInterpolatedColor(completion.work.percentage, 'work'),
        fitness: getInterpolatedColor(completion.fitness.percentage, 'fitness'),
        mind: getInterpolatedColor(completion.mind.percentage, 'mind'),
    };
}
