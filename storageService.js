// localStorage-based storage service (fallback when Supabase not configured)

const KEYS = {
  USERS: 'sl_users',
  CHAPTERS: 'sl_chapters',
  TESTS: 'sl_tests',
  STUDENT_TESTS: 'sl_student_tests',
  PROGRESS: 'sl_progress',
  CURRENT_USER: 'sl_current_user',
};

// ── helpers ──────────────────────────────────────────────────────────
const get = (key) => JSON.parse(localStorage.getItem(key) || '[]');
const getObj = (key) => JSON.parse(localStorage.getItem(key) || 'null');
const set = (key, val) => localStorage.setItem(key, JSON.stringify(val));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2);

// ── seed sample data ──────────────────────────────────────────────────
export function seedSampleData() {
  if (localStorage.getItem('sl_seeded')) return;

  const teacherId = 'teacher_1';
  const student1Id = 'student_1';
  const student2Id = 'student_2';

  const users = [
    { id: teacherId, name: 'Mrs. Sharma', email: 'teacher@demo.com', password: 'demo123', role: 'teacher', class: null, createdAt: new Date().toISOString() },
    { id: student1Id, name: 'Rahul Kumar', email: 'student@demo.com', password: 'demo123', role: 'student', class: '10', createdAt: new Date().toISOString() },
    { id: student2Id, name: 'Priya Singh', email: 'priya@demo.com', password: 'demo123', role: 'student', class: '9', createdAt: new Date().toISOString() },
  ];

  const chapters = [
    { id: 'ch1', title: 'Introduction to Algebra', description: 'Learn variables, equations and algebraic expressions. Understand how to solve linear equations and apply them to real-world problems.', class: '10', subject: 'Mathematics', content: 'Algebra is a branch of mathematics dealing with symbols and the rules for manipulating those symbols. In algebra, those symbols represent quantities without fixed values, known as variables. The main topics include: 1) Variables and Constants - A variable is a symbol that represents an unknown value. 2) Algebraic Expressions - Combinations of variables and constants. 3) Linear Equations - Equations with degree 1. 4) Solving equations: If 2x + 3 = 7, then 2x = 4, x = 2.', pdfUrl: null, images: [], createdBy: teacherId, createdAt: new Date().toISOString() },
    { id: 'ch2', title: 'Photosynthesis', description: 'The process by which plants convert sunlight into food using carbon dioxide and water.', class: '9', subject: 'Science', content: 'Photosynthesis is the process used by plants, algae, and some bacteria to convert light energy into chemical energy. The equation: 6CO2 + 6H2O + light → C6H12O6 + 6O2. Chlorophyll in chloroplasts absorbs sunlight. The process has two stages: Light reactions (in thylakoids) and Calvin cycle (in stroma). Factors affecting photosynthesis: light intensity, CO2 concentration, temperature, water availability.', pdfUrl: null, images: [], createdBy: teacherId, createdAt: new Date().toISOString() },
    { id: 'ch3', title: 'The French Revolution', description: 'A period of radical political and social transformation in France from 1789 to 1799.', class: '9', subject: 'Social Studies', content: 'The French Revolution began in 1789 with the meeting of the Estates-General. Key causes: financial crisis, social inequality (Three Estates), Enlightenment ideas. Key events: Storming of the Bastille (July 14, 1789), Declaration of Rights of Man, Reign of Terror (1793-94), Rise of Napoleon. Key figures: Robespierre, Marie Antoinette, Napoleon Bonaparte. The revolution led to end of monarchy and rise of democracy.', pdfUrl: null, images: [], createdBy: teacherId, createdAt: new Date().toISOString() },
    { id: 'ch4', title: 'Fractions and Decimals', description: 'Understanding fractions, decimals and their relationship. Basic operations with fractions.', class: '6', subject: 'Mathematics', content: 'A fraction represents a part of a whole. It has a numerator (top) and denominator (bottom). Types: proper (1/2), improper (3/2), mixed (1½). Operations: Addition - same denominator: 1/4 + 2/4 = 3/4. Different denominators: find LCM first. Multiplication: multiply numerators and denominators. Division: multiply by reciprocal. Decimals: place value system. 0.1 = 1/10, 0.01 = 1/100.', pdfUrl: null, images: [], createdBy: teacherId, createdAt: new Date().toISOString() },
  ];

  const tests = [
    {
      id: 'test1',
      chapterId: 'ch1',
      title: 'Algebra Basics Test',
      questions: [
        { id: 'q1', type: 'mcq', question: 'What is the value of x in 2x + 3 = 7?', options: ['1', '2', '3', '4'], correctAnswer: '2', explanation: '2x = 7 - 3 = 4, so x = 4/2 = 2' },
        { id: 'q2', type: 'mcq', question: 'Which of these is a variable?', options: ['5', 'x', '3.14', '100'], correctAnswer: 'x', explanation: 'A variable is a symbol representing an unknown quantity, like x.' },
        { id: 'q3', type: 'true_false', question: 'In algebra, a constant has a fixed value.', correctAnswer: 'true', explanation: 'Yes, constants like 5, π, or 3.14 have fixed, unchanging values.' },
        { id: 'q4', type: 'true_false', question: 'The equation 3x = 12 gives x = 4.', correctAnswer: 'true', explanation: 'x = 12/3 = 4. This is correct.' },
        { id: 'q5', type: 'short_answer', question: 'Solve for y: y - 5 = 10', correctAnswer: '15', explanation: 'y = 10 + 5 = 15' },
      ],
      totalMarks: 5,
      timeLimit: 15,
      createdBy: teacherId,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'test2',
      chapterId: 'ch2',
      title: 'Photosynthesis Quiz',
      questions: [
        { id: 'q1', type: 'mcq', question: 'What is the primary pigment used in photosynthesis?', options: ['Melanin', 'Chlorophyll', 'Hemoglobin', 'Carotene'], correctAnswer: 'Chlorophyll', explanation: 'Chlorophyll is the green pigment in plants that absorbs sunlight for photosynthesis.' },
        { id: 'q2', type: 'mcq', question: 'Where does photosynthesis take place?', options: ['Mitochondria', 'Nucleus', 'Chloroplast', 'Ribosome'], correctAnswer: 'Chloroplast', explanation: 'Photosynthesis occurs in the chloroplasts of plant cells.' },
        { id: 'q3', type: 'true_false', question: 'Plants release oxygen during photosynthesis.', correctAnswer: 'true', explanation: 'Yes! Oxygen (O2) is a byproduct of the light reactions in photosynthesis.' },
        { id: 'q4', type: 'short_answer', question: 'What two raw materials do plants need for photosynthesis?', correctAnswer: 'Carbon dioxide and water', explanation: 'Plants use CO2 (carbon dioxide) and H2O (water) along with sunlight to produce glucose.' },
      ],
      totalMarks: 4,
      timeLimit: 10,
      createdBy: teacherId,
      createdAt: new Date().toISOString(),
    },
  ];

  const studentTests = [
    { id: 'st1', studentId: student1Id, testId: 'test1', answers: { q1: '2', q2: 'x', q3: 'true', q4: 'true', q5: '15' }, score: 5, percentage: 100, startedAt: new Date(Date.now() - 86400000 * 3).toISOString(), completedAt: new Date(Date.now() - 86400000 * 3).toISOString() },
    { id: 'st2', studentId: student1Id, testId: 'test2', answers: { q1: 'Chlorophyll', q2: 'Nucleus', q3: 'true', q4: 'Carbon dioxide and water' }, score: 3, percentage: 75, startedAt: new Date(Date.now() - 86400000).toISOString(), completedAt: new Date(Date.now() - 86400000).toISOString() },
  ];

  set(KEYS.USERS, users);
  set(KEYS.CHAPTERS, chapters);
  set(KEYS.TESTS, tests);
  set(KEYS.STUDENT_TESTS, studentTests);
  set(KEYS.PROGRESS, []);
  localStorage.setItem('sl_seeded', '1');
}

