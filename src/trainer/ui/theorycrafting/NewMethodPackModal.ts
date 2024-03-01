import NisModal from "../../../lib/ui/NisModal";
import Properties from "../widgets/Properties";
import TextField from "../../../lib/ui/controls/TextField";
import TextArea from "../../../lib/ui/controls/TextArea";
import {MethodPackManager, Pack} from "../../model/MethodPackManager";

export class MethodPackMetaEdit extends Widget {

    private name: TextField
    private authors: TextField
    private description: TextArea

    constructor(private value: Pack.Meta) {
        super();

        this.render()
    }

    protected render() {
        const props = new Properties().appendTo(this)

        this.name = props.named("Name", new TextField()
            .onCommit(v => {
                this.value.name = v
            })
            .setPlaceholder("Enter a pack name...").setValue(this.value.name))
        this.authors = props.named("Author(s)", new TextField()
            .onCommit(v => {
                this.value.author = v
            })
            .setPlaceholder("Enter author(s)...").setValue(this.value.author))

        props.header("Description")
        props.row(this.description = new TextArea()
            .setPlaceholder("Optionally enter a description.")
            .onCommit(v => {
                this.value.description = v
            })
            .css("height", "80px").setValue(this.value.description))
    }

    get(): Pack.Meta {
        return this.value
    }
}

export abstract class FormModal<T> extends NisModal {
    private resolver: {
        handler: (_: T) => void,
        resolved: boolean
    } = null

    protected constructor() {
        super({footer: true});

        this.hidden.on(() => this.confirm(this.getValueForCancel()))
    }

    protected confirm(value: T): void {
        if (this.resolver && !this.resolver.resolved) {
            this.resolver.resolved = true
            this.resolver.handler(value)

            this.remove()
        }
    }

    protected getValueForCancel(): T {
        return null
    }

    async do(): Promise<T> {
        return new Promise(resolve => {
            this.resolver = {
                handler: resolve,
                resolved: false
            }

            this.show()
        })
    }
}

import {BigNisButton} from "../widgets/BigNisButton";
import Widget from "../../../lib/ui/Widget";
import {deps} from "../../dependencies";

export class NewMethodPackModal extends FormModal<{
    created: boolean
}> {
    edit: MethodPackMetaEdit

    constructor() {
        super();

        this.title.set("Create Method Pack")
    }

    render() {
        super.render();

        this.edit = new MethodPackMetaEdit({name: "", description: "", author: ""}).appendTo(this.body)
    }

    getButtons(): BigNisButton[] {
        return [
            new BigNisButton("Cancel", "cancel")
                .onClick(() => this.hide()),
            new BigNisButton("Save", "confirm")
                .onClick(async () => {

                    const pack = await MethodPackManager.instance().create({
                        ...this.edit.get(),
                        type: "local",
                        local_id: "",
                        original_id: "",
                        timestamp: 0,
                        methods: []
                    })

                    deps().app.notifications.notify({
                        type: "information"
                    }, `Method Pack '${pack.name}' created!`)

                    this.confirm({
                        created: true
                    })
                }),
        ]
    }

    protected getValueForCancel(): { created: boolean } {
        return {created: false}
    }
}

export class EditMethodPackModal extends FormModal<{
    saved: boolean
}> {
    edit: MethodPackMetaEdit

    constructor(private pack: Pack) {
        super();

        this.title.set("Edit Method Pack")

        this.edit = new MethodPackMetaEdit(Pack.meta(pack)).appendTo(this.body)
    }

    getButtons(): BigNisButton[] {
        return [
            new BigNisButton("Cancel", "cancel")
                .onClick(() => this.hide()),
            new BigNisButton("Save", "confirm")
                .onClick(async () => {

                    const pack = await MethodPackManager.instance().updatePack(this.pack,
                        p => Pack.setMeta(p, this.edit.get()))

                    deps().app.notifications.notify({
                        type: "information"
                    }, `Saved changes to method Pack '${pack.name}'!`)

                    this.confirm({
                        saved: true
                    })
                }),
        ]
    }

    protected getValueForCancel(): { saved: boolean } {
        return {saved: false}
    }
}