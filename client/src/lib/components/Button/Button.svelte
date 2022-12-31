<script lang="ts">
    export let hidden: boolean = false;
</script>

<main class="wrapper" on:click style="{hidden ? 'display:none;' : ''}">
    <p><slot></slot></p>
</main>

<style>
    .wrapper {
        --border-radius: 7px;
        --border-width: 1.5px;

        width: fit-content;
        height: 2.65em;
        padding: 0 0.65em;

        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;

        cursor: pointer;

        border: var(--border-width) solid var(--background-secondary);
        border-radius: var(--border-radius);
        outline: none;

        transition: all 200ms ease-in-out;
    }
    .wrapper:hover {
        --background-secondary: var(--focused);
    }

</style>
