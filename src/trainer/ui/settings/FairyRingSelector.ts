import {Transportation} from "../../../lib/runescape/transportation";
import {TransportData} from "../../../data/transports";
import {SearchSelection} from "../widgets/SearchSelection";
import {C} from "../../../lib/ui/constructors";
import span = C.span;


export class FairyRingSelector extends SearchSelection<Transportation.TeleportSpot> {

  constructor() {
    const group = TransportData.getTeleportGroup("fairyring")

    super({
      type_class: {
        toHTML: e => {
          if (e) return c(`<span><span style="font-weight: bold">${e.code}</span> - </span>`).append(span(e.name))
          else return span("None").css("font-style", "italic")
        },
      },
      search_term: e => e ? `${e.code} - ${e.name}` : "None"
    }, [null].concat(group.spots.filter(e => e.code && e.code.length > 0)));
  }
}

export class PotaJewellrySelector extends SearchSelection<{
  group: Transportation.TeleportGroup,
  access: Transportation.TeleportAccess
}> {
  constructor() {
    super({
      type_class: {
        toHTML: e => c()
      },
      search_term: e => ""
    }, []);
  }

}