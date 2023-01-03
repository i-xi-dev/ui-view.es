import { Aria } from "./aria";
import { Widget } from "./widget";
import { Input } from "./input";

const _TRACK_OFFSET_INLINE_START = 4;

const _MAIN_CONTENT_TEMPLATE = `
<div class="switch-control">
  <div class="switch-track">
    <div class="switch-track-surface"></div>
    <div class="switch-thumb-shadow"></div>
  </div>
  <div class="switch-thumb">
    <div class="widget-glow"></div>
    <div class="widget-effects"></div>
    <div class="switch-thumb-surface"></div>
  </div>
</div>
<output class="switch-value-label"></output>
`;
//TODO hover でコントラスト上げ、activeで明るくする
//TODO inputイベント発火
//TODO inert firefoxが対応したら
//TODO attatchInternals safariが対応したら
//TODO copy 値？値ラベル？両方？ テキスト？JSON？HTML？
//TODO paste
//XXX ラベルは廃止する （外付けにする）
//XXX slot名は無くしたいが、他では名前使うかも。そうなると名前は統一したいのでとりあえず名前ありにしておく
//TODO 値ラベルの幅は長いほうに合わせて固定にしたい（幅算出してwidth指定するか、不可視にして同じ位置に重ねて表示を切り替えるか。いちいちリフローがかかるので後者が良い？リフローなしでOffscreenCanvasで文字幅だけなら取れるがdataに子要素があったり装飾されてたりしたら正確に取れない。重ねる方法だと:emptyで空かどうか判別できなくなるので空状態かどうかを保持するプロパティが余計に必要）
//TODO 値ラベルを可視に設定しても値ラベルが両方空の場合は、column-gapを0にしたい
//XXX shadowなしで、白枠常時表示てもいいかも
//XXX itemのdisabledは無視する
//TODO itemのselectedは無視する？ 無視しない場合checkedとどちらが優先？
//TODO readonlyのときのkeydownなどが無反応で何もしないのが気になる

const _STYLE = `
:host {
  flex: none;
  inline-size: max-content;
}
*.switch-container *.widget-event-target {
  border-radius: 4px;
  cursor: pointer;
  margin-inline: -8px;
}

*.switch {
  --switch-space: ${ _TRACK_OFFSET_INLINE_START }px;
  --switch-switching-time: 150ms;
  --switch-inline-size: calc(var(--widget-size) * 1.25);
  --switch-block-size: calc(var(--widget-size) / 2);
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
  block-size: var(--switch-block-size);
  inline-size: var(--switch-inline-size);
  margin-inline: var(--switch-space);
  position: relative;
}
*.switch-track {
  block-size: inherit;
  border-radius: calc(var(--widget-size) / 4);
  clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
  /*overflow: hidden;*/
  position: relative;
  transition: clip-path var(--switch-switching-time);
}

*.switch-track-surface {
  background-color: var(--widget-main-color);
  border: var(--widget-border-width) solid var(--widget-accent-color);
  border-radius: inherit;
  inset: 0;
  position: absolute;
  transition: background-color var(--switch-switching-time);
}
:host(*[aria-checked="true"]) *.switch-track-surface {
  background-color: var(--widget-accent-color);
}

*.switch-thumb-shadow,
*.switch-thumb {
  inset-block-start: 0;
  inset-inline-start: 0;
  position: absolute;
  transition: inset-inline-start var(--switch-switching-time);
}
*.switch-thumb-shadow {
  --switch-thumb-shadow-extent: calc(var(--switch-space) + var(--widget-border-width));
  background-color: var(--widget-main-color);
  block-size: calc(var(--switch-block-size) + calc(var(--switch-thumb-shadow-extent) * 2));
  border-radius: 50%;
  inline-size: calc(var(--switch-block-size) + calc(var(--switch-thumb-shadow-extent) * 2));
  margin: calc(var(--switch-thumb-shadow-extent) * -1);
}

*.switch-thumb {
  block-size: var(--switch-block-size);
  inline-size: var(--switch-block-size);
}
:host(*[aria-checked="true"]) *.switch-thumb-shadow,
:host(*[aria-checked="true"]) *.switch-thumb {
  inset-inline-start: calc(var(--switch-inline-size) - var(--switch-block-size));
}
*.widget-glow,
*.widget-effects,
*.switch-thumb-surface {
  border-radius: 50%;
  margin: calc(var(--switch-space) * -1);
}
*.widget-glow::before {
  border-radius: inherit;
}

*.switch-thumb-surface {
  background-color: var(--widget-main-color);
  border: var(--widget-border-width) solid var(--widget-accent-color);
  inset: 0;
  position: absolute;
  transition: background-color var(--switch-switching-time);
}
:host(*[aria-checked="true"]) *.switch-thumb-surface {
  background-color: var(--widget-accent-color);
}

@keyframes switch-ripple {
  0% {
    opacity: var(--widget-ripple-opacity);
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(2.4);
  }
}
*.widget-ripple {
  animation: switch-ripple 600ms both;
  inset: 0;
  mix-blend-mode: color-burn; /*TODO darkのとき変える */
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

const DataAttr = {
  VALUE_LABEL_VISIBLE: "data-value-label-visible",
  VALUE_LABEL_POSITION: "data-value-label-position",
} as const;

class Switch extends Input {
  static readonly #className: string = "switch";
  static readonly #styleSheet: CSSStyleSheet = new CSSStyleSheet();
  static #template: HTMLTemplateElement | null;

  static readonly #defaultDataList: [Widget.DataListItem, Widget.DataListItem] = [
    { value: "0", label: "" },
    { value: "1", label: "" },
  ];

  #checked: boolean;
  #valueLabelElement: Element;

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

    this._addAction("click", {
      func: () => {
        this.checked = !(this.#checked);
        this._dispatchChangeEvent();
      },
    });

    this._addAction("keydown", {
      keys: [" ", "Enter"],
      func: () => {
        this.checked = !(this.#checked);
        this._dispatchChangeEvent();
      },
    });
  }

  get checked(): boolean {
    return this.#checked;
  }

  set checked(value: boolean) {
    const adjustedChecked = !!value;//(value === true);
    this.#setChecked(adjustedChecked, Widget._ReflectionsOnPropChanged);
  }

  get #value(): Widget.DataListItem {
    const dataListItems = this._getDataListItems({
      defaultItems: Switch.#defaultDataList,
      mergeDefaultItems: true,
    }) as [Widget.DataListItem, Widget.DataListItem];
    if (this.#checked === true) {
      return dataListItems[Switch.OptionIndex.ON];
    }
    else {
      return dataListItems[Switch.OptionIndex.OFF];
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
    this._addRipple();
    this.#valueLabelElement.textContent = this.#value.label;
  }
}
namespace Switch {
  export const OptionIndex = {
    OFF: 0,
    ON: 1,
  } as const;
}
Object.freeze(Switch);

export { Switch };
