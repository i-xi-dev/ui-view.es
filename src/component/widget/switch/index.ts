import { BoundingBox } from "../../../bounding_box";
import { Pointer } from "../../../pointer";
import { Widget } from "../widget_base/index";
import { FormControl } from "../form_control/index";
import BasePresentation from "../widget_base/presentation";
import Presentation from "./presentation";

//TODO hover でコントラスト上げ、activeで明るくする
//TODO inputイベント発火
//TODO inert firefoxが対応したら
//TODO copy 値？値ラベル？両方？ テキスト？JSON？HTML？
//TODO paste
//XXX ラベルは廃止する （外付けにする）
//XXX slot名は無くしたいが、他では名前使うかも。そうなると名前は統一したいのでとりあえず名前ありにしておく
//XXX itemのdisabledは無視する
//TODO itemのselectedは無視する？ 無視しない場合checkedとどちらが優先？
//TODO readonlyが見た目でわからない
//TODO 再connect,再adoptに非対応（disconnectの後とか、ownerDocumentが変わったとか、・・・）
//TODO 祖先がdisabledの場合 firefox,safariは:host-contextもElementInternals.statesも非対応

class Switch extends FormControl {
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
    this.#capturedPointerMovementCount = 0;
  }

  //TODO capture最大数1

  #capturedPointerMovementCount: number;
  #boundingBoxLastPointeDown: BoundingBox.Geometry | null = null;

  protected override _onPointerCaptured(): void {
    this.#capturedPointerMovementCount = 0;
    super._onPointerCaptured();
  }
  protected override _onCapturePointerMoved(track: Pointer.CaptureTrack): void {
    if (track.pointerState === Pointer.State.LOST) {
      if (!!this.#thumb) {
        this.#thumb.style.removeProperty("inset-inline-start");
        this.#thumbMovement = undefined;
      }
      return;
    }

    if (track.capturePhase === Pointer.CapturePhase.BEFORE_CAPTURE) {
      // pointerdown
      this.#boundingBoxLastPointeDown = track.geometry?.target as BoundingBox.Geometry;
      this.#setThumbPosition2(track);
    }
    else if (track.capturePhase === Pointer.CapturePhase.CAPTURED) {
      // pointermove
      this.#capturedPointerMovementCount = this.#capturedPointerMovementCount + 1;
      this.#setThumbPosition2(track);
    }
    else if (track.capturePhase === Pointer.CapturePhase.BEFORE_RELEASE) {//XXX 後半は_onPointerReleasedで良い
      // pointerup (pointercancelは最初に除外している)
      if (!!this.#thumb) {
        this.#setThumbPosition2(track);
        this.#thumb.style.removeProperty("inset-inline-start");

        if (this.#capturedPointerMovementCount <= 0) { //XXX X移動量絶対値の合計が一定以下かつY移動量絶対値の合計が一定以下なら動いてないとみなす の方が良い？
          // 動いていない場合はcheckedを変更する
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
    }
  }
  //TODO readonlyのときの挙動
  protected override _onPointerReleased(result: Pointer.CaptureResult): void {
    super._onPointerReleased(result);


  }
  protected override _renderExtended(): void {
    if (!this._main) {
      throw new Error("TODO");
    }

    this.#valueLabelElement = this._main.querySelector(`*.${ Presentation.ClassName.OUTPUT }`) as Element;
    this.#thumb = this._main.querySelector(`*.${ Presentation.ClassName.CONTROL_THUMB }`) as HTMLElement;

    //[$02[

    // this._addPointerAction("pointerup", {
    //   doPreventDefault: false,
    //   doStopPropagation: false,
    //   func: (event: PointerEvent) => {
    //     if (!!this.#thumb) {
    //       this.#thumb.style.removeProperty("inset-inline-start");

    //       const capturedPointer = this._capturedPointer as CapturedPointer;
    //       if (capturedPointer.isNotMoved === true) {
    //         // pointerupとpointerdownの座標が同じ場合はcheckedを変更する
    //         //XXX pointerdownしてpointermoveして元の位置に戻ってpointerupした場合も？
    //       }
    //       else {
    //         console.log(this.#thumbMovement);
    //         // pointerdownからpointerupの間に少しでも動いている場合は、つまみがあまり動いていない場合はcheckedを変更しない
    //         if ((this.checked === true) && ((this.#thumbMovement as number) > 0.6)) {
    //           console.log("------------------------------------- no-change:true");
    //           return;
    //         }
    //         else if ((this.checked !== true) && ((this.#thumbMovement as number) < 0.4)) {
    //           console.log("------------------------------------- no-change:false");
    //           return;
    //         }
    //       }
    //       this.#thumbMovement = undefined;

    //       console.log(`------------------------------------- ${this.checked} -> ${!(this.checked)}`);
    //       this.checked = !(this.checked);
    //       //this._dispatchCompatMouseEvent("click"); pointerupをどうしようが勝手に発火する
    //       this._dispatchChangeEvent();
    //     }
    //   },
    //   nonCapturedPointerBehavior: "ignore",
    //   readOnlyBehavior: "ignore-and-notify",
    // });
    //]$02]

    this._addKeyboardAction("keydown", {
      allowRepeat: false,
      doPreventDefault: true,
      doStopPropagation: false,
      func: () => {
        this.checked = !(this.checked);
        this._dispatchCompatMouseEvent("click");
        this._dispatchChangeEvent();
      },
      keys: [" "],
      readOnlyBehavior: "ignore-and-notify",
    });
  }

  static override get observedAttributes(): Array<string> {
    return [
      super.observedAttributes,
      [
        "checked",
        "data-value-label",
      ],
    ].flat();
  }

  get checked(): boolean {
    return this.hasAttribute("checked");
  }

  set checked(value: boolean) {
    this.toggleAttribute("checked", !!value);
  }

  //TODO 不要 かわりにinternalsにvalueをセットする処理がいる
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

  // override connectedCallback(): void {
  //   super.connectedCallback();
  // }

  override attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
    super.attributeChangedCallback(name, oldValue, newValue);

    switch (name) {
      case "checked":
        this._addRipple();
        break;

      case "data-value-label":
        break;

      default:
        break;
    }
  }

  protected override _reflectSizeChanged(): void {
    this.#trackLength = BasePresentation.BaseDimension[this.size] * 1.5;
    this.#thumbSize = BasePresentation.BaseDimension[this.size] * 0.75;
  }
  #setThumbPosition2(track: Pointer.CaptureTrack) {
    if (!!this.#thumb && !!this.#boundingBoxLastPointeDown) {
      let trackStart: number;
      let pointerCoord: number;
      const { offset } = this.#boundingBoxLastPointeDown;
      if (this._blockProgression === "tb") {
        trackStart = (this._direction === "rtl") ? (offset.left + this.#boundingBoxLastPointeDown.width) : offset.left;
        pointerCoord = track.offsetFromViewport.left;
      }
      else {
        trackStart = (this._direction === "rtl") ? (offset.top + this.#boundingBoxLastPointeDown.height) : offset.top;
        pointerCoord = track.offsetFromViewport.top;
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
      //TODO ラベルがinline-start側にある場合、その分の幅追加
      this.#thumb.style.setProperty("inset-inline-start", `${ thumbStart }px`);
      this.#thumbMovement = thumbStart / range;
    }
  }
  //XXX sliderでも使う

  protected override _reflectDataListSlotChanged(): void {
    if (!!this.#valueLabelElement) {
      const dataListItems = this._getDataListItems({
        defaultItems: Switch.#defaultDataList,
        mergeDefaultItems: true,
      }) as [Widget.DataListItem, Widget.DataListItem];

      (this.#valueLabelElement.children[Switch.OptionIndex.OFF] as Element).textContent = dataListItems[Switch.OptionIndex.OFF].label;
      (this.#valueLabelElement.children[Switch.OptionIndex.ON] as Element).textContent = dataListItems[Switch.OptionIndex.ON].label;
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
