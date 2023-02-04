import { Geometry } from "./geometry";
import { BoundingBox } from "./bounding_box";
import { Viewport } from "./viewport";

// 対象要素はtouch-actionでパン無効を推奨
// 対象要素の子孫でのpointerイベントが必要ない場合は、子孫はpointer-events:none推奨

//XXX 非pontercaptureのトラッカーを追加

type pointerid = number;// integer
type milliseconds = number;

type _PointerCaptureInternals = {
  readonly pointer: Pointer,
  readonly controller: ReadableStreamDefaultController<Pointer.CaptureTrack>,
};

class _PointerCapture implements Pointer.Capture {
  readonly #target: _PointerCaptureTarget;
  readonly #task: Promise<Pointer.CaptureResult>;
  #onCaptureComplete: (value: Pointer.CaptureResult) => void = (): void => undefined;
  #onCaptureFail: (reason?: any) => void = (): void => undefined;
  readonly #trackStream: ReadableStream<Pointer.CaptureTrack>;

  constructor(target: _PointerCaptureTarget, trackStream: ReadableStream<Pointer.CaptureTrack>) {
    this.#target = target;
    this.#task = new Promise((resolve, reject) => {
      this.#onCaptureComplete = resolve;
      this.#onCaptureFail = reject;
    });
    this.#trackStream = trackStream;
  }

  get result(): Promise<Pointer.CaptureResult> {
    return this.#task;
  }

  //XXX ReadableStream#[Symbol.asyncIterator]がブラウザでなかなか実装されないので…
  async *[Symbol.asyncIterator](): AsyncGenerator<Pointer.CaptureTrack, void, void> {
    try {
      let firstTrack: Pointer.CaptureTrack | undefined = undefined;
      let lastTrack: Pointer.CaptureTrack | undefined = undefined;
      for await (const track of this.#tracks()) {
        if (!firstTrack) {
          firstTrack = track;
        }
        lastTrack = track;
        yield track;
      }

      let duration: milliseconds = 0;
      let relativeX: number = 0;
      let relativeY: number = 0;
      if (!!firstTrack && !!lastTrack) {
        duration = (lastTrack.timestamp - firstTrack.timestamp);
        relativeX = (lastTrack.offsetFromViewport.left - firstTrack.offsetFromViewport.left);
        relativeY = (lastTrack.offsetFromViewport.top - firstTrack.offsetFromViewport.top);
      }
      const startPoint = { left: Number.NaN, top: Number.NaN };
      if (!!firstTrack) {
        startPoint.left = firstTrack.offsetFromViewport.left;
        startPoint.top = firstTrack.offsetFromViewport.top;
      }
      const endPoint = { left: Number.NaN, top: Number.NaN };
      let terminatedByPointerLost = false;
      let endPointIntersectsTarget = false;
      if (!!lastTrack) {
        endPoint.left = lastTrack.offsetFromViewport.left;
        endPoint.top = lastTrack.offsetFromViewport.top;
        terminatedByPointerLost = (lastTrack.pointerState === Pointer.State.LOST);
        endPointIntersectsTarget = !terminatedByPointerLost && (this.#target.containsPoint(endPoint) === true);
      }
      this.#onCaptureComplete({
        duration,
        startPoint,
        endPoint,
        terminatedByPointerLost,
        relativeX,
        relativeY,
        endPointIntersectsTarget,
      });
      return;
    }
    catch (exception) {
      this.#onCaptureFail(exception);
    }
  }

  async * #tracks(): AsyncGenerator<Pointer.CaptureTrack, void, void> {
    const streamReader = this.#trackStream.getReader();
    try {
      for (let i = await streamReader.read(); (i.done !== true); i = await streamReader.read()) {
        yield i.value;
      }
      return;
    }
    finally {
      streamReader.releaseLock();
    }
  }
}

class _PointerCaptureTarget {
  readonly #element: Element;
  readonly #eventListenerAborter: AbortController;
  readonly #internalsMap: Map<pointerid, _PointerCaptureInternals>;
  readonly #filter: (event: PointerEvent) => boolean;
  readonly #maxConcurrentCaptures: number;
  readonly #highPrecision: boolean;

