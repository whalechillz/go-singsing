import { supabase } from "@/lib/supabaseClient";

export interface SettlementDocument {
  id: string;
  tour_id: string;
  category: string | null;
  vendor: string | null;
  amount: number | null;
  currency: string | null;
  paid_at: string | null;
  notes: string | null;
}

export interface MappingSuggestion {
  mappingType: 'golf_course' | 'bus' | 'guide' | 'meal' | 'other';
  mappingIndex?: number;
  fields: Record<string, any>;
  description: string;
}

/**
 * 문서 정보를 기반으로 정산 폼 매핑 제안 생성
 */
export function generateMappingSuggestion(
  document: SettlementDocument
): MappingSuggestion | null {
  if (!document.category) {
    return null;
  }

  const category = document.category;
  const vendor = document.vendor || '';
  const amount = document.amount || 0;
  const paidAt = document.paid_at || null;

  switch (category) {
    case 'golf-course':
      return {
        mappingType: 'golf_course',
        fields: {
          golf_course_name: vendor,
          date: paidAt,
          subtotal: amount,
          items: [],
          receipt_type: 'tax_invoice',
          receipt_number: '',
          is_issued: false,
        },
        description: `골프장 정산: ${vendor}`,
      };

    case 'bus':
      // 버스 비용인지 기사 비용인지 판단 (파일명이나 vendor로 추정)
      const isDriverCost = vendor.toLowerCase().includes('기사') || 
                          vendor.toLowerCase().includes('driver') ||
                          vendor.toLowerCase().includes('운전');
      
      return {
        mappingType: 'bus',
        fields: isDriverCost
          ? { bus_driver_cost: amount, bus_notes: vendor }
          : { bus_cost: amount, bus_notes: vendor },
        description: isDriverCost 
          ? `버스 기사 비용: ${vendor}` 
          : `버스 비용: ${vendor}`,
      };

    case 'guide':
      // 가이드 비용 타입 판단
      const guideType = determineGuideCostType(vendor, document.notes || '');
      
      return {
        mappingType: 'guide',
        fields: {
          [guideType]: amount,
          guide_notes: vendor,
        },
        description: `가이드 비용 (${getGuideCostTypeLabel(guideType)}): ${vendor}`,
      };

    case 'expenses':
      return {
        mappingType: 'meal',
        fields: {
          type: 'other',
          description: vendor || '경비',
          unit_price: amount,
          quantity: 1,
          total: amount,
        },
        description: `경비 지출: ${vendor}`,
      };

    case 'other':
      return {
        mappingType: 'other',
        fields: {
          description: vendor || '기타 비용',
          amount: amount,
          other_expenses_total: amount,
        },
        description: `기타 비용: ${vendor}`,
      };

    case 'tax-invoice':
      // 세금계산서는 다른 항목에 연결되어야 함
      return null;

    default:
      return null;
  }
}

/**
 * 가이드 비용 타입 결정
 */
function determineGuideCostType(vendor: string, notes: string): string {
  const text = (vendor + ' ' + notes).toLowerCase();
  
  if (text.includes('식사') || text.includes('meal') || text.includes('밥')) {
    return 'guide_meal_cost';
  }
  if (text.includes('숙박') || text.includes('accommodation') || text.includes('호텔')) {
    return 'guide_accommodation_cost';
  }
  if (text.includes('인건비') || text.includes('fee') || text.includes('비용')) {
    return 'guide_fee';
  }
  
  return 'guide_other_cost';
}

function getGuideCostTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    guide_fee: '인건비',
    guide_meal_cost: '식사비',
    guide_accommodation_cost: '숙박비',
    guide_other_cost: '기타',
  };
  return labels[type] || '기타';
}

/**
 * 매핑 제안을 tour_expenses에 적용
 */
