import { useEffect } from 'react';
import { useStore } from './store';
import Login from './pages/Login';
import StudentHome from './pages/StudentHome';
import TeacherHome from './pages/TeacherHome';

export default function App() {
  const userRole = useStore((state) => state.userRole);
  const loadData = useStore((state) => state.loadData);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (userRole === null) {
    return <Login />;
  }

  if (userRole === 'student') {
    return <StudentHome />;
  }

  if (userRole === 'teacher') {
    return <TeacherHome />;
  }

  return <Login />;
}
