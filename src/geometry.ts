namespace Geometry {

  export type PointOffset = {
    left: number,
    top: number,
    // inlineStart
    // blockStart
  };

  export type RectSize = {
    width: number,
    height: number,
    // inlineSize
    // blockSize
  };

  export type RectOffset = {
    left: number,
    top: number,
    right: number,
    bottom: number,
    // inlineStart
    // inlineEnd
    // blockStart
    // blockEnd
  };

}

export { Geometry };
