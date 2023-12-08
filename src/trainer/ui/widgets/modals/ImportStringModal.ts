import {modal, Modal} from "../modal";
import NisModal from "../../../../lib/ui/NisModal";
import TextArea from "../../../../lib/ui/controls/TextArea";
import ButtonRow from "../../../../lib/ui/ButtonRow";
import BigNisButton from "../BigNisButton";
import {ewent} from "../../../../lib/reactive";

export default class ImportStringModal<T> extends NisModal {
    textarea: TextArea

    imported = ewent<T>()

    private import_button: BigNisButton

    constructor(private parser: (_: string) => T,
    ) {
        super({footer: true});

        this.title.set("Import")

        this.textarea = new TextArea({placeholder: "Paste the shareable string here."})
            .css2({
                "resize": "none",
                "width": "100%",
                "height": "20em"
            })
            .appendTo(this.body)

        this.textarea.onChange(v => {
            this.import_button.setEnabled(!!v.value)
        })

        this.footer.append(new ButtonRow({align: "center", sizing: "100px", max_center_spacer_width: "100px"})
            .buttons(
                new BigNisButton("Cancel", "cancel").onClick(() => this.remove()),
                this.import_button = new BigNisButton("Import", "confirm")
                    .setEnabled(false)
                    .onClick(() => {
                        try {
                            let imported = this.parser(this.textarea.get())

                            if (imported == null) {
                                alert("Invalid input")
                                return
                            }

                            this.imported.trigger(imported)

                            this.remove()
                        } catch (e) {
                            alert(`Invalid input: ${e.toString()}`)
                        }
                    })
            )
        )
    }

    static do<T>(parser: (v: string) => T, handler: (_: T) => any): Promise<any> {
        let modal = new ImportStringModal(parser)

        modal.imported.on(handler)

        return modal.show()
    }
}