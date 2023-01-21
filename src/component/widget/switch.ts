import { Ns } from "./ns";
import { Aria } from "./aria";
import { Widget } from "./widget";

const _TRACK_OFFSET_INLINE_START = 4;

const _ENCODED_MASK = globalThis.encodeURIComponent(`<svg xmlns="${ Ns.SVG }" width="48" height="48"><clipPath id="c1"><path d="M 0 0 L 48 0 L 48 48 L 0 48 z M 24 16 A 8 8 -90 0 0 24 32 A 8 8 -90 0 0 24 16 z"/></clipPath><rect width="48" height="48" fill="#000" clip-path="url(#c1)"/></svg>`);

//TODO hover でコントラスト上げ、activeで明るくする
//TODO inputイベント発火
//TODO inert firefoxが対応したら
//TODO attatchInternals safariが対応したら
//TODO copy 値？値ラベル？両方？ テキスト？JSON？HTML？
//TODO paste
//XXX ラベルは廃止する （外付けにする）
//XXX slot名は無くしたいが、他では名前使うかも。そうなると名前は統一したいのでとりあえず名前ありにしておく
//TODO 値ラベルの幅は長いほうに合わせて固定にしたい（幅算出してwidth指定するか、不可視にして同じ位置に重ねて表示を切り替えるか。いちいちリフローがかかるので後者が良い？リフローなしでOffscreenCanvasで文字幅だけなら取れるがdataに子要素があったり装飾されてたりしたら正確に取れない。重ねる方法だと:emptyで空かどうか判別できなくなるので空状態かどうかを保持するプロパティが余計に必要）
//TODO 値ラベルを可視に設定しても値ラベルが両方空の場合は、column-gapを0にしたい
//XXX shadowなしで、白枠常時表示てもいいかも
//XXX itemのdisabledは無視する
//TODO itemのselectedは無視する？ 無視しない場合checkedとどちらが優先？
//TODO readonlyが見た目でわからない
//TODO readonlyのときのkeydownなどが無反応で何もしないのが気になる
//TODO vueで使いやすいのはbool型属性か・・・data-value-label-visible

const DataAttr = {
  VALUE_LABEL_VISIBLE: "data-value-label-visible",
  VALUE_LABEL_POSITION: "data-value-label-position",
} as const;

class Switch extends Widget {
  static override readonly CLASS_NAME: string = "switch";
  static readonly #TEMPLATE = `
    <div class="${ Switch.CLASS_NAME }-control">
      <div class="${ Switch.CLASS_NAME }-track">
        <div class="${ Switch.CLASS_NAME }-track-surface"></div>
        <div class="${ Switch.CLASS_NAME }-track-highlight"></div>
      </div>
      <div class="${ Switch.CLASS_NAME }-thumb-hittest"></div>
      <div class="${ Switch.CLASS_NAME }-thumb">
        <div class="${ Widget.CLASS_NAME }-glow"></div>
        <div class="${ Widget.CLASS_NAME }-effects"></div>
        <div class="${ Switch.CLASS_NAME }-thumb-surface"></div>
        <div class="${ Switch.CLASS_NAME }-thumb-highlight"></div>
      </div>
    </div>
    <output class="${ Switch.CLASS_NAME }-value-label"></output>
  `;
  static readonly #STYLE = `
    :host {
      flex: none;
      inline-size: max-content;
      user-select: none;/* これがないと、なぜかChromeで短時間に連続clickした後、pointerdownして数pixel pointermoveすると勝手にlostpointercaptureが起きる。Firefoxは無くても問題ない。Safariは未確認 */
    }
    *.${ Switch.CLASS_NAME }-container *.${ Widget.CLASS_NAME }-event-target {
      border-radius: 4px;
      margin-inline: -8px;
    }

