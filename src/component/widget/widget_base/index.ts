import { Ns } from "../../../ns";
import { Viewport } from "../../../viewport";
import { Pointer } from "../../../pointer";
import BasePresentation from "./presentation";

const _Attr = {
  ARIA_BUSY: "aria-busy",
  ARIA_LABEL: "aria-label",
  DATA_SIZE: "data-size",
  DISABLED: "disabled",
  FORM: "form",
  HIDDEN: "hidden",
  NAME: "name",
} as const;

const _State = {
  DISABLED: "--disabled",
  ENABLED: "--enabled",
} as const;

const _ShadowRootInit: ShadowRootInit = {
  mode: "closed",
  delegatesFocus: true,
  slotAssignment: "manual",
};

type _XElementInternals = ElementInternals & {
  states: Set<string>,
};









const WidgetColorScheme = {
  AUTO: "auto",
  DARK: "dark",
  LIGHT: "light",
} as const;
type WidgetColorScheme = typeof WidgetColorScheme[keyof typeof WidgetColorScheme];

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
  protected _inDisabledContext: boolean;
  #mutationObserver: MutationObserver;
  #dataListSlot: HTMLSlotElement | null;
  #eventTarget: HTMLElement | null;
  #main: Element | null;
  readonly #pointerActions: Map<string, Set<Widget.PointerAction>>;
  readonly #keyboardActions: Map<string, Set<Widget.KeyboardAction>>;
  readonly #assignedOptionElements: Array<HTMLOptionElement>;
  //$02 #capturedPointer: CapturedPointer | null; // trueの状態でdisable等にした場合に非対応
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
    this._inDisabledContext = false;
    this.#mutationObserver = new MutationObserver((records) => {
      this._onMutate();
    });

    this.#dataListSlot = null;
    this.#eventTarget = null;
    this.#main = null;
    //$02 this.#capturedPointer = null;
    this.#textCompositing = false;
    this.#pointerActions = new Map([
      ["pointercancel", new Set()],
      ["pointerdown", new Set()],
      ["pointermove", new Set()],
      ["pointerup", new Set()],
    ]);
    this.#keyboardActions = new Map([
      ["keydown", new Set()],
    ]);
    this.#assignedOptionElements = [];
    this.#direction = _WidgetDirection.LTR;
    this.#blockProgression = "";
  }

  static get observedAttributes(): Array<string> {
    return [
      _Attr.ARIA_BUSY,
      _Attr.ARIA_LABEL,
      _Attr.DATA_SIZE,
      _Attr.DISABLED,
      _Attr.FORM,
      _Attr.HIDDEN,
      _Attr.NAME,
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

  get form(): HTMLFormElement | null {
    return this._internals.form;
  }

  get label(): string {
    return (this.getAttribute(_Attr.ARIA_LABEL) ?? "");
  }

  set label(value: string) {
    const labelString = (typeof value === "string") ? value : String(value);
    if (labelString.length > 0) {
      this.setAttribute(_Attr.ARIA_LABEL, labelString);
    }
    else {
      this.removeAttribute(_Attr.ARIA_LABEL);
    }
  }

  get name(): string {
    return (this.getAttribute(_Attr.NAME) ?? "");
  }

  set name(value: string) {
    const nameString = (typeof value === "string") ? value : String(value);
    if (nameString.length > 0) {
      this.setAttribute(_Attr.NAME, nameString);
    }
    else {
      this.removeAttribute(_Attr.NAME);
    }
  }

  protected get _isDisabled(): boolean {
    return (this.disabled === true) || (this._inDisabledContext === true);
  }

  protected get _isReadOnly(): boolean {
    return false;
  }



  protected get _internals(): ElementInternals {
    return this.#internals;
  }

  //TODO internals.setFormValue

  protected get _eventTarget(): HTMLElement | null {
    return this.#eventTarget;
  }

  //[$02[
  //protected get _capturedPointer(): CapturedPointer | null {
  //  return this.#capturedPointer;
  //}
  //]$02]

  get size(): BasePresentation.BaseSize {
    const size = this.getAttribute(_Attr.DATA_SIZE);
    if (Object.values(BasePresentation.BaseSize).includes(size as BasePresentation.BaseSize) === true) {
      return size as BasePresentation.BaseSize;
    }
    return BasePresentation.BaseSize.MEDIUM;
  }

  set size(value: BasePresentation.BaseSize) {
    if (Object.values(BasePresentation.BaseSize).includes(value as BasePresentation.BaseSize) === true) {
      if (value !== BasePresentation.BaseSize.MEDIUM) {
        this.setAttribute(_Attr.DATA_SIZE, value);
        return;
      }
    }
    this.removeAttribute(_Attr.DATA_SIZE);
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

  protected _buildEventTarget2(eventTarget: HTMLElement): void {
    this.#setPointerEventListener("pointercancel", eventTarget, true);
    this.#setPointerEventListener("pointerdown", eventTarget, true);
    this.#setPointerEventListener("pointermove", eventTarget, true);
    this.#setPointerEventListener("pointerup", eventTarget, true);
    this.#setKeyboardEventListener("keydown", eventTarget, false);
  }

  protected _buildEventTarget(eventTarget: HTMLElement): void {
    eventTarget.addEventListener("pointerdown", (event: PointerEvent) => {
      if (this._ignoreUiEvent() === true) {
        return;
      }
      //$02 this.#setPointerCapture(event);
    }, { passive: true });

    // touchだと無条件でpointercaptureされるので、gotpointercaptureで#capturingPointerにセットするのはNG

    // pointerupやpointercancelでは自動的にreleaseされる
    eventTarget.addEventListener("lostpointercapture", (event: PointerEvent) => {
      // if (this._ignoreUiEvent() === true) {
      //   return;
      // }
      //$02 if (this._isCapturingPointer(event) === true) {
        //$02 this.#capturedPointer = null;
      //$02 }
    }, { passive: true });

    eventTarget.addEventListener("pointerup", (event: PointerEvent) => {
      if (this._ignoreUiEvent() === true) {
        return;
      }
      //$02 this.#updateCapturedPointer(event);
    }, { passive: true });
    // pointercancelの場合は#capturingPointerは使わない

    eventTarget.addEventListener("pointermove", (event: PointerEvent) => {
      if (this._ignoreUiEvent() === true) {
        return;
      }
      //$02 this.#updateCapturedPointer(event);
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

    this.#setPointerEventListener("pointercancel", eventTarget, true);
    this.#setPointerEventListener("pointerdown", eventTarget, true);
    this.#setPointerEventListener("pointermove", eventTarget, true);
    this.#setPointerEventListener("pointerup", eventTarget, true);
    this.#setKeyboardEventListener("keydown", eventTarget, false);
    //this.#setEventListener<InputEvent>("input", eventTarget, true);
  }

  protected _ignoreUiEvent(): boolean {
    return ((this.busy === true) || (this._isDisabled === true));
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

  //[$02[
  // protected _isCapturingPointer(event: PointerEvent): boolean {
  //   if (this.#capturedPointer) {
  //     return (this.#capturedPointer.type === event.pointerType) && (this.#capturedPointer.id === event.pointerId);
  //   }
  //   return false;
  // }
  //]$02]

  //[$02[
  // #setPointerCapture(event: PointerEvent): void {
  //   if (!!this.#eventTarget) {
  //     if ((this.#capturedPointer === null) && (event.isPrimary === true)) {
  //       this.#eventTarget.setPointerCapture(event.pointerId);
  //       this.#capturedPointer = new CapturedPointer(event);
  //     }
  //   }
  // }
  //]$02]

  //[$02[
  // #updateCapturedPointer(event: PointerEvent): void {
  //   if (!!this.#capturedPointer && (this.#capturedPointer.id === event.pointerId)) {
  //     this.#capturedPointer.addTimelineItem(event);
  //   }
  // }
  //]$02]

  #setPointerEventListener(eventType: string, target: EventTarget, passive: boolean) {
    target.addEventListener(eventType, ((event: PointerEvent) => {
      if (this._ignoreUiEvent() === true) {
        return;
      }

      if (["click", "auxclick", "contextmenu"].includes(event.type) === true) {
        return;
      }
      if (event.isPrimary !== true) {
        return;
      }
      if (event.detail > 1) {
        return;
      }
      if (event.button > 0) {
        return;
      }

      const actions = this.#pointerActions.get(eventType);
      if (!actions) {
        return;
      }
      const filteredActions = [...actions];
      if (filteredActions.some((action) => action.doPreventDefault === true) === true) {
        event.preventDefault();
      }
      if (filteredActions.some((action) => action.doStopPropagation === true) === true) {
        event.stopPropagation();
      }

      for (const action of filteredActions) {
        //[$02[
        // if (action.nonCapturedPointerBehavior === "ignore") {
        //   if (this._isCapturingPointer(event) !== true) {
        //     return;
        //   }
        // }
        //]$02]

        if (["ignore", "ignore-and-notify"].includes(action.readOnlyBehavior) && (this._isReadOnly === true)) {
          if (action.readOnlyBehavior === "ignore-and-notify") {
            this.#notifyReadOnly();
          }
          return;
        }

        action.func(event);
      }
    }) as EventListener, { passive });
  }

  #setKeyboardEventListener(eventType: string, target: EventTarget, passive: boolean) {
    target.addEventListener(eventType, ((event: KeyboardEvent) => {
      if (this._ignoreUiEvent() === true) {
        return;
      }

      const actions = this.#keyboardActions.get(eventType);
      if (!actions) {
        return;
      }
      const filteredActions = [...actions].filter((action) => action.keys?.includes(event.key));
      if (filteredActions.some((action) => action.doPreventDefault === true) === true) {
        event.preventDefault();
      }
      if (filteredActions.some((action) => action.doStopPropagation === true) === true) {
        event.stopPropagation();
      }

      for (const action of filteredActions) {
        if (action.allowRepeat !== true) {
          if (event.repeat === true) {
            return;
          }
        }

        if (["ignore", "ignore-and-notify"].includes(action.readOnlyBehavior) && (this._isReadOnly === true)) {
          if (action.readOnlyBehavior === "ignore-and-notify") {
            this.#notifyReadOnly();
          }
          return;
        }

        action.func(event);
      }
    }) as EventListener, { passive });
  }

  #notifyReadOnly(): void {
    if (!!this._main) {
      const control = this._main.querySelector(`*.${ BasePresentation.ClassName.CONTROL_READONLY_INDICATOR }`) as Element;
      control.animate([
        { offset: 0, transform: "translateX(0)" },
        { offset: 0.25, transform: "translateX(-3px)" },
        { offset: 0.75, transform: "translateX(3px)" },
        { offset: 1, transform: "translateX(0)" },
      ], {
        duration: 150,
        iterations: 1,
      });
    }
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

  protected _addPointerAction(name: string, action: Widget.PointerAction): void {
    const actionSet = this.#pointerActions.get(name) as Set<Widget.PointerAction>;
    actionSet.add(action);
  }

  protected _addKeyboardAction(name: string, action: Widget.KeyboardAction): void {
    const actionSet = this.#keyboardActions.get(name) as Set<Widget.KeyboardAction>;
    if (Array.isArray(action.keys) && (action.keys.length > 0)) {
      actionSet.add(action);
      return;
    }
    throw new TypeError("action.keys must have one or more elements");
  }

  _onMutate(): void {
    const datalist = this.querySelector("datalist");
    if (!!datalist && !!this.#dataListSlot) {
      this.#dataListSlot.assign(datalist);
      this.#loadDataListSlot();//TODO 使うときに直接DOM参照すればいいのでは、というか表示しないならassignする必要もないのでは
    }

    this.#reflectAllSlotsChanged();
  }

  #render(): void {
    this.#adoptStyleSheets();

    const rootElement = this.#useTemplate();
    this.#dataListSlot = rootElement.querySelector('slot[name="datalist"]') as HTMLSlotElement;
    this.#eventTarget = rootElement.querySelector(`*.${ BasePresentation.ClassName.TARGET }`) as HTMLElement;
    this.#main = rootElement.querySelector(`*.${ BasePresentation.ClassName.MAIN }`) as Element;

    this.#root.append(rootElement);

    this._renderExtended();

    //[$02[
    Pointer.CaptureTarget.register(this.#eventTarget, async (capture: Pointer.Capture): Promise<void> => {
      this._onPointerCaptured();
      for await (const track of capture) {
        this._onCapturePointerMoved(track);
      }
      const result = await capture.result;// for-awaitが終わった後なら待ちなしのはず
      this._onPointerReleased(result);
    }, {
      filter: (event: PointerEvent) => {
        return (Pointer.DefaultCaptureFilter(event) === true) && (this._ignoreUiEvent() !== true);
      },
    });

    this._buildEventTarget2(this.#eventTarget);//$02
    //]$02]

  }

  //[$02[
  protected _onPointerCaptured(): void {
    console.log("pointercapture captured");
  }
  protected _onCapturePointerMoved(track: Pointer.CaptureTrack): void {
    console.log(track);
  }
  protected _onPointerReleased(result: Pointer.CaptureResult): void {
    console.log(result);
  }
  //]$02]

  protected abstract _renderExtended(): void;

  protected _reflectAllAttributesChanged(): void {
    this.#resetFocusable();
    this._toggleDisabledState();
    this._reflectLabelChanged();
    this._reflectSizeChanged();
  }

  connectedCallback(): void {
    if (this.isConnected !== true) {
      return;
    }

    this.#render();

    this.#mutationObserver.observe(this, {
      attributes: true,
      characterData: true,
      childList: true,
      subtree: true,
    })
    this._onMutate();

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

      case _Attr.ARIA_LABEL:
        this._reflectLabelChanged();
        break;

      case _Attr.DATA_SIZE:
        this._reflectSizeChanged();
        break;

      case _Attr.DISABLED:
        this.#internals.ariaDisabled = (this.disabled === true) ? "true" : "false";
        this._reflectDisabledChanged();
        break;

      case _Attr.FORM:
        break;

      case _Attr.HIDDEN:
        this.#internals.ariaHidden = (super.hidden === true) ? "true" : "false";
        break;

      case _Attr.NAME:
        break;

      default:
        break;
    }
  }

  formAssociatedCallback(newForm: HTMLFormElement | null): void {
  }

  formDisabledCallback(newDisabled: boolean): void {
    this._inDisabledContext = (newDisabled === true);
    this._reflectDisabledChanged();
  }

  formResetCallback(): void {
    console.log(`formReset`);
    //TODO リセット リセット値はinputだとvalue属性値？ formAssociated時点の？
  }

  formStateRestoreCallback(...f:any[]): void {
    console.log(f);//TODO
  }

  protected _toggleDisabledState(): void {
    const internals = (this.#internals as _XElementInternals);
    if (!!internals.states) {// firefox,safariはElementInternals.states非対応
      if (this._isDisabled === true) {
        internals.states.delete(_State.ENABLED);
        internals.states.add(_State.DISABLED);
      }
      else {
        internals.states.delete(_State.DISABLED);
        internals.states.add(_State.ENABLED);
      }
    }
  }

  protected _reflectDisabledChanged(): void {
    this.#resetFocusable();
    this._toggleDisabledState();
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
      if (this._ignoreUiEvent() === true) {
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
      const datalist = this.#dataListSlot.assignedElements()[0] as HTMLDataListElement;
      for (const element of datalist.options) {
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

  export interface Action<T extends Event = Event> {
    //XXX AbortSignal
    doPreventDefault: boolean,
    doStopPropagation: boolean,
    func: (event: T) => void,
    readOnlyBehavior: "normal" | "ignore" | "ignore-and-notify",
  }

  export interface PointerAction extends Action<PointerEvent> {
    //nonCapturedPointerBehavior: "normal" | "ignore",
  }

  export interface KeyboardAction extends Action<KeyboardEvent> {
    allowRepeat: boolean,
    keys?: Array<string>,
  }

  export type PointerActionOptions = {

  };

  export type BoundingBox = _BoundingBox;
}
Object.freeze(Widget);

export { Widget };
