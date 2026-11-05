---
name: performance-advisor
description: "Orquestra auditorias de performance web, encaminhando sintomas para skills especialistas com base em evidências."
agents:
  - name: claude-code
    supported: true
  - name: cursor
    supported: true
  - name: codex
    supported: true
---

# Performance Advisor

## Papel

Atue como skill orquestradora: entenda a queixa, faça a triagem inicial e encaminhe a investigação para a skill especialista adequada. Não substitua profiling real por suposições baseadas apenas no código, nem recomende refatorações antes de estabelecer o problema.

## Checklist inicial de triagem

Antes de sugerir mudanças:

1. Pergunte qual página/rota, dispositivo, navegador e ação estão envolvidos.
2. Esclareça se a lentidão ocorre no carregamento inicial, numa interação, após navegação repetida ou com o tempo.
3. Procure medições disponíveis: Core Web Vitals, traces do navegador, HAR, RUM, perfil de CPU/memória, estatísticas de build e logs relevantes.
4. Separe fatos medidos de hipóteses. Registre ambiente, condições de rede/cache, amostra e limitações.
5. Se não houver evidência suficiente, indique uma captura específica antes de sugerir uma alteração arriscada.

## Encaminhamento por sintoma

| Queixa | Próxima investigação |
| --- | --- |
| "A aplicação demora a abrir" | Comece por `network-profiler` para observar a rota e o caminho crítico. Se a evidência apontar para JavaScript inicial ou módulos carregados sem necessidade, prossiga com `bundling-opportunities` e/ou `lazy-opportunities`. |
| "O bundle está muito grande" | Use `bundling-opportunities` para analisar imports, dependências e estatísticas reais do build; use `lazy-opportunities` quando houver módulos pesados que só são necessários mais tarde. |
| "A interface fica lenta ao clicar" ou "há re-renders excessivos" | Use `react-opportunities`; confirme o custo com React Profiler ou trace de performance quando disponível. |
| "Há requisições demoradas ou em cascata" | Use `network-opportunities` para inspecionar o código e a independência das chamadas; use `network-profiler` para confirmar a waterfall real. |
| "O consumo de memória sobe com o tempo" | Use `memory-leak-diagnostic` para comparar heap snapshots e caminhos de retenção durante um fluxo reproduzível. |

## Anti-patterns

- Prescrever `React.memo`, `useMemo` ou `useCallback` sem demonstrar trabalho evitável.
- Tratar qualquer import de ícones, import nomeado ou ausência de cache como defeito sem inspecionar configuração e resultado.
- Recomendar paralelização de chamadas antes de confirmar que são independentes.
- Apresentar um alerta estático como causa comprovada de um sintoma em runtime.
- Prometer um ganho percentual sem medição comparável antes/depois.

## Boas práticas

- Comece com a menor auditoria que pode responder à pergunta do usuário; amplie o escopo apenas quando a evidência justificar.
- Priorize por impacto para o usuário, confiança, esforço e risco de regressão.
- Para alterações propostas, explique a hipótese, a evidência necessária, os trade-offs e como validar o resultado.
- Compare antes/depois na mesma rota e jornada, usando condições equivalentes.
- Preserve acessibilidade, correção, tratamento de erros e comportamento funcional.

## Exemplo de triagem

Queixa: "A aplicação demora a abrir."

Boa resposta inicial: "Qual rota e dispositivo estão lentos? Vamos capturar um trace de rede com cache frio e identificar o caminho crítico. Se o entry chunk ou um módulo grande estiver bloqueando a renderização, a auditoria de bundle/lazy loading será o próximo passo."

Má resposta: "Converta todos os componentes para `React.lazy()`." Isso não identifica a causa e pode atrasar conteúdo crítico.
