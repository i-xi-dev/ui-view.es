
import { Ns } from "./ns";
import { Aria } from "./aria";
import { Widget } from "./widget";

const _BOX_OFFSET_INLINE_START = 5;

class CheckBox extends Widget {
  static override readonly CLASS_NAME: string = "checkbox";
  static readonly #TEMPLATE = `
    <div class="${ CheckBox.CLASS_NAME }-control">
      <div class="${ CheckBox.CLASS_NAME }-box">
        <div class="${ Widget.CLASS_NAME }-glow"></div>
        <div class="${ CheckBox.CLASS_NAME }-box-surface"></div>
      </div>
      <div class="${ CheckBox.CLASS_NAME }-mark">
        <div class="${ Widget.CLASS_NAME }-effects"></div>
        <div class="${ CheckBox.CLASS_NAME }-mark-canvas"></div>
      </div>
    </div>
    <div class="${ CheckBox.CLASS_NAME }-value-label"></div>
  `;
  static readonly #STYLE = `
    :host {
      flex: none;
      inline-size: max-content;
    }
    *.${ CheckBox.CLASS_NAME }-container *.${ Widget.CLASS_NAME }-event-target {
      border-radius: 4px;
      margin-inline: -8px;
    }

    *.${ CheckBox.CLASS_NAME } {
      --${ CheckBox.CLASS_NAME }-space: ${ _BOX_OFFSET_INLINE_START }px;
      --${ CheckBox.CLASS_NAME }-switching-time: 150ms;
      --${ CheckBox.CLASS_NAME }-size: calc(calc(var(--${ Widget.CLASS_NAME }-size) * 0.75) - 4px);
      align-items: center;
      block-size: 100%;
      column-gap: 0;
      display: flex;
      flex-flow: row nowrap;
    }
    :host(*[data-value-label-visible="true"]) *.${ CheckBox.CLASS_NAME } {
      column-gap: 4px;
    }
    :host(*[data-value-label-position="before"]) *.${ CheckBox.CLASS_NAME } {
      flex-flow: row-reverse nowrap;
    }

    *.${ CheckBox.CLASS_NAME }-control {
      block-size: var(--${ CheckBox.CLASS_NAME }-size);
      inline-size: var(--${ CheckBox.CLASS_NAME }-size);
      margin-inline: var(--${ CheckBox.CLASS_NAME }-space);
      position: relative;
    }
    *.${ CheckBox.CLASS_NAME }-box {
      block-size: inherit;
      position: relative;
    }

    *.${ CheckBox.CLASS_NAME }-box-surface {
      background-color: var(--${ Widget.CLASS_NAME }-main-color);
      border: 2px solid var(--${ Widget.CLASS_NAME }-accent-color);
      border-radius: var(--${ Widget.CLASS_NAME }-corner-radius);
      inset: 0;
      position: absolute;
      transition: background-color var(--${ CheckBox.CLASS_NAME }-switching-time);
    }
    :host(*[aria-checked="true"]) *.${ CheckBox.CLASS_NAME }-box-surface,
    :host(*[aria-checked="mixed"]) *.${ CheckBox.CLASS_NAME }-box-surface {
      background-color: var(--${ Widget.CLASS_NAME }-accent-color);
    }

    *.${ CheckBox.CLASS_NAME }-mark,
    *.${ CheckBox.CLASS_NAME }-mark-canvas {
      inset: 0;
      position: absolute;
    }
    @keyframes ${ CheckBox.CLASS_NAME }-mark-graph-checked {
      0% {
        clip-path: polygon(0 50%, 50% 100%, 0 100%);
      }
      100% {
        clip-path: polygon(0 -100%, 200% 100%, 0 100%);
      }
    }
    @keyframes ${ CheckBox.CLASS_NAME }-mark-graph-indeterminate {
      0% {
        clip-path: polygon(40% 0, 60% 0, 60% 100%, 40% 100%);
      }
      100% {
        clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
      }
    }
    *.${ CheckBox.CLASS_NAME }-mark-graph {
      block-size: calc(100% - 4px);
      inline-size: calc(100% - 4px);
      inset: 2px;
      overflow: visible;
      position: absolute;
    }
    :host(*[aria-checked="true"]) *.${ CheckBox.CLASS_NAME }-mark-graph {
      animation: ${ CheckBox.CLASS_NAME }-mark-graph-checked 300ms both;
    }
    :host(*[aria-checked="mixed"]) *.${ CheckBox.CLASS_NAME }-mark-graph {
      animation: ${ CheckBox.CLASS_NAME }-mark-graph-indeterminate 300ms both;
    }
    *.${ CheckBox.CLASS_NAME }-mark-line {
      fill: none;
      stroke: var(--${ Widget.CLASS_NAME }-main-color);
      stroke-width: 2px;
      /*
      stroke-width: 3px;
      vector-effect: non-scaling-stroke;
      */
    }
    :host(*[aria-checked="true"]) *.${ CheckBox.CLASS_NAME }-mark-line {
      stroke-linecap: square;
    }
    :host(*[aria-checked="mixed"]) *.${ CheckBox.CLASS_NAME }-mark-line {
      stroke-linecap: round;
    }

