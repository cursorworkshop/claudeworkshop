'use client';

import * as React from 'react';
import { Legend, ResponsiveContainer, Tooltip } from 'recharts';

import { cn } from '@/lib/utils';

export type ChartConfig = Record<
  string,
  {
    label?: React.ReactNode;
    color?: string;
  }
>;

type ChartContextValue = {
  config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextValue | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);
  if (!context) {
    throw new Error('Chart components must be used within <ChartContainer />');
  }
  return context;
}

export const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    config: ChartConfig;
    children: React.ReactNode;
  }
>(({ config, className, children, style, ...props }, ref) => {
  const chartStyle = React.useMemo(() => {
    const css: Record<string, string> = {};
    for (const [key, item] of Object.entries(config)) {
      if (item?.color) {
        css[`--color-${key}`] = item.color;
      }
    }
    return css as React.CSSProperties;
  }, [config]);

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        ref={ref}
        className={cn(
          'flex aspect-video w-full justify-center text-xs text-muted-foreground',
          // Recharts default styles are hard to tame; this keeps the admin UI consistent.
          '[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground',
          '[&_.recharts-cartesian-grid_line[stroke=\"#ccc\"]]:stroke-border/50',
          '[&_.recharts-curve.recharts-tooltip-cursor]:stroke-border',
          '[&_.recharts-dot[stroke=\"#fff\"]]:stroke-transparent',
          '[&_.recharts-layer]:outline-none',
          '[&_.recharts-polar-grid_[stroke=\"#ccc\"]]:stroke-border',
          '[&_.recharts-radial-bar-background-sector]:fill-muted',
          '[&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted',
          '[&_.recharts-reference-line_[stroke=\"#ccc\"]]:stroke-border',
          '[&_.recharts-sector[stroke=\"#fff\"]]:stroke-transparent',
          '[&_.recharts-sector]:outline-none',
          '[&_.recharts-surface]:outline-none',
          className
        )}
        style={{ ...chartStyle, ...style }}
        {...props}
      >
        <ResponsiveContainer>{children}</ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
});
ChartContainer.displayName = 'ChartContainer';

export const ChartTooltip = Tooltip;
export const ChartLegend = Legend;

function defaultNumberFormat(value: unknown) {
  if (typeof value === 'number') return value.toLocaleString();
  return String(value ?? '');
}

export function ChartTooltipContent({
  active,
  payload,
  label,
  className,
  indicator = 'dot',
  hideLabel = false,
  hideIndicator = false,
  labelFormatter,
  valueFormatter,
}: {
  active?: boolean;
  payload?: Array<{
    dataKey?: string | number;
    name?: string;
    value?: unknown;
    color?: string;
  }>;
  label?: unknown;
  className?: string;
  indicator?: 'dot' | 'line';
  hideLabel?: boolean;
  hideIndicator?: boolean;
  labelFormatter?: (label: unknown, payload?: unknown[]) => React.ReactNode;
  valueFormatter?: (value: unknown, name?: string) => React.ReactNode;
}) {
  const { config } = useChart();

  if (!active || !payload?.length) return null;

  const resolvedLabel = hideLabel
    ? null
    : labelFormatter
      ? labelFormatter(label, payload as unknown[])
      : (label as React.ReactNode);

  return (
    <div
      className={cn(
        'min-w-[220px] rounded-lg border border-zinc-200 bg-white p-2 shadow-sm',
        className
      )}
    >
      {resolvedLabel ? (
        <div className='mb-1 px-1 text-xs font-medium text-zinc-900'>
          {resolvedLabel}
        </div>
      ) : null}
      <div className='grid gap-1'>
        {payload.map(item => {
          const key = String(item.dataKey || item.name || '');
          const entry = config[key] || {};
          const name = entry.label ?? item.name ?? key;
          const color =
            entry.color ||
            (item.color as string | undefined) ||
            `var(--color-${key})`;
          const value = valueFormatter
            ? valueFormatter(item.value, key)
            : defaultNumberFormat(item.value);

          return (
            <div
              key={key}
              className='flex items-center justify-between gap-3 px-1 text-xs text-zinc-700'
            >
              <div className='flex items-center gap-2'>
                {!hideIndicator && (
                  <span
                    aria-hidden
                    className={cn(
                      'shrink-0',
                      indicator === 'line'
                        ? 'h-0.5 w-3 rounded-full'
                        : 'h-2 w-2 rounded-sm'
                    )}
                    style={{ backgroundColor: color }}
                  />
                )}
                <span className='truncate'>{name}</span>
              </div>
              <span className='font-mono tabular-nums text-zinc-900'>
                {value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
