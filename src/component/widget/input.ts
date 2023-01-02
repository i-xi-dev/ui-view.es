import { Aria } from "./aria";
import { Widget } from "./widget";

const _STYLE = `
:host(*[aria-readonly="true"]) *.switch-container *.widget-event-target {
  cursor: default;
}
`;

abstract class Input extends Widget {
  static readonly #styleSheet: CSSStyleSheet = new CSSStyleSheet();

  #readOnly: boolean; // Aria仕様では各サブクラスで定義されるが、readOnlyにならない物は実装予定がないのでここで定義する

  static {
    Input.#styleSheet.replaceSync(_STYLE);
  }

  constructor(init: Widget.Init) {
    super(init);

    this.#readOnly = false;

    this._appendStyleSheet(Input.#styleSheet);
  }

  get readOnly(): boolean {
    return this.#readOnly;
  }

  set readOnly(value: boolean) {
    const adjustedReadOnly = !!value;//(value === true);
    this.#setReadOnly(adjustedReadOnly, Widget._ReflectionsOnPropChanged);
  }

  static override get observedAttributes(): Array<string> {
    return [
      Widget.observedAttributes,
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

    this.#setReadOnlyFromString(this.getAttribute(Aria.Property.READONLY) ?? "", Widget._ReflectionsOnConnected);

    //this._connected = true;
  }

  override attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
    super.attributeChangedCallback(name, oldValue, newValue);

    if (this._reflectingInProgress === name) {
      return;
    }

    switch (name) {
      case Aria.Property.READONLY:
        this.#setReadOnlyFromString(newValue, Widget._ReflectionsOnAttrChanged);
        break;

      default:
        break;
    }
  }

  #setReadOnlyFromString(value: string, reflections: Widget.Reflections): void {
    this.#setReadOnly((value === "true"), reflections);
  }

  #setReadOnly(value: boolean, reflections: Widget.Reflections): void {
    const changed = (this.#readOnly !== value);
    if (changed === true) {
      this.#readOnly = value;
    }
    // if ((reflections.content === "always") || (reflections.content === "if-needed" && changed === true)) {
    // }
    if ((reflections.attr === "always") || (reflections.attr === "if-needed" && changed === true)) {
      this.#reflectToAriaReadonly();
    }
  }

  #reflectToAriaReadonly(): void {
    this._reflectToAttr(Aria.Property.READONLY, ((this.#readOnly === true) ? "true" : undefined));
  }

  protected _dispatchChangeEvent(): void {
    this.dispatchEvent(new Event("change", {
      bubbles: true,
    }));
  }
}
namespace Input {
  
}
Object.freeze(Input);

export { Input };
