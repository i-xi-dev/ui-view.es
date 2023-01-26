import { Ns } from "../../../ns";
import BasePresentation from "./presentation";

const _Attr = {
  ARIA_BUSY: "aria-busy",
  DISABLED: "disabled",
  HIDDEN: "hidden",
} as const;










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

const DataAttr = {
  COLOR_SCHEME: "data-color-scheme",
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
  static readonly #KEY = Symbol();
  static readonly #backgroundDocument: Document = new Document();
  static readonly #componentTemplateMap: Map<symbol, HTMLTemplateElement> = new Map();
  static readonly #componentStyleSheetMap: Map<symbol, CSSStyleSheet> = new Map();

  protected readonly _init: Readonly<Widget.Init>;
  readonly #root: ShadowRoot;
  readonly #internals: ElementInternals;
  #dataListSlot: HTMLSlotElement | null;
  #eventTarget: HTMLElement | null;
  #main: Element | null;
  readonly #actions: Map<string, Set<Widget.Action>>;
  readonly #assignedOptionElements: Array<HTMLOptionElement>;
  #capturingPointer: _CapturingPointer | null; // trueの状態でdisable等にした場合に非対応
  #textCompositing: boolean; // trueの状態でdisable等にした場合に非対応
  #direction: _WidgetDirection;
  #blockProgression: string;

  static {
    Widget._addStyleSheet(Widget.#KEY, BasePresentation.STYLE);
  }

  constructor(init: Widget.Init) {
    super();
    this._init = Object.assign({}, init);
    this.#root = this.attachShadow(_ShadowRootInit);
    this.#internals = this.attachInternals();
    this.#internals.role = this._init.role;
    this.#dataListSlot = null;
    this.#eventTarget = null;
    this.#main = null;
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
    this.#assignedOptionElements = [];
    this.#direction = _WidgetDirection.LTR;
    this.#blockProgression = "";
  }

  static get observedAttributes(): Array<string> {
    return [
      _Attr.ARIA_BUSY,
      _Attr.DISABLED,
      _Attr.HIDDEN,
      "aria-label",
      "data-size",
    ];
  }

  get busy(): boolean {
    if (this.hasAttribute(_Attr.ARIA_BUSY) === true) {
      if (this.getAttribute(_Attr.ARIA_BUSY) === "false") {
        return false;
      }
      return true;
    }
    return false;
  }

  set busy(value: boolean) {
    if (!!value) {
      this.setAttribute(_Attr.ARIA_BUSY, "true");
    }
    else {
      this.removeAttribute(_Attr.ARIA_BUSY);
    }
  }

  get disabled(): boolean {
    return this.hasAttribute(_Attr.DISABLED);
  }

  set disabled(value: boolean) {
    this.toggleAttribute(_Attr.DISABLED, !!value);
  }

  get label(): string {
    return (this.getAttribute("aria-label") ?? "");
  }

  set label(value: string) {
    const labelString = (typeof value === "string") ? value : String(value);
    if (labelString.length > 0) {
      this.setAttribute("aria-label", labelString);
    }
    else {
      this.removeAttribute("aria-label");
    }
  }

  protected get _internals(): ElementInternals {
    return this.#internals;
  }
  //TODO nameの設定
  //TODO internals.setFormValue

  protected get _eventTarget(): HTMLElement | null {
    return this.#eventTarget;
  }

  protected get _capturingPointer(): _CapturingPointer | null {
    return this.#capturingPointer;
  }

  get size(): BasePresentation.BaseSize {
    const size = this.getAttribute("data-size");
    if (Object.values(BasePresentation.BaseSize).includes(size as BasePresentation.BaseSize) === true) {
      return size as BasePresentation.BaseSize;
    }
    return BasePresentation.BaseSize.MEDIUM;
  }

  set size(value: BasePresentation.BaseSize) {
    if (Object.values(BasePresentation.BaseSize).includes(value as BasePresentation.BaseSize) === true) {
      if (value !== BasePresentation.BaseSize.MEDIUM) {
        this.setAttribute("data-size", value);
        return;
      }
    }
    this.removeAttribute("data-size");
  }

  protected get _main(): Element | null {
    return this.#main;
  }

  protected get _textCompositing(): boolean {
    return this.#textCompositing;
  }

  protected get _direction(): _WidgetDirection {
    return this.#direction;//XXX connectedの後に変更された場合の検知が困難
  }

  protected get _blockProgression(): string {
    return this.#blockProgression;//XXX connectedの後に変更された場合の検知が困難
  }







  protected static _addStyleSheet(componentKey: symbol, cssText: string): void {
    const styleSheet = new CSSStyleSheet();
    styleSheet.replaceSync(cssText);
    Widget.#componentStyleSheetMap.set(componentKey, styleSheet);
  }

  protected static _addTemplate(componentKey: symbol, templateContentHtml: string): void {
    const template = Widget.#backgroundDocument.createElementNS(Ns.HTML, "template") as HTMLTemplateElement;
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


  protected _buildEventTarget(eventTarget: HTMLElement): void {
    eventTarget.addEventListener("pointerdown", (event: PointerEvent) => {
      if (this._ignoreUiEvent() === true) {
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
      // if (this._ignoreUiEvent() === true) {
      //   return;
      // }

      if (this._isCapturingPointer(event) === true) {
        console.log(`widget.lostpointercapture ${event.pointerType}-${event.pointerId}`);
        console.log(Object.assign({}, this._capturingPointer));
        this.#capturingPointer = null;
      }
    }, { passive: true });

    eventTarget.addEventListener("pointerup", (event: PointerEvent) => {
      if (this._ignoreUiEvent() === true) {
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
      if (this._ignoreUiEvent() === true) {
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
  }

  protected _ignoreUiEvent(): boolean {
    return ((this.busy === true) || (this.disabled === true));
  }

  #getEventTargetBoundingBox(): Readonly<_BoundingBox> {
    if (!!this.#eventTarget) {
      const { left, right, top, bottom } = this.#eventTarget.getBoundingClientRect();
      return Object.freeze({
        left,
        right,
        top,
        bottom,
      });
    }
    return Object.freeze({
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
    });
  }

  protected _isCapturingPointer(event: PointerEvent): boolean {
    if (this.#capturingPointer) {
      return (this.#capturingPointer.type === event.pointerType) && (this.#capturingPointer.id === event.pointerId);
    }
    return false;
  }

  protected _setPointerCapture(event: PointerEvent): void {
    if (!!this.#eventTarget) {
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
    }
  }

  //TODO stopPropagation ・・・すくなくともclickは。他？
  //     全部stopして発火しなおす？
  #setEventListener<T extends Event>(eventType: string, target: EventTarget, passive: boolean) {
    target.addEventListener(eventType, ((event: T) => {
      if (this._ignoreUiEvent() === true) {
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

  #render(): void {
    this.#adoptStyleSheets();

    const rootElement = this.#useTemplate();
    this.#dataListSlot = rootElement.querySelector('slot[name="datalist"]') as HTMLSlotElement;
    this.#eventTarget = rootElement.querySelector(`*.${ BasePresentation.ClassName.TARGET }`) as HTMLElement;
    this._buildEventTarget(this.#eventTarget);
    this.#main = rootElement.querySelector(`*.${ BasePresentation.ClassName.MAIN }`) as Element;

    this.#dataListSlot.addEventListener("slotchange", () => {
      this.#loadDataListSlot();
      this._reflectDataListSlotChanged();
    }, { passive: true });

    this.#root.append(rootElement);

    this._renderExtended();
  }

  protected abstract _renderExtended(): void;

  protected _reflectAllAttributesChanged(): void {
    this.#resetFocusable();
    this._reflectLabelChanged();
    this._reflectSizeChanged();
  }

  connectedCallback(): void {
    if (this.isConnected !== true) {
      return;
    }

    this.#render();

    this.#loadDataListSlot();//TODO readAllSlotsとか
    this.#reflectAllSlotsChanged();

    this._reflectAllAttributesChanged();







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

  }

  disconnectedCallback(): void {

  }

  adoptedCallback(): void {

  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
    switch (name) {
      case _Attr.ARIA_BUSY:
        this._reflectBusyChanged();
        break;

      case _Attr.DISABLED:
        this.#internals.ariaDisabled = (this.disabled === true) ? "true" : "false";
        this._reflectDisabledChanged();
        break;

      case _Attr.HIDDEN:
        this.#internals.ariaHidden = (super.hidden === true) ? "true" : "false";
        break;

      case "aria-label":
        this._reflectLabelChanged();
        break;

      case "data-size":
        this._reflectSizeChanged();
        break;

      default:
        break;
    }
  }

  protected _reflectDisabledChanged(): void {
    this.#resetFocusable();
  }

  protected _reflectBusyChanged(): void {
    this.#resetFocusable();
  }

  protected _reflectLabelChanged(): void {
  }

  protected _reflectSizeChanged(): void {
  }

  #resetFocusable(): void {
    if (!!this.#eventTarget) {
      if ((this.busy === true) || (this.disabled === true)) {
        this.#eventTarget.removeAttribute("tabindex");
      }
      else {
        this.#eventTarget.setAttribute("tabindex", "0");
      }
    }
  }

  protected _addRipple(): void {
    if (!!this.#main) {
      if ((this.isConnected !== true) || (this.hidden === true)) {//XXX this.hiddenかどうかでなくcheckVisibilityで safariが対応したら
        return;
      }
  
      const ripple = this.ownerDocument.createElement("div");
      ripple.classList.add(`${ BasePresentation.ClassName.CONTROL_EFFECT_RIPPLE }`);
      (this.#main.querySelector(`*.${ BasePresentation.ClassName.CONTROL_EFFECTS }`) as Element).append(ripple);
      globalThis.setTimeout(() => {
        ripple.remove();
      }, 1000);
    }
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

  #loadDataListSlot(): void {
    if (!!this.#dataListSlot) {
      this.#assignedOptionElements.splice(0);
      for (const element of this.#dataListSlot.assignedElements()) {
        if (element instanceof HTMLOptionElement) {
          this.#assignedOptionElements.push(element);
        }
      }
      //XXX 値重複は警告する？
    }
  }

  #reflectAllSlotsChanged(): void {
    this._reflectDataListSlotChanged();
  }
  protected _reflectDataListSlotChanged(): void {
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
    role: string,
    formAssociated: boolean,
    inputable: boolean,
    textEditable: boolean,
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
