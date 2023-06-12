import {modal, Modal} from "../modal";

export default class ExportStringModal extends Modal {
    textarea: JQuery
    explanation: JQuery
    copy_button: JQuery

    constructor(id: string) {
        super(id);

        this.textarea = $("#export-modal-text")
        this.explanation = $("#modal-export-string-explanation")

        this.copy_button = $("#modal-export-string-copy").on("click", async () => {
            await navigator.clipboard.writeText(this.textarea.val() as string)

            this.copy_button.text("Copied!");
        })
    }

    showWith(string: string, explanation: string = "") {
        this.textarea.val(string)

        this.explanation.text(explanation)

        this.copy_button.text("Copy to Clipboard");

        this.show()
    }

    static do(string: string, explanation: string = "") {
        modal("modal-export-string", ExportStringModal).showWith(string, explanation)
    }
}