import { CheckCircle2, XCircle } from "lucide-react"

export type GuessHistoryEntry = {
  movieId: number
  movieTitle: string
  guess: string
  correct: boolean
  timestamp: number
}

interface GuessHistoryProps {
  history: GuessHistoryEntry[]
}

export function GuessHistory({ history }: GuessHistoryProps) {
  if (history.length === 0) return null

  const totalGuesses = history.length
  const correctGuesses = history.filter((entry) => entry.correct).length
  const incorrectGuesses = totalGuesses - correctGuesses
  const accuracy = totalGuesses > 0 ? Math.round((correctGuesses / totalGuesses) * 100) : 0

  return (
    <div className="mt-4">
      <h3 className="text-sm font-medium text-gray-500 mb-2">Histórico de palpites</h3>

      <div className="flex justify-between text-xs text-gray-600 mb-2 px-2">
        <div className="flex gap-4">
          <span>
            Total: <strong>{totalGuesses}</strong>
          </span>
          <span className="text-green-600">
            Acertos: <strong>{correctGuesses}</strong>
          </span>
          <span className="text-red-600">
            Erros: <strong>{incorrectGuesses}</strong>
          </span>
        </div>
        <span>
          Precisão: <strong>{accuracy}%</strong>
        </span>
      </div>

      <div className="bg-white rounded-lg border overflow-hidden max-h-60 overflow-y-auto">
        {history.map((entry, index) => (
          <div
            key={entry.timestamp}
            className={`flex items-center justify-between p-2 text-sm ${
              index !== history.length - 1 ? "border-b" : ""
            } ${entry.correct ? "bg-green-50" : ""}`}
          >
            <div className="flex items-center gap-2">
              {entry.correct ? (
                <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
              )}
              <span className="font-medium truncate">{entry.guess}</span>
            </div>
            <span className="text-gray-500 text-xs truncate ml-2">{entry.correct ? "Acertou!" : "Errou"}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
