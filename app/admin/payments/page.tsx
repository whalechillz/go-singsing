"use client";

import React from 'react';
import AdminSidebarLayout from '@/components/AdminSidebarLayout';
import { CreditCard, AlertCircle } from 'lucide-react';

export default function PaymentsPage() {
  return (
    <AdminSidebarLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">결제 관리</h1>
        
        {/* 개발 예정 안내 */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-yellow-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                개발 진행 중
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>결제 관리 기능이 현재 개발 중입니다. 곧 다음과 같은 기능들이 추가될 예정입니다:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>투어별 결제 현황 조회</li>
                  <li>참가자별 결제 상태 확인</li>
                  <li>예약금/잔금 관리</li>
                  <li>그룹 일괄 결제 처리</li>
                  <li>영수증 발행 관리</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* 임시 데이터베이스 구조 안내 */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            <CreditCard className="inline-block h-5 w-5 mr-2" />
            결제 관리 시스템 구조
          </h2>
          
          <div className="prose max-w-none">
            <h3 className="text-base font-medium text-gray-800 mb-2">데이터베이스 테이블:</h3>
            <ul className="list-disc list-inside text-sm text-gray-600">
              <li><code>singsing_payments</code> - 결제 정보 저장</li>
              <li><code>singsing_participants</code> - 참가자 정보 (그룹 결제 관련 필드 포함)</li>
            </ul>
            
            <h3 className="text-base font-medium text-gray-800 mt-4 mb-2">주요 필드:</h3>
            <ul className="list-disc list-inside text-sm text-gray-600">
              <li>결제 유형: 예약금(deposit), 잔금(balance), 전액(full)</li>
              <li>결제 상태: 대기중(pending), 완료(completed), 취소(cancelled), 환불(refunded)</li>
              <li>그룹 결제: is_group_payment, payer_id</li>
              <li>영수증 관리: receipt_type, receipt_requested</li>
            </ul>
          </div>
        </div>
      </div>
    </AdminSidebarLayout>
  );
}
