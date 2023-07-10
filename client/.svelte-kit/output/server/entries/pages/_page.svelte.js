import { c as create_ssr_component, v as validate_component } from "../../chunks/index.js";
import { I as Icon, a as Input, B as Button } from "../../chunks/Icon.js";
import "clsx";
const Shuffle = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  const iconNode = [
    [
      "path",
      {
        "d": "M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.7-1.1 2-1.7 3.3-1.7H22"
      }
    ],
    ["path", { "d": "m18 2 4 4-4 4" }],
    ["path", { "d": "M2 6h1.9c1.5 0 2.9.9 3.6 2.2" }],
    [
      "path",
      {
        "d": "M22 18h-5.9c-1.3 0-2.6-.7-3.3-1.8l-.5-.8"
      }
    ],
    ["path", { "d": "m18 14 4 4-4 4" }]
  ];
  return `${validate_component(Icon, "Icon").$$render($$result, Object.assign({}, { name: "shuffle" }, $$props, { iconNode }), {}, {
    default: () => {
      return `${slots.default ? slots.default({}) : ``}`;
    }
  })}`;
});
const Shuffle$1 = Shuffle;
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let roomID = "";
  let $$settled;
  let $$rendered;
  do {
    $$settled = true;
    roomID = roomID.replaceAll(" ", "-");
    $$rendered = `<div class="w-full max-w-md sm:max-w-lg mx-auto space-y-5 mt-[8rem] text-center"><h1 class="text-4xl sm:text-6xl font-bold leading-[1.15] sm:leading-[1.15] tracking-tight">A <span class="bg-gradient-to-r from-orange-400 to-rose-400 bg-clip-text text-transparent">New Era
		</span>
		of<br> File Sharing
	</h1>
	<p class="text-muted-foreground sm:text-lg">DropNow is an open-source, peer-to-peer file transfer service; no intermediate server touches
		your data, ever.
	</p>
	<div class="space-y-3 pt-3"><div class="flex justify-center gap-2 mx-auto w-full">${validate_component(Input, "Input").$$render(
      $$result,
      {
        class: "max-w-[12rem] backdrop-blur-[1px] text-ellipsis",
        placeholder: "Room ID",
        value: roomID
      },
      {
        value: ($$value) => {
          roomID = $$value;
          $$settled = false;
        }
      },
      {}
    )}
			${validate_component(Button, "Button").$$render($$result, { disabled: !roomID }, {}, {
      default: () => {
        return `Join`;
      }
    })}
			${validate_component(Button, "Button").$$render(
      $$result,
      {
        variant: "outline",
        class: "backdrop-blur-[1px]"
      },
      {},
      {
        default: () => {
          return `${validate_component(Shuffle$1, "Shuffle").$$render($$result, { class: "w-4", strokeWidth: 1.75 }, {}, {})}`;
        }
      }
    )}</div>
		<p class="text-muted-foreground text-sm">Enter an ID to join/create a room.</p></div></div>`;
  } while (!$$settled);
  return $$rendered;
});
export {
  Page as default
};
