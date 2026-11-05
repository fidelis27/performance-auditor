---
name: lazy-opportunities
description: "Identifica módulos pesados que podem ser carregados sob demanda sem atrasar conteúdo crítico."
agents:
  - name: claude-code
    supported: true
  - name: cursor
    supported: true
  - name: codex
    supported: true
---

# Lazy Opportunities

## Papel

Inspecione imports e condições de uso para encontrar componentes pesados carregados antecipadamente apesar de só serem necessários após uma ação ou navegação. Confirme o custo no build de produção e no runtime.

## O que procurar

- Modais, editores rich text, dashboards e relatórios gráficos importados no topo do módulo, mas renderizados apenas após interação.
- Componentes exclusivos de rotas específicas incluídos no chunk inicial.
- Dependências pesadas transitivas de funcionalidades raramente utilizadas.
- Limites de carregamento já fornecidos pelo framework ou router.

Um componente escondido por uma condicional ainda pode ser incluído no bundle inicial quando é importado estaticamente.

## Anti-pattern

```tsx
import RelatorioCompleto from './RelatorioCompleto';

function Tela({ mostrarRelatorio }: { mostrarRelatorio: boolean }) {
  return mostrarRelatorio ? <RelatorioCompleto /> : null;
}
```

Se o relatório é pesado e raramente usado, o import estático pode incluí-lo antecipadamente, mesmo quando não é renderizado.

## Boa prática com React.lazy

```tsx
import { lazy, Suspense } from 'react';

const RelatorioCompleto = lazy(() => import('./RelatorioCompleto'));

function Tela({ mostrarRelatorio }: { mostrarRelatorio: boolean }) {
  return (
    <div>
      {mostrarRelatorio && (
        <Suspense fallback={<Spinner />}>
          <RelatorioCompleto />
        </Suspense>
      )}
    </div>
  );
}
```

`React.lazy` requer que o módulo carregado tenha export default compatível. Ajuste o carregamento se o módulo tiver apenas exports nomeados ou se o framework definir outra convenção.

## Boas práticas e cautelas

- Use um fallback útil e estável; considere Error Boundary para falha ao carregar o chunk.
- Preserve dimensões de conteúdo quando possível para evitar layout shift.
- Não atrase conteúdo acima da dobra, navegação essencial ou a provável imagem LCP sem evidência de que seja seguro.
- Evite criar cascatas de chunks ou uma espera perceptível depois do clique.
- Confirme a divisão nos chunks do build e teste rede lenta, falha de carregamento, navegação e acessibilidade.
