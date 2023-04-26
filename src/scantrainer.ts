import {ClueStep, ClueTier, ClueType} from "./clues";
import * as fuzzysort from "fuzzysort";
import {clues} from "./data/clues";
import {HowTo, Method} from "./methods";

type UIState = {
    clue: ClueStep,
    method: Method,
    filters_visible: boolean,
    preferredHowToTabs: string[],
    searchFilter: {
        tiers: boolean[],
        types: boolean[],
    }
}

let uiState: UIState = {
    clue: null,
    method: null,
    preferredHowToTabs: [],
    filters_visible: true,
    searchFilter: {
        tiers: [true, true, true, true, true],
        types: [true, true, true, true, true, true, true, true, true]
    }
}

function updateFilter() {

}

function updateSearch(term: string) {
    let results = fuzzysort.go(term, clues, {key: "searchText"})

    let box = $("#searchresults").empty()

    for (let e of results) {
        $("<div>").data("clue", e.obj as ClueStep).text(e.target).appendTo(box)
    }
}

function openSolutionTab(methodtype: string) {
    $(".methodtab").removeClass("activetab")
    $(`.methodtab[data-methodtype=${methodtype}]`).addClass("activetab")

    $(".methodtabcontent").hide()
    $(`.methodtabcontent[data-methodtype=${methodtype}]`).show()
}

export function initializeScantrainer() {
    function setupClueSearch() {
        $("#filtertoggle").on("click", (e) => {
            uiState.filters_visible = !uiState.filters_visible

            if (uiState.filters_visible) {
                $("#filters").show()
                $("#filtertoggle").addClass("inactive")
            } else {
                $("#filters").hide()
                $("#filtertoggle").removeClass("inactive")
            }
        })

        $(".filterbutton").on("click", (e) => {
            let target = $(e.currentTarget)

            let type = target.attr("data-type");
            let tier = target.attr("data-tier");

            if (type) {
                let id = ClueType[type]

                uiState.searchFilter.types[id] = !uiState.searchFilter.types[id]

                if (uiState.searchFilter.types[id]) target.removeClass("inactive")
                else target.addClass("inactive")
            } else {
                let id = ClueTier[tier]

                uiState.searchFilter.tiers[id] = !uiState.searchFilter.tiers[id]

                if (uiState.searchFilter.tiers[id]) target.removeClass("inactive")
                else target.addClass("inactive")
            }

            updateFilter()
            updateSearch((<HTMLInputElement>$("#cluesearchbox").get()[0]).value)
        })

        $("#filters").hide()

        {
            let search_box = $("#cluesearchbox")
            let search_results = $("#searchresults")

            search_box.on("input", (e) => {
                updateSearch((e.target as HTMLInputElement).value)
            })
            search_box.on("focus", () => {
                search_results.show()
                updateSearch(($("#cluesearchbox").get()[0] as HTMLInputElement).value)
            })
            search_box.on("focusout", search_results.hide)

            search_results.on("click", (e) => {
                if ($(e.target).data("clue")) {
                    select($(e.target).data("clue"))
                }
            })
        }

    }

    function setupTabControls() {
        $(".methodtab").on("click", (e) => {
            let key = e.target.dataset.methodtype

            let index = uiState.preferredHowToTabs.indexOf(key)

            if (index >= 0) uiState.preferredHowToTabs.splice(index, 1)

            uiState.preferredHowToTabs.unshift(key)

            console.log(uiState.preferredHowToTabs)

            activateHowToTab(key)
        })
    }

    setupClueSearch()
    setupTabControls()
    setHowToTabs({})

    gotoRoot()
}

function setBreadcrumb(path: [string, () => void][]) {
    let list = $("#pathview").empty()

    for (let i = 0; i < path.length - 1; i++) {
        let p = path[i]

        $("<li>")
            .addClass("breadcrumb-item")
            .append($("<a>").attr("href", "javascript:;").on("click", p[1]).text(p[0]))
            .appendTo(list)
    }

    {
        let p = path[path.length - 1]
        $("<li>")
            .addClass("breadcrumb-item").addClass("active")
            .text(p[0])
            .appendTo(list)
    }
}

export function gotoRoot() {
    $("#cluesearchpanel").show()
    $("#solutionpanel").hide()

    setBreadcrumb([
        ["Home", () => gotoRoot()],
    ])

    uiState.clue = null
    uiState.method = null
}

export function select(clue: ClueStep) {
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
        console.log("Method set")
        setMethod(clue.methods[0])
    } else {
        $("#cluemethod").hide()
        setHowToTabs({})
    }
}

export function setMethod(method: Method) {
    setMethod2(method.interactivePanel(), method.howto())
}

export function setMethod2(interactive_panel: JQuery, howto: HowTo) {
    $("#cluemethodcontent").empty().append(interactive_panel)
    $("#cluemethod").show()

    setHowToTabs(howto)
}

export function setHowToTabs(howto: HowTo) {
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
        let best = uiState.preferredHowToTabs.find((e) => e in howto)

        console.log("best is " + best)

        if (best) activateHowToTab(best)
        else activateHowToTab(available_tabs[0])
    }
}

function activateHowToTab(key: string) {
    $(".methodtab").removeClass("activetab")
    $(`.methodtab[data-methodtype=${key}]`).addClass("activetab")

    $(".methodtabcontent").hide()
    $(`.methodtabcontent[data-methodtype=${key}]`).show()
}