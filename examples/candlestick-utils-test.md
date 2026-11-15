# Example: Candlestick Utils Test

Fonte real: `src/__tests__/candlestick-utils.test.ts`.

## Por Que Este E O Melhor Exemplo De Teste Atual

O teste cobre regras puras sem depender de Skia, Gesture Handler ou Reanimated runtime. Isso deixa a suite mais rapida e estavel.

## Padroes Bons Observados

- Testa uma regra por `it`.
- Usa dados pequenos e deterministas.
- Valida comportamento de dominio, nao detalhes de implementacao visual.
- Cobre normalizacao, escala e layout.

## Modelo Para Novos Testes

Ao adicionar uma regra em `utils.ts`, prefira:

```ts
import { helper } from '../charts/SomeChart/utils';

describe('SomeChart utils', () => {
  it('describes the rule in domain language', () => {
    const result = helper(input);
    expect(result).toEqual(expected);
  });
});
```

## Bons Candidatos

- `src/utils.ts`: `solveCatmullRom`.
- `src/charts/BarChart/utils.ts`: `calculateNiceScale`.
- `src/charts/PieChart/utils.ts`: `getPieLayoutSignature` e comportamento de cache se for exposto por teste.
- `src/charts/CandlestickChart/utils.ts`: colisao de retangulos e posicionamento de LastPrice.