    *.${ Switch.CLASS_NAME } {
      --${ Switch.CLASS_NAME }-space: ${ _TRACK_OFFSET_INLINE_START }px;
      --${ Switch.CLASS_NAME }-switching-time: 150ms;
      --${ Switch.CLASS_NAME }-inline-size: calc(var(--${ Widget.CLASS_NAME }-size) * 1.5);
      --${ Switch.CLASS_NAME }-block-size: calc(var(--${ Widget.CLASS_NAME }-size) * 0.75);
      --${ Switch.CLASS_NAME }-track-mask-size: calc(var(--${ Switch.CLASS_NAME }-inline-size) * 1.5);
      align-items: center;
      block-size: 100%;
      column-gap: 0;
      display: flex;
      flex-flow: row nowrap;
    }
    :host(*[data-value-label-visible="true"]) *.${ Switch.CLASS_NAME } {
      column-gap: 6px;
    }
    :host(*[data-value-label-position="before"]) *.${ Switch.CLASS_NAME } {
      flex-flow: row-reverse nowrap;
    }
    *.${ Switch.CLASS_NAME }-control {
      block-size: var(--${ Switch.CLASS_NAME }-block-size);
      inline-size: var(--${ Switch.CLASS_NAME }-inline-size);
      margin-inline: var(--${ Switch.CLASS_NAME }-space);
      position: relative;
    }
    *.${ Switch.CLASS_NAME }-track {
      block-size: inherit;
      border-radius: calc(var(--${ Widget.CLASS_NAME }-size) * 0.375);
      /*clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);*/
      /* background-position-inline/blockが実装されないと。
      mask-image: url("data:image/svg+xml,${ _ENCODED_MASK }");
      mask-position: 0 0;
      mask-repeat: no-repeat;
      mask-size: var(--${ Switch.CLASS_NAME }-track-mask-size) var(--${ Switch.CLASS_NAME }-track-mask-size);
      */
      /*overflow: hidden;*/
      position: relative;
      transition: clip-path var(--${ Switch.CLASS_NAME }-switching-time);
    }

    *.${ Switch.CLASS_NAME }-track-surface,
    *.${ Switch.CLASS_NAME }-track-highlight {
      border-radius: inherit;
      inset: 0;
      position: absolute;
    }
    *.${ Switch.CLASS_NAME }-track-surface {
      background-color: var(--${ Widget.CLASS_NAME }-main-bg-color);
      border: var(--${ Widget.CLASS_NAME }-border-width) solid var(--${ Widget.CLASS_NAME }-main-fg-color);
      transition: background-color var(--${ Switch.CLASS_NAME }-switching-time), border-color var(--${ Switch.CLASS_NAME }-switching-time);
    }
    :host(*[aria-checked="true"]) *.${ Switch.CLASS_NAME }-track-surface {
      background-color: var(--${ Widget.CLASS_NAME }-accent-color);
      border-color: var(--${ Widget.CLASS_NAME }-accent-color);
    }
    *.${ Switch.CLASS_NAME }-track-highlight {
      border: var(--${ Widget.CLASS_NAME }-border-width) solid #0000;
      box-shadow: 0 0 0 0 #0000;
      transition: border-color 300ms, box-shadow 300ms;
    }
    :host(*:not(*[aria-busy="true"]):not(*[aria-disabled="true"]):not(*[aria-readonly="true"])) *.${ Widget.CLASS_NAME }-event-target:hover + *.${ Switch.CLASS_NAME } *.${ Switch.CLASS_NAME }-track-highlight {
      border-color: var(--${ Widget.CLASS_NAME }-accent-color);
      box-shadow: 0 0 0 var(--${ Widget.CLASS_NAME }-border-width) var(--${ Widget.CLASS_NAME }-accent-color);
    }

