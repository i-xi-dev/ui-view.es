import { Aria } from "../../../aria";

const TODO = "widget";

//XXX trackをthumbのまわりだけ切り抜きたい → ltr固定ならclip-pathかmaskで抜けるが、rtlや縦書きも対応するのは現行のcssでは無理

namespace Presentation {
  export const ClassName = {
    CONTROL: "c1",
    CONTROL_TRACK: "c1-track",
    CONTROL_TRACK_SURFACE: "c1-r-surface",
    CONTROL_TRACK_HIGHLIGHT: "c1-r-highlight",
    CONTROL_THUMB: "c1-thumb",
    CONTROL_THUMB_SURFACE: "c1-t-surface",
    CONTROL_THUMB_HIGHLIGHT: "c1-t-highlight",
    OUTPUT: "o1",
  };

  export const Parameters = {
    Control: {
      MARGIN_INLINE: 4,
    },
  } as const;

  export const TEMPLATE = `
    <div class="${ ClassName.CONTROL }">
      <div class="${ ClassName.CONTROL_TRACK }">
        <div class="${ ClassName.CONTROL_TRACK_SURFACE }"></div>
        <div class="${ ClassName.CONTROL_TRACK_HIGHLIGHT }"></div>
      </div>

      <div class="${ ClassName.CONTROL_THUMB }">
        <div class="${ TODO }-glow"></div>
        <div class="${ TODO }-effects"></div>
        <div class="${ ClassName.CONTROL_THUMB_SURFACE }"></div>
        <div class="${ ClassName.CONTROL_THUMB_HIGHLIGHT }"></div>
      </div>
    </div>

    <div class="${ ClassName.OUTPUT }"></div>
  `;

