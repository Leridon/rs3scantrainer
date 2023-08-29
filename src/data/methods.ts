import {indirected, method} from "../model/methods";


/* ts-ignore */
let raw: (method & indirected)[] = [
    {
        "areas": [
            {
                "name": "A",
                "area": {
                    "topleft": {
                        "x": 2412,
                        "y": 4434,
                    },
                    "botright": {
                        "x": 2412,
                        "y": 4434,
                    },
                    "level": 0
                }
            },
            {
                "name": "B",
                "area": {
                    "topleft": {
                        "x": 2410,
                        "y": 4436,
                    },
                    "botright": {
                        "x": 2410,
                        "y": 4436,
                    },
                    "level": 0
                }
            },
            {
                "name": "C",
                "area": {
                    "topleft": {
                        "x": 2420,
                        "y": 4444,
                    },
                    "botright": {
                        "x": 2420,
                        "y": 4444,
                    },
                    "level": 0
                }
            },
            {
                "name": "D",
                "area": {
                    "topleft": {
                        "x": 2409,
                        "y": 4455,
                    },
                    "botright": {
                        "x": 2409,
                        "y": 4455,
                    },
                    "level": 0
                }
            },
            {
                "name": "E",
                "area": {
                    "topleft": {
                        "x": 2398,
                        "y": 4444,
                    },
                    "botright": {
                        "x": 2398,
                        "y": 4444,
                    },
                    "level": 0
                }
            },
            {
                "name": "F",
                "area": {
                    "topleft": {
                        "x": 2445,
                        "y": 4431
                    },
                    "botright": {
                        "x": 2447,
                        "y": 4429
                    },
                    "level": 0
                }
            },
            {
                "name": "G",
                "area": {
                    "topleft": {
                        "x": 2405,
                        "y": 4381,
                    },
                    "botright": {
                        "x": 2405,
                        "y": 4381,
                    },
                    "level": 0
                }
            }
        ],
        "assumes_meerkats": true,
        "clue": 361,
        "root": {
            "where_to": "A",
            "children": [
                {
                    "key": {
                        "pulse": 1,
                        "different_level": false
                    },
                    "value": {
                        "where_to": "F",
                        "children": [
                            {
                                "key": {
                                    "pulse": 1,
                                    "different_level": false
                                },
                                "value": {
                                    "where_to": "G",
                                    "children": [
                                        {
                                            "key": {
                                                "pulse": 3,
                                                "different_level": false
                                            },
                                            "value": {
                                                "where_to": null,
                                                "children": [],
                                                "paths": [
                                                    {
                                                        "spot": {
                                                            "x": 2414,
                                                            "y": 4378,
                                                            "level": 0
                                                        },
                                                        "directions": "Dig at {{target}}",
                                                        "path": {
                                                            "steps": [],
                                                            "start_state": {
                                                                "tick": 4,
                                                                "cooldowns": {
                                                                    "escape": [
                                                                        0,
                                                                        0
                                                                    ],
                                                                    "surge": [
                                                                        0,
                                                                        0
                                                                    ],
                                                                    "barge": 0,
                                                                    "dive": 0
                                                                },
                                                                "acceleration_activation_tick": -1000,
                                                                "position": {
                                                                    "tile": null,
                                                                    "direction": null
                                                                },
                                                                "targeted_entity": null
                                                            },
                                                            "target": {
                                                                "topleft": {
                                                                    "x": 2413,
                                                                    "y": 4379
                                                                },
                                                                "botright": {
                                                                    "x": 2415,
                                                                    "y": 4377
                                                                },
                                                                "level": 0
                                                            }
                                                        }
                                                    },
                                                    {
                                                        "spot": {
                                                            "x": 2420,
                                                            "y": 4381,
                                                            "level": 0
                                                        },
                                                        "directions": "Dig at {{target}}",
                                                        "path": {
                                                            "steps": [],
                                                            "start_state": {
                                                                "tick": 4,
                                                                "cooldowns": {
                                                                    "escape": [
                                                                        0,
                                                                        0
                                                                    ],
                                                                    "surge": [
                                                                        0,
                                                                        0
                                                                    ],
                                                                    "barge": 0,
                                                                    "dive": 0
                                                                },
                                                                "acceleration_activation_tick": -1000,
                                                                "position": {
                                                                    "tile": null,
                                                                    "direction": null
                                                                },
                                                                "targeted_entity": null
                                                            },
                                                            "target": {
                                                                "topleft": {
                                                                    "x": 2419,
                                                                    "y": 4382
                                                                },
                                                                "botright": {
                                                                    "x": 2421,
                                                                    "y": 4380
                                                                },
                                                                "level": 0
                                                            }
                                                        }
                                                    },
                                                    {
                                                        "spot": {
                                                            "x": 2423,
                                                            "y": 4372,
                                                            "level": 0
                                                        },
                                                        "directions": "Dig at {{target}}",
                                                        "path": {
                                                            "steps": [],
                                                            "start_state": {
                                                                "tick": 4,
                                                                "cooldowns": {
                                                                    "escape": [
                                                                        0,
                                                                        0
                                                                    ],
                                                                    "surge": [
                                                                        0,
                                                                        0
                                                                    ],
                                                                    "barge": 0,
                                                                    "dive": 0
                                                                },
                                                                "acceleration_activation_tick": -1000,
                                                                "position": {
                                                                    "tile": null,
                                                                    "direction": null
                                                                },
                                                                "targeted_entity": null
                                                            },
                                                            "target": {
                                                                "topleft": {
                                                                    "x": 2422,
                                                                    "y": 4373
                                                                },
                                                                "botright": {
                                                                    "x": 2424,
                                                                    "y": 4371
                                                                },
                                                                "level": 0
                                                            }
                                                        }
                                                    }
                                                ]
                                            }
                                        }
                                    ],
                                    "paths": [
                                        {
                                            "directions": "{{teleport wickedhood cosmic}} to {{target}}",
                                            "path": {
                                                "start_state": {
                                                    "tick": 3,
                                                    "cooldowns": {
                                                        "escape": [
                                                            0,
                                                            0
                                                        ],
                                                        "surge": [
                                                            0,
                                                            0
                                                        ],
                                                        "barge": 0,
                                                        "dive": 0
                                                    },
                                                    "acceleration_activation_tick": -1000,
                                                    "position": {
                                                        "tile": null,
                                                        "direction": null
                                                    },
                                                    "targeted_entity": null
                                                },
                                                "steps": [],
                                                "target": {
                                                    "topleft": {
                                                        "x": 2405,
                                                        "y": 4381,
                                                    },
                                                    "botright": {
                                                        "x": 2405,
                                                        "y": 4381,
                                                    },
                                                    "level": 0
                                                }
                                            }
                                        }
                                    ]
                                }
                            },
                            {
                                "key": {
                                    "pulse": 2,
                                    "different_level": false
                                },
                                "value": {
                                    "where_to": null,
                                    "children": [],
                                    "paths": [
                                        {
                                            "spot": {
                                                "x": 2468,
                                                "y": 4439,
                                                "level": 0
                                            },
                                            "directions": "Dig at {{target}}",
                                            "path": {
                                                "steps": [],
                                                "start_state": {
                                                    "tick": 3,
                                                    "cooldowns": {
                                                        "escape": [
                                                            0,
                                                            0
                                                        ],
                                                        "surge": [
                                                            0,
                                                            0
                                                        ],
                                                        "barge": 0,
                                                        "dive": 0
                                                    },
                                                    "acceleration_activation_tick": -1000,
                                                    "position": {
                                                        "tile": null,
                                                        "direction": null
                                                    },
                                                    "targeted_entity": null
                                                },
                                                "target": {
                                                    "topleft": {
                                                        "x": 2467,
                                                        "y": 4440
                                                    },
                                                    "botright": {
                                                        "x": 2469,
                                                        "y": 4438
                                                    },
                                                    "level": 0
                                                }
                                            }
                                        }
                                    ]
                                }
                            },
                            {
                                "key": {
                                    "pulse": 3,
                                    "different_level": false
                                },
                                "value": {
                                    "where_to": null,
                                    "children": [],
                                    "paths": [
                                        {
                                            "spot": {
                                                "x": 2457,
                                                "y": 4443,
                                                "level": 0
                                            },
                                            "directions": "Dig at {{target}}",
                                            "path": {
                                                "steps": [],
                                                "start_state": {
                                                    "tick": 3,
                                                    "cooldowns": {
                                                        "escape": [
                                                            0,
                                                            0
                                                        ],
                                                        "surge": [
                                                            0,
                                                            0
                                                        ],
                                                        "barge": 0,
                                                        "dive": 0
                                                    },
                                                    "acceleration_activation_tick": -1000,
                                                    "position": {
                                                        "tile": null,
                                                        "direction": null
                                                    },
                                                    "targeted_entity": null
                                                },
                                                "target": {
                                                    "topleft": {
                                                        "x": 2456,
                                                        "y": 4444
                                                    },
                                                    "botright": {
                                                        "x": 2458,
                                                        "y": 4442
                                                    },
                                                    "level": 0
                                                }
                                            }
                                        },
                                        {
                                            "spot": {
                                                "x": 2468,
                                                "y": 4439,
                                                "level": 0
                                            },
                                            "directions": "Dig at {{target}}",
                                            "path": {
                                                "steps": [],
                                                "start_state": {
                                                    "tick": 3,
                                                    "cooldowns": {
                                                        "escape": [
                                                            0,
                                                            0
                                                        ],
                                                        "surge": [
                                                            0,
                                                            0
                                                        ],
                                                        "barge": 0,
                                                        "dive": 0
                                                    },
                                                    "acceleration_activation_tick": -1000,
                                                    "position": {
                                                        "tile": null,
                                                        "direction": null
                                                    },
                                                    "targeted_entity": null
                                                },
                                                "target": {
                                                    "topleft": {
                                                        "x": 2467,
                                                        "y": 4440
                                                    },
                                                    "botright": {
                                                        "x": 2469,
                                                        "y": 4438
                                                    },
                                                    "level": 0
                                                }
                                            }
                                        }
                                    ]
                                }
                            }
                        ],
                        "paths": [
                            {
                                "directions": "Go to {{target}}.",
                                "path": {
                                    "start_state": {
                                        "tick": 2,
                                        "cooldowns": {
                                            "escape": [
                                                0,
                                                0
                                            ],
                                            "surge": [
                                                0,
                                                0
                                            ],
                                            "barge": 0,
                                            "dive": 0
                                        },
                                        "acceleration_activation_tick": -1000,
                                        "position": {
                                            "tile": null,
                                            "direction": null
                                        },
                                        "targeted_entity": null
                                    },
                                    "steps": [],
                                    "target": {
                                        "topleft": {
                                            "x": 2445,
                                            "y": 4431
                                        },
                                        "botright": {
                                            "x": 2447,
                                            "y": 4429
                                        },
                                        "level": 0
                                    }
                                }
                            }
                        ]
                    }
                },
                {
                    "key": {
                        "pulse": 2,
                        "different_level": false
                    },
                    "value": {
                        "where_to": "B",
                        "children": [
                            {
                                "key": {
                                    "pulse": 1,
                                    "different_level": false
                                },
                                "value": {
                                    "where_to": null,
                                    "children": [],
                                    "paths": [
                                        {
                                            "spot": {
                                                "x": 2453,
                                                "y": 4471,
                                                "level": 0
                                            },
                                            "directions": "Dig at {{target}}",
                                            "path": {
                                                "steps": [],
                                                "start_state": {
                                                    "tick": 4,
                                                    "cooldowns": {
                                                        "escape": [
                                                            0,
                                                            0
                                                        ],
                                                        "surge": [
                                                            0,
                                                            0
                                                        ],
                                                        "barge": 0,
                                                        "dive": 0
                                                    },
                                                    "acceleration_activation_tick": -1000,
                                                    "position": {
                                                        "tile": {
                                                            "x": 2410,
                                                            "y": 4436,
                                                            "level": 0
                                                        },
                                                        "direction": 5
                                                    },
                                                    "targeted_entity": null
                                                },
                                                "target": {
                                                    "topleft": {
                                                        "x": 2452,
                                                        "y": 4472
                                                    },
                                                    "botright": {
                                                        "x": 2454,
                                                        "y": 4470
                                                    },
                                                    "level": 0
                                                }
                                            }
                                        }
                                    ]
                                }
                            },
                            {
                                "key": {
                                    "pulse": 2,
                                    "different_level": false
                                },
                                "value": {
                                    "where_to": "C",
                                    "children": [
                                        {
                                            "key": {
                                                "pulse": 1,
                                                "different_level": false
                                            },
                                            "value": {
                                                "where_to": "D",
                                                "children": [
                                                    {
                                                        "key": {
                                                            "pulse": 1,
                                                            "different_level": false
                                                        },
                                                        "value": {
                                                            "where_to": null,
                                                            "children": [],
                                                            "paths": [
                                                                {
                                                                    "spot": {
                                                                        "x": 2377,
                                                                        "y": 4410,
                                                                        "level": 0
                                                                    },
                                                                    "directions": "Dig at {{target}}",
                                                                    "path": {
                                                                        "steps": [],
                                                                        "start_state": {
                                                                            "tick": 6,
                                                                            "cooldowns": {
                                                                                "escape": [
                                                                                    0,
                                                                                    0
                                                                                ],
                                                                                "surge": [
                                                                                    0,
                                                                                    0
                                                                                ],
                                                                                "barge": 0,
                                                                                "dive": 21
                                                                            },
                                                                            "acceleration_activation_tick": -1000,
                                                                            "position": {
                                                                                "tile": {
                                                                                    "x": 2420,
                                                                                    "y": 4444,
                                                                                    "level": 0
                                                                                },
                                                                                "direction": 6
                                                                            },
                                                                            "targeted_entity": null
                                                                        },
                                                                        "target": {
                                                                            "topleft": {
                                                                                "x": 2376,
                                                                                "y": 4411
                                                                            },
                                                                            "botright": {
                                                                                "x": 2378,
                                                                                "y": 4409
                                                                            },
                                                                            "level": 0
                                                                        }
                                                                    }
                                                                }
                                                            ]
                                                        }
                                                    },
                                                    {
                                                        "key": {
                                                            "pulse": 2,
                                                            "different_level": false
                                                        },
                                                        "value": {
                                                            "where_to": null,
                                                            "children": [],
                                                            "paths": [
                                                                {
                                                                    "spot": {
                                                                        "x": 2372,
                                                                        "y": 4467,
                                                                        "level": 0
                                                                    },
                                                                    "directions": "Dig at {{target}}",
                                                                    "path": {
                                                                        "steps": [],
                                                                        "start_state": {
                                                                            "tick": 6,
                                                                            "cooldowns": {
                                                                                "escape": [
                                                                                    0,
                                                                                    0
                                                                                ],
                                                                                "surge": [
                                                                                    0,
                                                                                    0
                                                                                ],
                                                                                "barge": 0,
                                                                                "dive": 21
                                                                            },
                                                                            "acceleration_activation_tick": -1000,
                                                                            "position": {
                                                                                "tile": {
                                                                                    "x": 2420,
                                                                                    "y": 4444,
                                                                                    "level": 0
                                                                                },
                                                                                "direction": 6
                                                                            },
                                                                            "targeted_entity": null
                                                                        },
                                                                        "target": {
                                                                            "topleft": {
                                                                                "x": 2371,
                                                                                "y": 4468
                                                                            },
                                                                            "botright": {
                                                                                "x": 2373,
                                                                                "y": 4466
                                                                            },
                                                                            "level": 0
                                                                        }
                                                                    }
                                                                }
                                                            ]
                                                        }
                                                    }
                                                ],
                                                "paths": [
                                                    {
                                                        "directions": "Move to {{target}}",
                                                        "path": {
                                                            "start_state": {
                                                                "tick": 5,
                                                                "cooldowns": {
                                                                    "escape": [
                                                                        0,
                                                                        0
                                                                    ],
                                                                    "surge": [
                                                                        0,
                                                                        0
                                                                    ],
                                                                    "barge": 0,
                                                                    "dive": 21
                                                                },
                                                                "acceleration_activation_tick": -1000,
                                                                "position": {
                                                                    "tile": {
                                                                        "x": 2420,
                                                                        "y": 4444,
                                                                        "level": 0
                                                                    },
                                                                    "direction": 6
                                                                },
                                                                "targeted_entity": null
                                                            },
                                                            "steps": [],
                                                            "target": {
                                                                "topleft": {
                                                                    "x": 2409,
                                                                    "y": 4455,
                                                                },
                                                                "botright": {
                                                                    "x": 2409,
                                                                    "y": 4455,
                                                                },
                                                                "level": 0
                                                            }
                                                        }
                                                    }
                                                ]
                                            }
                                        },
                                        {
                                            "key": {
                                                "pulse": 2,
                                                "different_level": false
                                            },
                                            "value": {
                                                "where_to": "D",
                                                "children": [
                                                    {
                                                        "key": {
                                                            "pulse": 1,
                                                            "different_level": false
                                                        },
                                                        "value": {
                                                            "where_to": null,
                                                            "children": [],
                                                            "paths": [
                                                                {
                                                                    "spot": {
                                                                        "x": 2404,
                                                                        "y": 4406,
                                                                        "level": 0
                                                                    },
                                                                    "directions": "Dig at {{target}}",
                                                                    "path": {
                                                                        "steps": [],
                                                                        "start_state": {
                                                                            "tick": 7,
                                                                            "cooldowns": {
                                                                                "escape": [
                                                                                    23,
                                                                                    23
                                                                                ],
                                                                                "surge": [
                                                                                    23,
                                                                                    8
                                                                                ],
                                                                                "barge": 0,
                                                                                "dive": 21
                                                                            },
                                                                            "acceleration_activation_tick": -1000,
                                                                            "position": {
                                                                                "tile": {
                                                                                    "x": 2409,
                                                                                    "y": 4455,
                                                                                    "level": 0
                                                                                },
                                                                                "direction": 5
                                                                            },
                                                                            "targeted_entity": null
                                                                        },
                                                                        "target": {
                                                                            "topleft": {
                                                                                "x": 2403,
                                                                                "y": 4407
                                                                            },
                                                                            "botright": {
                                                                                "x": 2405,
                                                                                "y": 4405
                                                                            },
                                                                            "level": 0
                                                                        }
                                                                    }
                                                                },
                                                                {
                                                                    "spot": {
                                                                        "x": 2389,
                                                                        "y": 4405,
                                                                        "level": 0
                                                                    },
                                                                    "directions": "Dig at {{target}}",
                                                                    "path": {
                                                                        "steps": [],
                                                                        "start_state": {
                                                                            "tick": 7,
                                                                            "cooldowns": {
                                                                                "escape": [
                                                                                    23,
                                                                                    23
                                                                                ],
                                                                                "surge": [
                                                                                    23,
                                                                                    8
                                                                                ],
                                                                                "barge": 0,
                                                                                "dive": 21
                                                                            },
                                                                            "acceleration_activation_tick": -1000,
                                                                            "position": {
                                                                                "tile": {
                                                                                    "x": 2409,
                                                                                    "y": 4455,
                                                                                    "level": 0
                                                                                },
                                                                                "direction": 5
                                                                            },
                                                                            "targeted_entity": null
                                                                        },
                                                                        "target": {
                                                                            "topleft": {
                                                                                "x": 2388,
                                                                                "y": 4406
                                                                            },
                                                                            "botright": {
                                                                                "x": 2390,
                                                                                "y": 4404
                                                                            },
                                                                            "level": 0
                                                                        }
                                                                    }
                                                                }
                                                            ]
                                                        }
                                                    },
                                                    {
                                                        "key": {
                                                            "pulse": 2,
                                                            "different_level": false
                                                        },
                                                        "value": {
                                                            "where_to": "E",
                                                            "children": [
                                                                {
                                                                    "key": {
                                                                        "pulse": 2,
                                                                        "different_level": false
                                                                    },
                                                                    "value": {
                                                                        "where_to": null,
                                                                        "children": [],
                                                                        "paths": [
                                                                            {
                                                                                "spot": {
                                                                                    "x": 2380,
                                                                                    "y": 4421,
                                                                                    "level": 0
                                                                                },
                                                                                "directions": "Dig at {{target}}",
                                                                                "path": {
                                                                                    "steps": [],
                                                                                    "start_state": {
                                                                                        "tick": 8,
                                                                                        "cooldowns": {
                                                                                            "escape": [
                                                                                                23,
                                                                                                23
                                                                                            ],
                                                                                            "surge": [
                                                                                                23,
                                                                                                8
                                                                                            ],
                                                                                            "barge": 0,
                                                                                            "dive": 21
                                                                                        },
                                                                                        "acceleration_activation_tick": -1000,
                                                                                        "position": {
                                                                                            "tile": {
                                                                                                "x": 2409,
                                                                                                "y": 4455,
                                                                                                "level": 0
                                                                                            },
                                                                                            "direction": 5
                                                                                        },
                                                                                        "targeted_entity": null
                                                                                    },
                                                                                    "target": {
                                                                                        "topleft": {
                                                                                            "x": 2379,
                                                                                            "y": 4422
                                                                                        },
                                                                                        "botright": {
                                                                                            "x": 2381,
                                                                                            "y": 4420
                                                                                        },
                                                                                        "level": 0
                                                                                    }
                                                                                }
                                                                            }
                                                                        ]
                                                                    }
                                                                },
                                                                {
                                                                    "key": {
                                                                        "pulse": 3,
                                                                        "different_level": false
                                                                    },
                                                                    "value": {
                                                                        "where_to": null,
                                                                        "children": [],
                                                                        "paths": [
                                                                            {
                                                                                "spot": {
                                                                                    "x": 2385,
                                                                                    "y": 4447,
                                                                                    "level": 0
                                                                                },
                                                                                "directions": "Dig at {{target}}",
                                                                                "path": {
                                                                                    "steps": [],
                                                                                    "start_state": {
                                                                                        "tick": 8,
                                                                                        "cooldowns": {
                                                                                            "escape": [
                                                                                                23,
                                                                                                23
                                                                                            ],
                                                                                            "surge": [
                                                                                                23,
                                                                                                8
                                                                                            ],
                                                                                            "barge": 0,
                                                                                            "dive": 21
                                                                                        },
                                                                                        "acceleration_activation_tick": -1000,
                                                                                        "position": {
                                                                                            "tile": {
                                                                                                "x": 2409,
                                                                                                "y": 4455,
                                                                                                "level": 0
                                                                                            },
                                                                                            "direction": 5
                                                                                        },
                                                                                        "targeted_entity": null
                                                                                    },
                                                                                    "target": {
                                                                                        "topleft": {
                                                                                            "x": 2384,
                                                                                            "y": 4448
                                                                                        },
                                                                                        "botright": {
                                                                                            "x": 2386,
                                                                                            "y": 4446
                                                                                        },
                                                                                        "level": 0
                                                                                    }
                                                                                }
                                                                            }
                                                                        ]
                                                                    }
                                                                }
                                                            ],
                                                            "paths": [
                                                                {
                                                                    "directions": "Move to {{target}}",
                                                                    "path": {
                                                                        "start_state": {
                                                                            "tick": 7,
                                                                            "cooldowns": {
                                                                                "escape": [
                                                                                    23,
                                                                                    23
                                                                                ],
                                                                                "surge": [
                                                                                    23,
                                                                                    8
                                                                                ],
                                                                                "barge": 0,
                                                                                "dive": 21
                                                                            },
                                                                            "acceleration_activation_tick": -1000,
                                                                            "position": {
                                                                                "tile": {
                                                                                    "x": 2409,
                                                                                    "y": 4455,
                                                                                    "level": 0
                                                                                },
                                                                                "direction": 5
                                                                            },
                                                                            "targeted_entity": null
                                                                        },
                                                                        "steps": [],
                                                                        "target": {
                                                                            "topleft": {
                                                                                "x": 2398,
                                                                                "y": 4444,
                                                                            },
                                                                            "botright": {
                                                                                "x": 2398,
                                                                                "y": 4444,
                                                                            },
                                                                            "level": 0
                                                                        }
                                                                    }
                                                                }
                                                            ]
                                                        }
                                                    },
                                                    {
                                                        "key": {
                                                            "pulse": 3,
                                                            "different_level": false
                                                        },
                                                        "value": {
                                                            "where_to": null,
                                                            "children": [],
                                                            "paths": [
                                                                {
                                                                    "spot": {
                                                                        "x": 2417,
                                                                        "y": 4470,
                                                                        "level": 0
                                                                    },
                                                                    "directions": "Dig at {{target}}",
                                                                    "path": {
                                                                        "steps": [],
                                                                        "start_state": {
                                                                            "tick": 7,
                                                                            "cooldowns": {
                                                                                "escape": [
                                                                                    23,
                                                                                    23
                                                                                ],
                                                                                "surge": [
                                                                                    23,
                                                                                    8
                                                                                ],
                                                                                "barge": 0,
                                                                                "dive": 21
                                                                            },
                                                                            "acceleration_activation_tick": -1000,
                                                                            "position": {
                                                                                "tile": {
                                                                                    "x": 2409,
                                                                                    "y": 4455,
                                                                                    "level": 0
                                                                                },
                                                                                "direction": 5
                                                                            },
                                                                            "targeted_entity": null
                                                                        },
                                                                        "target": {
                                                                            "topleft": {
                                                                                "x": 2416,
                                                                                "y": 4471
                                                                            },
                                                                            "botright": {
                                                                                "x": 2418,
                                                                                "y": 4469
                                                                            },
                                                                            "level": 0
                                                                        }
                                                                    }
                                                                },
                                                                {
                                                                    "spot": {
                                                                        "x": 2402,
                                                                        "y": 4466,
                                                                        "level": 0
                                                                    },
                                                                    "directions": "Dig at {{target}}",
                                                                    "path": {
                                                                        "steps": [],
                                                                        "start_state": {
                                                                            "tick": 7,
                                                                            "cooldowns": {
                                                                                "escape": [
                                                                                    23,
                                                                                    23
                                                                                ],
                                                                                "surge": [
                                                                                    23,
                                                                                    8
                                                                                ],
                                                                                "barge": 0,
                                                                                "dive": 21
                                                                            },
                                                                            "acceleration_activation_tick": -1000,
                                                                            "position": {
                                                                                "tile": {
                                                                                    "x": 2409,
                                                                                    "y": 4455,
                                                                                    "level": 0
                                                                                },
                                                                                "direction": 5
                                                                            },
                                                                            "targeted_entity": null
                                                                        },
                                                                        "target": {
                                                                            "topleft": {
                                                                                "x": 2401,
                                                                                "y": 4467
                                                                            },
                                                                            "botright": {
                                                                                "x": 2403,
                                                                                "y": 4465
                                                                            },
                                                                            "level": 0
                                                                        }
                                                                    }
                                                                }
                                                            ]
                                                        }
                                                    }
                                                ],
                                                "paths": [
                                                    {
                                                        "directions": "Move to {{target}}",
                                                        "path": {
                                                            "start_state": {
                                                                "tick": 5,
                                                                "cooldowns": {
                                                                    "escape": [
                                                                        0,
                                                                        0
                                                                    ],
                                                                    "surge": [
                                                                        0,
                                                                        0
                                                                    ],
                                                                    "barge": 0,
                                                                    "dive": 21
                                                                },
                                                                "acceleration_activation_tick": -1000,
                                                                "position": {
                                                                    "tile": {
                                                                        "x": 2420,
                                                                        "y": 4444,
                                                                        "level": 0
                                                                    },
                                                                    "direction": 6
                                                                },
                                                                "targeted_entity": null
                                                            },
                                                            "steps": [
                                                                {
                                                                    "type": "run",
                                                                    "waypoints": [
                                                                        {
                                                                            "x": 2420,
                                                                            "y": 4444,
                                                                            "level": 0
                                                                        },
                                                                        {
                                                                            "x": 2419,
                                                                            "y": 4445,
                                                                            "level": 0
                                                                        }
                                                                    ],
                                                                    "description": "Run to 2419 | 4445"
                                                                },
                                                                {
                                                                    "type": "ability",
                                                                    "ability": "surge",
                                                                    "description": "Use {{surge}}",
                                                                    "from": {
                                                                        "x": 2419,
                                                                        "y": 4445,
                                                                        "level": 0
                                                                    },
                                                                    "to": {
                                                                        "x": 2409,
                                                                        "y": 4455,
                                                                        "level": 0
                                                                    }
                                                                }
                                                            ],
                                                            "target": {
                                                                "topleft": {
                                                                    "x": 2409,
                                                                    "y": 4455,
                                                                },
                                                                "botright": {
                                                                    "x": 2409,
                                                                    "y": 4455,
                                                                },
                                                                "level": 0
                                                            }
                                                        }
                                                    }
                                                ]
                                            }
                                        },
                                        {
                                            "key": {
                                                "pulse": 3,
                                                "different_level": false
                                            },
                                            "value": {
                                                "where_to": null,
                                                "children": [],
                                                "paths": [
                                                    {
                                                        "spot": {
                                                            "x": 2410,
                                                            "y": 4460,
                                                            "level": 0
                                                        },
                                                        "directions": "Dig at {{target}}",
                                                        "path": {
                                                            "steps": [],
                                                            "start_state": {
                                                                "tick": 5,
                                                                "cooldowns": {
                                                                    "escape": [
                                                                        0,
                                                                        0
                                                                    ],
                                                                    "surge": [
                                                                        0,
                                                                        0
                                                                    ],
                                                                    "barge": 0,
                                                                    "dive": 21
                                                                },
                                                                "acceleration_activation_tick": -1000,
                                                                "position": {
                                                                    "tile": {
                                                                        "x": 2420,
                                                                        "y": 4444,
                                                                        "level": 0
                                                                    },
                                                                    "direction": 6
                                                                },
                                                                "targeted_entity": null
                                                            },
                                                            "target": {
                                                                "topleft": {
                                                                    "x": 2409,
                                                                    "y": 4461
                                                                },
                                                                "botright": {
                                                                    "x": 2411,
                                                                    "y": 4459
                                                                },
                                                                "level": 0
                                                            }
                                                        }
                                                    },
                                                    {
                                                        "spot": {
                                                            "x": 2439,
                                                            "y": 4460,
                                                            "level": 0
                                                        },
                                                        "directions": "Dig at {{target}}",
                                                        "path": {
                                                            "steps": [],
                                                            "start_state": {
                                                                "tick": 5,
                                                                "cooldowns": {
                                                                    "escape": [
                                                                        0,
                                                                        0
                                                                    ],
                                                                    "surge": [
                                                                        0,
                                                                        0
                                                                    ],
                                                                    "barge": 0,
                                                                    "dive": 21
                                                                },
                                                                "acceleration_activation_tick": -1000,
                                                                "position": {
                                                                    "tile": {
                                                                        "x": 2420,
                                                                        "y": 4444,
                                                                        "level": 0
                                                                    },
                                                                    "direction": 6
                                                                },
                                                                "targeted_entity": null
                                                            },
                                                            "target": {
                                                                "topleft": {
                                                                    "x": 2438,
                                                                    "y": 4461
                                                                },
                                                                "botright": {
                                                                    "x": 2440,
                                                                    "y": 4459
                                                                },
                                                                "level": 0
                                                            }
                                                        }
                                                    },
                                                    {
                                                        "spot": {
                                                            "x": 2441,
                                                            "y": 4428,
                                                            "level": 0
                                                        },
                                                        "directions": "Dig at {{target}}",
                                                        "path": {
                                                            "steps": [],
                                                            "start_state": {
                                                                "tick": 5,
                                                                "cooldowns": {
                                                                    "escape": [
                                                                        0,
                                                                        0
                                                                    ],
                                                                    "surge": [
                                                                        0,
                                                                        0
                                                                    ],
                                                                    "barge": 0,
                                                                    "dive": 21
                                                                },
                                                                "acceleration_activation_tick": -1000,
                                                                "position": {
                                                                    "tile": {
                                                                        "x": 2420,
                                                                        "y": 4444,
                                                                        "level": 0
                                                                    },
                                                                    "direction": 6
                                                                },
                                                                "targeted_entity": null
                                                            },
                                                            "target": {
                                                                "topleft": {
                                                                    "x": 2440,
                                                                    "y": 4429
                                                                },
                                                                "botright": {
                                                                    "x": 2442,
                                                                    "y": 4427
                                                                },
                                                                "level": 0
                                                            }
                                                        }
                                                    }
                                                ]
                                            }
                                        }
                                    ],
                                    "paths": [
                                        {
                                            "directions": "Move to {{target}}",
                                            "path": {
                                                "start_state": {
                                                    "tick": 4,
                                                    "cooldowns": {
                                                        "escape": [
                                                            0,
                                                            0
                                                        ],
                                                        "surge": [
                                                            0,
                                                            0
                                                        ],
                                                        "barge": 0,
                                                        "dive": 0
                                                    },
                                                    "acceleration_activation_tick": -1000,
                                                    "position": {
                                                        "tile": {
                                                            "x": 2410,
                                                            "y": 4436,
                                                            "level": 0
                                                        },
                                                        "direction": 5
                                                    },
                                                    "targeted_entity": null
                                                },
                                                "steps": [
                                                    {
                                                        "type": "ability",
                                                        "ability": "dive",
                                                        "description": "Use {{dive}}",
                                                        "from": {
                                                            "x": 2410,
                                                            "y": 4436,
                                                            "level": 0
                                                        },
                                                        "to": {
                                                            "x": 2420,
                                                            "y": 4444,
                                                            "level": 0
                                                        }
                                                    }
                                                ],
                                                "target": {
                                                    "topleft": {
                                                        "x": 2420,
                                                        "y": 4444,
                                                    },
                                                    "botright": {
                                                        "x": 2420,
                                                        "y": 4444,
                                                    },
                                                    "level": 0
                                                }
                                            }
                                        }
                                    ]
                                }
                            },
                            {
                                "key": {
                                    "pulse": 3,
                                    "different_level": false
                                },
                                "value": {
                                    "where_to": null,
                                    "children": [],
                                    "paths": [
                                        {
                                            "spot": {
                                                "x": 2396,
                                                "y": 4457,
                                                "level": 0
                                            },
                                            "directions": "Dig at {{target}}",
                                            "path": {
                                                "steps": [],
                                                "start_state": {
                                                    "tick": 4,
                                                    "cooldowns": {
                                                        "escape": [
                                                            0,
                                                            0
                                                        ],
                                                        "surge": [
                                                            0,
                                                            0
                                                        ],
                                                        "barge": 0,
                                                        "dive": 0
                                                    },
                                                    "acceleration_activation_tick": -1000,
                                                    "position": {
                                                        "tile": {
                                                            "x": 2410,
                                                            "y": 4436,
                                                            "level": 0
                                                        },
                                                        "direction": 5
                                                    },
                                                    "targeted_entity": null
                                                },
                                                "target": {
                                                    "topleft": {
                                                        "x": 2395,
                                                        "y": 4458
                                                    },
                                                    "botright": {
                                                        "x": 2397,
                                                        "y": 4456
                                                    },
                                                    "level": 0
                                                }
                                            }
                                        }
                                    ]
                                }
                            }
                        ],
                        "paths": [
                            {
                                "directions": "Move to {{target}}",
                                "path": {
                                    "start_state": {
                                        "tick": 2,
                                        "cooldowns": {
                                            "escape": [
                                                0,
                                                0
                                            ],
                                            "surge": [
                                                0,
                                                0
                                            ],
                                            "barge": 0,
                                            "dive": 0
                                        },
                                        "acceleration_activation_tick": -1000,
                                        "position": {
                                            "tile": null,
                                            "direction": null
                                        },
                                        "targeted_entity": null
                                    },
                                    "steps": [
                                        {
                                            "type": "run",
                                            "waypoints": [
                                                {
                                                    "x": 2412,
                                                    "y": 4434,
                                                    "level": 0
                                                },
                                                {
                                                    "x": 2411,
                                                    "y": 4435,
                                                    "level": 0
                                                },
                                                {
                                                    "x": 2410,
                                                    "y": 4436,
                                                    "level": 0
                                                }
                                            ],
                                            "description": "Run to 2410 | 4436"
                                        }
                                    ],
                                    "target": {
                                        "topleft": {
                                            "x": 2410,
                                            "y": 4436,
                                        },
                                        "botright": {
                                            "x": 2410,
                                            "y": 4436,
                                        },
                                        "level": 0
                                    }
                                }
                            }
                        ]
                    }
                },
                {
                    "key": {
                        "pulse": 3,
                        "different_level": false
                    },
                    "value": {
                        "where_to": null,
                        "children": [],
                        "paths": [
                            {
                                "spot": {
                                    "x": 2406,
                                    "y": 4428,
                                    "level": 0
                                },
                                "directions": "Dig at {{target}}",
                                "path": {
                                    "steps": [
                                        {
                                            "type": "ability",
                                            "ability": "dive",
                                            "description": "Use {{dive}}",
                                            "from": {
                                                "x": 2412,
                                                "y": 4434,
                                                "level": 0
                                            },
                                            "to": {
                                                "x": 2406,
                                                "y": 4428,
                                                "level": 0
                                            }
                                        }
                                    ],
                                    "start_state": {
                                        "tick": 2,
                                        "cooldowns": {
                                            "escape": [
                                                0,
                                                0
                                            ],
                                            "surge": [
                                                0,
                                                0
                                            ],
                                            "barge": 0,
                                            "dive": 0
                                        },
                                        "acceleration_activation_tick": -1000,
                                        "position": {
                                            "tile": null,
                                            "direction": null
                                        },
                                        "targeted_entity": null
                                    },
                                    "target": {
                                        "topleft": {
                                            "x": 2405,
                                            "y": 4429
                                        },
                                        "botright": {
                                            "x": 2407,
                                            "y": 4427
                                        },
                                        "level": 0
                                    }
                                }
                            },
                            {
                                "spot": {
                                    "x": 2429,
                                    "y": 4431,
                                    "level": 0
                                },
                                "directions": "Dig at {{target}}",
                                "path": {
                                    "steps": [
                                        {
                                            "type": "ability",
                                            "ability": "surge",
                                            "description": "Use {{surge}}",
                                            "from": {
                                                "x": 2412,
                                                "y": 4434,
                                                "level": 0
                                            },
                                            "to": {
                                                "x": 2422,
                                                "y": 4434,
                                                "level": 0
                                            }
                                        },
                                        {
                                            "type": "ability",
                                            "ability": "dive",
                                            "description": "Use {{dive}}",
                                            "from": {
                                                "x": 2422,
                                                "y": 4434,
                                                "level": 0
                                            },
                                            "to": {
                                                "x": 2429,
                                                "y": 4431,
                                                "level": 0
                                            }
                                        }
                                    ],
                                    "start_state": {
                                        "tick": 2,
                                        "cooldowns": {
                                            "escape": [
                                                0,
                                                0
                                            ],
                                            "surge": [
                                                0,
                                                0
                                            ],
                                            "barge": 0,
                                            "dive": 0
                                        },
                                        "acceleration_activation_tick": -1000,
                                        "position": {
                                            "tile": null,
                                            "direction": null
                                        },
                                        "targeted_entity": null
                                    },
                                    "target": {
                                        "topleft": {
                                            "x": 2428,
                                            "y": 4432
                                        },
                                        "botright": {
                                            "x": 2430,
                                            "y": 4430
                                        },
                                        "level": 0
                                    }
                                }
                            },
                            {
                                "spot": {
                                    "x": 2417,
                                    "y": 4444,
                                    "level": 0
                                },
                                "directions": "Dig at {{target}}",
                                "path": {
                                    "steps": [
                                        {
                                            "type": "ability",
                                            "ability": "dive",
                                            "description": "Use {{dive}}",
                                            "from": {
                                                "x": 2412,
                                                "y": 4434,
                                                "level": 0
                                            },
                                            "to": {
                                                "x": 2417,
                                                "y": 4444,
                                                "level": 0
                                            }
                                        }
                                    ],
                                    "start_state": {
                                        "tick": 2,
                                        "cooldowns": {
                                            "escape": [
                                                0,
                                                0
                                            ],
                                            "surge": [
                                                0,
                                                0
                                            ],
                                            "barge": 0,
                                            "dive": 0
                                        },
                                        "acceleration_activation_tick": -1000,
                                        "position": {
                                            "tile": null,
                                            "direction": null
                                        },
                                        "targeted_entity": null
                                    },
                                    "target": {
                                        "topleft": {
                                            "x": 2416,
                                            "y": 4445
                                        },
                                        "botright": {
                                            "x": 2418,
                                            "y": 4443
                                        },
                                        "level": 0
                                    }
                                }
                            },
                            {
                                "spot": {
                                    "x": 2400,
                                    "y": 4441,
                                    "level": 0
                                },
                                "directions": "Dig at {{target}}",
                                "path": {
                                    "steps": [
                                        {
                                            "type": "run",
                                            "waypoints": [
                                                {
                                                    "x": 2412,
                                                    "y": 4434,
                                                    "level": 0
                                                },
                                                {
                                                    "x": 2412,
                                                    "y": 4435,
                                                    "level": 0
                                                },
                                                {
                                                    "x": 2412,
                                                    "y": 4436,
                                                    "level": 0
                                                },
                                                {
                                                    "x": 2412,
                                                    "y": 4437,
                                                    "level": 0
                                                },
                                                {
                                                    "x": 2412,
                                                    "y": 4438,
                                                    "level": 0
                                                },
                                                {
                                                    "x": 2412,
                                                    "y": 4439,
                                                    "level": 0
                                                }
                                            ],
                                            "description": "Run to 2412 | 4439"
                                        },
                                        {
                                            "type": "ability",
                                            "ability": "dive",
                                            "description": "Use {{dive}}",
                                            "from": {
                                                "x": 2412,
                                                "y": 4439,
                                                "level": 0
                                            },
                                            "to": {
                                                "x": 2402,
                                                "y": 4444,
                                                "level": 0
                                            }
                                        },
                                        {
                                            "type": "run",
                                            "waypoints": [
                                                {
                                                    "x": 2402,
                                                    "y": 4444,
                                                    "level": 0
                                                },
                                                {
                                                    "x": 2401,
                                                    "y": 4444,
                                                    "level": 0
                                                },
                                                {
                                                    "x": 2401,
                                                    "y": 4443,
                                                    "level": 0
                                                },
                                                {
                                                    "x": 2401,
                                                    "y": 4442,
                                                    "level": 0
                                                },
                                                {
                                                    "x": 2400,
                                                    "y": 4441,
                                                    "level": 0
                                                }
                                            ],
                                            "description": "Run to 2400 | 4441"
                                        }
                                    ],
                                    "start_state": {
                                        "tick": 2,
                                        "cooldowns": {
                                            "escape": [
                                                0,
                                                0
                                            ],
                                            "surge": [
                                                0,
                                                0
                                            ],
                                            "barge": 0,
                                            "dive": 0
                                        },
                                        "acceleration_activation_tick": -1000,
                                        "position": {
                                            "tile": null,
                                            "direction": null
                                        },
                                        "targeted_entity": null
                                    },
                                    "target": {
                                        "topleft": {
                                            "x": 2399,
                                            "y": 4442
                                        },
                                        "botright": {
                                            "x": 2401,
                                            "y": 4440
                                        },
                                        "level": 0
                                    }
                                }
                            }
                        ]
                    }
                }
            ],
            "paths": [
                {
                    "directions": "{{teleport fairyring AIP}} to {{target}}.",
                    "path": {
                        "start_state": {
                            "tick": 1,
                            "cooldowns": {
                                "escape": [
                                    0,
                                    0
                                ],
                                "surge": [
                                    0,
                                    0
                                ],
                                "barge": 0,
                                "dive": 0
                            },
                            "acceleration_activation_tick": -1000,
                            "position": {
                                "tile": null,
                                "direction": null
                            },
                            "targeted_entity": null
                        },
                        "steps": [],
                        "target": {
                            "topleft": {
                                "x": 2412,
                                "y": 4434,
                            },
                            "botright": {
                                "x": 2412,
                                "y": 4434,
                            },
                            "level": 0
                        }
                    }
                }
            ]
        },
        "spot_ordering": [
            {
                "x": 2406,
                "y": 4428,
                "level": 0
            },
            {
                "x": 2429,
                "y": 4431,
                "level": 0
            },
            {
                "x": 2417,
                "y": 4444,
                "level": 0
            },
            {
                "x": 2400,
                "y": 4441,
                "level": 0
            },
            {
                "x": 2410,
                "y": 4460,
                "level": 0
            },
            {
                "x": 2439,
                "y": 4460,
                "level": 0
            },
            {
                "x": 2441,
                "y": 4428,
                "level": 0
            },
            {
                "x": 2417,
                "y": 4470,
                "level": 0
            },
            {
                "x": 2402,
                "y": 4466,
                "level": 0
            },
            {
                "x": 2396,
                "y": 4457,
                "level": 0
            },
            {
                "x": 2385,
                "y": 4447,
                "level": 0
            },
            {
                "x": 2380,
                "y": 4421,
                "level": 0
            },
            {
                "x": 2372,
                "y": 4467,
                "level": 0
            },
            {
                "x": 2404,
                "y": 4406,
                "level": 0
            },
            {
                "x": 2389,
                "y": 4405,
                "level": 0
            },
            {
                "x": 2377,
                "y": 4410,
                "level": 0
            },
            {
                "x": 2453,
                "y": 4471,
                "level": 0
            },
            {
                "x": 2457,
                "y": 4443,
                "level": 0
            },
            {
                "x": 2468,
                "y": 4439,
                "level": 0
            },
            {
                "x": 2414,
                "y": 4378,
                "level": 0
            },
            {
                "x": 2420,
                "y": 4381,
                "level": 0
            },
            {
                "x": 2423,
                "y": 4372,
                "level": 0
            }
        ],
        "type": "scantree"
    }
] /*[

    {
        "type": "scantree",
        "clue": 364,
        "spot_ordering": [
            {
                "x": 2958,
                "y": 3379,
                "level": 0
            },
            {
                "x": 2948,
                "y": 3390,
                "level": 0
            },
            {
                "x": 2942,
                "y": 3388,
                "level": 0
            },
            {
                "x": 2939,
                "y": 3355,
                "level": 0
            },
            {
                "x": 2945,
                "y": 3339,
                "level": 0
            },
            {
                "x": 2972,
                "y": 3342,
                "level": 0
            },
            {
                "x": 3015,
                "y": 3339,
                "level": 0
            },
            {
                "x": 3011,
                "y": 3382,
                "level": 0
            },
            {
                "x": 3005,
                "y": 3326,
                "level": 0
            },
            {
                "x": 2938,
                "y": 3322,
                "level": 0
            },
            {
                "x": 2947,
                "y": 3316,
                "level": 0
            },
            {
                "x": 2976,
                "y": 3316,
                "level": 0
            },
            {
                "x": 3039,
                "y": 3331,
                "level": 0
            },
            {
                "x": 3050,
                "y": 3348,
                "level": 0
            },
            {
                "x": 3027,
                "y": 3365,
                "level": 0
            },
            {
                "x": 3031,
                "y": 3379,
                "level": 0
            },
            {
                "x": 3025,
                "y": 3379,
                "level": 0
            },
            {
                "x": 3059,
                "y": 3384,
                "level": 0
            }
        ],
        "assumes_meerkats": true,
        "areas": [
            {
                "name": "A",
                "level": 0,
                "area": {
                    "topleft": {
                        "x": 2963,
                        "y": 3380
                    },
                    "botright": {
                        "x": 2967,
                        "y": 3376
                    }
                }
            },
            {
                "name": "B",
                "level": 0,
                "area": {
                    "topleft": {
                        "x": 2964,
                        "y": 3366
                    },
                    "botright": {
                        "x": 2965,
                        "y": 3365
                    }
                }
            },
            {
                "name": "C",
                "level": 0,
                "area": {
                    "topleft": {
                        "x": 2958,
                        "y": 3365
                    },
                    "botright": {
                        "x": 2960,
                        "y": 3363
                    }
                }
            },
            {
                "name": "D",
                "level": 0,
                "area": {
                    "topleft": {
                        "x": 2955,
                        "y": 3365
                    },
                    "botright": {
                        "x": 2956,
                        "y": 3363
                    }
                }
            },
            {
                "name": "E",
                "level": 0,
                "area": {
                    "topleft": {
                        "x": 2950,
                        "y": 3365
                    },
                    "botright": {
                        "x": 2950,
                        "y": 3363
                    }
                }
            },
            {
                "name": "F",
                "level": 0,
                "area": {
                    "topleft": {
                        "x": 3016,
                        "y": 3338
                    },
                    "botright": {
                        "x": 3016,
                        "y": 3338
                    }
                }
            },
            {
                "name": "G",
                "level": 0,
                "area": {
                    "topleft": {
                        "x": 3024,
                        "y": 3337
                    },
                    "botright": {
                        "x": 3024,
                        "y": 3337
                    }
                }
            },
            {
                "name": "H",
                "level": 0,
                "area": {
                    "topleft": {
                        "x": 3042,
                        "y": 3355
                    },
                    "botright": {
                        "x": 3042,
                        "y": 3355
                    }
                }
            }
        ],
        "methods": [
            {
                "from": null,
                "to": "A",
                "short_instruction": "{{teleport normalspellbook falador}} to {{target}}"
            },
            {
                "from": "A",
                "to": "B",
                "short_instruction": "{{surge}} to {{target}}."
            },
            {
                "from": "B",
                "to": "C",
                "short_instruction": "Go to {{target}}."
            },
            {
                "from": "B",
                "to": "F",
                "short_instruction": "{{teleport skillsnecklace mining}} to {{target}}"
            },
            {
                "from": "C",
                "to": "D",
                "short_instruction": "Go to {{target}}."
            },
            {
                "from": "D",
                "to": "E",
                "short_instruction": "Go to {{target}}."
            },
            {
                "from": "F",
                "to": "G",
                "short_instruction": "Go to {{target}} and face north-east"
            },
            {
                "from": "G",
                "to": "H",
                "short_instruction": "{{Surge}} + {{Surge}} to {{target}}"
            },
            {
                "from": "A",
                "to": [
                    {
                        "x": 2958,
                        "y": 3379,
                        "level": 0
                    }
                ],
                "short_instruction": "{{Dive}} to {{target}}"
            },
            {
                "from": "A",
                "to": [
                    {
                        "x": 2948,
                        "y": 3390,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "A",
                "to": [
                    {
                        "x": 2942,
                        "y": 3388,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "A",
                "to": [
                    {
                        "x": 2939,
                        "y": 3355,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "B",
                "to": [
                    {
                        "x": 2939,
                        "y": 3355,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "B",
                "to": [
                    {
                        "x": 2945,
                        "y": 3339,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "B",
                "to": [
                    {
                        "x": 2972,
                        "y": 3342,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "B",
                "to": [
                    {
                        "x": 2938,
                        "y": 3322,
                        "level": 0
                    },
                    {
                        "x": 2976,
                        "y": 3316,
                        "level": 0
                    },
                    {
                        "x": 2947,
                        "y": 3316,
                        "level": 0
                    }
                ],
                "short_instruction": "Check {{target}}"
            },
            {
                "from": "C",
                "to": [
                    {
                        "x": 3015,
                        "y": 3339,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "D",
                "to": [
                    {
                        "x": 3011,
                        "y": 3382,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "E",
                "to": [
                    {
                        "x": 3005,
                        "y": 3326,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "E",
                "to": [
                    {
                        "x": 2938,
                        "y": 3322,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "F",
                "to": [
                    {
                        "x": 3039,
                        "y": 3331,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "F",
                "to": [
                    {
                        "x": 3027,
                        "y": 3365,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "G",
                "to": [
                    {
                        "x": 3050,
                        "y": 3348,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "H",
                "to": [
                    {
                        "x": 3031,
                        "y": 3379,
                        "level": 0
                    }
                ],
                "short_instruction": "{{Dive}} NW/Run to {{target}}"
            },
            {
                "from": "H",
                "to": [
                    {
                        "x": 3025,
                        "y": 3379,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "H",
                "to": [
                    {
                        "x": 3059,
                        "y": 3384,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            }
        ],
        "root": {
            "where_to": "A",
            "why": "",
            "children": [
                {
                    "key": {pulse: 2, different_level: false},
                    "value": {
                        "where_to": "B",
                        "why": "",
                        "children": [
                            {
                                "key": {pulse: 2, different_level: false},
                                "value": {
                                    "where_to": "C",
                                    "why": "",
                                    "children": [
                                        {
                                            "key": {pulse: 2, different_level: false},
                                            "value": {
                                                "where_to": "D",
                                                "why": "",
                                                "children": [
                                                    {
                                                        "key": {pulse: 2, different_level: false},
                                                        "value": {
                                                            "where_to": "E",
                                                            "why": "",
                                                            "children": []
                                                        }
                                                    }
                                                ]
                                            }
                                        }
                                    ]
                                }
                            }
                        ]
                    }
                },
                {
                    "key": {pulse: 1, different_level: false},
                    "value": {
                        "where_to": "B",
                        "why": "",
                        "children": [
                            {
                                "key": {pulse: 1, different_level: false},
                                "value": {
                                    "where_to": "F",
                                    "children": [
                                        {
                                            "key": {pulse: 2, different_level: false},
                                            "value": {
                                                "where_to": "G",
                                                "children": [
                                                    {
                                                        "key": {pulse: 2, different_level: false},
                                                        "value": {
                                                            "where_to": "H",
                                                            "children": []
                                                        }
                                                    }
                                                ]
                                            }
                                        }
                                    ]
                                }
                            }
                        ]
                    }
                }
            ]
        }
    },
    {
        "areas": [
            {
                "name": "A",
                "area": {
                    "topleft": {
                        "x": 2939,
                        "y": 10198
                    },
                    "botright": {
                        "x": 2939,
                        "y": 10197
                    }
                },
                "level": 0
            },
            {
                "name": "B",
                "level": 0,
                "area": {
                    "topleft": {
                        "x": 2933,
                        "y": 10201
                    },
                    "botright": {
                        "x": 2933,
                        "y": 10201
                    }
                }
            },
            {
                "name": "C",
                "level": 0,
                "area": {
                    "topleft": {
                        "x": 2923,
                        "y": 10191
                    },
                    "botright": {
                        "x": 2923,
                        "y": 10191
                    }
                }
            },
            {
                "name": "D",
                "level": 0,
                "area": {
                    "topleft": {
                        "x": 2904,
                        "y": 10173
                    },
                    "botright": {
                        "x": 2905,
                        "y": 10171
                    }
                }
            },
            {
                "name": "E",
                "level": 0,
                "area": {
                    "topleft": {
                        "x": 2857,
                        "y": 10200
                    },
                    "botright": {
                        "x": 2857,
                        "y": 10199
                    }
                }
            },
            {
                "name": "F",
                "level": 0,
                "area": {
                    "topleft": {
                        "x": 2853,
                        "y": 10200
                    },
                    "botright": {
                        "x": 2853,
                        "y": 10198
                    }
                }
            }
        ],
        "assumes_meerkats": true,
        "clue": 353,
        "methods": [
            {
                "from": null,
                "to": "A",
                "short_instruction": "{{teleport gote lavaflowmine}} to {{target}}"
            },
            {
                "from": "A",
                "to": "B",
                "short_instruction": "Run to {{target}}, face south-west"
            },
            {
                "from": "A",
                "to": "C",
                "short_instruction": "{{Surge}} to {{target}} via {{scanarea B}}"
            },
            {
                "from": "B",
                "to": "C",
                "short_instruction": "{{Surge}} to {{target}}"
            },
            {
                "from": "C",
                "to": "D",
                "short_instruction": "{{Dive}} + {{Surge}} to {{target}}"
            },
            {
                "from": "C",
                "to": "E",
                "short_instruction": "{{teleport luckofthedwarves keldagrim}} to {{target}}"
            },
            {
                "from": "E",
                "to": "F",
                "short_instruction": "Go to {{target}}"
            },
            {
                "from": "A",
                "to": [
                    {
                        "x": 2937,
                        "y": 10191,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "A",
                "to": [
                    {
                        "x": 2936,
                        "y": 10206,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "A",
                "to": [
                    {
                        "x": 2924,
                        "y": 10191,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "B",
                "to": [
                    {
                        "x": 2906,
                        "y": 10202,
                        "level": 0
                    },
                    {
                        "x": 2904,
                        "y": 10193,
                        "level": 0
                    }
                ],
                "short_instruction": "Check {{target}}"
            },
            {
                "from": "C",
                "to": [
                    {
                        "x": 2922,
                        "y": 10179,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "C",
                "to": [
                    {
                        "x": 2938,
                        "y": 10179,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "D",
                "to": [
                    {
                        "x": 2905,
                        "y": 10162,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "D",
                "to": [
                    {
                        "x": 2924,
                        "y": 10162,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "D",
                "to": [
                    {
                        "x": 2938,
                        "y": 10162,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "E",
                "to": [
                    {
                        "x": 2856,
                        "y": 10192,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "E",
                "to": [
                    {
                        "x": 2860,
                        "y": 10215,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "E",
                "to": [
                    {
                        "x": 2873,
                        "y": 10194,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "E",
                "to": [
                    {
                        "x": 2841,
                        "y": 10189,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "F",
                "to": [
                    {
                        "x": 2837,
                        "y": 10209,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "F",
                "to": [
                    {
                        "x": 2872,
                        "y": 10181,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "F",
                "to": [
                    {
                        "x": 2822,
                        "y": 10193,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "F",
                "to": [
                    {
                        "x": 2846,
                        "y": 10233,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            }
        ],
        "root": {
            "where_to": "A",
            "children": [
                {
                    "key": {pulse: 1, different_level: false},
                    "value": {
                        "where_to": "B",
                        "children": [
                            {
                                "key": {pulse: 1, different_level: false},
                                "value": {
                                    "where_to": "C",
                                    "children": [
                                        {
                                            "key": {pulse: 2, different_level: false},
                                            "value": {
                                                "where_to": "D",
                                                "children": []
                                            }
                                        },
                                        {
                                            "key": {pulse: 1, different_level: false},
                                            "value": {
                                                "where_to": "E",
                                                "children": [
                                                    {
                                                        "key": {pulse: 1, different_level: false},
                                                        "value": {
                                                            "where_to": "F",
                                                            "children": []
                                                        }
                                                    },
                                                    {
                                                        "key": {pulse: 2, different_level: false},
                                                        "value": {
                                                            "where_to": "F",
                                                            "children": []
                                                        }
                                                    }
                                                ]
                                            }
                                        }
                                    ]
                                }
                            }
                        ]
                    }
                },
                {
                    "key": {pulse: 2, different_level: false},
                    "value": {
                        "where_to": "C",
                        "children": []
                    }
                }
            ]
        },
        "spot_ordering": [
            {
                "x": 2937,
                "y": 10191,
                "level": 0
            },
            {
                "x": 2936,
                "y": 10206,
                "level": 0
            },
            {
                "x": 2924,
                "y": 10191,
                "level": 0
            },
            {
                "x": 2906,
                "y": 10202,
                "level": 0
            },
            {
                "x": 2904,
                "y": 10193,
                "level": 0
            },
            {
                "x": 2922,
                "y": 10179,
                "level": 0
            },
            {
                "x": 2938,
                "y": 10179,
                "level": 0
            },
            {
                "x": 2905,
                "y": 10162,
                "level": 0
            },
            {
                "x": 2924,
                "y": 10162,
                "level": 0
            },
            {
                "x": 2938,
                "y": 10162,
                "level": 0
            },
            {
                "x": 2856,
                "y": 10192,
                "level": 0
            },
            {
                "x": 2860,
                "y": 10215,
                "level": 0
            },
            {
                "x": 2837,
                "y": 10209,
                "level": 0
            },
            {
                "x": 2873,
                "y": 10194,
                "level": 0
            },
            {
                "x": 2841,
                "y": 10189,
                "level": 0
            },
            {
                "x": 2872,
                "y": 10181,
                "level": 0
            },
            {
                "x": 2822,
                "y": 10193,
                "level": 0
            },
            {
                "x": 2846,
                "y": 10233,
                "level": 0
            }
        ],
        "type": "scantree"
    },

    ,
    {
        "type": "scantree",
        "clue": 361,
        "spot_ordering": [
            {
                "x": 2406,
                "y": 4428
            },
            {
                "x": 2429,
                "y": 4431
            },
            {
                "x": 2417,
                "y": 4444
            },
            {
                "x": 2400,
                "y": 4441
            },
            {
                "x": 2410,
                "y": 4460
            },
            {
                "x": 2439,
                "y": 4460
            },
            {
                "x": 2441,
                "y": 4428
            },
            {
                "x": 2417,
                "y": 4470
            },
            {
                "x": 2402,
                "y": 4466
            },
            {
                "x": 2396,
                "y": 4457
            },
            {
                "x": 2385,
                "y": 4447
            },
            {
                "x": 2380,
                "y": 4421
            },
            {
                "x": 2372,
                "y": 4467
            },
            {
                "x": 2404,
                "y": 4406
            },
            {
                "x": 2389,
                "y": 4405
            },
            {
                "x": 2377,
                "y": 4410
            },
            {
                "x": 2453,
                "y": 4471
            },
            {
                "x": 2457,
                "y": 4443
            },
            {
                "x": 2468,
                "y": 4439
            },
            {
                "x": 2414,
                "y": 4378
            },
            {
                "x": 2420,
                "y": 4381
            },
            {
                "x": 2423,
                "y": 4372
            }
        ],
        "assumes_meerkats": true,
        "areas": [
            {
                "name": "A",
                "level": 0,
                "area": {
                    "topleft": {
                        "x": 2412,
                        "y": 4434
                    },
                    "botright": {
                        "x": 2412,
                        "y": 4434
                    }
                }
            },
            {
                "name": "B",
                "level": 0,
                "area": {
                    "topleft": {
                        "x": 2410,
                        "y": 4436
                    },
                    "botright": {
                        "x": 2410,
                        "y": 4436
                    }
                }
            },
            {
                "name": "C",
                "level": 0,
                "area": {
                    "topleft": {
                        "x": 2420,
                        "y": 4444
                    },
                    "botright": {
                        "x": 2420,
                        "y": 4444
                    }
                }
            },
            {
                "name": "D",
                "level": 0,
                "area": {
                    "topleft": {
                        "x": 2409,
                        "y": 4455
                    },
                    "botright": {
                        "x": 2409,
                        "y": 4455
                    }
                }
            },
            {
                "name": "E",
                "level": 0,
                "area": {
                    "topleft": {
                        "x": 2398,
                        "y": 4444
                    },
                    "botright": {
                        "x": 2398,
                        "y": 4444
                    }
                }
            },
            {
                "name": "F",
                "level": 0,
                "area": {
                    "topleft": {
                        "x": 2445,
                        "y": 4431
                    },
                    "botright": {
                        "x": 2447,
                        "y": 4429
                    }
                }
            },
            {
                "name": "G",
                "level": 0,
                "area": {
                    "topleft": {
                        "x": 2405,
                        "y": 4381
                    },
                    "botright": {
                        "x": 2405,
                        "y": 4381
                    }
                }
            }
        ],
        "methods": [
            {
                "from": null,
                "to": "A",
                "short_instruction": "{{teleport fairyring AIP}} to {{target}}."
            },
            {
                "from": "A",
                "to": "B",
                "short_instruction": "Go to {{target}}."
            },
            {
                "from": "A",
                "to": "F",
                "short_instruction": "{{teleport slayercape chealdar}} to {{target}}."
            },
            {
                "from": "B",
                "to": "C",
                "short_instruction": "{{dive}} to {{target}}."
            },
            {
                "from": "C",
                "to": "D",
                "short_instruction": "Step NW + {{surge}} to {{target}}."
            },
            {
                "from": "D",
                "to": "E",
                "short_instruction": "Step SW + {{surge}} to {{target}}."
            },
            {
                "from": "F",
                "to": "G",
                "short_instruction": "{{teleport wickedhood cosmic}} to {{target}}"
            },
            {
                "from": "A",
                "to": [
                    {
                        "x": 2406,
                        "y": 4428,
                        "level": 0
                    }
                ],
                "short_instruction": "{{Dive}} to {{target}}"
            },
            {
                "from": "A",
                "to": [
                    {
                        "x": 2429,
                        "y": 4431,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "A",
                "to": [
                    {
                        "x": 2417,
                        "y": 4444,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "A",
                "to": [
                    {
                        "x": 2400,
                        "y": 4441,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "B",
                "to": [
                    {
                        "x": 2396,
                        "y": 4457,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "B",
                "to": [
                    {
                        "x": 2453,
                        "y": 4471,
                        "level": 0
                    }
                ],
                "short_instruction": "{{teleport dragontrinkets black}} to {{target}}"
            },
            {
                "from": "C",
                "to": [
                    {
                        "x": 2410,
                        "y": 4460,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "C",
                "to": [
                    {
                        "x": 2439,
                        "y": 4460,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "C",
                "to": [
                    {
                        "x": 2441,
                        "y": 4428,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "D",
                "to": [
                    {
                        "x": 2417,
                        "y": 4470,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "D",
                "to": [
                    {
                        "x": 2402,
                        "y": 4466,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "D",
                "to": [
                    {
                        "x": 2372,
                        "y": 4467,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "D",
                "to": [
                    {
                        "x": 2389,
                        "y": 4405,
                        "level": 0
                    },
                    {
                        "x": 2404,
                        "y": 4406,
                        "level": 0
                    }
                ],
                "short_instruction": "Check {{target}}"
            },
            {
                "from": "D",
                "to": [
                    {
                        "x": 2377,
                        "y": 4410,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "E",
                "to": [
                    {
                        "x": 2385,
                        "y": 4447,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "E",
                "to": [
                    {
                        "x": 2380,
                        "y": 4421,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "F",
                "to": [
                    {
                        "x": 2457,
                        "y": 4443,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "F",
                "to": [
                    {
                        "x": 2468,
                        "y": 4439,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "G",
                "to": [
                    {
                        "x": 2414,
                        "y": 4378,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "G",
                "to": [
                    {
                        "x": 2420,
                        "y": 4381,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "G",
                "to": [
                    {
                        "x": 2423,
                        "y": 4372,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            }
        ],
        "root": {
            "where_to": "A",
            "why": "",
            "children": [
                {
                    "key": {pulse: 1, different_level: false},
                    "value": {
                        "where_to": "F",
                        "why": "",
                        "children": [
                            {
                                "key": {pulse: 1, different_level: false},
                                "value": {
                                    "where_to": "G",
                                    "why": "",
                                    "children": []
                                }
                            }
                        ]
                    }
                },
                {
                    "key": {pulse: 2, different_level: false},
                    "value": {
                        "where_to": "B",
                        "why": "",
                        "children": [
                            {
                                "key": {pulse: 2, different_level: false},
                                "value": {
                                    "where_to": "C",
                                    "why": "",
                                    "children": [
                                        {
                                            "key": {pulse: 1, different_level: false},
                                            "value": {
                                                "where_to": "D",
                                                "why": "",
                                                "children": []
                                            }
                                        },
                                        {
                                            "key": {pulse: 2, different_level: false},
                                            "value": {
                                                "where_to": "D",
                                                "why": "",
                                                "children": [
                                                    {
                                                        "key": {pulse: 2, different_level: false},
                                                        "value": {
                                                            "where_to": "E",
                                                            "why": "",
                                                            "children": []
                                                        }
                                                    }
                                                ]
                                            }
                                        }
                                    ]
                                }
                            }
                        ]
                    }
                }
            ]
        }
    },{
        "type": "scantree",
        "clue": 351,
        "spot_ordering": [
            {
                "x": 3231,
                "y": 3439,
                "level": 0
            },
            {
                "x": 3197,
                "y": 3423,
                "level": 0
            },
            {
                "x": 3196,
                "y": 3415,
                "level": 0
            },
            {
                "x": 3204,
                "y": 3409,
                "level": 0
            },
            {
                "x": 3220,
                "y": 3407,
                "level": 0
            },
            {
                "x": 3228,
                "y": 3409,
                "level": 0
            },
            {
                "x": 3213,
                "y": 3462,
                "level": 0
            },
            {
                "x": 3248,
                "y": 3454,
                "level": 0
            },
            {
                "x": 3253,
                "y": 3393,
                "level": 0
            },
            {
                "x": 3175,
                "y": 3415,
                "level": 0
            },
            {
                "x": 3175,
                "y": 3404,
                "level": 0
            },
            {
                "x": 3185,
                "y": 3472,
                "level": 0
            },
            {
                "x": 3197,
                "y": 3383,
                "level": 0
            },
            {
                "x": 3211,
                "y": 3385,
                "level": 0
            },
            {
                "x": 3228,
                "y": 3383,
                "level": 0
            },
            {
                "x": 3240,
                "y": 3383,
                "level": 0
            },
            {
                "x": 3273,
                "y": 3398,
                "level": 0
            },
            {
                "x": 3284,
                "y": 3378,
                "level": 0
            },
            {
                "x": 3141,
                "y": 3488,
                "level": 0
            },
            {
                "x": 3188,
                "y": 3488,
                "level": 0
            },
            {
                "x": 3180,
                "y": 3510,
                "level": 0
            },
            {
                "x": 3230,
                "y": 3494,
                "level": 0
            },
            {
                "x": 3213,
                "y": 3484,
                "level": 0
            },
            {
                "x": 3241,
                "y": 3480,
                "level": 0
            }
        ],
        "assumes_meerkats": true,
        "areas": [
            {
                "name": "A",
                "level": 0,
                "area": {
                    "topleft": {
                        "x": 3213,
                        "y": 3434
                    },
                    "botright": {
                        "x": 3214,
                        "y": 3432
                    }
                }
            },
            {
                "name": "B",
                "level": 0,
                "area": {
                    "topleft": {
                        "x": 3223,
                        "y": 3424
                    },
                    "botright": {
                        "x": 3224,
                        "y": 3422
                    }
                }
            },
            {
                "name": "C",
                "level": 0,
                "area": {
                    "topleft": {
                        "x": 3233,
                        "y": 3414
                    },
                    "botright": {
                        "x": 3234,
                        "y": 3412
                    }
                }
            },
            {
                "name": "D",
                "level": 0,
                "area": {
                    "topleft": {
                        "x": 3242,
                        "y": 3418
                    },
                    "botright": {
                        "x": 3244,
                        "y": 3417
                    }
                }
            },
            {
                "name": "E",
                "level": 0,
                "area": {
                    "topleft": {
                        "x": 3254,
                        "y": 3449
                    },
                    "botright": {
                        "x": 3254,
                        "y": 3449
                    }
                }
            },
            {
                "name": "F",
                "level": 0,
                "area": {
                    "topleft": {
                        "x": 3244,
                        "y": 3459
                    },
                    "botright": {
                        "x": 3244,
                        "y": 3459
                    }
                }
            },
            {
                "name": "G",
                "level": 0,
                "area": {
                    "topleft": {
                        "x": 3179,
                        "y": 3420
                    },
                    "botright": {
                        "x": 3183,
                        "y": 3416
                    }
                }
            },
            {
                "name": "H",
                "level": 0,
                "area": {
                    "topleft": {
                        "x": 3162,
                        "y": 3467
                    },
                    "botright": {
                        "x": 3162,
                        "y": 3467
                    }
                }
            }
        ],
        "methods": [
            {
                "from": null,
                "to": "A",
                "short_instruction": "{{teleport normalspellbook varrock}} to {{target}}."
            },
            {
                "from": "A",
                "to": "B",
                "short_instruction": "{{Surge}} to {{target}}."
            },
            {
                "from": "B",
                "to": "C",
                "short_instruction": "{{Surge}} to {{target}}."
            },
            {
                "from": "B",
                "to": "D",
                "short_instruction": "{{Dive}}-{{Surge}} to {{target}}."
            },
            {
                "from": "D",
                "to": "E",
                "short_instruction": "{{teleport davesspellbook varrock}} to {{target}}."
            },
            {
                "from": "E",
                "to": "F",
                "short_instruction": "{{dive}} to {{target}}."
            },
            {
                "from": "B",
                "to": "G",
                "short_instruction": "{{teleport archteleport soran}} Teleport to {{target}}."
            },
            {
                "from": "E",
                "to": "H",
                "short_instruction": "{{teleport ringofwealth grandexchange}} to {{target}}."
            },
            {
                "from": "A",
                "to": [
                    {
                        "x": 3231,
                        "y": 3439,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "A",
                "to": [
                    {
                        "x": 3197,
                        "y": 3423,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "A",
                "to": [
                    {
                        "x": 3196,
                        "y": 3415,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "B",
                "to": [
                    {
                        "x": 3204,
                        "y": 3409,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "B",
                "to": [
                    {
                        "x": 3220,
                        "y": 3407,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "B",
                "to": [
                    {
                        "x": 3228,
                        "y": 3409,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "C",
                "to": [
                    {
                        "x": 3213,
                        "y": 3462,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "C",
                "to": [
                    {
                        "x": 3248,
                        "y": 3454,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "C",
                "to": [
                    {
                        "x": 3253,
                        "y": 3393,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "G",
                "to": [
                    {
                        "x": 3175,
                        "y": 3415,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "G",
                "to": [
                    {
                        "x": 3175,
                        "y": 3404,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "G",
                "to": [
                    {
                        "x": 3185,
                        "y": 3472,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "B",
                "to": [
                    {
                        "x": 3197,
                        "y": 3383,
                        "level": 0
                    },
                    {
                        "x": 3211,
                        "y": 3385,
                        "level": 0
                    },
                    {
                        "x": 3228,
                        "y": 3383,
                        "level": 0
                    },
                    {
                        "x": 3240,
                        "y": 3383,
                        "level": 0
                    }
                ],
                "short_instruction": "Check {{target}}"
            },
            {
                "from": "D",
                "to": [
                    {
                        "x": 3273,
                        "y": 3398,
                        "level": 0
                    },
                    {
                        "x": 3284,
                        "y": 3378,
                        "level": 0
                    }
                ],
                "short_instruction": "Check {{target}}"
            },
            {
                "from": "H",
                "to": [
                    {
                        "x": 3141,
                        "y": 3488,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "H",
                "to": [
                    {
                        "x": 3188,
                        "y": 3488,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "H",
                "to": [
                    {
                        "x": 3180,
                        "y": 3510,
                        "level": 0
                    },
                    {
                        "x": 3230,
                        "y": 3494,
                        "level": 0
                    }
                ],
                "short_instruction": "Check {{target}}"
            },
            {
                "from": "F",
                "to": [
                    {
                        "x": 3213,
                        "y": 3484,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "F",
                "to": [
                    {
                        "x": 3241,
                        "y": 3480,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            }
        ],
        "root": {
            "where_to": "A",
            "why": "",
            "children": [
                {
                    "key": {
                        "pulse": 2,
                        "different_level": false
                    },
                    "value": {
                        "where_to": "B",
                        "why": "",
                        "children": [
                            {
                                "key": {
                                    "pulse": 2,
                                    "different_level": false
                                },
                                "value": {
                                    "where_to": "C",
                                    "why": "",
                                    "children": []
                                }
                            },
                            {
                                "key": {
                                    "pulse": 1,
                                    "different_level": false
                                },
                                "value": {
                                    "where_to": "G",
                                    "why": "",
                                    "children": []
                                }
                            }
                        ]
                    }
                },
                {
                    "key": {
                        "pulse": 1,
                        "different_level": false
                    },
                    "value": {
                        "where_to": "B",
                        "why": "",
                        "children": [
                            {
                                "key": {
                                    "pulse": 1,
                                    "different_level": false
                                },
                                "value": {
                                    "where_to": "D",
                                    "why": "",
                                    "children": [
                                        {
                                            "key": {
                                                "pulse": 1,
                                                "different_level": false
                                            },
                                            "value": {
                                                "where_to": "E",
                                                "why": "",
                                                "children": [
                                                    {
                                                        "key": {
                                                            "pulse": 2,
                                                            "different_level": false
                                                        },
                                                        "value": {
                                                            "where_to": "F",
                                                            "why": "",
                                                            "children": []
                                                        }
                                                    },
                                                    {
                                                        "key": {
                                                            "pulse": 1,
                                                            "different_level": false
                                                        },
                                                        "value": {
                                                            "where_to": "H",
                                                            "why": "",
                                                            "children": []
                                                        }
                                                    }
                                                ]
                                            }
                                        }
                                    ]
                                }
                            }
                        ]
                    }
                }
            ]
        }
    },
    {
        "areas": [
            {
                "name": "A",
                "level": 0,
                "area": {
                    "topleft": {
                        "x": 3248,
                        "y": 9519
                    },
                    "botright": {
                        "x": 3252,
                        "y": 9515
                    }
                }
            },
            {
                "name": "B",
                "level": 0,
                "area": {
                    "topleft": {
                        "x": 3229,
                        "y": 9527
                    },
                    "botright": {
                        "x": 3242,
                        "y": 9525
                    }
                }
            },
            {
                "name": "C",
                "level": 0,
                "area": {
                    "topleft": {
                        "x": 3218,
                        "y": 9531
                    },
                    "botright": {
                        "x": 3221,
                        "y": 9530
                    }
                }
            },
            {
                "name": "D",
                "level": 0,
                "area": {
                    "topleft": {
                        "x": 3226,
                        "y": 9542
                    },
                    "botright": {
                        "x": 3226,
                        "y": 9542
                    }
                }
            },
            {
                "name": "E",
                "level": 0,
                "area": {
                    "topleft": {
                        "x": 3220,
                        "y": 9552
                    },
                    "botright": {
                        "x": 3222,
                        "y": 9552
                    }
                }
            },
            {
                "name": "F",
                "level": 0,
                "area": {
                    "topleft": {
                        "x": 3220,
                        "y": 9556
                    },
                    "botright": {
                        "x": 3222,
                        "y": 9556
                    }
                }
            },
            {
                "name": "G",
                "level": 0,
                "area": {
                    "topleft": {
                        "x": 3203,
                        "y": 9553
                    },
                    "botright": {
                        "x": 3204,
                        "y": 9553
                    }
                }
            }
        ],
        "assumes_meerkats": true,
        "clue": 362,
        "methods": [
            {
                "from": null,
                "to": "A",
                "short_instruction": "{{teleport gamesnecklace tearsofguthix}} to {{target}}"
            },
            {
                "from": "A",
                "to": "B",
                "short_instruction": "{{Dive}}/{{Surge}} to {{target}}"
            },
            {
                "from": "B",
                "to": "C",
                "short_instruction": "Go to {{target}}"
            },
            {
                "from": "C",
                "to": "D",
                "short_instruction": "Cave entrance to {{target}}"
            },
            {
                "from": "D",
                "to": "E",
                "short_instruction": "{{Dive}} to {{target}}"
            },
            {
                "from": "E",
                "to": "F",
                "short_instruction": "Stepping stones to {{target}}"
            },
            {
                "from": "F",
                "to": "G",
                "short_instruction": "Go to {{target}}"
            },
            {
                "from": "A",
                "to": [
                    {
                        "x": 3233,
                        "y": 9547,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "B",
                "to": [
                    {
                        "x": 3210,
                        "y": 9557,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "C",
                "to": [
                    {
                        "x": 3191,
                        "y": 9555,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "D",
                "to": [
                    {
                        "x": 3246,
                        "y": 9566,
                        "level": 0
                    },
                    {
                        "x": 3210,
                        "y": 9571,
                        "level": 0
                    }
                ],
                "short_instruction": "Check {{target}}"
            },
            {
                "from": "E",
                "to": [
                    {
                        "x": 3252,
                        "y": 9577,
                        "level": 0
                    },
                    {
                        "x": 3227,
                        "y": 9575,
                        "level": 0
                    }
                ],
                "short_instruction": "Check {{target}}"
            },
            {
                "from": "F",
                "to": [
                    {
                        "x": 3209,
                        "y": 9587,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "G",
                "to": [
                    {
                        "x": 3172,
                        "y": 9570,
                        "level": 0
                    },
                    {
                        "x": 3179,
                        "y": 9559,
                        "level": 0
                    }
                ],
                "short_instruction": "Check {{target}}"
            },
            {
                "from": "G",
                "to": [
                    {
                        "x": 3167,
                        "y": 9546,
                        "level": 0
                    },
                    {
                        "x": 3170,
                        "y": 9557,
                        "level": 0
                    }
                ],
                "short_instruction": "Check {{target}}"
            }
        ],
        "root": {
            "where_to": "A",
            "children": [
                {
                    "key": {pulse: 1, different_level: false},
                    "value": {
                        "where_to": "B",
                        "children": [
                            {
                                "key": {pulse: 1, different_level: false},
                                "value": {
                                    "where_to": "C",
                                    "children": [
                                        {
                                            "key": {pulse: 1, different_level: false},
                                            "value": {
                                                "where_to": "D",
                                                "children": [
                                                    {
                                                        "key": {pulse: 1, different_level: false},
                                                        "value": {
                                                            "where_to": "E",
                                                            "children": [
                                                                {
                                                                    "key": {pulse: 1, different_level: false},
                                                                    "value": {
                                                                        "where_to": "F",
                                                                        "children": [
                                                                            {
                                                                                "key": {pulse: 1, different_level: false},
                                                                                "value": {
                                                                                    "where_to": "G",
                                                                                    "children": []
                                                                                }
                                                                            }
                                                                        ]
                                                                    }
                                                                }
                                                            ]
                                                        }
                                                    }
                                                ]
                                            }
                                        }
                                    ]
                                }
                            }
                        ]
                    }
                }
            ]
        },
        "spot_ordering": [
            {
                "x": 3233,
                "y": 9547,
                "level": 0
            },
            {
                "x": 3210,
                "y": 9557,
                "level": 0
            },
            {
                "x": 3191,
                "y": 9555,
                "level": 0
            },
            {
                "x": 3246,
                "y": 9566,
                "level": 0
            },
            {
                "x": 3227,
                "y": 9575,
                "level": 0
            },
            {
                "x": 3252,
                "y": 9577,
                "level": 0
            },
            {
                "x": 3210,
                "y": 9571,
                "level": 0
            },
            {
                "x": 3209,
                "y": 9587,
                "level": 0
            },
            {
                "x": 3179,
                "y": 9559,
                "level": 0
            },
            {
                "x": 3170,
                "y": 9557,
                "level": 0
            },
            {
                "x": 3167,
                "y": 9546,
                "level": 0
            },
            {
                "x": 3172,
                "y": 9570,
                "level": 0
            }
        ],
        "type": "scantree"
    },
    {
        "type": "scantree",
        "clue": 352,
        "spot_ordering": [
            {
                "x": 2662,
                "y": 3304,
                "level": 0
            },
            {
                "x": 2635,
                "y": 3313,
                "level": 0
            },
            {
                "x": 2623,
                "y": 3311,
                "level": 0
            },
            {
                "x": 2625,
                "y": 3292,
                "level": 0
            },
            {
                "x": 2662,
                "y": 3338,
                "level": 0
            },
            {
                "x": 2633,
                "y": 3339,
                "level": 0
            },
            {
                "x": 2613,
                "y": 3337,
                "level": 0
            },
            {
                "x": 2537,
                "y": 3306,
                "level": 0
            },
            {
                "x": 2540,
                "y": 3331,
                "level": 0
            },
            {
                "x": 2520,
                "y": 3318,
                "level": 0
            },
            {
                "x": 2517,
                "y": 3281,
                "level": 0
            },
            {
                "x": 2509,
                "y": 3330,
                "level": 0
            },
            {
                "x": 2500,
                "y": 3290,
                "level": 0
            },
            {
                "x": 2496,
                "y": 3282,
                "level": 0
            },
            {
                "x": 2512,
                "y": 3267,
                "level": 0
            },
            {
                "x": 2529,
                "y": 3270,
                "level": 0
            },
            {
                "x": 2569,
                "y": 3340,
                "level": 0
            },
            {
                "x": 2570,
                "y": 3321,
                "level": 0
            },
            {
                "x": 2582,
                "y": 3314,
                "level": 0
            },
            {
                "x": 2583,
                "y": 3265,
                "level": 0
            },
            {
                "x": 2589,
                "y": 3330,
                "level": 0
            },
            {
                "x": 2589,
                "y": 3319,
                "level": 0
            },
            {
                "x": 2483,
                "y": 3313,
                "level": 0
            },
            {
                "x": 2475,
                "y": 3331,
                "level": 0
            },
            {
                "x": 2467,
                "y": 3319,
                "level": 0
            },
            {
                "x": 2462,
                "y": 3282,
                "level": 0
            },
            {
                "x": 2442,
                "y": 3310,
                "level": 0
            },
            {
                "x": 2440,
                "y": 3319,
                "level": 0
            }
        ],
        "assumes_meerkats": true,
        "areas": [
            {
                "name": "A",
                "level": 0,
                "area": {
                    "topleft": {
                        "x": 2659,
                        "y": 3306
                    },
                    "botright": {
                        "x": 2665,
                        "y": 3300
                    }
                }
            },
            {
                "name": "B",
                "level": 0,
                "area": {
                    "topleft": {
                        "x": 2648,
                        "y": 3308
                    },
                    "botright": {
                        "x": 2650,
                        "y": 3306
                    }
                }
            },
            {
                "name": "C",
                "level": 0,
                "area": {
                    "topleft": {
                        "x": 2538,
                        "y": 3306
                    },
                    "botright": {
                        "x": 2538,
                        "y": 3306
                    }
                }
            },
            {
                "name": "D",
                "level": 0,
                "area": {
                    "topleft": {
                        "x": 2531,
                        "y": 3303
                    },
                    "botright": {
                        "x": 2531,
                        "y": 3303
                    }
                }
            },
            {
                "name": "E",
                "level": 0,
                "area": {
                    "topleft": {
                        "x": 2521,
                        "y": 3293
                    },
                    "botright": {
                        "x": 2521,
                        "y": 3293
                    }
                }
            },
            {
                "name": "F",
                "level": 0,
                "area": {
                    "topleft": {
                        "x": 2646,
                        "y": 3355
                    },
                    "botright": {
                        "x": 2646,
                        "y": 3355
                    }
                }
            }
        ],
        "methods": [
            {
                "from": null,
                "to": "A",
                "short_instruction": "{{teleport normalspellbook ardougne}} teleport to {{target}}."
            },
            {
                "from": "A",
                "to": "B",
                "short_instruction": "{{dive}} to {{target}}."
            },
            {
                "from": "A",
                "to": "C",
                "short_instruction": "{{teleport davesspellbook ardougne}} to {{target}}."
            },
            {
                "from": "B",
                "to": "F",
                "short_instruction": "{{teleport skillsnecklace farming}} to {{target}}"
            },
            {
                "from": "C",
                "to": "D",
                "short_instruction": "{{dive}} to {{target}}"
            },
            {
                "from": "D",
                "to": "E",
                "short_instruction": "{{surge}} to {{target}}."
            },
            {
                "from": "A",
                "to": [
                    {
                        "x": 2662,
                        "y": 3304,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "A",
                "to": [
                    {
                        "x": 2635,
                        "y": 3313,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "B",
                "to": [
                    {
                        "x": 2635,
                        "y": 3313,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "B",
                "to": [
                    {
                        "x": 2623,
                        "y": 3311,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "B",
                "to": [
                    {
                        "x": 2625,
                        "y": 3292,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "C",
                "to": [
                    {
                        "x": 2537,
                        "y": 3306,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "C",
                "to": [
                    {
                        "x": 2540,
                        "y": 3331,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "C",
                "to": [
                    {
                        "x": 2520,
                        "y": 3318,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "C",
                "to": [
                    {
                        "x": 2517,
                        "y": 3281,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "C",
                "to": [
                    {
                        "x": 2442,
                        "y": 3310,
                        "level": 0
                    },
                    {
                        "x": 2440,
                        "y": 3319,
                        "level": 0
                    },
                    {
                        "x": 2462,
                        "y": 3282,
                        "level": 0
                    },
                    {
                        "x": 2483,
                        "y": 3313,
                        "level": 0
                    },
                    {
                        "x": 2467,
                        "y": 3319,
                        "level": 0
                    },
                    {
                        "x": 2475,
                        "y": 3331,
                        "level": 0
                    }
                ],
                "short_instruction": "Check {{target}}"
            },
            {
                "from": "D",
                "to": [
                    {
                        "x": 2509,
                        "y": 3330,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "D",
                "to": [
                    {
                        "x": 2589,
                        "y": 3319,
                        "level": 0
                    },
                    {
                        "x": 2589,
                        "y": 3330,
                        "level": 0
                    }
                ],
                "short_instruction": "Check {{target}} via manhole at {{scanarea D}}"
            },
            {
                "from": "E",
                "to": [
                    {
                        "x": 2500,
                        "y": 3290,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "E",
                "to": [
                    {
                        "x": 2496,
                        "y": 3282,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "E",
                "to": [
                    {
                        "x": 2512,
                        "y": 3267,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "E",
                "to": [
                    {
                        "x": 2529,
                        "y": 3270,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "E",
                "to": [
                    {
                        "x": 2570,
                        "y": 3321,
                        "level": 0
                    },
                    {
                        "x": 2569,
                        "y": 3340,
                        "level": 0
                    }
                ],
                "short_instruction": "Check {{target}} via manhole at {{scanarea D}}"
            },
            {
                "from": "E",
                "to": [
                    {
                        "x": 2583,
                        "y": 3265,
                        "level": 0
                    },
                    {
                        "x": 2582,
                        "y": 3314,
                        "level": 0
                    }
                ],
                "short_instruction": "{{teleport davesspellbook ardougne}} to check {{target}} "
            },
            {
                "from": "F",
                "to": [
                    {
                        "x": 2662,
                        "y": 3338,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "F",
                "to": [
                    {
                        "x": 2633,
                        "y": 3339,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "F",
                "to": [
                    {
                        "x": 2613,
                        "y": 3337,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            }
        ],
        "root": {
            "where_to": "A",
            "why": "",
            "children": [
                {
                    "key": {pulse: 2, different_level: false},
                    "value": {
                        "where_to": "B",
                        "why": "",
                        "children": [
                            {
                                "key": {pulse: 2, different_level: false},
                                "value": {
                                    "where_to": "F",
                                    "children": []
                                }
                            }
                        ]
                    }
                },
                {
                    "key": {pulse: 1, different_level: false},
                    "value": {
                        "where_to": "C",
                        "why": "",
                        "children": [
                            {
                                "key": {pulse: 2, different_level: false},
                                "value": {
                                    "where_to": "D",
                                    "why": "",
                                    "children": [
                                        {
                                            "key": {pulse: 2, different_level: false},
                                            "value": {
                                                "where_to": "E",
                                                "why": "",
                                                "children": []
                                            }
                                        }
                                    ]
                                }
                            }
                        ]
                    }
                }
            ]
        }
    },
    {
        "areas": [
            {
                "name": "A",
                "level": 0,
                "area": {
                    "topleft": {
                        "x": 2910,
                        "y": 3425
                    },
                    "botright": {
                        "x": 2914,
                        "y": 3421
                    }
                }
            },
            {
                "name": "B",
                "level": 0,
                "area": {
                    "topleft": {
                        "x": 2919,
                        "y": 9702
                    },
                    "botright": {
                        "x": 2924,
                        "y": 9700
                    }
                }
            },
            {
                "name": "C",
                "level": 0,
                "area": {
                    "topleft": {
                        "x": 2906,
                        "y": 9721
                    },
                    "botright": {
                        "x": 2909,
                        "y": 9719
                    }
                }
            },
            {
                "name": "D",
                "level": 0,
                "area": {
                    "topleft": {
                        "x": 2909,
                        "y": 9742
                    },
                    "botright": {
                        "x": 2912,
                        "y": 9742
                    }
                }
            },
            {
                "name": "E",
                "level": 0,
                "area": {
                    "topleft": {
                        "x": 2914,
                        "y": 9742
                    },
                    "botright": {
                        "x": 2914,
                        "y": 9742
                    }
                }
            },
            {
                "name": "F",
                "level": 0,
                "area": {
                    "topleft": {
                        "x": 2886,
                        "y": 9795
                    },
                    "botright": {
                        "x": 2886,
                        "y": 9795
                    }
                }
            },
            {
                "name": "G",
                "level": 0,
                "area": {
                    "topleft": {
                        "x": 2885,
                        "y": 9832
                    },
                    "botright": {
                        "x": 2888,
                        "y": 9829
                    }
                }
            }
        ],
        "assumes_meerkats": true,
        "clue": 357,
        "methods": [
            {
                "from": null,
                "to": "A",
                "short_instruction": "{{teleport normalspellbook taverley}} to {{target}}"
            },
            {
                "from": "A",
                "to": "B",
                "short_instruction": "{{teleport archteleport isaura}} to {{target}}"
            },
            {
                "from": "B",
                "to": "C",
                "short_instruction": "{{Surge}}/{{Dive}} {{target}}"
            },
            {
                "from": "C",
                "to": "D",
                "short_instruction": "{{Surge}} to {{target}}"
            },
            {
                "from": "D",
                "to": "E",
                "short_instruction": "Go to {{target}}"
            },
            {
                "from": "A",
                "to": "F",
                "short_instruction": "{{Dive}}/{{Surge}} to {{target}}"
            },
            {
                "from": "F",
                "to": "G",
                "short_instruction": "{{Surge}} to {{target}}"
            },
            {
                "from": "F",
                "to": [
                    {
                        "x": 2884,
                        "y": 9799,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "F",
                "to": [
                    {
                        "x": 2904,
                        "y": 9809,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "F",
                "to": [
                    {
                        "x": 2875,
                        "y": 9805,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "F",
                "to": [
                    {
                        "x": 2892,
                        "y": 9783,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "G",
                "to": [
                    {
                        "x": 2895,
                        "y": 9831,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "G",
                "to": [
                    {
                        "x": 2907,
                        "y": 9842,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "G",
                "to": [
                    {
                        "x": 2888,
                        "y": 9846,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "G",
                "to": [
                    {
                        "x": 2938,
                        "y": 9812,
                        "level": 0
                    },
                    {
                        "x": 2933,
                        "y": 9848,
                        "level": 0
                    }
                ],
                "short_instruction": "Check {{target}}"
            },
            {
                "from": "F",
                "to": [
                    {
                        "x": 2952,
                        "y": 9786,
                        "level": 0
                    },
                    {
                        "x": 2945,
                        "y": 9796,
                        "level": 0
                    }
                ],
                "short_instruction": "Check {{target}}"
            },
            {
                "from": "B",
                "to": [
                    {
                        "x": 2926,
                        "y": 9692,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "B",
                "to": [
                    {
                        "x": 2907,
                        "y": 9705,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "B",
                "to": [
                    {
                        "x": 2907,
                        "y": 9718,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "B",
                "to": [
                    {
                        "x": 2905,
                        "y": 9734,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "D",
                "to": [
                    {
                        "x": 2914,
                        "y": 9757,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "D",
                "to": [
                    {
                        "x": 2936,
                        "y": 9764,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "D",
                "to": [
                    {
                        "x": 2895,
                        "y": 9769,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "D",
                "to": [
                    {
                        "x": 2949,
                        "y": 9773,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "E",
                "to": [
                    {
                        "x": 2968,
                        "y": 9786,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "D",
                "to": [
                    {
                        "x": 2858,
                        "y": 9788,
                        "level": 0
                    },
                    {
                        "x": 2870,
                        "y": 9791,
                        "level": 0
                    }
                ],
                "short_instruction": "Check {{target}}"
            },
            {
                "from": "F",
                "to": [
                    {
                        "x": 2870,
                        "y": 9791,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "E",
                "to": [
                    {
                        "x": 2832,
                        "y": 9813,
                        "level": 0
                    },
                    {
                        "x": 2835,
                        "y": 9819,
                        "level": 0
                    },
                    {
                        "x": 2822,
                        "y": 9826,
                        "level": 0
                    }
                ],
                "short_instruction": "Check {{target}}"
            }
        ],
        "root": {
            "where_to": "A",
            "children": [
                {
                    "key": {
                        "pulse": 1,
                        "different_level": false
                    },
                    "value": {
                        "where_to": "B",
                        "children": [
                            {
                                "key": {
                                    "pulse": 1,
                                    "different_level": false
                                },
                                "value": {
                                    "where_to": "C",
                                    "children": [
                                        {
                                            "key": {
                                                "pulse": 1,
                                                "different_level": false
                                            },
                                            "value": {
                                                "where_to": "D",
                                                "children": [
                                                    {
                                                        "key": {
                                                            "pulse": 1,
                                                            "different_level": false
                                                        },
                                                        "value": {
                                                            "where_to": "E",
                                                            "children": []
                                                        }
                                                    }
                                                ]
                                            }
                                        },
                                        {
                                            "key": {
                                                "pulse": 2,
                                                "different_level": false
                                            },
                                            "value": {
                                                "where_to": "D",
                                                "children": []
                                            }
                                        }
                                    ]
                                }
                            }
                        ]
                    }
                },
                {
                    "key": {
                        "pulse": 1,
                        "different_level": true
                    },
                    "value": {
                        "where_to": "F",
                        "children": [
                            {
                                "key": {
                                    "pulse": 2,
                                    "different_level": false
                                },
                                "value": {
                                    "where_to": "G",
                                    "children": []
                                }
                            }
                        ]
                    }
                }
            ]
        },
        "spot_ordering": [
            {
                "x": 2884,
                "y": 9799,
                "level": 0
            },
            {
                "x": 2904,
                "y": 9809,
                "level": 0
            },
            {
                "x": 2875,
                "y": 9805,
                "level": 0
            },
            {
                "x": 2892,
                "y": 9783,
                "level": 0
            },
            {
                "x": 2895,
                "y": 9831,
                "level": 0
            },
            {
                "x": 2907,
                "y": 9842,
                "level": 0
            },
            {
                "x": 2888,
                "y": 9846,
                "level": 0
            },
            {
                "x": 2933,
                "y": 9848,
                "level": 0
            },
            {
                "x": 2938,
                "y": 9812,
                "level": 0
            },
            {
                "x": 2945,
                "y": 9796,
                "level": 0
            },
            {
                "x": 2952,
                "y": 9786,
                "level": 0
            },
            {
                "x": 2926,
                "y": 9692,
                "level": 0
            },
            {
                "x": 2907,
                "y": 9705,
                "level": 0
            },
            {
                "x": 2907,
                "y": 9718,
                "level": 0
            },
            {
                "x": 2905,
                "y": 9734,
                "level": 0
            },
            {
                "x": 2914,
                "y": 9757,
                "level": 0
            },
            {
                "x": 2936,
                "y": 9764,
                "level": 0
            },
            {
                "x": 2895,
                "y": 9769,
                "level": 0
            },
            {
                "x": 2949,
                "y": 9773,
                "level": 0
            },
            {
                "x": 2968,
                "y": 9786,
                "level": 0
            },
            {
                "x": 2858,
                "y": 9788,
                "level": 0
            },
            {
                "x": 2870,
                "y": 9791,
                "level": 0
            },
            {
                "x": 2835,
                "y": 9819,
                "level": 0
            },
            {
                "x": 2832,
                "y": 9813,
                "level": 0
            },
            {
                "x": 2822,
                "y": 9826,
                "level": 0
            }
        ],
        "type": "scantree"
    },{
        "areas": [
            {
                "name": "Anywhere",
                "level": 0,
                "area": {
                    "topleft": {
                        "x": 3157,
                        "y": 3499
                    },
                    "botright": {
                        "x": 3172,
                        "y": 3484
                    }
                }
            },
            {
                "name": "A",
                "level": 0,
                "area": {
                    "topleft": {
                        "x": 2721,
                        "y": 5266
                    },
                    "botright": {
                        "x": 2724,
                        "y": 5263
                    }
                }
            },
            {
                "name": "B",
                "level": 0,
                "area": {
                    "topleft": {
                        "x": 2726,
                        "y": 5266
                    },
                    "botright": {
                        "x": 2726,
                        "y": 5266
                    }
                }
            },
            {
                "name": "C",
                "level": 0,
                "area": {
                    "topleft": {
                        "x": 2712,
                        "y": 5277
                    },
                    "botright": {
                        "x": 2715,
                        "y": 5275
                    }
                }
            },
            {
                "name": "D",
                "level": 0,
                "area": {
                    "topleft": {
                        "x": 2713,
                        "y": 5281
                    },
                    "botright": {
                        "x": 2714,
                        "y": 5281
                    }
                }
            },
            {
                "name": "E",
                "level": 1,
                "area": {
                    "topleft": {
                        "x": 2713,
                        "y": 5285
                    },
                    "botright": {
                        "x": 2714,
                        "y": 5285
                    }
                }
            },
            {
                "name": "F",
                "level": 1,
                "area": {
                    "topleft": {
                        "x": 2696,
                        "y": 5312
                    },
                    "botright": {
                        "x": 2701,
                        "y": 5305
                    }
                }
            },
            {
                "name": "G",
                "level": 1,
                "area": {
                    "topleft": {
                        "x": 2701,
                        "y": 5305
                    },
                    "botright": {
                        "x": 2701,
                        "y": 5305
                    }
                }
            },
            {
                "name": "H",
                "level": 1,
                "area": {
                    "topleft": {
                        "x": 2700,
                        "y": 5335
                    },
                    "botright": {
                        "x": 2701,
                        "y": 5328
                    }
                }
            },
            {
                "name": "I",
                "level": 1,
                "area": {
                    "topleft": {
                        "x": 2706,
                        "y": 5354
                    },
                    "botright": {
                        "x": 2707,
                        "y": 5343
                    }
                }
            }
        ],
        "assumes_meerkats": true,
        "clue": 365,
        "methods": [
            {
                "from": null,
                "to": "Anywhere",
                "short_instruction": "Start {{target}} on ground floor"
            },
            {
                "from": "Anywhere",
                "to": "A",
                "short_instruction": "{{teleport spheredorgeshkaan south}} to {{target}}"
            },
            {
                "from": "A",
                "to": "B",
                "short_instruction": "Go to {{target}}"
            },
            {
                "from": "A",
                "to": "C",
                "short_instruction": "{{Dive}} to {{target}}"
            },
            {
                "from": "C",
                "to": "D",
                "short_instruction": "Stair up to {{target}}"
            },
            {
                "from": "D",
                "to": "E",
                "short_instruction": "Stair down to {{target}}"
            },
            {
                "from": "Anywhere",
                "to": "F",
                "short_instruction": "{{teleport spheredorgeshkaan west}} to {{target}}"
            },
            {
                "from": "F",
                "to": "G",
                "short_instruction": "Go to {{target}}"
            },
            {
                "from": "F",
                "to": "H",
                "short_instruction": "{{Surge}}+{{Surge}} to {{target}}"
            },
            {
                "from": "G",
                "to": "H",
                "short_instruction": "{{Surge}}+{{Surge}} to {{target}}"
            },
            {
                "from": "H",
                "to": "I",
                "short_instruction": "{{Dive}} to {{target}}"
            },
            {
                "from": "A",
                "to": [
                    {
                        "x": 2711,
                        "y": 5271,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "A",
                "to": [
                    {
                        "x": 2723,
                        "y": 5279,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "A",
                "to": [
                    {
                        "x": 2731,
                        "y": 5266,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "A",
                "to": [
                    {
                        "x": 2740,
                        "y": 5273,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "A",
                "to": [
                    {
                        "x": 2711,
                        "y": 5284,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "B",
                "to": [
                    {
                        "x": 2747,
                        "y": 5263,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "B",
                "to": [
                    {
                        "x": 2729,
                        "y": 5295,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "C",
                "to": [
                    {
                        "x": 2730,
                        "y": 5315,
                        "level": 0
                    },
                    {
                        "x": 2717,
                        "y": 5311,
                        "level": 0
                    }
                ],
                "short_instruction": "Check {{target}}"
            },
            {
                "from": "D",
                "to": [
                    {
                        "x": 2704,
                        "y": 5321,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "E",
                "to": [
                    {
                        "x": 2732,
                        "y": 5327,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "E",
                "to": [
                    {
                        "x": 2704,
                        "y": 5349,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "F",
                "to": [
                    {
                        "x": 2698,
                        "y": 5316,
                        "level": 1
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "F",
                "to": [
                    {
                        "x": 2700,
                        "y": 5284,
                        "level": 1
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "G",
                "to": [
                    {
                        "x": 2700,
                        "y": 5284,
                        "level": 1
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "H",
                "to": [
                    {
                        "x": 2701,
                        "y": 5343,
                        "level": 1
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "H",
                "to": [
                    {
                        "x": 2704,
                        "y": 5357,
                        "level": 1
                    },
                    {
                        "x": 2734,
                        "y": 5370,
                        "level": 1
                    }
                ],
                "short_instruction": "Check {{target}}"
            },
            {
                "from": "I",
                "to": [
                    {
                        "x": 2747,
                        "y": 5327,
                        "level": 1
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "H",
                "to": [
                    {
                        "x": 2738,
                        "y": 5301,
                        "level": 1
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "I",
                "to": [
                    {
                        "x": 2739,
                        "y": 5253,
                        "level": 1
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            }
        ],
        "root": {
            "where_to": "Anywhere",
            "children": [
                {
                    "key": {
                        "pulse": 1,
                        "different_level": false
                    },
                    "value": {
                        "where_to": "A",
                        "children": [
                            {
                                "key": {
                                    "pulse": 2,
                                    "different_level": false
                                },
                                "value": {
                                    "where_to": "B",
                                    "children": []
                                }
                            },
                            {
                                "key": {
                                    "pulse": 1,
                                    "different_level": false
                                },
                                "value": {
                                    "where_to": "C",
                                    "children": [
                                        {
                                            "key": {
                                                "pulse": 1,
                                                "different_level": false
                                            },
                                            "value": {
                                                "where_to": "D",
                                                "children": [
                                                    {
                                                        "key": {
                                                            "pulse": 1,
                                                            "different_level": false
                                                        },
                                                        "value": {
                                                            "where_to": "E",
                                                            "children": []
                                                        }
                                                    }
                                                ]
                                            }
                                        }
                                    ]
                                }
                            }
                        ]
                    }
                },
                {
                    "key": {
                        "pulse": 1,
                        "different_level": true
                    },
                    "value": {
                        "where_to": "F",
                        "children": [
                            {
                                "key": {
                                    "pulse": 2,
                                    "different_level": false
                                },
                                "value": {
                                    "where_to": "G",
                                    "children": [
                                        {
                                            "key": {
                                                "pulse": 2,
                                                "different_level": false
                                            },
                                            "value": {
                                                "where_to": "H",
                                                "children": []
                                            }
                                        }
                                    ]
                                }
                            },
                            {
                                "key": {
                                    "pulse": 1,
                                    "different_level": false
                                },
                                "value": {
                                    "where_to": "H",
                                    "children": [
                                        {
                                            "key": {
                                                "pulse": 1,
                                                "different_level": false
                                            },
                                            "value": {
                                                "where_to": "I",
                                                "children": []
                                            }
                                        }
                                    ]
                                }
                            }
                        ]
                    }
                }
            ]
        },
        "spot_ordering": [
            {
                "x": 2711,
                "y": 5271,
                "level": 0
            },
            {
                "x": 2723,
                "y": 5279,
                "level": 0
            },
            {
                "x": 2731,
                "y": 5266,
                "level": 0
            },
            {
                "x": 2740,
                "y": 5273,
                "level": 0
            },
            {
                "x": 2711,
                "y": 5284,
                "level": 0
            },
            {
                "x": 2747,
                "y": 5263,
                "level": 0
            },
            {
                "x": 2729,
                "y": 5295,
                "level": 0
            },
            {
                "x": 2717,
                "y": 5311,
                "level": 0
            },
            {
                "x": 2730,
                "y": 5315,
                "level": 0
            },
            {
                "x": 2704,
                "y": 5321,
                "level": 0
            },
            {
                "x": 2732,
                "y": 5327,
                "level": 0
            },
            {
                "x": 2704,
                "y": 5349,
                "level": 0
            },
            {
                "x": 2698,
                "y": 5316,
                "level": 1
            },
            {
                "x": 2700,
                "y": 5284,
                "level": 1
            },
            {
                "x": 2701,
                "y": 5343,
                "level": 1
            },
            {
                "x": 2704,
                "y": 5357,
                "level": 1
            },
            {
                "x": 2734,
                "y": 5370,
                "level": 1
            },
            {
                "x": 2747,
                "y": 5327,
                "level": 1
            },
            {
                "x": 2738,
                "y": 5301,
                "level": 1
            },
            {
                "x": 2739,
                "y": 5253,
                "level": 1
            }
        ],
        "type": "scantree"
    },
    {
        "areas": [
            {
                "name": "A",
                "level": 0,
                "area": {
                    "topleft": {
                        "x": 2355,
                        "y": 3848
                    },
                    "botright": {
                        "x": 2355,
                        "y": 3848
                    }
                }
            },
            {
                "name": "B",
                "level": 0,
                "area": {
                    "topleft": {
                        "x": 2356,
                        "y": 3854
                    },
                    "botright": {
                        "x": 2356,
                        "y": 3852
                    }
                }
            },
            {
                "name": "C",
                "level": 0,
                "area": {
                    "topleft": {
                        "x": 2343,
                        "y": 3864
                    },
                    "botright": {
                        "x": 2347,
                        "y": 3860
                    }
                }
            },
            {
                "name": "D",
                "level": 0,
                "area": {
                    "topleft": {
                        "x": 2351,
                        "y": 3853
                    },
                    "botright": {
                        "x": 2352,
                        "y": 3852
                    }
                }
            },
            {
                "name": "E",
                "level": 0,
                "area": {
                    "topleft": {
                        "x": 2354,
                        "y": 3855
                    },
                    "botright": {
                        "x": 2354,
                        "y": 3855
                    }
                }
            },
            {
                "name": "F",
                "level": 0,
                "area": {
                    "topleft": {
                        "x": 2362,
                        "y": 3865
                    },
                    "botright": {
                        "x": 2364,
                        "y": 3863
                    }
                }
            },
            {
                "name": "G",
                "level": 0,
                "area": {
                    "topleft": {
                        "x": 2357,
                        "y": 3868
                    },
                    "botright": {
                        "x": 2357,
                        "y": 3867
                    }
                }
            },
            {
                "name": "H",
                "level": 0,
                "area": {
                    "topleft": {
                        "x": 2377,
                        "y": 3868
                    },
                    "botright": {
                        "x": 2377,
                        "y": 3867
                    }
                }
            },
            {
                "name": "I",
                "level": 0,
                "area": {
                    "topleft": {
                        "x": 2375,
                        "y": 3868
                    },
                    "botright": {
                        "x": 2375,
                        "y": 3867
                    }
                }
            },
            {
                "name": "J",
                "level": 0,
                "area": {
                    "topleft": {
                        "x": 2374,
                        "y": 3868
                    },
                    "botright": {
                        "x": 2374,
                        "y": 3867
                    }
                }
            },
            {
                "name": "K",
                "level": 0,
                "area": {
                    "topleft": {
                        "x": 2403,
                        "y": 3782
                    },
                    "botright": {
                        "x": 2404,
                        "y": 3781
                    }
                }
            },
            {
                "name": "L",
                "level": 0,
                "area": {
                    "topleft": {
                        "x": 2310,
                        "y": 3788
                    },
                    "botright": {
                        "x": 2311,
                        "y": 3786
                    }
                }
            }
        ],
        "assumes_meerkats": true,
        "clue": 363,
        "methods": [
            {
                "from": null,
                "to": "A",
                "short_instruction": "{{teleport naturessentinel arcticpine}} to {{target}}"
            },
            {
                "from": "A",
                "to": "B",
                "short_instruction": "Go to {{target}}"
            },
            {
                "from": "B",
                "to": "C",
                "short_instruction": "{{Surge}} to {{target}}"
            },
            {
                "from": "A",
                "to": "D",
                "short_instruction": "Go to {{target}}"
            },
            {
                "from": "D",
                "to": "E",
                "short_instruction": "Step to {{target}}"
            },
            {
                "from": "D",
                "to": "F",
                "short_instruction": "{{Surge}} to {{target}}"
            },
            {
                "from": "F",
                "to": "G",
                "short_instruction": "Go to {{target}}"
            },
            {
                "from": "F",
                "to": "H",
                "short_instruction": "{{Dive}} to {{target}}"
            },
            {
                "from": "H",
                "to": "I",
                "short_instruction": "Step to {{target}}"
            },
            {
                "from": "I",
                "to": "J",
                "short_instruction": "Step to {{target}}"
            },
            {
                "from": "H",
                "to": "K",
                "short_instruction": "{{teleport lyre jatizso}} to {{target}}"
            },
            {
                "from": "K",
                "to": "L",
                "short_instruction": "{{teleport lyre neitiznot}} to {{target}}"
            },
            {
                "from": "A",
                "to": [
                    {
                        "x": 2354,
                        "y": 3853,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "A",
                "to": [
                    {
                        "x": 2373,
                        "y": 3834,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "B",
                "to": [
                    {
                        "x": 2368,
                        "y": 3870,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "B",
                "to": [
                    {
                        "x": 2377,
                        "y": 3850,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "C",
                "to": [
                    {
                        "x": 2349,
                        "y": 3880,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "C",
                "to": [
                    {
                        "x": 2326,
                        "y": 3866,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "C",
                "to": [
                    {
                        "x": 2326,
                        "y": 3850,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "C",
                "to": [
                    {
                        "x": 2330,
                        "y": 3829,
                        "level": 0
                    },
                    {
                        "x": 2314,
                        "y": 3851,
                        "level": 0
                    }
                ],
                "short_instruction": "Check {{target}}"
            },
            {
                "from": "C",
                "to": [
                    {
                        "x": 2395,
                        "y": 3812,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "B",
                "to": [
                    {
                        "x": 2324,
                        "y": 3808,
                        "level": 0
                    },
                    {
                        "x": 2342,
                        "y": 3809,
                        "level": 0
                    }
                ],
                "short_instruction": "Check {{target}}"
            },
            {
                "from": "E",
                "to": [
                    {
                        "x": 2312,
                        "y": 3894,
                        "level": 0
                    },
                    {
                        "x": 2352,
                        "y": 3892,
                        "level": 0
                    }
                ],
                "short_instruction": "Check {{target}}"
            },
            {
                "from": "E",
                "to": [
                    {
                        "x": 2311,
                        "y": 3835,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "G",
                "to": [
                    {
                        "x": 2399,
                        "y": 3888,
                        "level": 0
                    },
                    {
                        "x": 2389,
                        "y": 3899,
                        "level": 0
                    }
                ],
                "short_instruction": "Check {{target}}"
            },
            {
                "from": "G",
                "to": [
                    {
                        "x": 2400,
                        "y": 3870,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "J",
                "to": [
                    {
                        "x": 2414,
                        "y": 3848,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "J",
                "to": [
                    {
                        "x": 2417,
                        "y": 3893,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "I",
                "to": [
                    {
                        "x": 2419,
                        "y": 3833,
                        "level": 0
                    },
                    {
                        "x": 2418,
                        "y": 3870,
                        "level": 0
                    }
                ],
                "short_instruction": "Check {{target}}"
            },
            {
                "from": "K",
                "to": [
                    {
                        "x": 2402,
                        "y": 3789,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "K",
                "to": [
                    {
                        "x": 2421,
                        "y": 3792,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "K",
                "to": [
                    {
                        "x": 2397,
                        "y": 3801,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "K",
                "to": [
                    {
                        "x": 2376,
                        "y": 3800,
                        "level": 0
                    },
                    {
                        "x": 2381,
                        "y": 3789,
                        "level": 0
                    }
                ],
                "short_instruction": "Check {{target}}"
            },
            {
                "from": "L",
                "to": [
                    {
                        "x": 2311,
                        "y": 3801,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "L",
                "to": [
                    {
                        "x": 2322,
                        "y": 3787,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "L",
                "to": [
                    {
                        "x": 2340,
                        "y": 3803,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "L",
                "to": [
                    {
                        "x": 2354,
                        "y": 3790,
                        "level": 0
                    },
                    {
                        "x": 2360,
                        "y": 3799,
                        "level": 0
                    }
                ],
                "short_instruction": "Check {{target}}"
            }
        ],
        "root": {
            "where_to": "A",
            "children": [
                {
                    "key": {
                        "pulse": 2,
                        "different_level": false
                    },
                    "value": {
                        "where_to": "B",
                        "children": [
                            {
                                "key": {
                                    "pulse": 2,
                                    "different_level": false
                                },
                                "value": {
                                    "where_to": "C",
                                    "children": []
                                }
                            }
                        ]
                    }
                },
                {
                    "key": {
                        "pulse": 1,
                        "different_level": false
                    },
                    "value": {
                        "where_to": "D",
                        "children": [
                            {
                                "key": {
                                    "pulse": 2,
                                    "different_level": false
                                },
                                "value": {
                                    "where_to": "E",
                                    "children": []
                                }
                            },
                            {
                                "key": {
                                    "pulse": 1,
                                    "different_level": false
                                },
                                "value": {
                                    "where_to": "F",
                                    "children": [
                                        {
                                            "key": {
                                                "pulse": 2,
                                                "different_level": false
                                            },
                                            "value": {
                                                "where_to": "G",
                                                "children": []
                                            }
                                        },
                                        {
                                            "key": {
                                                "pulse": 1,
                                                "different_level": false
                                            },
                                            "value": {
                                                "where_to": "H",
                                                "children": [
                                                    {
                                                        "key": {
                                                            "pulse": 2,
                                                            "different_level": false
                                                        },
                                                        "value": {
                                                            "where_to": "I",
                                                            "children": [
                                                                {
                                                                    "key": {
                                                                        "pulse": 2,
                                                                        "different_level": false
                                                                    },
                                                                    "value": {
                                                                        "where_to": "J",
                                                                        "children": []
                                                                    }
                                                                }
                                                            ]
                                                        }
                                                    },
                                                    {
                                                        "key": {
                                                            "pulse": 1,
                                                            "different_level": false
                                                        },
                                                        "value": {
                                                            "where_to": "K",
                                                            "children": [
                                                                {
                                                                    "key": {
                                                                        "pulse": 1,
                                                                        "different_level": false
                                                                    },
                                                                    "value": {
                                                                        "where_to": "L",
                                                                        "children": []
                                                                    }
                                                                }
                                                            ]
                                                        }
                                                    }
                                                ]
                                            }
                                        }
                                    ]
                                }
                            }
                        ]
                    }
                }
            ]
        },
        "spot_ordering": [
            {
                "x": 2354,
                "y": 3853,
                "level": 0
            },
            {
                "x": 2373,
                "y": 3834,
                "level": 0
            },
            {
                "x": 2368,
                "y": 3870,
                "level": 0
            },
            {
                "x": 2377,
                "y": 3850,
                "level": 0
            },
            {
                "x": 2349,
                "y": 3880,
                "level": 0
            },
            {
                "x": 2326,
                "y": 3866,
                "level": 0
            },
            {
                "x": 2326,
                "y": 3850,
                "level": 0
            },
            {
                "x": 2314,
                "y": 3851,
                "level": 0
            },
            {
                "x": 2330,
                "y": 3829,
                "level": 0
            },
            {
                "x": 2395,
                "y": 3812,
                "level": 0
            },
            {
                "x": 2324,
                "y": 3808,
                "level": 0
            },
            {
                "x": 2342,
                "y": 3809,
                "level": 0
            },
            {
                "x": 2352,
                "y": 3892,
                "level": 0
            },
            {
                "x": 2312,
                "y": 3894,
                "level": 0
            },
            {
                "x": 2311,
                "y": 3835,
                "level": 0
            },
            {
                "x": 2389,
                "y": 3899,
                "level": 0
            },
            {
                "x": 2399,
                "y": 3888,
                "level": 0
            },
            {
                "x": 2400,
                "y": 3870,
                "level": 0
            },
            {
                "x": 2414,
                "y": 3848,
                "level": 0
            },
            {
                "x": 2417,
                "y": 3893,
                "level": 0
            },
            {
                "x": 2418,
                "y": 3870,
                "level": 0
            },
            {
                "x": 2419,
                "y": 3833,
                "level": 0
            },
            {
                "x": 2402,
                "y": 3789,
                "level": 0
            },
            {
                "x": 2421,
                "y": 3792,
                "level": 0
            },
            {
                "x": 2397,
                "y": 3801,
                "level": 0
            },
            {
                "x": 2381,
                "y": 3789,
                "level": 0
            },
            {
                "x": 2376,
                "y": 3800,
                "level": 0
            },
            {
                "x": 2311,
                "y": 3801,
                "level": 0
            },
            {
                "x": 2322,
                "y": 3787,
                "level": 0
            },
            {
                "x": 2340,
                "y": 3803,
                "level": 0
            },
            {
                "x": 2360,
                "y": 3799,
                "level": 0
            },
            {
                "x": 2354,
                "y": 3790,
                "level": 0
            }
        ],
        "type": "scantree"
    },
    {
        "areas": [
            {
                "name": "A",
                "level": 0,
                "area": {
                    "topleft": {
                        "x": 2319,
                        "y": 3619
                    },
                    "botright": {
                        "x": 2319,
                        "y": 3619
                    }
                }
            },
            {
                "name": "B",
                "level": 0,
                "area": {
                    "topleft": {
                        "x": 2328,
                        "y": 3606
                    },
                    "botright": {
                        "x": 2329,
                        "y": 3605
                    }
                }
            },
            {
                "name": "C",
                "level": 0,
                "area": {
                    "topleft": {
                        "x": 2331,
                        "y": 3607
                    },
                    "botright": {
                        "x": 2331,
                        "y": 3607
                    }
                }
            },
            {
                "name": "D",
                "level": 0,
                "area": {
                    "topleft": {
                        "x": 2343,
                        "y": 3593
                    },
                    "botright": {
                        "x": 2346,
                        "y": 3593
                    }
                }
            },
            {
                "name": "E",
                "level": 0,
                "area": {
                    "topleft": {
                        "x": 2348,
                        "y": 3594
                    },
                    "botright": {
                        "x": 2348,
                        "y": 3594
                    }
                }
            },
            {
                "name": "F",
                "level": 0,
                "area": {
                    "topleft": {
                        "x": 2354,
                        "y": 3606
                    },
                    "botright": {
                        "x": 2366,
                        "y": 3606
                    }
                }
            },
            {
                "name": "G",
                "level": 0,
                "area": {
                    "topleft": {
                        "x": 2347,
                        "y": 3591
                    },
                    "botright": {
                        "x": 2349,
                        "y": 3589
                    }
                }
            },
            {
                "name": "H",
                "level": 0,
                "area": {
                    "topleft": {
                        "x": 2360,
                        "y": 3581
                    },
                    "botright": {
                        "x": 2361,
                        "y": 3581
                    }
                }
            },
            {
                "name": "I",
                "level": 0,
                "area": {
                    "topleft": {
                        "x": 2357,
                        "y": 3577
                    },
                    "botright": {
                        "x": 2358,
                        "y": 3576
                    }
                }
            },
            {
                "name": "J",
                "level": 0,
                "area": {
                    "topleft": {
                        "x": 2351,
                        "y": 3571
                    },
                    "botright": {
                        "x": 2352,
                        "y": 3570
                    }
                }
            },
            {
                "name": "K",
                "level": 0,
                "area": {
                    "topleft": {
                        "x": 2350,
                        "y": 3559
                    },
                    "botright": {
                        "x": 2352,
                        "y": 3557
                    }
                }
            }
        ],
        "assumes_meerkats": true,
        "clue": 355,
        "methods": [
            {
                "from": null,
                "to": "A",
                "short_instruction": "{{teleport fairyring AKQ}} to {{target}}"
            },
            {
                "from": "A",
                "to": "B",
                "short_instruction": "{{Dive}} to {{target}}"
            },
            {
                "from": "A",
                "to": "C",
                "short_instruction": "Step + {{Surge}} to {{target}}"
            },
            {
                "from": "C",
                "to": "D",
                "short_instruction": "Step-{{Surge}}-Step to {{target}}"
            },
            {
                "from": "D",
                "to": "E",
                "short_instruction": "Go to {{target}}"
            },
            {
                "from": "E",
                "to": "F",
                "short_instruction": "Step-{{Surge}} to {{target}}"
            },
            {
                "from": "D",
                "to": "G",
                "short_instruction": "Go to {{target}}"
            },
            {
                "from": "G",
                "to": "H",
                "short_instruction": "{{Dive}} to {{target}}"
            },
            {
                "from": "H",
                "to": "I",
                "short_instruction": "Run to {{target}}"
            },
            {
                "from": "I",
                "to": "J",
                "short_instruction": "Go to {{target}}"
            },
            {
                "from": "H",
                "to": "K",
                "short_instruction": "{{Surge}} to {{target}}"
            },
            {
                "from": "J",
                "to": "K",
                "short_instruction": "{{Surge}} to {{target}}"
            },
            {
                "from": "A",
                "to": [
                    {
                        "x": 2320,
                        "y": 3625,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "A",
                "to": [
                    {
                        "x": 2332,
                        "y": 3632,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "A",
                "to": [
                    {
                        "x": 2318,
                        "y": 3601,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "B",
                "to": [
                    {
                        "x": 2310,
                        "y": 3587,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "B",
                "to": [
                    {
                        "x": 2339,
                        "y": 3589,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "B",
                "to": [
                    {
                        "x": 2347,
                        "y": 3609,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "B",
                "to": [
                    {
                        "x": 2344,
                        "y": 3645,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "D",
                "to": [
                    {
                        "x": 2313,
                        "y": 3576,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "D",
                "to": [
                    {
                        "x": 2331,
                        "y": 3574,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "D",
                "to": [
                    {
                        "x": 2342,
                        "y": 3575,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "D",
                "to": [
                    {
                        "x": 2358,
                        "y": 3580,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "D",
                "to": [
                    {
                        "x": 2362,
                        "y": 3612,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "F",
                "to": [
                    {
                        "x": 2372,
                        "y": 3626,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "F",
                "to": [
                    {
                        "x": 2373,
                        "y": 3612,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "J",
                "to": [
                    {
                        "x": 2392,
                        "y": 3591,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "K",
                "to": [
                    {
                        "x": 2388,
                        "y": 3586,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "I",
                "to": [
                    {
                        "x": 2398,
                        "y": 3582,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "F",
                "to": [
                    {
                        "x": 2361,
                        "y": 3567,
                        "level": 0
                    },
                    {
                        "x": 2358,
                        "y": 3557,
                        "level": 0
                    }
                ],
                "short_instruction": "Check {{target}}"
            },
            {
                "from": "E",
                "to": [
                    {
                        "x": 2308,
                        "y": 3560,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "G",
                "to": [
                    {
                        "x": 2324,
                        "y": 3553,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "K",
                "to": [
                    {
                        "x": 2364,
                        "y": 3547,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "K",
                "to": [
                    {
                        "x": 2353,
                        "y": 3543,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "K",
                "to": [
                    {
                        "x": 2336,
                        "y": 3540,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "K",
                "to": [
                    {
                        "x": 2363,
                        "y": 3527,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "K",
                "to": [
                    {
                        "x": 2310,
                        "y": 3518,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            }
        ],
        "root": {
            "where_to": "A",
            "children": [
                {
                    "key": {
                        "pulse": 2,
                        "different_level": false
                    },
                    "value": {
                        "where_to": "B",
                        "children": []
                    }
                },
                {
                    "key": {
                        "pulse": 1,
                        "different_level": false
                    },
                    "value": {
                        "where_to": "C",
                        "children": [
                            {
                                "key": {
                                    "pulse": 1,
                                    "different_level": false
                                },
                                "value": {
                                    "where_to": "D",
                                    "children": [
                                        {
                                            "key": {
                                                "pulse": 2,
                                                "different_level": false
                                            },
                                            "value": {
                                                "where_to": "E",
                                                "children": [
                                                    {
                                                        "key": {
                                                            "pulse": 2,
                                                            "different_level": false
                                                        },
                                                        "value": {
                                                            "where_to": "F",
                                                            "children": []
                                                        }
                                                    }
                                                ]
                                            }
                                        },
                                        {
                                            "key": {
                                                "pulse": 1,
                                                "different_level": false
                                            },
                                            "value": {
                                                "where_to": "G",
                                                "children": [
                                                    {
                                                        "key": {
                                                            "pulse": 1,
                                                            "different_level": false
                                                        },
                                                        "value": {
                                                            "where_to": "H",
                                                            "children": [
                                                                {
                                                                    "key": {
                                                                        "pulse": 2,
                                                                        "different_level": false
                                                                    },
                                                                    "value": {
                                                                        "where_to": "I",
                                                                        "children": [
                                                                            {
                                                                                "key": {
                                                                                    "pulse": 2,
                                                                                    "different_level": false
                                                                                },
                                                                                "value": {
                                                                                    "where_to": "J",
                                                                                    "children": [
                                                                                        {
                                                                                            "key": {
                                                                                                "pulse": 2,
                                                                                                "different_level": false
                                                                                            },
                                                                                            "value": {
                                                                                                "where_to": "K",
                                                                                                "children": []
                                                                                            }
                                                                                        }
                                                                                    ]
                                                                                }
                                                                            }
                                                                        ]
                                                                    }
                                                                },
                                                                {
                                                                    "key": {
                                                                        "pulse": 1,
                                                                        "different_level": false
                                                                    },
                                                                    "value": {
                                                                        "where_to": "K",
                                                                        "children": []
                                                                    }
                                                                }
                                                            ]
                                                        }
                                                    }
                                                ]
                                            }
                                        }
                                    ]
                                }
                            },
                            {
                                "key": {
                                    "pulse": 2,
                                    "different_level": false
                                },
                                "value": {
                                    "where_to": "D",
                                    "children": []
                                }
                            }
                        ]
                    }
                }
            ]
        },
        "spot_ordering": [
            {
                "x": 2320,
                "y": 3625,
                "level": 0
            },
            {
                "x": 2332,
                "y": 3632,
                "level": 0
            },
            {
                "x": 2318,
                "y": 3601,
                "level": 0
            },
            {
                "x": 2310,
                "y": 3587,
                "level": 0
            },
            {
                "x": 2339,
                "y": 3589,
                "level": 0
            },
            {
                "x": 2347,
                "y": 3609,
                "level": 0
            },
            {
                "x": 2344,
                "y": 3645,
                "level": 0
            },
            {
                "x": 2313,
                "y": 3576,
                "level": 0
            },
            {
                "x": 2331,
                "y": 3574,
                "level": 0
            },
            {
                "x": 2342,
                "y": 3575,
                "level": 0
            },
            {
                "x": 2358,
                "y": 3580,
                "level": 0
            },
            {
                "x": 2362,
                "y": 3612,
                "level": 0
            },
            {
                "x": 2372,
                "y": 3626,
                "level": 0
            },
            {
                "x": 2373,
                "y": 3612,
                "level": 0
            },
            {
                "x": 2392,
                "y": 3591,
                "level": 0
            },
            {
                "x": 2388,
                "y": 3586,
                "level": 0
            },
            {
                "x": 2398,
                "y": 3582,
                "level": 0
            },
            {
                "x": 2361,
                "y": 3567,
                "level": 0
            },
            {
                "x": 2308,
                "y": 3560,
                "level": 0
            },
            {
                "x": 2358,
                "y": 3557,
                "level": 0
            },
            {
                "x": 2324,
                "y": 3553,
                "level": 0
            },
            {
                "x": 2364,
                "y": 3547,
                "level": 0
            },
            {
                "x": 2353,
                "y": 3543,
                "level": 0
            },
            {
                "x": 2336,
                "y": 3540,
                "level": 0
            },
            {
                "x": 2363,
                "y": 3527,
                "level": 0
            },
            {
                "x": 2310,
                "y": 3518,
                "level": 0
            }
        ],
        "type": "scantree"
    },
    {
        "areas": [
            {
                "name": "A",
                "level": 0,
                "area": {
                    "topleft": {
                        "x": 3597,
                        "y": 3495
                    },
                    "botright": {
                        "x": 3597,
                        "y": 3495
                    }
                }
            },
            {
                "name": "B",
                "level": 0,
                "area": {
                    "topleft": {
                        "x": 3587,
                        "y": 3485
                    },
                    "botright": {
                        "x": 3587,
                        "y": 3485
                    }
                }
            },
            {
                "name": "C",
                "level": 0,
                "area": {
                    "topleft": {
                        "x": 3583,
                        "y": 3482
                    },
                    "botright": {
                        "x": 3583,
                        "y": 3482
                    }
                }
            },
            {
                "name": "D",
                "level": 0,
                "area": {
                    "topleft": {
                        "x": 3591,
                        "y": 3481
                    },
                    "botright": {
                        "x": 3591,
                        "y": 3479
                    }
                }
            },
            {
                "name": "E",
                "level": 0,
                "area": {
                    "topleft": {
                        "x": 3567,
                        "y": 3484
                    },
                    "botright": {
                        "x": 3568,
                        "y": 3482
                    }
                }
            },
            {
                "name": "F",
                "level": 0,
                "area": {
                    "topleft": {
                        "x": 3554,
                        "y": 3478
                    },
                    "botright": {
                        "x": 3555,
                        "y": 3477
                    }
                }
            }
        ],
        "assumes_meerkats": true,
        "clue": 359,
        "methods": [
            {
                "from": null,
                "to": "A",
                "short_instruction": "{{teleport fairyring ALQ}} to {{target}}"
            },
            {
                "from": "A",
                "to": "B",
                "short_instruction": "Step-{{Surge}} to {{target}}"
            },
            {
                "from": "B",
                "to": "C",
                "short_instruction": "Go to {{target}}"
            },
            {
                "from": "B",
                "to": "D",
                "short_instruction": "Go to {{target}}"
            },
            {
                "from": "C",
                "to": "D",
                "short_instruction": "{{Dive}} to {{target}}"
            },
            {
                "from": "B",
                "to": "E",
                "short_instruction": "{{Surge}} to {{target}}"
            },
            {
                "from": "E",
                "to": "F",
                "short_instruction": "{{Dive}} to {{target}}"
            },
            {
                "from": "A",
                "to": [
                    {
                        "x": 3596,
                        "y": 3501,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "A",
                "to": [
                    {
                        "x": 3604,
                        "y": 3507,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "A",
                "to": [
                    {
                        "x": 3609,
                        "y": 3499,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "A",
                "to": [
                    {
                        "x": 3583,
                        "y": 3484,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "B",
                "to": [
                    {
                        "x": 3590,
                        "y": 3475,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "C",
                "to": [
                    {
                        "x": 3583,
                        "y": 3466,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "C",
                "to": [
                    {
                        "x": 3567,
                        "y": 3475,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "B",
                "to": [
                    {
                        "x": 3573,
                        "y": 3484,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "D",
                "to": [
                    {
                        "x": 3606,
                        "y": 3465,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "D",
                "to": [
                    {
                        "x": 3575,
                        "y": 3511,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "C",
                "to": [
                    {
                        "x": 3616,
                        "y": 3512,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "D",
                "to": [
                    {
                        "x": 3624,
                        "y": 3508,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "D",
                "to": [
                    {
                        "x": 3623,
                        "y": 3476,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "B",
                "to": [
                    {
                        "x": 3562,
                        "y": 3509,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "E",
                "to": [
                    {
                        "x": 3552,
                        "y": 3483,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "F",
                "to": [
                    {
                        "x": 3551,
                        "y": 3514,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "F",
                "to": [
                    {
                        "x": 3544,
                        "y": 3465,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "F",
                "to": [
                    {
                        "x": 3534,
                        "y": 3470,
                        "level": 0
                    },
                    {
                        "x": 3523,
                        "y": 3460,
                        "level": 0
                    },
                    {
                        "x": 3529,
                        "y": 3501,
                        "level": 0
                    }
                ],
                "short_instruction": "Check {{target}}"
            },
            {
                "from": "F",
                "to": [
                    {
                        "x": 3637,
                        "y": 3486,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            }
        ],
        "root": {
            "where_to": "A",
            "children": [
                {
                    "key": {
                        "pulse": 2,
                        "different_level": false
                    },
                    "value": {
                        "where_to": "B",
                        "children": [
                            {
                                "key": {
                                    "pulse": 2,
                                    "different_level": false
                                },
                                "value": {
                                    "where_to": "C",
                                    "children": [
                                        {
                                            "key": {
                                                "pulse": 2,
                                                "different_level": false
                                            },
                                            "value": {
                                                "where_to": "D",
                                                "children": []
                                            }
                                        }
                                    ]
                                }
                            },
                            {
                                "key": {
                                    "pulse": 1,
                                    "different_level": false
                                },
                                "value": {
                                    "where_to": "D",
                                    "children": []
                                }
                            }
                        ]
                    }
                },
                {
                    "key": {
                        "pulse": 1,
                        "different_level": false
                    },
                    "value": {
                        "where_to": "B",
                        "children": [
                            {
                                "key": {
                                    "pulse": 1,
                                    "different_level": false
                                },
                                "value": {
                                    "where_to": "E",
                                    "children": [
                                        {
                                            "key": {
                                                "pulse": 2,
                                                "different_level": false
                                            },
                                            "value": {
                                                "where_to": "F",
                                                "children": []
                                            }
                                        },
                                        {
                                            "key": {
                                                "pulse": 1,
                                                "different_level": false
                                            },
                                            "value": {
                                                "where_to": "F",
                                                "children": []
                                            }
                                        }
                                    ]
                                }
                            }
                        ]
                    }
                }
            ]
        },
        "spot_ordering": [
            {
                "x": 3596,
                "y": 3501,
                "level": 0
            },
            {
                "x": 3604,
                "y": 3507,
                "level": 0
            },
            {
                "x": 3609,
                "y": 3499,
                "level": 0
            },
            {
                "x": 3583,
                "y": 3484,
                "level": 0
            },
            {
                "x": 3590,
                "y": 3475,
                "level": 0
            },
            {
                "x": 3583,
                "y": 3466,
                "level": 0
            },
            {
                "x": 3567,
                "y": 3475,
                "level": 0
            },
            {
                "x": 3573,
                "y": 3484,
                "level": 0
            },
            {
                "x": 3606,
                "y": 3465,
                "level": 0
            },
            {
                "x": 3575,
                "y": 3511,
                "level": 0
            },
            {
                "x": 3616,
                "y": 3512,
                "level": 0
            },
            {
                "x": 3624,
                "y": 3508,
                "level": 0
            },
            {
                "x": 3623,
                "y": 3476,
                "level": 0
            },
            {
                "x": 3562,
                "y": 3509,
                "level": 0
            },
            {
                "x": 3552,
                "y": 3483,
                "level": 0
            },
            {
                "x": 3551,
                "y": 3514,
                "level": 0
            },
            {
                "x": 3544,
                "y": 3465,
                "level": 0
            },
            {
                "x": 3534,
                "y": 3470,
                "level": 0
            },
            {
                "x": 3529,
                "y": 3501,
                "level": 0
            },
            {
                "x": 3523,
                "y": 3460,
                "level": 0
            },
            {
                "x": 3637,
                "y": 3486,
                "level": 0
            }
        ],
        "type": "scantree"
    },
    {
        "areas": [
            {
                "name": "A",
                "level": 0,
                "area": {
                    "topleft": {
                        "x": 3205,
                        "y": 2784
                    },
                    "botright": {
                        "x": 3209,
                        "y": 2781
                    }
                }
            },
            {
                "name": "B",
                "level": 0,
                "area": {
                    "topleft": {
                        "x": 3148,
                        "y": 2788
                    },
                    "botright": {
                        "x": 3151,
                        "y": 2785
                    }
                }
            },
            {
                "name": "C",
                "level": 0,
                "area": {
                    "topleft": {
                        "x": 3191,
                        "y": 2716
                    },
                    "botright": {
                        "x": 3193,
                        "y": 2714
                    }
                }
            },
            {
                "name": "D",
                "level": 0,
                "area": {
                    "topleft": {
                        "x": 3173,
                        "y": 2642
                    },
                    "botright": {
                        "x": 3175,
                        "y": 2640
                    }
                }
            },
            {
                "name": "F",
                "level": 0,
                "area": {
                    "topleft": {
                        "x": 3086,
                        "y": 2704
                    },
                    "botright": {
                        "x": 3086,
                        "y": 2704
                    }
                }
            }
        ],
        "assumes_meerkats": true,
        "clue": 354,
        "methods": [
            {
                "from": null,
                "to": "A",
                "short_instruction": "{{teleport menaphostablets merchant}} to {{target}}"
            },
            {
                "from": "A",
                "to": "B",
                "short_instruction": "{{Surge}}/Tomb to {{target}}"
            },
            {
                "from": "D",
                "to": "B",
                "short_instruction": "Tomb (Worker) to {{target}}"
            },
            {
                "from": "A",
                "to": "C",
                "short_instruction": "Tomb (Imperial) to {{target}}"
            },
            {
                "from": "C",
                "to": "D",
                "short_instruction": "Tomb (Port) to {{target}}"
            },
            {
                "from": "B",
                "to": "F",
                "short_instruction": "{{teleport fairyring CKQ}} to {{target}}"
            },
            {
                "from": "A",
                "to": [
                    {
                        "x": 3210,
                        "y": 2770,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "A",
                "to": [
                    {
                        "x": 3231,
                        "y": 2770,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "A",
                "to": [
                    {
                        "x": 3238,
                        "y": 2792,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "A",
                "to": [
                    {
                        "x": 3193,
                        "y": 2797,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "A",
                "to": [
                    {
                        "x": 3199,
                        "y": 2750,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "B",
                "to": [
                    {
                        "x": 3165,
                        "y": 2814,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "B",
                "to": [
                    {
                        "x": 3153,
                        "y": 2799,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "B",
                "to": [
                    {
                        "x": 3145,
                        "y": 2759,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "C",
                "to": [
                    {
                        "x": 3200,
                        "y": 2709,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "C",
                "to": [
                    {
                        "x": 3180,
                        "y": 2700,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "D",
                "to": [
                    {
                        "x": 3180,
                        "y": 2669,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "D",
                "to": [
                    {
                        "x": 3155,
                        "y": 2641,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "D",
                "to": [
                    {
                        "x": 3146,
                        "y": 2659,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "D",
                "to": [
                    {
                        "x": 3127,
                        "y": 2643,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "D",
                "to": [
                    {
                        "x": 3237,
                        "y": 2664,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "B",
                "to": [
                    {
                        "x": 3131,
                        "y": 2791,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "B",
                "to": [
                    {
                        "x": 3135,
                        "y": 2775,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "D",
                "to": [
                    {
                        "x": 3135,
                        "y": 2775,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "F",
                "to": [
                    {
                        "x": 3096,
                        "y": 2692,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "F",
                "to": [
                    {
                        "x": 3099,
                        "y": 2677,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "F",
                "to": [
                    {
                        "x": 3095,
                        "y": 2730,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "F",
                "to": [
                    {
                        "x": 3108,
                        "y": 2742,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            }
        ],
        "root": {
            "where_to": "A",
            "children": [
                {
                    "key": {
                        "pulse": 2,
                        "different_level": false
                    },
                    "value": {
                        "where_to": "B",
                        "children": []
                    }
                },
                {
                    "key": {
                        "pulse": 1,
                        "different_level": false
                    },
                    "value": {
                        "where_to": "C",
                        "children": [
                            {
                                "key": {
                                    "pulse": 2,
                                    "different_level": false
                                },
                                "value": {
                                    "where_to": "D",
                                    "children": []
                                }
                            },
                            {
                                "key": {
                                    "pulse": 1,
                                    "different_level": false
                                },
                                "value": {
                                    "where_to": "D",
                                    "children": [
                                        {
                                            "key": {
                                                "pulse": 1,
                                                "different_level": false
                                            },
                                            "value": {
                                                "where_to": "B",
                                                "children": [
                                                    {
                                                        "key": {
                                                            "pulse": 1,
                                                            "different_level": false
                                                        },
                                                        "value": {
                                                            "where_to": "F",
                                                            "children": []
                                                        }
                                                    },
                                                    {
                                                        "key": {
                                                            "pulse": 2,
                                                            "different_level": false
                                                        },
                                                        "value": {
                                                            "where_to": "F",
                                                            "children": []
                                                        }
                                                    }
                                                ]
                                            }
                                        }
                                    ]
                                }
                            }
                        ]
                    }
                }
            ]
        },
        "spot_ordering": [
            {
                "x": 3210,
                "y": 2770,
                "level": 0
            },
            {
                "x": 3231,
                "y": 2770,
                "level": 0
            },
            {
                "x": 3238,
                "y": 2792,
                "level": 0
            },
            {
                "x": 3193,
                "y": 2797,
                "level": 0
            },
            {
                "x": 3199,
                "y": 2750,
                "level": 0
            },
            {
                "x": 3165,
                "y": 2814,
                "level": 0
            },
            {
                "x": 3153,
                "y": 2799,
                "level": 0
            },
            {
                "x": 3145,
                "y": 2759,
                "level": 0
            },
            {
                "x": 3200,
                "y": 2709,
                "level": 0
            },
            {
                "x": 3180,
                "y": 2700,
                "level": 0
            },
            {
                "x": 3180,
                "y": 2669,
                "level": 0
            },
            {
                "x": 3155,
                "y": 2641,
                "level": 0
            },
            {
                "x": 3146,
                "y": 2659,
                "level": 0
            },
            {
                "x": 3127,
                "y": 2643,
                "level": 0
            },
            {
                "x": 3237,
                "y": 2664,
                "level": 0
            },
            {
                "x": 3131,
                "y": 2791,
                "level": 0
            },
            {
                "x": 3135,
                "y": 2775,
                "level": 0
            },
            {
                "x": 3096,
                "y": 2692,
                "level": 0
            },
            {
                "x": 3099,
                "y": 2677,
                "level": 0
            },
            {
                "x": 3095,
                "y": 2730,
                "level": 0
            },
            {
                "x": 3108,
                "y": 2742,
                "level": 0
            }
        ],
        "type": "scantree"
    },
    {
        "areas": [
            {
                "name": "A",
                "level": 0,
                "area": {
                    "topleft": {
                        "x": 3423,
                        "y": 3016
                    },
                    "botright": {
                        "x": 3423,
                        "y": 3016
                    }
                }
            },
            {
                "name": "B",
                "level": 0,
                "area": {
                    "topleft": {
                        "x": 3411,
                        "y": 3004
                    },
                    "botright": {
                        "x": 3411,
                        "y": 3004
                    }
                }
            },
            {
                "name": "C",
                "level": 0,
                "area": {
                    "topleft": {
                        "x": 3421,
                        "y": 2994
                    },
                    "botright": {
                        "x": 3421,
                        "y": 2994
                    }
                }
            },
            {
                "name": "D",
                "level": 0,
                "area": {
                    "topleft": {
                        "x": 3431,
                        "y": 2984
                    },
                    "botright": {
                        "x": 3431,
                        "y": 2984
                    }
                }
            },
            {
                "name": "H",
                "level": 0,
                "area": {
                    "topleft": {
                        "x": 3475,
                        "y": 3103
                    },
                    "botright": {
                        "x": 3482,
                        "y": 3093
                    }
                }
            },
            {
                "name": "E",
                "level": 0,
                "area": {
                    "topleft": {
                        "x": 3424,
                        "y": 3137
                    },
                    "botright": {
                        "x": 3424,
                        "y": 3137
                    }
                }
            },
            {
                "name": "F",
                "level": 0,
                "area": {
                    "topleft": {
                        "x": 3412,
                        "y": 3113
                    },
                    "botright": {
                        "x": 3415,
                        "y": 3110
                    }
                }
            },
            {
                "name": "G",
                "level": 0,
                "area": {
                    "topleft": {
                        "x": 3401,
                        "y": 3104
                    },
                    "botright": {
                        "x": 3405,
                        "y": 3100
                    }
                }
            }
        ],
        "assumes_meerkats": true,
        "clue": 349,
        "methods": [
            {
                "from": null,
                "to": "A",
                "short_instruction": "{{teleport fairyring DLQ}} to {{target}}"
            },
            {
                "from": "A",
                "to": "B",
                "short_instruction": "Step-{{Surge}} to {{target}}"
            },
            {
                "from": "B",
                "to": "C",
                "short_instruction": "{{Dive}} to {{target}}"
            },
            {
                "from": "C",
                "to": "D",
                "short_instruction": "{{Surge}} to {{target}}"
            },
            {
                "from": "B",
                "to": "E",
                "short_instruction": "{{teleport travellersnecklace deserteagle}} to {{target}}"
            },
            {
                "from": "E",
                "to": "F",
                "short_instruction": "{{Surge}}-Step South-{{Surge}} to {{target}}"
            },
            {
                "from": "F",
                "to": "G",
                "short_instruction": "{{Dive}} to {{target}}"
            },
            {
                "from": "E",
                "to": "H",
                "short_instruction": "{{teleport desertamulet uzer}} to {{target}}"
            },
            {
                "from": "F",
                "to": "H",
                "short_instruction": "{{teleport desertamulet uzer}} to {{target}}"
            },
            {
                "from": "A",
                "to": [
                    {
                        "x": 3423,
                        "y": 3020,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "A",
                "to": [
                    {
                        "x": 3419,
                        "y": 3017,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "A",
                "to": [
                    {
                        "x": 3406,
                        "y": 3003,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "A",
                "to": [
                    {
                        "x": 3393,
                        "y": 2997,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "A",
                "to": [
                    {
                        "x": 3408,
                        "y": 2986,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "A",
                "to": [
                    {
                        "x": 3426,
                        "y": 2984,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "A",
                "to": [
                    {
                        "x": 3436,
                        "y": 2989,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "A",
                "to": [
                    {
                        "x": 3448,
                        "y": 3019,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "A",
                "to": [
                    {
                        "x": 3411,
                        "y": 3048,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "B",
                "to": [
                    {
                        "x": 3385,
                        "y": 3024,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "B",
                "to": [
                    {
                        "x": 3383,
                        "y": 3018,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "B",
                "to": [
                    {
                        "x": 3382,
                        "y": 3015,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "B",
                "to": [
                    {
                        "x": 3442,
                        "y": 2974,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "C",
                "to": [
                    {
                        "x": 3427,
                        "y": 2970,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "C",
                "to": [
                    {
                        "x": 3447,
                        "y": 2967,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "D",
                "to": [
                    {
                        "x": 3438,
                        "y": 2960,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "D",
                "to": [
                    {
                        "x": 3417,
                        "y": 2959,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "D",
                "to": [
                    {
                        "x": 3444,
                        "y": 2952,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "D",
                "to": [
                    {
                        "x": 3460,
                        "y": 3022,
                        "level": 0
                    },
                    {
                        "x": 3462,
                        "y": 3047,
                        "level": 0
                    },
                    {
                        "x": 3465,
                        "y": 3034,
                        "level": 0
                    }
                ],
                "short_instruction": "Check {{target}}"
            },
            {
                "from": "D",
                "to": [
                    {
                        "x": 3422,
                        "y": 3051,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "C",
                "to": [
                    {
                        "x": 3448,
                        "y": 3063,
                        "level": 0
                    },
                    {
                        "x": 3401,
                        "y": 3064,
                        "level": 0
                    }
                ],
                "short_instruction": "Check {{target}}"
            },
            {
                "from": "B",
                "to": [
                    {
                        "x": 3476,
                        "y": 3018,
                        "level": 0
                    },
                    {
                        "x": 3476,
                        "y": 3057,
                        "level": 0
                    }
                ],
                "short_instruction": "Check {{target}}"
            },
            {
                "from": "B",
                "to": [
                    {
                        "x": 3421,
                        "y": 2949,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "E",
                "to": [
                    {
                        "x": 3427,
                        "y": 3141,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "E",
                "to": [
                    {
                        "x": 3444,
                        "y": 3141,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "E",
                "to": [
                    {
                        "x": 3435,
                        "y": 3129,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "E",
                "to": [
                    {
                        "x": 3446,
                        "y": 3128,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "E",
                "to": [
                    {
                        "x": 3433,
                        "y": 3122,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "E",
                "to": [
                    {
                        "x": 3405,
                        "y": 3136,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "E",
                "to": [
                    {
                        "x": 3406,
                        "y": 3126,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "E",
                "to": [
                    {
                        "x": 3409,
                        "y": 3119,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "E",
                "to": [
                    {
                        "x": 3396,
                        "y": 3110,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "E",
                "to": [
                    {
                        "x": 3456,
                        "y": 3140,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "E",
                "to": [
                    {
                        "x": 3432,
                        "y": 3105,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "F",
                "to": [
                    {
                        "x": 3387,
                        "y": 3123,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "F",
                "to": [
                    {
                        "x": 3401,
                        "y": 3099,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "F",
                "to": [
                    {
                        "x": 3384,
                        "y": 3081,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "F",
                "to": [
                    {
                        "x": 3444,
                        "y": 3085,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "G",
                "to": [
                    {
                        "x": 3373,
                        "y": 3126,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "G",
                "to": [
                    {
                        "x": 3360,
                        "y": 3095,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "H",
                "to": [
                    {
                        "x": 3482,
                        "y": 3108,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "H",
                "to": [
                    {
                        "x": 3480,
                        "y": 3090,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "G",
                "to": [
                    {
                        "x": 3473,
                        "y": 3082,
                        "level": 0
                    }
                ],
                "short_instruction": "{{teleport desertamulet uzer}}, dig at {{target}}"
            },
            {
                "from": "H",
                "to": [
                    {
                        "x": 3499,
                        "y": 3104,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "H",
                "to": [
                    {
                        "x": 3505,
                        "y": 3093,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "H",
                "to": [
                    {
                        "x": 3502,
                        "y": 3050,
                        "level": 0
                    },
                    {
                        "x": 3510,
                        "y": 3041,
                        "level": 0
                    }
                ],
                "short_instruction": "Check {{target}}"
            }
        ],
        "root": {
            "where_to": "A",
            "children": [
                {
                    "key": {
                        "pulse": 2,
                        "different_level": false
                    },
                    "value": {
                        "where_to": "B",
                        "children": [
                            {
                                "key": {
                                    "pulse": 2,
                                    "different_level": false
                                },
                                "value": {
                                    "where_to": "C",
                                    "children": [
                                        {
                                            "key": {
                                                "pulse": 2,
                                                "different_level": false
                                            },
                                            "value": {
                                                "where_to": "D",
                                                "children": []
                                            }
                                        }
                                    ]
                                }
                            }
                        ]
                    }
                },
                {
                    "key": {
                        "pulse": 1,
                        "different_level": false
                    },
                    "value": {
                        "where_to": "B",
                        "children": [
                            {
                                "key": {
                                    "pulse": 1,
                                    "different_level": false
                                },
                                "value": {
                                    "where_to": "E",
                                    "children": [
                                        {
                                            "key": {
                                                "pulse": 1,
                                                "different_level": false
                                            },
                                            "value": {
                                                "where_to": "H",
                                                "children": []
                                            }
                                        },
                                        {
                                            "key": {
                                                "pulse": 2,
                                                "different_level": false
                                            },
                                            "value": {
                                                "where_to": "F",
                                                "children": [
                                                    {
                                                        "key": {
                                                            "pulse": 1,
                                                            "different_level": false
                                                        },
                                                        "value": {
                                                            "where_to": "H",
                                                            "children": []
                                                        }
                                                    },
                                                    {
                                                        "key": {
                                                            "pulse": 2,
                                                            "different_level": false
                                                        },
                                                        "value": {
                                                            "where_to": "G",
                                                            "children": []
                                                        }
                                                    }
                                                ]
                                            }
                                        }
                                    ]
                                }
                            }
                        ]
                    }
                }
            ]
        },
        "spot_ordering": [
            {
                "x": 3423,
                "y": 3020,
                "level": 0
            },
            {
                "x": 3419,
                "y": 3017,
                "level": 0
            },
            {
                "x": 3406,
                "y": 3003,
                "level": 0
            },
            {
                "x": 3393,
                "y": 2997,
                "level": 0
            },
            {
                "x": 3408,
                "y": 2986,
                "level": 0
            },
            {
                "x": 3426,
                "y": 2984,
                "level": 0
            },
            {
                "x": 3436,
                "y": 2989,
                "level": 0
            },
            {
                "x": 3448,
                "y": 3019,
                "level": 0
            },
            {
                "x": 3411,
                "y": 3048,
                "level": 0
            },
            {
                "x": 3385,
                "y": 3024,
                "level": 0
            },
            {
                "x": 3383,
                "y": 3018,
                "level": 0
            },
            {
                "x": 3382,
                "y": 3015,
                "level": 0
            },
            {
                "x": 3442,
                "y": 2974,
                "level": 0
            },
            {
                "x": 3427,
                "y": 2970,
                "level": 0
            },
            {
                "x": 3447,
                "y": 2967,
                "level": 0
            },
            {
                "x": 3438,
                "y": 2960,
                "level": 0
            },
            {
                "x": 3417,
                "y": 2959,
                "level": 0
            },
            {
                "x": 3444,
                "y": 2952,
                "level": 0
            },
            {
                "x": 3462,
                "y": 3047,
                "level": 0
            },
            {
                "x": 3465,
                "y": 3034,
                "level": 0
            },
            {
                "x": 3460,
                "y": 3022,
                "level": 0
            },
            {
                "x": 3422,
                "y": 3051,
                "level": 0
            },
            {
                "x": 3401,
                "y": 3064,
                "level": 0
            },
            {
                "x": 3448,
                "y": 3063,
                "level": 0
            },
            {
                "x": 3476,
                "y": 3057,
                "level": 0
            },
            {
                "x": 3476,
                "y": 3018,
                "level": 0
            },
            {
                "x": 3421,
                "y": 2949,
                "level": 0
            },
            {
                "x": 3427,
                "y": 3141,
                "level": 0
            },
            {
                "x": 3444,
                "y": 3141,
                "level": 0
            },
            {
                "x": 3435,
                "y": 3129,
                "level": 0
            },
            {
                "x": 3446,
                "y": 3128,
                "level": 0
            },
            {
                "x": 3433,
                "y": 3122,
                "level": 0
            },
            {
                "x": 3405,
                "y": 3136,
                "level": 0
            },
            {
                "x": 3406,
                "y": 3126,
                "level": 0
            },
            {
                "x": 3409,
                "y": 3119,
                "level": 0
            },
            {
                "x": 3396,
                "y": 3110,
                "level": 0
            },
            {
                "x": 3456,
                "y": 3140,
                "level": 0
            },
            {
                "x": 3432,
                "y": 3105,
                "level": 0
            },
            {
                "x": 3387,
                "y": 3123,
                "level": 0
            },
            {
                "x": 3401,
                "y": 3099,
                "level": 0
            },
            {
                "x": 3384,
                "y": 3081,
                "level": 0
            },
            {
                "x": 3444,
                "y": 3085,
                "level": 0
            },
            {
                "x": 3373,
                "y": 3126,
                "level": 0
            },
            {
                "x": 3360,
                "y": 3095,
                "level": 0
            },
            {
                "x": 3482,
                "y": 3108,
                "level": 0
            },
            {
                "x": 3480,
                "y": 3090,
                "level": 0
            },
            {
                "x": 3473,
                "y": 3082,
                "level": 0
            },
            {
                "x": 3499,
                "y": 3104,
                "level": 0
            },
            {
                "x": 3505,
                "y": 3093,
                "level": 0
            },
            {
                "x": 3502,
                "y": 3050,
                "level": 0
            },
            {
                "x": 3510,
                "y": 3041,
                "level": 0
            }
        ],
        "type": "scantree"
    },
    {
        "areas": [
            {
                "name": "A",
                "level": 0,
                "area": {
                    "topleft": {
                        "x": 2780,
                        "y": 3613
                    },
                    "botright": {
                        "x": 2780,
                        "y": 3613
                    }
                }
            },
            {
                "name": "B",
                "level": 0,
                "area": {
                    "topleft": {
                        "x": 2808,
                        "y": 10003
                    },
                    "botright": {
                        "x": 2808,
                        "y": 10002
                    }
                }
            },
            {
                "name": "D",
                "level": 0,
                "area": {
                    "topleft": {
                        "x": 2768,
                        "y": 10002
                    },
                    "botright": {
                        "x": 2768,
                        "y": 10002
                    }
                }
            },
            {
                "name": "C",
                "level": 0,
                "area": {
                    "topleft": {
                        "x": 2788,
                        "y": 9999
                    },
                    "botright": {
                        "x": 2788,
                        "y": 9998
                    }
                }
            }
        ],
        "assumes_meerkats": true,
        "clue": 366,
        "methods": [
            {
                "from": null,
                "to": "A",
                "short_instruction": "{{teleport fairyring AJR}} to {{target}}"
            },
            {
                "from": "A",
                "to": "B",
                "short_instruction": "Enter Cave to {{target}}"
            },
            {
                "from": "C",
                "to": "D",
                "short_instruction": "{{Surge}} to {{target}}"
            },
            {
                "from": "B",
                "to": "C",
                "short_instruction": "{{Dive}}/{{Surge}} to {{target}}"
            },
            {
                "from": "A",
                "to": [
                    {
                        "x": 2720,
                        "y": 9969,
                        "level": 0
                    },
                    {
                        "x": 2741,
                        "y": 9977,
                        "level": 0
                    },
                    {
                        "x": 2701,
                        "y": 9978,
                        "level": 0
                    },
                    {
                        "x": 2724,
                        "y": 9977,
                        "level": 0
                    },
                    {
                        "x": 2714,
                        "y": 9990,
                        "level": 0
                    },
                    {
                        "x": 2731,
                        "y": 9998,
                        "level": 0
                    },
                    {
                        "x": 2718,
                        "y": 10000,
                        "level": 0
                    },
                    {
                        "x": 2722,
                        "y": 10025,
                        "level": 0
                    },
                    {
                        "x": 2705,
                        "y": 10027,
                        "level": 0
                    },
                    {
                        "x": 2743,
                        "y": 9986,
                        "level": 0
                    }
                ],
                "short_instruction": "Check {{target}}"
            },
            {
                "from": "C",
                "to": [
                    {
                        "x": 2745,
                        "y": 10024,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "D",
                "to": [
                    {
                        "x": 2751,
                        "y": 9995,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "D",
                "to": [
                    {
                        "x": 2754,
                        "y": 10009,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "B",
                "to": [
                    {
                        "x": 2804,
                        "y": 10004,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "B",
                "to": [
                    {
                        "x": 2808,
                        "y": 10018,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "C",
                "to": [
                    {
                        "x": 2789,
                        "y": 10042,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "C",
                "to": [
                    {
                        "x": 2772,
                        "y": 10030,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "D",
                "to": [
                    {
                        "x": 2757,
                        "y": 10029,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            },
            {
                "from": "C",
                "to": [
                    {
                        "x": 2767,
                        "y": 10002,
                        "level": 0
                    }
                ],
                "short_instruction": "Dig at {{target}}"
            }
        ],
        "root": {
            "where_to": "A",
            "children": [
                {
                    "key": {
                        "pulse": 1,
                        "different_level": true
                    },
                    "value": {
                        "where_to": "B",
                        "children": [
                            {
                                "key": {
                                    "pulse": 1,
                                    "different_level": false
                                },
                                "value": {
                                    "where_to": "C",
                                    "children": [
                                        {
                                            "key": {
                                                "pulse": 2,
                                                "different_level": false
                                            },
                                            "value": {
                                                "where_to": "D",
                                                "children": []
                                            }
                                        }
                                    ]
                                }
                            },
                            {
                                "key": {
                                    "pulse": 2,
                                    "different_level": false
                                },
                                "value": {
                                    "where_to": "C",
                                    "children": []
                                }
                            }
                        ]
                    }
                }
            ]
        },
        "spot_ordering": [
            {
                "x": 2720,
                "y": 9969,
                "level": 0
            },
            {
                "x": 2741,
                "y": 9977,
                "level": 0
            },
            {
                "x": 2701,
                "y": 9978,
                "level": 0
            },
            {
                "x": 2724,
                "y": 9977,
                "level": 0
            },
            {
                "x": 2714,
                "y": 9990,
                "level": 0
            },
            {
                "x": 2731,
                "y": 9998,
                "level": 0
            },
            {
                "x": 2718,
                "y": 10000,
                "level": 0
            },
            {
                "x": 2722,
                "y": 10025,
                "level": 0
            },
            {
                "x": 2705,
                "y": 10027,
                "level": 0
            },
            {
                "x": 2745,
                "y": 10024,
                "level": 0
            },
            {
                "x": 2743,
                "y": 9986,
                "level": 0
            },
            {
                "x": 2751,
                "y": 9995,
                "level": 0
            },
            {
                "x": 2754,
                "y": 10009,
                "level": 0
            },
            {
                "x": 2804,
                "y": 10004,
                "level": 0
            },
            {
                "x": 2808,
                "y": 10018,
                "level": 0
            },
            {
                "x": 2789,
                "y": 10042,
                "level": 0
            },
            {
                "x": 2772,
                "y": 10030,
                "level": 0
            },
            {
                "x": 2757,
                "y": 10029,
                "level": 0
            },
            {
                "x": 2767,
                "y": 10002,
                "level": 0
            }
        ],
        "type": "scantree"
    },
]*/


//let raw: (method & indirected)[] = []

export default raw