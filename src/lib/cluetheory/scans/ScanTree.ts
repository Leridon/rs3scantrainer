import {Path} from "lib/runescape/pathing";
import {Vector2} from "../../math";
import {Scans} from "lib/runescape/clues/scans";
import * as lodash from "lodash";
import {Clues} from "../../runescape/clues";
import {util} from "../../util/util";
import {ScanTheory} from "./Scans";
import {TileRectangle} from "../../runescape/coordinates";
import {TileCoordinates} from "../../runescape/coordinates";

export namespace ScanTree {
    import movement_state = Path.movement_state;

    import digSpotArea = Clues.digSpotArea;
    import PulseInformation = ScanTheory.PulseInformation;
    import spot_narrowing = ScanTheory.spot_narrowing;

    export type ScanRegion = {
        name: string
        area: TileRectangle
    }

    export type ScanTree = {
        ordered_spots: TileCoordinates[],
        assumed_range: number,
        root: ScanTreeNode
    }

    export type ScanTreeNode = {
        path: Path.Step[],
        region?: ScanRegion,
        directions: string,
        children: {
            key: PulseInformation,
            value: ScanTreeNode
        }[]
    }

    export namespace Augmentation {
        import avg = util.avg;

        export type AugmentedScanTree = {
            raw: ScanTree,
            clue: Clues.Scan,
            root_node: AugmentedScanTreeNode,
            state: {
                paths_augmented: boolean
                completeness_analyzed: boolean
                correctness_analyzed: boolean,
                timing_analysis: {
                    spots: { spot: TileCoordinates, timings: { ticks: number, incomplete: boolean }[], average: number }[],
                    average: number,
                }
            }
        }

        export type AugmentedScanTreeNode = {
            raw: ScanTreeNode,
            root: AugmentedScanTree,
            parent: {
                key: PulseInformation
                node: AugmentedScanTreeNode,
            } | null,
            region?: ScanRegion,
            path?: Path.augmented,
            depth: number,
            remaining_candidates: TileCoordinates[],
            children: {
                key: Scans.Pulse,
                value: AugmentedScanTreeNode
            }[],
            completeness?: completeness_t,
            correctness?: correctness_t,
        }

        export type completeness_t = "complete" | "incomplete_children" | "incomplete"
        export type correctness_t = "correct" | "correct_with_warnings" | "error" | "error_in_children"

        export function completeness_meta(completeness: completeness_t | correctness_t): {
            char: string,
            cls: string,
            desc: string
        } {
            let meta: Record<completeness_t | correctness_t, {
                char: string,
                cls: string,
                desc: string
            }> = {
                complete: {char: "\u2713", cls: "ctr-correct", desc: "This branch is complete."},
                correct: {char: "\u2713", cls: "ctr-correct", desc: "All paths are correct."},
                correct_with_warnings: {char: "\u2713", cls: "ctr-semicorrect", desc: "All paths are correct, but some have warnings."},
                error: {char: "\u2715", cls: "ctr-incorrect", desc: "There is an error in this path."},
                error_in_children: {char: "\u2715", cls: "ctr-semiincorrect", desc: "A child path has errors."},
                incomplete: {char: "?", cls: "ctr-incorrect", desc: "This branch is incomplete."},
                incomplete_children: {char: "?", cls: "ctr-semiincorrect", desc: "Branch has incomplete children."}
            }

            return meta[completeness]
        }

        /**
         * Augments all paths in an (already augmented!) decision tree.
         * Modifies the input tree.
         *
         * @param tree The tree whose paths to augment
         * @param assumptions The underlying path assumptions
         */
        export async function path_augmentation(tree: AugmentedScanTree, assumptions: Path.PathAssumptions): Promise<AugmentedScanTree> {
            async function helper(
                node: AugmentedScanTreeNode,
                start_state: Path.movement_state
            ): Promise<void> {

                node.path = await Path.augment(node.raw.path,
                    start_state,
                    node.remaining_candidates.length == 1 ? digSpotArea(node.remaining_candidates[0]) : node.region?.area)

                if (node.children.length > 0) {
                    let cloned_state = lodash.cloneDeep(node.path.post_state)
                    cloned_state.tick += 1 // Assume 1 tick reaction time between steps. Approximation, but may help to make timings and cooldowns more realistic

                    await Promise.all(node.children.map(c => helper(c.value, cloned_state)))
                }
            }

            if (!tree.state.paths_augmented) {
                await helper(tree.root_node, movement_state.start(assumptions))
                tree.state.paths_augmented = true
            }

            return tree
        }

