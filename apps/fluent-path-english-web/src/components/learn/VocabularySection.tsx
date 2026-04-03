'use client'

import { useState, useEffect } from 'react'
import { useLessonStore } from '@/store/useLessonStore'
import { Volume2, ChevronRight, ChevronLeft } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { Vocabulary } from 'my-libs'

const mockVocab: Vocabulary[] = [
  {
    id: '1',
    lesson_id: 'mock',
    word: 'Technology',
    meaning_en: 'The application of scientific knowledge for practical purposes.',
    meaning_vi: 'Công nghệ',
    example_sentence: 'New technology is making learning easier.',
    phonetic: '',
    audio_url: null,
    order_index: 0,
    created_at: '',
  },
  {
    id: '2',
    lesson_id: 'mock',
    word: 'Artificial Intelligence',
    meaning_en: 'The simulation of human intelligence by machines.',
    meaning_vi: 'Trí tuệ nhân tạo',
    example_sentence: 'Artificial Intelligence is a rapidly growing field.',
    phonetic: '',
    audio_url: null,
    order_index: 1,
    created_at: '',
  },
  {
    id: '3',
    lesson_id: 'mock',
    word: 'Simulate',
    meaning_en: 'Imitate the appearance or character of.',
    meaning_vi: 'Mô phỏng',
    example_sentence: 'The software simulates the environment.',
    phonetic: '',
    audio_url: null,
    order_index: 2,
    created_at: '',
  },
]

export function VocabularySection({ lessonId, partId }: { lessonId: string; partId: string }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [vocabRows, setVocabRows] = useState<Vocabulary[]>([])
  const [loading, setLoading] = useState(true)
  const { markSectionComplete } = useLessonStore()

  useEffect(() => {
    const fetchVocab = async () => {
      const supabase = createClient()
      const { data } = await supabase.from('vocabulary').select('*').eq('lesson_id', partId)
      if (data && data.length > 0) {
        setVocabRows(data)
      }
      setLoading(false)
    }
    fetchVocab()
  }, [partId])

  const vocab = vocabRows.length > 0 ? vocabRows[currentIndex] : mockVocab[0]

  const nextCard = () => {
    setFlipped(false)
    if (currentIndex < mockVocab.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const prevCard = () => {
    setFlipped(false)
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const handleComplete = () => {
    markSectionComplete(lessonId, partId)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Flashcards</h2>
        <p className="text-gray-500 mt-2">Flip the cards to learn new words.</p>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          Loading flashcards...
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center">
          <div
            onClick={() => setFlipped(!flipped)}
            className={`w-full max-w-md h-80 rounded-2xl cursor-pointer transition-all duration-500 perspective-1000 ${
              flipped
                ? 'rotate-y-180 bg-indigo-50'
                : 'bg-white border-2 border-indigo-100 hover:border-indigo-300'
            } shadow-xl flex flex-col items-center justify-center p-8 text-center relative`}
            style={{ transformStyle: 'preserve-3d' }}
          >
            {!flipped ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 space-y-4 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation() /* play audio */
                  }}
                  className="absolute top-4 right-4 p-2 text-gray-400 hover:text-indigo-600 rounded-full hover:bg-gray-100"
                >
                  <Volume2 className="w-6 h-6" />
                </button>
                <h3 className="text-4xl font-extrabold text-indigo-900">{vocab.word}</h3>
                <p className="text-sm text-gray-400 font-medium tracking-widest uppercase">
                  Click to flip
                </p>
              </div>
            ) : (
              <div
                className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-indigo-50 rounded-2xl"
                style={{ transform: 'rotateY(180deg)' }}
              >
                <div className="space-y-4 w-full">
                  <div>
                    <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">
                      Definition
                    </h4>
                    <p className="text-xl text-gray-800 font-medium">{vocab.meaning_en}</p>
                  </div>
                  <div className="h-px bg-indigo-200 w-full" />
                  <div>
                    <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">
                      Example
                    </h4>
                    <p className="text-md text-gray-600 italic">
                      &ldquo;{vocab.example_sentence}&rdquo;
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-6 mt-8">
            <button
              onClick={prevCard}
              disabled={currentIndex === 0}
              className="p-3 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <span className="font-medium text-gray-500">
              {currentIndex + 1} / {mockVocab.length}
            </span>
            <button
              onClick={nextCard}
              disabled={currentIndex === mockVocab.length - 1}
              className="p-3 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      <div className="mt-8 flex justify-end">
        <button
          onClick={handleComplete}
          className="rounded-md bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
        >
          Mark Complete & Next
        </button>
      </div>
    </div>
  )
}
