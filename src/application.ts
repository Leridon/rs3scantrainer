import {storage} from "./util/storage";
import CluePanelControl from "./uicontrol/CluePanelControl";
import HowToTabControls from "./uicontrol/HowToTabControl";
import MenuBarControl from "./uicontrol/MenuBarControl";

export const DEBUG = true;


export class Application {
    in_alt1: boolean = !!window.alt1

    menubar = new MenuBarControl(this)
    howtotabs = new HowToTabControls(this)
    cluepanel = new CluePanelControl(this)

    constructor() {
    }
}

export let scantrainer: Application = null

const VERSION = 0

export function initialize() {

    let version = new storage.Variable("lastrunversion", -1)

    scantrainer = new Application()

    version.set(VERSION)


    //scantrainer.select(clues.find((c) => c.id == 361)) // zanaris
    //scantrainer.select(clues.find((c) => c.id == 399)) // compass
}