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
    let results = fuzzysort.go(term, clues, {
        key: "searchText",
        all: true
    })

    let box = $("#searchresults").empty()

    for (let e of results) {
        $("<div>")
            .addClass("cluesearchresult")
            .attr("tabindex", -1)
            .data("clue", e.obj).text(e.target).appendTo(box)
    }
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
            updateSearch($("#cluesearchbox").val() as string)
        })

        $("#filters").hide()

        {
            let search_box = $("#cluesearchbox")
            let search_results = $("#searchresults").hide()

            search_box.on("input", (e) => {
                updateSearch((e.target as HTMLInputElement).value)
            })
            search_box.on("focusin", () => {
                search_results.show()
                search_box.val("")
                updateSearch(search_box.val() as string)
            })
            search_box.on("focusout", (e) => {
                let reltgt = $(e.relatedTarget)

                if (reltgt.hasClass("cluesearchresult") && reltgt.data("clue")) {
                    select(reltgt.data("clue"))
                    search_box.val("")
                }

                search_results.hide()
            })

            search_results.on("click", (e) => {
                if ($(e.target).data("clue")) {
                    select($(e.target).data("clue"))
                    search_box.val("")
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

export function gotoRoot() {
    $("#cluesearchpanel").show()
    $("#solutionpanel").hide()

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
        setMethod(clue.methods[0])
    } else {
        $("#cluemethod").hide()
        setHowToTabs({})
    }
}

export function setMethod(method: Method) {
    $(".cluemethodcontent").hide()
    method.sendToUi()
    $(`.cluemethodcontent[data-methodtype=${method.type}]`).show()

    $("#cluemethod").show()
    setHowToTabs(method.howto())
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
        let best = uiState.preferredHowToTabs.concat(["video", "text", "scanmap", "image"]).find((e) => e in howto)

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