# Examples Index

Este indice aponta para exemplos reais do projeto e documentos comentados em `examples/`.

## Exemplos Reais No Codigo

- `example/src/App.tsx`: uso real de CandlestickChart, PieChart e LineChart em um app Expo.
- `docs/LineChartDocs.md`: exemplos publicos de LineChart.
- `docs/BarChartDocs.md`: exemplos publicos de BarChart.
- `docs/PieChartDocs.md`: exemplos publicos de PieChart, incluindo agregacao `Others`.
- `docs/CandlestickChartDocs.md`: exemplos publicos de CandlestickChart, refs e formatadores.
- `src/__tests__/candlestick-utils.test.ts`: exemplo real de teste de regras puras.

## Exemplos Comentados Para Agentes

- `examples/line-chart-lookup-map.md`: como o LineChart mantem cursor preciso.
- `examples/bar-chart-picture-culling.md`: como o BarChart renderiza muitos itens.
- `examples/pie-chart-aggregation.md`: como o PieChart agrega fatias pequenas.
- `examples/candlestick-visible-scale.md`: como o CandlestickChart recalcula escala por viewport.
- `examples/candlestick-utils-test.md`: como escrever testes de utilitarios puros.

## Quando Usar Cada Exemplo

- Use LineChart lookup map ao alterar cursor, interpolacao ou tooltips do LineChart.
- Use BarChart picture/culling ao alterar barras, labels, scroll ou performance.
- Use PieChart aggregation ao alterar `maxSlices`, `minSliceAngle`, `othersVisualAngle` ou callbacks.
- Use Candlestick visible scale ao alterar scroll, YAxis, LastPrice ou dominio OHLC.
- Use Candlestick utils test ao adicionar novas regras matematicas testaveis.
