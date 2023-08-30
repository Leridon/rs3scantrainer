import {flat_teleport, full_teleport_id, teleport_group, Teleports} from "../model/teleports";
import {MapCoordinate} from "../model/coordinates";

export namespace teleport_data {
    export const raw_data: teleport_group[] = [
        {
            id: "home",
            name: "Lodestone",
            img: "homeport.png",
            spots: [
                {id: "alkharid", img: {url: "lode_alkharid.png", width: 28}, spot: {x: 3297, y: 3184, level: 0}, code: "A", name: "Al-Kharid"},
                {id: "anachronia", img: {url: "lode_anachronia.png", height: 28}, spot: {x: 5431, y: 2338, level: 0}, code: "A", name: "Anachronia"},
                {id: "ardougne", img: {url: "lode_ardougne.png", height: 28}, spot: {x: 2634, y: 3348, level: 0}, code: "Alt+A", name: "Ardounge"},
                {id: "ashdale", img: {url: "lode_ashdale.png", height: 28}, spot: {x: 2474, y: 2708, level: 2}, code: "Shift+A", name: "Ashdale"},
                {id: "banditcamp", img: {url: "lode_bandit.png", width: 28}, spot: {x: 3214, y: 2954, level: 0}, code: "Alt+B", name: "Bandit Camp"},
                {id: "burthorpe", img: {url: "lode_burthorpe.png", height: 28}, spot: {x: 2899, y: 3544, level: 0}, code: "B", name: "Burthope"},
                {id: "canifis", img: {url: "lode_canifis.png", height: 28}, spot: {x: 3517, y: 3515, level: 0}, code: "Alt+C", name: "Canifis"},
                {id: "catherby", img: {url: "lode_catherby.png", height: 28}, spot: {x: 2811, y: 3449, level: 0}, code: "C", name: "Cathery"},
                {id: "draynor", img: {url: "lode_draynor.png", height: 28}, spot: {x: 3105, y: 3298, level: 0}, code: "D", name: "Draynor"},
                {id: "eaglespeak", img: {url: "lode_eagles.png", height: 28}, spot: {x: 2366, y: 3479, level: 0}, code: "Alt+E", name: "Eagle's Peak"},
                {id: "edgeville", img: {url: "lode_edgeville.png", height: 28}, spot: {x: 3067, y: 3505, level: 0}, code: "E", name: "Edgeville"},
                {id: "falador", img: {url: "lode_falador.png", height: 28}, spot: {x: 2967, y: 3403, level: 0}, code: "F", name: "Falador"},
                {
                    id: "fremmenik",
                    img: {url: "lode_fremennik.png", height: 28},
                    spot: {x: 2712, y: 3677, level: 0},
                    code: "Alt+F",
                    name: "Fremmenik Province"
                },
                {id: "karamja", img: {url: "lode_karamja.png", height: 28}, spot: {x: 2761, y: 3147, level: 0}, code: "K", name: "Karamja"},
                {id: "lumbridge", img: {url: "lode_lumbridge.png", height: 28}, spot: {x: 3233, y: 3221, level: 0}, code: "L", name: "Lumbridge"},
                {id: "lunarisle", img: {url: "lode_lunar.png", height: 28}, spot: {x: 2085, y: 3914, level: 0}, code: "Alt+L", name: "Lunar Isle"},
                {id: "ooglog", img: {url: "lode_ooglog.png", height: 28}, spot: {x: 2532, y: 2871, level: 0}, code: "O", name: "Oo'glog"},
                {id: "portsarim", img: {url: "lode_portsarim.png", height: 28}, spot: {x: 3011, y: 3215, level: 0}, code: "P", name: "Port Sarim"},
                {
                    id: "prifddinas",
                    img: {url: "lode_prifddinas.png", height: 28},
                    spot: {x: 2208, y: 3360, level: 1},
                    code: "Alt+P",
                    name: "Prifddinas"
                },
                {id: "seersvillage", img: {url: "lode_seers.png", height: 28}, spot: {x: 2689, y: 3482, level: 0}, code: "S", name: "Seers' Village"},
                {id: "taverley", img: {url: "lode_taverley.png", height: 28}, spot: {x: 2880, y: 3443, level: 0}, code: "T", name: "Taverley"},
                {id: "tirannwn", img: {url: "lode_tirannwn.png", height: 28}, spot: {x: 2254, y: 3149, level: 0}, code: "Alt+T", name: "Tirannwn"},
                {id: "varrock", img: {url: "lode_varrock.png", height: 28}, spot: {x: 3214, y: 3376, level: 0}, code: "V", name: "Varrock"},
                {id: "wilderness", img: {url: "lode_wilderness.png", height: 28}, spot: {x: 3143, y: 3635, level: 0}, code: "W", name: "Wilderness"},
                {id: "yanille", img: {url: "lode_yanille.png", height: 28}, spot: {x: 2529, y: 3094, level: 0}, code: "Y", name: "Yanille"},
                {id: "menaphos", img: {url: "lode_menaphos.png", height: 28}, spot: {x: 3216, y: 2716, level: 0}, code: "M", name: "Menaphos"},
                {
                    id: "fortforinthry",
                    img: {url: "lode_fortforinthry.png", height: 28},
                    spot: {x: 3298, y: 3525, level: 0},
                    code: "Alt+W",
                    name: "Fort Forinthry"
                },
            ]
        }, {
            id: "normalspellbook",
            name: "Normal Spellbook",
            img: "",
            spots: [
                {
                    id: "camelot",
                    has_variants: true,
                    spot: [
                        {id: "default", name: "Camelot", spot: {x: 2758, y: 3477, level: 0}},
                        {id: "seers", name: "Seer's Village", spot: {x: 2707, y: 3483, level: 0}},
                    ],
                    img: "tele-cam.png",
                    name: "Camelot"
                },
                {
                    id: "varrock",
                    has_variants: true,
                    spot: [
                        {id: "default", name: "Varrock", spot: {x: 3212, y: 3433, level: 0}},
                        {id: "grandexchange", name: "Grand Exchange", spot: {x: 3165, y: 3464, level: 0}},
                        {id: "church", name: "Church", spot: {x: 3246, y: 3479, level: 0}},
                    ],
                    img: "tele-var.png",
                    name: "Varrock"
                },
                {
                    id: "watchtower",
                    has_variants: true,
                    spot: [
                        {id: "default", name: "Watchtower", spot: {x: 2548, y: 3115, level: 0}},
                        {id: "yanille", name: "Yanille", spot: {x: 2574, y: 3090, level: 0}},
                    ],
                    img: "tele-watch.png",
                    name: "Watchtower"
                },
                {id: "lumbridge", spot: {x: 3220, y: 3245, level: 0}, img: "tele-lum.png", name: "Lumbridge"},
                {id: "falador", spot: {x: 2965, y: 3379, level: 0}, img: "tele-fal.png", name: "Falador"},
                {id: "ardougne", spot: {x: 2661, y: 3302, level: 0}, img: "tele-ard.png", name: "Ardougne"},
                {id: "southfeldiphills", spot: {x: 2414, y: 2847, level: 0}, img: "tele-mob.png", name: "South Feldip Hills"},
                {id: "taverley", spot: {x: 2910, y: 3421, level: 0}, img: "tele-taverley.png", name: "Taverley"},
                {id: "godwars", spot: {x: 2908, y: 3724, level: 0}, img: "tele-god.png", name: "God Wars"},
                {id: "trollheim", spot: {x: 2881, y: 3669, level: 0}, img: "tele-troll.png", name: "Trollheim"},
                {id: "apeatoll", spot: {x: 2798, y: 2791, level: 0}, img: "tele-ape.png", name: "Ape Atoll"},
                {id: "mazcab", spot: {x: 4317, y: 814, level: 0}, img: "tele-mazcab.png", name: "Mazcab"},
            ]
        }, {
            id: "ancientspellook",
            name: "Ancient Spellbook",
            img: "",
            spots: [
                {id: "senntisten", spot: {x: 3379, y: 3402, level: 0}, img: "tele-senntisten.png", name: "Senntisten (Dig site)"},
                {id: "kharyll", spot: {x: 3499, y: 3488, level: 0}, img: "tele-kharyrll.png", name: "Kharyrll"},
                {id: "lassar", spot: {x: 3008, y: 3475, level: 0}, img: "tele-lassar.png", name: "Lassar"},
                {id: "dareeyak", spot: {x: 2969, y: 3699, level: 0}, img: "tele-dareeyak.png", name: "Dareeyak"},
                {id: "carallaner", spot: {x: 3223, y: 3665, level: 0}, img: "tele-carrallaner.png", name: "Carrallanger"},
                {id: "annakarl", spot: {x: 3288, y: 3888, level: 0}, img: "tele-annakarl.png", name: "Annakarl"},
                {id: "ghorrock", spot: {x: 2979, y: 3877, level: 0}, img: "tele-ghorrock.png", name: "Ghorrock"},
            ]
        }, {
            id: "lunarspellbook",
            name: "Lunar Spellbook",
            img: "",
            spots: [
                {id: "moonclan", spot: {x: 2111, y: 3917, level: 0}, img: "tele-moonclan.png", name: "Moonclan"},
                {id: "ourania", spot: {x: 2468, y: 3248, level: 0}, img: "tele-ourania.png", name: "Ourania Altar"},
                {id: "southfalador", spot: {x: 3057, y: 3311, level: 0}, img: "tele-southfalador.png", name: "South Falador"},
                {id: "waterbirth", spot: {x: 2548, y: 3758, level: 0}, img: "tele-waterbirth.png", name: "Waterbirth"},
                {id: "barbarian", spot: {x: 2542, y: 3570, level: 0}, img: "tele-barbarian.png", name: "Barbarian Outpost"},
                {id: "northardougne", spot: {x: 2670, y: 3375, level: 0}, img: "tele-northardougne.png", name: "North Ardougne"},
                {id: "khazard", spot: {x: 2634, y: 3167, level: 0}, img: "tele-khazard.png", name: "Port Khazard"},
                {id: "fishing", spot: {x: 2614, y: 3383, level: 0}, img: "tele-fishing.png", name: "Fishing Guild"},
                {id: "catherby", spot: {x: 2803, y: 3450, level: 0}, img: "tele-catherby.png", name: "Catherby"},
                {id: "iceplateu", spot: {x: 2975, y: 3941, level: 0}, img: "tele-iceplateau.png", name: "Ice Plateau"},
                {id: "trollheim", spot: {x: 2818, y: 3676, level: 0}, img: "tele-trollheim.png", name: "Trollheim"},
            ]
        }, {
            id: "greenteleport",
            name: "Green Teleports",
            img: "",
            spots: [
                {id: "monastery", spot: {x: 2606, y: 3217, level: 0}, img: "monastery.png", name: "Kandarin Monastery",},
                {id: "wars", spot: {x: 3294, y: 10127, level: 0}, img: "warsretreat.png", name: "Wars Retreat",},
                {id: "manorfarm", spot: {x: 2670, y: 3372, level: 0}, img: "pof.png", name: "Ardougne Farm"},
                {id: "maxguild", spot: {x: 2276, y: 3313, level: 1}, img: "max.png", name: "Max guild"},
                {id: "skelettalhorror", spot: {x: 3364, y: 3502, level: 0}, img: "skhorror.png", name: "Skeletal Horror"},
            ]
        }, {
            id: "houseteleports",
            name: "House Teleports",
            img: "modhouse.gif",
            spots: [
                {id: "rimmington", spot: {x: 2953, y: 3223, level: 0}, name: "Rimmington house", code: "1"},
                {id: "taverley", spot: {x: 2883, y: 3452, level: 0}, name: "Taverley house", code: "2"},
                {id: "pollnivneach", spot: {x: 3339, y: 3001, level: 0}, name: "Pollnivneach house", code: "3"},
                {id: "relekka", spot: {x: 2670, y: 3632, level: 0}, name: "Rellekka house", code: "4"},
                {id: "brimhaven", spot: {x: 2757, y: 3178, level: 0}, name: "Brimhaven house", code: "5"},
                {id: "yanille", spot: {x: 2544, y: 3095, level: 0}, name: "Yanille house", code: "6"},
                {id: "trollheim", spot: {x: 2890, y: 3675, level: 0}, name: "Trollheim house tablet", code: "7"},
                {id: "prifddinas", spot: {x: 2166, y: 3335, level: 0}, name: "Prifddinas house tablet", code: "8"},
                {id: "menaphos", spot: {x: 3123, y: 2632, level: 0}, name: "Menaphos house tablet", code: "0,1"},
            ]
        }, {
            id: "teleportscrolls",
            name: "Teleport Scrolls",
            img: "",
            spots: [
                {
                    id: "grandexchange",
                    spot: {x: 3160, y: 3458, level: 0},
                    img: "scroll-grandexchange.png",
                    name: "Grand Exchange",
                    code: "1"
                },
                {id: "banditcamp", spot: {x: 3169, y: 2981, level: 0}, img: "scroll-banditcamp.png", name: "Bandit Camp", code: "2"},
                {id: "clocktower", spot: {x: 2593, y: 3253, level: 0}, img: "scroll-clocktower.png", name: "Clocktower", code: "3"},
                {id: "gutanoth", spot: {x: 2523, y: 3062, level: 0}, img: "scroll-gutanoth.png", name: "Gu'Tanoth", code: "4"},
                {id: "lighthouse", spot: {x: 2512, y: 3632, level: 0}, img: "scroll-lighthouse.png", name: "Lighthouse", code: "5"},
                {
                    id: "fortforinthry",
                    spot: {x: 3302, y: 3550, level: 0},
                    img: "scroll-fortforinthry.png",
                    name: "Forintry Teleport",
                    code: "6"
                },
                {
                    id: "miscellania",
                    spot: {x: 2514, y: 3862, level: 0},
                    img: "scroll-miscellania.png",
                    name: "Miscellania",
                    code: "7"
                },
                {
                    id: "phoenixlair",
                    spot: {x: 2293, y: 3620, level: 0},
                    img: "scroll-phoenixlair.png",
                    name: "Phoenix Lair",
                    code: "8"
                },
                {
                    id: "pollnivneach",
                    spot: {x: 3360, y: 2966, level: 0},
                    img: "scroll-pollnivneach.png",
                    name: "Pollnivneach",
                    code: "9"
                },
                {
                    id: "tabwowannai",
                    spot: {x: 2801, y: 3085, level: 0},
                    img: "scroll-taibwowannai.png",
                    name: "Tai Bwo Wannai",
                    code: "0"
                },

            ]
        }, {
            id: "teleportseed",
            name: "Teleport Seed",
            img: "crystal.gif",
            spots: [
                {id: "lletya", spot: {x: 2335, y: 3171, level: 1}, name: "Lletya", code: "1"},
                {id: "amlodd", spot: {x: 2156, y: 3382, level: 1}, name: "Amlodd", code: "3"},
                {id: "cadarn", spot: {x: 2262, y: 3338, level: 1}, name: "Cadarn", code: "4"},
                {id: "cwrys", spot: {x: 2261, y: 3382, level: 1}, name: "Cwrys", code: "5"},
                {id: "hefin", spot: {x: 2187, y: 3410, level: 1}, name: "Hefin", code: "6"},
                {id: "iorwerth", spot: {x: 2186, y: 3310, level: 1}, name: "Iorwerth", code: "7"},
                {id: "Ithell", spot: {x: 2156, y: 3338, level: 1}, name: "Ithell", code: "8"},
                {id: "Meilyr", spot: {x: 2231, y: 3410, level: 1}, name: "Meilyr", code: "9"},
                {id: "Trahaearn", spot: {x: 2232, y: 3310, level: 1}, name: "Trahaearn", code: "0"},
            ]
        }, {
            id: "menaphostablets",
            name: "Menaphos Tablets",
            img: "",
            spots: [
                {id: "imperial", spot: {x: 3177, y: 2730, level: 1}, img: "imperialdistrict.gif", name: "Imperial district", code: "1"},
                {id: "merchant", spot: {x: 3208, y: 2784, level: 1}, img: "merchantdistrict.gif", name: "Merchant district", code: "2"},
                {id: "port", spot: {x: 3187, y: 2654, level: 1}, img: "portdistrict.gif", name: "Port district", code: "3"},
                {id: "worker", spot: {x: 3154, y: 2800, level: 1}, img: "workerdistrict.gif", name: "Worker district", code: "4"},
                {id: "sophanem", spot: {x: 3291, y: 2710, level: 1}, img: "sophanemdungeon.gif", name: "Sophanem Dungeon", code: "5"},
            ]
        }, {
            id: "spirittree",
            name: "Spirit Tree",
            img: "spirittree.png",
            spots: [
                {id: "village", spot: {x: 2542, y: 3168, level: 0}, name: "Tree Gnome Village", code: "1"},
                {id: "stronghold", spot: {x: 2462, y: 3444, level: 0}, name: "Tree Gnome Stronghold", code: "2"},
                {id: "battlefield", spot: {x: 2557, y: 3257, level: 0}, name: "Battlefield of Khazard", code: "3"},
                {id: "grandexchange", spot: {x: 3188, y: 3508, level: 0}, name: "Grand Exchange", code: "4"},
                {id: "feldiphills", spot: {x: 2416, y: 2849, level: 0}, name: "South Feldip Hills", code: "5"},
                {id: "sarim", spot: {x: 3058, y: 3255, level: 0}, name: "Port Sarim", code: "6"},
                {id: "etceteria", spot: {x: 2614, y: 3855, level: 0}, name: "Etceteria", code: "7"},
                {id: "brimhaven", spot: {x: 2800, y: 3203, level: 0}, name: "Brimhaven", code: "8"},
                {id: "poisonwaste", spot: {x: 2337, y: 3109, level: 0}, name: "Poison Waste", code: "9"},
                {id: "prifddinas", spot: {x: 2272, y: 3371, level: 1}, name: "Prifddinas", code: "0"},

            ]
        }, {
            id: "fairyring",
            name: "Fairy Ring",
            img: "fairyring.gif",
            spots: [
                {id: "AIP", spot: {x: 2412, y: 4434, level: 0}, code: "", name: "Zanaris"},
                {id: "AIQ", spot: {x: 2996, y: 3114, level: 0}, code: "AIQ", name: "Asgarnia: Mudskipper Point"},
                {id: "AIR", spot: {x: 2700, y: 3247, level: 0}, code: "AIR", name: "Islands: South of Witchhaven"},
                {id: "AIS", spot: {x: 2030, y: 5982, level: 0}, code: "AIS", name: "Other realms: Naragi homeworld"},
                {id: "AJQ", spot: {x: 2735, y: 5221, level: 0}, code: "AJQ", name: "Dungeons: Dark cave south of Dorgesh-Kaan"},
                {id: "AJR", spot: {x: 2780, y: 3613, level: 0}, code: "AJR", name: "Kandarin: Slayer cave south-east of Relekka"},
                {id: "AJS", spot: {x: 2500, y: 3896, level: 0}, code: "AJS", name: "Islands: Penguins near Miscellania"},
                {id: "AKQ", spot: {x: 2319, y: 3619, level: 0}, code: "AKQ", name: "Piscatoris Hunter area"},
                {id: "AKS", spot: {x: 2571, y: 2956, level: 0}, code: "AKS", name: "Feldip Hills: Jungle Hunter area"},
                {id: "ALP", spot: {x: 2473, y: 3028, level: 0}, code: "ALP", name: "Feldip Hills: Near Gu´Tanoth"},
                {id: "ALQ", spot: {x: 3597, y: 3495, level: 0}, code: "ALQ", name: "Morytania: Haunted Woods east of Canifis"},
                {id: "ALR", spot: {x: 3059, y: 4875, level: 0}, code: "ALR", name: "Other realmms: Abyss"},
                {id: "ALS", spot: {x: 2644, y: 3495, level: 0}, code: "ALS", name: "Kandarin: McGrubor´s Wood"},
                {id: "BIP", spot: {x: 3410, y: 3324, level: 0}, code: "BIP", name: "Islands: Polypore Dungeon"},
                {id: "BIQ", spot: {x: 3251, y: 3095, level: 0}, code: "BIQ", name: "Kharidian Desert: Near Kalphite Hive"},
                {id: "BIR", spot: {x: 2455, y: 4396, level: 0}, code: "BIS", name: "Sparse Plane"},
                {id: "BIS", spot: {x: 2635, y: 3266, level: 0}, code: "BIS", name: "Kandarin: Ardougne Zoo unicorns"},
                {id: "BJP", spot: {x: 3342, y: 3539, level: 0}, code: "BJP", name: "Fort Forinthry"},
                {id: "BJQ", spot: {x: 1737, y: 5342, level: 0}, code: "BJQ", name: "Dungeons: Ancient Cavern"},
                {id: "BJR", spot: {x: 2650, y: 4730, level: 0}, code: "BJR", name: "Other realms: Realm of the fisher king"},
                {id: "BJS", spot: {x: 1359, y: 5635, level: 0}, code: "BJS", name: "The Lost Grove"},
                {id: "BKP", spot: {x: 2385, y: 3035, level: 0}, code: "BKP", name: "Feldip Hills: South of Castle Wars"},
                {id: "BKQ", spot: {x: 3041, y: 4532, level: 0}, code: "BKQ", name: "Other realms: Enchanted Valley"},
                {id: "BKR", spot: {x: 3469, y: 3431, level: 0}, code: "BKR", name: "Morytania: Mort Myre, south of Canifis"},
                {id: "BLP", spot: {x: 4622, y: 5147, level: 0}, code: "BLP", name: "Dungeons: TzHaar area"},
                {id: "BLR", spot: {x: 2740, y: 3351, level: 0}, code: "BLR", name: "Kandarin: Legends´ Guild"},
                {id: "CIP", spot: {x: 2513, y: 3884, level: 0}, code: "CIP", name: "Islands: Miscellania"},
                {id: "CIQ", spot: {x: 2528, y: 3127, level: 0}, code: "CIQ", name: "Kandarin: North-west of Yanille"},
                {id: "CIS", spot: {x: 3419, y: 4772, level: 0}, code: "CIS", name: "Other realms: ScapeRune (Evil Bob´s island)"},
                {id: "CJR", spot: {x: 2705, y: 3576, level: 0}, code: "CJR", name: "Kandarin: Sinclair Mansion (east)"},
                {id: "CJS", spot: {x: 2901, y: 2930, level: 0}, code: "CJS", name: "Karamja: Kharazi Jungle"},
                //TODO: {subid: "CKP", spot: {x: 0, y: 0, level: 0}, code: "CKP", hover: "Other realms: Cosmic entity´s plane"},
                {id: "CKQ", spot: {x: 3086, y: 2704, level: 0}, code: "CKQ", name: "Menaphos: Imperial District"},
                {id: "CKR", spot: {x: 2801, y: 3003, level: 0}, code: "CKR", name: "Karamja: South of Tai Bwo Wannai Village"},
                {id: "CKS", spot: {x: 3447, y: 3470, level: 0}, code: "CKS", name: "Morytania: Canifis"},
                {id: "CLP", spot: {x: 3082, y: 3206, level: 0}, code: "CLP", name: "Islands: South of Draynor Village"},
                {id: "CLS", spot: {x: 2682, y: 3081, level: 0}, code: "CLS", name: "Islands: Jungle spiders near Yanille"},
                {id: "CLR", spot: {x: 2735, y: 2742, level: 0}, code: "CLR", name: "Islands: Ape Atoll"},
                {id: "DIP", spot: {x: 3763, y: 2930, level: 0}, code: "DIP", name: "Islands: Mos Le´Harmless"},
                //TODO: {subid: "DIR", spot: {x: 0, y: 0, level: 0}, code: "DIR", hover: "Other realms: Gorak`s Plane"},
                //TODO: {subid: "kethsi", spot: {x: 0, y: 0, level: 0}, hover: "Kethsi (DIR AKS)"},
                {id: "DIS", spot: {x: 3092, y: 3137, level: 0}, code: "DIS", name: "Misthalin: Wizard´s Tower"},
                {id: "DJP", spot: {x: 2658, y: 3230, level: 0}, code: "DJP", name: "Kandarin: Tower of Life"},
                {id: "DJR", spot: {x: 2676, y: 3587, level: 0}, code: "DJR", name: "Kandarin: Sinclair Mansion (west)"},
                {id: "DJS", spot: {x: 2130, y: 3369, level: 0}, code: "DJS", name: "Tirannwn: Prifddinas (Clan Amlodd)"},
                {id: "DKP", spot: {x: 2900, y: 3111, level: 0}, code: "DKP", name: "Karamja: South of Musa Point"},
                //TODO: {subid: "DKQ", spot: {x: 0, y: 0, level: 0}, code: "DKQ", hover: "Dungeons: Glacor Cave"},
                {id: "DKR", spot: {x: 3129, y: 3496, level: 0}, code: "DKR", name: "Misthalin: Edgeville"},
                {id: "DKS", spot: {x: 2744, y: 3719, level: 0}, code: "DKS", name: "Kandarin: Snowy Hunter area"},
                {id: "DLQ", spot: {x: 3423, y: 3016, level: 0}, code: "DLQ", name: "Kharidian Desert: North of Nardah"},
                {id: "DLR", spot: {x: 2213, y: 3099, level: 0}, code: "DLR", name: "Islands: Poison Waste south of Isafdar"},
                {id: "DLS", spot: {x: 3501, y: 9821, level: 3}, code: "DLS", name: "Dungeons: Myreque Hideout under The Hollows"},
                {id: "resistance", spot: {x: 2254, y: 4426, level: 0}, name: "Fairy Resistance HQ"},
                {id: "rift", spot: {x: 1626, y: 4176, level: 0}, name: "Ork´s Rift (BIR, DIP, CLR, ALP)"},
                //blq yubuisk       // TODO: Around 4823 6721 ?
            ]
        }, {
            id: "slayercape",
            name: "Slayer Cape",
            img: "capeslay.png",
            spots: [
                {id: "mandrith", spot: {x: 3050, y: 3953, level: 0}, code: "1", name: "Mandrith"},
                {id: "laniakea", spot: {x: 5671, y: 2138, level: 0}, code: "2", name: "Laniakea"},
                {id: "morvran", spot: {x: 2197, y: 3327, level: 1}, code: "3", name: "Morvran"},
                {id: "kuradal", spot: {x: 1737, y: 5313, level: 1}, code: "4", name: "Kuradal"},
                {id: "lapalok", spot: {x: 2870, y: 2982, level: 1}, code: "5", name: "Lapalok"},
                {id: "sumona", spot: {x: 3359, y: 2993, level: 0}, code: "6", name: "Sumona"},
                {id: "chealdar", spot: {x: 2447, y: 4431, level: 0}, code: "7", name: "Chealdar"},
                {id: "mazchna", spot: {x: 3510, y: 3507, level: 0}, code: "8", name: "Mazchna"},
                {id: "raptor", spot: {x: 3295, y: 3546, level: 0}, code: "9", name: "The Raptor"},
                {id: "vannaka", spot: {x: 3094, y: 3481, level: 0}, code: "0,1", name: "Vannaka"},
                {id: "jacquelyn", spot: {x: 3221, y: 3223, level: 0}, code: "0,2", name: "Jacquelyn"},
                {id: "spria", spot: {x: 2887, y: 3544, level: 0}, code: "0,3", name: "Spria"},
            ]
        }, {
            id: "dungcape",
            name: "Dungeoneering Cape",
            img: "capedung.png",
            spots: [
                {id: "edgevilledungeon", spot: {x: 3132, y: 9914, level: 0}, code: "1", name: "Edgeville Dungeon"},   // TODO: Check correctness of hovers
                {id: "dwarvenmine", spot: {x: 3035, y: 9772, level: 0}, code: "2", name: "Dwarven mine"},
                {id: "hillgiants", spot: {x: 3104, y: 9827, level: 0}, code: "3", name: "Hill giants"},
                {id: "karamjavolcano", spot: {x: 2844, y: 9558, level: 0}, code: "4", name: "Karamja volcano"},
                {id: "daemonheimpeninsula", spot: {x: 3511, y: 3666, level: 0}, code: "5", name: "Daemonheim Peninsula"},
                {id: "firegiants", spot: {x: 2511, y: 3464, level: 0}, code: "6", name: "Waterfall fire giants"},
                {id: "miningguild", spot: {x: 3022, y: 9740, level: 0}, code: "7", name: "Mining guild"},
                {id: "braindeath", spot: {x: 2127, y: 5146, level: 0}, code: "8", name: "Braindeath Island"},
                {id: "hellhounds", spot: {x: 2854, y: 9841, level: 0}, code: "9", name: "Taverley dungeon hellhounds"},
                {id: "bluedragons", spot: {x: 2911, y: 9810, level: 0}, code: "0,1", name: "Taverley dungeon blue dragons"},
                {id: "varrocksewers", spot: {x: 3165, y: 9880, level: 0}, code: "0,2", name: "Varrock sewers"},
                {id: "dragontooth", spot: {x: 3817, y: 3529, level: 0}, code: "0,3", name: "Dragontooth island"},
                {id: "chaostunnels", spot: {x: 3160, y: 5522, level: 0}, code: "0,4", name: "Chaos Tunnels"},
                {id: "alkharidmine", spot: {x: 3297, y: 3310, level: 0}, code: "0,5", name: "Al Kharid mine"},
                {id: "metaldragons", spot: {x: 2695, y: 9440, level: 0}, code: "0,6", name: "Brimhaven metal dragons"},
                {id: "polypore", spot: {x: 4661, y: 5490, level: 0}, code: "0,7", name: "Polypore dungeon"},
                {id: "frostdragons", spot: {x: 3033, y: 9599, level: 0}, code: "0,8", name: "Frost dragons"},
                {id: "kalgeriondemons", spot: {x: 3399, y: 3665, level: 0}, code: "0,9", name: "Daemonheim demons"},
                {id: "gorajohoardstalker", spot: {x: 2237, y: 3424, level: 0}, code: "0,0,1", name: "Gorajo hoardstalker"},
                {id: "slayertower", spot: {x: 3434, y: 3535, level: 0}, code: "0,0,2", name: "Slayer tower dungeon"},
                {id: "edimmu", spot: {x: 2237, y: 3397, level: 0}, code: "0,0,3", name: "Edimmu dungeon"},
            ]
        }, {
            id: "questcape",
            name: "Quest Cape",
            img: "capequest.png",
            spots: [
                {id: "guthixtemple", spot: {x: 2540, y: 5774, level: 0}, code: "1", name: "Ancient Guthix Temple"},
                {id: "behindthescenes", spot: {x: 1182, y: 5396, level: 0}, code: "2", name: "Behind the scenes"},
                {id: "championsguild", spot: {x: 3192, y: 3357, level: 0}, code: "3", name: "Champion's Guild"},
                {id: "emptythroneroom", spot: {x: 3375, y: 3402, level: 0}, code: "4", name: "The empty throne room"},
                {id: "glacorcavern", spot: {x: 2912, y: 3840, level: 0}, code: "5", name: "Glacor cavern"},
                {id: "heroesguild", spot: {x: 2918, y: 9895, level: 0}, code: "6", name: "Heroes's Guild - Fountain of Heroes"},
                {id: "legensguild", spot: {x: 2730, y: 3348, level: 0}, code: "7", name: "Legends' Guild"},
                {id: "tearsofguthix", spot: {x: 3250, y: 9518, level: 0}, code: "8", name: "Tears of Guthix"},
                {id: "museum", spot: {x: 3255, y: 3449, level: 0}, code: "9", name: "Varrock Museum"},
                {id: "worldgate", spot: {x: 2371, y: 3355, level: 0}, code: "0", name: "The World Gate"},
            ]
        }, {
            id: "sixthage",
            name: "Sixth Age Circuit",
            img: "sixthagecircuit.png",
            spots: [
                {id: "shrine", spot: {x: 1928, y: 5987, level: 0}, code: "1", name: "Guthix's Shrine"},
                {id: "worldgate", spot: {x: 2367, y: 3355, level: 0}, code: "2", name: "World Gate"},
                {id: "memorial", spot: {x: 2265, y: 3554, level: 0}, code: "3", name: "Guthix Memorial"},
                {id: "temple", spot: {x: 2540, y: 5772, level: 0}, code: "4", name: "Guthix Memorial"},
            ]
        }, {
            id: "desertamulet", name: "Desert Amulet", img: "desertamulet.gif", spots: [
                {id: "nardah", spot: {x: 3434, y: 2914, level: 0}, code: "1", name: "Nardah"},
                {id: "uzer", spot: {x: 3479, y: 3099, level: 0}, code: "2", name: "Uzer"},
            ]
        }, {
            id: "piratebook", name: "Big book o´piracy", img: "bookopiracy.gif",
            spots: [
                {id: "mosleharmless", spot: {x: 3684, y: 2958, level: 0}, code: "1", name: "Mos Le'Harmless"},
                {id: "braindeath", spot: {x: 2162, y: 5114, level: 0}, code: "2", name: "Braindeath Island"},
                {id: "dragontooth", spot: {x: 3793, y: 3559, level: 0}, code: "3", name: "Dragontooth Isle"},
                {id: "harmony", spot: {x: 3797, y: 2836, level: 0}, code: "3", name: "Harmony Island"},
            ]
        }, {
            id: "amuletofglory", name: "Amulet of Glory", img: "jewellry_amuletofglory.png", can_be_in_pota: true,
            spots: [
                {id: "edgeville", spot: {x: 3088, y: 3497, level: 0}, code: "1", name: "Edgeville"},
                {id: "karamja", spot: {x: 2919, y: 3175, level: 0}, code: "2", name: "Karamja"},
                {id: "draynor", spot: {x: 3081, y: 3250, level: 0}, code: "3", name: "Draynor"},
                {id: "alkharid", spot: {x: 3305, y: 3123, level: 0}, code: "4", name: "Al Kharid"},
            ]
        }, {
            id: "combatbracelet", name: "Combat bracelet", img: "jewellry_combatbracelet.png", can_be_in_pota: true,
            spots: [
                {id: "warriors", spot: {x: 2879, y: 3543, level: 0}, code: "1", name: "Warriors' Guild"},
                {id: "champions", spot: {x: 3192, y: 3366, level: 0}, code: "2", name: "Champions' Guild"},
                {id: "monastery", spot: {x: 3052, y: 3490, level: 0}, code: "3", name: "Edgeville Monastery"},
                {id: "ranging", spot: {x: 2657, y: 3440, level: 0}, code: "4", name: "Ranging Guild"},
            ]
        }, {
            id: "digsitependant", name: "Dig Site pendant", img: "jewellry_digsitependant.png", can_be_in_pota: true,
            spots: [
                {id: "digsite", spot: {x: 3358, y: 3396, level: 0}, code: "1", name: "Digsite"},
                {id: "senntisten", spot: {x: 3375, y: 3445, level: 0}, code: "2", name: "Senntisten"},
                {id: "exam", spot: {x: 3362, y: 3345, level: 0}, code: "3", name: "Exam Centre"},
            ]
        }, {
            id: "enlightenedamulet", name: "Enlightened amulet", img: "jewellry_enlightenedamulet.png", can_be_in_pota: true,
            spots: [
                {id: "nexus", spot: {x: 3216, y: 3182, level: 0}, code: "1", name: "Nexus"},
                {id: "graveyard", spot: {x: 3229, y: 3657, level: 0}, code: "2", name: "Graveyard of Shadows"},
                {id: "banditcamp", spot: {x: 3170, y: 2992, level: 0}, code: "3", name: "Bandit camp"},
            ]
        }, {
            id: "gamesnecklace", name: "Games necklace", img: "jewellry_gamesnecklace.png", can_be_in_pota: true,
            spots: [
                {id: "trollinvasion", spot: {x: 2878, y: 3564, level: 0}, code: "1", name: "Troll invasion"},
                {id: "barbarianoutpost", spot: {x: 2519, y: 3572, level: 0}, code: "2", name: "Barbarian Outpost"},
                //{subid: "gamersgrotto", spot: {x: 2992, y: 3412, level: 0}, code: "3", hover: "Gamer's grotto"},
                {id: "agoroth", spot: {x: 2453, y: 2729, level: 0}, code: "4", name: "Agoroth"},
                {id: "corporealbeast", spot: {x: 3216, y: 3784, level: 0}, code: "5", name: "Corporeal Beast"},
                {id: "burghderott", spot: {x: 3485, y: 3239, level: 0}, code: "6", name: "Burgh De Rott"},
                {id: "tearsofguthix", spot: {x: 3252, y: 9517, level: 0}, code: "7", name: "Tears of Guthix"},

            ]
        }, {
            id: "ringofduelling", name: "Ring of duelling", img: "jewellry_duelring.png", can_be_in_pota: true,
            spots: [
                {id: "hetsoasis", spot: {x: 3321, y: 3231, level: 0}, code: "1", name: "Het's oasis"},
                {id: "castlewars", spot: {x: 2444, y: 3089, level: 0}, code: "2", name: "Castle wars"},
                {id: "southfeldiphills", spot: {x: 2414, y: 2843, level: 0}, code: "3", name: "South Feldip Hills"},
                //{ sub: "duel", r: /^Fist of Guthix Ring of duelling/i, n: "Fist of Guthix", x: 2997, z: 3411, img: "duelling.gif", code: "4" },
            ]
        }, {
            id: "ringofrespawn", name: "Ring of respawn", img: "jewellry_ringofrespawn.png", can_be_in_pota: true,
            spots: [
                {id: "lumbridge", spot: {x: 3221, y: 3219, level: 0}, code: "1", name: "Lumbridge spawn"},
                {id: "falador", spot: {x: 2970, y: 3339, level: 0}, code: "2", name: "Falador spawn"},
                {id: "camelot", spot: {x: 2758, y: 3481, level: 0}, code: "3", name: "Camelot spawn"},
                {id: "soulwars", spot: {x: 3082, y: 3475, level: 0}, code: "4", name: "Soul Wars spawn"},
                {id: "burthorpe", spot: {x: 2888, y: 3538, level: 0}, code: "5", name: "Burthorpe spawn"},
            ]
        }, {
            id: "ringofslaying", name: "Ring of slaying", img: "jewellry_ringofslaying.png", can_be_in_pota: true,
            spots: [
                {id: "sumona", spot: {x: 3362, y: 2992, level: 0}, code: "1", name: "Sumona"},
                {id: "slayertower", spot: {x: 3423, y: 3524, level: 0}, code: "2", name: "Slayer Tower"},
                {id: "slayerdungeon", spot: {x: 2790, y: 3616, level: 0}, code: "3", name: "Fremennik Slayer Dungeon"},
                // Tarns lair
            ]
        }, {
            id: "ringofwealth", name: "Ring of Wealth", img: "jewellry_ringofwealth.png", can_be_in_pota: true,
            spots: [
                {id: "miscellania", spot: {x: 2508, y: 3862, level: 0}, code: "1", name: "Miscellania"},
                {id: "grandexchange", spot: {x: 3162, y: 3463, level: 0}, code: "2", name: "Grand Exchange"}
            ]
        }, {
            id: "luckofthedwarves", name: "Luck of the Dwarves", img: "luck_of_the_dwarves.png", can_be_in_pota: true,
            spots: [
                {id: "keldagrim", spot: {x: 2858, y: 10200, level: 0}, code: "3", name: "Keldagrim"},
                {
                    id: "outpost",
                    spot: {x: 2552, y: 3474, level: 0},
                    code: "4",
                    name: "Dwarven Outpost (Requires Dark Facet of Luck unlocked)"
                },
            ]
        }, {
            id: "skillsnecklace", name: "Skills necklace", img: "jewellry_skillsnecklace.png", can_be_in_pota: true,
            spots: [
                {id: "fishing", spot: {x: 2614, y: 3386, level: 0}, code: "1", name: "Fishing Guild"},
                {id: "mining", spot: {x: 3016, y: 3338, level: 0}, code: "2", name: "Mining Guild"},
                {id: "crafting", spot: {x: 2934, y: 3291, level: 0}, code: "3", name: "Crafting Guild"},
                {id: "cooking", spot: {x: 3144, y: 3443, level: 0}, code: "4", name: "Cooking Guild"},
                {id: "invention", spot: {x: 2997, y: 3436, level: 0}, code: "5", name: "Invention guild"},
                {id: "farming", spot: {x: 2646, y: 3355, level: 0}, code: "6", name: "Farming Guild"},
                {id: "runecrafting", spot: {x: 3097, y: 3156, level: 0}, code: "7", name: "Runecrafting Guild"},
            ]
        }, {
            id: "travellersnecklace",
            name: "Traveller's necklace",
            img: "jewellry_travellersnecklace.png",
            can_be_in_pota: true,
            spots: [
                {id: "wizardstower", spot: {x: 3103, y: 3182, level: 0}, code: "1", name: "Wizard's Tower"},
                {id: "outpost", spot: {x: 2444, y: 3346, level: 0}, code: "2", name: "The Outpost"},
                {id: "deserteagle", spot: {x: 3426, y: 3143, level: 0}, code: "3", name: "Desert Eagle's Eyrie"},
            ]
        }, {
            id: "davesspellbook", name: "Dave's spellbook", img: "davebook.gif",
            spots: [
                {id: "watchtower", spot: {x: 2444, y: 3182, level: 0}, code: "1", name: "Watchtower"},
                {id: "camelot", spot: {x: 2794, y: 3419, level: 0}, code: "2", name: "Camelot"},
                {id: "falador", spot: {x: 3006, y: 3319, level: 0}, code: "3", name: "Falador"},
                {id: "ardougne", spot: {x: 2538, y: 3306, level: 0}, code: "4", name: "Ardounge"},
                {id: "lumbridge", spot: {x: 3170, y: 3199, level: 0}, code: "5", name: "Lumbridge"},
                {id: "varrock", spot: {x: 3254, y: 3449, level: 0}, code: "6", name: "Varrock"},
            ]
        }, {
            id: "drakansmedallion", name: "Drakan's medallion", img: "drakmed.gif",
            spots: [
                {id: "barrows", spot: {x: 3565, y: 3316, level: 0}, code: "1", name: "Barrows"},
                {id: "burghderott", spot: {x: 3491, y: 3202, level: 0}, code: "2", name: "Burgh de Rott"},
                {id: "meiyerditch", spot: {x: 3639, y: 3250, level: 0}, code: "3", name: "Meiyerditch"},
                {id: "darkmeyer", spot: {x: 3624, y: 3365, level: 0}, code: "4", name: "Darkmeyer"},
                {id: "laboratories", spot: {x: 3642, y: 3307, level: 0}, code: "5", name: "Meiyerditch Laboratories"},
            ]
        }, {
            id: "arcsailing", name: "", img: "sail.png",
            spots: [
                {id: "tualeit", spot: {x: 1762, y: 12009, level: 0}, name: "Tua Leit Docks"},
                {id: "whalesmaw", spot: {x: 2012, y: 11783, level: 0}, name: "Whale's Maw Docks"},
                {id: "waiko", spot: {x: 1810, y: 11652, level: 0}, name: "Waiko Docks"},
                {id: "turtleislands", spot: {x: 2242, y: 11423, level: 0}, name: "Turtle Islands Docks"},
                {id: "aminishi", spot: {x: 2063, y: 11271, level: 0}, name: "Aminishi Docks"},
                {id: "cyclosis", spot: {x: 2257, y: 11180, level: 0}, name: "Cyclosis Docks"},
                {id: "goshima", spot: {x: 2454, y: 11591, level: 0}, name: "Goshima Docks"},
            ]
        }, {
            id: "arctabs", name: "Arc Journal", img: "arcjournal.png",
            spots: [
                {id: "sarim", spot: {x: 3052, y: 3247, level: 0}, name: "Port Sarim", code: "1"},
                {id: "waiko", spot: {x: 1824, y: 11612, level: 0}, name: "Waiko", code: "2"},
                {id: "whalesmaw", spot: {x: 2062, y: 11798, level: 0}, name: "Whale's Maw", code: "3"},
                {id: "aminishi", spot: {x: 2088, y: 11274, level: 0}, name: "Aminishi", code: "4"},
                {id: "cyclosis", spot: {x: 2318, y: 11225, level: 0}, name: "Cyclosis", code: "5"},
                {id: "tuaileit", spot: {x: 1800, y: 11960, level: 0}, name: "Tuai Leit", code: "6"},
                {id: "turtleislands", spot: {x: 2278, y: 11504, level: 0}, name: "Turtle Islands", code: "7"},
                {id: "goshima", spot: {x: 2459, y: 11547, level: 0}, name: "Goshima", code: "8"},
            ]
        }, {
            id: "quiver", name: "Tirannwn quiver", img: "quiver.gif",
            spots: [
                {id: "lletya", spot: {x: 2348, y: 3172, level: 0}, name: "Lletya", code: "1"},
                {id: "tyras", spot: {x: 2186, y: 3148, level: 0}, name: "Tyras Camp", code: "3"},
                {id: "poisonwaste", spot: {x: 2321, y: 3102, level: 0}, name: "Poison Waste", code: "4"},
                {id: "elfcamp", spot: {x: 2202, y: 3255, level: 0}, name: "Elf Camp", code: "6"},
                {id: "mushroompatch", spot: {x: 2227, y: 3136, level: 0}, name: "Mushroom Patch", code: "7"},
                {id: "harmonypillars", spot: {x: 2219, y: 3397, level: 0}, name: "Harmony Pillars", code: "8"},
            ]
        }, {
            id: "sceptreofthegods", name: "Sceptre of the gods", img: "sotg.png",
            spots: [
                {id: "pyramidpain", spot: {x: 3289, y: 2802, level: 0}, name: "Pyramid Plunder", code: "1"},      // TODO: Inside is around 1950 4517
                {id: "agility", spot: {x: 3344, y: 2832, level: 0}, name: "Agility Pyramid", code: "2"},
                {id: "ancient", spot: {x: 3233, y: 2898, level: 0}, name: "Ancient Pyramid", code: "3"},
                {id: "palace", spot: {x: 3169, y: 2730, level: 0}, name: "Golden Palace", code: "4"},
            ]
        }, {
            id: "gliders", name: "Gnome gliders", img: "glider.png",
            spots: [
                {id: "grandtree", spot: {x: 2466, y: 3496, level: 0}, name: "The Grand Tree", code: "1"},
                {id: "whitewolfmountain", spot: {x: 2851, y: 3497, level: 0}, name: "White Wolf Mountain", code: "2"},
                {id: "digside", spot: {x: 3321, y: 3432, level: 0}, name: "Digsite", code: "3"},
                {id: "alkharid", spot: {x: 3280, y: 3213, level: 0}, name: "Al Kharid", code: "4"},
                {id: "karamja", spot: {x: 2971, y: 2970, level: 0}, name: "Karamja", code: "5"},
                {id: "feldiphills", spot: {x: 2556, y: 2972, level: 0}, name: "Feldip Hills", code: "6"},
                {id: "treegnomevillage", spot: {x: 2495, y: 3192, level: 0}, name: "Tree Gnome Village", code: "7"},
                {id: "prifddinas", spot: {x: 2208, y: 3446, level: 0}, name: "Prifddinas", code: "8"},
                {id: "tualeit", spot: {x: 1774, y: 11919, level: 0}, name: "Tua Leit", code: "9"},
            ]
        }, {
            id: "wickedhood", name: "Wicked hood", img: "wicked.gif",
            spots: [
                {id: "guild", spot: {x: 3106, y: 3157, level: 3}, name: "Runecrafting Guild"},
                {id: "soul", spot: {x: 3087, y: 2697, level: 0}, name: "Soul", code: "Soul"},
                {id: "cosmic", spot: {x: 2405, y: 4381, level: 0}, name: "Cosmic", code: "Cosmic"},
                {id: "air", spot: {x: 3127, y: 3403, level: 0}, name: "Air", code: "Air"},
                {id: "body", spot: {x: 3053, y: 3443, level: 0}, name: "Body", code: "Body"},
                {id: "mind", spot: {x: 2982, y: 3514, level: 0}, name: "Mind", code: "Mind"},
                {id: "fire", spot: {x: 3314, y: 3256, level: 0}, name: "Fire", code: "Fire"},
                {id: "earth", spot: {x: 3305, y: 3475, level: 0}, name: "Earth", code: "Earth"},
                {id: "water", spot: {x: 3165, y: 3185, level: 0}, name: "Water", code: "Water"},
                {id: "nature", spot: {x: 2870, y: 3023, level: 0}, name: "Nature", code: "Nature"},
                {id: "astral", spot: {x: 2158, y: 3866, level: 0}, name: "Astral", code: "Astral"},
                {id: "chaos", spot: {x: 3059, y: 3593, level: 0}, name: "Chaos", code: "Chaos"},
                {id: "law", spot: {x: 2857, y: 3382, level: 0}, name: "Law", code: "Law"},

            ]
        }, {
            id: "balloon", name: "Balloon", img: "balloon.png",
            spots: [
                {id: "castlewars", spot: {x: 2463, y: 3109, level: 0}, name: "Castle Wars"},
                {id: "grandtree", spot: {x: 2477, y: 3462, level: 0}, name: "Grand Tree"},
                {id: "craftingguild", spot: {x: 2923, y: 3300, level: 0}, name: "Crafting Guild"},
                {id: "taverley", spot: {x: 2931, y: 3414, level: 0}, name: "Taverley"},
                {id: "varrock", spot: {x: 3298, y: 3483, level: 0}, name: "Varrock"},
                {id: "entrana", spot: {x: 2809, y: 3356, level: 0}, name: "Entrana"},
            ]
        }, {
            id: "gote", name: "Grace of the Elves (Max Guild Portal)", img: "gote.png",
            spots: [
                {id: "overgrownidols", spot: {x: 2950, y: 2976, level: 0}, name: "Overgrown idols"},
                {id: "deppseafishing", spot: {x: 2594, y: 3412, level: 0}, name: "Deep sea fishing hub"},
                {id: "lavaflowmine", spot: {x: 2940, y: 10198, level: 0}, name: "Lava Flow Mine"},
                // TODO: Other teleports
            ]
        }, {
            id: "spheredorgeshkaan", name: "Dorgesh-kaan sphere", img: "sphere_dorgeshkaan.png",
            spots: [
                {id: "north", spot: {x: 2719, y: 5350, level: 0}, name: "North", code: "1"},
                {id: "south", spot: {x: 2722, y: 5264, level: 0}, name: "South", code: "2"},
                {id: "east", spot: {x: 2735, y: 5307, level: 0}, name: "East", code: "3"},
                {id: "west", spot: {x: 2700, y: 5308, level: 0}, name: "West", code: "4"},
            ]
        }, {
            id: "spheregoblinvillage", name: "Goblin village sphere", img: "sphere_goblinvillage.png",
            spots: [{id: "goblinvillage", spot: {x: 2957, y: 3503, level: 0}},]
        }, {
            id: "naturessentinel", name: "Nature's sentinel outfit", img: "sentinel.png",
            spots: [
                {id: "normalwestvarrock", spot: {x: 3138, y: 3431, level: 0}, code: "1,1", name: "Normal Trees - West Varrock"},
                {id: "normaleastvarrock", spot: {x: 3290, y: 3476, level: 0}, code: "1,2", name: "Normal Trees - East Varrock"},
                {id: "oakwestvarrock", spot: {x: 3165, y: 3414, level: 0}, code: "2,1", name: "Oak Trees - West Varrock"},
                {id: "oakeastvarrock", spot: {x: 3278, y: 3474, level: 0}, code: "2,2", name: "Oak Trees - East Varrock"},
                {id: "willowdraynor", spot: {x: 3090, y: 3232, level: 0}, code: "3,1", name: "Willow Trees - Draynor"},
                {id: "willowcathery", spot: {x: 2783, y: 3430, level: 0}, code: "3,2", name: "Willow Trees - Catherby"},
                {id: "willowbarbarianoutpost", spot: {x: 2520, y: 3579, level: 0}, code: "3,3", name: "Willow Trees - Barbarian Outpost"},
                {id: "mapleseers", spot: {x: 2728, y: 3501, level: 0}, code: "4,1"},
                {id: "mapledaemonheim", spot: {x: 3500, y: 3625, level: 0}, code: "4,2"},
                {id: "yewseers", spot: {x: 2708, y: 3462, level: 0}, code: "5,1"},
                {id: "yewcathery", spot: {x: 2755, y: 3431, level: 0}, code: "5,2"},
                {id: "yewedgeville", spot: {x: 3087, y: 3476, level: 0}, code: "5,3"},
                {id: "yewvarrock", spot: {x: 3208, y: 3502, level: 0}, code: "5,4"},
                {id: "yewcrwys", spot: {x: 2261, y: 3388, level: 0}, code: "5,5"},
                {id: "magicranging", spot: {x: 2693, y: 3428, level: 0}, code: "6,1"},
                {id: "magicsorcerer", spot: {x: 2702, y: 3397, level: 0}, code: "6,2"},
                {id: "magicmagetraining", spot: {x: 3357, y: 3310, level: 0}, code: "6,3"},
                {id: "magictirannwn", spot: {x: 2288, y: 3140, level: 0}, code: "6,4"},
                {id: "magiccrwys", spot: {x: 2250, y: 3366, level: 0}, code: "6,5"},
                {id: "eldersorcerer", spot: {x: 2733, y: 3410, level: 0}, code: "7,1"},
                {id: "elderyanille", spot: {x: 2574, y: 3065, level: 0}, code: "7,2"},
                {id: "eldergnomestronghold", spot: {x: 2423, y: 3455, level: 0}, code: "7,3"},
                {id: "elderdraynor", spot: {x: 3095, y: 3217, level: 0}, code: "7,4"},
                {id: "elderfalador", spot: {x: 3049, y: 3321, level: 0}, code: "7,5"},
                {id: "eldervarrock", spot: {x: 3257, y: 3371, level: 0}, code: "7,6"},
                {id: "elderlletya", spot: {x: 2292, y: 3146, level: 0}, code: "7,7"},
                {id: "elderpiscatoris", spot: {x: 2319, y: 3596, level: 0}, code: "7,8"},
                {id: "elderedgeville", spot: {x: 3094, y: 3451, level: 0}, code: "7,9,1"},
                {id: "elderrimmington", spot: {x: 2934, y: 3228, level: 0}, code: "7,9,2"},
                {id: "teaktai", spot: {x: 2814, y: 3084, level: 0}, code: "0,1,1"},
                {id: "teakape", spot: {x: 2772, y: 2698, level: 0}, code: "0,1,2"},
                {id: "teakcastlewars", spot: {x: 2333, y: 3048, level: 0}, code: "0,1,3"},
                {id: "mahoganyape", spot: {x: 2715, y: 2708, level: 0}, code: "0,2,2"},
                {id: "mahoganiharazi", spot: {x: 2934, y: 2928, level: 0}, code: "0,2,3"},
                {id: "arcticpine", spot: {x: 2355, y: 3848, level: 0}, code: "0,3"},
                {id: "acadia", spot: {x: 3187, y: 2720, level: 0}, code: "0,4"},
                {id: "ivynorthvarrock", spot: {x: 3218, y: 3499, level: 0}, code: "0,5,1"},
                {id: "ivyeastvarrock", spot: {x: 3232, y: 3460, level: 0}, code: "0,5,2"},
                {id: "ivynorthfalador", spot: {x: 3015, y: 3393, level: 0}, code: "0,5,3"},
                {id: "ivysouthfalador", spot: {x: 3044, y: 3327, level: 0}, code: "0,5,4"},
                {id: "ivytaverley", spot: {x: 2938, y: 3429, level: 0}, code: "0,5,5"},
                {id: "ivyardougne", spot: {x: 2623, y: 3308, level: 0}, code: "0,5,6"},
                {id: "ivyyanille", spot: {x: 2593, y: 3114, level: 0}, code: "0,5,7"},
                {id: "ivycastlewars", spot: {x: 2426, y: 3062, level: 0}, code: "0,5,8"},
                {id: "ivycrwys", spot: {x: 2241, y: 3377, level: 0}, code: "0,5,9"},
                {id: "idolsshipyard", spot: {x: 2932, y: 3026, level: 0}, code: "0,6,1"},
                {id: "idolsjadinko", spot: {x: 2947, y: 2976, level: 0}, code: "0,6,2"},

            ]
        }, {
            id: "archteleport", name: "Archaeology teleport (or outfit)", img: "archteleport.png",
            spots: [
                {id: "campus", spot: {x: 3329, y: 3379, level: 0}, code: "1", name: "Archaeology Campus"},
                {id: "kharidet", spot: {x: 3349, y: 3195, level: 0}, code: "2", name: "Kharid-et"},
                {id: "infernal", spot: {x: 3271, y: 3504, level: 0}, code: "3", name: "Infernal Source"},
                {id: "everlight", spot: {x: 3695, y: 3209, level: 0}, code: "4", name: "Everlight"},
                {id: "senntisten", spot: {x: 1784, y: 1295, level: 0}, code: "5", name: "Senntisten"},
                {id: "stormguard", spot: {x: 2682, y: 3403, level: 0}, code: "6", name: "Stormguard Citadel"},
                {id: "warforge", spot: {x: 2408, y: 2829, level: 0}, code: "7", name: "Warforge"},
                {id: "orthen", spot: {x: 5456, y: 2339, level: 0}, code: "8", name: "Orthen"},
                {id: "jacques", spot: {x: 3254, y: 3455, level: 0}, code: "9,1", name: "Collectors - Art Critic Jacques"},
                {id: "tess", spot: {x: 2550, y: 2854, level: 0}, code: "9,2", name: "Collectors - Chief Tess"},
                {id: "generals", spot: {x: 2957, y: 3510, level: 0}, code: "9,3", name: "Collectors - Generals Bentnoze & Wartface"},
                {id: "isaura", spot: {x: 2921, y: 9702, level: 0}, code: "9,4", name: "Collectors - Isaura"},
                {id: "lowse", spot: {x: 2988, y: 3269, level: 0}, code: "9,5", name: "Collectors - Lowse"},
                {id: "sharrigan", spot: {x: 5456, y: 2344, level: 0}, code: "9,6", name: "Collectors - Sharrigan"},
                {id: "atcha", spot: {x: 2962, y: 3347, level: 0}, code: "9,7", name: "Collectors - Sir Atcha"},
                {id: "soran", spot: {x: 3182, y: 3418, level: 0}, code: "9,8", name: "Collectors - Soran"},
                {id: "velucia", spot: {x: 3342, y: 3384, level: 0}, code: "9,9", name: "Collectors - Velucia"},
                {id: "wiseoldman", spot: {x: 3088, y: 3254, level: 0}, code: "9,0,1", name: "Collectors - Wise Old Man"},
            ]
        },
        {id: "ringofkinship", name: "Ring of Kinship", img: "ringofkinship.png", spots: [{id: "daemonheim", spot: {x: 3449, y: 3701, level: 0}}]},
        {
            id: "witchdoctormask",
            name: "Witchdoctor mask",
            img: "witchdoctormask.png",
            spots: [{id: "herblorehabitat", spot: {x: 2950, y: 2933, level: 0}, name: "Herblore Habitat"}]
        },
        {id: "exctophial", name: "Ectophial", img: "ectophial.png", spots: [{id: "ectofunctus", spot: {x: 3660, y: 3521, level: 0}}]},
        {
            id: "explorersring",
            name: "Explorer's ring",
            img: "explorersring.png",
            spots: [{id: "cabbagefield", spot: {x: 3053, y: 3290, level: 0}, name: "Cabbage field"}]
        },
        {
            id: "karamjagloves",
            name: "Karamja gloves",
            img: "karamjagloves.gif",
            spots: [{id: "gemmine", spot: {x: 2825, y: 2997, level: 0}}]
        },
        {
            id: "theheart",
            name: "The Heart teleport",
            img: "theheart.gif",
            spots: [{id: "center", spot: {x: 3199, y: 6942, level: 0}}]
        },
        {
            id: "fremmenikboots",
            name: "Fremmenik sea boots",
            img: "fremmenikboots.gif",
            spots: [{id: "relekkamarket", spot: {x: 2642, y: 3678, level: 0}, name: "Relekka Market"}]
        },
        {
            id: "legendscape",
            name: "Legends Cape",
            img: "legendscape.png",
            spots: [{id: "legendsguild", spot: {x: 2728, y: 3348, level: 0}}]
        },
        {
            id: "archjounal",
            name: "Archaeology journal",
            img: "archjournal.png",
            spots: [{id: "guild", spot: {x: 3334, y: 3379, level: 0}}]
        },
        {
            id: "skullsceptre",
            name: "Skull Sceptre",
            img: "skullsceptre.png",
            spots: [
                {id: "outside", spot: {x: 3081, y: 3422, level: 0}, code: "1", name: "Outside"},
                {id: "war", spot: {x: 1862, y: 5241, level: 0}, code: "2", name: "Vault of War"},
                {id: "famine", spot: {x: 2044, y: 5244, level: 0}, code: "3", name: "Catacomb of Famine"},
                {id: "pestillence", spot: {x: 2125, y: 5253, level: 0}, code: "4", name: "Pit of Pestilence"},
                {id: "death", spot: {x: 2359, y: 5211, level: 0}, code: "5", name: "Sepulchre of Death"},
            ]
        },
        {
            id: "dragonkinlaboratory",
            name: "Dragonking Laboratory teleport",
            img: "dragonkin.png",
            spots: [{id: "", spot: {x: 3368, y: 3887, level: 0}}]
        },
        {
            id: "wildernessobelisk", name: "Portable obelisk", img: "portableobelisk.png",
            spots: [
                {id: "13", spot: {x: 3156, y: 3620, level: 0}, code: "1", name: "Level 13"},
                {id: "18", spot: {x: 3219, y: 3656, level: 0}, code: "2", name: "Level 18"},
                {id: "27", spot: {x: 3035, y: 3732, level: 0}, code: "3", name: "Level 27"},
                {id: "35", spot: {x: 3106, y: 3794, level: 0}, code: "4", name: "Level 35"},
                {id: "44", spot: {x: 2980, y: 3866, level: 0}, code: "5", name: "Level 44"},
                {id: "50", spot: {x: 3307, y: 3916, level: 0}, code: "6", name: "Level 50"},
            ]
        }, {
            id: "wildernesssword", name: "Wilderness sword", img: "wildernesssword.png",
            spots: [
                {id: "edgeville", spot: {x: 3086, y: 3501, level: 0}, code: "1,1", name: "Edgeville"},
                {id: "herbpatch", spot: {x: 3143, y: 3820, level: 0}, code: "1,2", name: "Herb patch"},
                {id: "forinthry", spot: {x: 3071, y: 3649, level: 0}, code: "1,3", name: "Forinthry Dungeon"},
                {id: "agility", spot: {x: 2998, y: 3913, level: 0}, code: "1,5", name: "Wilderness Agility course"},
            ]
        }, {
            id: "lyre", name: "Enchanted lyre", img: "enchantedlyre.png",
            spots: [
                {id: "relekka", spot: {x: 2651, y: 3689, level: 0}, code: "1", name: "Relekka"},
                {id: "waterbirth", spot: {x: 2529, y: 3740, level: 0}, code: "2", name: "Waterbirth Island"},
                {id: "neitiznot", spot: {x: 2311, y: 3787, level: 0}, code: "3", name: "Neitiznot"},
                {id: "jatizso", spot: {x: 2403, y: 3782, level: 0}, code: "4", name: "Jatizso"},
                {id: "miscellania", spot: {x: 2516, y: 3859, level: 0}, code: "5", name: "Miscellania"},
                {id: "etceteria", spot: {x: 2592, y: 3879, level: 0}, code: "6", name: "Etceteria"},
                {id: "relekkamarket", spot: {x: 2642, y: 3676, level: 0}, code: "7", name: "Relekka Market"},
            ]
        }, {
            id: "charterships", name: "Charter Ships", img: "sail.png",
            spots: [
                {id: "tyras", spot: {x: 2142, y: 3122, level: 0}, name: "Port Tyras"},
                {id: "brimhaven", spot: {x: 2760, y: 3238, level: 0}, name: "Brimhaven"},
                {id: "catherby", spot: {x: 2796, y: 3406, level: 0}, name: "Catherby"},
                {id: "khazard", spot: {x: 2674, y: 3144, level: 0}, name: "Port Khazard"},
                {id: "ooglog", spot: {x: 2623, y: 2857, level: 0}, name: "Oo'glog"},
                {id: "karamja", spot: {x: 2954, y: 3158, level: 0}, name: "Karamja"},
                {id: "shipyard", spot: {x: 3001, y: 3032, level: 0}, name: "Shipyard"},
                {id: "sarim", spot: {x: 3043, y: 3191, level: 0}, name: "Port Sarim"},
                {id: "phasmatys", spot: {x: 3702, y: 3503, level: 0}, name: "Port Phasmatys"},
                {id: "mosleharmless", spot: {x: 3671, y: 2931, level: 0}, name: "Mos Le'Harmless"},
                {id: "menaphos", spot: {x: 3140, y: 2662, level: 0}, name: "Menaphos"},
            ]
        },
        {
            id: "dragontrinkets", name: "Dragon Trinkets", img: "dragontrinkets.png",
            spots: [
                {id: "green", spot: {x: 3303, y: 5468, level: 0}, name: "Green Dragons", code: "1,1"},
                {id: "brutalgreen", spot: {x: 2512, y: 3511, level: 0}, name: "Brutal Green Dragons", code: "1,2"},
                {id: "blue", spot: {x: 2891, y: 9769, level: 0}, name: "Blue Dragons", code: "2"},
                {id: "red", spot: {x: 2731, y: 9529, level: 0}, name: "Red Dragons", code: "3"},
                {id: "black", spot: {x: 2453, y: 4476, level: 0}, name: "Black Dragons", code: "4,1"},
                {id: "kbd", spot: {x: 3051, y: 3519, level: 0}, name: "King Black Dragon", code: "4,2"},
                {id: "qbd", spot: {x: 1198, y: 6499, level: 0}, name: "Queen Black Dragon", code: "4,2"},
            ]
        },
        {
            id: "metallicdragontrinkets", name: "Metallic Dragon Trinkets", img: "metallicdragontrinkets.png",
            spots: [
                {id: "bronze", spot: {x: 2723, y: 9486, level: 0}, name: "Bronze Dragons", code: "1"},
                {id: "iron", spot: {x: 2694, y: 9443, level: 0}, name: "Iron Dragons", code: "2"},
                {id: "steel", spot: {x: 2708, y: 9468, level: 0}, name: "Steel Dragons", code: "3"},
                {id: "mithril", spot: {x: 1778, y: 5346, level: 0}, name: "Mithril Dragons", code: "4"},
                //{subid: "adamant", spot: {x: 0, y: 0, level: 0}, hover: "Adamant Dragons", code: "5,1"},
                {id: "rune", spot: {x: 2367, y: 3353, level: 0}, name: "Rune Dragons", code: "5,2"},
            ]
        },
        {
            id: "amuletofnature", name: "Amulet of Nature", img: "amuletofnature.png",
            spots: [
                {id: "draynornightshade", spot: {x: 3086, y: 3353, level: 0}, name: "Nightshade Patch"},
                {id: "herblorehabitat", spot: {x: 2949, y: 2904, level: 0}, name: "Vine Bush Patch"},
                {id: "faladortree", spot: {x: 3006, y: 3375, level: 0}, name: "Falador Tree Patch"},
                {id: "harmonyallotment", spot: {x: 3793, y: 2832, level: 0}, name: "Harony Island Allotment Patch"},
            ]
        },
        {
            id: "tokkulzo", name: "TokKul-Zo", img: "tokkulzo.png",
            spots: [
                {id: "plaza", spot: {x: 4672, y: 5155, level: 0}, name: "Main Plaza", code: "1"},
                {id: "pit", spot: {x: 4603, y: 5062, level: 0}, name: "Fight Pit", code: "2"},
                {id: "cave", spot: {x: 4616, y: 5131, level: 0}, name: "Fight Cave", code: "3"},
                {id: "kiln", spot: {x: 4744, y: 5171, level: 0}, name: "Fight Kiln", code: "4"},
                {id: "cauldron", spot: {x: 4787, y: 5127, level: 0}, name: "Fight Cauldron", code: "5"},
            ]
        }
        //TODO: Eagle transport system
        //TODO: Canoes
        //TODO: Orthen Teleport network
        //TODO: Anachronia teleport (totems)
        //TODO: grand seed pod
        //TODO: Boss portals
        //      - 1912 4367 Dagannoth Kings
        // TODO: Slayer masks
    ]

    export function getAllFlattened(): flat_teleport[] {
        if(!flattened_all) flattened_all = Teleports.flatten(raw_data)

        return flattened_all
    }

    let flattened_all: flat_teleport[]

    export function resolveTarget(id: full_teleport_id): MapCoordinate {
        let spot = raw_data.find((g) => g.id == id.group)
            ?.spots.find((s) => s.id == id.sub)

        if (id.variant && Array.isArray(spot.spot)) return spot.spot.find((v) => v.id == id.variant)?.spot
        else return spot.spot as MapCoordinate
    }
}
