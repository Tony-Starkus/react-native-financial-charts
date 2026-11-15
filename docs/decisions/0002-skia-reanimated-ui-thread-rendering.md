# ADR 0002: Skia + Reanimated For UI Thread Rendering

Status: Inferido do codigo, necessita validacao humana para intencao original.

## Contexto

O README descreve performance nativa, Skia, Reanimated e interacoes na UI thread. O codigo usa `@shopify/react-native-skia`, `react-native-reanimated` e `react-native-gesture-handler` em todos os charts.

## Decisao Observada

Renderizacao e interacao de alta frequencia sao implementadas com Skia, Reanimated shared values e Gesture Handler.

## Consequencias

- O desenho fica fora dos componentes RN tradicionais.
- Formatadores em tooltips podem ter restricoes de worklet.
- Contexto precisa ser re-provido dentro de `Canvas`.
- Testes unitarios devem preferir utilitarios puros em vez de renderizacao Skia.

## Evidencias

- `README.md`
- `src/charts/*/components/*Canvas.tsx`
- `src/charts/BarChart/components/BarChartBar.tsx`
- `src/charts/CandlestickChart/components/CandlestickChartCandles.tsx`
- `src/charts/PieChart/components/PieChartSlices.tsx`
