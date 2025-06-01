import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface BoardingStaffDocumentProps {
  tourId: string;
  tourData: any;
  onHTMLReady?: (html: string) => void;
}

export default function BoardingStaffDocument({ tourId, tourData, onHTMLReady }: BoardingStaffDocumentProps) {
  const [participants, setParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchParticipants();
  }, [tourId]);

  const fetchParticipants = async () => {
    try {
      const { data, error } = await supabase
        .from('singsing_participants')
        .select('*')
        .eq('tour_id', tourId)
        .eq('status', '확정')
        .order('pickup_location', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      setParticipants(data || []);
    } catch (error) {
      console.error('Error fetching participants:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && onHTMLReady) {
      onHTMLReady(generateHTML());
    }
  }, [loading, participants]);

  // 탑승지별로 참가자 그룹화
  const participantsByLocation = participants.reduce((acc, participant) => {
    const location = participant.pickup_location || '미정';
    if (!acc[location]) acc[location] = [];
    acc[location].push(participant);
    return acc;
  }, {});

  const getParking = (location: string) => {
    if (location.includes('양재')) return '주차비 일일 10,000원';
    if (location.includes('수원')) return '주차비 일일 7,000원';
    if (location.includes('군포') || location.includes('평택')) return '주차비 무료';
    return '';
  };

  const getRowColor = (index: number) => {
    const colors = ['bg-green-50', 'bg-blue-50', 'bg-yellow-50', 'bg-red-50'];
    return colors[index % colors.length];
  };

  const generateHTML = () => {
    return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>싱싱골프투어 탑승지별 배정 안내</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Noto Sans KR', sans-serif; }
    body { background-color: #f5f7fa; color: #343a40; padding: 15px; }
    .container { max-width: 900px; margin: 0 auto; background: white; box-shadow: 0 2px 10px rgba(0,0,0,0.1); border-radius: 8px; overflow: hidden; }
    .header-container { display: flex; justify-content: space-between; background-color: #2c5282; color: white; padding: 20px; }
    .title-section h1 { font-size: 24px; margin-bottom: 8px; }
    .subtitle { font-size: 16px; opacity: 0.9; }
    .info-section { text-align: right; background: rgba(255,255,255,0.15); padding: 10px 15px; border-radius: 4px; }
    .section { padding: 20px; border-bottom: 1px solid #e2e8f0; }
    .section-title { font-size: 18px; font-weight: bold; color: #2c5282; margin-bottom: 15px; }
    .checklist-table { margin-bottom: 30px; }
    .checklist-title { background-color: #2b6cb0; color: white; font-weight: bold; padding: 12px; text-align: center; font-size: 18px; margin-bottom: 8px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
    th, td { border: 1px solid #DEE2E6; padding: 10px; text-align: center; }
    th { background-color: #ECF0F1; font-weight: bold; color: #34699C; }
    .bg-green-50 { background-color: #f0fff4; }
    .bg-blue-50 { background-color: #ebf8ff; }
    .bg-yellow-50 { background-color: #fffbeb; }
    .bg-red-50 { background-color: #fff5f5; }
    .emergency-contacts { background-color: #EBF8FF; border: 1px solid #BEE3F8; border-radius: 5px; padding: 15px; margin-top: 15px; }
    .emergency-title { font-weight: bold; color: #2B6CB0; margin-bottom: 10px; font-size: 16px; }
    .contact-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px; }
    .contact-item { padding: 8px; border-radius: 4px; background-color: white; border: 1px solid #E2E8F0; }
    .contact-name { font-weight: bold; color: #4A5568; }
    .contact-phone { color: #2D3748; }
    .bus-info { display: flex; gap: 15px; flex-wrap: wrap; margin-bottom: 15px; }
    .bus-info-col { flex: 1; min-width: 200px; }
    .bus-card { background-color: #F7FAFC; border-radius: 5px; padding: 12px; margin-bottom: 10px; border: 1px solid #E2E8F0; }
    .bus-title { font-weight: bold; color: #2C5282; margin-bottom: 8px; }
    .footer { padding: 15px; text-align: center; background-color: #f8f9fa; }
    @media print { body { padding: 0; } .container { box-shadow: none; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="header-container">
      <div class="title-section">
        <h1>탑승지별 배정 안내</h1>
        <p class="subtitle">${tourData.tour_name} - 탑승 ${participants.length}명</p>
      </div>
      <div class="info-section">
        ${tourData.staff?.map((staff: any) => `
          <p><strong>${staff.name} ${staff.role}</strong></p>
          <p>${staff.phone}</p>
        `).join('') || ''}
      </div>
    </div>
    
    <div class="section">
      <div class="section-title">차량 및 탑승 정보</div>
      
      <div class="bus-info">
        <div class="bus-info-col">
          <div class="bus-card">
            <div class="bus-title">차량 정보</div>
            <div class="bus-details">
              <p><strong>차량:</strong> ${participants.length <= 28 ? '28인승' : participants.length <= 45 ? '45인승' : '대형'} 리무진 버스</p>
              <p><strong>총 인원:</strong> ${participants.length}명</p>
              <p><strong>좌석 안내:</strong> 1-3번 좌석은 멀미 고객 우선석</p>
            </div>
          </div>
        </div>
        
        <div class="bus-info-col">
          <div class="bus-card">
            <div class="bus-title">탑승지 정보</div>
            <div class="bus-details">
              ${tourData.schedules?.[0]?.boarding_info?.routes?.map((route: any) => `
                <p><strong>${route.place}:</strong> ${route.time}</p>
              `).join('') || '<p>탑승지 정보 없음</p>'}
            </div>
          </div>
        </div>
      </div>
      
      <!-- 그룹별 총무 연락처 -->
      <div class="emergency-contacts">
        <div class="emergency-title">그룹별 총무 연락처</div>
        <div class="contact-grid">
          ${Object.entries(participantsByLocation).map(([location, locationParticipants]: [string, any]) => {
            const leaders = locationParticipants.filter((p: any) => 
              p.role === '총무' || p.role === '회장' || p.role === '부회장'
            );
            return leaders.map((leader: any) => `
              <div class="contact-item">
                <div class="contact-name">${leader.name} (${location})</div>
                <div class="contact-phone">${leader.phone || '연락처 없음'}</div>
              </div>
            `).join('');
          }).join('') || '<p>총무 정보 없음</p>'}
        </div>
      </div>
    </div>
    
    <!-- 탑승자 명단 섹션 -->
    <div class="section">
      <div class="section-title">탑승자 명단</div>
      
      ${Object.entries(participantsByLocation).map(([location, locationParticipants]: [string, any], index) => `
        <div class="checklist-table">
          <div class="checklist-title">${location} - ${locationParticipants.length}명</div>
          ${getParking(location) ? `
            <div style="text-align: center; background-color: #e9f5ff; padding: 5px; margin-bottom: 8px; font-size: 13px;">
              <strong>주차 안내:</strong> ${getParking(location)}
            </div>
          ` : ''}
          <table>
            <thead>
              <tr>
                <th style="width: 50px;">No.</th>
                <th>성함</th>
                <th style="width: 120px;">연락처</th>
                <th style="width: 80px;">팀</th>
              </tr>
            </thead>
            <tbody>
              ${locationParticipants.map((participant: any, idx: number) => `
                <tr class="${getRowColor(index)}">
                  <td>${idx + 1}</td>
                  <td>${participant.name}</td>
                  <td>${participant.phone ? participant.phone.replace(/(\d{3})(\d{3,4})(\d{4})/, '$1-$2-$3') : '-'}</td>
                  <td>${participant.team_name || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `).join('')}
    </div>
    
    <div class="footer">
      <p>싱싱골프투어 | 031-215-3990</p>
      ${tourData.staff?.map((staff: any) => `
        <p>담당 ${staff.name} ${staff.role} | ${staff.phone}</p>
      `).join('') || ''}
    </div>
  </div>
</body>
</html>`;
  };

  if (loading) {
    return <div className="text-center py-4">참가자 정보를 불러오는 중...</div>;
  }

  // 미리보기용 렌더링
  return (
    <div className="bg-white border rounded-lg p-4">
      <h4 className="font-semibold mb-2">탑승지별 참가자 현황</h4>
      <div className="space-y-2">
        {Object.entries(participantsByLocation).map(([location, locationParticipants]: [string, any]) => (
          <div key={location} className="flex justify-between text-sm">
            <span>{location}</span>
            <span className="font-medium">{locationParticipants.length}명</span>
          </div>
        ))}
      </div>
      <div className="mt-3 pt-3 border-t text-sm text-gray-600">
        총 {participants.length}명
      </div>
    </div>
  );
}