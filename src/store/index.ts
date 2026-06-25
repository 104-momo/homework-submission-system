import { create } from 'zustand';
import { AppState, Assignment, Submission, UserRole, Student } from '../types';
import { supabase, hasSupabase } from '../supabase/client';

const initialAssignments: Assignment[] = [
  {
    id: '1',
    title: '小组项目报告',
    description: '完成期末小组项目报告，包含需求分析、设计文档和代码实现',
    deadline: '2026-07-15T23:59:59',
    createdAt: '2026-06-15T09:00:00',
  },
  {
    id: '2',
    title: '实验报告',
    description: '完成实验一的实验报告',
    deadline: '2026-07-10T23:59:59',
    createdAt: '2026-06-10T09:00:00',
  },
  {
    id: '3',
    title: '课程论文',
    description: '撰写一篇关于人工智能应用的课程论文',
    deadline: '2026-08-20T23:59:59',
    createdAt: '2026-06-20T09:00:00',
  },
];

const initialStudents: Student[] = [
  { id: 'stu1', name: '张三', studentNumber: '2024001', className: '计算机科学1班' },
  { id: 'stu2', name: '李四', studentNumber: '2024002', className: '计算机科学1班' },
  { id: 'stu3', name: '王五', studentNumber: '2024003', className: '计算机科学1班' },
  { id: 'stu4', name: '赵六', studentNumber: '2024004', className: '计算机科学2班' },
  { id: 'stu5', name: '钱七', studentNumber: '2024005', className: '计算机科学2班' },
  { id: 'stu6', name: '孙八', studentNumber: '2024006', className: '计算机科学2班' },
  { id: 'stu7', name: '周九', studentNumber: '2024007', className: '计算机科学3班' },
  { id: 'stu8', name: '吴十', studentNumber: '2024008', className: '计算机科学3班' },
];

const initialSubmissions: Submission[] = [];

const sb = supabase;

