# TNRP — The New Radinho de Pilha

> Extensão Chrome para Watch Parties.
> O radinho de pilha moderno: sobreponha a narração do seu streamer favorito **em cima** da transmissão oficial.

![status](https://img.shields.io/badge/status-MVP-blue) ![manifest](https://img.shields.io/badge/manifest-v3-green) ![target](https://img.shields.io/badge/target-Copa%202026-yellow)

---

## A ideia

Antigamente, dava pra assistir o jogo na TV com o som no mudo, e ligar o **radinho de pilha** com a narração que você gostava. Hoje, com tudo em streaming, isso ficou complicado: a transmissão oficial está num site (Globoplay, ge.globo, FIFA+, Max), e o seu streamer favorito está em outro (YouTube, Twitch, Kick). Você acaba com **duas abas, dois alt-tabs, e dois áudios bagunçados**.

O **TNRP** resolve isso: ele coloca o player do seu streamer **flutuando por cima da transmissão oficial**, com controle de áudio independente. Você assiste o jogo no Globoplay, e ouve a narração do Casimiro/Cazé/Desimpedidos em um overlay arrastável, redimensionável, com volume separado.

**Target principal**: Copa do Mundo FIFA 2026.

---

## Funcionalidades

- 🎥 **Múltiplos radinhos simultâneos** (até 3) — assista jogos diferentes ao mesmo tempo, ou compare narrações
- 🎯 **3 plataformas suportadas**: YouTube, Twitch, Kick (lives e VODs)
- 🔊 **Áudio independente por radinho** — slider de volume + mute individual
- 🤚 **Arrastar e redimensionar** — posicione cada radinho onde quiser
- 💾 **Layout persistente** — fecha e reabre a aba, os radinhos voltam onde estavam
- ⌨️ **Atalhos de teclado** — pause a transmissão original, esconde tudo de uma vez, muta todos
- 🌐 **Funciona em qualquer site** — Globoplay, ge.globo, FIFA+, Max, YouTube (com ressalva*), Twitch, etc.
- 🎨 **Shadow DOM** — não vaza CSS pra página host, não quebra o site

> *Ressalva YouTube: a Google bloqueia auto-embed (YouTube dentro de YouTube). Se a transmissão oficial estiver no YouTube, use Twitch ou Kick pro radinho.

---

## Atalhos

| Atalho | Ação |
|---|---|
| `Alt + R` | Ligar/desligar TNRP na aba atual |
| `Shift + Espaço` | Pause/Play da transmissão oficial (sem mexer nos radinhos) |
| `Alt + H` | Esconder/mostrar radinhos (sem fechar) |
| `Alt + M` | Mutar/desmutar todos os radinhos de uma vez |

---

## Como usar

1. **Instale a extensão** (ver "Build local" abaixo)
2. Abra a transmissão oficial (ex.: jogo no `globoplay.com`)
3. Clique no ícone do TNRP na barra do Chrome
4. **Ligue o toggle** no popup
5. Cole o link do streamer (YouTube/Twitch/Kick) e clique em **Ligar**
6. Um radinho flutuante aparece. Arraste pelo **ícone de mão 🤚** no canto superior esquerdo, redimensione pelo grip no canto inferior direito
7. Ajuste o volume do radinho no header dele, e mute o áudio do site oficial pra deixar só o radinho tocando

Pra adicionar um segundo radinho, clique no **botão `+`** flutuante no canto inferior direito da página.

---

## Build local

### Pré-requisitos

- Node.js 20+
- npm

### Instalação

```bash
git clone https://github.com/abraaocastro/TNRP.git
cd TNRP
npm install
npm run build
```

O build gera a extensão na pasta `dist/`.

### Carregar no Chrome

1. Abra `chrome://extensions`
2. Ative o **Modo do desenvolvedor** (canto superior direito)
3. Clique em **Carregar sem compactação**
4. Selecione a pasta `dist/`

Pronto. O ícone do TNRP aparece na barra.

### Desenvolvimento

```bash
npm run dev          # vite dev server com HMR
npm run test         # roda os testes (vitest)
npm run test:watch   # testes em watch mode
npm run lint         # eslint
npm run zip          # gera .zip pra distribuição manual
```

---

## Arquitetura

```
┌──────────────────────────────────────────────────────────────┐
│  Página do usuário (globoplay.com, twitch.tv, etc.)          │
│                                                              │
│   ┌──────────────────────────────────────┐                   │
│   │  Content Script (Shadow DOM)         │                   │
│   │  ─────────────────────────────       │                   │
│   │   • Renderiza React encapsulado      │                   │
│   │   • Mostra FloatingPlayer(s)         │                   │
│   │   • Botão "Adicionar Radinho"        │                   │
│   │   • Escuta atalhos de teclado        │                   │
│   └────────────────┬─────────────────────┘                   │
│                    │ chrome.runtime.sendMessage              │
└────────────────────┼─────────────────────────────────────────┘
                     │
                     ▼
        ┌────────────────────────────┐
        │  Background (Service       │       ┌─────────────────┐
        │  Worker)                   │◄──────│  Popup          │
        │  ─────────────────────     │       │  • Toggle on/off│
        │   • Estado por aba         │       │  • Input URL    │
        │   • Roteia mensagens       │       │  • Lista radin. │
        │   • Re-injeta content      │       └─────────────────┘
        │     script se necessário   │
        └────────────────────────────┘
```

### Stack

- **React 18** + **TypeScript** dentro de **Shadow DOM** (encapsulamento total de CSS)
- **Vite 8** + **CRXJS Vite Plugin** pra build de extensão MV3
- **Tailwind CSS v4** (injetado no Shadow DOM via `adoptedStyleSheets`)
- **Vitest** pra testes unitários
- **Pointer Events API** + `setPointerCapture()` pra drag/resize confiável (funciona mesmo com iframes por cima)

### Decisões técnicas relevantes

- **Sem `react-rnd`**: a lib usa `react-draggable` internamente que quebra no Shadow DOM por causa de retargeting de eventos. Drag e resize são implementados do zero com Pointer Events.
- **Shadow DOM + Tailwind**: o CSS do Tailwind é importado com `?inline` e injetado via `CSSStyleSheet` + `adoptedStyleSheets`, garantindo que estilos do site host não vazem pros componentes do TNRP e vice-versa.
- **Auto-reinjeção de content script**: ao recarregar a extensão em `chrome://extensions`, abas já abertas perdem o content script. O background detecta a falha e re-injeta via `chrome.scripting.executeScript` — sem precisar F5 manual.
- **`setPointerCapture`**: necessário pra drag funcionar quando o cursor passa por cima dos iframes durante o movimento. Sem capture, o iframe rouba os eventos e o drag trava.

---

## Estrutura do projeto

```
TNRP/
├── manifest.json              # Manifest V3
├── vite.config.ts
├── src/
│   ├── background/            # Service worker (gerencia estado por aba)
│   ├── content/               # Content script (injeta React no Shadow DOM)
│   ├── popup/                 # Popup da extensão
│   ├── components/
│   │   ├── FloatingPlayer.tsx # Janela flutuante drag/resize
│   │   ├── YouTubeEmbed.tsx   # Embed de YouTube com IFrame API
│   │   ├── TwitchEmbed.tsx    # Embed de Twitch
│   │   ├── KickEmbed.tsx      # Embed de Kick
│   │   ├── AudioControls.tsx  # Slider de volume + mute
│   │   ├── AddRadinho.tsx     # Botão flutuante "+"
│   │   └── OnboardingTooltip.tsx
│   ├── hooks/
│   │   ├── usePlayersStorage.ts    # Persistência em chrome.storage.local
│   │   ├── useKeyboardShortcuts.ts # Atalhos in-page
│   │   └── useViewportGuard.ts     # Clamp em resize + fullscreen
│   ├── utils/
│   │   ├── parseUrl.ts        # Parser YouTube/Twitch/Kick
│   │   ├── positioning.ts     # Posicionamento inteligente de novos players
│   │   └── hostPlayer.ts      # Controla o <video> do site oficial
│   ├── types/
│   ├── styles/
│   └── test/
└── tasks.md                   # Roadmap de implementação
```

---

## Limitações conhecidas

- **YouTube-on-YouTube não funciona**: a Google bloqueia auto-embed. Workaround: use Twitch/Kick pro radinho quando a transmissão estiver no YouTube.
- **Kick** não tem controle de volume programático (a API pública não documenta um método). Mute funciona via toggle do iframe.
- **DRM**: sites com DRM forte (como Globoplay com Widevine) tocam normalmente, mas o `Shift+Espaço` (pause/play) pode não funcionar em todos.

---

## Licença

MIT. Use, modifique, distribua à vontade.

---

**Built with ☕ pra Copa de 2026.** 🇧🇷
