
import { Ns } from "../../../ns";
import { Viewport } from "../../../viewport";
import { Pointer } from "../../../pointer";
import { Widget } from "../widget_base/index";
import { FormControl } from "../form_control/index";
import Presentation from "./presentation";

class CheckBox extends FormControl {
  static readonly formAssociated = true;

  static readonly #KEY = Symbol();

  static readonly #defaultDataList: [Widget.DataListItem, Widget.DataListItem, Widget.DataListItem] = [
    { value: "0", label: "" },
    { value: "1", label: "" },
    { value: "", label: "" },
  ];

  #valueLabelElement: Element | null = null;

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
  }

  //TODO readonlyのときの挙動
  protected override _onPointerReleased(result: Pointer.CaptureResult): void {
    super._onPointerReleased(result);

    if (result.endPointIntersectsTarget !== true) {
      return;
    }

    if (this.indeterminate === true) {
      this.indeterminate = false;
    }
    this.checked = !(this.checked);
    this._dispatchChangeEvent();

  }
  protected override _renderExtended(): void {
    if (!this._main) {
      throw new Error("TODO");
    }

    this.#valueLabelElement = this._main.querySelector(`*.${ Presentation.ClassName.OUTPUT }`) as Element;

    this._addKeyboardAction("keydown", {
      allowRepeat: false,
      doPreventDefault: true,
      doStopPropagation: false,
      func: () => {
        if (this.indeterminate === true) {
          this.indeterminate = false;
        }
        this.checked = !(this.checked);
        this._dispatchCompatMouseEvent("click");
        this._dispatchChangeEvent();
      },
      keys: [" "],
      readOnlyBehavior: "ignore-and-notify",
    });
  }

  static override get observedAttributes(): Array<string> {
    return [
      super.observedAttributes,
      [
        "checked",
        "indeterminate",
        "data-value-label",
      ],
    ].flat();
  }

  get checked(): boolean {
    return this.hasAttribute("checked");
  }

  set checked(value: boolean) {
    this.toggleAttribute("checked", !!value);
  }

  get indeterminate(): boolean {
    return this.hasAttribute("indeterminate");
  }

  set indeterminate(value: boolean) {
    this.toggleAttribute("indeterminate", !!value);
  }

  //TODO 不要 かわりにinternalsにvalueをセットする処理がいる
  get #value(): Widget.DataListItem {
    const dataListItems = this._getDataListItems({
      defaultItems: CheckBox.#defaultDataList,
      mergeDefaultItems: true,
    }) as [Widget.DataListItem, Widget.DataListItem, Widget.DataListItem];
    if (this.indeterminate === true) {
      return dataListItems[CheckBox.OptionIndex.INDETERMINATE];
    }
    else if (this.checked === true) {
      return dataListItems[CheckBox.OptionIndex.ON];
    }
    else {
      return dataListItems[CheckBox.OptionIndex.OFF];
    }
    //XXX busyのときエラーにするか待たせるか
  }

  // override connectedCallback(): void {
  //   super.connectedCallback();
  // }

  protected override _reflectAllAttributesChanged(): void {
    super._reflectAllAttributesChanged();
    this.#drawMark();
  }

  override attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
    super.attributeChangedCallback(name, oldValue, newValue);

    switch (name) {
      case "checked":
      case "indeterminate":
        this.#drawMark();
        this._addRipple();
        break;

      case "data-value-label":
        break;

      default:
        break;
    }
  }

  protected override _reflectDataListSlotChanged(): void {
    if (!!this.#valueLabelElement) {
      const dataListItems = this._getDataListItems({
        defaultItems: CheckBox.#defaultDataList,
        mergeDefaultItems: true,
      }) as [Widget.DataListItem, Widget.DataListItem, Widget.DataListItem];

      (this.#valueLabelElement.children[CheckBox.OptionIndex.OFF] as Element).textContent = dataListItems[CheckBox.OptionIndex.OFF].label;
      (this.#valueLabelElement.children[CheckBox.OptionIndex.ON] as Element).textContent = dataListItems[CheckBox.OptionIndex.ON].label;
      (this.#valueLabelElement.children[CheckBox.OptionIndex.INDETERMINATE] as Element).textContent = dataListItems[CheckBox.OptionIndex.INDETERMINATE].label;
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
      if (this.indeterminate === true) {
        d = "M 2 6 L 10 6";
      }
      else if (this.checked === true) {
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
