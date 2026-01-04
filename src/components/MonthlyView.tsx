import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, getDay } from 'date-fns';
import { TodoCompletionMap, TrifectaCompletion } from '../lib/todo-utils';

interface MonthlyViewProps {
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
                    border: `${Math.max(2, size * 0.08)}px solid #e76f51`,
                    boxSizing: 'border-box',
                    zIndex: 10
                }} />
            )}
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

                        if (day > date && !isToday) {
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