  constructor(element: Element, callback: Pointer.CaptureCallback, options: Pointer.CaptureOptions) {
    this.#element = element;
    this.#eventListenerAborter = new AbortController();
    this.#filter = (typeof options.filter === "function") ? options.filter : Pointer.DefaultCaptureFilter;
    this.#maxConcurrentCaptures = Number.isSafeInteger(options.maxConcurrentCaptures) ? (options.maxConcurrentCaptures as number) : 1;
    this.#highPrecision = (options.highPrecision === true) && !!(new PointerEvent("test")).getCoalescedEvents;//XXX safariが未実装:getCoalescedEvents

    const listenerOptions = {
      passive: true,
      signal: this.#eventListenerAborter.signal,
    };

    this.#internalsMap = new Map();

    this.#element.addEventListener("pointerdown", ((event: PointerEvent) => {
      if (event.isTrusted !== true) {
        return;// 受け付けるようにする場合は、pointerdownがtrustedでpointermoveが非trustedの場合の挙動をどうするか
      }
      this.#requestCapture(event, callback);
    }) as EventListener, listenerOptions);

    //XXX gotpointercapture ここで座標が変わることあるのか

    this.#element.addEventListener("pointermove", ((event: PointerEvent): void => {
      if (event.isTrusted !== true) {
        return;
      }
      this.#pushTrack(event);
    }) as EventListener, listenerOptions);

    //XXX pointerrawupdate設定可にする

    this.#element.addEventListener("pointerup", ((event: PointerEvent): void => {
      if (event.isTrusted !== true) {
        return;
      }
      this.#pushLastTrack(event);
    }) as EventListener, listenerOptions);

    this.#element.addEventListener("pointercancel", ((event: PointerEvent): void => {
      if (event.isTrusted !== true) {
        return;
      }
      this.#pushLastTrack(event);
    }) as EventListener, listenerOptions);

    this.#element.addEventListener("lostpointercapture", ((event: PointerEvent): void => {
      if (event.isTrusted !== true) {
        return;
      }
      this.#onRelease(event);
    }) as EventListener, listenerOptions);
  }

  get element(): Element {
    return this.#element;
  }

  get #rootNode(): (Document | ShadowRoot) {
    const root = this.#element.getRootNode();// 毎回とるのもどうかと思うが、コンストラクタで取得するとまだconnectedされてないかもしれない＋再connectなどの検知が困難
    if ((root instanceof Document) || (root instanceof ShadowRoot)) {
      return root;
    }
    throw new Error("invalid state: element is not connected");
  }

  disconnect(): void {
    this.#eventListenerAborter.abort();
    this.#internalsMap.clear();
  }

  containsPoint(point: Viewport.Inset): boolean {
    return this.#rootNode.elementsFromPoint(point.left, point.top).includes(this.#element);
  }

  #requestCapture(event: PointerEvent, callback: Pointer.CaptureCallback): void {
    if (this.#filter(event) !== true) {
      return;
    }
    if (this.#internalsMap.size >= this.#maxConcurrentCaptures) {
      return;
    }

    const pointer = Pointer.fromPointerEvent(event);

    //TODO 自動pointercaptureはpointerdown時にhasPointerCaptureで判別できる　ただしtargetがわかっていれば
    //     解除した方が良いのか、放っておいて問題ないのか要確認
    this.#element.setPointerCapture(event.pointerId);

    const start = (controller: ReadableStreamDefaultController<Pointer.CaptureTrack>) => {
      const internals = {
        pointer,
        controller,
      };
      this.#internalsMap.set(event.pointerId, internals);

      // pointerdownのtargetはthis.#elementの子孫である可能性（すなわちevent.offsetX/Yがthis.#elementの座標ではない可能性）
      const adjustment = (this.#element !== event.target) ? BoundingBox.geometryOf(this.#element, (event.target as Element)) : undefined;
      const firstTrack = this.#eventToTrack(internals, event, true, adjustment?.offset);
      controller.enqueue(firstTrack);
    };
    const cancel = () => {};

    const trackStream: ReadableStream<Pointer.CaptureTrack> = new ReadableStream({
      start,
      cancel,
    });

    callback(new _PointerCapture(this, trackStream));
  }

  #eventToTrack(internals: _PointerCaptureInternals, event: PointerEvent, geometry: boolean = false, adjustment?: Geometry.PointOffset): Pointer.CaptureTrack {
    const offsetFromTarget = {
      left: event.offsetX,
      top: event.offsetY,
    };
    if (!!adjustment && Number.isFinite(adjustment?.left) && Number.isFinite(adjustment?.top)) {
      offsetFromTarget.left = offsetFromTarget.left - adjustment.left;
      offsetFromTarget.top = offsetFromTarget.top - adjustment.top;
    }

    const pointerState = (event.type === "pointercancel") ? Pointer.State.LOST : Pointer.State.ACTIVE;
    let capturePhase: Pointer.CapturePhase;
    switch (event.type) {
      case "pointerdown":
        capturePhase = Pointer.CapturePhase.BEFORE_CAPTURE;
        break;
      case "pointermove":
        capturePhase = Pointer.CapturePhase.CAPTURED;
        break;
      case "pointerup":
      case "pointercancel":
        capturePhase = Pointer.CapturePhase.BEFORE_RELEASE;
        break;
      default:
        capturePhase = Pointer.CapturePhase.RELEASED;
        // pointerup,pointercancelの後は#eventToTrackを呼んでいないのでありえない
        break;
    }

    if (geometry === true) {
      return {
        pointer: internals.pointer,
        timestamp: event.timeStamp,
        offsetFromViewport: {
          left: event.clientX,
          top: event.clientY,
        },
        offsetFromTarget,

        pointerState,
        capturePhase,
        geometry: {
          viewport: Viewport.geometryOf(event.view as Window),
          target: BoundingBox.geometryOf(this.#element),
        },
      };
    }

    return {
      pointer: internals.pointer,
      timestamp: event.timeStamp,
      offsetFromViewport: {
        left: event.clientX,
        top: event.clientY,
      },
      offsetFromTarget,

      pointerState,
      capturePhase,
    };
  }

  #pushTrack(event: PointerEvent): void {
    if (this.#internalsMap.has(event.pointerId) === true) {
      const internals = this.#internalsMap.get(event.pointerId) as _PointerCaptureInternals;

      if (this.#highPrecision === true) {
        for (const coalesced of event.getCoalescedEvents()) {
          internals.controller.enqueue(this.#eventToTrack(internals, coalesced));
        }
      }
      else {
        internals.controller.enqueue(this.#eventToTrack(internals, event));
      }
    }
  }

  #pushLastTrack(event: PointerEvent): void {
    if (this.#internalsMap.has(event.pointerId) === true) {
      const internals = this.#internalsMap.get(event.pointerId) as _PointerCaptureInternals;

      internals.controller.enqueue(this.#eventToTrack(internals, event, true));//XXX いる？（最後のpointermoveから座標が変化することがありえるか）
      internals.controller.close();
    }
  }

  #onRelease(event: PointerEvent): void {
    if (this.#internalsMap.has(event.pointerId) === true) {
      //const internals = this.#internalsMap.get(event.pointerId) as _PointerCaptureInternals;
      this.#internalsMap.delete(event.pointerId);
    }
  }
}

