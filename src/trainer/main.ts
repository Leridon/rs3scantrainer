import {MethodPackManager} from "./model/MethodPackManager";
import {Path} from "../lib/runescape/pathing";
import ExportStringModal from "./ui/widgets/modals/ExportStringModal";
import {util} from "../lib/util/util";
import {TileArea} from "../lib/runescape/coordinates/TileArea";
import {ScanTree} from "../lib/cluetheory/scans/ScanTree";
import * as lodash from "lodash"
import cleanedJSON = util.cleanedJSON;

function fix_path(p: Path): number {
  if (!p) return

  let removed = 0

  for (let i = 0; i < p.length - 1; i++) {
    const step = p[i]
    const next = p[i + 1]

    if (step.type == "ability" && step.ability == "dive" && next.type == "cosmetic" && next.icon == "ability-dive-combined") {
      step.target_area = next.area
      p.splice(i + 1, 1)
      removed++
    }

    if (step.type == "run" && !step.target_area && next.type == "cosmetic" && next.icon == "run") {
      step.target_area = next.area
      p.splice(i + 1, 1)
      removed++
    }

    if (step.type == "cosmetic" && step.icon == "run" && next.type == "run" && !next.target_area && TileArea.activate(step.area).query(next.waypoints[next.waypoints.length - 1])) {
      next.target_area = step.area
      p.splice(i, 1)
      removed++
    }
  }

  return removed
}

function fix_tree(tree: ScanTree.ScanTreeNode) {
  return fix_path(tree.path) +
    (tree.children
      ? lodash.sum(tree.children.map(c => fix_tree(c.value)))
      : 0)
}

export async function makeshift_main(): Promise<void> {

  const packs = [
    "default:ngiseasy",
    "default:ngismedium",
    "default:ngishard",
    "default:ngiscompass",
    "default:ngistetra",
    "default:ngismaster",
"default:scanmethods"
  ]

  for (const pack_id of packs) {
    const pack = await MethodPackManager.instance().getPack(pack_id)

    let removed = 0

    for (let m of pack.methods) {
      switch (m.type) {
        case "general_path": {
          removed += fix_path(m.pre_path)
          removed += fix_path(m.main_path)
          removed += fix_path(m.post_path)
          break;
        }
        case "scantree":
          removed += fix_tree(m.tree.root)
      }
    }

    await ExportStringModal.do(cleanedJSON(pack), `Removed ${removed} icons`,
      `${pack.name}.json`
    )
  }
}