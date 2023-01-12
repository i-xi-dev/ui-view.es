import { Aria } from "./aria";

const _WidgetSize = {
  LARGE: "large",
  MEDIUM: "medium",
  SMALL: "small",
  X_LARGE: "x-large",
  X_SMALL: "x-small",
} as const;

const _WidgetDimension = {
  [_WidgetSize.X_SMALL]: 28,
  [_WidgetSize.SMALL]: 32,
  [_WidgetSize.MEDIUM]: 36,
  [_WidgetSize.LARGE]: 40,
  [_WidgetSize.X_LARGE]: 44,
} as const;

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

type ContentReflection = "always" | "if-needed";
type AttrReflection = "always" | "if-needed" | "never";

const DataAttr = {
  COLOR_SCHEME: "data-color-scheme",
  SIZE: "data-size",
} as const;

abstract class Widget extends HTMLElement {
  static readonly CLASS_NAME: string = "widget";
  static readonly #STYLE = `
    :host {
      display: block;
    }
    :host(*[aria-hidden="true"]) {
      display: none;
    }

    *.${ Widget.CLASS_NAME }-container {
      --${ Widget.CLASS_NAME }-accent-color: #136ed2;
      --${ Widget.CLASS_NAME }-border-width: 1px;
      --${ Widget.CLASS_NAME }-corner-radius: 5px;
      --${ Widget.CLASS_NAME }-focusring-color: orange;
      --${ Widget.CLASS_NAME }-glow-blur-radius: 6px;
      --${ Widget.CLASS_NAME }-glow-extent: 3px;
      --${ Widget.CLASS_NAME }-main-bg-color: #fff;
      --${ Widget.CLASS_NAME }-main-bg-color-06: #fffa;
      --${ Widget.CLASS_NAME }-main-fg-color: #666;
      --${ Widget.CLASS_NAME }-ripple-opacity: 0.6;
      --${ Widget.CLASS_NAME }-size: ${ _WidgetDimension[_WidgetSize.MEDIUM] }px;
      --${ Widget.CLASS_NAME }-shadow: 0 2px 8px #0003, 0 1px 4px #0006;
      align-items: center;
      block-size: var(--${ Widget.CLASS_NAME }-size);
      display: flex;
      flex-flow: row nowrap;
      font-size: 16px;
      inline-size: 100%;
      justify-content: stretch;
      min-block-size: var(--${ Widget.CLASS_NAME }-size);
      min-inline-size: var(--${ Widget.CLASS_NAME }-size);
      position: relative;
    }
    :host(*[data-size="x-small"]) *.${ Widget.CLASS_NAME }-container {
      --${ Widget.CLASS_NAME }-corner-radius: 3px;
      --${ Widget.CLASS_NAME }-size: ${ _WidgetDimension[_WidgetSize.X_SMALL] }px;
      font-size: 12px;
    }
    :host(*[data-size="small"]) *.${ Widget.CLASS_NAME }-container {
      --${ Widget.CLASS_NAME }-corner-radius: 4px;
      --${ Widget.CLASS_NAME }-size: ${ _WidgetDimension[_WidgetSize.SMALL] }px;
      font-size: 14px;
    }
    :host(*[data-size="large"]) *.${ Widget.CLASS_NAME }-container {
      --${ Widget.CLASS_NAME }-corner-radius: 6px;
      --${ Widget.CLASS_NAME }-size: ${ _WidgetDimension[_WidgetSize.LARGE] }px;
      font-size: 18px;
    }
    :host(*[data-size="x-large"]) *.${ Widget.CLASS_NAME }-container {
      --${ Widget.CLASS_NAME }-corner-radius: 7px;
      --${ Widget.CLASS_NAME }-size: ${ _WidgetDimension[_WidgetSize.X_LARGE] }px;
      font-size: 20px;
    }

