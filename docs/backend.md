# Backend

Nao ha backend neste repositorio.

## Evidencias

- Nao foram encontrados `fetch`, `axios`, GraphQL, Apollo, React Query, TanStack Query, Redux, Zustand ou camada de API em `src/` ou `example/src/`.
- O pacote e uma biblioteca React Native focada em renderizacao local de dados ja fornecidos por props.
- O app de exemplo gera datasets locais em memoria.
- Nao ha autenticacao, persistencia, rotas, banco de dados ou servidor.

## Contrato De Dados

Os consumidores da biblioteca sao responsaveis por buscar, transformar e passar os dados aos charts.

- LineChart recebe `LineChartDataPoint[]`.
- BarChart recebe `BarChartItemDataInterface[]`.
- PieChart recebe `PieChartItem[]`.
- CandlestickChart recebe `CandlestickChartDataPoint[]`.

## Integracoes Externas Observadas

- Integracoes sao bibliotecas de runtime/renderizacao: Skia, Reanimated, Gesture Handler e D3.
- Nao ha integracao com APIs financeiras externas.
- Nao ha dependencia de servicos remotos.

## Necessita Validacao Humana

- Se o projeto deve incluir adaptadores para provedores financeiros no futuro.
- Se exemplos com API real devem ser adicionados ao app `example`.
- Se `meta?: any` deve receber uma estrutura padrao para dados de backend.
