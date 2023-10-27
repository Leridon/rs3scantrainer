import {SidePanel} from "../SidePanelControl";
import {Modal} from "../widgets/modal";

export default abstract class NewMethodPanel extends SidePanel {
    protected constructor(modal: Modal | null = null) {
        super();

        if (modal) {
            c("<span class='img-button'><img class='inline-img' src='assets/icons/info.png'></span>")
                .tapRaw(e => e.on("click", () => modal.show()))
                .appendTo(this.ui.header.right_corner)
        }
    }
}