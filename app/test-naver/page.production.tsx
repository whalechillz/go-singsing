// test-naver 페이지는 개발 환경에서만 사용
export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <div className="p-8 text-center">
      <h1 className="text-2xl font-bold">404 - Page Not Found</h1>
      <p className="mt-4">This page is only available in development.</p>
    </div>
  );
}