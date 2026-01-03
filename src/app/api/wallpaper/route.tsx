import { NextRequest, NextResponse } from 'next/server';
import { renderToPng } from '@/lib/render';
import { YearlyView } from '@/components/YearlyView';
import { MonthlyView } from '@/components/MonthlyView';
import { DayProgress } from '@/components/DayProgress';

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

    // Override with view parameter if provided (yearly=0, monthly=1, day=2)
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
                    next: { revalidate: 3600 } // Cache for 1 hour to be polite
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
            element = <DayProgress date={now} width={width} height={height} quote={quote} author={author} />;
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
