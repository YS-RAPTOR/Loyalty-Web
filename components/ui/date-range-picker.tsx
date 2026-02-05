"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, ChevronLeft } from "lucide-react";
import { format, startOfDay, endOfDay, subDays, startOfMonth } from "date-fns";
import type { DateRange } from "react-day-picker";

type DatePreset = "today" | "yesterday" | "last7" | "last30" | "thisMonth" | "allTime" | "custom";

interface PresetOption {
    label: string;
    value: DatePreset;
    getRange: () => DateRange | undefined;
}

const defaultPresets: PresetOption[] = [
    {
        label: "Today",
        value: "today",
        getRange: () => {
            const today = new Date();
            return { from: startOfDay(today), to: endOfDay(today) };
        },
    },
    {
        label: "Yesterday",
        value: "yesterday",
        getRange: () => {
            const yesterday = subDays(new Date(), 1);
            return { from: startOfDay(yesterday), to: endOfDay(yesterday) };
        },
    },
    {
        label: "Last 7 days",
        value: "last7",
        getRange: () => {
            const today = new Date();
            return { from: startOfDay(subDays(today, 6)), to: endOfDay(today) };
        },
    },
    {
        label: "Last 30 days",
        value: "last30",
        getRange: () => {
            const today = new Date();
            return { from: startOfDay(subDays(today, 29)), to: endOfDay(today) };
        },
    },
    {
        label: "This month",
        value: "thisMonth",
        getRange: () => {
            const today = new Date();
            return { from: startOfMonth(today), to: endOfDay(today) };
        },
    },
    {
        label: "All Time",
        value: "allTime",
        getRange: () => undefined,
    },
];

interface DateRangePickerProps {
    value: DateRange | undefined;
    onChange: (range: DateRange | undefined) => void;
    presets?: PresetOption[];
    defaultPreset?: DatePreset;
    align?: "start" | "center" | "end";
}

export function DateRangePicker({
    value,
    onChange,
    presets = defaultPresets,
    defaultPreset = "today",
    align = "end",
}: DateRangePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [showCustomView, setShowCustomView] = useState(false);
    const [pendingRange, setPendingRange] = useState<DateRange | undefined>(undefined);
    const [selectedPreset, setSelectedPreset] = useState<DatePreset>(defaultPreset);

    // Reset to presets view when popover closes
    useEffect(() => {
        if (!isOpen) {
            setShowCustomView(false);
            setPendingRange(undefined);
        }
    }, [isOpen]);

    const handlePresetSelect = (preset: PresetOption) => {
        setSelectedPreset(preset.value);
        onChange(preset.getRange());
        setIsOpen(false);
    };

    const handleCustomClick = () => {
        setPendingRange(undefined);
        setShowCustomView(true);
    };

    const handleBackToPresets = () => {
        setShowCustomView(false);
        setPendingRange(undefined);
    };

    const handleCalendarSelect = (range: DateRange | undefined) => {
        setPendingRange(range);
    };

    const handleApplyCustomRange = () => {
        if (pendingRange?.from) {
            onChange(pendingRange);
            setSelectedPreset("custom");
            setIsOpen(false);
        }
    };

    const formatDateRangeButton = () => {
        if (selectedPreset === "allTime") {
            return "All Time";
        }
        if (!value?.from) {
            return "Select date range";
        }
        if (value.to && value.from.getTime() !== value.to.getTime()) {
            return `${format(value.from, "MMM d, yyyy")} - ${format(value.to, "MMM d, yyyy")}`;
        }
        return format(value.from, "MMM d, yyyy");
    };

    const formatPendingRange = () => {
        if (!pendingRange?.from) {
            return "Select start date";
        }
        if (!pendingRange.to) {
            return `${format(pendingRange.from, "MMM d, yyyy")} - Select end date`;
        }
        return `${format(pendingRange.from, "MMM d, yyyy")} - ${format(pendingRange.to, "MMM d, yyyy")}`;
    };

    const canApply = pendingRange?.from && pendingRange?.to;

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger
                render={
                    <Button variant="outline" className="w-full sm:w-auto justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                        <span className="truncate">{formatDateRangeButton()}</span>
                    </Button>
                }
            />
            <PopoverContent className="w-auto p-0" align={align}>
                {!showCustomView ? (
                    /* Presets View */
                    <div className="flex flex-col p-1 min-w-[160px]">
                        {presets.map((preset) => (
                            <Button
                                key={preset.value}
                                variant={selectedPreset === preset.value ? "secondary" : "ghost"}
                                size="sm"
                                className="justify-start"
                                onClick={() => handlePresetSelect(preset)}
                            >
                                {preset.label}
                            </Button>
                        ))}
                        <div className="my-1 h-px bg-border" />
                        <Button
                            variant={selectedPreset === "custom" ? "secondary" : "ghost"}
                            size="sm"
                            className="justify-start"
                            onClick={handleCustomClick}
                        >
                            Custom Range...
                        </Button>
                    </div>
                ) : (
                    /* Custom Date View */
                    <div className="flex flex-col">
                        {/* Header with back button */}
                        <div className="flex items-center gap-2 p-2 border-b">
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={handleBackToPresets}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="text-sm font-medium">Custom Range</span>
                        </div>
                        {/* Calendar */}
                        <div className="p-2">
                            <Calendar
                                mode="range"
                                selected={pendingRange}
                                onSelect={handleCalendarSelect}
                                numberOfMonths={1}
                                disabled={{ after: new Date() }}
                            />
                        </div>
                        {/* Footer with selected range and apply button */}
                        <div className="flex items-center justify-between gap-2 p-2 border-t">
                            <span className="text-xs text-muted-foreground truncate">
                                {formatPendingRange()}
                            </span>
                            <Button
                                size="sm"
                                disabled={!canApply}
                                onClick={handleApplyCustomRange}
                            >
                                Apply
                            </Button>
                        </div>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
}
