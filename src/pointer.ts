
// pointer lock に非対応

// captureと単なるcontactは別にする （途中で変わった場合とか面倒すぎ）

type pointerid = number;

type _TargetGeometry = {
  boundingBox: {
    width: number,
    height: number,
    offsetXFromViewport: number,
    offsetYFromViewport: number,
  },
  viewport: {
    width: number,
    height: number,
    scrollX: number,
    scrollY: number,
  },
};

interface Pointer {
  get target(): Element;
  get pointerId(): pointerid;
  get pointerType(): string;
  get isPrimary(): boolean;
  get trackStream(): ReadableStream<Pointer.Track>;
  [Symbol.asyncIterator](): AsyncGenerator<Pointer.Track, void, void>;//XXX ReadbleStream[Symbol.asyncIterator]がブラウザでなかなか実装されないので
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

  get target(): Element {
    return this.#target;
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

  [Symbol.asyncIterator]() {
    const streamReader = this.trackStream.getReader();
    return (async function*() {
      try {
        for (
          let i = await streamReader.read();
          (i.done !== true);
          i = await streamReader.read()
        ) {
          yield i.value;
        }
      } catch (exception) {
        void exception; // XXX
        return;
      }
      finally {
        streamReader.releaseLock();
      }
    })();
  }
}

namespace Pointer {

  export type Track = {
    offsetXFromViewport: number,
    offsetYFromViewport: number,
    timestamp: number,
    eventType: string,
    offsetXFromTargetBoundingBox: number,
    offsetYFromTargetBoundingBox: number,

    _x_targetGeometry?: _TargetGeometry,//TODO いる？ 設定次第にすれば？
    _x_intersectsTarget?: boolean,//TODO いる？ いるとしてもpointer側に持たせれば？
  };

  export type CaptureCallback = (pointer: Pointer) => void;

  export type CaptureOptions = {
    filter?: (event: PointerEvent) => boolean, // pointerTypeでフィルタとか、isPrimaryでフィルタとか、isTrustedでフィルタとか、位置でフィルタとか、composedPath()でフィルタとか、いろいろできるようにevent自体を渡す
    maxConcurrentCaptures?: number,
    highPrecision?: boolean,

    //XXX touch-actionでパンを無効にするか
    //     子孫を強制pointer-events:noneにするか
    //TODO pageに対しての座標をとるか
    //TODO pointermoveでもelementsFromPointを取得するか
    //TODO target他のresizeを監視するか
    //TODO target,viewport他のscrollを監視するか
    //TODO targetやviewport以外の任意の基準要素
  };

  export class CaptureTarget {
    readonly #target: Element;
    readonly #filter: (event: PointerEvent) => boolean;
    readonly #maxConcurrentCaptures: number;
    readonly #highPrecision: boolean;
    readonly #controllers: Map<pointerid, ReadableStreamDefaultController<Track>>;
    readonly #eventListenerAborter: AbortController;
    constructor(target: Element, callback: CaptureCallback, options: CaptureOptions = {}) {
      this.#target = target;
      this.#filter = (typeof options.filter === "function") ? options.filter : () => true;
      this.#maxConcurrentCaptures = Number.isSafeInteger(options.maxConcurrentCaptures) ? (options.maxConcurrentCaptures as number) : 1;
      this.#highPrecision = (options.highPrecision === true);
      this.#controllers = new Map();
      this.#eventListenerAborter = new AbortController();
      const { signal } = this.#eventListenerAborter;

      this.#target.addEventListener("pointerdown", ((event: PointerEvent) => {
        if (this.#filter(event) !== true) {
          return;
        }
        if (this.#controllers.size >= this.#maxConcurrentCaptures) {
          return;
        }

        this.#target.setPointerCapture(event.pointerId);

        const firstTrack = this.#getFirstTrack(event);

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
        this.#pushTrack(event);
      }) as EventListener, { passive: true, signal });

      // pointerrawupdate

