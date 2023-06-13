import * as leaflet from "leaflet"
import Dict = NodeJS.Dict;


export class CustomControl extends leaflet.Control {
    constructor(public container: JQuery,
                events: Dict<(Event) => void> = {}
    ) {
        super()

        for (let key of Object.keys(events)) this.container.on(key, events[key])
    }

    onAdd(map: leaflet.Map): HTMLElement {
        return this.container.get()[0]
    }
}

export class ImageButton extends CustomControl {
    constructor(img_url: string,
                events: Dict<(HTMLEvent) => void> = {},
                options: {
                    title?: string
                }
    ) {

        let old_click = events["click"]

        if (old_click) {
            events["click"] = (e) => {
                e.stopPropagation()
                old_click(e)
            }
        }

        let object = $(`<div title="Toggle equivalence classes"><img src='${img_url}'></div>`).addClass("leaflet-button")

        if (options.title) object.attr("title", options.title)

        super(object, events);
    }
}