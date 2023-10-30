import * as leaflet from "leaflet"
import Dict = NodeJS.Dict;


export class CustomControl extends leaflet.Control {
    constructor(public container: JQuery,
                events: Dict<(Event) => void> = {}
    ) {
        super()

        // Disable events propagating to the map
        this.container.on("blur change click dblclick error focus focusin focusout hover keydown keypress keyup load mousedown mouseenter mouseleave mousemove mouseout mouseover mouseup resize select submit mousewheel", (e) => e.stopPropagation())

        for (let key of Object.keys(events)) this.container.on(key, events[key])
    }

    onAdd(map: leaflet.Map): HTMLElement {
        return this.container.get()[0]
    }
}
