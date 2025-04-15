"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, CheckCircle, XCircle } from "lucide-react"

export default function DebugPage() {
  const [loading, setLoading] = useState(true)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const testApiKey = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/tmdb-test")
      const data = await response.json()

      setResult(data)

      if (!response.ok) {
        setError(data.error || `Erro HTTP: ${response.status}`)
      }
    } catch (error: any) {
      console.error("Erro ao testar API:", error)
      setError(error.message || "Ocorreu um erro ao testar a API")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    testApiKey()
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl">Diagnóstico da API TMDB</CardTitle>
          <CardDescription>Verificando se sua chave da API TMDB está funcionando corretamente</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
              <p>Testando sua chave da API TMDB...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-600 mb-2">
                <XCircle className="h-5 w-5" />
                <h3 className="font-medium">Erro detectado</h3>
              </div>
              <p className="mb-4">{error}</p>

              <div className="bg-gray-100 p-3 rounded text-xs font-mono overflow-auto max-h-40">
                {JSON.stringify(result, null, 2)}
              </div>

              <div className="mt-4 text-sm">
                <p className="font-medium">Possíveis soluções:</p>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>Verifique se a chave da API foi adicionada corretamente nas variáveis de ambiente</li>
                  <li>Certifique-se de que está usando uma chave de API v3 (não v4)</li>
                  <li>Verifique se a chave não expirou ou foi revogada</li>
                  <li>Confirme se a chave tem permissões para acessar os endpoints necessários</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-600 mb-2">
                <CheckCircle className="h-5 w-5" />
                <h3 className="font-medium">Tudo certo!</h3>
              </div>
              <p>{result?.message}</p>

              <div className="mt-4 text-sm">
                <p>
                  Método de autenticação:{" "}
                  <span className="font-medium">
                    {result?.method === "bearer_token" ? "Bearer Token" : "Parâmetro API Key"}
                  </span>
                </p>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={testApiKey} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testando...
              </>
            ) : (
              "Testar novamente"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
