import React from 'react';

export interface HorizontalBarChartItem {
    name: string;
    value: number;
    max: number;
}

export interface HorizontalBarChartProps {
    title: string;
    items: HorizontalBarChartItem[];
    /** X-axis tick labels. If omitted, auto-generated evenly from 0..max */
    xLabels?: (string | number)[];
    /** Bar fill color, defaults to #4CB3CF */
    color?: string;
    className?: string;
    /** Shows skeleton rows instead of data while loading */
    isLoading?: boolean;
    /** Number of skeleton rows to show while loading, defaults to 5 */
    skeletonRows?: number;
}

const SkeletonRow = () => (
    <div className="flex items-center gap-4 animate-pulse">
        <div className="w-16 h-3.5 bg-gray-200 rounded-full shrink-0" />
        <div className="flex-1 h-3.5 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-gray-300 rounded-r-full" style={{ width: `${Math.random() * 60 + 20}%` }} />
        </div>
    </div>
);

const HorizontalBarChart = ({
    title,
    items,
    xLabels,
    color = '#4CB3CF',
    className = '',
    isLoading = false,
    skeletonRows = 5,
}: HorizontalBarChartProps) => {
    const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
    const globalMax = items.reduce((acc, item) => Math.max(acc, item.max), 0) || 1;

    // Auto-generate 4 evenly spaced labels if none provided
    const computedLabels: (string | number)[] = xLabels ?? [
        Math.round(globalMax * 0.25),
        Math.round(globalMax * 0.5),
        Math.round(globalMax * 0.75),
        globalMax,
    ];

    return (
        <div className={`bg-white rounded-xl border border-gray-300 p-6 flex flex-col ${className}`}>
            {/* Title */}
            {isLoading ? (
                <div className="w-40 h-4 bg-gray-200 rounded-full animate-pulse mb-8" />
            ) : (
                <h3 className="font-bold mb-8">{title}</h3>
            )}

            {/* Bars */}
            <div className="space-y-6 flex-1">
                {isLoading
                    ? Array.from({ length: skeletonRows }).map((_, i) => <SkeletonRow key={i} />)
                    : items.map((item, index) => (
                        <div 
                            key={index} 
                            className="flex items-center gap-4 relative"
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                        >
                            <span className="text-sm text-gray-600 w-16 shrink-0 truncate" title={item.name}>
                                {item.name}
                            </span>
                            <div className="flex-1 h-3.5 bg-gray-50 rounded-full overflow-hidden relative group cursor-pointer">
                                <div
                                    className="h-full rounded-r-full transition-all duration-500"
                                    style={{
                                        width: `${Math.min((item.value / item.max) * 100, 100)}%`,
                                        backgroundColor: color,
                                    }}
                                />
                            </div>

                            {/* Tooltip */}
                            <div 
                                className={`
                                    absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-[#4CB3CF] text-white text-xs font-bold rounded shadow-2xl transition-all duration-200 pointer-events-none z-10
                                    ${hoveredIndex === index ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-95'}
                                `}
                                style={{
                                    left: `calc(4rem + 1rem + ${(Math.min((item.value / item.max) * 100, 100) / 2)}% + 8px)`
                                }}
                            >
                                {item.value}
                                {/* Tooltip Arrow */}
                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#4CB3CF] rotate-45" />
                            </div>
                        </div>
                    ))
                }
            </div>

            {/* X-axis labels */}
            <div className="flex justify-between pl-20 pr-2 mt-auto text-xs text-gray-600 font-medium pt-3 border-t border-gray-200/60">
                {isLoading
                    ? Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="w-4 h-3 bg-gray-200 rounded animate-pulse" />
                    ))
                    : computedLabels.map((label, i) => (
                        <span key={i}>{label}</span>
                    ))
                }
            </div>
        </div>
    );
};

export default HorizontalBarChart;
