
import { Input } from "./input";

const _MAIN_CONTENT_TEMPLATE = `
  <div class="checkbox-control">
    <div class="checkbox-box">
      <div class="checkbox-box-surface"></div>
      <div class="checkbox-box-frame"></div>
    </div>
    <div class="checkbox-movablepart">
      <div class="checkbox-box-extension"></div>
      <div class="checkbox-mark"></div>
    </div>
  </div>
  <div class="checkbox-label"></div>
`;

class CheckBox extends Input {
}
Object.freeze(CheckBox);

export { CheckBox };
