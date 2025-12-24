// src/mocks/db.js
// Mock Database với LocalStorage Persistence
// Khớp với Entity của Backend Spring Boot

const DB_KEY = 'qlsv_mock_db';

// ============================================
// INITIAL SEEDING DATA (Khớp với Java Entities)
// ============================================
const initialData = {
  // ==========================================
  // USERS - Khớp với User.java Entity
  // Roles: ROLE_ADMIN, ROLE_LECTURER, ROLE_STUDENT
  // ==========================================
  users: [
    // ADMIN
    {
      id: 1,
      username: 'admin',
      password: 'Admin@123',
      email: 'admin@university.edu.vn',
      firstName: 'Quản Trị',
      lastName: 'Viên',
      fullName: 'Quản Trị Viên',
      role: 'ROLE_ADMIN',
      enabled: true,
      studentCode: null,
      lecturerCode: null,
      department: null
    },
    // ==========================================
    // LECTURERS - Dùng để test
    // ==========================================
    {
      id: 2,
      username: 'gv_hung',
      password: '123',
      email: 'hung@university.edu.vn',
      firstName: 'Mạnh Hùng',
      lastName: 'Nguyễn',
      fullName: 'Thầy Mạnh Hùng',
      role: 'ROLE_LECTURER',
      enabled: true,
      studentCode: null,
      lecturerCode: 'GV001',
      department: 'Khoa CNTT'
    },
    {
      id: 3,
      username: 'gv002',
      password: '123456',
      email: 'tranthib@university.edu.vn',
      firstName: 'Thị B',
      lastName: 'Trần',
      fullName: 'Trần Thị B',
      role: 'ROLE_LECTURER',
      enabled: true,
      studentCode: null,
      lecturerCode: 'GV1002',
      department: 'Khoa CNTT'
    },
    // ==========================================
    // STUDENTS - Dùng để test điểm danh
    // ==========================================
    {
      id: 10,
      username: 'sv_test_1',
      password: '123',
      email: 'sv1001@student.university.edu.vn',
      firstName: 'Văn A',
      lastName: 'Nguyễn',
      fullName: 'Nguyễn Văn A',
      role: 'ROLE_STUDENT',
      enabled: true,
      studentCode: 'SV1001',
      lecturerCode: null,
      department: null
    },
    {
      id: 11,
      username: 'sv002',
      password: '123456',
      email: 'sv002@student.university.edu.vn',
      firstName: 'Thị Hương',
      lastName: 'Phạm',
      fullName: 'Phạm Thị Hương',
      role: 'ROLE_STUDENT',
      enabled: true,
      studentCode: 'SV1002',
      lecturerCode: null,
      department: null
    },
    {
      id: 12,
      username: 'sv003',
      password: '123456',
      email: 'sv003@student.university.edu.vn',
      firstName: 'Văn Minh',
      lastName: 'Lê',
      fullName: 'Lê Văn Minh',
      role: 'ROLE_STUDENT',
      enabled: true,
      studentCode: 'SV1003',
      lecturerCode: null,
      department: null
    }
  ],

  // ==========================================
  // SEMESTERS - Khớp với Semester.java
  // ==========================================
  semesters: [
    {
      id: 1,
      name: 'Học kỳ 1 - 2024',
      startDate: '2024-09-01',
      endDate: '2025-01-15',
      isActive: true
    },
    {
      id: 2,
      name: 'Học kỳ 2 - 2024',
      startDate: '2025-02-01',
      endDate: '2025-06-15',
      isActive: false
    }
  ],

  // ==========================================
  // SUBJECTS - Khớp với Subject.java
  // ==========================================
  subjects: [
    { id: 1, subjectCode: 'INT300', subjectName: 'Lập trình Web (TEST)', credits: 3 },
    { id: 2, subjectCode: 'INT3306', subjectName: 'Lập trình Web', credits: 3 },
    { id: 3, subjectCode: 'INT2204', subjectName: 'Lập trình hướng đối tượng', credits: 4 },
    { id: 4, subjectCode: 'INT1001', subjectName: 'Nhập môn CNTT', credits: 2 }
  ],

  // ==========================================
  // COURSES - Khớp với Course.java
  // QUAN TRỌNG: Có nested subject, semester, lecturer, students
  // ==========================================
  courses: [
    // ★★★ COURSE TEST CHÍNH - ID 999 ★★★
    {
      id: 999,
      courseCode: 'INT300.01',
      subject: {
        id: 1,
        subjectName: 'Lập trình Web (TEST)',
        subjectCode: 'INT300'
      },
      semester: {
        id: 1,
        name: 'Học kỳ 1 - 2024'
      },
      lecturer: {
        id: 2,
        fullName: 'Thầy Mạnh Hùng',
        username: 'gv_hung',
        lecturerCode: 'GV001'
      },
      dayOfWeek: 'MONDAY',
      startTime: '07:00',
      endTime: '11:00',
      room: 'P.301',
      maxStudents: 50,
      currentStudents: 3,
      // ★★★ DANH SÁCH SINH VIÊN TRONG LỚP ★★★
      students: [
        {
          id: 10,
          studentCode: 'SV1001',
          fullName: 'Nguyễn Văn A',
          username: 'sv_test_1'
        },
        {
          id: 11,
          studentCode: 'SV1002',
          fullName: 'Phạm Thị Hương',
          username: 'sv002'
        },
        {
          id: 12,
          studentCode: 'SV1003',
          fullName: 'Lê Văn Minh',
          username: 'sv003'
        }
      ]
    },
    // Course bình thường khác
    {
      id: 101,
      courseCode: 'INT3306.01',
      subject: {
        id: 2,
        subjectName: 'Lập trình Web',
        subjectCode: 'INT3306'
      },
      semester: {
        id: 1,
        name: 'Học kỳ 1 - 2024'
      },
      lecturer: {
        id: 2,
        fullName: 'Thầy Mạnh Hùng',
        username: 'gv_hung',
        lecturerCode: 'GV001'
      },
      dayOfWeek: 'TUESDAY',
      startTime: '13:00',
      endTime: '16:00',
      room: 'P.202',
      maxStudents: 40,
      currentStudents: 2,
      students: [
        { id: 10, studentCode: 'SV1001', fullName: 'Nguyễn Văn A', username: 'sv_test_1' },
        { id: 11, studentCode: 'SV1002', fullName: 'Phạm Thị Hương', username: 'sv002' }
      ]
    },
    {
      id: 102,
      courseCode: 'INT2204.01',
      subject: {
        id: 3,
        subjectName: 'Lập trình hướng đối tượng',
        subjectCode: 'INT2204'
      },
      semester: {
        id: 1,
        name: 'Học kỳ 1 - 2024'
      },
      lecturer: {
        id: 3,
        fullName: 'Trần Thị B',
        username: 'gv002',
        lecturerCode: 'GV1002'
      },
      dayOfWeek: 'WEDNESDAY',
      startTime: '08:00',
      endTime: '11:00',
      room: 'P.101',
      maxStudents: 35,
      currentStudents: 1,
      students: [
        { id: 12, studentCode: 'SV1003', fullName: 'Lê Văn Minh', username: 'sv003' }
      ]
    }
  ],

  // ==========================================
  // ATTENDANCE SESSIONS - Phiên điểm danh
  // ==========================================
  sessions: [],

  // ==========================================
  // ATTENDANCE RECORDS - Bản ghi điểm danh
  // ==========================================
  attendanceRecords: []
};

