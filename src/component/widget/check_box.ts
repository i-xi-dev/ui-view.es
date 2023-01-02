
import { Ns } from "./ns";
import { Aria } from "./aria";
import { Widget } from "./widget";
import { Input } from "./input";

const _MAIN_CONTENT_TEMPLATE = `
<div class="checkbox-control">
  <div class="checkbox-box">
    <div class="checkbox-box-glow"></div>
    <div class="checkbox-box-surface"></div>
    <div class="checkbox-box-frame"></div>
  </div>
  <div class="checkbox-mark">
    

  </div>
</div>
<div class="checkbox-value-label"></div>
`;

const _BOX_OFFSET_INLINE_START = 4;

const _STYLE = `
:host {
  flex: none;
  inline-size: max-content;
}
*.checkbox-container *.widget-event-target {
  border-radius: 4px;
  cursor: pointer;
  margin-inline: -8px;
}

*.checkbox {
  --checkbox-space: ${ _BOX_OFFSET_INLINE_START }px;
  --checkbox-switching-time: 150ms;
  --checkbox-size: calc(var(--widget-size) * 0.625);
  align-items: center;
  block-size: 100%;
  column-gap: 0;
  display: flex;
  flex-flow: row nowrap;
}
:host(*[data-value-label-visible="true"]) *.checkbox {
  column-gap: 6px;
}
:host(*[data-value-label-position="before"]) *.checkbox {
  flex-flow: row-reverse nowrap;
}

*.checkbox-control {
  block-size: var(--checkbox-size);
  inline-size: var(--checkbox-size);
  margin-inline: var(--checkbox-space);
  position: relative;
}
*.checkbox-box {
  background-color: var(--widget-main-color);
  block-size: inherit;
  border-radius: 4px;
  position: relative;
}

*.checkbox-box-glow,
*.checkbox-box-surface,
*.checkbox-box-frame {
  position: absolute;
}
*.checkbox-box-glow {

}
*.checkbox-box-surface {
  background-color: var(--widget-accent-color);
  border-radius: 3px;
  inset: 1px;
  opacity: 0;
  transition: opacity var(--checkbox-switching-time);
}
:host(*[aria-checked="true"]) *.checkbox-box-surface,
:host(*[aria-checked="mixed"]) *.checkbox-box-surface {
  opacity: 1;
}
*.checkbox-box-frame {
  border: 2px solid var(--widget-accent-color);
  border-radius: inherit;
  inset: 0;
}

*.checkbox-mark {
  inset: 2px;
  position: absolute;
}
@keyframes checkbox-mark-shape-checked {
  0% {
    clip-path: polygon(0 50%, 50% 100%, 0 100%);
  }
  100% {
    clip-path: polygon(0 -100%, 200% 100%, 0 100%);
  }
}
@keyframes checkbox-mark-shape-indeterminate {
  0% {
    clip-path: polygon(40% 0, 60% 0, 60% 100%, 40% 100%);
  }
  100% {
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
  }
}
*.checkbox-mark-shape {
  block-size: 100%;
  inline-size: 100%;
  overflow: visible;
}
:host(*[aria-checked="true"]) *.checkbox-mark-shape {
  animation: checkbox-mark-shape-checked 300ms both;
}
:host(*[aria-checked="mixed"]) *.checkbox-mark-shape {
  animation: checkbox-mark-shape-indeterminate 300ms both;
}
*.checkbox-mark-line {
  fill: none;
  stroke: var(--widget-main-color);
  stroke-width: 3px;
  vector-effect: non-scaling-stroke;
}
:host(*[aria-checked="true"]) *.checkbox-mark-line {
  stroke-linecap: square;
}
:host(*[aria-checked="mixed"]) *.checkbox-mark-line {
  stroke-linecap: round;
}


*.checkbox-value-label {
  display: none;
  user-select: none;
  white-space: pre;
}
:host(*[data-value-label-visible="true"]) *.checkbox-value-label {
  display: block;
}
*.checkbox-value-label:not(*:empty) {
  text-align: start;
}
:host(*[data-value-label-position="before"]) *.checkbox-value-label:not(*:empty) {
  text-align: end;
}
`;

class CheckBox extends Input {
  static readonly #className: string = "checkbox";
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
    CheckBox.#styleSheet.replaceSync(_STYLE);
    CheckBox.#template = null;
  }

  constructor() {
    super({
      role: Aria.Role.CHECKBOX,
      className: CheckBox.#className,
    });

    this.#checked = false;
    this.#indeterminate = false;

    this._appendStyleSheet(CheckBox.#styleSheet);

    const main = this._main;
    if ((CheckBox.#template && (CheckBox.#template.ownerDocument === this.ownerDocument)) !== true) {
      CheckBox.#template = this.ownerDocument.createElement("template");
      CheckBox.#template.innerHTML = _MAIN_CONTENT_TEMPLATE;
    }
    main.append((CheckBox.#template as HTMLTemplateElement).content.cloneNode(true));
    this.#valueLabelElement = main.querySelector("*.checkbox-value-label") as Element;

    this._eventTarget.addEventListener("click", () => {
      if ((this.busy === true) || (this.disabled === true) || (this.readOnly === true)) {
        return;
      }
      this.checked = !(this.#checked);
      this._dispatchChangeEvent();
    }, { passive: true });
    (this._eventTarget as HTMLElement).addEventListener("keydown", (event) => {
      if ((this.busy === true) || (this.disabled === true) || (this.readOnly === true)) {
        return;
      }
      if (["Enter", " "].includes(event.key) === true) {
        this.checked = !(this.#checked);
        this._dispatchChangeEvent();
      }
    }, { passive: true });
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
      Input.observedAttributes,
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

  // override disconnectedCallback(): void {
  //   super.disconnectedCallback();
  // }

  // override adoptedCallback(): void {
  //
  // }

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
    this.#addRipple();
    this.#valueLabelElement.textContent = this.#value.label;
  }

  #drawMark(): void {
    const mark = this._main.querySelector("*.checkbox-mark") as SVGElement;
    const prevShape = mark.querySelector("*.checkbox-mark-shape");
    if (prevShape) {
      prevShape.remove();
    }

    const shape = this.ownerDocument.createElementNS(Ns.SVG, "svg");
    shape.setAttribute("viewBox", "0 0 12 12");
    shape.classList.add("checkbox-mark-shape");

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
    path.classList.add("checkbox-mark-line");
    shape.append(path);
    mark.append(shape);
  }

  #addRipple(): void {
    //TODO
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
