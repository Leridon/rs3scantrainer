import Widget from "../widgets/Widget";

export default class TopControl<T extends Record<string, any> = {}> extends Widget<T> {
    constructor() {
        super()

        this.addClass("nis-map-control-top").addClass("nis-map-control")
    }
}