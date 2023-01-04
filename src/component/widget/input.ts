import { Aria } from "./aria";
import { Widget } from "./widget";

const _STYLE = `
*.widget-event-target[contenteditable] {
  cursor: text;
  white-space: pre;
}
:host(*[aria-readonly="true"]) *.switch-container *.widget-event-target {
  cursor: default;
}
`;

abstract class Input extends Widget {
  static readonly #styleSheet: CSSStyleSheet = new CSSStyleSheet();
  readonly #textEditable: boolean;
  #textCompositing: boolean;

  static {
    Input.#styleSheet.replaceSync(_STYLE);
  }

  constructor(init: Input.Init) {
    super(init);

    this.#textEditable = (init?.textEditable === true);
    this.#textCompositing = false;

    this._appendStyleSheet(Input.#styleSheet);

    if (this.#textEditable === true) {
      this._eventTarget.setAttribute("contenteditable", "true");

      this._eventTarget.addEventListener("compositionstart", (event: CompositionEvent) => {
        void event;
        console.log("compositionstart");
        this.#textCompositing = true;
      }, { passive: true });

      this._eventTarget.addEventListener("compositionend", (event: CompositionEvent) => {
        void event;
        console.log("compositionend");
        this.#textCompositing = false;
      }, { passive: true });
    }

  }

  get readOnly(): boolean {
    return this._readOnly;
  }

  set readOnly(value: boolean) {
    const adjustedReadOnly = !!value;//(value === true);
    this.#setReadOnly(adjustedReadOnly, Widget._ReflectionsOnPropChanged);
  }

  protected get _textEditable(): boolean {
    return this.#textEditable;
  }

  protected get _textCompositing(): boolean {
    return this.#textCompositing;
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
    const changed = (this._readOnly !== value);
    if (changed === true) {
      this._readOnly = value;
    }
    if ((reflections.content === "always") || (reflections.content === "if-needed" && changed === true)) {
      this.#reflectReadOnlyToContent();
    }
    if ((reflections.attr === "always") || (reflections.attr === "if-needed" && changed === true)) {
      this.#reflectToAriaReadonly();
    }
  }

  #reflectToAriaReadonly(): void {
    this._reflectToAttr(Aria.Property.READONLY, ((this._readOnly === true) ? "true" : undefined));
  }

  #resetEditable(): void {
    if (this._eventTarget && (this.#textEditable === true)) {
      if ((this.busy === true) || (this.disabled === true) || (this._readOnly === true)) {
        this._eventTarget.removeAttribute("contenteditable");
      }
      else {
        this._eventTarget.setAttribute("contenteditable", "true");
      }
    }
  }

  #reflectReadOnlyToContent(): void {
    this.#resetEditable();
  }

  protected override _reflectBusyToContent(): void {
    super._reflectBusyToContent();
    this.#resetEditable();
  }

  protected override _reflectDisabledToContent(): void {
    super._reflectDisabledToContent();
    this.#resetEditable();
  }

  protected _dispatchChangeEvent(): void {
    this.dispatchEvent(new Event("change", {
      bubbles: true,
    }));
  }
}
namespace Input {
  export type Init = Widget.Init & {
    textEditable?: boolean,
  };

}
Object.freeze(Input);

export { Input };
