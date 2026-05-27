# Manual — Synora Core Center (v0)

> Objetivo: te dar um “como usar” rápido e confiável do Core Center, do jeito que ele está hoje.

## 1) O que é o Core Center
O **Synora Core Center** é um painel web (single-page) para **visualizar, navegar e operar** o estado do “core” (eventos, correlações, fluxos e sinais operacionais) de forma rápida.

Ele tem 3 ideias centrais:
- **Canvas/Overview**: visão geral do estado (cards/nós/painéis)
- **Drill**: entrar em um item específico (ex.: uma correlação `CORR_...`) para ver detalhes
- **UI State**: lembrar onde você estava (modo, seleção e drill) mesmo após recarregar

## 2) Fluxo básico de uso (o caminho feliz)
1. Abra o Core Center.
2. Ligue a UI (se estiver desligada): `ui:on`
3. Olhe os painéis (pressão/runtime/status).
4. Clique em um item relevante (card/nó/linha) para **selecionar**.
5. Use **Drill** para entrar no contexto daquele item (ex.: `CORR_96C1`).
6. Recarregue com **F5** para validar persistência (ele deve voltar ao mesmo contexto).

## 3) Conceitos (sem mistério)
### 3.1 UI (on/off)
- **`ui:on`**: liga o overlay/painéis/controles
- **`ui:off`**: limpa overlay (fica mais “limpo” para apresentar)

> Dica: para operação e debug, mantenha `ui:on`.

### 3.2 Seleção
- “Seleção” é o **item atual** que você clicou.
- A seleção muda alguns painéis laterais (ex.: detalhes do item selecionado).

### 3.3 Drill
- “Drill” é **entrar um nível mais fundo** num item.
- Exemplo: `drill: CORR_96C1` significa que o Core Center está no contexto daquela correlação.

**Como saber se você está em drill?**
- Normalmente aparece no rodapé como `drill: ...`.
- Também pode existir um card/painel “DRILL” à direita com o id.

### 3.4 Persistência (F5 vs Fn+F5)
- **F5**: recarrega a página e **tenta restaurar** o estado (modo/drill/seleção) via `localStorage` (quando habilitado).
- **Fn+F5 / Ctrl+Shift+R**: “hard refresh” — pode limpar cache e **às vezes parece que voltou ao início**.

> Para testar a persistência do UIState, use **F5** (não hard refresh).

## 4) Autenticação (se aparecer o gate)
Dependendo do build, pode existir um **login gate** (modal) com TOTP.
- Se travar no gate, a primeira checagem pode falhar “a frio” e depois recuperar.
- Se aparecer erro em `/api/auth/status`, aguarde 2–5s e tente novamente.

## 5) Botões e áreas da interface (guia “manual de usuário”)

### 5.1 Barra lateral (menu)
É o menu vertical com os botões “OBS / WF / SET / G / AI / INC / REC”.

- **OBS (Observability)**: visão geral e telemetria (estado do sistema, sinais e saúde).
- **WF (Workflows)**: foco em pipelines/fluxos em execução (filas, transições, retries, bloqueios).
- **SET (Settlements)**: contexto de liquidação/mediadora (eventos de settlement e estados).
- **G (Guardian)**: decisões/validações do Guardián (gates, required_actions, riscos).
- **AI (Agents)**: visão de agentes/automação (quando habilitado no build).
- **INC (Incidents)**: incidentes abertos, trilhas e ações.
- **REC (Record)**: modo “low motion” para gravar/mostrar (reduz animações/ruído visual).

No rodapé da barra lateral existe o bloco **Core Center** com:
- **runtime:** label do runtime (ex.: `simulated`)
- **LINK** (se aparecer): conectar fonte externa (ex.: Supabase) quando habilitado
- **EMIT** (se aparecer): emitir evento de teste
- **PDF**: abre o **Manual (PDF)**

### 5.2 Barra superior (status + contexto)
É a faixa no topo que mostra “LIVE”, o **drill atual** e “chips” de eventos.

- **LIVE**: indica que o painel está em modo “ao vivo” (escutando/atualizando).
- **drill: CORR_...**: mostra o contexto atual (qual correlação você está investigando).
  - O “X” ao lado normalmente limpa/fecha o drill.
- **Chips INFO (ex.: GUARDIAN → AUDIO → guardian.validate ...)**: breadcrumbs do evento/engine atual.
- **pause**: pausa o stream/atualização (bom pra inspecionar sem “mexer”).
- **persist:on**: grava o UIState (modo/drill/seleção) no navegador.
- **ui:on**: mostra os painéis/overlay de operação.
- **clean**: limpa overlay/seleções visuais (útil antes de apresentar).

### 5.3 Painel do Workflow (WF) — botões de ação
No modo **WF**, o painel (geralmente à esquerda/centro) mostra resumo e ações.

Botões típicos:
- **Open Guardian decision**: abre a decisão do Guardián ligada ao fluxo.
- **View required_actions**: lista ações exigidas para destravar.
- **Open incident**: abre/cria incidente relacionado.
- **View workflow trace**: rastro do workflow (passo-a-passo).
- **View settlement timeline**: linha do tempo do settlement.
- **Inspect correlation flow**: fluxo completo da correlação (`CORR_...`).
- **View retries**: tentativas/reprocessamentos.
- **Open orchestration path**: caminho de orquestração (encadeamento de engines).

> Nota: alguns botões aparecem/desaparecem conforme o build e se há eventos carregados.

## 6) Painéis operacionais (o que olhar)
Os nomes podem variar conforme o build, mas em geral:
- **Runtime/Pressure**: sinais de carga/pressão do runtime
- **Status**: estado de auth, conectividade e respostas da API
- **Timeline/EventEngine**: eventos em ordem (append-only)

## 7) Troubleshooting rápido
- “Voltou pro início depois do refresh”: teste com **F5**; hard refresh pode dar essa sensação.
- “Não aparece mudança nova”: faça **Ctrl+Shift+R** ou aba anônima (cache).
- “Drill sumiu”: veja rodapé (`drill: ...`) e painel “DRILL”. Se não estiver, re-faça o drill.
- “Auth falhou”: verifique o painel de status e tente novamente após alguns segundos.

## 8) Glossário
- **Core**: núcleo operacional do Synora
- **CORR_...**: id de correlação (um “caso”/agrupamento)
- **Drill**: entrar no contexto de um id específico
- **UIState**: estado da interface (modo/drill/seleção)

## 9) Próximas melhorias (se você quiser)
- Botão explícito “**Recentrar no Drill**” (zoom/center no alvo após reload)
- “**Help / ?**” dentro da UI com este manual embutido
- “Reset UIState” (limpar persistência com 1 clique)
