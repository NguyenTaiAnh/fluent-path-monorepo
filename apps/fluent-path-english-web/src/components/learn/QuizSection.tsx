'use client'

import { useState } from 'react'
import { useLessonStore } from '@/store/useLessonStore'
import { CheckCircle2, XCircle } from 'lucide-react'
import Link from 'next/link'

const quizData = [
  {
    question: 'What is the book Bob read about?',
    options: ['Cooking', 'Artificial Intelligence', 'History', 'Sports'],
    correct: 1
  },
  {
    question: 'Select the synonym for "Simulate".',
    options: ['Destroy', 'Create', 'Imitate', 'Stop'],
    correct: 2
  }
]

export function QuizSection({ lessonId, partId }: { lessonId: string; partId: string }) {
  const [currentQ, setCurrentQ] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [isFinished, setIsFinished] = useState(false)
  const { markSectionComplete } = useLessonStore()

  const handleSelect = (idx: number) => {
    if (showResult) return
    setSelected(idx)
  }

  const checkAnswer = () => {
    if (selected === null) return
    const isCorrect = selected === quizData[currentQ].correct
    if (isCorrect) setScore(score + 1)
    setShowResult(true)
  }

  const handleNext = () => {
    if (currentQ < quizData.length - 1) {
      setCurrentQ(currentQ + 1)
      setSelected(null)
      setShowResult(false)
    } else {
      setIsFinished(true)
      markSectionComplete(lessonId, partId)
    }
  }

  if (isFinished) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 h-full flex flex-col justify-center items-center text-center">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-12 h-12 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Lesson Completed!</h2>
        <p className="text-xl text-gray-500 mb-8">You scored {score}/{quizData.length} on the quiz.</p>
        <Link 
          href="/dashboard"
          className="rounded-full bg-indigo-600 px-8 py-3 text-white font-semibold text-lg hover:bg-indigo-500 shadow-md transition-all"
        >
          Return to Dashboard
        </Link>
      </div>
    )
  }

  const q = quizData[currentQ]

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 h-full flex flex-col">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Quiz</h2>
          <span className="font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
            Question {currentQ + 1} of {quizData.length}
          </span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-500 transition-all" style={{ width: `${((currentQ) / quizData.length) * 100}%` }} />
        </div>
      </div>

      <div className="flex-1">
        <h3 className="text-2xl font-medium text-gray-800 mb-8">{q.question}</h3>
        <div className="space-y-4">
          {q.options.map((opt, idx) => {
            let itemClass = "w-full text-left px-6 py-4 rounded-xl border-2 transition-all font-medium text-lg "
            
            if (showResult) {
              if (idx === q.correct) {
                itemClass += "border-green-500 bg-green-50 text-green-700"
              } else if (idx === selected) {
                itemClass += "border-red-500 bg-red-50 text-red-700"
              } else {
                itemClass += "border-gray-200 text-gray-400 opacity-50"
              }
            } else {
              if (selected === idx) {
                itemClass += "border-indigo-600 bg-indigo-50 text-indigo-700"
              } else {
                itemClass += "border-gray-200 text-gray-700 hover:border-indigo-300 hover:bg-gray-50"
              }
            }

            return (
              <button 
                key={idx}
                onClick={() => handleSelect(idx)}
                className={itemClass}
                disabled={showResult}
              >
                <div className="flex justify-between items-center">
                  <span>{opt}</span>
                  {showResult && idx === q.correct && <CheckCircle2 className="w-6 h-6 text-green-600" />}
                  {showResult && idx === selected && idx !== q.correct && <XCircle className="w-6 h-6 text-red-600" />}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-8 flex justify-end gap-4">
        {!showResult ? (
          <button 
            onClick={checkAnswer}
            disabled={selected === null}
            className="rounded-md bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Check Answer
          </button>
        ) : (
          <button 
            onClick={handleNext}
            className="rounded-md bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
          >
            {currentQ < quizData.length - 1 ? 'Next Question' : 'Finish Lesson'}
          </button>
        )}
      </div>
    </div>
  )
}
