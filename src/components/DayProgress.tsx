import React from 'react';
import { format, startOfDay, differenceInSeconds } from 'date-fns';

interface DayProgressProps {
    date: Date;
    width: number;
    height: number;
}

export const DayProgress: React.FC<DayProgressProps> = ({ date, width, height }) => {
    const start = startOfDay(date);
    const totalSeconds = 24 * 60 * 60;
    const elapsedSeconds = differenceInSeconds(date, start);
    const percentage = ((elapsedSeconds / totalSeconds) * 100).toFixed(2);

    const size = Math.floor(width * 0.6);
    const strokeWidth = 50;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (parseFloat(percentage) / 100) * circumference;

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
                paddingTop: height * 0.25, // Unified padding start
            }}
        >
            <div style={{ flex: 1 }} />

            <div
                style={{
                    display: 'flex',
                    position: 'relative',
                    width: size,
                    height: size,
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <svg
                    width={size}
                    height={size}
                    viewBox={`0 0 ${size} ${size}`}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        transform: 'rotate(-90deg)',
                    }}
                >
                    {/* Background track */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="#333333"
                        strokeWidth={strokeWidth}
                        fill="transparent"
                    />
                    {/* Progress track */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="#e76f51"
                        strokeWidth={strokeWidth}
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                    />
                </svg>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <div style={{ display: 'flex', fontSize: 100, fontWeight: 700 }}>{Math.floor(parseFloat(percentage))}%</div>
                </div>
            </div>

            <div style={{ display: 'flex', fontSize: 24, color: '#e76f51', marginTop: 40, letterSpacing: 4, fontWeight: 700 }}>
                {format(date, 'HH:mm')}
            </div>

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
                {percentage}% OF DAY PASSED
            </div>
        </div>
    );
};
