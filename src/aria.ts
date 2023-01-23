const Aria = {
  BUSY: "aria-busy",
  CHECKED: "aria-checked",
  LABEL: "aria-label",
  MULTILINE: "aria-multiline",
} as const;
type Aria = typeof Aria[keyof typeof Aria];

const Role = {
  SLIDER: "slider",
  TEXTBOX: "textbox",
} as const;
type Role = typeof Role[keyof typeof Role];

export {
  Aria,
  Role,
};
