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
    isDeadline: boolean;
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

    let currentCategory: keyof CategorizedTodos | 'deadline' = 'work';
    let hasDeadline = false;

    for (const line of lines) {
        const trimmed = line.trim();
        if (headerMatches(trimmed, 'fitness')) currentCategory = 'fitness';
        else if (headerMatches(trimmed, 'mind')) currentCategory = 'mind';
        else if (headerMatches(trimmed, 'work')) currentCategory = 'work';
        else if (headerMatches(trimmed, 'deadline')) {
            hasDeadline = true;
        } else if (trimmed.startsWith('- [') || trimmed.startsWith('* [')) {
            const done = trimmed.includes('[x]');
            const task = trimmed.replace(/^[-*]\s*\[[x ]\]\s*/, '').trim();
            if (task && (['work', 'fitness', 'mind'] as string[]).includes(currentCategory)) {
                tasks[currentCategory as keyof CategorizedTodos].push({ task, done });
            }
        }
    }

    const completion: TrifectaCompletion = {
        work: calculateProgress(tasks.work),
        fitness: calculateProgress(tasks.fitness),
        mind: calculateProgress(tasks.mind),
        isDeadline: hasDeadline,
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

    // Work: #00ff87 (Neon Mint) -> H: 152, S: 100%, L: 50%
    let h = 152;
    let s_start = 60, s_end = 100;
    let l_start = 25, l_end = 50; // Start Dark (25%) -> End Bright (50%)

    if (type === 'fitness') {
        // Fitness: #ff1b6b (Hot Pink) -> H: 339, S: 100%, L: 55%
        h = 339;
        s_end = 100;
        l_start = 30; l_end = 55;
    } else if (type === 'mind') {
        // Mind: #0061ff (Bright Blue) -> H: 217, S: 100%, L: 50%
        h = 217;
        s_end = 100;
        l_start = 25; l_end = 50;
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

// Apple Card style color mixing based on task completion counts
export interface BlendedColorResult {
    color: string;
    intensity: number; // 0-1 scale
    totalDone: number;
    isEmpty: boolean;
}

export function getBlendedTrifectaColor(completion: TrifectaCompletion | undefined): BlendedColorResult {
    if (!completion) {
        return {
            color: 'rgba(255, 255, 255, 0.05)',
            intensity: 0,
            totalDone: 0,
            isEmpty: true
        };
    }

    const workDone = completion.work.done;
    const fitnessDone = completion.fitness.done;
    const mindDone = completion.mind.done;
    const totalDone = workDone + fitnessDone + mindDone;

    if (totalDone === 0) {
        return {
            color: 'rgba(255, 255, 255, 0.05)',
            intensity: 0,
            totalDone: 0,
            isEmpty: true
        };
    }

    // Calculate weights for each category based on completed tasks
    const workWeight = workDone / totalDone;
    const fitnessWeight = fitnessDone / totalDone;
    const mindWeight = mindDone / totalDone;

    // Base colors (Trifecta palette)
    const workRGB = { r: 0, g: 255, b: 135 };      // #00ff87
    const fitnessRGB = { r: 255, g: 27, b: 107 };  // #ff1b6b
    const mindRGB = { r: 0, g: 97, b: 255 };       // #0061ff

    // Weighted color mixing
    const r = Math.round(workRGB.r * workWeight + fitnessRGB.r * fitnessWeight + mindRGB.r * mindWeight);
    const g = Math.round(workRGB.g * workWeight + fitnessRGB.g * fitnessWeight + mindRGB.g * mindWeight);
    const b = Math.round(workRGB.b * workWeight + fitnessRGB.b * fitnessWeight + mindRGB.b * mindWeight);

    // Calculate intensity based on total tasks done
    // Scale: 1-3 tasks = low, 4-7 = medium, 8+ = high
    // Max intensity at 10+ tasks
    const intensity = Math.min(totalDone / 10, 1);

    return {
        color: `rgb(${r}, ${g}, ${b})`,
        intensity,
        totalDone,
        isEmpty: false
    };
}
