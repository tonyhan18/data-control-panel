# 🎛️ Data Control Panel

데이터 수집 소스 관리자 페이지

## 기능

- 📚 RSS 소스 (GeekNews, 인프랩, 한국경제 3개) ON/OFF
- 📱 텔레그램 수집 (웅덩이매매법) ON/OFF
- 📊 주식 섹터별 필터 (반도체, 빅테크, EV, 지수)
- 📈 ETF 봇 ON/OFF
- ⏱ 수집 주기 표시

## 실행

### 로컬
```bash
npm install
npm run dev
```

### Docker
```bash
docker build -t tonyhan18/data-control-panel .
docker run -p 3000:3000 tonyhan18/data-control-panel
```

### AWS EC2 (n8n과 함께)
```bash
docker run -d --name control-panel \
  -p 3000:3000 \
  -v ~/.hermes/data-control:/root/.hermes/data-control \
  --restart unless-stopped \
  tonyhan18/data-control-panel
```