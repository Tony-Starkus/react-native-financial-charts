# Frontend

Este repositorio e essencialmente frontend/mobile. A biblioteca fornece componentes React Native renderizados com Skia e animados com Reanimated.

## React Native

- Componentes publicos sao TSX.
- Layout externo usa `View`, `StyleSheet`, `TextInput` e componentes do Gesture Handler.
- O app de exemplo e Expo com `newArchEnabled: true`.
- O exemplo usa `GestureHandlerRootView` no topo.

## Skia

- Skia e a camada principal de desenho.
- Paths sao usados para linhas, areas, fatias e tooltips.
- `PictureRecorder` e usado para gravar barras/candles/labels em lotes.
- `matchFont` e usado para texto Skia quando uma fonte nao e recebida por prop.
- `Canvas` precisa re-prover contexto interno.

## Reanimated

- `SharedValue` guarda estado de cursor, selecao, scroll, progresso de entrada e dominios animados.
- `useDerivedValue` calcula posicoes, paths, opacidade e transforms.
- `useAnimatedReaction` sincroniza selecao, viewport e animacoes.
- `withTiming` e `withSpring` sao usados para transicoes.
- `runOnJS` e usado para chamar callbacks de usuario fora da UI thread.

## Gesture Handler

- LineChart usa `Gesture.Pan`.
- BarChart usa `Gesture.Tap`.
- PieChart usa `Gesture.Tap().runOnJS(true)`.
- CandlestickChart usa `Gesture.Pan`, `Gesture.Tap` e `Gesture.Race`.

## Composicao Visual

- `Root` define dados, dimensoes e comportamento.
- `Canvas` cria o plano de desenho.
- Subcomponentes adicionam camadas visuais.
- Tooltips podem ser Skia ou React Native/Reanimated dependendo do chart.
- Overlays externos podem ser compostos ao redor do chart, como no PieChart do `example/src/App.tsx`.

## App De Exemplo

`example/src/App.tsx` demonstra:

- Controles imperativos de CandlestickChart via ref.
- CandlestickChart scrollavel e compact selection card.
- PieChart com `onSelect` e overlay central.
- LineChart com area, baseline, line, cursor e tooltips.

## Configuracao Do Exemplo

- `example/package.json` usa Expo, React Native, Skia, Reanimated, Gesture Handler e Worklets.
- `example/metro.config.js` usa `react-native-monorepo-config` e habilita package exports.
- `example/babel.config.js` usa `babel-preset-expo` e `react-native-worklets/plugin`.

## Acessibilidade

Necessita validacao humana:

- Nao ha evidencia de suporte explicito a screen readers.
- Canvas Skia nao fornece, por si so, semantica acessivel para dados.
- Se acessibilidade for requisito, agentes devem propor uma camada RN paralela com labels/summary.

## Performance

- Evite recalcular layouts caros em cada render.
- Preserve memoizacao e caches existentes.
- Nao troque renderizacao batch por listas de muitos componentes Skia sem medir.
- Cuidado ao usar `toLocaleString` em formatadores de UI thread; docs existentes alertam contra esse padrao em alguns tooltips.
