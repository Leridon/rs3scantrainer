import {ScanTree} from "../../../../lib/cluetheory/scans/ScanTree";
import * as leaflet from "leaflet";
import Widget from "../../../../lib/ui/Widget";
import {AugmentedMethod} from "../../../model/MethodPackManager";
import {Clues} from "../../../../lib/runescape/clues";
import BoundsBuilder from "../../../../lib/gamemap/BoundsBuilder";
import {Path} from "../../../../lib/runescape/pathing";
import {floor_t} from "../../../../lib/runescape/coordinates";
import {Rectangle} from "../../../../lib/math";
import {TileArea} from "../../../../lib/runescape/coordinates/TileArea";
import {ScanRegionPolygon} from "../ScanLayer";
import {PathStepEntity} from "../../map/entities/PathStepEntity";
import MethodSelector from "../MethodSelector";
import {Scans} from "../../../../lib/runescape/clues/scans";
import PulseButton, {PulseIcon} from "../PulseButton";
import NeoSolvingBehaviour from "../NeoSolvingBehaviour";
import {TemplateResolver} from "../../../../lib/util/TemplateResolver";
import {util} from "../../../../lib/util/util";
import {SolvingMethods} from "../../../model/methods";
import {NeoSolvingSubBehaviour} from "../NeoSolvingSubBehaviour";
import {C} from "../../../../lib/ui/constructors";
import {TextRendering} from "../../TextRendering";
import ScanTreeMethod = SolvingMethods.ScanTreeMethod;
import activate = TileArea.activate;
import AugmentedScanTree = ScanTree.Augmentation.AugmentedScanTree;
import cls = C.cls;
import Order = util.Order;
import span = C.span;
import spotNumber = ScanTree.spotNumber;

export class ScanTreeSolvingControl extends NeoSolvingSubBehaviour {
  node: ScanTree.Augmentation.AugmentedScanTreeNode = null
  augmented: ScanTree.Augmentation.AugmentedScanTree = null
  layer: leaflet.FeatureGroup = null

  tree_widget: Widget

  constructor(parent: NeoSolvingBehaviour, public method: AugmentedMethod<ScanTreeMethod, Clues.Scan>) {
    super(parent)

    this.augmented = ScanTree.Augmentation.basic_augmentation(method.method.tree, method.clue)
  }

  private fit() {
    let node = this.node

    let bounds = new BoundsBuilder()

    //1. If no children: All Candidates
    if (node.children.length == 0)
      node.remaining_candidates.forEach((c) => bounds.addTile(c))

    //2. All children that are leafs in the augmented tree (i.e. spots directly reached from here)
    /* //TODO: Rethink this, disabled to get the build working again
    this.node.get().children.filter(c => c.value.is_leaf)
        .map(c => c.value.remaining_candidates.map(Vector2.toPoint).forEach(spot => bounds.extend(spot)))

     */

    //4. "Where"
    if (node.region?.area) {
      bounds.addArea(node.region.area)
      bounds.addArea(node.region.area)
    }

    // 6. The path

    if (node.raw.path.length > 0) bounds.addRectangle(Path.bounds(node.raw.path))

    this.parent.layer.fit(bounds.get())
  }

  private renderLayer(): void {
    let node = this.node

    this.layer.clearLayers()

    let pos = node.region
      ? activate(node.region.area).center()
      : Path.ends_up(node.raw.path)

    if (pos) {
      this.parent.layer.getMap().floor.set(pos.level)
    } else {
      this.parent.layer.getMap().floor.set(Math.min(...node.remaining_candidates.map((c) => c.level)) as floor_t)
    }

    if (pos && node.remaining_candidates.length > 1
      && !(node.region && node.region.area && Rectangle.width(TileArea.toRect(node.region.area)) > this.method.method.tree.assumed_range * 2)) {
      this.parent.layer.scan_layer.marker.setFixedSpot(pos)
    } else {
      this.parent.layer.scan_layer.marker.setFixedSpot(null)
    }

    this.parent.layer.scan_layer.setActiveCandidates(node.remaining_candidates)

    new ScanRegionPolygon(ScanTree.getTargetRegion(node)).setOpacity(1).addTo(this.layer)

    AugmentedScanTree.collect_parents(node, false).forEach(n => {
      new ScanRegionPolygon(ScanTree.getTargetRegion(n)).setOpacity(0.5).addTo(this.layer)
      PathStepEntity.renderPath(n.raw.path).eachEntity(e => e.setOpacity(0.5)).addTo(this.layer)
    })

    // Children pathsare rendered with 0.5
    node.children
      .filter(c => c.key.pulse != 3)
      .forEach(c => {
        PathStepEntity.renderPath(c.value.raw.path).eachEntity(l => l.setOpacity(0.5)).addTo(this.layer)
        new ScanRegionPolygon(ScanTree.getTargetRegion(c.value)).setOpacity(0.5).addTo(this.layer)
      })
  }

