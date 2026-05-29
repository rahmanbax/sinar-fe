import React, { useState } from 'react';


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
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [mode, setMode] = useState<'chart' | 'list'>('chart');
    const globalMax = items.reduce((acc, item) => Math.max(acc, item.max), 0) || 1;

    // Auto-generate unique, sorted, evenly spaced labels starting from 0 if none provided
    const computedLabels: (string | number)[] = React.useMemo(() => {
        if (xLabels) return xLabels;
        if (globalMax <= 4) {
            return Array.from({ length: globalMax + 1 }, (_, i) => i);
        }
        const step = globalMax / 4;
        const labels = [
            0,
            Math.round(step),
            Math.round(step * 2),
            Math.round(step * 3),
            globalMax,
        ];
        return Array.from(new Set(labels)).sort((a, b) => a - b);
    }, [xLabels, globalMax]);

    return (
        <div className={`bg-white rounded-xl border border-gray-300 p-6 flex flex-col ${className}`}>
            {/* Title & Toggle */}
            <div className="flex items-center justify-between mb-8">
                {isLoading ? (
                    <div className="w-40 h-4 bg-gray-200 rounded-full animate-pulse" />
                ) : (
                    <h3 className="font-bold">{title}</h3>
                )}
                <div className="flex items-center bg-gray-100 p-1 rounded-lg">
                    <button 
                        onClick={() => setMode('chart')}
                        className={`p-1.5 rounded-md transition-all cursor-pointer ${mode === 'chart' ? 'bg-white shadow-sm text-navy-600' : 'text-gray-400 hover:bg-gray-200'}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" height={16} viewBox="0 -960 960 960" width={16} fill="currentColor"><path d="M160-160v-320h160v320H160Zm240 0v-640h160v640H400Zm240 0v-440h160v440H640Z"/></svg>
                    </button>
                    <button 
                        onClick={() => setMode('list')}
                        className={`p-1.5 rounded-md transition-all cursor-pointer ${mode === 'list' ? 'bg-white shadow-sm text-navy-600' : 'text-gray-400 hover:bg-gray-200'}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" height={16} viewBox="0 -960 960 960" width={16} fill="currentColor"><path d="M280-600v-80h560v80H280Zm0 160v-80h560v80H280Zm0 160v-80h560v80H280ZM160-600q-17 0-28.5-11.5T120-640q0-17 11.5-28.5T160-680q17 0 28.5 11.5T200-640q0 17-11.5 28.5T160-600Zm0 160q-17 0-28.5-11.5T120-480q0-17 11.5-28.5T160-520q17 0 28.5 11.5T200-480q0 17-11.5 28.5T160-440Zm0 160q-17 0-28.5-11.5T120-320q0-17 11.5-28.5T160-360q17 0 28.5 11.5T200-320q0 17-11.5 28.5T160-280Z"/></svg>
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className={`flex-1 ${mode === 'list' ? 'space-y-3' : 'space-y-6'}`}>
                {isLoading ? (
                    Array.from({ length: skeletonRows }).map((_, i) => <SkeletonRow key={i} />)
                ) : items.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                        Tidak ada data untuk ditampilkan
                    </div>
                ) : mode === 'list' ? (
                    items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center p-3.5 border border-gray-200 rounded-xl">
                            <span className="text-gray-700">{item.name}</span>
                            <span className="font-bold">{item.value}</span>
                        </div>
                    ))
                ) : (
                    items.map((item, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-4 relative"
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                        >
                            <span className="text-sm text-gray-600 w-16 shrink-0 truncate" title={item.name}>
                                {item.name}
                            </span>
                            <div className="flex-1 h-3.5 bg-gray-50 rounded-full relative group cursor-pointer">
                                <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{
                                        width: `${Math.min((item.value / item.max) * 100, 100)}%`,
                                        backgroundColor: color,
                                    }}
                                />

                                {/* Tooltip */}
                                <div
                                    className={`
                                        absolute -top-8 -translate-x-1/2 px-2 py-1 bg-[#4CB3CF] text-white text-xs font-bold rounded shadow-2xl transition-all duration-200 pointer-events-none z-10 whitespace-nowrap
                                        ${hoveredIndex === index ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-95'}
                                    `}
                                    style={{
                                        left: `${Math.min((item.value / item.max) * 100, 100)}%`
                                    }}
                                >
                                    {item.value}
                                    {/* Tooltip Arrow */}
                                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#4CB3CF] rotate-45" />
                                </div>
                            </div>
                        </div>
                    ))
                )
                }
            </div>

            {/* X-axis labels */}
            {mode === 'chart' && (
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
            )}
        </div>
    );
}


export default HorizontalBarChart;