    @keyframes ${ CheckBox.CLASS_NAME }-ripple {
      0% {
        opacity: var(--${ Widget.CLASS_NAME }-ripple-opacity);
        transform: scale(1);
      }
      100% {
        opacity: 0;
        transform: scale(2.4);
      }
    }
    *.${ Widget.CLASS_NAME }-ripple {
      animation: ${ CheckBox.CLASS_NAME }-ripple 600ms both;
      inset: 0;
      mix-blend-mode: color-burn; /*TODO darkのとき変える */
    }

    *.${ CheckBox.CLASS_NAME }-value-label {
      display: none;
      user-select: none;
      white-space: pre;
    }
    :host(*[data-value-label-visible="true"]) *.${ CheckBox.CLASS_NAME }-value-label {
      display: block;
    }
    *.${ CheckBox.CLASS_NAME }-value-label:not(*:empty) {
      text-align: start;
    }
    :host(*[data-value-label-position="before"]) *.${ CheckBox.CLASS_NAME }-value-label:not(*:empty) {
      text-align: end;
    }
  `;
  static readonly #styleSheet: CSSStyleSheet = new CSSStyleSheet();
  static #template: HTMLTemplateElement | null;

  static readonly #defaultDataList: [Widget.DataListItem, Widget.DataListItem, Widget.DataListItem] = [
    { value: "0", label: "" },
    { value: "1", label: "" },
    { value: "", label: "" },
  ];

  #checked: boolean;
  #indeterminate: boolean;
  #valueLabelElement: Element;

  static {
    CheckBox.#styleSheet.replaceSync(CheckBox.#STYLE);
    CheckBox.#template = null;
  }

  constructor() {
    super({
      role: Aria.Role.CHECKBOX,
      className: CheckBox.CLASS_NAME,
      inputable: true,
      textEditable: false,
    });

    this.#checked = false;
    this.#indeterminate = false;

    this._appendStyleSheet(CheckBox.#styleSheet);

    const main = this._main;
    if ((CheckBox.#template && (CheckBox.#template.ownerDocument === this.ownerDocument)) !== true) {
      CheckBox.#template = this.ownerDocument.createElement("template");
      CheckBox.#template.innerHTML = CheckBox.#TEMPLATE;
    }
    main.append((CheckBox.#template as HTMLTemplateElement).content.cloneNode(true));
    this.#valueLabelElement = main.querySelector(`*.${ CheckBox.CLASS_NAME }-value-label`) as Element;

    this._addAction("click", {
      func: () => {
        this.checked = !(this.#checked);
        this._dispatchChangeEvent();
      },
    });

    this._addAction("keydown", {
      keys: [" "/*, "Enter"*/],
      func: () => {
        this.checked = !(this.#checked);
        this._dispatchChangeEvent();
      },
    });
  }

  get checked(): boolean {
    return this.#checked;
  }

  set checked(value: boolean) {
    const adjustedChecked = !!value;//(value === true);
    this.#setCheckedAndIndeterminate(adjustedChecked, false, Widget._ReflectionsOnPropChanged);
  }

  get indeterminate(): boolean {
    return this.#indeterminate;
  }

  set indeterminate(value: boolean) {
    const adjustedIndeterminate = !!value;//(value === true);
    this.#setCheckedAndIndeterminate(this.#checked, adjustedIndeterminate, Widget._ReflectionsOnPropChanged);
  }

  get #value(): Widget.DataListItem {
    const dataListItems = this._getDataListItems({
      defaultItems: CheckBox.#defaultDataList,
      mergeDefaultItems: true,
    }) as [Widget.DataListItem, Widget.DataListItem, Widget.DataListItem];
    if (this.#indeterminate === true) {
      return dataListItems[CheckBox.OptionIndex.INDETERMINATE];
    }
    else if (this.#checked === true) {
      return dataListItems[CheckBox.OptionIndex.ON];
    }
    else {
      return dataListItems[CheckBox.OptionIndex.OFF];
    }
    //TODO busyのときエラーにするか待たせるか
  }

  static override get observedAttributes(): Array<string> {
    return [
      Widget.observedAttributes,
      [
        Aria.State.CHECKED,
        //DataAttr.VALUE_LABEL_VISIBLE, CSSのみ
        //DataAttr.VALUE_LABEL_POSITION, CSSのみ
      ],
    ].flat();
  }

  override connectedCallback(): void {
    super.connectedCallback();

    if (this.isConnected !== true) {
      return;
    }

    this.#setCheckedAndIndeterminateFromString(this.getAttribute(Aria.State.CHECKED) ?? "", Widget._ReflectionsOnConnected);

    this._connected = true;
  }

  override attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
    super.attributeChangedCallback(name, oldValue, newValue);

    if (this._reflectingInProgress === name) {
      return;
    }

    switch (name) {
      case Aria.State.CHECKED:
        this.#setCheckedAndIndeterminateFromString(newValue, Widget._ReflectionsOnAttrChanged);
        break;

      default:
        break;
    }
  }

  #setCheckedAndIndeterminateFromString(value: string, reflections: Widget.Reflections): void {
    this.#setCheckedAndIndeterminate((value === "true"), (value === "mixed"), reflections);
  }

  #setCheckedAndIndeterminate(checked: boolean, indeterminate: boolean, reflections: Widget.Reflections): void {
    const changed = (this.#checked !== checked) || (this.#indeterminate !== indeterminate);
    if (changed === true) {
      this.#checked = checked;
      this.#indeterminate = indeterminate;
    }
    if ((reflections.content === "always") || (reflections.content === "if-needed" && changed === true)) {
      this.#reflectCheckedToContent();
    }
    if ((reflections.attr === "always") || (reflections.attr === "if-needed" && changed === true)) {
      this.#reflectToAriaChecked();
    }
  }

  #reflectToAriaChecked(): void {
    const value = (this.#indeterminate === true) ? "mixed" : ((this.#checked === true) ? "true" : "false");
    this._reflectToAttr(Aria.State.CHECKED, value);
  }

  #reflectCheckedToContent(): void {
    this.#drawMark();
    this._addRipple();
    this.#valueLabelElement.textContent = this.#value.label;
  }

  #drawMark(): void {
    const mark = this._main.querySelector(`*.${ CheckBox.CLASS_NAME }-mark-canvas`) as SVGElement;
    const prevShape = mark.querySelector(`*.${ CheckBox.CLASS_NAME }-mark-graph`);
    if (prevShape) {
      prevShape.remove();
    }

    const shape = this.ownerDocument.createElementNS(Ns.SVG, "svg");
    shape.setAttribute("viewBox", "0 0 12 12");
    shape.classList.add(`${ CheckBox.CLASS_NAME }-mark-graph`);

    let d: string = "";
    if (this.#indeterminate === true) {
      d = "M 2 6 L 10 6";
    }
    else if (this.#checked === true) {
      d = "M 2 7 L 4 9 L 10 3";
    }
    else {
      return;
    }
    const path = this.ownerDocument.createElementNS(Ns.SVG, "path");
    path.setAttribute("d", d);
    path.classList.add(`${ CheckBox.CLASS_NAME }-mark-line`);
    shape.append(path);
    mark.append(shape);
  }
}
namespace CheckBox {
  export const OptionIndex = {
    OFF: 0,
    ON: 1,
    INDETERMINATE: 2,
  } as const;
}
Object.freeze(CheckBox);

export { CheckBox };
