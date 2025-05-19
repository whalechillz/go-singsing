import React from "react";

type Tour = {
  id: string;
  title: string;
  start_date?: string;
  end_date?: string;
};

type Schedule = {
  id: string;
  date: string;
  title: string;
  description?: string;
  meal_breakfast?: boolean;
  meal_lunch?: boolean;
  meal_dinner?: boolean;
  tee_time?: string;
  course?: string;
  menu_breakfast?: string;
  menu_lunch?: string;
  menu_dinner?: string;
};

type Props = {
  tour: Tour;
  schedules: Schedule[];
};

const dummyMenus = [
  {
    date: "2025-04-14",
    breakfast: "간편식",
    lunch: "해물 몽글순두부 찌개, 오이스틱(코스 지참용)",
    dinner: "소고기만두전골, 그린샐러드, 후라이드치킨&감자튀김, 계란찜"
  },
  {
    date: "2025-04-15",
    breakfast: "황태해장국, 시리얼, 삶은계란, 우유",
    lunch: "보리굴비, 녹차물&데일리국",
    dinner: "소고기모듬버섯전골, 그린샐러드, 생선조림, 명태회무침, 홍어삼합"
  },
  {
    date: "2025-04-16",
    breakfast: "아욱국(건새우), 식빵, 딸기잼, 삶은계란, 우유",
    lunch: "육전비빔밥&소된장, 도토리묵무침",
    dinner: "-"
  }
];

const getMenu = (date: string) => dummyMenus.find(m => m.date === date);

const TourScheduleInfo: React.FC<Props> = ({ tour, schedules }) => {
  if (!schedules?.length) return null;
  return (
    <div className="mb-8">
      <div className="space-y-6">
        {schedules.map((s, idx) => (
          <div key={s.id || idx} className="day-schedule bg-white border border-gray-200 rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-blue-800 font-bold text-lg">{s.date} {s.title}</div>
              {s.tee_time && <div className="text-sm text-blue-600 font-semibold">티오프: {s.tee_time}</div>}
            </div>
            <div className="mb-2 text-gray-800 text-sm">
              {s.description?.split(/\r?\n/).map((line, i) => (
                <li key={i} className="list-none mb-0.5">{line}</li>
              ))}
            </div>
            <div className="flex gap-4 mb-2">
              <div className="bg-blue-50 rounded px-3 py-1 text-xs font-semibold text-blue-800">조식: {s.meal_breakfast ? 'O' : 'X'}</div>
              <div className="bg-blue-50 rounded px-3 py-1 text-xs font-semibold text-blue-800">중식: {s.meal_lunch ? 'O' : 'X'}</div>
              <div className="bg-blue-50 rounded px-3 py-1 text-xs font-semibold text-blue-800">석식: {s.meal_dinner ? 'O' : 'X'}</div>
            </div>
            {(s.menu_breakfast || s.menu_lunch || s.menu_dinner) && (
              <div className="mt-2 bg-gray-50 rounded p-3 text-xs">
                <div className="font-bold text-blue-700 mb-1">식사 메뉴</div>
                <div className="flex flex-col gap-1">
                  {s.menu_breakfast && <div><span className="font-semibold">조식:</span> {s.menu_breakfast}</div>}
                  {s.menu_lunch && <div><span className="font-semibold">중식:</span> {s.menu_lunch}</div>}
                  {s.menu_dinner && <div><span className="font-semibold">석식:</span> {s.menu_dinner}</div>}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TourScheduleInfo; 