"use client";
import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { REFUND_POLICIES, REFUND_TYPES, REFUND_REASONS, calculateRefund } from '@/constants/refundPolicies';
// import { sendSlackNotification, createRefundNotification, needsApproval } from '@/lib/slackNotifications';
import { X, Calculator, AlertCircle } from 'lucide-react';

interface RefundModalProps {
  payment: any;
  participant: any;
  tour: any;
  onClose: () => void;
  onSuccess: () => void;
}

interface RefundDetailsType {
  holesPlayed: 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18;
  daysRefunded: number;
  cancelledDates: string[];
  customRate: number | null;
  customAmount: number | null; // 커스텀 금액 직접 입력
  useCustomRate: boolean;
  usePercentageMode: boolean; // 비율 방식 사용 여부
}

export default function RefundModal({ payment, participant, tour, onClose, onSuccess }: RefundModalProps) {
  const [refundType, setRefundType] = useState<string>('');
  const [refundReason, setRefundReason] = useState<string>('');
  const [refundAccount, setRefundAccount] = useState<string>('');
  const [refundDetails, setRefundDetails] = useState<RefundDetailsType>({
    holesPlayed: 9,
    daysRefunded: 1,
    cancelledDates: [],
    customRate: null,
    customAmount: null,
    useCustomRate: false,
    usePercentageMode: false // 기본은 정액 방식
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 그린피와 카트비 계산 (하루 기준)
  const dailyGreenFee = 55000;
  const dailyCartFee = 16000;
  const dailyTotal = dailyGreenFee + dailyCartFee;
  
  // 환불 금액 계산
  const calculateRefundAmount = () => {
    if (!refundType) return 0;
    
    // 커스텀 금액 직접 입력시
    if (refundDetails.useCustomRate && refundDetails.customAmount !== null) {
      return refundDetails.customAmount;
    }
    
    let baseAmount = 0;
    let refundRate = 0;
    
    // 커스텀 환불률 사용시
    if (refundDetails.useCustomRate && refundDetails.customRate !== null) {
      switch (refundType) {
        case REFUND_TYPES.HOLE_OUT:
          baseAmount = dailyTotal;
          break;
        case REFUND_TYPES.DAILY_CANCELLATION:
          baseAmount = dailyTotal * refundDetails.daysRefunded;
          break;
        case REFUND_TYPES.FULL_CANCELLATION:
          baseAmount = payment.amount;
          break;
      }
      refundRate = refundDetails.customRate / 100; // 퍼센트를 비율로 변환
    } else {
      // 기본 정책 사용
      switch (refundType) {
        case REFUND_TYPES.HOLE_OUT:
          // 정액 방식 (순천 파인힐스 기준)
          if (!refundDetails.usePercentageMode) {
            const holePolicy = REFUND_POLICIES.holeOut[refundDetails.holesPlayed as keyof typeof REFUND_POLICIES.holeOut];
            return holePolicy?.total || 0;
          } 
          // 비율 방식
          else {
            baseAmount = dailyTotal;
            const percentagePolicy = REFUND_POLICIES.holeOutPercentage[refundDetails.holesPlayed as keyof typeof REFUND_POLICIES.holeOutPercentage];
            refundRate = percentagePolicy?.rate || 0;
          }
          break;
          
        case REFUND_TYPES.DAILY_CANCELLATION:
          baseAmount = dailyTotal * refundDetails.daysRefunded;
          const reasonPolicy = REFUND_POLICIES.dailyCancellation[refundReason as keyof typeof REFUND_POLICIES.dailyCancellation];
          refundRate = reasonPolicy?.rate || 0;
          break;
          
        case REFUND_TYPES.FULL_CANCELLATION:
          baseAmount = payment.amount;
          refundRate = 0.8; // 기본 80%
          break;
      }
    }
    
    return Math.floor(baseAmount * refundRate);
  };

  const refundAmount = calculateRefundAmount();

  const handleSubmit = async () => {
    if (!refundType || !refundAccount || refundAmount === 0) {
      setError('필수 정보를 모두 입력해주세요.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // 환불 내역 저장 (음수 금액으로)
      // 환불 상세 정보를 note에 포함
      const refundTypeText = refundType === REFUND_TYPES.HOLE_OUT ? '홀아웃' : 
                           refundType === REFUND_TYPES.DAILY_CANCELLATION ? '일별 취소' : '전체 취소';
      const refundInfo = {
        type: refundTypeText,
        reason: refundReason,
        account: refundAccount,
        originalAmount: payment.amount,
        refundAmount: refundAmount,
        refundRate: Math.round((refundAmount / payment.amount) * 100) + '%'
      };
      
      const refundData = {
        participant_id: participant.id,
        tour_id: tour.id,
        payer_id: payment.payer_id,
        amount: -refundAmount, // 음수로 저장
        payment_method: '환불',
        payment_status: 'refunded',
        payment_type: payment.payment_type || 'deposit', // 원본 결제의 payment_type 사용
        payment_date: new Date().toISOString().split('T')[0],
        receipt_type: '',
        receipt_requested: false,
        is_group_payment: false,
        note: `${participant.name}님 ${refundTypeText} 환불 | 환불계좌: ${refundAccount} | 사유: ${refundReason || '-'} | 환불률: ${Math.round((refundAmount / payment.amount) * 100)}%`
      };
      
      const { error: insertError } = await supabase
        .from('singsing_payments')
        .insert([refundData]);
        
      if (insertError) throw insertError;
      
      // 환불 금액에 따른 처리
      const requiresApproval = refundAmount >= 1000000; // 100만원 이상은 승인 필요
      
      if (requiresApproval) {
        // 승인 필요 - 슬랙 알림 (추후 구현)
        // const { message, details } = createRefundNotification(
        //   participant.name,
        //   refundAmount,
        //   refundReason || refundType,
        //   true
        // );
        // await sendSlackNotification('approval', message, details);
        
        alert(`환불 승인 요청이 접수되었습니다.\n환불 금액: ${refundAmount.toLocaleString()}원\n\n⚠️ 100만원 이상은 상급자 승인이 필요합니다.`);
      } else {
        // 즉시 처리 - 슬랙 알림 (추후 구현)
        // const { message, details } = createRefundNotification(
        //   participant.name,
        //   refundAmount,
        //   refundReason || refundType,
        //   false
        // );
        // await sendSlackNotification('refund', message, details);
        
        alert(`환불 처리가 완료되었습니다.\n환불 금액: ${refundAmount.toLocaleString()}원`);
      }
      
      onSuccess();
      onClose();
      
    } catch (err: any) {
      console.error('환불 처리 오류:', err);
      setError(err.message || '환불 처리 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <h3 className="text-lg font-semibold">
            환불 처리 - {participant.name}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* 본문 */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}
          
          {/* 환불 유형 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              환불 유형 *
            </label>
            <select
              value={refundType}
              onChange={(e) => setRefundType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">환불 유형을 선택하세요</option>
              <option value={REFUND_TYPES.HOLE_OUT}>홀아웃 (당일 부분 라운드)</option>
              <option value={REFUND_TYPES.DAILY_CANCELLATION}>일별 라운드 취소</option>
              <option value={REFUND_TYPES.FULL_CANCELLATION}>전체 투어 취소</option>
            </select>
          </div>
          
          {/* 홀아웃 상세 */}
          {refundType === REFUND_TYPES.HOLE_OUT && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  환불 방식
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="refundMode"
                      checked={!refundDetails.usePercentageMode}
                      onChange={() => setRefundDetails({...refundDetails, usePercentageMode: false})}
                    />
                    <span className="ml-2">정액 환불 (순천 파인힐스 기준)</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="refundMode"
                      checked={refundDetails.usePercentageMode}
                      onChange={() => setRefundDetails({...refundDetails, usePercentageMode: true})}
                    />
                    <span className="ml-2">비율 환불</span>
                  </label>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  플레이한 홀 수
                </label>
                <select
                  value={refundDetails.holesPlayed}
                  onChange={(e) => setRefundDetails({...refundDetails, holesPlayed: parseInt(e.target.value) as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {!refundDetails.usePercentageMode ? (
                    // 정액 방식 옵션
                    Object.entries(REFUND_POLICIES.holeOut).map(([hole, policy]) => (
                      <option key={hole} value={hole}>
                        {policy.description}
                      </option>
                    ))
                  ) : (
                    // 비율 방식 옵션
                    Object.entries(REFUND_POLICIES.holeOutPercentage).map(([hole, policy]) => (
                      <option key={hole} value={hole}>
                        {policy.description}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </>
          )}
          
          {/* 일별 취소 상세 */}
          {refundType === REFUND_TYPES.DAILY_CANCELLATION && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  취소 사유
                </label>
                <select
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">사유를 선택하세요</option>
                  <option value="weather">기상 악화 (100% 환불)</option>
                  <option value="course_condition">코스 컨디션 (100% 환불)</option>
                  <option value="customer_request">고객 요청 (80% 환불)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  환불 일수
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={refundDetails.daysRefunded}
                  onChange={(e) => setRefundDetails({...refundDetails, daysRefunded: parseInt(e.target.value) || 1})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">취소된 라운드 일수를 입력하세요</p>
              </div>
            </>
          )}
          
          {/* 커스텀 환불 설정 */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <label className="flex items-center gap-2 mb-3">
              <input
                type="checkbox"
                checked={refundDetails.useCustomRate}
                onChange={(e) => setRefundDetails({...refundDetails, useCustomRate: e.target.checked})}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm font-medium text-gray-700">환불 금액 직접 설정</span>
            </label>
            
            {refundDetails.useCustomRate && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">환불 금액 직접 입력</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="1000000"
                      value={refundDetails.customAmount || ''}
                      onChange={(e) => setRefundDetails({...refundDetails, customAmount: parseInt(e.target.value) || null})}
                      placeholder="예: 64000"
                      className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-600">원</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    예시: 8홀 아웃 = 64,000원 (그린피 50,000 + 카트비 14,000)
                  </p>
                </div>
                
                <div className="text-xs text-gray-500 border-t pt-2">
                  <span className="font-medium">참고:</span>
                  <div className="mt-1 space-y-0.5">
                    <div>7홀: 71,000원 (그린피 55,000 + 카트비 16,000)</div>
                    <div>8홀: 64,000원 (그린피 50,000 + 카트비 14,000)</div>
                    <div>9홀: 57,500원 (그린피 45,000 + 카트비 12,500)</div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* 환불 계좌 정보 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              환불 계좌 정보 *
            </label>
            <input
              type="text"
              value={refundAccount}
              onChange={(e) => setRefundAccount(e.target.value)}
              placeholder="은행명 계좌번호 예금주 (예: 국민은행 123-456-789012 홍긵동)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* 환불 금액 계산 */}
          <div className="bg-blue-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2 text-blue-900 font-medium">
              <Calculator className="w-5 h-5" />
              환불 금액 계산
            </div>
            
            {refundType === REFUND_TYPES.HOLE_OUT && (
              <>
                {!refundDetails.usePercentageMode ? (
                  // 정액 방식
                  <>
                    <div className="flex justify-between text-sm">
                      <span>환불 그린피</span>
                      <span>{(REFUND_POLICIES.holeOut[refundDetails.holesPlayed as keyof typeof REFUND_POLICIES.holeOut]?.greenFee || 0).toLocaleString()}원</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>환불 카트비</span>
                      <span>{(REFUND_POLICIES.holeOut[refundDetails.holesPlayed as keyof typeof REFUND_POLICIES.holeOut]?.cartFee || 0).toLocaleString()}원</span>
                    </div>
                  </>
                ) : (
                  // 비율 방식
                  <>
                    <div className="flex justify-between text-sm">
                      <span>1일 그린피</span>
                      <span>{dailyGreenFee.toLocaleString()}원</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>1일 카트비</span>
                      <span>{dailyCartFee.toLocaleString()}원</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>환불률</span>
                      <span>{(REFUND_POLICIES.holeOutPercentage[refundDetails.holesPlayed as keyof typeof REFUND_POLICIES.holeOutPercentage]?.rate || 0) * 100}%</span>
                    </div>
                  </>
                )}
              </>
            )}
            
            {refundType === REFUND_TYPES.DAILY_CANCELLATION && (
              <>
                <div className="flex justify-between text-sm">
                  <span>1일 요금 (그린피 + 카트비)</span>
                  <span>{dailyTotal.toLocaleString()}원</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>환불 일수</span>
                  <span>{refundDetails.daysRefunded}일</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>환불률</span>
                  <span>{(REFUND_POLICIES.dailyCancellation[refundReason as keyof typeof REFUND_POLICIES.dailyCancellation]?.rate || 0) * 100}%</span>
                </div>
              </>
            )}
            
            <div className="border-t pt-2">
              <div className="flex justify-between font-semibold text-lg">
                <span>총 환불 금액</span>
                <span className="text-red-600">{refundAmount.toLocaleString()}원</span>
              </div>
              {refundAmount >= 1000000 && (
                <div className="mt-2 text-sm text-orange-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  100만원 이상은 상급자 승인이 필요합니다
                </div>
              )}
            </div>
          </div>
          
          {/* 환불 불가 항목 안내 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-700 mb-2">환불 불가 항목</p>
            <ul className="text-xs text-gray-600 space-y-1">
              {REFUND_POLICIES.nonRefundableItems.map((item, index) => (
                <li key={index}>• {item}</li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* 푸터 */}
        <div className="flex justify-end gap-3 p-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || refundAmount === 0}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400"
          >
            {loading ? '처리 중...' : `${refundAmount.toLocaleString()}원 환불하기`}
          </button>
        </div>
      </div>
    </div>
  );
}
