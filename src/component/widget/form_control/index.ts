import { Widget} from "../widget_base";

abstract class FormControl extends Widget {
  static readonly formAssociated = true;
  static readonly #KEY = Symbol();
  constructor(init: Widget.Init) {
    super(init);
  }
}

export { FormControl };
