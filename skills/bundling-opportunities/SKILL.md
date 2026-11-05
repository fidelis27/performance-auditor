---
name: bundling-opportunities
description: "Audita imports, dependências e estatísticas de build para identificar oportunidades comprováveis de reduzir o bundle."
agents:
  - name: claude-code
    supported: true
  - name: cursor
    supported: true
  - name: codex
    supported: true
---

# Bundling Opportunities

## Papel

Faça análise principalmente estática de imports, dependências e configuração do empacotador. Confirme qualquer alegação de impacto com estatísticas do build de produção; o formato do import, por si só, não prova que código desnecessário chegou ao bundle.

## O que investigar

- Imports de namespace como `import * as utils from 'biblioteca-grande'` e quais exports são realmente usados.
- Dependências duplicadas, versões conflitantes, dependências transitivas volumosas e módulos com efeitos colaterais.
- Bibliotecas que não oferecem exports compatíveis com tree-shaking ou cuja configuração atual impede a eliminação de código.
- Imports de ícones. Um import nomeado como `import { Icon } from 'lucide-react'` é o padrão normal da biblioteca e, por si só, não significa que todos os ícones serão incluídos. Verifique a versão, o empacotador, os efeitos colaterais e o chunk produzido antes de reportar um problema.
- A diferença entre chunks iniciais e assíncronos, módulos maiores e rotas que incluem código não utilizado.

## Anti-pattern

```typescript
import * as lodash from 'lodash';

const resultado = lodash.cloneDeep(objeto);
```

O import de namespace pode dificultar a eliminação de exports em algumas combinações de biblioteca e build. Não conclua que ele aumentou o bundle sem medir.

## Boa prática possível

```typescript
import cloneDeep from 'lodash-es/cloneDeep';

const resultado = cloneDeep(objeto);
```

Considere essa forma somente depois de verificar compatibilidade com o ambiente, versão/export map da biblioteca e suporte do empacotador. Um import específico de `lodash` também pode ser adequado conforme a configuração; `lodash-es` não é automaticamente a melhor opção em todos os projetos.

## Medir o bundle

- Em projetos Webpack, use o `webpack-bundle-analyzer` com o build de produção.
- Em projetos Vite, inspecione as estatísticas de build/manifest e use um visualizador de bundle compatível, se necessário.
- Compare chunks iniciais e sob demanda, tamanhos comprimidos quando disponíveis, módulos duplicados e dependências transitivas.
- Mantenha iguais a configuração e o modo de build ao comparar antes/depois.

## Boas práticas

- Prefira imports específicos quando a biblioteca e o empacotador os suportam e as estatísticas mostram benefício.
- Avalie duplicação de dependências pela árvore resolvida do package manager e confirme presença no bundle.
- Prefira divisão por rota ou funcionalidade usada sob demanda quando isso reduz trabalho inicial sem criar waterfalls.
- Remova ou substitua dependências apenas após conferir usos, compatibilidade, manutenção e comportamento.
- Relate o comando/ferramenta, build, chunk, tamanho e incerteza. Não confunda tamanho do pacote npm com bytes enviados ao navegador.
