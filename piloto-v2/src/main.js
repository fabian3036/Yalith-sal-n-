// src/main.js
import { render, html } from "./vendor.js";
import { App } from "./App.js";

render(html`<${App} />`, document.getElementById("root"));
