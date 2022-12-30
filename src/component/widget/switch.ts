import { Aria } from "./aria";
import { WidgetBase, WidgetDimension } from "./widget_base";

const _TrackLength = {
  XS: (WidgetDimension.X_SMALL * 1.25),
  S: (WidgetDimension.SMALL * 1.25),
  M: (WidgetDimension.MEDIUM * 1.25),
  L: (WidgetDimension.LARGE * 1.25),
  XL: (WidgetDimension.X_LARGE * 1.25),
};

const _TrackThickness = {
  XS: (WidgetDimension.X_SMALL / 2),
  S: (WidgetDimension.SMALL / 2),
  M: (WidgetDimension.MEDIUM / 2),
  L: (WidgetDimension.LARGE / 2),
  XL: (WidgetDimension.X_LARGE / 2),
};

const _TRACK_OFFSET_INLINE_START = 4;

const _TrackThicknessHalf = {
  XS: (_TrackThickness.XS / 2),
  S: (_TrackThickness.S / 2),
  M: (_TrackThickness.M / 2),
  L: (_TrackThickness.L / 2),
  XL: (_TrackThickness.XL / 2),
};

const _THUMB_RADIUS_EXTENTION = _TRACK_OFFSET_INLINE_START + 1;

const _ThumbShadowRadius = {
  XS: (_TrackThicknessHalf.XS + _THUMB_RADIUS_EXTENTION),
  S: (_TrackThicknessHalf.S + _THUMB_RADIUS_EXTENTION),
  M: (_TrackThicknessHalf.M + _THUMB_RADIUS_EXTENTION),
  L: (_TrackThicknessHalf.L + _THUMB_RADIUS_EXTENTION),
  XL: (_TrackThicknessHalf.XL + _THUMB_RADIUS_EXTENTION),
};

const _ThumbCxStart = {
  XS: _TrackThicknessHalf.XS,
  S: _TrackThicknessHalf.S,
  M: _TrackThicknessHalf.M,
  L: _TrackThicknessHalf.L,
  XL: _TrackThicknessHalf.XL,
};

const _ClipPathThumbStart = {
  XS: `M ${ _ThumbCxStart.XS } ${ _THUMB_RADIUS_EXTENTION * -1 } A ${ _ThumbShadowRadius.XS } ${ _ThumbShadowRadius.XS } -90 1 0 ${ _ThumbCxStart.XS } ${ _TrackThickness.XS + _THUMB_RADIUS_EXTENTION } A ${ _ThumbShadowRadius.XS } ${ _ThumbShadowRadius.XS } -90 1 0 ${ _ThumbCxStart.XS } ${ _THUMB_RADIUS_EXTENTION * -1 }`,
  S: `M ${ _ThumbCxStart.S } ${ _THUMB_RADIUS_EXTENTION * -1 } A ${ _ThumbShadowRadius.S } ${ _ThumbShadowRadius.S } -90 1 0 ${ _ThumbCxStart.S } ${ _TrackThickness.S + _THUMB_RADIUS_EXTENTION } A ${ _ThumbShadowRadius.S } ${ _ThumbShadowRadius.S } -90 1 0 ${ _ThumbCxStart.S } ${ _THUMB_RADIUS_EXTENTION * -1 }`,
  M: `M ${ _ThumbCxStart.M } ${ _THUMB_RADIUS_EXTENTION * -1 } A ${ _ThumbShadowRadius.M } ${ _ThumbShadowRadius.M } -90 1 0 ${ _ThumbCxStart.M } ${ _TrackThickness.M + _THUMB_RADIUS_EXTENTION } A ${ _ThumbShadowRadius.M } ${ _ThumbShadowRadius.M } -90 1 0 ${ _ThumbCxStart.M } ${ _THUMB_RADIUS_EXTENTION * -1 }`,
  L: `M ${ _ThumbCxStart.L } ${ _THUMB_RADIUS_EXTENTION * -1 } A ${ _ThumbShadowRadius.L } ${ _ThumbShadowRadius.L } -90 1 0 ${ _ThumbCxStart.L } ${ _TrackThickness.L + _THUMB_RADIUS_EXTENTION } A ${ _ThumbShadowRadius.L } ${ _ThumbShadowRadius.L } -90 1 0 ${ _ThumbCxStart.L } ${ _THUMB_RADIUS_EXTENTION * -1 }`,
  XL: `M ${ _ThumbCxStart.XL } ${ _THUMB_RADIUS_EXTENTION * -1 } A ${ _ThumbShadowRadius.XL } ${ _ThumbShadowRadius.XL } -90 1 0 ${ _ThumbCxStart.XL } ${ _TrackThickness.XL + _THUMB_RADIUS_EXTENTION } A ${ _ThumbShadowRadius.XL } ${ _ThumbShadowRadius.XL } -90 1 0 ${ _ThumbCxStart.XL } ${ _THUMB_RADIUS_EXTENTION * -1 }`,
};

