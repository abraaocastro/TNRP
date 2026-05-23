# TNRP — Checklist de Teste E2E Manual

## Setup
1. `npm run build`
2. Abrir `chrome://extensions` → Modo desenvolvedor ON
3. "Carregar sem compactação" → selecionar pasta `dist/`

## Fluxo básico
- [ ] Clicar no ícone da extensão → popup abre com UI correta
- [ ] Colar link YouTube (ex: `https://youtube.com/watch?v=dQw4w9WgXcQ`) → clicar "Ligar"
- [ ] Overlay do player aparece flutuando na página
- [ ] Arrastar o player → move corretamente
- [ ] Redimensionar o player → resize funciona
- [ ] Slider de volume → áudio muda
- [ ] Botão mute → silencia
- [ ] Botão ✕ → player fecha

## Multi-radinho
- [ ] Adicionar 2º radinho (Twitch) → aparece em posição diferente
- [ ] Adicionar 3º → aparece sem sobrepor
- [ ] Tentar 4º → bloqueado (mensagem "máx 3")

## Atalhos
- [ ] `Shift+Space` → pausa/retoma vídeo do site host
- [ ] `Alt+H` → esconde/mostra radinhos
- [ ] `Alt+M` → muta/desmuta todos
- [ ] `Alt+R` → liga/desliga TNRP

## Persistência
- [ ] Fechar e reabrir aba → radinhos restauram posição/volume
- [ ] Navegar para outra página → radinhos persistem

## Edge cases
- [ ] Fullscreen do site host → radinhos continuam visíveis
- [ ] Redimensionar janela → radinhos não saem da tela

## Sites reais (T9.4)
- [ ] ge.globo.com (transmissão de jogo)
- [ ] globoplay.globo.com
- [ ] max.com
- [ ] fifa.com/fifaplus
