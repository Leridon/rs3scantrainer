import AbstractEditWidget from "../widgets/AbstractEditWidget";
import {Path} from "../../../lib/runescape/pathing";
import {FormModal} from "../../../lib/ui/controls/FormModal";
import {BigNisButton} from "../widgets/BigNisButton";
import {util} from "../../../lib/util/util";
import copyUpdate = util.copyUpdate;
import Properties from "../widgets/Properties";
import TemplateStringEdit from "../widgets/TemplateStringEdit";
import {deps} from "../../dependencies";
import DirectionSelect from "./DirectionSelect";
import MapCoordinateEdit from "../widgets/MapCoordinateEdit";
import InteractionSelect from "./InteractionSelect";

class StepDetailEdit extends AbstractEditWidget<Path.Step> {

    constructor() {
        super();
    }

    protected render() {
        const value = this.get()

        if (!value) return

        const props = new Properties()

        this.append(props)

        props.named("Details", new TemplateStringEdit({resolver: deps().app.template_resolver})
            .setValue(value.description)
            .onCommit(v => this.commit(copyUpdate(this.get(), e => e.description = v)))
        )

        switch (value.type) {
            case "orientation":
                props.named("Facing", new DirectionSelect()
                    .setValue(value.direction)
                    .onSelection(dir => {
                        this.commit(copyUpdate(this.get() as Path.step_orientation, e => e.direction = dir))
                    })
                )

                break;
            case "ability":

                props.named("From", new MapCoordinateEdit(value.from)
                    .onCommit(v =>
                        this.commit(copyUpdate(this.get() as Path.step_ability, e => e.from = v))
                    )
                )
                props.named("To", new MapCoordinateEdit(value.to)
                    .onCommit(v =>
                        this.commit(copyUpdate(this.get() as Path.step_ability, e => e.to = v))
                    )
                )

                // TODO: Target
                // TODO: Target text.

                break;
            case "redclick":
                props.named("Type", new InteractionSelect()
                    .setValue(value.how)
                    .onSelection(v =>
                        this.commit(copyUpdate(this.get() as Path.step_redclick, e => e.how = v))
                    )
                )

                props.named("Where", new MapCoordinateEdit(value.where)
                    .onCommit(v =>
                        this.commit(copyUpdate(this.get() as Path.step_redclick, e => e.where = v))
                    )
                )

                // TODO: Target

                break;
            case "run":
                break;
            case "teleport":

                props.named("Spot", new MapCoordinateEdit(value.spot)
                    .onCommit(v =>
                        this.commit(copyUpdate(this.get() as Path.step_teleport, e => e.spot = v))
                    )
                )

                break;
            case "powerburst":

                props.named("Where", new MapCoordinateEdit(value.where)
                    .onCommit(v =>
                        this.commit(copyUpdate(this.get() as Path.step_powerburst, e => e.where = v))
                    )
                )

                break;
            case "transport":
                break;
            case "cheat":

                props.named("Target", new MapCoordinateEdit(value.target)
                    .onCommit(v =>
                        this.commit(copyUpdate(this.get() as Path.step_cheat, e => e.target = v))
                    )
                )

                props.named("Facing", new DirectionSelect()
                    .setValue(value.orientation)
                    .onSelection(dir => {
                        this.commit(copyUpdate(this.get() as Path.step_cheat, e => e.orientation = dir))
                    })
                )

                // TODO: Ticks

                break;
        }
    }
}

export class StepEditModal extends FormModal<{
    new_version: Path.Step | null
}> {
    private edit: StepDetailEdit

    constructor(private value: Path.Step) {
        super({
            size: "small"
        });

        this.title.set("Edit Step Details")
    }

    render() {
        super.render()

        this.edit = new StepDetailEdit()
            .setValue(copyUpdate(this.value, () => {}))
            .appendTo(this.body)
    }

    getButtons(): BigNisButton[] {
        return [
            new BigNisButton("Cancel", "cancel")
                .onClick(() => this.cancel())
            ,
            new BigNisButton("Save", "confirm")
                .onClick(() => this.confirm({new_version: this.edit.get()})),
        ]
    }

    protected getValueForCancel(): { new_version: Path.Step | null } {
        return {new_version: null}
    }
}