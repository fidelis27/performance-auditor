---
name: network-profiler
description: "Orienta profiling de rede em runtime com Chrome DevTools, HAR ou RUM para localizar gargalos e requisições repetidas."
agents:
  - name: claude-code
    supported: true
  - name: cursor
    supported: true
  - name: codex
    supported: true
---

# Network Profiler

## Papel

Oriente o programador a coletar e interpretar evidência real de rede no navegador. Não afirme que capturou ou analisou um trace se ele não foi fornecido ou se a ferramenta não foi executada.

## Captura com Chrome DevTools

1. Abra DevTools > **Network**, selecione a rota e reproduza uma jornada representativa.
2. Registre navegador, build, viewport, estado de cache (frio ou aquecido), throttling de rede/CPU e número de repetições.
3. Inspecione ordem, duração, initiator, prioridade, status, tamanho transferido, redirects e requests bloqueantes.
4. Use **Performance** quando precisar correlacionar requisições com LCP, long tasks, layout ou interações.
5. Compare execuções equivalentes. Separe variabilidade de uma regressão consistente.

## HAR e RUM

- HAR ajuda a compartilhar uma captura reproduzível; antes de compartilhar, remova cookies, cabeçalhos de autorização, tokens em query strings e dados pessoais. Não peça nem reproduza credenciais.
- Em RUM, segmente por rota, dispositivo e release quando disponíveis. Inclua amostra e distribuição; não tire conclusões de um único outlier.
- Registre limitações da captura, incluindo cache, throttling e dados que foram sanitizados.

## Waterfalls e requisições repetidas

- Siga a cadeia crítica e procure dependências serializadas, TTFB alto, redirects e recursos bloqueantes.
- Compare initiators e parâmetros não sensíveis para identificar requests repetidos; diferencie duplicação acidental de revalidação ou polling intencional.
- Relacione volume, tempo e criticidade da resposta à jornada observada.
- Payload grande só é gargalo quando sua transferência/processamento afeta a experiência medida.

## Cache HTTP

- Inspecione `Cache-Control`, `ETag`, `Last-Modified`, status 304 e comportamento de cache do navegador/CDN.
- Ausência de cache não é automaticamente um defeito: dados personalizados, sensíveis ou que mudam frequentemente podem exigir políticas restritivas.
- Recomende cache apenas com regras explícitas de frescor, invalidação e privacidade. Não exponha respostas privadas em caches compartilhados.

## BFF e payload

Considere investigação no Backend-for-Frontend (BFF) somente quando a evidência indicar payload excessivo, chamadas redundantes, latência no servidor ou uma waterfall entre serviços. Verifique se campos desnecessários podem ser omitidos, respostas podem ser agregadas com segurança ou paginação é adequada; não recomende alterar o BFF sem identificar custo e trade-offs.

## Formato do achado

Inclua observação, evidência (rota, request/initiator, tempos e bytes), condições da captura, impacto provável, confiança e próximo experimento. Separe causa confirmada de hipótese e nunca inclua conteúdo sensível da request.