      this.#target.addEventListener("pointerup", ((event: PointerEvent): void => {
        this.#pushLastTrack(event);
      }) as EventListener, { passive: true, signal });

      this.#target.addEventListener("pointercancel", ((event: PointerEvent): void => {
        this.#pushLastTrack(event);
      }) as EventListener, { passive: true, signal });

      this.#target.addEventListener("lostpointercapture", ((event: PointerEvent): void => {
        this.#controllers.delete(event.pointerId);
      }) as EventListener, { passive: true, signal });

    }

    get #rootNode(): (Document | ShadowRoot) {
      const root = this.#target.getRootNode();// コンストラクタで取得すると、まだconnectedされてないかも
      if ((root instanceof Document) || (root instanceof ShadowRoot)) {
        return root;
      }
      throw new Error("target is not connected");
    }

    #getTargetGeometry(target: Element, view: Window): _TargetGeometry {
      const targetBoundingBox = target.getBoundingClientRect();
      return {
        boundingBox: {
          width: targetBoundingBox.width,
          height: targetBoundingBox.height,
          offsetXFromViewport: targetBoundingBox.left,
          offsetYFromViewport: targetBoundingBox.top,
        },
        viewport: {
          width: view.innerWidth,
          height: view.innerHeight,
          scrollX: view.scrollX,
          scrollY: view.scrollY,
        },
      };
    }

    #getFirstTrack(event: PointerEvent): Track {
      const targetGeometry = this.#getTargetGeometry((this.#target as Element), (event.view as Window));
      let offsetXFromTargetBoundingBox = event.offsetX;
      let offsetYFromTargetBoundingBox = event.offsetY;
      if (this.#target !== event.target) {
        const pointerdownTargetMetrics = this.#getTargetGeometry((event.target as Element), (event.view as Window));
        offsetXFromTargetBoundingBox = offsetXFromTargetBoundingBox - (pointerdownTargetMetrics.boundingBox.offsetXFromViewport - targetGeometry.boundingBox.offsetXFromViewport);
        offsetYFromTargetBoundingBox = offsetYFromTargetBoundingBox - (pointerdownTargetMetrics.boundingBox.offsetYFromViewport - targetGeometry.boundingBox.offsetYFromViewport);
      }

      return {
        offsetXFromViewport: event.clientX,
        offsetYFromViewport: event.clientY,
        timestamp: event.timeStamp,
        eventType: event.type,
        offsetXFromTargetBoundingBox,
        offsetYFromTargetBoundingBox,
        _x_targetGeometry: targetGeometry,
        _x_intersectsTarget: true,// falseはありえない
      };
    }

    #pushTrack(event: PointerEvent): void {
      const controller = this.#controllers.get(event.pointerId);
      if (!!controller) {
        if (this.#highPrecision === true) {
          for (const coalesced of event.getCoalescedEvents()) {
            controller.enqueue({
              offsetXFromViewport: coalesced.clientX,
              offsetYFromViewport: coalesced.clientY,
              timestamp: coalesced.timeStamp,
              eventType: coalesced.type,
              offsetXFromTargetBoundingBox: coalesced.offsetX,
              offsetYFromTargetBoundingBox: coalesced.offsetY,
            });
          }
        }
        else {
          controller.enqueue({
            offsetXFromViewport: event.clientX,
            offsetYFromViewport: event.clientY,
            timestamp: event.timeStamp,
            eventType: event.type,
            offsetXFromTargetBoundingBox: event.offsetX,
            offsetYFromTargetBoundingBox: event.offsetY,
          });
        }
      }
      else {
        // captureしてないpointer
      }
    }

    #pushLastTrack(event: PointerEvent): void {
      const controller = this.#controllers.get(event.pointerId);
      if (!!controller) {
        const targetGeometry = this.#getTargetGeometry((event.target as Element), (event.view as Window));
        const intersectsTarget = this.#rootNode.elementsFromPoint(event.clientX, event.clientY).includes(this.#target);
        controller.enqueue({
          offsetXFromViewport: event.clientX,
          offsetYFromViewport: event.clientY,
          timestamp: event.timeStamp,
          eventType: event.type,
          offsetXFromTargetBoundingBox: event.offsetX,
          offsetYFromTargetBoundingBox: event.offsetY,
          _x_targetGeometry: targetGeometry,
          _x_intersectsTarget: intersectsTarget,
        });
        controller.close();
      }
      else {
        // captureしてないpointer
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
