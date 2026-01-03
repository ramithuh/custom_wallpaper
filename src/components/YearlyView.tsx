import React from 'react';
import { startOfYear, endOfYear, eachDayOfInterval, isSameDay } from 'date-fns';

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

    // Adaptive scaling based on aspect ratio
    const isPortrait = height > width;

    // 26 dots for landscape (iPad), 14 for portrait (iPhone/iPad Portrait)
    const dotsPerRow = isPortrait ? 14 : 26;
    const numRows = Math.ceil(days.length / dotsPerRow);

    // Top Padding: 32% is the safe zone for large clocks (iPhone & iPad)
    const verticalPadding = height * 0.32;

    // Grid bounds - more compact for landscape iPad
    const gridMaxHeight = height * (isPortrait ? 0.58 : 0.55);
    const gridMaxWidth = width * (isPortrait ? 0.95 : 0.85);

    const dotSizeFromHeight = Math.floor(gridMaxHeight / (numRows * 1.4));
    const dotSizeFromWidth = Math.floor(gridMaxWidth / (dotsPerRow * 1.4));

    // Adaptive dot sizing
    const dotSize = Math.min(dotSizeFromHeight, dotSizeFromWidth, isPortrait ? 70 : 50);

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
                paddingTop: verticalPadding,
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
                        let color = '#333333'; // Future
                        if (day < currentDay && !isSameDay(day, currentDay)) {
                            color = '#ffffff'; // Past
                        } else if (isSameDay(day, currentDay)) {
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
                            padding: isPortrait ? '50px 70px' : '40px 60px',
                            borderRadius: '50px',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            backdropFilter: 'blur(10px)',
                        }}
                    >
                        <div style={{ display: 'flex', fontSize: isPortrait ? 180 : 140, fontWeight: 700, color: '#ffffff', lineHeight: 1 }}>
                            {daysLeft}
                        </div>
                        <div style={{ display: 'flex', fontSize: isPortrait ? 40 : 32, fontWeight: 700, color: '#e76f51', letterSpacing: 8, marginTop: 10 }}>
                            DAYS LEFT
                        </div>
                    </div>
                </div>
            </div>

            {/* Spacer to push content down */}
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
                {percentage}% OF YEAR PASSED
            </div>
        </div>
    );
};
