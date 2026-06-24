import { useState } from 'react';
import { User, GraduationCap, BookOpen, ArrowRight, Search } from 'lucide-react';
import { useStore } from '../store';
import { Student } from '../types';

export default function Login() {
  const { setUserRole, students, setCurrentStudent } = useStore();
  const [selectedRole, setSelectedRole] = useState<'student' | 'teacher' | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.studentNumber.includes(searchQuery) ||
      s.className.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLogin = () => {
    if (!selectedRole) {
      setError('请选择用户角色');
      return;
    }
    if (selectedRole === 'student' && !selectedStudent) {
      setError('请选择您的身份');
      return;
    }
    setError('');
    if (selectedRole === 'student' && selectedStudent) {
      setCurrentStudent(selectedStudent);
    }
    setUserRole(selectedRole);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <BookOpen className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">作业提交系统</h1>
          <p className="text-gray-500">选择您的角色登录系统</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => {
                setSelectedRole('student');
                setSelectedStudent(null);
                setError('');
              }}
              className={`p-6 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-3 ${
                selectedRole === 'student'
                  ? 'border-blue-500 bg-blue-50 shadow-lg'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
              }`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                selectedRole === 'student' ? 'bg-blue-500' : 'bg-gray-100'
              }`}>
                <GraduationCap className={`w-6 h-6 ${selectedRole === 'student' ? 'text-white' : 'text-gray-500'}`} />
              </div>
              <span className={`font-semibold ${selectedRole === 'student' ? 'text-blue-700' : 'text-gray-700'}`}>学生</span>
              <span className="text-sm text-gray-500">提交作业</span>
            </button>

            <button
              onClick={() => {
                setSelectedRole('teacher');
                setError('');
              }}
              className={`p-6 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-3 ${
                selectedRole === 'teacher'
                  ? 'border-green-500 bg-green-50 shadow-lg'
                  : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
              }`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                selectedRole === 'teacher' ? 'bg-green-500' : 'bg-gray-100'
              }`}>
                <User className={`w-6 h-6 ${selectedRole === 'teacher' ? 'text-white' : 'text-gray-500'}`} />
              </div>
              <span className={`font-semibold ${selectedRole === 'teacher' ? 'text-green-700' : 'text-gray-700'}`}>教师</span>
              <span className="text-sm text-gray-500">批改打分</span>
            </button>
          </div>

          {selectedRole === 'student' && (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">选择您的身份</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索姓名、学号或班级..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <button
                      key={student.id}
                      onClick={() => setSelectedStudent(student)}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center justify-between ${
                        selectedStudent?.id === student.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                      }`}
                    >
                      <div>
                        <div className="font-medium text-gray-800">{student.name}</div>
                        <div className="text-sm text-gray-500">{student.studentNumber} | {student.className}</div>
                      </div>
                      {selectedStudent?.id === student.id && (
                        <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                      )}
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-3 text-center text-gray-500">
                    未找到匹配的学生
                  </div>
                )}
              </div>
              {selectedStudent && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm text-blue-700">
                    已选择: <span className="font-medium">{selectedStudent.name}</span> ({selectedStudent.studentNumber})
                  </div>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="text-red-500 text-sm text-center py-2">
              {error}
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={selectedRole === 'student' && !selectedStudent}
            className={`w-full py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${
              selectedRole === 'student' && !selectedStudent
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl'
            }`}
          >
            登录系统
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        <div className="text-center mt-6 text-gray-400 text-sm">
          小组作业提交与评分系统
        </div>
      </div>
    </div>
  );
}