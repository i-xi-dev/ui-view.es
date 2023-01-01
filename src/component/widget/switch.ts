import { Aria } from "./aria";
import { Widget } from "./widget";
import { Input } from "./input";

function _computeTrackLength(size: Widget.Size): number {
  return (Widget.Dimension[size] * 1.25);
}

const _TrackLength = {
  XS: _computeTrackLength(Widget.Size.X_SMALL),
  S: _computeTrackLength(Widget.Size.SMALL),
  M: _computeTrackLength(Widget.Size.MEDIUM),
  L: _computeTrackLength(Widget.Size.LARGE),
  XL: _computeTrackLength(Widget.Size.X_LARGE),
};

function _computeTrackThickness(size: Widget.Size): number {
  return (Widget.Dimension[size] / 2);
}

const _TrackThickness = {
  XS: _computeTrackThickness(Widget.Size.X_SMALL),
  S: _computeTrackThickness(Widget.Size.SMALL),
  M: _computeTrackThickness(Widget.Size.MEDIUM),
  L: _computeTrackThickness(Widget.Size.LARGE),
  XL: _computeTrackThickness(Widget.Size.X_LARGE),
};

const _TRACK_OFFSET_INLINE_START = 4;

const _TrackThicknessHalf = {
  XS: (_TrackThickness.XS / 2),
  S: (_TrackThickness.S / 2),
  M: (_TrackThickness.M / 2),
  L: (_TrackThickness.L / 2),
  XL: (_TrackThickness.XL / 2),
};

const _THUMB_RADIUS_EXTENTION = _TRACK_OFFSET_INLINE_START + 2;

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

const _MAIN_CONTENT_TEMPLATE = `
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
  <output class="switch-value-label"></output>
`;
//TODO hover でコントラスト上げ、activeで明るくする
//TODO clip-pathが writing-mode:vertical-* に非対応（どうしようもないような？writing-modeは横固定にして、data-direction=ltr|rtl|ttb|bttとかで設定するようにするしか？）
//TODO clip-pathが direction: rtl に非対応（:dirがfirefoxのみなので、対応するならwritin-modeと同様）（方向をどう検知するかは置いといて、clip-pathを生成するよりtranformで座標返還したほうが早いのでは。SVGにしてしまえばclip-path生成の100行くらい削れる）
//TODO inputイベント発火
//TODO inert firefoxが対応したら
//TODO attatchInternals safariが対応したら
//TODO copy 値？値ラベル？両方？ テキスト？JSON？HTML？
//TODO paste
//XXX ラベルは廃止する （外付けにする）
//XXX slot名は無くしたいが、他では名前使うかも。そうなると名前は統一したいのでとりあえず名前ありにしておく
//TODO 値ラベルの幅は長いほうに合わせて固定にしたい（幅算出してwidth指定するか、不可視にして同じ位置に重ねて表示を切り替えるか。いちいちリフローがかかるので後者が良い？リフローなしでOffscreenCanvasで文字幅だけなら取れるがdataに子要素があったり装飾されてたりしたら正確に取れない。重ねる方法だと:emptyで空かどうか判別できなくなるので空状態かどうかを保持するプロパティが余計に必要）
//TODO 値ラベルを可視に設定しても値ラベルが両方空の場合は、column-gapを0にしたい

