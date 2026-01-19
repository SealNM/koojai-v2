'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { TeacherReport, SeverityLevel } from '@/types';

/**
 * 👩‍🏫 Admin Dashboard Page
 * หน้า Dashboard สำหรับครู
 */

// Icons
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// Severity Badge Component
const SeverityBadge = ({ level }: { level: string }) => {
  const colors: Record<string, string> = {
    NONE: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
    LOW: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    MEDIUM: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
    HIGH: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
    CRITICAL: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold ${colors[level] || colors.NONE}`}>
      {level}
    </span>
  );
};

type ReportWithMeta = TeacherReport & { id: number; created_at: string };

function AdminDashboardContent() {
  const router = useRouter();
  const { logout, user } = useAuth();

  const [reports, setReports] = useState<ReportWithMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [selectedReport, setSelectedReport] = useState<ReportWithMeta | null>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/reports');
      const data = await response.json();
      if (data.reports) {
        setReports(data.reports);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  // Filter Logic
  const filteredReports = reports.filter((r) => {
    const matchesSearch = r.student_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterSeverity === 'ALL' || r.severity_level === filterSeverity;
    return matchesSearch && matchesFilter;
  });

  // Stats
  const totalStudents = new Set(reports.map((r) => r.student_id)).size;
  const highRiskCount = reports.filter(
    (r) => r.severity_level === SeverityLevel.HIGH || r.severity_level === SeverityLevel.CRITICAL
  ).length;
  const categories = reports.flatMap((r) => r.problem_category || []);
  const topCategory =
    categories
      .sort((a, b) => categories.filter((v) => v === a).length - categories.filter((v) => v === b).length)
      .pop() || '-';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 relative overflow-auto">
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[10%] right-[5%] w-96 h-96 bg-blue-200/40 dark:bg-blue-600/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[10%] left-[5%] w-96 h-96 bg-purple-200/40 dark:bg-purple-600/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-6 lg:p-10">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">Dashboard Overview</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              ยินดีต้อนรับ {user?.first_name}, นี่คือสรุปภาพรวมของนักเรียน
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/students"
              className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-sm transition-all font-medium text-sm flex items-center gap-2 cursor-pointer"
            >
              👥 จัดการนักเรียน
            </Link>
            <button
              onClick={handleLogout}
              className="px-6 py-2.5 bg-white/80 dark:bg-slate-800 backdrop-blur border border-slate-200 dark:border-slate-700 rounded-full shadow-sm text-slate-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 hover:border-red-100 dark:hover:border-red-900/50 transition-all font-medium text-sm cursor-pointer"
            >
              ออกจากระบบ
            </button>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-10">
          {[
            { label: 'Total Reports', value: reports.length, color: 'text-blue-600 dark:text-blue-400', border: 'border-blue-100 dark:border-blue-900/50' },
            { label: 'Active Students', value: totalStudents, color: 'text-purple-600 dark:text-purple-400', border: 'border-purple-100 dark:border-purple-900/50' },
            { label: 'High Risk', value: highRiskCount, color: 'text-red-600 dark:text-red-400', border: 'border-red-100 dark:border-red-900/50' },
            { label: 'Top Issue', value: topCategory, color: 'text-amber-600 dark:text-amber-400', border: 'border-amber-100 dark:border-amber-900/50' },
          ].map((stat, idx) => (
            <div
              key={idx}
              className={`p-4 md:p-6 rounded-2xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-md shadow-sm border ${stat.border} hover:shadow-md transition-all duration-300 transform hover:-translate-y-1`}
            >
              <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">{stat.label}</p>
              <p className={`text-2xl md:text-4xl font-extrabold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 dark:border-slate-700/50 overflow-hidden">
          {/* Toolbar */}
          <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4 bg-white/50 dark:bg-slate-800/50">
            <h3 className="font-bold text-xl text-slate-800 dark:text-white flex items-center gap-2">
              📄 รายงานล่าสุด
              <span className="bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-xs px-2 py-1 rounded-full">{filteredReports.length}</span>
            </h3>

            <div className="flex gap-3 w-full md:w-auto">
              {/* Search */}
              <div className="relative flex-1 md:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <SearchIcon />
                </div>
                <input
                  type="text"
                  placeholder="ค้นหา Student ID..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-400 dark:focus:border-blue-500 outline-none transition text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Filter */}
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-400 dark:focus:border-blue-500 outline-none cursor-pointer"
              >
                <option value="ALL">ทั้งหมด</option>
                <option value="NONE">NONE</option>
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>
          </div>

          {/* Reports Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-20 text-center">
                <div className="w-12 h-12 border-4 border-blue-100 dark:border-blue-900 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-500 dark:text-slate-400">กำลังโหลดข้อมูล...</p>
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="p-20 text-center">
                <p className="text-4xl mb-4">📭</p>
                <p className="text-slate-500 dark:text-slate-400">ยังไม่มีรายงาน</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-slate-50/50 dark:bg-slate-900/50">
                  <tr className="text-left text-xs font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                    <th className="px-6 py-4">Student ID</th>
                    <th className="px-6 py-4">Severity</th>
                    <th className="px-6 py-4">Problem Categories</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {filteredReports.map((report) => (
                    <tr key={report.id} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition">
                      <td className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-200">{report.student_id}</td>
                      <td className="px-6 py-4">
                        <SeverityBadge level={report.severity_level} />
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-sm">
                        {(report.problem_category || []).slice(0, 2).join(', ')}
                        {(report.problem_category?.length || 0) > 2 && '...'}
                      </td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-sm">
                        {new Date(report.created_at).toLocaleDateString('th-TH')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedReport(report)}
                          className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm cursor-pointer"
                        >
                          ดูรายละเอียด →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/30 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-700">
            <div className="sticky top-0 bg-white dark:bg-slate-800 p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center rounded-t-3xl">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                รายงานของ {selectedReport.student_id}
              </h2>
              <button onClick={() => setSelectedReport(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer">
                <CloseIcon />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Severity */}
              <div>
                <p className="text-xs uppercase font-bold text-slate-400 dark:text-slate-500 mb-2">ระดับความรุนแรง</p>
                <SeverityBadge level={selectedReport.severity_level} />
              </div>

              {/* Problem Categories */}
              <div>
                <p className="text-xs uppercase font-bold text-slate-400 dark:text-slate-500 mb-2">หมวดหมู่ปัญหา</p>
                <div className="flex flex-wrap gap-2">
                  {(selectedReport.problem_category || []).map((cat, i) => (
                    <span key={i} className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full text-sm">
                      {cat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div>
                <p className="text-xs uppercase font-bold text-slate-400 dark:text-slate-500 mb-2">สรุปสำหรับครู</p>
                <p className="text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4">{selectedReport.summary_for_teacher}</p>
              </div>

              {/* Recommendation */}
              <div>
                <p className="text-xs uppercase font-bold text-slate-400 dark:text-slate-500 mb-2">คำแนะนำ</p>
                <p className="text-slate-700 dark:text-slate-300 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">{selectedReport.recommendation_for_teacher}</p>
              </div>

              {/* Healing Quote */}
              {selectedReport.healing_quote && (
                <div>
                  <p className="text-xs uppercase font-bold text-slate-400 dark:text-slate-500 mb-2">การ์ดฮีลใจ</p>
                  <p className="text-slate-700 dark:text-slate-300 bg-pink-50 dark:bg-pink-900/20 rounded-xl p-4 italic">&ldquo;{selectedReport.healing_quote}&rdquo;</p>
                </div>
              )}

              {/* Date */}
              <div className="text-right text-sm text-slate-400 dark:text-slate-500">
                สร้างเมื่อ: {new Date(selectedReport.created_at).toLocaleString('th-TH')}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute allowedUserTypes={['teacher']}>
      <AdminDashboardContent />
    </ProtectedRoute>
  );
}