// ============================================
// DATABASE FUNCTIONS
// ============================================

/**
 * Get database from localStorage or return initial data
 */
export const getDB = () => {
  try {
    const stored = localStorage.getItem(DB_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Đảm bảo có đủ các trường cần thiết
      return {
        ...initialData,
        ...parsed,
        sessions: parsed.sessions || [],
        attendanceRecords: parsed.attendanceRecords || []
      };
    }
  } catch (error) {
    console.error('[DB] Error reading from localStorage:', error);
  }
  return { ...initialData };
};

/**
 * Save database to localStorage
 */
export const saveDB = (db) => {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
    console.log('[DB] ✅ Saved to localStorage');
  } catch (error) {
    console.error('[DB] ❌ Error saving to localStorage:', error);
  }
};

/**
 * Reset database to initial state
 */
export const resetDB = () => {
  localStorage.removeItem(DB_KEY);
  console.log('[DB] 🔄 Database reset to initial state');
  return { ...initialData };
};

/**
 * Get next auto-increment ID for a collection
 */
export const getNextId = (collection) => {
  const db = getDB();
  const items = db[collection] || [];
  if (items.length === 0) return 1;
  const maxId = Math.max(...items.map(item => item.id || 0));
  return maxId + 1;
};

// Log on load
console.log('[DB] 📦 Mock Database initialized');
console.log('[DB] 🧪 Test accounts:');
console.log('  - ADMIN: admin / Admin@123');
console.log('  - LECTURER: gv_hung / 123');
console.log('  - STUDENT: sv_test_1 / 123');
console.log('[DB] 🏫 Test course: ID 999 - Lập trình Web (TEST)');

export default { getDB, saveDB, resetDB, getNextId };