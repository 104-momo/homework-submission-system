-- ============================================
-- 作业提交系统 - 数据库建表脚本
-- 在 Supabase SQL 编辑器中执行以下语句
-- ============================================

-- 1. 创建 assignments 表（作业表）
CREATE TABLE IF NOT EXISTS assignments (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  deadline TEXT NOT NULL,
  created_at TEXT
);

-- 2. 创建 students 表（学生表）
CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  student_number TEXT NOT NULL,
  class_name TEXT NOT NULL
);

-- 3. 创建 submissions 表（提交记录表）
CREATE TABLE IF NOT EXISTS submissions (
  id TEXT PRIMARY KEY,
  assignment_id TEXT REFERENCES assignments(id),
  student_names TEXT[],
  student_ids TEXT[],
  attachment_url TEXT,
  file_name TEXT,
  submitted_at TEXT,
  status TEXT DEFAULT 'pending',
  score FLOAT,
  comment TEXT,
  graded_at TEXT
);

-- ============================================
-- 权限设置（开启 RLS 后也能访问）
-- ============================================
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- 允许所有操作（简化模式，生产环境建议更严格控制）
CREATE POLICY "Enable full access for assignments"
  ON assignments FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable full access for students"
  ON students FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable full access for submissions"
  ON submissions FOR ALL
  USING (true)
  WITH CHECK (true);

-- 授予 anon 角色权限
GRANT ALL ON assignments TO anon;
GRANT ALL ON students TO anon;
GRANT ALL ON submissions TO anon;

-- ============================================
-- 可选：插入初始示例数据
-- ============================================
-- INSERT INTO assignments (id, title, description, deadline, created_at) VALUES
--   ('1', '小组项目报告', '完成期末小组项目报告，包含需求分析、设计文档和代码实现', '2026-07-15T23:59:59', '2026-06-15T09:00:00'),
--   ('2', '实验报告', '完成实验一的实验报告', '2026-07-10T23:59:59', '2026-06-10T09:00:00');

-- INSERT INTO students (id, name, student_number, class_name) VALUES
--   ('stu1', '张三', '2024001', '计算机科学1班'),
--   ('stu2', '李四', '2024002', '计算机科学1班'),
--   ('stu3', '王五', '2024003', '计算机科学1班');
