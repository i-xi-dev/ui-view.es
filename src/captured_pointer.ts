import { Viewport } from "./viewport";

//TODO ReadableStreamにしてしまえばWidgetのサブクラス側でaddPointerActionは不要なのでは

type _BoundingBox = {//TODO 重複
  readonly left: number,
  readonly right: number,
  readonly top: number,
  readonly bottom: number,
};

type pointerid = number;

class CapturedPointer {
  readonly #id: pointerid;

  readonly #type: string;

  readonly #timeline: Array<CapturedPointer.TimelineItem>;

  readonly #targetBoundingBox: Readonly<_BoundingBox>;// pointercapture中に変わることは考慮しない

  constructor(event: PointerEvent) {
    this.#id = event.pointerId;
    this.#type = event.pointerType;
    this.#timeline = [];
    this.addTimelineItem(event);
    const { left, right, top, bottom } = (event.target as Element).getBoundingClientRect();//TODO viewport.ts
    this.#targetBoundingBox = Object.freeze({
      left,
      right,
      top,
      bottom,
    });
  }

  get id(): pointerid {
    return this.#id;
  }

  get type(): string {
    return this.#type;
  }

  get firstTimelineItem(): CapturedPointer.TimelineItem {
    return this.#timeline[0] as CapturedPointer.TimelineItem;
  }

  get lastTimelineItem(): CapturedPointer.TimelineItem {
    return this.#timeline.at(-1) as CapturedPointer.TimelineItem;
  }

  get targetBoundingBox(): Readonly<_BoundingBox> {
    return this.#targetBoundingBox;
  }

  get isNotMoved(): boolean {
    const firstPoint = this.firstTimelineItem.point;
    return this.#timeline.every((item) => (item.point.x === firstPoint.x) && (item.point.y === firstPoint.y));
  }

  addTimelineItem(event: PointerEvent) {
    if (this.#id !== event.pointerId) {
      throw new Error("TODO");
    }
    this.#timeline.push({
      point: {
        x: event.clientX,
        y: event.clientY,
      },
      timestamp: event.timeStamp,
      type: event.type,
    });
  }

}

namespace CapturedPointer {
  export  type TimelineItem = {
    readonly point: Viewport.Inset,
    readonly timestamp: number,
    readonly type: string,
  };
}

export { CapturedPointer };
