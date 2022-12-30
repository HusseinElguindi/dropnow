<script lang="ts">
    export let hidden: boolean = false;
    export let placeholder: string = "";
    export let value: string = "";
</script>

<form on:submit|preventDefault style="{hidden ? 'display:none;' : ''}">
    <!-- svelte-ignore a11y-autofocus -->
    <input bind:value={value} placeholder={placeholder} autofocus />
    <button>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="feather feather-arrow-right">
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

        transition: all 200ms ease-in-out;
    }

    input {
        flex: 2;
        border: none;
        background: transparent;
        color: var(--font-primary);
        padding: 10px;
        width: 150px;
        font-size: 16px;

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

        /* Safari blur bug fix */
        transform: translateZ(0);
        -webkit-transform: translateZ(0);
    }
</style>
