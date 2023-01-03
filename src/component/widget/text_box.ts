import { Aria } from "./aria";
import { Widget } from "./widget";
import { Input } from "./input";

const _MAIN_CONTENT_TEMPLATE = `
<div class="textbox-control">
  <div class="textbox-box">
    <div class="widget-glow"></div>
    <div class="textbox-box-surface"></div>
    <div class="widget-effects"></div>
    <div class="textbox-value-label"></div>
  </div>
</div>
`;

const _STYLE = `
:host {
  flex: 1 1 100%;
  min-inline-size: 44px;
}
*.textbox-container *.widget-event-target {
  border-radius: var(--widget-corner-radius);
}

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
  background-color: var(--widget-main-color);
  border: 2px solid var(--widget-accent-color);
  border-radius: var(--widget-corner-radius);
  inset: 0;
  position: absolute;
}
`;

class TextBox extends Input {
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

    //TODO this._addAction("keydown", {


  }

  //TODO get value, set value

  static override get observedAttributes(): Array<string> {
    return [
      Input.observedAttributes,
      [
        //TODO
      ],
    ].flat();
  }

  override connectedCallback(): void {
    super.connectedCallback();

    if (this.isConnected !== true) {
      return;
    }

    //TODO

    this._connected = true;//TODO 更に継承する場合どうする
  }

  override attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
    super.attributeChangedCallback(name, oldValue, newValue);

    if (this._reflectingInProgress === name) {
      return;
    }

    switch (name) {
      //TODO

      default:
        break;
    }
  }

}
namespace TextBox {

}
Object.freeze(TextBox);

export { TextBox };
