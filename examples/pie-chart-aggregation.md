# Example: PieChart Aggregation

Fonte real: `src/charts/PieChart/PieChartContext.tsx` e `src/charts/PieChart/utils.ts`.

## Problema Resolvido

Pie charts com muitas fatias pequenas ficam ilegiveis. Tambem e caro recalcular layout D3 e converter SVG para Skia em renders repetidos.

## Padrao Observado

- Itens com `value <= 0` sao filtrados.
- Itens sao ordenados por `value` decrescente.
- Cor fallback e deterministica quando `color` nao existe.
- `maxSlices`, `minSliceAngle` e geometria determinam quantas fatias ficam visiveis.
- Fatias pequenas/excedentes entram em `Others`.
- `Others` preserva `value` real e `groupedItems`.
- `renderValue` pode ser sintetico para controlar angulo visual.
- `buildPieLayout` usa assinatura de layout e cache LRU.

## Ao Alterar Este Fluxo

- Nao perca `groupedItems` ao modificar agregacao.
- Preserve callback `onSelectAggregated`.
- Cuidado para nao permitir chart 100% `Others`; o codigo atual promove a maior fatia.
- Se mudar campos que influenciam layout, atualize `hashPieData` ou `getPieLayoutSignature`.

## Testes Recomendados

- Dataset com valores zero/negativos.
- Dataset que exige `Others`.
- Dataset onde `Others` ficaria pequeno demais.
- Garantia de cor fallback deterministica para o mesmo item.
