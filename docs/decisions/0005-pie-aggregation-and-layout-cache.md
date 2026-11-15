# ADR 0005: PieChart Aggregation And Layout Cache

Status: Inferido do codigo, necessita validacao humana para intencao original.

## Contexto

Pie charts com muitas fatias pequenas ficam ilegiveis e o layout D3/SVG/Skia e relativamente caro.

## Decisao Observada

PieChart agrega fatias pequenas/excedentes em `Others` e usa cache LRU por assinatura de layout em `src/charts/PieChart/utils.ts`.

## Consequencias

- Datasets grandes ficam visualmente mais legiveis.
- O valor real de `Others` pode ser preservado enquanto `renderValue` controla peso visual.
- Callbacks podem receber a fatia agregada e seus `groupedItems`.
- O layout pode ser reutilizado entre Canvas e Slices quando os parametros sao compativeis.

## Evidencias

- `src/charts/PieChart/PieChartContext.tsx`
- `src/charts/PieChart/utils.ts`
- `src/charts/PieChart/PieChartLayoutContext.tsx`
- `docs/PieChartDocs.md`
