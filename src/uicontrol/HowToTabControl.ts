import {storage} from "../util/storage";
import {HowTo} from "../model/methods";
import {GameMapControl} from "./map/map";
import {Application} from "../application";


export default class HowToTabControls {
    map = new GameMapControl("map")
    preferred = new storage.Variable<string[]>("preferences/preferredtabs", [])
    how_to: HowTo = {}

    constructor(app: Application) {
        $(".methodtab").on("click", (e) => {
            let key = e.target.dataset.methodtype

            let preferred = this.preferred.get()

            let index = preferred.indexOf(key)
            if (index >= 0) preferred.splice(index, 1)
            preferred.unshift(key)

            this.preferred.set(preferred)

            this.activateHowToTab(key)
        })

        this.setHowToTabs({})

        this.map.map.invalidateSize()
    }

    setHowToTabs(howto: HowTo) {
        if (!howto) howto = {}

        this.how_to = howto

        $(".methodtab").hide()
        $(".methodtabcontent").hide()

        // Always show map
        $(`.methodtab[data-methodtype=map]`).show()


        for (let key of Object.keys(howto)) {
            $(`.methodtab[data-methodtype=${key}]`).show()
        }
        if (howto.text) {
            $("#textmethodcontent").text(howto.text)
        }

        let available_tabs = Object.keys(howto).concat(["map"])
        if (available_tabs.length > 0) {
            let best = this.preferred.get().concat(["map", "video", "text", "scanmap", "image"]).find((e) => e in available_tabs)

            if (best) this.activateHowToTab(best)
            else this.activateHowToTab(available_tabs[0])
        }
    }

    activateHowToTab(key: string) {
        $(".methodtab").removeClass("activetab")
        $(`.methodtab[data-methodtype=${key}]`).addClass("activetab")

        if (key == "video" && this.how_to.video) {
            // Activate video on demand
            let video = $("#videoplayer").empty();
            let vid = video.get()[0] as HTMLVideoElement

            vid.pause()
            video.empty()

            video.append($("<source>")
                .attr("src", this.how_to.video.ref)
                .attr("type", "video/webm"))

            vid.load()
            vid.play()

            $("#videoclipcontributor").text(this.how_to.video.contributor)
        }

        $(".methodtabcontent").hide()
        $(`.methodtabcontent[data-methodtype=${key}]`).show()

        if(key == "map"){
            this.map.map.invalidateSize()
        }
    }
}