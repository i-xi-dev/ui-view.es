
type pointerid = number;

// captureと単なるcontactは別にする （途中で変わった場合とか面倒すぎ）

type _TargetGeometry = {
  boundingBox: {
    width: number,
    height: number,
    viewportXOffset: number,
    viewportYOffset: number,
  },
  viewport: {
    width: number,
    height: number,
    scrollX: number,
    scrollY: number,
  },
};

interface Pointer /*extends EventTarget*/ {
  get pointerId(): pointerid;
  get pointerType(): string;
  get isPrimary(): boolean;
  get trackStream(): ReadableStream<Pointer.Track>;
}

class PointerImpl implements Pointer {
  readonly #target: Element;
  readonly #pointerId: pointerid;
  readonly #pointerType: string;
  readonly #isPrimary: boolean;
  readonly #trackStream: ReadableStream<Pointer.Track>;

  constructor(target: Element, event: PointerEvent, streamInit: UnderlyingDefaultSource<Pointer.Track>) {
    this.#target = target;
    this.#pointerId = event.pointerId;
    this.#pointerType = event.pointerType;
    this.#isPrimary = event.isPrimary;
    this.#trackStream = new ReadableStream(streamInit);
  }

  get pointerId(): pointerid {
    return this.#pointerId;
  }

  get pointerType(): string {
    return this.#pointerType;
  }

  get isPrimary(): boolean {
    return this.#isPrimary;
  }

  get trackStream(): ReadableStream<Pointer.Track> {
    return this.#trackStream;
  }
}

namespace Pointer {

  export type Track = {
    targetXOffset: number,
    targetYOffset: number,
    timestamp: number,
    eventType: string,
    targetMetrics?: _TargetGeometry,
    intersectsTarget?: boolean,
  };

  export type CaptureCallback = (pointer: Pointer) => void;

  export type CaptureOptions = {
    captureNonPrimaryPointer?: boolean,
    captureUntrustedPointer?: boolean,
    maxConcurrentCaptures?: number,
    //TODO pointerType制限
    //TODO touch-actionでパンを無効にするか
    //     子孫を強制pointer-events:noneにするか
    //TODO pointermoveでgetCoalescedEventsも取得するか
  };

  export class CaptureTarget {
    readonly #target: Element;
    readonly #captureNonPrimaryPointer: boolean;
    readonly #captureUntrustedPointer: boolean;
    readonly #maxConcurrentCaptures: number;
    readonly #controllers: Map<pointerid, ReadableStreamDefaultController<Track>>;
    readonly #eventListenerAborter: AbortController;
    constructor(target: Element, callback: CaptureCallback, options: CaptureOptions = {}) {
      this.#target = target;
      this.#captureNonPrimaryPointer = (options.captureNonPrimaryPointer === true);
      this.#captureUntrustedPointer = (options.captureUntrustedPointer === true);
      this.#maxConcurrentCaptures = Number.isSafeInteger(options.maxConcurrentCaptures) ? (options.maxConcurrentCaptures as number) : 1;
      this.#controllers = new Map();
      this.#eventListenerAborter = new AbortController();
      const { signal } = this.#eventListenerAborter;

      this.#target.addEventListener("pointerdown", ((event: PointerEvent) => {
        if ((this.#captureNonPrimaryPointer !== true) && (event.isPrimary !== true)) {
          return;
        }
        if ((this.#captureUntrustedPointer !== true) && (event.isTrusted !== true)) {
          return;
        }
        if (this.#controllers.size >= this.#maxConcurrentCaptures) {
          return;
        }

        if (this.#target !== event.target) {
          // pointerdownとgotpointercaptureでoffsetX/Yの基点が変わる場合に要注意
          //    gotpointercaptureのtargetの子孫が、pointerdownのtargetの場合など
          //    子孫はpointer-events:noneを推奨
          console.error(`XXX 01`);
          return;
        }
        this.#target.setPointerCapture(event.pointerId);

        const targetMetrics = this.#getTargetMetrics((event.target as Element), (event.view as Window));
        const firstTrack = {
          targetXOffset: event.offsetX,
          targetYOffset: event.offsetY,
          timestamp: event.timeStamp,
          eventType: event.type,
          targetMetrics,
        };

        const start = (controller: ReadableStreamDefaultController<Track>) => {
          this.#controllers.set(event.pointerId, controller);
          controller.enqueue(firstTrack);
        };
        //const pull = () => {};
        const cancel = () => {};
        const pointer: Pointer = new PointerImpl(this.#target, event, {
          start,
          //pull,
          cancel,
        });

        callback(pointer);

      }) as EventListener, { passive: true, signal });

      // gotpointercapture

      this.#target.addEventListener("pointermove", ((event: PointerEvent): void => {
        this.#pushTrack(event, false);
      }) as EventListener, { passive: true, signal });

      // pointerrawupdate

      this.#target.addEventListener("pointerup", ((event: PointerEvent): void => {
        this.#pushTrack(event, true);
      }) as EventListener, { passive: true, signal });

      this.#target.addEventListener("pointercancel", ((event: PointerEvent): void => {
        this.#pushTrack(event, true);
      }) as EventListener, { passive: true, signal });

      this.#target.addEventListener("lostpointercapture", ((event: PointerEvent): void => {
        this.#controllers.delete(event.pointerId);
      }) as EventListener, { passive: true, signal });

    }

    #getTargetMetrics(target: Element, view: Window) {
      const targetBoundingBox = target.getBoundingClientRect();
      return {
        boundingBox: {
          width: targetBoundingBox.width,
          height: targetBoundingBox.height,
          viewportXOffset: targetBoundingBox.left,
          viewportYOffset: targetBoundingBox.top,
        },
        viewport: {
          width: view.innerWidth,
          height: view.innerHeight,
          scrollX: view.screenX,
          scrollY: view.screenY,
        },
      };
    }

    #pushTrack(event: PointerEvent, terminated: boolean): void {
      const controller = this.#controllers.get(event.pointerId);
      if (!!controller) {
        if (terminated === true) {
          const targetMetrics = this.#getTargetMetrics((event.target as Element), (event.view as Window));
          const intersectsTarget = this.#target.ownerDocument.elementsFromPoint(event.clientX, event.clientY).includes(this.#target);//TODO shadowrootの場合
          controller.enqueue({
            targetXOffset: event.offsetX,
            targetYOffset: event.offsetY,
            timestamp: event.timeStamp,
            eventType: event.type,
            targetMetrics,
            intersectsTarget,
          });
          controller.close();
        }
        else {
          controller.enqueue({
            targetXOffset: event.offsetX,
            targetYOffset: event.offsetY,
            timestamp: event.timeStamp,
            eventType: event.type,
          });
        }
      }
      else {
        console.error(`XXX 02`);
      }
    }

    disconnect(): void {
      this.#eventListenerAborter.abort();
      this.#controllers.clear();
    }
  }

}

export {
  Pointer,
};
