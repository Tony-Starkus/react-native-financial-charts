# Example: BarChart Picture Culling

Fonte real: `src/charts/BarChart/components/BarChartBar.tsx`.

## Problema Resolvido

BarChart precisa suportar muitos itens sem desenhar todo o dataset em cada frame.

## Padrao Observado

- `scrollX.value` representa offset horizontal atual.
- `itemFullWidth = barWidth + spacing`.
- `rawStartIndex` e `rawEndIndex` sao calculados pela viewport.
- O loop desenha de `startIndex - 2` ate `endIndex + 2` para margem visual.
- Barras, labels de eixo X e value labels sao gravados em `PictureRecorder`.
- Se um item tem `color`, essa cor sobrescreve `barColor`.

## Ao Alterar Este Fluxo

- Preserve culling baseado em `scrollX`.
- Atualize dependencias de `useDerivedValue` quando adicionar props usadas no desenho.
- Nao desenhe labels se `font` for nulo.
- Mantenha `selectedIndex === -1` como sem selecao.
- Garanta que tooltip e value labels nao se sobreponham quando um item esta selecionado.

## Testes Recomendados

- Adicionar teste para `calculateNiceScale` em `src/charts/BarChart/utils.ts`.
- Se extrair matematica de viewport para utilitario, testar indices visiveis com scroll zero, meio e fim.