    *.${ Widget.CLASS_NAME }-event-target {
      cursor: pointer;
      display: flex;
      flex-flow: row nowrap;
      inset: 0;
      position: absolute;
      padding-inline: 12px;
    }
    *.${ Widget.CLASS_NAME }-event-target[contenteditable] {
      /* textareaを使うなら不要
      cursor: text;
      white-space: pre;
      */
    }
    *.${ Widget.CLASS_NAME }-event-target:focus {
      box-shadow: 0 0 0 2px var(--${ Widget.CLASS_NAME }-focusring-color);
      outline: none;
    }
    :host(*[aria-busy="true"]) *.${ Widget.CLASS_NAME }-container *.${ Widget.CLASS_NAME }-event-target,
    :host(*[aria-busy="true"][aria-disabled="true"]) *.${ Widget.CLASS_NAME }-container *.${ Widget.CLASS_NAME }-event-target,
    :host(*[aria-busy="true"][aria-readonly="true"]) *.${ Widget.CLASS_NAME }-container *.${ Widget.CLASS_NAME }-event-target,
    :host(*[aria-busy="true"][aria-disabled="true"][aria-readonly="true"]) *.${ Widget.CLASS_NAME }-container *.${ Widget.CLASS_NAME }-event-target {
      cursor: wait;
    }
    :host(*[aria-disabled="true"]) *.${ Widget.CLASS_NAME }-container *.${ Widget.CLASS_NAME }-event-target,
    :host(*[aria-disabled="true"][aria-readonly="true"]) *.${ Widget.CLASS_NAME }-container *.${ Widget.CLASS_NAME }-event-target {
      cursor: not-allowed;
    }
    :host(*[aria-readonly="true"]) *.${ Widget.CLASS_NAME }-container *.${ Widget.CLASS_NAME }-event-target {
      cursor: default;
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

    *.${ Widget.CLASS_NAME }-glow {
      background-color: currentcolor;
      border-radius: var(--${ Widget.CLASS_NAME }-corner-radius);
      box-shadow: 0 0 0 0 currentcolor;
      color: var(--${ Widget.CLASS_NAME }-main-bg-color);
      inset: 0;
      opacity: 0;
      position: absolute;
      transition: box-shadow 200ms, opacity 200ms;
    }
    *.${ Widget.CLASS_NAME }-event-target:hover + *.widget *.${ Widget.CLASS_NAME }-glow {
      box-shadow: 0 0 0 var(--${ Widget.CLASS_NAME }-glow-extent) currentcolor;
      opacity: 1;
    }
    :host(*[aria-busy="true"]) *.${ Widget.CLASS_NAME }-event-target:hover + *.widget *.${ Widget.CLASS_NAME }-glow,
    :host(*[aria-disabled="true"]) *.${ Widget.CLASS_NAME }-event-target:hover + *.widget *.${ Widget.CLASS_NAME }-glow,
    :host(*[aria-readonly="true"]) *.${ Widget.CLASS_NAME }-event-target:hover + *.widget *.${ Widget.CLASS_NAME }-glow {
      box-shadow: 0 0 0 0 currentcolor !important;
      opacity: 0 !important;
    }
    *.${ Widget.CLASS_NAME }-glow::before {
      background-color: currentcolor;
      border-radius: var(--${ Widget.CLASS_NAME }-corner-radius);
      box-shadow: 0 0 0 0 currentcolor;
      color: var(--${ Widget.CLASS_NAME }-accent-color);
      content: "";
      inset: 0;
      opacity: 0;
      position: absolute;
      transition: box-shadow 200ms, opacity 200ms;
    }
    *.${ Widget.CLASS_NAME }-event-target:hover + *.widget *.${ Widget.CLASS_NAME }-glow::before {
      box-shadow: 0 0 0 var(--${ Widget.CLASS_NAME }-glow-blur-radius) currentcolor;
      opacity: 0.5;
    }
    :host(*[aria-busy="true"]) *.${ Widget.CLASS_NAME }-event-target:hover + *.widget *.${ Widget.CLASS_NAME }-glow::before,
    :host(*[aria-disabled="true"]) *.${ Widget.CLASS_NAME }-event-target:hover + *.widget *.${ Widget.CLASS_NAME }-glow::before,
    :host(*[aria-readonly="true"]) *.${ Widget.CLASS_NAME }-event-target:hover + *.widget *.${ Widget.CLASS_NAME }-glow::before {
      box-shadow: 0 0 0 0 currentcolor !important;
      opacity: 0 !important;
    }

    *.${ Widget.CLASS_NAME }-effects {
      inset: 0;
      position: absolute;
    }

    *.${ Widget.CLASS_NAME }-ripple {
      background-color: var(--${ Widget.CLASS_NAME }-accent-color);
      border-radius: 50%;
      position: absolute;
    }
  `;
  static readonly #styleSheet: CSSStyleSheet = new CSSStyleSheet();

  protected readonly _init: Readonly<Widget.Init>;

  readonly #root: ShadowRoot;
  #connected: boolean;
  #size: Widget.Size;
  #busy: boolean;
  #disabled: boolean; // Aria仕様では各サブクラスで定義されるが、disabledにならない物は実装予定がないのでここで定義する
  #hidden: boolean;
  #label: string;
  #readOnly: boolean; // Aria仕様では各サブクラスで定義されるが、readOnlyにならない物は実装予定がないのでここで定義する
  #textCompositing: boolean;
  readonly #actions: Map<string, Set<Widget.Action>>;
  #reflectingInProgress: string;
  readonly #main: Element;
  readonly #eventTarget: HTMLElement;
  readonly #dataListSlot: HTMLSlotElement;

  protected static _ReflectionsOnConnected: Widget.Reflections = {
    content: "always",
    attr: "never",
  };
  protected static _ReflectionsOnAttrChanged: Widget.Reflections = {
    content: "if-needed",
    attr: "never",
  };
  protected static _ReflectionsOnPropChanged: Widget.Reflections = {
    content: "if-needed",
    attr: "if-needed",
  };

  static {
    Widget.#styleSheet.replaceSync(Widget.#STYLE);
  }

  protected _buildEventTarget(): HTMLElement {
    const eventTarget = this.ownerDocument.createElement("div");
    eventTarget.classList.add(`${ Widget.CLASS_NAME }-event-target`);

    // eventTarget.addEventListener("focus", (event: FocusEvent) => {
    //   if ((this.#busy === true) || (this.#disabled === true) || (this.#readOnly === true)) {
    //     return;
    //   }
    //   const focusActions = this.#actions.get("focus");
    //   if (focusActions && (focusActions.size ?? 0) > 0) {
    //     const filteredActions = [...focusActions];
    //     for (const action of filteredActions) {
    //       action.func(event);
    //     }
    //   }
    // }, { passive: true });

    if (this._init.autoPointerCapture === true) {
      eventTarget.addEventListener("pointerdown", (event: PointerEvent) => {
        if ((this.#busy === true) || (this.#disabled === true) || (this.#readOnly === true)) {
          return;
        }
        eventTarget.setPointerCapture(event.pointerId);console.log(545)
      }, { passive: true });
    }

    eventTarget.addEventListener("click", ((event: PointerEvent) => { //XXX はぁ？
      if ((this.#busy === true) || (this.#disabled === true) || (this.#readOnly === true)) {
        return;
      }
      const clickActions = this.#actions.get("click");
      if (clickActions && (clickActions.size ?? 0) > 0) {
        const filteredActions = [...clickActions];
        if (filteredActions.some((action) => action.noPreventDefault !== true) === true) {
          event.preventDefault();
        }
        for (const action of filteredActions) {
          action.func(event);
        }
      }
    }) as EventListener, { passive: false });

    eventTarget.addEventListener("input", (event: Event) => {
      console.log(event)
    }, { passive: true });

    eventTarget.addEventListener("keydown", (event: KeyboardEvent) => {
      if ((this.#busy === true) || (this.#disabled === true) || (this.#readOnly === true)) {
        return;
      }
      const keyDownActions = this.#actions.get("keydown");
      if (keyDownActions && (keyDownActions.size ?? 0) > 0) {
        const filteredActions = [...keyDownActions].filter((action) => action.keys?.includes(event.key));
        if (filteredActions.some((action) => action.noPreventDefault !== true) === true) {
          event.preventDefault();
        }
        if (filteredActions.some((action) => action.allowRepeat !== true) && (event.repeat === true)) {
          return;
        }
        for (const action of filteredActions) {
          action.func(event);
        }
      }
    }, { passive: false });

    if (this._init.textEditable === true) {
      eventTarget.setAttribute("contenteditable", "true");

      eventTarget.addEventListener("compositionstart", (event: CompositionEvent) => {
        void event;
        console.log("compositionstart");
        this.#textCompositing = true;
      }, { passive: true });

      eventTarget.addEventListener("compositionend", (event: CompositionEvent) => {
        void event;
        console.log("compositionend");
        this.#textCompositing = false;
      }, { passive: true });
    }

    return eventTarget;
  }

  constructor(init: Widget.Init) {
    super();
    this._init = Object.freeze(globalThis.structuredClone(init));
    this.#root = this.attachShadow(_ShadowRootInit);
    this.#connected = false;
    this.#size = Widget.Size.MEDIUM;
    this.#busy = false;
    this.#disabled = false;
    this.#hidden = false;
    this.#label = "";
    this.#readOnly = false;
    this.#textCompositing = false;
    this.#actions = new Map([
      ["click", new Set()],
      //["focus", new Set()],
      ["input", new Set()],
      ["keydown", new Set()],
    ]);
    this.#reflectingInProgress = "";

    this._appendStyleSheet(Widget.#styleSheet);

    const container = this.ownerDocument.createElement("div");
    container.setAttribute("draggable", "false");
    container.classList.add(`${ Widget.CLASS_NAME }-container`);
    container.classList.add(`${ this._init.className }-container`);

    const dataList = this.ownerDocument.createElement("datalist");
    dataList.hidden = true;
    dataList.classList.add(`${ Widget.CLASS_NAME }-datalist`);

    this.#dataListSlot = this.ownerDocument.createElement("slot");
    this.#dataListSlot.name = "datalist";
    dataList.append(this.#dataListSlot);

    this.#eventTarget = this._buildEventTarget();

    this.#main = this.ownerDocument.createElement("div");
    this.#main.classList.add(Widget.CLASS_NAME);
    this.#main.classList.add(this._init.className);

    container.append(dataList, this.#eventTarget, this.#main);

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

  protected get _size(): Widget.Size {
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

  get readOnly(): boolean {
    return this.#readOnly;
  }

  set readOnly(value: boolean) {
    const adjustedReadOnly = !!value;//(value === true);
    this._setReadOnly(adjustedReadOnly, Widget._ReflectionsOnPropChanged);
  }

  protected get _reflectingInProgress(): string {
    return this.#reflectingInProgress;
  }

  protected get _main(): Element {
    return this.#main;
  }

  get #assignedOptionElements(): Array<HTMLOptionElement> {
    //TODO slotchangeがおきるまで要素への参照キャッシュする
    const assignedElements = this.#dataListSlot.assignedElements();
    return assignedElements.filter((element) => {
      return (element.localName === "option");//XXX これだけだとoptionだとの確証がないが実用上は問題ないか
    }) as Array<HTMLOptionElement>;
    //XXX 値重複は警告する？
  }

  protected get _textCompositing(): boolean {
    return this.#textCompositing;
  }

  // キャッシュしない（slotAssignされた要素が参照はそのままで更新されることもあるので。キャッシュするならMutation監視が要る）
  protected _getDataListItems(options?: Widget.DataListItemMergeOptions): Array<Widget.DataListItem> {
    const items: Array<Widget.DataListItem> = this.#assignedOptionElements.map((element) => {
      return {
        value: element.value,
        label: element.label,
        disabled: element.disabled,
        selected: element.selected,
      };
    });
    
    if (options?.defaultItems && Array.isArray(options.defaultItems) === true) {
      if ((items.length < options.defaultItems.length) && (options?.mergeDefaultItems === true)) {
        for (let i = items.length; i < options.defaultItems.length; i++) {
          items.push(options.defaultItems[i] as Widget.DataListItem);
        }
      }
    }
    return items;
  }

  protected _addAction(name: string, action: Widget.Action): void {
    const actionSet = this.#actions.get(name) as Set<Widget.Action>;
    if (["keydown"].includes(name) === true) {
      if (Array.isArray(action.keys) !== true) {
        throw new Error("TODO");
      }
    }
    actionSet.add(action);
  }

  static get observedAttributes(): Array<string> {
    return [
      Aria.Property.LABEL, // 外部labelを使用する場合は使用しない
      Aria.Property.READONLY,
      Aria.State.BUSY,
      Aria.State.DISABLED,
      Aria.State.HIDDEN,
      DataAttr.SIZE,
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
    if (this._init.inputable === true) {
      this.#setReadOnlyFromString(this.getAttribute(Aria.Property.READONLY) ?? "", Widget._ReflectionsOnConnected);
    }
    this.#setSize(this.getAttribute(DataAttr.SIZE) ?? "", Widget._ReflectionsOnConnected);

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

      case Aria.Property.READONLY:
        this.#setReadOnlyFromString(newValue, Widget._ReflectionsOnAttrChanged);
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

      case DataAttr.SIZE:
        this.#setSize(newValue, Widget._ReflectionsOnAttrChanged);
        break;

      default:
        break;
    }
  }

  #setBusyFromString(value: string, reflections: Widget.Reflections): void {
    this.#setBusy((value === "true"), reflections);
  }

  #setBusy(value: boolean, reflections: Widget.Reflections): void {
    const changed = (this.#busy !== value);
    if (changed === true) {
      this.#busy = value;
    }
    if ((reflections.content === "always") || (reflections.content === "if-needed" && changed === true)) {
      this._reflectBusyToContent();
    }
    if ((reflections.attr === "always") || (reflections.attr === "if-needed" && changed === true)) {
      this.#reflectToAriaBusy();
    }
  }

  #setDisabledFromString(value: string, reflections: Widget.Reflections): void {
    this.#setDisabled((value === "true"), reflections);
  }

  #setDisabled(value: boolean, reflections: Widget.Reflections): void {
    const changed = (this.#disabled !== value);
    if (changed === true) {
      this.#disabled = value;
    }
    if ((reflections.content === "always") || (reflections.content === "if-needed" && changed === true)) {
      this._reflectDisabledToContent();
    }
    if ((reflections.attr === "always") || (reflections.attr === "if-needed" && changed === true)) {
      this.#reflectToAriaDisabled();
    }
  }

  #setHiddenFromString(value: string, reflections: Widget.Reflections): void {
    this.#setHidden((value === "true"), reflections);
  }

  #setHidden(value: boolean, reflections: Widget.Reflections): void {
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

  #setLabel(value: string, reflections: Widget.Reflections): void {
    const changed = (this.#label !== value);
    if (changed === true) {
      this.#label = value;
    }
    // if ((reflections.content === "always") || (reflections.content === "if-needed" && changed === true)) {
    // }
    if ((reflections.attr === "always") || (reflections.attr === "if-needed" && changed === true)) {
      this.#reflectToAriaLabel();
    }
  }

  #setReadOnlyFromString(value: string, reflections: Widget.Reflections): void {
    this._setReadOnly((value === "true"), reflections);
  }

  protected _setReadOnly(value: boolean, reflections: Widget.Reflections): void {
    if (this._init.inputable === true) {
      const changed = (this.#readOnly !== value);
      if (changed === true) {
        this.#readOnly = value;
      }
      if ((reflections.content === "always") || (reflections.content === "if-needed" && changed === true)) {
        this.#reflectReadOnlyToContent();
      }
      if ((reflections.attr === "always") || (reflections.attr === "if-needed" && changed === true)) {
        this.#reflectToAriaReadonly();
      }
    }
  }

  #setSize(value: string, reflections: Widget.Reflections): void {
    const valueIsWidgetSize = Object.values(Widget.Size).includes(value as Widget.Size);
    const adjustedSize = (valueIsWidgetSize === true) ? (value as Widget.Size) : Widget.Size.MEDIUM;
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
    this.setAttribute("role", this._init.role);
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

  #resetFocusable(): void {
    if (this.#eventTarget) {
      if ((this.#busy === true) || (this.#disabled === true)) {
        this.#eventTarget.removeAttribute("tabindex");
      }
      else {
        this.#eventTarget.setAttribute("tabindex", "0");
      }
    }
  }

  #resetEditable(): void {
    if (this.#eventTarget && (this._init.textEditable === true)) {
      if ((this.busy === true) || (this.disabled === true) || (this.#readOnly === true)) {
        this.#eventTarget.removeAttribute("contenteditable");
      }
      else {
        this.#eventTarget.setAttribute("contenteditable", "true");
      }
    }
  }

  protected _reflectBusyToContent(): void {
    this.#resetFocusable();
    this.#resetEditable();
  }

  protected _reflectDisabledToContent(): void {
    this.#resetFocusable();
    this.#resetEditable();
  }

  #reflectReadOnlyToContent(): void {
    this.#resetEditable();
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

  #reflectToAriaReadonly(): void {
    this._reflectToAttr(Aria.Property.READONLY, ((this.#readOnly === true) ? "true" : undefined));
  }

  #reflectToDataSize(): void {
    this._reflectToAttr(DataAttr.SIZE, ((this.#size !== Widget.Size.MEDIUM) ? this.#size : undefined));
  }

  protected _addRipple(): void {
    if ((this._connected !== true) || (this.hidden === true)) {//XXX this.hiddenかどうかでなくcheckVisibilityで safariが対応したら
      return;
    }

    const ripple = this.ownerDocument.createElement("div");
    ripple.classList.add(`${ Widget.CLASS_NAME }-ripple`);
    (this._main.querySelector(`*.${ Widget.CLASS_NAME }-effects`) as Element).append(ripple);
    globalThis.setTimeout(() => {
      ripple.remove();
    }, 1000);
  }

  protected _dispatchChangeEvent(): void {
    this.dispatchEvent(new Event("change", {
      bubbles: true,
    }));
  }
}
namespace Widget {
  export const Size = _WidgetSize;
  export type Size = typeof Size[keyof typeof Size];

  export type DataListItem = {
    label: string,
    value: string,
    disabled?: boolean,
    selected?: boolean,
  };

  export type DataListItemMergeOptions = {
    defaultItems?: Array<Widget.DataListItem>,
    mergeDefaultItems?: boolean,
  };

  export const Dimension = _WidgetDimension;

  export type Init = {
    role: Aria.Role,
    className: string,
    autoPointerCapture: boolean,
    inputable: boolean,
    textEditable: boolean,
  };

  export type Reflections = {
    content: ContentReflection,
    attr: AttrReflection,
  };

  export type Action = {
    func: (event: Event) => void,
    keys?: Array<string>,
    noPreventDefault?: boolean,
    allowRepeat?: boolean,
    //TODO AbortSignal
  };

}
Object.freeze(Widget);

export { Widget };
