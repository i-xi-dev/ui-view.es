type OffsetFrom = {
  edge: "bounding-box",//TODO | "scrollport-content",
  edgeOf: Element | null, // nullはlayout-viewport
};

type BoundingBoxOffset = {
  from: OffsetFrom,
  left: number,
  top: number,
  right: number,
  bottom: number,
};

type BoundingBoxSize = {
  width: number,
  height: number,
};

type _BoundingBoxMetrics = {
  size: BoundingBoxSize,
  offset: BoundingBoxOffset,
};

function _getMetrics(view: Window, target: Element | null): _BoundingBoxMetrics {
  if (target instanceof Element) {
    const rect = target.getBoundingClientRect();
    return {
      size: {
        width: rect.width,
        height: rect.height,
      },
      offset: {
        from: {
          edge: "bounding-box",
          edgeOf: null,
        },
        left: rect.left,
        top: rect.top,
        right: view.innerWidth - rect.right,
        bottom: view.innerHeight - rect.bottom,
      },
    };
  }
  else {
    // layout-viewportとみなす
    return {
      size: {
        width: view.innerWidth,
        height: view.innerHeight,
      },
      offset: {
        from: {
          edge: "bounding-box",
          edgeOf: null, // layout-viewport
        },
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
      },
    }
  }
}

class BoundingBox {
  #element: Element;

  constructor(element: Element) {
    if ((element instanceof Element) !== true) {
      throw new TypeError("element");
    }
    this.#element = element;
  }

  #getMetrics(): { metrics: _BoundingBoxMetrics, view: Window } {
    if (this.#element.isConnected !== true) {
      throw new Error("InvalidState: element");//TODO
    }
    const thisView = this.#element.ownerDocument.defaultView;
    if (thisView) {
      const thisMetrics = _getMetrics(thisView, this.#element);
      return {
        metrics: thisMetrics,
        view: thisView,
      };
    }
    throw new Error("InvalidState: element.ownerDocument");//TODO
  }

  getSize(): BoundingBoxSize {
    const { metrics } = this.#getMetrics();
    return metrics.size;
  }

  getOffset(from: OffsetFrom): BoundingBoxOffset {
    const { metrics, view } = this.#getMetrics();
    const thisOffset = metrics.offset;

    if (from.edgeOf) {
      if (from.edgeOf.isConnected !== true) {
        throw new Error("InvalidState: from.edgeOf - 1");//TODO
      }
      else if (from.edgeOf.ownerDocument !== this.#element.ownerDocument) {
        throw new Error("InvalidState: from.edgeOf - 2");//TODO
      }

      const fromMetrics = _getMetrics(view, from.edgeOf);
      const fromOffset = fromMetrics.offset;
      return {
        from,
        left: thisOffset.left + fromOffset.left,
        top: thisOffset.top + fromOffset.top,
        right: thisOffset.right + fromOffset.right,
        bottom: thisOffset.bottom + fromOffset.bottom,
      };
    }
    else {
      return thisOffset;
    }
  }
}
Object.freeze(BoundingBox);

export { BoundingBox };
