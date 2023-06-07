import {modal, Modal} from "../modal";

export default class ImportStringModal extends Modal {
    textarea: JQuery
    import_button: JQuery

    parser: (string) => any
    imported_promise_resolver: (any) => void

    constructor(id: string) {
        super(id);

        this.textarea = $("#import-modal-text")

        this.import_button = $("#modal-import-string-import-button").on("click", async () => {

            try {
                let imported = this.parser(this.textarea.val())

                if (imported == null) {
                    alert("Invalid input")
                    return
                }

                this.imported_promise_resolver(imported)

                this.imported_promise_resolver = null
                this.parser = null
                this.hide()

            } catch (e) {
                alert(`Invalid input: ${e.toString()}`)
            }
        })
    }

    showWith<T>(parser: (string) => T): Promise<T> {
        this.parser = parser

        this.textarea.val("")

        this.show()

        return new Promise<T>((resolve) => {
            this.imported_promise_resolver = resolve
        })
    }

    static do<T>(parser: (string) => T) {
        return modal("modal-import-string", ImportStringModal).showWith(parser)
    }
}