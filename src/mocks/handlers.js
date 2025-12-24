// src/mocks/handlers.js
// MSW Handlers - Full 32 API Endpoints Coverage
import { http, HttpResponse } from 'msw';
import { getDB, saveDB } from './db';

// Base URL với wildcard để bắt mọi port
const API_URL = '*/api/v1';

// ============================================
// JWT HELPER - Tạo token hợp lệ cho jwt-decode
// ============================================
const createMockJwt = (user) => {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payloadData = {
    sub: user.username,
    role: user.role,
    userId: user.id,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 86400
  };
  const payload = btoa(JSON.stringify(payloadData))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  const signature = "mock_secret_signature";
  return `${header}.${payload}.${signature}`;
};

// UUID Generator
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const handlers = [

  // ==========================================
  // A. AUTH CONTROLLER
  // ==========================================

  // 1. POST /auth/login
  http.post(`${API_URL}/auth/login`, async ({ request }) => {
    const { username, password } = await request.json();
    const db = getDB();

    const user = db.users.find(u =>
      u.username === username && (u.password === password || password === '123')
    );

    if (user) {
      const token = createMockJwt(user);
      console.log(`[MSW] ✅ Login success: ${username} (${user.role})`);
      return HttpResponse.json({
        accessToken: token,
        tokenType: "Bearer",
        userId: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim()
      });
    }

    console.log(`[MSW] ❌ Login failed: ${username}`);
    return new HttpResponse(JSON.stringify({ message: 'Invalid credentials' }), {
      status: 401
    });
  }),

  // ==========================================
  // B. USER CONTROLLER (Full CRUD)
  // ==========================================

  // 2. GET /users
  http.get(`${API_URL}/users`, ({ request }) => {
    const db = getDB();
    const url = new URL(request.url);
    const roleParam = url.searchParams.get('role');
    const page = parseInt(url.searchParams.get('page')) || 0;
    const size = parseInt(url.searchParams.get('size')) || 100; // Tăng size mặc định

    let users = db.users;

    // Hỗ trợ cả 2 format: 'LECTURER' hoặc 'ROLE_LECTURER'
    if (roleParam) {
      const roleToMatch = roleParam.startsWith('ROLE_') ? roleParam : `ROLE_${roleParam}`;
      users = users.filter(u => u.role === roleToMatch);
      console.log(`[MSW] GET /users - Filter by role: ${roleParam} -> ${roleToMatch}, Found: ${users.length}`);
    }

    const start = page * size;
    const paged = users.slice(start, start + size);

    console.log(`[MSW] GET /users - Total: ${users.length}, Page: ${page}, Size: ${size}`);
    return HttpResponse.json({
      content: paged,
      users: paged, // FE có thể dùng .users thay vì .content
      totalElements: users.length,
      totalPages: Math.ceil(users.length / size),
      number: page,
      size: size
    });
  }),

  // 3. GET /users/:id
  http.get(`${API_URL}/users/:id`, ({ params }) => {
    const { id } = params;
    const db = getDB();
    const user = db.users.find(u => u.id === Number(id));

    if (user) {
      return HttpResponse.json(user);
    }
    return new HttpResponse(null, { status: 404 });
  }),

  // 4. POST /users/create
  http.post(`${API_URL}/users/create`, async ({ request }) => {
    const userData = await request.json();
    const db = getDB();

    const newUser = {
      ...userData,
      id: Date.now(),
      enabled: true,
      fullName: `${userData.firstName || ''} ${userData.lastName || ''}`.trim()
    };

    db.users.push(newUser);
    saveDB(db);

    console.log(`[MSW] ✅ Created user: ${newUser.username}`);
    return HttpResponse.json(newUser, { status: 201 });
  }),

  // 5. PUT /users/:id
  http.put(`${API_URL}/users/:id`, async ({ params, request }) => {
    const { id } = params;
    const updateData = await request.json();
    const db = getDB();
    const index = db.users.findIndex(u => u.id === Number(id));

    if (index !== -1) {
      db.users[index] = {
        ...db.users[index],
        ...updateData,
        fullName: `${updateData.firstName || db.users[index].firstName || ''} ${updateData.lastName || db.users[index].lastName || ''}`.trim()
      };
      saveDB(db);
      console.log(`[MSW] ✅ Updated user ID: ${id}`);
      return HttpResponse.json(db.users[index]);
    }
    return new HttpResponse(null, { status: 404 });
  }),

  // 6. DELETE /users/:id
  http.delete(`${API_URL}/users/:id`, ({ params }) => {
    const { id } = params;
    const db = getDB();
    const before = db.users.length;
    db.users = db.users.filter(u => u.id !== Number(id));
    saveDB(db);
    console.log(`[MSW] ✅ Deleted user ID: ${id} (${before} -> ${db.users.length})`);
    return new HttpResponse(null, { status: 204 });
  }),

  // 7. POST /users/resetpassword
  http.post(`${API_URL}/users/resetpassword`, async ({ request }) => {
    const username = await request.text();
    console.log(`[MSW] ✅ Reset password for: ${username}`);
    return new HttpResponse('Mật khẩu mới: 123456', {
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
    });
  }),

  // ==========================================
  // C. SUBJECT CONTROLLER (Full CRUD)
  // ==========================================

  // 8. GET /subjects
  http.get(`${API_URL}/subjects`, () => {
    const db = getDB();
    console.log(`[MSW] GET /subjects - Total: ${db.subjects.length}`);
    return HttpResponse.json(db.subjects);
  }),

  // 9. GET /subjects/:id
  http.get(`${API_URL}/subjects/:id`, ({ params }) => {
    const { id } = params;
    const db = getDB();
    const subject = db.subjects.find(s => s.id === Number(id));
    return subject ? HttpResponse.json(subject) : new HttpResponse(null, { status: 404 });
  }),

  // 10. POST /subjects
  http.post(`${API_URL}/subjects`, async ({ request }) => {
    const data = await request.json();
    const db = getDB();
    const newSubject = { ...data, id: Date.now() };
    db.subjects.push(newSubject);
    saveDB(db);
    console.log(`[MSW] ✅ Created subject: ${newSubject.name}`);
    return HttpResponse.json(newSubject, { status: 201 });
  }),

  // 11. PUT /subjects/:id
  http.put(`${API_URL}/subjects/:id`, async ({ params, request }) => {
    const { id } = params;
    const data = await request.json();
    const db = getDB();
    const index = db.subjects.findIndex(s => s.id === Number(id));
    if (index !== -1) {
      db.subjects[index] = { ...db.subjects[index], ...data };
      saveDB(db);
      return HttpResponse.json(db.subjects[index]);
    }
    return new HttpResponse(null, { status: 404 });
  }),

  // 12. DELETE /subjects/:id
  http.delete(`${API_URL}/subjects/:id`, ({ params }) => {
    const { id } = params;
    const db = getDB();
    db.subjects = db.subjects.filter(s => s.id !== Number(id));
    saveDB(db);
    return new HttpResponse(null, { status: 204 });
  }),

  // ==========================================
  // D. SEMESTER CONTROLLER (Full CRUD)
  // ==========================================

  // 13. GET /semesters
  http.get(`${API_URL}/semesters`, () => {
    const db = getDB();
    console.log(`[MSW] GET /semesters - Total: ${db.semesters.length}`);
    return HttpResponse.json(db.semesters);
  }),

  // 14. GET /semesters/:id
  http.get(`${API_URL}/semesters/:id`, ({ params }) => {
    const { id } = params;
    const db = getDB();
    const semester = db.semesters.find(s => s.id === Number(id));
    return semester ? HttpResponse.json(semester) : new HttpResponse(null, { status: 404 });
  }),

  // 15. POST /semesters
  http.post(`${API_URL}/semesters`, async ({ request }) => {
    const data = await request.json();
    const db = getDB();
    const newSemester = { ...data, id: Date.now() };
    db.semesters.push(newSemester);
    saveDB(db);
    console.log(`[MSW] ✅ Created semester: ${newSemester.name}`);
    return HttpResponse.json(newSemester, { status: 201 });
  }),

  // 16. PUT /semesters/:id
  http.put(`${API_URL}/semesters/:id`, async ({ params, request }) => {
    const { id } = params;
    const data = await request.json();
    const db = getDB();
    const index = db.semesters.findIndex(s => s.id === Number(id));
    if (index !== -1) {
      db.semesters[index] = { ...db.semesters[index], ...data };
      saveDB(db);
      return HttpResponse.json(db.semesters[index]);
    }
    return new HttpResponse(null, { status: 404 });
  }),

  // 17. DELETE /semesters/:id
  http.delete(`${API_URL}/semesters/:id`, ({ params }) => {
    const { id } = params;
    const db = getDB();
    db.semesters = db.semesters.filter(s => s.id !== Number(id));
    saveDB(db);
    return new HttpResponse(null, { status: 204 });
  }),

  // ==========================================
  // E. COURSE CONTROLLER
  // ==========================================

  // 17.5 GET /courses/my-courses (Student's enrolled courses)
  http.get(`${API_URL}/courses/my-courses`, ({ request }) => {
    const db = getDB();

    // Lấy studentId từ Authorization header (nếu có token)
    // Hoặc giả lập: lấy student ID 10 (sv_test_1) để test
    let currentStudentId = 10; // Default for testing

    const authHeader = request.headers.get('Authorization');
    if (authHeader) {
      try {
        const token = authHeader.replace('Bearer ', '');
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.userId) {
          currentStudentId = payload.userId;
        }
      } catch (e) {
        console.log('[MSW] Could not parse token, using default studentId');
      }
    }

    // Lọc các course mà student này đã đăng ký
    const myCourses = db.courses.filter(course =>
      course.students && course.students.some(s => s.id === currentStudentId)
    );

    console.log(`[MSW] ✅ GET /courses/my-courses - Student ID: ${currentStudentId}, Found: ${myCourses.length} courses`);
    return HttpResponse.json(myCourses);
  }),

  // 18. GET /courses
  http.get(`${API_URL}/courses`, ({ request }) => {
    const db = getDB();
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page')) || 0;
    const size = parseInt(url.searchParams.get('size')) || 10;

    const start = page * size;
    const paged = db.courses.slice(start, start + size);

    console.log(`[MSW] GET /courses - Total: ${db.courses.length}`);
    return HttpResponse.json({
      content: paged,
      totalElements: db.courses.length,
      totalPages: Math.ceil(db.courses.length / size),
      number: page
    });
  }),

  // 19. GET /courses/:id
  http.get(`${API_URL}/courses/:id`, ({ params }) => {
    const { id } = params;
    const db = getDB();
    const course = db.courses.find(c => c.id === Number(id));

    if (course) {
      console.log(`[MSW] GET /courses/${id} - Found: ${course.courseCode}`);
      return HttpResponse.json(course);
    }
    return new HttpResponse(null, { status: 404 });
  }),

  // 20. POST /courses
  http.post(`${API_URL}/courses`, async ({ request }) => {
    const data = await request.json();
    const db = getDB();

    const lecturer = db.users.find(u => u.id === Number(data.lecturerId));
    const subject = db.subjects.find(s => s.id === Number(data.subjectId));
    const semester = db.semesters.find(s => s.id === Number(data.semesterId));

    const newCourse = {
      id: Date.now(),
      courseCode: data.courseCode,
      subject: subject || { id: data.subjectId, name: 'Mock Subject', subjectCode: 'MOCK' },
      semester: semester || { id: data.semesterId, name: 'HK1 2025', year: 2025 },
      lecturer: lecturer ? {
        id: lecturer.id,
        lecturerCode: lecturer.lecturerCode,
        firstName: lecturer.firstName,
        lastName: lecturer.lastName
      } : { id: data.lecturerId, lecturerCode: data.lecturerCode || 'GV001' },
      dayOfWeek: data.dayOfWeek,
      startTime: data.startTime,
      endTime: data.endTime,
      room: data.room,
      maxStudents: data.maxStudents || 50,
      currentStudents: 0,
      students: []
    };

    db.courses.push(newCourse);
    saveDB(db);
    console.log(`[MSW] ✅ Created course: ${newCourse.courseCode}`);
    return HttpResponse.json(newCourse, { status: 201 });
  }),

  // 21. DELETE /courses/:id
  http.delete(`${API_URL}/courses/:id`, ({ params }) => {
    const { id } = params;
    const db = getDB();
    db.courses = db.courses.filter(c => c.id !== Number(id));
    saveDB(db);
    console.log(`[MSW] ✅ Deleted course ID: ${id}`);
    return new HttpResponse(null, { status: 204 });
  }),

  // 21.5. PUT /courses/:id (UPDATE COURSE)
  http.put(`${API_URL}/courses/:id`, async ({ params, request }) => {
    const { id } = params;
    const updateData = await request.json();
    const db = getDB();

    const index = db.courses.findIndex(c => c.id === Number(id));

    if (index !== -1) {
      const oldCourse = db.courses[index];

      // Logic: Nếu đổi giảng viên thì phải lấy lại full info của giảng viên đó
      let newLecturer = oldCourse.lecturer;
      if (updateData.lecturerId) {
        const foundLecturer = db.users.find(u => u.id === Number(updateData.lecturerId));
        if (foundLecturer) {
          newLecturer = {
            id: foundLecturer.id,
            lecturerCode: foundLecturer.lecturerCode,
            firstName: foundLecturer.firstName,
            lastName: foundLecturer.lastName
          };
        }
      }

      const updatedCourse = {
        ...oldCourse,
        ...updateData,
        lecturer: newLecturer
      };

      db.courses[index] = updatedCourse;
      saveDB(db);

      console.log(`[MSW] ✅ Updated course ${id}:`, updateData);
      return HttpResponse.json(updatedCourse);
    }

    console.log(`[MSW] ❌ Course ${id} not found`);
    return new HttpResponse(null, { status: 404 });
  }),

  // 22. GET /courses/by-lecturer/:lecturerId
  http.get(`${API_URL}/courses/by-lecturer/:lecturerId`, ({ params }) => {
    const { lecturerId } = params;
    const db = getDB();
    const courses = db.courses.filter(c =>
      c.lecturer && c.lecturer.id === Number(lecturerId)
    );
    console.log(`[MSW] GET /courses/by-lecturer/${lecturerId} - Found: ${courses.length}`);
    return HttpResponse.json(courses);
  }),

  // 23. GET /courses/:id/students
  http.get(`${API_URL}/courses/:id/students`, ({ params }) => {
    const { id } = params;
    const db = getDB();
    const course = db.courses.find(c => c.id === Number(id));

    if (course) {
      const students = course.students || [];
      console.log(`[MSW] GET /courses/${id}/students - Found: ${students.length}`);
      return HttpResponse.json(students);
    }
    return HttpResponse.json([]);
  }),

  // 24. POST /courses/register-student (QUAN TRỌNG)
  http.post(`${API_URL}/courses/register-student`, async ({ request }) => {
    const { studentCode, courseId } = await request.json();
    const db = getDB();

    const course = db.courses.find(c => c.id === Number(courseId));
    const student = db.users.find(u => u.studentCode === studentCode);

    if (!course) {
      return new HttpResponse(JSON.stringify({ message: 'Course not found' }), { status: 404 });
    }

    if (!student) {
      return new HttpResponse(JSON.stringify({ message: 'Student not found' }), { status: 404 });
    }

    // Initialize students array if not exists
    if (!course.students) {
      course.students = [];
    }

    // Check if already registered
    if (course.students.find(s => s.studentCode === studentCode)) {
      return new HttpResponse(JSON.stringify({ message: 'Already registered' }), { status: 400 });
    }

    // Add student to course
    course.students.push({
      id: student.id,
      studentCode: student.studentCode,
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email
    });
    course.currentStudents = course.students.length;

    saveDB(db);
    console.log(`[MSW] ✅ Registered ${studentCode} to course ${courseId}`);
    return HttpResponse.json({ message: 'Success' }, { status: 200 });
  }),

  // 25. GET /courses/:id/statistics
  http.get(`${API_URL}/courses/:id/statistics`, ({ params }) => {
    const { id } = params;
    const db = getDB();
    const course = db.courses.find(c => c.id === Number(id));

    if (course) {
      // Generate mock statistics
      const students = course.students || [];
      const statistics = students.map((student, index) => ({
        studentId: student.id,
        studentCode: student.studentCode,
        studentName: `${student.firstName || ''} ${student.lastName || ''}`.trim(),
        totalSessions: 10,
        presentCount: Math.floor(Math.random() * 8) + 2,
        absentCount: Math.floor(Math.random() * 3),
        lateCount: Math.floor(Math.random() * 2),
        attendanceRate: (70 + Math.random() * 30).toFixed(1),
        isBanned: index % 5 === 0 // Every 5th student is banned for demo
      }));

      console.log(`[MSW] GET /courses/${id}/statistics - ${statistics.length} students`);
      return HttpResponse.json(statistics);
    }

    return HttpResponse.json([]);
  }),

  // 26. POST /courses/:id/send-ban-notifications
  http.post(`${API_URL}/courses/:id/send-ban-notifications`, ({ params }) => {
    console.log(`[MSW] ✅ Sent ban notifications for course ${params.id}`);
    return HttpResponse.json({ message: 'Notifications sent' });
  }),

  // 27. GET /courses/:id/export-excel
  http.get(`${API_URL}/courses/:id/export-excel`, ({ params }) => {
    console.log(`[MSW] ✅ Export Excel for course ${params.id}`);
    // Return mock blob
    const blob = new Blob(['Mock Excel Data'], { type: 'application/vnd.ms-excel' });
    return new HttpResponse(blob, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="attendance_${params.id}.xlsx"`
      }
    });
  }),

  // ==========================================
  // F. ATTENDANCE CONTROLLER
  // ==========================================

  // 28. POST /attendance/start-session
  http.post(`${API_URL}/attendance/start-session`, async ({ request }) => {
    const { courseId } = await request.json();
    const db = getDB();

    // Initialize sessions array if not exists
    if (!db.attendance_sessions) {
      db.attendance_sessions = [];
    }

    // Close any existing open session for this course
    db.attendance_sessions.forEach(s => {
      if (s.courseId === Number(courseId) && s.status === 'OPEN') {
        s.status = 'CLOSED';
      }
    });

    const newSession = {
      id: Date.now(),
      sessionId: Date.now(),
      courseId: Number(courseId),
      startTime: new Date().toISOString(),
      endTime: null,
      status: 'OPEN',
      qrCodeData: generateUUID(),
      presentCount: 0,
      totalStudents: 0,
      records: []
    };

    db.attendance_sessions.push(newSession);
    saveDB(db);

    console.log(`[MSW] ✅ Started session for course ${courseId}, QR: ${newSession.qrCodeData}`);
    return HttpResponse.json(newSession);
  }),

  // 29. POST /attendance/close-session
  http.post(`${API_URL}/attendance/close-session`, async ({ request }) => {
    const { sessionId } = await request.json();
    const db = getDB();

    if (!db.attendance_sessions) {
      db.attendance_sessions = [];
    }

    const session = db.attendance_sessions.find(s => s.id === Number(sessionId) || s.sessionId === Number(sessionId));

    if (session) {
      session.status = 'CLOSED';
      session.endTime = new Date().toISOString();
      saveDB(db);
      console.log(`[MSW] ✅ Closed session ${sessionId}`);
      return HttpResponse.json({ status: 'CLOSED' });
    }

    return new HttpResponse(JSON.stringify({ message: 'Session not found' }), { status: 404 });
  }),

  // 30. POST /attendance/check-in
  http.post(`${API_URL}/attendance/check-in`, async ({ request }) => {
    const { qrCodeData, courseId } = await request.json();
    const db = getDB();

    if (!db.attendance_sessions) {
      return new HttpResponse(JSON.stringify({ message: 'No sessions found' }), { status: 400 });
    }

    // Find matching open session
    const session = db.attendance_sessions.find(s =>
      s.qrCodeData === qrCodeData && s.status === 'OPEN'
    );

    if (!session) {
      console.log(`[MSW] ❌ Invalid QR code: ${qrCodeData}`);
      return new HttpResponse(JSON.stringify({ message: 'QR code không hợp lệ hoặc phiên đã đóng' }), { status: 400 });
    }

    // Create attendance record
    const record = {
      id: Date.now(),
      sessionId: session.id,
      checkInTime: new Date().toISOString(),
      status: 'PRESENT'
    };

    if (!session.records) {
      session.records = [];
    }
    session.records.push(record);
    session.presentCount = session.records.length;
    saveDB(db);

    console.log(`[MSW] ✅ Check-in successful for session ${session.id}`);
    return HttpResponse.json({
      status: 'SUCCESS',
      message: 'Điểm danh thành công!',
      attendanceStatus: 'PRESENT',
      checkInTime: record.checkInTime
    });
  }),

  // 31. GET /attendance/history/:courseId
  http.get(`${API_URL}/attendance/history/:courseId`, ({ params }) => {
    const { courseId } = params;
    const db = getDB();

    if (!db.attendance_sessions) {
      return HttpResponse.json([]);
    }

    const sessions = db.attendance_sessions.filter(s => s.courseId === Number(courseId));

    // Transform to history format
    const history = sessions.map(s => ({
      sessionId: s.id,
      sessionDate: s.startTime,
      checkInTime: s.records && s.records.length > 0 ? s.records[0].checkInTime : null,
      status: s.records && s.records.length > 0 ? 'PRESENT' : 'ABSENT'
    }));

    console.log(`[MSW] GET /attendance/history/${courseId} - ${history.length} sessions`);
    return HttpResponse.json(history);
  }),

  // GET /attendance/course/:courseId - Get all sessions for a course
  http.get(`${API_URL}/attendance/course/:courseId`, ({ params }) => {
    const { courseId } = params;
    const db = getDB();

    if (!db.attendance_sessions) {
      return HttpResponse.json([]);
    }

    const sessions = db.attendance_sessions.filter(s => s.courseId === Number(courseId));
    console.log(`[MSW] GET /attendance/course/${courseId} - ${sessions.length} sessions`);
    return HttpResponse.json(sessions);
  }),

  // 32. GET /attendance/session/:sessionId/records
  http.get(`${API_URL}/attendance/session/:sessionId/records`, ({ params }) => {
    const { sessionId } = params;
    const db = getDB();

    if (!db.attendance_sessions) {
      return HttpResponse.json([]);
    }

    const session = db.attendance_sessions.find(s =>
      s.id === Number(sessionId) || s.sessionId === Number(sessionId)
    );

    if (session) {
      // Get course students and map to records
      const course = db.courses.find(c => c.id === session.courseId);
      const students = course?.students || [];

      const records = students.map((student, index) => ({
        id: Date.now() + index,
        studentCode: student.studentCode,
        studentName: `${student.firstName || ''} ${student.lastName || ''}`.trim(),
        checkInTime: session.records?.find(r => r.studentId === student.id)?.checkInTime || null,
        status: index % 3 === 0 ? 'ABSENT' : (index % 4 === 0 ? 'LATE' : 'PRESENT')
      }));

      console.log(`[MSW] GET /attendance/session/${sessionId}/records - ${records.length} records`);
      return HttpResponse.json(records);
    }

    return HttpResponse.json([]);
  }),

  // 33. PUT /attendance/record/:recordId
  http.put(`${API_URL}/attendance/record/:recordId`, async ({ params, request }) => {
    const { recordId } = params;
    const { status } = await request.json();

    console.log(`[MSW] ✅ Updated record ${recordId} to status: ${status}`);

    // In a real scenario, we'd update the DB here
    // For mock, just return success
    return HttpResponse.json({
      id: Number(recordId),
      status: status,
      updatedAt: new Date().toISOString()
    });
  }),

  // ==========================================
  // OPTIONAL: Student-specific endpoints
  // ==========================================

  // GET /courses/my-courses (for logged-in student)
  http.get(`${API_URL}/courses/my-courses`, () => {
    const db = getDB();
    // Return first 3 courses as "my courses" for demo
    const myCourses = db.courses.slice(0, 3);
    console.log(`[MSW] GET /courses/my-courses - ${myCourses.length} courses`);
    return HttpResponse.json(myCourses);
  }),

  // GET /courses/by-student/:studentId
  http.get(`${API_URL}/courses/by-student/:studentId`, ({ params }) => {
    const { studentId } = params;
    const db = getDB();
    const courses = db.courses.filter(c =>
      c.students && c.students.some(s => s.id === Number(studentId))
    );
    console.log(`[MSW] GET /courses/by-student/${studentId} - ${courses.length} courses`);
    return HttpResponse.json(courses);
  }),
];