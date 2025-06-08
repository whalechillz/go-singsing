// 색상 값을 직접 사용하는 간단한 버전

export default function SimpleColorTest() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">싱싱골프 색상 테스트</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <div className="w-full h-24 bg-singsing-brand rounded"></div>
          <p className="mt-2">메인 네이비</p>
        </div>
        <div>
          <div className="w-full h-24 bg-singsing-accent rounded"></div>
          <p className="mt-2">골드 포인트</p>
        </div>
        <div>
          <div className="w-full h-24 bg-singsing-secondary rounded"></div>
          <p className="mt-2">서브 블루</p>
        </div>
        <div>
          <div className="w-full h-24 bg-singsing-nature rounded"></div>
          <p className="mt-2">자연 그린</p>
        </div>
      </div>
    </div>
  );
}