    *.${ Switch.CLASS_NAME }-thumb-hittest,
    *.${ Switch.CLASS_NAME }-thumb {
      block-size: var(--${ Switch.CLASS_NAME }-block-size);
      inline-size: var(--${ Switch.CLASS_NAME }-block-size);
      inset-block-start: 0;
      inset-inline-start: 0;
      position: absolute;
      transition: inset-inline-start var(--${ Switch.CLASS_NAME }-switching-time);
    }
    *.${ Switch.CLASS_NAME }-thumb-hittest {
      pointer-events: auto;
      opacity: 0;
      z-index: -1;
    }
    :host(*[aria-checked="true"]) *.${ Switch.CLASS_NAME }-thumb-hittest,
    :host(*[aria-checked="true"]) *.${ Switch.CLASS_NAME }-thumb {
      inset-inline-start: calc(var(--${ Switch.CLASS_NAME }-inline-size) - var(--${ Switch.CLASS_NAME }-block-size));
    }
    *.${ Widget.CLASS_NAME }-glow,
    *.${ Widget.CLASS_NAME }-effects,
    *.${ Switch.CLASS_NAME }-thumb-surface,
    *.${ Switch.CLASS_NAME }-thumb-highlight {
      border-radius: 50%;
      margin: 3px;
      transition: margin 300ms;
    }
    :host(*:not(*[aria-busy="true"]):not(*[aria-disabled="true"]):not(*[aria-readonly="true"])) *.${ Widget.CLASS_NAME }-event-target:hover + *.${ Switch.CLASS_NAME } *:is(
      *.${ Widget.CLASS_NAME }-glow,
      *.${ Widget.CLASS_NAME }-effects,
      *.${ Switch.CLASS_NAME }-thumb-surface,
      *.${ Switch.CLASS_NAME }-thumb-highlight
    ) {
      margin: 0;
    }
    *.${ Widget.CLASS_NAME }-glow::before {
      border-radius: inherit;
    }

    *.${ Switch.CLASS_NAME }-thumb-surface,
    *.${ Switch.CLASS_NAME }-thumb-highlight {
      inset: 0;
      position: absolute;
    }
    *.${ Switch.CLASS_NAME }-thumb-surface {
      background-color: var(--${ Widget.CLASS_NAME }-main-bg-color);
      border: var(--${ Widget.CLASS_NAME }-border-width) solid var(--${ Widget.CLASS_NAME }-main-fg-color);
      transition: border-width var(--${ Switch.CLASS_NAME }-switching-time), margin 300ms;
    }
    :host(*[aria-checked="true"]) *.${ Switch.CLASS_NAME }-thumb-surface {
      border-width: 0;
    }
    *.${ Switch.CLASS_NAME }-thumb-highlight {
      border: 0 solid var(--${ Widget.CLASS_NAME }-accent-color);
      box-shadow: 0 0 0 0 #0000;
      transition: border-width 300ms, box-shadow 300ms, margin 300ms;
    }
    :host(*:not(*[aria-busy="true"]):not(*[aria-disabled="true"]):not(*[aria-readonly="true"])) *.${ Widget.CLASS_NAME }-event-target:hover + *.${ Switch.CLASS_NAME } *.${ Switch.CLASS_NAME }-thumb-highlight {
      border-width: var(--${ Widget.CLASS_NAME }-border-width);
      box-shadow: 0 0 0 var(--${ Widget.CLASS_NAME }-border-width) var(--${ Widget.CLASS_NAME }-accent-color);
    }

    @keyframes ${ Switch.CLASS_NAME }-ripple {
      0% {
        opacity: var(--${ Widget.CLASS_NAME }-ripple-opacity);
        transform: scale(1);
      }
      100% {
        opacity: 0;
        transform: scale(2.4);
      }
    }
    *.${ Widget.CLASS_NAME }-ripple {
      animation: ${ Switch.CLASS_NAME }-ripple 600ms both;
      inset: 0;
      mix-blend-mode: color-burn; /*XXX darkのとき変える */
    }

