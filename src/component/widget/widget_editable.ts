import { Aria } from "./aria";
import { type WidgetBaseInit, WidgetBase } from "./widget_base";

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
    if (this.#readOnly !== adjustedReadOnly) {
      this.#readOnly = adjustedReadOnly;
      this.#reflectReadOnly();
    }
  }

  override connectedCallback(): void {
    super.connectedCallback();

    if (this.isConnected !== true) {
      return;
    }
    this.#loadReadOnly();
    this.#reflectReadOnly();

    //this._connected = true;
  }

  override attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
    super.attributeChangedCallback(name, oldValue, newValue);

    if (this._reflectingInProgress === name) {
      return;
    }

    switch (name) {
      case Aria.Property.READONLY:
        const adjustedReadOnly = (newValue === "true");
        if (this.#readOnly !== adjustedReadOnly) {
          this.#readOnly = adjustedReadOnly;
        }
        if ((this.#readOnly !== adjustedReadOnly) || (["true"/*, "false"*/].includes(newValue) !== true)) {
          this.#reflectReadOnly();
        }
        break;

      default:
        break;
    }
  }

  #loadReadOnly(): void {
    this.#readOnly = (this.getAttribute(Aria.Property.READONLY) === "true");
  }

  #reflectReadOnly(): void {
    this._reflectAriaAttr(Aria.Property.READONLY, ((this.#readOnly === true) ? "true" : undefined));
  }

}
Object.freeze(WidgetEditable);

export { WidgetEditable };
