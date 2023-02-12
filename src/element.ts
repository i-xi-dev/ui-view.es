import { Geometry2d } from "@i-xi-dev/ui-utils";
import { Pointer } from "./pointer";

type pointerid = number;// integer

class _PointerCaptureTarget {
  readonly #target: Element;
  readonly #eventListenerAborter: AbortController;
  readonly #trackingMap: Map<pointerid, Pointer.Tracking>;

  //TODO readonly #boundingBox: UiViewElement.BoundingBox;// 開始時点の 追跡中の変更には関知しない

  constructor(target: Element, callback: UiViewElement.PointerCapturedCallback, options: UiViewElement.PointerCaptureOptions) {
    this.#target = target;
    this.#eventListenerAborter = new AbortController();
    this.#trackingMap = new Map();

    // タッチの場合にpointerupやpointercancelしなくても暗黙にreleasepointercaptureされるので強制設定する //XXX 値は設定可にする
    (this.#target as unknown as ElementCSSInlineStyle).style.setProperty("touch-action", "none", "important");

    const listenerOptions = {
      passive: true,
      signal: this.#eventListenerAborter.signal,
    };

    //XXX targetがcurrentTargetの子孫でもoffsetX/Yが問題なく取れそうなら、pointerenterで開始するモードも追加する（trackにcontactかどうかも追加する）

    this.#target.addEventListener("pointerdown", ((event: PointerEvent) => {
      if (event.isTrusted !== true) {
        return;
      }
      // if (this.#filter(event) !== true) {
      //   return;
      // }

      //XXX 暗黙のpointercaptureは、pointerdown時にhasPointerCaptureで判別できる
      //    と、仕様には記載があるが従っている実装はあるのか？（ChromeもFirefoxもpointerdownでhasPointerCaptureしても暗黙のpointercaptureを検出できない）
      //    検出できないと何か問題あるか？

      this.#target.setPointerCapture(event.pointerId);
      if (this.#target.hasPointerCapture(event.pointerId) === true) {
        // キャプチャできた場合のみ処理開始
        // キャプチャされない例
        // - Chromium系でマウスでthis.#targetのスクロールバーをpointerdownしたとき
        this.#afterCapture(event, callback);
        this.#pushTrack(event);
      }
    }) as EventListener, listenerOptions);

    this.#target.addEventListener("pointermove", ((event: PointerEvent): void => {
      if (event.isTrusted !== true) {
        return;
      }
      //XXX hasPointerCaptureがfalseなら#afterRelease()呼ぶ？ pointermove以外でも
      this.#pushTrack(event);
    }) as EventListener, listenerOptions);

    this.#target.addEventListener("pointerup", ((event: PointerEvent): void => {
      if (event.isTrusted !== true) {
        return;
      }
      this.#pushLastTrack(event);
      this.#afterRelease(event);
    }) as EventListener, listenerOptions);

    this.#target.addEventListener("pointercancel", ((event: PointerEvent): void => {
      if (event.isTrusted !== true) {
        return;
      }
      this.#pushLastTrack(event);
      this.#afterRelease(event);
    }) as EventListener, listenerOptions);
  }

  // 参照先が変わった場合の検出が困難なので、実行ごとに取得しなおす
  get #rootNode(): (Document | ShadowRoot) {
    const root = this.#target.getRootNode();
    if ((root instanceof Document) || (root instanceof ShadowRoot)) {
      return root;
    }
    throw new Error("invalid state: target is not connected");
  }

  disconnect(): void {
    this.#eventListenerAborter.abort();
    this.#trackingMap.clear();
  }

  // x,yはviewport座標
  containsPoint({ x, y }: Geometry2d.Point): boolean {
    return this.#rootNode.elementsFromPoint(x, y).includes(this.#target);
  }

  #afterCapture(event: PointerEvent, callback: UiViewElement.PointerCapturedCallback): void {
    const pointer = Pointer.Identification.of(event);
    const tracking = new Pointer.Tracking(pointer, this.#eventListenerAborter.signal);
    this.#trackingMap.set(event.pointerId, tracking);
    callback(tracking);
  }

  #pushTrack(event: PointerEvent): void {
    if (this.#trackingMap.has(event.pointerId) === true) {
      const controller = this.#trackingMap.get(event.pointerId) as Pointer.Tracking;

      //XXX if (this.#highPrecision === true) {
      //   for (const coalesced of event.getCoalescedEvents()) {
      //     controller.enqueue(_PointerTrack.fromPointerEvent(coalesced));
      //   }
      // }
      // else {
      controller.append(UiViewElement.PointerCaptureTrack.from(event));
      //}
    }
  }

  #pushLastTrack(event: PointerEvent): void {
    if (this.#trackingMap.has(event.pointerId) === true) {
      const controller = this.#trackingMap.get(event.pointerId) as Pointer.Tracking;

      controller.append(UiViewElement.PointerCaptureTrack.from(event));//XXX いる？（最後のpointermoveから座標が変化することがありえるか）
      controller.terminate();
    }
  }

  //XXX 明示的にreleasePointerCaptureする？ いまのところgotpointercaptureが発生するのにlostpointercaptureが発生しないケースにはあったことは無い
  #afterRelease(event: PointerEvent): void {
    if (this.#trackingMap.has(event.pointerId) === true) {
      this.#trackingMap.delete(event.pointerId);
    }
  }
}

