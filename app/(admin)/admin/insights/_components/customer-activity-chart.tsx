"use client";

import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from "@/components/ui/chart";
import { TruncatedAxisTick } from "./truncated-axis-tick";

const BAR_HEIGHT = 40;
const CHART_PADDING = 20;
const LEGEND_HEIGHT = 60;

interface OfferInfo {
    offerId: string;
    name: string;
    displayName: string;
    color: string;
    isDiscontinued: boolean;
}

interface CustomerData {
    customerId: string;
    customerName: string;
    total: number;
    [key: string]: string | number;
}

interface CustomerActivityChartProps {
    data: CustomerData[];
    offers: OfferInfo[];
    config: ChartConfig;
    onCustomerClick?: (customerId: string) => void;
}

export function CustomerActivityChart({
    data,
    offers,
    config,
    onCustomerClick,
}: CustomerActivityChartProps) {
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

    const handleCustomerClick = (customerId: string) => {
        onCustomerClick?.(customerId);
    };

    return (
        <ChartContainer
            config={config}
            className="w-full"
            style={{ height: data.length * BAR_HEIGHT + CHART_PADDING + LEGEND_HEIGHT }}
        >
            <BarChart
                data={data}
                layout="vertical"
                margin={{ left: 0, right: 40 }}
                onClick={handleClick}
            >
                <CartesianGrid horizontal={false} />
                <YAxis
                    dataKey="customerName"
                    type="category"
                    tickLine={false}
                    axisLine={false}
                    width={120}
                    tick={(props) => {
                        const customer = data[props.index];
                        const isDeleted = props.payload.value === "Deleted Customer";
                        return (
                            <TruncatedAxisTick
                                {...props}
                                width={120}
                                isClickable={!isDeleted}
                                isMuted={isDeleted}
                                onClick={() => customer && handleCustomerClick(customer.customerId)}
                            />
                        );
                    }}
                />
                <XAxis type="number" hide />
                <ChartTooltip
                    active={activeIndex !== null}
                    cursor={activeIndex !== null ? { fill: "var(--muted)", opacity: 0.5 } : false}
                    content={
                        <ChartTooltipContent
                            labelFormatter={(_, payload) => {
                                if (payload && payload[0]) {
                                    return payload[0].payload.customerName;
                                }
                                return "";
                            }}
                        />
                    }
                />
                <ChartLegend
                    content={<ChartLegendContent className="flex-wrap" />}
                />
                {offers.map((offer, index) => (
                    <Bar
                        key={offer.offerId}
                        dataKey={offer.offerId}
                        stackId="offers"
                        fill={offer.color}
                        fillOpacity={offer.isDiscontinued ? 0.5 : 1}
                        radius={0}
                        barSize={24}
                        activeIndex={activeIndex ?? undefined}
                        activeBar={{ stroke: "var(--foreground)", strokeWidth: 2 }}
                    >
                        {index === offers.length - 1 && (
                            <LabelList
                                dataKey="total"
                                position="right"
                                className="fill-foreground text-xs"
                            />
                        )}
                    </Bar>
                ))}
            </BarChart>
        </ChartContainer>
    );
}
