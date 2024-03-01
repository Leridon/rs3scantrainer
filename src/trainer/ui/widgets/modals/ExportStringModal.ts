import TextArea from "../../../../lib/ui/controls/TextArea";
import {BigNisButton} from "../BigNisButton";
import {deps} from "../../../dependencies";
import {NisModal} from "../../../../lib/ui/NisModal";

export default class ExportStringModal extends NisModal {
    textarea: TextArea

    constructor(private string: string, private explanation: string = "") {
        super({force_footer: true});
    }

    render() {
        super.render();

        this.title.set("Export")

        c("<p></p>").text(this.explanation).appendTo(this.body)

        this.textarea = new TextArea({readonly: true}).setValue(this.string)
            .css2({
                "resize": "none",
                "width": "100%",
                "height": "20em"
            })
            .on("click", () => this.textarea.raw().select())
            .appendTo(this.body)
    }

    getButtons(): BigNisButton[] {
        return [
            new BigNisButton("Cancel", "cancel")
                .onClick(() => this.remove()),
            new BigNisButton("Copy", "confirm")
                .onClick(async () => {
                    await navigator.clipboard.writeText(this.string)
                    deps().app.notifications.notify({
                        type: "information"
                    }, "String copied to clipboard!")

                })
        ]
    }
}