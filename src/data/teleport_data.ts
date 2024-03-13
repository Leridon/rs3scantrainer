import {direction} from "lib/runescape/movement";
import {Transportation} from "../lib/runescape/transportation";

const default_teleport_ticks: number = 3 // Shadow rip

const raw_data: Transportation.TeleportGroup[] = [
    {
        type: "teleports",
        id: "home",
        name: "Lodestone Network",
        img: {url: "homeport.png"}, animation_ticks: default_teleport_ticks,
        spots: [
            {
                id: "alkharid",

                img: {url: "lode_alkharid.png", width: 28},
                code: "A",
                name: "Al-Kharid",
                target: {origin: {x: 3297, y: 3184, level: 0}},
                facing: direction.south,
            },
            {
                id: "anachronia",
                name: "Anachronia",
                img: {url: "lode_anachronia.png", height: 28},
                code: "Alt+D",
                target: {origin: {x: 5431, y: 2338, level: 0}},
                facing: direction.south,
            },
            {
                id: "ardougne",
                img: {url: "lode_ardougne.png", height: 28},
                code: "Alt+A",
                target: {origin: {x: 2634, y: 3348, level: 0}},
                facing: direction.south,
                name: "Ardounge",
            },
            {
                id: "ashdale",
                name: "Ashdale",

                img: {url: "lode_ashdale.png", height: 28},
                code: "Shift+A",
                target: {origin: {x: 2474, y: 2708, level: 2}},
                facing: direction.south,
            },
            {
                id: "banditcamp",
                img: {url: "lode_bandit.png", width: 28},
                code: "Alt+B",
                target: {origin: {x: 3214, y: 2954, level: 0}},
                facing: direction.south,
                name: "Bandit Camp",
            },
            {
                id: "burthorpe",
                img: {url: "lode_burthorpe.png", height: 28},
                code: "B",
                target: {origin: {x: 2899, y: 3544, level: 0}},
                facing: direction.south,
                name: "Burthope",
            },
            {
                id: "canifis",
                img: {url: "lode_canifis.png", height: 28},
                code: "Alt+C",
                target: {origin: {x: 3517, y: 3515, level: 0}},
                facing: direction.south,
                name: "Canifis",
            },
            {
                id: "catherby",
                img: {url: "lode_catherby.png", height: 28},
                code: "C",
                target: {origin: {x: 2811, y: 3449, level: 0}},
                facing: direction.south,
                name: "Cathery",
            },
            {
                id: "draynor",
                img: {url: "lode_draynor.png", height: 28},
                code: "D",
                target: {origin: {x: 3105, y: 3298, level: 0}},
                facing: direction.south,
                name:
                    "Draynor",
            }
            ,
            {
                id: "eaglespeak",
                img: {url: "lode_eagles.png", height: 28},
                code: "Alt+E",
                target: {origin: {x: 2366, y: 3479, level: 0}},
                facing: direction.south,
                name: "Eagle's Peak",
            },
            {
                id: "edgeville",
                img: {url: "lode_edgeville.png", height: 28},
                code: "E",
                target: {origin: {x: 3067, y: 3505, level: 0}},
                facing: direction.south,
                name: "Edgeville",
            },
            {
                id: "falador",
                img: {url: "lode_falador.png", height: 28},
                code: "F",
                target: {origin: {x: 2967, y: 3403, level: 0}},
                facing: direction.south,
                name: "Falador",
            },
            {
                id: "fremmenik",
                img: {url: "lode_fremennik.png", height: 28},
                code: "Alt+F",
                target: {origin: {x: 2712, y: 3677, level: 0}},
                facing: direction.south,
                name: "Fremmenik Province",
            },
            {
                id: "karamja",
                img: {url: "lode_karamja.png", height: 28},
                code: "K",
                target: {origin: {x: 2761, y: 3147, level: 0}},
                facing: direction.south,
                name: "Karamja",
            },
            {
                id: "lumbridge",
                img: {url: "lode_lumbridge.png", height: 28},
                code: "L",
                target: {origin: {x: 3233, y: 3221, level: 0}},
                facing: direction.south,
                name: "Lumbridge",
            },
            {
                id: "lunarisle",
                img: {url: "lode_lunar.png", height: 28},
                code: "Alt+L",
                target: {origin: {x: 2085, y: 3914, level: 0}},
                facing: direction.south,
                name: "Lunar Isle",
            },
            {
                id: "ooglog",
                img: {url: "lode_ooglog.png", height: 28},
                code: "O",
                target: {origin: {x: 2532, y: 2871, level: 0}},
                facing: direction.south,
                name: "Oo'glog",
            },
            {
                id: "portsarim",
                img: {url: "lode_portsarim.png", height: 28},
                code: "P",
                target: {origin: {x: 3011, y: 3215, level: 0}},
                facing: direction.south,
                name: "Port Sarim",
            },
            {
                id: "prifddinas",
                img: {url: "lode_prifddinas.png", height: 28},
                code: "Alt+P",
                target: {origin: {x: 2208, y: 3360, level: 1}},
                facing: direction.south,
                name: "Prifddinas",
            },
            {
                id: "seersvillage",
                img: {url: "lode_seers.png", height: 28},
                code: "S",
                target: {origin: {x: 2689, y: 3482, level: 0}},
                facing: direction.south,
                name: "Seers' Village",
            }
            , {
                id: "taverley",

                img: {url: "lode_taverley.png", height: 28},
                code: "T",
                target: {origin: {"x": 2878, "y": 3442, "level": 0}},
                facing: direction.south,
                name: "Taverley",
            },
            {
                id: "tirannwn",
                img: {url: "lode_tirannwn.png", height: 28},
                code: "Alt+T",
                target: {origin: {x: 2254, y: 3149, level: 0}},
                facing: direction.south,
                name: "Tirannwn",
            },
            {
                id: "varrock",
                img: {url: "lode_varrock.png", height: 28},
                code: "V",
                target: {origin: {x: 3214, y: 3376, level: 0}},
                facing: direction.south,
                name: "Varrock",
            },
            {
                id: "wilderness",

                img: {url: "lode_wilderness.png", height: 28},
                code: "W",
                target: {origin: {x: 3143, y: 3635, level: 0}},
                facing: direction.south,
                name: "Wilderness",
            },
            {
                id: "yanille",
                img: {url: "lode_yanille.png", height: 28},
                code: "Y",
                target: {origin: {x: 2529, y: 3094, level: 0}},
                facing: direction.south,
                name: "Yanille",
            }
            ,
            {
                id: "menaphos",
                img: {url: "lode_menaphos.png", height: 28},
                code: "M",
                target: {origin: {x: 3216, y: 2716, level: 0}},
                facing: direction.south,
                name: "Menaphos",
            },
            {
                id: "fortforinthry",
                img: {url: "lode_fortforinthry.png", height: 28},
                code: "Alt+W",
                target: {origin: {x: 3298, y: 3525, level: 0}},
                facing: direction.south,
                name: "Fort Forinthry",
            },
            {
                id: "cityofum",
                img: {url: "lode_um.png", height: 28},
                code: "U",
                target: {origin: {x: 1084, y: 1768, level: 1}},
                facing: direction.east,
                name: "City of Um",
            },
        ],
        access: [
            {
                id: "map", type: "spellbook",
                name: "Lodestone Network Map",
                menu_ticks: 1
            }, {
                id: "spellbook",
                type: "spellbook",
                name: "Any Spellbook",
                menu_ticks: 0
            }
        ]
    },
    {
        type: "teleports",
        id: "normalspellbook",
        name: "Normal Spellbook",
        img: {url: ""},
        menu_ticks: 0,
        animation_ticks: default_teleport_ticks,
        spots: [
            {
                id: "camelot",
                target: {"origin": {"x": 2755, "y": 3476, "level": 0}, "size": {"x": 5, "y": 5}, "data": "/n3/AQ=="},
                img: {url: "tele-cam.png"},
                name: "Camelot",
            },
            {
                id: "camelot-seers",
                target: {"origin": {"x": 2704, "y": 3481, "level": 0}, "size": {"x": 5, "y": 5}},
                img: {url: "tele-cam-seers.png"},
                name: "Camelot (Seer's Village)",
            },
            {
                id: "varrock",
                target: {"origin": {"x": 3210, "y": 3432, "level": 0}, "size": {"x": 5, "y": 5}},
                img: {url: "tele-var.png"},
                name: "Varrock",
            },
            {
                id: "varrock-ge",
                target: {"origin": {"x": 3162, "y": 3462, "level": 0}, "size": {"x": 2, "y": 5}},
                img: {url: "tele-var-ge.png"},
                name: "Varrock (Grand Exchange)",
            },
            {
                id: "varrock-church",
                target: {"origin": {"x": 3245, "y": 3478, "level": 0}, "size": {"x": 4, "y": 5}},
                img: {url: "tele-var-church.png"},
                name: "Varrock (Church)",
            },
            {
                id: "watchtower",
                target: {"origin": {"x": 2547, "y": 3111, "level": 2}, "size": {"x": 4, "y": 4}, "data": "88w="},
                img: {url: "tele-watch.png"},
                name: "Watchtower",
            },
            {
                id: "watchtower-yanille",
                target: {"origin": {"x": 2573, "y": 3087, "level": 0}, "size": {"x": 5, "y": 5}},
                img: {url: "tele-watch-center.png"},
                name: "Watchtower (Yanille)",
            },
            {
                id: "lumbridge",
                target: {"origin": {"x": 3217, "y": 3246, "level": 0}, "size": {"x": 5, "y": 5}, "data": "/3//AQ=="},
                img: {url: "tele-lum.png"},
                name: "Lumbridge",
            },
            {
                id: "falador",
                target: {"origin": {"x": 2963, "y": 3376, "level": 0}, "size": {"x": 5, "y": 5}},
                img: {url: "tele-fal.png"},
                name: "Falador",
            },
            {
                id: "ardougne",
                target: {"origin": {"x": 2659, "y": 3300, "level": 0}, "size": {"x": 5, "y": 5}},
                img: {url: "tele-ard.png"},
                name: "Ardougne",
            },
            {
                id: "southfeldiphills",
                target: {"origin": {"x": 2411, "y": 2845, "level": 0}, "size": {"x": 5, "y": 5}, "data": "nP//AQ=="},
                img: {url: "tele-mob.png"},
                name: "South Feldip Hills",
            },
            {
                id: "taverley",
                target: {"origin": {"x": 2910, "y": 3421, "level": 0}, "size": {"x": 5, "y": 5}},
                img: {url: "tele-taverley.png"},
                name: "Taverley",
            },
            {
                id: "godwars",
                target: {"origin": {"x": 2908, "y": 3712, "level": 0}, "size": {"x": 3, "y": 4}},
                img: {url: "tele-god.png"},
                name: "God Wars",
            },
            {
                id: "trollheim",
                target: {"origin": {"x": 2880, "y": 3666, "level": 0}, "size": {"x": 5, "y": 5}, "data": "//v/AQ=="},
                img: {url: "tele-troll.png"},
                name: "Trollheim",
            },
            {
                id: "apeatoll",
                target: {"origin": {"x": 2795, "y": 2797, "level": 1}, "size": {"x": 5, "y": 3}},
                img: {url: "tele-ape.png"},
                name: "Ape Atoll",
            },
            {
                id: "mazcab",
                target: {"origin": {"x": 4314, "y": 817, "level": 0}, "size": {"x": 5, "y": 5}},
                img: {url: "tele-mazcab.png"},
                name: "Mazcab",
            },
        ],
        access: [{
            id: "spellbook",
            type: "spellbook",
            name: "Normal Spellbook"
        }] // TODO: Tablets
    },
    {
        type: "teleports",
        id: "ancientspellook",
        name: "Ancient Spellbook",
        img: {url: ""},
        menu_ticks: 0,
        animation_ticks: default_teleport_ticks,
        spots: [
            {
                id: "senntisten",
                target: {"origin": {"x": 3375, "y": 3400, "level": 0}, "size": {"x": 5, "y": 5}},
                img: {url: "tele-senntisten.png"},
                name: "Senntisten (Dig site)",
            },
            {
                id: "kharyll",
                target: {"origin": {"x": 3499, "y": 3482, "level": 0}, "size": {"x": 5, "y": 4}, "data": "/38E"},
                img: {url: "tele-kharyrll.png"},
                name: "Kharyrll",
            },
            {
                id: "lassar",
                target: {"origin": {"x": 3002, "y": 3468, "level": 0}, "size": {"x": 5, "y": 5}},
                img: {url: "tele-lassar.png"},
                name: "Lassar",
            },
            {
                id: "dareeyak",
                target: {"origin": {"x": 2966, "y": 3694, "level": 0}, "size": {"x": 5, "y": 5}, "data": "///PAA=="},
                img: {url: "tele-dareeyak.png"},
                name: "Dareeyak",
            },
            {
                id: "carallaner",
                target: {"origin": {"x": 3220, "y": 3664, "level": 0}, "size": {"x": 5, "y": 5}, "data": "zv9zAA=="},
                img: {url: "tele-carrallaner.png"},
                name: "Carrallanger",
            },
            {
                id: "annakarl",
                target: {"origin": {"x": 3286, "y": 3884, "level": 0}, "size": {"x": 4, "y": 5}, "data": "//cP"},
                img: {url: "tele-annakarl.png"},
                name: "Annakarl",
            },
            {
                id: "ghorrock",
                target: {"origin": {"x": 2974, "y": 3870, "level": 0}, "size": {"x": 5, "y": 5}},
                img: {url: "tele-ghorrock.png"},
                name: "Ghorrock",
            },
        ],
        access: [{
            id: "spellbook",
            type: "spellbook",
            name: "Ancient Spellbook" // TODO: Tablets
        }]
    },

    {
        type: "teleports",
        id: "lunarspellbook",
        name: "Lunar Spellbook",
        menu_ticks: 0,
        animation_ticks: default_teleport_ticks,
        spots: [
            {
                id: "moonclan",
                target: {"origin": {"x": 2112, "y": 3913, "level": 0}, "size": {"x": 4, "y": 5}, "data": "//8G"},
                img: {url: "tele-moonclan.png"},
                name: "Moonclan",
            },
            {
                id: "ourania",
                target: {"origin": {"x": 2465, "y": 3243, "level": 0}, "size": {"x": 5, "y": 5}, "data": "3nv/AQ=="},
                img: {url: "tele-ourania.png"},
                name: "Ourania Altar",
            },
            {
                id: "southfalador",
                target: {"origin": {"x": 3053, "y": 3308, "level": 0}, "size": {"x": 5, "y": 5}, "data": "+f9PAQ=="},
                img: {url: "tele-southfalador.png"},
                name: "South Falador",
            },
            {
                id: "waterbirth",
                target: {"origin": {"x": 2544, "y": 3754, "level": 0}, "size": {"x": 5, "y": 5}},
                img: {url: "tele-waterbirth.png"},
                name: "Waterbirth",
            },
            {
                id: "barbarian",
                target: {"origin": {"x": 2541, "y": 3567, "level": 0}, "size": {"x": 5, "y": 5}},
                img: {url: "tele-barbarian.png"},
                name: "Barbarian Outpost",
            },
            {
                id: "northardougne",
                target: {"origin": {"x": 2663, "y": 3373, "level": 0}, "size": {"x": 4, "y": 5}, "data": "ZnYP"},
                img: {url: "tele-northardougne.png"},
                name: "North Ardougne",
            },
            {
                id: "khazard",
                target: {"origin": {"x": 2634, "y": 3165, "level": 0}, "size": {"x": 5, "y": 5}, "data": "8P//AQ=="},
                img: {url: "tele-khazard.png"},
                name: "Port Khazard",
            },
            {
                id: "fishing",
                target: {"origin": {"x": 2611, "y": 3381, "level": 0}, "size": {"x": 5, "y": 5}},
                img: {url: "tele-fishing.png"},
                name: "Fishing Guild",
            },
            {
                id: "catherby",
                target: {"origin": {"x": 2788, "y": 3450, "level": 0}, "size": {"x": 5, "y": 5}, "data": "/v/vAQ=="},
                img: {url: "tele-catherby.png"},
                name: "Catherby",
            },
            {
                id: "iceplateu",
                target: {"origin": {"x": 2973, "y": 3936, "level": 0}, "size": {"x": 4, "y": 5}},
                img: {url: "tele-iceplateau.png"},
                name: "Ice Plateau",
            },
            {
                id: "trollheim",
                target: {"origin": {"x": 2815, "y": 3674, "level": 0}, "size": {"x": 5, "y": 5}},
                img: {url: "tele-trollheim.png"},
                name: "Trollheim Farm",
            },
        ],
        access: [{
            id: "spellbook",
            type: "spellbook",
            name: "Lunar Spellbook"
        }]
    },
    /*
            {
                type: "teleports",
                id: "greenteleport",
                name: "Green Teleports",
                img: {url: ""},
                spots: [
                    {
                        id: "monastery",
                        target: {origin: {x: 2606, y: 3217, level: 0}},
                        img: {url: "monastery.png"},
                        name: "Kandarin Monastery",
                        menu_ticks: 0,
                        animation_ticks: 5
                    },
                    {
                        id: "wars",
                        target: {origin: {x: 3294, y: 10127, level: 0}},
                        img: {url: "warsretreat.png"},
                        name: "Wars Retreat",
                        menu_ticks: 0,
                        animation_ticks: default_teleport_ticks
                    },
                    {
                        id: "manorfarm",
                        target: {origin: {x: 2670, y: 3372, level: 0}},
                        img: {url: "pof.png"},
                        name: "Manor Farm",
                        menu_ticks: 0,
                        animation_ticks: 5
                    },
                    {
                        id: "maxguild",
                        target: {origin: {x: 2276, y: 3313, level: 1}},
                        img: {url: "max.png"},
                        name: "Max guild",
                        menu_ticks: 0,
                        animation_ticks: default_teleport_ticks
                    },
                    {
                        id: "skelettalhorror",
                        target: {origin: {x: 3362, y: 3503, level: 0}},
                        img: {url: "skhorror.png"},
                        name: "Skeletal Horror",
                        menu_ticks: 0,
                        animation_ticks: default_teleport_ticks
                    },
                ],
                access: [{
                    type: "spellbook",
                    name: "Any"
                }]
            },
            {
                type: "teleports",
                id: "houseteleports", // house teleport timings assume the spell, tablets are two ticks slower
                name: "House Teleports",
                img: {url: "modhouse.gif"},
                spots: [
                    {
                        id: "rimmington",
                        target: {origin: {x: 2953, y: 3223, level: 0}},
                        name: "Rimmington house",
                        code: "1",
                        menu_ticks: 0,
                        animation_ticks: default_teleport_ticks
                    },
                    {
                        id: "taverley",
                        target: {origin: {x: 2883, y: 3452, level: 0}},
                        name: "Taverley house",
                        code: "2",
                        menu_ticks: 0,
                        animation_ticks: default_teleport_ticks
                    },
                    {
                        id: "pollnivneach",
                        target: {origin: {x: 3339, y: 3001, level: 0}},
                        name: "Pollnivneach house",
                        code: "3",
                        menu_ticks: 0,
                        animation_ticks: default_teleport_ticks
                    },
                    {
                        id: "relekka",
                        target: {origin: {x: 2670, y: 3632, level: 0}},
                        name: "Rellekka house",
                        code: "4",
                        menu_ticks: 0,
                        animation_ticks: default_teleport_ticks
                    },
                    {
                        id: "brimhaven",
                        target: {origin: {x: 2757, y: 3178, level: 0}},
                        name: "Brimhaven house",
                        code: "5",
                        menu_ticks: 0,
                        animation_ticks: default_teleport_ticks
                    },
                    {
                        id: "yanille",
                        target: {origin: {x: 2544, y: 3095, level: 0}},
                        name: "Yanille house",
                        code: "6",
                        menu_ticks: 0,
                        animation_ticks: default_teleport_ticks
                    },
                    {
                        id: "trollheim",
                        target: {origin: {x: 2890, y: 3675, level: 0}},
                        name: "Trollheim house tablet",
                        code: "7",
                        menu_ticks: 0,
                        animation_ticks: default_teleport_ticks
                    },
                    {
                        id: "prifddinas",
                        target: {origin: {x: 2166, y: 3335, level: 0}},
                        name: "Prifddinas house tablet",
                        code: "8",
                        menu_ticks: 0,
                        animation_ticks: default_teleport_ticks
                    },
                    {
                        id: "menaphos",
                        target: {origin: {x: 3123, y: 2632, level: 0}},
                        name: "Menaphos house tablet",
                        code: "0,1",
                        menu_ticks: 0,
                        animation_ticks: default_teleport_ticks
                    },
                ],
                access: [
                    {
                        type: "spellbook",
                        name: "Normal"
                    },
                    {
                        type: "item",
                        name: {
                            kind: "item",
                            name: "House Teleport Tablet"
                        }
                    },
                ]
            },
            {
                type: "teleports",
                id: "teleportscrolls",  // Timings assume a menu tick from globetrotter gloves
                name: "Teleport Scrolls",
                img: {url: ""},
                spots: [
                    {
                        id: "grandexchange",
                        target: {origin: {x: 3160, y: 3458, level: 0}},
                        img: {url: "scroll-grandexchange.png"},
                        name: "Grand Exchange",
                        code: "1",
                        menu_ticks: 1,
                        animation_ticks: 5
                    },
                    {
                        id: "banditcamp",
                        target: {origin: {x: 3169, y: 2981, level: 0}},
                        img: {url: "scroll-banditcamp.png"},
                        name: "Bandit Camp",
                        code: "2",
                        menu_ticks: 1,
                        animation_ticks: 5
                    },
                    {
                        id: "clocktower",
                        target: {origin: {x: 2593, y: 3253, level: 0}},
                        img: {url: "scroll-clocktower.png"},
                        name: "Clocktower",
                        code: "3",
                        menu_ticks: 1,
                        animation_ticks: 5
                    },
                    {
                        id: "gutanoth",
                        target: {origin: {x: 2523, y: 3062, level: 0}},
                        img: {url: "scroll-gutanoth.png"},
                        name: "Gu'Tanoth",
                        code: "4",
                        menu_ticks: 1,
                        animation_ticks: 5
                    },
                    {
                        id: "lighthouse",
                        target: {origin: {x: 2512, y: 3632, level: 0}},
                        img: {url: "scroll-lighthouse.png"},
                        name: "Lighthouse",
                        code: "5",
                        menu_ticks: 1,
                        animation_ticks: 5
                    },
                    {
                        id: "fortforinthry",
                        target: {origin: {x: 3302, y: 3550, level: 0}},
                        img: {url: "scroll-fortforinthry.png"},
                        name: "Forintry Teleport",
                        code: "6",
                        menu_ticks: 1,
                        animation_ticks: 5
                    },
                    {
                        id: "miscellania",
                        target: {origin: {x: 2514, y: 3862, level: 0}},
                        img: {url: "scroll-miscellania.png"},
                        name: "Miscellania",
                        code: "7",
                        menu_ticks: 1,
                        animation_ticks: 5
                    },
                    {
                        id: "phoenixlair",
                        target: {origin: {x: 2293, y: 3620, level: 0}},
                        img: {url: "scroll-phoenixlair.png"},
                        name: "Phoenix Lair",
                        code: "8",
                        menu_ticks: 1,
                        animation_ticks: 5
                    },
                    {
                        id: "pollnivneach",
                        target: {origin: {"x": 3359, "y": 2968, "level": 0}},
                        img: {url: "scroll-pollnivneach.png"},
                        name: "Pollnivneach",
                        code: "9",
                        menu_ticks: 1,
                        animation_ticks: 5
                    },
                    {
                        id: "tabwowannai",
                        target: {origin: {x: 2801, y: 3085, level: 0}},
                        img: {url: "scroll-taibwowannai.png"},
                        name: "Tai Bwo Wannai",
                        code: "0",
                        menu_ticks: 1,
                        animation_ticks: 5
                    },

                ]
            },
            {
                type: "teleports",
                id: "teleportseed",
                name: "Teleport Seed",
                img: {url: "crystal.gif"},
                spots: [
                    {
                        id: "lletya",
                        target: {origin: {x: 2335, y: 3171, level: 0}},
                        name: "Lletya",
                        code: "1",
                        menu_ticks: 1,
                        animation_ticks: default_teleport_ticks
                    },
                    {
                        id: "amlodd",
                        target: {origin: {x: 2155, y: 3383, level: 1}},
                        name: "Amlodd",
                        code: "3",
                        menu_ticks: 1,
                        animation_ticks: default_teleport_ticks
                    },
                    {
                        id: "cadarn",
                        target: {origin: {x: 2261, y: 3339, level: 1}},
                        name: "Cadarn",
                        code: "4",
                        menu_ticks: 1,
                        animation_ticks: default_teleport_ticks
                    },
                    {
                        id: "crwys",
                        target: {origin: {x: 2261, y: 3383, level: 1}},
                        name: "Crwys",
                        code: "5",
                        menu_ticks: 1,
                        animation_ticks: default_teleport_ticks
                    },
                    {
                        id: "hefin",
                        target: {origin: {x: 2186, y: 3411, level: 1}},
                        name: "Hefin",
                        code: "6",
                        menu_ticks: 1,
                        animation_ticks: default_teleport_ticks
                    },
                    {
                        id: "iorwerth",
                        target: {origin: {x: 2185, y: 3311, level: 1}},
                        name: "Iorwerth",
                        code: "7",
                        menu_ticks: 1,
                        animation_ticks: default_teleport_ticks
                    },
                    {
                        id: "Ithell",
                        target: {origin: {x: 2155, y: 3339, level: 1}},
                        name: "Ithell",
                        code: "8",
                        menu_ticks: 1,
                        animation_ticks: default_teleport_ticks
                    },
                    {
                        id: "Meilyr",
                        target: {origin: {x: 2230, y: 3411, level: 1}},
                        name: "Meilyr",
                        code: "9",
                        menu_ticks: 1,
                        animation_ticks: default_teleport_ticks
                    },
                    {
                        id: "Trahaearn",
                        target: {origin: {x: 2231, y: 3311, level: 1}},
                        name: "Trahaearn",
                        code: "0",
                        menu_ticks: 1,
                        animation_ticks: default_teleport_ticks
                    },
                ]
            },
            {
                type: "teleports",
                id: "menaphostablets",
                name: "Menaphos Tablets",
                img: {url: ""},
                spots: [
                    {
                        id: "imperial",
                        target: {origin: {x: 3177, y: 2730, level: 1}},
                        img: {url: "imperialdistrict.gif"},
                        name: "Imperial district",
                        code: "1",
                        menu_ticks: 0,
                        animation_ticks: default_teleport_ticks + 2
                    },
                    {
                        id: "merchant",
                        target: {origin: {x: 3208, y: 2784, level: 1}},
                        img: {url: "merchantdistrict.gif"},
                        name: "Merchant district",
                        code: "2",
                        menu_ticks: 0,
                        animation_ticks: default_teleport_ticks + 2
                    },
                    {
                        id: "port",
                        target: {origin: {x: 3187, y: 2654, level: 1}},
                        img: {url: "portdistrict.gif"},
                        name: "Port district",
                        code: "3",
                        menu_ticks: 0,
                        animation_ticks: default_teleport_ticks + 2
                    },
                    {
                        id: "worker",
                        target: {origin: {x: 3154, y: 2800, level: 1}},
                        img: {url: "workerdistrict.gif"},
                        name: "Worker district",
                        code: "4",
                        menu_ticks: 0,
                        animation_ticks: default_teleport_ticks + 2
                    },
                    {
                        id: "sophanem",
                        target: {origin: {x: 3291, y: 2710, level: 1}},
                        img: {url: "sophanemdungeon.gif"},
                        name: "Sophanem Dungeon",
                        code: "5",
                        menu_ticks: 0,
                        animation_ticks: default_teleport_ticks + 2
                    },
                ]
            },*/
    {
        type: "teleports",
        id: "spirittree",
        name: "Spirit Tree",
        img: {url: "spirittree.png"},
        animation_ticks: 7,
        spots: [
            {
                id: "village",
                target: {origin: {x: 2542, y: 3169, level: 0}},
                name: "Tree Gnome Village",
                code: "1",
            },
            {
                id: "stronghold",
                target: {origin: {x: 2462, y: 3444, level: 0}},
                name: "Tree Gnome Stronghold",
                code: "2",
            },
            {
                id: "battlefield",
                target: {origin: {"x": 2557, "y": 3259, "level": 0}},
                name: "Battlefield of Khazard",
                code: "3",
            },
            {
                id: "grandexchange",
                target: {origin: {"x": 3187, "y": 3507, "level": 0}},
                name: "Grand Exchange",
                code: "4",
            },
            {
                id: "feldiphills",
                target: {origin: {"x": 2416, "y": 2851, "level": 0}},
                name: "South Feldip Hills",
                code: "5",
            },
            {
                id: "sarim",
                target: {origin: {"x": 3058, "y": 3257, "level": 0}},
                name: "Port Sarim",
                code: "6",
            },
            {
                id: "etceteria",
                target: {origin: {"x": 2613, "y": 3855, "level": 0}},
                name: "Etceteria",
                code: "7",
            },
            {
                id: "brimhaven",
                target: {origin: {"x": 2800, "y": 3203, "level": 0}},
                name: "Brimhaven",
                code: "8",
            },
            {
                id: "poisonwaste",
                target: {origin: {"x": 2338, "y": 3109, "level": 0}},
                name: "Poison Waste",
                code: "9",
            },
            {
                id: "prifddinas",
                target: {origin: {"x": 2275, "y": 3371, "level": 1}},
                name: "Prifddinas",
                code: "0",
            },

        ],
        access: [{
            id: "spirittreererooter",
            type: "item",
            name: {
                kind: "item",
                name: "Spirit tree re-rooter"
            },
            action_name: "Teleport",
            menu_ticks: 2,
        }]
    },
    {
        type: "teleports",
        id: "fairyring",
        name: "Fairy Ring", // assume favorite for menu times
        img: {url: "fairyring.gif"},
        animation_ticks: 7,
        spots: [
            {
                id: "AIP",
                target: {origin: {x: 2412, y: 4434, level: 0}},
                code: "",
                name: "Zanaris",
            },
            {
                id: "AIQ",
                target: {origin: {x: 2996, y: 3114, level: 0}},
                code: "AIQ",
                name: "Asgarnia: Mudskipper Point",
            },
            {
                id: "AIR",
                target: {origin: {x: 2700, y: 3247, level: 0}},
                code: "AIR",
                name: "Islands: South of Witchhaven",
            },
            {
                id: "AIS",
                target: {origin: {x: 2030, y: 5982, level: 0}},
                code: "AIS",
                name: "Other realms: Naragi homeworld",
            },
            {
                id: "AJQ",
                target: {origin: {x: 2735, y: 5221, level: 0}},
                code: "AJQ",
                name: "Dungeons: Dark cave south of Dorgesh-Kaan",
            },
            {
                id: "AJR",
                target: {origin: {x: 2780, y: 3613, level: 0}},
                code: "AJR",
                name: "Kandarin: Slayer cave south-east of Relekka",
            },
            {
                id: "AJS",
                target: {origin: {x: 2500, y: 3896, level: 0}},
                code: "AJS",
                name: "Islands: Penguins near Miscellania",
            },
            {
                id: "AKQ",
                target: {origin: {x: 2319, y: 3619, level: 0}},
                code: "AKQ",
                name: "Piscatoris Hunter area",
            },
            {
                id: "AKS",
                target: {origin: {x: 2571, y: 2956, level: 0}},
                code: "AKS",
                name: "Feldip Hills: Jungle Hunter area",
            },
            {
                id: "ALP",
                target: {origin: {x: 2473, y: 3028, level: 0}},
                code: "ALP",
                name: "Feldip Hills: Near Gu´Tanoth",
            },
            {
                id: "ALQ",
                target: {origin: {x: 3597, y: 3495, level: 0}},
                code: "ALQ",
                name: "Morytania: Haunted Woods east of Canifis",
            },
            {
                id: "ALR",
                target: {origin: {x: 3059, y: 4875, level: 0}},
                code: "ALR",
                name: "Other realmms: Abyss",
            },
            {
                id: "ALS",
                target: {origin: {x: 2644, y: 3495, level: 0}},
                code: "ALS",
                name: "Kandarin: McGrubor´s Wood",
            },
            {
                id: "BIP",
                target: {origin: {x: 3410, y: 3324, level: 0}},
                code: "BIP",
                name: "Islands: Polypore Dungeon",
            },
            {
                id: "BIQ",
                target: {origin: {x: 3251, y: 3095, level: 0}},
                code: "BIQ",
                name: "Kharidian Desert: Near Kalphite Hive",
            },
            {
                id: "BIR",
                target: {origin: {x: 2455, y: 4396, level: 0}},
                code: "BIS",
                name: "Sparse Plane",
            },
            {
                id: "BIS",
                target: {origin: {x: 2635, y: 3266, level: 0}},
                code: "BIS",
                name: "Kandarin: Ardougne Zoo unicorns",
            },
            {
                id: "BJP",
                target: {origin: {x: 3342, y: 3539, level: 0}},
                code: "BJP",
                name: "Fort Forinthry",
            },
            {
                id: "BJQ",
                target: {origin: {x: 1737, y: 5342, level: 0}},
                code: "BJQ",
                name: "Dungeons: Ancient Cavern",
            },
            {
                id: "BJR",
                target: {origin: {x: 2650, y: 4730, level: 0}},
                code: "BJR",
                name: "Other realms: Realm of the fisher king",
            },
            {
                id: "BJS",
                target: {origin: {x: 1359, y: 5635, level: 0}},
                code: "BJS",
                name: "The Lost Grove",
            },
            {
                id: "BKP",
                target: {origin: {x: 2385, y: 3035, level: 0}},
                code: "BKP",
                name: "Feldip Hills: South of Castle Wars",
            },
            {
                id: "BKQ",
                target: {origin: {x: 3041, y: 4532, level: 0}},
                code: "BKQ",
                name: "Other realms: Enchanted Valley",
            },
            {
                id: "BKR",
                target: {origin: {x: 3469, y: 3431, level: 0}},
                code: "BKR",
                name: "Morytania: Mort Myre, south of Canifis",
            },
            {
                id: "BLP",
                target: {origin: {x: 4622, y: 5147, level: 0}},
                code: "BLP",
                name: "Dungeons: TzHaar area",
            },
            {
                id: "BLR",
                target: {origin: {x: 2740, y: 3351, level: 0}},
                code: "BLR",
                name: "Kandarin: Legends' Guild",
            },
            {
                id: "CIP",
                target: {origin: {x: 2513, y: 3884, level: 0}},
                code: "CIP",
                name: "Islands: Miscellania",
            },
            {
                id: "CIQ",
                target: {origin: {x: 2528, y: 3127, level: 0}},
                code: "CIQ",
                name: "Kandarin: North-west of Yanille",
            },
            {
                id: "CIS",
                target: {origin: {x: 3419, y: 4772, level: 0}},
                code: "CIS",
                name: "Other realms: ScapeRune (Evil Bob´s island)",
            },
            {
                id: "CJR",
                target: {origin: {x: 2705, y: 3576, level: 0}},
                code: "CJR",
                name: "Kandarin: Sinclair Mansion (east)",
            },
            {
                id: "CJS",
                target: {origin: {x: 2901, y: 2930, level: 0}},
                code: "CJS",
                name: "Karamja: Kharazi Jungle",
            },
            {
                id: "CKP",
                target: {origin: {"x": 2075, "y": 4848, "level": 0}},
                code: "CKP",
                name: "Other realms: Cosmic entity´s plane"
            },
            {
                id: "CKQ",
                target: {origin: {x: 3086, y: 2704, level: 0}},
                code: "CKQ",
                name: "Menaphos: Imperial District",
            },
            {
                id: "CKR",
                target: {origin: {x: 2801, y: 3003, level: 0}},
                code: "CKR",
                name: "Karamja: South of Tai Bwo Wannai Village",
            },
            {
                id: "CKS",
                target: {origin: {x: 3447, y: 3470, level: 0}},
                code: "CKS",
                name: "Morytania: Canifis",
            },
            {
                id: "CLP",
                target: {origin: {x: 3082, y: 3206, level: 0}},
                code: "CLP",
                name: "Islands: South of Draynor Village",
            },
            {
                id: "CLS",
                target: {origin: {x: 2682, y: 3081, level: 0}},
                code: "CLS",
                name: "Islands: Jungle spiders near Yanille",
            },
            {
                id: "CLR",
                target: {origin: {x: 2735, y: 2742, level: 0}},
                code: "CLR",
                name: "Islands: Ape Atoll",
            },
            {
                id: "DIP",
                target: {origin: {x: 3763, y: 2930, level: 0}},
                code: "DIP",
                name: "Islands: Mos Le´Harmless",
            },
            {
                id: "DIR",
                target: {origin: {"x": 3038, "y": 5348, "level": 0}},
                code: "DIR",
                name: "Other realms: Gorak`s Plane"
            },
            {
                id: "kethsi",
                target: {origin: {"x": 4026, "y": 5699, "level": 0}},
                code: "DIR AKS",
                name: "Kethsi (DIR AKS)"
            },
            {
                id: "DIS",
                target: {origin: {x: 3092, y: 3137, level: 0}},
                code: "DIS",
                name: "Misthalin: Wizard´s Tower",
            },
            {
                id: "DJP",
                target: {origin: {x: 2658, y: 3230, level: 0}},
                code: "DJP",
                name: "Kandarin: Tower of Life",
            },
            {
                id: "DJR",
                target: {origin: {x: 2676, y: 3587, level: 0}},
                code: "DJR",
                name: "Kandarin: Sinclair Mansion (west)",
            },
            {
                id: "DJS",
                target: {origin: {x: 2130, y: 3369, level: 0}},
                code: "DJS",
                name: "Tirannwn: Prifddinas (Clan Amlodd)",
            },
            {
                id: "DKP",
                target: {origin: {x: 2900, y: 3111, level: 0}},
                code: "DKP",
                name: "Karamja: South of Musa Point",
            },
            {
                id: "DKQ",
                target: {origin: {"x": 4183, "y": 5726, "level": 0}},
                code: "DKQ",
                name: "Dungeons: Glacor Cave"
            },
            {
                id: "DKR",
                target: {origin: {x: 3129, y: 3496, level: 0}},
                code: "DKR",
                name: "Misthalin: Edgeville",
            },
            {
                id: "DKS",
                target: {origin: {x: 2744, y: 3719, level: 0}},
                code: "DKS",
                name: "Kandarin: Snowy Hunter area",
            },
            {
                id: "DLQ",
                target: {origin: {x: 3423, y: 3016, level: 0}},
                code: "DLQ",
                name: "Kharidian Desert: North of Nardah",
            },
            {
                id: "DLR",
                target: {origin: {x: 2213, y: 3099, level: 0}},
                code: "DLR",
                name: "Islands: Poison Waste south of Isafdar",
            },
            {
                id: "DLS",
                target: {origin: {x: 3501, y: 9821, level: 3}},
                name: "Dungeons: Myreque Hideout under The Hollows",
                code: "DLS",
            },
            {
                id: "resistance",
                target: {origin: {x: 2254, y: 4426, level: 0}},
                name: "Fairy Resistance HQ",
            },
            {
                id: "rift",
                target: {origin: {x: 1626, y: 4176, level: 0}},
                name: "Ork´s Rift (BIR, DIP, CLR, ALP)",
            },
            {
                id: "BLQ",
                target: {origin: {"x": 2229, "y": 4244, "level": 1}},
                name: "Yu´biusk",
                code: "BLQ",
            },
        ],
        access: [{
            id: "portable_fairy_ring",
            type: "item",
            name: {
                kind: "item",
                name: "Portable Fairy Ring"
            },
            action_name: "Teleport",
            menu_ticks: 2, // Assumes favorite
        }]
    },
    {
        type: "teleports",
        id: "slayercape",
        name: "Slayer Cape",
        menu_ticks: 1,
        animation_ticks: default_teleport_ticks,
        spots: [
            {
                id: "mandrith",
                target: {"origin": {"x": 3050, "y": 3949, "level": 0}, "size": {"x": 5, "y": 5}},
                code: "1",
                name: "Mandrith",
            },
            {
                id: "laniakea",
                target: {"origin": {"x": 5667, "y": 2136, "level": 0}, "size": {"x": 5, "y": 5}, "data": "///PAQ=="},
                code: "2",
                name: "Laniakea",
            },
            {
                id: "morvran",
                target: {"origin": {"x": 2195, "y": 3327, "level": 1}, "size": {"x": 3, "y": 3}, "data": "TwA="},
                code: "3",
                name: "Morvran",
            },
            {
                id: "kuradal",
                target: {"origin": {"x": 1738, "y": 5310, "level": 1}, "size": {"x": 5, "y": 5}, "data": "/v/nAA=="},
                code: "4",
                name: "Kuradal",
            },
            {
                id: "lapalok",
                target: {"origin": {"x": 2868, "y": 2979, "level": 1}, "size": {"x": 3, "y": 5}, "data": "0nc="},
                code: "5",
                name: "Lapalok",
            },
            {
                id: "sumona",
                target: {"origin": {"x": 3357, "y": 2991, "level": 0}, "size": {"x": 5, "y": 5}, "data": "5nxjAA=="},
                code: "6",
                name: "Sumona",
            },
            {
                id: "chealdar",
                target: {"origin": {"x": 2443, "y": 4429, "level": 0}, "size": {"x": 5, "y": 5}, "data": "/H/KAQ=="},
                code: "7",
                name: "Chealdar",
            },
            {
                id: "mazchna",
                target: {"origin": {"x": 3506, "y": 3504, "level": 0}, "size": {"x": 5, "y": 5}},
                code: "8",
                name: "Mazchna",
            },
            {
                id: "raptor",
                target: {"origin": {"x": 3290, "y": 3542, "level": 0}, "size": {"x": 5, "y": 5}},
                code: "9",
                name: "The Raptor",
            },
            {
                id: "vannaka",
                target: {"origin": {"x": 3092, "y": 3476, "level": 0}, "size": {"x": 4, "y": 5}},
                code: "0,1",
                name: "Vannaka",
                menu_ticks: 2,
            },
            {
                id: "jacquelyn",
                target: {"origin": {"x": 3219, "y": 3222, "level": 0}, "size": {"x": 5, "y": 5}, "data": "//8/AQ=="},
                code: "0,2",
                name: "Jacquelyn",
                menu_ticks: 2,
            },
            {
                id: "spria",
                target: {"origin": {"x": 2888, "y": 3545, "level": 0}, "size": {"x": 5, "y": 5}, "data": "///9AQ=="},
                code: "0,3",
                name: "Spria",
                menu_ticks: 2,
            },
        ], access: [
            {
                id: "cape",
                type: "item",
                name: {name: "Slayer cape", kind: "item"},
                img: {url: "capeslay.png"},
                action_name: "Teleport",
            }
        ]
    },
    /*
    {
        type: "teleports",
        id: "dungcape",
        name: "Dungeoneering Cape",
        img: {url: "capedung.png"},
        spots: [
            {
                id: "edgevilledungeon",
target: {origin: {x: 3132, y: 9914, level: 0}},
code: "1",
name: "Edgeville Dungeon",
                menu_ticks: 1,
                animation_ticks: default_teleport_ticks
            },
            {
                id: "dwarvenmine",
target: {origin: {x: 3035, y: 9772, level: 0}},
code: "2",
name: "Dwarven mine",
                menu_ticks: 1,
                animation_ticks: default_teleport_ticks
            },
            {
                id: "hillgiants",
target: {origin: {x: 3104, y: 9827, level: 0}},
code: "3",
name: "Hill giants",
                menu_ticks: 1,
                animation_ticks: default_teleport_ticks
            },
            {
                id: "karamjavolcano",
target: {origin: {x: 2844, y: 9558, level: 0}},
code: "4",
name: "Karamja volcano",
                menu_ticks: 1,
                animation_ticks: default_teleport_ticks
            },
            {
                id: "daemonheimpeninsula",
target: {origin: {x: 3511, y: 3666, level: 0}},
code: "5",
name: "Daemonheim Peninsula",
                menu_ticks: 1,
                animation_ticks: default_teleport_ticks
            },
            {
                id: "firegiants",
target: {origin: {x: 2511, y: 3464, level: 0}},
code: "6",
name: "Waterfall fire giants",
                menu_ticks: 1,
                animation_ticks: default_teleport_ticks
            },
            {
                id: "miningguild",
target: {origin: {x: 3022, y: 9740, level: 0}},
code: "7",
name: "Mining guild",
                menu_ticks: 1,
                animation_ticks: default_teleport_ticks
            },
            {
                id: "braindeath",
target: {origin: {x: 2127, y: 5146, level: 0}},
code: "8",
name: "Braindeath Island",
                menu_ticks: 1,
                animation_ticks: default_teleport_ticks
            },
            {
                id: "hellhounds",
target: {origin: {x: 2854, y: 9841, level: 0}},
code: "9",
name: "Taverley dungeon hellhounds",
                menu_ticks: 1,
                animation_ticks: default_teleport_ticks
            },
            {
                id: "bluedragons",
target: {origin: {x: 2911, y: 9810, level: 0}},
code: "0,1",
name: "Taverley dungeon blue dragons",
                menu_ticks: 2,
                animation_ticks: default_teleport_ticks
            },
            {
                id: "varrocksewers",
target: {origin: {x: 3165, y: 9880, level: 0}},
code: "0,2",
name: "Varrock sewers",
                menu_ticks: 2,
                animation_ticks: default_teleport_ticks
            },
            {
                id: "dragontooth",
target: { origin: {"x": 3812, "y": 3528, "level": 0} },
code: "0,3",
name: "Dragontooth island",
                menu_ticks: 2,
                animation_ticks: default_teleport_ticks
            },
            {
                id: "chaostunnels",
target: {origin: {x: 3160, y: 5522, level: 0}},
code: "0,4",
name: "Chaos Tunnels",
                menu_ticks: 2,
                animation_ticks: default_teleport_ticks
            },
            {
                id: "alkharidmine",
target: {origin: {x: 3297, y: 3310, level: 0}},
code: "0,5",
name: "Al Kharid mine",
                menu_ticks: 2,
                animation_ticks: default_teleport_ticks
            },
            {
                id: "metaldragons",
target: {origin: {x: 2695, y: 9440, level: 0}},
code: "0,6",
name: "Brimhaven metal dragons",
                menu_ticks: 2,
                animation_ticks: default_teleport_ticks
            },
            {
                id: "polypore",
target: {origin: {x: 4661, y: 5490, level: 0}},
code: "0,7",
name: "Polypore dungeon",
                menu_ticks: 2,
                animation_ticks: default_teleport_ticks
            },
            {
                id: "frostdragons",
target: {origin: {x: 3033, y: 9599, level: 0}},
code: "0,8",
name: "Frost dragons",
                menu_ticks: 2,
                animation_ticks: default_teleport_ticks
            },
            {
                id: "kalgeriondemons",
target: {origin: {x: 3399, y: 3665, level: 0}},
code: "0,9",
name: "Daemonheim demons",
                menu_ticks: 2,
                animation_ticks: default_teleport_ticks
            },
            {
                id: "gorajohoardstalker",
target: {origin: {x: 2237, y: 3424, level: 0}},
code: "0,0,1",
name: "Gorajo hoardstalker",
                menu_ticks: 3,
                animation_ticks: default_teleport_ticks
            },
            {
                id: "slayertower",
target: {origin: {x: 3434, y: 3535, level: 0}},
code: "0,0,2",
name: "Slayer tower dungeon",
                menu_ticks: 3,
                animation_ticks: default_teleport_ticks
            },
            {
                id: "edimmu",
target: {origin: {x: 2237, y: 3397, level: 0}},
code: "0,0,3",
name: "Edimmu dungeon",
                menu_ticks: 3,
                animation_ticks: default_teleport_ticks
            },
        ]
    },
    {
        type: "teleports",
        id: "questcape",
        name: "Quest Cape",
        img: {url: "capequest.png"},
        spots: [
            {
                id: "guthixtemple",
target: {origin: {x: 2540, y: 5774, level: 0}},
code: "1",
name: "Ancient Guthix Temple",
                menu_ticks: 1,
                animation_ticks: default_teleport_ticks
            },
            {
                id: "behindthescenes",
target: {origin: {x: 1182, y: 5396, level: 0}},
code: "2",
name: "Behind the scenes",
                menu_ticks: 1,
                animation_ticks: default_teleport_ticks
            },
            {
                id: "championsguild",
target: {origin: {x: 3192, y: 3357, level: 0}},
code: "3",
name: "Champion's Guild",
                menu_ticks: 1,
                animation_ticks: default_teleport_ticks
            },
            {
                id: "emptythroneroom",
target: { origin: {"x": 2825, "y": 12627, "level": 2} },
code: "4",
name: "The empty throne room",
                menu_ticks: 1,
                animation_ticks: default_teleport_ticks
            },
            {
                id: "glacorcavern",
target: {origin: {x: 2912, y: 3840, level: 0}},
code: "5",
name: "Glacor cavern",
                menu_ticks: 1,
                animation_ticks: default_teleport_ticks
            },
            {
                id: "heroesguild",
target: {origin: {x: 2918, y: 9895, level: 0}},
code: "6",
name: "Heroes's Guild - Fountain of Heroes",
                menu_ticks: 1,
                animation_ticks: default_teleport_ticks
            },
            {
                id: "legensguild",
target: {origin: {x: 2730, y: 3348, level: 0}},
code: "7",
name: "Legends' Guild",
                menu_ticks: 1,
                animation_ticks: default_teleport_ticks
            },
            {
                id: "tearsofguthix",
target: { origin: {x: 3250, y: 9518, level: 2} },
code: "8",
name: "Tears of Guthix",
                menu_ticks: 1,
                animation_ticks: default_teleport_ticks
            },
            {
                id: "museum",
target: {origin: {x: 3255, y: 3449, level: 0}},
code: "9",
name: "Varrock Museum",
                menu_ticks: 1,
                animation_ticks: default_teleport_ticks
            },
            {
                id: "worldgate",
target: {origin: {x: 2371, y: 3355, level: 0}},
code: "0",
name: "The World Gate",
                menu_ticks: 1,
                animation_ticks: default_teleport_ticks
            },
        ]
    },
    {
        type: "teleports",
        id: "sixthage",
        name: "Sixth Age Circuit",
        img: {url: "sixthagecircuit.png"},
        spots: [
            {
                id: "shrine",
target: {origin: {x: 1928, y: 5987, level: 0}},
code: "1",
name: "Guthix's Shrine",
                menu_ticks: 2,
                animation_ticks: 5
            },
            {
                id: "worldgate",
target: {origin: {x: 2367, y: 3355, level: 0}},
code: "2",
name: "World Gate",
                menu_ticks: 2,
                animation_ticks: 5
            },
            {
                id: "memorial",
target: {origin: {x: 2265, y: 3554, level: 0}},
code: "3",
name: "Guthix Memorial",
                menu_ticks: 2,
                animation_ticks: 5
            },
            {
                id: "temple",
target: {origin: {x: 2540, y: 5772, level: 0}},
code: "4",
name: "Guthix Memorial",
                menu_ticks: 2,
                animation_ticks: 5
            },
        ]
    },
    {
        type: "teleports",
        id: "desertamulet",
name: "Desert Amulet",
img: {url: "desertamulet.gif"}, spots: [
            {
                id: "nardah",
target: {origin: {x: 3434, y: 2914, level: 0}},
code: "1",
name: "Nardah",
                menu_ticks: 2,
                animation_ticks: 6
            },
            {
                id: "uzer",
target: {origin: {x: 3479, y: 3099, level: 0}},
code: "2",
name: "Uzer",
                menu_ticks: 2,
                animation_ticks: 6
            },
        ]
    },
    {
        type: "teleports",
        id: "piratebook",
name: "Big book o´piracy",
img: {url: "bookopiracy.gif"},
        spots: [
            {
                id: "mosleharmless",
target: {origin: {x: 3684, y: 2958, level: 0}},
code: "1",
name: "Mos Le'Harmless",
                menu_ticks: 1,
                animation_ticks: 13
            },
            {
                id: "braindeath",
target: {origin: {x: 2162, y: 5114, level: 0}},
code: "2",
name: "Braindeath Island",
                menu_ticks: 1,
                animation_ticks: 13
            },
            {
                id: "dragontooth",
target: { origin: {"x": 3792, "y": 3559, "level": 0} },
code: "3",
name: "Dragontooth Isle",
                menu_ticks: 1,
                animation_ticks: 13
            },
            {
                id: "harmony",
target: {origin: {x: 3797, y: 2836, level: 0}},
code: "3",
name: "Harmony Island",
                menu_ticks: 1,
                animation_ticks: 13
            },
        ]
    },*/
    {
        type: "teleports",
        id: "amuletofglory",
        name: "Amulet of Glory",
        img: {url: "jewellry_amuletofglory.png"},
        menu_ticks: 2,
        animation_ticks: 4,
        spots: [
            {
                id: "edgeville",
                target: {"origin": {"x": 3087, "y": 3496, "level": 0}},
                code: "1",
                name: "Edgeville",
            },
            {
                id: "karamja",
                target: {"origin": {"x": 2918, "y": 3176, "level": 0}},
                code: "2",
                name: "Karamja",
            },
            {
                id: "draynor",
                target: {"origin": {"x": 3080, "y": 3250, "level": 0}},
                code: "3",
                name: "Draynor",
            },
            {
                id: "alkharid",
                target: {"origin": {"x": 3305, "y": 3123, "level": 0}},
                code: "4",
                name: "Al Kharid",
            },
        ],
        access: [{
            id: "necklace",
            type: "item",
            name: {name: "Amulet of glory", kind: "item"},
            action_name: "Rub",
            can_be_in_pota: true
        }]
    },
    {
        type: "teleports",
        id: "combatbracelet",
        name: "Combat bracelet",
        menu_ticks: 2,
        animation_ticks: 4,
        spots: [
            {
                id: "warriors",
                target: {"origin": {"x": 2880, "y": 3542, "level": 0}},
                code: "1",
                name: "Warriors' Guild",
            },
            {
                id: "champions",
                target: {"origin": {"x": 3191, "y": 3365, "level": 0}},
                code: "2",
                name: "Champions' Guild",
            },
            {
                id: "monastery",
                target: {"origin": {"x": 3052, "y": 3488, "level": 0}},
                code: "3",
                name: "Edgeville Monastery",
            },
            {
                id: "ranging",
                target: {"origin": {"x": 2655, "y": 3441, "level": 0}},
                code: "4",
                name: "Ranging Guild",
            },
        ],
        access: [{
            id: "ring",
            type: "item",
            name: {name: "Combat bracelet", kind: "item"},
            img: {url: "jewellry_combatbracelet.png"},
            action_name: "Rub",
            can_be_in_pota: true
        }]
    },
    {
        type: "teleports",
        id: "digsitependant",
        name: "Dig Site pendant",
        menu_ticks: 2,
        animation_ticks: 4,
        spots: [
            {
                id: "digsite",
                target: {"origin": {"x": 3358, "y": 3396, "level": 0}},
                code: "1",
                name: "Digsite",
            },
            {
                id: "senntisten",
                target: {"origin": {"x": 3378, "y": 3444, "level": 0}},
                code: "2",
                name: "Senntisten",
            },
            {
                id: "exam",
                target: {"origin": {"x": 3362, "y": 3345, "level": 0}},
                code: "3",
                name: "Exam Centre",
            },
        ],
        access: [{
            id: "ring",
            type: "item",
            name: {name: "Dig Site pendant", kind: "item"},
            img: {url: "jewellry_digsitependant.png"},
            action_name: "Rub",
            can_be_in_pota: true
        }]
    },
    {
        type: "teleports",
        id: "enlightenedamulet",
        name: "Enlightened amulet",
        menu_ticks: 2,
        animation_ticks: 4,
        spots: [
            {
                id: "nexus",
                target: {"origin": {"x": 3215, "y": 3180, "level": 0}, "size": {"x": 5, "y": 5}, "data": "//+/AQ=="},
                code: "1",
                name: "Nexus",
            },
            {
                id: "graveyard",
                target: {"origin": {"x": 3231, "y": 3655, "level": 0}, "size": {"x": 4, "y": 5}, "data": "//cP"},
                code: "2",
                name: "Graveyard of Shadows"
            },
            {
                id: "banditcamp",
                target: {"origin": {"x": 3169, "y": 2994, "level": 0}, "size": {"x": 5, "y": 5}},
                code: "3",
                name: "Bandit camp"
            },
        ],
        access: [{
            id: "ring",
            type: "item",
            name: {name: "Enlightened amulet", kind: "item"},
            img: {url: "jewellry_enlightenedamulet.png"},
            action_name: "Rub",
            can_be_in_pota: true
        }]
    },
    {
        type: "teleports",
        id: "gamesnecklace",
        name: "Games necklace",
        img: {url: "jewellry_gamesnecklace.png"},
        menu_ticks: 2,
        animation_ticks: 4,
        spots: [
            {
                id: "trollinvasion",
                target: {"origin": {"x": 2874, "y": 3567, "level": 0}},
                code: "1",
                name: "Troll invasion",
            },
            {
                id: "barbarianoutpost",
                target: {"origin": {"x": 2520, "y": 3571, "level": 0}},
                code: "2",
                name: "Barbarian Outpost",
            },
            {
                id: "gamersgrotto",
                target: {"origin": {"x": 2967, "y": 9678, "level": 0}},
                code: "3",
                name: "Gamer's grotto",
            },
            {
                id: "agoroth",
                target: {"origin": {"x": 3860, "y": 6827, "level": 0}},
                code: "4",
                name: "Agoroth",
            },
            {
                id: "corporealbeast",
                target: {"origin": {"x": 2885, "y": 4372, "level": 2}},
                code: "5",
                name: "Corporeal Beast",
            },
            {
                id: "burghderott",
                target: {"origin": {"x": 3487, "y": 3237, "level": 0}},
                code: "6",
                name: "Burgh De Rott",
            },
            {
                id: "tearsofguthix",
                target: {"origin": {"x": 3250, "y": 9517, "level": 2}},
                code: "7",
                name: "Tears of Guthix",
            },
        ],
        access: [{
            id: "necklace",
            type: "item",
            name: {name: "Games necklace", kind: "item"},
            action_name: "Rub",
            can_be_in_pota: true
        }]
    },
    {
        type: "teleports",
        id: "ringofduelling",
        name: "Ring of duelling",
        img: {url: "jewellry_duelring.png"},
        menu_ticks: 2,
        animation_ticks: 4,
        spots: [
            {
                id: "hetsoasis",
                target: {"origin": {"x": 3313, "y": 3235, "level": 0}, "size": {"x": 5, "y": 5}, "data": "+/v/AQ=="},
                code: "1",
                name: "Het's oasis",
            },
            {
                id: "castlewars",
                target: {"origin": {"x": 2442, "y": 3088, "level": 0}, "size": {"x": 4, "y": 5}},
                code: "2",
                name: "Castle wars",
            },
            {
                id: "warforge",
                target: {"origin": {"x": 2411, "y": 2845, "level": 0}, "size": {"x": 5, "y": 5}, "data": "nP//AQ=="},
                code: "3",
                name: "The Warforge",
            },
            {
                id: "fistofguthix",
                name: "Fist of Guthix",
                target: {"origin": {"x": 1690, "y": 5598, "level": 0}, "size": {"x": 5, "y": 5}},
                code: "4"
            },
        ],
        access: [{
            id: "ring",
            type: "item",
            name: {name: "Ring of duelling", kind: "item"},
            action_name: "Rub",
            can_be_in_pota: true
        }]
    },
    {
        type: "teleports",
        id: "ringofrespawn",
        name: "Ring of respawn",
        menu_ticks: 2,
        animation_ticks: 4,
        spots: [
            {
                id: "lumbridge",
                target: {"origin": {"x": 3219, "y": 3217, "level": 0}, "size": {"x": 5, "y": 5}, "data": "7f/2AQ=="},
                code: "1",
                name: "Lumbridge",
            },
            {
                id: "falador",
                target: {"origin": {"x": 2969, "y": 3337, "level": 0}, "size": {"x": 5, "y": 4}, "data": "//sP"},
                code: "2",
                name: "Falador",
            },
            {
                id: "camelot",
                target: {"origin": {"x": 2756, "y": 3478, "level": 0}, "size": {"x": 5, "y": 5}, "data": "/39rAA=="},
                code: "3",
                name: "Camelot",
            },
            {
                id: "soulwars",
                target: {"origin": {"x": 1888, "y": 3176, "level": 0}, "size": {"x": 5, "y": 4}, "data": "//8M"},
                code: "4",
                name: "Soul Wars",
            },
            {
                id: "burthorpe",
                target: {"origin": {"x": 2887, "y": 3535, "level": 0}, "size": {"x": 3, "y": 4}, "data": "/g8="},
                code: "5",
                name: "Burthorpe",
            },
        ],
        access: [{
            id: "ring",
            type: "item",
            name: {name: "Ring of respawn", kind: "item"},
            img: {url: "jewellry_ringofrespawn.png"},
            action_name: "Rub",
            can_be_in_pota: true
        }]
    },
    {
        type: "teleports",
        id: "ringofslaying",
        name: "Ring of slaying",
        menu_ticks: 2,
        animation_ticks: 4,
        spots: [
            {
                id: "sumona",
                target: {"origin": {"x": 3359, "y": 2991, "level": 0}, "size": {"x": 4, "y": 5}, "data": "zM0M"},
                code: "1",
                name: "Sumona"
            },
            {
                id: "slayertower",
                target: {"origin": {"x": 3419, "y": 3522, "level": 0}, "size": {"x": 3, "y": 4}, "data": "/ww="},
                code: "2",
                name: "Slayer Tower",
            },
            {
                id: "slayerdungeon",
                target: {"origin": {"x": 2788, "y": 3614, "level": 0}, "size": {"x": 5, "y": 3}, "data": "/2M="},
                code: "3",
                name: "Fremennik Slayer Dungeon",
            },
            {
                id: "tarnslair",
                target: {"origin": {"x": 3183, "y": 4599, "level": 0}, "size": {"x": 5, "y": 3}, "data": "hHw="},
                code: "3",
                name: "Tarn's Kair",
            },
        ],
        access: [{
            id: "ring",
            type: "item",
            name: {name: "Ring of slaying", kind: "item"},
            img: {url: "jewellry_ringofslaying.png"},
            action_name: "Rub",
            can_be_in_pota: true
        }]
    },
    {
        type: "teleports",
        id: "ringofwealth",
        name: "Ring of Wealth",
        menu_ticks: 2,
        animation_ticks: 4,
        spots: [
            {
                id: "miscellania",
                target: {"origin": {"x": 2505, "y": 3858, "level": 1}, "size": {"x": 5, "y": 5}},
                code: "1",
                name: "Miscellania",
            },
            {
                id: "grandexchange",
                target: {"origin": {"x": 3162, "y": 3462, "level": 0}, "size": {"x": 2, "y": 5}},
                code: "2",
                name: "Grand Exchange",
            }
        ],
        access: [{
            id: "ring",
            type: "item",
            name: {name: "Ring of Wealth", kind: "item"},
            img: {url: "jewellry_ringofwealth.png"},
            action_name: "Rub",
            can_be_in_pota: true
        }]
    },
    {
        type: "teleports",
        id: "luckofthedwarves",
        name: "Luck of the Dwarves",
        menu_ticks: 2,
        animation_ticks: 4,
        spots: [
            {
                id: "keldagrim",
                target: {"origin": {"x": 2856, "y": 10197, "level": 0}, "size": {"x": 5, "y": 5}, "data": "7v3nAA=="},
                code: "3",
                name: "Keldagrim",
            },
            {
                id: "outpost",
                target: {"origin": {"x": 2550, "y": 3473, "level": 0}, "size": {"x": 5, "y": 5}, "data": "//+vAQ=="},
                code: "4",
                name: "Dwarven Outpost",
            },
        ],
        access: [{
            id: "ring",
            type: "item",
            name: {name: "Luck of the Dwarves", kind: "item"},
            img: {url: "luck_of_the_dwarves.png"},
            action_name: "Rub",
            can_be_in_pota: true
        }]
    },
    {
        type: "teleports",
        id: "skillsnecklace",
        name: "Skills necklace",
        menu_ticks: 2,
        animation_ticks: 4,
        spots: [
            {
                id: "fishing",
                target: {"origin": {"x": 2615, "y": 3385, "level": 0}},
                code: "1",
                name: "Fishing Guild"
            },
            {
                id: "mining",
                target: {origin: {"x": 3016, "y": 3338, "level": 0}},
                code: "2",
                name: "Mining Guild",
            },
            {
                id: "crafting",
                target: {"origin": {"x": 2933, "y": 3290, "level": 0}},
                code: "3",
                name: "Crafting Guild",
            },
            {
                id: "cooking",
                target: {"origin": {"x": 3143, "y": 3442, "level": 0}},
                code: "4",
                name: "Cooking Guild",
            },
            {
                id: "invention",
                target: {"origin": {"x": 2997, "y": 3437, "level": 0}},
                code: "5",
                name: "Invention guild",
            },
            {
                id: "farming",
                target: {"origin": {"x": 2646, "y": 3355, "level": 0}},
                code: "6",
                name: "Farming Guild",
            },
            {
                id: "runecrafting",
                target: {"origin": {"x": 3102, "y": 3152, "level": 3}},
                code: "7",
                name: "Runecrafting Guild",
            },
        ],
        access: [{
            id: "ring",
            type: "item",
            name: {name: "Skills necklace", kind: "item"},
            img: {url: "jewellry_skillsnecklace.png"},
            action_name: "Rub",
            can_be_in_pota: true
        }]
    },
    {
        type: "teleports",
        id: "travellersnecklace",
        name: "Traveller's necklace",
        menu_ticks: 2,
        animation_ticks: 4,
        spots: [
            {
                id: "wizardstower",
                target: {"origin": {"x": 3101, "y": 3178, "level": 0}, "size": {"x": 5, "y": 5}},
                code: "1",
                name: "Wizard's Tower",
            },
            {
                id: "outpost",
                target: {"origin": {"x": 2445, "y": 3343, "level": 0}, "size": {"x": 5, "y": 5}},
                code: "2",
                name: "The Outpost",
            },
            {
                id: "deserteagle",
                target: {"origin": {"x": 3422, "y": 3138, "level": 0}, "size": {"x": 5, "y": 5}, "data": "//8fAQ=="},
                code: "3",
                name: "Desert Eagle's Eyrie",
            },
        ],
        access: [{
            id: "ring",
            type: "item",
            name: {name: "Traveller's necklace", kind: "item"},
            img: {url: "jewellry_travellersnecklace.png"},
            action_name: "Rub",
            can_be_in_pota: true
        }]
    },
    {
        id: "davesspellbook",
        type: "teleports",
        name: "Dave's spellbook",
        img: {url: "davebook.gif"},
        spots: [
            {
                id: "watchtower",
                target: {origin: {"x": 2443, "y": 3180, "level": 0}},
                code: "1",
                name: "Watchtower",
            },
            {
                id: "camelot",
                target: {origin: {x: 2794, y: 3418, level: 0}},
                code: "2",
                name: "Camelot",
            },
            {
                id: "falador",
                target: {origin: {x: 3006, y: 3319, level: 0}},
                code: "3",
                name: "Falador",
            },
            {
                id: "ardougne",
                target: {origin: {x: 2538, y: 3306, level: 0}},
                code: "4",
                name: "Ardounge",
            },
            {
                id: "lumbridge",
                target: {origin: {x: 3168, y: 3199, level: 0}},
                code: "5",
                name: "Lumbridge",
            },
            {
                id: "varrock",
                target: {origin: {x: 3254, y: 3449, level: 0}},
                code: "6",
                name: "Varrock",
            },
        ],
        access: [{
            img: {url: "davebook.gif"},
            id: "spellbook",
            type: "item",
            name: {kind: "item", name: "Dave's spellbook"},
            action_name: "Teleport",
            menu_ticks: 2,
            animation_ticks: 3,
        }]
    },/*
    {
        type: "teleports",
        id: "drakansmedallion",
name: "Drakan's medallion",
img: {url: "drakmed.gif"},
        spots: [
            {
                id: "barrows",
target: {origin: {x: 3565, y: 3316, level: 0}},
code: "1",
name: "Barrows",
                menu_ticks: 1,
                animation_ticks: 3
            },
            {
                id: "burghderott",
target: {origin: {x: 3491, y: 3202, level: 0}},
code: "2",
name: "Burgh de Rott",
                menu_ticks: 1,
                animation_ticks: 3
            },
            {
                id: "meiyerditch",
target: {origin: {x: 3639, y: 3250, level: 0}},
code: "3",
name: "Meiyerditch",
                menu_ticks: 1,
                animation_ticks: 3
            },
            {
                id: "darkmeyer",
target: {origin: {x: 3624, y: 3365, level: 0}},
code: "4",
name: "Darkmeyer",
                menu_ticks: 1,
                animation_ticks: 3
            },
            {
                id: "laboratories",
target: {origin: {x: 3642, y: 3307, level: 0}},
code: "5",
name: "Meiyerditch Laboratories",
                menu_ticks: 1,
                animation_ticks: 3
            },
        ]
    },
    {
        type: "teleports",
        id: "arcsailing",
name: "",
img: {url: "sail.png"},
        spots: [
            {
                id: "tualeit",
target: {origin: {x: 1762, y: 12009, level: 0}},
name: "Tua Leit Docks",
                menu_ticks: 1,
                animation_ticks: 1
            },
            {
                id: "whalesmaw",
target: {origin: {x: 2012, y: 11783, level: 0}},
name: "Whale's Maw Docks",
                menu_ticks: 1,
                animation_ticks: 1
            },
            {
                id: "waiko",
target: {origin: {x: 1810, y: 11652, level: 0}},
name: "Waiko Docks",
                menu_ticks: 1,
                animation_ticks: 1
            },
            {
                id: "turtleislands",
target: {origin: {x: 2242, y: 11423, level: 0}},
name: "Turtle Islands Docks",
                menu_ticks: 1,
                animation_ticks: 1
            },
            {
                id: "aminishi",
target: {origin: {x: 2063, y: 11271, level: 0}},
name: "Aminishi Docks",
                menu_ticks: 1,
                animation_ticks: 1
            },
            {
                id: "cyclosis",
target: {origin: {x: 2257, y: 11180, level: 0}},
name: "Cyclosis Docks",
                menu_ticks: 1,
                animation_ticks: 1
            },
            {
                id: "goshima",
target: {origin: {x: 2454, y: 11591, level: 0}},
name: "Goshima Docks",
                menu_ticks: 1,
                animation_ticks: 1
            },
        ]
    },*/
    {
        type: "teleports",
        id: "arctabs",
        name: "Arc Journal",
        img: {url: "arcjournal.png"},
        menu_ticks: 1,
        animation_ticks: 3,
        spots: [
            {
                id: "sarim",
                target: {"origin": {"x": 3050, "y": 3245, "level": 0}, "size": {"x": 4, "y": 4}, "data": "/64="},
                name: "Port Sarim",
                code: "1",
            },
            {
                id: "waiko",
                target: {"origin": {"x": 1820, "y": 11613, "level": 0}, "size": {"x": 5, "y": 5}},
                name: "Waiko",
                code: "2",
            },
            {
                id: "whalesmaw",
                target: {"origin": {"x": 2058, "y": 11797, "level": 0}, "size": {"x": 5, "y": 4}, "data": "778P"},
                name: "Whale's Maw",
                code: "3",
            },
            {
                id: "aminishi",
                target: {"origin": {"x": 2085, "y": 11273, "level": 0}, "size": {"x": 5, "y": 5}, "data": "//83AA=="},
                name: "Aminishi",
                code: "4",
            },
            {
                id: "cyclosis",
                target: {"origin": {"x": 2314, "y": 11222, "level": 0}, "size": {"x": 5, "y": 5}},
                name: "Cyclosis",
                code: "5",
            },
            {
                id: "tuaileit",
                target: {"origin": {"x": 1797, "y": 11959, "level": 0}, "size": {"x": 5, "y": 5}},
                name: "Tuai Leit",
                code: "6",
            },
            {
                id: "turtleislands",
                target: {"origin": {"x": 2277, "y": 11502, "level": 0}, "size": {"x": 3, "y": 4}, "data": "/wc="},
                name: "Turtle Islands",
                code: "7",
            },
            {
                id: "goshima",
                target: {"origin": {"x": 2459, "y": 11546, "level": 0}, "size": {"x": 4, "y": 2}, "data": "Lw=="},
                name: "Goshima",
                code: "8",
            },
        ],
        access: [{
            id: "journal",
            type: "item",
            name: {name: "Arc journal", kind: "item"},
            action_name: "Teleport",
        }]
    },/*
            {
                type: "teleports",
                id: "quiver",
                name: "Tirannwn quiver",
                img: {url: "quiver.gif"},
                spots: [
                    {
                        id: "lletya",
                        target: {origin: {x: 2348, y: 3172, level: 0}},
                        name: "Lletya",
                        code: "1",
                        menu_ticks: 1,
                        animation_ticks: 5
                    },
                    {
                        id: "tyras",
                        target: {origin: {x: 2186, y: 3148, level: 0}},
                        name: "Tyras Camp",
                        code: "3",
                        menu_ticks: 1,
                        animation_ticks: 5
                    },
                    {
                        id: "poisonwaste",
                        target: {origin: {x: 2321, y: 3102, level: 0}},
                        name: "Poison Waste",
                        code: "4",
                        menu_ticks: 1,
                        animation_ticks: 5
                    },
                    {
                        id: "deathaltar",
                        target: {origin: {"x": 1858, "y": 4639, "level": 0}},
                        name: "Death Altar",
                        code: "5",
                        menu_ticks: 1,
                        animation_ticks: 5
                    },
                    {
                        id: "elfcamp",
                        target: {origin: {x: 2202, y: 3255, level: 0}},
                        name: "Elf Camp",
                        code: "6",
                        menu_ticks: 1,
                        animation_ticks: 5
                    },
                    {
                        id: "mushroompatch",
                        target: {origin: {x: 2227, y: 3136, level: 0}},
                        name: "Mushroom Patch",
                        code: "7",
                        menu_ticks: 1,
                        animation_ticks: 5
                    },
                    {
                        id: "harmonypillars",
                        target: {origin: {x: 2219, y: 3397, level: 0}},
                        name: "Harmony Pillars",
                        code: "8",
                        menu_ticks: 1,
                        animation_ticks: 5
                    },
                ]
            },
            {
                type: "teleports",
                id: "sceptreofthegods",
                name: "Sceptre of the gods",
                img: {url: "sotg.png"},
                spots: [
                    {
                        id: "pyramidpain",
                        target: {origin: {"x": 1942, "y": 4498, "level": 0}},
                        name: "Pyramid Plunder",
                        code: "1",
                        menu_ticks: 1,
                        animation_ticks: 3
                    },
                    {
                        id: "agility",
                        target: {origin: {x: 3344, y: 2832, level: 0}},
                        name: "Agility Pyramid",
                        code: "2",
                        menu_ticks: 1,
                        animation_ticks: 3
                    },
                    {
                        id: "ancient",
                        target: {origin: {x: 3233, y: 2898, level: 0}},
                        name: "Ancient Pyramid",
                        code: "3",
                        menu_ticks: 1,
                        animation_ticks: 3
                    },
                    {
                        id: "palace",
                        target: {origin: {x: 3169, y: 2730, level: 0}},
                        name: "Golden Palace",
                        code: "4",
                        menu_ticks: 1,
                        animation_ticks: 3
                    },
                ]
            }, */
        {
            type: "teleports",
            id: "gliders",
            name: "Gnome gliders",
            img: {url: "glider.png"},
            menu_ticks: 1,
            animation_ticks: 3,
            spots: [
                {
                    id: "grandtree",
                    target: {origin: {"x": 2465, "y": 3501, "level": 3}},
                    name: "Ta Quir Priw",
                    code: "1",
                },
                {
                    id: "whitewolfmountain",
                    target: {origin: {"x": 2850, "y": 3494, "level": 1}},
                    name: "Sindarpos",
                    code: "2",
                },
                {
                    id: "digside",
                    target: {origin: {"x": 3319, "y": 3438, "level": 0}},
                    name: "Lemanto Andra",
                    code: "3",
                },
                {
                    id: "alkharid",
                    target: {origin: {"x": 3284, "y": 3211, "level": 0}},
                    name: "Kar-Hewo",
                    code: "4",
                },
                {
                    id: "karamja",
                    target: {origin: {"x": 2971, "y": 2969, "level": 0}},
                    name: "Gandius",
                    code: "5",
                },
                {
                    id: "feldiphills",
                    target: {origin: {"x": 2549, "y": 2971, "level": 0}},
                    name: "Lemantolly Undri",
                    code: "6",
                },
                {
                    id: "treegnomevillage",
                    target: {origin: {"x": 2496, "y": 3191, "level": 0}},
                    name: "Priw Gnomo Andralo",
                    code: "7",
                },
                {
                    id: "prifddinas",
                    target: {origin: {x: 2208, y: 3445, level: 1}},
                    name: "Dylandra",
                    code: "8",
                },
                {
                    id: "tualeit",
                    target: {origin: {"x": 1772, "y": 11920, "level": 0}},
                    name: "Kal-Undri",
                    code: "9",
                },
            ],
            access: [
                {
                    id: "grandtree",
                    type: "entity",
                    clickable_area: {origin: {"x": 2464, "y": 3502, "level": 3}},
                    name: {kind: "npc", name: "Captain Errdo"},
                    action_name: "Glider",
                },
                {
                    id: "whitewolfmountain",
                    type: "entity",
                    clickable_area: {origin: {"x": 2850, "y": 3493, "level": 1}},
                    name: {kind: "npc", name: "Captain Bleemadge"},
                    action_name: "Glider",
                },
                {
                    id: "alkharid",
                    type: "entity",
                    clickable_area: {origin: {"x": 3283, "y": 3212, "level": 0}},
                    name: {kind: "npc", name: "Captain Dalbur"},
                    action_name: "Glider",
                },
                {
                    id: "karamja",
                    type: "entity",
                    clickable_area: {origin: {"x": 2970, "y": 2973, "level": 0}},
                    name: {kind: "npc", name: "Captain Klemfoodle"},
                    action_name: "Glider",
                },
                {
                    id: "feldip",
                    type: "entity",
                    clickable_area: {origin: {"x": 2545, "y": 2972, "level": 0}}, // TODO: He is not static
                    name: {kind: "npc", name: "Gnormadium Avlafrim"},
                    action_name: "Glider",
                },
                {
                    id: "gnomevillage",
                    type: "entity",
                    clickable_area: {origin: {"x": 2496, "y": 3190, "level": 0}}, // TODO: He is not static
                    name: {kind: "npc", name: "Captain Belmondo"},
                    action_name: "Glider",
                },
                {
                    id: "prifddinas",
                    type: "entity",
                    clickable_area: {origin: {"x": 2207, "y": 3452, "level": 1}},
                    name: {kind: "npc", name: "Captain Muggin"},
                    action_name: "Glider",
                },
                {
                    id: "tuaeileit",
                    type: "entity",
                    clickable_area: {origin: {"x": 1773, "y": 11919, "level": 0}},
                    name: {kind: "npc", name: "Azalea Oakhart"},
                    action_name: "Glider",
                },

            ]
        },

    /*{
type: "teleports",
id: "wickedhood",
name: "Wicked hood",
img: {url: "wicked.gif"},
spots: [
    {
        id: "guild",
target: { origin: {x: 3109, y: 3156, level: 3} },
name: "Runecrafting Guild",
        menu_ticks: 2,
        animation_ticks: 3
    },
    {
        id: "soul",
target: {origin: {x: 3087, y: 2697, level: 0}},
name: "Soul",
code: "Soul",
        menu_ticks: 2,
        animation_ticks: 3
    },
    {
        id: "cosmic",
target: {origin: {x: 2405, y: 4381, level: 0}},
name: "Cosmic",
code: "Cosmic",
        menu_ticks: 2,
        animation_ticks: 3
    },
    {
        id: "air",
target: {origin: {x: 3127, y: 3403, level: 0}},
name: "Air",
code: "Air",
        menu_ticks: 2,
        animation_ticks: 3
    },
    {
        id: "body",
target: {origin: {x: 3053, y: 3443, level: 0}},
name: "Body",
code: "Body",
        menu_ticks: 2,
        animation_ticks: 3
    },
    {
        id: "mind",
target: {origin: {x: 2982, y: 3514, level: 0}},
name: "Mind",
code: "Mind",
        menu_ticks: 2,
        animation_ticks: 3
    },
    {
        id: "fire",
target: {origin: {x: 3314, y: 3256, level: 0}},
name: "Fire",
code: "Fire",
        menu_ticks: 2,
        animation_ticks: 3
    },
    {
        id: "earth",
target: {origin: {x: 3305, y: 3475, level: 0}},
name: "Earth",
code: "Earth",
        menu_ticks: 2,
        animation_ticks: 3
    },
    {
        id: "water",
target: {origin: {x: 3165, y: 3185, level: 0}},
name: "Water",
code: "Water",
        menu_ticks: 2,
        animation_ticks: 3
    },
    {
        id: "nature",
target: {origin: {x: 2870, y: 3023, level: 0}},
name: "Nature",
code: "Nature",
        menu_ticks: 2,
        animation_ticks: 3
    },
    {
        id: "astral",
target: {origin: {x: 2158, y: 3866, level: 0}},
name: "Astral",
code: "Astral",
        menu_ticks: 2,
        animation_ticks: 3
    },
    {
        id: "chaos",
target: {origin: {x: 3059, y: 3593, level: 0}},
name: "Chaos",
code: "Chaos",
        menu_ticks: 2,
        animation_ticks: 3
    },
    {
        id: "law",
target: {origin: {x: 2857, y: 3382, level: 0}},
name: "Law",
code: "Law",
        menu_ticks: 2,
        animation_ticks: 3
    },
    {
        id: "blood",
target: { origin: {"x": 3560, "y": 9779, "level": 0} },
name: "Blood",
code: "Blood",
        menu_ticks: 2,
        animation_ticks: 3
    },
    {
        id: "death",
target: { origin: {"x": 1863, "y": 4637, "level": 0} },
name: "Death",
code: "Death",
        menu_ticks: 2,
        animation_ticks: 3
    },

]
},
{
type: "teleports",
id: "balloon",
name: "Balloon",
img: {url: "balloon.png"},
spots: [
    {
        id: "castlewars",
target: {origin: {x: 2463, y: 3109, level: 0}},
name: "Castle Wars",
        menu_ticks: 1,
        animation_ticks: 5
    },
    {
        id: "grandtree",
target: {origin: {x: 2477, y: 3462, level: 0}},
name: "Grand Tree",
        menu_ticks: 1,
        animation_ticks: 5
    },
    {
        id: "craftingguild",
target: {origin: {x: 2923, y: 3300, level: 0}},
name: "Crafting Guild",
        menu_ticks: 1,
        animation_ticks: 5
    },
    {
        id: "taverley",
target: {origin: {x: 2931, y: 3414, level: 0}},
name: "Taverley",
        menu_ticks: 1,
        animation_ticks: 5
    },
    {
        id: "varrock",
target: {origin: {x: 3298, y: 3483, level: 0}},
name: "Varrock",
        menu_ticks: 1,
        animation_ticks: 5
    },
    {
        id: "entrana",
target: {origin: {x: 2809, y: 3356, level: 0}},
name: "Entrana",
        menu_ticks: 1,
        animation_ticks: 5
    },
]
},*/
    {
        type: "teleports",
        id: "gote",
        name: "Grace of the Elves (Max Guild Portal)",
        img: {url: "gote.png"},
        animation_ticks: default_teleport_ticks,
        spots: [
            {
                id: "overgrownidols",
                target: {"origin": {"x": 2949, "y": 2977, "level": 0}},
                name: "Overgrown idols",
            },
            {
                id: "deepseafishing",
                target: {"origin": {"x": 2135, "y": 7107, "level": 0}},
                name: "Deep sea fishing hub",
            },
            {
                id: "lavaflowmine",
                target: {"origin": {"x": 2177, "y": 5663, "level": 0}},
                name: "Lava Flow Mine",
            },
        ],
        access: [{
            id: "gote",
            type: "item",
            name: {name: "Grace of the elves", kind: "item"},
            action_name: "Max garden portal",
            menu_ticks: 1,
        }]
    },
    /*
{
type: "teleports",
id: "spheredorgeshkaan",
name: "Dorgesh-kaan sphere",
img: {url: "sphere_dorgeshkaan.png"},
spots: [
    {
        id: "north",
target: {origin: {x: 2719, y: 5350, level: 0}},
name: "North",
code: "1",
        menu_ticks: 1,
        animation_ticks: 11
    },
    {
        id: "south",
target: {origin: {x: 2722, y: 5264, level: 0}},
name: "South",
code: "2",
        menu_ticks: 1,
        animation_ticks: 11
    },
    {
        id: "east",
target: { origin: {x: 2735, y: 5307, level: 1} },
name: "East",
code: "3",
        menu_ticks: 1,
        animation_ticks: 11
    },
    {
        id: "west",
target: { origin: {x: 2700, y: 5308, level: 1} },
name: "West",
code: "4",
        menu_ticks: 1,
        animation_ticks: 11
    },
]
},
{
type: "teleports",
id: "spheregoblinvillage",
name: "Goblin village sphere",
img: {url: "sphere_goblinvillage.png"},
spots: [{
    id: "goblinvillage",
    name: "Goblin Village",
    target: {origin: {x: 2957, y: 3503, level: 0}},
    menu_ticks: 1,
    animation_ticks: 11
},]
},
{
type: "teleports",
id: "naturessentinel",
name: "Nature's sentinel outfit",
img: {url: "sentinel.png"},
spots: [
    {
        id: "normalwestvarrock",
target: {origin: {x: 3138, y: 3431, level: 0}},
code: "1,1",
name: "Normal Trees - West Varrock",
        menu_ticks: 2,
        animation_ticks: default_teleport_ticks
    },
    {
        id: "normaleastvarrock",
target: {origin: {x: 3290, y: 3476, level: 0}},
code: "1,2",
name: "Normal Trees - East Varrock",
        menu_ticks: 2,
        animation_ticks: default_teleport_ticks
    },
    {
        id: "oakwestvarrock",
target: {origin: {x: 3165, y: 3414, level: 0}},
code: "2,1",
name: "Oak Trees - West Varrock",
        menu_ticks: 2,
        animation_ticks: default_teleport_ticks
    },
    {
        id: "oakeastvarrock",
target: {origin: {x: 3278, y: 3474, level: 0}},
code: "2,2",
name: "Oak Trees - East Varrock",
        menu_ticks: 2,
        animation_ticks: default_teleport_ticks
    },
    {
        id: "willowdraynor",
target: {origin: {x: 3090, y: 3232, level: 0}},
code: "3,1",
name: "Willow Trees - Draynor",
        menu_ticks: 2,
        animation_ticks: default_teleport_ticks
    },
    {
        id: "willowcathery",
target: {origin: {x: 2783, y: 3430, level: 0}},
code: "3,2",
name: "Willow Trees - Catherby",
        menu_ticks: 2,
        animation_ticks: default_teleport_ticks
    },
    {
        id: "willowbarbarianoutpost",
target: {origin: {x: 2520, y: 3579, level: 0}},
code: "3,3",
name: "Willow Trees - Barbarian Outpost",
        menu_ticks: 2,
        animation_ticks: default_teleport_ticks
    },
    {
        id: "mapleseers",
target: {origin: {x: 2728, y: 3501, level: 0}},
code: "4,1",
name: "Maple Trees - Seers'",
        menu_ticks: 2,
        animation_ticks: default_teleport_ticks
    },
    {
        id: "mapledaemonheim",
target: {origin: {x: 3500, y: 3625, level: 0}},
code: "4,2",
name: "Maple Trees - Daeomonheim Peninsula Resource Dungeon'",
        menu_ticks: 2,
        animation_ticks: default_teleport_ticks
    },
    {
        id: "yewseers",
target: {origin: {x: 2708, y: 3462, level: 0}},
code: "5,1",
name: "Yew Trees - Seers' Graveyard",
        menu_ticks: 2,
        animation_ticks: default_teleport_ticks
    },
    {
        id: "yewcathery",
target: {origin: {x: 2755, y: 3431, level: 0}},
code: "5,2",
name: "Yew Trees - West Catherby",
        menu_ticks: 2,
        animation_ticks: default_teleport_ticks
    },
    {
        id: "yewedgeville",
target: {origin: {x: 3087, y: 3476, level: 0}},
code: "5,3",
name: "Yew Trees - Edgeville",
        menu_ticks: 2,
        animation_ticks: default_teleport_ticks
    },
    {
        id: "yewvarrock",
target: {origin: {x: 3208, y: 3502, level: 0}},
code: "5,4",
name: "Yew Trees - Varrock Palace",
        menu_ticks: 2,
        animation_ticks: default_teleport_ticks
    },
    {
        id: "yewcrwys",
target: {origin: {x: 2261, y: 3385, level: 0}},
code: "5,5",
name: "Yew Trees - Crwys sector",
        menu_ticks: 2,
        animation_ticks: default_teleport_ticks
    },
    {
        id: "magicranging",
target: {origin: {x: 2693, y: 3428, level: 0}},
code: "6,1",
name: "Magic Trees - East Ranging Guild",
        menu_ticks: 2,
        animation_ticks: default_teleport_ticks
    },
    {
        id: "magicsorcerer",
target: {origin: {x: 2702, y: 3397, level: 0}},
code: "6,2",
name: "Magic Trees - Sorcerer's Tower",
        menu_ticks: 2,
        animation_ticks: default_teleport_ticks
    },
    {
        id: "magicmagetraining",
target: {origin: {x: 3357, y: 3310, level: 0}},
code: "6,3",
name: "Magic Trees - Mage Training Arena",
        menu_ticks: 2,
        animation_ticks: default_teleport_ticks
    },
    {
        id: "magictirannwn",
target: {origin: {x: 2288, y: 3140, level: 0}},
code: "6,4",
name: "Magic Trees - South Tirannwn",
        menu_ticks: 2,
        animation_ticks: default_teleport_ticks
    },
    {
        id: "magiccrwys",
target: {origin: {x: 2250, y: 3366, level: 0}},
code: "6,5",
name: "Magic Trees - Crwys sector",
        menu_ticks: 2,
        animation_ticks: default_teleport_ticks
    },
    {
        id: "eldersorcerer",
target: {origin: {x: 2733, y: 3410, level: 0}},
code: "7,1",
name: "Elder Trees - East Sorcerer's Tower",
        menu_ticks: 2,
        animation_ticks: default_teleport_ticks
    },
    {
        id: "elderyanille",
target: {origin: {x: 2574, y: 3065, level: 0}},
code: "7,2",
name: "Elder Trees - South Yanille",
        menu_ticks: 2,
        animation_ticks: default_teleport_ticks
    },
    {
        id: "eldergnomestronghold",
target: {origin: {x: 2423, y: 3455, level: 0}},
code: "7,3",
name: "Elder Trees - Tree Gnome Stronghold",
        menu_ticks: 2,
        animation_ticks: default_teleport_ticks
    },
    {
        id: "elderdraynor",
target: {origin: {x: 3095, y: 3217, level: 0}},
code: "7,4",
name: "Elder Trees - South Draynor",
        menu_ticks: 2,
        animation_ticks: default_teleport_ticks
    },
    {
        id: "elderfalador",
target: {origin: {x: 3049, y: 3321, level: 0}},
code: "7,5",
name: "Elder Trees - Falador Farm",
        menu_ticks: 2,
        animation_ticks: default_teleport_ticks
    },
    {
        id: "eldervarrock",
target: {origin: {x: 3257, y: 3371, level: 0}},
code: "7,6",
name: "Elder Trees - South Varrock",
        menu_ticks: 2,
        animation_ticks: default_teleport_ticks
    },
    {
        id: "elderlletya",
target: {origin: {x: 2292, y: 3146, level: 0}},
code: "7,7",
name: "Elder Trees - West Lletya",
        menu_ticks: 2,
        animation_ticks: default_teleport_ticks
    },
    {
        id: "elderpiscatoris",
target: {origin: {x: 2319, y: 3596, level: 0}},
code: "7,8",
name: "Elder Trees - Piscatoris",
        menu_ticks: 2,
        animation_ticks: default_teleport_ticks
    },
    {
        id: "elderedgeville",
target: {origin: {x: 3094, y: 3451, level: 0}},
code: "7,9,1",
name: "Elder Trees - South Edgeville",
        menu_ticks: 3,
        animation_ticks: default_teleport_ticks
    },
    {
        id: "elderrimmington",
target: {origin: {x: 2934, y: 3228, level: 0}},
code: "7,9,2",
name: "Elder Trees - North Rimmington",
        menu_ticks: 3,
        animation_ticks: default_teleport_ticks
    },
    {
        id: "elderfort",
target: {origin: {x: 3375, y: 3545, level: 0}},
code: "7,9,3",
name: "Elder Trees - Fort Forinthry Grove",
        menu_ticks: 3,
        animation_ticks: default_teleport_ticks
    },
    {
        id: "teaktai",
target: {origin: {x: 2814, y: 3084, level: 0}},
code: "0,1,1",
name: "Teak Trees - Tai Bwo Wannai",
        menu_ticks: 3,
        animation_ticks: default_teleport_ticks
    },
    {
        id: "teakape",
target: {origin: {x: 2772, y: 2698, level: 0}},
code: "0,1,2",
name: "Teak Trees - Ape Atoll",
        menu_ticks: 3,
        animation_ticks: default_teleport_ticks
    },
    {
        id: "teakcastlewars",
target: {origin: {x: 2333, y: 3048, level: 0}},
code: "0,1,3",
name: "Teak Trees - South-west Castle Wars",
        menu_ticks: 3,
        animation_ticks: default_teleport_ticks
    },
    // 0,2,1 magogany tai bwo wannai omitted due to same spot as teak
    {
        id: "mahoganyape",
target: {origin: {x: 2715, y: 2708, level: 0}},
code: "0,2,2",
name: "Mahogany Trees - Ape Atoll",
        menu_ticks: 3,
        animation_ticks: default_teleport_ticks
    },
    {
        id: "mahoganiharazi",
target: {origin: {x: 2934, y: 2928, level: 0}},
code: "0,2,3",
name: "Mahogany Trees - Kharazi Jungle",
        menu_ticks: 3,
        animation_ticks: default_teleport_ticks
    },
    {
        id: "arcticpine",
target: {origin: {x: 2355, y: 3848, level: 0}},
code: "0,3",
name: "Arctic Pine Trees",
        menu_ticks: 2,
        animation_ticks: default_teleport_ticks
    },
    {
        id: "acadia",
target: {origin: {x: 3187, y: 2720, level: 0}},
code: "0,4",
name: "Acadia Trees",
        menu_ticks: 2,
        animation_ticks: default_teleport_ticks
    },
    {
        id: "ivynorthvarrock",
target: {origin: {x: 3218, y: 3499, level: 0}},
code: "0,5,1",
name: "Choking Ivy - North Varrock Palace",
        menu_ticks: 3,
        animation_ticks: default_teleport_ticks
    },
    {
        id: "ivyeastvarrock",
target: {origin: {x: 3232, y: 3460, level: 0}},
code: "0,5,2",
name: "Choking Ivy - East Varrock Palace",
        menu_ticks: 3,
        animation_ticks: default_teleport_ticks
    },
    {
        id: "ivynorthfalador",
target: {origin: {x: 3015, y: 3393, level: 0}},
code: "0,5,3",
name: "Choking Ivy - North Falador",
        menu_ticks: 3,
        animation_ticks: default_teleport_ticks
    },
    {
        id: "ivysouthfalador",
target: {origin: {x: 3044, y: 3327, level: 0}},
code: "0,5,4",
name: "Choking Ivy - South Falador",
        menu_ticks: 3,
        animation_ticks: default_teleport_ticks
    },
    {
        id: "ivytaverley",
target: {origin: {x: 2938, y: 3429, level: 0}},
code: "0,5,5",
name: "Choking Ivy - South-east Taverly",
        menu_ticks: 3,
        animation_ticks: default_teleport_ticks
    },
    {
        id: "ivyardougne",
target: {origin: {x: 2623, y: 3308, level: 0}},
code: "0,5,6",
name: "Choking Ivy - East Ardougne Church",
        menu_ticks: 3,
        animation_ticks: default_teleport_ticks
    },
    {
        id: "ivyyanille",
target: {origin: {x: 2593, y: 3114, level: 0}},
code: "0,5,7",
name: "Choking Ivy - North Yanille",
        menu_ticks: 3,
        animation_ticks: default_teleport_ticks
    },
    {
        id: "ivycastlewars",
target: {origin: {x: 2426, y: 3062, level: 0}},
code: "0,5,8",
name: "Choking Ivy - South Castle Wars",
        menu_ticks: 3,
        animation_ticks: default_teleport_ticks
    },
    {
        id: "ivycrwys",
target: {origin: {x: 2241, y: 3377, level: 0}},
code: "0,5,9",
name: "Choking Ivy - Crwys sector",
        menu_ticks: 3,
        animation_ticks: default_teleport_ticks
    },
    {
        id: "idolsshipyard",
target: {origin: {x: 2932, y: 3026, level: 0}},
code: "0,6,1",
name: "Overgrown Idols - West of the Karamja shipyard",
        menu_ticks: 3,
        animation_ticks: default_teleport_ticks
    },
    {
        id: "idolsjadinko",
target: {origin: {x: 2947, y: 2976, level: 0}},
code: "0,6,2",
name: "Overgrown Idols - North of the Jadinko vine cave",
        menu_ticks: 3,
        animation_ticks: default_teleport_ticks
    },

]
},*/
    {
        type: "teleports",
        id: "archteleport",
        name: "Archaeology teleport (or outfit)",
        menu_ticks: 1,
        animation_ticks: default_teleport_ticks,
        spots: [
            {
                id: "campus",
                target: {"origin": {"x": 3336, "y": 3378, "level": 0}},
                code: "1",
                name: "Archaeology Campus",
            },
            {
                id: "kharidet",
                target: {"origin": {"x": 3345, "y": 3194, "level": 0}},
                code: "2",
                name: "Kharid-et",
            },
            {
                id: "infernal",
                target: {"origin": {"x": 3271, "y": 3504, "level": 0}},
                code: "3",
                name: "Infernal Source",
            },
            {
                id: "everlight",
                target: {"origin": {"x": 3697, "y": 3206, "level": 0}},
                code: "4",
                name: "Everlight",
            },
            {
                id: "senntisten",
                target: {"origin": {"x": 1784, "y": 1296, "level": 0}},
                code: "5",
                name: "Senntisten",
            },
            {
                id: "stormguard",
                target: {"origin": {"x": 2680, "y": 3403, "level": 0}},
                code: "6",
                name: "Stormguard Citadel",
            },
            {
                id: "warforge",
                target: {"origin": {"x": 2409, "y": 2824, "level": 0}},
                code: "7",
                name: "Warforge",
            },
            {
                id: "orthen",
                target: {"origin": {"x": 5457, "y": 2339, "level": 0}},
                code: "8",
                name: "Orthen",
            },
            {
                id: "jacques",
                target: {"origin": {"x": 3254, "y": 3453, "level": 2}},
                code: "9,1",
                name: "Collectors - Art Critic Jacques",
                menu_ticks: 2,
            },
            {
                id: "tess",
                target: {"origin": {"x": 2550, "y": 2853, "level": 0}},
                code: "9,2",
                name: "Collectors - Chief Tess",
                menu_ticks: 2,
            },
            {
                id: "generals",
                target: {"origin": {"x": 2956, "y": 3509, "level": 0}},
                code: "9,3",
                name: "Collectors - Generals Bentnoze & Wartface",
                menu_ticks: 2,
            },
            {
                id: "isaura",
                target: {"origin": {"x": 2921, "y": 9701, "level": 0}},
                code: "9,4",
                name: "Collectors - Isaura",
                menu_ticks: 2,
            },
            {
                id: "lowse",
                target: {"origin": {"x": 2985, "y": 3268, "level": 0}},
                code: "9,5",
                name: "Collectors - Lowse",
                menu_ticks: 2,
            },
            {
                id: "sharrigan",
                target: {"origin": {"x": 5456, "y": 2344, "level": 0}},
                code: "9,6",
                name: "Collectors - Sharrigan",
                menu_ticks: 2,
            },
            {
                id: "atcha",
                target: {"origin": {"x": 2963, "y": 3346, "level": 0}},
                code: "9,7",
                name: "Collectors - Sir Atcha",
                menu_ticks: 2,
            },
            {
                id: "soran",
                target: {"origin": {"x": 3181, "y": 3417, "level": 0}},
                code: "9,8",
                name: "Collectors - Soran",
                menu_ticks: 2,
            },
            {
                id: "velucia",
                target: {"origin": {"x": 3342, "y": 3382, "level": 0}},
                code: "9,9",
                name: "Collectors - Velucia",
                menu_ticks: 2,
            },
            {
                id: "wiseoldman",
                target: {"origin": {"x": 3088, "y": 3254, "level": 0}},
                code: "9,0,1",
                name: "Collectors - Wise Old Man",
                menu_ticks: 3,
            },
        ],
        access: [{
            id: "scrolls",
            type: "item",
            img: {url: "archteleport.png"},
            name: {name: "Archaeology teleport", kind: "item"},
            action_name: "Teleport"
        }] // TODO: Outfit
    },/*
            {
                type: "teleports",
                id: "ringofkinship",
                name: "Ring of Kinship",
                img: {url: "ringofkinship.png"}, spots: [{
                    id: "daemonheim",
                    name: "Daemonheim",
                    target: {origin: {x: 3449, y: 3701, level: 0}},
                    menu_ticks: 1,
                    animation_ticks: 13
                }]
            },
            {
                type: "teleports",
                id: "witchdoctormask",
                name: "Witchdoctor mask",
                img: {url: "witchdoctormask.png"},
                spots: [{
                    id: "herblorehabitat",
                    target: {origin: {x: 2950, y: 2933, level: 0}},
                    name: "Herblore Habitat",
                    menu_ticks: 1,
                    animation_ticks: default_teleport_ticks
                }]
            },
            {
                type: "teleports",
                id: "ecctophial",
                name: "Ectophial",
                img: {url: "ectophial.png"}, spots: [{
                    id: "ectofunctus",
                    name: "Ectofunctus",
                    target: {origin: {x: 3660, y: 3521, level: 0}},
                    menu_ticks: 0,
                    animation_ticks: 10
                }]
            },
            {
                type: "teleports",
                id: "explorersring",
                name: "Explorer's ring",
                img: {url: "explorersring.png"},
                spots: [{
                    id: "cabbagefield",
                    target: {origin: {x: 3053, y: 3290, level: 0}},
                    name: "Cabbage field",
                    menu_ticks: 1,
                    animation_ticks: 5
                }]
            },
            {
                type: "teleports",
                id: "karamjagloves",
                name: "Karamja gloves",
                img: {url: "karamjagloves.gif"},
                spots: [{
                    id: "gemmine",
                    name: "Gem Mine",
                    target: {origin: {x: 2825, y: 2997, level: 0}},
                    menu_ticks: 1,
                    animation_ticks: 5
                }]
            },
            {
                type: "teleports",
                id: "theheart",
                name: "The Heart teleport",
                img: {url: "theheart.gif"},
                spots: [{
                    id: "center",
                    name: "The Heart",
                    target: {origin: {x: 3199, y: 6942, level: 0}},
                    menu_ticks: 0,
                    animation_ticks: 4
                }]
            },
            {
                type: "teleports",
                id: "fremmenikboots",
                name: "Fremmenik sea boots",
                img: {url: "fremmenikboots.gif"},
                spots: [{
                    id: "relekkamarket",
                    target: {origin: {x: 2642, y: 3678, level: 0}},
                    name: "Relekka Market",
                    menu_ticks: 1,
                    animation_ticks: default_teleport_ticks
                }]
            }, */
    {
        type: "teleports",
        id: "legendscape",
        name: "Legends Cape",
        img: {url: "legendscape.png"},
        spots: [{
            id: "legendsguild",
            target: {origin: {x: 2728, y: 3348, level: 0}},
            name: "Legend's Guild",
            animation_ticks: default_teleport_ticks
        }],
        access: [{
            id: "cape",
            type: "item",
            action_name: "Teleport",
            name: {kind: "item", name: "Cape of legends"},
            menu_ticks: 1,
        }]
    },/*
    {
        type: "teleports",
        id: "archjounal",
        name: "Archaeology journal",
        img: {url: "archjournal.png"},
        spots: [{
            id: "guild",
            name: "Archaology Guild",
            target: {origin: {x: 3334, y: 3379, level: 0}},
            menu_ticks: 1,
            animation_ticks: default_teleport_ticks
        }]
    },
    {
        type: "teleports",
        id: "skullsceptre",
        name: "Skull Sceptre",
        img: {url: "skullsceptre.png"},
        spots: [
            {
                id: "outside",
target: {origin: {x: 3081, y: 3422, level: 0}},
code: "1",
name: "Outside",
                menu_ticks: 1,
                animation_ticks: default_teleport_ticks
            },
            {
                id: "war",
target: {origin: {x: 1862, y: 5241, level: 0}},
code: "2",
name: "Vault of War",
                menu_ticks: 1,
                animation_ticks: default_teleport_ticks
            },
            {
                id: "famine",
target: {origin: {x: 2044, y: 5244, level: 0}},
code: "3",
name: "Catacomb of Famine",
                menu_ticks: 1,
                animation_ticks: default_teleport_ticks
            },
            {
                id: "pestillence",
target: {origin: {x: 2125, y: 5253, level: 0}},
code: "4",
name: "Pit of Pestilence",
                menu_ticks: 1,
                animation_ticks: default_teleport_ticks
            },
            {
                id: "death",
target: {origin: {x: 2359, y: 5211, level: 0}},
code: "5",
name: "Sepulchre of Death",
                menu_ticks: 1,
                animation_ticks: default_teleport_ticks
            },
        ]
    },*/
    {
        type: "teleports",
        id: "dragonkinlaboratory",
        name: "Dragonkin Laboratory teleport",
        menu_ticks: 1,
        animation_ticks: default_teleport_ticks + 1,
        spots: [{
            id: "spot",
            target: {"origin": {"x": 3367, "y": 3887, "level": 0}, "size": {"x": 5, "y": 5}, "data": "/39CAA=="},
            name: "Dragonkin Laboratory",
        }],
        access: [
            {
                type: "item",
                img: {url: "dragonkin.png"},
                name: {kind: "item", name: "Dragonkin Laboratory teleport"},
                action_name: "Break",
                id: "tablet"
            }
        ]
    },/*
    {
        type: "teleports",
        id: "wildernessobelisk",
name: "Portable obelisk",
img: {url: "portableobelisk.png"},
        spots: [
            {
                id: "13",
target: {origin: {x: 3156, y: 3620, level: 0}},
code: "1",
name: "Level 13",
                menu_ticks: 1,
                animation_ticks: 3
            },
            {
                id: "18",
target: {origin: {x: 3219, y: 3656, level: 0}},
code: "2",
name: "Level 18",
                menu_ticks: 1,
                animation_ticks: 3
            },
            {
                id: "27",
target: {origin: {x: 3035, y: 3732, level: 0}},
code: "3",
name: "Level 27",
                menu_ticks: 1,
                animation_ticks: 3
            },
            {
                id: "35",
target: {origin: {x: 3106, y: 3794, level: 0}},
code: "4",
name: "Level 35",
                menu_ticks: 1,
                animation_ticks: 3
            },
            {
                id: "44",
target: {origin: {x: 2980, y: 3866, level: 0}},
code: "5",
name: "Level 44",
                menu_ticks: 1,
                animation_ticks: 3
            },
            {
                id: "50",
target: {origin: {x: 3307, y: 3916, level: 0}},
code: "6",
name: "Level 50",
                menu_ticks: 1,
                animation_ticks: 3
            },
        ]
    },
    {
        type: "teleports",
        id: "wildernesssword",
name: "Wilderness sword",
img: {url: "wildernesssword.png"},
        spots: [
            {
                id: "edgeville",
target: {origin: {x: 3086, y: 3501, level: 0}},
code: "1,1",
name: "Edgeville",
                menu_ticks: 3,
                animation_ticks: 5
            },
            {
                id: "herbpatch",
target: {origin: {x: 3143, y: 3820, level: 0}},
code: "1,2",
name: "Herb patch",
                menu_ticks: 3,
                animation_ticks: 5
            },
            {
                id: "forinthry",
target: {origin: {x: 3071, y: 3649, level: 0}},
code: "1,3",
name: "Forinthry Dungeon",
                menu_ticks: 3,
                animation_ticks: 5
            },
            {
                id: "agility",
target: {origin: {x: 2998, y: 3913, level: 0}},
code: "1,5",
name: "Wilderness Agility course",
                menu_ticks: 3,
                animation_ticks: 5
            },
        ]
    },
    {
        type: "teleports",
        id: "lyre",
name: "Enchanted lyre",
img: {url: "enchantedlyre.png"},
        spots: [
            {
                id: "relekka",
target: {origin: {x: 2651, y: 3689, level: 0}},
code: "1",
name: "Relekka",
                menu_ticks: 1,
                animation_ticks: 6
            },
            {
                id: "waterbirth",
target: {origin: {x: 2529, y: 3740, level: 0}},
code: "2",
name: "Waterbirth Island",
                menu_ticks: 1,
                animation_ticks: 6
            },
            {
                id: "neitiznot",
target: {origin: {x: 2311, y: 3787, level: 0}},
code: "3",
name: "Neitiznot",
                menu_ticks: 1,
                animation_ticks: 6
            },
            {
                id: "jatizso",
target: {origin: {x: 2403, y: 3782, level: 0}},
code: "4",
name: "Jatizso",
                menu_ticks: 1,
                animation_ticks: 6
            },
            {
                id: "miscellania",
target: {origin: {x: 2516, y: 3859, level: 0}},
code: "5",
name: "Miscellania",
                menu_ticks: 1,
                animation_ticks: 6
            },
            {
                id: "etceteria",
target: {origin: {x: 2592, y: 3879, level: 0}},
code: "6",
name: "Etceteria",
                menu_ticks: 1,
                animation_ticks: 6
            },
            {
                id: "relekkamarket",
target: {origin: {x: 2642, y: 3676, level: 0}},
code: "7",
name: "Relekka Market",
                menu_ticks: 1,
                animation_ticks: 6
            },
        ]
    },
    {
        type: "teleports",
        id: "charterships",
name: "Charter Ships",
img: {url: "sail.png"},
        spots: [
            {
                id: "tyras",
target: {origin: {x: 2142, y: 3122, level: 0}},
name: "Port Tyras",
                menu_ticks: 1,
                animation_ticks: 5
            },
            {
                id: "brimhaven",
target: {origin: {x: 2760, y: 3238, level: 0}},
name: "Brimhaven",
                menu_ticks: 1,
                animation_ticks: 5
            },
            {
                id: "catherby",
target: {origin: {x: 2796, y: 3406, level: 0}},
name: "Catherby",
                menu_ticks: 1,
                animation_ticks: 5
            },
            {
                id: "khazard",
target: {origin: {x: 2674, y: 3144, level: 0}},
name: "Port Khazard",
                menu_ticks: 1,
                animation_ticks: 5
            },
            {
                id: "ooglog",
target: {origin: {x: 2623, y: 2857, level: 0}},
name: "Oo'glog",
                menu_ticks: 1,
                animation_ticks: 5
            },
            {
                id: "karamja",
target: {origin: {x: 2954, y: 3158, level: 0}},
name: "Karamja",
                menu_ticks: 1,
                animation_ticks: 5
            },
            {
                id: "shipyard",
target: {origin: {x: 3001, y: 3032, level: 0}},
name: "Shipyard",
                menu_ticks: 1,
                animation_ticks: 5
            },
            {
                id: "sarim",
target: {origin: {x: 3043, y: 3191, level: 0}},
name: "Port Sarim",
                menu_ticks: 1,
                animation_ticks: 5
            },
            {
                id: "phasmatys",
target: {origin: {x: 3702, y: 3503, level: 0}},
name: "Port Phasmatys",
                menu_ticks: 1,
                animation_ticks: 5
            },
            {
                id: "mosleharmless",
target: {origin: {x: 3671, y: 2931, level: 0}},
name: "Mos Le'Harmless",
                menu_ticks: 1,
                animation_ticks: 5
            },
            {
                id: "menaphos",
target: {origin: {x: 3140, y: 2662, level: 0}},
name: "Menaphos",
                menu_ticks: 1,
                animation_ticks: 5
            },
        ]
    },
    {
        type: "teleports",
        id: "dragontrinkets",
name: "Dragon Trinkets",
img: {url: "dragontrinkets.png"},
        spots: [
            {
                id: "green",
target: {origin: {x: 3303, y: 5468, level: 0}},
name: "Green Dragons",
code: "1,1",
                menu_ticks: 4,
                animation_ticks: 3
            },
            {
                id: "brutalgreen",
target: {origin: {x: 2512, y: 3511, level: 0}},
name: "Brutal Green Dragons",
code: "1,2",
                menu_ticks: 4,
                animation_ticks: 3
            },
            {
                id: "blue",
target: {origin: {x: 2891, y: 9769, level: 0}},
name: "Blue Dragons",
code: "2",
                menu_ticks: 3,
                animation_ticks: 3
            },
            {
                id: "red",
target: {origin: {x: 2731, y: 9529, level: 0}},
name: "Red Dragons",
code: "3",
                menu_ticks: 3,
                animation_ticks: 3
            },
            {
                id: "black",
target: {origin: {x: 1565, y: 4356, level: 0}},
name: "Black Dragons",
code: "4,1",
                menu_ticks: 4,
                animation_ticks: 3
            },
            {
                id: "kbd",
target: {origin: {x: 3051, y: 3519, level: 0}},
name: "King Black Dragon",
code: "4,2",
                menu_ticks: 4,
                animation_ticks: 3
            },
            {
                id: "qbd",
target: {origin: {x: 1198, y: 6499, level: 0}},
name: "Queen Black Dragon",
code: "4,2",
                menu_ticks: 4,
                animation_ticks: 3
            },
        ]
    },
    {
        type: "teleports",
        id: "metallicdragontrinkets",
name: "Metallic Dragon Trinkets",
img: {url: "metallicdragontrinkets.png"},
        spots: [
            {
                id: "bronze",
target: {origin: {x: 2723, y: 9486, level: 0}},
name: "Bronze Dragons",
code: "1",
                menu_ticks: 3,
                animation_ticks: 3
            },
            {
                id: "iron",
target: {origin: {x: 2694, y: 9443, level: 0}},
name: "Iron Dragons",
code: "2",
                menu_ticks: 3,
                animation_ticks: 3
            },
            {
                id: "steel",
target: {origin: {x: 2708, y: 9468, level: 0}},
name: "Steel Dragons",
code: "3",
                menu_ticks: 3,
                animation_ticks: 3
            },
            {
                id: "mithril",
target: {origin: {x: 1778, y: 5346, level: 0}},
name: "Mithril Dragons",
code: "4",
                menu_ticks: 3,
                animation_ticks: 3
            },
            //{subid: "adamant",
target: { origin: {x: 0, y: 0, level: 0} }, hover: "Adamant Dragons",
code: "5,1"},
            {
                id: "rune",
target: {origin: {x: 2367, y: 3353, level: 0}},
name: "Rune Dragons",
code: "5,2",
                menu_ticks: 4,
                animation_ticks: 3
            },
        ]
    },
    {
        type: "teleports",
        id: "amuletofnature",
name: "Amulet of Nature",
img: {url: "amuletofnature.png"},
        spots: [
            {
                id: "draynornightshade",
target: {origin: {x: 3086, y: 3353, level: 0}},
name: "Nightshade Patch",
                menu_ticks: 5,
                animation_ticks: 4
            },
            {
                id: "herblorehabitat",
target: {origin: {x: 2949, y: 2904, level: 0}},
name: "Vine Bush Patch",
                menu_ticks: 5,
                animation_ticks: 4
            },
            {
                id: "faladortree",
target: {origin: {x: 3006, y: 3375, level: 0}},
name: "Falador Tree Patch",
                menu_ticks: 5,
                animation_ticks: 4
            },
            {
                id: "harmonyallotment",
target: {origin: {x: 3793, y: 2832, level: 0}},
name: "Harony Island Allotment Patch",
                menu_ticks: 5,
                animation_ticks: 4
            },
        ]
    },
    {
        type: "teleports",
        id: "tokkulzo",
name: "TokKul-Zo",
img: {url: "tokkulzo.png"},
        spots: [
            {
                id: "plaza",
target: {origin: {x: 4672, y: 5155, level: 0}},
name: "Main Plaza",
code: "1",
                menu_ticks: 2,
                animation_ticks: 5
            },
            {
                id: "pit",
target: {origin: {x: 4603, y: 5062, level: 0}},
name: "Fight Pit",
code: "2",
                menu_ticks: 2,
                animation_ticks: 5
            },
            {
                id: "cave",
target: {origin: {x: 4616, y: 5131, level: 0}},
name: "Fight Cave",
code: "3",
                menu_ticks: 2,
                animation_ticks: 5
            },
            {
                id: "kiln",
target: {origin: {x: 4744, y: 5171, level: 0}},
name: "Fight Kiln",
code: "4",
                menu_ticks: 2,
                animation_ticks: 5
            },
            {
                id: "cauldron",
target: {origin: {x: 4787, y: 5127, level: 0}},
name: "Fight Cauldron",
code: "5",
                menu_ticks: 2,
                animation_ticks: 5
            },
        ]
        
        
    }*/
//TODO: Eagle transport system
//TODO: Canoes
//TODO: Orthen Teleport network
//TODO: Anachronia teleport (totems)
//TODO: grand seed pod
//TODO: Boss portals
//      - 1912 4367 Dagannoth Kings
// TODO: Slayer masks
// TODO: Ritual Site teleport incantation
// TODO: Tome of Um teleports
]

export default raw_data