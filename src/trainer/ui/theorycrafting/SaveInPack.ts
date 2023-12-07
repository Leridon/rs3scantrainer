import NisModal from "../../../lib/ui/NisModal";
import {AugmentedMethod, MethodPackManager, Pack} from "../../model/MethodPackManager";
import PackWidget from "./PackWidget";
import LightButton from "../widgets/LightButton";
import {C} from "../../../lib/ui/constructors";
import btnrow = C.btnrow;
import {Observable, observe} from "../../../lib/reactive";
import * as lodash from "lodash";
import Button from "../../../lib/ui/controls/Button";

export default class SaveInPack extends NisModal {
    private pack_widgets: PackWidget[]

    active: Observable<Pack> = observe(null)

    save_button: Button

    private saved_in: Pack = null

    constructor(private method: AugmentedMethod, private packs: MethodPackManager) {
        super({footer: true});

        this.title.set("Select pack")

        ;(async () => {
            let local_packs = (await packs.all()).filter(p => p.type == "local")

            this.pack_widgets = local_packs.map(pack => {
                return new PackWidget(pack, packs, {
                    mode: "view",
                    buttons: false
                })
                    .css("cursor", "pointer")
                    .tapRaw(r => r.on("click", () => {
                        if (this.active.value() == pack) this.active.set(null)
                        else this.active.set(pack)
                    }))
                    .appendTo(this.body)
            })

            this.active.set(lodash.maxBy(local_packs, p => p.timestamp))
        })()

        this.active.subscribe((a) => {
            this.pack_widgets.forEach(w => {
                w.toggleClass("inactive", w.pack != a)

                this.save_button?.setEnabled(!!a)
            })
        })

        this.footer.append(
            btnrow(
                this.save_button = new LightButton("Save").onClick(() => {
                    this.packs.updatePack(this.active.value(), p => p.methods.push(this.method.method))

                    this.saved_in = this.active.value()

                    this.remove()
                }),
                new LightButton("Cancel")
                    .onClick(() => this.remove())
            )
        )

    }

    do(): Promise<Pack | null> {
        this.show()

        return new Promise((resolve) => {
            this.hidden.on(() => {
                resolve(this.saved_in)
            })
        })
    }
}