# Context Engineering Audit

Este documento consolida a descoberta feita no repositorio para orientar agentes de IA. Ele registra apenas evidencias encontradas no codigo, manifests, docs existentes e configuracoes.

## Escopo Observado

- Biblioteca React Native publicada como `react-native-financial-charts`.
- Entrada publica em `src/index.tsx`.
- App Expo de exemplo em `example/`.
- Documentacao publica existente em `docs/*ChartDocs.md` e `docs/interfaces/*.md`.
- Build gerado em `lib/` por `react-native-builder-bob`.
- Pacote versionado como `2.2.2` em `package.json`.

## Arquitetura

- A API publica e composta por namespaces: `LineChart`, `BarChart`, `PieChart` e `CandlestickChart`.
- Cada chart possui um `Root` que atua como provider de contexto.
- Subcomponentes consomem contexto por hooks internos e renderizam partes especificas do chart.
- Skia e usado para renderizacao grafica.
- Reanimated e usado para valores compartilhados, animacoes e trabalho na UI thread.
- Gesture Handler e usado para pan/tap selection.
- D3 e usado em LineChart para escalas e em PieChart para layout de arcos.
- O app `example` usa a biblioteca local via workspace e serve como demonstracao real.

## Estrutura De Pastas

- `src/index.tsx`: exporta a API publica e tipos.
- `src/charts/LineChart`: LineChart, context, interfaces e componentes.
- `src/charts/BarChart`: BarChart, context, interfaces, utils, constants e componentes.
- `src/charts/PieChart`: PieChart, context principal, context de layout, interfaces, utils e componentes.
- `src/charts/CandlestickChart`: CandlestickChart, context, interfaces, utils, constants e componentes.
- `src/components`: componentes compartilhados, atualmente `AnimatedTextInput`.
- `src/__tests__`: testes Jest.
- `docs`: documentacao publica e contexto novo para agentes.
- `docs/assets`: gifs/imagens usadas nos docs publicos.
- `example`: app Expo React Native.
- `.github`: workflow CI e action de setup.
- `lib`: saida gerada.

## Padroes Arquiteturais

- Compound Components: uso de `Chart.Root`, `Chart.Canvas` e subcomponentes declarativos.
- Context Provider: cada chart centraliza dados processados e shared values no provider.
- UI-thread interaction: gestos e animacoes rodam com Reanimated worklets quando necessario.
- Context re-provider dentro de Skia Canvas: componentes `Canvas` re-proveem contexto porque Skia cria uma fronteira propria.
- Imperative refs: BarChart, PieChart e CandlestickChart expoem APIs imperativas; LineChart nao expoe ref no estado atual dos docs.
- DisplayName scanning: alguns providers detectam children como YAxis/LastPrice por `displayName` para ajustar layout.
- Batch rendering: BarChart e CandlestickChart usam `Skia.PictureRecorder` para desenhar muitos elementos de uma vez.
- Culling por viewport: BarChart e CandlestickChart calculam indices visiveis com base em `scrollX`.

## Fluxos Principais

### LineChart

- Recebe dados `{ timestamp, value }`.
- Calcula `domainX`, `domainY`, escalas D3 e caminhos Skia.
- Gera `yMap` e `valueMap` como `Float32Array` indexados por pixel.
- O gesto de pan limita `touchX`, consulta mapas em O(1), atualiza `currentX`, `currentY`, `currentValue` e `currentTimestamp`.
- Renderiza area, linha, cursor, baseline e tooltips.

### BarChart

- Recebe dados `{ label, value, color?, meta? }`.
- Calcula escala Y com `calculateNiceScale`.
- Em modo scroll usa `barWidth` fixo e `contentWidth` expansivel.
- Em modo fit calcula largura dinamica para caber no container.
- Renderiza barras, labels e value labels por `PictureRecorder`.
- Usa tap gesture para alternar selecao.
- Expoe ref com `scrollToStart`, `scrollToEnd`, `scrollToIndex` e `selectedIndex`.

### PieChart

- Recebe `PieChartItem[]`.
- Ignora valores nao positivos.
- Ordena fatias por valor descendente.
- Gera cor fallback deterministica quando `color` nao existe.
- Agrega fatias pequenas/excedentes em `Others`.
- Calcula layout com `d3.pie`, `d3.arc` e converte SVG path para Skia path.
- Cacheia layouts por assinatura compacta com LRU simples.
- Tap selection roda em JS thread porque chama callbacks JS e faz hit-test contra paths ja calculados.
- Expoe ref com `selectedIndex` e `clearSelection`.

### CandlestickChart

