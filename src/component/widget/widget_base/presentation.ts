import { Aria } from "../../../aria";

const _BaseSize = {
  LARGE: "large",
  MEDIUM: "medium",
  SMALL: "small",
  X_LARGE: "x-large",
  X_SMALL: "x-small",
} as const;

const _BaseDimension = {
  [_BaseSize.X_SMALL]: 28,
  [_BaseSize.SMALL]: 32,
  [_BaseSize.MEDIUM]: 36,
  [_BaseSize.LARGE]: 40,
  [_BaseSize.X_LARGE]: 44,
} as const;

namespace BasePresentation {
  export const ClassName = {
    TARGET: "t0", // ui event target
    CONTROL_EFFECTS: "c0-effects",
    CONTROL_EFFECT_RIPPLE: "c0-effect--ripple",
    CONTROL_GLOW: "c0-glow",
  } as const;

  export const BaseSize = _BaseSize;
  export type BaseSize = typeof BaseSize[keyof typeof BaseSize];

  export const BaseDimension = _BaseDimension;

  export const Parameters = {
    Target: {
      PADDING_INLINE: 12,
    },
  } as const;

  export const STYLE = `
    :host {
      display: block;
    }

    :host(*[${ Aria.HIDDEN }="true"]) {
      display: none;
    }

    *.internal0-container {
      --internal0-accent-color: #136ed2;
      --internal0-border-width: 1px;
      --internal0-corner-radius: 5px;
      --internal0-focusring-color: orange;
      --internal0-glow-blur-radius: 6px;
      --internal0-glow-extent: 3px;
      --internal0-main-bg-color: #fff;
      --internal0-main-bg-color-06: #fffa;
      --internal0-main-fg-color: #666;
      --internal0-ripple-opacity: 0.6;
      --internal0-size: ${ _BaseDimension[_BaseSize.MEDIUM] }px;
      align-items: center;
      block-size: var(--internal0-size);
      display: flex;
      flex-flow: row nowrap;
      font-size: 16px;
      inline-size: 100%;
      justify-content: stretch;
      min-block-size: var(--internal0-size);
      min-inline-size: var(--internal0-size);
      position: relative;
    }

    :host(*[data-size="x-small"]) *.internal0-container {
      --internal0-corner-radius: 3px;
      --internal0-size: ${ _BaseDimension[_BaseSize.X_SMALL] }px;
      font-size: 12px;
    }

    :host(*[data-size="small"]) *.internal0-container {
      --internal0-corner-radius: 4px;
      --internal0-size: ${ _BaseDimension[_BaseSize.SMALL] }px;
      font-size: 14px;
    }

    :host(*[data-size="large"]) *.internal0-container {
      --internal0-corner-radius: 6px;
      --internal0-size: ${ _BaseDimension[_BaseSize.LARGE] }px;
      font-size: 18px;
    }

    :host(*[data-size="x-large"]) *.internal0-container {
      --internal0-corner-radius: 7px;
      --internal0-size: ${ _BaseDimension[_BaseSize.X_LARGE] }px;
      font-size: 20px;
    }

    :host(*[${ Aria.BUSY }="true"]) *.internal0-container,
    :host(*[${ Aria.DISABLED }="true"]) *.internal0-container {
      filter: contrast(0.5) grayscale(1);
      opacity: 0.6;
    }

    *.${ ClassName.TARGET } {
      cursor: pointer;
      display: flex;
      flex-flow: row nowrap;
      inset: 0;
      position: absolute;
      padding-inline: ${ Parameters.Target.PADDING_INLINE }px;
    }

    *.${ ClassName.TARGET }[contenteditable] {
      /* textareaを使うなら不要
      cursor: text;
      white-space: pre;
      */
    }

    *.${ ClassName.TARGET }:focus {
      box-shadow: 0 0 0 2px var(--internal0-focusring-color);
      outline: none;
    }

    :host(*[${ Aria.BUSY }="true"]) *.internal0-container *.${ ClassName.TARGET },
    :host(*[${ Aria.BUSY }="true"][${ Aria.DISABLED }="true"]) *.internal0-container *.${ ClassName.TARGET },
    :host(*[${ Aria.BUSY }="true"][${ Aria.READONLY }="true"]) *.internal0-container *.${ ClassName.TARGET },
    :host(*[${ Aria.BUSY }="true"][${ Aria.DISABLED }="true"][${ Aria.READONLY }="true"]) *.internal0-container *.${ ClassName.TARGET } {
      cursor: wait;
    }

    :host(*[${ Aria.DISABLED }="true"]) *.internal0-container *.${ ClassName.TARGET },
    :host(*[${ Aria.DISABLED }="true"][${ Aria.READONLY }="true"]) *.internal0-container *.${ ClassName.TARGET } {
      cursor: not-allowed;
    }

    :host(*[${ Aria.READONLY }="true"]) *.internal0-container *.${ ClassName.TARGET } {
      cursor: default;
    }

    *.internal0,
    *.internal0 * {
      pointer-events: none;
    }

    *.${ ClassName.CONTROL_GLOW } {
      background-color: currentcolor;
      border-radius: var(--internal0-corner-radius);
      box-shadow: 0 0 0 0 currentcolor;
      color: var(--internal0-main-bg-color);
      inset: 0;
      opacity: 0;
      position: absolute;
      transition: box-shadow 200ms, opacity 200ms;
    }

    *.${ ClassName.TARGET }:hover + *.internal0 *.${ ClassName.CONTROL_GLOW } {
      box-shadow: 0 0 0 var(--internal0-glow-extent) currentcolor;
      opacity: 1;
    }

    :host(*[${ Aria.BUSY }="true"]) *.${ ClassName.TARGET }:hover + *.internal0 *.${ ClassName.CONTROL_GLOW },
    :host(*[${ Aria.DISABLED }="true"]) *.${ ClassName.TARGET }:hover + *.internal0 *.${ ClassName.CONTROL_GLOW },
    :host(*[${ Aria.READONLY }="true"]) *.${ ClassName.TARGET }:hover + *.internal0 *.${ ClassName.CONTROL_GLOW } {
      box-shadow: 0 0 0 0 currentcolor !important;
      opacity: 0 !important;
    }

    *.${ ClassName.CONTROL_GLOW }::before {
      background-color: currentcolor;
      border-radius: var(--internal0-corner-radius);
      box-shadow: 0 0 0 0 currentcolor;
      color: var(--internal0-accent-color);
      content: "";
      inset: 0;
      opacity: 0;
      position: absolute;
      transition: box-shadow 200ms, opacity 200ms;
    }

    *.${ ClassName.TARGET }:hover + *.internal0 *.${ ClassName.CONTROL_GLOW }::before {
      box-shadow: 0 0 0 var(--internal0-glow-blur-radius) currentcolor;
      opacity: 0.5;
    }

    :host(*[${ Aria.BUSY }="true"]) *.${ ClassName.TARGET }:hover + *.internal0 *.${ ClassName.CONTROL_GLOW }::before,
    :host(*[${ Aria.DISABLED }="true"]) *.${ ClassName.TARGET }:hover + *.internal0 *.${ ClassName.CONTROL_GLOW }::before,
    :host(*[${ Aria.READONLY }="true"]) *.${ ClassName.TARGET }:hover + *.internal0 *.${ ClassName.CONTROL_GLOW }::before {
      box-shadow: 0 0 0 0 currentcolor !important;
      opacity: 0 !important;
    }

    *.${ ClassName.CONTROL_EFFECTS } {
      inset: 0;
      position: absolute;
    }

    *.${ ClassName.CONTROL_EFFECT_RIPPLE } {
      background-color: var(--internal0-accent-color);
      border-radius: 50%;
      position: absolute;
    }
  `;
}

export default BasePresentation;