const _ThumbCxEnd = {
  XS: (_TrackLength.XS - _TrackThicknessHalf.XS),
  S: (_TrackLength.S - _TrackThicknessHalf.S),
  M: (_TrackLength.M - _TrackThicknessHalf.M),
  L: (_TrackLength.L - _TrackThicknessHalf.L),
  XL: (_TrackLength.XL - _TrackThicknessHalf.XL),
};

const _ClipPathThumbEnd = {
  XS: `M ${ _ThumbCxEnd.XS } ${ _THUMB_RADIUS_EXTENTION * -1 } A ${ _ThumbShadowRadius.XS } ${ _ThumbShadowRadius.XS } -90 1 0 ${ _ThumbCxEnd.XS } ${ _TrackThickness.XS + _THUMB_RADIUS_EXTENTION } A ${ _ThumbShadowRadius.XS } ${ _ThumbShadowRadius.XS } -90 1 0 ${ _ThumbCxEnd.XS } ${ _THUMB_RADIUS_EXTENTION * -1 }`,
  S: `M ${ _ThumbCxEnd.S } ${ _THUMB_RADIUS_EXTENTION * -1 } A ${ _ThumbShadowRadius.S } ${ _ThumbShadowRadius.S } -90 1 0 ${ _ThumbCxEnd.S } ${ _TrackThickness.S + _THUMB_RADIUS_EXTENTION } A ${ _ThumbShadowRadius.S } ${ _ThumbShadowRadius.S } -90 1 0 ${ _ThumbCxEnd.S } ${ _THUMB_RADIUS_EXTENTION * -1 }`,
  M: `M ${ _ThumbCxEnd.M } ${ _THUMB_RADIUS_EXTENTION * -1 } A ${ _ThumbShadowRadius.M } ${ _ThumbShadowRadius.M } -90 1 0 ${ _ThumbCxEnd.M } ${ _TrackThickness.M + _THUMB_RADIUS_EXTENTION } A ${ _ThumbShadowRadius.M } ${ _ThumbShadowRadius.M } -90 1 0 ${ _ThumbCxEnd.M } ${ _THUMB_RADIUS_EXTENTION * -1 }`,
  L: `M ${ _ThumbCxEnd.L } ${ _THUMB_RADIUS_EXTENTION * -1 } A ${ _ThumbShadowRadius.L } ${ _ThumbShadowRadius.L } -90 1 0 ${ _ThumbCxEnd.L } ${ _TrackThickness.L + _THUMB_RADIUS_EXTENTION } A ${ _ThumbShadowRadius.L } ${ _ThumbShadowRadius.L } -90 1 0 ${ _ThumbCxEnd.L } ${ _THUMB_RADIUS_EXTENTION * -1 }`,
  XL: `M ${ _ThumbCxEnd.XL } ${ _THUMB_RADIUS_EXTENTION * -1 } A ${ _ThumbShadowRadius.XL } ${ _ThumbShadowRadius.XL } -90 1 0 ${ _ThumbCxEnd.XL } ${ _TrackThickness.XL + _THUMB_RADIUS_EXTENTION } A ${ _ThumbShadowRadius.XL } ${ _ThumbShadowRadius.XL } -90 1 0 ${ _ThumbCxEnd.XL } ${ _THUMB_RADIUS_EXTENTION * -1 }`,
};

const _ClipPathTrack = {
  XS: `M 0 0 L ${ _TrackLength.XS } 0 L ${ _TrackLength.XS } ${ _TrackThickness.XS } L 0 ${ _TrackThickness.XS } z`,
  S: `M 0 0 L ${ _TrackLength.S } 0 L ${ _TrackLength.S } ${ _TrackThickness.S } L 0 ${ _TrackThickness.S } z`,
  M: `M 0 0 L ${ _TrackLength.M } 0 L ${ _TrackLength.M } ${ _TrackThickness.M } L 0 ${ _TrackThickness.M } z`,
  L: `M 0 0 L ${ _TrackLength.L } 0 L ${ _TrackLength.L } ${ _TrackThickness.L } L 0 ${ _TrackThickness.L } z`,
  XL: `M 0 0 L ${ _TrackLength.XL } 0 L ${ _TrackLength.XL } ${ _TrackThickness.XL } L 0 ${ _TrackThickness.XL } z`,
};

