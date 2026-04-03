import { create } from 'zustand';
import type { Lesson } from 'my-libs';

interface LessonState {
  activeSection: string;
  completedSections: Record<string, boolean>;
  setActiveSection: (section: string) => void;
  markSectionComplete: (lessonId: string, section: string) => Promise<void>;
  syncCompletedSections: (completedArray: string[], sectionId: string) => void;
  resetLesson: () => void;
  getNextSection: (currentLessonId: string, currentSectionId: string, allSections: Lesson[]) => string | null;
  getPreviousSection: (currentLessonId: string, currentSectionId: string, allSections: Lesson[]) => string | null;
}

export const useLessonStore = create<LessonState>((set) => ({
  activeSection: 'overview',
  completedSections: {},

  setActiveSection: (section) => set({ activeSection: section }),

  markSectionComplete: async (lessonId, section) => {
    set((state) => ({
      completedSections: {
        ...state.completedSections,
        [`${lessonId}_${section}`]: true,
      },
    }));
    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId: section, isCompleted: true }),
      });
    } catch (e) {
      console.error('Failed to save progress:', e);
    }
  },

  syncCompletedSections: (completedArray, sectionId) => {
    set((state) => {
      const newCompleted = { ...state.completedSections };
      completedArray.forEach((partId) => {
        newCompleted[`${sectionId}_${partId}`] = true;
      });
      return { completedSections: newCompleted };
    });
  },

  resetLesson: () => set({ activeSection: 'overview' }),

  getNextSection: (_currentLessonId, currentSectionId, allSections) => {
    const currentIndex = allSections.findIndex((s) => s.id === currentSectionId);
    if (currentIndex === -1 || currentIndex === allSections.length - 1) return null;
    return allSections[currentIndex + 1]?.id ?? null;
  },

  getPreviousSection: (_currentLessonId, currentSectionId, allSections) => {
    const currentIndex = allSections.findIndex((s) => s.id === currentSectionId);
    if (currentIndex <= 0) return null;
    return allSections[currentIndex - 1]?.id ?? null;
  },
}));
