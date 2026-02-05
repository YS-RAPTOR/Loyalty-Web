"use client";

import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { TruncatedAxisTick } from "./truncated-axis-tick";

const BAR_HEIGHT = 40;
const CHART_PADDING = 20;

interface HorizontalBarChartProps {
    data: Array<{
        name: string;
        count: number;
        [key: string]: unknown;
    }>;
    config: ChartConfig;
    yAxisWidth?: number;
}

export function HorizontalBarChart({
    data,
    config,
    yAxisWidth = 150,
}: HorizontalBarChartProps) {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const handleClick = (state: { activeTooltipIndex?: number } | null) => {
        if (state && state.activeTooltipIndex !== undefined) {
            setActiveIndex((prev) =>
                prev === state.activeTooltipIndex ? null : state.activeTooltipIndex ?? null
            );
        } else {
            setActiveIndex(null);
        }
    };

    return (
        <ChartContainer
            config={config}
            className="w-full"
            style={{ height: data.length * BAR_HEIGHT + CHART_PADDING }}
        >
            <BarChart
                data={data}
                layout="vertical"
                margin={{ left: 0, right: 40 }}
                onClick={handleClick}
            >
                <CartesianGrid horizontal={false} />
                <YAxis
                    dataKey="name"
                    type="category"
                    tickLine={false}
                    axisLine={false}
                    width={yAxisWidth}
                    interval={0}
                    tick={(props) => <TruncatedAxisTick {...props} width={yAxisWidth} />}
                />
                <XAxis type="number" hide />
                <ChartTooltip
                    active={activeIndex !== null}
                    cursor={activeIndex !== null ? { fill: "var(--muted)", opacity: 0.5 } : false}
                    content={<ChartTooltipContent hideLabel />}
                />
                <Bar
                    dataKey="count"
                    fill="var(--primary)"
                    radius={[0, 4, 4, 0]}
                    barSize={24}
                    activeIndex={activeIndex ?? undefined}
                    activeBar={{ stroke: "var(--foreground)", strokeWidth: 2 }}
                >
                    <LabelList
                        dataKey="count"
                        position="right"
                        className="fill-foreground text-xs"
                    />
                </Bar>
            </BarChart>
        </ChartContainer>
    );
}
