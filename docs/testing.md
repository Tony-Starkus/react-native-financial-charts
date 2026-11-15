# Testing

Este documento descreve o estado atual dos testes e como evoluir a cobertura.

## Comandos

- `yarn test`: roda Jest.
- `yarn test --maxWorkers=2 --coverage`: comando usado no CI.
- `yarn typecheck`: valida TypeScript.
- `yarn lint`: valida ESLint e Prettier.
- `yarn prepare`: build da biblioteca.

## Configuracao Atual

- Jest usa preset `react-native` configurado no `package.json`.
- `modulePathIgnorePatterns` ignora `example/node_modules` e `lib/`.
- CI roda testes com coverage em `.github/workflows/ci.yml`.

## Testes Existentes

- `src/__tests__/candlestick-utils.test.ts` cobre regras puras de CandlestickChart.
- `src/__tests__/index.test.tsx` contem `it.todo('write a test')`.

## Cobertura Exemplar

O teste de CandlestickChart valida:

- Normalizacao de `high` e `low` usando extremos OHLC.
- Escala "nice" deterministica.
- Layout com cores bullish/bearish.
- Escala visivel mais justa que bounds expandidos.
- Ticks dentro do dominio visivel.

## Estrategia Recomendada Para Novos Testes

- Priorize utilitarios puros em `utils.ts`.
- Teste normalizacao de dados antes de testar componentes.
- Teste matematica de layout com entradas pequenas e deterministicas.
- Teste regras de selecao imperativa quando puder isolar logica.
- Evite depender de renderizacao Skia em unit tests simples.
- Use exemplos do app apenas como demonstracao manual, nao como unica validacao.

## Lacunas Observadas

- Nao ha testes reais para `src/index.tsx`.
- Nao ha testes para LineChart `solveCatmullRom` ou lookup maps.
- Nao ha testes para BarChart `calculateNiceScale`.
- Nao ha testes para PieChart aggregation/cache.
- Nao ha testes de contrato para refs publicos.
- Nao ha testes de renderizacao ou interacao com Gesture Handler.

## Casos De Teste Sugeridos

- LineChart: `solveCatmullRom` deve preservar pontos extremos em `t=0` e `t=1`.
- BarChart: `calculateNiceScale(0, rawMax, ticks)` deve retornar max >= rawMax e ticks previsiveis.
- PieChart: valores `<= 0` devem ser ignorados e `Others` deve preservar `groupedItems`.
- CandlestickChart: `normalizeCandlestickData` deve remover campos nao finitos.
- CandlestickChart: `areCandlestickRectsOverlapping` deve detectar colisao com gap configuravel.

## Validacao Manual

Use o app `example` para conferir:

- Pan e cursor continuo do LineChart.
- Scroll, labels, tooltip e skeleton do BarChart.
- Selecao, offset e overlay externo do PieChart.
- Scroll, selecao, LastPrice, YAxis e tooltips do CandlestickChart.

## Necessita Validacao Humana

- A meta minima de cobertura nao esta documentada.
- Nao ha politica explicita para testes visuais ou snapshots.
- Nao ha evidencia de Detox/Appium/E2E.
