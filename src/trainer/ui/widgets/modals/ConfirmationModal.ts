import NisModal from "../../../../lib/ui/NisModal";
import TextArea from "../../../../lib/ui/controls/TextArea";
import Widget from "../../../../lib/ui/Widget";
import ButtonRow from "../../../../lib/ui/ButtonRow";
import {Ewent, ewent} from "../../../../lib/reactive";
import {BigNisButton} from "../BigNisButton";

export class ConfirmationModal<T> extends NisModal {
    textarea: TextArea
    explanation: Widget

    selected: Ewent.Real<T> = ewent<T>()

    constructor(options: ConfirmationModal.options<T>) {
        super({footer: true});

        this.title.set(options.title || "Confirmation")

        this.explanation = c("<p></p>").text(options.body).appendTo(this.body)

        this.footer.append(new ButtonRow({align: "center", sizing: "100px", max_center_spacer_width: "100px"})
            .buttons(
                ...options.options.map(o =>
                    new BigNisButton(o.text, o.kind)
                        .onClick(() => {
                            this.selected.trigger(o.value)
                            this.hide()
                        })
                )
            )
        )
    }

    static do<T>(options: ConfirmationModal.options<T>): Promise<T> {
        const modal = new ConfirmationModal<T>(options)

        modal.show()

        return new Promise(resolve => {
            modal.selected.on((v: T) => resolve(v))
        })
    }
}

export namespace ConfirmationModal {
    export type options<T> = {
        title?: string,
        body: string,
        options: {
            kind: BigNisButton.Kind,
            text: string,
            value: T
        }[]
    }
}