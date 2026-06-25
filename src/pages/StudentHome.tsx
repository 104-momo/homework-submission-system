import { useState } from 'react';
import {
  LogOut,
  Upload,
  FileText,
  Calendar,
  Clock,
  CheckCircle,
  Plus,
  X,
  Send,
  ArrowLeft,
  Users,
  User,
} from 'lucide-react';
import { useStore } from '../store';
import { Assignment, Submission, Student } from '../types';
import { supabase, hasSupabase } from '../supabase/client';

export default function StudentHome() {
  const { userRole, setUserRole, currentStudent, setCurrentStudent, assignments, submissions, students } = useStore();
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [selectedMembers, setSelectedMembers] = useState<Student[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showSubmitSuccess, setShowSubmitSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    setUserRole(null);
    setCurrentStudent(null);
  };

  const filteredStudents = students.filter(
    (s) =>
      (s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.studentNumber.includes(searchQuery) ||
        s.className.toLowerCase().includes(searchQuery.toLowerCase())) &&
      !selectedMembers.find((m) => m.id === s.id)
  );

  const addMember = (student: Student) => {
    setSelectedMembers([...selectedMembers, student]);
    setSearchQuery('');
  };

  const removeMember = (studentId: string) => {
    setSelectedMembers(selectedMembers.filter((m) => m.id !== studentId));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!selectedAssignment || !selectedFile || selectedMembers.length === 0) {
      return;
    }

    let attachmentUrl = '#';

    if (hasSupabase && supabase.storage) {
      const fileId = `${Date.now()}-${selectedFile.name}`;
      const { data, error } = await supabase.storage
        .from('homework-attachments')
        .upload(fileId, selectedFile);

      if (error) {
        console.error('File upload failed:', error);
      } else {
        const { data: urlData } = supabase.storage
          .from('homework-attachments')
          .getPublicUrl(fileId);
        attachmentUrl = urlData?.publicUrl || '#';
      }
    }

    const newSubmission: Submission = {
      id: `s${Date.now()}`,
      assignmentId: selectedAssignment.id,
      studentNames: selectedMembers.map((m) => m.name),
      studentIds: selectedMembers.map((m) => m.id),
      attachmentUrl,
      fileName: selectedFile.name,
      submittedAt: new Date().toISOString(),
      status: 'pending',
    };

    useStore.getState().setSubmissions([...submissions, newSubmission]);
    setSelectedAssignment(null);
    setSelectedMembers([]);
    setSelectedFile(null);
    setShowSubmitSuccess(true);
    setTimeout(() => setShowSubmitSuccess(false), 3000);
  };

  const getSubmissionStatus = (assignmentId: string) => {
    const submission = submissions.find(
      (s) => s.assignmentId === assignmentId && s.studentIds.includes(currentStudent?.id || '')
    );
    return submission ? submission.status : null;
  };

  const getSubmissionScore = (assignmentId: string) => {
    const submission = submissions.find(
      (s) => s.assignmentId === assignmentId && s.studentIds.includes(currentStudent?.id || '')
    );
    return submission?.score;
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

  const isOverdue = (deadline: string) => {
    return new Date(deadline) < new Date();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-800">作业提交系统</h1>
              <p className="text-sm text-gray-500">学生端</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {currentStudent && (
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-lg">
                <User className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-blue-700 font-medium">{currentStudent.name}</span>
                <span className="text-xs text-blue-500">{currentStudent.studentNumber}</span>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>退出登录</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {showSubmitSuccess && (
          <div className="mb-6 p-4 bg-green-100 border border-green-300 rounded-xl flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <span className="text-green-700 font-medium">作业提交成功！等待教师批改。</span>
          </div>
        )}

        {selectedAssignment ? (
          <div className="space-y-4">
            <button
              onClick={() => {
                setSelectedAssignment(null);
                setSelectedMembers(currentStudent ? [currentStudent] : []);
              }}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>返回作业列表</span>
            </button>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">提交作业: {selectedAssignment.title}</h2>
              <p className="text-gray-600 mb-6">{selectedAssignment.description}</p>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    小组成员 <span className="text-gray-400">(从名单中选择)</span>
                  </label>

                  <div className="mb-3">
                    <div className="flex flex-wrap gap-2">
                      {selectedMembers.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center gap-2 px-3 py-2 bg-blue-100 rounded-lg"
                        >
                          <span className="text-sm font-medium text-blue-800">{member.name}</span>
                          <span className="text-xs text-blue-600">{member.studentNumber}</span>
                          {selectedMembers.length > 1 && (
                            <button
                              onClick={() => removeMember(member.id)}
                              className="w-4 h-4 flex items-center justify-center text-blue-500 hover:text-red-500"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="搜索姓名、学号或班级添加成员..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {searchQuery && filteredStudents.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {filteredStudents.map((student) => (
                          <button
                            key={student.id}
                            onClick={() => addMember(student)}
                            className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors flex items-center justify-between"
                          >
                            <div>
                              <div className="font-medium text-gray-800">{student.name}</div>
                              <div className="text-sm text-gray-500">{student.studentNumber} | {student.className}</div>
                            </div>
                            <Plus className="w-4 h-4 text-blue-500" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-2 text-sm text-gray-500">
                    已选择 {selectedMembers.length} 名成员
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">上传作业附件</label>
                  <div
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                      selectedFile
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                    }`}
                  >
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      <Upload className={`w-10 h-10 ${selectedFile ? 'text-green-500' : 'text-gray-400'}`} />
                      {selectedFile ? (
                        <span className="text-green-600 font-medium">{selectedFile.name}</span>
                      ) : (
                        <>
                          <span className="text-gray-600">点击或拖拽文件到此处上传</span>
                          <span className="text-sm text-gray-400">支持 PDF、Word、图片、MP4 视频等格式</span>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={!selectedFile || selectedMembers.length === 0}
                  className={`w-full py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                    selectedFile && selectedMembers.length > 0
                      ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-5 h-5" />
                  <span>提交作业</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-6">作业列表</h2>
            <div className="grid gap-4">
              {assignments.map((assignment) => {
                const status = getSubmissionStatus(assignment.id);
                const score = getSubmissionScore(assignment.id);
                const overdue = isOverdue(assignment.deadline);

                return (
                  <div
                    key={assignment.id}
                    className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-800">{assignment.title}</h3>
                          {status === 'graded' && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-sm rounded-full">已批改</span>
                          )}
                          {status === 'pending' && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-sm rounded-full">待批改</span>
                          )}
                          {overdue && !status && (
                            <span className="px-2 py-1 bg-red-100 text-red-700 text-sm rounded-full">已过期</span>
                          )}
                        </div>
                        <p className="text-gray-600 mb-4">{assignment.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>截止日期: {formatDate(assignment.deadline)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {status === 'graded' && score !== undefined && (
                          <div className="text-3xl font-bold text-blue-600">{score}</div>
                        )}
                        {!status && !overdue && (
                          <button
                            onClick={() => {
                              setSelectedAssignment(assignment);
                              setSelectedMembers(currentStudent ? [currentStudent] : []);
                            }}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                          >
                            <Upload className="w-4 h-4" />
                            <span>提交作业</span>
                          </button>
                        )}
                        {status === 'pending' && (
                          <div className="flex items-center gap-2 text-yellow-600">
                            <Clock className="w-4 h-4" />
                            <span>等待批改中</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}