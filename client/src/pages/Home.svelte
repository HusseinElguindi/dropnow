<script lang="ts">
    import page from 'page';
    import ButtonInput from "../components/ButtonInput/ButtonInput.svelte";

    let roomID: string;

    const joinRoom = () => page.redirect(`/room/${roomID}`);
</script>

<svelte:head>
    <title>DropNow</title>
</svelte:head>

<div>
    <h1>DropNow</h1>
    <ButtonInput placeholder="Room ID" bind:value={roomID} on:submit={joinRoom} />
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
