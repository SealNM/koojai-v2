'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Student } from '@/types';

/**
 * 📚 StudentManagementPage
 * หน้าจัดการบัญชีนักเรียน (สำหรับครู/แอดมิน)
 */

const BackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
);

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

interface FormData {
  student_id: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  nickname: string;
  grade_level: string;
  classroom: string;
  birth_date: string;
}

function StudentManagementContent() {
  const router = useRouter();
  const { user } = useAuth();

  // State
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  // Form State
  const [formData, setFormData] = useState<FormData>({
    student_id: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    nickname: '',
    grade_level: '',
    classroom: '',
    birth_date: '',
  });

  const gradeOptions = ['ม.1', 'ม.2', 'ม.3', 'ม.4', 'ม.5', 'ม.6', 'ป.1', 'ป.2', 'ป.3', 'ป.4', 'ป.5', 'ป.6'];

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/students');
      const data = await res.json();
      setStudents(data.students || []);
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const showMessage = (msg: string, type: 'success' | 'error' = 'success') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleAddStudent = async () => {
    if (!formData.student_id || !formData.email || !formData.password || !formData.first_name || !formData.last_name || !formData.grade_level) {
      showMessage('กรุณากรอกข้อมูลให้ครบ', 'error');
      return;
    }

    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      
      if (result.success) {
        showMessage('เพิ่มนักเรียนสำเร็จ ✓');
        setShowAddModal(false);
        resetForm();
        loadStudents();
      } else {
        showMessage(result.message, 'error');
      }
    } catch (error) {
      showMessage('เกิดข้อผิดพลาด', 'error');
    }
  };

  const handleEditStudent = async () => {
    if (!selectedStudent?.id) return;

    try {
      const res = await fetch(`/api/students/${selectedStudent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: formData.first_name,
          last_name: formData.last_name,
          nickname: formData.nickname,
          grade_level: formData.grade_level,
          classroom: formData.classroom,
        }),
      });
      const result = await res.json();
      
      if (result.success) {
        showMessage('อัพเดทข้อมูลสำเร็จ ✓');
        setShowEditModal(false);
        loadStudents();
      } else {
        showMessage(result.message, 'error');
      }
    } catch (error) {
      showMessage('เกิดข้อผิดพลาด', 'error');
    }
  };

  const handleDeleteStudent = async (id: number) => {
    if (!confirm('ต้องการลบบัญชีนักเรียนนี้หรือไม่?')) return;

    try {
      const res = await fetch(`/api/students/${id}`, { method: 'DELETE' });
      const result = await res.json();
      
      if (result.success) {
        showMessage('ลบบัญชีสำเร็จ');
        loadStudents();
      }
    } catch (error) {
      showMessage('เกิดข้อผิดพลาด', 'error');
    }
  };

  const handleResetPassword = async (id: number) => {
    const newPassword = prompt('ใส่รหัสผ่านใหม่:', '123456');
    if (!newPassword) return;

    try {
      const res = await fetch(`/api/students/${id}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
      });
      const result = await res.json();
      
      if (result.success) {
        showMessage('รีเซ็ตรหัสผ่านสำเร็จ');
      }
    } catch (error) {
      showMessage('เกิดข้อผิดพลาด', 'error');
    }
  };

  const openEditModal = (student: Student) => {
    setSelectedStudent(student);
    setFormData({
      student_id: student.student_id,
      email: student.email,
      password: '',
      first_name: student.first_name,
      last_name: student.last_name,
      nickname: student.nickname || '',
      grade_level: student.grade_level,
      classroom: student.classroom || '',
      birth_date: student.birth_date || '',
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      student_id: '',
      email: '',
      password: '',
      first_name: '',
      last_name: '',
      nickname: '',
      grade_level: '',
      classroom: '',
      birth_date: '',
    });
  };

  // Filter students
  const filteredStudents = students.filter(s => {
    const matchesSearch = 
      s.student_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.last_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGrade = !gradeFilter || s.grade_level === gradeFilter;
    return matchesSearch && matchesGrade;
  });

  // Render Form Modal
  const renderModal = (isEdit: boolean) => {
    const isOpen = isEdit ? showEditModal : showAddModal;
    const onClose = () => isEdit ? setShowEditModal(false) : setShowAddModal(false);
    const onSubmit = isEdit ? handleEditStudent : handleAddStudent;
    const title = isEdit ? 'แก้ไขข้อมูลนักเรียน' : 'เพิ่มนักเรียนใหม่';

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black/30 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-700">
          <div className="p-6 border-b border-slate-100 dark:border-slate-700">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">{title}</h3>
          </div>
          <div className="p-6 space-y-4">
            {!isEdit && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">รหัสนักเรียน *</label>
                  <input
                    type="text"
                    value={formData.student_id}
                    onChange={e => setFormData({...formData, student_id: e.target.value})}
                    className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-400 dark:focus:border-blue-500 outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                    placeholder="เช่น 65010001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">อีเมล *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-400 dark:focus:border-blue-500 outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                    placeholder="student@school.ac.th"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">รหัสผ่าน *</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-400 dark:focus:border-blue-500 outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                    placeholder="••••••"
                  />
                </div>
              </>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">ชื่อ *</label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={e => setFormData({...formData, first_name: e.target.value})}
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-400 dark:focus:border-blue-500 outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">นามสกุล *</label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={e => setFormData({...formData, last_name: e.target.value})}
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-400 dark:focus:border-blue-500 outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">ชื่อเล่น</label>
              <input
                type="text"
                value={formData.nickname}
                onChange={e => setFormData({...formData, nickname: e.target.value})}
                className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-400 dark:focus:border-blue-500 outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">ระดับชั้น *</label>
                <select
                  value={formData.grade_level}
                  onChange={e => setFormData({...formData, grade_level: e.target.value})}
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-400 dark:focus:border-blue-500 outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                >
                  <option value="">เลือก</option>
                  {gradeOptions.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">ห้อง</label>
                <input
                  type="text"
                  value={formData.classroom}
                  onChange={e => setFormData({...formData, classroom: e.target.value})}
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-400 dark:focus:border-blue-500 outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  placeholder="1/1"
                />
              </div>
            </div>
          </div>
          <div className="p-6 border-t border-slate-100 dark:border-slate-700 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition font-medium text-slate-700 dark:text-slate-300"
            >
              ยกเลิก
            </button>
            <button
              onClick={onSubmit}
              className="flex-1 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition font-medium"
            >
              {isEdit ? 'บันทึก' : 'เพิ่ม'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-brand-dark p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition text-slate-600 dark:text-slate-400"
            >
              <BackIcon />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white">จัดการบัญชีนักเรียน</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm">เพิ่ม/แก้ไข/ลบบัญชีนักเรียนในระบบ</p>
            </div>
          </div>
          <button
            onClick={() => { resetForm(); setShowAddModal(true); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition font-medium"
          >
            <PlusIcon />
            <span>เพิ่มนักเรียน</span>
          </button>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-4 p-4 rounded-xl ${messageType === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'}`}>
            {message}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-4 mb-6 flex flex-col md:flex-row gap-4 border border-slate-200 dark:border-slate-700">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-3 flex items-center text-slate-400">
              <SearchIcon />
            </div>
            <input
              type="text"
              placeholder="ค้นหาชื่อหรือรหัสนักเรียน..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-400 dark:focus:border-blue-500 outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
            />
          </div>
          <select
            value={gradeFilter}
            onChange={e => setGradeFilter(e.target.value)}
            className="px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-400 dark:focus:border-blue-500 outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
          >
            <option value="">ทุกระดับชั้น</option>
            {gradeOptions.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>

        {/* Student List */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm overflow-hidden border border-slate-200 dark:border-slate-700">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="w-10 h-10 border-4 border-blue-100 dark:border-blue-900 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-500 dark:text-slate-400">กำลังโหลด...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-4xl mb-4">📭</p>
              <p className="text-slate-500 dark:text-slate-400">ไม่พบข้อมูลนักเรียน</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-900/50">
                  <tr className="text-left text-xs font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                    <th className="px-6 py-4">รหัสนักเรียน</th>
                    <th className="px-6 py-4">ชื่อ-นามสกุล</th>
                    <th className="px-6 py-4">ระดับชั้น</th>
                    <th className="px-6 py-4">ห้อง</th>
                    <th className="px-6 py-4">สถานะ</th>
                    <th className="px-6 py-4 text-right">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {filteredStudents.map(student => (
                    <tr key={student.id} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition">
                      <td className="px-6 py-4 font-mono text-sm text-slate-700 dark:text-slate-300">{student.student_id}</td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-slate-800 dark:text-white">{student.first_name} {student.last_name}</p>
                          {student.nickname && <p className="text-sm text-slate-400 dark:text-slate-500">({student.nickname})</p>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{student.grade_level}</td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{student.classroom || '-'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${student.is_active ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'}`}>
                          {student.is_active ? 'ใช้งาน' : 'ปิดใช้งาน'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditModal(student)}
                            className="px-3 py-1.5 text-blue-500 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg text-sm font-medium"
                          >
                            แก้ไข
                          </button>
                          <button
                            onClick={() => handleResetPassword(student.id!)}
                            className="px-3 py-1.5 text-amber-500 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg text-sm font-medium"
                          >
                            รีเซ็ตรหัส
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(student.id!)}
                            className="px-3 py-1.5 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm font-medium"
                          >
                            ลบ
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {renderModal(false)}
      {renderModal(true)}
    </div>
  );
}

export default function StudentManagementPage() {
  return (
    <ProtectedRoute allowedUserTypes={['teacher']}>
      <StudentManagementContent />
    </ProtectedRoute>
  );
}
