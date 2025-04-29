import React from 'react';

const MarketingReport = () => {
  return (
    <div className="bg-white min-h-screen text-gray-800 font-sans">
      <div className="max-w-6xl mx-auto p-6">
        {/* 헤더 섹션 */}
        <div className="mb-8 border-b pb-6">
          <h1 className="text-3xl font-bold text-amber-500 mb-2">MASGOLF 마케팅 전략 회의 자료</h1>
          <p className="text-gray-600">보고일: 2025년 4월 24일 (목)</p>
        </div>
        
        {/* 돌핀웨일 이벤트 분석 섹션 */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 border-l-4 border-amber-500 pl-3">돌핀웨일 오프라인 이벤트 분석 및 패턴</h2>
          <p className="mb-4">
            <strong>돌핀웨일(Dolphin Whale)</strong>은 유아동 및 여성 의류 쇼룸으로, 정기적인 오프라인 이벤트를 통해 고객 유입을 극대화하고 있습니다. 특히 매주 신상품 입고일에 초저가 스크래치 세일을 열어 고객들이 오픈 전부터 줄을 서서 대기하는 현상이 나타납니다. 이러한 이벤트는 봄/가을 시즌 전환기 등 특별한 시기에 더욱 강화되며, 브랜드는 DM 문자, 인스타그램 피드/스토리, 현장 배너 등의 채널로 적극 홍보합니다.
          </p>
          
          <div className="overflow-x-auto mb-6">
            <table className="min-w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left">날짜</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">요일</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">이벤트 진행</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">이벤트 유형/이유</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">2023-09-07</td>
                  <td className="border border-gray-300 px-4 py-2">목요일</td>
                  <td className="border border-gray-300 px-4 py-2">예 (진행)</td>
                  <td className="border border-gray-300 px-4 py-2">주간 정기 행사일. 가을 시즌 신상 입고에 맞춘 스크래치 세일 개최 – 이월상품 초특가 판매로 대기줄 발생.</td>
                </tr>
                <tr className="bg-amber-50">
                  <td className="border border-gray-300 px-4 py-2">2025-04-24</td>
                  <td className="border border-gray-300 px-4 py-2">목요일</td>
                  <td className="border border-gray-300 px-4 py-2">예 (진행)</td>
                  <td className="border border-gray-300 px-4 py-2">통상적 행사 요일이 목요일이므로 정기 이벤트 진행. 봄 시즌 신상 입고 기념 세일로 진행됨.</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">이벤트 패턴</td>
                  <td className="border border-gray-300 px-4 py-2">–</td>
                  <td className="border border-gray-300 px-4 py-2">주간 행사</td>
                  <td className="border border-gray-300 px-4 py-2">매주 목요일 오전 10시 쇼룸 정기 오픈 이벤트 진행. 신상품 첫 진열 및 불량 재고 떨이 판매로 상시 대기열 형성.</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">시즌 행사</td>
                  <td className="border border-gray-300 px-4 py-2">–</td>
                  <td className="border border-gray-300 px-4 py-2">시즌별 특집</td>
                  <td className="border border-gray-300 px-4 py-2">봄/가을 신상품 컬렉션 출시 시기에 맞춰 대형 이벤트 개최. 예: 봄시즌 Grand Open (선물 증정 등 오픈행사), 명절 전 후 특별 프로모션 등.</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <p className="mb-4">
            돌핀웨일은 위와 같이 <strong className="font-bold">매주 정해진 요일(목)</strong>에 이벤트를 열어 고객 습관화를 유도하면서, 시즌 변화 시점에는 특별 행사를 추가로 실시해 브랜드에 대한 신뢰와 기대감을 형성해 왔습니다.
          </p>
        </section>
        
        {/* 돌핀웨일 프로모션 형태 섹션 */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 border-l-4 border-amber-500 pl-3">돌핀웨일 프로모션 형태 및 핵심 메시지</h2>
          <p className="mb-4">
            돌핀웨일 이벤트에 고객이 몰리는 이유는 명확합니다. &quot;1,000원~&quot; 수준의 파격 세일가로 구매 기회를 주는 스크래치 세일(미세 하자가 있는 제품을 초저가 판매)과 한정 수량 신상 공개가 결합되어 있기 때문입니다. 선착순으로 입장하여 득템하려는 고객들은 오픈 30분 전부터 줄을 서며, 매장당 10명씩 입장 통제하는 등 작은 축제 분위기가 연출됩니다. 또한 현장 방문 고객에게는 사은품 증정, 적립금 3배 지급 등의 혜택도 제공되어 구매를 독려합니다.
          </p>
          
          <div className="overflow-x-auto mb-6">
            <table className="min-w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left">메시지 채널</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">예시 메시지 문구 및 톤</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 bg-gray-50 font-medium">DM 문자<br/>(이벤트 안내)</td>
                  <td className="border border-gray-300 px-4 py-2">
                    &quot;📢돌핀웨일 광교점 스크래치 세일 안내: 오늘 9/7(목) 오전 10시 가을맞이 오픈! 1,000원~ 초특가 세일 시작합니다. 선착순 100명 사은품 증정🎁 놓치지 마세요!&quot;<br/><span className="text-gray-600 text-sm">(특정 지점, 날짜/요일, 시간과 함께 초저가·선착순 사은품 등을 강조한 즉각적인 독려 메시지)</span>
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 bg-gray-50 font-medium">인스타그램 피드<br/>(공식 계정 포스트)</td>
                  <td className="border border-gray-300 px-4 py-2">
                    &quot;매주 핫한 기획아이템부터 스크래치 이벤트까지, 오프라인에서 신나게 파티 중인 돌핀웨일 쇼룸🎉 이번 주도 득템 찬스 놓치지 마세요! 우리동네 핫스팟에서 만나요💕&quot;<br/><span className="text-gray-600 text-sm">(경쾌한 어투와 이모지 활용, 득템/핫스팟 등 유행어로 젊고 즐거운 분위기를 연출하여 행사 소식을 전달)</span>
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 bg-gray-50 font-medium">인스타그램 스토리<br/>(실시간 후기/소통)</td>
                  <td className="border border-gray-300 px-4 py-2">
                    &quot;오픈 30분 전인데 줄 실화인가요? 😱👏 매주 이렇게 찾아와주시는 우리 고객님들… 정말 감사합니다😭❤️ 더 좋은 제품으로 보답할게요! #돌핀웨일사랑&quot;<br/><span className="text-gray-600 text-sm">(현장 사진 위에 올린 즉흥 멘트로, 고객 감사 인사와 함께 현장 열기를 공유. 진정성과 친밀감을 느낄 수 있는 톤)</span>
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 bg-gray-50 font-medium">현장 배너<br/>(오프라인 매장)</td>
                  <td className="border border-gray-300 px-4 py-2">
                    &quot;정기입고 DAY! 스크래치 대방출 🔥 전품목 1,000원~5,000원&quot;<br/>
                    &quot;선착순 100명 오늘만 특별 사은품 증정 👉 놓치지 마세요!&quot;<br/>
                    <span className="text-gray-600 text-sm">(매장 입구 배너/입간판에 굵은 글씨와 숫자 강조로 할인율, 가격대, 선착순 혜택 등을 명시하여 고객 시선을 사로잡는 문구)</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <p className="mb-4">
            위와 같은 메시지 전략을 통해 돌핀웨일은 <strong className="font-bold">&quot;싸고 좋은 옷이 매주 쏟아진다&quot;</strong>는 인식을 심어주었습니다. 특히 즉각적이고 생생한 소통 (인스타 스토리의 현장 공유 등)과 한정 혜택에 대한 강조 (선착순, 한정 수량, 오늘만 등)이 고객들의 구매 욕구를 자극하여 충성도를 높이는 핵심 요인이 되었습니다.
          </p>
        </section>
        
        {/* 고객 후킹 포인트 섹션 (신규 추가) */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 border-l-4 border-amber-500 pl-3">고객 후킹 포인트 및 적용 전략</h2>
          
          <div className="bg-amber-50 p-6 rounded-lg mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-3">돌핀웨일 브랜드 핵심 마케팅 특징</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>인스타그램 DM, 스토리를 통한 한정 세일 소식 전파</li>
              <li>DM을 받은 사람만 아는 &apos;숨은 정보&apos;라는 심리적 소속감 제공</li>
              <li>매장 앞에 줄 선 모습 자체가 SNS 콘텐츠화 → 더 많은 유입 유도</li>
            </ul>
          </div>
          
          <h3 className="text-xl font-bold text-gray-800 mb-4">🧠 고객 후킹 포인트 (Dolphin Whale 기준)</h3>
          <div className="overflow-x-auto mb-6">
            <table className="min-w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left">요소</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">설명</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 font-medium">🎯 &quot;무조건 싼 게 전부였다면…&quot; 메시지</td>
                  <td className="border border-gray-300 px-4 py-2">단순 가격이 아니라 &apos;가치 있는 득템&apos;이라는 감정 자극</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 font-medium">🕰️ 한정 시기</td>
                  <td className="border border-gray-300 px-4 py-2">봄·가을 신상 교체 타이밍에 맞춘 시즌 오픈 세일</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 font-medium">📩 DM만의 혜택</td>
                  <td className="border border-gray-300 px-4 py-2">&apos;아는 사람만 아는 정보&apos;로 고객 선별감 유도</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 font-medium">📷 현장 사진 SNS 업로드</td>
                  <td className="border border-gray-300 px-4 py-2">브랜드의 핫함과 신뢰도 시각화 → 줄 자체가 광고</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 font-medium">💸 높은 실매출액 공개</td>
                  <td className="border border-gray-300 px-4 py-2">브랜드 파워와 실력의 사회적 증명 (social proof)</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <h3 className="text-xl font-bold text-gray-800 mb-4">🏌️ MASGOLF용 적용 전략 (50~60대 남성 고객 대상)</h3>
          <div className="overflow-x-auto mb-6">
            <table className="min-w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left">전략 요소</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">적용 방식</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 font-medium">🎁 한정 DM 혜택</td>
                  <td className="border border-gray-300 px-4 py-2">
                    &quot;대표님 단독혜택 안내드립니다&quot; 식 DM 캠페인 설계<br/>
                    → 고객 DB 대상 성함 직접 넣어 개별 메시지 발송
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 font-medium">🧓 고객 후기 기반 줄 세우기</td>
                  <td className="border border-gray-300 px-4 py-2">
                    시타 현장 줄세움 촬영 → &quot;왜 이렇게 줄을 서는 걸까?&quot; 유도<br/>
                    → 타깃 연령대는 행렬을 보면 신뢰를 느낌
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 font-medium">📍 시니어 맞춤 시즌 세일</td>
                  <td className="border border-gray-300 px-4 py-2">&quot;봄 골프 시즌 개막 기념 시타회&quot; → 리마인더 문자 + DM 세트</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 font-medium">📦 시타 + 경품 세트</td>
                  <td className="border border-gray-300 px-4 py-2">&quot;시타 고객 한정 MAS모자 증정&quot; or PLPL 한정음원 증정</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 font-medium">🔒 비공개 사전 예약 링크</td>
                  <td className="border border-gray-300 px-4 py-2">특정 시니어 고객 대상 비공개 페이지 링크 제공 → &apos;특권감&apos; 자극</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <h3 className="text-xl font-bold text-gray-800 mb-4">🧘 싱싱골프용 전략 (60대 여성 고객 대상)</h3>
          <div className="overflow-x-auto mb-6">
            <table className="min-w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left">전략 요소</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">적용 방식</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 font-medium">💐 &apos;총무님 혜택&apos; 감성 강조</td>
                  <td className="border border-gray-300 px-4 py-2">&quot;총무님 전용 와인 선물세트 제공&quot; 등 모임 대표자 후킹</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 font-medium">🌸 봄/가을 테마 활용</td>
                  <td className="border border-gray-300 px-4 py-2">
                    &quot;벚꽃 필 무렵, 힐링 골프 여행&quot; 테마 브로셔 디자인<br/>
                    사진과 실제 고객 이미지 활용
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 font-medium">🎯 패키지 구성 다양화</td>
                  <td className="border border-gray-300 px-4 py-2">&apos;뷰 맛집 카페+골프&apos;, &apos;힐링 산책 코스 포함&apos; 등 여성 감성 맞춤</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 font-medium">💬 단톡방 소문내기 유도</td>
                  <td className="border border-gray-300 px-4 py-2">단톡방 공유용 움짤/혜택 포스터 배포 → 입소문 확산 유도</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 font-medium">📷 후기 인증 리워드</td>
                  <td className="border border-gray-300 px-4 py-2">인증샷 이벤트 + 인스타 해시태그 유도 → &quot;#싱싱와인골프&quot; 등</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="bg-amber-50 p-6 rounded-lg mb-4">
            <h3 className="text-xl font-bold text-gray-800 mb-2">✨ 제안 마무리</h3>
            <p className="text-gray-800">
              단순한 가격 할인보다,<br/>
              <strong className="font-bold">&quot;왜 이 시기에, 왜 이 고객에게, 왜 나만 알 수 있는가?&quot;</strong><br/>
              이 &quot;선별된 경험&quot;의 감성적 후킹이 핵심입니다.
            </p>
          </div>
        </section>
        
        {/* MASGOLF 맞춤 전략 섹션 */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 border-l-4 border-amber-500 pl-3">MASGOLF 맞춤 전략 및 후킹 메시지 (시니어 남성 골퍼용)</h2>
          <p className="mb-6">
            MASGOLF는 50~70대 남성 시니어를 겨냥한 프리미엄 고반발 드라이버 전문 브랜드입니다. 돌핀웨일 사례에서 보듯 타깃 공략형 메시지가 중요하며, MASGOLF의 경우 기술력에 대한 신뢰와 비거리 향상에 초점을 맞춰 자신감을 불어넣는 톤으로 접근해야 합니다. 시니어 고객층이 공감할 수 있도록 권위 있고 품격 있는 어휘를 사용하되, 핵심 혜택은 직관적으로 전달하는 것이 효과적입니다. 다음은 이러한 전략을 반영한 고객 후킹 메시지 10개입니다.
          </p>
          
          <div className="grid gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-amber-500">
              <h3 className="font-bold text-lg mb-1">1. &quot;힘 빼도 멀리 나간다 – 70대도 비거리 30m 늘린 드라이버&quot;</h3>
              <p className="text-gray-700">– 나이 들어 줄었던 드라이버 거리를 되찾아주는 혁신 기술, 실제 시니어 후기 기반의 거리 향상 강조</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-amber-500">
              <h3 className="font-bold text-lg mb-1">2. &quot;COR 0.87 초고반발 페이스 – 한계치를 넘어 드라이버 비거리 극대화&quot;</h3>
              <p className="text-gray-700">– 규격 한계(0.83)를 뛰어넘는 초고반발 기술로 폭발적 비거리 달성, 기술 스펙을 신뢰감 있게 어필</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-amber-500">
              <h3 className="font-bold text-lg mb-1">3. &quot;시니어 전용 설계 드라이버 – 가볍게 휘두르고 편하게 더 멀리&quot;</h3>
              <p className="text-gray-700">– 경량 헤드+샤프트로 어르신도 부담 없이 스윙, 체력 부담 Zero로 비거리 업</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-amber-500">
              <h3 className="font-bold text-lg mb-1">4. &quot;한 번 더 젊게! 비거리에 자신감 주는 프리미엄 드라이버&quot;</h3>
              <p className="text-gray-700">– 마쓰구(MASGOLF) 클럽으로 청년 시절 드라이브 거리를 되찾는 자신감 회복 메시지</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-amber-500">
              <h3 className="font-bold text-lg mb-1">5. &quot;명품 드라이버의 기술력 – 이제 시니어 골퍼가 즐길 차례입니다&quot;</h3>
              <p className="text-gray-700">– 일본 등 고가 명품 드라이버에 견줄 첨단 기술력을 강조, 그러나 시니어를 위한 최적화임을 부각</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-amber-500">
              <h3 className="font-bold text-lg mb-1">6. &quot;내 몸에 딱 맞춘 맞춤형 드라이버, 50대 이상을 위해 태어났다&quot;</h3>
              <p className="text-gray-700">– 시니어 골퍼의 스윙 특성을 연구해 탄생한 제품임을 강조 (맞춤 설계, 전용 모델이라는 자부심)</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-amber-500">
              <h3 className="font-bold text-lg mb-1">7. &quot;백스윙은 가볍게, 임팩트는 강하게! 고반발로 즐기는 장타&quot;</h3>
              <p className="text-gray-700">– 쉬운 스윙으로도 임팩트 순간 폭발력이 생긴다는 점을 리드미컬한 문구로 표현 (골프의 즐거움 강조)</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-amber-500">
              <h3 className="font-bold text-lg mb-1">8. &quot;수천 명 시니어 골퍼의 선택 – 믿고 쓰는 마쓰구 드라이버&quot;</h3>
              <p className="text-gray-700">– 다수의 시니어들이 사용 중이라는 신뢰도 강조 (사회적 증명), 커뮤니티 추천 1위 등의 뉘앙스 포함</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-amber-500">
              <h3 className="font-bold text-lg mb-1">9. &quot;힘에 자신 없어도 OK! 마쓰구로 페어웨이 한가운데 시원하게&quot;</h3>
              <p className="text-gray-700">– 체력이 떨어져도 이 드라이버면 쉽게 멀리 보낼 수 있어 정중앙 페어웨이 안착을 즐긴다는 구체적 혜택 제시</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-amber-500">
              <h3 className="font-bold text-lg mb-1">10. &quot;이제 거리는 드라이버가 책임집니다. 스코어 향상의 비밀병기&quot;</h3>
              <p className="text-gray-700">– 클럽 교체만으로 타수가 줄었다는 인상을 주어, 장비 투자로 얻을 성과 (스코어 개선)를 부각</p>
            </div>
          </div>
          
          <p className="mb-4">
            위 메시지들은 모두 MASGOLF의 프리미엄 이미지를 지키면서도 시니어 골퍼의 <strong className="font-bold">열망(비거리, 안정성)</strong>을 직접적으로 자극하는 문구들입니다. 각 문구는 광고 카피, 배너, 상세 페이지 헤드라인 등으로 활용하여 제품에 대한 신뢰와 기대감을 동시에 전달하도록 구성되었습니다.
          </p>
        </section>
        
        {/* 싱싱골프 맞춤 전략 섹션 */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 border-l-4 border-amber-500 pl-3">싱싱골프 맞춤 전략 및 후킹 메시지 (여성 감성 골프여행용)</h2>
          <p className="mb-6">
            싱싱골프는 60대 전후 여성 골퍼들을 위한 골프 여행 전문 서비스입니다. 타깃 특성상 함께하는 즐거움과 여행의 감성을 살리는 것이 관건입니다. 돌핀웨일이 고객과 감정적으로 교감하며 성공을 거둔 것처럼, 싱싱골프도 힐링과 모임 문화에 초점을 맞춘 따뜻한 메시지가 필요합니다. 소중한 경험을 강조하고, 여행의 설렘을 불러일으킬 수 있는 서정적인 톤으로 접근합니다. 다음은 이러한 전략을 반영한 고객 후킹 메시지 10개입니다.
          </p>
          
          <div className="grid gap-4 mb-6">
            <div className="bg-rose-50 p-4 rounded-lg border-l-4 border-rose-300">
              <h3 className="font-bold text-lg mb-1">1. &quot;친구들과 함께 떠나는 힐링 골프 여행, 이번엔 싱싱골프와 시작하세요&quot;</h3>
              <p className="text-gray-700">– 오랜 친구 또는 동호회와 함께한다는 즐거움, 여행의 힐링 분위기를 정면으로 강조</p>
            </div>
            
            <div className="bg-rose-50 p-4 rounded-lg border-l-4 border-rose-300">
              <h3 className="font-bold text-lg mb-1">2. &quot;골프도 여행도 내 취향대로 – 여성들을 위한 감성 가득 맞춤 골프투어&quot;</h3>
              <p className="text-gray-700">– 코스, 일정, 식사 등 세세한 부분까지 취향을 존중하는 여행 설계, 여성 감성 만족 강조</p>
            </div>
            
            <div className="bg-rose-50 p-4 rounded-lg border-l-4 border-rose-300">
              <h3 className="font-bold text-lg mb-1">3. &quot;라운딩 후 즐기는 온천 & 수다타임… 몸도 마음도 리프레시!&quot;</h3>
              <p className="text-gray-700">– 골프 끝나고 누리는 휴식과 교류의 시간 강조. 플레이뿐만 아니라 여행의 여유와 즐거움 부각</p>
            </div>
            
            <div className="bg-rose-50 p-4 rounded-lg border-l-4 border-rose-300">
              <h3 className="font-bold text-lg mb-1">4. &quot;사진이 절로 나오는 꽃길 코스에서의 한 홀 – 평생 기억에 남을 순간&quot;</h3>
              <p className="text-gray-700">– 경치 좋고 포토제닉한 골프 코스 체험을 강조하여, 추억에 남는 여행임을 어필 (감성 자극)</p>
            </div>
            
            <div className="bg-rose-50 p-4 rounded-lg border-l-4 border-rose-300">
              <h3 className="font-bold text-lg mb-1">5. &quot;혼자보다 함께일 때 행복 두 배! 동갑내기들과 떠나는 싱글벙글 골프투어&quot;</h3>
              <p className="text-gray-700">– 비슷한 연령대 여성들이 모여 공감과 웃음이 넘치는 여행이라고 소개 (여행의 커뮤니티 분위기 강조)</p>
            </div>
            
            <div className="bg-rose-50 p-4 rounded-lg border-l-4 border-rose-300">
              <h3 className="font-bold text-lg mb-1">6. &quot;여성이 기획하니 다르다 – 섬세함이 묻어나는 여행 서비스, 안심하고 맡기세요&quot;</h3>
              <p className="text-gray-700">– 세심한 일정, 편안한 숙소, 맛있는 음식 등 디테일한 부분까지 신경 쓴 여행임을 부드럽게 강조</p>
            </div>
            
            <div className="bg-rose-50 p-4 rounded-lg border-l-4 border-rose-300">
              <h3 className="font-bold text-lg mb-1">7. &quot;내人生에 이런 여행 또 있을까요? 은퇴 후 누리는 우정 가득 골프여행&quot;</h3>
              <p className="text-gray-700">– 일상에서 벗어나 인생 2막을 즐기는 특별한 경험임을 강조, 은퇴 기념 여행 등의 맥락으로 감성 자극</p>
            </div>
            
            <div className="bg-rose-50 p-4 rounded-lg border-l-4 border-rose-300">
              <h3 className="font-bold text-lg mb-1">8. &quot;퍼팅 그린 너머로 지는 노을... 골프와 낭만이 함께하는 여행&quot;</h3>
              <p className="text-gray-700">– 여행 중 만날 아름다운 순간들(노을, 풍경)을 묘사하여 낭만적인 분위기를 연출, 감동 포인트 제공</p>
            </div>
            
            <div className="bg-rose-50 p-4 rounded-lg border-l-4 border-rose-300">
              <h3 className="font-bold text-lg mb-1">9. &quot;스코어보다 추억! 언니들과 함께라 더 즐거운 버디보다 좋은 시간&quot;</h3>
              <p className="text-gray-700">– 성적이나 경쟁보다 추억과 시간의 가치를 강조. 함께하는 동료애와 즐거움을 위트 있게 표현</p>
            </div>
            
            <div className="bg-rose-50 p-4 rounded-lg border-l-4 border-rose-300">
              <h3 className="font-bold text-lg mb-1">10. &quot;캐디도 부럽지 않은 든든한 동행, 싱싱골프가 여성 골퍼를 위해 준비했어요&quot;</h3>
              <p className="text-gray-700">– 여행사(싱싱골프)가 든든한 파트너가 되어준다는 의미로, 세심한 안내와 지원을 약속하는 신뢰 메시지</p>
            </div>
          </div>
          
          <p className="mb-4">
            위 문구들은 싱싱골프의 여성적이고 따뜻한 브랜드 이미지를 극대화하여, 고객들이 여행의 설렘과 편안함을 느끼도록 구성했습니다. 각각의 메시지는 홈페이지 배너, 카탈로그, SNS 홍보글 등에서 감성을 자극하는 카피로 활용 가능하며, <strong className="font-bold">&quot;함께 하는 소중한 경험&quot;</strong>이라는 테마를 일관되게 전달함으로써 60대 여성 골퍼들의 마음을 사로잡을 것입니다.
          </p>
        </section>
        
        {/* 푸터 */}
        <footer className="mt-16 pt-8 border-t border-gray-200 text-gray-600">
          <p>작성자: 마케팅 전략팀</p>
          <p>작성일: 2025년 4월 24일 (목)</p>
        </footer>
      </div>
    </div>
  );
};

export default MarketingReport;
