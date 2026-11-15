# Example: Candlestick Visible Scale

Fonte real: `src/charts/CandlestickChart/CandlestickChartContext.tsx` e `src/charts/CandlestickChart/utils.ts`.

## Problema Resolvido

Em uma serie OHLC longa, usar o min/max global pode comprimir os candles atualmente visiveis. O chart recalcula a escala vertical com base na viewport.

## Padrao Observado

- Dados sao normalizados por `normalizeCandlestickData`.
- `calculateVisibleCandlestickScale` recebe `startIndex` e `endIndex`.
- O dominio usa lows/highs dos itens visiveis com padding vertical.
- Ticks sao gerados dentro do dominio visivel.
- `useAnimatedReaction` observa `scrollX.value`.
- Quando o range muda, `runOnJS(updateVisibleScale)` atualiza estado React.
- `animatedDomainMin` e `animatedDomainMax` animam a transicao.

## Ao Alterar Este Fluxo

- Preserve normalizacao OHLC antes do layout.
- Cuidado com loops entre shared values e estado React.
- Mantenha Grid, YAxis, Candles e LastPrice alinhados ao mesmo dominio animado.
- Atualize testes se mudar padding vertical ou estrategia de ticks.

## Teste Existente

`src/__tests__/candlestick-utils.test.ts` ja valida que a escala visivel fica mais justa que bounds expandidos e que ticks ficam dentro do dominio.
