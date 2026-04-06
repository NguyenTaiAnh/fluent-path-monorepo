import { useMemo } from 'react'
import type { Section, Lesson } from 'my-libs'

export interface CourseDetailDict {
  mins?: string
  hours?: string
  [key: string]: string | undefined
}

type LessonWithDuration = Lesson & { duration_seconds?: number }

const DEFAULT_MINS_PER_LESSON = 15

/** Calculate total estimated study time from sections/lessons */
export function useStudyTime(sections: Section[] | undefined, t: CourseDetailDict) {
  return useMemo(() => {
    const minsLabel = t.mins ?? 'mins'
    const hoursLabel = t.hours ?? 'hours'
    if (!sections?.length) return `0 ${minsLabel}`

    let totalMinutes = 0
    for (const section of sections) {
      if (!section.lessons?.length) continue
      for (const lesson of section.lessons) {
        const l = lesson as LessonWithDuration
        totalMinutes +=
          l.duration_seconds && l.duration_seconds > 0
            ? Math.ceil(l.duration_seconds / 60)
            : DEFAULT_MINS_PER_LESSON
      }
    }

    if (totalMinutes >= 60) {
      const hours = Math.floor(totalMinutes / 60)
      const mins = totalMinutes % 60
      return mins > 0 ? `${hours} ${hoursLabel} ${mins} ${minsLabel}` : `${hours} ${hoursLabel}`
    }
    return `${totalMinutes} ${minsLabel}`
  }, [sections, t])
}

/** Estimate time for a single section */
export function getSectionTime(section: Section, t: CourseDetailDict): string {
  const minsLabel = t.mins ?? 'mins'
  if (!section.lessons?.length) return `0 ${minsLabel}`
  let totalMinutes = 0
  for (const lesson of section.lessons) {
    const l = lesson as LessonWithDuration
    totalMinutes +=
      l.duration_seconds && l.duration_seconds > 0
        ? Math.ceil(l.duration_seconds / 60)
        : DEFAULT_MINS_PER_LESSON
  }
  return `~${totalMinutes} ${minsLabel}`
}
