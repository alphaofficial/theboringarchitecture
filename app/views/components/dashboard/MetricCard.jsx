import { TrendingDown, TrendingUp } from 'lucide-react';
import { Badge } from '@/views/components/ui/badge';
import {
    Card,
    CardAction,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/views/components/ui/card';

/**
 * Displays a single dashboard metric with its period-over-period change.
 *
 * @param {{label: string, value: string, change: string, summary: string, detail: string, positive?: boolean}} props
 * @returns {import('react').ReactElement} Metric card.
 */
export default function MetricCard({
    label,
    value,
    change,
    summary,
    detail,
    positive = true,
}) {
    const TrendIcon = positive ? TrendingUp : TrendingDown;

    return (
        <Card className="border border-border bg-background shadow-card">
            <CardHeader className="grid-cols-[1fr_auto] gap-x-4">
                <p className="text-sm font-medium text-muted-foreground">{label}</p>
                <CardTitle className="mt-2 text-3xl tabular-nums">{value}</CardTitle>
                <CardAction>
                    <Badge variant="outline">
                        <TrendIcon aria-hidden="true" />
                        {change}
                    </Badge>
                </CardAction>
            </CardHeader>
            <CardFooter className="mt-5 flex-col items-start gap-1 border-0 bg-transparent pt-0">
                <p className="flex items-center gap-2 font-medium text-foreground">
                    {summary}
                    <TrendIcon className="h-4 w-4" aria-hidden="true" />
                </p>
                <p className="text-body">{detail}</p>
            </CardFooter>
        </Card>
    );
}
