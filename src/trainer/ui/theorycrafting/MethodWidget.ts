import Widget from "../../../lib/ui/Widget";
import {AugmentedMethod, MethodPackManager} from "../../model/MethodPackManager";
import * as lodash from "lodash";
import {TileCoordinates} from "../../../lib/runescape/coordinates";
import Properties from "../widgets/Properties";
import LightButton from "../widgets/LightButton";
import {C} from "../../../lib/ui/constructors";
import spacer = C.spacer;
import vbox = C.vbox;
import span = C.span;
import hbox = C.hbox;
import {util} from "../../../lib/util/util";
import uuid = util.uuid;

export default class MethodWidget extends Widget {
    constructor(methods: AugmentedMethod[],
                private edit_handler: (_: AugmentedMethod) => any
    ) {
        super();

        let pack = methods[0].pack

        this.append(
            c(`<div class="ctr-method-widget-pack-header">${lodash.capitalize(pack.type)} Pack <span>${pack.name}</span></span></div>`)
                .tooltip(`By ${pack.author}. ${pack.description}`)
        )

        for (let m of methods) {
            function render_for() {
                if (m.method.for.spot) return `spot ${TileCoordinates.toString(m.method.for.spot)} in clue ${m.method.for.clue}`
                if (m.method.for.spot) return `clue ${m.method.for.clue}`
            }

            let header = hbox(
                vbox(
                    c(`<div><span style="font-style: italic">${m.method.name}</span></div>`),
                ),
                spacer().css("min-width", "30px"),
                span("F")
            ).addClass("ctr-method-widget-header")
                .appendTo(this)
                .tapRaw(r => r.on("click", () => {
                    body.container.animate({"height": "toggle"})
                }))

            let body = new Properties().appendTo(this)
                .addClass("ctr-method-widget-body")
                .css("display", "None")

            body.row(c().text(m.method.description))
            body.row(hbox(
                new LightButton("Edit", "rectangle").setEnabled(pack.type == "local")
                    .onClick(() => this.edit_handler(m))
                ,
                new LightButton("Edit Copy", "rectangle")
                    .onClick(() => {

                        let c = lodash.cloneDeep(m.method)

                        c.id = uuid()

                        this.edit_handler({pack: null, clue: m.clue, method: c})
                    })
                ,
                new LightButton("Delete", "rectangle")
                    .onClick(() => {
                        MethodPackManager.instance().deleteMethod(m)
                        // TODO: Trigger a rerender in some way
                    })
                ,
            ).addClass("ctr-button-container"))
        }

        this.addClass("ctr-method-widget")
    }
}