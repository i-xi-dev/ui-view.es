import { Widget } from "../widget_base/index";
import BasePresentation from "../widget_base/presentation";
import Presentation from "./presentation";

//TODO hover でコントラスト上げ、activeで明るくする
//TODO inputイベント発火
//TODO inert firefoxが対応したら
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
//TODO slotにassignできるのもcustom elementにする？
//TODO aria-xxx はthis.#internals.ariaXxx = ～ にする？
//TODO 以下の属性が必要 グローバル、form、、、name https://momdo.github.io/html/custom-elements.html
//TODO formAssociatedCallback
//TODO formDisabledCallback
//TODO formResetCallback
//TODO formStateRestoreCallback
//TODO 再connect,再adoptに非対応（disconnectの後とか、ownerDocumentが変わったとか、・・・）

const DataAttr = {
  VALUE_LABEL_VISIBLE: "data-value-label-visible",
  VALUE_LABEL_POSITION: "data-value-label-position",
} as const;

class Switch extends Widget {
  static readonly formAssociated = true;

  static readonly #KEY = Symbol();

  static readonly #defaultDataList: [Widget.DataListItem, Widget.DataListItem] = [
    { value: "0", label: "" },
    { value: "1", label: "" },
  ];

  #trackLength: number;
  #thumbSize: number;
  #thumbMovement?: number;
  #valueLabelElement: Element | null;
  #thumb: HTMLElement | null;

  static {
    Widget._addTemplate(Switch.#KEY, Presentation.TEMPLATE);
    Widget._addStyleSheet(Switch.#KEY, Presentation.STYLE);
  }

  constructor() {
    super({
      componentKey: Switch.#KEY,
      role: "switch",
      formAssociated: Switch.formAssociated,
      inputable: true,
      textEditable: false,
    });

    this.#trackLength = 0;
    this.#thumbSize = 0;
    this.#valueLabelElement = null;
    this.#thumb = null;
  }

  #render2(): void {
    if (!this._main) {
      throw new Error("TODO");
    }

    this.#valueLabelElement = this._main.querySelector(`*.${ Presentation.ClassName.OUTPUT }`) as Element;
    this.#thumb = this._main.querySelector(`*.${ Presentation.ClassName.CONTROL_THUMB }`) as HTMLElement;

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
        if (!!this.#thumb && (this._isCapturingPointer(event) === true)) {
          this.#thumb.style.removeProperty("inset-inline-start");
          this.#thumbMovement = undefined;
        }
      },
    });

    this._addAction<PointerEvent>("pointerup", {
      func: (event: PointerEvent) => {
        if (!!this.#thumb && (this._isCapturingPointer(event) === true)) {
          this.#thumb.style.removeProperty("inset-inline-start");

          const capturingPointer = this._capturingPointer as Widget.CapturingPointer;
          if ((capturingPointer.startViewportX === event.clientX) && (capturingPointer.startViewportY === event.clientY)) {
            // pointerupとpointerdownの座標が同じ場合はcheckedを変更する
            //XXX pointerdownしてpointermoveして元の位置に戻ってpointerupした場合も？
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

          console.log(`------------------------------------- ${this.checked} -> ${!(this.checked)}`);
          this.checked = !(this.checked);
          //this._dispatchCompatMouseEvent("click"); pointerupをどうしようが勝手に発火する
          this._dispatchChangeEvent();
        }
      },
    });

    this._addAction<KeyboardEvent>("keydown", {
      keys: [" "],
      func: () => {
        this.checked = !(this.checked);
        this._dispatchCompatMouseEvent("click");
        this._dispatchChangeEvent();
      },
      doPreventDefault: true,
    });
  }

  static override get observedAttributes(): Array<string> {
    return [
      Widget.observedAttributes,
      [
        "checked",
        //DataAttr.VALUE_LABEL_VISIBLE, CSSのみ
        //DataAttr.VALUE_LABEL_POSITION, CSSのみ
      ],
    ].flat();
  }

  get checked(): boolean {
    return this.hasAttribute("checked");
  }

  set checked(value: boolean) {
    this.toggleAttribute("checked", !!value);
  }

  get #value(): Widget.DataListItem {
    const dataListItems = this._getDataListItems({
      defaultItems: Switch.#defaultDataList,
      mergeDefaultItems: true,
    }) as [Widget.DataListItem, Widget.DataListItem];
    if (this.checked === true) {
      return dataListItems[Switch.OptionIndex.ON];
    }
    else {
      return dataListItems[Switch.OptionIndex.OFF];
    }
    //XXX busyのときエラーにするか待たせるか
  }

  override connectedCallback(): void {
    super.connectedCallback();

    if (this.isConnected !== true) {
      return;
    }
    this.#render2();

    this.#resetValueLabel();

    this._connected = true;
  }

  override attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
    super.attributeChangedCallback(name, oldValue, newValue);

    if (this._reflectingInProgress === name) {
      return;
    }

    switch (name) {
      case "checked":
        this._addRipple();
        this.#resetValueLabel();
        break;

      default:
        break;
    }
  }

  protected override _setPointerCapture(event: PointerEvent) {
    super._setPointerCapture(event);
    const capturingPointer = this._capturingPointer as Widget.CapturingPointer;
    this.#setThumbPosition(event.clientX, event.clientY, capturingPointer.targetBoundingBox);
  }

  protected override _setSize(value: string, reflections: Widget.Reflections): void {
    super._setSize(value, reflections);

    this.#trackLength = BasePresentation.BaseDimension[this._size] * 1.5;
    this.#thumbSize = BasePresentation.BaseDimension[this._size] * 0.75;
  }

  //XXX sliderでも使う
  #setThumbPosition(viewportX: number, viewportY: number, rect: Widget.BoundingBox) {
    if (!!this.#thumb) {
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
        thumbStart = (trackStart - BasePresentation.Parameters.Target.PADDING_INLINE) - pointerCoord;
      }
      else {
        thumbStart = pointerCoord - (trackStart + BasePresentation.Parameters.Target.PADDING_INLINE);
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
  }

  //TODO Widgetのprotectedメソッドで良い
  #resetValueLabel(): void {
    if (!!this.#valueLabelElement) {
      this.#valueLabelElement.textContent = this.#value.label;
    }
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
