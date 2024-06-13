import Widget from "../../../../lib/ui/Widget";
import {ProcessedCacheTypes} from "./ProcessedCacheTypes";
import * as fuzzysort from "fuzzysort";
import TextField from "../../../../lib/ui/controls/TextField";
import Properties from "../../widgets/Properties";
import {C} from "../../../../lib/ui/constructors";
import {CursorType} from "../../../../lib/runescape/CursorType";
import Prototype = ProcessedCacheTypes.Prototype;
import vbox = C.vbox;
import hboxl = C.hboxl;
import inlineimg = C.inlineimg;

class PreparedSearch<T> {

  private prepared_items: { item: T, term: Fuzzysort.Prepared }[]

  constructor(items: T[], search_term: (_: T) => string) {

    this.prepared_items = items.map(i => {
      return {item: i, term: fuzzysort.prepare(search_term(i))}
    })
  }

  do(term: string,
     limit: number = undefined
  ): T[] {
    let results = fuzzysort.go(term, this.prepared_items, {
      key: "term",
      all: true,
      threshold: -10000,
      limit: limit
    })

    return results.map(i => i.obj.item)
  }
}

export class PrototypeProperties extends Properties {

  constructor(prototype: Prototype) {
    super()

    this.header(PrototypeProperties.renderName(prototype))
    this.named("Id", prototype.id[1].toString())
    this.named("Size", `${prototype.size.x}x${prototype.size.y}`)

    this.named("Actions", vbox(
      ...prototype.actions.map(action =>
        hboxl(inlineimg(CursorType.meta(action[1]).icon_url), C.space(), action[0], C.space(), `(${action[2]})`)
      )
    ))

  }
}

namespace PrototypeProperties {
  import staticentity = C.staticentity;
  import npc = C.npc;

  export function renderName(prototype: Prototype): Widget {
    if (Prototype.isLoc(prototype)) {
      return staticentity(prototype.name)
    } else {
      return npc(prototype.name)
    }
  }
}

export class PrototypeExplorer extends Widget {

  private index: PreparedSearch<Prototype>
  private result_area: Widget
  private search_field: TextField

  constructor(prototypes: Prototype[]) {
    super();

    this.search_field = new TextField().setPlaceholder("Search...")
      .onPreview(term =>
        this.update(term)
      ).appendTo(this)

    this.result_area = c().appendTo(this)
      .css("max-height", "600px")
      .css("overflow-y", "scroll")

    this.setPrototypes(prototypes)
  }

  setPrototypes(prototypes: Prototype[]) {
    this.index = new PreparedSearch(prototypes, p => p.name + p.actions.map(a => a[0]).join())

    this.update(this.search_field.get())
  }

  private update(term: string) {
    const results = this.index.do(term, 200)

    console.log(`${results.length} items`)

    this.result_area.empty()

    results.forEach(prototype => {
      new PrototypeExplorer.PrototypeSearchResult(prototype)
        .appendTo(this.result_area)
    })
  }
}

export namespace PrototypeExplorer {

  import hboxl = C.hboxl;

  export class PrototypeSearchResult extends Widget {
    constructor(prototype: Prototype) {
      super();

      this.append(hboxl(PrototypeProperties.renderName(prototype), C.space(), `(${prototype.size.x}x${prototype.size.y})`))

      this.addTippy(new PrototypeProperties(prototype), {
        placement: "bottom",
      })
    }
  }
}