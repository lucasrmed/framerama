import { NextResponse } from "next/server"

const TMDB_API_KEY = process.env.TMDB_API_KEY || "cf8bd3310039c1de136305d6494ded87"
const TMDB_ACCESS_TOKEN =
  "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJjZjhiZDMzMTAwMzljMWRlMTM2MzA1ZDY0OTRkZWQ4NyIsIm5iZiI6MTc0NDczMjAzNS4xNDgsInN1YiI6IjY3ZmU3ZjgzZWY1YWU2ODdjYmQ5NzBjNSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.EGvZN5huYJ-cnKerThI83IhNvfV65Ip9XcsGasPpAaw"

export async function GET() {
  try {
    const headers = {
      Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
      accept: "application/json",
    }

    const bearerResponse = await fetch("https://api.themoviedb.org/3/movie/popular?language=pt-BR&page=1", { headers })

    if (bearerResponse.ok) {
      return NextResponse.json({
        success: true,
        method: "bearer_token",
        message: "Sua chave de API TMDB está funcionando corretamente (usando Bearer token)",
      })
    }

    const apiKeyResponse = await fetch(
      `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&language=pt-BR&page=1`,
    )

    if (apiKeyResponse.ok) {
      return NextResponse.json({
        success: true,
        method: "api_key_param",
        message: "Sua chave de API TMDB está funcionando corretamente (usando parâmetro api_key)",
      })
    }

    let errorData = {}
    try {
      errorData = await apiKeyResponse.json()
    } catch (jsonError) {
      try {
        const errorText = await apiKeyResponse.text()
        errorData = { raw_response: errorText }
      } catch (textError) {
        errorData = { error: "Não foi possível ler a resposta" }
      }
    }

    return NextResponse.json(
      {
        error: "Chave de API inválida",
        status: "invalid_key",
        statusCode: apiKeyResponse.status,
        details: errorData,
      },
      { status: 401 },
    )
  } catch (error) {
    console.error("Erro ao testar a API TMDB:", error)
    return NextResponse.json(
      {
        error: "Erro ao testar a chave da API TMDB",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
