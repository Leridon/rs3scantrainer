import TextArea from "../../../../lib/ui/controls/TextArea";
import Widget from "../../../../lib/ui/Widget";
import {BigNisButton} from "../BigNisButton";
import {FormModal} from "../../../../lib/ui/controls/FormModal";

export class ConfirmationModal<T> extends FormModal<T> {
  textarea: TextArea
  explanation: Widget

  constructor(private config: ConfirmationModal.options<T>) {
    super({size: "small"});
  }

  render() {
    super.render();

    this.title.set(this.config.title || "Confirmation")

    this.explanation = c("<p></p>").text(this.config.body).appendTo(this.body)
  }

  getButtons(): BigNisButton[] {
    return [
      ...this.config.options.map(o =>
        new BigNisButton(o.text, o.kind)
          .onClick(() =>
            this.confirm(o.value))
      )
    ]
  }

  protected getValueForCancel(): T {
    return this.config.options.find(o => o.is_cancel)?.value
  }
}

export namespace ConfirmationModal {
  export type options<T> = {
    title?: string,
    body: string,
    options: {
      kind: BigNisButton.Kind,
      text: string,
      value: T,
      is_cancel?: boolean
    }[],
  }
}