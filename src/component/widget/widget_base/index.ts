import { Ns } from "../../../ns";
import { Aria, type Role } from "../../../aria";
import BasePresentation from "./presentation";

type _Point = {
  x: number,
  y: number,
};

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

type _CapturingPointer = {
  readonly id: number,
  readonly type: string,
  readonly startViewportX: number,//XXX 不要では
  readonly startViewportY: number,//XXX 不要では
  readonly startTimestamp: number,

  leaved: boolean,//XXX 不要（leavedを読んでる側で判定できる）
  readonly targetBoundingBox: _BoundingBox,
};

type _BoundingBox = {
  readonly left: number,
  readonly right: number,
  readonly top: number,
  readonly bottom: number,
};

const _WidgetDirection = {
  LTR: "ltr",
  RTL: "rtl",
} as const;
type _WidgetDirection = typeof _WidgetDirection[keyof typeof _WidgetDirection];

abstract class Widget extends HTMLElement {
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
  static readonly #KEY = Symbol();
  static readonly #bgDocument: Document = new Document();
  static readonly #componentTemplateMap: Map<symbol, HTMLTemplateElement> = new Map();
  static readonly #componentStyleSheetMap: Map<symbol, CSSStyleSheet> = new Map();

  protected readonly _init: Readonly<Widget.Init>;
  readonly #root: ShadowRoot;
  readonly #dataListSlot: HTMLSlotElement;
  readonly #eventTarget: HTMLElement;
  readonly #main: Element;
  readonly #actions: Map<string, Set<Widget.Action>>;
  #connected: boolean;
  #size: BasePresentation.BaseSize;
  #busy: boolean;
  #disabled: boolean; // Aria仕様では各サブクラスで定義されるが、disabledにならない物は実装予定がないのでここで定義する
  #hidden: boolean;
  #label: string;
  #readOnly: boolean; // Aria仕様では各サブクラスで定義されるが、readOnlyにならない物は実装予定がないのでここで定義する
  #capturingPointer: _CapturingPointer | null; // trueの状態でdisable等にした場合に非対応
  #textCompositing: boolean; // trueの状態でdisable等にした場合に非対応
  #reflectingInProgress: string;
  #direction: _WidgetDirection;
  #blockProgression: string;

  static {
    Widget._addStyleSheet(Widget.#KEY, BasePresentation.STYLE);
  }

  constructor(init: Widget.Init) {
    super();
    this._init = Object.assign({}, init);
    this.#root = this.attachShadow(_ShadowRootInit);
    this.#connected = false;
    this.#size = BasePresentation.BaseSize.MEDIUM;
    this.#busy = false;
    this.#disabled = false;
    this.#hidden = false;
    this.#label = "";
    this.#readOnly = false;
    this.#capturingPointer = null;
    this.#textCompositing = false;
    this.#actions = new Map([
      ["click", new Set()],
      //["focus", new Set()],
      ["input", new Set()],
      ["keydown", new Set()],
      ["pointercancel", new Set()],
      ["pointerdown", new Set()],
      ["pointermove", new Set()],
      ["pointerup", new Set()],
    ]);
    this.#reflectingInProgress = "";
    this.#direction = _WidgetDirection.LTR;
    this.#blockProgression = "";

    this.#adoptStyleSheets();

    const rootElement = this.#useTemplate();
    this.#dataListSlot = rootElement.querySelector('slot[name="datalist"]') as HTMLSlotElement;
    this.#eventTarget = this._buildEventTarget();
    rootElement.querySelector("*.placeholder-t0")?.replaceWith(this.#eventTarget);
    this.#main = rootElement.querySelector("*.internal0.internal") as Element;

    this.#root.append(rootElement);
  }






  protected static _addStyleSheet(componentKey: symbol, cssText: string): void {
    const styleSheet = new CSSStyleSheet();
    styleSheet.replaceSync(cssText);
    Widget.#componentStyleSheetMap.set(componentKey, styleSheet);
  }

  protected static _addTemplate(componentKey: symbol, templateContentHtml: string): void {
    const template = Widget.#bgDocument.createElementNS(Ns.HTML, "template") as HTMLTemplateElement;
    template.innerHTML = BasePresentation.createTemplateHtml(templateContentHtml);
    Widget.#componentTemplateMap.set(componentKey, template);
  }

