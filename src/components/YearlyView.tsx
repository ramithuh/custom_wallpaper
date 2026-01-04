import { startOfYear, endOfYear, eachDayOfInterval, isSameDay, format } from 'date-fns';
import { TodoCompletionMap, TrifectaCompletion } from '../lib/todo-utils';

interface YearlyViewProps {
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
        return (
            <div style={{
                position: 'relative',
                width: size,
                height: size,
                display: 'flex',
            }}>
                <svg width={size} height={size} style={{ position: 'absolute', top: 0, left: 0 }}>
                    <circle cx={cx} cy={cy} r={r} fill="#ff3b30" />
                    {isToday && (
                        <circle
                            cx={cx}
                            cy={cy}
                            r={r - Math.max(1, size * 0.075)}
                            fill="none"
                            stroke="#ffffff"
                            strokeWidth={Math.max(2, size * 0.15)}
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
                <circle cx={cx} cy={cy} r={r} fill="rgba(255,255,255,0.3)" />

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
                        r={r - Math.max(1, size * 0.075)}
                        fill="none"
                        stroke="#e76f51"
                        strokeWidth={Math.max(2, size * 0.15)}
                    />
                )}
            </svg>
        </div>
    );
};

export const YearlyView: React.FC<YearlyViewProps> = ({ date, width, height, completionMap }) => {
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
                        const dateStr = format(day, 'yyyy-MM-dd');
                        const completion = completionMap?.[dateStr];
                        const isToday = isSameDay(day, currentDay);
                        const isDeadline = completion?.isDeadline ?? false;

                        // Future days are gray, unless they have a deadline
                        if (day > currentDay && !isToday && !isDeadline) {
                            return (
                                <div
                                    key={i}
                                    style={{
                                        width: dotSize,
                                        height: dotSize,
                                        borderRadius: '50%',
                                        backgroundColor: '#333333',
                                        marginRight: (i + 1) % dotsPerRow === 0 ? 0 : gap,
                                        marginBottom: gap,
                                    }}
                                />
                            );
                        }

                        return (
                            <div key={i} style={{
                                display: 'flex',
                                marginRight: (i + 1) % dotsPerRow === 0 ? 0 : gap,
                                marginBottom: gap,
                            }}>
                                <TrifectaDot size={dotSize} completion={completion} isToday={isToday} />
                            </div>
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
                            backgroundColor: 'rgba(26, 26, 26, 0.9)',
                            padding: isPortrait ? '50px 70px' : '40px 60px',
                            borderRadius: '50px',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
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
