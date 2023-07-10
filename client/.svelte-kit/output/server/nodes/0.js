

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const imports = ["_app/immutable/nodes/0.d2e71f1e.js","_app/immutable/chunks/index.83e4fbfd.js"];
export const stylesheets = ["_app/immutable/assets/0.855461a9.css"];
export const fonts = [];
