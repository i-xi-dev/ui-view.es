const Aria = {
  BUSY: "aria-busy",
  CHECKED: "aria-checked",
  HIDDEN: "aria-hidden",
  LABEL: "aria-label",
  MULTILINE: "aria-multiline",
  READONLY: "aria-readonly",
} as const;
type Aria = typeof Aria[keyof typeof Aria];

const Role = {
  CHECKBOX: "checkbox",
  SLIDER: "slider",
  SWITCH: "switch",
  TEXTBOX: "textbox",
} as const;
type Role = typeof Role[keyof typeof Role];

export {
  Aria,
  Role,
};
