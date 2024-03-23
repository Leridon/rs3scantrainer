import {type Pack} from "./model/MethodPackManager";

export const default_scan_method_pack: Pack = {
  type: "default",
  local_id: "default:scanmethods",
  original_id: "default:scanmethods",
  author: "Zyklop Marco",
  timestamp: 1700749105,
  name: "Default Scan Methods",
  description: "This default pack features standard scan routes based on the guide by Fiery and some other contributors.",
  default_method_name: "Default Scan Route",
  methods: [],
  default_assumptions: {
    double_escape: true,
    double_surge: true,
    meerkats_active: true,
    mobile_perk: true
  }
}

export const default_hard_paths: Pack = {
  "name": "Hard Clue Routes",
  "description": "This pack contains meta path ideas collected over the years from several sources.",
  "author": "Zyklop Marco",
  "default_assumptions": {"mobile_perk": true, "double_escape": true, "double_surge": true},
  "default_method_name": "Default Route",
  "type": "local",
  "local_id": "78e29a84-bc56-4653-8553-ed69dd48d6e0",
  "original_id": "78e29a84-bc56-4653-8553-ed69dd48d6e0",
  "timestamp": 1709593852,
  "methods": [{
    "id": "f936a773-5320-485e-8253-65cc9ce703f8",
    "type": "general_path",
    "timestamp": 1709592168,
    "name": "Default Route",
    "description": "",
    "assumptions": {"mobile_perk": true, "double_escape": true, "double_surge": true},
    "for": {"clue": 41},
    "post_path": [],
    "pre_path": [],
    "main_path": [{
      "type": "teleport",
      "spot": {"x": 2575, "y": 3089, "level": 0},
      "id": {"group": "normalspellbook", "spot": "watchtower-yanille", "access": "spellbook"}
    }, {
      "type": "run",
      "waypoints": [{"x": 2575, "y": 3089, "level": 0}, {"x": 2576, "y": 3089, "level": 0}, {"x": 2583, "y": 3096, "level": 0}, {"x": 2587, "y": 3096, "level": 0}]
    }, {"type": "ability", "ability": "surge", "from": {"x": 2587, "y": 3096, "level": 0}, "to": {"x": 2597, "y": 3096, "level": 0}}, {
      "type": "ability",
      "ability": "dive",
      "from": {"x": 2597, "y": 3096, "level": 0},
      "to": {"x": 2607, "y": 3086, "level": 0}
    }, {"type": "ability", "ability": "surge", "from": {"x": 2607, "y": 3086, "level": 0}, "to": {"x": 2615, "y": 3078, "level": 0}}],
    "expected_time": 11
  }, {
    "id": "4e474f9f-a731-4df1-a20c-73ef28f8a496",
    "type": "general_path",
    "timestamp": 1709593634,
    "name": "Default Route",
    "description": "",
    "assumptions": {"mobile_perk": true, "double_escape": true, "double_surge": true},
    "for": {"clue": 297},
    "post_path": [],
    "pre_path": [],
    "main_path": [{
      "type": "teleport",
      "spot": {"x": 2542, "y": 3169, "level": 0},
      "id": {"group": "spirittree", "spot": "village", "access": "spirittreererooter"}
    }, {
      "type": "run",
      "waypoints": [{"x": 2542, "y": 3169, "level": 0}, {"x": 2541, "y": 3168, "level": 0}, {"x": 2534, "y": 3168, "level": 0}, {"x": 2534, "y": 3167, "level": 0}]
    }, {"type": "ability", "ability": "dive", "from": {"x": 2534, "y": 3167, "level": 0}, "to": {"x": 2526, "y": 3161, "level": 0}}, {
      "type": "run",
      "waypoints": [{"x": 2526, "y": 3161, "level": 0}, {"x": 2526, "y": 3162, "level": 0}]
    }, {
      "type": "transport",
      "assumed_start": {"x": 2526, "y": 3162, "level": 0},
      "internal": {
        "type": "entity",
        "entity": {"name": "Ladder", "kind": "static"},
        "clickable_area": {"topleft": {"x": 2524.5, "y": 3162.5}, "botright": {"x": 2525.5, "y": 3161.5}, "level": 0},
        "actions": [{
          "cursor": "ladderup",
          "interactive_area": {"origin": {"x": 2526, "y": 3162, "level": 0}},
          "name": "Climb-up",
          "movement": [{time: 3, "offset": {"x": 0, "y": 0, "level": 1}, "orientation": "toentitybefore"}]
        }],
        "source_loc": 69499
      }
    }],
    "expected_time": 18
  }, {
    "id": "86cc874b-b248-4255-a99a-9d28648dcf00",
    "type": "general_path",
    "timestamp": 1709593785,
    "name": "Default Route",
    "description": "",
    "assumptions": {"mobile_perk": true, "double_escape": true, "double_surge": true},
    "for": {"clue": 293},
    "post_path": [],
    "pre_path": [],
    "main_path": [{
      "type": "teleport",
      "spot": {"x": 2800, "y": 3203, "level": 0},
      "id": {"group": "spirittree", "spot": "brimhaven", "access": "spirittreererooter"}
    }, {
      "type": "run",
      "waypoints": [{"x": 2800, "y": 3203, "level": 0}, {"x": 2800, "y": 3201, "level": 0}, {"x": 2802, "y": 3199, "level": 0}, {"x": 2802, "y": 3196, "level": 0}]
    }, {"type": "ability", "ability": "surge", "from": {"x": 2802, "y": 3196, "level": 0}, "to": {"x": 2802, "y": 3186, "level": 0}}, {
      "type": "ability",
      "ability": "dive",
      "from": {"x": 2802, "y": 3186, "level": 0},
      "to": {"x": 2809, "y": 3191, "level": 0}
    }],
    "expected_time": 13
  }, {
    "id": "bfef4562-5095-419b-9d93-d49ef95f6a26",
    "type": "general_path",
    "timestamp": 1709593852,
    "name": "Default Route",
    "description": "",
    "assumptions": {"mobile_perk": true, "double_escape": true, "double_surge": true},
    "for": {"clue": 174},
    "post_path": [],
    "pre_path": [],
    "main_path": [{
      "type": "teleport",
      "spot": {"x": 3212, "y": 3434, "level": 0},
      "id": {"group": "normalspellbook", "spot": "varrock", "access": "spellbook"}
    }, {"type": "ability", "ability": "dive", "from": {"x": 3212, "y": 3434, "level": 0}, "to": {"x": 3221, "y": 3435, "level": 0}}],
    "expected_time": 3
  }]
}

export const default_generic_method_pack: Pack = {
  type: "default",
  name: "Default Clue Paths",
  local_id: "default:genericmethods",
  original_id: "default:genericmethods",
  author: "Zyklop Marco",
  timestamp: 1700749105,
  description: "",
  default_method_name: "Default Route",
  methods: [],
  default_assumptions: {
    double_escape: true,
    double_surge: true,
    way_of_the_footshaped_key: true,
    full_globetrotter: true,
    meerkats_active: true,
    mobile_perk: true
  }
}