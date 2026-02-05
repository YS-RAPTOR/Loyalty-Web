"use client";

interface TruncatedAxisTickProps {
    x: number;
    y: number;
    payload: { value: string };
    width: number;
    onClick?: () => void;
    isClickable?: boolean;
    isMuted?: boolean;
}

export function TruncatedAxisTick({ 
    x, 
    y, 
    payload, 
    width,
    onClick,
    isClickable = false,
    isMuted = false,
}: TruncatedAxisTickProps) {
    const paddingLeft = 8;
    const paddingRight = 8;

    const handleClick = (e: React.MouseEvent) => {
        if (isClickable && onClick) {
            e.stopPropagation();
            onClick();
        }
    };

    return (
        <g transform={`translate(${x},${y})`}>
            <foreignObject
                x={-width + paddingLeft}
                y={-10}
                width={width - paddingLeft - paddingRight}
                height={20}
            >
                <div
                    title={payload.value}
                    onClick={handleClick}
                    style={{
                        width: "100%",
                        textAlign: "right",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        fontSize: "12px",
                        lineHeight: "20px",
                        textDecoration: isClickable ? "underline" : undefined,
                        cursor: isClickable ? "pointer" : undefined,
                    }}
                    className={isMuted ? "text-muted-foreground" : isClickable ? "text-primary" : "text-foreground"}
                >
                    {payload.value}
                </div>
            </foreignObject>
        </g>
    );
}