  setNode(node: ScanTree.Augmentation.AugmentedScanTreeNode) {
    this.node = node

    this.tree_widget.empty()

    this.parent.path_control.reset().setPath(node.raw.path)

    this.fit()
    this.renderLayer()

    {
      new MethodSelector(this.parent, this.method.method.for)
        .addClass("ctr-neosolving-solution-row")
        .appendTo(this.tree_widget)
    }

    let content = cls("ctr-neosolving-solution-row").appendTo(this.tree_widget)

    {
      let ui_nav = c()

      let list = c("<ol class='breadcrumb' style='margin-bottom: unset'></ol>").appendTo(ui_nav)

      AugmentedScanTree.collect_parents(node)
        .map(n =>
          c("<span class='nisl-textlink'>")
            .on("click", () => this.setNode(n))
            .text(AugmentedScanTree.decision_string(n))
        ).forEach(w => w.appendTo(c("<li>").addClass("breadcrumb-item").appendTo(list)))

      let last = list.container.children().last()

      last.text(last.children().first().text()).addClass("active")

      content.append(ui_nav)
    }

    content.append(cls('ctr-neosolving-nextscanstep')
      .append(
        "Next: ",
        ...this.parent.app.template_resolver.with(...ScanTreeSolvingControl.scan_tree_template_resolvers(node))
          .resolve(ScanTree.getInstruction(node)))
    )

    {

      let triples = node.children.filter(e => e.key.pulse == 3)

      node.children
        .filter((e) => triples.length <= 1 || e.key.pulse != 3)
        .sort(Order.comap(Scans.Pulse.compare, (a) => a.key))
        .forEach((child) => {
          const resolvers = this.parent.app.template_resolver.with(...ScanTreeSolvingControl.scan_tree_template_resolvers(child.value))

          cls("ctr-neosolving-scantreeline")
            .append(
              PulseButton.forPulse(child.key, node.children.map(c => c.key))
                .onClick(() => {
                  this.setNode(child.value)
                }),
              c().append(...resolvers.resolve(
                ScanTree.getInstruction(child.value)
              ))
            ).appendTo(content)
        })

      if (triples.length > 1) {
        cls("ctr-neosolving-scantreeline")
          .append(
            c().append( // Wrap in another div to allow another margin
              new PulseIcon({different_level: false, pulse: 3}, null)
                .css("margin", "1px")
            ),
            span("at"),
            ...triples
              .sort(Order.comap(Order.natural_order, (c) => spotNumber(node.root.raw, c.value.remaining_candidates[0])))
              .map((child) =>
                PulseButton.forSpot(spotNumber(node.root.raw, child.value.remaining_candidates[0]))
                  .onClick(() => this.setNode(child.value))
              )
          ).appendTo(content)
      }
    }
  }

  protected begin() {
    this.tree_widget = c().appendTo(this.parent.layer.scantree_container)
    this.layer = leaflet.featureGroup().addTo(this.parent.layer.scan_layer)

    this.setNode(this.augmented.root_node)
  }

  protected end() {
    this.tree_widget.remove()
    this.tree_widget = null

    if (this.layer) {
      this.layer.remove()
      this.layer = null
    }
  }
}

export namespace ScanTreeSolvingControl {
  import AugmentedScanTreeNode = ScanTree.Augmentation.AugmentedScanTreeNode;
  import shorten_integer_list = util.shorten_integer_list;
  import render_digspot = TextRendering.render_digspot;
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
}
