"use client"

import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export interface MonthlyRevenue {
  month: string;              // "2025-01"
  monthLabel: string;         // "1월"
  totalRevenue: number;       // 정산 금액
  totalCost: number;          // 총 비용 (투어 비용 등)
  margin: number;             // 마진 (정산 금액 - 총 비용)
  marginRate: number;         // 마진률 (%)
  depositAmount: number;       // 계약금
  balanceAmount: number;      // 잔금
  fullPaymentAmount: number;  // 전액 입금
  refundedAmount: number;     // 환불 금액
  participantCount: number;   // 참가자 수
  tourCount: number;          // 투어 수
}

interface MonthlyRevenueChartProps {
  data: MonthlyRevenue[];
  chartType?: 'line' | 'bar';
  showCost?: boolean;
}

const MonthlyRevenueChart: React.FC<MonthlyRevenueChartProps> = ({
  data,
  chartType = 'line',
  showCost = false
}) => {
  const formatCurrency = (value: number) => {
    return `${(value / 1000000).toFixed(1)}M`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value.toLocaleString()}원
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (chartType === 'bar') {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="monthLabel" 
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            tickFormatter={formatCurrency}
            tick={{ fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar dataKey="totalRevenue" fill="#3b82f6" name="정산 금액" />
          {showCost && (
            <>
              <Bar dataKey="totalCost" fill="#ef4444" name="총 비용" />
              <Bar dataKey="margin" fill="#10b981" name="마진" />
            </>
          )}
        </BarChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="monthLabel" 
          tick={{ fontSize: 12 }}
        />
        <YAxis 
          tickFormatter={formatCurrency}
          tick={{ fontSize: 12 }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="totalRevenue" 
          stroke="#3b82f6" 
          strokeWidth={2}
          name="정산 금액"
          dot={{ r: 4 }}
        />
        {showCost && (
          <>
            <Line 
              type="monotone" 
              dataKey="totalCost" 
              stroke="#ef4444" 
              strokeWidth={2}
              name="총 비용"
              dot={{ r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="margin" 
              stroke="#10b981" 
              strokeWidth={2}
              name="마진"
              dot={{ r: 4 }}
            />
          </>
        )}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default MonthlyRevenueChart;

