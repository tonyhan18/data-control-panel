'use client'

import { useState, useEffect, useCallback } from 'react'

// ─────────────────────────────────────────────
// 타입
// ─────────────────────────────────────────────
interface Source {
  id: string
  name: string
  category: string
  type: string
  enabled: boolean
  schedule: string
  script: string
  description: string
}

interface Sector {
  id: string
  name: string
  enabled: boolean
}

interface Config {
  sources: Source[]
  sectors: Sector[]
}

// ─────────────────────────────────────────────
// 토글 스위치 컴포넌트
// ─────────────────────────────────────────────
function Toggle({
  enabled,
  onChange,
}: {
  enabled: boolean
  onChange: () => void
}) {
  return (
    <button
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        enabled ? 'bg-blue-500' : 'bg-gray-300'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )
}

// ─────────────────────────────────────────────
// 소스 카드
// ─────────────────────────────────────────────
function SourceCard({
  source,
  onToggle,
}: {
  source: Source
  onToggle: (id: string, enabled: boolean) => void
}) {
  const categoryEmoji: Record<string, string> = {
    위키: '📚',
    텔레그램: '📱',
    주식: '📊',
    ETF: '📈',
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{categoryEmoji[source.category] || '📋'}</span>
          <div>
            <h3 className="font-semibold text-gray-900">{source.name}</h3>
            <p className="text-sm text-gray-500">{source.description}</p>
          </div>
        </div>
        <Toggle
          enabled={source.enabled}
          onChange={() => onToggle(source.id, !source.enabled)}
        />
      </div>
      <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
        <span className={`px-2 py-0.5 rounded-full ${source.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
          {source.enabled ? '● 활성' : '● 비활성'}
        </span>
        <span>⏱ {source.schedule}</span>
        <span>📦 {source.script}</span>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// 메인 페이지
// ─────────────────────────────────────────────
export default function HomePage() {
  const [config, setConfig] = useState<Config | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/config')
      const data = await res.json()
      setConfig(data)
    } catch (err) {
      console.error('Failed to fetch config:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchConfig()
  }, [fetchConfig])

  const toggleSource = async (sourceId: string, enabled: boolean) => {
    setConfig((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        sources: prev.sources.map((s) =>
          s.id === sourceId ? { ...s, enabled } : s
        ),
      }
    })

    try {
      await fetch('/api/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'toggle-source',
          sourceId,
          enabled,
        }),
      })
    } catch (err) {
      console.error('Toggle failed:', err)
      fetchConfig() // 롤백
    }
  }

  const toggleSector = async (sectorId: string, enabled: boolean) => {
    setConfig((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        sectors: prev.sectors.map((s) =>
          s.id === sectorId ? { ...s, enabled } : s
        ),
      }
    })

    try {
      await fetch('/api/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'toggle-sector',
          sectorId,
          enabled,
        }),
      })
    } catch (err) {
      console.error('Toggle failed:', err)
      fetchConfig()
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-400">로딩 중...</div>
      </div>
    )
  }

  if (!config) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-red-400">설정을 불러올 수 없습니다.</div>
      </div>
    )
  }

  // 카테고리별 그룹화
  const categories = [...new Set(config.sources.map((s) => s.category))]

  return (
    <main className="min-h-screen p-6 max-w-5xl mx-auto">
      {/* 헤더 */}
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          🎛️ Data Control Panel
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          데이터 수집 소스 관리 — ON/OFF 제어
        </p>
      </header>

      {/* 소스 카드 */}
      <section className="space-y-6">
        {categories.map((category) => (
          <div key={category}>
            <h2 className="text-lg font-semibold text-gray-700 mb-3">
              {category}
            </h2>
            <div className="grid gap-3 md:grid-cols-2">
              {config.sources
                .filter((s) => s.category === category)
                .map((source) => (
                  <SourceCard
                    key={source.id}
                    source={source}
                    onToggle={toggleSource}
                  />
                ))}
            </div>
          </div>
        ))}
      </section>

      {/* 섹터 설정 */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">
          주식 섹터 필터
        </h2>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-4">
            {config.sectors.map((sector) => (
              <div
                key={sector.id}
                className="flex items-center justify-between rounded-md border border-gray-100 px-3 py-2"
              >
                <span className="text-sm font-medium text-gray-700">
                  {sector.name}
                </span>
                <Toggle
                  enabled={sector.enabled}
                  onChange={() => toggleSector(sector.id, !sector.enabled)}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 요약 */}
      <section className="mt-8 rounded-lg bg-blue-50 p-4">
        <div className="flex items-center gap-6 text-sm">
          <div>
            <span className="text-gray-500">활성 소스: </span>
            <span className="font-bold text-blue-700">
              {config.sources.filter((s) => s.enabled).length}
            </span>
            <span className="text-gray-400"> / {config.sources.length}</span>
          </div>
          <div>
            <span className="text-gray-500">활성 섹터: </span>
            <span className="font-bold text-blue-700">
              {config.sectors.filter((s) => s.enabled).length}
            </span>
            <span className="text-gray-400"> / {config.sectors.length}</span>
          </div>
        </div>
      </section>

      <footer className="mt-8 text-center text-xs text-gray-400">
        Data Control Panel v1.0 · tonyhan18
      </footer>
    </main>
  )
}