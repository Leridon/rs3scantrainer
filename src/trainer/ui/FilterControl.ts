import {storage} from "lib/util/storage";
import {ClueStep} from "lib/runescape/clues";
import {clues} from "data/clues";
import {Application} from "trainer/application";
import ToggleButton from "./widgets/togglebutton";

export default class FilterControl {
    private filter = new storage.Variable("preferences/cluefilters",
        {
            tiers: {
                easy: true,
                medium: true,
                hard: true,
                elite: true,
                master: true
            },
            types: {
                compass: true,
                coordinates: true,
                cryptic: true,
                emote: true,
                image: true,
                scan: true,
                simple: true,
                skilling: true,
            }
        }
    )

    filterbuttons: ToggleButton[]
    filtertoggle: ToggleButton

    constructor(private app: Application) {
        $("#filters").hide()

        let self = this

        this.filterbuttons = $(".filterbutton").get().map((b) => $(b)).map((button) => {
            let saved_state =
                this.filter.get().types[button.attr("data-type")] ||
                this.filter.get().tiers[button.attr("data-tier")]

            return new ToggleButton(button, saved_state)
                .on_toggle((s, e) => {
                    let target = $(e.currentTarget)

                    let type = target.attr("data-type");
                    let tier = target.attr("data-tier");

                    if (type) self.filter.value.types[type] = s
                    else self.filter.value.tiers[tier] = s

                    self.filter.save()

                    self.update()
                })
        })

        this.filtertoggle = new ToggleButton($("#filtertoggle"), false)
            .on_toggle((s, e) => {

                if (s) $("#filters").show()
                else $("#filters").hide()
            })

        this.filtertoggle.button.hide()

        this.update()
    }

    private candidates: ClueStep[] = clues

    private update() {
        this.candidates = clues.filter((c) =>
            (c.tier == null || this.filter.value.tiers[c.tier]) && this.filter.value.types[c.type]
        )
    }

    getCandidates(): ClueStep[] {
        // Just return scans for now
        return clues.filter((c) => c.type == "scan")

        return this.candidates
    }
}