import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Grid3x3, TrendingUp } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function RiskMatrixPage() {
  const navigate = useNavigate()
  const [matrix, setMatrix] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMatrix()
  }, [])

  const fetchMatrix = async () => {
    try {
      const response = await fetch('/api/risks/matrix/data')
      const data = await response.json()
      setMatrix(data.matrix || [])
    } catch (error) {
      console.error('Error ao buscar matriz:', error)
      // Criar matriz vazia 5x5
      setMatrix(Array(5).fill().map(() => Array(5).fill({ count: 0, risks: [] })))
    } finally {
      setLoading(false)
    }
  }

  const getCellColor = (score) => {
    if (!score) return 'bg-muted/10'
    if (score >= 20) return 'bg-red-600'
    if (score >= 15) return 'bg-orange-500'
    if (score >= 6) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getCellTextColor = (score) => {
    if (!score || score < 6) return 'text-foreground'
    return 'text-white'
  }

  const impactLabels = ['Insignificante', 'Menor', 'Moderado', 'Maior', 'Catastrófico']
  const likelihoodLabels = ['Raro', 'Improvável', 'Possível', 'Provável', 'Quase Certo']

  const handleCellClick = (likelihood, impact, cell) => {
    if (cell.count > 0) {
      // Navegar para lista of risks filtrados
      navigate(`/grc/risks?likelihood=${likelihood + 1}&impact=${impact + 1}`)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight flex items-center gap-2">
            <Grid3x3 className="h-8 w-8 text-primary" />
            Matriz Risk
          </h1>
          <p className="text-muted-foreground mt-1">
            Mapa of calor (heat map) of risks - Likelihood × Impact
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate('/grc/risks')}>
          Ver Todos os Riscos
        </Button>
      </div>

      {/* Legend */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-500" />
              <span>Baixo (1-5)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-yellow-500" />
              <span>Médio (6-14)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-orange-500" />
              <span>Alto (15-19)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-600" />
              <span>Crítico (20-25)</span>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Clique em uma célula para ver os risks
          </div>
        </div>
      </Card>

      {/* Risk Matrix */}
      <Card className="p-6">
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">
            Carregando matriz...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left p-4 font-semibold">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Likelihood →
                    </div>
                    <div className="text-xs text-muted-foreground font-normal mt-1">
                      Impact ↓
                    </div>
                  </th>
                  {likelihoodLabels.map((label, i) => (
                    <th key={i} className="p-2 text-center text-sm font-medium">
                      <div>{i + 1}</div>
                      <div className="text-xs text-muted-foreground font-normal">
                        {label}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...Array(5)].map((_, impactIdx) => (
                  <tr key={impactIdx}>
                    <td className="p-2 text-sm font-medium">
                      <div>{5 - impactIdx}</div>
                      <div className="text-xs text-muted-foreground">
                        {impactLabels[4 - impactIdx]}
                      </div>
                    </td>
                    {[...Array(5)].map((_, likelihoodIdx) => {
                      // Matriz é [likelihood][impact], mas precisamos inverter impact para display
                      const cell = matrix[likelihoodIdx]?.[4 - impactIdx] || {
                        count: 0,
                        risks: [],
                        score: (likelihoodIdx + 1) * (5 - impactIdx),
                      }
                      const score = cell.score || (likelihoodIdx + 1) * (5 - impactIdx)

                      return (
                        <td key={likelihoodIdx} className="p-1">
                          <div
                            className={`
                              h-24 rounded-lg flex flex-col items-center justify-center
                              cursor-pointer transition-transform hover:scale-105
                              ${getCellColor(score)}
                              ${getCellTextColor(score)}
                            `}
                            onClick={() =>
                              handleCellClick(likelihoodIdx, 4 - impactIdx, cell)
                            }
                          >
                            <div className="text-3xl font-bold">{cell.count || 0}</div>
                            <div className="text-xs opacity-80 mt-1">
                              Score: {score}
                            </div>
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Total Risks</div>
          <div className="text-2xl font-bold">
            {matrix.flat().reduce((acc, cell) => acc + (cell.count || 0), 0)}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Critical Risks</div>
          <div className="text-2xl font-bold text-red-500">
            {matrix
              .flat()
              .filter((cell) => (cell.score || 0) >= 20)
              .reduce((acc, cell) => acc + (cell.count || 0), 0)}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Riscos Altos</div>
          <div className="text-2xl font-bold text-orange-500">
            {matrix
              .flat()
              .filter((cell) => (cell.score || 0) >= 15 && (cell.score || 0) < 20)
              .reduce((acc, cell) => acc + (cell.count || 0), 0)}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Riscos Médios/Baixos</div>
          <div className="text-2xl font-bold">
            {matrix
              .flat()
              .filter((cell) => (cell.score || 0) < 15)
              .reduce((acc, cell) => acc + (cell.count || 0), 0)}
          </div>
        </Card>
      </div>
    </div>
  )
}


