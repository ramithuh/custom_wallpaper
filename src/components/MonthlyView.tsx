import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, getDay } from 'date-fns';
import { TodoCompletionMap, TrifectaCompletion } from '../lib/todo-utils';

interface MonthlyViewProps {
    date: Date;
    width: number;
    height: number;
    completionMap?: TodoCompletionMap;
}

// Helper to create SVG arc path
const createArcPath = (cx: number, cy: number, r: number, startAngle: number, endAngle: number): string => {
    const start = {
        x: cx + r * Math.cos(startAngle),
        y: cy + r * Math.sin(startAngle)
    };
    const end = {
        x: cx + r * Math.cos(endAngle),
        y: cy + r * Math.sin(endAngle)
    };
    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
    return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
};

const TrifectaDot = ({ size, completion, isToday }: { size: number, completion?: TrifectaCompletion, isToday: boolean }) => {
    const isDeadline = completion?.isDeadline ?? false;
    const cx = size / 2;
    const cy = size / 2;
    const r = size / 2;

    // If deadline, render solid red dot
    if (isDeadline) {
        const dotColor = completion?.deadlineColor || '#ff3b30';
        return (
            <div style={{
                position: 'relative',
                width: size,
                height: size,
                display: 'flex',
            }}>
                <svg width={size} height={size} style={{ position: 'absolute', top: 0, left: 0 }}>
                    <circle cx={cx} cy={cy} r={r} fill={dotColor} />
                    {isToday && (
                        <circle
                            cx={cx}
                            cy={cy}
                            r={r - Math.max(1, size * 0.04)}
                            fill="none"
                            stroke="#ffffff"
                            strokeWidth={Math.max(2, size * 0.08)}
                        />
                    )}
                </svg>
            </div>
        );
    }

    const workTotal = completion?.work.total ?? 0;
    const fitnessTotal = completion?.fitness.total ?? 0;
    const mindTotal = completion?.mind.total ?? 0;
    const totalTasks = workTotal + fitnessTotal + mindTotal;

    const workDone = completion?.work.done ?? 0;
    const fitnessDone = completion?.fitness.done ?? 0;
    const mindDone = completion?.mind.done ?? 0;

    // Share determines the angle slice
    const workShare = totalTasks > 0 ? workTotal / totalTasks : 0;
    const fitnessShare = totalTasks > 0 ? fitnessTotal / totalTasks : 0;
    const mindShare = totalTasks > 0 ? mindTotal / totalTasks : 0;

    // Completion rate determines opacity (0.3 base + 0.7 from completion)
    const workOpacity = workTotal > 0 ? 0.3 + (workDone / workTotal) * 0.7 : 0;
    const fitnessOpacity = fitnessTotal > 0 ? 0.3 + (fitnessDone / fitnessTotal) * 0.7 : 0;
    const mindOpacity = mindTotal > 0 ? 0.3 + (mindDone / mindTotal) * 0.7 : 0;

    // Calculate angles (starting from top, going clockwise)
    const startAngle = -Math.PI / 2; // Start from top
    const workEnd = startAngle + workShare * 2 * Math.PI;
    const fitnessEnd = workEnd + fitnessShare * 2 * Math.PI;
    const mindEnd = fitnessEnd + mindShare * 2 * Math.PI;

    return (
        <div style={{
            position: 'relative',
            width: size,
            height: size,
            display: 'flex',
        }}>
            <svg width={size} height={size} style={{ position: 'absolute', top: 0, left: 0 }}>
                <defs>
                    {/* Work gradient - from start angle to end angle */}
                    <linearGradient
                        id={`workGrad-${size}`}
                        x1={`${50 + 50 * Math.cos(startAngle)}%`}
                        y1={`${50 + 50 * Math.sin(startAngle)}%`}
                        x2={`${50 + 50 * Math.cos(workEnd)}%`}
                        y2={`${50 + 50 * Math.sin(workEnd)}%`}
                    >
                        <stop offset="0%" stopColor="#00ff87" stopOpacity="1" />
                        <stop offset="100%" stopColor="#00ff87" stopOpacity="0.4" />
                    </linearGradient>
                    {/* Fitness gradient */}
                    <linearGradient
                        id={`fitnessGrad-${size}`}
                        x1={`${50 + 50 * Math.cos(workEnd)}%`}
                        y1={`${50 + 50 * Math.sin(workEnd)}%`}
                        x2={`${50 + 50 * Math.cos(fitnessEnd)}%`}
                        y2={`${50 + 50 * Math.sin(fitnessEnd)}%`}
                    >
                        <stop offset="0%" stopColor="#ff1b6b" stopOpacity="1" />
                        <stop offset="100%" stopColor="#ff1b6b" stopOpacity="0.4" />
                    </linearGradient>
                    {/* Mind gradient */}
                    <linearGradient
                        id={`mindGrad-${size}`}
                        x1={`${50 + 50 * Math.cos(fitnessEnd)}%`}
                        y1={`${50 + 50 * Math.sin(fitnessEnd)}%`}
                        x2={`${50 + 50 * Math.cos(mindEnd)}%`}
                        y2={`${50 + 50 * Math.sin(mindEnd)}%`}
                    >
                        <stop offset="0%" stopColor="#0061ff" stopOpacity="1" />
                        <stop offset="100%" stopColor="#0061ff" stopOpacity="0.4" />
                    </linearGradient>
                </defs>

                {/* Base circle for empty/past days */}
                <circle cx={cx} cy={cy} r={r} fill="#BBBBBB" />

                {/* Work slice - use circle if 100% */}
                {workShare > 0 && (
                    workShare >= 0.999 ? (
                        <circle cx={cx} cy={cy} r={r} fill={`url(#workGrad-${size})`} opacity={workOpacity} />
                    ) : (
                        <path
                            d={createArcPath(cx, cy, r, startAngle, workEnd)}
                            fill={`url(#workGrad-${size})`}
                            opacity={workOpacity}
                        />
                    )
                )}

                {/* Fitness slice - use circle if 100% */}
                {fitnessShare > 0 && (
                    fitnessShare >= 0.999 ? (
                        <circle cx={cx} cy={cy} r={r} fill={`url(#fitnessGrad-${size})`} opacity={fitnessOpacity} />
                    ) : (
                        <path
                            d={createArcPath(cx, cy, r, workEnd, fitnessEnd)}
                            fill={`url(#fitnessGrad-${size})`}
                            opacity={fitnessOpacity}
                        />
                    )
                )}

                {/* Mind slice - use circle if 100% */}
                {mindShare > 0 && (
                    mindShare >= 0.999 ? (
                        <circle cx={cx} cy={cy} r={r} fill={`url(#mindGrad-${size})`} opacity={mindOpacity} />
                    ) : (
                        <path
                            d={createArcPath(cx, cy, r, fitnessEnd, mindEnd)}
                            fill={`url(#mindGrad-${size})`}
                            opacity={mindOpacity}
                        />
                    )
                )}

                {/* Today indicator */}
                {isToday && (
                    <circle
                        cx={cx}
                        cy={cy}
                        r={r - Math.max(1, size * 0.04)}
                        fill="none"
                        stroke="#e76f51"
                        strokeWidth={Math.max(2, size * 0.08)}
                    />
                )}
            </svg>
        </div>
    );
};

