import React from 'react';
import {
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameDay,
    addDays,
    getDay,
    differenceInSeconds,
} from 'date-fns';

interface MonthlyViewProps {
    date: Date;
    width: number;
    height: number;
}

export const MonthlyView: React.FC<MonthlyViewProps> = ({ date, width, height }) => {
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    const daysInMonth = eachDayOfInterval({ start, end });
    const currentDay = date;
    const nextDay = addDays(date, 1);

    const dotsPerRow = 7;
    const dotSize = Math.floor((width * 0.75) / (dotsPerRow + (dotsPerRow - 1) * 0.4));
    const gap = Math.floor(dotSize * 0.4);

    const totalWidth = dotsPerRow * dotSize + (dotsPerRow - 1) * gap;

    // Adjust to Monday start (M T W T F S S)
    const startDayPadding = (getDay(start) + 6) % 7;

    const headers = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

    // Percentage calculation
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    const totalSeconds = differenceInSeconds(monthEnd, monthStart);
    const elapsedSeconds = differenceInSeconds(date, monthStart);
    const percentage = ((elapsedSeconds / totalSeconds) * 100).toFixed(2);

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                width: '100%',
                height: '100%',
                backgroundColor: '#1a1a1a',
                color: '#ffffff',
                fontFamily: 'Inter',
                paddingTop: height * 0.25, // Space for clock
            }}
        >
            {/* Spacer to help center the card in the remaining space */}
            <div style={{ flex: 1 }} />

            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    padding: '60px 40px',
                    borderRadius: '60px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
            >
                <div style={{ display: 'flex', fontSize: 48, fontWeight: 700, marginBottom: 50, color: '#ffffff' }}>
                    {format(date, 'MMMM yyyy').toUpperCase()}
                </div>

                {/* Headers */}
                <div
                    style={{
                        display: 'flex',
                        width: totalWidth,
                        justifyContent: 'flex-start',
                        marginBottom: 30,
                    }}
                >
                    {headers.map((h, i) => (
                        <div
                            key={i}
                            style={{
                                display: 'flex',
                                width: dotSize,
                                justifyContent: 'center',
                                alignItems: 'center',
                                fontSize: 32,
                                fontWeight: 700,
                                color: '#e76f51',
                                marginRight: i === headers.length - 1 ? 0 : gap,
                            }}
                        >
                            {h}
                        </div>
                    ))}
                </div>

                {/* Dots Grid */}
                <div
                    style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        width: totalWidth,
                        justifyContent: 'flex-start',
                        alignContent: 'flex-start',
                    }}
                >
                    {Array.from({ length: startDayPadding }).map((_, i) => (
                        <div
                            key={`pad-${i}`}
                            style={{
                                width: dotSize,
                                height: dotSize,
                                marginRight: (i + 1) % dotsPerRow === 0 ? 0 : gap,
                                marginBottom: gap,
                            }}
                        />
                    ))}
                    {daysInMonth.map((day, i) => {
                        const index = i + startDayPadding;
                        let color = '#333333'; // Future
                        if (day < currentDay && !isSameDay(day, currentDay)) {
                            color = '#ffffff'; // Past
                        } else if (isSameDay(day, currentDay)) {
                            color = '#e76f51'; // Current
                        }

                        return (
                            <div
                                key={i}
                                style={{
                                    width: dotSize,
                                    height: dotSize,
                                    borderRadius: '50%',
                                    backgroundColor: color,
                                    marginRight: (index + 1) % dotsPerRow === 0 ? 0 : gap,
                                    marginBottom: gap,
                                }}
                            />
                        );
                    })}
                </div>
            </div>

            {/* Bottom Spacer to keep it balanced */}
            <div style={{ flex: 1 }} />

            <div
                style={{
                    marginBottom: 100, // Safe area for focus/camera icons
                    display: 'flex',
                    fontSize: 32,
                    fontWeight: 400,
                    color: '#999999',
                }}
            >
                {percentage}% OF MONTH PASSED
            </div>
        </div>
    );
};
