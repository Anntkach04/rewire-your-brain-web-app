type Props = {
  current: number;
  total: number;
};

const INK = "#202020";

/**
 * Global progress bar: active segment 32px @ 100% opacity; others 16px;
 * passed steps 70% opacity; future steps 40%. Color always #202020.
 */
export function StepProgress({ current, total }: Props) {
  return (
    <div
      className="flex w-full items-center justify-center gap-2"
      aria-label={`step ${current} of ${total}`}
    >
      {Array.from({ length: total }).map((_, i) => {
        const n = i + 1;
        const isCurrent = n === current;
        const isPast = n < current;
        const opacity = isCurrent ? 1 : isPast ? 0.7 : 0.4;
        const widthPx = isCurrent ? 32 : 16;

        return (
          <div
            key={i}
            className="h-[3px] shrink-0 rounded-full transition-[width,opacity] duration-300 ease-out"
            style={{
              width: widthPx,
              opacity,
              backgroundColor: INK,
            }}
          />
        );
      })}
    </div>
  );
}
