# ADR 0001: Compound Chart API

Status: Inferido do codigo, necessita validacao humana para intencao original.

## Contexto

`src/index.tsx` exporta charts como objetos compostos: `LineChart.Root`, `LineChart.Canvas`, `LineChart.Line`, `BarChart.Bar`, `PieChart.Slices`, `CandlestickChart.Tooltip.OHLC` e outros.

## Decisao Observada

A biblioteca usa compound components como API publica principal.

## Consequencias

- Usuarios compoem charts declarativamente.
- Providers centralizam dados e subcomponentes consomem contexto.
- Novas partes visuais devem ser adicionadas ao objeto publico do chart.
- Mudancas em nomes publicos podem quebrar usuarios.

## Evidencias

- `src/index.tsx`
- `docs/LineChartDocs.md`
- `docs/BarChartDocs.md`
- `docs/PieChartDocs.md`
- `docs/CandlestickChartDocs.md`
