<script lang="ts">
    import ButtonInput from "$lib/components/ButtonInput/ButtonInput.svelte";

    let roomID: string;
</script>

<svelte:head>
    <title>DropNow</title>
</svelte:head>

<div>
    <h1>DropNow</h1>
    <ButtonInput placeholder="Room ID" bind:value={roomID} action="{roomID ? `/room/${roomID}` : ''}" />
</div>

<style>
    div {
        justify-content: center;
        align-self: center;
        width: fit-content;
        padding: 20px;
    }

    div > h1 {
        padding-bottom: 10px;
    }
</style>
