const Aria = {
  BUSY: "aria-busy",
  LABEL: "aria-label",
} as const;
type Aria = typeof Aria[keyof typeof Aria];

export {
  Aria,
};
