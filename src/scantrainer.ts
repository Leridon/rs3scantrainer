import {ClueStep, ClueTier, ClueType} from "./clues";
import {tsxRegex} from "ts-loader/dist/constants";
import * as fuzzysort from "fuzzysort";
import {clues} from "./data/clues";
import {HowTo, Method, ScanTree} from "./methods";

type UIState = {
    clue: ClueStep,
    method: Method,
    filters_visible: boolean,
    //preferredMethodType: string,
    searchFilter: {
        tiers: boolean[],
        types: boolean[],
    }
}

let uiState: UIState = {
    clue: null,
    method: null,
    //preferredMethodType: "video",
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
            } else {
                $("#filters").hide()
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
            //TODO uiState.preferredMethodType = e.target.dataset.methodtype
            openSolutionTab(e.target.dataset.methodtype)
        })
    }

    setupClueSearch()
    setupTabControls()

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
        setMethod(clue.methods[0])
    } else {
        $("#cluemethod").hide()
    }
}

export function goto(scanStep: ScanTree) {
    $("#cluesearchpanel").hide()
    $("#solutionpanel").show()

    /*

    let clue = scanStep.clue
    let stepPath = scanStep.path

    // Set the path in the breadbrumb menu
    {
        let p = []

        p.push(["Home", () => gotoRoot()])
        p.push([clue.name, () => goto(clue.path)])

        for (let i = 0; i < stepPath.length; i++) {
            p.push([stepPath[i], () => goto(clue.path.get(stepPath.slice(0, i)))])
        }

        setBreadcrumb(p)
    }

    let tree = null//clue.path.get(stepPath)

    uiState.tree = tree
    uiState.isAtRoot = false

    // Update the method tabs
    {
        // Show/Hide tabs depending on availability
        for (let methodtype of ["video", "text"]) {
            if (tree.methods[methodtype])
                $(`.methodtab[data-methodtype=${methodtype}], .methodtabcontent[data-methodtype=${methodtype}]`).show()
            else
                $(`.methodtab[data-methodtype=${methodtype}], .methodtabcontent[data-methodtype=${methodtype}]`).hide()
        }

        if (tree.methods.video) {
            let video = $("#videoplayer").empty();
            let vid = video.get()[0] as HTMLVideoElement

            vid.pause()
            video.empty()

            video.append($("<source>")
                .attr("src", tree.methods.video.ref)
                .attr("type", "video/mp4"))

            vid.load()
            vid.play()
        }

        if (tree.methods.text) $("#textmethodcontent").html(tree.methods.text)

        //$("#mapview").attr("src", `${tree.mapImgPath}`)

        // Open the best fitting tab
        if (tree.methods[uiState.preferredMethodType]) openSolutionTab(uiState.preferredMethodType)
        else if (tree.methods.text) openSolutionTab("text")
        else openSolutionTab("map")
    }

    // Update the solution explorer
    $("#scantreepanel").empty().append(tree.toHtml())*/
}

export function setMethod(method: Method) {
    setMethod2(method.interactivePanel(), method.details())
}

export function setMethod2(interactive_panel: JQuery, details: HowTo[]) {
    $("#cluemethodcontent").empty().append(interactive_panel)
    $("#cluemethod").show()
}