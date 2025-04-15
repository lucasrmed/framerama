import { NextResponse } from "next/server"

const TMDB_API_KEY = process.env.TMDB_API_KEY || "cf8bd3310039c1de136305d6494ded87"
const TMDB_ACCESS_TOKEN =
  "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJjZjhiZDMzMTAwMzljMWRlMTM2MzA1ZDY0OTRkZWQ4NyIsIm5iZiI6MTc0NDczMjAzNS4xNDgsInN1YiI6IjY3ZmU3ZjgzZWY1YWU2ODdjYmQ5NzBjNSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.EGvZN5huYJ-cnKerThI83IhNvfV65Ip9XcsGasPpAaw"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("query")

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] })
  }

  try {
    const headers = {
      Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
      accept: "application/json",
    }

    let response = await fetch(
      `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}&language=pt-BR&page=1`,
      { headers },
    )

    if (!response.ok) {
      console.log("Token de acesso falhou, tentando com chave da API...")
      response = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=pt-BR&page=1`,
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error(`Erro na API TMDB (${response.status}):`, errorData)
        return NextResponse.json(
          { error: `Erro na API TMDB: ${response.status}`, results: [], details: errorData },
          { status: response.status },
        )
      }
    }

    const data = await response.json()

    if (!data.results || !Array.isArray(data.results)) {
      return NextResponse.json({ results: [] })
    }

    const results = data.results.slice(0, 5).map((movie: any) => ({
      id: movie.id,
      title: movie.title,
      year: movie.release_date ? new Date(movie.release_date).getFullYear() : null,
      posterPath: movie.poster_path,
    }))

    return NextResponse.json({ results })
  } catch (error) {
    console.error("Erro ao buscar filmes:", error)
    return NextResponse.json({ error: "Falha ao buscar filmes", results: [] }, { status: 500 })
  }
}
