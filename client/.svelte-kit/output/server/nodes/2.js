

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/2.2b90456d.js","_app/immutable/chunks/index.83e4fbfd.js","_app/immutable/chunks/Icon.4f2b1975.js","_app/immutable/chunks/singletons.b4abbb11.js","_app/immutable/chunks/index.30bb006b.js"];
export const stylesheets = [];
export const fonts = [];
