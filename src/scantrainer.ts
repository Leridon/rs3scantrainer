import {ClueStep, ClueTier, ClueType} from "./clues";
import * as fuzzysort from "fuzzysort";
import {clues} from "./data/clues";
import {HowTo, Method} from "./methods";
import {storage} from "./storage";
import {ClueReader} from "./skillbertssolver/reader";

type UIState = {
    clue: ClueStep,
    method: Method,
    preferredHowToTabs: string[],
}

let uiState: UIState = {
    clue: null,
    method: null,
    preferredHowToTabs: []
}

class FilterControl {
    private searchFilter = new storage.Variable("preferences/cluefilters",
        {
            tiers: [true, true, true, true, true],
            types: [true, true, true, true, true, true, true, true, true]
        }
    )

    private filters_visible: boolean = false

    constructor(private search: SearchControl) {
        $("#filters").hide()

        $(".filterbutton").each((i, e) => {
            let element = $(e)

            if (this.searchFilter.value.types[ClueType[element.attr("data-type")]] ||
                this.searchFilter.value.tiers[ClueTier[element.attr("data-tier")]]) {
                element.addClass("active")
            }
        })

        $(".togglebutton").on("click", (e) => {
                let target = $(e.currentTarget)

                if (target.hasClass("active")) target.removeClass("active")
                else target.addClass("active")
            }
        )

        $("#filtertoggle").on("click", (e) => {
            this.filters_visible = !this.filters_visible

            if (this.filters_visible) $("#filters").show()
            else $("#filters").hide()
        })

        $(".filterbutton").on("click", (e) => {
            let target = $(e.currentTarget)

            let type = target.attr("data-type");
            let tier = target.attr("data-tier");

            if (type) {
                let id = ClueType[type]

                this.searchFilter.value.types[id] = !this.searchFilter.value.types[id]
            } else {
                let id = ClueTier[tier]

                this.searchFilter.value.tiers[id] = !this.searchFilter.value.tiers[id]
            }

            console.log(this.searchFilter.value)

            this.searchFilter.save()

            this.update()
            this.search.update()
        })

        this.update()
    }

    private candidates: ClueStep[] = clues

    private update() {
        this.candidates = clues.filter((c) =>
            this.searchFilter.value.tiers[c.tier] && this.searchFilter.value.types[c.type]
        )
    }

    getCandidates() {
        return this.candidates
    }
}

class SearchControl {
    private filter = new FilterControl(this)

    private search_box =
        $("#cluesearchbox")
            .on("input", (e) => {
                this.update()
            })
            .on("focusin", () => {
                this.search_results.show()
                this.search_box.val("")
                this.update()
            })
            .on("focusout", (e) => {
                let reltgt = $(e.relatedTarget)

                if (reltgt.hasClass("cluesearchresult") && reltgt.data("clue")) {
                    this.scantrainer.select(reltgt.data("clue"))
                    this.search_box.val("")
                }

                this.search_results.hide()
            })

    private search_results = $("#searchresults").hide()
        .on("click", (e) => {
            if ($(e.target).data("clue")) {
                this.scantrainer.select($(e.target).data("clue"))
                this.search_box.val("")
            }
        })

    constructor(private scantrainer: ScanTrainer) {
    }

    update() {
        let term = this.search_box.val() as string

        let results = fuzzysort.go(term, this.filter.getCandidates(), {
            key: "searchText",
            all: true
        })

        let box = this.search_results.empty()

        for (let e of results) {
            $("<div>")
                .addClass("cluesearchresult")
                .attr("tabindex", -1)
                .data("clue", e.obj).text(e.target).appendTo(box)
        }
    }
}

class HowToTabControls {
    constructor() {
        $(".methodtab").on("click", (e) => {
            let key = e.target.dataset.methodtype

            let index = uiState.preferredHowToTabs.indexOf(key)

            if (index >= 0) uiState.preferredHowToTabs.splice(index, 1)

            uiState.preferredHowToTabs.unshift(key)

            console.log(uiState.preferredHowToTabs)

            this.activateHowToTab(key)
        })
    }

    setHowToTabs(howto: HowTo) {
        $(".methodtab").hide()
        $(".methodtabcontent").hide()

        for (let key of Object.keys(howto)) {
            $(`.methodtab[data-methodtype=${key}]`).show()
        }

        if (howto.text) {
            $("#textmethodcontent").text(howto.text)
        }

        if (howto.video) {
            let video = $("#videoplayer").empty();
            let vid = video.get()[0] as HTMLVideoElement

            vid.pause()
            video.empty()

            video.append($("<source>")
                .attr("src", howto.video.ref)
                .attr("type", "video/mp4"))

            vid.load()
            vid.play()

            $("#videoclipcontributor").text(howto.video.contributor)
        }

        if (howto.scanmap) {
            $("#mapview").attr("src", `${howto.scanmap}`)
        }

        let available_tabs = Object.keys(howto)
        if (available_tabs.length > 0) {
            let best = uiState.preferredHowToTabs.concat(["video", "text", "scanmap", "image"]).find((e) => e in howto)

            if (best) this.activateHowToTab(best)
            else this.activateHowToTab(available_tabs[0])
        }
    }

    activateHowToTab(key: string) {
        $(".methodtab").removeClass("activetab")
        $(`.methodtab[data-methodtype=${key}]`).addClass("activetab")

        $(".methodtabcontent").hide()
        $(`.methodtabcontent[data-methodtype=${key}]`).show()
    }

    setTas(howto: HowTo) {

    }
}

class ScanTrainer {
    public search = new SearchControl(this)
    public tabcontrols = new HowToTabControls()
    private cluereader = new ClueReader()

    constructor() {
        this.gotoRoot()

        $("#solvebbutton").on("click", async () => {
            let clue = await this.cluereader.find()

            if (clue) this.select(clue)
        })

        this.tabcontrols.setHowToTabs({})
    }

    gotoRoot() {
        $("#cluesearchpanel").show()
        $("#solutionpanel").hide()

        uiState.clue = null
        uiState.method = null
    }

    select(clue: ClueStep) {
        console.log(clue)

        $("#searchresults").hide()
        $("#solutionpanel").show()

        $("#cluetext").text(clue.clue)

        if (clue.solution) {
            $("#cluesolution").show()
            $("#cluesolutioncontent").text(clue.solution)
        } else {
            $("#cluesolution").hide()
        }

        if (clue.methods.length > 0) {
            this.setMethod(clue.methods[0])
        } else {
            $("#cluemethod").hide()
            this.tabcontrols.setHowToTabs({})
        }
    }

    setMethod(method: Method) {
        $(".cluemethodcontent").hide()
        method.sendToUi()
        $(`.cluemethodcontent[data-methodtype=${method.type}]`).show()

        $("#cluemethod").show()
        this.tabcontrols.setHowToTabs(method.howto())
    }
}

export let scantrainer: ScanTrainer = null

export function initialize() {
    scantrainer = new ScanTrainer()
}