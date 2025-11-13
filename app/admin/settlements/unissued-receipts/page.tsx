"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { ArrowLeft, CheckCircle, XCircle, AlertCircle, FileText, Send } from "lucide-react";

interface UnissuedReceiptItem {
  id: string;
  tour_id: string;
  tour_title: string;
  tour_start_date: string;
  expense_type: 'golf_course' | 'meal' | 'other';
  expense_index?: number;
  expense_description: string;
  amount: number;
  receipt_type?: string;
  receipt_number?: string;
  is_issued: boolean;
  verified_at?: string;
  request_status?: 'pending' | 'in_progress' | 'completed';
  requested_at?: string;
  requested_by?: string;
}

export default function UnissuedReceiptsPage() {
  const [unissuedItems, setUnissuedItems] = useState<UnissuedReceiptItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    fetchUnissuedItems();
  }, []);

  const fetchUnissuedItems = async () => {
    setLoading(true);
    try {
      // 모든 tour_expenses 가져오기
      const { data: allExpenses, error: expensesError } = await supabase
        .from("tour_expenses")
        .select(`
          id,
          tour_id,
          golf_course_settlement,
          meal_expenses,
          other_expenses_total,
          other_receipt_type,
          other_receipt_number,
          other_is_issued,
          other_verified_at,
          other_request_status,
          other_requested_at,
          other_requested_by,
          tour:tour_id (
            id,
            title,
            start_date
          )
        `);

      if (expensesError) throw expensesError;

      const items: UnissuedReceiptItem[] = [];

      // 각 tour_expenses를 순회하며 미발행 항목 찾기
      for (const expense of allExpenses || []) {
        const tour = Array.isArray(expense.tour) ? expense.tour[0] : expense.tour;

        // 골프장 정산 미발행 항목
        if (expense.golf_course_settlement && Array.isArray(expense.golf_course_settlement)) {
          expense.golf_course_settlement.forEach((settlement: any, idx: number) => {
            if (settlement.receipt_type && settlement.receipt_type !== 'none' && !settlement.is_issued) {
              items.push({
                id: `${expense.id}-golf-${idx}`,
                tour_id: expense.tour_id,
                tour_title: tour?.title || "투어명 없음",
                tour_start_date: tour?.start_date || "",
                expense_type: 'golf_course',
                expense_index: idx,
                expense_description: `${settlement.golf_course_name || '골프장'} - ${settlement.date || ''}`,
                amount: settlement.subtotal || 0,
                receipt_type: settlement.receipt_type,
                receipt_number: settlement.receipt_number,
                is_issued: false,
                verified_at: settlement.verified_at,
                request_status: settlement.request_status || 'pending',
                requested_at: settlement.requested_at,
                requested_by: settlement.requested_by
              });
            }
          });
        }

        // 경비 지출 미발행 항목
        if (expense.meal_expenses && Array.isArray(expense.meal_expenses)) {
          expense.meal_expenses.forEach((mealExpense: any, idx: number) => {
            if (mealExpense.receipt_type && mealExpense.receipt_type !== 'none' && !mealExpense.is_issued) {
              items.push({
                id: `${expense.id}-meal-${idx}`,
                tour_id: expense.tour_id,
                tour_title: tour?.title || "투어명 없음",
                tour_start_date: tour?.start_date || "",
                expense_type: 'meal',
                expense_index: idx,
                expense_description: mealExpense.description || `${mealExpense.type || '경비'} - ${mealExpense.quantity || 1}개`,
                amount: mealExpense.total || 0,
                receipt_type: mealExpense.receipt_type,
                receipt_number: mealExpense.receipt_number,
                is_issued: false,
                verified_at: mealExpense.verified_at,
                request_status: mealExpense.request_status || 'pending',
                requested_at: mealExpense.requested_at,
                requested_by: mealExpense.requested_by
              });
            }
          });
        }

        // 기타 비용 미발행 항목
        if (expense.other_receipt_type && expense.other_receipt_type !== 'none' && !expense.other_is_issued) {
          items.push({
            id: `${expense.id}-other`,
            tour_id: expense.tour_id,
            tour_title: tour?.title || "투어명 없음",
            tour_start_date: tour?.start_date || "",
            expense_type: 'other',
            expense_description: "기타 비용",
            amount: expense.other_expenses_total || 0,
            receipt_type: expense.other_receipt_type,
            receipt_number: expense.other_receipt_number,
            is_issued: false,
            verified_at: expense.other_verified_at,
            request_status: expense.other_request_status || 'pending',
            requested_at: expense.other_requested_at,
            requested_by: expense.other_requested_by
          });
        }
      }

      setUnissuedItems(items);
    } catch (error: any) {
      console.error("Error fetching unissued items:", error);
      alert(`미발행 항목 조회 실패: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(new Set(unissuedItems.map(item => item.id)));
    } else {
      setSelectedItems(new Set());
    }
  };

  const handleSelectItem = (itemId: string, checked: boolean) => {
    const newSelected = new Set(selectedItems);
    if (checked) {
      newSelected.add(itemId);
    } else {
      newSelected.delete(itemId);
    }
    setSelectedItems(newSelected);
  };

  const handleRequestIssuance = async (itemIds?: string[]) => {
    const itemsToRequest = itemIds || Array.from(selectedItems);
    if (itemsToRequest.length === 0) {
      alert("발행 요청할 항목을 선택해주세요.");
      return;
    }

    if (!window.confirm(`${itemsToRequest.length}개 항목에 대한 세금계산서/영수증 발행을 요청하시겠습니까?`)) {
      return;
    }

    setRequesting(true);
    try {
      // 선택된 항목들의 정보 가져오기
      const items = unissuedItems.filter(item => itemsToRequest.includes(item.id));

      // 각 항목에 대해 tour_expenses 업데이트
      for (const item of items) {
        const { data: expense } = await supabase
          .from("tour_expenses")
          .select("*")
          .eq("tour_id", item.tour_id)
          .single();

        if (!expense) continue;

        let updatedExpense: any = { ...expense };

        if (item.expense_type === 'golf_course' && item.expense_index !== undefined) {
          const settlements = [...(expense.golf_course_settlement || [])];
          settlements[item.expense_index] = {
            ...settlements[item.expense_index],
            request_status: 'pending',
            requested_at: new Date().toISOString()
          };
          updatedExpense.golf_course_settlement = settlements;
        } else if (item.expense_type === 'meal' && item.expense_index !== undefined) {
          const mealExpenses = [...(expense.meal_expenses || [])];
          mealExpenses[item.expense_index] = {
            ...mealExpenses[item.expense_index],
            request_status: 'pending',
            requested_at: new Date().toISOString()
          };
          updatedExpense.meal_expenses = mealExpenses;
        } else if (item.expense_type === 'other') {
          updatedExpense.other_request_status = 'pending';
          updatedExpense.other_requested_at = new Date().toISOString();
        }

        const { error } = await supabase
          .from("tour_expenses")
          .update(updatedExpense)
          .eq("id", expense.id);

        if (error) throw error;
      }

      alert(`${itemsToRequest.length}개 항목의 발행 요청이 완료되었습니다.`);
      setSelectedItems(new Set());
      await fetchUnissuedItems();
    } catch (error: any) {
      console.error("Error requesting issuance:", error);
      alert(`발행 요청 실패: ${error.message}`);
    } finally {
      setRequesting(false);
    }
  };

  const getReceiptTypeLabel = (type?: string) => {
    switch (type) {
      case 'tax_invoice': return '매입세금계산서';
      case 'cash_receipt': return '현금영수증';
      default: return '-';
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'completed':
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">완료</span>;
      case 'in_progress':
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">진행중</span>;
      case 'pending':
      default:
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">요청 대기</span>;
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('ko-KR');
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-500">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link 
          href="/admin/settlements"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          정산 관리로 돌아가기
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">미발행 세금계산서/영수증 관리</h1>
        <p className="text-gray-600 mt-2">세금계산서/영수증이 발행되지 않은 비용 항목을 확인하고 발행을 요청할 수 있습니다.</p>
      </div>

      {unissuedItems.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <p className="text-lg font-semibold text-gray-900 mb-2">미발행 항목이 없습니다</p>
          <p className="text-gray-500">모든 세금계산서/영수증이 발행되었습니다.</p>
        </div>
      ) : (
        <>
          {/* 일괄 작업 */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedItems.size === unissuedItems.length && unissuedItems.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    전체 선택 ({selectedItems.size}/{unissuedItems.length})
                  </span>
                </label>
              </div>
              <button
                onClick={() => handleRequestIssuance()}
                disabled={selectedItems.size === 0 || requesting}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                선택 항목 발행 요청 ({selectedItems.size}개)
              </button>
            </div>
          </div>

          {/* 미발행 항목 목록 */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input type="checkbox" className="w-4 h-4" />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      투어명
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      시작일
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      비용 항목
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      금액
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      종류
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      번호
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      상태
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      요청일
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      작업
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {unissuedItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedItems.has(item.id)}
                          onChange={(e) => handleSelectItem(item.id, e.target.checked)}
                          className="w-4 h-4"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link 
                          href={`/admin/tours/${item.tour_id}/settlement`}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          {item.tour_title}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(item.tour_start_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.expense_description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 font-medium">
                        {item.amount.toLocaleString()}원
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getReceiptTypeLabel(item.receipt_type)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.receipt_number || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(item.request_status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(item.requested_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => handleRequestIssuance([item.id])}
                          disabled={requesting || item.request_status === 'in_progress'}
                          className="text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed text-sm font-medium"
                        >
                          발행 요청
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

