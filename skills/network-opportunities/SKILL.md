---
name: network-opportunities
description: "Analisa estaticamente chamadas assíncronas para encontrar cascatas evitáveis sem alterar dependências ou semântica de erros."
agents:
  - name: claude-code
    supported: true
  - name: cursor
    supported: true
  - name: codex
    supported: true
---

# Network Opportunities

## Papel

Analise o código-fonte para localizar chamadas assíncronas sequenciais e duplicadas. Esta é uma auditoria estática: confirme dependências entre resultados no código e valide a waterfall real com `network-profiler` antes de afirmar o impacto em runtime.

## O que procurar

- Vários `await` consecutivos no mesmo fluxo.
- Se a segunda chamada usa de fato o resultado da primeira, incluindo identificadores, autorização, parâmetros ou estado atualizado.
- Chamadas idênticas concorrentes em componentes/efeitos distintos.
- Semântica de falha, cancelamento, retry e tratamento de resultados parciais.

## Anti-pattern: sequência independente

```typescript
const usuario = await buscarUsuario();
const permissoes = await buscarPermissoes(); // Independente de usuario!
```

Se `buscarPermissoes()` realmente não depende do usuário e ambas as chamadas devem ter sucesso para continuar, a espera sequencial pode ser evitável.

## Boa prática: executar em paralelo

```typescript
const [usuario, permissoes] = await Promise.all([
  buscarUsuario(),
  buscarPermissoes()
]);
```

Só aplique quando as operações são independentes e a falha de qualquer uma deve rejeitar o conjunto. `Promise.all` rejeita assim que uma Promise falha; não descarte a estratégia de erro existente.

Quando resultados parciais forem válidos para a interface, avalie `Promise.allSettled` e trate explicitamente cada falha:

```typescript
const resultados = await Promise.allSettled([
  buscarUsuario(),
  buscarPermissoes()
]);
```

## Anti-pattern: paralelizar uma dependência real

```typescript
const [usuario, perfil] = await Promise.all([
  buscarUsuario(),
  buscarPerfilDoUsuario() // Precisa do ID retornado por buscarUsuario()
]);
```

## Boa prática: manter a ordem dependente

```typescript
const usuario = await buscarUsuario();
const perfil = await buscarPerfilDoUsuario(usuario.id);
```

## Boas práticas

- Separe o que é comprovado no código do que precisa de confirmação em trace.
- Preserve retries, cancelamento, ordenação e tratamento de erros.
- Não use `allSettled` para esconder falhas que deveriam interromper a operação.
- Confira a aba Network para demonstrar redução real da cascata e teste estados de sucesso parcial/total.