        /**
         * Basic augmentation of a ScanTree. Translates a basic scan tree into a richer data structure that is easier to work with.
         * - Propagates the immediate parents down the tree and saves them.
         * - Sets the depth for each node
         * - Sets the remaining candidates on each node
         *
         * @param tree
         * @param clue
         */
        export function basic_augmentation(tree: ScanTree, clue: Clues.Scan): AugmentedScanTree {
            let root: AugmentedScanTree = {
                raw: tree,
                clue: clue,
                root_node: null,
                state: {
                    paths_augmented: false,
                    completeness_analyzed: false,
                    correctness_analyzed: false,
                    timing_analysis: null
                }
            }

            function helper(
                node: ScanTreeNode,
                parent: {
                    node: AugmentedScanTreeNode,
                    key: PulseInformation
                } | null,
                depth: number,
                remaining_candidates: TileCoordinates[],
                last_known_position: TileRectangle
            ): AugmentedScanTreeNode {
                let t: AugmentedScanTreeNode = {
                    root: root,
                    parent: parent,
                    region: node.region || {
                        area: TileRectangle.fromTile(Path.ends_up(node.path)) || last_known_position,
                        name: ""
                    },
                    raw: node,
                    depth: depth,
                    remaining_candidates: remaining_candidates,
                    children: []
                }

                if (node.children.length > 0) {
                    let narrowing = spot_narrowing(remaining_candidates, t.region.area, tree.assumed_range)

                    // The node is not a leaf node, handle all relevant children
                    t.children = node.children.map(child => {
                        return {
                            key: child.key,
                            value: helper(
                                child ? child.value : null,
                                {node: t, key: child.key},
                                depth + 1,
                                narrowing.find(n => PulseInformation.equals(n.pulse, child.key)).narrowed_candidates,
                                t.region.area
                            )
                        }
                    })
                }

                return t
            }

            root.root_node = helper(tree.root, null, 0, tree.ordered_spots, null)


            return root
        }

        /**
         * Analyzes an already augmented decision tree for correctness and completeness.
         * Results are written into the AugmentedScanTreeNode
         *
         * @param tree
         */
        export function analyze_correctness(tree: AugmentedScanTree): AugmentedScanTree {
            function helper(node: AugmentedScanTreeNode) {
                node.children.forEach(c => helper(c.value))

                let cs = node.children.map(c => c.value)

                let issues = Path.collect_issues(node.path)

                if (issues.some(i => i.level == 0)) node.correctness = "error"
                else if (cs.some(c => c.correctness == "error" || c.correctness == "error_in_children")) node.correctness = "error_in_children"
                else if (issues.some(i => i.level == 1) || cs.some(c => c.correctness == "correct_with_warnings")) node.correctness = "correct_with_warnings"
                else node.correctness = "correct"
            }

            if (!tree.state.paths_augmented) throw new TypeError("Trying to analyze a decision tree for correctness without augmented paths!")

            if (!tree.state.correctness_analyzed) {
                helper(tree.root_node)
                tree.state.correctness_analyzed = true
            }

            return tree
        }

        /**
         * Analyzes an already augmented decision tree for its completeness and annotates every node with it
         *
         * @param tree
         */
        export function analyze_completeness(tree: AugmentedScanTree): AugmentedScanTree {
            function helper(node: AugmentedScanTreeNode) {
                node.children.forEach(c => helper(c.value))

                let cs = node.children.map(c => c.value)

                node.completeness = "complete"

                if (node.remaining_candidates.length > 1 && cs.length == 0)
                    node.completeness = "incomplete"
                else if (cs.some(c => c.completeness == "incomplete" || c.completeness == "incomplete_children"))
                    node.completeness = "incomplete_children"
            }

            if (!tree.state.completeness_analyzed) {
                helper(tree.root_node)
                tree.state.completeness_analyzed = true
            }

            return tree
        }

        export function analyze_timing(tree: AugmentedScanTree): AugmentedScanTree {
            let timings: { spot: TileCoordinates, timings: { ticks: number, incomplete: boolean }[], average: number }[] = tree.raw.ordered_spots.map(c => ({
                spot: c,
                timings: [],
                average: 0
            }))

            AugmentedScanTree.traverse(tree.root_node, (node) => {
                if (node.children.length == 0) {
                    let complete = node.completeness == "complete"

                    node.remaining_candidates.forEach(c => {
                        let t = timings.find(t => TileCoordinates.eq2(t.spot, c))

                        t.timings.push({ticks: node.path.post_state.tick, incomplete: !complete})
                    })
                }
            })

            timings.forEach(t => t.average = avg(...t.timings.map(t => t.ticks)))

            tree.state.timing_analysis = {
                spots: timings,
                average: avg(...timings.map(t => t.average))
            }

            return tree
        }

