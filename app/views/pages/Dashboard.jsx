import { Head, usePage } from '@inertiajs/react';
import DashboardShell from '@/views/components/dashboard/DashboardShell.jsx';
import MetricCard from '@/views/components/dashboard/MetricCard.jsx';
import RecentOrders from '@/views/components/dashboard/RecentOrders.jsx';
import RevenueChart from '@/views/components/dashboard/RevenueChart.jsx';
import { Button } from '@/views/components/ui/button';

const metrics = [
    {
        label: 'Total revenue',
        value: '$45,231',
        change: '+12.5%',
        summary: 'Trending up this month',
        detail: 'Compared with the previous 30 days',
    },
    {
        label: 'New customers',
        value: '1,234',
        change: '+8.2%',
        summary: 'Acquisition is growing',
        detail: '102 more customers this period',
    },
    {
        label: 'Active accounts',
        value: '8,549',
        change: '+5.7%',
        summary: 'Strong user retention',
        detail: '72.4% monthly active rate',
    },
    {
        label: 'Refund rate',
        value: '1.8%',
        change: '-0.4%',
        summary: 'Moving in the right direction',
        detail: 'Below the 2.5% target',
        positive: false,
    },
];

/**
 * Renders the authenticated example analytics dashboard.
 * @returns {import('react').ReactElement|string} Rendered React content.
 * @example
 * <Dashboard />
 */
export default function Dashboard() {
    const { props } = usePage();
    const { user } = props;
    /**
     * Handle download.
     *
     */
    const handleDownload = () => {
        const rows = [
            ['Metric', 'Value', 'Change'],
            ...metrics.map(metric => [metric.label, metric.value, metric.change]),
        ];
        const csv = rows
            .map(row => row.map(value => `"${value.replaceAll('"', '""')}"`).join(','))
            .join('\n');
        const BrowserURL = Reflect.get(window, 'URL');
        const BrowserBlob = Reflect.get(window, 'Blob');
        const createObjectURL = Reflect.get(BrowserURL, 'createObjectURL');
        const url = Reflect.apply(createObjectURL, BrowserURL, [new BrowserBlob([csv], { type: 'text/csv;charset=utf-8' })]);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'dashboard-report.csv';
        link.click();
        const revokeObjectURL = Reflect.get(BrowserURL, 'revokeObjectURL');
        Reflect.apply(revokeObjectURL, BrowserURL, [url]);
    };

    return (
        <>
            <Head title="Dashboard" />
            <DashboardShell>
                <div className="mx-auto max-w-[1440px]">
                    <section className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                Welcome back, {user?.name?.split(' ')[0] || 'there'}
                            </p>
                            <h1 className="mt-1 font-display text-3xl font-semibold tracking-[-0.8px] text-foreground">
                                Business overview
                            </h1>
                            <p className="mt-2 text-body">
                                Here is what is happening with your product today.
                            </p>
                        </div>
                        <Button type="button" onClick={handleDownload}>Download report</Button>
                    </section>

                    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Key metrics">
                        {metrics.map(metric => <MetricCard key={metric.label} {...metric} />)}
                    </section>

                    <div className="mt-6 grid gap-6">
                        <RevenueChart />
                        <RecentOrders />
                    </div>
                </div>
            </DashboardShell>
        </>
    );
}
