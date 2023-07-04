<script>
	import '../app.postcss';
	import { Background } from '$components/ui/background';
</script>

<main class="relative flex min-h-screen flex-col p-8 antialiased">
	<slot />
</main>
<Background />
