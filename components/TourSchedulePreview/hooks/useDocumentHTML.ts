import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { TourData, ProductData, BoardingPlace, Waypoint, JourneyItem, DocumentType } from '../types';
import { generateCustomerScheduleHTML } from '../documents/CustomerSchedule';
import { generateBoardingGuideHTML } from '../documents/BoardingGuide';
import { generateRoomAssignmentHTML } from '../documents/RoomAssignment';
import { generateTeeTimeHTML } from '../documents/TeeTime';
import { generateSimplifiedHTML } from '../documents/SimplifiedSchedule';

interface UseDocumentHTMLProps {
  activeTab: DocumentType;
  tourData: TourData | null;
  productData: ProductData | null;
  tourBoardingPlaces: BoardingPlace[];
  tourWaypoints: Waypoint[];
  journeyItems: JourneyItem[];
  tourId: string;
}

export function useDocumentHTML({
  activeTab,
  tourData,
  productData,
  tourBoardingPlaces,
  tourWaypoints,
  journeyItems,
  tourId
}: UseDocumentHTMLProps) {
  const [documentHTML, setDocumentHTML] = useState<string>('');
  const [additionalData, setAdditionalData] = useState<any>({});

  useEffect(() => {
    if (!tourData) return;

    const generateHTML = async () => {
      let html = '';

      switch (activeTab) {
        case 'customer_schedule':
          html = generateCustomerScheduleHTML(tourData, productData, false);
          break;

        case 'staff_schedule':
          // 스탭용 일정표는 고객용과 동일하되, 추가 정보 포함
          html = generateCustomerScheduleHTML(tourData, productData, true);
          break;

        case 'customer_boarding':
          html = generateBoardingGuideHTML(tourData, journeyItems, false, undefined, productData);
          break;

        case 'staff_boarding':
          // 스탭용은 참가자 정보가 필요
          const participants = await fetchParticipants();
          html = generateBoardingGuideHTML(tourData, journeyItems, true, participants, productData);
          break;

        case 'room_assignment':
        case 'room_assignment_staff':
          const roomData = await fetchRoomAssignments();
          html = generateRoomAssignmentHTML(
            roomData.assignments,
            roomData.rooms,
            roomData.staff,
            activeTab === 'room_assignment_staff',
            tourData,
            productData
          );
          break;

        case 'customer_timetable':
        case 'staff_timetable':
          const teeTimeData = await fetchTeeTimes();
          html = generateTeeTimeHTML(
            teeTimeData,
            activeTab === 'staff_timetable',
            tourData
          );
          break;

        case 'simplified':
          html = generateSimplifiedHTML(tourData, productData);
          break;

        default:
          html = '<div>문서를 생성할 수 없습니다.</div>';
      }

      setDocumentHTML(html);
    };

    generateHTML();
  }, [activeTab, tourData, productData, tourBoardingPlaces, tourWaypoints, journeyItems, tourId]);

  // 참가자 정보 가져오기
  const fetchParticipants = async () => {
    try {
      const { data: participants, error } = await supabase
        .from('singsing_participants')
        .select('*')
        .eq('tour_id', tourId)
        .eq('status', '확정')
        .order('pickup_location', { ascending: true })
        .order('team_name', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      return participants || [];
    } catch (error) {
      console.error('Error fetching participants:', error);
      return [];
    }
  };

  // 객실 배정 정보 가져오기
  const fetchRoomAssignments = async () => {
    try {
      const { data: assignments, error } = await supabase
        .from('singsing_participants')
        .select('*')
        .eq('tour_id', tourId)
        .order('room_id');

      if (error) throw error;
      
      const { data: rooms, error: roomsError } = await supabase
        .from('singsing_rooms')
        .select('*')
        .eq('tour_id', tourId)
        .order('room_number');
        
      if (roomsError) throw roomsError;
      
      const { data: staffData } = await supabase
        .from('singsing_tour_staff')
        .select('*')
        .eq('tour_id', tourId)
        .eq('role', '기사')
        .order('display_order')
        .limit(1);
      
      const tourStaff = staffData && staffData.length > 0 ? staffData[0] : null;
      
      return {
        assignments: assignments || [],
        rooms: rooms || [],
        staff: tourStaff
      };
    } catch (error) {
      console.error('Error fetching room assignments:', error);
      return { assignments: [], rooms: [], staff: null };
    }
  };

  // 티타임 정보 가져오기
  const fetchTeeTimes = async () => {
    try {
      const { data: teeTimes, error } = await supabase
        .from('singsing_tee_times')
        .select('*')
        .eq('tour_id', tourId)
        .order('play_date')
        .order('tee_time');

      if (error) throw error;
      
      if (teeTimes && teeTimes.length > 0) {
        const teeTimesWithPlayers = await Promise.all(teeTimes.map(async (teeTime) => {
          const { data: assignments, error: assignError } = await supabase
            .from('singsing_participant_tee_times')
            .select(`
              participant_id,
              singsing_participants (
                id,
                name,
                phone,
                team_name,
                gender
              )
            `)
            .eq('tee_time_id', teeTime.id);
            
          return {
            ...teeTime,
            date: teeTime.play_date || teeTime.date,
            course: teeTime.golf_course || teeTime.course,
            singsing_tee_time_players: assignments?.map((a, index) => ({
              participant_id: a.participant_id,
              order_no: index + 1,
              singsing_participants: a.singsing_participants
            })) || []
          };
        }));
        
        return teeTimesWithPlayers;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching tee times:', error);
      return [];
    }
  };

  return documentHTML;
}