// ── auth ──────────────────────────────────────────────────────────────
export const authService = {
  login(email, password) {
    const users = get(KEYS.USERS);
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) throw new Error('Invalid email or password');
    const { password: _, ...safeUser } = user;
    set(KEYS.CURRENT_USER, safeUser);
    return safeUser;
  },
  register({ name, email, password, role, class: cls }) {
    const users = get(KEYS.USERS);
    if (users.find(u => u.email === email)) throw new Error('Email already registered');
    const newUser = { id: uid(), name, email, password, role, class: cls || null, createdAt: new Date().toISOString() };
    set(KEYS.USERS, [...users, newUser]);
    const { password: _, ...safeUser } = newUser;
    set(KEYS.CURRENT_USER, safeUser);
    return safeUser;
  },
  logout() { localStorage.removeItem(KEYS.CURRENT_USER); },
  getCurrentUser() { return getObj(KEYS.CURRENT_USER); },
};

// ── chapters ──────────────────────────────────────────────────────────
export const chapterService = {
  getAll() { return get(KEYS.CHAPTERS); },
  getByClass(cls) { return get(KEYS.CHAPTERS).filter(c => c.class === cls); },
  getById(id) { return get(KEYS.CHAPTERS).find(c => c.id === id); },
  create(data) {
    const chapters = get(KEYS.CHAPTERS);
    const newChapter = { id: uid(), ...data, createdAt: new Date().toISOString() };
    set(KEYS.CHAPTERS, [...chapters, newChapter]);
    return newChapter;
  },
  update(id, data) {
    const chapters = get(KEYS.CHAPTERS).map(c => c.id === id ? { ...c, ...data } : c);
    set(KEYS.CHAPTERS, chapters);
    return chapters.find(c => c.id === id);
  },
  delete(id) {
    set(KEYS.CHAPTERS, get(KEYS.CHAPTERS).filter(c => c.id !== id));
  },
};

