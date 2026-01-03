import React from 'react';
import { startOfYear, endOfYear, eachDayOfInterval, isSameDay, addDays } from 'date-fns';

interface YearlyViewProps {
    date: Date;
    width: number;
    height: number;
}

export const YearlyView: React.FC<YearlyViewProps> = ({ date, width, height }) => {
    const start = startOfYear(date);
    const end = endOfYear(date);
    const days = eachDayOfInterval({ start, end });
    const currentDay = date;
    const nextDay = addDays(date, 1);

    const dotsPerRow = 14;
    const numRows = Math.ceil(days.length / dotsPerRow);

    const availableHeight = height * 0.7 - 100;
    const dotSizeFromHeight = Math.floor(availableHeight / (numRows * 1.4));
    const dotSizeFromWidth = Math.floor((width * 0.9) / 19.2);

    const dotSize = Math.min(dotSizeFromHeight, dotSizeFromWidth);
    const gap = Math.floor(dotSize * 0.4);

    const totalWidth = dotsPerRow * dotSize + (dotsPerRow - 1) * gap;
    const totalHeight = numRows * dotSize + (numRows - 1) * gap;

    const daysLeft = days.length - days.findIndex(d => isSameDay(d, date)) - 1;
    const percentage = (((days.length - daysLeft) / days.length) * 100).toFixed(2);

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
                paddingTop: height * 0.25,
            }}
        >
            <div
                style={{
                    display: 'flex',
                    position: 'relative',
                    width: totalWidth,
                    height: totalHeight,
                }}
            >
                {/* Dots Grid */}
                <div
                    style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        width: totalWidth,
                        height: totalHeight,
                        justifyContent: 'flex-start',
                        alignContent: 'flex-start',
                    }}
                >
                    {days.map((day, i) => {
                        let color = '#333333'; // Future days dark gray
                        if (day < currentDay && !isSameDay(day, currentDay)) {
                            color = '#ffffff'; // Past days white
                        } else if (isSameDay(day, currentDay)) {
                            color = '#e76f51'; // Current day coral orange
                        }

                        return (
                            <div
                                key={i}
                                style={{
                                    width: dotSize,
                                    height: dotSize,
                                    borderRadius: '50%',
                                    backgroundColor: color,
                                    marginRight: (i + 1) % dotsPerRow === 0 ? 0 : gap,
                                    marginBottom: gap,
                                }}
                            />
                        );
                    })}
                </div>

                {/* Overlay Text */}
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: 'rgba(26, 26, 26, 0.85)',
                            padding: '40px 60px',
                            borderRadius: '40px',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                        }}
                    >
                        <div style={{ display: 'flex', fontSize: 140, fontWeight: 700, color: '#ffffff', lineHeight: 1 }}>
                            {daysLeft}
                        </div>
                        <div style={{ display: 'flex', fontSize: 32, fontWeight: 700, color: '#e76f51', letterSpacing: 8, marginTop: 10 }}>
                            DAYS LEFT
                        </div>
                    </div>
                </div>
            </div>

            {/* Spacer to push content down */}
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
                {percentage}% OF YEAR PASSED
            </div>
        </div>
    );
};
