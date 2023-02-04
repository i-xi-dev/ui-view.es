import { Geometry as _ } from "./geometry";

namespace Viewport {
  // coord from left and top edge of viewport
  export type Inset = _.PointOffset;

  export type Geometry = _.RectSize & {
    //scrollLeft: number,//XXX rtlの場合の算出法が違う
    //scrollTop: number,//XXX 
  };

  export function geometryOf(view: Window): Geometry {
    if ((view instanceof Window) !== true) {
      throw new TypeError("view");
    }

    return {
      width: view.innerWidth,
      height: view.innerHeight,
      //scrollLeft: view.scrollX,
      //scrollTop: view.scrollY,
    };
  }
}

export { Viewport };