// ── tests ─────────────────────────────────────────────────────────────
export const testService = {
  getAll() { return get(KEYS.TESTS); },
  getByChapter(chapterId) { return get(KEYS.TESTS).filter(t => t.chapterId === chapterId); },
  getById(id) { return get(KEYS.TESTS).find(t => t.id === id); },
  create(data) {
    const tests = get(KEYS.TESTS);
    const newTest = { id: uid(), ...data, createdAt: new Date().toISOString() };
    set(KEYS.TESTS, [...tests, newTest]);
    return newTest;
  },
  update(id, data) {
    const tests = get(KEYS.TESTS).map(t => t.id === id ? { ...t, ...data } : t);
    set(KEYS.TESTS, tests);
    return tests.find(t => t.id === id);
  },
  delete(id) {
    set(KEYS.TESTS, get(KEYS.TESTS).filter(t => t.id !== id));
  },
};

// ── student tests ─────────────────────────────────────────────────────
export const studentTestService = {
  getByStudent(studentId) { return get(KEYS.STUDENT_TESTS).filter(st => st.studentId === studentId); },
  getByTest(testId) { return get(KEYS.STUDENT_TESTS).filter(st => st.testId === testId); },
  getAll() { return get(KEYS.STUDENT_TESTS); },
  submit(data) {
    const existing = get(KEYS.STUDENT_TESTS);
    const submission = { id: uid(), ...data, completedAt: new Date().toISOString() };
    set(KEYS.STUDENT_TESTS, [...existing, submission]);
    return submission;
  },
};

// ── users ─────────────────────────────────────────────────────────────
export const userService = {
  getStudents() { return get(KEYS.USERS).filter(u => u.role === 'student').map(({ password: _, ...u }) => u); },
  getById(id) { const u = get(KEYS.USERS).find(u => u.id === id); if (!u) return null; const { password: _, ...safe } = u; return safe; },
};
