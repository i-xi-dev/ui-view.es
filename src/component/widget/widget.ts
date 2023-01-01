import { Aria } from "./aria";

const WidgetDimension = {
  X_SMALL: 28,
  SMALL: 32,
  MEDIUM: 36,
  LARGE: 40,
  X_LARGE: 44,
} as const;

const _STYLE = `:host {
  display: block;
}
:host(*[aria-hidden="true"]) {
  display: none;
}
*.widget-container {
  --accent-color: #136ed2;
  --border-width: 2px;
  --focus-color: orange;
  --main-color: #fff;
  --widget-size: ${ WidgetDimension.MEDIUM }px;
  align-items: center;
  block-size: var(--widget-size);
  display: flex;
  flex-flow: row nowrap;
  inline-size: 100%;
  justify-content: stretch;
  min-block-size: var(--widget-size);
  min-inline-size: var(--widget-size);
  position: relative;
}
:host(*[data-size="x-small"]) *.widget-container {
  --widget-size: ${ WidgetDimension.X_SMALL }px;
}
:host(*[data-size="small"]) *.widget-container {
  --widget-size: ${ WidgetDimension.SMALL }px;
}
:host(*[data-size="large"]) *.widget-container {
  --widget-size: ${ WidgetDimension.LARGE }px;
}
:host(*[data-size="x-large"]) *.widget-container {
  --widget-size: ${ WidgetDimension.X_LARGE }px;
}
*.widget-event-target {
  inset: 0;
  position: absolute;
}
*.widget-event-target:focus {
  box-shadow: 0 0 0 2px var(--focus-color);
  outline: none;
}
:host(*[aria-busy="true"]) *.widget-container *.widget-event-target,
:host(*[aria-busy="true"][aria-disabled="true"]) *.widget-container *.widget-event-target {
  cursor: wait;
}
:host(*[aria-disabled="true"]) *.widget-container *.widget-event-target {
  cursor: not-allowed;
}
*.widget,
*.widget * {
  pointer-events: none;
}
:host(*[aria-busy="true"]) *.widget,
:host(*[aria-disabled="true"]) *.widget {
  filter: contrast(0.5) grayscale(1);
  opacity: 0.6;
}
`;

const _ShadowRootInit: ShadowRootInit = {
  mode: "closed",
  delegatesFocus: true,
};

const WidgetColorScheme = {
  AUTO: "auto",
  DARK: "dark",
  LIGHT: "light",
} as const;
type WidgetColorScheme = typeof WidgetColorScheme[keyof typeof WidgetColorScheme];

const WidgetSize = {
  LARGE: "large",
  MEDIUM: "medium",
  SMALL: "small",
  X_LARGE: "x-large",
  X_SMALL: "x-small",
} as const;
type WidgetSize = typeof WidgetSize[keyof typeof WidgetSize];

type WidgetInit = {
  role: Aria.Role,
  className: string,
};

type ContentReflection = "always" | "if-needed";
type AttrReflection = "always" | "if-needed" | "never";

type Reflections = {
  content: ContentReflection,
  attr: AttrReflection,
};

abstract class Widget extends HTMLElement {
  static readonly #styleSheet: CSSStyleSheet = new CSSStyleSheet();

  readonly #role: string;
  readonly #root: ShadowRoot;
  #connected: boolean;
  #size: WidgetSize;
  #busy: boolean;
  #disabled: boolean; // Aria仕様では各サブクラスで定義されるが、disabledにならない物は実装予定がないのでここで定義する
  #hidden: boolean;
  #label: string;
  #reflectingInProgress: string;
  readonly #main: Element;
  readonly #eventTarget: Element;
  protected _labelElement: Element | null;

  static DataAttr = Object.freeze({
    COLOR_SCHEME: "data-color-scheme",
    SIZE: "data-size",
  });

  protected static _ReflectionsOnConnected: Reflections = {
    content: "always",
    attr: "never",
  };
  protected static _ReflectionsOnAttrChanged: Reflections = {
    content: "if-needed",
    attr: "never",
  };
  protected static _ReflectionsOnPropChanged: Reflections = {
    content: "if-needed",
    attr: "if-needed",
  };

  static {
    Widget.#styleSheet.replaceSync(_STYLE);
  }

