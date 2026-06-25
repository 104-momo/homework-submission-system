# Tasks

- [ ] Task 1: 项目初始化与数据库设计
  - [ ] SubTask 1.1: 创建 Next.js 项目并配置 TypeScript、Tailwind CSS
  - [ ] SubTask 1.2: 配置 Prisma 和数据库连接
  - [ ] SubTask 1.3: 设计数据库模型（User、Homework、Submission、Score）
  - [ ] SubTask 1.4: 运行数据库迁移

- [ ] Task 2: 用户认证系统
  - [ ] SubTask 2.1: 实现用户注册功能（支持学生和老师角色）
  - [ ] SubTask 2.2: 实现用户登录功能
  - [ ] SubTask 2.3: 实现用户登出功能
  - [ ] SubTask 2.4: 创建认证中间件保护路由

- [ ] Task 3: 学生作业提交功能
  - [ ] SubTask 3.1: 创建作业提交页面
  - [ ] SubTask 3.2: 实现文件上传组件（支持多格式文件）
  - [ ] SubTask 3.3: 实现学生姓名输入组件（支持多人输入）
  - [ ] SubTask 3.4: 实现作业提交 API（保存文件和数据库记录）
  - [ ] SubTask 3.5: 实现作业列表查看功能（学生查看自己提交的作业）

- [ ] Task 4: 老师批改打分功能
  - [ ] SubTask 4.1: 创建老师作业列表页面
  - [ ] SubTask 4.2: 实现作业详情查看功能（显示文件、学生姓名、提交时间）
  - [ ] SubTask 4.3: 实现打分组件
  - [ ] SubTask 4.4: 实现打分 API（保存分数）
  - [ ] SubTask 4.5: 实现分数修改功能

- [ ] Task 5: 成绩总表导出功能
  - [ ] SubTask 5.1: 创建成绩总表页面
  - [ ] SubTask 5.2: 实现成绩数据聚合逻辑
  - [ ] SubTask 5.3: 实现 Excel/CSV 导出功能

- [ ] Task 6: UI/UX 优化
  - [ ] SubTask 6.1: 优化页面布局和响应式设计
  - [ ] SubTask 6.2: 添加加载状态和错误提示
  - [ ] SubTask 6.3: 添加成功提示和确认对话框

# Task Dependencies
- [Task 2] depends on [Task 1]
- [Task 3] depends on [Task 2]
- [Task 4] depends on [Task 2]
- [Task 5] depends on [Task 4]
- [Task 6] depends on [Task 3, Task 4, Task 5]