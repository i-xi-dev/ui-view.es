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
    if (this.#disabled !== adjustedDisabled) {
      this.#disabled = adjustedDisabled;
      this.#reflectDisabled();
    }
  }

  override get hidden(): boolean {
    return this.#hidden;
  }

  override set hidden(value: boolean) {
    const adjustedHidden = !!value;//(value === true);
    if (this.#hidden !== adjustedHidden) {
      this.#hidden = adjustedHidden;
      this.#reflectHidden();
    }
  }

  get label(): string {
    return this.#label;
  }

  set label(value: string) {
    const adjustedLabel = (typeof value === "string") ? value : "";
    if (this.#label !== adjustedLabel) {
      this.#label = (typeof value === "string") ? value : "";
      this.#reflectLabel();
    }
  }

  protected get _reflectingInProgress(): string {
    return this.#reflectingInProgress;
  }

  protected get _main(): Element {
    return this.#main;
  }




  connectedCallback(): void {
    if (this.isConnected !== true) {
      return;
    }
    //this.#loadColorScheme();
    this.#loadSize();
    this.#loadDisabled();
    this.#loadHidden();
    this.#loadLabel();
    this.#reflectRole();
    this.#reflectDisabled();
    this.#reflectHidden();
    this.#reflectLabel();

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
        const adjustedDisabled = (newValue === "true");
        if (this.#disabled !== adjustedDisabled) {
          this.#disabled = adjustedDisabled;
        }
        if ((this.#disabled !== adjustedDisabled) || (["true"/*, "false"*/].includes(newValue) !== true)) {
          this.#reflectDisabled();
        }
        break;

      case Aria.State.HIDDEN:
        const adjustedHidden = (newValue === "true");
        if (this.#hidden !== adjustedHidden) {
          this.#hidden = adjustedHidden;
        }
        if ((this.#hidden !== adjustedHidden) || (["true"/*, "false"*/].includes(newValue) !== true)) {
          this.#reflectHidden();
        }
        break;

      case Aria.Property.LABEL:
        if (this.#label !== newValue) {
          this.#label = newValue;
          this.#reflectLabel();
        }
        break;

      default:
        break;
    }
  }

  #loadDisabled(): void {
    this.#disabled = (this.getAttribute(Aria.State.DISABLED) === "true");
  }

  #loadHidden(): void {
    this.#hidden = (this.getAttribute(Aria.State.HIDDEN) === "true");
  }

  #loadLabel(): void {
    this.#label = this.getAttribute(Aria.Property.LABEL) ?? "";
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

  #loadSize(): void {
    const loadedSize = (this.getAttribute(WidgetBase.DataAttr.SIZE) ?? "") as WidgetSize;
    if (Object.values(WidgetSize).includes(loadedSize) === true) {
      this.#size = loadedSize;
    }
    else {
      this.#size = WidgetSize.MEDIUM;
    }
  }

  #reflectRole(): void {
    this.setAttribute("role", this.#role);
  }

  #reflectDisabled(): void {
    this._reflectAriaAttr(Aria.State.DISABLED, ((this.#disabled === true) ? "true" : undefined));
    if (this._eventTarget) {
      if (this.#disabled === true) {
        this._eventTarget.removeAttribute("tabindex");
      }
      else {
        this._eventTarget.setAttribute("tabindex", "0");
      }
    }
  }

  #reflectHidden(): void {
    this._reflectAriaAttr(Aria.State.HIDDEN, ((this.#hidden === true) ? "true" : undefined));
  }

  #reflectLabel(): void {
    this._reflectAriaAttr(Aria.Property.LABEL, (this.#label) ? this.#label : undefined);
    if (this._labelElement) {
      this._labelElement.textContent = this.#label;
    }
  }

  protected _reflectAriaAttr(name: Aria.Attr, value?: string): void {
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


}
Object.freeze(WidgetBase);

export { type WidgetBaseInit, WidgetBase, WidgetDimension };
