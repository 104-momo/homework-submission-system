import { useState, useRef } from 'react';
import {
  LogOut,
  FileText,
  ClipboardList,
  Eye,
  CheckCircle,
  Clock,
  ArrowLeft,
  Save,
  Download,
  Users,
  Trash2,
  UserPlus,
  UserCog,
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  Upload,
  FileSpreadsheet,
  AlertTriangle,
  Calendar,
} from 'lucide-react';
import { useStore } from '../store';
import { Assignment, Submission, Student } from '../types';

type TabType = 'assignments' | 'grades' | 'students';

export default function TeacherHome() {
  const {
    setUserRole,
    assignments,
    submissions,
    setSubmissions,
    deleteSubmission,
    addAssignment,
    deleteAssignment,
    students,
    setStudents,
    addStudent,
    deleteStudent,
    batchDeleteStudents,
    batchAddStudents,
  } = useStore();

  const [activeTab, setActiveTab] = useState<TabType>('assignments');
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [score, setScore] = useState<number | ''>('');
  const [comment, setComment] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showAssignmentDeleteConfirm, setShowAssignmentDeleteConfirm] = useState<string | null>(null);

  const [newStudent, setNewStudent] = useState({ name: '', studentNumber: '', className: '' });
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    deadline: '',
  });
  const [showAddAssignment, setShowAddAssignment] = useState(false);
  const [selectedGradeAssignment, setSelectedGradeAssignment] = useState<string>('');

  const handleLogout = () => {
    setUserRole(null);
  };

  const handleGrade = () => {
    if (!selectedSubmission || score === '' || score < 0 || score > 100) {
      return;
    }

    const updatedSubmissions = submissions.map((s) =>
      s.id === selectedSubmission.id
        ? {
            ...s,
            score: score,
            comment: comment,
            status: 'graded' as const,
            gradedAt: new Date().toISOString(),
          }
        : s
    );

    setSubmissions(updatedSubmissions);
    setSelectedSubmission(null);
    setScore('');
    setComment('');
  };

  const handleDeleteSubmission = (submissionId: string) => {
    deleteSubmission(submissionId);
    setShowDeleteConfirm(null);
  };

  const handleDeleteAssignment = (assignmentId: string) => {
    deleteAssignment(assignmentId);
    setShowAssignmentDeleteConfirm(null);
    if (selectedAssignment?.id === assignmentId) {
      setSelectedAssignment(null);
    }
  };

  const handleAddStudent = () => {
    if (!newStudent.name || !newStudent.studentNumber || !newStudent.className) {
      return;
    }
    addStudent({
      id: `stu${Date.now()}`,
      name: newStudent.name,
      studentNumber: newStudent.studentNumber,
      className: newStudent.className,
    });
    setNewStudent({ name: '', studentNumber: '', className: '' });
  };

  const handleAddAssignment = () => {
    if (!newAssignment.title || !newAssignment.deadline) {
      return;
    }
    addAssignment({
      id: `a${Date.now()}`,
      title: newAssignment.title,
      description: newAssignment.description || '',
      deadline: newAssignment.deadline,
      createdAt: new Date().toISOString(),
    });
    setNewAssignment({ title: '', description: '', deadline: '' });
    setShowAddAssignment(false);
  };

  const toggleStudentSelection = (studentId: string) => {
    if (selectedStudentIds.includes(studentId)) {
      setSelectedStudentIds(selectedStudentIds.filter((id) => id !== studentId));
    } else {
      setSelectedStudentIds([...selectedStudentIds, studentId]);
    }
  };

  const toggleSelectAllStudents = () => {
    if (selectedStudentIds.length === filteredStudents.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(filteredStudents.map((s) => s.id));
    }
  };

  const handleBatchDelete = () => {
    if (selectedStudentIds.length === 0) return;
    batchDeleteStudents(selectedStudentIds);
    setSelectedStudentIds([]);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter((line) => line.trim());
      const newStudents: Student[] = [];

      lines.forEach((line, index) => {
        const parts = line.split(/[,，\t]/).map((p) => p.trim());
        if (parts.length >= 3) {
          const [name, studentNumber, className] = parts;
          if (name && studentNumber && className) {
            newStudents.push({
              id: `stu${Date.now()}-${index}`,
              name,
              studentNumber,
              className,
            });
          }
        }
      });

      if (newStudents.length > 0) {
        batchAddStudents(newStudents);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
      s.studentNumber.includes(studentSearchQuery) ||
      s.className.toLowerCase().includes(studentSearchQuery.toLowerCase())
  );

  const getSubmissionsByAssignment = (assignmentId: string) => {
    return submissions.filter((s) => s.assignmentId === assignmentId);
  };

  const getGradeProgress = (assignmentId: string) => {
    const assignmentSubmissions = getSubmissionsByAssignment(assignmentId);
    const gradedCount = assignmentSubmissions.filter((s) => s.status === 'graded').length;
    const totalCount = assignmentSubmissions.length;
    return totalCount > 0 ? Math.round((gradedCount / totalCount) * 100) : 0;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getSubmittedStudentIds = (assignmentId: string) => {
    const assignmentSubmissions = submissions.filter((s) => s.assignmentId === assignmentId);
    const submittedIds = new Set<string>();
    assignmentSubmissions.forEach((s) => {
      s.studentIds.forEach((id) => submittedIds.add(id));
    });
    return submittedIds;
  };

  const getUnsubmittedStudents = (assignmentId: string) => {
    const submittedIds = getSubmittedStudentIds(assignmentId);
    return students.filter((s) => !submittedIds.has(s.id));
  };

  const exportGrades = () => {
    const gradedSubmissions = submissions.filter((s) => s.status === 'graded');
    const data: Record<string, string | number>[] = [];

    gradedSubmissions.forEach((s) => {
      const assignment = assignments.find((a) => a.id === s.assignmentId);
      s.studentIds.forEach((studentId, index) => {
        const student = students.find((st) => st.id === studentId);
        data.push({
          作业名称: assignment?.title || '',
          学生姓名: s.studentNames[index] || student?.name || '',
          学号: student?.studentNumber || '',
          班级: student?.className || '',
          文件名: s.fileName,
          提交时间: formatDate(s.submittedAt),
          成绩: s.score || '',
          评语: s.comment || '',
          批改时间: s.gradedAt ? formatDate(s.gradedAt) : '',
        });
      });
    });

    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map((row) => headers.map((h) => `"${row[h]}"`).join(',')),
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `成绩总表_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.csv`;
    link.click();
  };

  const getGradeStats = () => {
    const graded = submissions.filter((s) => s.status === 'graded');
    const pending = submissions.filter((s) => s.status === 'pending');
    const avgScore = graded.length > 0
      ? (graded.reduce((sum, s) => sum + (s.score || 0), 0) / graded.length).toFixed(1)
      : '0';
    return { graded: graded.length, pending: pending.length, avgScore };
  };

  const stats = getGradeStats();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-800">作业提交系统</h1>
              <p className="text-sm text-gray-500">教师端</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>退出登录</span>
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('assignments')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'assignments'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5" />
              作业列表
            </span>
          </button>
          <button
            onClick={() => setActiveTab('grades')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'grades'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              成绩总表
            </span>
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'students'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span className="flex items-center gap-2">
              <UserCog className="w-5 h-5" />
              学生名单
            </span>
          </button>
        </div>

        {activeTab === 'assignments' ? (
          <>
            {selectedAssignment && !selectedSubmission ? (
              <div className="space-y-4">
                <button
                  onClick={() => setSelectedAssignment(null)}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>返回作业列表</span>
                </button>

                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">{selectedAssignment.title}</h2>
                      <p className="text-gray-600">{selectedAssignment.description}</p>
                    </div>
                    {showAssignmentDeleteConfirm === selectedAssignment.id ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDeleteAssignment(selectedAssignment.id)}
                          className="px-3 py-1 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors"
                        >
                          确认删除
                        </button>
                        <button
                          onClick={() => setShowAssignmentDeleteConfirm(null)}
                          className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-400 transition-colors"
                        >
                          取消
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowAssignmentDeleteConfirm(selectedAssignment.id)}
                        className="px-3 py-1 bg-red-50 text-red-500 text-sm rounded-lg hover:bg-red-100 transition-colors flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        删除作业
                      </button>
                    )}
                  </div>

                  <div className="grid gap-4">
                    {getSubmissionsByAssignment(selectedAssignment.id).map((submission) => (
                      <div
                        key={submission.id}
                        className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition-all"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Users className="w-5 h-5 text-gray-400" />
                              <span className="font-medium text-gray-800">
                                {submission.studentNames.join('、')}
                              </span>
                              {submission.status === 'graded' && (
                                <span className="px-2 py-1 bg-green-100 text-green-700 text-sm rounded-full">已批改</span>
                              )}
                              {submission.status === 'pending' && (
                                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-sm rounded-full">待批改</span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500 mb-2">
                              文件名: {submission.fileName}
                            </div>
                            <div className="text-sm text-gray-500">
                              提交时间: {formatDate(submission.submittedAt)}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            {submission.status === 'graded' && submission.score !== undefined && (
                              <div className="text-2xl font-bold text-blue-600">{submission.score}</div>
                            )}
                            <div className="flex gap-2">
                              <button
                                onClick={() => setSelectedSubmission(submission)}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                              >
                                <Eye className="w-4 h-4" />
                                <span>{submission.status === 'graded' ? '查看详情' : '批改'}</span>
                              </button>
                              {showDeleteConfirm === submission.id ? (
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleDeleteSubmission(submission.id)}
                                    className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                  >
                                    确认
                                  </button>
                                  <button
                                    onClick={() => setShowDeleteConfirm(null)}
                                    className="px-3 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                                  >
                                    取消
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setShowDeleteConfirm(submission.id)}
                                  className="px-3 py-2 bg-gray-100 text-red-500 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-1"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  <span>删除</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {getSubmissionsByAssignment(selectedAssignment.id).length === 0 && (
                      <div className="text-center py-12 text-gray-500">
                        <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>暂无提交记录</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : selectedSubmission ? (
              <div className="space-y-4">
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>返回作业提交列表</span>
                </button>

                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">批改作业</h2>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="border border-gray-200 rounded-xl p-4">
                        <h3 className="font-medium text-gray-800 mb-2">作业信息</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">小组成员: {selectedSubmission.studentNames.join('、')}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">文件名: {selectedSubmission.fileName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">提交时间: {formatDate(selectedSubmission.submittedAt)}</span>
                          </div>
                        </div>
                      </div>

                      {selectedSubmission.status === 'graded' && (
                        <div className="border border-gray-200 rounded-xl p-4">
                          <h3 className="font-medium text-gray-800 mb-2">批改记录</h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span className="text-gray-600">评分: {selectedSubmission.score}</span>
                            </div>
                            <div className="text-gray-600">评语: {selectedSubmission.comment}</div>
                            <div className="text-gray-400">批改时间: {selectedSubmission.gradedAt ? formatDate(selectedSubmission.gradedAt) : ''}</div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">评分 (0-100)</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={score}
                          onChange={(e) => setScore(Number(e.target.value))}
                          placeholder="输入分数"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xl font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">评语</label>
                        <textarea
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder="输入评语..."
                          rows={5}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        />
                      </div>

                      <button
                        onClick={handleGrade}
                        disabled={score === '' || score < 0 || score > 100}
                        className={`w-full py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                          score !== '' && score >= 0 && score <= 100
                            ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <Save className="w-5 h-5" />
                        <span>保存评分</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-white rounded-xl shadow-md p-4">
                    <div className="text-gray-500 text-sm mb-1">已批改</div>
                    <div className="text-2xl font-bold text-green-600">{stats.graded}</div>
                  </div>
                  <div className="bg-white rounded-xl shadow-md p-4">
                    <div className="text-gray-500 text-sm mb-1">待批改</div>
                    <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                  </div>
                  <div className="bg-white rounded-xl shadow-md p-4">
                    <div className="text-gray-500 text-sm mb-1">平均分</div>
                    <div className="text-2xl font-bold text-blue-600">{stats.avgScore}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-800">作业列表</h2>
                  <button
                    onClick={() => setShowAddAssignment(!showAddAssignment)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                  >
                    {showAddAssignment ? <ChevronUp className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                    <span>{showAddAssignment ? '收起' : '新增作业'}</span>
                  </button>
                </div>

                {showAddAssignment && (
                  <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                    <h3 className="font-semibold text-gray-800 mb-4">新增作业</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">作业名称</label>
                        <input
                          type="text"
                          value={newAssignment.title}
                          onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                          placeholder="请输入作业名称"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">截止日期</label>
                        <input
                          type="datetime-local"
                          value={newAssignment.deadline}
                          onChange={(e) => setNewAssignment({ ...newAssignment, deadline: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">作业描述</label>
                        <input
                          type="text"
                          value={newAssignment.description}
                          onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                          placeholder="请输入作业描述（可选）"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <button
                      onClick={handleAddAssignment}
                      disabled={!newAssignment.title || !newAssignment.deadline}
                      className={`mt-4 px-6 py-2 rounded-lg font-medium transition-colors ${
                        newAssignment.title && newAssignment.deadline
                          ? 'bg-green-500 text-white hover:bg-green-600'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      创建作业
                    </button>
                  </div>
                )}

                <div className="grid gap-4">
                  {assignments.map((assignment) => {
                    const progress = getGradeProgress(assignment.id);
                    const submissionCount = getSubmissionsByAssignment(assignment.id).length;

                    return (
                      <div
                        key={assignment.id}
                        onClick={() => setSelectedAssignment(assignment)}
                        className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg cursor-pointer transition-all group"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">{assignment.title}</h3>
                            <p className="text-gray-600 mb-4">{assignment.description || '暂无描述'}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>截止日期: {formatDate(assignment.deadline)}</span>
                              </div>
                              <span>|</span>
                              <span>提交人数: {submissionCount} 组</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-blue-600 mb-2">{progress}%</div>
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all ${
                                  progress === 100 ? 'bg-green-500' : 'bg-blue-500'
                                }`}
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              {progress === 100 ? '全部批改完成' : '批改进度'}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {assignments.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <ClipboardList className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>暂无作业，请点击"新增作业"创建</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        ) : activeTab === 'grades' ? (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">表一：已提交成绩</h2>
                <button
                  onClick={exportGrades}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  <span>导出成绩</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">作业名称</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">学生姓名</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">学号</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">班级</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">文件名</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600">成绩</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">评语</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.filter((s) => s.status === 'graded').map((submission) => {
                      const assignment = assignments.find((a) => a.id === submission.assignmentId);
                      return submission.studentIds.map((studentId, index) => {
                        const student = students.find((st) => st.id === studentId);
                        return (
                          <tr key={`${submission.id}-${index}`} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-4 px-4 text-sm text-gray-800">{assignment?.title}</td>
                            <td className="py-4 px-4 text-sm text-gray-800">{submission.studentNames[index] || student?.name}</td>
                            <td className="py-4 px-4 text-sm text-gray-600">{student?.studentNumber || '-'}</td>
                            <td className="py-4 px-4 text-sm text-gray-600">{student?.className || '-'}</td>
                            <td className="py-4 px-4 text-sm text-gray-600">{submission.fileName}</td>
                            <td className="py-4 px-4 text-center">
                              <span className={`text-lg font-bold ${
                                submission.score >= 90 ? 'text-green-600' :
                                submission.score >= 70 ? 'text-blue-600' :
                                submission.score >= 60 ? 'text-yellow-600' : 'text-red-600'
                              }`}>
                                {submission.score}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-sm text-gray-600 max-w-xs truncate">{submission.comment}</td>
                          </tr>
                        );
                      });
                    })}
                  </tbody>
                </table>
              </div>

              {submissions.filter((s) => s.status === 'graded').length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <ClipboardList className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>暂无已批改的作业</p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">表二：未提交作业学生名单</h2>
                  <p className="text-sm text-gray-500 mt-1">选择作业查看未提交的学生</p>
                </div>
                <select
                  value={selectedGradeAssignment}
                  onChange={(e) => setSelectedGradeAssignment(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">请选择作业</option>
                  {assignments.map((a) => (
                    <option key={a.id} value={a.id}>{a.title}</option>
                  ))}
                </select>
              </div>

              {selectedGradeAssignment ? (
                <>
                  <div className="mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                    <span className="text-gray-700">
                      共 <span className="font-bold text-red-500">{getUnsubmittedStudents(selectedGradeAssignment).length}</span> 名学生未提交作业
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">序号</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">姓名</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">学号</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">班级</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">状态</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getUnsubmittedStudents(selectedGradeAssignment).map((student, index) => (
                          <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-4 px-4 text-sm text-gray-600">{index + 1}</td>
                            <td className="py-4 px-4 text-sm text-gray-800 font-medium">{student.name}</td>
                            <td className="py-4 px-4 text-sm text-gray-600">{student.studentNumber}</td>
                            <td className="py-4 px-4 text-sm text-gray-600">{student.className}</td>
                            <td className="py-4 px-4">
                              <span className="px-2 py-1 bg-red-100 text-red-700 text-sm rounded-full">未提交</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {getUnsubmittedStudents(selectedGradeAssignment).length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-300" />
                      <p>所有学生都已提交作业！</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <FileSpreadsheet className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>请从上方选择作业查看未提交名单</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">学生名单管理</h2>
              <div className="text-sm text-gray-500">
                共 {students.length} 名学生
              </div>
            </div>

            <div className="mb-6 p-4 border border-gray-200 rounded-xl">
              <h3 className="font-medium text-gray-800 mb-4">添加新学生</h3>
              <div className="grid grid-cols-3 gap-4">
                <input
                  type="text"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                  placeholder="姓名"
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="text"
                  value={newStudent.studentNumber}
                  onChange={(e) => setNewStudent({ ...newStudent, studentNumber: e.target.value })}
                  placeholder="学号"
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="text"
                  value={newStudent.className}
                  onChange={(e) => setNewStudent({ ...newStudent, className: e.target.value })}
                  placeholder="班级"
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center gap-4 mt-4">
                <button
                  onClick={handleAddStudent}
                  disabled={!newStudent.name || !newStudent.studentNumber || !newStudent.className}
                  className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${
                    newStudent.name && newStudent.studentNumber && newStudent.className
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <UserPlus className="w-4 h-4" />
                  <span>添加学生</span>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileImport}
                  accept=".csv,.txt"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>批量导入</span>
                </button>
                <span className="text-sm text-gray-400">
                  支持 CSV/TXT 格式：姓名,学号,班级
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <input
                    type="text"
                    value={studentSearchQuery}
                    onChange={(e) => setStudentSearchQuery(e.target.value)}
                    placeholder="搜索姓名、学号或班级..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                {selectedStudentIds.length > 0 && (
                  <span className="text-sm text-blue-600">
                    已选择 {selectedStudentIds.length} 人
                  </span>
                )}
              </div>
              {selectedStudentIds.length > 0 && (
                <button
                  onClick={handleBatchDelete}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>批量删除</span>
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 w-12">
                      <input
                        type="checkbox"
                        checked={selectedStudentIds.length === filteredStudents.length && filteredStudents.length > 0}
                        onChange={toggleSelectAllStudents}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">姓名</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">学号</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">班级</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <input
                          type="checkbox"
                          checked={selectedStudentIds.includes(student.id)}
                          onChange={() => toggleStudentSelection(student.id)}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-800">{student.name}</td>
                      <td className="py-4 px-4 text-sm text-gray-600">{student.studentNumber}</td>
                      <td className="py-4 px-4 text-sm text-gray-600">{student.className}</td>
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => deleteStudent(student.id)}
                          className="px-3 py-1 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-1 mx-auto"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>删除</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredStudents.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>暂无学生名单</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}