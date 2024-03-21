import {util} from "lib/util/util";
import {ScanTree} from "lib/cluetheory/scans/ScanTree";
import AugmentedScanTreeNode = ScanTree.Augmentation.AugmentedScanTreeNode;
import {TextRendering} from "../../TextRendering";
import render_digspot = TextRendering.render_digspot;
import spotNumber = ScanTree.spotNumber;
import shorten_integer_list = util.shorten_integer_list;

export function scan_tree_template_resolvers(node: AugmentedScanTreeNode): Record<string, (args: string[]) => string> {
    return {
        "target": () => {
            if (node.remaining_candidates.length == 1) {
                return render_digspot(spotNumber(node.root.raw, node.remaining_candidates[0]))
            } else {
                return `{{scanarea ${node.raw.region?.name || "_"}}}`
            }
        },
        "candidates":
            () => {
                return util.natural_join(shorten_integer_list(node.remaining_candidates.map(c => spotNumber(node.root.raw, c)), render_digspot))
            }
    }
}