export async function applyMappingToExpenses(
  tourId: string,
  documentId: string,
  suggestion: MappingSuggestion,
  customFields?: Record<string, any>
): Promise<{ success: boolean; expenseId?: string; error?: string }> {
  try {
    // tour_expenses 조회 또는 생성
    let { data: expense, error: expenseError } = await supabase
      .from('tour_expenses')
      .select('*')
      .eq('tour_id', tourId)
      .single();

    if (expenseError && expenseError.code === 'PGRST116') {
      // tour_expenses가 없으면 생성
      const { data: newExpense, error: createError } = await supabase
        .from('tour_expenses')
        .insert({ tour_id: tourId })
        .select()
        .single();

      if (createError) {
        throw createError;
      }
      expense = newExpense;
    } else if (expenseError) {
      throw expenseError;
    }

    if (!expense) {
      throw new Error('tour_expenses를 생성할 수 없습니다.');
    }

    // 사용자 커스텀 필드가 있으면 병합
    const fieldsToApply = customFields 
      ? { ...suggestion.fields, ...customFields }
      : suggestion.fields;

    // 매핑 타입별로 tour_expenses 업데이트
    let updatedExpense: any = { ...expense };

    switch (suggestion.mappingType) {
      case 'golf_course': {
        const settlements = [...(expense.golf_course_settlement || [])];
        settlements.push(fieldsToApply);
        updatedExpense.golf_course_settlement = settlements;
        
        // golf_course_total 재계산
        updatedExpense.golf_course_total = settlements.reduce(
          (sum: number, s: any) => sum + (s.subtotal || 0),
          0
        );
        break;
      }

      case 'bus': {
        if (fieldsToApply.bus_driver_cost !== undefined) {
          updatedExpense.bus_driver_cost = (expense.bus_driver_cost || 0) + fieldsToApply.bus_driver_cost;
        }
        if (fieldsToApply.bus_cost !== undefined) {
          updatedExpense.bus_cost = (expense.bus_cost || 0) + fieldsToApply.bus_cost;
        }
        if (fieldsToApply.bus_notes) {
          updatedExpense.bus_notes = [
            expense.bus_notes,
            fieldsToApply.bus_notes
          ].filter(Boolean).join('\n');
        }
        break;
      }

      case 'guide': {
        if (fieldsToApply.guide_fee !== undefined) {
          updatedExpense.guide_fee = (expense.guide_fee || 0) + fieldsToApply.guide_fee;
        }
        if (fieldsToApply.guide_meal_cost !== undefined) {
          updatedExpense.guide_meal_cost = (expense.guide_meal_cost || 0) + fieldsToApply.guide_meal_cost;
        }
        if (fieldsToApply.guide_accommodation_cost !== undefined) {
          updatedExpense.guide_accommodation_cost = (expense.guide_accommodation_cost || 0) + fieldsToApply.guide_accommodation_cost;
        }
        if (fieldsToApply.guide_other_cost !== undefined) {
          updatedExpense.guide_other_cost = (expense.guide_other_cost || 0) + fieldsToApply.guide_other_cost;
        }
        if (fieldsToApply.guide_notes) {
          updatedExpense.guide_notes = [
            expense.guide_notes,
            fieldsToApply.guide_notes
          ].filter(Boolean).join('\n');
        }
        break;
      }

      case 'meal': {
        const mealExpenses = [...(expense.meal_expenses || [])];
        mealExpenses.push(fieldsToApply);
        updatedExpense.meal_expenses = mealExpenses;
        
        // meal_expenses_total 재계산
        updatedExpense.meal_expenses_total = mealExpenses.reduce(
          (sum: number, m: any) => sum + (m.total || 0),
          0
        );
        break;
      }

      case 'other': {
        const otherExpenses = [...(expense.other_expenses || [])];
        otherExpenses.push(fieldsToApply);
        updatedExpense.other_expenses = otherExpenses;
        
        // other_expenses_total 재계산
        updatedExpense.other_expenses_total = otherExpenses.reduce(
          (sum: number, o: any) => sum + (o.amount || 0),
          0
        );
        break;
      }
    }

    // total_cost 재계산
    updatedExpense.total_cost = 
      (updatedExpense.golf_course_total || 0) +
      (updatedExpense.bus_cost || 0) +
      (updatedExpense.bus_driver_cost || 0) +
      (updatedExpense.toll_fee || 0) +
      (updatedExpense.parking_fee || 0) +
      (updatedExpense.guide_fee || 0) +
      (updatedExpense.guide_meal_cost || 0) +
      (updatedExpense.guide_accommodation_cost || 0) +
      (updatedExpense.guide_other_cost || 0) +
      (updatedExpense.meal_expenses_total || 0) +
      (updatedExpense.accommodation_cost || 0) +
      (updatedExpense.restaurant_cost || 0) +
      (updatedExpense.attraction_fee || 0) +
      (updatedExpense.insurance_cost || 0) +
      (updatedExpense.other_expenses_total || 0);

    // tour_expenses 업데이트
    const { error: updateError } = await supabase
      .from('tour_expenses')
      .update(updatedExpense)
      .eq('id', expense.id);

    if (updateError) {
      throw updateError;
    }

    // 매핑 이력 저장
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error: mappingError } = await supabase
      .from('tour_settlement_document_mappings')
      .insert({
        document_id: documentId,
        expense_id: expense.id,
        mapping_type: suggestion.mappingType,
        mapping_index: suggestion.mappingIndex,
        mapped_fields: fieldsToApply,
        is_applied: true,
        applied_at: new Date().toISOString(),
        applied_by: user?.id || null,
      });

    if (mappingError) {
      console.error('매핑 이력 저장 실패:', mappingError);
      // 매핑 이력 저장 실패는 치명적이지 않으므로 계속 진행
    }

    return { success: true, expenseId: expense.id };
  } catch (error: any) {
    console.error('매핑 적용 실패:', error);
    return { 
      success: false, 
      error: error.message || '매핑 적용 중 오류가 발생했습니다.' 
    };
  }
}

