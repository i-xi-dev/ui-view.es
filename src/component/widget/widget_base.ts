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
:host-context(*[data-size="x-small"]) *.widget {
  --widget-size: ${ WidgetDimension.X_SMALL }px;
}
:host-context(*[data-size="small"]) *.widget {
  --widget-size: ${ WidgetDimension.SMALL }px;
}
:host-context(*[data-size="large"]) *.widget {
  --widget-size: ${ WidgetDimension.LARGE }px;
}
:host-context(*[data-size="x-large"]) *.widget {
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
  #colorScheme: WidgetColorScheme;
  #size: WidgetSize;
  #disabled: boolean;
  #reflectingInProgress: string;
  #main: Element;
  protected _eventTarget: Element | null;

  static DataAttr = Object.freeze({
    COLOR_SCHEME: "data-color-scheme",
    SIZE: "data-size",
  });

  constructor(init: WidgetBaseInit) {
    super();
    this.#role = init.role;
    this.#root = this.attachShadow(_ShadowRootInit);
    this.#connected = false;
    this.#colorScheme = WidgetColorScheme.AUTO;
    this.#size = WidgetSize.MEDIUM;
    this.#disabled = false;
    this.#reflectingInProgress = "";

    //TODO adoptedStyleSheets
    const style = document.createElement("style");
    style.textContent = _BASE_STYLE + "\u000a" + init.style;

    this.#main = document.createElement("div");
    this.#main.classList.add("widget")

    this._eventTarget = null;

    this.#root.append(style, this.#main);
  }

  protected get _root(): ShadowRoot {
    return this.#root;
  }

  protected get _connected(): boolean {
    return this.#connected;
  }

  protected get _size(): WidgetSize {
    return this.#size;
  }

  get disabled(): boolean {
    return this.#disabled;
  }

  set disabled(value: boolean) {
    this.#disabled = !!value;
    this._reflectDisabled();
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
    this._loadColorScheme();
    this._loadSize();
    this._loadDisabled();
    this.#reflectRole();
    this._reflectDisabled()
    this.#connected = true;
  }

  disconnectedCallback(): void {
    this.#connected = false;
  }

  adoptedCallback(): void {

  }

  protected _loadDisabled(): void {
    this.#disabled = (this.getAttribute(Aria.State.DISABLED) === "true");
  }

  protected _loadColorScheme(): void {
    const loadedColor = (this.getAttribute(WidgetBase.DataAttr.COLOR_SCHEME) ?? "") as WidgetColorScheme;
    if (Object.values(WidgetColorScheme).includes(loadedColor) === true) {
      this.#colorScheme = loadedColor;
    }
    else {
      this.#colorScheme = WidgetColorScheme.AUTO;
    }
  }

  protected _loadSize(): void {
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

  protected _reflectDisabled(): void {
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

  protected _reflectAriaAttr(name: Aria.Attr, value?: string): void {
    this.#reflectingInProgress = name;
    if (value) {
      this.setAttribute(name, value);
    }
    else {
      this.removeAttribute(name);
    }
    this.#reflectingInProgress = "";
  }

  protected _onAriaDisabledChanged() {

  }
}

export { WidgetBase, WidgetDimension };
