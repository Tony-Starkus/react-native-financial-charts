# ADR 0003: LineChart Lookup Map With Catmull-Rom

Status: Inferido do codigo, necessita validacao humana para intencao original.

## Contexto

LineChart precisa manter o cursor alinhado a uma linha suavizada. Recalcular a curva durante cada gesto seria caro e propenso a drift.

## Decisao Observada

`LineChartContext.tsx` gera um path Skia e dois mapas `Float32Array`, `yMap` e `valueMap`, indexados por pixel X. A interpolacao de valores usa `solveCatmullRom` de `src/utils.ts`.

## Consequencias

- Consulta de cursor durante pan e O(1).
- A linha visual e os valores do cursor compartilham a mesma aproximacao pixel-a-pixel.
- Mudancas em largura, padding ou dados exigem regeneracao dos mapas.
- O custo maior ocorre no processamento inicial, nao durante o gesto.

## Evidencias

- `src/charts/LineChart/LineChartContext.tsx`
- `src/utils.ts`
- `README.md`
