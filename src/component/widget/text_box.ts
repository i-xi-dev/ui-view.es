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
    <input class="textbox-value-view" type="text"/>
  </div>
</div>
`;

const _STYLE = `
:host {
  flex: 1 1 100%;
  min-inline-size: 44px;
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

}
