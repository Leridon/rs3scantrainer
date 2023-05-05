import * as leaflet from "leaflet"
import {MapCoordinate} from "../../model/coordinates";

type spot = {
    spot: MapCoordinate | ({ id: string, name: string, spot: MapCoordinate }[]),
    code?: string,
    has_variants?: boolean
    hover?: string,
    img?: string
}

export type teleport_item = {
    id: string,
    name: string,
    img: string
    can_be_in_pota?: boolean,
    spots: spot[]
}

const teles: teleport_item[] = [{
    id: "home",
    name: "Lodestone",
    img: "homeport.png",
    spots: [
        {spot: {x: 3297, y: 3184}, code: "A", hover: "Al-Kharid"},
        {spot: {x: 2634, y: 3348}, code: "Alt+A", hover: "Ardounge"},
        {spot: {x: 2474, y: 2708, level: 2}, code: "Shift+A", hover: "Ashdale"},
        {spot: {x: 3214, y: 2954}, code: "Alt+B", hover: "Bandit Camp"},
        {spot: {x: 2899, y: 3544}, code: "B", hover: "Burthope"},
        {spot: {x: 3517, y: 3515}, code: "Alt+C", hover: "Canifis"},
        {spot: {x: 2811, y: 3449}, code: "C", hover: "Cathery"},
        {spot: {x: 3105, y: 3298}, code: "D", hover: "Draynor"},
        {spot: {x: 2366, y: 3479}, code: "Alt+E", hover: "Eagle's Peak"},
        {spot: {x: 3067, y: 3505}, code: "E", hover: "Edgeville"},
        {spot: {x: 2967, y: 3403}, code: "F", hover: "Falador"},
        {spot: {x: 2712, y: 3677}, code: "Alt+F", hover: "Fremmenik Province"},
        {spot: {x: 2761, y: 3147}, code: "K", hover: "Karamja"},
        {spot: {x: 3233, y: 3221}, code: "L", hover: "Lumbridge"},
        {spot: {x: 2085, y: 3914}, code: "Alt+L", hover: "Lunar Isle"},
        {spot: {x: 2532, y: 2871}, code: "O", hover: "Oo'glog"},
        {spot: {x: 3011, y: 3215}, code: "P", hover: "Port Sarim"},
        {spot: {x: 2208, y: 3360, level: 1}, code: "Alt+P", hover: "Prifddinas"},
        {spot: {x: 2689, y: 3482}, code: "S", hover: "Seers' Village"},
        {spot: {x: 2878, y: 3442}, code: "T", hover: "Taverley"},
        {spot: {x: 2254, y: 3149}, code: "Alt+T", hover: "Tirannwn"},
        {spot: {x: 3214, y: 3376}, code: "V", hover: "Varrock"},
        {spot: {x: 3143, y: 3635}, code: "W", hover: "Wilderness"},
        {spot: {x: 2529, y: 3094}, code: "Y", hover: "Yanille"},
        {spot: {x: 3216, y: 2716}, code: "M", hover: "Menaphos"},
        {spot: {x: 3298, y: 3525}, code: "Alt+W", hover: "Fort Forinthry"},
    ]
}, {
    id: "normalspellbook",
    name: "Normal Spellbook",
    img: "",
    spots: [
        {
            has_variants: true,
            spot: [
                {id: "default", name: "Camelot", spot: {x: 2758, y: 3477}},
                {id: "seers", name: "Seer's Village", spot: {x: 2707, y: 3483}},
            ],
            img: "tele-cam.png",
            hover: "Camelot"
        },
        {
            has_variants: true,
            spot: [
                {id: "default", name: "Varrock", spot: {x: 3212, y: 3433}},
                {id: "grandexchange", name: "Grand Exchange", spot: {x: 3165, y: 3464}},
                {id: "church", name: "Church", spot: {x: 3246, y: 3479}},
            ],
            img: "tele-var.png",
            hover: "Varrock"
        },
        {
            has_variants: true,
            spot: [
                {id: "default", name: "Watchtower", spot: {x: 2548, y: 3115}},
                {id: "yanille", name: "Yanille", spot: {x: 2574, y: 3090}},
            ],
            img: "tele-watch.png",
            hover: "Watchtower"
        },
        {spot: {x: 3220, y: 3245}, img: "tele-lum.png", hover: "Lumbridge"},
        {spot: {x: 2966, y: 3381}, img: "tele-fal.png", hover: "Falador"},
        {spot: {x: 2661, y: 3302}, img: "tele-ard.png", hover: "Ardougne"},
        {spot: {x: 2414, y: 2847}, img: "tele-mob.png", hover: "South Feldip Hills"},
        {spot: {x: 2910, y: 3421}, img: "tele-taverley.png", hover: "Taverley"},
        {spot: {x: 2908, y: 3724}, img: "tele-god.png", hover: "God Wars"},
        {spot: {x: 2881, y: 3669}, img: "tele-troll.png", hover: "Trollheim"},
        {spot: {x: 2798, y: 2791}, img: "tele-ape.png", hover: "Ape Atoll"},
    ]
}, {
    id: "ancientspellook",
    name: "Ancient Spellbook",
    img: "",
    spots: [
        {spot: {x: 3379, y: 3402}, img: "tele-senntisten.png", hover: "Senntisten (Dig site)"},
        {spot: {x: 3499, y: 3488}, img: "tele-kharyrll.png", hover: "Kharyrll"},
        {spot: {x: 3008, y: 3475}, img: "tele-lassar.png", hover: "Lassar"},
        {spot: {x: 2969, y: 3699}, img: "tele-dareeyak.png", hover: "Dareeyak"},
        {spot: {x: 3223, y: 3665}, img: "tele-carrallaner.png", hover: "Carrallanger"},
        {spot: {x: 3288, y: 3888}, img: "tele-annakarl.png", hover: "Annakarl"},
        {spot: {x: 2979, y: 3877}, img: "tele-ghorrock.png", hover: "Ghorrock"},
    ]
}, {
    id: "lunarspellbook",
    name: "Lunar Spellbook",
    img: "",
    spots: [
        {spot: {x: 2111, y: 3917}, img: "tele-moonclan.png", hover: "Moonclan"},
        {spot: {x: 2468, y: 3248}, img: "tele-ourania.png", hover: "Ourania Altar"},
        {spot: {x: 3057, y: 3311}, img: "tele-southfalador.png", hover: "South Falador"},
        {spot: {x: 2548, y: 3758}, img: "tele-waterbirth.png", hover: "Waterbirth"},
        {spot: {x: 2542, y: 3570}, img: "tele-barbarian.png", hover: "Barbarian Outpost"},
        {spot: {x: 2670, y: 3375}, img: "tele-northardougne.png", hover: "North Ardougne"},
        {spot: {x: 2634, y: 3167}, img: "tele-khazard.png", hover: "Port Khazard"},
        {spot: {x: 2614, y: 3383}, img: "tele-fishing.png", hover: "Fishing Guild"},
        {spot: {x: 2803, y: 3450}, img: "tele-catherby.png", hover: "Catherby"},
        {spot: {x: 2975, y: 3941}, img: "tele-iceplateau.png", hover: "Ice Plateau"},
        {spot: {x: 2818, y: 3676}, img: "tele-trollheim.png", hover: "Trollheim"},
    ]
}, {
    id: "greenteleport",
    name: "Green Teleports",
    img: "",
    spots: [
        {spot: {x: 2606, y: 3217, level: 1}, img: "monastery.png", hover: "Kandarin Monastery",},
        {spot: {x: 2670, y: 3372, level: 1}, img: "pof.png", hover: "Ardougne Farm"},
        {spot: {x: 2276, y: 3313, level: 1}, img: "max.png", hover: "Max guild"},
        {spot: {x: 3364, y: 3502, level: 1}, img: "skhorror.png", hover: "Skeletal Horror"},
    ]
}, {
    id: "houseteleports",
    name: "House Teleports",
    img: "modhouse.gif",
    spots: [
        {spot: {x: 2953, y: 3223}, hover: "Rimmington house", code: "1"},
        {spot: {x: 2883, y: 3452}, hover: "Taverley house", code: "2"},
        {spot: {x: 3339, y: 3001}, hover: "Pollnivneach house", code: "3"},
        {spot: {x: 2670, y: 3632}, hover: "Rellekka house", code: "4"},
        {spot: {x: 2757, y: 3178}, hover: "Brimhaven house", code: "5"},
        {spot: {x: 2544, y: 3095}, hover: "Yanille house", code: "6"},
        {spot: {x: 2890, y: 3675}, hover: "Trollheim house tablet", code: "7"},
        {spot: {x: 2166, y: 3335}, hover: "Prifddinas house tablet", code: "8"},
        {spot: {x: 3123, y: 2632}, hover: "Menaphos house tablet", code: "0,1"},
    ]
}, {
    id: "teleportscrolls",
    name: "Teleport Scrolls",
    img: "",
    spots: [
        {spot: {x: 3160, y: 3458}, img: "scroll-grandexchange.png", hover: "Grand Exchange", code: "1"},
        {spot: {x: 3169, y: 2981}, img: "scroll-banditcamp.png", hover: "Bandit Camp", code: "2"},
        {spot: {x: 2593, y: 3253}, img: "scroll-clocktower.png", hover: "Clocktower", code: "3"},
        {spot: {x: 2523, y: 3062}, img: "scroll-gutanoth.png", hover: "Gu'Tanoth", code: "4"},
        {spot: {x: 2512, y: 3632}, img: "scroll-lighthouse.png", hover: "Lighthouse", code: "5"},
        {spot: {x: 3302, y: 3550}, img: "scroll-fortforinthry.png", hover: "Forintry Teleport", code: "6"},
        {spot: {x: 2514, y: 3862}, img: "scroll-miscellania.png", hover: "Miscellania", code: "7"},
        {spot: {x: 2293, y: 3620}, img: "scroll-phoenixlair.png", hover: "Phoenix Lair", code: "8"},
        {spot: {x: 3360, y: 2966}, img: "scroll-pollnivneach.png", hover: "Pollnivneach", code: "9"},
        {spot: {x: 2801, y: 3085}, img: "scroll-taibwowannai.png", hover: "Tai Bwo Wannai", code: "0"},

    ]
}, {
    id: "teleportseeds",
    name: "Teleport Seed",
    img: "crystal.gif",
    spots: [
        {spot: {x: 2335, y: 3171, level: 1}, hover: "Lletya", code: "1"},
        {spot: {x: 2156, y: 3382, level: 1}, hover: "Amlodd", code: "3"},
        {spot: {x: 2262, y: 3338, level: 1}, hover: "Cadarn", code: "4"},
        {spot: {x: 2261, y: 3382, level: 1}, hover: "Cwrys", code: "5"},
        {spot: {x: 2187, y: 3410, level: 1}, hover: "Hefin", code: "6"},
        {spot: {x: 2186, y: 3310, level: 1}, hover: "Iowerth", code: "7"},
        {spot: {x: 2156, y: 3338, level: 1}, hover: "Ithell", code: "8"},
        {spot: {x: 2231, y: 3410, level: 1}, hover: "Meilyr", code: "9"},
        {spot: {x: 2232, y: 3310, level: 1}, hover: "Trahaearn", code: "0"},
    ]
}, {
    id: "menaphostablets",
    name: "Menaphos Tablets",
    img: "",
    spots: [
        {spot: {x: 3177, y: 2730, level: 1}, img: "imperialdistrict.gif", hover: "Imperial district", code: "1"},
        {spot: {x: 3208, y: 2784, level: 1}, img: "merchantdistrict.gif", hover: "Merchant district", code: "2"},
        {spot: {x: 3187, y: 2654, level: 1}, img: "portdistrict.gif", hover: "Port district", code: "3"},
        {spot: {x: 3154, y: 2800, level: 1}, img: "workerdistrict.gif", hover: "Worker district", code: "4"},
        {spot: {x: 3291, y: 2710, level: 1}, img: "sophanemdungeon.gif", hover: "Sophanem Dungeon", code: "5"},
    ]
}, {
    id: "spirittree",
    name: "Spirit Tree",
    img: "spirittree.png",
    spots: [
        {spot: {x: 2542, y: 3168}, hover: "Tree Gnome Village", code: "1"},
        {spot: {x: 2462, y: 3444}, hover: "Tree Gnome Stronghold", code: "2"},
        {spot: {x: 2557, y: 3257}, hover: "Battlefield of Khazard", code: "3"},
        {spot: {x: 3188, y: 3508}, hover: "Grand Exchange", code: "4"},
        {spot: {x: 2416, y: 2849}, hover: "South Feldip Hills", code: "5"},
        {spot: {x: 3058, y: 3255}, hover: "Port Sarim", code: "6"},
        {spot: {x: 2614, y: 3855}, hover: "Etceteria", code: "7"},
        {spot: {x: 2800, y: 3203}, hover: "Brimhaven", code: "8"},
        {spot: {x: 2337, y: 3109}, hover: "Poison Waste", code: "9"},
        {spot: {x: 2272, y: 3371, level: 1}, hover: "Prifddinas", code: "0"},

    ]
}, {
    id: "fairyring",
    name: "Fairy Ring",
    img: "fairyring.gif",
    spots: [
        {spot: {x: 2996, y: 3114}, code: "AIQ"},
        {spot: {x: 2700, y: 3247}, code: "AIR"},
        {spot: {x: 2780, y: 3613}, code: "AJR"},
        {spot: {x: 2500, y: 3896}, code: "AJS"},
        {spot: {x: 2319, y: 3619}, code: "AKQ"},
        {spot: {x: 2571, y: 2956}, code: "AKS"},
        {spot: {x: 2473, y: 3028}, code: "ALP"},
        {spot: {x: 3597, y: 3495}, code: "ALQ"},
        {spot: {x: 2644, y: 3495}, code: "ALS"},
        {spot: {x: 3410, y: 3324}, code: "BIP"},
        {spot: {x: 3251, y: 3095}, code: "BIQ"},
        {spot: {x: 2635, y: 3266}, code: "BIS"},
        {spot: {x: 1936, y: 3137}, code: "BJS"},
        {spot: {x: 2385, y: 3035}, code: "BKP"},
        {spot: {x: 3469, y: 3431}, code: "BKR"},
        {spot: {x: 4622, y: 5147}, code: "BLP"},
        {spot: {x: 2740, y: 3351}, code: "BLR"},
        {spot: {x: 2513, y: 3884}, code: "CIP"},
        {spot: {x: 2528, y: 3127}, code: "CIQ"},
        {spot: {x: 2705, y: 3576}, code: "CJR"},
        {spot: {x: 2901, y: 2930}, code: "CJS", hover: "You have to plant this fairy ring first (using 5 bittercap mushrooms)."},
        {spot: {x: 3086, y: 2704}, code: "CKQ"},
        {spot: {x: 2801, y: 3003}, code: "CKR"},
        {spot: {x: 3447, y: 3470}, code: "CKS"},
        {spot: {x: 3082, y: 3206}, code: "CLP"},
        {spot: {x: 2682, y: 3081}, code: "CLS"},
        {spot: {x: 2735, y: 2742}, code: "CLR"},
        {spot: {x: 3763, y: 2930}, code: "DIP"},
        {spot: {x: 3092, y: 3137}, code: "DIS"},
        {spot: {x: 2658, y: 3230}, code: "DJP"},
        {spot: {x: 2676, y: 3587}, code: "DJR"},
        {spot: {x: 2130, y: 3369}, code: "DJS"},
        {spot: {x: 2900, y: 3111}, code: "DKP"},
        {spot: {x: 3129, y: 3496}, code: "DKR"},
        {spot: {x: 2744, y: 3719}, code: "DKS"},
        {spot: {x: 3423, y: 3016}, code: "DLQ"},
        {spot: {x: 2213, y: 3099}, code: "DLR"},
        //ais guthix dream
        //ajq dorghes kaan agi dungeon
        //alr the abbyss
        //bir stuck in forrest zanaris
        //bjq waterfiends kura dung
        //bjr fisher realm
        //bkq spirit realm
        //blq yubuisk
        //cis evil bobs island
        //ckp floating space lsd thingy
        //dir gorak plane
        //dkq glacors
        //dls canifis cave
    ]
}, {
    id: "slayercape",
    name: "Slayer Cape",
    img: "capeslay.gif",
    spots: [
        {spot: {x: 3050, y: 3953}, code: "1", hover: "Mandrith"},
        {spot: {x: 5671, y: 2138}, code: "2", hover: "Laniakea"},
        {spot: {x: 2197, y: 3327, level: 1}, code: "3", hover: "Morvran"},
        // 4 Kuradal
        {spot: {x: 2870, y: 2982, level: 1}, code: "5", hover: "Lapalok"},
        {spot: {x: 3359, y: 2993}, code: "6", hover: "Sumona"},
        {spot: {x: 2447, y: 4431}, code: "7", hover: "Chealdar"},
        {spot: {x: 3510, y: 3507}, code: "8", hover: "Mazchna"},
        {spot: {x: 3295, y: 3546}, code: "9", hover: "The Raptor"},
        {spot: {x: 3094, y: 3481}, code: "0,1", hover: "Vannaka"},
        {spot: {x: 3221, y: 3223}, code: "0,2", hover: "Jacquelyn"},
        {spot: {x: 2887, y: 3544}, code: "0,3", hover: "Spria"},
    ]
}, {
    id: "dungcape",
    name: "Dungeoneering Cape",
    img: "capedung.gif",
    spots: [
        {spot: {x: 3132, y: 9914}, code: "1", hover: "Karamja volcano"},
        {spot: {x: 3035, y: 9772}, code: "2", hover: "Dwarven mine"},
        {spot: {x: 3104, y: 9827}, code: "3", hover: "Hill giants"},
        {spot: {x: 2844, y: 9558}, code: "4", hover: "Karamja volcano"},
        {spot: {x: 3511, y: 3666}, code: "5", hover: "Daemonheim wc"},
        {spot: {x: 2511, y: 3464}, code: "6", hover: "Waterfall fire giants"},
        {spot: {x: 3019, y: 3339}, code: "7", hover: "Mining guild"},
        {spot: {x: 2127, y: 5146}, code: "8", hover: "Braindeath Island"},
        {spot: {x: 2854, y: 9841}, code: "9", hover: "Taverley dungeon hellhounds"},
        {spot: {x: 2911, y: 9810}, code: "0,1", hover: "Taverley dungeon blue dragons"},
        {spot: {x: 3165, y: 9880}, code: "0,2", hover: "Varrock sewers"},
        {spot: {x: 3817, y: 3529}, code: "0,3", hover: "Dragontooth island"},
        {spot: {x: 3160, y: 5522}, code: "0,4", hover: "Chaos Tunnels"},
        {spot: {x: 3297, y: 3310}, code: "0,5", hover: "Al Kharid mine"},
        {spot: {x: 2695, y: 9440}, code: "0,6", hover: "Brimhaven metal dragons"},
        {spot: {x: 4661, y: 5490}, code: "0,7", hover: "Polypore dungeon"},
        {spot: {x: 3033, y: 9599}, code: "0,8", hover: "Frost dragons"},
        {spot: {x: 3399, y: 3665}, code: "0,9", hover: "Daemonheim demons"},
        {spot: {x: 2237, y: 3424}, code: "0,0,1", hover: "Gorajo hoardstalker"},
        {spot: {x: 3434, y: 3535}, code: "0,0,2", hover: "Slayer tower dungeon"},
        {spot: {x: 2237, y: 3397}, code: "0,0,3", hover: "Edimmu dungeon"},
    ]
}, {
    id: "questcape",
    name: "Quest Cape",
    img: "capequest.png",
    spots: [
        //1 tds cave
        //2 gower quest bts
        {spot: {x: 3192, y: 3357}, code: "3", hover: "Champion's Guild"},
        {spot: {x: 3375, y: 3402}, code: "4", hover: "The empty throne room"},
        {spot: {x: 2912, y: 3840}, code: "5", hover: "Glacor cavern"},
        //6 heroes guild underground
        {spot: {x: 2730, y: 3353}, code: "7", hover: "Legends' Guild"},
        {spot: {x: 3250, y: 9518}, code: "8", hover: "Tears of Guthix"},
        {spot: {x: 3255, y: 3449}, code: "9", hover: "Varrock Museum"},
        {spot: {x: 2371, y: 3355}, code: "0", hover: "The World Gate"},
    ]
}, {
    id: "sixthage",
    name: "Sixth Age Circuit",
    img: "sixthagecircuit.gif",
    spots: [
        {spot: {x: 2709, y: 3373}, code: "1", hover: "Guthix's Shrine"},
        {spot: {x: 2367, y: 3355}, code: "2", hover: "World Gate"},
        {spot: {x: 2265, y: 3554}, code: "3", hover: "Guthix Memorial"},
        //4 Guthix temple
    ]
}, {
    id: "desertamulet", name: "Desert Amulet", img: "desertamulet.gif", spots: [
        {spot: {x: 3434, y: 2914}, code: "1", hover: "Nardah"},
        {spot: {x: 3478, y: 3103}, code: "2", hover: "Uzer"},
    ]
}, {
    id: "piratebook", name: "Big book o´piracy", img: "bookopiracy.gif",
    spots: [
        {spot: {x: 3684, y: 2958}, code: "1", hover: "Mos Le'Harmless"},
        {spot: {x: 2162, y: 5114}, code: "2", hover: "Braindeath Island"},
        {spot: {x: 3793, y: 3559}, code: "3", hover: "Dragontooth Isle"},
        {spot: {x: 3797, y: 2836}, code: "3", hover: "Harmony Island"},
    ]
}, {
    id: "amuletofglory", name: "Amulet of Glory", img: "jewellry_amuletofglory.png", can_be_in_pota: true,
    spots: [
        {spot: {x: 3088, y: 3497}, code: "1", hover: "Edgeville"},
        {spot: {x: 2919, y: 3175}, code: "2", hover: "Karamja"},
        {spot: {x: 3081, y: 3250}, code: "3", hover: "Draynor"},
        {spot: {x: 3305, y: 3123}, code: "4", hover: "Al Kharid"},
    ]
}, {
    id: "combatbracelet", name: "Combat bracelet", img: "jewellry_combatbracelet.png", can_be_in_pota: true,
    spots: [
        {spot: {x: 2879, y: 3543}, code: "1", hover: "Warriors' Guild"},
        {spot: {x: 3192, y: 3366}, code: "2", hover: "Champions' Guild"},
        {spot: {x: 3052, y: 3490}, code: "3", hover: "Edgeville Monastery"},
        {spot: {x: 2657, y: 3440}, code: "4", hover: "Ranging Guild"},
    ]
}, {
    id: "digsitependant", name: "Dig Site pendant", img: "jewellry_digsitependant.png", can_be_in_pota: true,
    spots: [
        {spot: {x: 3358, y: 3396}, code: "1", hover: "Digsite"},
        {spot: {x: 3375, y: 3445}, code: "2", hover: "Senntisten (pendant)"},
        {spot: {x: 3362, y: 3345}, code: "3", hover: "Exame Centre"},
    ]
}, {
    id: "enlightenedamulet", name: "Enlightened amulet", img: "jewellry_enlightenedamulet.png", can_be_in_pota: true,
    spots: [
        {spot: {x: 3216, y: 3182}, code: "1", hover: "Nexus"},
        {spot: {x: 3229, y: 3657}, code: "2", hover: "Graveyard of Shadows"},
        {spot: {x: 3170, y: 2992}, code: "3", hover: "Bandit camp"},
    ]
}, {
    id: "gamesnecklace", name: "Games necklace", img: "jewellry_gamesnecklace.png", can_be_in_pota: true,
    spots: [
        {spot: {x: 2878, y: 3564}, code: "1", hover: "Troll invasion"},
        {spot: {x: 2519, y: 3572}, code: "2", hover: "Barbarian Outpost"},
        //{spot: {x: 2992, y: 3412}, code: "3", hover: "Gamer's grotto"},
        {spot: {x: 2453, y: 2729}, code: "4", hover: "Agoroth"},
        {spot: {x: 3216, y: 3784}, code: "5", hover: "Corpereal Beast"},
        {spot: {x: 3485, y: 3239}, code: "6", hover: "Burgh De Rott"},
        {spot: {x: 3252, y: 9517}, code: "7", hover: "Tears of Guthix"},

    ]
}, {
    id: "ringofduelling", name: "Ring of duelling", img: "jewellry_duelring.png", can_be_in_pota: true,
    spots: [
        {spot: {x: 3321, y: 3231}, code: "1", hover: "Duel arena"},
        {spot: {x: 2444, y: 3089}, code: "2", hover: "Castle wars"},
        {spot: {x: 2414, y: 2843}, code: "3", hover: "South Feldip Hills"},
        //{ sub: "duel", r: /^Fist of Guthix Ring of duelling/i, n: "Fist of Guthix", x: 2997, z: 3411, img: "duelling.gif", code: "4" },
    ]
}, {
    id: "ringofrespawn", name: "Ring of respawn", img: "jewellry_ringofrespawn.png", can_be_in_pota: true,
    spots: [
        {spot: {x: 3221, y: 3219}, code: "1", hover: "Lumbridge spawn"},
        {spot: {x: 2970, y: 3339}, code: "2", hover: "Falador spawn"},
        {spot: {x: 2758, y: 3481}, code: "3", hover: "Camelot spawn"},
        {spot: {x: 3082, y: 3475}, code: "4", hover: "Soul Wars spawn"},
        {spot: {x: 2888, y: 3538}, code: "5", hover: "Burthorpe spawn"},
    ]
}, {
    id: "ringofslaying", name: "Ring of slaying", img: "jewellry_ringofslaying.png", can_be_in_pota: true,
    spots: [
        {spot: {x: 3362, y: 2992}, code: "1", hover: "Sumona"},
        {spot: {x: 3423, y: 3524}, code: "2", hover: "Slayer Tower"},
        {spot: {x: 2789, y: 3627}, code: "3", hover: "Fremennik Slayer Dungeon"},
        // Tarns lair
    ]
}, {
    id: "ringofwealth", name: "Ring of Wealth", img: "jewellry_ringofwealth.png", can_be_in_pota: true,
    spots: [
        {spot: {x: 2508, y: 3862}, code: "1", hover: "Miscellania"},
        {spot: {x: 3165, y: 3462}, code: "2", hover: "Grand Exchange"},
        {spot: {x: 2858, y: 10200}, code: "3", hover: "Keldagrim"},
    ]
}, {
    id: "skillsnecklace", name: "Skills necklace", img: "jewellry_skillsnecklace.png", can_be_in_pota: true,
    spots: [
        {spot: {x: 2614, y: 3386}, code: "1", hover: "Fishing Guild"},
        {spot: {x: 3023, y: 3339}, code: "2", hover: "Mining Guild"},
        {spot: {x: 2934, y: 3291}, code: "3", hover: "Crafting Guild"},
        {spot: {x: 3144, y: 3443}, code: "4", hover: "Cooking Guild"},
        {spot: {x: 2998, y: 3440}, code: "5", hover: "Invention guild"},
        {spot: {x: 2645, y: 3354}, code: "6", hover: "Farming Guild"},
        {spot: {x: 3097, y: 3156}, code: "7", hover: "Runecrafting Guild"},
    ]
}, {
    id: "travellersnecklace", name: "Traveller's necklace", img: "jewellry_travellersnecklace.png", can_be_in_pota: true,
    spots: [
        {spot: {x: 3103, y: 3182}, code: "1", hover: "Wizard's Tower"},
        {spot: {x: 2444, y: 3346}, code: "2", hover: "The Outpost"},
        {spot: {x: 3426, y: 3143}, code: "3", hover: "Desert Eagle's Eyrie"},
    ]
}, {
    id: "davesspellbook", name: "Dave's spellbook", img: "davebook.gif",
    spots: [
        {spot: {x: 2444, y: 3182}, code: "1", hover: "Watchtower"},
        {spot: {x: 2794, y: 3419}, code: "2", hover: "Camelot"},
        {spot: {x: 3006, y: 3321}, code: "3", hover: "Falador"},
        {spot: {x: 2538, y: 3308}, code: "4", hover: "Ardounge"},
        {spot: {x: 3170, y: 3199}, code: "5", hover: "Lumbridge"},
        {spot: {x: 3254, y: 3449}, code: "6", hover: "Varrock"},
    ]
}, {
    id: "drakansmedallion", name: "Drakan's medallion", img: "drakmed.gif",
    spots: [
        {spot: {x: 3565, y: 3316}, code: "1", hover: "Barrows"},
        {spot: {x: 3491, y: 3202}, code: "2", hover: "Burgh de Rott"},
        {spot: {x: 3639, y: 3250}, code: "3", hover: "Meiyerditch"},
        {spot: {x: 3624, y: 3365}, code: "4", hover: "Darkmeyer"},
        {spot: {x: 3642, y: 3307}, code: "5", hover: "Meiyerditch Laboratories"},
    ]
}, {
    id: "arcsailing", name: "", img: "sail.png",
    spots: [
        {spot: {x: 1762, y: 12009}, hover: "Tua Leit Docks"},
        {spot: {x: 2012, y: 11783}, hover: "Whale's Maw Docks"},
        {spot: {x: 1810, y: 11652}, hover: "Waiko Docks"},
        {spot: {x: 2242, y: 11423}, hover: "Turtle Islands Docks"},
        {spot: {x: 2063, y: 11271}, hover: "Aminishi Docks"},
        {spot: {x: 2257, y: 11180}, hover: "Cyclosis Docks"},
        {spot: {x: 2454, y: 11591}, hover: "Goshima Docks"},
    ]
}, {
    id: "arctabs", name: "Arc Journal", img: "arcjournal.png",
    spots: [
        {spot: {x: 3052, y: 3247}, hover: "Port Sarim", code: "1"},
        {spot: {x: 1824, y: 11612}, hover: "Waiko", code: "2"},
        {spot: {x: 2062, y: 11798}, hover: "Whale's Maw", code: "3"},
        {spot: {x: 2088, y: 11274}, hover: "Aminishi", code: "4"},
        {spot: {x: 2318, y: 11225}, hover: "Cyclosis", code: "5"},
        {spot: {x: 1800, y: 11960}, hover: "Tuai Leit", code: "6"},
        {spot: {x: 2278, y: 11504}, hover: "Turtle Islands", code: "7"},
        {spot: {x: 2459, y: 11547}, hover: "Goshima", code: "8"},
    ]
}, {
    id: "quiver", name: "Tirannwn quiver", img: "quiver.gif",
    spots: [
        {spot: {x: 2348, y: 3172}, hover: "Lletya"},
        {spot: {x: 2186, y: 3148}, hover: "Tyras Camp"},
        {spot: {x: 2321, y: 3102}, hover: "Poison Waste"},
        {spot: {x: 2202, y: 3255}, hover: "Elf Camp"},
        {spot: {x: 2227, y: 3136}, hover: "Mushroom Patch"},
        {spot: {x: 2219, y: 3397}, hover: "Harmony Pillars"},
    ]
}, {
    id: "sceptreofthegods", name: "Sceptre of the gods", img: "sotg.png",
    spots: [
        {spot: {x: 3289, y: 2802}, hover: "Pyramid Plunder", code: "1"},
        {spot: {x: 3344, y: 2832}, hover: "Agility Pyramid", code: "2"},
        {spot: {x: 3233, y: 2898}, hover: "Ancient Pyramid", code: "3"},
        {spot: {x: 3169, y: 2730}, hover: "Golden Palace", code: "4"},
    ]
}, {
    id: "gliders", name: "Gnome gliders", img: "glider.png",
    spots: [
        {spot: {x: 2466, y: 3496}, hover: "The Grand Tree", code: "1"},
        {spot: {x: 2851, y: 3497}, hover: "White Wolf Mountain", code: "2"},
        {spot: {x: 3321, y: 3432}, hover: "Digsite glider", code: "3"},
        {spot: {x: 3280, y: 3213}, hover: "Al Kharid glider", code: "4"},
        {spot: {x: 2971, y: 2970}, hover: "Karamja glider", code: "5"},
        {spot: {x: 2556, y: 2972}, hover: "Feldip Hills glider", code: "6"},
        {spot: {x: 2495, y: 3192}, hover: "Tree Gnome glider", code: "7"},
        {spot: {x: 2208, y: 3446}, hover: "Prifddinas", code: "8"},
        {spot: {x: 1774, y: 11919}, hover: "Tua Leit", code: "9"},
    ]
}, {
    id: "wickedhood", name: "Wicked hood", img: "wicked.gif",
    spots: [
        {spot: {x: 3106, y: 3157, level: 3}, hover: "Runecrafting Guild"},
        {spot: {x: 3087, y: 2697}, code: "Soul"},
        {spot: {x: 2408, y: 4379}, code: "Cosmic"},
        {spot: {x: 3127, y: 3403}, code: "Air"},
        {spot: {x: 3053, y: 3443}, code: "Body"},
        {spot: {x: 2982, y: 3514}, code: "Mind"},
        {spot: {x: 3314, y: 3256}, code: "Fire"},
        {spot: {x: 3305, y: 3475}, code: "Earth"},
        {spot: {x: 3165, y: 3185}, code: "Water"},
        {spot: {x: 2870, y: 3023}, code: "Nature"},
        {spot: {x: 2158, y: 3866}, code: "Astral"},
        {spot: {x: 3059, y: 3593}, code: "Chaos"},
        {spot: {x: 2857, y: 3382}, code: "Law"},

    ]
}, {
    id: "balloon", name: "Balloon", img: "balloon.png",
    spots: [
        {spot: {x: 2463, y: 3109}, hover: "Castle Wars"},
        {spot: {x: 2477, y: 3462}, hover: "Grand Tree"},
        {spot: {x: 2923, y: 3300}, hover: "Crafting Guild"},
        {spot: {x: 2931, y: 3414}, hover: "Taverley"},
        {spot: {x: 3298, y: 3483}, hover: "Varrock"},
        {spot: {x: 2809, y: 3356}, hover: "Entrana"},
    ]
}, {
    id: "gote", name: "Grace of the Elves (Max Guild Portal)", img: "gote.png",
    spots: [
        {spot: {x: 2950, y: 2976}, hover: "Overgrown idols"},
        {spot: {x: 2594, y: 3412}, hover: "Deep sea fishing hub"},
        {spot: {x: 2940, y: 10198}, hover: "Lava Flow Mine"},
    ]
}, {
    id: "spheredorgeshkaan", name: "Dorgesh-kaan sphere", img: "sphere_dorgeshkaan.png",
    spots: [
        {spot: {x: 2719, y: 5350}, hover: "North"},
        {spot: {x: 2722, y: 5264}, hover: "South"},
        {spot: {x: 2735, y: 5307}, hover: "East"},
        {spot: {x: 2701, y: 5303}, hover: "West"},
    ]
}, {
    id: "spheredorgeshkaan", name: "Goblin village sphere", img: "sphere_goblinvillage.png",
    spots: [{spot: {x: 2957, y: 3503}},]
}, {
    id: "spheredorgeshkaan", name: "Goblin village sphere", img: "sphere_goblinvillage.png",
    spots: [{spot: {x: 2957, y: 3503}},]
}, {
    id: "naturessentinel", name: "Nature's sentinel outfit", img: "sentinel.png",
    spots: [
        {spot: {x: 3138, y: 3431}, code: "1,1"},
        {spot: {x: 3290, y: 3476}, code: "1,2"},
        {spot: {x: 3165, y: 3414}, code: "2,1"},
        {spot: {x: 3278, y: 3474}, code: "2,2"},
        {spot: {x: 3090, y: 3232}, code: "3,1"},
        {spot: {x: 2783, y: 3430}, code: "3,2"},
        {spot: {x: 2520, y: 3579}, code: "3,3"},
        {spot: {x: 2728, y: 3501}, code: "4,1"},
        {spot: {x: 3500, y: 3625}, code: "4,2"},
        {spot: {x: 2708, y: 3462}, code: "5,1"},
        {spot: {x: 2755, y: 3431}, code: "5,2"},
        {spot: {x: 3087, y: 3476}, code: "5,3"},
        {spot: {x: 3208, y: 3502}, code: "5,4"},
        {spot: {x: 2261, y: 3388}, code: "5,5"},
        {spot: {x: 2693, y: 3428}, code: "6,1"},
        {spot: {x: 2702, y: 3397}, code: "6,2"},
        {spot: {x: 3357, y: 3310}, code: "6,3"},
        {spot: {x: 2288, y: 3140}, code: "6,4"},
        {spot: {x: 2250, y: 3366}, code: "6,5"},
        {spot: {x: 2733, y: 3410}, code: "7,1"},
        {spot: {x: 2574, y: 3065}, code: "7,2"},
        {spot: {x: 2423, y: 3455}, code: "7,3"},
        {spot: {x: 3095, y: 3217}, code: "7,4"},
        {spot: {x: 3049, y: 3321}, code: "7,5"},
        {spot: {x: 3257, y: 3371}, code: "7,6"},
        {spot: {x: 2292, y: 3146}, code: "7,7"},
        {spot: {x: 2319, y: 3596}, code: "7,8"},
        {spot: {x: 3094, y: 3451}, code: "7,9,1"},
        {spot: {x: 2934, y: 3228}, code: "7,9,2"},
        {spot: {x: 2814, y: 3084}, code: "0,1,1"},
        {spot: {x: 2772, y: 2698}, code: "0,1,2"},
        {spot: {x: 2333, y: 3048}, code: "0,1,3"},
        {spot: {x: 2715, y: 2708}, code: "0,2,2"},
        {spot: {x: 2934, y: 2928}, code: "0,2,3"},
        {spot: {x: 2355, y: 3849}, code: "0,3"},
        {spot: {x: 3187, y: 2720}, code: "0,4"},
        {spot: {x: 3218, y: 3499}, code: "0,5,1"},
        {spot: {x: 3232, y: 3460}, code: "0,5,2"},
        {spot: {x: 3015, y: 3393}, code: "0,5,3"},
        {spot: {x: 3044, y: 3327}, code: "0,5,4"},
        {spot: {x: 2938, y: 3429}, code: "0,5,5"},
        {spot: {x: 2623, y: 3308}, code: "0,5,6"},
        {spot: {x: 2593, y: 3114}, code: "0,5,7"},
        {spot: {x: 2426, y: 3062}, code: "0,5,8"},
        {spot: {x: 2241, y: 3377}, code: "0,5,9"},
        {spot: {x: 2932, y: 3026}, code: "0,6,1"},
        {spot: {x: 2947, y: 2976}, code: "0,6,2"},

    ]
}, {
    id: "archoutfit", name: "Master archaeologist's outfit", img: "masterarchaeologist.png",
    spots: [
        {spot: {x: 3329, y: 3379}, code: "1"},
        {spot: {x: 3349, y: 3195}, code: "2"},
        {spot: {x: 3271, y: 3504}, code: "3"},
        {spot: {x: 3695, y: 3209}, code: "4"},
        {spot: {x: 2682, y: 3403}, code: "6"},
        {spot: {x: 2408, y: 2829}, code: "7"},
        {spot: {x: 3985, y: 4323}, code: "8"},
        {spot: {x: 3254, y: 3455}, code: "9,1"},
        {spot: {x: 2550, y: 2854}, code: "9,2"},
        {spot: {x: 2957, y: 3510}, code: "9,3"},
        {spot: {x: 2921, y: 9702}, code: "9,4"},
        {spot: {x: 2988, y: 3269}, code: "9,5"},
        {spot: {x: 3985, y: 4329}, code: "9,6"},
        {spot: {x: 2962, y: 3347}, code: "9,7"},
        {spot: {x: 3182, y: 3418}, code: "9,8"},
        {spot: {x: 3342, y: 3384}, code: "9,9"},
        {spot: {x: 3088, y: 3254}, code: "9,0,1"},
    ]
},
    {id: "ringofkinship", name: "Ring of Kinship", img: "ringofkinship.png", spots: [{spot: {x: 3449, y: 3701}}]},
    {id: "witchdoctormask", name: "Witchdoctor mask", img: "witchdoctormask.png", spots: [{spot: {x: 2950, y: 2933}, hover: "Herblore Habitat"}]},
    {id: "exctophial", name: "Ectophial", img: "ectophial.png", spots: [{spot: {x: 3660, y: 3521}}]},
    {id: "explorersring", name: "Explorer's ring", img: "explorersring.png", spots: [{spot: {x: 3053, y: 3290}, hover: "Cabbage field"}]},
    {id: "karamjagloves", name: "Karamja gloves", img: "karamjagloves.gif", spots: [{spot: {x: 2825, y: 2997}}]},
    {id: "theheart", name: "The Heart teleport", img: "theheart.gif", spots: [{spot: {x: 3199, y: 6942}}]},
    {id: "fremmenikboots", name: "Fremmenik sea boots", img: "fremmenikboots.gif", spots: [{spot: {x: 2642, y: 3678}, hover: "Relekka Market"}]},
    {id: "legendscape", name: "Legends Cape", img: "legendscape.png", spots: [{spot: {x: 2729, y: 3349}}]},
    {id: "archjounal", name: "Archaeology journal", img: "archjournal.png", spots: [{spot: {x: 3334, y: 3379}}]},
    {id: "skullsceptre", name: "Skull Sceptre", img: "skullsceptre.png", spots: [{spot: {x: 3081, y: 3422}, code: "1", hover: "Outside"}]},
    {id: "dragonkinlaboratory", name: "Dragonking Laboratory teleport", img: "dragonkin.png", spots: [{spot: {x: 3368, y: 3887}}]},
    {
        id: "wildernessobelisk", name: "Portable obelisk", img: "portableobelisk.png",
        spots: [
            {spot: {x: 3156, y: 3620}, code: "1", hover: "Level 13"},
            {spot: {x: 3219, y: 3656}, code: "2", hover: "Level 18"},
            {spot: {x: 3035, y: 3732}, code: "3", hover: "Level 27"},
            {spot: {x: 3106, y: 3794}, code: "4", hover: "Level 35"},
            {spot: {x: 2980, y: 3866}, code: "5", hover: "Level 44"},
            {spot: {x: 3307, y: 3916}, code: "6", hover: "Level 50"},
        ]
    }, {
        id: "wildernesssword", name: "Wilderness sword", img: "wildernesssword.png",
        spots: [
            {spot: {x: 3086, y: 3501}, code: "1,1", hover: "Edgeville"},
            {spot: {x: 3143, y: 3820}, code: "1,2", hover: "Herb patch"},
            {spot: {x: 3071, y: 3649}, code: "1,3", hover: "Forinthry Dungeon"},
            {spot: {x: 2998, y: 3913}, code: "1,5", hover: "Wilderness Agility course"},
        ]
    }, {
        id: "enchantedlyre", name: "Enchanted lyre", img: "enchantedlyre.png",
        spots: [
            {spot: {x: 2651, y: 3689}, code: "1", hover: "Relekka"},
            {spot: {x: 2529, y: 3740}, code: "2", hover: "Waterbirth Island"},
            {spot: {x: 2311, y: 3787}, code: "3", hover: "Neitiznot"},
            {spot: {x: 2403, y: 3782}, code: "4", hover: "Jatizso"},
            {spot: {x: 2516, y: 3859}, code: "5", hover: "Miscellania"},
            {spot: {x: 2592, y: 3879}, code: "6", hover: "Etceteria"},
            {spot: {x: 2642, y: 3676}, code: "7", hover: "Relekka Market"},
        ]
    }, {
        id: "charterships", name: "Charter Ships", img: "sail.png",
        spots: [
            {spot: {x: 2142, y: 3122}, hover: "Port Tyras"},
            {spot: {x: 2760, y: 3238}, hover: "Brimhaven"},
            {spot: {x: 2796, y: 3406}, hover: "Catherby"},
            {spot: {x: 2674, y: 3144}, hover: "Port Khazard"},
            {spot: {x: 2623, y: 2857}, hover: "Oo'glog"},
            {spot: {x: 2954, y: 3158}, hover: "Karamja"},
            {spot: {x: 3001, y: 3032}, hover: "Shipyard"},
            {spot: {x: 3043, y: 3191}, hover: "Port Sarim"},
            {spot: {x: 3702, y: 3503}, hover: "Port Phasmatys"},
            {spot: {x: 3671, y: 2931}, hover: "Mos Le'Harmless"},
            {spot: {x: 3140, y: 2662}, hover: "Menaphos"},
        ]
    },
]

