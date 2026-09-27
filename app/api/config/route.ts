import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import os from 'os'

// ─────────────────────────────────────────────
// 설정 파일 경로
// ─────────────────────────────────────────────
const CONFIG_DIR = path.join(os.homedir(), '.hermes', 'data-control')
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json')

// ─────────────────────────────────────────────
// 기본 설정
// ─────────────────────────────────────────────
const DEFAULT_CONFIG = {
  sources: [
    {
      id: 'rss-geeknews',
      name: 'GeekNews RSS',
      category: '위키',
      type: 'rss',
      enabled: true,
      schedule: '4h',
      script: 'wiki-collector.py',
      description: 'AI, 개발, 기술 뉴스',
    },
    {
      id: 'rss-inflab',
      name: '인프랩 RSS',
      category: '위키',
      type: 'rss',
      enabled: true,
      schedule: '4h',
      script: 'wiki-collector.py',
      description: '디자인, 개발, 조직',
    },
    {
      id: 'rss-hankyung-finance',
      name: '한국경제 증권',
      category: '위키',
      type: 'rss',
      enabled: true,
      schedule: '4h',
      script: 'wiki-collector.py',
      description: '금융, 증권, 투자',
    },
    {
      id: 'rss-hankyung-it',
      name: '한국경제 IT',
      category: '위키',
      type: 'rss',
      enabled: true,
      schedule: '4h',
      script: 'wiki-collector.py',
      description: 'IT, 반도체',
    },
    {
      id: 'rss-hankyung-economy',
      name: '한국경제 경제',
      category: '위키',
      type: 'rss',
      enabled: true,
      schedule: '4h',
      script: 'wiki-collector.py',
      description: '경제, 매크로',
    },
    {
      id: 'telegram-woongdeongi',
      name: '웅덩이매매법',
      category: '텔레그램',
      type: 'telegram',
      enabled: true,
      schedule: '4h',
      script: 'telegram-collector.py',
      description: '투자 시그널 수집',
    },
    {
      id: 'stock-kr',
      name: '국내 주식',
      category: '주식',
      type: 'stock',
      enabled: true,
      schedule: 'manual',
      script: 'stock_price_v2.py',
      description: 'pykrx — 삼성전자, SK하이닉스 등',
    },
    {
      id: 'stock-us',
      name: '해외 주식',
      category: '주식',
      type: 'stock',
      enabled: true,
      schedule: 'manual',
      script: 'stock_price_v2.py',
      description: 'yfinance — NVDA, AAPL 등',
    },
    {
      id: 'etf-bot',
      name: 'ETF 리포트',
      category: 'ETF',
      type: 'etf',
      enabled: false,
      schedule: 'manual',
      script: 'etf_reporter.py',
      description: '네이버 ETF + AI 추천',
    },
  ],
  sectors: [
    { id: 'semiconductor', name: '반도체', enabled: true },
    { id: 'bigtech', name: '빅테크', enabled: false },
    { id: 'ev_energy', name: 'EV/에너지', enabled: false },
    { id: 'index', name: '지수/환율', enabled: true },
  ],
}

// ─────────────────────────────────────────────
// 설정 로드/저장
// ─────────────────────────────────────────────
async function loadConfig() {
  try {
    const raw = await fs.readFile(CONFIG_FILE, 'utf-8')
    return JSON.parse(raw)
  } catch {
    await fs.mkdir(CONFIG_DIR, { recursive: true })
    await fs.writeFile(CONFIG_FILE, JSON.stringify(DEFAULT_CONFIG, null, 2))
    return DEFAULT_CONFIG
  }
}

async function saveConfig(config: any) {
  await fs.mkdir(CONFIG_DIR, { recursive: true })
  await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2))
}

// ─────────────────────────────────────────────
// GET — 전체 설정 조회
// ─────────────────────────────────────────────
export async function GET() {
  const config = await loadConfig()
  return NextResponse.json(config)
}

// ─────────────────────────────────────────────
// PATCH — 소스 ON/OFF 토글
// ─────────────────────────────────────────────
export async function PATCH(req: Request) {
  const body = await req.json()
  const config = await loadConfig()

  if (body.type === 'toggle-source' && body.sourceId) {
    const source = config.sources.find((s: any) => s.id === body.sourceId)
    if (source) {
      source.enabled = body.enabled
      await saveConfig(config)
      return NextResponse.json({ success: true, source })
    }
  }

  if (body.type === 'toggle-sector' && body.sectorId) {
    const sector = config.sectors.find((s: any) => s.id === body.sectorId)
    if (sector) {
      sector.enabled = body.enabled
      await saveConfig(config)
      return NextResponse.json({ success: true, sector })
    }
  }

  return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
}