---
name: memory-leak-diagnostic
description: "Investiga crescimento persistente de memória e retenção de objetos com heap snapshots e análise de lifecycle."
agents:
  - name: claude-code
    supported: true
  - name: cursor
    supported: true
  - name: codex
    supported: true
---

# Memory Leak Diagnostic

## Papel

Investigue suspeitas de fuga de memória com uma jornada reproduzível e evidência de runtime. Uma inspeção estática pode encontrar recursos sem cleanup, mas só uma retenção persistente ajuda a confirmar a fuga.

## Procedimento de diagnóstico

1. Defina uma sequência repetível, como abrir/fechar uma tela ou montar/desmontar um componente.
2. Registre browser, build, quantidade de dados, número de ciclos e baseline de memória.
3. Capture heap snapshots antes e depois de repetir a sequência; use allocation timeline/retainers quando disponível.
4. Permita coleta de lixo quando a ferramenta suportar e compare ciclos equivalentes.
5. Procure crescimento que persiste após ciclos repetidos e identifique o retaining path. Distingua-o de cache intencional, aquecimento e coleta de lixo tardia.

## Recursos a inspecionar

- Event listeners de `window`, `document` e elementos DOM adicionados em effects sem remoção.
- `setInterval` e `setTimeout` sem `clearInterval`/`clearTimeout` quando o owner desmonta ou a operação deixa de ser necessária.
- `ResizeObserver`, `MutationObserver` e observers sem `disconnect()`.
- Subscrições, incluindo WebSockets, stores e event emitters, sem unsubscribe/close adequado.
- Closures, caches ou stores globais que retêm dados e componentes.
- Detached DOM nodes com retaining paths ligados a listeners, closures ou coleções.

## Anti-pattern: listener sem cleanup

```tsx
useEffect(() => {
  window.addEventListener('resize', atualizarLayout);
}, []); // Listener continua registrado após o unmount.
```

## Boa prática: cleanup pareado

```tsx
useEffect(() => {
  window.addEventListener('resize', atualizarLayout);

  return () => {
    window.removeEventListener('resize', atualizarLayout);
  };
}, []);
```

Use a mesma referência de função e opções ao remover o listener. Para timers, limpe o identificador criado; para observers, chame `disconnect()`; para subscriptions, use o mecanismo de unsubscribe/close fornecido pela API.

## Timer e WebSocket

```tsx
useEffect(() => {
  const timer = window.setInterval(atualizarDados, 5_000);
  const socket = new WebSocket(url);

  return () => {
    window.clearInterval(timer);
    socket.close();
  };
}, [url]);
```

Adapte ao lifecycle da aplicação: trate erros/fechamento do socket e não feche uma conexão compartilhada que pertença a outro owner.

## Validação

- Reproduza a mesma sequência antes/depois e compare heap, objetos retidos e retaining paths após vários ciclos.
- Teste remount, navegação, unmount durante operação e interações rápidas.
- Não classifique crescimento inicial que estabiliza como leak sem evidência de retenção.
- Documente condições, medições e limitações; evite compartilhar heap snapshots com dados sensíveis.
