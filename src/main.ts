import {clues} from "./data/clues";
import {MapCoordinate, MapRectangle} from "./model/coordinates";
import old_methods from "./data/methods_old";
import {ScanTree} from "./model/scans/ScanTree";
import {Path} from "./model/pathing";
import {Pulse} from "./model/scans/scans";
import {indirect, indirected, resolve, resolved} from "./model/methods";
import {ClueStep, ScanStep} from "./model/clues";

async function translate(tree: ScanTree.scan_tree_old & indirected): Promise<ScanTree.tree & indirected> {
    console.log("Translate")

    let a: ScanTree.tree & indirected = {
        clue: tree.clue,
        type: "scantree",
        spot_ordering: tree.spot_ordering,
        assumes_meerkats: tree.assumes_meerkats,
        areas: tree.areas,
        root: translate_node(tree.root, null)
    }

    return a

    return indirect(await ScanTree.normalize(resolve<ScanStep, ScanTree.tree>(a)))
}

function to_node(p: {
                     spot?: MapCoordinate,
                     directions: string,
                     path: {
                         steps: Path.raw,
                         target: MapRectangle,
                         start_state: Path.movement_state
                     }
                 },
                 parent_key: Pulse): {
    key: ScanTree.PulseInformation,
    value: ScanTree.decision_tree
} {
    return {
        key: {
            pulse: parent_key.pulse, // Should always be 3
            different_level: parent_key.different_level,
            spot: p.spot,
        },
        value: {
            path: p.path.steps,
            scan_spot_id: null,
            directions: p.directions,
            children: []
        }
    }
}

function translate_node(tree: ScanTree.decision_tree_old, parent_key: Pulse): ScanTree.decision_tree {
    if (tree.scan_spot_id == null) {
        if (tree.paths.length == 1) {
            let p = tree.paths[0]

            return {
                path: p.path.steps,
                scan_spot_id: null,
                directions: p.directions,
                children: []
            }
        } else {
            return ScanTree.init_leaf()
        }
    }

    return {
        path: tree.paths.find(p => p.spot == null)?.path.steps || [],
        scan_spot_id: tree.scan_spot_id,
        directions: tree.paths.find(p => p.spot == null)?.directions || "ERROR IN CONVERT",
        children: tree.children.flatMap(c => {
            if (c.key.pulse == 3) {
                return c.value.paths.map(p => to_node(p, c.key))
            } else {
                return [{
                    key: c.key,
                    value: translate_node(c.value, c.key)
                }]
            }
        }).filter(c => c.value != null)

        /*  tree.paths.filter(p => p.spot != null && parent_key?.pulse == 3)
          .map(p => to_node(p, parent_key))
          .concat(tree.children.map(c => {
              return {
                  key: null,
                  value: translate_node(c.value, c.key)
              }
          }))*/
    }
}

export async function makeshift_main(): Promise<string> {
    let output = ""

    return JSON.stringify(await Promise.all(old_methods.map(async m => await translate(m))), null, 4)
}