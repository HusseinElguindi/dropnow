import { c as create_ssr_component, v as validate_component, d as compute_rest_props, f as spread, h as escape_attribute_value, i as escape_object, j as is_void, e as escape } from "../../../../chunks/index.js";
import { cva } from "class-variance-authority";
import "clsx";
import { I as Icon, c as cn, a as Input, B as Button } from "../../../../chunks/Icon.js";
const Copy = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  const iconNode = [
    [
      "rect",
      {
        "width": "14",
        "height": "14",
        "x": "8",
        "y": "8",
        "rx": "2",
        "ry": "2"
      }
    ],
    [
      "path",
      {
        "d": "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"
      }
    ]
  ];
  return `${validate_component(Icon, "Icon").$$render($$result, Object.assign({}, { name: "copy" }, $$props, { iconNode }), {}, {
    default: () => {
      return `${slots.default ? slots.default({}) : ``}`;
    }
  })}`;
});
const Copy$1 = Copy;
const Badge = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["href", "variant", "class"]);
  const badgeVariants = cva("inline-flex items-center border rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", {
    variants: {
      variant: {
        default: "bg-primary hover:bg-primary/80 border-transparent text-primary-foreground",
        secondary: "bg-secondary hover:bg-secondary/80 border-transparent text-secondary-foreground",
        destructive: "bg-destructive hover:bg-destructive/80 border-transparent text-destructive-foreground",
        outline: "text-foreground"
      }
    },
    defaultVariants: { variant: "default" }
  });
  let { href = void 0 } = $$props;
  let { variant = "default" } = $$props;
  let { class: className = void 0 } = $$props;
  if ($$props.href === void 0 && $$bindings.href && href !== void 0)
    $$bindings.href(href);
  if ($$props.variant === void 0 && $$bindings.variant && variant !== void 0)
    $$bindings.variant(variant);
  if ($$props.class === void 0 && $$bindings.class && className !== void 0)
    $$bindings.class(className);
  return `${((tag) => {
    return tag ? `<${href ? "a" : "span"}${spread(
      [
        { href: escape_attribute_value(href) },
        {
          class: escape_attribute_value(cn(badgeVariants({ variant, className })))
        },
        escape_object($$restProps)
      ],
      {}
    )}>${is_void(tag) ? "" : `${slots.default ? slots.default({}) : ``}`}${is_void(tag) ? "" : `</${tag}>`}` : "";
  })(href ? "a" : "span")}`;
});
cva(
  "inline-flex items-center border rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-primary hover:bg-primary/80 border-transparent text-primary-foreground",
        secondary: "bg-secondary hover:bg-secondary/80 border-transparent text-secondary-foreground",
        destructive: "bg-destructive hover:bg-destructive/80 border-transparent text-destructive-foreground",
        outline: "text-foreground"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
const Card = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["class"]);
  let { class: className = void 0 } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className !== void 0)
    $$bindings.class(className);
  return `<div${spread(
    [
      {
        class: escape_attribute_value(cn(
          // "rounded-lg border bg-card text-card-foreground shadow-sm",
          "rounded-lg border text-card-foreground shadow-sm backdrop-blur-[2px]",
          className
        ))
      },
      escape_object($$restProps)
    ],
    {}
  )}>${slots.default ? slots.default({}) : ``}</div>`;
});
const CardContent = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["class"]);
  let { class: className = void 0 } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className !== void 0)
    $$bindings.class(className);
  return `<div${spread(
    [
      {
        class: escape_attribute_value(cn("p-6 pt-0", className))
      },
      escape_object($$restProps)
    ],
    {}
  )}>${slots.default ? slots.default({}) : ``}</div>`;
});
const CardDescription = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["class"]);
  let { class: className = void 0 } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className !== void 0)
    $$bindings.class(className);
  return `<p${spread(
    [
      {
        class: escape_attribute_value(cn("text-sm text-muted-foreground", className))
      },
      escape_object($$restProps)
    ],
    {}
  )}>${slots.default ? slots.default({}) : ``}</p>`;
});
const CardHeader = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["class"]);
  let { class: className = void 0 } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className !== void 0)
    $$bindings.class(className);
  return `<div${spread(
    [
      {
        class: escape_attribute_value(cn("flex flex-col space-y-1.5 p-6", className))
      },
      escape_object($$restProps)
    ],
    {}
  )}>${slots.default ? slots.default({}) : ``}</div>`;
});
const CardTitle = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["class", "tag"]);
  let { class: className = void 0 } = $$props;
  let { tag = "h3" } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className !== void 0)
    $$bindings.class(className);
  if ($$props.tag === void 0 && $$bindings.tag && tag !== void 0)
    $$bindings.tag(tag);
  return `${((tag$1) => {
    return tag$1 ? `<${tag}${spread(
      [
        {
          class: escape_attribute_value(cn("text-lg font-semibold leading-none tracking-tight", className))
        },
        escape_object($$restProps)
      ],
      {}
    )}>${is_void(tag$1) ? "" : `${slots.default ? slots.default({}) : ``}`}${is_void(tag$1) ? "" : `</${tag$1}>`}` : "";
  })(tag)}`;
});
const ConnectionProgressCard = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { scStatus = "closed" } = $$props;
  let { rtcStatus } = $$props;
  let scStatusColor = "";
  let rtcStatusColor = "";
  if ($$props.scStatus === void 0 && $$bindings.scStatus && scStatus !== void 0)
    $$bindings.scStatus(scStatus);
  if ($$props.rtcStatus === void 0 && $$bindings.rtcStatus && rtcStatus !== void 0)
    $$bindings.rtcStatus(rtcStatus);
  {
    switch (scStatus) {
      case "connected":
        scStatusColor = "bg-green-500";
        break;
      case "closed":
        scStatusColor = "bg-red-500";
        break;
    }
  }
  {
    switch (rtcStatus) {
      case "new":
      case "connected":
        rtcStatusColor = "bg-green-500";
        break;
      case "connecting":
        rtcStatusColor = "bg-amber-500";
        break;
      case "disconnected":
      case "failed":
      case "closed":
        rtcStatusColor = "bg-red-500";
        break;
    }
  }
  return `${validate_component(Card, "Card").$$render($$result, {}, {}, {
    default: () => {
      return `${validate_component(CardContent, "CardContent").$$render($$result, { class: "p-6 py-4 text-sm space-y-1" }, {}, {
        default: () => {
          return `<div class="flex items-center gap-1.5 justify-between">Signal Server
			${validate_component(Badge, "Badge").$$render(
            $$result,
            {
              class: cn("pointer-events-none", scStatusColor)
            },
            {},
            {
              default: () => {
                return `${escape(scStatus)}`;
              }
            }
          )}</div>
		<div class="flex items-center gap-1.5 justify-between">Peer Connection
			${validate_component(Badge, "Badge").$$render(
            $$result,
            {
              class: cn("pointer-events-none", rtcStatusColor)
            },
            {},
            {
              default: () => {
                return `${escape(rtcStatus ?? "waiting for peer")}`;
              }
            }
          )}</div>`;
        }
      })}`;
    }
  })}`;
});
const ShareLinkCard = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let displayURL;
  return `${validate_component(Card, "Card").$$render($$result, {}, {}, {
    default: () => {
      return `${validate_component(CardHeader, "CardHeader").$$render($$result, { class: "pb-3" }, {}, {
        default: () => {
          return `${validate_component(CardTitle, "CardTitle").$$render($$result, {}, {}, {
            default: () => {
              return `Share`;
            }
          })}
		${validate_component(CardDescription, "CardDescription").$$render($$result, {}, {}, {
            default: () => {
              return `Share a link to the room`;
            }
          })}`;
        }
      })}
	${validate_component(CardContent, "CardContent").$$render($$result, { class: "flex gap-2" }, {}, {
        default: () => {
          return `${validate_component(Input, "Input").$$render(
            $$result,
            {
              class: "focus-visible:ring-0",
              value: displayURL,
              readonly: true
            },
            {},
            {}
          )}
		${validate_component(Button, "Button").$$render(
            $$result,
            {
              variant: "outline",
              class: "p-3 h-10 w-10"
            },
            {},
            {
              default: () => {
                return `${validate_component(Copy$1, "Copy").$$render($$result, { class: "text-muted-foreground" }, {}, {})}`;
              }
            }
          )}`;
        }
      })}`;
    }
  })}`;
});
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { data } = $$props;
  const { roomID } = data;
  let scStatus;
  let rtcStatus;
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  return `<div class="w-full max-w-md sm:max-w-sm mx-auto space-y-4 mt-[8rem]"><div class="flex gap-3"><h1 class="text-3xl md:text-4xl font-bold leading-tight tracking-tighter">Room</h1>
		${validate_component(Badge, "Badge").$$render(
    $$result,
    {
      variant: "outline",
      class: "text-2xl md:text-3xl backdrop-blur-[1px] whitespace-nowrap overflow-x-auto"
    },
    {},
    {
      default: () => {
        return `${escape(roomID)}`;
      }
    }
  )}</div>

	${validate_component(ConnectionProgressCard, "ConnectionProgressCard").$$render($$result, { scStatus, rtcStatus }, {}, {})}

	${`${validate_component(ShareLinkCard, "ShareLinkCard").$$render($$result, {}, {}, {})}`}</div>`;
});
export {
  Page as default
};