const _STYLE = `:host {
  flex: none;
  inline-size: max-content;
}
*.switch-container *.widget-event-target {
  border-radius: 4px;
  cursor: pointer;
  margin-inline: -8px;
}
:host(*[aria-readonly="true"]) *.switch-container *.widget-event-target {
  cursor: default;
}


*.switch {
  --switch-space: ${ _TRACK_OFFSET_INLINE_START }px;
  --switching-time: 150ms;
  --track-length: calc(var(--widget-size) * 1.25);
  --track-thickness: calc(var(--widget-size) / 2);
  align-items: center;
  block-size: 100%;
  column-gap: 0;
  display: flex;
  flex-flow: row nowrap;
}
:host(*[data-value-label-visible="true"]) *.switch {
  column-gap: 6px;
}
:host(*[data-value-label-position="before"]) *.switch {
  flex-flow: row-reverse nowrap;
}
*.switch-control {
  block-size: var(--track-thickness);
  inline-size: var(--track-length);
  margin-inline: var(--switch-space);
  position: relative;
}
*.switch-track {
  background-color: var(--main-color);
  block-size: inherit;
  border-radius: calc(var(--widget-size) / 4);
  clip-path: path(evenodd, "${ _ClipPathStart.M }");
  /*overflow: hidden;*/
  position: relative;
  transition: clip-path var(--switching-time);
}

:host(*[data-size="x-small"]) *.switch-track {
  clip-path: path(evenodd, "${ _ClipPathStart.XS }");
}
:host(*[data-size="small"]) *.switch-track {
  clip-path: path(evenodd, "${ _ClipPathStart.S }");
}
:host(*[data-size="large"]) *.switch-track {
  clip-path: path(evenodd, "${ _ClipPathStart.L }");
}
:host(*[data-size="x-large"]) *.switch-track {
  clip-path: path(evenodd, "${ _ClipPathStart.XL }");
}
:host(*[aria-checked="true"]) *.switch-track {
  clip-path: path(evenodd, "${ _ClipPathEnd.M }");
}
:host(*[aria-checked="true"][data-size="x-small"]) *.switch-track {
  clip-path: path(evenodd, "${ _ClipPathEnd.XS }");
}
:host(*[aria-checked="true"][data-size="small"]) *.switch-track {
  clip-path: path(evenodd, "${ _ClipPathEnd.S }");
}
:host(*[aria-checked="true"][data-size="large"]) *.switch-track {
  clip-path: path(evenodd, "${ _ClipPathEnd.L }");
}
:host(*[aria-checked="true"][data-size="x-large"]) *.switch-track {
  clip-path: path(evenodd, "${ _ClipPathEnd.XL }");
}

*.switch-track-surface,
*.switch-track-frame {
  position: absolute;
}
*.switch-track-surface {
  background-color: var(--accent-color);
  border-radius: inherit;
  inset: 1px;
  opacity: 0;
  transition: opacity var(--switching-time);
}
:host(*[aria-checked="true"]) *.switch-track-surface {
  opacity: 1;
}
*.switch-track-frame {
  border: 2px solid var(--accent-color);
  border-radius: inherit;
  inset: 0;
  transition: opacity var(--switching-time);
}
*.switch-movablepart {
  block-size: var(--track-thickness);
  inline-size: var(--track-thickness);
  inset-block-start: 0;
  inset-inline-start: 0;
  position: absolute;
  transition: inset-inline-start var(--switching-time);
}
:host(*[aria-checked="true"]) *.switch-movablepart {
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
  transition: margin 200ms;
}
*.widget-event-target:hover + *.switch *.switch-thumb-extension {
  margin: -2px;
}
:host(*[aria-busy="true"]) *.widget-event-target:hover + *.switch *.switch-thumb-extension,
:host(*[aria-disabled="true"]) *.widget-event-target:hover + *.switch *.switch-thumb-extension,
:host(*[aria-readonly="true"]) *.widget-event-target:hover + *.switch *.switch-thumb-extension {
  margin: 0 !important;
}
*.switch-thumb-extension::before {
  background-color: var(--accent-color);
  border-radius: inherit;
  content: "";
  inset: 0;
  margin: 0;
  opacity: 0.5;
  position: absolute;
  transition: margin 200ms;
}
*.widget-event-target:hover + *.switch *.switch-thumb-extension::before {
  margin: -4px;
}
:host(*[aria-busy="true"]) *.widget-event-target:hover + *.switch *.switch-thumb-extension::before,
:host(*[aria-disabled="true"]) *.widget-event-target:hover + *.switch *.switch-thumb-extension::before,
:host(*[aria-readonly="true"]) *.widget-event-target:hover + *.switch *.switch-thumb-extension::before {
  margin: 0 !important;
}




*.switch-thumb {
  background-color: var(--main-color);
  border: var(--border-width) solid var(--accent-color);
  transition: background-color var(--switching-time);
}
:host(*[aria-checked="true"]) *.switch-thumb {
  background-color: var(--accent-color);
}
@keyframes switch-ripple {
  0% {
    opacity: 0.6;
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


*.switch-value-label {
  display: none;
  user-select: none;
  white-space: pre;
}
:host(*[data-value-label-visible="true"]) *.switch-value-label {
  display: block;
}
*.switch-value-label:not(*:empty) {

  text-align: start;
}
:host(*[data-value-label-position="before"]) *.switch-value-label:not(*:empty) {

  text-align: end;
}
`;//TODO vueで使いやすいのはbool型属性か・・・data-value-label-visible

const OFF = 0;
const ON = 1;

const DataAttr = {
  VALUE_LABEL_VISIBLE: "data-value-label-visible",
  VALUE_LABEL_POSITION: "data-value-label-position",
} as const;

class Switch extends Input {
  static readonly #className: string = "switch";
  static readonly #styleSheet: CSSStyleSheet = new CSSStyleSheet();
  static #template: HTMLTemplateElement | null;

  #checked: boolean;
  #valueLabelElement: Element;

