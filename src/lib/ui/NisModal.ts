import Widget from "./Widget";
import {Modal2} from "./Modal2";
import {observe} from "../reactive";

export default class NisModal extends Modal2 {
    public header: Widget
    public body: Widget
    public footer: Widget
    private title_widget: Widget

    title = observe("")

    constructor(protected options: Modal2.Options & { footer?: boolean } = {}) {
        super(options);

        this._content.addClass("nisl-modal")

        this.header = c("<div class='nisl-modal-header'></div>").appendTo(this._content)
        this.body = c("<div class='nisl-modal-body'></div>").appendTo(this._content)

        if (options.footer) {
            this.footer = c("<div class='nisl-modal-footer'></div>").appendTo(this._content)
        }

        this.title_widget = c("<h1 class='nisl-modal-title'></h1>").appendTo(this.header)

        if (!options.fixed) {
            c("<div class='nisl-modal-exit' data-bs-dismiss='modal'>").appendTo(this.header)
        }

        this.title.subscribe(title => {
            this.title_widget.text(title)
        })
    }
}