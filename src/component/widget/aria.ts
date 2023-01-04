namespace Aria {
  export const Role = {
    CHECKBOX: "checkbox",
    SWITCH: "switch",
    TEXTBOX: "textbox",
  } as const;

  export type Role = typeof Role[keyof typeof Role];

  export const State = {
    BUSY: "aria-busy",
    CHECKED: "aria-checked",
    DISABLED: "aria-disabled",
    HIDDEN: "aria-hidden",
  } as const;

  export type State = typeof State[keyof typeof State];

  export const Property = {
    LABEL: "aria-label",
    MULTILINE: "aria-multiline",
    READONLY: "aria-readonly",
  } as const;

  export type Property = typeof Property[keyof typeof Property];

  export type Attr = State | Property;
}
export { Aria };