  export const STYLE = `
    :host {
      flex: none;
      inline-size: max-content;
      user-select: none;/* これがないと、なぜかChromeで短時間に連続clickした後、pointerdownして数pixel pointermoveすると勝手にlostpointercaptureが起きる。Firefoxは無くても問題ない。Safariは未確認 */
    }

    *.internal-container *.${ TODO }-event-target {
      border-radius: 4px;
      margin-inline: -8px;
    }

    *.internal {
      --internal-space: ${ Parameters.Control.MARGIN_INLINE }px;
      --internal-switching-time: 150ms;
      --internal-inline-size: calc(var(--${ TODO }-size) * 1.5);
      --internal-block-size: calc(var(--${ TODO }-size) * 0.75);
      align-items: center;
      block-size: 100%;
      column-gap: 0;
      display: flex;
      flex-flow: row nowrap;
    }

    :host(*[data-value-label-visible="true"]) *.internal {
      column-gap: 6px;
    }

    :host(*[data-value-label-position="before"]) *.internal {
      flex-flow: row-reverse nowrap;
    }

    *.${ ClassName.CONTROL } {
      block-size: var(--internal-block-size);
      inline-size: var(--internal-inline-size);
      margin-inline: var(--internal-space);
      position: relative;
    }

    *.${ ClassName.CONTROL_TRACK } {
      block-size: inherit;
      border-radius: calc(var(--${ TODO }-size) * 0.375);
      /*overflow: hidden;*/
      position: relative;
      transition: clip-path var(--internal-switching-time);
    }

    *.${ ClassName.CONTROL_TRACK_SURFACE },
    *.${ ClassName.CONTROL_TRACK_HIGHLIGHT } {
      border-radius: inherit;
      inset: 0;
      position: absolute;
    }

    *.${ ClassName.CONTROL_TRACK_SURFACE } {
      background-color: var(--${ TODO }-main-bg-color);
      border: var(--${ TODO }-border-width) solid var(--${ TODO }-main-fg-color);
      transition: background-color var(--internal-switching-time), border-color var(--internal-switching-time);
    }

    :host(*[${ Aria.CHECKED }="true"]) *.${ ClassName.CONTROL_TRACK_SURFACE } {
      background-color: var(--${ TODO }-accent-color);
      border-color: var(--${ TODO }-accent-color);
    }

    *.${ ClassName.CONTROL_TRACK_HIGHLIGHT } {
      border: var(--${ TODO }-border-width) solid #0000;
      box-shadow: 0 0 0 0 #0000;
      transition: border-color 300ms, box-shadow 300ms;
    }

    :host(*:not(*[${ Aria.BUSY }="true"]):not(*[${ Aria.DISABLED }="true"]):not(*[${ Aria.READONLY }="true"])) *.${ TODO }-event-target:hover + *.internal *.${ ClassName.CONTROL_TRACK_HIGHLIGHT } {
      border-color: var(--${ TODO }-accent-color);
      box-shadow: 0 0 0 var(--${ TODO }-border-width) var(--${ TODO }-accent-color);
    }

    *.${ ClassName.CONTROL_THUMB } {
      block-size: var(--internal-block-size);
      inline-size: var(--internal-block-size);
      inset-block-start: 0;
      inset-inline-start: 0;
      position: absolute;
      transition: inset-inline-start var(--internal-switching-time);
    }

    :host(*[${ Aria.CHECKED }="true"]) *.${ ClassName.CONTROL_THUMB } {
      inset-inline-start: calc(var(--internal-inline-size) - var(--internal-block-size));
    }

    *.${ TODO }-glow,
    *.${ TODO }-effects,
    *.${ ClassName.CONTROL_THUMB_SURFACE },
    *.${ ClassName.CONTROL_THUMB_HIGHLIGHT } {
      border-radius: 50%;
      margin: 3px;
      transition: margin 300ms;
    }

    :host(*:not(*[${ Aria.BUSY }="true"]):not(*[${ Aria.DISABLED }="true"]):not(*[${ Aria.READONLY }="true"])) *.${ TODO }-event-target:hover + *.internal *:is(
      *.${ TODO }-glow,
      *.${ TODO }-effects,
      *.${ ClassName.CONTROL_THUMB_SURFACE },
      *.${ ClassName.CONTROL_THUMB_HIGHLIGHT }
    ) {
      margin: 0;
    }

    *.${ TODO }-glow::before {
      border-radius: inherit;
    }

    *.${ ClassName.CONTROL_THUMB_SURFACE },
    *.${ ClassName.CONTROL_THUMB_HIGHLIGHT } {
      inset: 0;
      position: absolute;
    }

    *.${ ClassName.CONTROL_THUMB_SURFACE } {
      background-color: var(--${ TODO }-main-bg-color);
      border: var(--${ TODO }-border-width) solid var(--${ TODO }-main-fg-color);
      transition: border-width var(--internal-switching-time), margin 300ms;
    }

    :host(*[${ Aria.CHECKED }="true"]) *.${ ClassName.CONTROL_THUMB_SURFACE } {
      border-width: 0;
    }

    *.${ ClassName.CONTROL_THUMB_HIGHLIGHT } {
      border: 0 solid var(--${ TODO }-accent-color);
      box-shadow: 0 0 0 0 #0000;
      transition: border-width 300ms, box-shadow 300ms, margin 300ms;
    }

    :host(*:not(*[${ Aria.BUSY }="true"]):not(*[${ Aria.DISABLED }="true"]):not(*[${ Aria.READONLY }="true"])) *.${ TODO }-event-target:hover + *.internal *.${ ClassName.CONTROL_THUMB_HIGHLIGHT } {
      border-width: var(--${ TODO }-border-width);
      box-shadow: 0 0 0 var(--${ TODO }-border-width) var(--${ TODO }-accent-color);
    }

    @keyframes internal-ripple {
      0% {
        opacity: var(--${ TODO }-ripple-opacity);
        transform: scale(1);
      }
      100% {
        opacity: 0;
        transform: scale(2.4);
      }
    }

    *.${ TODO }-ripple {
      animation: internal-ripple 600ms both;
      inset: 0;
      mix-blend-mode: color-burn; /*XXX darkのとき変える */
    }

    *.${ ClassName.OUTPUT } {
      display: none;
      user-select: none;
      white-space: pre;
    }

    :host(*[data-value-label-visible="true"]) *.${ ClassName.OUTPUT } {
      display: block;
    }

    *.${ ClassName.OUTPUT }:not(*:empty) {
      text-align: start;
    }

    :host(*[data-value-label-position="before"]) *.${ ClassName.OUTPUT }:not(*:empty) {
      text-align: end;
    }
  `;
}

export default Presentation;
