import { startOfYear, endOfYear, eachDayOfInterval, isSameDay, format } from 'date-fns';
import { TodoCompletionMap, TrifectaCompletion } from '../lib/todo-utils';

interface YearlyViewProps {
    date: Date;
    width: number;
    height: number;
    completionMap?: TodoCompletionMap;
}

const TrifectaDot = ({ size, completion, isToday }: { size: number, completion?: TrifectaCompletion, isToday: boolean }) => {
    const workTotal = completion?.work.total ?? 0;
    const fitnessTotal = completion?.fitness.total ?? 0;
    const mindTotal = completion?.mind.total ?? 0;
    const totalTasks = workTotal + fitnessTotal + mindTotal;

    const workDone = completion?.work.done ?? 0;
    const fitnessDone = completion?.fitness.done ?? 0;
    const mindDone = completion?.mind.done ?? 0;

    // SPREAD: proportion of tasks in each category (how much of the dot this color covers)
    const workShare = totalTasks > 0 ? workTotal / totalTasks : 0;
    const fitnessShare = totalTasks > 0 ? fitnessTotal / totalTasks : 0;
    const mindShare = totalTasks > 0 ? mindTotal / totalTasks : 0;

    // OPACITY: completion rate for each category (how bright the color is)
    const workOpacity = workTotal > 0 ? workDone / workTotal : 0;
    const fitnessOpacity = fitnessTotal > 0 ? fitnessDone / fitnessTotal : 0;
    const mindOpacity = mindTotal > 0 ? mindDone / mindTotal : 0;

    // Spread: 30% base + up to 70% more based on share (so 100% share = 100% spread)
    const workSpread = 30 + (workShare * 70);
    const fitnessSpread = 30 + (fitnessShare * 70);
    const mindSpread = 30 + (mindShare * 70);

    return (
        <div style={{
            position: 'relative',
            width: size,
            height: size,
            display: 'flex',
            borderRadius: '50%',
            overflow: 'hidden',
            backgroundColor: 'rgba(255,255,255,0.5)',
        }}>
            {/* Work: Top Right */}
            {workTotal > 0 && <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: `radial-gradient(circle at 70% 30%, #00ff87 0%, transparent ${workSpread}%)`,
                opacity: workOpacity,
                filter: 'blur(2px)',
            }} />}

            {/* Mind: Top Left */}
            {mindTotal > 0 && <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: `radial-gradient(circle at 30% 30%, #0061ff 0%, transparent ${mindSpread}%)`,
                opacity: mindOpacity,
                filter: 'blur(2px)',
            }} />}

            {/* Fitness: Bottom */}
            {fitnessTotal > 0 && <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: `radial-gradient(circle at 50% 70%, #ff1b6b 0%, transparent ${fitnessSpread}%)`,
                opacity: fitnessOpacity,
                filter: 'blur(2px)',
            }} />}

            {isToday && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    border: `${Math.max(2, size * 0.15)}px solid #e76f51`,
                    boxSizing: 'border-box',
                    zIndex: 10
                }} />
            )}
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

                        if (day > currentDay && !isToday) {
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
