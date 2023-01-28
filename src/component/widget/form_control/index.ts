import { Widget} from "../widget_base";

const _Attr = {
  FORM: "form",
  NAME: "name",
  READONLY: "readonly",
} as const;

abstract class FormControl extends Widget {
  //static readonly formAssociated = true;

  //static readonly #KEY = Symbol();

  constructor(init: Widget.Init) {
    super(init);
  }

  static override get observedAttributes(): Array<string> {
    return [
      super.observedAttributes,
      [
        _Attr.FORM,
        _Attr.NAME,
        _Attr.READONLY,
      ],
    ].flat();
  }

  get form(): HTMLFormElement | null {
    return this._internals.form;
  }

  get name(): string {
    return (this.getAttribute(_Attr.NAME) ?? "");
  }

  set name(value: string) {
    const nameString = (typeof value === "string") ? value : String(value);
    if (nameString.length > 0) {
      this.setAttribute(_Attr.NAME, nameString);
    }
    else {
      this.removeAttribute(_Attr.NAME);
    }
  }

  get readOnly(): boolean {
    return this.hasAttribute(_Attr.READONLY);
  }

  set readOnly(value: boolean) {
    this.toggleAttribute(_Attr.READONLY, !!value);
  }

  // override connectedCallback(): void {
  //   super.connectedCallback();
  // }

  protected override _reflectAllAttributesChanged(): void {
    super._reflectAllAttributesChanged();
    this._reflectReadOnlyChanged();
  }

  override attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
    super.attributeChangedCallback(name, oldValue, newValue);

    switch (name) {
      case _Attr.FORM:
        break;

      case _Attr.NAME:
        break;

      case _Attr.READONLY:
        this._internals.ariaReadOnly = (this.readOnly === true) ? "true" : "false";
        this._reflectReadOnlyChanged();
        break;

      default:
        break;
    }
  }

  protected override _reflectDisabledChanged(): void {
    super._reflectDisabledChanged();
    this.#resetEditable();
  }

  protected _reflectReadOnlyChanged(): void {
    this.#resetEditable();
  }

  protected override _reflectBusyChanged(): void {
    super._reflectBusyChanged();
    this.#resetEditable();
  }

  protected override _ignoreUiEvent(): boolean {
    return ((this.busy === true) || (this.disabled === true) || (this.readOnly === true));
  }

  #resetEditable(): void {
    if (!!this._eventTarget && (this._init.textEditable === true)) {
      if (this._ignoreUiEvent() === true) {
        this._eventTarget.removeAttribute("contenteditable");
      }
      else {
        this._eventTarget.setAttribute("contenteditable", "true");
      }
    }
  }

}

export { FormControl };
