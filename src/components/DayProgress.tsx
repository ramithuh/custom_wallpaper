import React from 'react';
import { format, startOfDay, differenceInSeconds } from 'date-fns';

interface DayProgressProps {
    date: Date;
    width: number;
    height: number;
    quote?: string;
    author?: string;
    todos?: { task: string; done: boolean }[];
}

export const DayProgress: React.FC<DayProgressProps> = ({ date, width, height, quote, author, todos }) => {
    const start = startOfDay(date);
    const totalSeconds = 24 * 60 * 60;
    const elapsedSeconds = differenceInSeconds(date, start);
    const percentage = ((elapsedSeconds / totalSeconds) * 100).toFixed(2);

    // Adaptive sizing
    const isWider = width / height > 0.7;

    // Top Padding: 32% is the safe zone for large clocks (iPhone & iPad)
    const verticalPadding = height * 0.32;

    // Circle size based on screen dimensions
    // Shrink circle slightly if todos exist
    const sizeMultiplier = todos ? 0.5 : 0.6;
    const size = Math.min(Math.floor(width * sizeMultiplier), Math.floor(height * 0.3), 500);
    const strokeWidth = Math.floor(size * 0.08);
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
                paddingTop: verticalPadding,
            }}
        >
            {/* Progress Circle Section */}
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
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="#333333"
                        strokeWidth={strokeWidth}
                        fill="transparent"
                    />
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
                    <div style={{ display: 'flex', fontSize: size * 0.25, fontWeight: 700 }}>{Math.floor(parseFloat(percentage))}%</div>
                </div>
            </div>

            <div style={{ display: 'flex', fontSize: 24, color: '#e76f51', marginTop: 30, letterSpacing: 4, fontWeight: 700 }}>
                {format(date, 'HH:mm')}
            </div>

            {/* Daily Todos Section */}
            {todos && (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    padding: '40px 60px',
                    borderRadius: '40px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    marginTop: 40,
                    width: isWider ? '60%' : '85%',
                }}>
                    <div style={{ display: 'flex', fontSize: 28, fontWeight: 700, color: '#e76f51', letterSpacing: 2, marginBottom: 30, opacity: 0.8 }}>
                        DAILY OBJECTIVES
                    </div>
                    {todos.map((t, i) => (
                        <div key={i} style={{
                            display: 'flex',
                            alignItems: 'center',
                            marginBottom: i === todos.length - 1 ? 0 : 20,
                            opacity: t.done ? 0.4 : 1,
                        }}>
                            <div style={{
                                width: 32,
                                height: 32,
                                borderRadius: '8px',
                                border: `2px solid ${t.done ? '#e76f51' : '#666666'}`,
                                backgroundColor: t.done ? '#e76f51' : 'transparent',
                                marginRight: 24,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                {t.done && (
                                    <svg
                                        width="22"
                                        height="22"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="white"
                                        strokeWidth="4"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                )}
                            </div>
                            <div style={{
                                display: 'flex',
                                fontSize: 36,
                                fontWeight: 400,
                                color: '#ffffff',
                                textDecoration: t.done ? 'line-through' : 'none',
                            }}>
                                {t.task}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Quote Section (Hidden if too many todos to stay clean) */}
            {quote && (!todos || todos.length <= 3) && (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: isWider ? '0 200px' : '0 100px',
                    marginTop: todos ? 40 : 60,
                    marginBottom: 40,
                    textAlign: 'center'
                }}>
                    <div style={{ display: 'flex', fontSize: recursiveQuoteSize(todos), fontWeight: 300, fontStyle: 'italic', lineHeight: 1.5, color: '#cccccc' }}>
                        "{quote}"
                    </div>
                    {author && (
                        <div style={{ display: 'flex', fontSize: recursiveAuthorSize(todos), fontWeight: 700, marginTop: 15, color: '#e76f51', opacity: 0.9 }}>
                            — {author}
                        </div>
                    )}
                </div>
            )}

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
                {percentage}% OF DAY PASSED
            </div>
        </div>
    );
};

// Helper to scale quote font size based on presence of todos
const recursiveQuoteSize = (todos?: any[]) => {
    if (!todos) return 32;
    return 24;
};

const recursiveAuthorSize = (todos?: any[]) => {
    if (!todos) return 28;
    return 20;
};
