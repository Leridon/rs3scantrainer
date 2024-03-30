import {util} from "lib/util/util";
import {ScanTree} from "lib/cluetheory/scans/ScanTree";
import {TextRendering} from "../../TextRendering";
import {TemplateResolver} from "../../../../lib/util/TemplateResolver";
import AugmentedScanTreeNode = ScanTree.Augmentation.AugmentedScanTreeNode;
import render_digspot = TextRendering.render_digspot;
import spotNumber = ScanTree.spotNumber;
import shorten_integer_list = util.shorten_integer_list;
import render_scanregion = TextRendering.render_scanregion;

export function scan_tree_template_resolvers(node: AugmentedScanTreeNode): TemplateResolver.Function[] {
  return [
    {
      name: "target", apply: () => {
        if (node.remaining_candidates.length == 1) {
          return [{
            type: "domelement",
            value: render_digspot(spotNumber(node.root.raw, node.remaining_candidates[0]))
          }]
        } else {
          return [{
            type: "domelement",
            value: render_scanregion(node.raw.region?.name || "_")
          }]
        }
      }
    },
    {
      name: "candidates", apply: () => {
        return [{
          type: "domelement",
          value: c(util.natural_join(shorten_integer_list(node.remaining_candidates.map(c => spotNumber(node.root.raw, c)), c => render_digspot(c).raw().outerHTML)))
        }]
      }
    }
  ]
}