  constructor(init: WidgetInit) {
    super();
    this.#role = init.role;
    this.#root = this.attachShadow(_ShadowRootInit);
    this.#connected = false;
    this.#size = WidgetSize.MEDIUM;
    this.#busy = false;
    this.#disabled = false;
    this.#hidden = false;
    this.#label = "";
    this.#reflectingInProgress = "";

    this._appendStyleSheet(Widget.#styleSheet);
    const container = this.ownerDocument.createElement("div");
    container.classList.add("widget-container");
    container.classList.add(`${ init.className }-container`);
    this.#eventTarget = this.ownerDocument.createElement("div");
    this.#eventTarget.classList.add("widget-event-target");
    container.append(this.#eventTarget);
    this.#main = this.ownerDocument.createElement("div");
    this.#main.classList.add("widget");
    this.#main.classList.add(init.className);
    container.append(this.#main);
    this._labelElement = null;

    this.#root.append(container);
  }

  protected get _root(): ShadowRoot {
    return this.#root;
  }

  protected get _connected(): boolean {
    return this.#connected;
  }

  protected set _connected(value: boolean) {
    this.#connected = value;
  }

  protected get _size(): WidgetSize {
    return this.#size;
  }

  get busy(): boolean {
    return this.#busy;
  }

  set busy(value: boolean) {
    const adjustedBusy = !!value;//(value === true);
    this.#setBusy(adjustedBusy, Widget._ReflectionsOnPropChanged);
  }

  get disabled(): boolean {
    return this.#disabled;
  }

  set disabled(value: boolean) {
    const adjustedDisabled = !!value;//(value === true);
    this.#setDisabled(adjustedDisabled, Widget._ReflectionsOnPropChanged);
  }

  override get hidden(): boolean {
    return this.#hidden;
  }

  override set hidden(value: boolean) {
    const adjustedHidden = !!value;//(value === true);
    this.#setHidden(adjustedHidden, Widget._ReflectionsOnPropChanged);
  }

  get label(): string {
    return this.#label;
  }

  set label(value: string) {
    const adjustedLabel = (typeof value === "string") ? value : "";
    this.#setLabel(adjustedLabel, Widget._ReflectionsOnPropChanged);
  }

  protected get _reflectingInProgress(): string {
    return this.#reflectingInProgress;
  }

  protected get _main(): Element {
    return this.#main;
  }

  protected get _eventTarget(): Element {
    return this.#eventTarget;
  }

  static get observedAttributes(): Array<string> {
    return [
      Aria.Property.LABEL, // 外部labelを使用する場合は使用しない
      Aria.State.BUSY,
      Aria.State.DISABLED,
      Aria.State.HIDDEN,
      Widget.DataAttr.SIZE,
    ];
  }

  connectedCallback(): void {
    if (this.isConnected !== true) {
      return;
    }

    this.#reflectToRole();

    this.#setBusyFromString(this.getAttribute(Aria.State.BUSY) ?? "", Widget._ReflectionsOnConnected);
    this.#setDisabledFromString(this.getAttribute(Aria.State.DISABLED) ?? "", Widget._ReflectionsOnConnected);
    this.#setHiddenFromString(this.getAttribute(Aria.State.HIDDEN) ?? "", Widget._ReflectionsOnConnected);
    this.#setLabel(this.getAttribute(Aria.Property.LABEL) ?? "", Widget._ReflectionsOnConnected);
    this.#setSize(this.getAttribute(Widget.DataAttr.SIZE) ?? "", Widget._ReflectionsOnConnected);

    //this.#connected = true;
  }

  disconnectedCallback(): void {
    this.#connected = false;
  }

  adoptedCallback(): void {

  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
    if (this.#reflectingInProgress === name) {
      return;
    }

    switch (name) {
      case Aria.Property.LABEL:
        this.#setLabel(newValue, Widget._ReflectionsOnAttrChanged);
        break;

      case Aria.State.BUSY:
        this.#setBusyFromString(newValue, Widget._ReflectionsOnAttrChanged);
        break;

      case Aria.State.DISABLED:
        this.#setDisabledFromString(newValue, Widget._ReflectionsOnAttrChanged);
        break;

      case Aria.State.HIDDEN:
        this.#setHiddenFromString(newValue, Widget._ReflectionsOnAttrChanged);
        break;

      case Widget.DataAttr.SIZE:
        this.#setSize(newValue, Widget._ReflectionsOnAttrChanged);
        break;

      default:
        break;
    }
  }

  #setBusyFromString(value: string, reflections: Reflections): void {
    this.#setBusy((value === "true"), reflections);
  }

  #setBusy(value: boolean, reflections: Reflections): void {
    const changed = (this.#busy !== value);
    if (changed === true) {
      this.#busy = value;
    }
    if ((reflections.content === "always") || (reflections.content === "if-needed" && changed === true)) {
      this.#reflectBusyToContent();
    }
    if ((reflections.attr === "always") || (reflections.attr === "if-needed" && changed === true)) {
      this.#reflectToAriaBusy();
    }
  }

  #setDisabledFromString(value: string, reflections: Reflections): void {
    this.#setDisabled((value === "true"), reflections);
  }

  #setDisabled(value: boolean, reflections: Reflections): void {
    const changed = (this.#disabled !== value);
    if (changed === true) {
      this.#disabled = value;
    }
    if ((reflections.content === "always") || (reflections.content === "if-needed" && changed === true)) {
      this.#reflectDisabledToContent();
    }
    if ((reflections.attr === "always") || (reflections.attr === "if-needed" && changed === true)) {
      this.#reflectToAriaDisabled();
    }
  }

  #setHiddenFromString(value: string, reflections: Reflections): void {
    this.#setHidden((value === "true"), reflections);
  }

