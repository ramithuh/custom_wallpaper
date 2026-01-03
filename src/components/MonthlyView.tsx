import React from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, getDay } from 'date-fns';

interface MonthlyViewProps {
    date: Date;
    width: number;
    height: number;
}

export const MonthlyView: React.FC<MonthlyViewProps> = ({ date, width, height }) => {
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const monthName = format(date, 'MMMM');
    const year = format(date, 'yyyy');

    // Adaptive scaling based on aspect ratio
    const isWider = width / height > 0.7; // iPad detection
    const verticalPadding = height * (isWider ? 0.2 : 0.25);

    // Grid settings
    const colNames = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const dotsPerRow = 7;

    const cardWidth = Math.min(width * 0.85, 800);
    const dotSize = Math.floor(cardWidth / 10);
    const gap = Math.floor(dotSize * 0.4);

    const gridWidth = dotsPerRow * dotSize + (dotsPerRow - 1) * gap;

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
                paddingTop: verticalPadding,
            }}
        >
            {/* Monthly Card Widget */}
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    padding: '60px 40px',
                    borderRadius: '60px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    width: cardWidth,
                }}
            >
                <div style={{ display: 'flex', fontSize: 48, fontWeight: 700, color: '#e76f51', letterSpacing: 4, marginBottom: 10 }}>
                    {monthName.toUpperCase()}
                </div>
                <div style={{ display: 'flex', fontSize: 24, fontWeight: 400, color: '#666666', letterSpacing: 8, marginBottom: 60 }}>
                    {year}
                </div>

                {/* Day Headers - Precisely Aligned */}
                <div
                    style={{
                        display: 'flex',
                        width: gridWidth,
                        justifyContent: 'space-between',
                        marginBottom: gap,
                        padding: '0 2px', // Micro-adjustment for visual centering
                    }}
                >
                    {colNames.map((day, i) => (
                        <div
                            key={i}
                            style={{
                                display: 'flex',
                                width: dotSize,
                                justifyContent: 'center',
                                fontSize: 24,
                                fontWeight: 700,
                                color: '#444444',
                            }}
                        >
                            {day}
                        </div>
                    ))}
                </div>

                {/* Dots Grid */}
                <div
                    style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        width: gridWidth,
                        justifyContent: 'flex-start',
                    }}
                >
                    {/* Padding for first day of month */}
                    {Array.from({ length: (getDay(monthStart) + 6) % 7 }).map((_, i) => (
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
                    {days.map((day, i) => {
                        const totalIdx = i + (getDay(monthStart) + 6) % 7;
                        let color = '#333333'; // Future
                        if (day < date && !isSameDay(day, date)) {
                            color = '#ffffff'; // Past
                        } else if (isSameDay(day, date)) {
                            color = '#e76f51'; // Today
                        }

                        return (
                            <div
                                key={i}
                                style={{
                                    width: dotSize,
                                    height: dotSize,
                                    borderRadius: '50%',
                                    backgroundColor: color,
                                    marginRight: (totalIdx + 1) % dotsPerRow === 0 ? 0 : gap,
                                    marginBottom: gap,
                                }}
                            />
                        );
                    })}
                </div>
            </div>

            <div style={{ flex: 1 }} />

            <div
                style={{
                    marginBottom: 100,
                    display: 'flex',
                    fontSize: 32,
                    fontWeight: 400,
                    color: '#999999',
                }}
            >
                {((days.filter(d => d <= date).length / days.length) * 100).toFixed(2)}% OF MONTH PASSED
            </div>
        </div>
    );
};
