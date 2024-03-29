import {TypeUtil} from "../../../lib/util/type_util";
import {ClueTier} from "../../../lib/runescape/clues";

export namespace Settings {
  import Tuple = TypeUtil.Tuple;

  export type TeleportSettings = {
    potas: {
      color: PotaColor,
      slots: Tuple<{
        group_id: string,
        access_id: string
      }, 6>
    }[],
    presets: {
      id: number,
      fixed?: boolean,
      name: string,
      fairy_ring_favourites: string[],
      active_potas: PotaColor[]
    }[],
    active_preset: number,
    preset_bindings_active: boolean,
    preset_bindings: Record<ClueTier, number | null>
  }

  export namespace TeleportSettings {
    export function empty(): TeleportSettings {
      return {
        potas: [],
        presets: [{
          id: 0,
          fixed: true,
          name: "Default",
          fairy_ring_favourites: new Array(10).fill(null),
          active_potas: []
        }],
        active_preset: 0,
        preset_bindings: {
          easy: null, elite: null, hard: null, master: null, medium: null
        },
        preset_bindings_active: false
      }
    }

    export function clueChasersRecommendations(): TeleportSettings {
      return {
        "potas": [
          {
            "color": "red",
            "slots": [
              {
                "group_id": "skillsnecklace",
                "access_id": "ring"
              },
              {
                "group_id": "amuletofglory",
                "access_id": "necklace"
              },
              {
                "group_id": "combatbracelet",
                "access_id": "ring"
              },
              {
                "group_id": "digsitependant",
                "access_id": "ring"
              },
              {
                "group_id": "ringofslaying",
                "access_id": "ring"
              },
              {
                "group_id": "travellersnecklace",
                "access_id": "ring"
              }
            ]
          },
          {
            "color": "green",
            "slots": [
              {
                "group_id": "enlightenedamulet",
                "access_id": "ring"
              },
              {
                "group_id": "ringofrespawn",
                "access_id": "ring"
              },
              {
                "group_id": "ringofduelling",
                "access_id": "ring"
              },
              {
                "group_id": "gamesnecklace",
                "access_id": "necklace"
              },
              {
                "group_id": "ringofwealth",
                "access_id": "ring"
              },
              null
            ]
          }
        ],
        "presets": [
          {
            "id": 0,
            "fixed": true,
            "name": "Default",
            "fairy_ring_favourites": [
              null,
              null,
              null,
              null,
              null,
              null,
              null,
              null,
              null,
              null
            ],
            "active_potas": []
          },
          {
            "id": -1,
            "name": "Easy Recommendation",
            "active_potas": [
              "red",
              "green"
            ],
            "fairy_ring_favourites": [
              "AIQ",
              "DIS",
              "DJR",
              null,
              null,
              null,
              null,
              null,
              null,
              null
            ]
          },
          {
            "id": -2,
            "name": "Medium Recommendation",
            "active_potas": [
              "red",
              "green"
            ],
            "fairy_ring_favourites": [
              "AIQ",
              "AJR",
              "AKS",
              "ALS",
              "BKR",
              "CIP",
              "CKS",
              "CLS",
              "DJP",
              "DKP"
            ]
          },
          {
            "id": -3,
            "name": "Hard Recommendation",
            "active_potas": [],
            "fairy_ring_favourites": [
              "ALQ",
              "DKS",
              "DJP",
              "CKS",
              "CKR",
              "CJS",
              "BKR",
              "AKQ",
              "ALP",
              null
            ]
          },
          {
            "id": -4,
            "name": "Elite Recommendation",
            "active_potas": [
              "red",
              "green"
            ],
            "fairy_ring_favourites": [
              "AJR",
              "AKQ",
              "AKS",
              "ALQ",
              "BKR",
              "CJR",
              "CJS",
              "CKQ",
              "CKR",
              "DLQ"
            ]
          },
          {
            "id": -5,
            "name": "Master Recommendation",
            "active_potas": [
              "red"
            ],
            "fairy_ring_favourites": [
              null,
              null,
              null,
              null,
              null,
              null,
              null,
              null,
              null,
              null
            ]
          }
        ],
        "active_preset": 0,
        "preset_bindings": {
          "easy": -1,
          "elite": -2,
          "hard": -3,
          "master": -4,
          "medium": -5
        },
        "preset_bindings_active": false
      }
    }
  }


  export type PotaColor = typeof PotaColor.values[number]

  export namespace PotaColor {
    export const values = ["red", "green", "yellow", "purple"] as const

    export function iconUrl(color: PotaColor): string {
      return `assets/icons/teleports/pota_${color}.png`
    }
  }
}