  static readonly #defaultDataList: [Widget.DataListItem, Widget.DataListItem] = [
    { value: "0", label: "" },
    { value: "1", label: "" },
  ];

  static {
    Switch.#styleSheet.replaceSync(_STYLE);
    Switch.#template = null;
  }

  constructor() {
    super({
      role: Aria.Role.SWITCH,
      className: Switch.#className,
    });

    this.#checked = false;

    this._appendStyleSheet(Switch.#styleSheet);

    const main = this._main;
    if ((Switch.#template && (Switch.#template.ownerDocument === this.ownerDocument)) !== true) {
      Switch.#template = this.ownerDocument.createElement("template");
      Switch.#template.innerHTML = _MAIN_CONTENT_TEMPLATE;
    }
    main.append((Switch.#template as HTMLTemplateElement).content.cloneNode(true));
    this.#valueLabelElement = main.querySelector("*.switch-value-label") as Element;

    this._eventTarget.addEventListener("click", () => {
      if ((this.busy === true) || (this.disabled === true) || (this.readOnly === true)) {
        return;
      }
      this.checked = !(this.#checked);
      this.#dispatchChangeEvent();
    }, { passive: true });
    (this._eventTarget as HTMLElement).addEventListener("keydown", (event) => {
      if ((this.busy === true) || (this.disabled === true) || (this.readOnly === true)) {
        return;
      }
      if (["Enter", " "].includes(event.key) === true) {
        this.checked = !(this.#checked);
        this.#dispatchChangeEvent();
      }
    }, { passive: true });

  }

  get checked(): boolean {
    return this.#checked;
  }

  set checked(value: boolean) {
    const adjustedChecked = !!value;//(value === true);
    this.#setChecked(adjustedChecked, Widget._ReflectionsOnPropChanged);
  }

  get #value(): Widget.DataListItem {
    const assignedDataListItems = this._assignedDataListItems;
    console.log(assignedDataListItems)
    if (this.#checked === true) {
      if (assignedDataListItems.length >= 2) {
        return Object.assign({}, assignedDataListItems[ON]);
      }
      else {
        return Object.assign({}, Switch.#defaultDataList[ON]);
      }
    }
    else {
      if (assignedDataListItems.length >= 1) {
        return Object.assign({}, assignedDataListItems[OFF]);
      }
      else {
        return Object.assign({}, Switch.#defaultDataList[OFF]);
      }
    }
    //TODO busyのときエラーにするか待たせるか
  }

  static override get observedAttributes(): Array<string> {
    return [
      Input.observedAttributes,
      [
        Aria.State.CHECKED,
        //DataAttr.VALUE_LABEL_VISIBLE, CSSのみ
        //DataAttr.VALUE_LABEL_POSITION, CSSのみ
      ],
    ].flat();
  }

  override connectedCallback(): void {
    super.connectedCallback();

    if (this.isConnected !== true) {
      return;
    }

    this.#setCheckedFromString(this.getAttribute(Aria.State.CHECKED) ?? "", Widget._ReflectionsOnConnected);

    this._connected = true;
  }

  // override disconnectedCallback(): void {
  //   super.disconnectedCallback();
  // }

  // override adoptedCallback(): void {
  //
  // }

  override attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
    super.attributeChangedCallback(name, oldValue, newValue);

    if (this._reflectingInProgress === name) {
      return;
    }

    switch (name) {
      case Aria.State.CHECKED:
        this.#setCheckedFromString(newValue, Widget._ReflectionsOnAttrChanged);
        break;

      default:
        break;
    }
  }

  #setCheckedFromString(value: string, reflections: Widget.Reflections): void {
    this.#setChecked((value === "true"), reflections);
  }

  #setChecked(value: boolean, reflections: Widget.Reflections): void {
    const changed = (this.#checked !== value);
    if (changed === true) {
      this.#checked = value;
    }
    if ((reflections.content === "always") || (reflections.content === "if-needed" && changed === true)) {
      this.#reflectCheckedToContent();
    }
    if ((reflections.attr === "always") || (reflections.attr === "if-needed" && changed === true)) {
      this.#reflectToAriaChecked();
    }
  }

  #reflectToAriaChecked(): void {
    this._reflectToAttr(Aria.State.CHECKED, ((this.#checked === true) ? "true" : "false"));
  }

  #reflectCheckedToContent(): void {
    this.#addRipple();
    this.#valueLabelElement.textContent = this.#value.label;
  }

  #addRipple(): void {
    if ((this._connected !== true) || (this.hidden === true)) {//TODO this.hiddenかどうかでなくcheckVisibilityで safariが対応したら
      return;
    }

    const ripple = document.createElement("div");
    ripple.classList.add("switch-ripple");
    (this._main.querySelector("*.switch-thumb-extension") as Element).append(ripple);
    globalThis.setTimeout(() => {
      ripple.remove();
    }, 1000);
  }

  #dispatchChangeEvent(): void {
    this.dispatchEvent(new Event("change", {
      bubbles: true,
    }));
  }
}
namespace Switch {
}
Object.freeze(Switch);

export { Switch };
