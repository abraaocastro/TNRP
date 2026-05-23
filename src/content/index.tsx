import { createRoot } from "react-dom/client";
import { App } from "./App";
import contentCss from "../styles/content.css?inline";

const ROOT_ID = "tnrp-root";

/**
 * Content script — monta React IMEDIATAMENTE.
 *
 * Antes: montava/desmontava o React tree conforme estado ativo/inativo,
 * o que criava race conditions (mensagens chegavam antes do listener existir).
 *
 * Agora: React é montado uma vez e gerencia sua própria visibilidade.
 * O listener de mensagens está sempre ativo dentro do App.
 */
function init() {
  // Guard contra re-execução (hot reload, re-inject)
  if (document.getElementById(ROOT_ID)) return;

  const container = document.createElement("div");
  container.id = ROOT_ID;
  container.style.cssText =
    "position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:2147483647;pointer-events:none;overflow:visible;";
  document.body.appendChild(container);

  const shadow = container.attachShadow({ mode: "open" });

  const sheet = new CSSStyleSheet();
  sheet.replaceSync(contentCss);
  shadow.adoptedStyleSheets = [sheet];

  const appRoot = document.createElement("div");
  appRoot.id = "tnrp-app";
  shadow.appendChild(appRoot);

  createRoot(appRoot).render(<App />);
}

init();