const _pointerCaptureTargetRegistry: WeakMap<Element, _PointerCaptureTarget> = new WeakMap();

namespace UiViewElement {
  export type BoundingBox = Geometry2d.Rect/* & {

  }*/;
  export namespace BoundingBox {
    /**
     * The point with the origin at the top left corner of the bounding box.
     */
    export type Inset = Geometry2d.Point;

    export function of(element: Element): Readonly<BoundingBox> {
      if ((element instanceof Element) !== true) {
        throw new TypeError("element");
      }
      if (element.isConnected !== true) {
        throw new Error("invalid state: element is not contained in document");
      }
      //XXX checkVisibility
      //XXX その他取得不能条件
  
      const view: Window | null = element.ownerDocument.defaultView;
      if (!view) {
        throw new Error("invalid state: element is not contained in document with the view");
      }
  
      const targetRect = element.getBoundingClientRect();
  
      return Object.freeze({
        x: targetRect.left,
        y: targetRect.top,
        width: targetRect.width,
        height: targetRect.height,
      });
    }
  }

  export const PointerCapturePhase = {
    START: "start",
    PROGRESS: "progress",
    END: "end",
    UNDEFINED: "undefined",
  } as const;
  export type PointerCapturePhase = typeof PointerCapturePhase[keyof typeof PointerCapturePhase];

  export interface PointerCaptureTrack extends Pointer.Track {
    readonly offsetFromTarget: Geometry2d.Point; // offset from target bounding box
    readonly trackingPhase: PointerCapturePhase,
  }
  export namespace PointerCaptureTrack{
    export function from(event: PointerEvent): PointerCaptureTrack {
      const offsetFromTarget = {
        x: event.offsetX,
        y: event.offsetY,
      };

      // targetはcurrentTargetの子孫である可能性（すなわちevent.offsetX/YがcurrentTargetの座標ではない可能性）
      if (!!event.target && !!event.currentTarget && (event.currentTarget !== event.target)) {
        const currentTargetBoundingBox = BoundingBox.of(event.currentTarget as Element);
        const targetBoundingBox = BoundingBox.of(event.target as Element);
        const { x, y } = Geometry2d.Point.distanceBetween(currentTargetBoundingBox, targetBoundingBox);
        offsetFromTarget.x = offsetFromTarget.x - x;
        offsetFromTarget.y = offsetFromTarget.y - y;
      }

      let trackingPhase: PointerCapturePhase;
      switch (event.type) {
        case "pointerdown":
          trackingPhase = PointerCapturePhase.START;
          break;
        case "pointermove":
          trackingPhase = PointerCapturePhase.PROGRESS;
          break;
        case "pointerup":
        case "pointercancel":
          trackingPhase = PointerCapturePhase.END;
          break;
        default:
          trackingPhase = PointerCapturePhase.UNDEFINED;
          // pointerup,pointercancelの後は_PointerTrack.fromPointerEventを呼んでいないのでありえない
          break;
      }

      const baseTrack = Pointer.Track.from(event);
      return Object.assign({
        offsetFromTarget,
        trackingPhase,
      }, baseTrack);
    }
  }

  export type PointerCapturedCallback = (tracking: Pointer.Tracking) => (void | Promise<void>);

  export type PointerCaptureOptions = {

  };

  //備忘
  // - 同時追跡数はとりあえず1固定にしている
  //     ブラウザのpointer captureが複数captureに対応してないので。（複数captureは可能だが、アクティブになるのは直近のcapture 1つのみ。releaseしたらその前のcaptureがアクティブになるが同時にアクティブにはならない）
  // - 非trustedなPointerEventは無条件で無視している
  //     受け付けるようにする場合は、pointerdownがtrustedでpointermoveが非trustedの場合の挙動などをどうするか
  // - gotpointercaptureは使用しないことにした
  //     setPointerCapture後、Firefoxは即座にgotpointercaptureが発火するのに対して、Chromeは次にpointermoveなどが発火する直前まで遅延される為
  // - lostpointercaptureは使用しないことにした
  //     Chrome,EdgeでpointerTypeがmouseのとき、スクロールバー上でpointerdownしたときに問題になる為
  //     （スクロールバーがpointer captureを奪う？ので要素ではgotpointercaptureもlostpointercaptureも発火しないがcaptureはしてるっぽい）
  //     Firefoxは問題ないので、Chromiumの問題な気もするが

  //将来検討
  // - pointerrawupdate設定可にする
  // - resultもしくは最終trackにendPointIntersectsTarget: boolean,// 終点は要素のヒットテストにヒットするか
  // - resultもしくは最終trackにviewportサイズ,viewportResized,viewportScrolled,targetResized,,任意の祖先要素Scrolled,...

  export function setAutoPointerCapture(target: Element, callback: UiViewElement.PointerCapturedCallback, options: PointerCaptureOptions = {}): void {
    const tracker = new _PointerCaptureTarget(target, callback, options);
    _pointerCaptureTargetRegistry.set(target, tracker);
  }

  export function clearAutoPointerCapture(target: Element): void {
    const tracker = _pointerCaptureTargetRegistry.get(target);
    if (!!tracker) {
      tracker.disconnect();
      _pointerCaptureTargetRegistry.delete(target);
    }
  }

}

export {
  UiViewElement,
};
