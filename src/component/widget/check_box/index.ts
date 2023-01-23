
import { Ns } from "../../../ns";
import { Aria } from "../../../aria";
import { Widget } from "../widget_base/index";
import Presentation from "./presentation";

class CheckBox extends Widget {
  static readonly formAssociated = true;

  static readonly #KEY = Symbol();

  static readonly #defaultDataList: [Widget.DataListItem, Widget.DataListItem, Widget.DataListItem] = [
    { value: "0", label: "" },
    { value: "1", label: "" },
    { value: "", label: "" },
  ];

  #checked: boolean;
  #indeterminate: boolean;
  #valueLabelElement: Element | null;

  static {
    Widget._addTemplate(CheckBox.#KEY, Presentation.TEMPLATE);
    Widget._addStyleSheet(CheckBox.#KEY, Presentation.STYLE);
  }

  constructor() {
    super({
      componentKey: CheckBox.#KEY,
      role: "checkbox",
      formAssociated: CheckBox.formAssociated,
      inputable: true,
      textEditable: false,
    });

    this.#checked = false;
    this.#indeterminate = false;
    this.#valueLabelElement = null;
  }

  #render2(): void {
    if (!this._main) {
      throw new Error("TODO");
    }

    this.#valueLabelElement = this._main.querySelector(`*.${ Presentation.ClassName.OUTPUT }`) as Element;

    this._addAction<PointerEvent>("pointerup", {
      func: (event: PointerEvent) => {
        if (this._isCapturingPointer(event) === true) {
          if (this._capturingPointer?.leaved === true) {
            console.log("------------------------------------- leaved");
            return;
          }

          console.log(`------------------------------------- ${this.checked} -> ${!(this.#checked)}`);
          this.checked = !(this.#checked);
          //this._dispatchCompatMouseEvent("click"); pointerupをどうしようが勝手に発火する
          this._dispatchChangeEvent();
        }
      },
    });

    this._addAction<KeyboardEvent>("keydown", {
      keys: [" "],
      func: () => {
        this.checked = !(this.#checked);
        this._dispatchCompatMouseEvent("click");
        this._dispatchChangeEvent();
      },
      doPreventDefault: true,
    });
  }

  static override get observedAttributes(): Array<string> {
    return [
      Widget.observedAttributes,
      [
        Aria.CHECKED,
        //DataAttr.VALUE_LABEL_VISIBLE, CSSのみ
        //DataAttr.VALUE_LABEL_POSITION, CSSのみ
      ],
    ].flat();
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
    //XXX busyのときエラーにするか待たせるか
  }

  override connectedCallback(): void {
    super.connectedCallback();

    if (this.isConnected !== true) {
      return;
    }
    this.#render2();

    this.#setCheckedAndIndeterminateFromString(this.getAttribute(Aria.CHECKED) ?? "", Widget._ReflectionsOnConnected);

    this._connected = true;
  }

  override attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
    super.attributeChangedCallback(name, oldValue, newValue);

    if (this._reflectingInProgress === name) {
      return;
    }

    switch (name) {
      case Aria.CHECKED:
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
    this._reflectToAttr(Aria.CHECKED, value);
  }

  #reflectCheckedToContent(): void {
    if (!!this.#valueLabelElement) {
      this.#drawMark();
      this._addRipple();
      this.#valueLabelElement.textContent = this.#value.label;
    }
  }

  // animationを変えているのでsvgごと入れ替えている
  #drawMark(): void {
    if (!!this._main) {
      const markCanvas = this._main.querySelector(`*.${ Presentation.ClassName.CONTROL_MARK_CANVAS }`) as SVGElement;
      const prevImage = markCanvas.querySelector(`*.${ Presentation.ClassName.CONTROL_MARK_CANVAS_IMAGE }`);
      if (prevImage) {
        prevImage.remove();
      }
  
      const image = this.ownerDocument.createElementNS(Ns.SVG, "svg");
      image.setAttribute("viewBox", "0 0 12 12");
      image.classList.add(Presentation.ClassName.CONTROL_MARK_CANVAS_IMAGE);
  
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
      const line = this.ownerDocument.createElementNS(Ns.SVG, "path");
      line.setAttribute("d", d);
      line.classList.add(Presentation.ClassName.CONTROL_MARK_CANVAS_IMAGE_LINE);
      image.append(line);
      markCanvas.append(image);
    }
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
