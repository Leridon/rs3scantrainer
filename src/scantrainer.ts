import {scanclues} from "./cluedata";
import {ScanClue, ScanTree} from "./scanclues";
import {tsxRegex} from "ts-loader/dist/constants";

type UIState = {
    isAtRoot: boolean,
    tree: ScanTree
}

let uiState: UIState = {
    isAtRoot: false,
    tree: null
}


type SavedUIState = {
    isAtRoot: boolean,
    clue_id: string,
    path: string[]
}

function restoreState(state: SavedUIState) {

    setUiState({
        isAtRoot: state.isAtRoot,
        tree: state.clue_id != null ? scanclues.find((c) => c.id == state.clue_id).path.get(state.path) : null
    }, false)
}

function pushState() {
    let s = {
        isAtRoot: uiState.isAtRoot,
        clue_id: uiState.tree ? uiState.tree.clue.id : null,
        path: uiState.tree ? uiState.tree.path : null,
    } as SavedUIState

    history.pushState(s, "")
    console.log(`pushed ${JSON.stringify(s)}`)
}

export function initializeScantrainer() {
    let selection = $("#selectionpanel").empty()

    for (let clue of scanclues) {
        selection.append(
            $("<div>")
                .addClass("nisbutton")
                .addClass("scanselection")
                .text(clue.name)
                .on("click", () => goto(clue.path))
        )
    }

    addEventListener("popstate", (e) => {
        console.log(e.state)

        restoreState(e.state)
    })

    gotoRoot(false)
    history.replaceState({
        isAtRoot: true,
        clue_id: null,
        path: []
    } as SavedUIState, "")
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

function setUiState(state: UIState, in_history: boolean = true) {
    if (state.isAtRoot) gotoRoot(in_history)
    else goto(state.tree, in_history)
}

export function gotoRoot(in_history: boolean = true) {
    $("#selectionpanel").show()
    $("#solutionpanel").hide()

    setBreadcrumb([
        ["Home", () => gotoRoot()],
    ])

    uiState.tree = null
    uiState.isAtRoot = true

    if (in_history) pushState()
}

export function goto(scanStep: ScanTree, in_history: boolean = true) {
    $("#selectionpanel").hide()
    $("#solutionpanel").show()

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

    let tree = clue.path.get(stepPath)

    uiState.tree = tree
    uiState.isAtRoot = false

    // Update the solution explorer
    $("#solutiontext").empty().append(tree.toHtml())

    $("#mapview").attr("src", `${clue.mapImgPath}`)

    if (in_history) pushState()
}