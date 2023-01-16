import { Aria } from "./aria";
import { Widget } from "./widget";

const _MAIN_CONTENT_TEMPLATE = `
<div class="textbox-control">
  <div class="textbox-box">
    <div class="${ Widget.CLASS_NAME }-glow"></div>
    <div class="textbox-box-surface"></div>
    <div class="${ Widget.CLASS_NAME }-effects"></div>
    <div class="textbox-value-label"></div>
  </div>
</div>
`;

const _STYLE = `
:host {
  flex: 1 1 100%;
  min-inline-size: 44px;
}
*.textbox-container *.${ Widget.CLASS_NAME }-event-target {
  border-radius: var(--${ Widget.CLASS_NAME }-corner-radius);
  cursor: text;
}
:host(*[aria-multiline="true"]) *.textbox-container *.${ Widget.CLASS_NAME }-event-target {
  align-items: start;
}
:host(*:not(*[aria-multiline="true"])) *.textbox-container *.${ Widget.CLASS_NAME }-event-target {
  align-items: center;
}
/*TODO 0文字の時、centerにならない ::beforeで何か付けても無駄だった */

*.textbox {
  align-items: center;
  block-size: 100%;
  column-gap: 0;
  display: flex;
  flex: 1 1 100%;
  flex-flow: row nowrap;
}

*.textbox-control {
  block-size: 100%;
  flex: 1 1 100%;
  position: relative;
}
*.textbox-box {
  block-size: inherit;
  position: relative;
}

*.textbox-box-surface {
  background-color: var(--${ Widget.CLASS_NAME }-main-bg-color);
  border: 2px solid var(--${ Widget.CLASS_NAME }-accent-color);
  border-radius: var(--${ Widget.CLASS_NAME }-corner-radius);
  inset: 0;
  position: absolute;
}
`;

class TextBox extends Widget {
  static readonly #className: string = "textbox";
  static readonly #styleSheet: CSSStyleSheet = new CSSStyleSheet();
  static #template: HTMLTemplateElement | null;

  #multiline: boolean;
  //TODO invalid
  //TODO placeholder
  //TODO required
  #text: string;

  static {
    TextBox.#styleSheet.replaceSync(_STYLE);
    TextBox.#template = null;
  }

  constructor() {
    super({
      role: Aria.Role.TEXTBOX,
      className: TextBox.#className,
      inputable: true,
      textEditable: true,
    });

    this.#multiline = false;
    this.#text = "";

    this._appendStyleSheet(TextBox.#styleSheet);

    const main = this._main;
    if ((TextBox.#template && (TextBox.#template.ownerDocument === this.ownerDocument)) !== true) {
      TextBox.#template = this.ownerDocument.createElement("template");
      TextBox.#template.innerHTML = _MAIN_CONTENT_TEMPLATE;
    }
    main.append((TextBox.#template as HTMLTemplateElement).content.cloneNode(true));

    this._addAction("keydown", {
      keys: ["Enter"],
      func: (event: Event) => {
        // if (this._textEditable !== true) {
        //   return;
        // }
        if (this._textCompositing === true) {
          return;
        }

        event.preventDefault();
        if (this.#multiline === true) {
          const char = "\n";
          //const textNode = this._eventTarget.lastChild as Text;
          //textNode.data = textNode.data + char;

          // this._eventTarget.textContent = this._eventTarget.textContent + char;
          // this._eventTarget.dispatchEvent(new InputEvent("input", {
          //   data: char,
          // }));
        }
        //TODO this._dispatchChangeEvent();
      },
      active: true,
      allowRepeat: true,
    });

    this._addAction("input", {
      func: (event: Event) => {
//TODO カーソル移動
      },
    });
//TODO enterkeyhint
  }

  //TODO get value, set value

  static override get observedAttributes(): Array<string> {
    return [
      Widget.observedAttributes,
      [
        Aria.Property.MULTILINE,
        //TODO
      ],
    ].flat();
  }

  get multiline(): boolean {
    return this.#multiline;
  }

  set multiline(value: boolean) {
    const adjustedMultiLine = !!value;//(value === true);
    this.#setMultiLine(adjustedMultiLine, Widget._ReflectionsOnPropChanged);
  }

  override connectedCallback(): void {
    super.connectedCallback();

    if (this.isConnected !== true) {
      return;
    }

    this.#setMultiLineFromString(this.getAttribute(Aria.Property.MULTILINE) ?? "", Widget._ReflectionsOnConnected);
    //TODO

    this._connected = true;//TODO 更に継承する場合どうする
  }

  override attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
    super.attributeChangedCallback(name, oldValue, newValue);

    if (this._reflectingInProgress === name) {
      return;
    }

    switch (name) {
      case Aria.Property.MULTILINE:
        this.#setMultiLineFromString(newValue, Widget._ReflectionsOnAttrChanged);
        break;

      //TODO

      default:
        break;
    }
  }

  #setMultiLineFromString(value: string, reflections: Widget.Reflections): void {
    this.#setMultiLine((value === "true"), reflections);
  }

  #setMultiLine(value: boolean, reflections: Widget.Reflections): void {
    const changed = (this.#multiline !== value);
    if (changed === true) {
      this.#multiline = value;
    }
    if ((reflections.content === "always") || (reflections.content === "if-needed" && changed === true)) {
      this.#reflectMultiLineToContent();
    }
    if ((reflections.attr === "always") || (reflections.attr === "if-needed" && changed === true)) {
      this.#reflectToAriaMultiLine();
    }
  }

  #reflectToAriaMultiLine(): void {
    this._reflectToAttr(Aria.Property.MULTILINE, ((this.#multiline === true) ? "true" : undefined));
  }

  #reflectMultiLineToContent(): void {
    //TODO
  }
}
namespace TextBox {

}
Object.freeze(TextBox);

export { TextBox };
