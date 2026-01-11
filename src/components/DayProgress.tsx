import React from 'react';
import { format, startOfDay, differenceInSeconds } from 'date-fns';
import { CategorizedTodos, TodoTask } from '../lib/todo-utils';

interface DayProgressProps {
    date: Date;
    width: number;
    height: number;
    quote?: string;
    author?: string;
    categorizedTodos?: CategorizedTodos;
}

export const DayProgress: React.FC<DayProgressProps> = ({ date, width, height, quote, author, categorizedTodos }) => {
    const start = startOfDay(date);
    const totalSeconds = 24 * 60 * 60;
    const elapsedSeconds = differenceInSeconds(date, start);
    const percentage = ((elapsedSeconds / totalSeconds) * 100).toFixed(2);

    // Adaptive sizing
    const isWider = width / height > 0.7;

    // Top Padding: 32% is the safe zone for large clocks (iPhone & iPad)
    const verticalPadding = height * 0.32;

    const hasTodos = !!(categorizedTodos && (
        categorizedTodos.work.length > 0 ||
        categorizedTodos.fitness.length > 0 ||
        categorizedTodos.mind.length > 0
    ));

    // Circle size based on screen dimensions
    // Shrink circle slightly if todos exist
    const sizeMultiplier = hasTodos ? 0.45 : 0.6;
    const size = Math.min(Math.floor(width * sizeMultiplier), Math.floor(height * 0.28), 500);
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

            <div style={{ display: 'flex', fontSize: recursiveClockSize(hasTodos), color: '#666666', marginTop: 25, letterSpacing: 4, fontWeight: 700, opacity: 0.8 }}>
                {format(date, 'HH:mm')}
            </div>

            {/* Daily Todos Section */}
            {hasTodos && (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    padding: '40px 60px',
                    borderRadius: '50px',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    marginTop: 60,
                    width: isWider ? '70%' : '90%',
                }}>
                    {(['work', 'fitness', 'mind'] as const).map(cat => {
                        const tasks = categorizedTodos[cat];
                        if (!tasks || tasks.length === 0) return null;

                        const categoryColors = {
                            work: '#10b981',    // Emerald 500
                            fitness: '#f59e0b', // Amber 500
                            mind: '#0ea5e9'      // Sky 500
                        };
                        const color = categoryColors[cat];

                        return (
                            <div key={cat} style={{
                                display: 'flex',
                                flexDirection: 'column',
                                width: '100%',
                                marginBottom: cat === 'mind' ? 0 : 40
                            }}>
                                <div style={{
                                    display: 'flex',
                                    fontSize: 32,
                                    fontWeight: 700,
                                    color,
                                    letterSpacing: 2,
                                    marginBottom: 25,
                                    opacity: 0.9,
                                    textTransform: 'uppercase'
                                }}>
                                    {cat}
                                </div>
                                {tasks.map((t, i) => (
                                    <TodoItem key={i} t={t} color={color} isLast={i === tasks.length - 1} />
                                ))}
                            </div>
                        );
                    })}

                    {/* Rendering Notes inside the Todo Box */}
                    {categorizedTodos?.notes && categorizedTodos.notes.length > 0 && (
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            width: '100%',
                            marginTop: 50,
                            paddingTop: 40,
                            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                        }}>
                            <div style={{
                                display: 'flex',
                                fontSize: 24,
                                fontWeight: 700,
                                color: '#999999',
                                letterSpacing: 2,
                                marginBottom: 20,
                                opacity: 0.8,
                                textTransform: 'uppercase'
                            }}>
                                Notes
                            </div>
                            {categorizedTodos.notes.map((note, i) => (
                                <div key={i} style={{
                                    display: 'flex',
                                    fontSize: 24,
                                    fontWeight: 300,
                                    color: '#cccccc',
                                    marginBottom: 12,
                                    lineHeight: '1.4',
                                }}>
                                    • {note}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Quote Section */}
            {quote && (!hasTodos || totalTaskCount(categorizedTodos) <= 3) && (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: isWider ? '0 200px' : '0 100px',
                    marginTop: hasTodos ? 40 : 60,
                    marginBottom: 40,
                    textAlign: 'center'
                }}>
                    <div style={{ display: 'flex', fontSize: recursiveQuoteSize(hasTodos), fontWeight: 300, fontStyle: 'italic', lineHeight: 1.5, color: '#cccccc' }}>
                        "{quote}"
                    </div>
                    {author && (
                        <div style={{ display: 'flex', fontSize: recursiveAuthorSize(hasTodos), fontWeight: 700, marginTop: 15, color: '#e76f51', opacity: 0.9 }}>
                            — {author}
                        </div>
                    )}
                </div>
            )}

            <div style={{ flex: 1 }} />

            <div
                style={{
                    marginBottom: 60,
                    display: 'flex',
                    fontSize: 28,
                    fontWeight: 400,
                    color: '#666666',
                }}
            >
                {percentage}% OF DAY PASSED
            </div>
        </div>
    );
};

const TodoItem = ({ t, color, isLast }: { t: TodoTask, color: string, isLast: boolean }) => (
    <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: isLast ? 0 : 20,
        opacity: t.done ? 0.35 : 1,
    }}>
        <div style={{
            width: 40,
            height: 40,
            borderRadius: '10px',
            border: `2.5px solid ${t.done ? color : '#555555'}`,
            backgroundColor: t.done ? color : 'transparent',
            marginRight: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            {t.done && (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                </svg>
            )}
        </div>
        <div style={{
            display: 'flex',
            fontSize: 42,
            fontWeight: 400,
            color: '#ffffff',
            textDecoration: t.done ? 'line-through' : 'none',
        }}>
            {t.task}
        </div>
    </div>
);

const totalTaskCount = (todos?: CategorizedTodos) => {
    if (!todos) return 0;
    return todos.work.length + todos.fitness.length + todos.mind.length;
};

const recursiveClockSize = (hasTodos: boolean) => hasTodos ? 32 : 48;
const recursiveQuoteSize = (hasTodos: boolean) => hasTodos ? 24 : 32;
const recursiveAuthorSize = (hasTodos: boolean) => hasTodos ? 18 : 28;
