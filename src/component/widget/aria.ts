namespace Aria {
  export const Role = {
    SWITCH: "switch",
  } as const;

  export type Role = typeof Role[keyof typeof Role];

  export const State = {
    CHECKED: "aria-checked",
    DISABLED: "aria-disabled",
    HIDDEN: "aria-hidden",
  } as const;

  export type State = typeof State[keyof typeof State];

  export const Property = {
    LABEL: "aria-label",
  } as const;

  export type Property = typeof Property[keyof typeof Property];

  export type Attr = State | Property;
}
export { Aria };
