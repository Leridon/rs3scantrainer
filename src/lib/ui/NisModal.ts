import Widget from "./Widget";
import {Modal2} from "./Modal2";
import {observe} from "../reactive";
import {BigNisButton} from "../../trainer/ui/widgets/BigNisButton";
import ButtonRow from "./ButtonRow";

export abstract class NisModal extends Modal2 {
    public header: Widget
    public body: Widget
    public footer: Widget
    private title_widget: Widget

    title = observe("")

    constructor(protected options: NisModal.Options = {}) {
        super(options);
    }

    render(): void {
        this._content.addClass("nisl-modal")

        this.header = c("<div class='nisl-modal-header'></div>").appendTo(this._content)
        this.body = c("<div class='nisl-modal-body'></div>").appendTo(this._content)

        const buttons = this.getButtons()

        if (this.options.force_footer || buttons.length > 0) {
            this.footer = c("<div class='nisl-modal-footer'></div>").appendTo(this._content)

            if (buttons.length > 0) {
                this.footer.append(new ButtonRow({align: "center", sizing: "100px", max_center_spacer_width: "100px"})
                    .buttons(...buttons))
            }
        }

        this.title_widget = c("<h1 class='nisl-modal-title'></h1>").appendTo(this.header)

        if (!this.options.fixed) {
            c("<div class='nisl-modal-exit' data-bs-dismiss='modal'>").appendTo(this.header)
        }

        this.title.subscribe(title => {
            this.title_widget.text(title)
        })
    }

    getButtons(): BigNisButton[] {
        return []
    }
}

export namespace NisModal {
    export type Options = Modal2.Options & { force_footer?: boolean }
}