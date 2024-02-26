import NisModal from "../../../../lib/ui/NisModal";
import TextArea from "../../../../lib/ui/controls/TextArea";
import Widget from "../../../../lib/ui/Widget";
import ButtonRow from "../../../../lib/ui/ButtonRow";
import {BigNisButton} from "../BigNisButton";

export default class ExportStringModal extends NisModal {
    textarea: TextArea
    explanation: Widget

    constructor(string: string, explanation: string = "") {
        super({footer: true});

        this.title.set("Export")

        this.explanation = c("<p></p>").text(explanation).appendTo(this.body)

        this.textarea = new TextArea({readonly: true}).setValue(string)
            .css2({
                "resize": "none",
                "width": "100%",
                "height": "20em"
            })
            .on("click", () => this.textarea.raw().select())
            .appendTo(this.body)

        this.footer.append(new ButtonRow({align: "center", sizing: "100px", max_center_spacer_width: "100px"})
            .buttons(
                new BigNisButton("Cancel", "cancel")
                    .onClick(() => this.remove()),
                new BigNisButton("Copy", "confirm")
                    .onClick(async () => {
                        await navigator.clipboard.writeText(string)
                    })
            )
        )
    }

    static do(string: string, explanation: string = ""): Promise<any> {
        return new ExportStringModal(string, explanation).show()
    }
}