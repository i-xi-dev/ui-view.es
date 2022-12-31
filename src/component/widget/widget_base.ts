import { Aria } from "./aria";

const WidgetDimension = {
  X_SMALL: 28,
  SMALL: 32,
  MEDIUM: 36,
  LARGE: 40,
  X_LARGE: 44,
} as const;

const _BASE_STYLE = `:host {
  display: block;
}
/*
:host(*[aria-disabled="true"]) {
  pointer-events: none;
}
*/
:host(*[aria-hidden="true"]) {
  display: none;
}
*.widget {
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
}
:host(*[data-size="x-small"]) *.widget {
  --widget-size: ${ WidgetDimension.X_SMALL }px;
}
:host(*[data-size="small"]) *.widget {
  --widget-size: ${ WidgetDimension.SMALL }px;
}
:host(*[data-size="large"]) *.widget {
  --widget-size: ${ WidgetDimension.LARGE }px;
}
:host(*[data-size="x-large"]) *.widget {
  --widget-size: ${ WidgetDimension.X_LARGE }px;
}
*.widget *:focus {
  box-shadow: 0 0 0 2px var(--focus-color);
  outline: none;
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

type WidgetBaseInit = {
  role: Aria.Role,
  style: string,
};

const AttrReflection = {
  FORCE: Symbol(),
  IF_PROPERTY_CHANGED: Symbol(),
  NONE: Symbol(),
} as const;
type AttrReflection = typeof AttrReflection[keyof typeof AttrReflection];

abstract class WidgetBase extends HTMLElement {
  #role: string;
  #root: ShadowRoot;
  #connected: boolean;
  //#colorScheme: WidgetColorScheme;
  #size: WidgetSize;
  #disabled: boolean;
  #hidden: boolean;
  #label: string;
  #reflectingInProgress: string;
  #main: Element;
  protected _eventTarget: Element | null;
  protected _labelElement: Element | null;

  static DataAttr = Object.freeze({
    COLOR_SCHEME: "data-color-scheme",
    SIZE: "data-size",
  });

  constructor(init: WidgetBaseInit) {
    super();
    this.#role = init.role;
    this.#root = this.attachShadow(_ShadowRootInit);
    this.#connected = false;
    //this.#colorScheme = WidgetColorScheme.AUTO;
    this.#size = WidgetSize.MEDIUM;
    this.#disabled = false;
    this.#hidden = false;
    this.#label = "";
    this.#reflectingInProgress = "";

    //TODO adoptedStyleSheets
    const style = document.createElement("style");
    style.textContent = _BASE_STYLE + "\u000a" + init.style;

    this.#main = document.createElement("div");
    this.#main.classList.add("widget")

    this._eventTarget = null;
    this._labelElement = null;

    this.#root.append(style, this.#main);
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

  get disabled(): boolean {
    return this.#disabled;
  }

  set disabled(value: boolean) {
    const adjustedDisabled = !!value;//(value === true);
    this.#setDisabled(adjustedDisabled, AttrReflection.FORCE);
  }

  override get hidden(): boolean {
    return this.#hidden;
  }

  override set hidden(value: boolean) {
    const adjustedHidden = !!value;//(value === true);
    this.#setHidden(adjustedHidden, AttrReflection.FORCE);
  }

  get label(): string {
    return this.#label;
  }

  set label(value: string) {
    const adjustedLabel = (typeof value === "string") ? value : "";
    this.#setLabel(adjustedLabel, AttrReflection.FORCE);
  }

  protected get _reflectingInProgress(): string {
    return this.#reflectingInProgress;
  }

  protected get _main(): Element {
    return this.#main;
  }

  static get observedAttributes(): Array<string> {
    return [
      Aria.Property.LABEL, // 外部labelを使用する場合は使用しない
      Aria.State.DISABLED,
      Aria.State.HIDDEN,
      WidgetBase.DataAttr.SIZE,
      //TODO "aria-busy",
    ];
  }

  connectedCallback(): void {
    if (this.isConnected !== true) {
      return;
    }

    this.#reflectToRole();

    this.#setDisabledFromString(this.getAttribute(Aria.State.DISABLED) ?? "", AttrReflection.NONE);
    this.#setHiddenFromString(this.getAttribute(Aria.State.HIDDEN) ?? "", AttrReflection.NONE);
    this.#setLabel(this.getAttribute(Aria.Property.LABEL) ?? "", AttrReflection.NONE);
    this.#setSize(this.getAttribute(WidgetBase.DataAttr.SIZE) ?? "", AttrReflection.NONE);

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
      case Aria.State.DISABLED:
        this.#setDisabledFromString(newValue, AttrReflection.NONE);
        break;

      case Aria.State.HIDDEN:
        this.#setHiddenFromString(newValue, AttrReflection.NONE);
        break;

      case Aria.Property.LABEL:
        this.#setLabel(newValue, AttrReflection.NONE);
        break;

      case WidgetBase.DataAttr.SIZE:
        this.#setSize(newValue, AttrReflection.NONE);
        break;

      default:
        break;
    }
  }

  #setDisabledFromString(value: string, ariaDisabledReflection: AttrReflection): void {
    this.#setDisabled((value === "true"), ariaDisabledReflection);
  }

  #setDisabled(value: boolean, ariaDisabledReflection: AttrReflection): void {
    const changed = (this.#disabled !== value);
    if (changed === true) {
      this.#disabled = value;
      this.#reflectDisabledToContent();
    }
    if ((ariaDisabledReflection === AttrReflection.FORCE) || (ariaDisabledReflection === AttrReflection.IF_PROPERTY_CHANGED && changed === true)) {
      this.#reflectToAriaDisabled();
    }
  }

  #setHiddenFromString(value: string, ariaHiddenReflection: AttrReflection): void {
    this.#setHidden((value === "true"), ariaHiddenReflection);
  }

  #setHidden(value: boolean, ariaHiddenReflection: AttrReflection): void {
    const changed = (this.#hidden !== value);
    if (changed === true) {
      this.#hidden = value;
    }
    if ((ariaHiddenReflection === AttrReflection.FORCE) || (ariaHiddenReflection === AttrReflection.IF_PROPERTY_CHANGED && changed === true)) {
      this.#reflectToAriaHidden();
    }
  }

  #setLabel(value: string, ariaLabelReflection: AttrReflection): void {
    const changed = (this.#label !== value);
    if (changed === true) {
      this.#label = value;
      this.#reflectLabelToContent();
    }
    if ((ariaLabelReflection === AttrReflection.FORCE) || (ariaLabelReflection === AttrReflection.IF_PROPERTY_CHANGED && changed === true)) {
      this.#reflectToAriaLabel();
    }
  }

  #setSize(value: string, dataSizeReflection: AttrReflection): void {
    const valueIsWidgetSize = Object.values(WidgetSize).includes(value as WidgetSize);
    const adjustedSize = (valueIsWidgetSize === true) ? (value as WidgetSize) : WidgetSize.MEDIUM;
    const changed = (this.#size !== adjustedSize);
    if (changed === true) {
      this.#size = adjustedSize;
    }
    if ((dataSizeReflection === AttrReflection.FORCE) || (dataSizeReflection === AttrReflection.IF_PROPERTY_CHANGED && changed === true)) {
      this.#reflectToDataSize();
    }
  }

  // #loadColorScheme(): void {
  //   const loadedColor = (this.getAttribute(WidgetBase.DataAttr.COLOR_SCHEME) ?? "") as WidgetColorScheme;
  //   if (Object.values(WidgetColorScheme).includes(loadedColor) === true) {
  //     this.#colorScheme = loadedColor;
  //   }
  //   else {
  //     this.#colorScheme = WidgetColorScheme.AUTO;
  //   }
  // }

  #reflectToRole(): void {
    this.setAttribute("role", this.#role);
  }

  protected _reflectToAttr(name: string, value?: string): void {
    console.log(`name:${name}, value:${value}`)
    this.#reflectingInProgress = name;
    if (value) {
      this.setAttribute(name, value);
    }
    else {
      this.removeAttribute(name);
    }
    this.#reflectingInProgress = "";
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
    this._reflectToAttr(WidgetBase.DataAttr.SIZE, ((this.#size !== WidgetSize.MEDIUM) ? this.#size : undefined));
  }

  #reflectDisabledToContent(): void {
    if (this._eventTarget) {
      if (this.#disabled === true) {
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

}
Object.freeze(WidgetBase);

export {
  type WidgetBaseInit,
  AttrReflection,
  WidgetBase,
  WidgetDimension,
};