- Recebe dados OHLC `{ timestamp, open, high, low, close, color?, meta? }`.
- Normaliza dados removendo itens nao finitos e corrigindo `high`/`low` pelos extremos OHLC.
- Calcula escala vertical do intervalo visivel.
- Anima `animatedDomainMin` e `animatedDomainMax` quando o range visivel muda.
- Renderiza candles com `PictureRecorder` e culling.
- Usa pan gesture para scroll controlado e tap gesture para selecao.
- Expoe ref com `scrollToStart`, `scrollToEnd`, `scrollToIndex` e `selectedIndex`.
- YAxis e LastPrice coordenam layout para reduzir sobreposicao de labels.

## Stack Tecnica

- TypeScript e TSX.
- React 19.1.0.
- React Native 0.81.5.
- Expo 54 no app de exemplo.
- `@shopify/react-native-skia` para desenho.
- `react-native-reanimated` para shared values, worklets e animacoes.
- `react-native-gesture-handler` para interacoes.
- `d3` e `d3-shape` para escala/layout.
- Yarn 4 workspaces.
- `react-native-builder-bob` para build da biblioteca.
- Jest com preset `react-native`.
- ESLint flat config, Prettier e Lefthook.
- GitHub Actions para CI.
- `release-it` para release/npm/GitHub release.

## Convencoes

- Pastas de feature por chart.
- Componentes de chart em PascalCase.
- Subcomponentes exportados por objeto em `src/index.tsx`.
- Interfaces publicas normalmente terminam com `Interface`.
- Refs publicos terminam com `Ref`.
- `selectedIndex` usa `-1` como deselect.
- Callbacks de selecao usam `item | null` e indice.
- Props `format` que rodam no UI thread devem ser worklet-safe.
- Codigo usa single quotes, 2 espacos e trailing comma ES5.
- TypeScript esta em modo strict com `noUncheckedIndexedAccess`.

## Regras De Negocio

- LineChart: precisa de pelo menos 2 pontos para linha desenhavel.
- LineChart: baseline usa o primeiro valor da serie.
- BarChart: valores alimentam escala vertical a partir de zero.
- BarChart: `color` no item sobrescreve `barColor`.
- BarChart: `isLoading` substitui dados por skeleton.
- PieChart: valores `<= 0` nao geram fatias.
- PieChart: fatias pequenas ou excedentes podem ser agrupadas em `Others`.
- PieChart: `renderValue` pode divergir de `value` para controle visual.
- CandlestickChart: `high` e sempre o maior entre OHLC apos normalizacao.
- CandlestickChart: `low` e sempre o menor entre OHLC apos normalizacao.
- CandlestickChart: candle bullish e `close >= open`.
- CandlestickChart: escala Y acompanha o range de candles visiveis quando scrollavel.

## Exemplos Relevantes

- Componente de performance: `src/charts/BarChart/components/BarChartBar.tsx`.
- Provider complexo: `src/charts/CandlestickChart/CandlestickChartContext.tsx`.
- Utilitarios testaveis: `src/charts/CandlestickChart/utils.ts`.
- Teste exemplar: `src/__tests__/candlestick-utils.test.ts`.
- Agregacao e cache: `src/charts/PieChart/PieChartContext.tsx` e `src/charts/PieChart/utils.ts`.
- Uso real: `example/src/App.tsx`.

## Necessita Validacao Humana

- Se a biblioteca deve aceitar valores negativos em BarChart ou PieChart. O codigo atual nao documenta suporte robusto para negativos.
- Se docs novos para agentes devem ser publicados junto ao pacote npm ou permanecer apenas no repositorio.
- Se os campos `meta?: any` devem ganhar tipagem generica no futuro.
- Se root-level `android`, `ios` e `cpp` listados em `package.json.files` sao intencionais apesar de nao existirem no root atual.
- Se `react-native-worklets/plugin` no exemplo substitui totalmente o plugin classico do Reanimated para todos os cenarios suportados.

## Estrutura De Documentacao Para IA

- `AGENTS.md`: entrada rapida para agentes.
- `docs/architecture.md`: arquitetura e fluxos.
- `docs/business-rules.md`: regras de dominio.
- `docs/coding-standards.md`: convencoes e cuidados.
- `docs/testing.md`: estrategia e lacunas de testes.
- `docs/frontend.md`: detalhes RN/Skia/Reanimated.
- `docs/backend.md`: ausencia de backend e APIs.
- `docs/glossary.md`: termos tecnicos e de dominio.
- `docs/examples.md`: indice de exemplos reais.
- `docs/decisions`: ADRs inferidos do codigo.
- `examples`: exemplos comentados baseados no projeto.
