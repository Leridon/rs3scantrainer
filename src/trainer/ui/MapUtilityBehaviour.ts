import Behaviour from "../../lib/ui/Behaviour";
import {Application} from "../application";
import UtilityLayer from "./devutilitylayer/UtilityLayer";


export default class MapUtilityBehaviour extends Behaviour {
  layer: UtilityLayer = null

  constructor(private app: Application) {
    super();
  }

  protected begin() {
    this.layer = new UtilityLayer()

    this.app.map.addGameLayer(this.layer)
  }

  protected end() {
    this.layer.remove()
    this.layer.clearLayers()
  }

}