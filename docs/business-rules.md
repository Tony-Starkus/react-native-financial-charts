# Business Rules

Este documento registra regras de dominio observadas no codigo. Quando uma regra nao pode ser inferida com seguranca, ela e marcada como `Necessita validacao humana`.

## Entidades Principais

- `LineChartDataPoint`: ponto temporal com `timestamp` e `value`.
- `BarChartItemDataInterface`: item categorico com `label`, `value`, `color?` e `meta?`.
- `PieChartItem`: fatia proporcional com `value`, `label?`, `color?`, `isAggregated?`, `groupedItems?` e `renderValue?`.
- `CandlestickChartDataPoint`: candle OHLC com `timestamp`, `open`, `high`, `low`, `close`, `color?` e `meta?`.
- `CandlestickChartLayoutItem`: representacao derivada de candle com coordenadas de tela, cor e flag `isBullish`.

## Contratos Comuns

- `selectedIndex === -1` representa ausencia de selecao.
- Quando uma selecao e limpa, callbacks recebem `null` e indice `-1`.
- Cores por item, quando existem, tem prioridade sobre cores globais em BarChart e CandlestickChart.
- Dados invalidos devem ser tratados antes de renderizar quando houver utilitario de normalizacao.
- Formatadores chamados em contexto de UI thread precisam ser simples e worklet-safe.

## LineChart

- Dados devem ter `timestamp` numerico e `value` numerico.
- Menos de 2 pontos nao produz um path desenhavel; o provider retorna contexto seguro inicial.
- O eixo X e baseado em tempo.
- O eixo Y usa min/max dos valores da serie.
- A baseline visual usa o primeiro valor da serie.
- O cursor usa interpolacao Catmull-Rom e lookup maps por pixel.
- Tooltips padrao formatam valor como `$ <number>` e data como `dd/mm/yyyy`.

## BarChart

- Cada item precisa de `label` e `value`.
- `maxValue` e calculado a partir do maior `value` ou `100` em loading.
- A escala Y usa minimo zero e maximo "nice".
- `isLoading` troca os dados reais por skeleton.
- `isScrollable` usa largura fixa para cada barra e permite conteudo maior que o canvas.
- Sem `isScrollable`, a largura das barras e recalculada para caber no container.
- `showXAxis` reserva altura para labels do eixo X.
- `selectable` habilita tap selection.
- `onBarPress` so e chamado quando ha interacao ou selecao imperativa.
- `selectedIndex(index, { scrollToBar: true })` centraliza a barra apenas em modo scroll.

Necessita validacao humana:

- Suporte semantico a valores negativos nao esta documentado no codigo atual.
- A interpretacao de `meta` e dominio externo nao foi encontrada.

## PieChart

- `value` e obrigatorio.
- Itens com `value <= 0` sao filtrados e nao viram fatias.
- Itens sao ordenados por valor decrescente antes da agregacao.
- `color` e opcional; quando ausente, uma cor fallback deterministica e gerada.
- `donutRatio` define raio interno em relacao ao raio externo.
- `sliceGapAngle` define espacamento angular, exceto quando o chart entra em pie mode.
- Fatias pequenas ou excedentes podem ser agrupadas em uma fatia agregada.
- A fatia agregada usa `isAggregated: true`, `groupedItems` e label/cor configuraveis.
- `renderValue` pode controlar proporcao visual sem mudar o `value` real.
- `onSelectAggregated` e chamado quando a fatia agregada e selecionada.
- `clearSelection` equivale a selecionar `-1`.

Necessita validacao humana:

- Se fatias de valor zero deveriam ser exibidas visualmente em algum caso.
- Se a ordenacao descendente deve ser sempre parte do contrato publico.

## CandlestickChart

- Cada ponto deve ter `timestamp`, `open`, `high`, `low` e `close` finitos.
- Pontos com campos numericos nao finitos sao removidos por `normalizeCandlestickData`.
- `high` e normalizado para o maior valor entre `high`, `open`, `close` e `low`.
- `low` e normalizado para o menor valor entre `low`, `open`, `close` e `high`.
- Candle bullish e definido por `close >= open`.
- Candle bearish e definido quando `close < open`.
- A escala Y usa low/high do range visivel, com padding vertical.
- Em modo scroll, mudanca de viewport recalcula o dominio vertical.
- `LastPrice` usa o `close` do ultimo item do layout.
- `YAxis` pode ocultar ticks que colidem com o label de `LastPrice`.
- Tap selection valida largura do candle, area de plot e proximidade da wick.
- `selectedIndex(index, { scrollToCandle: true })` centraliza o candle apenas em modo scroll.

Necessita validacao humana:

- Se series com gaps temporais devem afetar espacamento horizontal. O layout atual usa indice, largura e spacing, nao distancia temporal.
- Se candles com `open === close` devem ter visual especifico alem de `minBodyHeight`.

## Glossario De Dominio

- OHLC: Open, High, Low, Close.
- Bullish: candle cujo fechamento e maior ou igual a abertura.
- Bearish: candle cujo fechamento e menor que a abertura.
- Baseline: linha horizontal no valor inicial da serie.
- Others: fatia agregada de categorias pequenas/excedentes no PieChart.
- Fit mode: modo Bar/Candlestick sem scroll, ajustando itens ao canvas.
- Scroll mode: modo com conteudo horizontal maior que a area visivel.
