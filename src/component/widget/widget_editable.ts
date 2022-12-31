import { Aria } from "./aria";
import { type WidgetBaseInit, AttrReflection, WidgetBase } from "./widget_base";

abstract class WidgetEditable extends WidgetBase {
  #readOnly: boolean;

  constructor(init: WidgetBaseInit) {
    super(init);

    this.#readOnly = false;
  }

  get readOnly(): boolean {
    return this.#readOnly;
  }

  set readOnly(value: boolean) {
    const adjustedReadOnly = !!value;//(value === true);
    this.#setReadOnly(adjustedReadOnly, AttrReflection.FORCE);
  }

  static override get observedAttributes(): Array<string> {
    return [
      WidgetBase.observedAttributes,
      [
        Aria.Property.READONLY,
      ],
    ].flat();
  }

  override connectedCallback(): void {
    super.connectedCallback();

    if (this.isConnected !== true) {
      return;
    }

    this.#setReadOnlyFromString(this.getAttribute(Aria.Property.READONLY) ?? "", AttrReflection.NONE);

    //this._connected = true;
  }

  override attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
    super.attributeChangedCallback(name, oldValue, newValue);

    if (this._reflectingInProgress === name) {
      return;
    }

    switch (name) {
      case Aria.Property.READONLY:
        this.#setReadOnlyFromString(newValue, AttrReflection.NONE);
        break;

      default:
        break;
    }
  }

  #setReadOnlyFromString(value: string, ariaReadonlyReflection: AttrReflection): void {
    this.#setReadOnly((value === "true"), ariaReadonlyReflection);
  }

  #setReadOnly(value: boolean, ariaReadonlyReflection: AttrReflection): void {
    const changed = (this.#readOnly !== value);
    if (changed === true) {
      this.#readOnly = value;
    }
    if ((ariaReadonlyReflection === AttrReflection.FORCE) || (ariaReadonlyReflection === AttrReflection.IF_PROPERTY_CHANGED && changed === true)) {
      this.#reflectToAriaReadonly();
    }
  }

  #reflectToAriaReadonly(): void {
    this._reflectToAttr(Aria.Property.READONLY, ((this.#readOnly === true) ? "true" : undefined));
  }

}
Object.freeze(WidgetEditable);

export { WidgetEditable };
