"use client"

import React from 'react';
import { MonthlyRevenue } from './MonthlyRevenueChart';

interface MonthlyRevenueTableProps {
  data: MonthlyRevenue[];
  showDetails?: boolean;
}

const MonthlyRevenueTable: React.FC<MonthlyRevenueTableProps> = ({
  data,
  showDetails = false
}) => {
  // 총합 계산
  const totals = data.reduce((acc, month) => ({
    totalRevenue: acc.totalRevenue + month.totalRevenue,
    totalCost: acc.totalCost + month.totalCost,
    margin: acc.margin + month.margin,
    depositAmount: acc.depositAmount + month.depositAmount,
    balanceAmount: acc.balanceAmount + month.balanceAmount,
    fullPaymentAmount: acc.fullPaymentAmount + month.fullPaymentAmount,
    refundedAmount: acc.refundedAmount + month.refundedAmount,
    participantCount: acc.participantCount + month.participantCount,
    tourCount: acc.tourCount + month.tourCount,
  }), {
    totalRevenue: 0,
    totalCost: 0,
    margin: 0,
    depositAmount: 0,
    balanceAmount: 0,
    fullPaymentAmount: 0,
    refundedAmount: 0,
    participantCount: 0,
    tourCount: 0,
  });

  const totalMarginRate = totals.totalRevenue > 0
    ? ((totals.margin / totals.totalRevenue) * 100).toFixed(1)
    : '0.0';

  const formatCurrency = (value: number) => {
    return value.toLocaleString('ko-KR');
  };

  if (showDetails) {
    // 상세 테이블
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">
                월
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider border-b">
                정산 금액
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider border-b">
                계약금
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider border-b">
                잔금
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider border-b">
                전액 입금
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider border-b">
                환불
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider border-b">
                총 비용
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider border-b">
                마진
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider border-b">
                마진률
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider border-b">
                참가자
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider border-b">
                투어
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((month, index) => (
              <tr key={month.month} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                  {month.monthLabel}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-900">
                  {formatCurrency(month.totalRevenue)}원
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-600">
                  {formatCurrency(month.depositAmount)}원
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-600">
                  {formatCurrency(month.balanceAmount)}원
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-600">
                  {formatCurrency(month.fullPaymentAmount)}원
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-red-600">
                  {formatCurrency(month.refundedAmount)}원
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-600">
                  {formatCurrency(month.totalCost)}원
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-semibold text-green-600">
                  {formatCurrency(month.margin)}원
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-semibold text-green-600">
                  {month.totalCost > 0 ? (
                    `${month.marginRate.toFixed(1)}%`
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-600">
                  {month.participantCount}명
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-600">
                  {month.tourCount}개
                </td>
              </tr>
            ))}
            {/* 총합 행 */}
            <tr className="bg-blue-50 font-semibold">
              <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-gray-900">
                총합
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-bold text-gray-900">
                {formatCurrency(totals.totalRevenue)}원
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-bold text-gray-900">
                {formatCurrency(totals.depositAmount)}원
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-bold text-gray-900">
                {formatCurrency(totals.balanceAmount)}원
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-bold text-gray-900">
                {formatCurrency(totals.fullPaymentAmount)}원
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-bold text-red-600">
                {formatCurrency(totals.refundedAmount)}원
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-bold text-gray-900">
                {formatCurrency(totals.totalCost)}원
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-bold text-green-600">
                {formatCurrency(totals.margin)}원
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-bold text-green-600">
                {totalMarginRate}%
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-bold text-gray-900">
                {totals.participantCount}명
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-bold text-gray-900">
                {totals.tourCount}개
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  // 요약 테이블
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">
              월
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider border-b">
              총 수입
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider border-b">
              총 비용
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider border-b">
              마진
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider border-b">
              마진률
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((month, index) => (
            <tr key={month.month} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                {month.monthLabel}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-900">
                {formatCurrency(month.totalRevenue)}원
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-600">
                {formatCurrency(month.totalCost)}원
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-semibold text-green-600">
                {formatCurrency(month.margin)}원
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-semibold text-green-600">
                {month.marginRate.toFixed(1)}%
              </td>
            </tr>
          ))}
          {/* 총합 행 */}
          <tr className="bg-blue-50 font-semibold">
            <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-gray-900">
              총합
            </td>
            <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-bold text-gray-900">
              {formatCurrency(totals.totalRevenue)}원
            </td>
            <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-bold text-gray-900">
              {formatCurrency(totals.totalCost)}원
            </td>
            <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-bold text-green-600">
              {formatCurrency(totals.margin)}원
            </td>
            <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-bold text-green-600">
              {totals.totalCost > 0 ? (
                `${totalMarginRate}%`
              ) : (
                <span className="text-gray-400">-</span>
              )}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default MonthlyRevenueTable;

