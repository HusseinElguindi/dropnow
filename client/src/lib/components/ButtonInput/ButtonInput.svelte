<script lang="ts">
    export let hidden: boolean = false;
    export let placeholder: string = "";
    export let value: string = "";
    export let action: string = "";
</script>

<form action={action} style="{hidden ? 'display:none;' : ''}">
    <input bind:value={value} placeholder={placeholder}/>
    <button disabled={action == ''}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12 5 19 12 12 19"/>
        </svg>
    </button>
</form>

<style>
    form {
        --border-radius: 7px;
        --border-width: 2px;

        display: flex;
        flex-direction: row;
        align-items: center;
        border: var(--border-width) solid var(--background-secondary);
        border-radius: var(--border-radius);
        background: transparent;
        width: fit-content;
        height: 2.9rem;

        transition: all 200ms ease-in-out;
    }

    input {
        border: none;
        background: transparent;
        color: var(--font-primary);
        font-size: 1rem;

        flex: 2; /* take up as much space as possible */
        padding: 0 10px;
        width: 9.5rem;
        height: 100%;

        transition: inherit;
    }

    input:focus {
        outline: none;
    }

    form:focus-within {
        --background-secondary: var(--focused);
    }

    button {
        cursor: pointer;
        border: none;
        background: transparent;
        height: 25px;
        border-radius: 50px;
        margin-right: 5px;
    }

    svg {
        color: var(--focused);
        height: 100%;
        transition: filter 150ms ease-in-out;
    }

    svg:hover {
        filter: brightness(150%);

        /* Retina Display fuzzy image bug fix. */
        /* https://stackoverflow.com/questions/13347947/css-filter-on-retina-display-fuzzy-images */
        transform: translateZ(0);
        -webkit-transform: translateZ(0);
    }
</style>
