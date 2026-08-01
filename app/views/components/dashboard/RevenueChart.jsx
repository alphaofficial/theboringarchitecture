import { useState } from 'react';
import { Button } from '@/views/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/views/components/ui/card';

const chartData = [
    { label: 'Jan', revenue: 182, customers: 128 },
    { label: 'Feb', revenue: 218, customers: 154 },
    { label: 'Mar', revenue: 205, customers: 166 },
    { label: 'Apr', revenue: 268, customers: 191 },
    { label: 'May', revenue: 246, customers: 180 },
    { label: 'Jun', revenue: 310, customers: 228 },
    { label: 'Jul', revenue: 288, customers: 214 },
    { label: 'Aug', revenue: 352, customers: 256 },
    { label: 'Sep', revenue: 329, customers: 244 },
    { label: 'Oct', revenue: 404, customers: 302 },
    { label: 'Nov', revenue: 438, customers: 326 },
    { label: 'Dec', revenue: 472, customers: 348 },
];

const periods = [
    { label: '3 months', value: 3 },
    { label: '6 months', value: 6 },
    { label: '12 months', value: 12 },
];

function makePoints(data, key) {
    const left = 50;
    const right = 780;
    const top = 20;
    const bottom = 215;
    const max = 500;

    return data.map((item, index) => {
        const x = left + (index / Math.max(data.length - 1, 1)) * (right - left);
        const y = bottom - (item[key] / max) * (bottom - top);
        return [x, y];
    });
}

function makeLine(points) {
    return points.map(([x, y], index) => `${index === 0 ? 'M' : 'L'} ${x} ${y}`).join(' ');
}

/**
 * Lightweight SVG chart that keeps the starter free of a charting dependency.
 *
 * @returns {import('react').ReactElement} Responsive revenue chart.
 */
export default function RevenueChart() {
    const [period, setPeriod] = useState(12);
    const data = chartData.slice(-period);
    const revenuePoints = makePoints(data, 'revenue');
    const customerPoints = makePoints(data, 'customers');
    const revenueLine = makeLine(revenuePoints);
    const customerLine = makeLine(customerPoints);
    const areaPath = `${revenueLine} L 780 215 L 50 215 Z`;

    return (
        <Card id="analytics" className="border border-border bg-background shadow-card">
            <CardHeader className="gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
                <div>
                    <CardTitle>Total revenue</CardTitle>
                    <p className="mt-1 text-body">
                        Revenue and customer growth over time
                    </p>
                </div>
                <div className="flex w-fit rounded-md border border-border bg-surface-soft p-1">
                    {periods.map(option => (
                        <Button
                            key={option.value}
                            type="button"
                            size="xs"
                            variant={period === option.value ? 'outline' : 'ghost'}
                            className={period === option.value ? 'bg-background shadow-card' : ''}
                            onClick={() => setPeriod(option.value)}
                        >
                            {option.label}
                        </Button>
                    ))}
                </div>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="mb-5 flex flex-wrap items-center gap-5 text-xs text-muted-foreground">
                    <span className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-[var(--chart-2)]" aria-hidden="true" />
                        Revenue
                    </span>
                    <span className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-[var(--chart-4)]" aria-hidden="true" />
                        Customers
                    </span>
                </div>

                <div className="w-full overflow-hidden">
                    <svg
                        viewBox="0 0 800 260"
                        className="h-auto min-h-[240px] w-full"
                        role="img"
                        aria-label={`Revenue and customer growth for the last ${period} months`}
                    >
                        <defs>
                            <linearGradient id="revenue-fill" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="var(--chart-2)" stopOpacity="0.28" />
                                <stop offset="100%" stopColor="var(--chart-2)" stopOpacity="0.02" />
                            </linearGradient>
                        </defs>

                        {[0, 100, 200, 300, 400, 500].map((tick, index) => {
                            const y = 215 - (tick / 500) * 195;
                            return (
                                <g key={tick}>
                                    <line
                                        x1="50"
                                        x2="780"
                                        y1={y}
                                        y2={y}
                                        stroke="var(--border)"
                                        strokeWidth="1"
                                    />
                                    <text
                                        x="40"
                                        y={y + 4}
                                        textAnchor="end"
                                        fontSize="11"
                                        fill="var(--muted-foreground)"
                                    >
                                        {index === 0 ? '0' : `${tick}k`}
                                    </text>
                                </g>
                            );
                        })}

                        <path d={areaPath} fill="url(#revenue-fill)" />
                        <path
                            d={revenueLine}
                            fill="none"
                            stroke="var(--chart-2)"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="3"
                        />
                        <path
                            d={customerLine}
                            fill="none"
                            stroke="var(--chart-4)"
                            strokeDasharray="5 5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                        />

                        {revenuePoints.map(([x, y], index) => (
                            <circle
                                key={`${data[index].label}-revenue`}
                                cx={x}
                                cy={y}
                                r="3.5"
                                fill="var(--background)"
                                stroke="var(--chart-2)"
                                strokeWidth="2"
                            />
                        ))}

                        {data.map((item, index) => {
                            const [x] = revenuePoints[index];
                            return (
                                <text
                                    key={item.label}
                                    x={x}
                                    y="245"
                                    textAnchor="middle"
                                    fontSize="11"
                                    fill="var(--muted-foreground)"
                                >
                                    {item.label}
                                </text>
                            );
                        })}
                    </svg>
                </div>
            </CardContent>
        </Card>
    );
}
