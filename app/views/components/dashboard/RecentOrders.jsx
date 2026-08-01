import { useState } from 'react';
import { Link } from '@inertiajs/react';
import { ArrowUpRight, Search } from 'lucide-react';
import { Badge } from '@/views/components/ui/badge';
import { Button } from '@/views/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/views/components/ui/card';
import { Input } from '@/views/components/ui/input';

const orders = [
    { id: 'ORD-1048', customer: 'Olivia Martin', email: 'olivia@example.com', amount: '$1,999.00', status: 'Paid' },
    { id: 'ORD-1047', customer: 'Jackson Lee', email: 'jackson@example.com', amount: '$749.00', status: 'Paid' },
    { id: 'ORD-1046', customer: 'Sophia Brown', email: 'sophia@example.com', amount: '$299.00', status: 'Pending' },
    { id: 'ORD-1045', customer: 'Noah Williams', email: 'noah@example.com', amount: '$2,399.00', status: 'Paid' },
    { id: 'ORD-1044', customer: 'Ava Rodriguez', email: 'ava@example.com', amount: '$499.00', status: 'Refunded' },
    { id: 'ORD-1043', customer: 'Liam Davis', email: 'liam@example.com', amount: '$899.00', status: 'Pending' },
];

const statusVariants = {
    Paid: 'default',
    Pending: 'secondary',
    Refunded: 'outline',
};

/**
 * Example searchable orders table for the starter dashboard.
 *
 * @returns {import('react').ReactElement} Recent orders table.
 */
export default function RecentOrders() {
    const [query, setQuery] = useState('');
    const normalizedQuery = query.trim().toLowerCase();
    const filteredOrders = orders.filter(order => (
        !normalizedQuery
        || order.id.toLowerCase().includes(normalizedQuery)
        || order.customer.toLowerCase().includes(normalizedQuery)
        || order.email.toLowerCase().includes(normalizedQuery)
        || order.status.toLowerCase().includes(normalizedQuery)
    ));

    return (
        <Card id="orders" className="min-w-0 border border-border bg-background shadow-card">
            <CardHeader className="gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
                <div>
                    <CardTitle>Recent orders</CardTitle>
                    <p className="mt-1 text-body">
                        The latest transactions from your store
                    </p>
                </div>
                <div className="relative w-full sm:w-64">
                    <Search
                        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                        aria-hidden="true"
                    />
                    <Input
                        type="search"
                        value={query}
                        onChange={event => setQuery(event.target.value)}
                        placeholder="Search orders..."
                        className="pl-9"
                        aria-label="Search orders"
                    />
                </div>
            </CardHeader>
            <CardContent className="min-w-0 px-0 pt-5">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[680px] text-left">
                        <thead className="border-y border-border bg-surface-soft text-xs font-semibold uppercase tracking-[0.05em] text-muted-foreground">
                            <tr>
                                <th className="px-6 py-3">Order</th>
                                <th className="px-6 py-3">Customer</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3 text-right">Amount</th>
                                <th className="w-16 px-6 py-3" aria-label="Actions" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredOrders.map(order => (
                                <tr key={order.id} className="hover:bg-surface-soft/70">
                                    <td className="whitespace-nowrap px-6 py-4 font-medium text-foreground">
                                        {order.id}
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-medium text-foreground">{order.customer}</p>
                                        <p className="mt-0.5 text-body">{order.email}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge variant={statusVariants[order.status]}>{order.status}</Badge>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-right font-medium tabular-nums text-foreground">
                                        {order.amount}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Button asChild variant="ghost" size="icon-xs">
                                            <Link href="/users" aria-label={`View ${order.id}`}>
                                                <ArrowUpRight aria-hidden="true" />
                                            </Link>
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredOrders.length === 0 && (
                    <div className="px-6 py-12 text-center">
                        <p className="font-medium text-foreground">No orders found</p>
                        <p className="mt-1 text-body">
                            Try a different customer, order number, or status.
                        </p>
                    </div>
                )}

                <div className="flex items-center justify-between border-t border-border px-6 pt-5 text-sm text-muted-foreground">
                    <span>{filteredOrders.length} of {orders.length} orders</span>
                    <Button asChild variant="outline" size="sm">
                        <Link href="/users">View all</Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
