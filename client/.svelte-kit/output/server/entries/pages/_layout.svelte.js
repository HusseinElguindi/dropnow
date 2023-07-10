import { c as create_ssr_component, v as validate_component } from "../../chunks/index.js";
const app = "";
const Background_svelte_svelte_type_style_lang = "";
const css = {
  code: "#bg.svelte-11evj3b{background-image:radial-gradient(hsl(var(--muted-foreground) / 0.2) 1px, transparent 0);background-size:16px 16px}",
  map: null
};
const Background = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css);
  return `<div id="bg" class="left-0 top-0 fixed h-full w-full z-[-1] svelte-11evj3b"></div>`;
});
const Layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<main class="relative flex min-h-screen flex-col p-8 antialiased">${slots.default ? slots.default({}) : ``}</main>
${validate_component(Background, "Background").$$render($$result, {}, {}, {})}`;
});
export {
  Layout as default
};
