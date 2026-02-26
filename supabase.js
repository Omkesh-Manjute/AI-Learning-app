import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://tompsnkumfcvuanjxzvx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRvbXBzbmt1bWZjdnVhbmp4enZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2NTg4MTAsImV4cCI6MjA4NzIzNDgxMH0.zoGAzIddg7DBZHe5Odqy2WkIe1GF_gZbdB_BPKnKrsE';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── AUTH ──────────────────────────────────────────────────────────────
export const authService = {
  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    // fetch user profile
    const { data: profile, error: pErr } = await supabase
      .from('users').select('*').eq('id', data.user.id).single();
    if (pErr) throw new Error('Profile not found');
    return profile;
  },

  async register({ name, email, password, role, class: cls }) {
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { name, role, class: cls || null } }
    });
    if (error) throw new Error(error.message);
    // Wait a moment for trigger to create profile, then fetch
    await new Promise(r => setTimeout(r, 800));
    const { data: profile, error: pErr } = await supabase
      .from('users').select('*').eq('id', data.user.id).single();
    if (pErr) {
      // If trigger didn't fire fast enough, insert manually
      const { data: inserted, error: iErr } = await supabase.from('users').insert({
        id: data.user.id, name, email, role, class: cls || null
      }).select().single();
      if (iErr) throw new Error(iErr.message);
      return inserted;
    }
    return profile;
  },

  async logout() {
    await supabase.auth.signOut();
  },

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data: profile } = await supabase
      .from('users').select('*').eq('id', user.id).single();
    return profile || null;
  },

  onAuthChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  }
};

// ── CHAPTERS ──────────────────────────────────────────────────────────
export const chapterService = {
  async getAll() {
    const { data, error } = await supabase.from('chapters').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },
  async getByClass(cls) {
    const { data, error } = await supabase.from('chapters').select('*').eq('class', cls).order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },
  async getById(id) {
    const { data, error } = await supabase.from('chapters').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  },
  async create(chapterData) {
    const { data, error } = await supabase.from('chapters').insert(chapterData).select().single();
    if (error) throw error;
    return data;
  },
  async update(id, chapterData) {
    const { data, error } = await supabase.from('chapters').update(chapterData).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },
  async delete(id) {
    const { error } = await supabase.from('chapters').delete().eq('id', id);
    if (error) throw error;
  },
};

// ── TESTS ─────────────────────────────────────────────────────────────
export const testService = {
  async getAll() {
    const { data, error } = await supabase.from('tests').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },
  async getByChapter(chapterId) {
    const { data, error } = await supabase.from('tests').select('*').eq('chapter_id', chapterId);
    if (error) throw error;
    return data;
  },
  async getById(id) {
    const { data, error } = await supabase.from('tests').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  },
  async create(testData) {
    const { data, error } = await supabase.from('tests').insert(testData).select().single();
    if (error) throw error;
    return data;
  },
  async update(id, testData) {
    const { data, error } = await supabase.from('tests').update(testData).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },
  async delete(id) {
    const { error } = await supabase.from('tests').delete().eq('id', id);
    if (error) throw error;
  },
};

// ── STUDENT TESTS ─────────────────────────────────────────────────────
export const studentTestService = {
  async getByStudent(studentId) {
    const { data, error } = await supabase
      .from('student_tests').select('*').eq('student_id', studentId).order('completed_at', { ascending: false });
    if (error) throw error;
    return data;
  },
  async getAll() {
    const { data, error } = await supabase
      .from('student_tests').select('*, users(name, class)').order('completed_at', { ascending: false });
    if (error) throw error;
    return data;
  },
  async submit(submissionData) {
    const { data, error } = await supabase.from('student_tests').insert(submissionData).select().single();
    if (error) throw error;
    return data;
  },
};

// ── USERS ─────────────────────────────────────────────────────────────
export const userService = {
  async getStudents() {
    const { data, error } = await supabase.from('users').select('*').eq('role', 'student').order('created_at');
    if (error) throw error;
    return data;
  },
  async getById(id) {
    const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
    if (error) return null;
    return data;
  },
};
