# TNRP - Tasks do Projeto

> **The New Radinho de Pilha** — Extensão Chrome para Watch Parties
> Target: MVP para Copa do Mundo 2026

---

## Fase 0: Setup do Projeto

- [x] **T0.1** — Inicializar projeto com Vite + React 18 + TypeScript
- [x] **T0.2** — Configurar CRXJS Vite Plugin com Manifest V3
- [x] **T0.3** — Configurar Tailwind CSS
- [x] **T0.4** — Configurar ESLint + Prettier
- [x] **T0.5** — Estruturar pastas do projeto (`src/background`, `src/content`, `src/components`, `src/hooks`, `src/utils`)
- [x] **T0.6** — Criar `manifest.json` base com permissões necessárias (activeTab, storage, scripting)

---

## Fase 1: Background Service Worker

- [x] **T1.1** — Criar Service Worker base (`background.ts`)
- [x] **T1.2** — Gerenciar estado global (ativo/inativo por aba) via `chrome.storage.session`
- [x] **T1.3** — Registrar listener de atalhos de teclado (`chrome.commands`)
- [x] **T1.4** — Implementar comunicação Service Worker ↔ Content Script via `chrome.runtime.onMessage`

---

## Fase 2: Content Script + Shadow DOM

- [x] **T2.1** — Criar Content Script que injeta uma `<div>` raiz no `<body>` da página host
- [x] **T2.2** — Montar Shadow DOM dentro da div raiz para encapsulamento de CSS
- [x] **T2.3** — Injetar Tailwind CSS compilado dentro do Shadow DOM
- [x] **T2.4** — Montar app React dentro do Shadow DOM (`createRoot`)
- [x] **T2.5** — Validar que o CSS do TNRP não afeta o site host e vice-versa

---

## Fase 3: Overlay Flutuante (Player Embed)

- [x] **T3.1** — Integrar `react-rnd` para componente draggable + resizable
- [x] **T3.2** — Criar componente `<FloatingPlayer>` com container estilizado (borda, sombra, header de arraste)
- [x] **T3.3** — Implementar embed de YouTube via IFrame API (`youtube.com/embed/...`)
- [x] **T3.4** — Implementar embed de Twitch via Twitch Embed API (`player.twitch.tv`)
- [x] **T3.5** — Parser de URL: detectar automaticamente se o link é YouTube ou Twitch e renderizar o embed correto
- [x] **T3.6** — Garantir que o overlay fica acima de todos os elementos do site host (`z-index` alto + posição fixed)
- [x] **T3.7** — Botão de fechar (X) para remover o overlay

---

## Fase 4: Controle de Áudio Independente

- [x] **T4.1** — Criar componente `<AudioControls>` com botão mute/unmute
- [x] **T4.2** — Implementar slider de volume (range input estilizado)
- [x] **T4.3** — Controlar volume via IFrame API do YouTube (`player.setVolume()`)
- [x] **T4.4** — Controlar volume via Twitch Embed API (`player.setVolume()`)
- [x] **T4.5** — Persistir preferência de volume no `chrome.storage.local`

---

## Fase 5: Multi-Radinho (até 3 embeds)

- [x] **T5.1** — Refatorar estado para suportar lista de players (array de até 3)
- [x] **T5.2** — Criar UI para "Adicionar Radinho" (botão + input de URL)
- [x] **T5.3** — Cada player com controles independentes (volume, mute, fechar)
- [x] **T5.4** — Posicionamento inteligente: novos players não sobrepõem os existentes
- [x] **T5.5** — Persistir layout (posição + tamanho) de cada player no storage

---

## Fase 6: Popup da Extensão

- [x] **T6.1** — Criar popup simples com input de URL + botão "Ligar Radinho"
- [x] **T6.2** — Validação de URL (aceitar apenas YouTube e Twitch)
- [x] **T6.3** — Mostrar lista de radinhos ativos na aba atual com opção de remover
- [x] **T6.4** — Toggle on/off geral do TNRP na aba

---

## Fase 7: Atalhos de Teclado

- [x] **T7.1** — `Shift + Espaço`: Pause/Play da transmissão original (injetar evento no player do site host)
- [x] **T7.2** — Atalho para toggle de visibilidade do overlay (esconder/mostrar sem fechar)
- [x] **T7.3** — Atalho para mute rápido de todos os radinhos
- [x] **T7.4** — Documentar atalhos no popup da extensão

---

## Fase 8: Polimento + UX

- [x] **T8.1** — Animações de entrada/saída do overlay (fade, slide)
- [x] **T8.2** — Tooltip com instrução no primeiro uso (onboarding)
- [x] **T8.3** — Ícone da extensão (16x16, 48x48, 128x128)
- [x] **T8.4** — Responsividade: ajustar tamanho mínimo/máximo do player ao viewport
- [x] **T8.5** — Tratar edge cases: navegação de página, fullscreen do site host, resize da janela

---

## Fase 9: Testes + Build

- [x] **T9.1** — Testes unitários dos hooks e utils (Vitest)
- [x] **T9.2** — Teste E2E básico: abrir extensão → colar link → overlay aparece
- [x] **T9.3** — Build de produção (`vite build`) e gerar `.zip` para Chrome Web Store
- [ ] **T9.4** — Testar em sites reais: Globoplay, ge.globo, FIFA+, Max
