

export const index = 1;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/fallbacks/error.svelte.js')).default;
export const imports = ["_app/immutable/nodes/1.4bc14014.js","_app/immutable/chunks/index.83e4fbfd.js","_app/immutable/chunks/singletons.b4abbb11.js","_app/immutable/chunks/index.30bb006b.js"];
export const stylesheets = [];
export const fonts = [];
