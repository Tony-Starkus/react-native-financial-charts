# Glossary

## Termos De Arquitetura

- Compound Components: padrao em que `Root`, `Canvas` e partes visuais sao combinados declarativamente pelo usuario.
- Provider: componente que calcula e fornece contexto para subcomponentes.
- Context Boundary: separacao de arvore que exige re-prover contexto dentro de Skia `Canvas`.
- SharedValue: valor compartilhado do Reanimated que pode ser lido na UI thread.
- Worklet: funcao compilada para rodar fora do JS thread principal.
- Derived Value: valor Reanimated recalculado a partir de shared values.
- Animated Reaction: reacao Reanimated a mudancas de shared values.
- runOnJS: ponte para chamar funcao JS a partir de worklet.
- PictureRecorder: API Skia para gravar desenho em lote.
- Culling: desenhar apenas elementos potencialmente visiveis.
- Fit Mode: modo em que itens cabem no canvas sem scroll horizontal.
- Scroll Mode: modo em que o conteudo horizontal e maior que a area visivel.

## Termos De Charts

- LineChart: chart de serie temporal com linha, area, cursor e tooltips.
- BarChart: chart de categorias discretas representadas por barras.
- PieChart: chart proporcional circular.
- Donut Chart: PieChart com raio interno.
- CandlestickChart: chart financeiro baseado em OHLC.
- OHLC: Open, High, Low, Close.
- Open: preco/valor de abertura de um candle.
- High: maior preco/valor do periodo.
- Low: menor preco/valor do periodo.
- Close: preco/valor de fechamento.
- Bullish: candle com `close >= open`.
- Bearish: candle com `close < open`.
- Wick: linha vertical do candle que liga high e low.
- Body: retangulo do candle entre open e close.
- LastPrice: linha/label do fechamento do ultimo candle.
- YAxis: labels do eixo vertical.
- Grid: linhas auxiliares do chart.
- Baseline: linha horizontal no valor inicial de uma serie.
- Tooltip: informacao contextual sobre item selecionado ou cursor.
- Cursor: indicador visual de posicao/seleção.

## Termos De Dados

- `LineChartDataPoint`: `{ timestamp: number; value: number }`.
- `BarChartItemDataInterface`: `{ label: string; value: number; color?: string; meta?: any }`.
- `PieChartItem`: item de fatia com `value` obrigatorio e campos opcionais.
- `CandlestickChartDataPoint`: `{ timestamp; open; high; low; close; color?; meta? }`.
- `renderValue`: peso visual usado pelo PieChart sem alterar o valor real.
- `groupedItems`: itens originais agrupados em `Others`.
- `meta`: campo livre atualmente nao interpretado pela biblioteca.

## Termos De Algoritmo

- Catmull-Rom: interpolacao usada para suavizar a linha do LineChart.
- Lookup Map: arrays indexados por pixel usados para cursor preciso no LineChart.
- Nice Scale: escala com ticks arredondados, como 1, 2, 5 ou 10 vezes potencias de 10.
- Layout Signature: hash compacto do PieChart usado para cache de layout.
- LRU Cache: cache que remove a entrada menos recentemente usada.
- Visible Range: intervalo de indices atualmente visivel em charts scrollaveis.
- Domain: intervalo de valores de dados.
- Range: intervalo de coordenadas de tela.

## Sentinelas E Convencoes

- `selectedIndex = -1`: sem selecao.
- `isScrollable`: ativa conteudo horizontal scrollavel.
- `selectable`: habilita selecao por toque.
- `scrollToTheEnd`: inicia o chart no fim do conteudo quando scrollavel.
- `format`: callback para formatar labels/tooltips.