        export async function augment(options: {
                                          augment_paths?: boolean,
                                          analyze_correctness?: boolean,
                                          analyze_completeness?: boolean,
                                          analyze_timing?: boolean,
                                          path_assumptions?: Path.PathAssumptions
                                      }, tree: ScanTree,
                                      clue: Clues.Scan) {

            let augmented = basic_augmentation(tree, clue)

            if (options.augment_paths) await path_augmentation(augmented, options.path_assumptions)
            if (options.analyze_correctness) analyze_correctness(augmented)
            if (options.analyze_completeness) analyze_completeness(augmented)
            if (options.analyze_timing) analyze_timing(augmented)

            return augmented
        }

        export namespace AugmentedScanTree {
            export function decision_string(node: AugmentedScanTreeNode): string {

                let internal = (() => {
                    if (!node.parent) return "Start"
                    else {
                        let region_name = node.parent.node.region?.name || ""

                        let type = node.parent.key
                        let context = node.parent.node.children.map(c => c.key)

                        // Use the full word when it's not "different level"
                        if (!type.different_level) {
                            if (util.count(context, (p => p.different_level)) == context.length - 1) {
                                // Is the only non-different level
                                if (region_name.length > 0) return `${region_name},Far`
                                else return "Far"
                            } else return `${region_name}${type.pulse.toString()}`
                        } else {
                            let counterpart_exists = context.some(p => p.pulse == type.pulse && !p.different_level)

                            if (!counterpart_exists) return type.pulse.toString() // If the non-different level counterpart does not exist, just use the pretty string

                            if (util.count(context, (p => p.different_level)) == 1) {
                                // Is the only different level
                                if (region_name.length > 0) return `${region_name},DL`
                                else return "DL"
                            } else return `${region_name}${type.pulse}DL`
                        }
                    }
                })()

                if (node.remaining_candidates.length == 1) return `${internal}: Sp. ${spotNumber(node.root.raw, node.remaining_candidates[0])}`
                else return internal
            }

            export function collect_parents(node: AugmentedScanTreeNode, include_node: boolean = true): AugmentedScanTreeNode[] {
                if (!node) return []

                let par = collect_parents(node.parent?.node, true)

                if (include_node) par.push(node)

                return par
            }

            export function traverse(tree: AugmentedScanTreeNode, f: (_: AugmentedScanTreeNode) => any, include_root: boolean = true): void {
                if (include_root && tree) f(tree)

                tree.children.forEach(c => traverse(c.value, f, true))
            }
        }
    }

    export function traverse(tree: ScanTreeNode, f: (_: ScanTreeNode) => void): void {
        if (tree) f(tree)

        tree.children.forEach(c => traverse(c.value, f))
    }

    export function init(clue: Clues.Scan): ScanTree {
        return {
            assumed_range: clue.range,
            ordered_spots: clue.spots,
            root: init_leaf()
        }
    }

    export function init_leaf(): ScanTreeNode {
        return {
            children: [],
            directions: "Missing directions",
            path: [],
        }
    }

    export function normalize(tree: ScanTree): ScanTree {
        function helper(node: ScanTreeNode, candidates: TileCoordinates[]) {
            let where = node.region?.area || TileRectangle.fromTile(Path.ends_up(node.path))

            // Update children to remove all dead branches and add missing branches
            let pruned_children: {
                child: {
                    key: PulseInformation,
                    value: ScanTreeNode
                },
                candidates: TileCoordinates[]
            }[] = !where ? []
                : spot_narrowing(candidates, where, tree.assumed_range)
                    .filter(n => n.narrowed_candidates.length > 0)  // Delete branches that have no candidates left
                    .map(({pulse, narrowed_candidates}) => {
                        return {
                            child: node.children.find(c => PulseInformation.equals(pulse, c.key)) || {
                                key: pulse,
                                value: init_leaf()
                            },
                            candidates: narrowed_candidates
                        }
                    })

            // When there is only one child, the current position produces no information at all
            // So there is no point in adding children, which is why they are removed by this statement
            if (pruned_children.length == 1) {
                pruned_children = []
            }

            node.children = pruned_children.map(c => c.child)

            pruned_children.forEach(({child, candidates}) => {
                // Propagate state recursively
                helper(child.value, candidates)
            })
        }

        if (!tree.root) tree.root = init_leaf()

        helper(tree.root, tree.ordered_spots)

        return tree
    }

    export function spotNumber(self: ScanTree.ScanTree, spot: TileCoordinates): number {
        return self.ordered_spots.findIndex((s) => Vector2.eq(s, spot)) + 1
    }

    export type ScanInformation = PulseInformation & {
        area: TileRectangle
    }
}