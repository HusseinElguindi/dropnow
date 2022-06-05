<script>
    import page from 'page';

    import Home from './pages/Home.svelte';

    import Room from './pages/Room.svelte';
    import NotFound from './pages/NotFound.svelte';

    let current;
    let params;
    page('/', () => current = Home);
    page('/room/:id', (ctx, next) => {
        params = ctx.params;
        next();
    }, () => current = Room);
    page('*', () => current = NotFound);

    page.start();
</script>

<svelte:head> 
    <title>DropNow</title>
</svelte:head>

<svelte:component this={current} params={params} />

<style>
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap');

    :root {
        font-size: 15px;
        --background-primary: #1d1e22;
        --background-secondary: #404040;
        --focused: #707070;
        --font-primary: white;
    }

    :global(*), :global(body) {
        font-family: 'Poppins', sans-serif;
        box-sizing: border-box;
        margin: 0;
        padding: 0;
    }

    :global(body) {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;

        background: var(--background-primary);
        color: var(--font-primary);

        width: 100%;
        height: 100vh;
    }
</style>