const _ClipPathStart = {
  XS: `${ _ClipPathTrack.XS } ${ _ClipPathThumbStart.XS }`,
  S: `${ _ClipPathTrack.S } ${ _ClipPathThumbStart.S }`,
  M: `${ _ClipPathTrack.M } ${ _ClipPathThumbStart.M }`,
  L: `${ _ClipPathTrack.L } ${ _ClipPathThumbStart.L }`,
  XL: `${ _ClipPathTrack.XL } ${ _ClipPathThumbStart.XL }`,
};

const _ClipPathEnd = {
  XS: `${ _ClipPathTrack.XS } ${ _ClipPathThumbEnd.XS }`,
  S: `${ _ClipPathTrack.S } ${ _ClipPathThumbEnd.S }`,
  M: `${ _ClipPathTrack.M } ${ _ClipPathThumbEnd.M }`,
  L: `${ _ClipPathTrack.L } ${ _ClipPathThumbEnd.L }`,
  XL: `${ _ClipPathTrack.XL } ${ _ClipPathThumbEnd.XL }`,
};

const _MAIN_TEMPLATE = `<div class="switch">
  <div class="switch-control">
    <div class="switch-track">
      <div class="switch-track-surface"></div>
      <div class="switch-track-frame"></div>
    </div>
    <div class="switch-movablepart">
      <div class="switch-thumb-extension"></div>
      <div class="switch-thumb"></div>
    </div>
  </div>
  <div class="switch-label"></div>
</div>
`;
//TODO pointerTarget をひろげる
//TODO hover で明るくする

const _STYLE = `:host {
  flex: none;
  inline-size: max-content;
}



*.switch {
  --switch-space: ${ _TRACK_OFFSET_INLINE_START }px;
  --track-length: calc(var(--widget-size) * 1.25);
  --track-thickness: calc(var(--widget-size) / 2);
  align-items: center;
  block-size: 100%;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  flex-flow: row nowrap;
}
*.switch * {
  pointer-events: none;
}
*.switch-control {
  block-size: var(--track-thickness);
  inline-size: var(--track-length);
  margin-inline: var(--switch-space);
  position: relative;
}
*.switch-track {
  block-size: inherit;
  border-radius: calc(var(--widget-size) / 4);
  clip-path: path(evenodd, "${ _ClipPathStart.M }");
  /*overflow: hidden;*/
  position: relative;
  transition: clip-path 150ms;
}

:host-context(*[data-size="x-small"]) *.switch-track {
  clip-path: path(evenodd, "${ _ClipPathStart.XS }");
}
:host-context(*[data-size="small"]) *.switch-track {
  clip-path: path(evenodd, "${ _ClipPathStart.S }");
}
:host-context(*[data-size="large"]) *.switch-track {
  clip-path: path(evenodd, "${ _ClipPathStart.L }");
}
:host-context(*[data-size="x-large"]) *.switch-track {
  clip-path: path(evenodd, "${ _ClipPathStart.XL }");
}
:host-context(*[aria-checked="true"]) *.switch-track {
  clip-path: path(evenodd, "${ _ClipPathEnd.M }");
}
:host-context(*[aria-checked="true"][data-size="x-small"]) *.switch-track {
  clip-path: path(evenodd, "${ _ClipPathEnd.XS }");
}
:host-context(*[aria-checked="true"][data-size="small"]) *.switch-track {
  clip-path: path(evenodd, "${ _ClipPathEnd.S }");
}
:host-context(*[aria-checked="true"][data-size="large"]) *.switch-track {
  clip-path: path(evenodd, "${ _ClipPathEnd.L }");
}
:host-context(*[aria-checked="true"][data-size="x-large"]) *.switch-track {
  clip-path: path(evenodd, "${ _ClipPathEnd.XL }");
}

*.switch-track-surface,
*.switch-track-surface::before,
*.switch-track-frame {
  inset: 0;
  position: absolute;
}
*.switch-track-surface {
  background-color: var(--main-color);
  border-radius: inherit;
}
*.switch-track-frame {
  border: 2px solid var(--accent-color);
  border-radius: inherit;
  opacity: 0.6;
  transition: background-color 150ms;
}
:host-context(*[aria-checked="true"]) *.switch-track-frame {
  background-color: var(--accent-color);
}
*.switch-movablepart {
  block-size: var(--track-thickness);
  inline-size: var(--track-thickness);
  inset-block-start: 0;
  inset-inline-start: 0;
  position: absolute;
  transition: inset-inline-start 150ms;
}
:host-context(*[aria-checked="true"]) *.switch-movablepart {
  inset-inline-start: calc(var(--track-length) - var(--track-thickness));
}
*.switch-thumb-extension,
*.switch-thumb {
  border-radius: 50%;
  inset: calc(var(--switch-space) * -1);
  position: absolute;
}
*.switch-thumb-extension {
  background-color: var(--main-color);
  margin: 0;
  transition: margin 150ms;
}
*.switch:hover *.switch-thumb-extension {
  margin: -2px;
}
*.switch-thumb-extension::before {
  background-color: var(--accent-color);
  border-radius: inherit;
  content: "";
  inset: 0;
  margin: 0;
  opacity: 0.6;
  position: absolute;
  transition: margin 150ms;
}
*.switch:hover *.switch-thumb-extension::before {
  margin: 0px;
}




*.switch-thumb {
  background-color: var(--main-color);
  border: var(--border-width) solid var(--accent-color);
  transition: background-color 150ms;
}
:host-context(*[aria-checked="true"]) *.switch-thumb {
  background-color: var(--accent-color);
}
@keyframes switch-ripple {
  0% {
    opacity: 0.3;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(2);
  }
}
*.switch-ripple {
  animation: switch-ripple 600ms both;
  background-color: var(--accent-color);
  border-radius: 50%;
  inset: 0;
  position: absolute;
}


*.switch-label {
  white-space: pre;
}
*.switch-label:not(*:empty) {
  margin-left: 6px;
}
`;