class TeleportIcon extends leaflet.Icon {
    declare options: leaflet.IconOptions & { text?: string, title?: string };

    constructor(p: leaflet.IconOptions & { text?: string, title?: string }) {
        super(p);
    }

    createIcon() {
        let el = document.createElement("div");
        el.style.backgroundImage = `url("${this.options.iconUrl}")`;
        el.classList.add("marktele");
        if (this.options.text) {
            el.innerText = this.options.text;
        }
        if (this.options.title) {
            el.title = this.options.title;
        }
        return el;
    }
}

export class TeleportLayer extends leaflet.FeatureGroup {

    constructor() {
        super();

        for (let tele of teles) {
            for (let spot of tele.spots) {
                let tooltip = tele.name || spot.hover

                if (tele.name && spot.hover) tooltip = `${tele.name} - ${spot.hover}`

                let img = spot.img || tele.img

                if (!spot.has_variants) {
                    let s = spot.spot as MapCoordinate

                    leaflet.marker([s.y, s.x], {
                        icon: new TeleportIcon({
                            iconUrl: `./assets/icons/teleports/${img}`,
                            text: spot.code,
                            title: tooltip
                        })
                    }).addTo(this)
                } else {
                    // TODO: Choose correct variant
                    let s = (spot.spot as { id: string, name: string, spot: MapCoordinate }[])[0].spot

                    leaflet.marker([s.y, s.x], {
                        icon: new TeleportIcon({
                            iconUrl: `./assets/icons/teleports/${img}`,
                            text: spot.code,
                            title: tooltip
                        })
                    }).addTo(this)
                }
            }
        }
    }
}