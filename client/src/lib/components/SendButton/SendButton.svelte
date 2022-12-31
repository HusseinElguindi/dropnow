<script lang="ts">
    export let hidden: boolean = false;
</script>

<button on:click style="{hidden ? 'display:none;' : ''}">
    <p><slot></slot></p>
    <div class="arrow">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
    </div>
</button>

<style>
    button {
        --border-radius: 7px;
        --border-width: 1.5px;
        background: transparent;

        width: fit-content;
        height: 2.65em;
        padding: 0 0.3em 0 0.55em;

        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;

        cursor: pointer;

        border: var(--border-width) solid var(--background-secondary);
        border-radius: var(--border-radius);
        outline: none;

        color: var(--font-primary);
        font-size: 1rem;

        transition: border-color 200ms ease-in-out;
    }
    button:hover {
        border: var(--border-width) solid var(--focused);
    }

    .arrow {
        margin-left: 0.25em;
        display: flex;
        justify-content: center;
        align-items: center;

        width: 20px;
        border-radius: 50px;
    }
    .arrow > svg {
        width: 100%;
        height: 100%;
    }
</style>
