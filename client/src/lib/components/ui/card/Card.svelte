<script lang="ts">
	import { cn } from '$lib/utils';

	let className: string | undefined | null = undefined;
	export { className as class };
</script>

<div
	class={cn(
		// "rounded-lg border bg-card text-card-foreground shadow-sm",
		'rounded-lg border text-card-foreground shadow-sm backdrop-blur-[2px]',
		className
	)}
	{...$$restProps}
	on:click
	on:focusin
	on:focusout
	on:mouseenter
	on:mouseleave
>
	<slot />
</div>
