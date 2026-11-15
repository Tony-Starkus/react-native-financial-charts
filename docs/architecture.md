# Architecture

Esta documentacao descreve a arquitetura observada no codigo-fonte atual.

## Resumo

`react-native-financial-charts` e uma biblioteca de charts financeiros e categoricos para React Native. O design principal combina uma API declarativa de compound components com providers por chart, renderizacao Skia e interacoes Reanimated/Gesture Handler.

## Mapa De Modulos

- `src/index.tsx`: monta a API publica `BarChart`, `LineChart`, `PieChart`, `CandlestickChart` e reexporta tipos.
- `src/charts/LineChart`: serie temporal suave com area, linha, cursor, baseline e tooltips.
- `src/charts/BarChart`: barras categoricas com scroll/fit, grid, axis, tooltip, skeleton e selecao.
- `src/charts/PieChart`: pie/donut com selecao, agregacao `Others`, cache de layout e hit-test por path.
- `src/charts/CandlestickChart`: OHLC com scroll, escala dinamica, candles, grid, axis, last price, cursor e tooltips.
- `src/charts/GaugeChart`: gauge de valor unico com track, segmentos, progresso, agulha, ticks e label animado.
- `src/components/AnimatedTextInput.tsx`: texto animado de alta frequencia para tooltips do LineChart.
- `src/utils.ts`: interpolacao Catmull-Rom compartilhada.

## API Publica

A API e exportada como objetos:

```tsx
import { LineChart, BarChart, PieChart, CandlestickChart } from 'react-native-financial-charts';
```

- `LineChart`: `Root`, `Canvas`, `Line`, `Area`, `Cursor`, `Baseline`, `Tooltip.Value`, `Tooltip.Date`.
- `BarChart`: `Root`, `Canvas`, `Bar`, `Tooltip`, `Grid`, `YAxis`.
- `PieChart`: `Root`, `Canvas`, `Slices`.
- `CandlestickChart`: `Root`, `Canvas`, `Candles`, `Grid`, `YAxis`, `Cursor`, `LastPrice`, `Tooltip.OHLC`, `Tooltip.Date`.
- `GaugeChart`: `Root`, `Canvas`, `Track`, `Segments`, `Progress`, `Needle`, `Ticks`, `Value`.

## Padrao Root E Context

Cada `Root` recebe dados e props de layout. Ele calcula estado derivado e fornece um contexto interno. Subcomponentes nao recebem todos os dados por props; eles leem do contexto.

- LineChart usa `ChartContext` em `LineChartContext.tsx`.
- BarChart usa `BarChartContext` em `BarChartContext.tsx`.
- PieChart usa `PieChartContext` e opcionalmente `PieChartLayoutContext`.
- CandlestickChart usa `CandlestickChartContext`.

## Fronteira Do Skia Canvas

Os componentes `Canvas` re-proveem o contexto dentro do `Canvas`. Isso e necessario porque o canvas do Skia cria uma arvore de renderizacao separada da arvore normal do React Native.

Arquivos de referencia:

- `src/charts/LineChart/components/ChartCanvas.tsx`
- `src/charts/BarChart/components/BarChartCanvas.tsx`
- `src/charts/PieChart/components/PieChartCanvas.tsx`
- `src/charts/CandlestickChart/components/CandlestickChartCanvas.tsx`

## Fluxo Do LineChart

- Entrada: `LineChartDataPoint[]` com `timestamp` e `value`.
- Provider calcula min/max, escalas D3, path Skia e area path.
- Provider gera `yMap` e `valueMap` por pixel.
- Pan gesture atualiza cursor e tooltips lendo mapas por indice.
- `ChartLine`, `ChartArea`, `ChartCursor`, `ChartBaseline` e tooltips consomem contexto.

Decisao observada: priorizar precisao do cursor em O(1) com lookup map em vez de recalcular curva durante o gesto.

## Fluxo Do BarChart

- Entrada: `BarChartItemDataInterface[]`.
- Provider calcula escala Y, dimensoes, modo fit/scroll, skeleton e ref.
- `BarChartCanvas` cria camada visual Skia e camada de touch/scroll sobreposta.
- `BarChartBar` grava barras e labels em `Picture`.
- `BarChartTooltip` reage a `selectedIndex`.
- `BarChartYAxis` e detectado pelo provider via `displayName` para reservar largura.

Decisao observada: separar renderizacao visual de area interativa e desenhar apenas indices visiveis.

## Fluxo Do PieChart

- Entrada: `PieChartItem[]`.
- Provider normaliza, filtra valores nao positivos, ordena e agrega `Others`.
- `PieChartCanvas` calcula layout e fornece `PieChartLayoutContext`.
- `PieChartSlices` reutiliza layout do canvas quando compativel.
- Tap selection faz hit-test contra paths Skia.

Decisao observada: centralizar layout caro e cachear por assinatura para evitar conversoes D3/SVG/Skia repetidas.

## Fluxo Do CandlestickChart

- Entrada: `CandlestickChartDataPoint[]` com OHLC.
- Provider normaliza dados, calcula viewport, escala visivel e layout.
- `useAnimatedReaction` observa scroll para atualizar range visivel.
- `CandlestickChartCanvas` usa pan para scroll manual e tap para selecao.
- `CandlestickChartCandles` renderiza candles por `Picture`.
- `CandlestickChartYAxis` e `CandlestickChartLastPrice` coordenam labels para evitar sobreposicao.

Decisao observada: escala vertical depende dos candles visiveis, nao apenas do dataset completo.

## Fluxo Do GaugeChart

- Entrada: `value`, `min`, `max`, angulos (graus, convencao Skia: 0 = 3h, sentido horario) e `segments?`.
- Provider normaliza angulos (`normalizeGaugeAngles`), calcula layout pelo bounding box do arco (`computeGaugeLayout`), normaliza segmentos e anima `animatedValue` com `withTiming`.
- `progress` e derivado no UI thread; `Progress` usa `end` do Path (trim) e `Needle` usa `rotate` em `Group`, sem recriar paths por frame.
- `GaugeChart.Value` e view RN fora do `Canvas`, usando `AnimatedTextInput`; `format` precisa ser worklet.
- Sem gestos e sem selecao.

## Dependencias Criticas

- `@shopify/react-native-skia`: renderizacao, paths, canvas, fonts, pictures.
- `react-native-reanimated`: shared values, derived values, worklets, animated reactions.
- `react-native-gesture-handler`: tap/pan gestures.
- `d3`: escalas de tempo e lineares no LineChart.
- `d3-shape`: pie/arc layout no PieChart.
- `react-native-builder-bob`: build da biblioteca para `lib/`.

## Limites Arquiteturais

- Nao ha backend no repositorio.
- Nao ha camada de dados remota.
- Nao ha gerenciamento global de estado como Redux/Zustand.
- `meta?: any` existe nos dados de BarChart e CandlestickChart, mas nao e interpretado pelo codigo atual.
- `lib/` e artefato gerado e nao deve ser fonte de verdade.
