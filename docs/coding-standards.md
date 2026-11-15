# Coding Standards

Este documento descreve convencoes reais observadas no repositorio.

## Ferramentas

- TypeScript strict esta configurado em `tsconfig.json`.
- ESLint flat config esta em `eslint.config.mjs`.
- Prettier esta configurado no `package.json`.
- Lefthook esta em `lefthook.yml`.
- Commitlint usa conventional commits.

## Estilo

- Use 2 espacos.
- Use LF.
- Use single quotes.
- Use trailing comma ES5.
- Evite imports/variaveis nao usados; `noUnusedLocals` e `noUnusedParameters` estao ativos.
- Considere `noUncheckedIndexedAccess`; acessos por indice normalmente precisam de guard ou non-null assertion quando a logica garante existencia.

## Organizacao De Codigo

- Adicione codigo fonte em `src/`.
- Nao edite `lib/` manualmente.
- Mantenha cada chart dentro de `src/charts/<ChartName>`.
- Coloque contratos publicos em `interfaces.ts` ou exporte tipos pelo componente quando o padrao atual faz isso.
- Coloque constantes por chart em `constants.ts`.
- Coloque matematica pura e layout testavel em `utils.ts`.
- Coloque componentes Skia/RN em `components/`.

## Nomeacao

- Componentes usam PascalCase.
- Context hooks usam `use<ChartName>` ou, no LineChart atual, `useChart`.
- Interfaces publicas tendem a usar sufixo `Interface`.
- Refs publicos usam sufixo `Ref`.
- Props de subcomponentes sao exportadas como `<Chart><Part>PropsInterface` quando publicas.
- `selectedIndex` e o nome padrao para selecao imperativa.

## API Publica

- Atualize `src/index.tsx` ao criar novo componente publico.
- Preserve o formato de objetos exportados por chart.
- Exporte tipos publicos junto com os componentes.
- Ao mudar API publica, atualize docs existentes em `docs/*ChartDocs.md` e `docs/interfaces/*.md`.

## Reanimated E Worklets

- Funcoes dentro de gestures ou helpers chamados na UI thread precisam ser worklet-safe.
- Inclua `'worklet'` quando o codigo precisa rodar como worklet.
- Evite APIs JS complexas dentro de formatadores que rodam na UI thread.
- Docs existentes ja alertam que alguns `format` callbacks devem ser simples.
- Use `runOnJS` somente quando for necessario chamar callbacks JS a partir de worklets.

## Skia

- Re-proveja o contexto dentro de `Canvas` quando subcomponentes precisam acessar contexto.
- Use `PictureRecorder` para renderizacao batch quando houver muitos elementos.
- Use culling por viewport em charts scrollaveis para evitar desenhar itens fora da tela.
- Use `matchFont` ou font passado por props para texto Skia.
- Quando `font` puder ser nulo, retorne `null` antes de desenhar texto.

## Gestures

- BarChart usa tap gesture para selecao.
- PieChart usa tap gesture com `runOnJS(true)` porque usa callbacks JS e hit-test em paths.
- CandlestickChart combina pan e tap com `Gesture.Race` quando scroll e selecao estao ativos.
- LineChart usa pan gesture para cursor continuo.

## Estado E Layout

- Calcule dimensoes derivadas no provider.
- Mantenha shared values no provider quando subcomponentes precisam reagir.
- Use `useMemo` para calculos pesados dependentes de dados/layout.
- Use `useAnimatedReaction` quando mudancas de shared values precisam sincronizar estado derivado.
- Preserve `-1` como sentinela de sem selecao.

## Testabilidade

- Prefira funcoes puras para regras matematicas e layout.
- Testes existentes validam `normalizeCandlestickData`, `calculateNiceScale`, `buildCandlestickLayout` e `calculateVisibleCandlestickScale`.
- Ao adicionar uma regra de dominio, adicione teste em `src/__tests__`.

## Cuidados

- `displayName` e usado como contrato interno para detectar YAxis/LastPrice. Se renomear componentes, preserve `displayName`.
- `lib/` pode estar desatualizado se `yarn prepare` nao foi rodado.
- `package.tgz` e artefato local, nao fonte.
- `example/` contem app Expo com arquivos nativos gerados; altere apenas quando a mudanca exigir demonstracao ou configuracao do exemplo.
