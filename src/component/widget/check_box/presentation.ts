import BasePresentation from "../widget_base/presentation";

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
    OUTPUT_TEXT: "o1-text",
  } as const;

  export const Parameters = {
    Control: {
      MARGIN_INLINE: 5,
    },
  } as const;

  export const TEMPLATE = `
    <div class="${ ClassName.CONTROL } ${ BasePresentation.ClassName.CONTROL_READONLY_INDICATOR }">
      <div class="${ ClassName.CONTROL_BOX }">
        <div class="${ BasePresentation.ClassName.CONTROL_GLOW }"></div>
        <div class="${ ClassName.CONTROL_BOX_SURFACE }"></div>
        <div class="${ ClassName.CONTROL_BOX_HIGHLIGHT }"></div>
      </div>

      <div class="${ ClassName.CONTROL_MARK }">
        <div class="${ BasePresentation.ClassName.CONTROL_EFFECTS }"></div>
        <div class="${ ClassName.CONTROL_MARK_CANVAS }"></div>
      </div>
    </div>

    <ol class="${ ClassName.OUTPUT }">
      <li class="${ ClassName.OUTPUT_TEXT }"></li>
      <li class="${ ClassName.OUTPUT_TEXT }"></li>
      <li class="${ ClassName.OUTPUT_TEXT }"></li>
    </ol>
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
      user-select: none;/* これがないと、なぜかChromeで短時間に連続clickした後、pointerdownして数pixel pointermoveすると勝手にlostpointercaptureが起きる。Firefoxは無くても問題ない。Safariは未確認 rootの最上位ではダメ？ */
    }

    *.${ BasePresentation.ClassName.TARGET } {
      border-radius: 4px;
      margin-inline: -8px;
    }

    *.${ BasePresentation.ClassName.MAIN } {
      --internal-space: ${ Parameters.Control.MARGIN_INLINE }px;
      --internal-switching-time: 150ms;
      --internal-size: calc(calc(var(--internal0-size) * 0.75) - 4px);
      align-items: center;
      block-size: 100%;
      column-gap: 0;
      display: flex;
      flex-flow: row nowrap;
    }

    :host(*[data-value-label="start"]) *.${ BasePresentation.ClassName.MAIN },
    :host(*[data-value-label="end"]) *.${ BasePresentation.ClassName.MAIN } {
      column-gap: 4px;
    }

    :host(*[data-value-label="start"]) *.${ BasePresentation.ClassName.MAIN } {
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
      border-radius: var(--internal0-corner-radius);
      inset: 0;
      position: absolute;
    }

    *.${ ClassName.CONTROL_BOX_SURFACE } {
      background-color: var(--internal0-main-bg-color);
      border: var(--internal0-border-width) solid var(--internal0-main-fg-color);
      transition: background-color var(--internal-switching-time), border-width var(--internal-switching-time);
    }

    :host(*[checked]) *.${ ClassName.CONTROL_BOX_SURFACE },
    :host(*[indeterminate]) *.${ ClassName.CONTROL_BOX_SURFACE } {
      background-color: var(--internal0-accent-color);
      border-width: 0;
    }

    *.${ ClassName.CONTROL_BOX_HIGHLIGHT } {
      border: var(--internal0-border-width) solid #0000;
      box-shadow: 0 0 0 0 #0000;
      transition: border-color 300ms, box-shadow 300ms;
    }

    @supports selector(*:--disabled) { /*XXX :not()つなげずになんとかできない？ 属性吐くしかない？ */
      :host(*:not(*[aria-busy="true"]):not(*[disabled]):not(*:--disabled):not(*[readonly])) *.${ BasePresentation.ClassName.TARGET }:hover + *.${ BasePresentation.ClassName.MAIN } *.${ ClassName.CONTROL_BOX_HIGHLIGHT } {
        border-color: var(--internal0-accent-color);
        box-shadow: 0 0 0 var(--internal0-border-width) var(--internal0-accent-color);
      }
    }
    @supports not selector(*:--disabled) {
      :host(*:not(*[aria-busy="true"]):not(*[disabled]):not(*[readonly])) *.${ BasePresentation.ClassName.TARGET }:hover + *.${ BasePresentation.ClassName.MAIN } *.${ ClassName.CONTROL_BOX_HIGHLIGHT } {
        border-color: var(--internal0-accent-color);
        box-shadow: 0 0 0 var(--internal0-border-width) var(--internal0-accent-color);
      }
    }

    *.${ BasePresentation.ClassName.CONTROL_EFFECTS } {
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

    @supports selector(*:--disabled) {
      :host(*:not(*[aria-busy="true"]):not(*[disabled]):not(*:--disabled):not(*[readonly])) *.${ BasePresentation.ClassName.TARGET }:hover + *.${ BasePresentation.ClassName.MAIN } *.${ ClassName.CONTROL_MARK_CANVAS } {
        transform: scale(1.25);
      }
    }
    @supports not selector(*:--disabled) {
      :host(*:not(*[aria-busy="true"]):not(*[disabled]):not(*[readonly])) *.${ BasePresentation.ClassName.TARGET }:hover + *.${ BasePresentation.ClassName.MAIN } *.${ ClassName.CONTROL_MARK_CANVAS } {
        transform: scale(1.25);
      }
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

    :host(*[checked]) *.${ ClassName.CONTROL_MARK_CANVAS_IMAGE } {
      animation: mark--checked 300ms both;
    }

    :host(*[indeterminate]) *.${ ClassName.CONTROL_MARK_CANVAS_IMAGE } {
      animation: mark--indeterminate 300ms both;
    }

    *.${ ClassName.CONTROL_MARK_CANVAS_IMAGE_LINE } {
      fill: none;
      stroke: var(--internal0-main-bg-color);
      stroke-width: 2px;
      /*
      stroke-width: 3px;
      vector-effect: non-scaling-stroke;
      */
    }

    :host(*[checked]) *.${ ClassName.CONTROL_MARK_CANVAS_IMAGE_LINE } {
      stroke-linecap: square;
    }

    :host(*[indeterminate]) *.${ ClassName.CONTROL_MARK_CANVAS_IMAGE_LINE } {
      stroke-linecap: round;
    }

    @keyframes ripple--value-change {
      0% {
        opacity: var(--internal0-ripple-opacity);
        transform: scale(1);
      }
      100% {
        opacity: 0;
        transform: scale(2.4);
      }
    }

    *.${ BasePresentation.ClassName.CONTROL_EFFECT_RIPPLE } {
      animation: ripple--value-change 600ms both;
      inset: 0;
      mix-blend-mode: color-burn; /*XXX darkのとき変える */
    }

    *.${ ClassName.OUTPUT } {
      align-items: center;
      display: none;
      grid-template-columns: auto;
      grid-template-rows: auto;
      justify-content: start;
      margin: 0;
      padding: 0;
    }

    :host(*[data-value-label="start"]) *.${ ClassName.OUTPUT },
    :host(*[data-value-label="end"]) *.${ ClassName.OUTPUT } {
      display: grid;
    }

    *.${ ClassName.OUTPUT_TEXT } {
      display: block;
      grid-column: 1;
      grid-row: 1;
      text-align: start;
      visibility: hidden;
      white-space: pre;
    }

    :host(*[data-value-label="start"]) *.${ ClassName.OUTPUT_TEXT } {
      text-align: end;
    }

    :host(*:not(*[checked]):not(*[indeterminate])) *.${ ClassName.OUTPUT_TEXT }:first-child {
      visibility: visible;
    }

    :host(*[checked]:not(*[indeterminate])) *.${ ClassName.OUTPUT_TEXT }:nth-child(2) {
      visibility: visible;
    }

    :host(*[indeterminate]) *.${ ClassName.OUTPUT_TEXT }:nth-child(3) {
      visibility: visible;
    }

  `;
}

export default Presentation;
