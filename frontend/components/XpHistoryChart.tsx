'use client';

import React, { useMemo } from 'react';

interface XpHistoryChartProps {
  xpHistory?: any;
}

export default function XpHistoryChart({ xpHistory }: XpHistoryChartProps) {
  // Lấy danh sách 7 ngày gần nhất kèm XP tương ứng
  const { chartData, maxVal, dailyGoal } = useMemo(() => {
    const daysOfWeek = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const now = new Date();
    // Múi giờ UTC+7 cho Việt Nam
    const offset = 7 * 60 * 60 * 1000;
    
    const historyMap = new Map<string, number>();
    if (xpHistory) {
      try {
        const records = Array.isArray(xpHistory)
          ? xpHistory
          : typeof xpHistory === 'string'
            ? JSON.parse(xpHistory)
            : [];
        records.forEach((r: any) => {
          if (r && r.date) {
            historyMap.set(r.date, r.xp || 0);
          }
        });
      } catch (err) {
        console.error('Error parsing xpHistory:', err);
      }
    }

    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000 + offset);
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = daysOfWeek[d.getDay()];
      const xp = historyMap.get(dateStr) || 0;
      data.push({ dateStr, dayLabel, xp });
    }

    // Giá trị XP lớn nhất để chuẩn hóa chiều cao cột (tối thiểu là 30 XP)
    const max = Math.max(...data.map(d => d.xp), 30);
    return {
      chartData: data,
      maxVal: max,
      dailyGoal: 20 // Mục tiêu XP hàng ngày mặc định
    };
  }, [xpHistory]);

  const height = 160;
  const chartHeight = 110;
  const baseline = 130;
  const barWidth = 32;
  const barSpacing = 54;
  const startX = 30;

  return (
    <div className="bg-surface-container p-6 rounded-3xl border-2 border-outline-variant/30 shadow-md">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h4 className="font-button text-xs font-black text-on-surface-variant/70 uppercase tracking-widest leading-none mb-1">
            HIỆU SUẤT HỌC TẬP
          </h4>
          <h3 className="font-headline-md text-base md:text-lg text-on-surface">
            Kinh nghiệm 7 ngày qua
          </h3>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-on-surface-variant/80">
          <span className="w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.4)]"></span>
          <span>Đạt mục tiêu (20 XP)</span>
        </div>
      </div>

      <div className="relative w-full">
        {/* Render SVG Chart */}
        <svg viewBox="0 0 420 170" className="w-full h-auto" style={{ overflow: 'visible' }}>
          <defs>
            {/* Blue gradient for normal bars */}
            <linearGradient id="blueGrad" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#60a5fa" />
            </linearGradient>
            
            {/* Gold gradient for reached goal bars */}
            <linearGradient id="goldGrad" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#fbbf24" />
            </linearGradient>

            {/* Glowing filter for reached goal */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Dotted goal line */}
          {(() => {
            const goalY = baseline - (dailyGoal / maxVal) * chartHeight;
            return (
              <g>
                <line
                  x1="15"
                  y1={goalY}
                  x2="405"
                  y2={goalY}
                  stroke="#ef4444"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  opacity="0.6"
                />
                <text
                  x="400"
                  y={goalY - 6}
                  fill="#ef4444"
                  fontSize="8"
                  fontWeight="900"
                  textAnchor="end"
                  opacity="0.8"
                >
                  MỤC TIÊU 20 XP
                </text>
              </g>
            );
          })()}

          {/* Grid Baseline */}
          <line
            x1="15"
            y1={baseline}
            x2="405"
            y2={baseline}
            stroke="var(--md-sys-color-outline-variant)"
            strokeWidth="2"
            opacity="0.2"
          />

          {/* Bars */}
          {chartData.map((day, idx) => {
            const x = startX + idx * barSpacing;
            const barHeight = (day.xp / maxVal) * chartHeight;
            const y = baseline - barHeight;
            const reached = day.xp >= dailyGoal;

            return (
              <g key={day.dateStr} className="group cursor-pointer">
                {/* Background capsule */}
                <rect
                  x={x}
                  y={baseline - chartHeight}
                  width={barWidth}
                  height={chartHeight}
                  rx={barWidth / 2}
                  fill="var(--md-sys-color-surface-container-lowest)"
                  opacity="0.3"
                />

                {/* Active XP Bar (Capsule) */}
                {day.xp > 0 && (
                  <rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={barHeight}
                    rx={barWidth / 2}
                    fill={reached ? 'url(#goldGrad)' : 'url(#blueGrad)'}
                    filter={reached ? 'url(#glow)' : undefined}
                    className="transition-all duration-500 ease-out origin-bottom scale-y-100 hover:brightness-110"
                  />
                )}

                {/* Hover Tooltip / XP Label */}
                <text
                  x={x + barWidth / 2}
                  y={day.xp > 0 ? y - 8 : baseline - 8}
                  fill={reached ? '#fbbf24' : 'var(--md-sys-color-on-surface)'}
                  fontSize="10"
                  fontWeight="900"
                  textAnchor="middle"
                  className="transition-all duration-200 opacity-60 group-hover:opacity-100"
                >
                  {day.xp}
                </text>

                {/* Day label */}
                <text
                  x={x + barWidth / 2}
                  y={baseline + 20}
                  fill="var(--md-sys-color-on-surface-variant)"
                  fontSize="11"
                  fontWeight="900"
                  textAnchor="middle"
                  opacity="0.8"
                >
                  {day.dayLabel}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
