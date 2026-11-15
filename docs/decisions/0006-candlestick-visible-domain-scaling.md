# ADR 0006: Candlestick Visible Domain Scaling

Status: Inferido do codigo, necessita validacao humana para intencao original.

## Contexto

Candlestick charts financeiros precisam mostrar variacao de preco de forma legivel. Em datasets longos, usar o min/max global pode comprimir candles da viewport atual.

## Decisao Observada

CandlestickChart calcula `domainY` e `yAxisTicks` a partir do intervalo visivel. Quando o scroll muda, `useAnimatedReaction` calcula indices visiveis e chama `updateVisibleScale`.

## Consequencias

- O eixo Y acompanha a regiao visivel.
- `animatedDomainMin` e `animatedDomainMax` suavizam transicoes.
- Grid, YAxis, candles e LastPrice precisam ler o dominio animado para manter alinhamento.
- Testes de escala visivel sao importantes para evitar regressao.

## Evidencias

- `src/charts/CandlestickChart/CandlestickChartContext.tsx`
- `src/charts/CandlestickChart/utils.ts`
- `src/charts/CandlestickChart/components/CandlestickChartYAxis.tsx`
- `src/__tests__/candlestick-utils.test.ts`
