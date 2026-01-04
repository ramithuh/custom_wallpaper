import { NextRequest, NextResponse } from 'next/server';
import React from 'react';
import fs from 'fs/promises';
import path from 'path';
import { format as formatDate } from 'date-fns';
import { renderToPng } from '@/lib/render';
import { YearlyView } from '@/components/YearlyView';
import { MonthlyView } from '@/components/MonthlyView';
import { DayProgress } from '@/components/DayProgress';

const FALLBACK_QUOTES = [
    { q: "The only way to do great work is to love what you do.", a: "Steve Jobs" },
    { q: "Stay hungry, stay foolish.", a: "Steve Jobs" },
    { q: "Innovation distinguishes between a leader and a follower.", a: "Steve Jobs" },
    { q: "Believe you can and you're halfway there.", a: "Theodore Roosevelt" },
    { q: "It does not matter how slowly you go as long as you do not stop.", a: "Confucius" },
    { q: "Everything you've ever wanted is on the other side of fear.", a: "George Addair" },
    { q: "Success is not final, failure is not fatal: it is the courage to continue that counts.", a: "Winston Churchill" },
    { q: "The future belongs to those who believe in the beauty of their dreams.", a: "Eleanor Roosevelt" },
    { q: "You miss 100% of the shots you don't take.", a: "Wayne Gretzky" },
    { q: "Hardships often prepare ordinary people for an extraordinary destiny.", a: "C.S. Lewis" }
];

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const width = parseInt(searchParams.get('width') || '1179');
    const height = parseInt(searchParams.get('height') || '2556');
    const viewParam = searchParams.get('view');
    const tz = searchParams.get('tz') || 'UTC';

    let now: Date;
    try {
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: tz,
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            hour12: false,
        });
        const parts = formatter.formatToParts(new Date());
        const partValues: Record<string, string> = {};
        parts.forEach(p => (partValues[p.type] = p.value));
        now = new Date(
            parseInt(partValues.year),
            parseInt(partValues.month) - 1,
            parseInt(partValues.day),
            parseInt(partValues.hour),
            parseInt(partValues.minute),
            parseInt(partValues.second)
        );
    } catch (e) {
        now = new Date();
    }
    const minutes = now.getMinutes();
    const shufflingInterval = 15;
    let viewIndex = Math.floor(minutes / shufflingInterval) % 3;

    // Override with view parameter if provided
    if (viewParam === 'yearly' || viewParam === 'year') viewIndex = 0;
    else if (viewParam === 'monthly' || viewParam === 'month') viewIndex = 1;
    else if (viewParam === 'day' || viewParam === 'days' || viewParam === 'daily') viewIndex = 2;

    let element: React.ReactNode;

    switch (viewIndex) {
        case 0:
            element = <YearlyView date={now} width={width} height={height} />;
            break;
        case 1:
            element = <MonthlyView date={now} width={width} height={height} />;
            break;
        case 2: {
            let quote = undefined;
            let author = undefined;
            try {
                const response = await fetch('https://zenquotes.io/api/random', {
                    next: { revalidate: 3600 }
                });
                if (response.ok) {
                    const data = await response.json();
                    if (Array.isArray(data) && data.length > 0) {
                        quote = data[0].q;
                        author = data[0].a;
                    }
                }
            } catch (error) {
                console.error('Error fetching quote:', error);
            }

            // Fallback if fetch failed
            if (!quote) {
                const randomIdx = Math.floor(Math.random() * FALLBACK_QUOTES.length);
                quote = FALLBACK_QUOTES[randomIdx].q;
                author = FALLBACK_QUOTES[randomIdx].a;
            }

            // Read and parse todos if they exist
            let todos: { task: string; done: boolean }[] | undefined = undefined;
            try {
                const dateStr = formatDate(now, 'yyyy-MM-dd');
                const todoPath = path.join(process.cwd(), 'src/data/todos', `${dateStr}.md`);
                const content = await fs.readFile(todoPath, 'utf8');

                // Simple markdown task list parser
                todos = content.split('\n')
                    .filter(line => line.trim().startsWith('- [') || line.trim().startsWith('* ['))
                    .map(line => {
                        const trimmed = line.trim();
                        const done = trimmed.startsWith('- [x]') || trimmed.startsWith('* [x]');
                        const task = trimmed.replace(/^[-*]\s*\[[x ]\]\s*/, '').trim();
                        return { task, done };
                    })
                    .filter(t => t.task.length > 0);

                if (todos.length === 0) todos = undefined;
            } catch (e) {
                // File not found or other read error, ignore and move on
            }

            element = <DayProgress date={now} width={width} height={height} quote={quote} author={author} todos={todos} />;
            break;
        }
        default:
            element = <YearlyView date={now} width={width} height={height} />;
    }

    try {
        const png = await renderToPng(element, width, height);
        return new NextResponse(png as any, {
            headers: {
                'Content-Type': 'image/png',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
            },
        });
    } catch (error) {
        console.error('Error generating wallpaper:', error);
        return new NextResponse('Error generating wallpaper', { status: 500 });
    }
}
