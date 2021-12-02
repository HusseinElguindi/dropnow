<script lang="ts">
    import page from 'page';
    import ButtonInput from "../components/ButtonInput/ButtonInput.svelte";

    let roomID: string;

    const joinRoom = () => page.redirect(`/room/${roomID}`);
</script>

<svelte:head>
    <title>DropNow</title>
</svelte:head>

<section>
    <h1>DropNow</h1>
    <ButtonInput placeholder="Room ID" bind:value={roomID} on:click={joinRoom}/>
</section>

<style>
    section {
        justify-content: center;
        align-self: center;
        width: fit-content;
        padding: 20px;
    }

    section > h1 {
        font-size: 25px;
        padding-bottom: 10px;
    }
</style>
