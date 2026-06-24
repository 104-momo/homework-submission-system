export interface Assignment {
  id: string;
  title: string;
  description: string;
  deadline: string;
  createdAt: string;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentNames: string[];
  studentIds: string[];
  attachmentUrl: string;
  fileName: string;
  submittedAt: string;
  status: 'pending' | 'graded' | 'submitted';
  score?: number;
  comment?: string;
  gradedAt?: string;
}

export interface Student {
  id: string;
  name: string;
  studentNumber: string;
  className: string;
}

export type UserRole = 'student' | 'teacher' | null;

export interface AppState {
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  currentStudent: Student | null;
  setCurrentStudent: (student: Student | null) => void;
  assignments: Assignment[];
  setAssignments: (assignments: Assignment[]) => void;
  addAssignment: (assignment: Assignment) => void;
  deleteAssignment: (assignmentId: string) => void;
  submissions: Submission[];
  setSubmissions: (submissions: Submission[]) => void;
  deleteSubmission: (submissionId: string) => void;
  students: Student[];
  setStudents: (students: Student[]) => void;
  addStudent: (student: Student) => void;
  deleteStudent: (studentId: string) => void;
  batchDeleteStudents: (studentIds: string[]) => void;
  batchAddStudents: (students: Student[]) => void;
  loadData: () => Promise<void>;
}
