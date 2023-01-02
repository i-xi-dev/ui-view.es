
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
    <div class="checkbox-mark-shape"></div>
  </div>
</div>
<div class="checkbox-value-label"></div>
`;

const _STYLE = `
:host {
  flex: none;
  inline-size: max-content;
}
*.switch-container *.widget-event-target {
  border-radius: 4px;
  cursor: pointer;
  margin-inline: -8px;
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
    this.#addRipple();
    this.#valueLabelElement.textContent = this.#value.label;
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
