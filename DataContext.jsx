import { createContext, useContext, useState, useCallback } from 'react';
import { chapterService, testService, studentTestService, userService } from '../services/supabase';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // chapters
  const getChapters = useCallback(() => chapterService.getAll(), []);
  const getChaptersByClass = useCallback((cls) => chapterService.getByClass(cls), []);
  const getChapterById = useCallback((id) => chapterService.getById(id), []);
  const createChapter = useCallback(async (data) => { const c = await chapterService.create(data); showToast('Chapter created!'); return c; }, [showToast]);
  const updateChapter = useCallback(async (id, data) => { const c = await chapterService.update(id, data); showToast('Chapter updated!'); return c; }, [showToast]);
  const deleteChapter = useCallback(async (id) => { await chapterService.delete(id); showToast('Chapter deleted.', 'info'); }, [showToast]);

  // tests
  const getTests = useCallback(() => testService.getAll(), []);
  const getTestsByChapter = useCallback((chId) => testService.getByChapter(chId), []);
  const getTestById = useCallback((id) => testService.getById(id), []);
  const createTest = useCallback(async (data) => { const t = await testService.create(data); showToast('Test saved!'); return t; }, [showToast]);
  const updateTest = useCallback(async (id, data) => { const t = await testService.update(id, data); showToast('Test updated!'); return t; }, [showToast]);
  const deleteTest = useCallback(async (id) => { await testService.delete(id); showToast('Test deleted.', 'info'); }, [showToast]);

  // student tests
  const submitTest = useCallback(async (data) => { const s = await studentTestService.submit(data); showToast('Test submitted!'); return s; }, [showToast]);
  const getStudentTests = useCallback((studentId) => studentTestService.getByStudent(studentId), []);
  const getAllSubmissions = useCallback(() => studentTestService.getAll(), []);

  // users
  const getStudents = useCallback(() => userService.getStudents(), []);
  const getUserById = useCallback((id) => userService.getById(id), []);

  return (
    <DataContext.Provider value={{
      toast, showToast,
      getChapters, getChaptersByClass, getChapterById, createChapter, updateChapter, deleteChapter,
      getTests, getTestsByChapter, getTestById, createTest, updateTest, deleteTest,
      submitTest, getStudentTests, getAllSubmissions,
      getStudents, getUserById,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
