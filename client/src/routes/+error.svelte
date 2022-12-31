<a href="/">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" class="feather feather-arrow-left"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
    <h1>404</h1>
</a>

<style>
    a {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;

        color: var(--font-primary);
        text-decoration: none; /* no underline */
        cursor: pointer;
    }
    a > h1 {
        color: var(--font-primary);
    }
    a > svg {
        height: 1.5rem;
        stroke-width: 1.5px;
        margin-right: 5px;
        transition: color 150ms ease-in-out;
    }
    a:hover {
        color: var(--focused);
    }
</style>