export const MonthlyView: React.FC<MonthlyViewProps> = ({ date, width, height, completionMap }) => {
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const monthName = format(date, 'MMMM');
    const year = format(date, 'yyyy');

    // Adaptive scaling based on aspect ratio
    const isPortrait = height > width;

    // Top Padding: 32% is the safe zone for large clocks (iPhone & iPad)
    const verticalPadding = height * 0.32;

    // Internal Card Padding
    const internalPadding = isPortrait ? 80 : 40;

    // Grid settings
    const colNames = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const dotsPerRow = 7;

    // Card Width: 
    const cardWidth = isPortrait ? width * 0.9 : Math.min(width * 0.7, 1000);

    // Available width for the grid after internal padding
    const availableGridWidth = cardWidth - (internalPadding * 2);

    // Determine dot size based on available interior width
    const dotSize = Math.floor(availableGridWidth / 9.5);
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
                    paddingTop: isPortrait ? 80 : 60,
                    paddingBottom: isPortrait ? 80 : 40,
                    paddingLeft: internalPadding,
                    paddingRight: internalPadding,
                    borderRadius: '80px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    width: cardWidth,
                }}
            >
                <div style={{ display: 'flex', fontSize: isPortrait ? 64 : 48, fontWeight: 700, color: '#e76f51', letterSpacing: 4, marginBottom: 10 }}>
                    {monthName.toUpperCase()}
                </div>
                <div style={{ display: 'flex', fontSize: isPortrait ? 32 : 24, fontWeight: 400, color: '#666666', letterSpacing: 8, marginBottom: 60 }}>
                    {year}
                </div>

                {/* Day Headers - Precisely Aligned */}
                <div
                    style={{
                        display: 'flex',
                        width: gridWidth,
                        justifyContent: 'space-between',
                        marginBottom: gap,
                        padding: '0 2px',
                    }}
                >
                    {colNames.map((day, i) => (
                        <div
                            key={i}
                            style={{
                                display: 'flex',
                                width: dotSize,
                                justifyContent: 'center',
                                fontSize: isPortrait ? 32 : 24,
                                fontWeight: 700,
                                color: '#e76f51',
                                opacity: 0.8,
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
                        const dateStr = format(day, 'yyyy-MM-dd');
                        const completion = completionMap?.[dateStr];
                        const isToday = isSameDay(day, date);
                        const isDeadline = completion?.isDeadline ?? false;

                        // Future days are gray, unless they have a deadline
                        if (day > date && !isToday && !isDeadline) {
                            return (
                                <div
                                    key={i}
                                    style={{
                                        width: dotSize,
                                        height: dotSize,
                                        borderRadius: '50%',
                                        backgroundColor: '#333333',
                                        marginRight: (totalIdx + 1) % dotsPerRow === 0 ? 0 : gap,
                                        marginBottom: gap,
                                    }}
                                />
                            );
                        }

                        return (
                            <div key={i} style={{
                                display: 'flex',
                                marginRight: (totalIdx + 1) % dotsPerRow === 0 ? 0 : gap,
                                marginBottom: gap,
                            }}>
                                <TrifectaDot size={dotSize} completion={completion} isToday={isToday} />
                            </div>
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
