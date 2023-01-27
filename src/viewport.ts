namespace Viewport {
  export type Inset = {
    x: number,
    y: number,
  };

  export function insetOf(geometric: Element | PointerEvent): Inset {
    if (!geometric) {
      throw new TypeError("geometric is required");
    }

    {
      const element = geometric as Element;
      if (!!element.getBoundingClientRect) {
        const { x, y } = element.getBoundingClientRect();
        return {
          x,
          y,
        };
      }
    }

    {
      const event = geometric as PointerEvent;
      if (Number.isFinite(event.clientX) && Number.isFinite(event.clientY)) {
        return {
          x: event.clientX,
          y: event.clientY,
        };
      }
    }

    throw new TypeError("unknown type geometric")
  }
}

export { Viewport };