type SwitchOption = {
  label?: string,
  value: string,
};

const OFF = 0;
const ON = 1;

class Switch extends WidgetBase {
  #options: [SwitchOption, SwitchOption];
  #checked: boolean;
  //TODO readOnly

  constructor() {
    super({
      role: Aria.Role.SWITCH,
      style: _STYLE,
    });

    this.#options = [
      { value: "0" },
      { value: "1" },
    ];
    this.#checked = false;

    const main = this._main;
    main.innerHTML = _MAIN_TEMPLATE;

    this._eventTarget = main.querySelector("*.switch") as Element;
    this._eventTarget.addEventListener("click", () => {
      this.checked = !(this.#checked);
    }, { passive: true });
    (this._eventTarget as HTMLElement).addEventListener("keydown", (event) => {
      if (["Enter", " "].includes(event.key) === true) {
        this.checked = !(this.#checked);
      }
    }, { passive: true });
  }

  get checked(): boolean {
    return this.#checked;
  }

  set checked(value: boolean) {
    this.#checked = !!value;
    this._reflectAriaAttr(Aria.State.CHECKED, ((this.#checked === true) ? "true" : "false"));
    if (this._connected === true) {
      this.#addRipple();
    }
  }

  get formValue(): string {
    throw new Error("TODO");
  }

  static get observedAttributes() {
    return [
      //"aria-busy",
      Aria.State.CHECKED,
      Aria.State.DISABLED,
      "aria-hidden",
      "aria-label",
      "aria-readonly",
      "data-direction",
      "data-options",
    ];
  }

  // override connectedCallback(): void {
  //   super.connectedCallback();
  // }

  // override disconnectedCallback(): void {
  //   super.disconnectedCallback();
  // }

  // override adoptedCallback(): void {
  //
  // }

  attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
  }

  #reflectChecked(): void {
    this.setAttribute(Aria.State.CHECKED, (this.#checked === true) ? "true" : "false");
  }

  #addRipple(): void {
    const ripple = document.createElement("div");
    ripple.classList.add("switch-ripple");
    this._main.querySelector("*.switch-thumb-extension")?.append(ripple);
    globalThis.setTimeout(() => {
      ripple.remove();
    }, 1000);
  }
}
Object.freeze(Switch);

export { Switch };