    *.${ Switch.CLASS_NAME }-value-label {
      display: none;
      user-select: none;
      white-space: pre;
    }
    :host(*[data-value-label-visible="true"]) *.${ Switch.CLASS_NAME }-value-label {
      display: block;
    }
    *.${ Switch.CLASS_NAME }-value-label:not(*:empty) {
      text-align: start;
    }
    :host(*[data-value-label-position="before"]) *.${ Switch.CLASS_NAME }-value-label:not(*:empty) {
      text-align: end;
    }
  `;
  static readonly #styleSheet: CSSStyleSheet = new CSSStyleSheet();
  static #template: HTMLTemplateElement | null;

  static readonly #defaultDataList: [Widget.DataListItem, Widget.DataListItem] = [
    { value: "0", label: "" },
    { value: "1", label: "" },
  ];

  #checked: boolean;
  #trackLength: number;
  #thumbSize: number;
  readonly #valueLabelElement: Element;
  readonly #thumb: HTMLElement;
  readonly #thumbHitTest: Element;
  #thumbMovement?: number;

  static {
    Switch.#styleSheet.replaceSync(Switch.#STYLE);
    Switch.#template = null;
  }

  constructor() {
    super({
      role: Aria.Role.SWITCH,
      className: Switch.CLASS_NAME,
      inputable: true,
      textEditable: false,
    });

    this.#checked = false;
    this.#trackLength = 0;
    this.#thumbSize = 0;

    this._appendStyleSheet(Switch.#styleSheet);

    const main = this._main;
    if ((Switch.#template && (Switch.#template.ownerDocument === this.ownerDocument)) !== true) {
      Switch.#template = this.ownerDocument.createElement("template");
      Switch.#template.innerHTML = Switch.#TEMPLATE;
    }
    main.append((Switch.#template as HTMLTemplateElement).content.cloneNode(true));
    this.#valueLabelElement = main.querySelector(`*.${ Switch.CLASS_NAME }-value-label`) as Element;
    this.#thumb = main.querySelector(`*.${ Switch.CLASS_NAME }-thumb`) as HTMLElement;
    this.#thumbHitTest = main.querySelector(`*.${ Switch.CLASS_NAME }-thumb-hittest`) as Element;

    this._addAction<PointerEvent>("pointermove", {
      func: (event: PointerEvent) => {
        if (this._isCapturingPointer(event) === true) {
          const capturingPointer = this._capturingPointer as Widget.CapturingPointer;
          this.#setThumbPosition(event.clientX, event.clientY, capturingPointer.targetBoundingBox);
        }
      },
    });

    this._addAction<PointerEvent>("pointercancel", {
      func: (event: PointerEvent) => {
        if (this._isCapturingPointer(event) === true) {
          this.#thumb.style.removeProperty("inset-inline-start");
          this.#thumbMovement = undefined;
        }
      },
    });

    this._addAction<PointerEvent>("pointerup", {
      func: (event: PointerEvent) => {
        if (this._isCapturingPointer(event) === true) {
          this.#thumb.style.removeProperty("inset-inline-start");

          const capturingPointer = this._capturingPointer as Widget.CapturingPointer;
          if ((capturingPointer.startViewportX === event.clientX) && (capturingPointer.startViewportY === event.clientY)) {
            // pointerupとpointerdownの座標が同じ場合はcheckedを変更する
            //TODO pointerdownしてpointermoveして元の位置に戻ってpointerupした場合も？
          }
          else {
            console.log(this.#thumbMovement);
            // pointerdownからpointerupの間に少しでも動いている場合は、つまみがあまり動いていない場合はcheckedを変更しない
            if ((this.checked === true) && ((this.#thumbMovement as number) > 0.6)) {
              console.log("------------------------------------- no-change:true");
              return;
            }
            else if ((this.checked !== true) && ((this.#thumbMovement as number) < 0.4)) {
              console.log("------------------------------------- no-change:false");
              return;
            }
          }
          this.#thumbMovement = undefined;

          console.log(`------------------------------------- ${this.checked} -> ${!(this.#checked)}`);
          this.checked = !(this.#checked);
          //this._dispatchCompatMouseEvent("click"); pointerupをどうしようが勝手に発火する
          this._dispatchChangeEvent();
        }
      },
    });

    this._addAction<KeyboardEvent>("keydown", {
      keys: [" "],
      func: () => {
        this.checked = !(this.#checked);
        this._dispatchCompatMouseEvent("click");
        this._dispatchChangeEvent();
      },
      doPreventDefault: true,
    });
  }

  //XXX sliderでも使う
  #setThumbPosition(viewportX: number, viewportY: number, rect: Widget.BoundingBox) {
    let trackStart: number;
    let pointerCoord: number;
    if (this._blockProgression === "tb") {
      trackStart = (this._direction === "rtl") ? rect.right : rect.left;
      pointerCoord = viewportX;
    }
    else {
      trackStart = (this._direction === "rtl") ? rect.bottom : rect.top;
      pointerCoord = viewportY;
    }

    let thumbStart = 0;
    if (this._direction === "rtl") {
      thumbStart = (trackStart - Widget.EVENT_TARGET_PADDING_INLINE) - pointerCoord;
    }
    else {
      thumbStart = pointerCoord - (trackStart + Widget.EVENT_TARGET_PADDING_INLINE);
    }
    thumbStart = thumbStart - (this.#thumbSize / 2);

    const range = this.#trackLength - this.#thumbSize;
    if (thumbStart <= 0) {
      thumbStart = 0;
    }
    else if (thumbStart >= range) {
      thumbStart = range;
    }
    this.#thumb.style.setProperty("inset-inline-start", `${ thumbStart }px`);
    this.#thumbMovement = thumbStart / range;
  }

  protected override _setPointerCapture(event: PointerEvent) {
    // const thumbPointed = this._elementIntersectsPoint(this.#thumbHitTest, {
    //   x: event.clientX,
    //   y: event.clientY,
    // });
    super._setPointerCapture(event);
    const capturingPointer = this._capturingPointer as Widget.CapturingPointer;
    this.#setThumbPosition(event.clientX, event.clientY, capturingPointer.targetBoundingBox);
  }

  get checked(): boolean {
    return this.#checked;
  }

  set checked(value: boolean) {
    const adjustedChecked = !!value;//(value === true);
    this.#setChecked(adjustedChecked, Widget._ReflectionsOnPropChanged);
  }

  get #value(): Widget.DataListItem {
    const dataListItems = this._getDataListItems({
      defaultItems: Switch.#defaultDataList,
      mergeDefaultItems: true,
    }) as [Widget.DataListItem, Widget.DataListItem];
    if (this.#checked === true) {
      return dataListItems[Switch.OptionIndex.ON];
    }
    else {
      return dataListItems[Switch.OptionIndex.OFF];
    }
    //XXX busyのときエラーにするか待たせるか
  }

  static override get observedAttributes(): Array<string> {
    return [
      Widget.observedAttributes,
      [
        Aria.State.CHECKED,
        //DataAttr.VALUE_LABEL_VISIBLE, CSSのみ
        //DataAttr.VALUE_LABEL_POSITION, CSSのみ
      ],
    ].flat();
  }

  protected override _setSize(value: string, reflections: Widget.Reflections): void {
    super._setSize(value, reflections);

    this.#trackLength = Widget.Dimension[this._size] * 1.5;
    this.#thumbSize = Widget.Dimension[this._size] * 0.75;
  }

  override connectedCallback(): void {
    super.connectedCallback();

    if (this.isConnected !== true) {
      return;
    }

    this.#setCheckedFromString(this.getAttribute(Aria.State.CHECKED) ?? "", Widget._ReflectionsOnConnected);

    this._connected = true;
  }

  override attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
    super.attributeChangedCallback(name, oldValue, newValue);

    if (this._reflectingInProgress === name) {
      return;
    }

    switch (name) {
      case Aria.State.CHECKED:
        this.#setCheckedFromString(newValue, Widget._ReflectionsOnAttrChanged);
        break;

      default:
        break;
    }
  }

  #setCheckedFromString(value: string, reflections: Widget.Reflections): void {
    this.#setChecked((value === "true"), reflections);
  }

  #setChecked(value: boolean, reflections: Widget.Reflections): void {
    const changed = (this.#checked !== value);
    if (changed === true) {
      this.#checked = value;
    }
    if ((reflections.content === "always") || (reflections.content === "if-needed" && changed === true)) {
      this.#reflectCheckedToContent();
    }
    if ((reflections.attr === "always") || (reflections.attr === "if-needed" && changed === true)) {
      this.#reflectToAriaChecked();
    }
  }

  #reflectToAriaChecked(): void {
    this._reflectToAttr(Aria.State.CHECKED, ((this.#checked === true) ? "true" : "false"));
  }

  #reflectCheckedToContent(): void {
    this._addRipple();
    this.#valueLabelElement.textContent = this.#value.label;
  }
}
namespace Switch {
  export const OptionIndex = {
    OFF: 0,
    ON: 1,
  } as const;
}
Object.freeze(Switch);

export { Switch };
