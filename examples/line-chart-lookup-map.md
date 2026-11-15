# Example: LineChart Lookup Map

Fonte real: `src/charts/LineChart/LineChartContext.tsx` e `src/utils.ts`.

## Problema Resolvido

O cursor precisa seguir a linha suavizada sem drift visual e sem recalcular a curva durante cada evento de pan.

## Padrao Observado

- O provider calcula escalas e path.
- Um loop percorre pixels X dentro da area util.
- Para cada pixel, o codigo calcula progresso, indice fracionario e interpolacao Catmull-Rom.
- O resultado e salvo em `yMap[x]` e `valueMap[x]`.
- Durante o gesto, o chart arredonda `touchX` e consulta os mapas.

## Ao Alterar Este Fluxo

- Mantenha `yMap` e `valueMap` coerentes com o path desenhado.
- Recalcule mapas quando `data`, `width`, `height` ou `padding` mudarem.
- Preserve clamps em `touchX` para nao acessar fora da area util.
- Teste `solveCatmullRom` se alterar interpolacao.

## Evidencia De API

O LineChart publico nao expoe ref imperativo nos docs atuais. Interacao principal e pan gesture com cursor e tooltips.