const _pointerCaptureTargetRegistry: WeakMap<Element, _PointerCaptureTarget> = new WeakMap();

class Pointer {
  readonly #id: pointerid;
  readonly #type: string;
  readonly #isPrimary: boolean;
  private constructor(id: pointerid, type: string, isPrimary: boolean) {
    this.#id = id;
    this.#type = type;
    this.#isPrimary = isPrimary;
  }
  static fromPointerEvent(event: PointerEvent): Pointer {
    return new Pointer(event.pointerId, event.pointerType, event.isPrimary);
  }
  get id(): pointerid {
    return this.#id;
  }
  get type(): string {
    return this.#type;
  }
  get isPrimary(): boolean {
    return this.#isPrimary;
  }
}

namespace Pointer {
  export const State = {
    ACTIVE: "active", // おおむねpointer events仕様のactive pointerのこと
    LOST: "lost", // ここでは、active pointerからpointercancelイベントでもって非作動状態となったものとする
  } as const;
  export type State = typeof State[keyof typeof State];

  export interface Track {
    readonly pointer: Pointer;
    readonly timestamp: number;
    readonly offsetFromViewport: Viewport.Inset;
    readonly offsetFromTarget: BoundingBox.Inset; // offset from target bounding box
    //XXX pointerWidth,pointerHeight,pressure,tangentialPressure,tiltX,tiltY,twist,altitudeAngle,azimuthAngle,getPredictedEvents, ctrlKey,shiftKey,altKey,metaKey,button,buttons, isTrusted,composedPath, ...
  };

