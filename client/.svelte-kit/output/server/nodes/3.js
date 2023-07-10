import * as universal from '../entries/pages/room/_id_/_page.ts.js';

export const index = 3;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/room/_id_/_page.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/room/[id]/+page.ts";
export const imports = ["_app/immutable/nodes/3.2ec05e3e.js","_app/immutable/chunks/index.83e4fbfd.js","_app/immutable/chunks/Icon.4f2b1975.js","_app/immutable/chunks/index.30bb006b.js"];
export const stylesheets = [];
export const fonts = [];
