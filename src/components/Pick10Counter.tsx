"use client";

interface Pick10CounterProps {
  used: number;
  max: number;
}

export function Pick10Counter({ used, max }: Pick10CounterProps) {
  const over = used > max;

  return (
    <div className="pick10-bar flex flex-col items-end gap-1.5">
      <div className="flex items-center gap-[3px]">
        {Array.from({ length: max }).map((_, index) => (
          <span
            key={index}
            className={[
              "h-2 w-3 sm:w-4",
              index < used
                ? over
                  ? "bg-red-500"
                  : "bg-[var(--accent)]"
                : "bg-zinc-700/80",
            ].join(" ")}
          />
        ))}
      </div>
      <div
        className={[
          "font-display text-3xl leading-none tracking-wide sm:text-4xl",
          over ? "text-red-400" : "text-[var(--accent)]",
        ].join(" ")}
      >
        {used}/{max}
      </div>
    </div>
  );
}
