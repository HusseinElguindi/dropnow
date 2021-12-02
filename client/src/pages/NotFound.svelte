<script lang="ts">
    import page from 'page';
    const goBack = () => page.redirect('/');
</script>

<main on:click={goBack}>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" class="feather feather-arrow-left"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
    <h1>404</h1>
</main>

<style>
    main {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;

        color: var(--font-primary);
        cursor: pointer;
    }
    main > h1 {
        color: var(--font-primary);
    }
    main > svg {
        height: 1.5rem;
        stroke-width: 1.5px;
        margin-right: 5px;
        transition: color 150ms ease-in-out;
    }
    main:hover {
        color: var(--focused);
    }
</style>
