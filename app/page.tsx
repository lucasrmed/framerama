"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle2, Loader2, SkipForward } from "lucide-react"
import { GuessHistory, type GuessHistoryEntry } from "./components/guess-history"
import { StatsModal } from "./components/stats-modal"
import { SearchInput } from "./components/search-input"
import { useLocalStorage } from "./hooks/use-local-storage"
import { shuffleArray } from "./utils/shuffle-array"

type Movie = {
  id: number
  title: string
  year: number
  overview: string
  posterUrl: string
  frames: string[]
}

export default function Home() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [currentMovie, setCurrentMovie] = useState<Movie | null>(null)
  const [difficultyLevel, setDifficultyLevel] = useState(0)
  const [guess, setGuess] = useState("")
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [gameOver, setGameOver] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [revealing, setRevealing] = useState(false)
  const [currentGuessMovie, setCurrentGuessMovie] = useState<Movie | null>(null)
  const [wasSkipped, setWasSkipped] = useState(false)

  const [score, setScore] = useLocalStorage<number>("filmFrameGame_score", 0)
  const [guessHistory, setGuessHistory] = useLocalStorage<GuessHistoryEntry[]>("filmFrameGame_history", [])
  const [playedMovies, setPlayedMovies] = useLocalStorage<number[]>("filmFrameGame_played", [])

  const getImageStyle = (level: number) => {
    switch (level) {
      case 0:
        return "blur-xl brightness-75 scale-110 sepia-[0.3]"
      case 1:
        return "blur-sm brightness-90 sepia-[0.2]"
      case 2:
        return "sepia-[0.1]"
      default:
        return ""
    }
  }

  const fetchMovies = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/movies")

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error(`Erro HTTP: ${response.status}`, errorData)
        setError(`Erro HTTP: ${response.status}`)
        return
      }

      const data = await response.json()

      if (!data || !data.movies || !Array.isArray(data.movies) || data.movies.length === 0) {
        setError("Nenhum filme encontrado na resposta da API")
        return
      }

      const shuffledMovies = shuffleArray([...data.movies])
      setMovies(shuffledMovies)

      const selectedMovie = getUnplayedMovie(shuffledMovies)

      setCurrentMovie(selectedMovie)
      setCurrentGuessMovie(selectedMovie)
    } catch (error: any) {
      console.error("Erro ao buscar filmes:", error)
      setError(error.message || "Ocorreu um erro ao buscar os filmes.")
    } finally {
      setLoading(false)
    }
  }

  const getUnplayedMovie = (movieList: Movie[]): Movie => {
    const unplayedMovies = movieList.filter((movie) => !playedMovies.includes(movie.id))

    if (unplayedMovies.length === 0) {
      setPlayedMovies([])
      const reshuffledMovies = shuffleArray([...movieList])
      return reshuffledMovies[0]
    }

    const shuffledUnplayed = shuffleArray([...unplayedMovies])
    return shuffledUnplayed[0]
  }

  useEffect(() => {
    fetchMovies()
  }, [])

  const checkGuess = () => {
    if (!currentMovie || !guess.trim() || !currentGuessMovie) return

    const normalizeText = (text: string) => {
      return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\w\s]/g, "")
        .trim()
    }

    const normalizedGuess = normalizeText(guess)
    const normalizedTitle = normalizeText(currentGuessMovie.title)

    const isMatch =
      normalizedTitle === normalizedGuess ||
      normalizedTitle.includes(normalizedGuess) ||
      normalizedGuess.includes(normalizedTitle)

    setIsCorrect(isMatch)

    const historyEntry: GuessHistoryEntry = {
      movieId: currentGuessMovie.id,
      movieTitle: currentGuessMovie.title,
      guess: guess,
      correct: isMatch,
      timestamp: Date.now(),
      skipped: false,
    }

    setGuessHistory((prev) => [historyEntry, ...prev].slice(0, 20))

    if (isMatch) {
      setRevealing(true)

      setTimeout(() => {
        setGameOver(true)
        setRevealing(false)
        setScore(score + (3 - difficultyLevel))

        if (!playedMovies.includes(currentGuessMovie.id)) {
          setPlayedMovies([...playedMovies, currentGuessMovie.id])
        }
      }, 1500)
    } else if (difficultyLevel < 2) {
      setDifficultyLevel(difficultyLevel + 1)
    } else {
      setGameOver(true)

      if (!playedMovies.includes(currentGuessMovie.id)) {
        setPlayedMovies([...playedMovies, currentGuessMovie.id])
      }
    }
  }

  const nextMovie = () => {
    if (movies.length === 0) return

    const nextMovie = getUnplayedMovie(movies)

    setCurrentMovie(nextMovie)
    setCurrentGuessMovie(nextMovie)
    setDifficultyLevel(0)
    setGuess("")
    setIsCorrect(null)
    setGameOver(false)
    setImageLoading(true)
    setRevealing(false)
    setWasSkipped(false)
  }

  const resetStats = () => {
    if (window.confirm("Tem certeza que deseja resetar todas as estatísticas? Esta ação não pode ser desfeita.")) {
      setScore(0)
      setGuessHistory([])
      setPlayedMovies([])
    }
  }

  const skipMovie = () => {
    if (!currentMovie) return

    const historyEntry: GuessHistoryEntry = {
      movieId: currentMovie.id,
      movieTitle: currentMovie.title,
      guess: "[Pulado]",
      correct: false,
      timestamp: Date.now(),
      skipped: true,
    }

    setGuessHistory((prev) => [historyEntry, ...prev].slice(0, 20))

    if (!playedMovies.includes(currentMovie.id)) {
      setPlayedMovies([...playedMovies, currentMovie.id])
    }

    setGameOver(true)
    setWasSkipped(true)
    setIsCorrect(false)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p>Carregando filmes...</p>
        </div>
      </div>
    )
  }

  if (!currentMovie) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md border-primary/20 bg-card/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-center text-primary">Erro</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">{error || "Não foi possível carregar os filmes."}</p>
            <p className="text-sm text-muted-foreground">Verifique se:</p>
            <ul className="list-disc pl-5 text-sm text-muted-foreground mt-2">
              <li>A chave da API TMDB está correta</li>
              <li>A chave da API tem permissões suficientes</li>
              <li>Você está usando uma chave de API v3 (não v4)</li>
            </ul>
            <Button onClick={() => fetchMovies()} className="w-full mt-4 bg-primary hover:bg-primary/80">
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <Card className="w-full max-w-2xl border-primary/20 bg-card/90 backdrop-blur-sm shadow-lg">
        <CardHeader className="border-b border-primary/10">
          <CardTitle className="text-2xl text-center text-secondary">Adivinhe o Filme</CardTitle>
          <CardDescription className="text-center">
            Adivinhe o filme a partir da imagem. Quanto mais difícil, mais pontos você ganha!
          </CardDescription>
          <div className="flex justify-center items-center gap-2 mt-2">
            <Badge variant="outline" className="text-lg border-primary/30 bg-primary/10 text-foreground">
              Pontuação: {score}
            </Badge>
            <StatsModal
              score={score}
              history={guessHistory}
              playedMovies={playedMovies.length}
              onResetStats={resetStats}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="relative rounded-lg overflow-hidden bg-black aspect-video ring-1 ring-primary/20">
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
            <img
              src={currentMovie.frames[Math.min(difficultyLevel, currentMovie.frames.length - 1)] || "/placeholder.svg"}
              alt="Imagem do filme"
              className={`w-full h-full object-cover transition-all ${
                revealing || (gameOver && isCorrect) ? "duration-1500" : "duration-300"
              } ${
                revealing || (gameOver && isCorrect) ? "" : getImageStyle(difficultyLevel)
              } ${imageLoading ? "opacity-0" : "opacity-100"}`}
              onLoad={() => setImageLoading(false)}
              onError={() => setImageLoading(false)}
            />
            {revealing && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <div className="text-white text-2xl font-bold animate-pulse">Revelando...</div>
              </div>
            )}
            <Badge
              className="absolute top-2 right-2"
              variant={difficultyLevel === 0 ? "destructive" : difficultyLevel === 1 ? "secondary" : "default"}
            >
              {difficultyLevel === 0 ? "Difícil" : difficultyLevel === 1 ? "Médio" : "Fácil"}
            </Badge>
          </div>

          {gameOver && isCorrect && (
            <div className="bg-secondary/10 border border-secondary/20 rounded-lg p-4">
              <div className="flex items-center gap-2 text-secondary mb-2">
                <CheckCircle2 className="h-5 w-5" />
                <h3 className="font-medium">Correto!</h3>
              </div>
              <div className="flex gap-4">
                <img
                  src={currentMovie.posterUrl || "/placeholder.svg?height=150&width=100"}
                  alt={`Pôster de ${currentMovie.title}`}
                  className="h-32 rounded-md shadow-md"
                />
                <div>
                  <p className="font-bold text-foreground">
                    {currentMovie.title} ({currentMovie.year})
                  </p>
                  <p className="text-sm mt-2 line-clamp-3 text-muted-foreground">{currentMovie.overview}</p>
                </div>
              </div>
            </div>
          )}

          {gameOver && !isCorrect && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <div className="flex items-center gap-2 text-destructive mb-2">
                <AlertCircle className="h-5 w-5" />
                <h3 className="font-medium">{wasSkipped ? "Filme Pulado" : "Incorreto!"}</h3>
              </div>
              <div className="flex gap-4">
                <img
                  src={currentMovie.posterUrl || "/placeholder.svg?height=150&width=100"}
                  alt={`Pôster de ${currentMovie.title}`}
                  className="h-32 rounded-md shadow-md"
                />
                <div>
                  <p className="font-bold text-foreground">
                    {currentMovie.title} ({currentMovie.year})
                  </p>
                  <p className="text-sm mt-2 line-clamp-3 text-muted-foreground">{currentMovie.overview}</p>
                </div>
              </div>
            </div>
          )}

          <GuessHistory history={guessHistory} />

          {!gameOver && (
            <div className="flex gap-2">
              <SearchInput
                value={guess}
                onChange={setGuess}
                onSubmit={checkGuess}
                disabled={gameOver || revealing}
                clearOnSubmit={true}
              />
              <Button onClick={checkGuess} className="bg-primary hover:bg-primary/80 text-primary-foreground">
                Adivinhar
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center border-t border-primary/10 pt-4">
          {gameOver && (
            <Button onClick={nextMovie} className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground">
              Próximo Filme
            </Button>
          )}
          {!gameOver && difficultyLevel === 1 && (
            <Button
              onClick={skipMovie}
              variant="outline"
              className="w-full border-primary/20 text-muted-foreground hover:bg-primary/5 flex items-center gap-2"
            >
              <SkipForward className="h-4 w-4" />
              Pular Filme
            </Button>
          )}
        </CardFooter>
      </Card>
    </main>
  )
}
