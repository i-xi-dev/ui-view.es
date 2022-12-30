namespace Aria {
  export const Role = {
    SWITCH: "switch",
  } as const;

  export type Role = typeof Role[keyof typeof Role];

  export const State = {
    CHECKED: "aria-checked",
    DISABLED: "aria-disabled",
  } as const;

  export type State = typeof State[keyof typeof State];

  export type Attr = State;
}
export { Aria };
