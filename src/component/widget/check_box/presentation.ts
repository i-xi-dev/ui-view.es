import { Aria } from "../../../aria";

const TODO = "widget";

namespace Presentation {
  export const ClassName = {
    CONTROL: "c1",
    CONTROL_BOX: "c1-box",
    CONTROL_BOX_SURFACE: "c1-x-surface",
    CONTROL_BOX_HIGHLIGHT: "c1-x-highlight",
    CONTROL_MARK: "c1-mark",
    CONTROL_MARK_CANVAS: "c1-x-canvas",
    CONTROL_MARK_CANVAS_IMAGE: "c1-x-x-image",
    CONTROL_MARK_CANVAS_IMAGE_LINE: "c1-x-x-x-line",
    OUTPUT: "o1",
  } as const;

  export const Parameters = {
    Control: {
      MARGIN_INLINE: 5,
    },
  } as const;

  export const TEMPLATE = `
    <div class="${ ClassName.CONTROL }">
      <div class="${ ClassName.CONTROL_BOX }">
        <div class="${ TODO }-glow"></div>
        <div class="${ ClassName.CONTROL_BOX_SURFACE }"></div>
        <div class="${ ClassName.CONTROL_BOX_HIGHLIGHT }"></div>
      </div>

      <div class="${ ClassName.CONTROL_MARK }">
        <div class="${ TODO }-effects"></div>
        <div class="${ ClassName.CONTROL_MARK_CANVAS }"></div>
      </div>
    </div>

    <div class="${ ClassName.OUTPUT }"></div>
  `;

  export const STYLE = `
    @property --internal-space {
      syntax: "<length>";
    }

    @property --internal-switching-time {
      syntax: "<time>";
    }

    @property --internal-size {
      syntax: "<length>";
    }

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
      --internal-size: calc(calc(var(--${ TODO }-size) * 0.75) - 4px);
      align-items: center;
      block-size: 100%;
      column-gap: 0;
      display: flex;
      flex-flow: row nowrap;
    }

    :host(*[data-value-label-visible="true"]) *.internal {
      column-gap: 4px;
    }

    :host(*[data-value-label-position="before"]) *.internal {
      flex-flow: row-reverse nowrap;
    }

    *.${ ClassName.CONTROL } {
      block-size: var(--internal-size);
      inline-size: var(--internal-size);
      margin-inline: var(--internal-space);
      position: relative;
    }

    *.${ ClassName.CONTROL_BOX } {
      block-size: inherit;
      position: relative;
    }

    *.${ ClassName.CONTROL_BOX_SURFACE },
    *.${ ClassName.CONTROL_BOX_HIGHLIGHT } {
      border-radius: var(--${ TODO }-corner-radius);
      inset: 0;
      position: absolute;
    }

    *.${ ClassName.CONTROL_BOX_SURFACE } {
      background-color: var(--${ TODO }-main-bg-color);
      border: var(--${ TODO }-border-width) solid var(--${ TODO }-main-fg-color);
      transition: background-color var(--internal-switching-time), border-width var(--internal-switching-time);
    }

    :host(*[${ Aria.CHECKED }="true"]) *.${ ClassName.CONTROL_BOX_SURFACE },
    :host(*[${ Aria.CHECKED }="mixed"]) *.${ ClassName.CONTROL_BOX_SURFACE } {
      background-color: var(--${ TODO }-accent-color);
      border-width: 0;
    }

    *.${ ClassName.CONTROL_BOX_HIGHLIGHT } {
      border: var(--${ TODO }-border-width) solid #0000;
      box-shadow: 0 0 0 0 #0000;
      transition: border-color 300ms, box-shadow 300ms;
    }

    :host(*:not(*[${ Aria.BUSY }="true"]):not(*[${ Aria.DISABLED }="true"]):not(*[${ Aria.READONLY }="true"])) *.${ TODO }-event-target:hover + *.internal *.${ ClassName.CONTROL_BOX_HIGHLIGHT } {
      border-color: var(--${ TODO }-accent-color);
      box-shadow: 0 0 0 var(--${ TODO }-border-width) var(--${ TODO }-accent-color);
    }

    *.widget-effects {
      margin: -2px;
    }

    *.${ ClassName.CONTROL_MARK },
    *.${ ClassName.CONTROL_MARK_CANVAS } {
      inset: 0;
      position: absolute;
    }

    *.${ ClassName.CONTROL_MARK_CANVAS } {
      transition: transform 300ms;
    }

    :host(*:not(*[${ Aria.BUSY }="true"]):not(*[${ Aria.DISABLED }="true"]):not(*[${ Aria.READONLY }="true"])) *.${ TODO }-event-target:hover + *.internal *.${ ClassName.CONTROL_MARK_CANVAS } {
      transform: scale(1.25);
    }

    @keyframes mark--checked {
      0% {
        clip-path: polygon(0 50%, 50% 100%, 0 100%);
      }
      100% {
        clip-path: polygon(0 -100%, 200% 100%, 0 100%);
      }
    }

    @keyframes mark--indeterminate {
      0% {
        clip-path: polygon(40% 0, 60% 0, 60% 100%, 40% 100%);
      }
      100% {
        clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
      }
    }

    *.${ ClassName.CONTROL_MARK_CANVAS_IMAGE } {
      block-size: calc(100% - 4px);
      inline-size: calc(100% - 4px);
      inset: 2px;
      overflow: visible;
      position: absolute;
    }

    :host(*[${ Aria.CHECKED }="true"]) *.${ ClassName.CONTROL_MARK_CANVAS_IMAGE } {
      animation: mark--checked 300ms both;
    }

    :host(*[${ Aria.CHECKED }="mixed"]) *.${ ClassName.CONTROL_MARK_CANVAS_IMAGE } {
      animation: mark--indeterminate 300ms both;
    }

    *.${ ClassName.CONTROL_MARK_CANVAS_IMAGE_LINE } {
      fill: none;
      stroke: var(--${ TODO }-main-bg-color);
      stroke-width: 2px;
      /*
      stroke-width: 3px;
      vector-effect: non-scaling-stroke;
      */
    }

    :host(*[${ Aria.CHECKED }="true"]) *.${ ClassName.CONTROL_MARK_CANVAS_IMAGE_LINE } {
      stroke-linecap: square;
    }

    :host(*[${ Aria.CHECKED }="mixed"]) *.${ ClassName.CONTROL_MARK_CANVAS_IMAGE_LINE } {
      stroke-linecap: round;
    }

    @keyframes ripple--value-change {
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
      animation: ripple--value-change 600ms both;
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