export const useStore = create<AppState>((set, get) => ({
  userRole: null,
  setUserRole: (role: UserRole) => set({ userRole: role }),
  currentStudent: null,
  setCurrentStudent: (student: Student | null) => set({ currentStudent: student }),
  assignments: initialAssignments,
  setAssignments: (assignments: Assignment[]) => set({ assignments }),
  
  addAssignment: async (assignment: Assignment) => {
    if (hasSupabase) {
      const { error } = await sb.from('assignments').insert({
        id: assignment.id,
        title: assignment.title,
        description: assignment.description,
        deadline: assignment.deadline,
        created_at: assignment.createdAt,
      });
      if (!error) {
        set((state) => ({ assignments: [...state.assignments, assignment] }));
      }
    } else {
      set((state) => ({ assignments: [...state.assignments, assignment] }));
    }
  },
  
  deleteAssignment: async (assignmentId: string) => {
    if (hasSupabase) {
      await sb.from('assignments').delete().eq('id', assignmentId);
      await sb.from('submissions').delete().eq('assignment_id', assignmentId);
    }
    set((state) => ({
      assignments: state.assignments.filter((a) => a.id !== assignmentId),
      submissions: state.submissions.filter((s) => s.assignmentId !== assignmentId),
    }));
  },
  
  submissions: initialSubmissions,
  setSubmissions: (submissions: Submission[]) => set({ submissions }),
  
  addSubmission: async (submission: Submission) => {
    if (hasSupabase) {
      const { error } = await sb.from('submissions').insert({
        id: submission.id,
        assignment_id: submission.assignmentId,
        student_names: submission.studentNames,
        student_ids: submission.studentIds,
        attachment_url: submission.attachmentUrl,
        file_name: submission.fileName,
        submitted_at: submission.submittedAt,
        status: submission.status,
      });
      if (!error) {
        set((state) => ({ submissions: [...state.submissions, submission] }));
      }
    } else {
      set((state) => ({ submissions: [...state.submissions, submission] }));
    }
  },
  
  updateSubmission: async (submissionId: string, updates: Partial<Submission>) => {
    if (hasSupabase) {
      const dbUpdates: Record<string, any> = {};
      if (updates.score !== undefined) dbUpdates.score = updates.score;
      if (updates.comment !== undefined) dbUpdates.comment = updates.comment;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.gradedAt !== undefined) dbUpdates.graded_at = updates.gradedAt;
      
      const { error } = await sb.from('submissions').update(dbUpdates).eq('id', submissionId);
      if (!error) {
        set((state) => ({
          submissions: state.submissions.map((s) =>
            s.id === submissionId ? { ...s, ...updates } : s
          ),
        }));
      }
    } else {
      set((state) => ({
        submissions: state.submissions.map((s) =>
          s.id === submissionId ? { ...s, ...updates } : s
        ),
      }));
    }
  },
  
  deleteSubmission: async (submissionId: string) => {
    if (hasSupabase) {
      await sb.from('submissions').delete().eq('id', submissionId);
    }
    set((state) => ({
      submissions: state.submissions.filter((s) => s.id !== submissionId),
    }));
  },
  
  students: initialStudents,
  setStudents: (students: Student[]) => set({ students }),
  
  addStudent: async (student: Student) => {
    if (hasSupabase) {
      const { error } = await sb.from('students').insert({
        id: student.id,
        name: student.name,
        student_number: student.studentNumber,
        class_name: student.className,
      });
      if (!error) {
        set((state) => ({ students: [...state.students, student] }));
      }
    } else {
      set((state) => ({ students: [...state.students, student] }));
    }
  },
  
  deleteStudent: async (studentId: string) => {
    if (hasSupabase) {
      await sb.from('students').delete().eq('id', studentId);
    }
    set((state) => ({
      students: state.students.filter((s) => s.id !== studentId),
    }));
  },
  
  batchDeleteStudents: async (studentIds: string[]) => {
    if (hasSupabase) {
      await sb.from('students').delete().in('id', studentIds);
    }
    set((state) => ({
      students: state.students.filter((s) => !studentIds.includes(s.id)),
    }));
  },
  
  batchAddStudents: async (newStudents: Student[]) => {
    if (hasSupabase) {
      const rows = newStudents.map((s) => ({
        id: s.id,
        name: s.name,
        student_number: s.studentNumber,
        class_name: s.className,
      }));
      const { error } = await sb.from('students').insert(rows);
      if (!error) {
        set((state) => ({ students: [...state.students, ...newStudents] }));
      }
    } else {
      set((state) => ({ students: [...state.students, ...newStudents] }));
    }
  },
  
  loadData: async () => {
    if (!hasSupabase) return;
    
    const [assignmentsRes, studentsRes, submissionsRes] = await Promise.all([
      sb.from('assignments').select('*'),
      sb.from('students').select('*'),
      sb.from('submissions').select('*'),
    ]);
    
    if (assignmentsRes.data && assignmentsRes.data.length > 0) {
      const formattedAssignments: Assignment[] = assignmentsRes.data.map((a: any) => ({
        id: a.id,
        title: a.title,
        description: a.description || '',
        deadline: a.deadline,
        createdAt: a.created_at,
      }));
      set({ assignments: formattedAssignments });
    }
    
    if (studentsRes.data && studentsRes.data.length > 0) {
      const formattedStudents: Student[] = studentsRes.data.map((s: any) => ({
        id: s.id,
        name: s.name,
        studentNumber: s.student_number,
        className: s.class_name,
      }));
      set({ students: formattedStudents });
    }
    
    if (submissionsRes.data && submissionsRes.data.length > 0) {
      const formattedSubmissions: Submission[] = submissionsRes.data.map((sub: any) => ({
        id: sub.id,
        assignmentId: sub.assignment_id,
        studentNames: sub.student_names || [],
        studentIds: sub.student_ids || [],
        attachmentUrl: sub.attachment_url || '#',
        fileName: sub.file_name || '',
        submittedAt: sub.submitted_at,
        status: sub.status as 'pending' | 'graded' | 'submitted',
        score: sub.score,
        comment: sub.comment,
        gradedAt: sub.graded_at,
      }));
      set({ submissions: formattedSubmissions });
    }
  },
}));
