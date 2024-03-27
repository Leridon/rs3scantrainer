import {type Pack} from "./model/MethodPackManager";

export const default_scan_method_pack: Pack = {
  type: "default",
  local_id: "default:scanmethods",
  original_id: "default:scanmethods",
  author: "Zyklop Marco",
  timestamp: 1711572121,
  name: "Default Scan Methods",
  description: "This default pack features standard scan routes based on the guide by Fiery and some other contributors.",
  default_method_name: "Default Scan Route",
  methods:
    [
      {
        "id": "ae666278-8ec6-4073-8e7a-8835bd1af082",
        "type": "scantree",
        "timestamp": 1711473111,
        "name": "Default Scan Route",
        "description": "",
        "assumptions": {"meerkats_active": true, "double_surge": true, "double_escape": true, "mobile_perk": true},
        "for": {"clue": 364},
        "tree": {
          "assumed_range": 27,
          "ordered_spots": [{"x": 2938, "y": 3322, "level": 0}, {"x": 2976, "y": 3316, "level": 0}, {"x": 2947, "y": 3316, "level": 0}, {"x": 3005, "y": 3326, "level": 0}, {
            "x": 2958,
            "y": 3379,
            "level": 0
          }, {"x": 2972, "y": 3342, "level": 0}, {"x": 2945, "y": 3339, "level": 0}, {"x": 2948, "y": 3390, "level": 0}, {"x": 2942, "y": 3388, "level": 0}, {
            "x": 2939,
            "y": 3355,
            "level": 0
          }, {"x": 3039, "y": 3331, "level": 0}, {"x": 3050, "y": 3348, "level": 0}, {"x": 3015, "y": 3339, "level": 0}, {"x": 3027, "y": 3365, "level": 0}, {
            "x": 3025,
            "y": 3379,
            "level": 0
          }, {"x": 3059, "y": 3384, "level": 0}, {"x": 3031, "y": 3379, "level": 0}, {"x": 3011, "y": 3382, "level": 0}],
          "root": {
            "children": [{
              "key": {"pulse": 1, "different_level": false}, "value": {
                "children": [{
                  "key": {"pulse": 1, "different_level": false}, "value": {
                    "children": [{
                      "key": {"pulse": 2, "different_level": false}, "value": {
                        "children": [{
                          "key": {"pulse": 2, "different_level": false}, "value": {
                            "children": [{
                              "key": {"pulse": 2, "different_level": false},
                              "value": {
                                "children": [],
                                "directions": "",
                                "path": [{"type": "ability", "ability": "surge", "from": {"x": 3042, "y": 3355, "level": 0}, "to": {"x": 3052, "y": 3365, "level": 0}}, {
                                  "type": "run",
                                  "waypoints": [{"x": 3052, "y": 3365, "level": 0}, {"x": 3052, "y": 3366, "level": 0}, {"x": 3056, "y": 3370, "level": 0}, {
                                    "x": 3056,
                                    "y": 3382,
                                    "level": 0
                                  }, {"x": 3057, "y": 3383, "level": 0}, {"x": 3058, "y": 3383, "level": 0}, {"x": 3059, "y": 3384, "level": 0}]
                                }]
                              }
                            }, {
                              "key": {"pulse": 3, "different_level": false, "spot": {"x": 3025, "y": 3379, "level": 0}},
                              "value": {
                                "children": [],
                                "directions": "",
                                "path": [{
                                  "type": "teleport",
                                  "spot": {"x": 3005, "y": 3375, "level": 0},
                                  "id": {"group": "amuletofnature", "spot": "faladortree", "access": "cape"}
                                }, {"type": "run", "waypoints": [{"x": 3005, "y": 3375, "level": 0}, {"x": 3007, "y": 3375, "level": 0}]}, {
                                  "type": "ability",
                                  "ability": "surge",
                                  "from": {"x": 3007, "y": 3375, "level": 0},
                                  "to": {"x": 3017, "y": 3375, "level": 0}
                                }, {"type": "run", "waypoints": [{"x": 3017, "y": 3375, "level": 0}, {"x": 3021, "y": 3375, "level": 0}, {"x": 3025, "y": 3379, "level": 0}]}]
                              }
                            }, {
                              "key": {"pulse": 3, "different_level": false, "spot": {"x": 3031, "y": 3379, "level": 0}},
                              "value": {
                                "children": [],
                                "directions": "",
                                "path": [{"type": "run", "waypoints": [{"x": 3042, "y": 3355, "level": 0}, {"x": 3040, "y": 3357, "level": 0}]}, {
                                  "type": "ability",
                                  "ability": "surge",
                                  "from": {"x": 3040, "y": 3357, "level": 0},
                                  "to": {"x": 3030, "y": 3367, "level": 0}
                                }, {
                                  "type": "run",
                                  "waypoints": [{"x": 3030, "y": 3367, "level": 0}, {"x": 3030, "y": 3372, "level": 0}, {"x": 3032, "y": 3374, "level": 0}, {
                                    "x": 3032,
                                    "y": 3378,
                                    "level": 0
                                  }, {"x": 3031, "y": 3379, "level": 0}]
                                }]
                              }
                            }],
                            "directions": "",
                            "path": [{"type": "ability", "ability": "surge", "from": {"x": 3024, "y": 3337, "level": 0}, "to": {"x": 3032, "y": 3345, "level": 0}}, {
                              "type": "ability",
                              "ability": "dive",
                              "from": {"x": 3032, "y": 3345, "level": 0},
                              "to": {"x": 3042, "y": 3355, "level": 0}
                            }]
                          }
                        }, {
                          "key": {"pulse": 3, "different_level": false, "spot": {"x": 3050, "y": 3348, "level": 0}},
                          "value": {
                            "children": [],
                            "directions": "",
                            "path": [{"type": "ability", "ability": "surge", "from": {"x": 3024, "y": 3337, "level": 0}, "to": {"x": 3032, "y": 3345, "level": 0}}, {
                              "type": "ability",
                              "ability": "surge",
                              "from": {"x": 3032, "y": 3345, "level": 0},
                              "to": {"x": 3042, "y": 3355, "level": 0}
                            }, {"type": "ability", "ability": "dive", "from": {"x": 3042, "y": 3355, "level": 0}, "to": {"x": 3049, "y": 3348, "level": 0}}]
                          }
                        }],
                        "directions": "",
                        "path": [{"type": "run", "waypoints": [{"x": 3016, "y": 3338, "level": 0}, {"x": 3018, "y": 3336, "level": 0}]}, {
                          "type": "run",
                          "waypoints": [{"x": 3018, "y": 3336, "level": 0}, {"x": 3023, "y": 3336, "level": 0}, {"x": 3024, "y": 3337, "level": 0}]
                        }]
                      }
                    }, {
                      "key": {"pulse": 3, "different_level": false, "spot": {"x": 3039, "y": 3331, "level": 0}},
                      "value": {
                        "children": [],
                        "directions": "",
                        "path": [{
                          "type": "run",
                          "waypoints": [{"x": 3016, "y": 3338, "level": 0}, {"x": 3017, "y": 3338, "level": 0}, {"x": 3018, "y": 3337, "level": 0}, {"x": 3019, "y": 3337, "level": 0}]
                        }, {"type": "ability", "ability": "surge", "from": {"x": 3019, "y": 3337, "level": 0}, "to": {"x": 3029, "y": 3337, "level": 0}}, {
                          "type": "ability",
                          "ability": "dive",
                          "from": {"x": 3029, "y": 3337, "level": 0},
                          "to": {"x": 3039, "y": 3331, "level": 0}
                        }]
                      }
                    }, {
                      "key": {"pulse": 3, "different_level": false, "spot": {"x": 3027, "y": 3365, "level": 0}},
                      "value": {
                        "children": [],
                        "directions": "",
                        "path": [{"type": "run", "waypoints": [{"x": 3016, "y": 3338, "level": 0}, {"x": 3018, "y": 3336, "level": 0}]}, {
                          "type": "run",
                          "waypoints": [{"x": 3018, "y": 3336, "level": 0}, {"x": 3023, "y": 3336, "level": 0}, {"x": 3024, "y": 3337, "level": 0}]
                        }, {"type": "ability", "ability": "surge", "from": {"x": 3024, "y": 3337, "level": 0}, "to": {"x": 3032, "y": 3345, "level": 0}}, {
                          "type": "run",
                          "waypoints": [{"x": 3032, "y": 3345, "level": 0}, {"x": 3032, "y": 3347, "level": 0}]
                        }, {"type": "ability", "ability": "surge", "from": {"x": 3032, "y": 3347, "level": 0}, "to": {"x": 3032, "y": 3357, "level": 0}}, {
                          "type": "ability",
                          "ability": "dive",
                          "from": {"x": 3032, "y": 3357, "level": 0},
                          "to": {"x": 3027, "y": 3365, "level": 0}
                        }]
                      }
                    }],
                    "directions": "",
                    "path": [{"type": "teleport", "spot": {"x": 3016, "y": 3338, "level": 0}, "id": {"group": "skillsnecklace", "spot": "mining", "access": "ring"}}]
                  }
                }, {
                  "key": {"pulse": 2, "different_level": false}, "value": {
                    "children": [{
                      "key": {"pulse": 2, "different_level": false},
                      "value": {
                        "children": [],
                        "directions": "",
                        "path": [{
                          "type": "run",
                          "waypoints": [{"x": 2942, "y": 3332, "level": 0}, {"x": 2943, "y": 3331, "level": 0}, {"x": 2947, "y": 3331, "level": 0}, {
                            "x": 2947,
                            "y": 3329,
                            "level": 0
                          }, {"x": 2958, "y": 3318, "level": 0}, {"x": 2959, "y": 3318, "level": 0}, {"x": 2960, "y": 3317, "level": 0}, {"x": 2966, "y": 3317, "level": 0}]
                        }, {"type": "ability", "ability": "surge", "from": {"x": 2966, "y": 3317, "level": 0}, "to": {"x": 2976, "y": 3317, "level": 0}}]
                      }
                    }, {
                      "key": {"pulse": 3, "different_level": false, "spot": {"x": 2938, "y": 3322, "level": 0}},
                      "value": {
                        "children": [],
                        "directions": "",
                        "path": [{"type": "run", "waypoints": [{"x": 2942, "y": 3332, "level": 0}, {"x": 2942, "y": 3326, "level": 0}, {"x": 2938, "y": 3322, "level": 0}]}]
                      }
                    }, {
                      "key": {"pulse": 3, "different_level": false, "spot": {"x": 2947, "y": 3316, "level": 0}},
                      "value": {
                        "children": [],
                        "directions": "",
                        "path": [{"type": "run", "waypoints": [{"x": 2942, "y": 3332, "level": 0}, {"x": 2942, "y": 3321, "level": 0}, {"x": 2947, "y": 3316, "level": 0}]}]
                      }
                    }],
                    "directions": "",
                    "path": [{"type": "ability", "ability": "surge", "from": {"x": 2962, "y": 3366, "level": 0}, "to": {"x": 2952, "y": 3356, "level": 0}}, {
                      "type": "ability",
                      "ability": "dive",
                      "from": {"x": 2952, "y": 3356, "level": 0},
                      "to": {"x": 2942, "y": 3346, "level": 0}
                    }, {"type": "run", "waypoints": [{"x": 2942, "y": 3346, "level": 0}, {"x": 2942, "y": 3342, "level": 0}]}, {
                      "type": "ability",
                      "ability": "surge",
                      "from": {"x": 2942, "y": 3342, "level": 0},
                      "to": {"x": 2942, "y": 3332, "level": 0}
                    }]
                  }
                }],
                "directions": "",
                "path": [{"type": "run", "waypoints": [{"x": 2965, "y": 3378, "level": 0}, {"x": 2965, "y": 3369, "level": 0}, {"x": 2962, "y": 3366, "level": 0}]}]
              }
            }, {
              "key": {"pulse": 2, "different_level": false}, "value": {
                "children": [{
                  "key": {"pulse": 2, "different_level": false}, "value": {
                    "children": [{
                      "key": {"pulse": 1, "different_level": false},
                      "value": {
                        "children": [],
                        "directions": "",
                        "path": [{"type": "teleport", "spot": {"x": 3016, "y": 3338, "level": 0}, "id": {"group": "skillsnecklace", "spot": "mining", "access": "ring"}}]
                      }
                    }, {
                      "key": {"pulse": 2, "different_level": false}, "value": {
                        "children": [{
                          "key": {"pulse": 1, "different_level": false},
                          "value": {
                            "children": [],
                            "directions": "",
                            "path": [{
                              "type": "teleport",
                              "spot": {"x": 3005, "y": 3375, "level": 0},
                              "id": {"group": "amuletofnature", "spot": "faladortree", "access": "cape"}
                            }, {"type": "ability", "ability": "dive", "from": {"x": 3005, "y": 3375, "level": 0}, "to": {"x": 3011, "y": 3382, "level": 0}}]
                          }
                        }, {
                          "key": {"pulse": 2, "different_level": false}, "value": {
                            "children": [{
                              "key": {"pulse": 1, "different_level": false},
                              "value": {
                                "children": [],
                                "directions": "",
                                "path": [{
                                  "type": "teleport",
                                  "spot": {"x": 3006, "y": 3319, "level": 0},
                                  "id": {"group": "davesspellbook", "spot": "falador", "access": "spellbook"}
                                }, {"type": "ability", "ability": "dive", "from": {"x": 3006, "y": 3319, "level": 0}, "to": {"x": 3006, "y": 3326, "level": 0}}]
                              }
                            }, {
                              "key": {"pulse": 2, "different_level": false},
                              "value": {
                                "children": [],
                                "directions": "",
                                "path": [{
                                  "type": "ability",
                                  "ability": "surge",
                                  "from": {"x": 2950, "y": 3361, "level": 0},
                                  "to": {"x": 2940, "y": 3351, "level": 0}
                                }, {"type": "ability", "ability": "dive", "from": {"x": 2940, "y": 3351, "level": 0}, "to": {"x": 2940, "y": 3341, "level": 0}}, {
                                  "type": "run",
                                  "waypoints": [{"x": 2940, "y": 3341, "level": 0}, {"x": 2940, "y": 3337, "level": 0}]
                                }, {"type": "ability", "ability": "surge", "from": {"x": 2940, "y": 3337, "level": 0}, "to": {"x": 2940, "y": 3327, "level": 0}}, {
                                  "type": "run",
                                  "waypoints": [{"x": 2940, "y": 3327, "level": 0}, {"x": 2940, "y": 3324, "level": 0}, {"x": 2939, "y": 3323, "level": 0}]
                                }]
                              }
                            }],
                            "directions": "",
                            "path": [{"type": "run", "waypoints": [{"x": 2956, "y": 3365, "level": 0}, {"x": 2954, "y": 3365, "level": 0}, {"x": 2950, "y": 3361, "level": 0}]}]
                          }
                        }], "directions": "", "path": [{"type": "run", "waypoints": [{"x": 2960, "y": 3365, "level": 0}, {"x": 2956, "y": 3365, "level": 0}]}]
                      }
                    }],
                    "directions": "",
                    "path": [{"type": "run", "waypoints": [{"x": 2962, "y": 3366, "level": 0}, {"x": 2961, "y": 3365, "level": 0}, {"x": 2960, "y": 3365, "level": 0}]}]
                  }
                }, {
                  "key": {"pulse": 3, "different_level": false, "spot": {"x": 2972, "y": 3342, "level": 0}},
                  "value": {
                    "children": [],
                    "directions": "",
                    "path": [{
                      "type": "run",
                      "waypoints": [{"x": 2962, "y": 3366, "level": 0}, {"x": 2964, "y": 3366, "level": 0}, {"x": 2964, "y": 3364, "level": 0}]
                    }, {"type": "ability", "ability": "surge", "from": {"x": 2964, "y": 3364, "level": 0}, "to": {"x": 2964, "y": 3354, "level": 0}}, {
                      "type": "ability",
                      "ability": "surge",
                      "from": {"x": 2964, "y": 3354, "level": 0},
                      "to": {"x": 2964, "y": 3344, "level": 0}
                    }, {"type": "ability", "ability": "dive", "from": {"x": 2964, "y": 3344, "level": 0}, "to": {"x": 2972, "y": 3342, "level": 0}}]
                  }
                }, {
                  "key": {"pulse": 3, "different_level": false, "spot": {"x": 2945, "y": 3339, "level": 0}},
                  "value": {
                    "children": [],
                    "directions": "",
                    "path": [{"type": "ability", "ability": "surge", "from": {"x": 2962, "y": 3366, "level": 0}, "to": {"x": 2952, "y": 3356, "level": 0}}, {
                      "type": "ability",
                      "ability": "surge",
                      "from": {"x": 2952, "y": 3356, "level": 0},
                      "to": {"x": 2942, "y": 3346, "level": 0}
                    }, {"type": "ability", "ability": "dive", "from": {"x": 2942, "y": 3346, "level": 0}, "to": {"x": 2945, "y": 3339, "level": 0}}]
                  }
                }, {
                  "key": {"pulse": 3, "different_level": false, "spot": {"x": 2939, "y": 3355, "level": 0}},
                  "value": {
                    "children": [],
                    "directions": "",
                    "path": [{"type": "ability", "ability": "surge", "from": {"x": 2962, "y": 3366, "level": 0}, "to": {"x": 2952, "y": 3356, "level": 0}}, {
                      "type": "ability",
                      "ability": "dive",
                      "from": {"x": 2952, "y": 3356, "level": 0},
                      "to": {"x": 2942, "y": 3356, "level": 0}
                    }, {"type": "run", "waypoints": [{"x": 2942, "y": 3356, "level": 0}, {"x": 2940, "y": 3356, "level": 0}]}]
                  }
                }],
                "directions": "",
                "path": [{"type": "run", "waypoints": [{"x": 2965, "y": 3378, "level": 0}, {"x": 2965, "y": 3369, "level": 0}, {"x": 2962, "y": 3366, "level": 0}]}]
              }
            }, {
              "key": {"pulse": 3, "different_level": false, "spot": {"x": 2958, "y": 3379, "level": 0}},
              "value": {
                "children": [],
                "directions": "",
                "path": [{"type": "ability", "ability": "dive", "from": {"x": 2965, "y": 3378, "level": 0}, "to": {"x": 2958, "y": 3379, "level": 0}}]
              }
            }, {
              "key": {"pulse": 3, "different_level": false, "spot": {"x": 2948, "y": 3390, "level": 0}},
              "value": {
                "children": [],
                "directions": "",
                "path": [{
                  "type": "run",
                  "waypoints": [{"x": 2965, "y": 3378, "level": 0}, {"x": 2959, "y": 3378, "level": 0}, {"x": 2958, "y": 3379, "level": 0}, {"x": 2957, "y": 3379, "level": 0}]
                }, {"type": "ability", "ability": "dive", "from": {"x": 2957, "y": 3379, "level": 0}, "to": {"x": 2947, "y": 3389, "level": 0}}]
              }
            }, {
              "key": {"pulse": 3, "different_level": false, "spot": {"x": 2942, "y": 3388, "level": 0}},
              "value": {
                "children": [],
                "directions": "",
                "path": [{"type": "run", "waypoints": [{"x": 2965, "y": 3378, "level": 0}, {"x": 2961, "y": 3374, "level": 0}]}, {
                  "type": "ability",
                  "ability": "dive",
                  "from": {"x": 2961, "y": 3374, "level": 0},
                  "to": {"x": 2953, "y": 3379, "level": 0}
                }, {"type": "ability", "ability": "surge", "from": {"x": 2953, "y": 3379, "level": 0}, "to": {"x": 2943, "y": 3389, "level": 0}}]
              }
            }, {
              "key": {"pulse": 3, "different_level": false, "spot": {"x": 2939, "y": 3355, "level": 0}},
              "value": {
                "children": [],
                "directions": "",
                "path": [{"type": "ability", "ability": "dive", "from": {"x": 2965, "y": 3378, "level": 0}, "to": {"x": 2962, "y": 3371, "level": 0}}, {
                  "type": "ability",
                  "ability": "surge",
                  "from": {"x": 2962, "y": 3371, "level": 0},
                  "to": {"x": 2952, "y": 3361, "level": 0}
                }, {"type": "ability", "ability": "surge", "from": {"x": 2952, "y": 3361, "level": 0}, "to": {"x": 2942, "y": 3351, "level": 0}}, {
                  "type": "run",
                  "waypoints": [{"x": 2942, "y": 3351, "level": 0}, {"x": 2942, "y": 3352, "level": 0}, {"x": 2939, "y": 3355, "level": 0}]
                }]
              }
            }],
            "directions": "",
            "path": [{"type": "teleport", "spot": {"x": 2965, "y": 3378, "level": 0}, "id": {"group": "normalspellbook", "spot": "falador", "access": "spellbook"}}]
          }
        },
        "expected_time": 21.083333333333332
      }, {
      "id": "c48f1b82-87bb-483d-b5b8-97b1cedb1616",
      "type": "scantree",
      "timestamp": 1711533402,
      "name": "Default Scan Route",
      "description": "",
      "assumptions": {"meerkats_active": true, "double_surge": true, "double_escape": true, "mobile_perk": true},
      "for": {"clue": 359},
      "tree": {
        "assumed_range": 16,
        "ordered_spots": [{"x": 3534, "y": 3470, "level": 0}, {"x": 3523, "y": 3460, "level": 0}, {"x": 3551, "y": 3514, "level": 0}, {"x": 3575, "y": 3511, "level": 0}, {
          "x": 3562,
          "y": 3509,
          "level": 0
        }, {"x": 3583, "y": 3484, "level": 0}, {"x": 3583, "y": 3466, "level": 0}, {"x": 3552, "y": 3483, "level": 0}, {"x": 3573, "y": 3484, "level": 0}, {
          "x": 3529,
          "y": 3501,
          "level": 0
        }, {"x": 3544, "y": 3465, "level": 0}, {"x": 3567, "y": 3475, "level": 0}, {"x": 3609, "y": 3499, "level": 0}, {"x": 3596, "y": 3501, "level": 0}, {
          "x": 3637,
          "y": 3486,
          "level": 0
        }, {"x": 3623, "y": 3476, "level": 0}, {"x": 3604, "y": 3507, "level": 0}, {"x": 3624, "y": 3508, "level": 0}, {"x": 3616, "y": 3512, "level": 0}, {
          "x": 3606,
          "y": 3465,
          "level": 0
        }, {"x": 3590, "y": 3475, "level": 0}],
        "root": {
          "children": [{
            "key": {"pulse": 1, "different_level": false}, "value": {
              "children": [{
                "key": {"pulse": 1, "different_level": false}, "value": {
                  "children": [{
                    "key": {"pulse": 1, "different_level": false}, "value": {
                      "children": [{
                        "key": {"pulse": 1, "different_level": false}, "value": {
                          "children": [{
                            "key": {"pulse": 1, "different_level": false},
                            "value": {
                              "children": [],
                              "directions": "",
                              "path": [{
                                "type": "teleport",
                                "spot": {"x": 3597, "y": 3495, "level": 0},
                                "id": {"group": "fairyring", "spot": "ALQ", "access": "portable_fairy_ring"}
                              }, {"type": "run", "waypoints": [{"x": 3597, "y": 3495, "level": 0}, {"x": 3599, "y": 3493, "level": 0}]}, {
                                "type": "ability",
                                "ability": "surge",
                                "from": {"x": 3599, "y": 3493, "level": 0},
                                "to": {"x": 3609, "y": 3483, "level": 0}
                              }, {
                                "type": "run",
                                "waypoints": [{"x": 3609, "y": 3483, "level": 0}, {"x": 3613, "y": 3483, "level": 0}, {"x": 3615, "y": 3485, "level": 0}, {
                                  "x": 3616,
                                  "y": 3485,
                                  "level": 0
                                }]
                              }, {"type": "ability", "ability": "surge", "from": {"x": 3616, "y": 3485, "level": 0}, "to": {"x": 3626, "y": 3485, "level": 0}}, {
                                "type": "ability",
                                "ability": "dive",
                                "from": {"x": 3626, "y": 3485, "level": 0},
                                "to": {"x": 3636, "y": 3487, "level": 0}
                              }]
                            }
                          }, {
                            "key": {"pulse": 2, "different_level": false},
                            "value": {
                              "children": [],
                              "directions": "",
                              "path": [{
                                "type": "run",
                                "waypoints": [{"x": 3554, "y": 3474, "level": 0}, {"x": 3551, "y": 3474, "level": 0}, {"x": 3550, "y": 3473, "level": 0}, {
                                  "x": 3548,
                                  "y": 3473,
                                  "level": 0
                                }]
                              }, {"type": "run", "waypoints": [{"x": 3548, "y": 3473, "level": 0}, {"x": 3544, "y": 3473, "level": 0}]}, {
                                "type": "ability",
                                "ability": "surge",
                                "from": {"x": 3544, "y": 3473, "level": 0},
                                "to": {"x": 3534, "y": 3473, "level": 0}
                              }, {"type": "run", "waypoints": [{"x": 3534, "y": 3473, "level": 0}, {"x": 3533, "y": 3472, "level": 0}]}, {
                                "type": "ability",
                                "ability": "surge",
                                "from": {"x": 3533, "y": 3472, "level": 0},
                                "to": {"x": 3523, "y": 3462, "level": 0}
                              }, {"type": "run", "waypoints": [{"x": 3523, "y": 3462, "level": 0}, {"x": 3523, "y": 3460, "level": 0}]}]
                            }
                          }], "directions": "", "path": [{"type": "run", "waypoints": [{"x": 3558, "y": 3474, "level": 0}, {"x": 3554, "y": 3474, "level": 0}]}]
                        }
                      }, {
                        "key": {"pulse": 2, "different_level": false}, "value": {
                          "children": [{
                            "key": {"pulse": 2, "different_level": false},
                            "value": {
                              "children": [],
                              "directions": "",
                              "path": [{
                                "type": "run",
                                "waypoints": [{"x": 3550, "y": 3473, "level": 0}, {"x": 3545, "y": 3473, "level": 0}, {"x": 3542, "y": 3470, "level": 0}, {
                                  "x": 3540,
                                  "y": 3470,
                                  "level": 0
                                }, {"x": 3539, "y": 3471, "level": 0}]
                              }, {"type": "ability", "ability": "surge", "from": {"x": 3539, "y": 3471, "level": 0}, "to": {"x": 3529, "y": 3481, "level": 0}}, {
                                "type": "run",
                                "waypoints": [{"x": 3529, "y": 3481, "level": 0}, {"x": 3529, "y": 3485, "level": 0}]
                              }, {"type": "ability", "ability": "surge", "from": {"x": 3529, "y": 3485, "level": 0}, "to": {"x": 3529, "y": 3495, "level": 0}}, {
                                "type": "run",
                                "waypoints": [{"x": 3529, "y": 3495, "level": 0}, {"x": 3529, "y": 3501, "level": 0}]
                              }]
                            }
                          }, {
                            "key": {"pulse": 3, "different_level": false, "spot": {"x": 3534, "y": 3470, "level": 0}},
                            "value": {
                              "children": [],
                              "directions": "",
                              "path": [{"type": "run", "waypoints": [{"x": 3550, "y": 3473, "level": 0}, {"x": 3537, "y": 3473, "level": 0}, {"x": 3534, "y": 3470, "level": 0}]}]
                            }
                          }],
                          "directions": "",
                          "path": [{"type": "run", "waypoints": [{"x": 3558, "y": 3474, "level": 0}, {"x": 3551, "y": 3474, "level": 0}, {"x": 3550, "y": 3473, "level": 0}]}]
                        }
                      }], "directions": "", "path": [{"type": "ability", "ability": "dive", "from": {"x": 3568, "y": 3484, "level": 0}, "to": {"x": 3558, "y": 3474, "level": 0}}]
                    }
                  }, {
                    "key": {"pulse": 2, "different_level": false}, "value": {
                      "children": [{
                        "key": {"pulse": 1, "different_level": false},
                        "value": {
                          "children": [],
                          "directions": "",
                          "path": [{
                            "type": "run",
                            "waypoints": [{"x": 3558, "y": 3474, "level": 0}, {"x": 3558, "y": 3477, "level": 0}, {"x": 3557, "y": 3478, "level": 0}, {
                              "x": 3557,
                              "y": 3481,
                              "level": 0
                            }, {"x": 3555, "y": 3483, "level": 0}, {"x": 3555, "y": 3484, "level": 0}, {"x": 3554, "y": 3485, "level": 0}, {
                              "x": 3554,
                              "y": 3490,
                              "level": 0
                            }, {"x": 3553, "y": 3491, "level": 0}, {"x": 3553, "y": 3492, "level": 0}, {"x": 3550, "y": 3495, "level": 0}, {"x": 3550, "y": 3496, "level": 0}]
                          }, {"type": "ability", "ability": "surge", "from": {"x": 3550, "y": 3496, "level": 0}, "to": {"x": 3550, "y": 3506, "level": 0}}, {
                            "type": "run",
                            "waypoints": [{"x": 3550, "y": 3506, "level": 0}, {"x": 3550, "y": 3513, "level": 0}, {"x": 3551, "y": 3514, "level": 0}]
                          }]
                        }
                      }, {
                        "key": {"pulse": 3, "different_level": false, "spot": {"x": 3544, "y": 3465, "level": 0}},
                        "value": {
                          "children": [],
                          "directions": "",
                          "path": [{
                            "type": "run",
                            "waypoints": [{"x": 3558, "y": 3474, "level": 0}, {"x": 3552, "y": 3474, "level": 0}, {"x": 3548, "y": 3470, "level": 0}, {
                              "x": 3547,
                              "y": 3470,
                              "level": 0
                            }, {"x": 3546, "y": 3469, "level": 0}, {"x": 3546, "y": 3467, "level": 0}, {"x": 3544, "y": 3465, "level": 0}]
                          }]
                        }
                      }], "directions": "", "path": [{"type": "ability", "ability": "dive", "from": {"x": 3568, "y": 3484, "level": 0}, "to": {"x": 3558, "y": 3474, "level": 0}}]
                    }
                  }, {
                    "key": {"pulse": 3, "different_level": false, "spot": {"x": 3552, "y": 3483, "level": 0}},
                    "value": {
                      "children": [],
                      "directions": "",
                      "path": [{"type": "ability", "ability": "dive", "from": {"x": 3568, "y": 3484, "level": 0}, "to": {"x": 3558, "y": 3484, "level": 0}}, {
                        "type": "run",
                        "waypoints": [{"x": 3558, "y": 3484, "level": 0}, {"x": 3557, "y": 3485, "level": 0}, {"x": 3554, "y": 3485, "level": 0}, {"x": 3552, "y": 3483, "level": 0}]
                      }]
                    }
                  }],
                  "directions": "",
                  "path": [{"type": "run", "waypoints": [{"x": 3587, "y": 3485, "level": 0}, {"x": 3585, "y": 3485, "level": 0}]}, {
                    "type": "ability",
                    "ability": "surge",
                    "from": {"x": 3585, "y": 3485, "level": 0},
                    "to": {"x": 3575, "y": 3485, "level": 0}
                  }, {
                    "type": "run",
                    "waypoints": [{"x": 3575, "y": 3485, "level": 0}, {"x": 3570, "y": 3485, "level": 0}, {"x": 3569, "y": 3484, "level": 0}, {"x": 3568, "y": 3484, "level": 0}]
                  }]
                }
              }, {
                "key": {"pulse": 2, "different_level": false},
                "value": {
                  "children": [],
                  "directions": "",
                  "path": [{
                    "type": "run",
                    "waypoints": [{"x": 3587, "y": 3485, "level": 0}, {"x": 3587, "y": 3487, "level": 0}, {"x": 3586, "y": 3488, "level": 0}, {
                      "x": 3585,
                      "y": 3488,
                      "level": 0
                    }, {"x": 3583, "y": 3490, "level": 0}]
                  }, {"type": "ability", "ability": "surge", "from": {"x": 3583, "y": 3490, "level": 0}, "to": {"x": 3573, "y": 3500, "level": 0}}, {
                    "type": "ability",
                    "ability": "dive",
                    "from": {"x": 3573, "y": 3500, "level": 0},
                    "to": {"x": 3563, "y": 3510, "level": 0}
                  }]
                }
              }],
              "directions": "",
              "path": [{"type": "run", "waypoints": [{"x": 3597, "y": 3495, "level": 0}, {"x": 3596, "y": 3494, "level": 0}]}, {
                "type": "ability",
                "ability": "surge",
                "from": {"x": 3596, "y": 3494, "level": 0},
                "to": {"x": 3587, "y": 3485, "level": 0}
              }]
            }
          }, {
            "key": {"pulse": 2, "different_level": false}, "value": {
              "children": [{
                "key": {"pulse": 1, "different_level": false}, "value": {
                  "children": [{
                    "key": {"pulse": 1, "different_level": false},
                    "value": {
                      "children": [],
                      "directions": "",
                      "path": [{"type": "ability", "ability": "dive", "from": {"x": 3599, "y": 3473, "level": 0}, "to": {"x": 3609, "y": 3483, "level": 0}}, {
                        "type": "run",
                        "waypoints": [{"x": 3609, "y": 3483, "level": 0}, {"x": 3609, "y": 3485, "level": 0}, {"x": 3615, "y": 3491, "level": 0}, {
                          "x": 3615,
                          "y": 3494,
                          "level": 0
                        }, {"x": 3616, "y": 3495, "level": 0}, {"x": 3616, "y": 3500, "level": 0}, {"x": 3623, "y": 3507, "level": 0}]
                      }]
                    }
                  }, {
                    "key": {"pulse": 2, "different_level": false},
                    "value": {
                      "children": [],
                      "directions": "",
                      "path": [{"type": "ability", "ability": "dive", "from": {"x": 3599, "y": 3473, "level": 0}, "to": {"x": 3609, "y": 3473, "level": 0}}, {
                        "type": "run",
                        "waypoints": [{"x": 3609, "y": 3473, "level": 0}, {"x": 3612, "y": 3473, "level": 0}, {"x": 3613, "y": 3474, "level": 0}, {
                          "x": 3615,
                          "y": 3474,
                          "level": 0
                        }, {"x": 3616, "y": 3475, "level": 0}, {"x": 3621, "y": 3475, "level": 0}, {"x": 3622, "y": 3476, "level": 0}]
                      }]
                    }
                  }],
                  "directions": "",
                  "path": [{"type": "run", "waypoints": [{"x": 3587, "y": 3485, "level": 0}, {"x": 3589, "y": 3483, "level": 0}]}, {
                    "type": "ability",
                    "ability": "surge",
                    "from": {"x": 3589, "y": 3483, "level": 0},
                    "to": {"x": 3599, "y": 3473, "level": 0}
                  }]
                }
              }, {
                "key": {"pulse": 2, "different_level": false}, "value": {
                  "children": [{
                    "key": {"pulse": 1, "different_level": false},
                    "value": {
                      "children": [],
                      "directions": "",
                      "path": [{
                        "type": "run",
                        "waypoints": [{"x": 3583, "y": 3482, "level": 0}, {"x": 3587, "y": 3482, "level": 0}, {"x": 3589, "y": 3484, "level": 0}]
                      }, {"type": "ability", "ability": "surge", "from": {"x": 3589, "y": 3484, "level": 0}, "to": {"x": 3599, "y": 3494, "level": 0}}, {
                        "type": "ability",
                        "ability": "dive",
                        "from": {"x": 3599, "y": 3494, "level": 0},
                        "to": {"x": 3609, "y": 3504, "level": 0}
                      }, {
                        "type": "run",
                        "waypoints": [{"x": 3609, "y": 3504, "level": 0}, {"x": 3610, "y": 3505, "level": 0}, {"x": 3613, "y": 3505, "level": 0}, {
                          "x": 3614,
                          "y": 3506,
                          "level": 0
                        }, {"x": 3616, "y": 3506, "level": 0}, {"x": 3617, "y": 3505, "level": 0}, {"x": 3619, "y": 3505, "level": 0}, {"x": 3619, "y": 3509, "level": 0}, {
                          "x": 3617,
                          "y": 3511,
                          "level": 0
                        }]
                      }]
                    }
                  }, {
                    "key": {"pulse": 2, "different_level": false}, "value": {
                      "children": [{
                        "key": {"pulse": 2, "different_level": false},
                        "value": {
                          "children": [],
                          "directions": "",
                          "path": [{
                            "type": "run",
                            "waypoints": [{"x": 3590, "y": 3479, "level": 0}, {"x": 3590, "y": 3480, "level": 0}, {"x": 3589, "y": 3481, "level": 0}]
                          }, {"type": "ability", "ability": "surge", "from": {"x": 3589, "y": 3481, "level": 0}, "to": {"x": 3579, "y": 3491, "level": 0}}, {
                            "type": "run",
                            "waypoints": [{"x": 3579, "y": 3491, "level": 0}, {"x": 3579, "y": 3493, "level": 0}, {"x": 3578, "y": 3494, "level": 0}, {
                              "x": 3578,
                              "y": 3497,
                              "level": 0
                            }, {"x": 3577, "y": 3497, "level": 0}, {"x": 3576, "y": 3498, "level": 0}, {"x": 3576, "y": 3502, "level": 0}, {
                              "x": 3575,
                              "y": 3503,
                              "level": 0
                            }, {"x": 3575, "y": 3510, "level": 0}]
                          }]
                        }
                      }, {
                        "key": {"pulse": 3, "different_level": false, "spot": {"x": 3606, "y": 3465, "level": 0}},
                        "value": {
                          "children": [],
                          "directions": "",
                          "path": [{"type": "ability", "ability": "surge", "from": {"x": 3590, "y": 3479, "level": 0}, "to": {"x": 3600, "y": 3469, "level": 0}}, {
                            "type": "run",
                            "waypoints": [{"x": 3600, "y": 3469, "level": 0}, {"x": 3603, "y": 3469, "level": 0}, {"x": 3605, "y": 3467, "level": 0}, {
                              "x": 3605,
                              "y": 3466,
                              "level": 0
                            }]
                          }]
                        }
                      }], "directions": "", "path": [{"type": "ability", "ability": "dive", "from": {"x": 3583, "y": 3482, "level": 0}, "to": {"x": 3590, "y": 3479, "level": 0}}]
                    }
                  }, {
                    "key": {"pulse": 3, "different_level": false, "spot": {"x": 3583, "y": 3466, "level": 0}},
                    "value": {
                      "children": [],
                      "directions": "",
                      "path": [{"type": "ability", "ability": "dive", "from": {"x": 3583, "y": 3482, "level": 0}, "to": {"x": 3583, "y": 3476, "level": 0}}, {
                        "type": "ability",
                        "ability": "surge",
                        "from": {"x": 3583, "y": 3476, "level": 0},
                        "to": {"x": 3583, "y": 3466, "level": 0}
                      }]
                    }
                  }, {
                    "key": {"pulse": 3, "different_level": false, "spot": {"x": 3567, "y": 3475, "level": 0}},
                    "value": {
                      "children": [],
                      "directions": "",
                      "path": [{"type": "ability", "ability": "surge", "from": {"x": 3583, "y": 3482, "level": 0}, "to": {"x": 3573, "y": 3472, "level": 0}}, {
                        "type": "ability",
                        "ability": "dive",
                        "from": {"x": 3573, "y": 3472, "level": 0},
                        "to": {"x": 3567, "y": 3475, "level": 0}
                      }]
                    }
                  }],
                  "directions": "",
                  "path": [{
                    "type": "run",
                    "waypoints": [{"x": 3587, "y": 3485, "level": 0}, {"x": 3584, "y": 3485, "level": 0}, {"x": 3584, "y": 3483, "level": 0}, {"x": 3583, "y": 3482, "level": 0}]
                  }]
                }
              }, {
                "key": {"pulse": 3, "different_level": false, "spot": {"x": 3573, "y": 3484, "level": 0}},
                "value": {
                  "children": [],
                  "directions": "",
                  "path": [{"type": "ability", "ability": "dive", "from": {"x": 3587, "y": 3485, "level": 0}, "to": {"x": 3577, "y": 3485, "level": 0}}, {
                    "type": "run",
                    "waypoints": [{"x": 3577, "y": 3485, "level": 0}, {"x": 3574, "y": 3485, "level": 0}, {"x": 3573, "y": 3484, "level": 0}]
                  }]
                }
              }, {
                "key": {"pulse": 3, "different_level": false, "spot": {"x": 3590, "y": 3475, "level": 0}},
                "value": {
                  "children": [],
                  "directions": "",
                  "path": [{"type": "ability", "ability": "dive", "from": {"x": 3587, "y": 3485, "level": 0}, "to": {"x": 3589, "y": 3475, "level": 0}}]
                }
              }],
              "directions": "",
              "path": [{"type": "run", "waypoints": [{"x": 3597, "y": 3495, "level": 0}, {"x": 3596, "y": 3494, "level": 0}]}, {
                "type": "ability",
                "ability": "surge",
                "from": {"x": 3596, "y": 3494, "level": 0},
                "to": {"x": 3587, "y": 3485, "level": 0}
              }]
            }
          }, {
            "key": {"pulse": 3, "different_level": false, "spot": {"x": 3583, "y": 3484, "level": 0}},
            "value": {
              "children": [],
              "directions": "",
              "path": [{"type": "ability", "ability": "dive", "from": {"x": 3597, "y": 3495, "level": 0}, "to": {"x": 3594, "y": 3493, "level": 0}}, {
                "type": "ability",
                "ability": "surge",
                "from": {"x": 3594, "y": 3493, "level": 0},
                "to": {"x": 3584, "y": 3483, "level": 0}
              }]
            }
          }, {
            "key": {"pulse": 3, "different_level": false, "spot": {"x": 3609, "y": 3499, "level": 0}},
            "value": {
              "children": [],
              "directions": "",
              "path": [{"type": "run", "waypoints": [{"x": 3597, "y": 3495, "level": 0}, {"x": 3599, "y": 3495, "level": 0}]}, {
                "type": "ability",
                "ability": "dive",
                "from": {"x": 3599, "y": 3495, "level": 0},
                "to": {"x": 3609, "y": 3499, "level": 0}
              }]
            }
          }, {
            "key": {"pulse": 3, "different_level": false, "spot": {"x": 3596, "y": 3501, "level": 0}},
            "value": {
              "children": [],
              "directions": "",
              "path": [{"type": "ability", "ability": "dive", "from": {"x": 3597, "y": 3495, "level": 0}, "to": {"x": 3597, "y": 3501, "level": 0}}]
            }
          }, {
            "key": {"pulse": 3, "different_level": false, "spot": {"x": 3604, "y": 3507, "level": 0}},
            "value": {
              "children": [],
              "directions": "",
              "path": [{"type": "run", "waypoints": [{"x": 3597, "y": 3495, "level": 0}, {"x": 3597, "y": 3497, "level": 0}]}, {
                "type": "ability",
                "ability": "dive",
                "from": {"x": 3597, "y": 3497, "level": 0},
                "to": {"x": 3603, "y": 3507, "level": 0}
              }]
            }
          }],
          "directions": "",
          "path": [{"type": "teleport", "spot": {"x": 3597, "y": 3495, "level": 0}, "id": {"group": "fairyring", "spot": "ALQ", "access": "portable_fairy_ring"}}]
        }
      },
      "expected_time": 22.571428571428573
    }, {
      "id": "0db078ba-2eb8-4d94-8e61-98db52f425b2",
      "type": "scantree",
      "timestamp": 1711542211,
      "name": "Default Scan Route",
      "description": "",
      "assumptions": {"meerkats_active": true, "double_surge": true, "double_escape": true, "mobile_perk": true},
      "for": {"clue": 351},
      "tree": {
        "assumed_range": 21,
        "ordered_spots": [{"x": 3197, "y": 3383, "level": 0}, {"x": 3211, "y": 3385, "level": 0}, {"x": 3228, "y": 3383, "level": 0}, {"x": 3240, "y": 3383, "level": 0}, {
          "x": 3175,
          "y": 3404,
          "level": 0
        }, {"x": 3175, "y": 3415, "level": 0}, {"x": 3196, "y": 3415, "level": 0}, {"x": 3197, "y": 3423, "level": 0}, {"x": 3253, "y": 3393, "level": 0}, {
          "x": 3228,
          "y": 3409,
          "level": 0
        }, {"x": 3231, "y": 3439, "level": 0}, {"x": 3220, "y": 3407, "level": 0}, {"x": 3204, "y": 3409, "level": 0}, {"x": 3273, "y": 3398, "level": 0}, {
          "x": 3284,
          "y": 3378,
          "level": 0
        }, {"x": 3185, "y": 3472, "level": 0}, {"x": 3188, "y": 3488, "level": 0}, {"x": 3180, "y": 3510, "level": 0}, {"x": 3141, "y": 3488, "level": 0}, {
          "x": 3213,
          "y": 3484,
          "level": 0
        }, {"x": 3230, "y": 3494, "level": 0}, {"x": 3241, "y": 3480, "level": 0}, {"x": 3213, "y": 3462, "level": 0}, {"x": 3248, "y": 3454, "level": 0}],
        "root": {
          "children": [{
            "key": {"pulse": 1, "different_level": false}, "value": {
              "children": [{
                "key": {"pulse": 1, "different_level": false}, "value": {
                  "children": [{
                    "key": {"pulse": 1, "different_level": false}, "value": {
                      "children": [{
                        "key": {"pulse": 1, "different_level": false}, "value": {
                          "children": [{
                            "key": {"pulse": 1, "different_level": false}, "value": {
                              "children": [{
                                "key": {"pulse": 1, "different_level": false},
                                "value": {
                                  "children": [],
                                  "directions": "",
                                  "path": [{
                                    "type": "teleport",
                                    "spot": {"x": 3217, "y": 3499, "level": 0},
                                    "id": {"group": "naturessentinel", "spot": "ivynorthvarrock", "access": "outfit"}
                                  }, {"type": "run", "waypoints": [{"x": 3217, "y": 3499, "level": 0}, {"x": 3219, "y": 3499, "level": 0}]}, {
                                    "type": "ability",
                                    "ability": "dive",
                                    "from": {"x": 3219, "y": 3499, "level": 0},
                                    "to": {"x": 3229, "y": 3494, "level": 0}
                                  }]
                                }
                              }, {
                                "key": {"pulse": 2, "different_level": false},
                                "value": {
                                  "children": [],
                                  "directions": "",
                                  "path": [{
                                    "type": "ability",
                                    "ability": "surge",
                                    "from": {"x": 3164, "y": 3469, "level": 0},
                                    "to": {"x": 3174, "y": 3479, "level": 0}
                                  }, {"type": "ability", "ability": "dive", "from": {"x": 3174, "y": 3479, "level": 0}, "to": {"x": 3174, "y": 3489, "level": 0}}, {
                                    "type": "run",
                                    "waypoints": [{"x": 3174, "y": 3489, "level": 0}, {"x": 3174, "y": 3491, "level": 0}]
                                  }, {"type": "ability", "ability": "surge", "from": {"x": 3174, "y": 3491, "level": 0}, "to": {"x": 3174, "y": 3501, "level": 0}}, {
                                    "type": "run",
                                    "waypoints": [{"x": 3174, "y": 3501, "level": 0}, {"x": 3174, "y": 3504, "level": 0}, {"x": 3179, "y": 3509, "level": 0}]
                                  }]
                                }
                              }], "directions": "", "path": [{"type": "run", "waypoints": [{"x": 3162, "y": 3467, "level": 0}, {"x": 3164, "y": 3469, "level": 0}]}]
                            }
                          }, {
                            "key": {"pulse": 2, "different_level": false},
                            "value": {
                              "children": [],
                              "directions": "",
                              "path": [{
                                "type": "ability",
                                "ability": "dive",
                                "from": {"x": 3162, "y": 3467, "level": 0},
                                "to": {"x": 3172, "y": 3477, "level": 0}
                              }, {"type": "ability", "ability": "surge", "from": {"x": 3172, "y": 3477, "level": 0}, "to": {"x": 3182, "y": 3487, "level": 0}}, {
                                "type": "run",
                                "waypoints": [{"x": 3182, "y": 3487, "level": 0}, {"x": 3187, "y": 3487, "level": 0}, {"x": 3188, "y": 3488, "level": 0}]
                              }]
                            }
                          }, {
                            "key": {"pulse": 3, "different_level": false, "spot": {"x": 3141, "y": 3488, "level": 0}},
                            "value": {
                              "children": [],
                              "directions": "",
                              "path": [{
                                "type": "ability",
                                "ability": "dive",
                                "from": {"x": 3162, "y": 3467, "level": 0},
                                "to": {"x": 3152, "y": 3477, "level": 0}
                              }, {"type": "ability", "ability": "surge", "from": {"x": 3152, "y": 3477, "level": 0}, "to": {"x": 3142, "y": 3487, "level": 0}}]
                            }
                          }],
                          "directions": "",
                          "path": [{
                            "type": "teleport",
                            "spot": {"x": 3163, "y": 3464, "level": 0},
                            "id": {"group": "ringofwealth", "spot": "grandexchange", "access": "ring"}
                          }, {"type": "run", "waypoints": [{"x": 3163, "y": 3464, "level": 0}, {"x": 3163, "y": 3466, "level": 0}, {"x": 3162, "y": 3467, "level": 0}]}]
                        }
                      }, {
                        "key": {"pulse": 2, "different_level": false}, "value": {
                          "children": [{
                            "key": {"pulse": 2, "different_level": false}, "value": {
                              "children": [],
                              "directions": "",
                              "path": [{
                                "type": "run",
                                "waypoints": [{"x": 3241, "y": 3461, "level": 0}, {"x": 3238, "y": 3461, "level": 0}, {"x": 3235, "y": 3464, "level": 0}, {
                                  "x": 3234,
                                  "y": 3464,
                                  "level": 0
                                }]
                              }, {"type": "ability", "ability": "surge", "from": {"x": 3234, "y": 3464, "level": 0}, "to": {"x": 3224, "y": 3464, "level": 0}}, {
                                "type": "run",
                                "waypoints": [{"x": 3224, "y": 3464, "level": 0}, {"x": 3223, "y": 3463, "level": 0}, {"x": 3223, "y": 3462, "level": 0}]
                              }, {"type": "run", "waypoints": [{"x": 3223, "y": 3462, "level": 0}, {"x": 3222, "y": 3463, "level": 0}]}, {
                                "type": "ability",
                                "ability": "surge",
                                "from": {"x": 3222, "y": 3463, "level": 0},
                                "to": {"x": 3213, "y": 3472, "level": 0}
                              }, {
                                "type": "run",
                                "waypoints": [{"x": 3213, "y": 3472, "level": 0}, {"x": 3214, "y": 3472, "level": 0}, {"x": 3214, "y": 3475, "level": 0}, {
                                  "x": 3215,
                                  "y": 3476,
                                  "level": 0
                                }]
                              }, {
                                "type": "transport",
                                "assumed_start": {"x": 3215, "y": 3476, "level": 0},
                                "internal": {
                                  "type": "entity",
                                  "entity": {"kind": "static", "name": "Door"},
                                  "clickable_area": {"topleft": {"x": 3214.5, "y": 3477}, "botright": {"x": 3215.5, "y": 3476}, "level": 0},
                                  "actions": [{
                                    "cursor": "open",
                                    "interactive_area": {"origin": {"x": 3215, "y": 3476, "level": 0}, "size": {"x": 1, "y": 2}},
                                    "name": "Pass",
                                    "movement": [{"time": 1, "offset": {"x": 0, "y": -1, "level": 0}, "valid_from": {"origin": {"x": 3215, "y": 3477, "level": 0}}}, {
                                      "time": 1,
                                      "offset": {"x": 0, "y": 1, "level": 0},
                                      "valid_from": {"origin": {"x": 3215, "y": 3476, "level": 0}}
                                    }]
                                  }]
                                }
                              }, {"type": "ability", "ability": "dive", "from": {"x": 3215, "y": 3477, "level": 0}, "to": {"x": 3214, "y": 3484, "level": 0}}]
                            }
                          }, {
                            "key": {"pulse": 3, "different_level": false, "spot": {"x": 3241, "y": 3480, "level": 0}},
                            "value": {
                              "children": [],
                              "directions": "",
                              "path": [{"type": "ability", "ability": "dive", "from": {"x": 3241, "y": 3461, "level": 0}, "to": {"x": 3242, "y": 3469, "level": 0}}, {
                                "type": "run",
                                "waypoints": [{"x": 3242, "y": 3469, "level": 0}, {"x": 3243, "y": 3469, "level": 0}, {"x": 3243, "y": 3470, "level": 0}]
                              }, {"type": "ability", "ability": "surge", "from": {"x": 3243, "y": 3470, "level": 0}, "to": {"x": 3243, "y": 3480, "level": 0}}, {
                                "type": "run",
                                "waypoints": [{"x": 3243, "y": 3480, "level": 0}, {"x": 3241, "y": 3480, "level": 0}]
                              }]
                            }
                          }],
                          "directions": "",
                          "path": [{
                            "type": "run",
                            "waypoints": [{"x": 3254, "y": 3449, "level": 0}, {"x": 3250, "y": 3449, "level": 0}, {"x": 3247, "y": 3452, "level": 0}, {
                              "x": 3247,
                              "y": 3455,
                              "level": 0
                            }, {"x": 3241, "y": 3461, "level": 0}]
                          }]
                        }
                      }],
                      "directions": "",
                      "path": [{"type": "teleport", "spot": {"x": 3254, "y": 3449, "level": 0}, "id": {"group": "davesspellbook", "spot": "varrock", "access": "spellbook"}}]
                    }
                  }, {
                    "key": {"pulse": 2, "different_level": false}, "value": {
                      "children": [{
                        "key": {"pulse": 2, "different_level": false},
                        "value": {
                          "children": [],
                          "directions": "",
                          "path": [{"type": "run", "waypoints": [{"x": 3264, "y": 3406, "level": 0}, {"x": 3266, "y": 3404, "level": 0}]}, {
                            "type": "ability",
                            "ability": "surge",
                            "from": {"x": 3266, "y": 3404, "level": 0},
                            "to": {"x": 3276, "y": 3394, "level": 0}
                          }, {"type": "ability", "ability": "dive", "from": {"x": 3276, "y": 3394, "level": 0}, "to": {"x": 3276, "y": 3384, "level": 0}}, {
                            "type": "run",
                            "waypoints": [{"x": 3276, "y": 3384, "level": 0}, {"x": 3278, "y": 3382, "level": 0}]
                          }, {"type": "ability", "ability": "surge", "from": {"x": 3278, "y": 3382, "level": 0}, "to": {"x": 3283, "y": 3377, "level": 0}}]
                        }
                      }, {
                        "key": {"pulse": 3, "different_level": false, "spot": {"x": 3273, "y": 3398, "level": 0}},
                        "value": {
                          "children": [],
                          "directions": "",
                          "path": [{"type": "ability", "ability": "dive", "from": {"x": 3264, "y": 3406, "level": 0}, "to": {"x": 3273, "y": 3398, "level": 0}}]
                        }
                      }],
                      "directions": "",
                      "path": [{
                        "type": "run",
                        "waypoints": [{"x": 3244, "y": 3418, "level": 0}, {"x": 3244, "y": 3416, "level": 0}, {"x": 3247, "y": 3413, "level": 0}, {
                          "x": 3255,
                          "y": 3413,
                          "level": 0
                        }, {"x": 3260, "y": 3408, "level": 0}, {"x": 3261, "y": 3408, "level": 0}, {"x": 3263, "y": 3406, "level": 0}]
                      }, {
                        "type": "transport",
                        "assumed_start": {"x": 3263, "y": 3406, "level": 0},
                        "internal": {
                          "type": "entity",
                          "entity": {"kind": "static", "name": "Gate"},
                          "clickable_area": {"topleft": {"x": 3263, "y": 3406.5}, "botright": {"x": 3264, "y": 3405.5}, "level": 0},
                          "actions": [{
                            "cursor": "open",
                            "interactive_area": {"origin": {"x": 3263, "y": 3406, "level": 0}, "size": {"x": 2, "y": 1}},
                            "name": "Pass",
                            "movement": [{"time": 1, "offset": {"x": -1, "y": 0, "level": 0}, "valid_from": {"origin": {"x": 3264, "y": 3406, "level": 0}}}, {
                              "time": 1,
                              "offset": {"x": 1, "y": 0, "level": 0},
                              "valid_from": {"origin": {"x": 3263, "y": 3406, "level": 0}}
                            }]
                          }]
                        }
                      }]
                    }
                  }],
                  "directions": "",
                  "path": [{"type": "ability", "ability": "dive", "from": {"x": 3224, "y": 3422, "level": 0}, "to": {"x": 3234, "y": 3418, "level": 0}}, {
                    "type": "ability",
                    "ability": "surge",
                    "from": {"x": 3234, "y": 3418, "level": 0},
                    "to": {"x": 3244, "y": 3418, "level": 0}
                  }]
                }
              }, {
                "key": {"pulse": 2, "different_level": false}, "value": {
                  "children": [{
                    "key": {"pulse": 1, "different_level": false},
                    "value": {
                      "children": [],
                      "directions": "",
                      "path": [{
                        "type": "run",
                        "waypoints": [{"x": 3210, "y": 3399, "level": 0}, {"x": 3210, "y": 3398, "level": 0}, {"x": 3212, "y": 3396, "level": 0}, {
                          "x": 3213,
                          "y": 3396,
                          "level": 0
                        }, {"x": 3214, "y": 3395, "level": 0}, {"x": 3214, "y": 3393, "level": 0}, {"x": 3215, "y": 3392, "level": 0}, {"x": 3235, "y": 3392, "level": 0}, {
                          "x": 3236,
                          "y": 3391,
                          "level": 0
                        }, {"x": 3237, "y": 3391, "level": 0}]
                      }, {"type": "ability", "ability": "surge", "from": {"x": 3237, "y": 3391, "level": 0}, "to": {"x": 3247, "y": 3391, "level": 0}}, {
                        "type": "ability",
                        "ability": "dive",
                        "from": {"x": 3247, "y": 3391, "level": 0},
                        "to": {"x": 3253, "y": 3393, "level": 0}
                      }]
                    }
                  }, {
                    "key": {"pulse": 2, "different_level": false},
                    "value": {
                      "children": [],
                      "directions": "",
                      "path": [{
                        "type": "run",
                        "waypoints": [{"x": 3210, "y": 3399, "level": 0}, {"x": 3210, "y": 3398, "level": 0}, {"x": 3212, "y": 3396, "level": 0}, {
                          "x": 3213,
                          "y": 3396,
                          "level": 0
                        }, {"x": 3214, "y": 3395, "level": 0}, {"x": 3214, "y": 3393, "level": 0}, {"x": 3215, "y": 3392, "level": 0}, {"x": 3230, "y": 3392, "level": 0}, {
                          "x": 3233,
                          "y": 3389,
                          "level": 0
                        }]
                      }, {"type": "ability", "ability": "surge", "from": {"x": 3233, "y": 3389, "level": 0}, "to": {"x": 3240, "y": 3382, "level": 0}}]
                    }
                  }, {
                    "key": {"pulse": 3, "different_level": false, "spot": {"x": 3197, "y": 3383, "level": 0}},
                    "value": {
                      "children": [],
                      "directions": "",
                      "path": [{
                        "type": "run",
                        "waypoints": [{"x": 3210, "y": 3399, "level": 0}, {"x": 3210, "y": 3394, "level": 0}, {"x": 3208, "y": 3394, "level": 0}, {
                          "x": 3207,
                          "y": 3393,
                          "level": 0
                        }, {"x": 3204, "y": 3393, "level": 0}, {"x": 3200, "y": 3389, "level": 0}, {"x": 3200, "y": 3386, "level": 0}, {"x": 3198, "y": 3384, "level": 0}]
                      }]
                    }
                  }, {
                    "key": {"pulse": 3, "different_level": false, "spot": {"x": 3211, "y": 3385, "level": 0}},
                    "value": {
                      "children": [],
                      "directions": "",
                      "path": [{"type": "run", "waypoints": [{"x": 3210, "y": 3399, "level": 0}, {"x": 3210, "y": 3386, "level": 0}, {"x": 3211, "y": 3385, "level": 0}]}]
                    }
                  }, {
                    "key": {"pulse": 3, "different_level": false, "spot": {"x": 3228, "y": 3383, "level": 0}},
                    "value": {
                      "children": [],
                      "directions": "",
                      "path": [{
                        "type": "run",
                        "waypoints": [{"x": 3210, "y": 3399, "level": 0}, {"x": 3210, "y": 3389, "level": 0}, {"x": 3213, "y": 3386, "level": 0}, {
                          "x": 3214,
                          "y": 3386,
                          "level": 0
                        }, {"x": 3217, "y": 3383, "level": 0}, {"x": 3228, "y": 3383, "level": 0}]
                      }]
                    }
                  }],
                  "directions": "",
                  "path": [{
                    "type": "run",
                    "waypoints": [{"x": 3224, "y": 3422, "level": 0}, {"x": 3223, "y": 3422, "level": 0}, {"x": 3222, "y": 3421, "level": 0}, {
                      "x": 3222,
                      "y": 3420,
                      "level": 0
                    }, {"x": 3221, "y": 3419, "level": 0}]
                  }, {"type": "ability", "ability": "surge", "from": {"x": 3221, "y": 3419, "level": 0}, "to": {"x": 3211, "y": 3409, "level": 0}}, {
                    "type": "ability",
                    "ability": "dive",
                    "from": {"x": 3211, "y": 3409, "level": 0},
                    "to": {"x": 3210, "y": 3399, "level": 0}
                  }]
                }
              }],
              "directions": "",
              "path": [{"type": "run", "waypoints": [{"x": 3212, "y": 3434, "level": 0}, {"x": 3214, "y": 3432, "level": 0}]}, {
                "type": "ability",
                "ability": "surge",
                "from": {"x": 3214, "y": 3432, "level": 0},
                "to": {"x": 3224, "y": 3422, "level": 0}
              }]
            }
          }, {
            "key": {"pulse": 2, "different_level": false}, "value": {
              "children": [{
                "key": {"pulse": 1, "different_level": false}, "value": {
                  "children": [{
                    "key": {"pulse": 1, "different_level": false},
                    "value": {
                      "children": [],
                      "directions": "",
                      "path": [{
                        "type": "teleport",
                        "spot": {"x": 3163, "y": 3464, "level": 0},
                        "id": {"group": "ringofwealth", "spot": "grandexchange", "access": "ring"}
                      }, {
                        "type": "run",
                        "waypoints": [{"x": 3163, "y": 3464, "level": 0}, {"x": 3163, "y": 3467, "level": 0}, {"x": 3164, "y": 3467, "level": 0}]
                      }, {"type": "ability", "ability": "surge", "from": {"x": 3164, "y": 3467, "level": 0}, "to": {"x": 3174, "y": 3467, "level": 0}}, {
                        "type": "ability",
                        "ability": "dive",
                        "from": {"x": 3174, "y": 3467, "level": 0},
                        "to": {"x": 3184, "y": 3471, "level": 0}
                      }]
                    }
                  }, {
                    "key": {"pulse": 3, "different_level": false, "spot": {"x": 3175, "y": 3404, "level": 0}},
                    "value": {
                      "children": [],
                      "directions": "",
                      "path": [{"type": "run", "waypoints": [{"x": 3181, "y": 3417, "level": 0}, {"x": 3180, "y": 3416, "level": 0}]}, {
                        "type": "ability",
                        "ability": "surge",
                        "from": {"x": 3180, "y": 3416, "level": 0},
                        "to": {"x": 3174, "y": 3410, "level": 0}
                      }, {"type": "ability", "ability": "dive", "from": {"x": 3174, "y": 3410, "level": 0}, "to": {"x": 3175, "y": 3404, "level": 0}}]
                    }
                  }, {
                    "key": {"pulse": 3, "different_level": false, "spot": {"x": 3175, "y": 3415, "level": 0}},
                    "value": {
                      "children": [],
                      "directions": "",
                      "path": [{"type": "ability", "ability": "dive", "from": {"x": 3181, "y": 3417, "level": 0}, "to": {"x": 3175, "y": 3416, "level": 0}}]
                    }
                  }],
                  "directions": "",
                  "path": [{"type": "teleport", "spot": {"x": 3181, "y": 3417, "level": 0}, "id": {"group": "archteleport", "spot": "soran", "access": "scrolls"}}]
                }
              }, {
                "key": {"pulse": 2, "different_level": false}, "value": {
                  "children": [{
                    "key": {"pulse": 1, "different_level": false},
                    "value": {
                      "children": [],
                      "directions": "",
                      "path": [{
                        "type": "teleport",
                        "spot": {"x": 3212, "y": 3434, "level": 0},
                        "id": {"group": "normalspellbook", "spot": "varrock", "access": "spellbook"}
                      }, {"type": "run", "waypoints": [{"x": 3212, "y": 3434, "level": 0}, {"x": 3212, "y": 3438, "level": 0}]}, {
                        "type": "ability",
                        "ability": "dive",
                        "from": {"x": 3212, "y": 3438, "level": 0},
                        "to": {"x": 3212, "y": 3448, "level": 0}
                      }, {"type": "run", "waypoints": [{"x": 3212, "y": 3448, "level": 0}, {"x": 3212, "y": 3461, "level": 0}, {"x": 3213, "y": 3462, "level": 0}]}]
                    }
                  }, {
                    "key": {"pulse": 2, "different_level": false},
                    "value": {
                      "children": [],
                      "directions": "",
                      "path": [{
                        "type": "teleport",
                        "spot": {"x": 3254, "y": 3449, "level": 0},
                        "id": {"group": "davesspellbook", "spot": "varrock", "access": "spellbook"}
                      }, {"type": "ability", "ability": "dive", "from": {"x": 3254, "y": 3449, "level": 0}, "to": {"x": 3247, "y": 3454, "level": 0}}]
                    }
                  }, {
                    "key": {"pulse": 3, "different_level": false, "spot": {"x": 3253, "y": 3393, "level": 0}},
                    "value": {
                      "children": [],
                      "directions": "",
                      "path": [{
                        "type": "run",
                        "waypoints": [{"x": 3234, "y": 3412, "level": 0}, {"x": 3233, "y": 3412, "level": 0}, {"x": 3233, "y": 3410, "level": 0}, {"x": 3234, "y": 3409, "level": 0}]
                      }, {"type": "ability", "ability": "dive", "from": {"x": 3234, "y": 3409, "level": 0}, "to": {"x": 3244, "y": 3399, "level": 0}}, {
                        "type": "run",
                        "waypoints": [{"x": 3244, "y": 3399, "level": 0}, {"x": 3248, "y": 3399, "level": 0}, {"x": 3248, "y": 3398, "level": 0}, {"x": 3253, "y": 3393, "level": 0}]
                      }]
                    }
                  }], "directions": "", "path": [{"type": "ability", "ability": "surge", "from": {"x": 3224, "y": 3422, "level": 0}, "to": {"x": 3234, "y": 3412, "level": 0}}]
                }
              }, {
                "key": {"pulse": 3, "different_level": false, "spot": {"x": 3228, "y": 3409, "level": 0}},
                "value": {
                  "children": [],
                  "directions": "",
                  "path": [{"type": "ability", "ability": "surge", "from": {"x": 3224, "y": 3422, "level": 0}, "to": {"x": 3234, "y": 3412, "level": 0}}, {
                    "type": "ability",
                    "ability": "dive",
                    "from": {"x": 3234, "y": 3412, "level": 0},
                    "to": {"x": 3228, "y": 3409, "level": 0}
                  }]
                }
              }, {
                "key": {"pulse": 3, "different_level": false, "spot": {"x": 3220, "y": 3407, "level": 0}},
                "value": {
                  "children": [],
                  "directions": "",
                  "path": [{"type": "ability", "ability": "dive", "from": {"x": 3224, "y": 3422, "level": 0}, "to": {"x": 3222, "y": 3415, "level": 0}}, {
                    "type": "ability",
                    "ability": "surge",
                    "from": {"x": 3222, "y": 3415, "level": 0},
                    "to": {"x": 3222, "y": 3405, "level": 0}
                  }, {"type": "run", "waypoints": [{"x": 3222, "y": 3405, "level": 0}, {"x": 3221, "y": 3405, "level": 0}, {"x": 3220, "y": 3406, "level": 0}]}]
                }
              }, {
                "key": {"pulse": 3, "different_level": false, "spot": {"x": 3204, "y": 3409, "level": 0}},
                "value": {
                  "children": [],
                  "directions": "",
                  "path": [{
                    "type": "run",
                    "waypoints": [{"x": 3224, "y": 3422, "level": 0}, {"x": 3223, "y": 3422, "level": 0}, {"x": 3222, "y": 3421, "level": 0}, {
                      "x": 3222,
                      "y": 3420,
                      "level": 0
                    }, {"x": 3221, "y": 3419, "level": 0}]
                  }, {"type": "ability", "ability": "surge", "from": {"x": 3221, "y": 3419, "level": 0}, "to": {"x": 3211, "y": 3409, "level": 0}}, {
                    "type": "ability",
                    "ability": "dive",
                    "from": {"x": 3211, "y": 3409, "level": 0},
                    "to": {"x": 3204, "y": 3409, "level": 0}
                  }]
                }
              }],
              "directions": "",
              "path": [{"type": "run", "waypoints": [{"x": 3212, "y": 3434, "level": 0}, {"x": 3214, "y": 3432, "level": 0}]}, {
                "type": "ability",
                "ability": "surge",
                "from": {"x": 3214, "y": 3432, "level": 0},
                "to": {"x": 3224, "y": 3422, "level": 0}
              }]
            }
          }, {
            "key": {"pulse": 3, "different_level": false, "spot": {"x": 3196, "y": 3415, "level": 0}},
            "value": {
              "children": [],
              "directions": "",
              "path": [{"type": "run", "waypoints": [{"x": 3212, "y": 3434, "level": 0}, {"x": 3212, "y": 3429, "level": 0}, {"x": 3213, "y": 3428, "level": 0}]}, {
                "type": "ability",
                "ability": "dive",
                "from": {"x": 3213, "y": 3428, "level": 0},
                "to": {"x": 3206, "y": 3421, "level": 0}
              }, {"type": "ability", "ability": "surge", "from": {"x": 3206, "y": 3421, "level": 0}, "to": {"x": 3197, "y": 3412, "level": 0}}, {
                "type": "run",
                "waypoints": [{"x": 3197, "y": 3412, "level": 0}, {"x": 3196, "y": 3412, "level": 0}, {"x": 3196, "y": 3415, "level": 0}]
              }]
            }
          }, {
            "key": {"pulse": 3, "different_level": false, "spot": {"x": 3197, "y": 3423, "level": 0}},
            "value": {
              "children": [],
              "directions": "",
              "path": [{
                "type": "run",
                "waypoints": [{"x": 3212, "y": 3434, "level": 0}, {"x": 3211, "y": 3434, "level": 0}, {"x": 3209, "y": 3432, "level": 0}, {"x": 3208, "y": 3432, "level": 0}]
              }, {"type": "ability", "ability": "dive", "from": {"x": 3208, "y": 3432, "level": 0}, "to": {"x": 3198, "y": 3422, "level": 0}}]
            }
          }, {
            "key": {"pulse": 3, "different_level": false, "spot": {"x": 3231, "y": 3439, "level": 0}},
            "value": {
              "children": [],
              "directions": "",
              "path": [{
                "type": "run",
                "waypoints": [{"x": 3212, "y": 3434, "level": 0}, {"x": 3217, "y": 3434, "level": 0}, {"x": 3219, "y": 3432, "level": 0}, {
                  "x": 3220,
                  "y": 3432,
                  "level": 0
                }, {"x": 3222, "y": 3430, "level": 0}, {"x": 3223, "y": 3430, "level": 0}]
              }, {"type": "ability", "ability": "surge", "from": {"x": 3223, "y": 3430, "level": 0}, "to": {"x": 3233, "y": 3430, "level": 0}}, {
                "type": "ability",
                "ability": "dive",
                "from": {"x": 3233, "y": 3430, "level": 0},
                "to": {"x": 3233, "y": 3440, "level": 0}
              }, {"type": "run", "waypoints": [{"x": 3233, "y": 3440, "level": 0}, {"x": 3233, "y": 3439, "level": 0}, {"x": 3232, "y": 3439, "level": 0}]}]
            }
          }],
          "directions": "",
          "path": [{"type": "teleport", "spot": {"x": 3212, "y": 3434, "level": 0}, "id": {"group": "normalspellbook", "spot": "varrock", "access": "spellbook"}}]
        }
      },
      "expected_time": 19.5
    }, {
      "id": "7eb50fa9-4d62-4563-9603-a401f5aa9d21",
      "type": "scantree",
      "timestamp": 1711548991,
      "name": "Default Scan Route",
      "description": "",
      "assumptions": {"meerkats_active": true, "double_surge": true, "double_escape": true, "mobile_perk": true},
      "for": {"clue": 349},
      "tree": {
        "assumed_range": 32,
        "ordered_spots": [{"x": 3421, "y": 2949, "level": 0}, {"x": 3444, "y": 2952, "level": 0}, {"x": 3447, "y": 2967, "level": 0}, {"x": 3438, "y": 2960, "level": 0}, {
          "x": 3417,
          "y": 2959,
          "level": 0
        }, {"x": 3427, "y": 2970, "level": 0}, {"x": 3442, "y": 2974, "level": 0}, {"x": 3408, "y": 2986, "level": 0}, {"x": 3426, "y": 2984, "level": 0}, {
          "x": 3436,
          "y": 2989,
          "level": 0
        }, {"x": 3406, "y": 3003, "level": 0}, {"x": 3393, "y": 2997, "level": 0}, {"x": 3419, "y": 3017, "level": 0}, {"x": 3382, "y": 3015, "level": 0}, {
          "x": 3385,
          "y": 3024,
          "level": 0
        }, {"x": 3383, "y": 3018, "level": 0}, {"x": 3423, "y": 3020, "level": 0}, {"x": 3448, "y": 3019, "level": 0}, {"x": 3411, "y": 3048, "level": 0}, {
          "x": 3422,
          "y": 3051,
          "level": 0
        }, {"x": 3448, "y": 3063, "level": 0}, {"x": 3401, "y": 3064, "level": 0}, {"x": 3460, "y": 3022, "level": 0}, {"x": 3476, "y": 3018, "level": 0}, {
          "x": 3462,
          "y": 3047,
          "level": 0
        }, {"x": 3465, "y": 3034, "level": 0}, {"x": 3502, "y": 3050, "level": 0}, {"x": 3510, "y": 3041, "level": 0}, {"x": 3476, "y": 3057, "level": 0}, {
          "x": 3480,
          "y": 3090,
          "level": 0
        }, {"x": 3473, "y": 3082, "level": 0}, {"x": 3482, "y": 3108, "level": 0}, {"x": 3499, "y": 3104, "level": 0}, {"x": 3505, "y": 3093, "level": 0}, {
          "x": 3401,
          "y": 3099,
          "level": 0
        }, {"x": 3396, "y": 3110, "level": 0}, {"x": 3406, "y": 3126, "level": 0}, {"x": 3433, "y": 3122, "level": 0}, {"x": 3444, "y": 3085, "level": 0}, {
          "x": 3446,
          "y": 3128,
          "level": 0
        }, {"x": 3360, "y": 3095, "level": 0}, {"x": 3387, "y": 3123, "level": 0}, {"x": 3373, "y": 3126, "level": 0}, {"x": 3384, "y": 3081, "level": 0}, {
          "x": 3405,
          "y": 3136,
          "level": 0
        }, {"x": 3409, "y": 3119, "level": 0}, {"x": 3432, "y": 3105, "level": 0}, {"x": 3427, "y": 3141, "level": 0}, {"x": 3444, "y": 3141, "level": 0}, {
          "x": 3435,
          "y": 3129,
          "level": 0
        }, {"x": 3456, "y": 3140, "level": 0}],
        "root": {
          "children": [{
            "key": {"pulse": 1, "different_level": false}, "value": {
              "children": [{
                "key": {"pulse": 1, "different_level": false}, "value": {
                  "children": [{
                    "key": {"pulse": 1, "different_level": false}, "value": {
                      "children": [{
                        "key": {"pulse": 1, "different_level": false}, "value": {
                          "children": [{
                            "key": {"pulse": 2, "different_level": false}, "value": {
                              "children": [{
                                "key": {"pulse": 3, "different_level": false, "spot": {"x": 3502, "y": 3050, "level": 0}},
                                "value": {
                                  "children": [],
                                  "directions": "",
                                  "path": [{
                                    "type": "run",
                                    "waypoints": [{"x": 3490, "y": 3059, "level": 0}, {"x": 3492, "y": 3059, "level": 0}, {"x": 3496, "y": 3055, "level": 0}, {
                                      "x": 3497,
                                      "y": 3055,
                                      "level": 0
                                    }, {"x": 3501, "y": 3051, "level": 0}]
                                  }]
                                }
                              }, {
                                "key": {"pulse": 3, "different_level": false, "spot": {"x": 3510, "y": 3041, "level": 0}},
                                "value": {
                                  "children": [],
                                  "directions": "",
                                  "path": [{"type": "run", "waypoints": [{"x": 3490, "y": 3059, "level": 0}, {"x": 3492, "y": 3059, "level": 0}, {"x": 3509, "y": 3042, "level": 0}]}]
                                }
                              }],
                              "directions": "",
                              "path": [{
                                "type": "run",
                                "waypoints": [{"x": 3479, "y": 3098, "level": 0}, {"x": 3479, "y": 3097, "level": 0}, {"x": 3482, "y": 3094, "level": 0}, {
                                  "x": 3482,
                                  "y": 3091,
                                  "level": 0
                                }]
                              }, {"type": "ability", "ability": "surge", "from": {"x": 3482, "y": 3091, "level": 0}, "to": {"x": 3482, "y": 3081, "level": 0}}, {
                                "type": "run",
                                "waypoints": [{"x": 3482, "y": 3081, "level": 0}, {"x": 3481, "y": 3081, "level": 0}, {"x": 3481, "y": 3080, "level": 0}, {
                                  "x": 3480,
                                  "y": 3080,
                                  "level": 0
                                }, {"x": 3480, "y": 3079, "level": 0}]
                              }, {"type": "ability", "ability": "surge", "from": {"x": 3480, "y": 3079, "level": 0}, "to": {"x": 3480, "y": 3069, "level": 0}}, {
                                "type": "ability",
                                "ability": "dive",
                                "from": {"x": 3480, "y": 3069, "level": 0},
                                "to": {"x": 3490, "y": 3059, "level": 0}
                              }]
                            }
                          }, {
                            "key": {"pulse": 3, "different_level": false, "spot": {"x": 3499, "y": 3104, "level": 0}},
                            "value": {
                              "children": [],
                              "directions": "",
                              "path": [{"type": "run", "waypoints": [{"x": 3479, "y": 3098, "level": 0}, {"x": 3480, "y": 3098, "level": 0}]}, {
                                "type": "ability",
                                "ability": "surge",
                                "from": {"x": 3480, "y": 3098, "level": 0},
                                "to": {"x": 3490, "y": 3098, "level": 0}
                              }, {"type": "ability", "ability": "dive", "from": {"x": 3490, "y": 3098, "level": 0}, "to": {"x": 3499, "y": 3104, "level": 0}}]
                            }
                          }, {
                            "key": {"pulse": 3, "different_level": false, "spot": {"x": 3505, "y": 3093, "level": 0}},
                            "value": {
                              "children": [],
                              "directions": "",
                              "path": [{"type": "run", "waypoints": [{"x": 3479, "y": 3098, "level": 0}, {"x": 3480, "y": 3098, "level": 0}]}, {
                                "type": "ability",
                                "ability": "surge",
                                "from": {"x": 3480, "y": 3098, "level": 0},
                                "to": {"x": 3490, "y": 3098, "level": 0}
                              }, {"type": "ability", "ability": "surge", "from": {"x": 3490, "y": 3098, "level": 0}, "to": {"x": 3500, "y": 3098, "level": 0}}, {
                                "type": "ability",
                                "ability": "dive",
                                "from": {"x": 3500, "y": 3098, "level": 0},
                                "to": {"x": 3505, "y": 3093, "level": 0}
                              }]
                            }
                          }],
                          "directions": "",
                          "path": [{"type": "teleport", "spot": {"x": 3479, "y": 3098, "level": 0}, "id": {"group": "desertamulet", "spot": "uzer", "access": "amulet"}}]
                        }
                      }, {
                        "key": {"pulse": 2, "different_level": false}, "value": {
                          "children": [],
                          "directions": "",
                          "path": [{
                            "type": "run",
                            "waypoints": [{"x": 3424, "y": 3141, "level": 0}, {"x": 3421, "y": 3141, "level": 0}, {"x": 3420, "y": 3140, "level": 0}]
                          }, {"type": "ability", "ability": "dive", "from": {"x": 3420, "y": 3140, "level": 0}, "to": {"x": 3410, "y": 3130, "level": 0}}, {
                            "type": "ability",
                            "ability": "surge",
                            "from": {"x": 3410, "y": 3130, "level": 0},
                            "to": {"x": 3400, "y": 3120, "level": 0}
                          }, {"type": "ability", "ability": "surge", "from": {"x": 3400, "y": 3120, "level": 0}, "to": {"x": 3390, "y": 3110, "level": 0}}, {
                            "type": "run",
                            "waypoints": [{"x": 3390, "y": 3110, "level": 0}, {"x": 3390, "y": 3106, "level": 0}, {"x": 3389, "y": 3106, "level": 0}, {
                              "x": 3386,
                              "y": 3103,
                              "level": 0
                            }, {"x": 3386, "y": 3102, "level": 0}, {"x": 3385, "y": 3101, "level": 0}, {"x": 3385, "y": 3100, "level": 0}, {
                              "x": 3381,
                              "y": 3096,
                              "level": 0
                            }, {"x": 3380, "y": 3096, "level": 0}, {"x": 3379, "y": 3095, "level": 0}, {"x": 3379, "y": 3093, "level": 0}, {
                              "x": 3378,
                              "y": 3092,
                              "level": 0
                            }, {"x": 3368, "y": 3092, "level": 0}]
                          }, {"type": "ability", "ability": "dive", "from": {"x": 3368, "y": 3092, "level": 0}, "to": {"x": 3360, "y": 3095, "level": 0}}]
                        }
                      }], "directions": "", "path": [{"type": "run", "waypoints": [{"x": 3424, "y": 3140, "level": 0}, {"x": 3424, "y": 3141, "level": 0}]}]
                    }
                  }, {
                    "key": {"pulse": 2, "different_level": false}, "value": {
                      "children": [{
                        "key": {"pulse": 2, "different_level": false}, "value": {
                          "children": [{
                            "key": {"pulse": 1, "different_level": false},
                            "value": {
                              "children": [{
                                "key": {"pulse": 3, "different_level": false, "spot": {"x": 3480, "y": 3090, "level": 0}},
                                "value": {
                                  "children": [],
                                  "directions": "",
                                  "path": [{
                                    "type": "ability",
                                    "ability": "dive",
                                    "from": {"x": 3479, "y": 3098, "level": 0},
                                    "to": {"x": 3481, "y": 3091, "level": 0},
                                    "description": "If the teleport lands to the very north or in the south.western corner of the teleport area you the exact tile will not be in range."
                                  }]
                                }
                              }, {
                                "key": {"pulse": 3, "different_level": false, "spot": {"x": 3482, "y": 3108, "level": 0}},
                                "value": {
                                  "children": [],
                                  "directions": "",
                                  "path": [{
                                    "type": "ability",
                                    "ability": "dive",
                                    "from": {"x": 3479, "y": 3098, "level": 0},
                                    "to": {"x": 3482, "y": 3108, "level": 0},
                                    "description": "If you land further to the south, run into range first."
                                  }]
                                }
                              }],
                              "directions": "",
                              "path": [{"type": "teleport", "spot": {"x": 3479, "y": 3098, "level": 0}, "id": {"group": "desertamulet", "spot": "uzer", "access": "amulet"}}]
                            }
                          }, {
                            "key": {"pulse": 2, "different_level": false}, "value": {
                              "children": [{
                                "key": {"pulse": 2, "different_level": false}, "value": {
                                  "children": [{
                                    "key": {"pulse": 1, "different_level": false},
                                    "value": {
                                      "children": [],
                                      "directions": "",
                                      "path": [{
                                        "type": "teleport",
                                        "spot": {"x": 3479, "y": 3098, "level": 0},
                                        "id": {"group": "desertamulet", "spot": "uzer", "access": "amulet"}
                                      }, {"type": "run", "waypoints": [{"x": 3479, "y": 3098, "level": 0}, {"x": 3475, "y": 3094, "level": 0}]}, {
                                        "type": "run",
                                        "waypoints": [{"x": 3475, "y": 3094, "level": 0}, {"x": 3475, "y": 3092, "level": 0}]
                                      }, {
                                        "type": "ability",
                                        "ability": "surge",
                                        "from": {"x": 3475, "y": 3092, "level": 0},
                                        "to": {"x": 3475, "y": 3083, "level": 0}
                                      }, {"type": "run", "waypoints": [{"x": 3475, "y": 3083, "level": 0}, {"x": 3474, "y": 3083, "level": 0}, {"x": 3473, "y": 3082, "level": 0}]}]
                                    }
                                  }, {
                                    "key": {"pulse": 2, "different_level": false},
                                    "value": {
                                      "children": [],
                                      "directions": "",
                                      "path": [{"type": "powerburst", "where": {"x": 3401, "y": 3100, "level": 0}}, {
                                        "type": "ability",
                                        "ability": "surge",
                                        "from": {"x": 3401, "y": 3100, "level": 0},
                                        "to": {"x": 3391, "y": 3090, "level": 0}
                                      }, {
                                        "type": "ability",
                                        "ability": "dive",
                                        "from": {"x": 3391, "y": 3090, "level": 0},
                                        "to": {"x": 3381, "y": 3090, "level": 0}
                                      }, {
                                        "type": "ability",
                                        "ability": "surge",
                                        "from": {"x": 3381, "y": 3090, "level": 0},
                                        "to": {"x": 3371, "y": 3090, "level": 0}
                                      }, {"type": "ability", "ability": "dive", "from": {"x": 3371, "y": 3090, "level": 0}, "to": {"x": 3361, "y": 3095, "level": 0}}]
                                    }
                                  }, {
                                    "key": {"pulse": 3, "different_level": false, "spot": {"x": 3373, "y": 3126, "level": 0}},
                                    "value": {
                                      "children": [],
                                      "directions": "",
                                      "path": [{
                                        "type": "run",
                                        "waypoints": [{"x": 3401, "y": 3100, "level": 0}, {"x": 3400, "y": 3100, "level": 0}, {"x": 3395, "y": 3105, "level": 0}, {
                                          "x": 3395,
                                          "y": 3107,
                                          "level": 0
                                        }, {"x": 3390, "y": 3112, "level": 0}, {"x": 3388, "y": 3112, "level": 0}, {"x": 3386, "y": 3114, "level": 0}, {
                                          "x": 3386,
                                          "y": 3115,
                                          "level": 0
                                        }, {"x": 3384, "y": 3117, "level": 0}]
                                      }, {"type": "ability", "ability": "surge", "from": {"x": 3384, "y": 3117, "level": 0}, "to": {"x": 3374, "y": 3127, "level": 0}}]
                                    }
                                  }],
                                  "directions": "",
                                  "path": [{"type": "run", "waypoints": [{"x": 3413, "y": 3112, "level": 0}, {"x": 3411, "y": 3110, "level": 0}]}, {
                                    "type": "ability",
                                    "ability": "dive",
                                    "from": {"x": 3411, "y": 3110, "level": 0},
                                    "to": {"x": 3401, "y": 3100, "level": 0}
                                  }]
                                }
                              }, {
                                "key": {"pulse": 3, "different_level": false, "spot": {"x": 3444, "y": 3085, "level": 0}},
                                "value": {
                                  "children": [],
                                  "directions": "",
                                  "path": [{
                                    "type": "ability",
                                    "ability": "dive",
                                    "from": {"x": 3413, "y": 3112, "level": 0},
                                    "to": {"x": 3423, "y": 3102, "level": 0}
                                  }, {"type": "run", "waypoints": [{"x": 3423, "y": 3102, "level": 0}, {"x": 3427, "y": 3102, "level": 0}, {"x": 3443, "y": 3086, "level": 0}]}]
                                }
                              }, {
                                "key": {"pulse": 3, "different_level": false, "spot": {"x": 3384, "y": 3081, "level": 0}},
                                "value": {
                                  "children": [],
                                  "directions": "",
                                  "path": [{"type": "run", "waypoints": [{"x": 3413, "y": 3112, "level": 0}, {"x": 3411, "y": 3110, "level": 0}]}, {
                                    "type": "ability",
                                    "ability": "dive",
                                    "from": {"x": 3411, "y": 3110, "level": 0},
                                    "to": {"x": 3401, "y": 3100, "level": 0}
                                  }, {"type": "run", "waypoints": [{"x": 3401, "y": 3100, "level": 0}, {"x": 3401, "y": 3098, "level": 0}, {"x": 3385, "y": 3082, "level": 0}]}]
                                }
                              }],
                              "directions": "",
                              "path": [{"type": "run", "waypoints": [{"x": 3413, "y": 3130, "level": 0}, {"x": 3413, "y": 3128, "level": 0}]}, {
                                "type": "ability",
                                "ability": "surge",
                                "from": {"x": 3413, "y": 3128, "level": 0},
                                "to": {"x": 3413, "y": 3118, "level": 0}
                              }, {"type": "run", "waypoints": [{"x": 3413, "y": 3118, "level": 0}, {"x": 3413, "y": 3112, "level": 0}]}]
                            }
                          }, {
                            "key": {"pulse": 3, "different_level": false, "spot": {"x": 3401, "y": 3099, "level": 0}},
                            "value": {
                              "children": [],
                              "directions": "",
                              "path": [{"type": "run", "waypoints": [{"x": 3413, "y": 3130, "level": 0}, {"x": 3413, "y": 3128, "level": 0}]}, {
                                "type": "ability",
                                "ability": "surge",
                                "from": {"x": 3413, "y": 3128, "level": 0},
                                "to": {"x": 3413, "y": 3118, "level": 0}
                              }, {"type": "run", "waypoints": [{"x": 3413, "y": 3118, "level": 0}, {"x": 3413, "y": 3114, "level": 0}]}, {
                                "type": "ability",
                                "ability": "dive",
                                "from": {"x": 3413, "y": 3114, "level": 0},
                                "to": {"x": 3403, "y": 3104, "level": 0}
                              }, {
                                "type": "run",
                                "waypoints": [{"x": 3403, "y": 3104, "level": 0}, {"x": 3402, "y": 3104, "level": 0}, {"x": 3401, "y": 3103, "level": 0}, {
                                  "x": 3401,
                                  "y": 3100,
                                  "level": 0
                                }]
                              }]
                            }
                          }, {
                            "key": {"pulse": 3, "different_level": false, "spot": {"x": 3387, "y": 3123, "level": 0}},
                            "value": {
                              "children": [],
                              "directions": "",
                              "path": [{"type": "run", "waypoints": [{"x": 3413, "y": 3130, "level": 0}, {"x": 3411, "y": 3130, "level": 0}]}, {
                                "type": "ability",
                                "ability": "surge",
                                "from": {"x": 3411, "y": 3130, "level": 0},
                                "to": {"x": 3401, "y": 3130, "level": 0}
                              }, {"type": "ability", "ability": "dive", "from": {"x": 3401, "y": 3130, "level": 0}, "to": {"x": 3391, "y": 3120, "level": 0}}, {
                                "type": "run",
                                "waypoints": [{"x": 3391, "y": 3120, "level": 0}, {"x": 3390, "y": 3120, "level": 0}, {"x": 3387, "y": 3123, "level": 0}]
                              }]
                            }
                          }, {
                            "key": {"pulse": 3, "different_level": false, "spot": {"x": 3432, "y": 3105, "level": 0}},
                            "value": {
                              "children": [],
                              "directions": "",
                              "path": [{
                                "type": "ability",
                                "ability": "dive",
                                "from": {"x": 3413, "y": 3130, "level": 0},
                                "to": {"x": 3423, "y": 3120, "level": 0}
                              }, {"type": "ability", "ability": "surge", "from": {"x": 3423, "y": 3120, "level": 0}, "to": {"x": 3433, "y": 3110, "level": 0}}, {
                                "type": "run",
                                "waypoints": [{"x": 3433, "y": 3110, "level": 0}, {"x": 3433, "y": 3106, "level": 0}]
                              }]
                            }
                          }],
                          "directions": "",
                          "path": [{"type": "run", "waypoints": [{"x": 3424, "y": 3141, "level": 0}, {"x": 3423, "y": 3140, "level": 0}]}, {
                            "type": "ability",
                            "ability": "surge",
                            "from": {"x": 3423, "y": 3140, "level": 0},
                            "to": {"x": 3413, "y": 3130, "level": 0}
                          }]
                        }
                      }, {
                        "key": {"pulse": 3, "different_level": false, "spot": {"x": 3456, "y": 3140, "level": 0}},
                        "value": {
                          "children": [],
                          "directions": "",
                          "path": [{"type": "ability", "ability": "dive", "from": {"x": 3424, "y": 3141, "level": 0}, "to": {"x": 3434, "y": 3141, "level": 0}}, {
                            "type": "ability",
                            "ability": "surge",
                            "from": {"x": 3434, "y": 3141, "level": 0},
                            "to": {"x": 3444, "y": 3141, "level": 0}
                          }, {"type": "run", "waypoints": [{"x": 3444, "y": 3141, "level": 0}, {"x": 3446, "y": 3141, "level": 0}]}, {
                            "type": "ability",
                            "ability": "surge",
                            "from": {"x": 3446, "y": 3141, "level": 0},
                            "to": {"x": 3456, "y": 3141, "level": 0}
                          }]
                        }
                      }],
                      "directions": "",
                      "path": [{"type": "run", "waypoints": [{"x": 3424, "y": 3140, "level": 0}, {"x": 3424, "y": 3141, "level": 0}]}],
                      "region": {"area": {"origin": {"x": 3424, "y": 3138, "level": 0}, "size": {"x": 1, "y": 4}}, "name": ""}
                    }
                  }, {
                    "key": {"pulse": 3, "different_level": false, "spot": {"x": 3396, "y": 3110, "level": 0}},
                    "value": {
                      "children": [],
                      "directions": "",
                      "path": [{"type": "ability", "ability": "surge", "from": {"x": 3424, "y": 3140, "level": 0}, "to": {"x": 3414, "y": 3130, "level": 0}}, {
                        "type": "run",
                        "waypoints": [{"x": 3414, "y": 3130, "level": 0}, {"x": 3413, "y": 3130, "level": 0}, {"x": 3410, "y": 3127, "level": 0}, {
                          "x": 3408,
                          "y": 3127,
                          "level": 0
                        }, {"x": 3406, "y": 3125, "level": 0}]
                      }, {"type": "ability", "ability": "surge", "from": {"x": 3406, "y": 3125, "level": 0}, "to": {"x": 3396, "y": 3115, "level": 0}}, {
                        "type": "ability",
                        "ability": "dive",
                        "from": {"x": 3396, "y": 3115, "level": 0},
                        "to": {"x": 3396, "y": 3110, "level": 0}
                      }]
                    }
                  }, {
                    "key": {"pulse": 3, "different_level": false, "spot": {"x": 3406, "y": 3126, "level": 0}},
                    "value": {
                      "children": [],
                      "directions": "",
                      "path": [{"type": "ability", "ability": "surge", "from": {"x": 3424, "y": 3140, "level": 0}, "to": {"x": 3414, "y": 3130, "level": 0}}, {
                        "type": "ability",
                        "ability": "dive",
                        "from": {"x": 3414, "y": 3130, "level": 0},
                        "to": {"x": 3406, "y": 3126, "level": 0}
                      }]
                    }
                  }, {
                    "key": {"pulse": 3, "different_level": false, "spot": {"x": 3433, "y": 3122, "level": 0}},
                    "value": {
                      "children": [],
                      "directions": "",
                      "path": [{"type": "run", "waypoints": [{"x": 3424, "y": 3140, "level": 0}, {"x": 3426, "y": 3138, "level": 0}]}, {
                        "type": "ability",
                        "ability": "surge",
                        "from": {"x": 3426, "y": 3138, "level": 0},
                        "to": {"x": 3436, "y": 3128, "level": 0}
                      }, {"type": "ability", "ability": "dive", "from": {"x": 3436, "y": 3128, "level": 0}, "to": {"x": 3433, "y": 3122, "level": 0}}]
                    }
                  }, {
                    "key": {"pulse": 3, "different_level": false, "spot": {"x": 3446, "y": 3128, "level": 0}},
                    "value": {
                      "children": [],
                      "directions": "",
                      "path": [{"type": "run", "waypoints": [{"x": 3424, "y": 3140, "level": 0}, {"x": 3426, "y": 3138, "level": 0}]}, {
                        "type": "ability",
                        "ability": "surge",
                        "from": {"x": 3426, "y": 3138, "level": 0},
                        "to": {"x": 3436, "y": 3128, "level": 0}
                      }, {"type": "ability", "ability": "dive", "from": {"x": 3436, "y": 3128, "level": 0}, "to": {"x": 3446, "y": 3128, "level": 0}}]
                    }
                  }, {
                    "key": {"pulse": 3, "different_level": false, "spot": {"x": 3405, "y": 3136, "level": 0}},
                    "value": {
                      "children": [],
                      "directions": "",
                      "path": [{"type": "ability", "ability": "surge", "from": {"x": 3424, "y": 3140, "level": 0}, "to": {"x": 3414, "y": 3130, "level": 0}}, {
                        "type": "ability",
                        "ability": "dive",
                        "from": {"x": 3414, "y": 3130, "level": 0},
                        "to": {"x": 3406, "y": 3136, "level": 0},
                        "description": "Diving to the tile east of the spot should always be possible, no matter where the teleport landed."
                      }]
                    }
                  }, {
                    "key": {"pulse": 3, "different_level": false, "spot": {"x": 3409, "y": 3119, "level": 0}},
                    "value": {
                      "children": [],
                      "directions": "",
                      "path": [{"type": "ability", "ability": "surge", "from": {"x": 3424, "y": 3140, "level": 0}, "to": {"x": 3414, "y": 3130, "level": 0}}, {
                        "type": "ability",
                        "ability": "dive",
                        "from": {"x": 3414, "y": 3130, "level": 0},
                        "to": {"x": 3407, "y": 3123, "level": 0}
                      }, {
                        "type": "run",
                        "waypoints": [{"x": 3407, "y": 3123, "level": 0}, {"x": 3408, "y": 3122, "level": 0}, {"x": 3408, "y": 3120, "level": 0}, {"x": 3409, "y": 3119, "level": 0}]
                      }]
                    }
                  }, {
                    "key": {"pulse": 3, "different_level": false, "spot": {"x": 3427, "y": 3141, "level": 0}},
                    "value": {
                      "children": [],
                      "directions": "",
                      "path": [{"type": "run", "waypoints": [{"x": 3424, "y": 3140, "level": 0}, {"x": 3426, "y": 3140, "level": 0}, {"x": 3427, "y": 3141, "level": 0}]}]
                    }
                  }, {
                    "key": {"pulse": 3, "different_level": false, "spot": {"x": 3444, "y": 3141, "level": 0}},
                    "value": {
                      "children": [],
                      "directions": "",
                      "path": [{
                        "type": "run",
                        "waypoints": [{"x": 3424, "y": 3140, "level": 0}, {"x": 3424, "y": 3141, "level": 0}],
                        "description": "Stepping in front of the cave entrance lines up a perfect {{dive}}-{{surge}} combination."
                      }, {"type": "ability", "ability": "dive", "from": {"x": 3424, "y": 3141, "level": 0}, "to": {"x": 3434, "y": 3141, "level": 0}}, {
                        "type": "ability",
                        "ability": "surge",
                        "from": {"x": 3434, "y": 3141, "level": 0},
                        "to": {"x": 3444, "y": 3141, "level": 0}
                      }]
                    }
                  }, {
                    "key": {"pulse": 3, "different_level": false, "spot": {"x": 3435, "y": 3129, "level": 0}},
                    "value": {
                      "children": [],
                      "directions": "",
                      "path": [{
                        "type": "run",
                        "waypoints": [{"x": 3424, "y": 3140, "level": 0}, {"x": 3425, "y": 3139, "level": 0}],
                        "description": "Stepping on any tile in a 3x3 area around the marked spot and then {{dive}}ing south-east lands you on the spot."
                      }, {"type": "ability", "ability": "dive", "from": {"x": 3425, "y": 3139, "level": 0}, "to": {"x": 3435, "y": 3129, "level": 0}}]
                    }
                  }, {
                    "key": {"pulse": 3, "different_level": false, "spot": {"x": 3456, "y": 3140, "level": 0}},
                    "value": {
                      "children": [],
                      "directions": "",
                      "path": [{"type": "run", "waypoints": [{"x": 3424, "y": 3140, "level": 0}, {"x": 3424, "y": 3141, "level": 0}]}, {
                        "type": "ability",
                        "ability": "dive",
                        "from": {"x": 3424, "y": 3141, "level": 0},
                        "to": {"x": 3434, "y": 3141, "level": 0}
                      }, {"type": "ability", "ability": "surge", "from": {"x": 3434, "y": 3141, "level": 0}, "to": {"x": 3444, "y": 3141, "level": 0}}, {
                        "type": "run",
                        "waypoints": [{"x": 3444, "y": 3141, "level": 0}, {"x": 3446, "y": 3141, "level": 0}]
                      }, {"type": "ability", "ability": "surge", "from": {"x": 3446, "y": 3141, "level": 0}, "to": {"x": 3456, "y": 3141, "level": 0}}]
                    }
                  }],
                  "directions": "",
                  "path": [{"type": "teleport", "spot": {"x": 3424, "y": 3140, "level": 0}, "id": {"group": "travellersnecklace", "spot": "deserteagle", "access": "ring"}}]
                }
              }, {
                "key": {"pulse": 2, "different_level": false},
                "value": {
                  "children": [],
                  "directions": "",
                  "path": [{"type": "teleport", "spot": {"x": 3432, "y": 2917, "level": 0}, "id": {"group": "desertamulet", "spot": "nardah", "access": "amulet"}}, {
                    "type": "run",
                    "waypoints": [{"x": 3432, "y": 2917, "level": 0}, {"x": 3432, "y": 2923, "level": 0}, {"x": 3434, "y": 2925, "level": 0}, {"x": 3434, "y": 2926, "level": 0}]
                  }, {"type": "ability", "ability": "surge", "from": {"x": 3434, "y": 2926, "level": 0}, "to": {"x": 3434, "y": 2936, "level": 0}}, {
                    "type": "ability",
                    "ability": "dive",
                    "from": {"x": 3434, "y": 2936, "level": 0},
                    "to": {"x": 3424, "y": 2946, "level": 0}
                  }, {"type": "run", "waypoints": [{"x": 3424, "y": 2946, "level": 0}, {"x": 3422, "y": 2948, "level": 0}]}]
                }
              }], "directions": "", "path": [{"type": "run", "waypoints": [{"x": 3423, "y": 3016, "level": 0}, {"x": 3419, "y": 3012, "level": 0}]}]
            }
          }, {
            "key": {"pulse": 2, "different_level": false}, "value": {
              "children": [{
                "key": {"pulse": 1, "different_level": false}, "value": {
                  "children": [{
                    "key": {"pulse": 3, "different_level": false, "spot": {"x": 3476, "y": 3018, "level": 0}},
                    "value": {
                      "children": [],
                      "directions": "",
                      "path": [{"type": "ability", "ability": "surge", "from": {"x": 3453, "y": 3026, "level": 0}, "to": {"x": 3463, "y": 3036, "level": 0}}, {
                        "type": "ability",
                        "ability": "dive",
                        "from": {"x": 3463, "y": 3036, "level": 0},
                        "to": {"x": 3473, "y": 3026, "level": 0}
                      }, {"type": "ability", "ability": "dive", "from": {"x": 3473, "y": 3026, "level": 0}, "to": {"x": 3476, "y": 3018, "level": 0}}]
                    }
                  }, {
                    "key": {"pulse": 3, "different_level": false, "spot": {"x": 3476, "y": 3057, "level": 0}},
                    "value": {
                      "children": [],
                      "directions": "",
                      "path": [{"type": "ability", "ability": "surge", "from": {"x": 3453, "y": 3026, "level": 0}, "to": {"x": 3463, "y": 3036, "level": 0}}, {
                        "type": "ability",
                        "ability": "dive",
                        "from": {"x": 3463, "y": 3036, "level": 0},
                        "to": {"x": 3473, "y": 3036, "level": 0}
                      }, {"type": "run", "waypoints": [{"x": 3473, "y": 3036, "level": 0}, {"x": 3475, "y": 3038, "level": 0}]}, {
                        "type": "ability",
                        "ability": "surge",
                        "from": {"x": 3475, "y": 3038, "level": 0},
                        "to": {"x": 3485, "y": 3048, "level": 0}
                      }, {"type": "ability", "ability": "dive", "from": {"x": 3485, "y": 3048, "level": 0}, "to": {"x": 3476, "y": 3057, "level": 0}}]
                    }
                  }],
                  "directions": "",
                  "path": [{"type": "ability", "ability": "dive", "from": {"x": 3411, "y": 3004, "level": 0}, "to": {"x": 3421, "y": 3004, "level": 0}}, {
                    "type": "ability",
                    "ability": "surge",
                    "from": {"x": 3421, "y": 3004, "level": 0},
                    "to": {"x": 3431, "y": 3004, "level": 0}
                  }, {"type": "run", "waypoints": [{"x": 3431, "y": 3004, "level": 0}, {"x": 3433, "y": 3006, "level": 0}]}, {
                    "type": "powerburst",
                    "where": {"x": 3433, "y": 3006, "level": 0}
                  }, {"type": "ability", "ability": "surge", "from": {"x": 3433, "y": 3006, "level": 0}, "to": {"x": 3443, "y": 3016, "level": 0}}, {
                    "type": "ability",
                    "ability": "dive",
                    "from": {"x": 3443, "y": 3016, "level": 0},
                    "to": {"x": 3453, "y": 3026, "level": 0}
                  }]
                }
              }, {
                "key": {"pulse": 2, "different_level": false}, "value": {
                  "children": [{
                    "key": {"pulse": 1, "different_level": false}, "value": {
                      "children": [{
                        "key": {"pulse": 3, "different_level": false, "spot": {"x": 3448, "y": 3063, "level": 0}},
                        "value": {
                          "children": [],
                          "directions": "",
                          "path": [{
                            "type": "run",
                            "waypoints": [{"x": 3422, "y": 3032, "level": 0}, {"x": 3422, "y": 3033, "level": 0}, {"x": 3423, "y": 3034, "level": 0}]
                          }, {"type": "ability", "ability": "surge", "from": {"x": 3423, "y": 3034, "level": 0}, "to": {"x": 3433, "y": 3044, "level": 0}}, {
                            "type": "ability",
                            "ability": "dive",
                            "from": {"x": 3433, "y": 3044, "level": 0},
                            "to": {"x": 3443, "y": 3054, "level": 0}
                          }, {"type": "run", "waypoints": [{"x": 3443, "y": 3054, "level": 0}, {"x": 3443, "y": 3058, "level": 0}, {"x": 3447, "y": 3062, "level": 0}]}]
                        }
                      }, {
                        "key": {"pulse": 3, "different_level": false, "spot": {"x": 3401, "y": 3064, "level": 0}},
                        "value": {
                          "children": [],
                          "directions": "",
                          "path": [{
                            "type": "run",
                            "waypoints": [{"x": 3422, "y": 3032, "level": 0}, {"x": 3422, "y": 3035, "level": 0}, {"x": 3421, "y": 3036, "level": 0}]
                          }, {"type": "ability", "ability": "surge", "from": {"x": 3421, "y": 3036, "level": 0}, "to": {"x": 3411, "y": 3046, "level": 0}}, {
                            "type": "ability",
                            "ability": "surge",
                            "from": {"x": 3411, "y": 3046, "level": 0},
                            "to": {"x": 3401, "y": 3056, "level": 0}
                          }, {"type": "ability", "ability": "dive", "from": {"x": 3401, "y": 3056, "level": 0}, "to": {"x": 3401, "y": 3064, "level": 0}}]
                        }
                      }],
                      "directions": "",
                      "path": [{"type": "run", "waypoints": [{"x": 3421, "y": 2994, "level": 0}, {"x": 3421, "y": 2996, "level": 0}]}, {
                        "type": "ability",
                        "ability": "surge",
                        "from": {"x": 3421, "y": 2996, "level": 0},
                        "to": {"x": 3421, "y": 3006, "level": 0}
                      }, {
                        "type": "run",
                        "waypoints": [{"x": 3421, "y": 3006, "level": 0}, {"x": 3421, "y": 3014, "level": 0}, {"x": 3422, "y": 3015, "level": 0}, {"x": 3422, "y": 3032, "level": 0}]
                      }]
                    }
                  }, {
                    "key": {"pulse": 2, "different_level": false}, "value": {
                      "children": [{
                        "key": {"pulse": 1, "different_level": false},
                        "value": {
                          "children": [],
                          "directions": "",
                          "path": [{
                            "type": "teleport",
                            "spot": {"x": 3423, "y": 3016, "level": 0},
                            "id": {"group": "fairyring", "spot": "DLQ", "access": "portable_fairy_ring"}
                          }, {
                            "type": "run",
                            "waypoints": [{"x": 3423, "y": 3016, "level": 0}, {"x": 3423, "y": 3020, "level": 0}, {"x": 3430, "y": 3027, "level": 0}, {
                              "x": 3430,
                              "y": 3028,
                              "level": 0
                            }]
                          }, {"type": "ability", "ability": "surge", "from": {"x": 3430, "y": 3028, "level": 0}, "to": {"x": 3430, "y": 3038, "level": 0}}, {
                            "type": "ability",
                            "ability": "surge",
                            "from": {"x": 3430, "y": 3038, "level": 0},
                            "to": {"x": 3430, "y": 3048, "level": 0}
                          }, {"type": "ability", "ability": "dive", "from": {"x": 3430, "y": 3048, "level": 0}, "to": {"x": 3422, "y": 3051, "level": 0}}]
                        }
                      }, {
                        "key": {"pulse": 2, "different_level": false}, "value": {
                          "children": [{
                            "key": {"pulse": 2, "different_level": false},
                            "value": {
                              "children": [],
                              "directions": "",
                              "path": [{
                                "type": "ability",
                                "ability": "dive",
                                "from": {"x": 3452, "y": 3006, "level": 0},
                                "to": {"x": 3452, "y": 3016, "level": 0}
                              }, {"type": "ability", "ability": "surge", "from": {"x": 3452, "y": 3016, "level": 0}, "to": {"x": 3452, "y": 3026, "level": 0}}, {
                                "type": "ability",
                                "ability": "surge",
                                "from": {"x": 3452, "y": 3026, "level": 0},
                                "to": {"x": 3452, "y": 3036, "level": 0}
                              }, {"type": "ability", "ability": "dive", "from": {"x": 3452, "y": 3036, "level": 0}, "to": {"x": 3462, "y": 3046, "level": 0}}]
                            }
                          }, {
                            "key": {"pulse": 3, "different_level": false, "spot": {"x": 3460, "y": 3022, "level": 0}},
                            "value": {
                              "children": [],
                              "directions": "",
                              "path": [{
                                "type": "ability",
                                "ability": "surge",
                                "from": {"x": 3452, "y": 3006, "level": 0},
                                "to": {"x": 3462, "y": 3016, "level": 0}
                              }, {"type": "ability", "ability": "dive", "from": {"x": 3462, "y": 3016, "level": 0}, "to": {"x": 3460, "y": 3022, "level": 0}}]
                            }
                          }, {
                            "key": {"pulse": 3, "different_level": false, "spot": {"x": 3465, "y": 3034, "level": 0}},
                            "value": {
                              "children": [],
                              "directions": "",
                              "path": [{
                                "type": "ability",
                                "ability": "dive",
                                "from": {"x": 3452, "y": 3006, "level": 0},
                                "to": {"x": 3452, "y": 3016, "level": 0}
                              }, {"type": "ability", "ability": "surge", "from": {"x": 3452, "y": 3016, "level": 0}, "to": {"x": 3452, "y": 3026, "level": 0}}, {
                                "type": "ability",
                                "ability": "dive",
                                "from": {"x": 3452, "y": 3026, "level": 0},
                                "to": {"x": 3462, "y": 3036, "level": 0}
                              }, {"type": "run", "waypoints": [{"x": 3462, "y": 3036, "level": 0}, {"x": 3463, "y": 3036, "level": 0}, {"x": 3464, "y": 3035, "level": 0}]}]
                            }
                          }],
                          "directions": "",
                          "path": [{
                            "type": "run",
                            "waypoints": [{"x": 3431, "y": 2984, "level": 0}, {"x": 3431, "y": 2985, "level": 0}, {"x": 3432, "y": 2986, "level": 0}]
                          }, {"type": "powerburst", "where": {"x": 3432, "y": 2986, "level": 0}}, {
                            "type": "ability",
                            "ability": "dive",
                            "from": {"x": 3432, "y": 2986, "level": 0},
                            "to": {"x": 3442, "y": 2996, "level": 0}
                          }, {"type": "ability", "ability": "surge", "from": {"x": 3442, "y": 2996, "level": 0}, "to": {"x": 3452, "y": 3006, "level": 0}}]
                        }
                      }, {
                        "key": {"pulse": 3, "different_level": false, "spot": {"x": 3444, "y": 2952, "level": 0}},
                        "value": {
                          "children": [],
                          "directions": "",
                          "path": [{
                            "type": "run",
                            "waypoints": [{"x": 3431, "y": 2984, "level": 0}, {"x": 3431, "y": 2966, "level": 0}, {"x": 3441, "y": 2956, "level": 0}, {
                              "x": 3441,
                              "y": 2955,
                              "level": 0
                            }, {"x": 3444, "y": 2952, "level": 0}]
                          }]
                        }
                      }, {
                        "key": {"pulse": 3, "different_level": false, "spot": {"x": 3438, "y": 2960, "level": 0}},
                        "value": {
                          "children": [],
                          "directions": "",
                          "path": [{"type": "run", "waypoints": [{"x": 3431, "y": 2984, "level": 0}, {"x": 3431, "y": 2967, "level": 0}, {"x": 3438, "y": 2960, "level": 0}]}]
                        }
                      }, {
                        "key": {"pulse": 3, "different_level": false, "spot": {"x": 3417, "y": 2959, "level": 0}},
                        "value": {
                          "children": [],
                          "directions": "",
                          "path": [{
                            "type": "run",
                            "waypoints": [{"x": 3431, "y": 2984, "level": 0}, {"x": 3431, "y": 2979, "level": 0}, {"x": 3422, "y": 2970, "level": 0}, {
                              "x": 3422,
                              "y": 2964,
                              "level": 0
                            }, {"x": 3418, "y": 2960, "level": 0}]
                          }]
                        }
                      }], "directions": "", "path": [{"type": "ability", "ability": "surge", "from": {"x": 3421, "y": 2994, "level": 0}, "to": {"x": 3431, "y": 2984, "level": 0}}]
                    }
                  }, {
                    "key": {"pulse": 3, "different_level": false, "spot": {"x": 3447, "y": 2967, "level": 0}},
                    "value": {
                      "children": [],
                      "directions": "",
                      "path": [{"type": "ability", "ability": "surge", "from": {"x": 3421, "y": 2994, "level": 0}, "to": {"x": 3431, "y": 2984, "level": 0}}, {
                        "type": "run",
                        "waypoints": [{"x": 3431, "y": 2984, "level": 0}, {"x": 3431, "y": 2983, "level": 0}, {"x": 3446, "y": 2968, "level": 0}]
                      }]
                    }
                  }, {
                    "key": {"pulse": 3, "different_level": false, "spot": {"x": 3427, "y": 2970, "level": 0}},
                    "value": {
                      "children": [],
                      "directions": "",
                      "path": [{"type": "ability", "ability": "surge", "from": {"x": 3421, "y": 2994, "level": 0}, "to": {"x": 3431, "y": 2984, "level": 0}}, {
                        "type": "run",
                        "waypoints": [{"x": 3431, "y": 2984, "level": 0}, {"x": 3431, "y": 2974, "level": 0}, {"x": 3428, "y": 2971, "level": 0}]
                      }]
                    }
                  }], "directions": "", "path": [{"type": "ability", "ability": "dive", "from": {"x": 3411, "y": 3004, "level": 0}, "to": {"x": 3421, "y": 2994, "level": 0}}]
                }
              }, {
                "key": {"pulse": 3, "different_level": false, "spot": {"x": 3442, "y": 2974, "level": 0}},
                "value": {
                  "children": [],
                  "directions": "",
                  "path": [{"type": "ability", "ability": "dive", "from": {"x": 3411, "y": 3004, "level": 0}, "to": {"x": 3421, "y": 2994, "level": 0}}, {
                    "type": "ability",
                    "ability": "surge",
                    "from": {"x": 3421, "y": 2994, "level": 0},
                    "to": {"x": 3431, "y": 2984, "level": 0}
                  }, {"type": "run", "waypoints": [{"x": 3431, "y": 2984, "level": 0}, {"x": 3432, "y": 2984, "level": 0}, {"x": 3441, "y": 2975, "level": 0}]}]
                }
              }, {
                "key": {"pulse": 3, "different_level": false, "spot": {"x": 3382, "y": 3015, "level": 0}},
                "value": {
                  "children": [],
                  "directions": "",
                  "path": [{"type": "ability", "ability": "dive", "from": {"x": 3411, "y": 3004, "level": 0}, "to": {"x": 3401, "y": 3014, "level": 0}}, {
                    "type": "run",
                    "waypoints": [{"x": 3401, "y": 3014, "level": 0}, {"x": 3399, "y": 3014, "level": 0}],
                    "to_text": "west",
                    "description": "Click the target spot and surge anytime on the way there."
                  }, {"type": "ability", "ability": "surge", "from": {"x": 3399, "y": 3014, "level": 0}, "to": {"x": 3389, "y": 3014, "level": 0}}, {
                    "type": "run",
                    "waypoints": [{"x": 3389, "y": 3014, "level": 0}, {"x": 3383, "y": 3014, "level": 0}, {"x": 3382, "y": 3015, "level": 0}]
                  }]
                }
              }, {
                "key": {"pulse": 3, "different_level": false, "spot": {"x": 3385, "y": 3024, "level": 0}},
                "value": {
                  "children": [],
                  "directions": "",
                  "path": [{"type": "ability", "ability": "dive", "from": {"x": 3411, "y": 3004, "level": 0}, "to": {"x": 3401, "y": 3014, "level": 0}}, {
                    "type": "ability",
                    "ability": "surge",
                    "from": {"x": 3401, "y": 3014, "level": 0},
                    "to": {"x": 3391, "y": 3024, "level": 0}
                  }, {"type": "run", "waypoints": [{"x": 3391, "y": 3024, "level": 0}, {"x": 3385, "y": 3024, "level": 0}]}]
                }
              }, {
                "key": {"pulse": 3, "different_level": false, "spot": {"x": 3383, "y": 3018, "level": 0}},
                "value": {
                  "children": [],
                  "directions": "",
                  "path": [{"type": "ability", "ability": "dive", "from": {"x": 3411, "y": 3004, "level": 0}, "to": {"x": 3401, "y": 3014, "level": 0}}, {
                    "type": "run",
                    "waypoints": [{"x": 3401, "y": 3014, "level": 0}, {"x": 3399, "y": 3014, "level": 0}],
                    "to_text": "west",
                    "description": "Click the target spot and surge after 1 or 2 ticks for the optimal path"
                  }, {"type": "ability", "ability": "surge", "from": {"x": 3399, "y": 3014, "level": 0}, "to": {"x": 3389, "y": 3014, "level": 0}}, {
                    "type": "run",
                    "waypoints": [{"x": 3389, "y": 3014, "level": 0}, {"x": 3387, "y": 3014, "level": 0}, {"x": 3383, "y": 3018, "level": 0}]
                  }]
                }
              }],
              "directions": "",
              "path": [{"type": "run", "waypoints": [{"x": 3423, "y": 3016, "level": 0}, {"x": 3421, "y": 3014, "level": 0}]}, {
                "type": "ability",
                "ability": "surge",
                "from": {"x": 3421, "y": 3014, "level": 0},
                "to": {"x": 3411, "y": 3004, "level": 0}
              }]
            }
          }, {
            "key": {"pulse": 3, "different_level": false, "spot": {"x": 3408, "y": 2986, "level": 0}},
            "value": {
              "children": [],
              "directions": "",
              "path": [{"type": "run", "waypoints": [{"x": 3423, "y": 3016, "level": 0}, {"x": 3423, "y": 3014, "level": 0}]}, {
                "type": "ability",
                "ability": "surge",
                "from": {"x": 3423, "y": 3014, "level": 0},
                "to": {"x": 3423, "y": 3004, "level": 0}
              }, {"type": "run", "waypoints": [{"x": 3423, "y": 3004, "level": 0}, {"x": 3421, "y": 3002, "level": 0}]}, {
                "type": "ability",
                "ability": "surge",
                "from": {"x": 3421, "y": 3002, "level": 0},
                "to": {"x": 3411, "y": 2992, "level": 0}
              }, {"type": "ability", "ability": "dive", "from": {"x": 3411, "y": 2992, "level": 0}, "to": {"x": 3408, "y": 2986, "level": 0}}]
            }
          }, {
            "key": {"pulse": 3, "different_level": false, "spot": {"x": 3426, "y": 2984, "level": 0}},
            "value": {
              "children": [],
              "directions": "",
              "path": [{"type": "run", "waypoints": [{"x": 3423, "y": 3016, "level": 0}, {"x": 3423, "y": 3014, "level": 0}]}, {
                "type": "ability",
                "ability": "surge",
                "from": {"x": 3423, "y": 3014, "level": 0},
                "to": {"x": 3423, "y": 3004, "level": 0}
              }, {"type": "ability", "ability": "surge", "from": {"x": 3423, "y": 3004, "level": 0}, "to": {"x": 3423, "y": 2994, "level": 0}}, {
                "type": "ability",
                "ability": "dive",
                "from": {"x": 3423, "y": 2994, "level": 0},
                "to": {"x": 3426, "y": 2984, "level": 0}
              }]
            }
          }, {
            "key": {"pulse": 3, "different_level": false, "spot": {"x": 3436, "y": 2989, "level": 0}},
            "value": {
              "children": [],
              "directions": "",
              "path": [{"type": "run", "waypoints": [{"x": 3423, "y": 3016, "level": 0}, {"x": 3423, "y": 3014, "level": 0}]}, {
                "type": "ability",
                "ability": "surge",
                "from": {"x": 3423, "y": 3014, "level": 0},
                "to": {"x": 3423, "y": 3004, "level": 0}
              }, {
                "type": "run",
                "waypoints": [{"x": 3423, "y": 3004, "level": 0}, {"x": 3423, "y": 3002, "level": 0}, {"x": 3425, "y": 3000, "level": 0}],
                "description": "Clicking the target spot will automatically take you to this tile. Run for 2 or 3 ticks and then surge and you will land on the target."
              }, {"type": "ability", "ability": "surge", "from": {"x": 3425, "y": 3000, "level": 0}, "to": {"x": 3435, "y": 2990, "level": 0}}]
            }
          }, {
            "key": {"pulse": 3, "different_level": false, "spot": {"x": 3406, "y": 3003, "level": 0}},
            "value": {
              "children": [],
              "directions": "",
              "path": [{"type": "run", "waypoints": [{"x": 3423, "y": 3016, "level": 0}, {"x": 3422, "y": 3015, "level": 0}]}, {
                "type": "ability",
                "ability": "surge",
                "from": {"x": 3422, "y": 3015, "level": 0},
                "to": {"x": 3412, "y": 3005, "level": 0}
              }, {"type": "ability", "ability": "dive", "from": {"x": 3412, "y": 3005, "level": 0}, "to": {"x": 3406, "y": 3003, "level": 0}}]
            }
          }, {
            "key": {"pulse": 3, "different_level": false, "spot": {"x": 3393, "y": 2997, "level": 0}},
            "value": {
              "children": [],
              "directions": "",
              "path": [{"type": "run", "waypoints": [{"x": 3423, "y": 3016, "level": 0}, {"x": 3421, "y": 3014, "level": 0}]}, {
                "type": "ability",
                "ability": "surge",
                "from": {"x": 3421, "y": 3014, "level": 0},
                "to": {"x": 3411, "y": 3004, "level": 0}
              }, {"type": "ability", "ability": "surge", "from": {"x": 3411, "y": 3004, "level": 0}, "to": {"x": 3401, "y": 2994, "level": 0}}, {
                "type": "ability",
                "ability": "dive",
                "from": {"x": 3401, "y": 2994, "level": 0},
                "to": {"x": 3393, "y": 2997, "level": 0}
              }]
            }
          }, {
            "key": {"pulse": 3, "different_level": false, "spot": {"x": 3419, "y": 3017, "level": 0}},
            "value": {
              "children": [],
              "directions": "",
              "path": [{"type": "run", "waypoints": [{"x": 3423, "y": 3016, "level": 0}, {"x": 3423, "y": 3017, "level": 0}]}, {
                "type": "ability",
                "ability": "surge",
                "from": {"x": 3423, "y": 3017, "level": 0},
                "to": {"x": 3423, "y": 3027, "level": 0}
              }, {"type": "ability", "ability": "dive", "from": {"x": 3423, "y": 3027, "level": 0}, "to": {"x": 3419, "y": 3017, "level": 0}}]
            }
          }, {
            "key": {"pulse": 3, "different_level": false, "spot": {"x": 3423, "y": 3020, "level": 0}},
            "value": {"children": [], "directions": "", "path": [{"type": "run", "waypoints": [{"x": 3423, "y": 3016, "level": 0}, {"x": 3423, "y": 3020, "level": 0}]}]}
          }, {
            "key": {"pulse": 3, "different_level": false, "spot": {"x": 3448, "y": 3019, "level": 0}},
            "value": {
              "children": [],
              "directions": "",
              "path": [{"type": "run", "waypoints": [{"x": 3423, "y": 3016, "level": 0}, {"x": 3425, "y": 3016, "level": 0}]}, {
                "type": "ability",
                "ability": "surge",
                "from": {"x": 3425, "y": 3016, "level": 0},
                "to": {"x": 3435, "y": 3016, "level": 0}
              }, {"type": "run", "waypoints": [{"x": 3435, "y": 3016, "level": 0}, {"x": 3437, "y": 3018, "level": 0}]}, {
                "type": "ability",
                "ability": "dive",
                "from": {"x": 3437, "y": 3018, "level": 0},
                "to": {"x": 3447, "y": 3018, "level": 0}
              }]
            }
          }, {
            "key": {"pulse": 3, "different_level": false, "spot": {"x": 3411, "y": 3048, "level": 0}},
            "value": {
              "children": [],
              "directions": "",
              "path": [{"type": "run", "waypoints": [{"x": 3423, "y": 3016, "level": 0}, {"x": 3423, "y": 3017, "level": 0}, {"x": 3422, "y": 3018, "level": 0}]}, {
                "type": "ability",
                "ability": "surge",
                "from": {"x": 3422, "y": 3018, "level": 0},
                "to": {"x": 3412, "y": 3028, "level": 0}
              }, {"type": "ability", "ability": "dive", "from": {"x": 3412, "y": 3028, "level": 0}, "to": {"x": 3412, "y": 3038, "level": 0}}, {
                "type": "ability",
                "ability": "surge",
                "from": {"x": 3412, "y": 3038, "level": 0},
                "to": {"x": 3412, "y": 3048, "level": 0}
              }]
            }
          }],
          "directions": "",
          "path": [{"type": "teleport", "spot": {"x": 3423, "y": 3016, "level": 0}, "id": {"group": "fairyring", "spot": "DLQ", "access": "portable_fairy_ring"}}]
        }
      },
      "expected_time": 24.813725490196077
    }, {
      "id": "84d2c3cf-bcab-4f7d-a0fa-d24cc6a4ced5",
      "type": "scantree",
      "timestamp": 1711553305,
      "name": "Default Scan Route",
      "description": "",
      "assumptions": {"meerkats_active": true, "double_surge": true, "double_escape": true, "mobile_perk": true},
      "for": {"clue": 360},
      "tree": {
        "assumed_range": 19,
        "ordered_spots": [{"x": 2775, "y": 2891, "level": 0}, {"x": 2786, "y": 2914, "level": 0}, {"x": 2804, "y": 2924, "level": 0}, {"x": 2762, "y": 2918, "level": 0}, {
          "x": 2775,
          "y": 2936,
          "level": 0
        }, {"x": 2766, "y": 2932, "level": 0}, {"x": 2815, "y": 2887, "level": 0}, {"x": 2859, "y": 2891, "level": 0}, {"x": 2848, "y": 2907, "level": 0}, {
          "x": 2827,
          "y": 2934,
          "level": 0
        }, {"x": 2832, "y": 2935, "level": 0}, {"x": 2852, "y": 2934, "level": 0}, {"x": 2857, "y": 2919, "level": 0}, {"x": 2841, "y": 2915, "level": 0}, {
          "x": 2872,
          "y": 2901,
          "level": 0
        }, {"x": 2920, "y": 2888, "level": 0}, {"x": 2892, "y": 2907, "level": 0}, {"x": 2931, "y": 2920, "level": 0}, {"x": 2921, "y": 2937, "level": 0}, {
          "x": 2892,
          "y": 2937,
          "level": 0
        }, {"x": 2929, "y": 2894, "level": 0}, {"x": 2927, "y": 2925, "level": 0}, {"x": 2936, "y": 2917, "level": 0}, {"x": 2944, "y": 2902, "level": 0}, {
          "x": 2932,
          "y": 2935,
          "level": 0
        }, {"x": 2942, "y": 2934, "level": 0}],
        "root": {
          "children": [{
            "key": {"pulse": 1, "different_level": false}, "value": {
              "children": [{
                "key": {"pulse": 1, "different_level": false}, "value": {
                  "children": [{
                    "key": {"pulse": 1, "different_level": false}, "value": {
                      "children": [{
                        "key": {"pulse": 1, "different_level": false}, "value": {
                          "children": [{
                            "key": {"pulse": 1, "different_level": false}, "value": {
                              "children": [{
                                "key": {"pulse": 1, "different_level": false}, "value": {
                                  "children": [{
                                    "key": {"pulse": 1, "different_level": false}, "value": {
                                      "children": [{
                                        "key": {"pulse": 1, "different_level": false}, "value": {
                                          "children": [{
                                            "key": {"pulse": 1, "different_level": false},
                                            "value": {
                                              "children": [],
                                              "directions": "",
                                              "path": [{
                                                "type": "run",
                                                "waypoints": [{"x": 2804, "y": 2923, "level": 0}, {"x": 2800, "y": 2923, "level": 0}, {"x": 2798, "y": 2921, "level": 0}, {
                                                  "x": 2795,
                                                  "y": 2921,
                                                  "level": 0
                                                }, {"x": 2793, "y": 2919, "level": 0}, {"x": 2789, "y": 2919, "level": 0}, {"x": 2788, "y": 2918, "level": 0}, {
                                                  "x": 2783,
                                                  "y": 2918,
                                                  "level": 0
                                                }, {"x": 2782, "y": 2917, "level": 0}],
                                                "description": "This isn't an easy spot to hit exactly. There are a lot of diagonal surges possible in this area as an alternative to improvise."
                                              }, {
                                                "type": "ability",
                                                "ability": "surge",
                                                "from": {"x": 2782, "y": 2917, "level": 0},
                                                "to": {"x": 2772, "y": 2907, "level": 0}
                                              }, {"type": "ability", "ability": "dive", "from": {"x": 2772, "y": 2907, "level": 0}, "to": {"x": 2762, "y": 2917, "level": 0}}]
                                            }
                                          }, {
                                            "key": {"pulse": 2, "different_level": false}, "value": {
                                              "children": [{
                                                "key": {"pulse": 1, "different_level": false},
                                                "value": {
                                                  "children": [],
                                                  "directions": "",
                                                  "path": [{
                                                    "type": "run",
                                                    "waypoints": [{"x": 2794, "y": 2930, "level": 0}, {"x": 2792, "y": 2928, "level": 0}, {
                                                      "x": 2791,
                                                      "y": 2928,
                                                      "level": 0
                                                    }, {"x": 2788, "y": 2925, "level": 0}, {"x": 2787, "y": 2925, "level": 0}, {"x": 2786, "y": 2924, "level": 0}]
                                                  }, {
                                                    "type": "ability",
                                                    "ability": "surge",
                                                    "from": {"x": 2786, "y": 2924, "level": 0},
                                                    "to": {"x": 2776, "y": 2914, "level": 0}
                                                  }, {
                                                    "type": "ability",
                                                    "ability": "dive",
                                                    "from": {"x": 2776, "y": 2914, "level": 0},
                                                    "to": {"x": 2776, "y": 2904, "level": 0}
                                                  }, {"type": "run", "waypoints": [{"x": 2776, "y": 2904, "level": 0}, {"x": 2776, "y": 2892, "level": 0}]}]
                                                }
                                              }, {
                                                "key": {"pulse": 2, "different_level": false},
                                                "value": {
                                                  "children": [],
                                                  "directions": "",
                                                  "path": [{
                                                    "type": "run",
                                                    "waypoints": [{"x": 2794, "y": 2930, "level": 0}, {"x": 2788, "y": 2930, "level": 0}, {"x": 2786, "y": 2932, "level": 0}]
                                                  }, {
                                                    "type": "ability",
                                                    "ability": "dive",
                                                    "from": {"x": 2786, "y": 2932, "level": 0},
                                                    "to": {"x": 2776, "y": 2932, "level": 0}
                                                  }, {"type": "ability", "ability": "surge", "from": {"x": 2776, "y": 2932, "level": 0}, "to": {"x": 2766, "y": 2932, "level": 0}}]
                                                }
                                              }, {
                                                "key": {"pulse": 3, "different_level": false, "spot": {"x": 2775, "y": 2936, "level": 0}},
                                                "value": {
                                                  "children": [],
                                                  "directions": "",
                                                  "path": [{
                                                    "type": "run",
                                                    "waypoints": [{"x": 2794, "y": 2930, "level": 0}, {"x": 2793, "y": 2930, "level": 0}, {
                                                      "x": 2793,
                                                      "y": 2933,
                                                      "level": 0
                                                    }, {"x": 2792, "y": 2934, "level": 0}, {"x": 2791, "y": 2934, "level": 0}]
                                                  }, {
                                                    "type": "ability",
                                                    "ability": "surge",
                                                    "from": {"x": 2791, "y": 2934, "level": 0},
                                                    "to": {"x": 2781, "y": 2934, "level": 0}
                                                  }, {"type": "ability", "ability": "dive", "from": {"x": 2781, "y": 2934, "level": 0}, "to": {"x": 2775, "y": 2936, "level": 0}}]
                                                }
                                              }],
                                              "directions": "",
                                              "path": [{
                                                "type": "run",
                                                "waypoints": [{"x": 2804, "y": 2923, "level": 0}, {"x": 2802, "y": 2925, "level": 0}, {"x": 2801, "y": 2925, "level": 0}, {
                                                  "x": 2796,
                                                  "y": 2930,
                                                  "level": 0
                                                }, {"x": 2794, "y": 2930, "level": 0}]
                                              }]
                                            }
                                          }, {
                                            "key": {"pulse": 3, "different_level": false, "spot": {"x": 2786, "y": 2914, "level": 0}},
                                            "value": {
                                              "children": [],
                                              "directions": "",
                                              "path": [{
                                                "type": "run",
                                                "waypoints": [{"x": 2804, "y": 2923, "level": 0}, {"x": 2800, "y": 2923, "level": 0}, {"x": 2798, "y": 2921, "level": 0}, {
                                                  "x": 2795,
                                                  "y": 2921,
                                                  "level": 0
                                                }, {"x": 2790, "y": 2916, "level": 0}, {"x": 2788, "y": 2916, "level": 0}, {"x": 2786, "y": 2914, "level": 0}]
                                              }]
                                            }
                                          }, {
                                            "key": {"pulse": 3, "different_level": false, "spot": {"x": 2804, "y": 2924, "level": 0}},
                                            "value": {"children": [], "directions": "Dig at {{target}}", "path": []}
                                          }],
                                          "directions": "",
                                          "path": [{
                                            "type": "ability",
                                            "ability": "dive",
                                            "from": {"x": 2845, "y": 2925, "level": 0},
                                            "to": {"x": 2835, "y": 2925, "level": 0}
                                          }, {
                                            "type": "ability",
                                            "ability": "surge",
                                            "from": {"x": 2835, "y": 2925, "level": 0},
                                            "to": {"x": 2825, "y": 2925, "level": 0}
                                          }, {"type": "run", "waypoints": [{"x": 2825, "y": 2925, "level": 0}, {"x": 2823, "y": 2925, "level": 0}]}, {
                                            "type": "run",
                                            "waypoints": [{"x": 2823, "y": 2925, "level": 0}, {"x": 2817, "y": 2925, "level": 0}, {"x": 2815, "y": 2923, "level": 0}, {
                                              "x": 2814,
                                              "y": 2923,
                                              "level": 0
                                            }]
                                          }, {"type": "ability", "ability": "surge", "from": {"x": 2814, "y": 2923, "level": 0}, "to": {"x": 2804, "y": 2923, "level": 0}}]
                                        }
                                      }, {
                                        "key": {"pulse": 2, "different_level": false},
                                        "value": {
                                          "children": [],
                                          "directions": "",
                                          "path": [{
                                            "type": "ability",
                                            "ability": "dive",
                                            "from": {"x": 2845, "y": 2925, "level": 0},
                                            "to": {"x": 2835, "y": 2915, "level": 0}
                                          }, {
                                            "type": "ability",
                                            "ability": "surge",
                                            "from": {"x": 2835, "y": 2915, "level": 0},
                                            "to": {"x": 2825, "y": 2905, "level": 0}
                                          }, {
                                            "type": "ability",
                                            "ability": "surge",
                                            "from": {"x": 2825, "y": 2905, "level": 0},
                                            "to": {"x": 2815, "y": 2895, "level": 0}
                                          }, {"type": "run", "waypoints": [{"x": 2815, "y": 2895, "level": 0}, {"x": 2815, "y": 2887, "level": 0}]}]
                                        }
                                      }, {
                                        "key": {"pulse": 3, "different_level": false, "spot": {"x": 2827, "y": 2934, "level": 0}},
                                        "value": {
                                          "children": [],
                                          "directions": "",
                                          "path": [{
                                            "type": "ability",
                                            "ability": "surge",
                                            "from": {"x": 2845, "y": 2925, "level": 0},
                                            "to": {"x": 2835, "y": 2935, "level": 0}
                                          }, {"type": "ability", "ability": "dive", "from": {"x": 2835, "y": 2935, "level": 0}, "to": {"x": 2827, "y": 2934, "level": 0}}]
                                        }
                                      }, {
                                        "key": {"pulse": 3, "different_level": false, "spot": {"x": 2832, "y": 2935, "level": 0}},
                                        "value": {
                                          "children": [],
                                          "directions": "",
                                          "path": [{
                                            "type": "ability",
                                            "ability": "surge",
                                            "from": {"x": 2845, "y": 2925, "level": 0},
                                            "to": {"x": 2835, "y": 2935, "level": 0}
                                          }, {"type": "run", "waypoints": [{"x": 2835, "y": 2935, "level": 0}, {"x": 2833, "y": 2935, "level": 0}]}]
                                        }
                                      }],
                                      "directions": "",
                                      "path": [{
                                        "type": "run",
                                        "waypoints": [{"x": 2871, "y": 2916, "level": 0}, {"x": 2860, "y": 2916, "level": 0}, {"x": 2859, "y": 2917, "level": 0}, {
                                          "x": 2854,
                                          "y": 2917,
                                          "level": 0
                                        }, {"x": 2853, "y": 2918, "level": 0}, {"x": 2852, "y": 2918, "level": 0}, {"x": 2845, "y": 2925, "level": 0}]
                                      }]
                                    }
                                  }, {
                                    "key": {"pulse": 2, "different_level": false},
                                    "value": {
                                      "children": [],
                                      "directions": "",
                                      "path": [{
                                        "type": "run",
                                        "waypoints": [{"x": 2871, "y": 2916, "level": 0}, {"x": 2860, "y": 2916, "level": 0}, {"x": 2859, "y": 2917, "level": 0}, {
                                          "x": 2854,
                                          "y": 2917,
                                          "level": 0
                                        }, {"x": 2853, "y": 2918, "level": 0}, {"x": 2851, "y": 2918, "level": 0}]
                                      }, {"type": "ability", "ability": "dive", "from": {"x": 2851, "y": 2918, "level": 0}, "to": {"x": 2841, "y": 2914, "level": 0}}]
                                    }
                                  }],
                                  "directions": "",
                                  "path": [{
                                    "type": "ability",
                                    "ability": "surge",
                                    "from": {"x": 2885, "y": 2905, "level": 0},
                                    "to": {"x": 2876, "y": 2914, "level": 0}
                                  }, {"type": "run", "waypoints": [{"x": 2876, "y": 2914, "level": 0}, {"x": 2873, "y": 2914, "level": 0}, {"x": 2871, "y": 2916, "level": 0}]}]
                                }
                              }, {
                                "key": {"pulse": 2, "different_level": false},
                                "value": {
                                  "children": [],
                                  "directions": "",
                                  "path": [{
                                    "type": "run",
                                    "waypoints": [{"x": 2885, "y": 2905, "level": 0}, {"x": 2885, "y": 2906, "level": 0}, {"x": 2884, "y": 2906, "level": 0}]
                                  }, {"type": "ability", "ability": "surge", "from": {"x": 2884, "y": 2906, "level": 0}, "to": {"x": 2874, "y": 2906, "level": 0}}, {
                                    "type": "run",
                                    "waypoints": [{"x": 2874, "y": 2906, "level": 0}, {"x": 2871, "y": 2906, "level": 0}, {"x": 2870, "y": 2907, "level": 0}, {
                                      "x": 2863,
                                      "y": 2907,
                                      "level": 0
                                    }, {"x": 2862, "y": 2908, "level": 0}, {"x": 2849, "y": 2908, "level": 0}, {"x": 2848, "y": 2907, "level": 0}]
                                  }]
                                }
                              }],
                              "directions": "",
                              "path": [{"type": "run", "waypoints": [{"x": 2887, "y": 2904, "level": 0}, {"x": 2886, "y": 2904, "level": 0}, {"x": 2885, "y": 2905, "level": 0}]}]
                            }
                          }, {
                            "key": {"pulse": 2, "different_level": false}, "value": {
                              "children": [{
                                "key": {"pulse": 2, "different_level": false},
                                "value": {
                                  "children": [],
                                  "directions": "",
                                  "path": [{
                                    "type": "ability",
                                    "ability": "surge",
                                    "from": {"x": 2876, "y": 2910, "level": 0},
                                    "to": {"x": 2866, "y": 2920, "level": 0}
                                  }, {
                                    "type": "run",
                                    "waypoints": [{"x": 2866, "y": 2920, "level": 0}, {"x": 2865, "y": 2920, "level": 0}, {"x": 2854, "y": 2931, "level": 0}, {
                                      "x": 2854,
                                      "y": 2932,
                                      "level": 0
                                    }, {"x": 2853, "y": 2933, "level": 0}]
                                  }]
                                }
                              }, {
                                "key": {"pulse": 3, "different_level": false, "spot": {"x": 2859, "y": 2891, "level": 0}},
                                "value": {
                                  "children": [],
                                  "directions": "",
                                  "path": [{
                                    "type": "run",
                                    "waypoints": [{"x": 2876, "y": 2910, "level": 0}, {"x": 2876, "y": 2908, "level": 0}, {"x": 2875, "y": 2908, "level": 0}, {
                                      "x": 2875,
                                      "y": 2907,
                                      "level": 0
                                    }, {"x": 2874, "y": 2906, "level": 0}, {"x": 2873, "y": 2906, "level": 0}, {"x": 2873, "y": 2905, "level": 0}, {
                                      "x": 2869,
                                      "y": 2901,
                                      "level": 0
                                    }],
                                    "description": "Any tile around the marked spot lines up the surge to land on the target spot."
                                  }, {"type": "ability", "ability": "surge", "from": {"x": 2869, "y": 2901, "level": 0}, "to": {"x": 2859, "y": 2891, "level": 0}}]
                                }
                              }, {
                                "key": {"pulse": 3, "different_level": false, "spot": {"x": 2857, "y": 2919, "level": 0}},
                                "value": {
                                  "children": [],
                                  "directions": "",
                                  "path": [{
                                    "type": "ability",
                                    "ability": "surge",
                                    "from": {"x": 2876, "y": 2910, "level": 0},
                                    "to": {"x": 2866, "y": 2920, "level": 0}
                                  }, {"type": "run", "waypoints": [{"x": 2866, "y": 2920, "level": 0}, {"x": 2858, "y": 2920, "level": 0}]}]
                                }
                              }],
                              "directions": "",
                              "path": [{
                                "type": "run",
                                "waypoints": [{"x": 2887, "y": 2904, "level": 0}, {"x": 2886, "y": 2904, "level": 0}, {"x": 2885, "y": 2905, "level": 0}, {
                                  "x": 2885,
                                  "y": 2906,
                                  "level": 0
                                }, {"x": 2882, "y": 2906, "level": 0}, {"x": 2882, "y": 2907, "level": 0}, {"x": 2881, "y": 2908, "level": 0}, {
                                  "x": 2878,
                                  "y": 2908,
                                  "level": 0
                                }, {"x": 2876, "y": 2910, "level": 0}]
                              }]
                            }
                          }],
                          "directions": "",
                          "path": [{"type": "ability", "ability": "dive", "from": {"x": 2907, "y": 2924, "level": 0}, "to": {"x": 2897, "y": 2914, "level": 0}}, {
                            "type": "ability",
                            "ability": "surge",
                            "from": {"x": 2897, "y": 2914, "level": 0},
                            "to": {"x": 2887, "y": 2904, "level": 0}
                          }]
                        }
                      }, {
                        "key": {"pulse": 2, "different_level": false},
                        "value": {
                          "children": [],
                          "directions": "",
                          "path": [{"type": "ability", "ability": "surge", "from": {"x": 2907, "y": 2924, "level": 0}, "to": {"x": 2917, "y": 2924, "level": 0}}, {
                            "type": "run",
                            "waypoints": [{"x": 2917, "y": 2924, "level": 0}, {"x": 2922, "y": 2924, "level": 0}, {"x": 2923, "y": 2923, "level": 0}, {
                              "x": 2925,
                              "y": 2923,
                              "level": 0
                            }]
                          }, {"type": "ability", "ability": "dive", "from": {"x": 2925, "y": 2923, "level": 0}, "to": {"x": 2935, "y": 2913, "level": 0}}, {
                            "type": "ability",
                            "ability": "surge",
                            "from": {"x": 2935, "y": 2913, "level": 0},
                            "to": {"x": 2945, "y": 2903, "level": 0}
                          }]
                        }
                      }], "directions": "", "path": [{"type": "run", "waypoints": [{"x": 2905, "y": 2924, "level": 0}, {"x": 2907, "y": 2924, "level": 0}]}]
                    }
                  }, {
                    "key": {"pulse": 2, "different_level": false},
                    "value": {
                      "children": [],
                      "directions": "",
                      "path": [{"type": "run", "waypoints": [{"x": 2905, "y": 2924, "level": 0}, {"x": 2909, "y": 2924, "level": 0}]}, {
                        "type": "ability",
                        "ability": "surge",
                        "from": {"x": 2909, "y": 2924, "level": 0},
                        "to": {"x": 2919, "y": 2924, "level": 0}
                      }, {"type": "ability", "ability": "dive", "from": {"x": 2919, "y": 2924, "level": 0}, "to": {"x": 2929, "y": 2934, "level": 0}}, {
                        "type": "run",
                        "waypoints": [{"x": 2929, "y": 2934, "level": 0}, {"x": 2931, "y": 2934, "level": 0}]
                      }, {"type": "ability", "ability": "surge", "from": {"x": 2931, "y": 2934, "level": 0}, "to": {"x": 2941, "y": 2934, "level": 0}}]
                    }
                  }], "directions": "", "path": [{"type": "run", "waypoints": [{"x": 2903, "y": 2926, "level": 0}, {"x": 2905, "y": 2924, "level": 0}]}]
                }
              }, {
                "key": {"pulse": 2, "different_level": false},
                "value": {
                  "children": [],
                  "directions": "",
                  "path": [{"type": "ability", "ability": "surge", "from": {"x": 2903, "y": 2926, "level": 0}, "to": {"x": 2913, "y": 2916, "level": 0}}, {
                    "type": "ability",
                    "ability": "dive",
                    "from": {"x": 2913, "y": 2916, "level": 0},
                    "to": {"x": 2913, "y": 2906, "level": 0}
                  }, {"type": "run", "waypoints": [{"x": 2913, "y": 2906, "level": 0}, {"x": 2914, "y": 2905, "level": 0}, {"x": 2914, "y": 2904, "level": 0}]}, {
                    "type": "ability",
                    "ability": "surge",
                    "from": {"x": 2914, "y": 2904, "level": 0},
                    "to": {"x": 2914, "y": 2894, "level": 0}
                  }, {"type": "run", "waypoints": [{"x": 2914, "y": 2894, "level": 0}, {"x": 2919, "y": 2889, "level": 0}]}]
                }
              }],
              "directions": "",
              "path": [{"type": "run", "waypoints": [{"x": 2901, "y": 2930, "level": 0}, {"x": 2901, "y": 2928, "level": 0}, {"x": 2903, "y": 2926, "level": 0}]}]
            }
          }, {
            "key": {"pulse": 2, "different_level": false}, "value": {
              "children": [{
                "key": {"pulse": 2, "different_level": false}, "value": {
                  "children": [{
                    "key": {"pulse": 1, "different_level": false},
                    "value": {
                      "children": [],
                      "directions": "",
                      "path": [{"type": "ability", "ability": "dive", "from": {"x": 2917, "y": 2925, "level": 0}, "to": {"x": 2907, "y": 2915, "level": 0}}, {
                        "type": "ability",
                        "ability": "surge",
                        "from": {"x": 2907, "y": 2915, "level": 0},
                        "to": {"x": 2897, "y": 2905, "level": 0}
                      }, {
                        "type": "run",
                        "waypoints": [{"x": 2897, "y": 2905, "level": 0}, {"x": 2896, "y": 2905, "level": 0}, {"x": 2895, "y": 2906, "level": 0}, {
                          "x": 2890,
                          "y": 2906,
                          "level": 0
                        }, {"x": 2889, "y": 2905, "level": 0}, {"x": 2887, "y": 2905, "level": 0}, {"x": 2885, "y": 2903, "level": 0}, {"x": 2881, "y": 2903, "level": 0}, {
                          "x": 2880,
                          "y": 2904,
                          "level": 0
                        }, {"x": 2875, "y": 2904, "level": 0}, {"x": 2873, "y": 2902, "level": 0}]
                      }]
                    }
                  }, {
                    "key": {"pulse": 2, "different_level": false},
                    "value": {
                      "children": [],
                      "directions": "",
                      "path": [{"type": "ability", "ability": "dive", "from": {"x": 2917, "y": 2925, "level": 0}, "to": {"x": 2927, "y": 2915, "level": 0}}, {
                        "type": "run",
                        "waypoints": [{"x": 2927, "y": 2915, "level": 0}, {"x": 2927, "y": 2913, "level": 0}]
                      }, {"type": "ability", "ability": "surge", "from": {"x": 2927, "y": 2913, "level": 0}, "to": {"x": 2927, "y": 2903, "level": 0}}, {
                        "type": "run",
                        "waypoints": [{"x": 2927, "y": 2903, "level": 0}, {"x": 2927, "y": 2896, "level": 0}, {"x": 2928, "y": 2895, "level": 0}]
                      }]
                    }
                  }, {
                    "key": {"pulse": 3, "different_level": false, "spot": {"x": 2931, "y": 2920, "level": 0}},
                    "value": {
                      "children": [],
                      "directions": "",
                      "path": [{"type": "ability", "ability": "surge", "from": {"x": 2917, "y": 2925, "level": 0}, "to": {"x": 2923, "y": 2925, "level": 0}}, {
                        "type": "ability",
                        "ability": "dive",
                        "from": {"x": 2923, "y": 2925, "level": 0},
                        "to": {"x": 2931, "y": 2920, "level": 0}
                      }]
                    }
                  }, {
                    "key": {"pulse": 3, "different_level": false, "spot": {"x": 2927, "y": 2925, "level": 0}},
                    "value": {
                      "children": [],
                      "directions": "",
                      "path": [{"type": "ability", "ability": "dive", "from": {"x": 2917, "y": 2925, "level": 0}, "to": {"x": 2927, "y": 2926, "level": 0}}]
                    }
                  }, {
                    "key": {"pulse": 3, "different_level": false, "spot": {"x": 2936, "y": 2917, "level": 0}},
                    "value": {
                      "children": [],
                      "directions": "",
                      "path": [{
                        "type": "run",
                        "waypoints": [{"x": 2917, "y": 2925, "level": 0}, {"x": 2918, "y": 2925, "level": 0}, {"x": 2919, "y": 2924, "level": 0}]
                      }, {"type": "ability", "ability": "surge", "from": {"x": 2919, "y": 2924, "level": 0}, "to": {"x": 2929, "y": 2914, "level": 0}}, {
                        "type": "ability",
                        "ability": "dive",
                        "from": {"x": 2929, "y": 2914, "level": 0},
                        "to": {"x": 2936, "y": 2917, "level": 0}
                      }]
                    }
                  }, {
                    "key": {"pulse": 3, "different_level": false, "spot": {"x": 2932, "y": 2935, "level": 0}},
                    "value": {
                      "children": [],
                      "directions": "",
                      "path": [{"type": "run", "waypoints": [{"x": 2917, "y": 2925, "level": 0}, {"x": 2921, "y": 2925, "level": 0}]}, {
                        "type": "ability",
                        "ability": "dive",
                        "from": {"x": 2921, "y": 2925, "level": 0},
                        "to": {"x": 2931, "y": 2935, "level": 0}
                      }]
                    }
                  }],
                  "directions": "",
                  "path": [{
                    "type": "run",
                    "waypoints": [{"x": 2903, "y": 2926, "level": 0}, {"x": 2904, "y": 2925, "level": 0}, {"x": 2907, "y": 2925, "level": 0}]
                  }, {"type": "ability", "ability": "surge", "from": {"x": 2907, "y": 2925, "level": 0}, "to": {"x": 2917, "y": 2925, "level": 0}}]
                }
              }, {
                "key": {"pulse": 3, "different_level": false, "spot": {"x": 2892, "y": 2907, "level": 0}},
                "value": {
                  "children": [],
                  "directions": "",
                  "path": [{"type": "run", "waypoints": [{"x": 2903, "y": 2926, "level": 0}, {"x": 2901, "y": 2924, "level": 0}]}, {
                    "type": "ability",
                    "ability": "surge",
                    "from": {"x": 2901, "y": 2924, "level": 0},
                    "to": {"x": 2891, "y": 2914, "level": 0}
                  }, {"type": "ability", "ability": "dive", "from": {"x": 2891, "y": 2914, "level": 0}, "to": {"x": 2891, "y": 2907, "level": 0}}]
                }
              }, {
                "key": {"pulse": 3, "different_level": false, "spot": {"x": 2921, "y": 2937, "level": 0}},
                "value": {
                  "children": [],
                  "directions": "",
                  "path": [{"type": "run", "waypoints": [{"x": 2903, "y": 2926, "level": 0}, {"x": 2904, "y": 2927, "level": 0}]}, {
                    "type": "ability",
                    "ability": "surge",
                    "from": {"x": 2904, "y": 2927, "level": 0},
                    "to": {"x": 2914, "y": 2937, "level": 0}
                  }, {"type": "ability", "ability": "dive", "from": {"x": 2914, "y": 2937, "level": 0}, "to": {"x": 2921, "y": 2936, "level": 0}}]
                }
              }],
              "directions": "",
              "path": [{"type": "run", "waypoints": [{"x": 2901, "y": 2930, "level": 0}, {"x": 2901, "y": 2928, "level": 0}, {"x": 2903, "y": 2926, "level": 0}]}]
            }
          }, {
            "key": {"pulse": 3, "different_level": false, "spot": {"x": 2892, "y": 2937, "level": 0}},
            "value": {
              "children": [],
              "directions": "",
              "path": [{"type": "ability", "ability": "dive", "from": {"x": 2901, "y": 2930, "level": 0}, "to": {"x": 2892, "y": 2937, "level": 0}}]
            }
          }],
          "directions": "",
          "path": [{"type": "teleport", "spot": {"x": 2901, "y": 2930, "level": 0}, "id": {"group": "fairyring", "spot": "CJS", "access": "portable_fairy_ring"}}]
        }
      },
      "expected_time": 32.69230769230769
    }, {
      "id": "2501479b-4809-448e-a48f-652a3bf6dd95",
      "type": "scantree",
      "timestamp": 1711572121,
      "name": "Default Scan Route",
      "description": "",
      "assumptions": {"meerkats_active": true, "double_surge": true, "double_escape": true, "mobile_perk": true},
      "for": {"clue": 368},
      "tree": {
        "assumed_range": 35,
        "ordered_spots": [{"x": 2175, "y": 3291, "level": 1}, {"x": 2133, "y": 3379, "level": 1}, {"x": 2145, "y": 3381, "level": 1}, {"x": 2148, "y": 3351, "level": 1}, {
          "x": 2174,
          "y": 3398,
          "level": 1
        }, {"x": 2180, "y": 3322, "level": 1}, {"x": 2199, "y": 3268, "level": 1}, {"x": 2212, "y": 3272, "level": 1}, {"x": 2227, "y": 3295, "level": 1}, {
          "x": 2224,
          "y": 3328,
          "level": 1
        }, {"x": 2197, "y": 3433, "level": 1}, {"x": 2222, "y": 3429, "level": 1}, {"x": 2228, "y": 3424, "level": 1}, {"x": 2247, "y": 3267, "level": 1}, {
          "x": 2234,
          "y": 3265,
          "level": 1
        }, {"x": 2275, "y": 3382, "level": 1}, {"x": 2292, "y": 3361, "level": 1}, {"x": 2268, "y": 3397, "level": 1}],
        "root": {
          "children": [{
            "key": {"pulse": 1, "different_level": false}, "value": {
              "children": [{
                "key": {"pulse": 1, "different_level": false}, "value": {
                  "children": [{
                    "key": {"pulse": 1, "different_level": false}, "value": {
                      "children": [{
                        "key": {"pulse": 3, "different_level": false, "spot": {"x": 2275, "y": 3382, "level": 1}},
                        "value": {
                          "children": [],
                          "directions": "",
                          "path": [{"type": "run", "waypoints": [{"x": 2261, "y": 3383, "level": 1}, {"x": 2265, "y": 3383, "level": 1}]}, {
                            "type": "ability",
                            "ability": "surge",
                            "from": {"x": 2265, "y": 3383, "level": 1},
                            "to": {"x": 2275, "y": 3383, "level": 1}
                          }]
                        }
                      }, {
                        "key": {"pulse": 3, "different_level": false, "spot": {"x": 2268, "y": 3397, "level": 1}},
                        "value": {
                          "children": [],
                          "directions": "",
                          "path": [{"type": "run", "waypoints": [{"x": 2261, "y": 3383, "level": 1}, {"x": 2261, "y": 3388, "level": 1}]}, {
                            "type": "ability",
                            "ability": "surge",
                            "from": {"x": 2261, "y": 3388, "level": 1},
                            "to": {"x": 2261, "y": 3398, "level": 1}
                          }, {"type": "ability", "ability": "dive", "from": {"x": 2261, "y": 3398, "level": 1}, "to": {"x": 2266, "y": 3402, "level": 1}}, {
                            "type": "transport",
                            "assumed_start": {"x": 2266, "y": 3402, "level": 1},
                            "internal": {
                              "type": "entity",
                              "entity": {"name": "Outcrop", "kind": "static"},
                              "clickable_area": {"topleft": {"x": 2267.5, "y": 3400.5}, "botright": {"x": 2268.5, "y": 3399.5}, "level": 1},
                              "actions": [{
                                "cursor": "generic",
                                "interactive_area": {"origin": {"x": 2266, "y": 3402, "level": 1}},
                                "name": "Jump to",
                                "movement": [{"time": 7, "offset": {"x": 2, "y": -2, "level": 0}}]
                              }]
                            }
                          }, {"type": "run", "waypoints": [{"x": 2268, "y": 3400, "level": 1}, {"x": 2268, "y": 3398, "level": 1}]}]
                        }
                      }],
                      "directions": "",
                      "path": [{"type": "teleport", "spot": {"x": 2261, "y": 3383, "level": 1}, "id": {"group": "teleportseed", "spot": "crwys", "access": "attunedseed"}}]
                    }
                  }, {
                    "key": {"pulse": 2, "different_level": false},
                    "value": {
                      "children": [],
                      "directions": "",
                      "path": [{
                        "type": "teleport",
                        "spot": {"x": 2230, "y": 3411, "level": 1},
                        "id": {"group": "teleportseed", "spot": "Meilyr", "access": "attunedseed"}
                      }, {"type": "run", "waypoints": [{"x": 2230, "y": 3411, "level": 1}, {"x": 2230, "y": 3415, "level": 1}]}, {
                        "type": "ability",
                        "ability": "dive",
                        "from": {"x": 2230, "y": 3415, "level": 1},
                        "to": {"x": 2228, "y": 3424, "level": 1}
                      }]
                    }
                  }], "directions": "", "path": [{"type": "run", "waypoints": [{"x": 2155, "y": 3383, "level": 1}, {"x": 2158, "y": 3383, "level": 1}]}]
                }
              }, {
                "key": {"pulse": 2, "different_level": false}, "value": {
                  "children": [{
                    "key": {"pulse": 3, "different_level": false, "spot": {"x": 2197, "y": 3433, "level": 1}},
                    "value": {
                      "children": [],
                      "directions": "",
                      "path": [{"type": "run", "waypoints": [{"x": 2230, "y": 3411, "level": 1}, {"x": 2226, "y": 3411, "level": 1}]}, {
                        "type": "ability",
                        "ability": "surge",
                        "from": {"x": 2226, "y": 3411, "level": 1},
                        "to": {"x": 2216, "y": 3411, "level": 1}
                      }, {
                        "type": "run",
                        "waypoints": [{"x": 2216, "y": 3411, "level": 1}, {"x": 2210, "y": 3411, "level": 1}, {"x": 2208, "y": 3413, "level": 1}, {"x": 2208, "y": 3414, "level": 1}]
                      }, {"type": "ability", "ability": "surge", "from": {"x": 2208, "y": 3414, "level": 1}, "to": {"x": 2208, "y": 3424, "level": 1}}, {
                        "type": "run",
                        "waypoints": [{"x": 2208, "y": 3424, "level": 1}, {"x": 2206, "y": 3424, "level": 1}]
                      }, {"type": "ability", "ability": "dive", "from": {"x": 2206, "y": 3424, "level": 1}, "to": {"x": 2201, "y": 3429, "level": 1}}, {
                        "type": "run",
                        "waypoints": [{"x": 2201, "y": 3429, "level": 1}, {"x": 2201, "y": 3434, "level": 1}, {"x": 2198, "y": 3434, "level": 1}]
                      }]
                    }
                  }, {
                    "key": {"pulse": 3, "different_level": false, "spot": {"x": 2222, "y": 3429, "level": 1}},
                    "value": {
                      "children": [],
                      "directions": "",
                      "path": [{"type": "run", "waypoints": [{"x": 2230, "y": 3411, "level": 1}, {"x": 2230, "y": 3415, "level": 1}]}, {
                        "type": "ability",
                        "ability": "dive",
                        "from": {"x": 2230, "y": 3415, "level": 1},
                        "to": {"x": 2227, "y": 3419, "level": 1}
                      }, {"type": "ability", "ability": "surge", "from": {"x": 2227, "y": 3419, "level": 1}, "to": {"x": 2217, "y": 3429, "level": 1}}, {
                        "type": "run",
                        "waypoints": [{"x": 2217, "y": 3429, "level": 1}, {"x": 2217, "y": 3430, "level": 1}, {"x": 2221, "y": 3430, "level": 1}, {"x": 2222, "y": 3429, "level": 1}]
                      }]
                    }
                  }],
                  "directions": "",
                  "path": [{"type": "teleport", "spot": {"x": 2230, "y": 3411, "level": 1}, "id": {"group": "teleportseed", "spot": "Meilyr", "access": "attunedseed"}}]
                }
              }, {
                "key": {"pulse": 3, "different_level": false, "spot": {"x": 2133, "y": 3379, "level": 1}},
                "value": {
                  "children": [],
                  "directions": "",
                  "path": [{"type": "run", "waypoints": [{"x": 2155, "y": 3383, "level": 1}, {"x": 2151, "y": 3383, "level": 1}]}, {
                    "type": "ability",
                    "ability": "surge",
                    "from": {"x": 2151, "y": 3383, "level": 1},
                    "to": {"x": 2141, "y": 3383, "level": 1}
                  }, {"type": "run", "waypoints": [{"x": 2141, "y": 3383, "level": 1}, {"x": 2142, "y": 3383, "level": 1}, {"x": 2142, "y": 3380, "level": 1}]}, {
                    "type": "ability",
                    "ability": "surge",
                    "from": {"x": 2142, "y": 3380, "level": 1},
                    "to": {"x": 2142, "y": 3370, "level": 1}
                  }, {"type": "ability", "ability": "dive", "from": {"x": 2142, "y": 3370, "level": 1}, "to": {"x": 2133, "y": 3379, "level": 1}}]
                }
              }, {
                "key": {"pulse": 3, "different_level": false, "spot": {"x": 2145, "y": 3381, "level": 1}},
                "value": {
                  "children": [],
                  "directions": "",
                  "path": [{"type": "run", "waypoints": [{"x": 2155, "y": 3383, "level": 1}, {"x": 2151, "y": 3383, "level": 1}]}, {
                    "type": "ability",
                    "ability": "dive",
                    "from": {"x": 2151, "y": 3383, "level": 1},
                    "to": {"x": 2145, "y": 3381, "level": 1}
                  }]
                }
              }, {
                "key": {"pulse": 3, "different_level": false, "spot": {"x": 2148, "y": 3351, "level": 1}},
                "value": {
                  "children": [],
                  "directions": "",
                  "path": [{
                    "type": "teleport",
                    "spot": {"x": 2155, "y": 3339, "level": 1},
                    "id": {"group": "teleportseed", "spot": "Ithell", "access": "attunedseed"}
                  }, {"type": "redclick", "target": {"kind": "static", "name": "Entity"}, "where": {"x": 2139, "y": 3350, "level": 1}, "how": "craft"}, {
                    "type": "run",
                    "waypoints": [{"x": 2155, "y": 3339, "level": 1}, {"x": 2151, "y": 3339, "level": 1}]
                  }, {"type": "ability", "ability": "surge", "from": {"x": 2151, "y": 3339, "level": 1}, "to": {"x": 2141, "y": 3349, "level": 1}}, {
                    "type": "ability",
                    "ability": "dive",
                    "from": {"x": 2141, "y": 3349, "level": 1},
                    "to": {"x": 2148, "y": 3351, "level": 1}
                  }]
                }
              }, {
                "key": {"pulse": 3, "different_level": false, "spot": {"x": 2174, "y": 3398, "level": 1}},
                "value": {
                  "children": [],
                  "directions": "",
                  "path": [{
                    "type": "teleport",
                    "spot": {"x": 2186, "y": 3411, "level": 1},
                    "id": {"group": "teleportseed", "spot": "hefin", "access": "attunedseed"}
                  }, {"type": "run", "waypoints": [{"x": 2186, "y": 3411, "level": 1}, {"x": 2186, "y": 3407, "level": 1}]}, {
                    "type": "ability",
                    "ability": "surge",
                    "from": {"x": 2186, "y": 3407, "level": 1},
                    "to": {"x": 2186, "y": 3397, "level": 1}
                  }, {"type": "ability", "ability": "dive", "from": {"x": 2186, "y": 3397, "level": 1}, "to": {"x": 2176, "y": 3397, "level": 1}}, {
                    "type": "run",
                    "waypoints": [{"x": 2176, "y": 3397, "level": 1}, {"x": 2176, "y": 3398, "level": 1}, {"x": 2175, "y": 3398, "level": 1}]
                  }]
                }
              }],
              "directions": "",
              "path": [{"type": "teleport", "spot": {"x": 2155, "y": 3383, "level": 1}, "id": {"group": "teleportseed", "spot": "amlodd", "access": "attunedseed"}}]
            }
          }, {
            "key": {"pulse": 2, "different_level": false}, "value": {
              "children": [{
                "key": {"pulse": 1, "different_level": false}, "value": {
                  "children": [{
                    "key": {"pulse": 3, "different_level": false, "spot": {"x": 2275, "y": 3382, "level": 1}},
                    "value": {
                      "children": [],
                      "directions": "",
                      "path": [{"type": "run", "waypoints": [{"x": 2261, "y": 3383, "level": 1}, {"x": 2265, "y": 3383, "level": 1}]}, {
                        "type": "ability",
                        "ability": "surge",
                        "from": {"x": 2265, "y": 3383, "level": 1},
                        "to": {"x": 2275, "y": 3383, "level": 1}
                      }]
                    }
                  }, {
                    "key": {"pulse": 3, "different_level": false, "spot": {"x": 2292, "y": 3361, "level": 1}},
                    "value": {
                      "children": [],
                      "directions": "",
                      "path": [{"type": "run", "waypoints": [{"x": 2261, "y": 3383, "level": 1}, {"x": 2261, "y": 3379, "level": 1}]}, {
                        "type": "ability",
                        "ability": "surge",
                        "from": {"x": 2261, "y": 3379, "level": 1},
                        "to": {"x": 2261, "y": 3369, "level": 1}
                      }, {
                        "type": "run",
                        "waypoints": [{"x": 2261, "y": 3369, "level": 1}, {"x": 2261, "y": 3363, "level": 1}, {"x": 2263, "y": 3361, "level": 1}, {"x": 2272, "y": 3361, "level": 1}]
                      }, {"type": "ability", "ability": "surge", "from": {"x": 2272, "y": 3361, "level": 1}, "to": {"x": 2282, "y": 3361, "level": 1}}, {
                        "type": "ability",
                        "ability": "dive",
                        "from": {"x": 2282, "y": 3361, "level": 1},
                        "to": {"x": 2292, "y": 3361, "level": 1}
                      }]
                    }
                  }],
                  "directions": "",
                  "path": [{"type": "teleport", "spot": {"x": 2261, "y": 3383, "level": 1}, "id": {"group": "teleportseed", "spot": "crwys", "access": "attunedseed"}}]
                }
              }, {
                "key": {"pulse": 2, "different_level": false}, "value": {
                  "children": [{
                    "key": {"pulse": 3, "different_level": false, "spot": {"x": 2175, "y": 3291, "level": 1}},
                    "value": {
                      "children": [],
                      "directions": "",
                      "path": [{"type": "run", "waypoints": [{"x": 2185, "y": 3311, "level": 1}, {"x": 2185, "y": 3307, "level": 1}]}, {
                        "type": "ability",
                        "ability": "dive",
                        "from": {"x": 2185, "y": 3307, "level": 1},
                        "to": {"x": 2179, "y": 3301, "level": 1}
                      }, {
                        "type": "run",
                        "waypoints": [{"x": 2179, "y": 3301, "level": 1}, {"x": 2172, "y": 3301, "level": 1}, {"x": 2171, "y": 3300, "level": 1}, {"x": 2171, "y": 3299, "level": 1}]
                      }, {"type": "ability", "ability": "surge", "from": {"x": 2171, "y": 3299, "level": 1}, "to": {"x": 2171, "y": 3291, "level": 1}}, {
                        "type": "run",
                        "waypoints": [{"x": 2171, "y": 3291, "level": 1}, {"x": 2172, "y": 3292, "level": 1}, {"x": 2174, "y": 3292, "level": 1}, {"x": 2174, "y": 3291, "level": 1}]
                      }]
                    }
                  }, {
                    "key": {"pulse": 3, "different_level": false, "spot": {"x": 2180, "y": 3322, "level": 1}},
                    "value": {
                      "children": [],
                      "directions": "",
                      "path": [{"type": "run", "waypoints": [{"x": 2185, "y": 3311, "level": 1}, {"x": 2185, "y": 3315, "level": 1}]}, {
                        "type": "ability",
                        "ability": "surge",
                        "from": {"x": 2185, "y": 3315, "level": 1},
                        "to": {"x": 2185, "y": 3325, "level": 1}
                      }, {"type": "ability", "ability": "dive", "from": {"x": 2185, "y": 3325, "level": 1}, "to": {"x": 2180, "y": 3322, "level": 1}}]
                    }
                  }],
                  "directions": "",
                  "path": [{"type": "teleport", "spot": {"x": 2185, "y": 3311, "level": 1}, "id": {"group": "teleportseed", "spot": "iorwerth", "access": "attunedseed"}}]
                }
              }, {
                "key": {"pulse": 3, "different_level": false, "spot": {"x": 2199, "y": 3268, "level": 1}},
                "value": {
                  "children": [],
                  "directions": "",
                  "path": [{
                    "type": "run",
                    "waypoints": [{"x": 2221, "y": 3297, "level": 1}, {"x": 2217, "y": 3297, "level": 1}, {"x": 2216, "y": 3298, "level": 1}]
                  }, {"type": "ability", "ability": "dive", "from": {"x": 2216, "y": 3298, "level": 1}, "to": {"x": 2206, "y": 3288, "level": 1}}, {
                    "type": "run",
                    "waypoints": [{"x": 2206, "y": 3288, "level": 1}, {"x": 2206, "y": 3286, "level": 1}]
                  }, {"type": "ability", "ability": "surge", "from": {"x": 2206, "y": 3286, "level": 1}, "to": {"x": 2206, "y": 3276, "level": 1}}, {
                    "type": "run",
                    "waypoints": [{"x": 2206, "y": 3276, "level": 1}, {"x": 2206, "y": 3269, "level": 1}, {"x": 2204, "y": 3267, "level": 1}, {
                      "x": 2200,
                      "y": 3267,
                      "level": 1
                    }, {"x": 2199, "y": 3268, "level": 1}]
                  }]
                }
              }, {
                "key": {"pulse": 3, "different_level": false, "spot": {"x": 2212, "y": 3272, "level": 1}},
                "value": {
                  "children": [],
                  "directions": "",
                  "path": [{
                    "type": "run",
                    "waypoints": [{"x": 2221, "y": 3297, "level": 1}, {"x": 2217, "y": 3297, "level": 1}, {"x": 2216, "y": 3298, "level": 1}]
                  }, {"type": "ability", "ability": "dive", "from": {"x": 2216, "y": 3298, "level": 1}, "to": {"x": 2206, "y": 3288, "level": 1}}, {
                    "type": "run",
                    "waypoints": [{"x": 2206, "y": 3288, "level": 1}, {"x": 2206, "y": 3286, "level": 1}]
                  }, {"type": "ability", "ability": "surge", "from": {"x": 2206, "y": 3286, "level": 1}, "to": {"x": 2206, "y": 3276, "level": 1}}, {
                    "type": "run",
                    "waypoints": [{"x": 2206, "y": 3276, "level": 1}, {"x": 2208, "y": 3276, "level": 1}, {"x": 2212, "y": 3272, "level": 1}]
                  }]
                }
              }, {
                "key": {"pulse": 3, "different_level": false, "spot": {"x": 2247, "y": 3267, "level": 1}},
                "value": {
                  "children": [],
                  "directions": "",
                  "path": [{
                    "type": "run",
                    "waypoints": [{"x": 2221, "y": 3297, "level": 1}, {"x": 2217, "y": 3297, "level": 1}, {"x": 2216, "y": 3298, "level": 1}]
                  }, {"type": "ability", "ability": "dive", "from": {"x": 2216, "y": 3298, "level": 1}, "to": {"x": 2206, "y": 3288, "level": 1}}, {
                    "type": "run",
                    "waypoints": [{"x": 2206, "y": 3288, "level": 1}, {"x": 2206, "y": 3286, "level": 1}]
                  }, {"type": "ability", "ability": "surge", "from": {"x": 2206, "y": 3286, "level": 1}, "to": {"x": 2206, "y": 3276, "level": 1}}, {
                    "type": "run",
                    "waypoints": [{"x": 2206, "y": 3276, "level": 1}, {"x": 2209, "y": 3276, "level": 1}, {"x": 2215, "y": 3270, "level": 1}, {
                      "x": 2218,
                      "y": 3270,
                      "level": 1
                    }, {"x": 2219, "y": 3269, "level": 1}, {"x": 2230, "y": 3269, "level": 1}]
                  }, {"type": "ability", "ability": "surge", "from": {"x": 2230, "y": 3269, "level": 1}, "to": {"x": 2240, "y": 3269, "level": 1}}, {
                    "type": "run",
                    "waypoints": [{"x": 2240, "y": 3269, "level": 1}, {"x": 2245, "y": 3269, "level": 1}, {"x": 2246, "y": 3268, "level": 1}]
                  }]
                }
              }, {
                "key": {"pulse": 3, "different_level": false, "spot": {"x": 2234, "y": 3265, "level": 1}},
                "value": {
                  "children": [],
                  "directions": "",
                  "path": [{
                    "type": "run",
                    "waypoints": [{"x": 2221, "y": 3297, "level": 1}, {"x": 2217, "y": 3297, "level": 1}, {"x": 2216, "y": 3298, "level": 1}]
                  }, {"type": "ability", "ability": "dive", "from": {"x": 2216, "y": 3298, "level": 1}, "to": {"x": 2206, "y": 3288, "level": 1}}, {
                    "type": "run",
                    "waypoints": [{"x": 2206, "y": 3288, "level": 1}, {"x": 2206, "y": 3286, "level": 1}]
                  }, {"type": "ability", "ability": "surge", "from": {"x": 2206, "y": 3286, "level": 1}, "to": {"x": 2206, "y": 3276, "level": 1}}, {
                    "type": "run",
                    "waypoints": [{"x": 2206, "y": 3276, "level": 1}, {"x": 2209, "y": 3276, "level": 1}, {"x": 2215, "y": 3270, "level": 1}, {
                      "x": 2218,
                      "y": 3270,
                      "level": 1
                    }, {"x": 2219, "y": 3269, "level": 1}, {"x": 2231, "y": 3269, "level": 1}, {"x": 2234, "y": 3266, "level": 1}]
                  }]
                }
              }],
              "directions": "",
              "path": [{"type": "redclick", "target": {"kind": "static", "name": "Rock"}, "where": {"x": 2223, "y": 3300, "level": 1}, "how": "mine"}, {
                "type": "run",
                "waypoints": [{"x": 2231, "y": 3311, "level": 1}, {"x": 2231, "y": 3307, "level": 1}]
              }, {"type": "ability", "ability": "surge", "from": {"x": 2231, "y": 3307, "level": 1}, "to": {"x": 2221, "y": 3297, "level": 1}}]
            }
          }, {
            "key": {"pulse": 3, "different_level": false, "spot": {"x": 2227, "y": 3295, "level": 1}},
            "value": {
              "children": [],
              "directions": "",
              "path": [{"type": "run", "waypoints": [{"x": 2231, "y": 3311, "level": 1}, {"x": 2231, "y": 3307, "level": 1}]}, {
                "type": "ability",
                "ability": "surge",
                "from": {"x": 2231, "y": 3307, "level": 1},
                "to": {"x": 2231, "y": 3297, "level": 1}
              }, {"type": "ability", "ability": "dive", "from": {"x": 2231, "y": 3297, "level": 1}, "to": {"x": 2227, "y": 3295, "level": 1}}]
            }
          }, {
            "key": {"pulse": 3, "different_level": false, "spot": {"x": 2224, "y": 3328, "level": 1}},
            "value": {
              "children": [],
              "directions": "",
              "path": [{"type": "run", "waypoints": [{"x": 2231, "y": 3311, "level": 1}, {"x": 2231, "y": 3315, "level": 1}]}, {
                "type": "ability",
                "ability": "dive",
                "from": {"x": 2231, "y": 3315, "level": 1},
                "to": {"x": 2222, "y": 3324, "level": 1}
              }, {"type": "run", "waypoints": [{"x": 2222, "y": 3324, "level": 1}, {"x": 2222, "y": 3327, "level": 1}, {"x": 2223, "y": 3328, "level": 1}]}]
            }
          }],
          "directions": "",
          "path": [{"type": "teleport", "spot": {"x": 2231, "y": 3311, "level": 1}, "id": {"group": "teleportseed", "spot": "Trahaearn", "access": "attunedseed"}}],
          "region": {"area": null, "name": ""}
        }
      },
      "expected_time": 19.63888888888889
    }, {
      "id": "72e6a839-b057-457f-b382-59c8c6beaa69",
      "type": "scantree",
      "timestamp": 1711575162,
      "name": "Default Scan Route",
      "description": "",
      "assumptions": {"meerkats_active": true, "double_surge": true, "double_escape": true, "mobile_perk": true},
      "for": {"clue": 363},
      "tree": {
        "assumed_range": 21,
        "ordered_spots": [{"x": 2354, "y": 3790, "level": 0}, {"x": 2360, "y": 3799, "level": 0}, {"x": 2324, "y": 3808, "level": 0}, {"x": 2322, "y": 3787, "level": 0}, {
          "x": 2311,
          "y": 3801,
          "level": 0
        }, {"x": 2340, "y": 3803, "level": 0}, {"x": 2342, "y": 3809, "level": 0}, {"x": 2330, "y": 3829, "level": 0}, {"x": 2311, "y": 3835, "level": 0}, {
          "x": 2376,
          "y": 3800,
          "level": 0
        }, {"x": 2381, "y": 3789, "level": 0}, {"x": 2402, "y": 3789, "level": 0}, {"x": 2421, "y": 3792, "level": 0}, {"x": 2397, "y": 3801, "level": 0}, {
          "x": 2419,
          "y": 3833,
          "level": 0
        }, {"x": 2395, "y": 3812, "level": 0}, {"x": 2373, "y": 3834, "level": 0}, {"x": 2314, "y": 3851, "level": 0}, {"x": 2326, "y": 3866, "level": 0}, {
          "x": 2326,
          "y": 3850,
          "level": 0
        }, {"x": 2354, "y": 3853, "level": 0}, {"x": 2349, "y": 3880, "level": 0}, {"x": 2312, "y": 3894, "level": 0}, {"x": 2352, "y": 3892, "level": 0}, {
          "x": 2414,
          "y": 3848,
          "level": 0
        }, {"x": 2418, "y": 3870, "level": 0}, {"x": 2377, "y": 3850, "level": 0}, {"x": 2400, "y": 3870, "level": 0}, {"x": 2368, "y": 3870, "level": 0}, {
          "x": 2417,
          "y": 3893,
          "level": 0
        }, {"x": 2399, "y": 3888, "level": 0}, {"x": 2389, "y": 3899, "level": 0}],
        "root": {
          "children": [{
            "key": {"pulse": 1, "different_level": false}, "value": {
              "children": [{
                "key": {"pulse": 1, "different_level": false}, "value": {
                  "children": [{
                    "key": {"pulse": 1, "different_level": false}, "value": {
                      "children": [{
                        "key": {"pulse": 1, "different_level": false}, "value": {
                          "children": [{
                            "key": {"pulse": 1, "different_level": false}, "value": {
                              "children": [{
                                "key": {"pulse": 1, "different_level": false}, "value": {
                                  "children": [{
                                    "key": {"pulse": 3, "different_level": false, "spot": {"x": 2354, "y": 3790, "level": 0}},
                                    "value": {
                                      "children": [],
                                      "directions": "",
                                      "path": [{
                                        "type": "run",
                                        "waypoints": [{"x": 2339, "y": 3804, "level": 0}, {"x": 2341, "y": 3802, "level": 0}, {"x": 2346, "y": 3802, "level": 0}, {
                                          "x": 2347,
                                          "y": 3801,
                                          "level": 0
                                        }]
                                      }, {"type": "ability", "ability": "dive", "from": {"x": 2347, "y": 3801, "level": 0}, "to": {"x": 2357, "y": 3791, "level": 0}}, {
                                        "type": "run",
                                        "waypoints": [{"x": 2357, "y": 3791, "level": 0}, {"x": 2355, "y": 3791, "level": 0}]
                                      }]
                                    }
                                  }, {
                                    "key": {"pulse": 3, "different_level": false, "spot": {"x": 2360, "y": 3799, "level": 0}},
                                    "value": {
                                      "children": [],
                                      "directions": "",
                                      "path": [{
                                        "type": "run",
                                        "waypoints": [{"x": 2339, "y": 3804, "level": 0}, {"x": 2340, "y": 3804, "level": 0}, {"x": 2341, "y": 3805, "level": 0}, {
                                          "x": 2344,
                                          "y": 3805,
                                          "level": 0
                                        }, {"x": 2345, "y": 3804, "level": 0}, {"x": 2349, "y": 3804, "level": 0}]
                                      }, {"type": "ability", "ability": "dive", "from": {"x": 2349, "y": 3804, "level": 0}, "to": {"x": 2359, "y": 3799, "level": 0}}]
                                    }
                                  }],
                                  "directions": "",
                                  "path": [{
                                    "type": "run",
                                    "waypoints": [{"x": 2311, "y": 3786, "level": 0}, {"x": 2311, "y": 3788, "level": 0}, {"x": 2312, "y": 3788, "level": 0}, {
                                      "x": 2312,
                                      "y": 3789,
                                      "level": 0
                                    }, {"x": 2313, "y": 3789, "level": 0}, {"x": 2313, "y": 3792, "level": 0}, {"x": 2314, "y": 3793, "level": 0}]
                                  }, {"type": "ability", "ability": "surge", "from": {"x": 2314, "y": 3793, "level": 0}, "to": {"x": 2324, "y": 3803, "level": 0}}, {
                                    "type": "run",
                                    "waypoints": [{"x": 2324, "y": 3803, "level": 0}, {"x": 2325, "y": 3803, "level": 0}, {"x": 2326, "y": 3804, "level": 0}, {
                                      "x": 2328,
                                      "y": 3804,
                                      "level": 0
                                    }]
                                  }, {
                                    "type": "transport",
                                    "assumed_start": {"x": 2328, "y": 3804, "level": 0},
                                    "internal": {
                                      "type": "entity",
                                      "entity": {"kind": "static", "name": "Door"},
                                      "clickable_area": {"topleft": {"x": 2328, "y": 3804.5}, "botright": {"x": 2329, "y": 3803.5}, "level": 0},
                                      "actions": [{
                                        "cursor": "open",
                                        "interactive_area": {"origin": {"x": 2328, "y": 3804, "level": 0}, "size": {"x": 2, "y": 1}},
                                        "name": "Pass",
                                        "movement": [{"time": 1, "offset": {"x": 1, "y": 0, "level": 0}, "valid_from": {"origin": {"x": 2328, "y": 3804, "level": 0}}}, {
                                          "time": 1,
                                          "offset": {"x": -1, "y": 0, "level": 0},
                                          "valid_from": {"origin": {"x": 2329, "y": 3804, "level": 0}}
                                        }]
                                      }]
                                    }
                                  }, {"type": "ability", "ability": "surge", "from": {"x": 2329, "y": 3804, "level": 0}, "to": {"x": 2339, "y": 3804, "level": 0}}]
                                }
                              }, {
                                "key": {"pulse": 2, "different_level": false}, "value": {
                                  "children": [{
                                    "key": {"pulse": 2, "different_level": false},
                                    "value": {
                                      "children": [],
                                      "directions": "",
                                      "path": [{
                                        "type": "ability",
                                        "ability": "surge",
                                        "from": {"x": 2329, "y": 3804, "level": 0},
                                        "to": {"x": 2339, "y": 3804, "level": 0}
                                      }, {
                                        "type": "run",
                                        "waypoints": [{"x": 2339, "y": 3804, "level": 0}, {"x": 2341, "y": 3802, "level": 0}, {"x": 2346, "y": 3802, "level": 0}, {
                                          "x": 2347,
                                          "y": 3801,
                                          "level": 0
                                        }]
                                      }, {"type": "ability", "ability": "dive", "from": {"x": 2347, "y": 3801, "level": 0}, "to": {"x": 2357, "y": 3791, "level": 0}}, {
                                        "type": "run",
                                        "waypoints": [{"x": 2357, "y": 3791, "level": 0}, {"x": 2355, "y": 3791, "level": 0}]
                                      }]
                                    }
                                  }, {
                                    "key": {"pulse": 3, "different_level": false, "spot": {"x": 2340, "y": 3803, "level": 0}},
                                    "value": {
                                      "children": [],
                                      "directions": "",
                                      "path": [{"type": "ability", "ability": "surge", "from": {"x": 2329, "y": 3804, "level": 0}, "to": {"x": 2339, "y": 3804, "level": 0}}]
                                    }
                                  }],
                                  "directions": "",
                                  "path": [{
                                    "type": "run",
                                    "waypoints": [{"x": 2311, "y": 3786, "level": 0}, {"x": 2311, "y": 3788, "level": 0}, {"x": 2312, "y": 3788, "level": 0}, {
                                      "x": 2312,
                                      "y": 3789,
                                      "level": 0
                                    }, {"x": 2313, "y": 3789, "level": 0}, {"x": 2313, "y": 3791, "level": 0}, {"x": 2314, "y": 3792, "level": 0}]
                                  }, {"type": "ability", "ability": "surge", "from": {"x": 2314, "y": 3792, "level": 0}, "to": {"x": 2324, "y": 3802, "level": 0}}, {
                                    "type": "run",
                                    "waypoints": [{"x": 2324, "y": 3802, "level": 0}, {"x": 2326, "y": 3804, "level": 0}, {"x": 2328, "y": 3804, "level": 0}]
                                  }, {
                                    "type": "transport",
                                    "assumed_start": {"x": 2328, "y": 3804, "level": 0},
                                    "internal": {
                                      "type": "entity",
                                      "entity": {"kind": "static", "name": "Door"},
                                      "clickable_area": {"topleft": {"x": 2328, "y": 3804.5}, "botright": {"x": 2329, "y": 3803.5}, "level": 0},
                                      "actions": [{
                                        "cursor": "open",
                                        "interactive_area": {"origin": {"x": 2328, "y": 3804, "level": 0}, "size": {"x": 2, "y": 1}},
                                        "name": "Pass",
                                        "movement": [{"time": 1, "offset": {"x": 1, "y": 0, "level": 0}, "valid_from": {"origin": {"x": 2328, "y": 3804, "level": 0}}}, {
                                          "time": 1,
                                          "offset": {"x": -1, "y": 0, "level": 0},
                                          "valid_from": {"origin": {"x": 2329, "y": 3804, "level": 0}}
                                        }]
                                      }]
                                    }
                                  }]
                                }
                              }, {
                                "key": {"pulse": 3, "different_level": false, "spot": {"x": 2322, "y": 3787, "level": 0}}, "value": {
                                  "children": [],
                                  "directions": "",
                                  "path": [{
                                    "type": "run",
                                    "waypoints": [{"x": 2311, "y": 3786, "level": 0}, {"x": 2311, "y": 3788, "level": 0}, {"x": 2312, "y": 3788, "level": 0}, {
                                      "x": 2312,
                                      "y": 3789,
                                      "level": 0
                                    }, {"x": 2313, "y": 3789, "level": 0}, {"x": 2313, "y": 3791, "level": 0}, {"x": 2314, "y": 3792, "level": 0}]
                                  }, {"type": "ability", "ability": "surge", "from": {"x": 2314, "y": 3792, "level": 0}, "to": {"x": 2324, "y": 3802, "level": 0}}, {
                                    "type": "run",
                                    "waypoints": [{"x": 2324, "y": 3802, "level": 0}, {"x": 2326, "y": 3802, "level": 0}]
                                  }, {
                                    "type": "transport",
                                    "assumed_start": {"x": 2326, "y": 3802, "level": 0},
                                    "internal": {
                                      "type": "entity",
                                      "entity": {"kind": "static", "name": "Gate"},
                                      "clickable_area": {"topleft": {"x": 2325.5, "y": 3802}, "botright": {"x": 2326.5, "y": 3801}, "level": 0},
                                      "actions": [{
                                        "cursor": "open",
                                        "interactive_area": {"origin": {"x": 2326, "y": 3801, "level": 0}, "size": {"x": 1, "y": 2}},
                                        "name": "Pass",
                                        "movement": [{"time": 1, "offset": {"x": 0, "y": -1, "level": 0}, "valid_from": {"origin": {"x": 2326, "y": 3802, "level": 0}}}, {
                                          "time": 1,
                                          "offset": {"x": 0, "y": 1, "level": 0},
                                          "valid_from": {"origin": {"x": 2326, "y": 3801, "level": 0}}
                                        }]
                                      }]
                                    }
                                  }, {
                                    "type": "ability",
                                    "ability": "surge",
                                    "from": {"x": 2326, "y": 3801, "level": 0},
                                    "to": {"x": 2326, "y": 3791, "level": 0}
                                  }, {"type": "ability", "ability": "dive", "from": {"x": 2326, "y": 3791, "level": 0}, "to": {"x": 2322, "y": 3787, "level": 0}}]
                                }
                              }, {
                                "key": {"pulse": 3, "different_level": false, "spot": {"x": 2311, "y": 3801, "level": 0}},
                                "value": {
                                  "children": [],
                                  "directions": "",
                                  "path": [{"type": "run", "waypoints": [{"x": 2311, "y": 3786, "level": 0}, {"x": 2311, "y": 3788, "level": 0}]}, {
                                    "type": "ability",
                                    "ability": "dive",
                                    "from": {"x": 2311, "y": 3788, "level": 0},
                                    "to": {"x": 2316, "y": 3798, "level": 0}
                                  }, {
                                    "type": "run",
                                    "waypoints": [{"x": 2316, "y": 3798, "level": 0}, {"x": 2316, "y": 3803, "level": 0}, {"x": 2312, "y": 3803, "level": 0}, {
                                      "x": 2311,
                                      "y": 3802,
                                      "level": 0
                                    }]
                                  }]
                                }
                              }],
                              "directions": "",
                              "path": [{"type": "teleport", "spot": {"x": 2311, "y": 3786, "level": 0}, "id": {"group": "lyre", "spot": "neitiznot", "access": "lyre"}}]
                            }
                          }, {
                            "key": {"pulse": 2, "different_level": false}, "value": {
                              "children": [{
                                "key": {"pulse": 3, "different_level": false, "spot": {"x": 2376, "y": 3800, "level": 0}},
                                "value": {
                                  "children": [],
                                  "directions": "",
                                  "path": [{"type": "run", "waypoints": [{"x": 2387, "y": 3799, "level": 0}, {"x": 2377, "y": 3799, "level": 0}]}]
                                }
                              }, {
                                "key": {"pulse": 3, "different_level": false, "spot": {"x": 2381, "y": 3789, "level": 0}},
                                "value": {
                                  "children": [],
                                  "directions": "",
                                  "path": [{
                                    "type": "run",
                                    "waypoints": [{"x": 2387, "y": 3799, "level": 0}, {"x": 2385, "y": 3797, "level": 0}, {"x": 2385, "y": 3795, "level": 0}, {
                                      "x": 2384,
                                      "y": 3794,
                                      "level": 0
                                    }, {"x": 2384, "y": 3792, "level": 0}, {"x": 2381, "y": 3789, "level": 0}]
                                  }]
                                }
                              }],
                              "directions": "",
                              "path": [{
                                "type": "redclick",
                                "target": {"kind": "static", "name": "Entity"},
                                "where": {"x": 2415, "y": 3796, "level": 0},
                                "how": "generic"
                              }, {"type": "run", "waypoints": [{"x": 2404, "y": 3782, "level": 0}, {"x": 2404, "y": 3786, "level": 0}]}, {
                                "type": "ability",
                                "ability": "surge",
                                "from": {"x": 2404, "y": 3786, "level": 0},
                                "to": {"x": 2413, "y": 3795, "level": 0}
                              }, {"type": "run", "waypoints": [{"x": 2413, "y": 3795, "level": 0}, {"x": 2412, "y": 3796, "level": 0}]}, {
                                "type": "transport",
                                "assumed_start": {"x": 2412, "y": 3796, "level": 0},
                                "internal": {
                                  "type": "entity",
                                  "entity": {"kind": "static", "name": "Gate"},
                                  "clickable_area": {"topleft": {"x": 2411.5, "y": 3797}, "botright": {"x": 2412.5, "y": 3796}, "level": 0},
                                  "actions": [{
                                    "cursor": "open",
                                    "interactive_area": {"origin": {"x": 2412, "y": 3796, "level": 0}, "size": {"x": 1, "y": 2}},
                                    "name": "Pass",
                                    "movement": [{"time": 1, "offset": {"x": 0, "y": -1, "level": 0}, "valid_from": {"origin": {"x": 2412, "y": 3797, "level": 0}}}, {
                                      "time": 1,
                                      "offset": {"x": 0, "y": 1, "level": 0},
                                      "valid_from": {"origin": {"x": 2412, "y": 3796, "level": 0}}
                                    }]
                                  }]
                                }
                              }, {
                                "type": "run",
                                "waypoints": [{"x": 2412, "y": 3797, "level": 0}, {"x": 2412, "y": 3798, "level": 0}, {"x": 2409, "y": 3798, "level": 0}]
                              }, {"type": "ability", "ability": "dive", "from": {"x": 2409, "y": 3798, "level": 0}, "to": {"x": 2399, "y": 3800, "level": 0}}, {
                                "type": "ability",
                                "ability": "surge",
                                "from": {"x": 2399, "y": 3800, "level": 0},
                                "to": {"x": 2389, "y": 3800, "level": 0}
                              }, {
                                "type": "run",
                                "waypoints": [{"x": 2389, "y": 3800, "level": 0}, {"x": 2389, "y": 3799, "level": 0}, {"x": 2388, "y": 3799, "level": 0}]
                              }, {
                                "type": "transport",
                                "assumed_start": {"x": 2388, "y": 3799, "level": 0},
                                "internal": {
                                  "type": "entity",
                                  "entity": {"kind": "static", "name": "Gate"},
                                  "clickable_area": {"topleft": {"x": 2387, "y": 3799.5}, "botright": {"x": 2388, "y": 3798.5}, "level": 0},
                                  "actions": [{
                                    "cursor": "open",
                                    "interactive_area": {"origin": {"x": 2387, "y": 3799, "level": 0}, "size": {"x": 2, "y": 1}},
                                    "name": "Pass",
                                    "movement": [{"time": 1, "offset": {"x": -1, "y": 0, "level": 0}, "valid_from": {"origin": {"x": 2388, "y": 3799, "level": 0}}}, {
                                      "time": 1,
                                      "offset": {"x": 1, "y": 0, "level": 0},
                                      "valid_from": {"origin": {"x": 2387, "y": 3799, "level": 0}}
                                    }]
                                  }]
                                }
                              }]
                            }
                          }, {
                            "key": {"pulse": 3, "different_level": false, "spot": {"x": 2402, "y": 3789, "level": 0}},
                            "value": {
                              "children": [],
                              "directions": "",
                              "path": [{"type": "run", "waypoints": [{"x": 2404, "y": 3782, "level": 0}, {"x": 2404, "y": 3786, "level": 0}, {"x": 2402, "y": 3788, "level": 0}]}]
                            }
                          }, {
                            "key": {"pulse": 3, "different_level": false, "spot": {"x": 2421, "y": 3792, "level": 0}},
                            "value": {
                              "children": [],
                              "directions": "",
                              "path": [{
                                "type": "run",
                                "waypoints": [{"x": 2404, "y": 3782, "level": 0}, {"x": 2404, "y": 3784, "level": 0}, {"x": 2406, "y": 3786, "level": 0}]
                              }, {"type": "ability", "ability": "surge", "from": {"x": 2406, "y": 3786, "level": 0}, "to": {"x": 2416, "y": 3796, "level": 0}}, {
                                "type": "run",
                                "waypoints": [{"x": 2416, "y": 3796, "level": 0}, {"x": 2417, "y": 3795, "level": 0}, {"x": 2418, "y": 3795, "level": 0}, {
                                  "x": 2420,
                                  "y": 3793,
                                  "level": 0
                                }]
                              }]
                            }
                          }, {
                            "key": {"pulse": 3, "different_level": false, "spot": {"x": 2397, "y": 3801, "level": 0}}, "value": {
                              "children": [],
                              "directions": "",
                              "path": [{
                                "type": "redclick",
                                "target": {"kind": "static", "name": "Entity"},
                                "where": {"x": 2415, "y": 3796, "level": 0},
                                "how": "generic"
                              }, {"type": "run", "waypoints": [{"x": 2404, "y": 3782, "level": 0}, {"x": 2404, "y": 3786, "level": 0}]}, {
                                "type": "ability",
                                "ability": "surge",
                                "from": {"x": 2404, "y": 3786, "level": 0},
                                "to": {"x": 2413, "y": 3795, "level": 0}
                              }, {"type": "run", "waypoints": [{"x": 2413, "y": 3795, "level": 0}, {"x": 2413, "y": 3796, "level": 0}]}, {
                                "type": "transport",
                                "assumed_start": {"x": 2413, "y": 3796, "level": 0},
                                "internal": {
                                  "type": "entity",
                                  "entity": {"kind": "static", "name": "Gate"},
                                  "clickable_area": {"topleft": {"x": 2412.5, "y": 3797}, "botright": {"x": 2413.5, "y": 3796}, "level": 0},
                                  "actions": [{
                                    "cursor": "open",
                                    "interactive_area": {"origin": {"x": 2413, "y": 3796, "level": 0}, "size": {"x": 1, "y": 2}},
                                    "name": "Pass",
                                    "movement": [{"time": 1, "offset": {"x": 0, "y": -1, "level": 0}, "valid_from": {"origin": {"x": 2413, "y": 3797, "level": 0}}}, {
                                      "time": 1,
                                      "offset": {"x": 0, "y": 1, "level": 0},
                                      "valid_from": {"origin": {"x": 2413, "y": 3796, "level": 0}}
                                    }]
                                  }]
                                }
                              }, {
                                "type": "run",
                                "waypoints": [{"x": 2413, "y": 3797, "level": 0}, {"x": 2412, "y": 3798, "level": 0}, {"x": 2411, "y": 3798, "level": 0}]
                              }, {"type": "ability", "ability": "surge", "from": {"x": 2411, "y": 3798, "level": 0}, "to": {"x": 2403, "y": 3798, "level": 0}}, {
                                "type": "ability",
                                "ability": "dive",
                                "from": {"x": 2403, "y": 3798, "level": 0},
                                "to": {"x": 2397, "y": 3801, "level": 0}
                              }]
                            }
                          }],
                          "directions": "",
                          "path": [{"type": "teleport", "spot": {"x": 2404, "y": 3782, "level": 0}, "id": {"group": "lyre", "spot": "jatizso", "access": "lyre"}}],
                          "region": {"area": {"origin": {"x": 2403, "y": 3780, "level": 0}, "size": {"x": 4, "y": 5}}, "name": ""}
                        }
                      }, {
                        "key": {"pulse": 2, "different_level": false}, "value": {
                          "children": [{
                            "key": {"pulse": 1, "different_level": false}, "value": {
                              "children": [{
                                "key": {"pulse": 2, "different_level": false},
                                "value": {
                                  "children": [],
                                  "directions": "",
                                  "path": [{
                                    "type": "run",
                                    "waypoints": [{"x": 2401, "y": 3860, "level": 0}, {"x": 2402, "y": 3860, "level": 0}, {"x": 2403, "y": 3859, "level": 0}]
                                  }, {"type": "ability", "ability": "surge", "from": {"x": 2403, "y": 3859, "level": 0}, "to": {"x": 2413, "y": 3849, "level": 0}}, {
                                    "type": "run",
                                    "waypoints": [{"x": 2413, "y": 3849, "level": 0}, {"x": 2416, "y": 3849, "level": 0}, {"x": 2419, "y": 3846, "level": 0}, {
                                      "x": 2419,
                                      "y": 3844,
                                      "level": 0
                                    }]
                                  }, {"type": "ability", "ability": "dive", "from": {"x": 2419, "y": 3844, "level": 0}, "to": {"x": 2419, "y": 3834, "level": 0}}]
                                }
                              }, {
                                "key": {"pulse": 3, "different_level": false, "spot": {"x": 2418, "y": 3870, "level": 0}},
                                "value": {
                                  "children": [],
                                  "directions": "",
                                  "path": [{
                                    "type": "ability",
                                    "ability": "surge",
                                    "from": {"x": 2401, "y": 3860, "level": 0},
                                    "to": {"x": 2411, "y": 3860, "level": 0}
                                  }, {"type": "ability", "ability": "dive", "from": {"x": 2411, "y": 3860, "level": 0}, "to": {"x": 2418, "y": 3870, "level": 0}}]
                                }
                              }],
                              "directions": "",
                              "path": [{"type": "run", "waypoints": [{"x": 2375, "y": 3867, "level": 0}, {"x": 2377, "y": 3867, "level": 0}]}, {
                                "type": "ability",
                                "ability": "surge",
                                "from": {"x": 2377, "y": 3867, "level": 0},
                                "to": {"x": 2387, "y": 3867, "level": 0}
                              }, {
                                "type": "run",
                                "waypoints": [{"x": 2387, "y": 3867, "level": 0}, {"x": 2391, "y": 3867, "level": 0}, {"x": 2392, "y": 3866, "level": 0}, {
                                  "x": 2392,
                                  "y": 3864,
                                  "level": 0
                                }, {"x": 2396, "y": 3860, "level": 0}, {"x": 2401, "y": 3860, "level": 0}]
                              }]
                            }
                          }, {
                            "key": {"pulse": 2, "different_level": false}, "value": {
                              "children": [{
                                "key": {"pulse": 1, "different_level": false}, "value": {
                                  "children": [],
                                  "directions": "",
                                  "path": [{
                                    "type": "ability",
                                    "ability": "surge",
                                    "from": {"x": 2374, "y": 3867, "level": 0},
                                    "to": {"x": 2364, "y": 3867, "level": 0}
                                  }, {
                                    "type": "run",
                                    "waypoints": [{"x": 2364, "y": 3867, "level": 0}, {"x": 2361, "y": 3867, "level": 0}, {"x": 2359, "y": 3869, "level": 0}]
                                  }, {"type": "powerburst", "where": {"x": 2359, "y": 3869, "level": 0}}, {
                                    "type": "ability",
                                    "ability": "surge",
                                    "from": {"x": 2359, "y": 3869, "level": 0},
                                    "to": {"x": 2349, "y": 3879, "level": 0}
                                  }, {"type": "ability", "ability": "dive", "from": {"x": 2349, "y": 3879, "level": 0}, "to": {"x": 2349, "y": 3889, "level": 0}}, {
                                    "type": "run",
                                    "waypoints": [{"x": 2349, "y": 3889, "level": 0}, {"x": 2351, "y": 3889, "level": 0}]
                                  }, {
                                    "type": "ability",
                                    "ability": "surge",
                                    "from": {"x": 2351, "y": 3889, "level": 0},
                                    "to": {"x": 2361, "y": 3889, "level": 0}
                                  }, {
                                    "type": "ability",
                                    "ability": "surge",
                                    "from": {"x": 2361, "y": 3889, "level": 0},
                                    "to": {"x": 2371, "y": 3889, "level": 0}
                                  }, {"type": "ability", "ability": "dive", "from": {"x": 2371, "y": 3889, "level": 0}, "to": {"x": 2381, "y": 3889, "level": 0}}, {
                                    "type": "ability",
                                    "ability": "surge",
                                    "from": {"x": 2381, "y": 3889, "level": 0},
                                    "to": {"x": 2391, "y": 3889, "level": 0}
                                  }, {
                                    "type": "ability",
                                    "ability": "surge",
                                    "from": {"x": 2391, "y": 3889, "level": 0},
                                    "to": {"x": 2400, "y": 3889, "level": 0}
                                  }, {"type": "ability", "ability": "dive", "from": {"x": 2400, "y": 3889, "level": 0}, "to": {"x": 2410, "y": 3879, "level": 0}}, {
                                    "type": "ability",
                                    "ability": "dive",
                                    "from": {"x": 2410, "y": 3879, "level": 0},
                                    "to": {"x": 2419, "y": 3888, "level": 0}
                                  }, {"type": "run", "waypoints": [{"x": 2419, "y": 3888, "level": 0}, {"x": 2419, "y": 3890, "level": 0}, {"x": 2417, "y": 3892, "level": 0}]}]
                                }
                              }, {
                                "key": {"pulse": 2, "different_level": false},
                                "value": {
                                  "children": [],
                                  "directions": "",
                                  "path": [{"type": "run", "waypoints": [{"x": 2374, "y": 3867, "level": 0}, {"x": 2376, "y": 3867, "level": 0}]}, {
                                    "type": "ability",
                                    "ability": "surge",
                                    "from": {"x": 2376, "y": 3867, "level": 0},
                                    "to": {"x": 2386, "y": 3867, "level": 0}
                                  }, {
                                    "type": "run",
                                    "waypoints": [{"x": 2386, "y": 3867, "level": 0}, {"x": 2386, "y": 3866, "level": 0}, {"x": 2389, "y": 3863, "level": 0}, {
                                      "x": 2393,
                                      "y": 3863,
                                      "level": 0
                                    }, {"x": 2399, "y": 3857, "level": 0}, {"x": 2400, "y": 3857, "level": 0}, {"x": 2401, "y": 3856, "level": 0}]
                                  }, {"type": "ability", "ability": "surge", "from": {"x": 2401, "y": 3856, "level": 0}, "to": {"x": 2411, "y": 3846, "level": 0}}, {
                                    "type": "run",
                                    "waypoints": [{"x": 2411, "y": 3846, "level": 0}, {"x": 2412, "y": 3846, "level": 0}, {"x": 2413, "y": 3847, "level": 0}]
                                  }]
                                }
                              }], "directions": "", "path": [{"type": "run", "waypoints": [{"x": 2375, "y": 3867, "level": 0}, {"x": 2374, "y": 3867, "level": 0}]}]
                            }
                          }], "directions": "", "path": [{"type": "run", "waypoints": [{"x": 2377, "y": 3867, "level": 0}, {"x": 2375, "y": 3867, "level": 0}]}]
                        }
                      }],
                      "directions": "",
                      "path": [{
                        "type": "run",
                        "waypoints": [{"x": 2363, "y": 3866, "level": 0}, {"x": 2366, "y": 3866, "level": 0}, {"x": 2367, "y": 3867, "level": 0}]
                      }, {"type": "ability", "ability": "dive", "from": {"x": 2367, "y": 3867, "level": 0}, "to": {"x": 2377, "y": 3867, "level": 0}}]
                    }
                  }, {
                    "key": {"pulse": 2, "different_level": false}, "value": {
                      "children": [{
                        "key": {"pulse": 1, "different_level": false},
                        "value": {
                          "children": [],
                          "directions": "",
                          "path": [{"type": "ability", "ability": "dive", "from": {"x": 2357, "y": 3867, "level": 0}, "to": {"x": 2367, "y": 3867, "level": 0}}, {
                            "type": "ability",
                            "ability": "surge",
                            "from": {"x": 2367, "y": 3867, "level": 0},
                            "to": {"x": 2377, "y": 3867, "level": 0}
                          }, {"type": "run", "waypoints": [{"x": 2377, "y": 3867, "level": 0}, {"x": 2397, "y": 3867, "level": 0}, {"x": 2399, "y": 3869, "level": 0}]}]
                        }
                      }, {
                        "key": {"pulse": 2, "different_level": false}, "value": {
                          "children": [{
                            "key": {"pulse": 2, "different_level": false},
                            "value": {
                              "children": [],
                              "directions": "",
                              "path": [{"type": "ability", "ability": "surge", "from": {"x": 2370, "y": 3889, "level": 0}, "to": {"x": 2380, "y": 3889, "level": 0}}, {
                                "type": "run",
                                "waypoints": [{"x": 2380, "y": 3889, "level": 0}, {"x": 2390, "y": 3889, "level": 0}]
                              }, {"type": "ability", "ability": "surge", "from": {"x": 2390, "y": 3889, "level": 0}, "to": {"x": 2400, "y": 3889, "level": 0}}]
                            }
                          }, {
                            "key": {"pulse": 3, "different_level": false, "spot": {"x": 2389, "y": 3899, "level": 0}},
                            "value": {
                              "children": [],
                              "directions": "",
                              "path": [{"type": "ability", "ability": "surge", "from": {"x": 2370, "y": 3889, "level": 0}, "to": {"x": 2380, "y": 3889, "level": 0}}, {
                                "type": "run",
                                "waypoints": [{"x": 2380, "y": 3889, "level": 0}, {"x": 2382, "y": 3889, "level": 0}, {"x": 2384, "y": 3891, "level": 0}, {
                                  "x": 2384,
                                  "y": 3894,
                                  "level": 0
                                }, {"x": 2389, "y": 3899, "level": 0}]
                              }]
                            }
                          }],
                          "directions": "",
                          "path": [{"type": "ability", "ability": "surge", "from": {"x": 2357, "y": 3867, "level": 0}, "to": {"x": 2348, "y": 3876, "level": 0}}, {
                            "type": "run",
                            "waypoints": [{"x": 2348, "y": 3876, "level": 0}, {"x": 2348, "y": 3886, "level": 0}, {"x": 2351, "y": 3889, "level": 0}, {
                              "x": 2352,
                              "y": 3889,
                              "level": 0
                            }]
                          }, {"type": "ability", "ability": "dive", "from": {"x": 2352, "y": 3889, "level": 0}, "to": {"x": 2362, "y": 3889, "level": 0}}, {
                            "type": "run",
                            "waypoints": [{"x": 2362, "y": 3889, "level": 0}, {"x": 2370, "y": 3889, "level": 0}]
                          }]
                        }
                      }],
                      "directions": "",
                      "path": [{"type": "run", "waypoints": [{"x": 2363, "y": 3866, "level": 0}, {"x": 2358, "y": 3866, "level": 0}, {"x": 2357, "y": 3867, "level": 0}]}]
                    }
                  }],
                  "directions": "",
                  "path": [{"type": "run", "waypoints": [{"x": 2351, "y": 3854, "level": 0}, {"x": 2353, "y": 3856, "level": 0}]}, {
                    "type": "ability",
                    "ability": "surge",
                    "from": {"x": 2353, "y": 3856, "level": 0},
                    "to": {"x": 2363, "y": 3866, "level": 0}
                  }]
                }
              }, {
                "key": {"pulse": 2, "different_level": false}, "value": {
                  "children": [{
                    "key": {"pulse": 1, "different_level": false}, "value": {
                      "children": [],
                      "directions": "",
                      "path": [{
                        "type": "run",
                        "waypoints": [{"x": 2354, "y": 3854, "level": 0}, {"x": 2354, "y": 3849, "level": 0}, {"x": 2355, "y": 3848, "level": 0}]
                      }, {
                        "type": "transport",
                        "assumed_start": {"x": 2355, "y": 3848, "level": 0},
                        "internal": {
                          "type": "entity",
                          "entity": {"name": "Rope bridge", "kind": "static"},
                          "clickable_area": {"topleft": {"x": 2354.5, "y": 3847.5}, "botright": {"x": 2355.5, "y": 3846.5}, "level": 0},
                          "actions": [{
                            "cursor": "agility",
                            "interactive_area": {"origin": {"x": 2355, "y": 3848, "level": 0}},
                            "name": "Walk-across",
                            "movement": [{"time": 10, "offset": {"x": 0, "y": -9, "level": 0}}]
                          }]
                        }
                      }, {"type": "ability", "ability": "dive", "from": {"x": 2355, "y": 3839, "level": 0}, "to": {"x": 2345, "y": 3833, "level": 0}}, {
                        "type": "run",
                        "waypoints": [{"x": 2345, "y": 3833, "level": 0}, {"x": 2343, "y": 3833, "level": 0}]
                      }, {"type": "ability", "ability": "surge", "from": {"x": 2343, "y": 3833, "level": 0}, "to": {"x": 2333, "y": 3833, "level": 0}}, {
                        "type": "ability",
                        "ability": "surge",
                        "from": {"x": 2333, "y": 3833, "level": 0},
                        "to": {"x": 2323, "y": 3833, "level": 0}
                      }, {
                        "type": "run",
                        "waypoints": [{"x": 2323, "y": 3833, "level": 0}, {"x": 2322, "y": 3833, "level": 0}, {"x": 2321, "y": 3834, "level": 0}, {
                          "x": 2312,
                          "y": 3834,
                          "level": 0
                        }, {"x": 2311, "y": 3835, "level": 0}]
                      }]
                    }
                  }, {
                    "key": {"pulse": 2, "different_level": false}, "value": {
                      "children": [{
                        "key": {"pulse": 2, "different_level": false},
                        "value": {
                          "children": [],
                          "directions": "",
                          "path": [{
                            "type": "run",
                            "waypoints": [{"x": 2348, "y": 3876, "level": 0}, {"x": 2348, "y": 3879, "level": 0}, {"x": 2347, "y": 3880, "level": 0}]
                          }, {"type": "ability", "ability": "surge", "from": {"x": 2347, "y": 3880, "level": 0}, "to": {"x": 2337, "y": 3890, "level": 0}}, {
                            "type": "run",
                            "waypoints": [{"x": 2337, "y": 3890, "level": 0}, {"x": 2329, "y": 3890, "level": 0}, {"x": 2328, "y": 3891, "level": 0}, {
                              "x": 2315,
                              "y": 3891,
                              "level": 0
                            }, {"x": 2313, "y": 3893, "level": 0}]
                          }]
                        }
                      }, {
                        "key": {"pulse": 3, "different_level": false, "spot": {"x": 2352, "y": 3892, "level": 0}},
                        "value": {
                          "children": [],
                          "directions": "",
                          "path": [{"type": "run", "waypoints": [{"x": 2348, "y": 3876, "level": 0}, {"x": 2348, "y": 3878, "level": 0}]}, {
                            "type": "ability",
                            "ability": "surge",
                            "from": {"x": 2348, "y": 3878, "level": 0},
                            "to": {"x": 2348, "y": 3888, "level": 0}
                          }, {"type": "run", "waypoints": [{"x": 2348, "y": 3888, "level": 0}, {"x": 2352, "y": 3892, "level": 0}]}]
                        }
                      }],
                      "directions": "",
                      "path": [{"type": "ability", "ability": "dive", "from": {"x": 2354, "y": 3854, "level": 0}, "to": {"x": 2348, "y": 3864, "level": 0}}, {
                        "type": "run",
                        "waypoints": [{"x": 2348, "y": 3864, "level": 0}, {"x": 2348, "y": 3866, "level": 0}]
                      }, {"type": "ability", "ability": "surge", "from": {"x": 2348, "y": 3866, "level": 0}, "to": {"x": 2348, "y": 3876, "level": 0}}]
                    }
                  }], "directions": "", "path": [{"type": "run", "waypoints": [{"x": 2351, "y": 3854, "level": 0}, {"x": 2354, "y": 3854, "level": 0}]}]
                }
              }],
              "directions": "",
              "path": [{"type": "run", "waypoints": [{"x": 2355, "y": 3848, "level": 0}, {"x": 2355, "y": 3850, "level": 0}, {"x": 2351, "y": 3854, "level": 0}]}]
            }
          }, {
            "key": {"pulse": 2, "different_level": false}, "value": {
              "children": [{
                "key": {"pulse": 1, "different_level": false}, "value": {
                  "children": [{
                    "key": {"pulse": 3, "different_level": false, "spot": {"x": 2324, "y": 3808, "level": 0}},
                    "value": {
                      "children": [],
                      "directions": "",
                      "path": [{"type": "ability", "ability": "dive", "from": {"x": 2324, "y": 3802, "level": 0}, "to": {"x": 2324, "y": 3808, "level": 0}}]
                    }
                  }, {
                    "key": {"pulse": 3, "different_level": false, "spot": {"x": 2342, "y": 3809, "level": 0}},
                    "value": {
                      "children": [],
                      "directions": "",
                      "path": [{
                        "type": "run",
                        "waypoints": [{"x": 2324, "y": 3802, "level": 0}, {"x": 2326, "y": 3804, "level": 0}, {"x": 2328, "y": 3804, "level": 0}]
                      }, {
                        "type": "transport",
                        "assumed_start": {"x": 2328, "y": 3804, "level": 0},
                        "internal": {
                          "type": "entity",
                          "entity": {"kind": "static", "name": "Door"},
                          "clickable_area": {"topleft": {"x": 2328, "y": 3804.5}, "botright": {"x": 2329, "y": 3803.5}, "level": 0},
                          "actions": [{
                            "cursor": "open",
                            "interactive_area": {"origin": {"x": 2328, "y": 3804, "level": 0}, "size": {"x": 2, "y": 1}},
                            "name": "Pass",
                            "movement": [{"time": 1, "offset": {"x": 1, "y": 0, "level": 0}, "valid_from": {"origin": {"x": 2328, "y": 3804, "level": 0}}}, {
                              "time": 1,
                              "offset": {"x": -1, "y": 0, "level": 0},
                              "valid_from": {"origin": {"x": 2329, "y": 3804, "level": 0}}
                            }]
                          }]
                        }
                      }, {"type": "ability", "ability": "surge", "from": {"x": 2329, "y": 3804, "level": 0}, "to": {"x": 2339, "y": 3804, "level": 0}}, {
                        "type": "ability",
                        "ability": "dive",
                        "from": {"x": 2339, "y": 3804, "level": 0},
                        "to": {"x": 2341, "y": 3809, "level": 0}
                      }]
                    }
                  }],
                  "directions": "",
                  "path": [{"type": "teleport", "spot": {"x": 2311, "y": 3786, "level": 0}, "id": {"group": "lyre", "spot": "neitiznot", "access": "lyre"}}, {
                    "type": "run",
                    "waypoints": [{"x": 2311, "y": 3786, "level": 0}, {"x": 2311, "y": 3788, "level": 0}, {"x": 2312, "y": 3788, "level": 0}, {
                      "x": 2312,
                      "y": 3789,
                      "level": 0
                    }, {"x": 2313, "y": 3789, "level": 0}, {"x": 2313, "y": 3791, "level": 0}, {"x": 2314, "y": 3792, "level": 0}]
                  }, {"type": "ability", "ability": "surge", "from": {"x": 2314, "y": 3792, "level": 0}, "to": {"x": 2324, "y": 3802, "level": 0}}]
                }
              }, {
                "key": {"pulse": 2, "different_level": false}, "value": {
                  "children": [{
                    "key": {"pulse": 1, "different_level": false}, "value": {
                      "children": [],
                      "directions": "",
                      "path": [{"type": "teleport", "spot": {"x": 2404, "y": 3782, "level": 0}, "id": {"group": "lyre", "spot": "jatizso", "access": "lyre"}}, {
                        "type": "run",
                        "waypoints": [{"x": 2404, "y": 3782, "level": 0}, {"x": 2404, "y": 3784, "level": 0}, {"x": 2406, "y": 3786, "level": 0}]
                      }, {"type": "ability", "ability": "dive", "from": {"x": 2406, "y": 3786, "level": 0}, "to": {"x": 2412, "y": 3796, "level": 0}}, {
                        "type": "transport",
                        "assumed_start": {"x": 2412, "y": 3796, "level": 0},
                        "internal": {
                          "type": "entity",
                          "entity": {"kind": "static", "name": "Gate"},
                          "clickable_area": {"topleft": {"x": 2411.5, "y": 3797}, "botright": {"x": 2412.5, "y": 3796}, "level": 0},
                          "actions": [{
                            "cursor": "open",
                            "interactive_area": {"origin": {"x": 2412, "y": 3796, "level": 0}, "size": {"x": 1, "y": 2}},
                            "name": "Pass",
                            "movement": [{"time": 1, "offset": {"x": 0, "y": -1, "level": 0}, "valid_from": {"origin": {"x": 2412, "y": 3797, "level": 0}}}, {
                              "time": 1,
                              "offset": {"x": 0, "y": 1, "level": 0},
                              "valid_from": {"origin": {"x": 2412, "y": 3796, "level": 0}}
                            }]
                          }]
                        }
                      }, {
                        "type": "run",
                        "waypoints": [{"x": 2412, "y": 3797, "level": 0}, {"x": 2412, "y": 3798, "level": 0}, {"x": 2404, "y": 3798, "level": 0}, {
                          "x": 2403,
                          "y": 3799,
                          "level": 0
                        }, {"x": 2401, "y": 3799, "level": 0}, {"x": 2400, "y": 3800, "level": 0}, {"x": 2399, "y": 3800, "level": 0}]
                      }, {"type": "ability", "ability": "surge", "from": {"x": 2399, "y": 3800, "level": 0}, "to": {"x": 2389, "y": 3800, "level": 0}}, {
                        "type": "run",
                        "waypoints": [{"x": 2389, "y": 3800, "level": 0}, {"x": 2389, "y": 3799, "level": 0}, {"x": 2388, "y": 3799, "level": 0}]
                      }, {
                        "type": "transport",
                        "assumed_start": {"x": 2388, "y": 3799, "level": 0},
                        "internal": {
                          "type": "entity",
                          "entity": {"kind": "static", "name": "Gate"},
                          "clickable_area": {"topleft": {"x": 2387, "y": 3799.5}, "botright": {"x": 2388, "y": 3798.5}, "level": 0},
                          "actions": [{
                            "cursor": "open",
                            "interactive_area": {"origin": {"x": 2387, "y": 3799, "level": 0}, "size": {"x": 2, "y": 1}},
                            "name": "Pass",
                            "movement": [{"time": 1, "offset": {"x": -1, "y": 0, "level": 0}, "valid_from": {"origin": {"x": 2388, "y": 3799, "level": 0}}}, {
                              "time": 1,
                              "offset": {"x": 1, "y": 0, "level": 0},
                              "valid_from": {"origin": {"x": 2387, "y": 3799, "level": 0}}
                            }]
                          }]
                        }
                      }, {"type": "run", "waypoints": [{"x": 2387, "y": 3799, "level": 0}, {"x": 2386, "y": 3799, "level": 0}, {"x": 2384, "y": 3801, "level": 0}]}, {
                        "type": "run",
                        "waypoints": [{"x": 2384, "y": 3801, "level": 0}, {"x": 2385, "y": 3802, "level": 0}]
                      }, {"type": "ability", "ability": "surge", "from": {"x": 2385, "y": 3802, "level": 0}, "to": {"x": 2395, "y": 3812, "level": 0}}]
                    }
                  }, {"key": {"pulse": 2, "different_level": false}, "value": {"children": [], "directions": "", "path": []}}, {
                    "key": {
                      "pulse": 3,
                      "different_level": false,
                      "spot": {"x": 2326, "y": 3866, "level": 0}
                    },
                    "value": {
                      "children": [],
                      "directions": "",
                      "path": [{"type": "run", "waypoints": [{"x": 2345, "y": 3863, "level": 0}, {"x": 2343, "y": 3863, "level": 0}]}, {
                        "type": "ability",
                        "ability": "surge",
                        "from": {"x": 2343, "y": 3863, "level": 0},
                        "to": {"x": 2333, "y": 3863, "level": 0}
                      }, {"type": "ability", "ability": "dive", "from": {"x": 2333, "y": 3863, "level": 0}, "to": {"x": 2326, "y": 3866, "level": 0}}]
                    }
                  }, {
                    "key": {"pulse": 3, "different_level": false, "spot": {"x": 2326, "y": 3850, "level": 0}},
                    "value": {
                      "children": [],
                      "directions": "",
                      "path": [{"type": "run", "waypoints": [{"x": 2345, "y": 3863, "level": 0}, {"x": 2343, "y": 3863, "level": 0}]}, {
                        "type": "ability",
                        "ability": "surge",
                        "from": {"x": 2343, "y": 3863, "level": 0},
                        "to": {"x": 2333, "y": 3863, "level": 0}
                      }, {"type": "ability", "ability": "dive", "from": {"x": 2333, "y": 3863, "level": 0}, "to": {"x": 2323, "y": 3853, "level": 0}}, {
                        "type": "run",
                        "waypoints": [{"x": 2323, "y": 3853, "level": 0}, {"x": 2325, "y": 3851, "level": 0}]
                      }]
                    }
                  }, {
                    "key": {"pulse": 3, "different_level": false, "spot": {"x": 2349, "y": 3880, "level": 0}},
                    "value": {
                      "children": [],
                      "directions": "",
                      "path": [{
                        "type": "run",
                        "waypoints": [{"x": 2345, "y": 3863, "level": 0}, {"x": 2346, "y": 3863, "level": 0}, {"x": 2347, "y": 3864, "level": 0}]
                      }, {"type": "ability", "ability": "surge", "from": {"x": 2347, "y": 3864, "level": 0}, "to": {"x": 2354, "y": 3871, "level": 0}}, {
                        "type": "ability",
                        "ability": "dive",
                        "from": {"x": 2354, "y": 3871, "level": 0},
                        "to": {"x": 2349, "y": 3880, "level": 0}
                      }]
                    }
                  }],
                  "directions": "",
                  "path": [{"type": "run", "waypoints": [{"x": 2356, "y": 3852, "level": 0}, {"x": 2354, "y": 3854, "level": 0}]}, {
                    "type": "ability",
                    "ability": "surge",
                    "from": {"x": 2354, "y": 3854, "level": 0},
                    "to": {"x": 2345, "y": 3863, "level": 0}
                  }]
                }
              }, {
                "key": {"pulse": 3, "different_level": false, "spot": {"x": 2377, "y": 3850, "level": 0}}, "value": {
                  "children": [],
                  "directions": "",
                  "path": [{
                    "type": "run",
                    "waypoints": [{"x": 2356, "y": 3852, "level": 0}, {"x": 2356, "y": 3849, "level": 0}, {"x": 2355, "y": 3848, "level": 0}]
                  }, {
                    "type": "transport",
                    "assumed_start": {"x": 2355, "y": 3848, "level": 0},
                    "internal": {
                      "type": "entity",
                      "entity": {"name": "Rope bridge", "kind": "static"},
                      "clickable_area": {"topleft": {"x": 2354.5, "y": 3847.5}, "botright": {"x": 2355.5, "y": 3846.5}, "level": 0},
                      "actions": [{
                        "cursor": "agility",
                        "interactive_area": {"origin": {"x": 2355, "y": 3848, "level": 0}},
                        "name": "Walk-across",
                        "movement": [{"time": 10, "offset": {"x": 0, "y": -9, "level": 0}}]
                      }]
                    }
                  }, {"type": "run", "waypoints": [{"x": 2355, "y": 3839, "level": 0}, {"x": 2356, "y": 3838, "level": 0}]}, {
                    "type": "ability",
                    "ability": "surge",
                    "from": {"x": 2356, "y": 3838, "level": 0},
                    "to": {"x": 2364, "y": 3830, "level": 0}
                  }, {"type": "run", "waypoints": [{"x": 2364, "y": 3830, "level": 0}, {"x": 2369, "y": 3830, "level": 0}]}, {
                    "type": "ability",
                    "ability": "dive",
                    "from": {"x": 2369, "y": 3830, "level": 0},
                    "to": {"x": 2378, "y": 3839, "level": 0}
                  }, {
                    "type": "transport",
                    "assumed_start": {"x": 2378, "y": 3839, "level": 0},
                    "internal": {
                      "type": "entity",
                      "entity": {"name": "Rope bridge", "kind": "static"},
                      "clickable_area": {"topleft": {"x": 2377.5, "y": 3840.5}, "botright": {"x": 2378.5, "y": 3839.5}, "level": 0},
                      "actions": [{
                        "cursor": "generic",
                        "interactive_area": {"origin": {"x": 2378, "y": 3839, "level": 0}},
                        "name": "Cross-bridge",
                        "movement": [{"time": 10, "offset": {"x": 0, "y": 9, "level": 0}}]
                      }]
                    }
                  }, {"type": "run", "waypoints": [{"x": 2378, "y": 3848, "level": 0}, {"x": 2378, "y": 3849, "level": 0}, {"x": 2377, "y": 3850, "level": 0}]}]
                }
              }, {
                "key": {"pulse": 3, "different_level": false, "spot": {"x": 2368, "y": 3870, "level": 0}},
                "value": {
                  "children": [],
                  "directions": "",
                  "path": [{"type": "run", "waypoints": [{"x": 2356, "y": 3852, "level": 0}, {"x": 2356, "y": 3857, "level": 0}]}, {
                    "type": "ability",
                    "ability": "dive",
                    "from": {"x": 2356, "y": 3857, "level": 0},
                    "to": {"x": 2366, "y": 3867, "level": 0}
                  }, {"type": "run", "waypoints": [{"x": 2366, "y": 3867, "level": 0}, {"x": 2368, "y": 3869, "level": 0}]}]
                }
              }],
              "directions": "",
              "path": [{"type": "run", "waypoints": [{"x": 2355, "y": 3848, "level": 0}, {"x": 2355, "y": 3851, "level": 0}, {"x": 2356, "y": 3852, "level": 0}]}]
            }
          }, {
            "key": {"pulse": 3, "different_level": false, "spot": {"x": 2373, "y": 3834, "level": 0}},
            "value": {
              "children": [],
              "directions": "",
              "path": [{
                "type": "transport",
                "assumed_start": {"x": 2355, "y": 3848, "level": 0},
                "internal": {
                  "type": "entity",
                  "entity": {"name": "Rope bridge", "kind": "static"},
                  "clickable_area": {"topleft": {"x": 2354.5, "y": 3847.5}, "botright": {"x": 2355.5, "y": 3846.5}, "level": 0},
                  "actions": [{
                    "cursor": "agility",
                    "interactive_area": {"origin": {"x": 2355, "y": 3848, "level": 0}},
                    "name": "Walk-across",
                    "movement": [{"time": 10, "offset": {"x": 0, "y": -9, "level": 0}}]
                  }]
                }
              }, {"type": "run", "waypoints": [{"x": 2355, "y": 3839, "level": 0}, {"x": 2357, "y": 3837, "level": 0}]}, {
                "type": "ability",
                "ability": "surge",
                "from": {"x": 2357, "y": 3837, "level": 0},
                "to": {"x": 2364, "y": 3830, "level": 0}
              }, {"type": "ability", "ability": "dive", "from": {"x": 2364, "y": 3830, "level": 0}, "to": {"x": 2373, "y": 3834, "level": 0}}]
            }
          }, {
            "key": {"pulse": 3, "different_level": false, "spot": {"x": 2354, "y": 3853, "level": 0}},
            "value": {
              "children": [],
              "directions": "",
              "path": [{"type": "ability", "ability": "dive", "from": {"x": 2355, "y": 3848, "level": 0}, "to": {"x": 2354, "y": 3853, "level": 0}}]
            }
          }],
          "directions": "",
          "path": [{"type": "teleport", "spot": {"x": 2355, "y": 3848, "level": 0}, "id": {"group": "naturessentinel", "spot": "arcticpine", "access": "outfit"}}]
        }
      },
      "expected_time": 28.234375
    }],
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