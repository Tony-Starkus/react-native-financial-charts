# ADR 0004: Scrollable Batch Rendering And Culling

Status: Inferido do codigo, necessita validacao humana para intencao original.

## Contexto

BarChart e CandlestickChart podem renderizar muitas barras/candles horizontalmente. Desenhar todos os itens em cada frame pode afetar performance.

## Decisao Observada

BarChart e CandlestickChart usam `Skia.PictureRecorder` com calculo de indices visiveis baseado em `scrollX`, `canvasWidth`, largura do item e spacing.

## Consequencias

- Apenas itens proximos da viewport sao desenhados.
- Scroll horizontal fica desacoplado da renderizacao completa do dataset.
- Labels e value labels tambem podem ser renderizados em lote.
- Alteracoes no calculo de largura/spacing precisam preservar a matematica de culling.

## Evidencias

- `src/charts/BarChart/components/BarChartBar.tsx`
- `src/charts/CandlestickChart/components/CandlestickChartCandles.tsx`
- `src/charts/BarChart/BarChartContext.tsx`
- `src/charts/CandlestickChart/CandlestickChartContext.tsx`
