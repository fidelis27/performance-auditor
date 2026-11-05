---
name: react-opportunities
description: "Investiga renderização, hooks e trabalho bloqueante na thread principal em aplicações React."
agents:
  - name: claude-code
    supported: true
  - name: cursor
    supported: true
  - name: codex
    supported: true
---

# React Opportunities

## Papel

Inspecione estaticamente componentes, props e hooks para levantar hipóteses; use React Profiler e traces do navegador para confirmar custo relevante. Um padrão suspeito não é automaticamente uma causa de lentidão.

## O que procurar

1. Objetos e arrays criados inline e passados como props, por exemplo `<Lista filtros={{ status: 'ativo' }} />`. Isso só costuma ser relevante quando invalida memoização ou inicia trabalho caro em descendentes.
2. Funções ou callbacks inline em caminhos de renderização quentes, avaliando o impacto real e não a mera existência da função.
3. Callback `async` diretamente em `useEffect`: o callback do efeito não deve devolver uma Promise, pois o React espera `void` ou uma função de cleanup.
4. Atualizações de estado derivável, effects em cascata, closures obsoletas e respostas assíncronas que podem chegar fora de ordem.
5. Leituras de layout como `getBoundingClientRect()` e `offsetHeight`, especialmente intercaladas com escritas DOM ou repetidas em loops, que podem provocar layout síncrono/thrashing.
6. Trabalho CPU longo no thread principal, listas extensas e cálculos dispendiosos durante o render.

## Anti-pattern: props inline

```tsx
<Lista filtros={{ status: 'ativo' }} />
```

Se `Lista` depende de igualdade referencial (por exemplo, usa `React.memo`) ou faz processamento caro, o novo objeto a cada render pode invalidar uma otimização. Sem esse contexto, memoizar pode apenas adicionar complexidade.

## Boa prática: estabilizar apenas quando necessário

```tsx
const filtrosAtivos = { status: 'ativo' } as const;

function Tela() {
  return <Lista filtros={filtrosAtivos} />;
}
```

Uma constante no escopo do módulo é adequada se o valor não depende de props/estado. Para valores derivados de dependências que mudam, considere `useMemo` somente se profiling ou o comportamento de um descendente memoizado justificar:

```tsx
function Tela({ status }: { status: string }) {
  const filtros = useMemo(() => ({ status }), [status]);
  return <Lista filtros={filtros} />;
}
```

## Anti-pattern: callback async no effect

```tsx
useEffect(async () => {
  const dados = await buscarDados();
  setDados(dados);
}, []);
```

## Boa prática: função interna e ciclo de vida explícito

```tsx
useEffect(() => {
  const controller = new AbortController();

  async function carregar() {
    try {
      const dados = await buscarDados({ signal: controller.signal });
      setDados(dados);
    } catch (erro) {
      if (!controller.signal.aborted) {
        setErro(erro);
      }
    }
  }

  void carregar();
  return () => controller.abort();
}, []);
```

Adapte o exemplo à API real: trate erros, cancelamento e resultados obsoletos conforme o contrato da aplicação. Não silencie erros.

## Layout e thread principal

Anti-pattern: ler `offsetHeight`, escrever estilos, e voltar a ler geometria repetidamente dentro de um loop.

Boa prática: quando a medição for necessária, agrupe leituras antes das escritas, evite leituras redundantes e valide a hipótese com um trace. Para CPU longa, considere dividir o trabalho ou movê-lo para Web Worker apenas se o custo e as restrições de interação justificarem.

## Validação

- Reproduza a interação com a mesma rota e estado antes/depois.
- Compare commits/custos no React Profiler e long tasks/layout no trace do navegador.
- Teste loading, erro, cancelamento, navegação e acessibilidade.
- Não use apenas contagem de renders como prova de melhoria perceptível.