  export const CapturePhase = {
    BEFORE_CAPTURE: "before-capture",
    CAPTURED: "captured",
    BEFORE_RELEASE: "before-release",
    RELEASED: "released",
  } as const;
  export type CapturePhase = typeof CapturePhase[keyof typeof CapturePhase];

  export interface CaptureTrack extends Track {
    readonly pointerState: State,
    readonly capturePhase: CapturePhase,
    readonly geometry?: {
      viewport: Viewport.Geometry,
      target: BoundingBox.Geometry,
    };//XXX とりあえず、最初と最後のみ //XXX CaptureResultに移す
  };

  export type CaptureResult = {
    duration: milliseconds,
    startPoint: Viewport.Inset,
    endPoint: Viewport.Inset,
    terminatedByPointerLost: boolean, // 単にpointercancelでキャプチャーが終了したか否か（それ以上のキャンセル条件は利用する側で判定すること）
    relativeX: number, // 終点の始点からの相対位置
    relativeY: number,
    //XXX 絶対移動量 要る？（要る場合、PointerEvent#movementX/Yはブラウザによって単位が違うので、pointermove毎に前回pointermoveとのviewport座標の差分絶対値を取得し、それを合計する）
    endPointIntersectsTarget: boolean,// 終点は要素のヒットテストにヒットするか
    //XXX viewportResized,viewportScrolled,targetResized,targetScrolled,任意の祖先要素Scrolled,...
  };

  export interface Capture {
    get result(): Promise<CaptureResult>;
    [Symbol.asyncIterator](): AsyncGenerator<CaptureTrack, void, void>;
  }

  export type CaptureCallback = (capture: Capture) => (void | Promise<void>);

  export const DefaultCaptureFilter = (event: PointerEvent): boolean => {
    return (["mouse", "pen", "touch"].includes(event.pointerType) && (event.buttons <= 1));
  };

  export type CaptureOptions = {
    // pointerTypeでフィルタとか、isPrimaryでフィルタとか、isTrustedでフィルタとか、位置でフィルタとか、composedPath()でフィルタとか、いろいろできるようにevent自体を渡す
    filter?: (event: PointerEvent) => boolean,

    //TODO そもそも同時captureできるのか？
    maxConcurrentCaptures?: number,

    //XXX 命名が違う気がする
    highPrecision?: boolean,

    //TODO 全trackにboundingboxから外れているかいないかを持たせるか
    //XXX target他のresizeを監視するか →要らないのでは
    //XXX target,viewport他のscrollを監視するか →要らないのでは
    //XXX targetやviewport以外の任意の基準要素 →要らないのでは
    //TODO event.button,buttonsの変化を監視するか
  };

  export namespace CaptureTarget {
    export function register(element: Element, callback: CaptureCallback, options: CaptureOptions = {}): void {
      const target = new _PointerCaptureTarget(element, callback, options);
      _pointerCaptureTargetRegistry.set(element, target);
    }
  
    export function unregister(element: Element): void {
      const target = _pointerCaptureTargetRegistry.get(element);
      if (!!target) {
        target.disconnect();
        _pointerCaptureTargetRegistry.delete(element);
      }
    }
  }
}

export {
  Pointer,
};
