import type { PageLoad } from './$types';

export const ssr = false; 

export const load = (({ params }) => {
    return { slug: params.slug }
}) satisfies PageLoad;

