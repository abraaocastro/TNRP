import type { Message, TabState } from "../types/messages";

const STATE_PREFIX = "tab_state_";

function stateKey(tabId: number): string {
  return `${STATE_PREFIX}${tabId}`;
}

async function getTabState(tabId: number): Promise<TabState> {
  const key = stateKey(tabId);
  const result = await chrome.storage.session.get(key);
  return (result[key] as TabState) ?? { active: false };
}

async function setTabState(tabId: number, state: TabState): Promise<void> {
  await chrome.storage.session.set({ [stateKey(tabId)]: state });
}

async function getActiveTabId(): Promise<number | undefined> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab?.id;
}

/**
 * Envia mensagem para content script com auto-recovery.
 *
 * Após reload da extensão, abas já abertas perdem o content script.
 * Quando isso acontece, sendMessage falha com "Receiving end does not exist".
 *
 * A solução é re-injetar o content script via chrome.scripting.executeScript
 * usando o caminho do manifest, e então tentar enviar a mensagem de novo.
 */
async function safeSend(tabId: number, message: Message): Promise<void> {
  try {
    await chrome.tabs.sendMessage(tabId, message);
    return;
  } catch {
    // content script não existe nessa aba — tentar injetar
  }

  try {
    const manifest = chrome.runtime.getManifest();
    const files = manifest.content_scripts?.[0]?.js;
    if (!files || files.length === 0) return;

    await chrome.scripting.executeScript({
      target: { tabId },
      files,
    });

    // Aguardar o script inicializar
    await new Promise((r) => setTimeout(r, 250));
    await chrome.tabs.sendMessage(tabId, message);
  } catch {
    // Página não suporta content scripts (chrome://, store, etc.)
    // ou outra falha — desistir silenciosamente
  }
}

async function toggleTab(tabId: number): Promise<boolean> {
  const state = await getTabState(tabId);
  const newState: TabState = { active: !state.active };
  await setTabState(tabId, newState);

  await safeSend(tabId, {
    type: "SET_STATE",
    active: newState.active,
  } satisfies Message);

  return newState.active;
}

// --- Atalhos de teclado ---
chrome.commands.onCommand.addListener(async (command) => {
  if (command !== "toggle-overlay") return;
  const tabId = await getActiveTabId();
  if (!tabId) return;
  await toggleTab(tabId);
});

// --- Mensagens ---
chrome.runtime.onMessage.addListener((message: Message, sender, sendResponse) => {
  // Se veio de content script, usa sender.tab.id; senão (popup), busca aba ativa
  const resolveTabId = sender.tab?.id
    ? Promise.resolve(sender.tab.id)
    : getActiveTabId();

  if (message.type === "GET_STATE") {
    resolveTabId.then(async (tabId) => {
      if (!tabId) return sendResponse({ active: false });
      const state = await getTabState(tabId);
      sendResponse(state);
    });
    return true; // async sendResponse
  }

  if (message.type === "TOGGLE_OVERLAY") {
    resolveTabId.then(async (tabId) => {
      if (!tabId) return sendResponse({ active: false });
      const active = await toggleTab(tabId);
      sendResponse({ active });
    });
    return true; // async sendResponse
  }

  if (message.type === "SET_STATE") {
    resolveTabId.then(async (tabId) => {
      if (!tabId) return;
      await setTabState(tabId, { active: message.active });
      // Se veio do popup, encaminhar pro content script
      if (!sender.tab) {
        await safeSend(tabId, message);
      }
    });
    return false;
  }

  // ADD_PLAYER / REMOVE_PLAYER — encaminhar direto para content script.
  // O App do content script auto-ativa ao receber ADD_PLAYER, então
  // não precisa mais enviar SET_STATE antes + esperar 100ms.
  if (message.type === "ADD_PLAYER" || message.type === "REMOVE_PLAYER") {
    resolveTabId.then(async (tabId) => {
      if (!tabId) return;
      // Garantir que o estado está ativo (para o popup refletir corretamente)
      if (message.type === "ADD_PLAYER") {
        await setTabState(tabId, { active: true });
      }
      await safeSend(tabId, message);
    });
    return false;
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  chrome.storage.session.remove(stateKey(tabId));
});

chrome.runtime.onInstalled.addListener(() => {
  console.log("TNRP instalado");
});

export {};
