<script lang="ts">
    export let hidden: boolean = false;
    export let placeholder: string = "";
    export let value: string = "";

    let focused: boolean = false;
    const setFocus = (state: boolean) => { focused = state };

</script>

<main class="wrapper" class:focused style="{hidden ? 'display:none;' : ''}">
    <input bind:value={value} placeholder={placeholder} spellcheck="false" on:focus={()=>{setFocus(true)}} on:blur={()=>setFocus(false)}/>
    <div class="btn-wrapper">
        <div class="input-btn" on:click>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="feather feather-arrow-right"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </div>
    </div>
</main>

<style>
    .wrapper {
        --border-radius: 7px;
        --border-width: 2px;

        width: fit-content;
        display: flex;
        flex-direction: row;

        transition: all 200ms ease-in-out;
    }
    .wrapper.focused {
        --background-secondary: var(--focused);
    }

    input {
        width: 140px;
        height: 43px;
        margin: 0;
        padding: 0 10px;

        border-radius: var(--border-radius) 0px 0px var(--border-radius);
        border: var(--border-width) solid var(--background-secondary);
        border-right: none;
        outline: none;

        background: transparent;
        color: var(--font-primary);

        transition: inherit;
    }

    .btn-wrapper {
        height: 43px;
        padding-right: 5px;

        display: flex;
        justify-content: center;
        align-items: center;

        border: var(--border-width) solid var(--background-secondary);
        border-radius: 0px var(--border-radius) var(--border-radius) 0px;
        border-left: none;
        outline: none;

        transition: inherit;
    }
    .input-btn {
        cursor: pointer;

        display: flex;
        justify-content: center;
        align-items: center;

        width: 25px;
        border-radius: 50px;
    }
    .input-btn svg {
        width: 100%;
        height: 100%;
        color: var(--focused);
        transition: filter 150ms ease-in-out;
    }
    .input-btn:hover svg {
        filter: brightness(150%);
    }
</style>