  #setHidden(value: boolean, reflections: Reflections): void {
    const changed = (this.#hidden !== value);
    if (changed === true) {
      this.#hidden = value;
    }
    // if ((reflections.content === "always") || (reflections.content === "if-needed" && changed === true)) {
    // }
    if ((reflections.attr === "always") || (reflections.attr === "if-needed" && changed === true)) {
      this.#reflectToAriaHidden();
    }
  }

  #setLabel(value: string, reflections: Reflections): void {
    const changed = (this.#label !== value);
    if (changed === true) {
      this.#label = value;
    }
    if ((reflections.content === "always") || (reflections.content === "if-needed" && changed === true)) {
      this.#reflectLabelToContent();
    }
    if ((reflections.attr === "always") || (reflections.attr === "if-needed" && changed === true)) {
      this.#reflectToAriaLabel();
    }
  }

  #setSize(value: string, reflections: Reflections): void {
    const valueIsWidgetSize = Object.values(WidgetSize).includes(value as WidgetSize);
    const adjustedSize = (valueIsWidgetSize === true) ? (value as WidgetSize) : WidgetSize.MEDIUM;
    const changed = (this.#size !== adjustedSize);
    if (changed === true) {
      this.#size = adjustedSize;
    }
    // if ((reflections.content === "always") || (reflections.content === "if-needed" && changed === true)) {
    // }
    if ((reflections.attr === "always") || (reflections.attr === "if-needed" && changed === true)) {
      this.#reflectToDataSize();
    }
  }

  protected _appendStyleSheet(sheet: CSSStyleSheet): void {
    this.#root.adoptedStyleSheets.push(sheet);
  }

  #reflectToRole(): void {
    this.setAttribute("role", this.#role);
  }

  protected _reflectToAttr(name: string, value?: string): void {
    this.#reflectingInProgress = name;
    if (value) {
      this.setAttribute(name, value);
    }
    else {
      this.removeAttribute(name);
    }
    this.#reflectingInProgress = "";
  }

  #reflectBusyToContent(): void {
    if (this._eventTarget) {
      if ((this.#busy === true) || (this.#disabled === true)) {
        this._eventTarget.removeAttribute("tabindex");
      }
      else {
        this._eventTarget.setAttribute("tabindex", "0");
      }
    }
  }

  #reflectDisabledToContent(): void {
    if (this._eventTarget) {
      if ((this.#busy === true) || (this.#disabled === true)) {
        this._eventTarget.removeAttribute("tabindex");
      }
      else {
        this._eventTarget.setAttribute("tabindex", "0");
      }
    }
  }

  #reflectLabelToContent(): void {
    if (this._labelElement) {
      this._labelElement.textContent = this.#label;
    }
  }

  #reflectToAriaBusy(): void {
    this._reflectToAttr(Aria.State.BUSY, ((this.#busy === true) ? "true" : undefined));
  }

  #reflectToAriaDisabled(): void {
    this._reflectToAttr(Aria.State.DISABLED, ((this.#disabled === true) ? "true" : undefined));
  }

  #reflectToAriaHidden(): void {
    this._reflectToAttr(Aria.State.HIDDEN, ((this.#hidden === true) ? "true" : undefined));
  }

  #reflectToAriaLabel(): void {
    this._reflectToAttr(Aria.Property.LABEL, (this.#label) ? this.#label : undefined);
  }

  #reflectToDataSize(): void {
    this._reflectToAttr(Widget.DataAttr.SIZE, ((this.#size !== WidgetSize.MEDIUM) ? this.#size : undefined));
  }

}
Object.freeze(Widget);

export {
  type WidgetInit,
  Reflections,
  Widget,
  WidgetDimension,
};
