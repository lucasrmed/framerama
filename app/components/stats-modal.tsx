"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Trophy, Film, Trash2, SkipForward } from "lucide-react"
import type { GuessHistoryEntry } from "./guess-history"

interface StatsModalProps {
  score: number
  history: GuessHistoryEntry[]
  playedMovies: number
  onResetStats: () => void
}

export function StatsModal({ score, history, playedMovies, onResetStats }: StatsModalProps) {
  const [open, setOpen] = useState(false)

  const totalGuesses = history.length
  const correctGuesses = history.filter((entry) => entry.correct).length
  const incorrectGuesses = totalGuesses - correctGuesses
  const skippedGuesses = history.filter((entry) => entry.skipped).length
  const accuracy = totalGuesses > 0 ? Math.round((correctGuesses / totalGuesses) * 100) : 0

  const lastCorrectGuess = history.find((entry) => entry.correct)

  const calculateStreak = () => {
    let streak = 0
    for (const entry of history) {
      if (entry.correct) {
        streak++
      } else {
        break
      }
    }
    return streak
  }

  const currentStreak = calculateStreak()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Histórico
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Suas estatísticas</DialogTitle>
          <DialogDescription>Veja como você está se saindo no jogo de adivinhação de filmes.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-4 gap-2 py-4">
          <div className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-lg">
            <span className="text-2xl font-bold">{score}</span>
            <span className="text-xs text-gray-500">Pontuação</span>
          </div>

          <div className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-lg">
            <span className="text-2xl font-bold">{totalGuesses}</span>
            <span className="text-xs text-gray-500">Palpites</span>
          </div>

          <div className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-lg">
            <span className="text-2xl font-bold">{accuracy}%</span>
            <span className="text-xs text-gray-500">Precisão</span>
          </div>

          <div className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-lg">
            <span className="text-2xl font-bold">{currentStreak}</span>
            <span className="text-xs text-gray-500">Sequência</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-blue-50 p-3 rounded-lg flex items-start gap-3">
            <Film className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm">Filmes jogados</p>
              <p className="text-2xl font-bold">{playedMovies}</p>
            </div>
          </div>

          <div className="bg-amber-50 p-3 rounded-lg flex items-start gap-3">
            <SkipForward className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm">Filmes pulados</p>
              <p className="text-2xl font-bold">{skippedGuesses}</p>
            </div>
          </div>
        </div>

        {lastCorrectGuess && (
          <div className="bg-green-50 p-3 rounded-lg flex items-start gap-3">
            <Trophy className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm">Último acerto</p>
              <p className="text-xs text-gray-600 line-clamp-2">
                <span className="font-medium">{lastCorrectGuess.movieTitle}</span>
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-between mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onResetStats}
            className="gap-1 text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
            <span>Resetar estatísticas</span>
          </Button>

          <Button onClick={() => setOpen(false)}>Fechar</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