  #useTemplate(): DocumentFragment {
    const template = Widget.#componentTemplateMap.get(this._init.componentKey);
    if (!template) {
      throw new Error("TODO");
    }
    return template.content.cloneNode(true) as DocumentFragment;
  }
  #adoptStyleSheets(): void {
    const baseStyleSheet = Widget.#componentStyleSheetMap.get(Widget.#KEY) as CSSStyleSheet;
    this.#root.adoptedStyleSheets.push(baseStyleSheet);
    const componentStyleSheet = Widget.#componentStyleSheetMap.get(this._init.componentKey) as CSSStyleSheet;
    this.#root.adoptedStyleSheets.push(componentStyleSheet);
  }


  protected _buildEventTarget(): HTMLElement {
    const eventTarget = this.ownerDocument.createElement("div");
    eventTarget.classList.add(BasePresentation.ClassName.TARGET);

    eventTarget.addEventListener("pointerdown", (event: PointerEvent) => {
      if ((this.#busy === true) || (this.#disabled === true) || (this.#readOnly === true)) {
        return;
      }

      if ((this.#capturingPointer === null) && (event.isPrimary === true)) {
        console.log(`widget.pointerdown ${event.pointerType}-${event.pointerId}`);
        this._setPointerCapture(event);
        console.log(Object.assign({}, this._capturingPointer));
      }
    }, { passive: true });

    // touchだと無条件でpointercaptureされるので、gotpointercaptureで#capturingPointerにセットするのはNG

    // pointerupやpointercancelでは自動的にreleaseされる
    eventTarget.addEventListener("lostpointercapture", (event: PointerEvent) => {
      // if ((this.#busy === true) || (this.#disabled === true) || (this.#readOnly === true)) {
      //   return;
      // }

      if (this._isCapturingPointer(event) === true) {
        console.log(`widget.lostpointercapture ${event.pointerType}-${event.pointerId}`);
        console.log(Object.assign({}, this._capturingPointer));
        this.#capturingPointer = null;
      }
    }, { passive: true });

    eventTarget.addEventListener("pointerup", (event: PointerEvent) => {
      if ((this.#busy === true) || (this.#disabled === true) || (this.#readOnly === true)) {
        return;
      }

      if (this._isCapturingPointer(event) === true) {
        console.log(`widget.pointerup ${event.pointerType}-${event.pointerId}`);
        console.log(Object.assign({}, this._capturingPointer));
        const capturingPointer = this.#capturingPointer as _CapturingPointer;
        capturingPointer.leaved = (this._elementIntersectsPoint(eventTarget, { x: event.clientX, y: event.clientY }) !== true);
      }
    }, { passive: true });
    // pointercancelの場合は#capturingPointerは使わない

    eventTarget.addEventListener("pointermove", (event: PointerEvent) => {
      if ((this.#busy === true) || (this.#disabled === true) || (this.#readOnly === true)) {
        return;
      }

      if (this._isCapturingPointer(event) === true) {
        console.log(`widget.pointermove ${event.pointerType}-${event.pointerId}`);
        console.log(Object.assign({}, this._capturingPointer));
      }
    }, { passive: true });

    // if (this._init.textEditable === true) {
    //   eventTarget.setAttribute("contenteditable", "true");

    //   eventTarget.addEventListener("compositionstart", (event: CompositionEvent) => {
    //     void event;
    //     console.log("compositionstart");
    //     this.#textCompositing = true;
    //   }, { passive: true });

    //   eventTarget.addEventListener("compositionend", (event: CompositionEvent) => {
    //     void event;
    //     console.log("compositionend");
    //     this.#textCompositing = false;
    //   }, { passive: true });
    // }

    this.#setEventListener<PointerEvent>("click", eventTarget, false);
    this.#setEventListener<InputEvent>("input", eventTarget, true);
    this.#setEventListener<KeyboardEvent>("keydown", eventTarget, false);
    this.#setEventListener<PointerEvent>("pointercancel", eventTarget, true);
    this.#setEventListener<PointerEvent>("pointerdown", eventTarget, true);
    this.#setEventListener<PointerEvent>("pointermove", eventTarget, true);
    this.#setEventListener<PointerEvent>("pointerup", eventTarget, true);

    return eventTarget;
  }

  #getEventTargetBoundingBox(): _BoundingBox {
    const { left, right, top, bottom } = this.#eventTarget.getBoundingClientRect();
    return Object.freeze({
      left,
      right,
      top,
      bottom,
    });
  }

  protected _isCapturingPointer(event: PointerEvent): boolean {
    if (this.#capturingPointer) {
      return (this.#capturingPointer.type === event.pointerType) && (this.#capturingPointer.id === event.pointerId);
    }
    return false;
  }

  protected get _capturingPointer(): _CapturingPointer | null {
    return this.#capturingPointer;
  }

  protected _setPointerCapture(event: PointerEvent): void {
    this.#eventTarget.setPointerCapture(event.pointerId);
    const viewportX = event.clientX;
    const viewportY = event.clientY;
    this.#capturingPointer = {
      type: event.pointerType,
      id: event.pointerId,
      startViewportX: viewportX,
      startViewportY: viewportY,
      startTimestamp: event.timeStamp,
      targetBoundingBox: this.#getEventTargetBoundingBox(),
      leaved: false,
    };
    //console.log(`x:${event.offsetX}, y:${event.offsetY}, targetW:${this.#eventTarget.offsetWidth}, targetH:${this.#eventTarget.offsetHeight}`)
  }

  //TODO stopPropagation ・・・すくなくともclickは。他？
  //     全部stopして発火しなおす？
  #setEventListener<T extends Event>(eventType: string, target: EventTarget, passive: boolean) {
    target.addEventListener(eventType, ((event: T) => {
      if ((this.#busy === true) || (this.#disabled === true) || (this.#readOnly === true)) {
        return;
      }
      if (event instanceof PointerEvent) {
        if (["click", "auxclick", "contextmenu"].includes(event.type) === true) {
          //
        }
        else if (event.isPrimary !== true) {
          return;
        }
      }
      if ((event instanceof MouseEvent) && (event.detail > 1)) {
        return;
      }
      const isKeyboardEvent = (event instanceof KeyboardEvent);
      const actions = this.#actions.get(eventType);
      if (actions && (actions.size ?? 0) > 0) {
        const filteredActions = (isKeyboardEvent === true) ? [...actions].filter((action) => action.keys?.includes((event as unknown as KeyboardEvent).key)) : [...actions];
        if (filteredActions.some((action) => action.doPreventDefault === true) === true) {
          event.preventDefault();
        }
        if (filteredActions.some((action) => action.doStopPropagation === true) === true) {
          event.stopPropagation();
        }
        if ((isKeyboardEvent === true) && filteredActions.some((action) => action.allowRepeat !== true) && ((event as unknown as KeyboardEvent).repeat === true)) {
          return;
        }
        for (const action of filteredActions) {
          action.func(event);
        }
      }
    }) as EventListener, { passive });
  }

  _elementIntersectsPoint(element: Element, { x, y }: _Point): boolean {
    return this.#root.elementsFromPoint(x, y).includes(element);
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

  protected get _size(): BasePresentation.BaseSize {
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

  protected _addAction<T extends Event>(name: string, action: Widget.Action<T>): void {
    const actionSet = this.#actions.get(name) as Set<Widget.Action<T>>;
    if (["keydown"].includes(name) === true) {
      if (Array.isArray(action.keys) !== true) {
        throw new Error("TODO");
      }
    }
    actionSet.add(action);
  }

  static get observedAttributes(): Array<string> {
    return [
      Aria.LABEL, // 外部labelを使用する場合は使用しない
      Aria.READONLY,
      Aria.BUSY,
      Aria.DISABLED,
      Aria.HIDDEN,
      DataAttr.SIZE,
    ];
  }

  connectedCallback(): void {
    if (this.isConnected !== true) {
      return;
    }

    this.#reflectToRole();

    this.#setBusyFromString(this.getAttribute(Aria.BUSY) ?? "", Widget._ReflectionsOnConnected);
    this.#setDisabledFromString(this.getAttribute(Aria.DISABLED) ?? "", Widget._ReflectionsOnConnected);
    this.#setHiddenFromString(this.getAttribute(Aria.HIDDEN) ?? "", Widget._ReflectionsOnConnected);
    this.#setLabel(this.getAttribute(Aria.LABEL) ?? "", Widget._ReflectionsOnConnected);
    if (this._init.inputable === true) {
      this.#setReadOnlyFromString(this.getAttribute(Aria.READONLY) ?? "", Widget._ReflectionsOnConnected);
    }
    this._setSize(this.getAttribute(DataAttr.SIZE) ?? "", Widget._ReflectionsOnConnected);

    const style = this.ownerDocument.defaultView?.getComputedStyle(this);
    if (style) {
      const direction = style.getPropertyValue("direction");
      this.#direction = (direction === _WidgetDirection.RTL) ? _WidgetDirection.RTL : _WidgetDirection.LTR;
      const writingMode = style.getPropertyValue("writing-mode");
      switch (writingMode) {
        case "horizontal-tb":
          this.#blockProgression = "tb";
          break;
        case "vertical-rl":
        case "sideways-rl":
          this.#blockProgression = "rl";
          break;
        case "vertical-lr":
        case "sideways-lr":
          this.#blockProgression = "lr";
          break;
        default:
          this.#blockProgression = "tb";
          break;
      }
    }
    else {
      this.#blockProgression = "tb";
    }

    //this.#connected = true;
  }

  protected get _direction(): _WidgetDirection {
    return this.#direction;//XXX connectedの後に変更された場合の検知が困難
  }

  protected get _blockProgression(): string {
    return this.#blockProgression;//XXX connectedの後に変更された場合の検知が困難
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
      case Aria.LABEL:
        this.#setLabel(newValue, Widget._ReflectionsOnAttrChanged);
        break;

      case Aria.READONLY:
        this.#setReadOnlyFromString(newValue, Widget._ReflectionsOnAttrChanged);
        break;

      case Aria.BUSY:
        this.#setBusyFromString(newValue, Widget._ReflectionsOnAttrChanged);
        break;

      case Aria.DISABLED:
        this.#setDisabledFromString(newValue, Widget._ReflectionsOnAttrChanged);
        break;

      case Aria.HIDDEN:
        this.#setHiddenFromString(newValue, Widget._ReflectionsOnAttrChanged);
        break;

      case DataAttr.SIZE:
        this._setSize(newValue, Widget._ReflectionsOnAttrChanged);
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

  protected _setSize(value: string, reflections: Widget.Reflections): void {
    const valueIsWidgetSize = Object.values(BasePresentation.BaseSize).includes(value as BasePresentation.BaseSize);
    const adjustedSize = (valueIsWidgetSize === true) ? (value as BasePresentation.BaseSize) : BasePresentation.BaseSize.MEDIUM;
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
    this._reflectToAttr(Aria.BUSY, ((this.#busy === true) ? "true" : undefined));
  }

  #reflectToAriaDisabled(): void {
    this._reflectToAttr(Aria.DISABLED, ((this.#disabled === true) ? "true" : undefined));
  }

  #reflectToAriaHidden(): void {
    this._reflectToAttr(Aria.HIDDEN, ((this.#hidden === true) ? "true" : undefined));
  }

  #reflectToAriaLabel(): void {
    this._reflectToAttr(Aria.LABEL, (this.#label) ? this.#label : undefined);
  }

  #reflectToAriaReadonly(): void {
    this._reflectToAttr(Aria.READONLY, ((this.#readOnly === true) ? "true" : undefined));
  }

  #reflectToDataSize(): void {
    this._reflectToAttr(DataAttr.SIZE, ((this.#size !== BasePresentation.BaseSize.MEDIUM) ? this.#size : undefined));
  }

  protected _addRipple(): void {
    if ((this._connected !== true) || (this.hidden === true)) {//XXX this.hiddenかどうかでなくcheckVisibilityで safariが対応したら
      return;
    }

    const ripple = this.ownerDocument.createElement("div");
    ripple.classList.add(`${ BasePresentation.ClassName.CONTROL_EFFECT_RIPPLE }`);
    (this._main.querySelector(`*.${ BasePresentation.ClassName.CONTROL_EFFECTS }`) as Element).append(ripple);
    globalThis.setTimeout(() => {
      ripple.remove();
    }, 1000);
  }

  protected _dispatchCompatMouseEvent(type: string): void {
    this.dispatchEvent(new PointerEvent(type, {
      bubbles: true,
      cancelable: true,
      composed: true,
      pointerId: -1, //XXX Chromeは-1 他も？
      pointerType: "",
      //sourceCapabilities: null,
      view: this.ownerDocument.defaultView,
    }));
  }

  protected _dispatchChangeEvent(): void {
    this.dispatchEvent(new Event("change", {
      bubbles: true,
    }));
  }

}
namespace Widget {
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

  export type Init = {
    componentKey: symbol,
    role: Role,
    inputable: boolean,
    textEditable: boolean,
  };

  export type Reflections = {
    content: ContentReflection,
    attr: AttrReflection,
  };

  export type Action<T extends Event = Event> = {
    func: (event: T) => void,
    keys?: Array<string>,
    doPreventDefault?: boolean,
    doStopPropagation?: boolean,
    allowRepeat?: boolean,
    //XXX AbortSignal
  };

  export type CapturingPointer = _CapturingPointer;
  export type BoundingBox = _BoundingBox;
}
Object.freeze(Widget);

export { Widget };
