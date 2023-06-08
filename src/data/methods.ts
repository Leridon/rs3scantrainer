import {indirected, method} from "../model/methods";


let raw: (method & indirected)[] = [

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
            "where": "A",
            "why": "",
            "children": [
                {
                    "key": 1,
                    "value": {
                        "where": "B",
                        "why": "",
                        "children": [
                            {
                                "key": 1,
                                "value": {
                                    "where": "C",
                                    "why": "",
                                    "children": [
                                        {
                                            "key": 1,
                                            "value": {
                                                "where": "D",
                                                "why": "",
                                                "children": [
                                                    {
                                                        "key": 1,
                                                        "value": {
                                                            "where": "E",
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
                    "key": 0,
                    "value": {
                        "where": "B",
                        "why": "",
                        "children": [
                            {
                                "key": 0,
                                "value": {
                                    "where": "F",
                                    "children": [
                                        {
                                            "key": 1,
                                            "value": {
                                                "where": "G",
                                                "children": [
                                                    {
                                                        "key": 1,
                                                        "value": {
                                                            "where": "H",
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
                }
            },
            {
                "name": "B",
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
            "where": "A",
            "children": [
                {
                    "key": 0,
                    "value": {
                        "where": "B",
                        "children": [
                            {
                                "key": 0,
                                "value": {
                                    "where": "C",
                                    "children": [
                                        {
                                            "key": 1,
                                            "value": {
                                                "where": "D",
                                                "children": []
                                            }
                                        },
                                        {
                                            "key": 0,
                                            "value": {
                                                "where": "E",
                                                "children": [
                                                    {
                                                        "key": 0,
                                                        "value": {
                                                            "where": "F",
                                                            "children": []
                                                        }
                                                    },
                                                    {
                                                        "key": 1,
                                                        "value": {
                                                            "where": "F",
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
                    "key": 1,
                    "value": {
                        "where": "C",
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
        "spot_ordering": [{"x": 2406, "y": 4428}, {"x": 2429, "y": 4431}, {"x": 2417, "y": 4444}, {
            "x": 2400,
            "y": 4441
        }, {"x": 2410, "y": 4460}, {"x": 2439, "y": 4460}, {"x": 2441, "y": 4428}, {"x": 2417, "y": 4470}, {
            "x": 2402,
            "y": 4466
        }, {"x": 2396, "y": 4457}, {"x": 2385, "y": 4447}, {"x": 2380, "y": 4421}, {"x": 2372, "y": 4467}, {
            "x": 2404,
            "y": 4406
        }, {"x": 2389, "y": 4405}, {"x": 2377, "y": 4410}, {"x": 2453, "y": 4471}, {"x": 2457, "y": 4443}, {
            "x": 2468,
            "y": 4439
        }, {"x": 2414, "y": 4378}, {"x": 2420, "y": 4381}, {"x": 2423, "y": 4372}],
        "assumes_meerkats": true,
        "areas": [{
            "name": "A",
            "area": {"topleft": {"x": 2412, "y": 4434}, "botright": {"x": 2412, "y": 4434}}
        }, {"name": "B", "area": {"topleft": {"x": 2410, "y": 4436}, "botright": {"x": 2410, "y": 4436}}}, {
            "name": "C",
            "area": {"topleft": {"x": 2420, "y": 4444}, "botright": {"x": 2420, "y": 4444}}
        }, {"name": "D", "area": {"topleft": {"x": 2409, "y": 4455}, "botright": {"x": 2409, "y": 4455}}}, {
            "name": "E",
            "area": {"topleft": {"x": 2398, "y": 4444}, "botright": {"x": 2398, "y": 4444}}
        }, {"name": "F", "area": {"topleft": {"x": 2447, "y": 4430}, "botright": {"x": 2447, "y": 4430}}}, {
            "name": "G",
            "area": {"topleft": {"x": 2405, "y": 4381}, "botright": {"x": 2405, "y": 4381}}
        }],
        "methods": [{"from": null, "to": "A", "short_instruction": "Fairy Ring to {{target}}."}, {
            "from": "A",
            "to": "F",
            "short_instruction": "Slayer Cape 7 to {{target}}."
        }, {"from": "F", "to": "G", "short_instruction": "Wicked hood cosmic altar tele"}, {
            "from": "A",
            "to": "B",
            "short_instruction": "Go to {{target}}."
        }, {"from": "B", "to": "C", "short_instruction": "{{dive}} to {{target}}."}, {
            "from": "C",
            "to": "D",
            "short_instruction": "{{surge}} to {{target}}."
        }, {"from": "C", "to": "D", "short_instruction": "{{surge}} to {{target}}."}, {
            "from": "D",
            "to": "E",
            "short_instruction": "Step and {{surge}} to {{target}}."
        }, {"from": "D", "to": "D", "short_instruction": "The spot is in the tunnels to {{target}} cosmic altar."}],
        "root": {
            "where": "A",
            "why": "",
            "children": [{
                "key": 0,
                "value": {
                    "where": "F",
                    "why": "",
                    "children": [{"key": 0, "value": {"where": "G", "why": "", "children": []}}]
                }
            }, {
                "key": 1,
                "value": {
                    "where": "B",
                    "why": "",
                    "children": [{
                        "key": 1,
                        "value": {
                            "where": "C",
                            "why": "",
                            "children": [{"key": 0, "value": {"where": "D", "why": "", "children": []}}, {
                                "key": 1,
                                "value": {
                                    "where": "D",
                                    "why": "",
                                    "children": [{
                                        "key": 1,
                                        "value": {"where": "E", "why": "", "children": []}
                                    }, {"key": 0, "value": {"where": "D", "why": "", "children": []}}]
                                }
                            }]
                        }
                    }]
                }
            }]
        }
    },
    {
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
                "short_instruction": "{{dive}} to {{target}}."
            },
            {
                "from": "B",
                "to": "C",
                "short_instruction": "Go to {{target}}."
            },
            {
                "from": "B",
                "to": "D",
                "short_instruction": "Go to {{target}}."
            },
            {
                "from": "B",
                "to": "G",
                "short_instruction": "Archaeology Teleport to {{target}}."
            },
            {
                "from": "D",
                "to": "E",
                "short_instruction": "Go to {{target}}."
            },
            {
                "from": "E",
                "to": "F",
                "short_instruction": "{{dive}} to {{target}}."
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
            }
        ],
        "root": {
            "where": "A",
            "why": "",
            "children": [
                {
                    "key": 1,
                    "value": {
                        "where": "B",
                        "why": "",
                        "children": [
                            {
                                "key": 1,
                                "value": {
                                    "where": "C",
                                    "why": "",
                                    "children": []
                                }
                            },
                            {
                                "key": 0,
                                "value": {
                                    "where": "G",
                                    "why": "",
                                    "children": []
                                }
                            }
                        ]
                    }
                },
                {
                    "key": 0,
                    "value": {
                        "where": "B",
                        "why": "",
                        "children": [
                            {
                                "key": 0,
                                "value": {
                                    "where": "D",
                                    "why": "",
                                    "children": [
                                        {
                                            "key": 0,
                                            "value": {
                                                "where": "E",
                                                "why": "",
                                                "children": [
                                                    {
                                                        "key": 1,
                                                        "value": {
                                                            "where": "F",
                                                            "why": "",
                                                            "children": []
                                                        }
                                                    },
                                                    {
                                                        "key": 0,
                                                        "value": {
                                                            "where": "H",
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
        "type": "scantree",
        "clue": 365,
        "spot_ordering": [{"x": 2711, "y": 5271, "level": 0}, {"x": 2723, "y": 5279, "level": 0}, {
            "x": 2731,
            "y": 5266,
            "level": 0
        }, {"x": 2740, "y": 5273, "level": 0}, {"x": 2711, "y": 5284, "level": 0}, {
            "x": 2747,
            "y": 5263,
            "level": 0
        }, {"x": 2729, "y": 5295, "level": 0}, {"x": 2717, "y": 5311, "level": 0}, {
            "x": 2730,
            "y": 5315,
            "level": 0
        }, {"x": 2704, "y": 5321, "level": 0}, {"x": 2732, "y": 5327, "level": 0}, {
            "x": 2704,
            "y": 5349,
            "level": 0
        }, {"x": 2698, "y": 5316, "level": 1}, {"x": 2700, "y": 5284, "level": 1}, {
            "x": 2701,
            "y": 5343,
            "level": 1
        }, {"x": 2704, "y": 5357, "level": 1}, {"x": 2734, "y": 5370, "level": 1}, {
            "x": 2747,
            "y": 5327,
            "level": 1
        }, {"x": 2738, "y": 5301, "level": 1}, {"x": 2739, "y": 5253, "level": 1}],
        "assumes_meerkats": true,
        "areas": [{
            "name": "_",
            "is_virtual": true
        }, {
            "name": "A",
            "area": {"topleft": {"x": 2721, "y": 5266}, "botright": {"x": 2724, "y": 5263}}
        }, {"name": "B", "area": {"topleft": {"x": 2726, "y": 5266}, "botright": {"x": 2726, "y": 5266}}}, {
            "name": "C",
            "area": {"topleft": {"x": 2712, "y": 5277}, "botright": {"x": 2715, "y": 5273}}
        }, {"name": "D", "area": {"topleft": {"x": 2713, "y": 5281}, "botright": {"x": 2714, "y": 5281}}}, {
            "name": "E",
            "area": {"topleft": {"x": 2713, "y": 5285}, "botright": {"x": 2714, "y": 5285}}
        }, {"name": "F", "area": {"topleft": {"x": 2696, "y": 5311}, "botright": {"x": 2701, "y": 5307}}}, {
            "name": "G",
            "area": {"topleft": {"x": 2701, "y": 5305}, "botright": {"x": 2701, "y": 5305}}
        }, {"name": "H", "area": {"topleft": {"x": 2701, "y": 5336}, "botright": {"x": 2701, "y": 5328}}}, {
            "name": "I",
            "area": {"topleft": {"x": 2707, "y": 5353}, "botright": {"x": 2707, "y": 5343}}
        }, {"name": "J", "area": {"topleft": {"x": 2707, "y": 5290}, "botright": {"x": 2712, "y": 5290}}}],
        "methods": [{
            "from": null,
            "to": "_",
            "short_instruction": "Does the scroll say to \"scan a different level\"?"
        }, {"from": null, "to": "F", "short_instruction": "Sphere 4 to {{target}}."}, {
            "from": "F",
            "to": "G",
            "short_instruction": "Go to {{target}}."
        }, {"from": "G", "to": "H", "short_instruction": "Go to {{target}}."}, {
            "from": "F",
            "to": "H",
            "short_instruction": "Go to {{target}}."
        }, {"from": "H", "to": "H", "short_instruction": "It's either 16 or 17 to {{target}} north"}, {
            "from": "H",
            "to": "I",
            "short_instruction": "Go to {{target}}."
        }, {"from": null, "to": "A", "short_instruction": "Go to {{target}}."}, {
            "from": "A",
            "to": "B",
            "short_instruction": "Go to {{target}}."
        }, {"from": "A", "to": "C", "short_instruction": "Go to {{target}}."}, {
            "from": "C",
            "to": "D",
            "short_instruction": "Up the stairs to {{target}}."
        }, {"from": "D", "to": "E", "short_instruction": "Down the stairs to {{target}}."}, {
            "from": "C",
            "to": "J",
            "short_instruction": "Go to {{target}}."
        }],
        "root": {
            "where": "A",
            "why": "",
            "children": [{
                "key": 3,
                "value": {
                    "where": "F",
                    "why": "",
                    "children": [{
                        "key": 1,
                        "value": {
                            "where": "G",
                            "why": "",
                            "children": [{"key": 1, "value": {"where": "H", "why": "", "children": []}}]
                        }
                    }, {
                        "key": 0,
                        "value": {
                            "where": "H",
                            "why": "",
                            "children": [{"key": 1, "value": {"where": "H", "why": "", "children": []}}, {
                                "key": 0,
                                "value": {"where": "I", "why": "", "children": []}
                            }]
                        }
                    }]
                }
            }, {
                "key": 4,
                "value": {
                    "where": "A",
                    "why": "",
                    "children": [{"key": 1, "value": {"where": "B", "why": "", "children": []}}, {
                        "key": 0,
                        "value": {
                            "where": "C",
                            "why": "",
                            "children": [{
                                "key": 0,
                                "value": {
                                    "where": "D",
                                    "why": "",
                                    "children": [{"key": 0, "value": {"where": "E", "why": "", "children": []}}]
                                }
                            }, {"key": 1, "value": {"where": "J", "why": "", "children": []}}]
                        }
                    }]
                }
            }]
        }
    }

    ,
    {
        "areas": [
            {
                "name": "A",
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
            "where": "A",
            "children": [
                {
                    "key": 0,
                    "value": {
                        "where": "B",
                        "children": [
                            {
                                "key": 0,
                                "value": {
                                    "where": "C",
                                    "children": [
                                        {
                                            "key": 0,
                                            "value": {
                                                "where": "D",
                                                "children": [
                                                    {
                                                        "key": 0,
                                                        "value": {
                                                            "where": "E",
                                                            "children": [
                                                                {
                                                                    "key": 0,
                                                                    "value": {
                                                                        "where": "F",
                                                                        "children": [
                                                                            {
                                                                                "key": 0,
                                                                                "value": {
                                                                                    "where": "G",
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
    }

    ,
    {
        "type": "scantree",
        "clue": 357,
        "spot_ordering": [{"x": 2884, "y": 9799, "level": 0}, {"x": 2904, "y": 9809, "level": 0}, {
            "x": 2875,
            "y": 9805,
            "level": 0
        }, {"x": 2892, "y": 9783, "level": 0}, {"x": 2895, "y": 9831, "level": 0}, {
            "x": 2907,
            "y": 9842,
            "level": 0
        }, {"x": 2888, "y": 9846, "level": 0}, {"x": 2933, "y": 9848, "level": 0}, {
            "x": 2938,
            "y": 9812,
            "level": 0
        }, {"x": 2945, "y": 9796, "level": 0}, {"x": 2952, "y": 9786, "level": 0}, {
            "x": 2926,
            "y": 9692,
            "level": 0
        }, {"x": 2907, "y": 9705, "level": 0}, {"x": 2907, "y": 9718, "level": 0}, {
            "x": 2905,
            "y": 9734,
            "level": 0
        }, {"x": 2914, "y": 9757, "level": 0}, {"x": 2936, "y": 9764, "level": 0}, {
            "x": 2895,
            "y": 9769,
            "level": 0
        }, {"x": 2949, "y": 9773, "level": 0}, {"x": 2968, "y": 9786, "level": 0}, {
            "x": 2858,
            "y": 9788,
            "level": 0
        }, {"x": 2870, "y": 9791, "level": 0}, {"x": 2835, "y": 9819, "level": 0}, {
            "x": 2832,
            "y": 9813,
            "level": 0
        }, {"x": 2822, "y": 9826, "level": 0}],
        "assumes_meerkats": true,
        "areas": [{
            "name": "A",
            "area": {"topleft": {"x": 2908, "y": 3423}, "botright": {"x": 2912, "y": 3419}},
            "is_far_away": true
        }, {"name": "B", "area": {"topleft": {"x": 2918, "y": 9702}, "botright": {"x": 2924, "y": 9700}}}, {
            "name": "C",
            "area": {"topleft": {"x": 2906, "y": 9722}, "botright": {"x": 2909, "y": 9719}}
        }, {"name": "D", "area": {"topleft": {"x": 2908, "y": 9742}, "botright": {"x": 2912, "y": 9742}}}, {
            "name": "E",
            "area": {"topleft": {"x": 2914, "y": 9742}, "botright": {"x": 2914, "y": 9742}}
        }, {"name": "F", "area": {"topleft": {"x": 2886, "y": 9795}, "botright": {"x": 2886, "y": 9795}}}, {
            "name": "G",
            "area": {"topleft": {"x": 2881, "y": 9833}, "botright": {"x": 2887, "y": 9828}}
        }],
        "methods": [{"from": null, "to": "A", "short_instruction": "Taverley teleport to {{target}}."}, {
            "from": "A",
            "to": "F",
            "short_instruction": "Use the dungeon entrance to {{target}}."
        }, {"from": "F", "to": "G", "short_instruction": "{{surge}}/{{dive}} north to {{target}}."}, {
            "from": "G",
            "to": "G",
            "short_instruction": "The spot is either 8 or 9."
        }, {
            "from": "F",
            "to": "F",
            "short_instruction": "The spot is to {{target}} very east, Go there."
        }, {"from": "A", "to": "B", "short_instruction": "Archaeology teleport 9,4 to {{target}}."}, {
            "from": "B",
            "to": "C",
            "short_instruction": "Go to {{target}}."
        }, {"from": "C", "to": "D", "short_instruction": "{{surge}}/Run to {{target}}."}, {
            "from": "C",
            "to": "D",
            "short_instruction": "{{surge}}/Run to {{target}}."
        }, {"from": "D", "to": "D", "short_instruction": "The spot is either 21 or 22"}, {
            "from": "D",
            "to": "E",
            "short_instruction": "Step to {{target}}."
        }, {"from": "E", "to": "E", "short_instruction": "The spot is in the north-western part of the dungeon"}],
        "root": {
            "where": "A",
            "why": "",
            "children": [{
                "key": 3,
                "value": {
                    "where": "F",
                    "why": "",
                    "children": [{
                        "key": 1,
                        "value": {
                            "where": "G",
                            "why": "",
                            "children": [{"key": 1, "value": {"where": "G", "why": "", "children": []}}]
                        }
                    }, {"key": 0, "value": {"where": "F", "why": "", "children": []}}]
                }
            }, {
                "key": 4,
                "value": {
                    "where": "B",
                    "why": "",
                    "children": [{
                        "key": 0,
                        "value": {
                            "where": "C",
                            "why": "",
                            "children": [{"key": 1, "value": {"where": "D", "why": "", "children": []}}, {
                                "key": 0,
                                "value": {
                                    "where": "D",
                                    "why": "",
                                    "children": [{
                                        "key": 1,
                                        "value": {"where": "D", "why": "", "children": []}
                                    }, {
                                        "key": 0,
                                        "value": {
                                            "where": "E",
                                            "why": "",
                                            "children": [{"key": 0, "value": {"where": "E", "why": "", "children": []}}]
                                        }
                                    }]
                                }
                            }]
                        }
                    }]
                }
            }]
        }
    }

    ,
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
                "short_instruction": "{{teleport davesspellbook ardougne}} spellbook to {{target}}."
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
            "where": "A",
            "why": "",
            "children": [
                {
                    "key": 1,
                    "value": {
                        "where": "B",
                        "why": "",
                        "children": [
                            {
                                "key": 1,
                                "value": {
                                    "where": "F",
                                    "children": []
                                }
                            }
                        ]
                    }
                },
                {
                    "key": 0,
                    "value": {
                        "where": "C",
                        "why": "",
                        "children": [
                            {
                                "key": 1,
                                "value": {
                                    "where": "D",
                                    "why": "",
                                    "children": [
                                        {
                                            "key": 1,
                                            "value": {
                                                "where": "E",
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
]


//let raw: (method & indirected)[] = []

export default raw