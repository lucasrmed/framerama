import { NextResponse } from "next/server"

const TMDB_API_KEY = "cf8bd3310039c1de136305d6494ded87"
const TMDB_ACCESS_TOKEN =
  "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJjZjhiZDMzMTAwMzljMWRlMTM2MzA1ZDY0OTRkZWQ4NyIsIm5iZiI6MTc0NDczMjAzNS4xNDgsInN1YiI6IjY3ZmU3ZjgzZWY1YWU2ODdjYmQ5NzBjNSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.EGvZN5huYJ-cnKerThI83IhNvfV65Ip9XcsGasPpAaw"

export async function GET() {
  try {
    const headers = {
      Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
      accept: "application/json",
    }

    let response = await fetch("https://api.themoviedb.org/3/movie/popular?language=pt-BR&page=1", { headers })

    if (!response.ok) {
      console.log("Token de acesso falhou, tentando com chave da API...")
      response = await fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&language=pt-BR&page=1`)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error(`Erro na API TMDB (${response.status}):`, errorData)
        return NextResponse.json(
          { error: `Erro na API TMDB: ${response.status}`, details: errorData },
          { status: response.status },
        )
      }
    }

    const data = await response.json()

    if (!data.results || !Array.isArray(data.results)) {
      return NextResponse.json({ error: "Formato de resposta inválido da API TMDB" }, { status: 500 })
    }

    const processedMovies = await Promise.all(
      data.results.slice(0, 10).map(async (movie: any) => {
        try {
          const imagesResponse = await fetch(`https://api.themoviedb.org/3/movie/${movie.id}/images`, { headers })

          let frames = []

          if (imagesResponse.ok) {
            const imagesData = await imagesResponse.json()
            const backdrops = imagesData.backdrops || []

            frames = backdrops
              .slice(0, Math.min(3, backdrops.length))
              .map((backdrop: any) => `https://image.tmdb.org/t/p/w780${backdrop.file_path}`)
          } else {
            const fallbackImagesResponse = await fetch(
              `https://api.themoviedb.org/3/movie/${movie.id}/images?api_key=${TMDB_API_KEY}`,
            )

            if (fallbackImagesResponse.ok) {
              const fallbackImagesData = await fallbackImagesResponse.json()
              const fallbackBackdrops = fallbackImagesData.backdrops || []

              frames = fallbackBackdrops
                .slice(0, Math.min(3, fallbackBackdrops.length))
                .map((backdrop: any) => `https://image.tmdb.org/t/p/w780${backdrop.file_path}`)
            }
          }

          while (frames.length < 3 && movie.poster_path) {
            frames.push(`https://image.tmdb.org/t/p/w500${movie.poster_path}`)
          }

          if (frames.length > 0) {
            return {
              id: movie.id,
              title: movie.title,
              year: movie.release_date ? new Date(movie.release_date).getFullYear() : null,
              overview: movie.overview,
              posterUrl: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
              frames: frames,
            }
          }
        } catch (error) {
          console.error(`Erro ao processar filme ${movie.id}:`, error)
        }

        return null
      }),
    )

    const validMovies = processedMovies.filter((movie) => movie !== null)

    if (validMovies.length === 0) {
      return NextResponse.json({ error: "Não foi possível obter filmes com imagens" }, { status: 500 })
    }

    return NextResponse.json({ movies: validMovies })
  } catch (error) {
    console.error("Erro ao buscar filmes:", error)
    return NextResponse.json({ error: "Falha ao buscar dados de filmes" }, { status: 500 })
  }
}
