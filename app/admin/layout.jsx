import Link from "next/link";

const AdminLayout = ({ children }) => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
    <nav className="bg-blue-800 text-white px-6 py-4 flex items-center shadow">
      <Link href="/admin/tours" className="font-bold text-lg hover:underline focus:underline" aria-label="투어 관리">투어 관리</Link>
    </nav>
    <main className="flex-1 w-full max-w-3xl mx-auto p-6 text-gray-900 dark:text-gray-100">{children}</main>
  </div>
);

export default AdminLayout; 