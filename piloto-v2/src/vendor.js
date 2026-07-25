// src/vendor.js
// Único lugar del proyecto que importa Preact/htm desde el CDN.
// Si algún día cambiamos de CDN o de versión, se edita aquí y ya.
import { h, render } from "https://esm.sh/preact@10.23.1";
import { useState, useEffect, useMemo, useRef } from "https://esm.sh/preact@10.23.1/hooks";
import htm from "https://esm.sh/htm@3.1.1";

export const html = htm.bind(h);
export { render, useState, useEffect, useMemo, useRef };
