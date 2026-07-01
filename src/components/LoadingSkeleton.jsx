import React from 'react';

const SkeletonBlock = ({ className = '' }) => (
  <div className={`bg-gradient-to-r from-[#1A1A2E] via-[#16213E] to-[#1A1A2E] rounded ${className}`} />
);

const TableSkeleton = ({ rows, cols }) => (
  <div className="w-full overflow-x-auto">
    {/* Header */}
    <div className="flex gap-3 px-4 py-3 border-b border-[#6C63FF]/10 mb-2">
      {Array.from({ length: cols }).map((_, i) => (
        <SkeletonBlock
          key={i}
          className={`h-4 ${i === 0 ? 'w-1/4' : i === cols - 1 ? 'w-1/6' : 'flex-1'}`}
        />
      ))}
    </div>

    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIdx) => (
      <div
        key={rowIdx}
        className={`flex gap-3 px-4 py-3 border-b border-[#6C63FF]/5 ${
          rowIdx % 2 === 0 ? 'bg-[#1A1A2E]/20' : ''
        }`}
      >
        {/* Avatar + text cell */}
        <div className="flex items-center gap-2 w-1/4">
          <SkeletonBlock className="h-8 w-8 rounded-full shrink-0" />
          <SkeletonBlock className="h-3.5 flex-1" />
        </div>

        {/* Middle cols */}
        {Array.from({ length: cols - 2 }).map((_, colIdx) => (
          <div key={colIdx} className="flex-1 flex items-center">
            <SkeletonBlock
              className={`h-3.5 ${colIdx % 2 === 0 ? 'w-3/4' : 'w-1/2'}`}
            />
          </div>
        ))}

        {/* Badge cell */}
        <div className="w-1/6 flex items-center">
          <SkeletonBlock className="h-5 w-16 rounded-full" />
        </div>
      </div>
    ))}
  </div>
);

const CardsSkeleton = ({ rows, cols }) => {
  const total = rows * cols;

  return (
    <div
      className={`grid gap-4 grid-cols-1 sm:grid-cols-2 ${
        cols >= 3 ? 'lg:grid-cols-3' : cols >= 2 ? 'lg:grid-cols-2' : ''
      } ${cols >= 4 ? 'xl:grid-cols-4' : ''}`}
    >
      {Array.from({ length: total }).map((_, idx) => (
        <div
          key={idx}
          className="bg-[#1A1A2E] border border-[#6C63FF]/10 rounded-xl p-5 flex flex-col gap-4"
        >
          {/* Card header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <SkeletonBlock className="h-10 w-10 rounded-lg shrink-0" />
              <div className="flex-1 space-y-2">
                <SkeletonBlock className="h-3.5 w-3/4" />
                <SkeletonBlock className="h-3 w-1/2" />
              </div>
            </div>
            <SkeletonBlock className="h-5 w-14 rounded-full shrink-0" />
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 gap-3">
            {[1, 2].map((s) => (
              <div key={s} className="bg-[#0A0A0F]/60 rounded-lg p-3 space-y-1.5">
                <SkeletonBlock className="h-3 w-2/3" />
                <SkeletonBlock className="h-5 w-1/2" />
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <SkeletonBlock className="h-3 w-1/3" />
              <SkeletonBlock className="h-3 w-10" />
            </div>
            <div className="w-full bg-[#0A0A0F] rounded-full h-1.5 overflow-hidden">
              <SkeletonBlock
                className={`h-full rounded-full ${
                  idx % 3 === 0 ? 'w-3/4' : idx % 3 === 1 ? 'w-1/2' : 'w-2/3'
                }`}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-1 border-t border-[#6C63FF]/5">
            <SkeletonBlock className="h-3 w-1/3" />
            <SkeletonBlock className="h-7 w-20 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
};

const ListSkeleton = ({ rows }) => (
  <div className="flex flex-col divide-y divide-[#6C63FF]/5">
    {Array.from({ length: rows }).map((_, idx) => (
      <div key={idx} className="flex items-center gap-4 py-3.5 px-4">
        {/* Index / icon */}
        <div className="flex items-center justify-center w-8 h-8 shrink-0">
          <SkeletonBlock className="h-6 w-6 rounded-md" />
        </div>

        {/* Avatar */}
        <SkeletonBlock className="h-9 w-9 rounded-full shrink-0" />

        {/* Main content */}
        <div className="flex-1 min-w-0 space-y-2">
          <SkeletonBlock className={`h-3.5 ${idx % 2 === 0 ? 'w-2/5' : 'w-1/3'}`} />
          <SkeletonBlock className={`h-3 ${idx % 3 === 0 ? 'w-3/5' : 'w-1/2'}`} />
        </div>

        {/* Right side: metric + badge */}
        <div className="hidden sm:flex flex-col items-end gap-1.5 shrink-0">
          <SkeletonBlock className="h-4 w-16" />
          <SkeletonBlock className="h-3 w-10" />
        </div>

        {/* Trend indicator */}
        <div className="hidden md:flex items-center gap-1 shrink-0">
          <SkeletonBlock className="h-4 w-4 rounded-sm" />
          <SkeletonBlock className="h-3 w-10" />
        </div>

        {/* Action */}
        <SkeletonBlock className="h-7 w-7 rounded-lg shrink-0" />
      </div>
    ))}
  </div>
);

const LoadingSkeleton = ({
  rows = 5,
  cols = 3,
  type = 'table',
}) => {
  const safeRows = Math.max(1, Math.min(rows, 20));
  const safeCols = Math.max(1, Math.min(cols, 6));

  const renderSkeleton = () => {
    switch (type) {
      case 'cards':
        return <CardsSkeleton rows={safeRows} cols={safeCols} />;
      case 'list':
        return <ListSkeleton rows={safeRows} cols={safeCols} />;
      case 'table':
      default:
        return <TableSkeleton rows={safeRows} cols={safeCols} />;
    }
  };

  return (
    <div
      className="animate-pulse w-full bg-[#0A0A0F] rounded-xl overflow-hidden"
      role="status"
      aria-label="Loading content"
      aria-busy="true"
    >
      {/* Top bar shimmer */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#6C63FF]/10 mb-1">
        <div className="flex items-center gap-3">
          <SkeletonBlock className="h-5 w-5 rounded" />
          <SkeletonBlock className="h-4 w-32" />
        </div>
        <div className="flex items-center gap-2">
          <SkeletonBlock className="h-7 w-20 rounded-lg" />
          <SkeletonBlock className="h-7 w-7 rounded-lg" />
        </div>
      </div>

      {/* Content area */}
      <div className={type === 'cards' ? 'p-4' : type === 'list' ? 'px-0 py-1' : 'py-1'}>
        {renderSkeleton()}
      </div>

      {/* Footer / pagination shimmer */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-[#6C63FF]/10 mt-1">
        <SkeletonBlock className="h-3.5 w-28" />
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4].map((p) => (
            <SkeletonBlock key={p} className="h-7 w-7 rounded-lg" />
          ))}
        </div>
      </div>

      {/* Accessible sr-only text */}
      <span className="sr-only">Loading URUS Market Intelligence data…</span>
    </div>
  );
};

export default LoadingSkeleton;