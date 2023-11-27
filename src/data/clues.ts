import {Clues, type ClueType} from "lib/runescape/clues";
import {ClueIndex} from "./ClueIndex";
import {TileRectangle} from "../lib/runescape/coordinates";

export namespace clue_data {
    export const anagram: Clues.Anagram[] = [
        {
            "id": 23,
            "type": "anagram",
            "tier": null,
            "text": ["This anagram reveals who to speak to next: Snah"],
            "solution": {
                "type": "talkto",
                "spots": [{"range": {"topleft": {"x": 3202, "y": 3232}, "botright": {"x": 3221, "y": 3205}, "level": 0}}],
                "npc": "Hans"
            }
        },
        {
            "id": 14,
            "type": "anagram",
            "tier": "medium",
            "text": ["This anagram reveals who to speak to next: Eek Zero Op"],
            "challenge": [{
                "type": "challengescroll", "question": "How many animals are in the Ardougne Zoo?", "answers": [
                    {"answer": 40, "note": "Before Eagles' Peak and Hunt for Red Raktuber"},
                    {"answer": 41, "note": "After either Eagles' Peak or Hunt for Red Raktuber"},
                    {"answer": 42, "note": "After both Eagles' Peak and Hunt for Red Raktuber"},
                ]
            }],
            "solution": {
                "type": "talkto",
                "npc": "Zookeeper",
                "spots": [
                    {"range": {"topleft": {"x": 2608, "y": 3271}, "botright": {"x": 2615, "y": 3266}, "level": 0}},
                    {"range": {"topleft": {"x": 2618, "y": 3283}, "botright": {"x": 2624, "y": 3277}, "level": 0}},
                    {"range": {"topleft": {"x": 2599, "y": 3287}, "botright": {"x": 2606, "y": 3282}, "level": 0}}
                ],
            }
        },
        {
            "id": 24,
            "type": "anagram",
            "tier": "medium",
            "text": [
                "This anagram reveals who to speak to next: Stab Ob",
                "This anagram reveals who to speak to next: Boast B"
            ],
            "solution": {
                "type": "talkto",
                "spots": [
                    {"range": {"topleft": {"x": 2267, "y": 4760}, "botright": {"x": 2271, "y": 4752}, "level": 0}, note: "Before 'Death Plateu'"}
                ],
                "npc": "Sabbot"
            }
        },
        {
            "id": 318,
            "type": "anagram",
            "tier": "medium",
            "text": ["This anagram reveals who to speak to next: Nod med"],
            "challenge": [{"type": "challengescroll", "question": "How many pigeon cages are there around the back of Jerico's house?", "answers": [{"answer": 3}]}],
            "solution": {
                "type": "talkto",
                "npc": "Edmond",
                "spots": [{"range": {"topleft": {"x": 2564, "y": 3336}, "botright": {"x": 2570, "y": 3330}, "level": 0}}],
            }
        },
        {
            "id": 320,
            "type": "anagram",
            "tier": "medium",
            "text": ["This anagram reveals who to speak to next: Winston Lane"],
            "challenge": [{"type": "challengescroll", "question": "How many tables are there in the Pick and Lute Inn?", "answers": [{"answer": 10}]}],
            "solution": {
                "type": "talkto",
                "npc": "Nails Newton",
                "spots": [{"range": {"topleft": {"x": 2880, "y": 3445}, "botright": {"x": 2882, "y": 3443}, "level": 0}}],
            }
        },
        {
            "id": 321,
            "type": "anagram",
            "tier": "medium",
            "text": ["This anagram reveals who to speak to next: Or A Vile"],
            "challenge": [{"type": "challengescroll", "question": "How many windows look out into the Citharede Abbey courtyard?", "answers": [{"answer": 17}]}],
            "solution": {
                "type": "talkto",
                "npc": "Valerio",
                "spots": [{"range": {"topleft": {"x": 3399, "y": 3150}, "botright": {"x": 3401, "y": 3148}, "level": 0}}],
            }
        },
        {
            "id": 322,
            "type": "anagram",
            "tier": "medium",
            "text": ["This anagram reveals who to speak to next: Icy Fe"],
            "solution": {
                "type": "talkto",
                "npc": "Fycie",
                "spots": [{"range": {"topleft": {"x": 2646, "y": 9398}, "botright": {"x": 2653, "y": 9390}, "level": 0}}]
            }
        },
        {
            "id": 323,
            "type": "anagram",
            "tier": "medium",
            "text": ["This anagram reveals who to speak to next: Aha Jar"],
            "solution": {
                "type": "talkto",
                "npc": "Jaraah",
                "spots": [{"range": {"topleft": {"x": 3290, "y": 3219}, "botright": {"x": 3297, "y": 3215}, "level": 0}}],
            }
        },
        {
            "id": 326,
            "type": "anagram",
            "tier": "medium",
            "text": ["This anagram reveals who to speak to next: Bail Trims"],
            "solution": {
                "type": "talkto",
                "spots": [{"range": {"topleft": {"x": 2405, "y": 9822}, "botright": {"x": 2413, "y": 9815}, "level": 0}}],
                "npc": "Brimstail"
            }
        },
        {
            "id": 327,
            "type": "anagram",
            "tier": "medium",
            "text": ["This anagram reveals who to speak to next: Ok Co"],
            "challenge": [{"type": "challengescroll", "question": "How many cannons does Lumbridge Castle have?", "answers": [{"answer": 7}]}],
            "solution": {
                "type": "talkto",
                "npc": "Cook",
                "spots": [{"range": {"topleft": {"x": 3208, "y": 3215}, "botright": {"x": 3210, "y": 3215}, "level": 0}}],
            }
        },
        {
            "id": 328,
            "type": "anagram",
            "tier": "medium",
            "text": ["This anagram reveals who to speak to next: Are Col"],
            "challenge": [{"type": "challengescroll", "question": "If x is 15 and y is 3, what is 3x + y? ", "answers": [{"answer": 48}]}],
            "solution": {
                "type": "talkto",
                "npc": "Oracle",
                "spots": [{"range": {"topleft": {"x": 3008, "y": 3503}, "botright": {"x": 3019, "y": 3498}, "level": 0}}],
            }
        },
        {
            "id": 329,
            "type": "anagram",
            "tier": "medium",
            "text": ["This anagram reveals who to speak to next: Arc O Line"],
            "challenge": [{
                "type": "challengescroll", "question": "How many fishermen are there on the Fishing Platform?", "answers": [
                    {"answer": 11, "note": "Before 'Kennith's Concerns'"},
                    {"answer": 0, "note": "After 'Kennith's Concerns'"},
                ]
            }],
            "solution": {
                "type": "talkto",
                "npc": "Caroline",
                "spots": [
                    {"range": {"topleft": {"x": 2713, "y": 3305}, "botright": {"x": 2718, "y": 3290}, "level": 0}, "note": "Before 'Sea Slug'."},
                    {"range": {"topleft": {"x": 2708, "y": 3285}, "botright": {"x": 2712, "y": 3280}, "level": 1}, "note": "After 'Sea Slug'."},
                ],
            }
        },
        {
            "id": 330,
            "type": "anagram",
            "tier": "medium",
            "text": ["This anagram reveals who to speak to next: Goblin Kern"],
            "solution": {
                "type": "talkto",
                "spots": [{"range": {"topleft": {"x": 2540, "y": 3171}, "botright": {"x": 2542, "y": 3167}, "level": 0}}],
                "npc": "King Bolren"
            }
        },
        {
            "id": 331,
            "type": "anagram",
            "tier": "medium",
            "text": ["This anagram reveals who to speak to next: Soy Drain"],
            "challenge": [{"type": "challengescroll", "question": "How many ore rocks are there in the nearby copper and tin mine?", "answers": [{"answer": 8}]}],
            "solution": {
                "type": "talkto",
                "npc": "Ysondria",
                "spots": [{"range": {"topleft": {"x": 3219, "y": 3184}, "botright": {"x": 3221, "y": 3182}, "level": 0}}],
            }
        },
        {
            "id": 332,
            "type": "anagram",
            "tier": "medium",
            "text": ["This anagram reveals who to speak to next: Dt Run B"],
            "challenge": [{"type": "challengescroll", "question": "How many people are waiting for the next bard to perform?", "answers": [{"answer": 4}]}],
            "solution": {
                "type": "talkto",
                "npc": "Brundt the Chieftain",
                "spots": [{"range": {"topleft": {"x": 2657, "y": 3670}, "botright": {"x": 2660, "y": 3666}, "level": 0}}]
            }
        },
        {
            "id": 334,
            "type": "anagram",
            "tier": "medium",
            "text": ["This anagram reveals who to speak to next: Me if"],
            "solution": {
                "type": "talkto",
                "spots": [{"range": {"topleft": {"x": 2457, "y": 3382}, "botright": {"x": 2461, "y": 3380}, "level": 0}}],
                "npc": "Femi"
            }
        },
        {
            "id": 335,
            "type": "anagram",
            "tier": "medium",
            "text": ["This anagram reveals who to speak to next: R Ak Mi"],
            "challenge": [{
                "type": "challengescroll",
                "question": "I have 16 kebabs, I eat one myself and share the rest equally between 3 friends. How many do they have each?",
                "answers": [{"answer": 5}]
            }],
            "solution": {
                "type": "talkto",
                "npc": "Karim",
                "spots": [{"range": {"topleft": {"x": 3269, "y": 3184}, "botright": {"x": 3271, "y": 3182}, "level": 0}}],
            }
        },
        {
            "id": 336,
            "type": "anagram",
            "tier": "medium",
            "text": ["This anagram reveals who to speak to next: Got A Boy"],
            "challenge": [{"type": "challengescroll", "question": "How many buildings are in the village?", "answers": [{"answer": 11}]}],
            "solution": {
                "type": "talkto",
                "npc": "Gabooty",
                "spots": [{"range": {"topleft": {"x": 2786, "y": 3070}, "botright": {"x": 2801, "y": 3063}, "level": 0}}],
            }
        },
        {
            "id": 337,
            "type": "anagram",
            "tier": "medium",
            "text": ["This anagram reveals who to speak to next: Halt Us"],
            "solution": {
                "type": "talkto",
                "spots": [{"range": {"topleft": {"x": 2935, "y": 3156}, "botright": {"x": 2941, "y": 3152}, "level": 0}}],
                "npc": "Luthas"
            }
        },
        {
            "id": 338,
            "type": "anagram",
            "tier": "medium",
            "text": ["This anagram reveals who to speak to next: Err Cure It"],
            "challenge": [{"type": "challengescroll", "question": "How many houses have a cross on the door?", "answers": [{"answer": 20}]}],
            "solution": {
                "type": "talkto",
                "npc": "Recruiter",
                "spots": [{"range": {"topleft": {"x": 2539, "y": 3308}, "botright": {"x": 2544, "y": 3302}, "level": 0}}],
            }
        },
        {
            "id": 339,
            "type": "anagram",
            "tier": "medium",
            "text": ["This anagram reveals who to speak to next: Iz A Ammo Load For Mrs Yakkers"],
            "challenge": [{"type": "challengescroll", "question": "How many bottles are there on the stall to the east of Mr Ex?", "answers": [{"answer": 7}]}],
            "solution": {
                "type": "talkto",
                "npc": "Moldark, Emissary of Zamorak",
                "spots": [{"range": {"topleft": {"x": 3104, "y": 3510}, "botright": {"x": 3105, "y": 3508}, "level": 0}}],
            }
        },
        {
            "id": 340,
            "type": "anagram",
            "tier": "medium",
            "text": ["This anagram reveals who to speak to next: Im Krom"],
            "challenge": [{"type": "challengescroll", "question": "How many rocks in the Rimmington mine cannot be used to make bronze?", "answers": [{"answer": 7}]}],
            "solution": {
                "type": "talkto",
                "npc": "Rommik",
                "spots": [{"range": {"topleft": {"x": 2945, "y": 3199}, "botright": {"x": 2950, "y": 3193}, "level": 0}}],
            }
        },
        {
            "id": 341,
            "type": "anagram",
            "tier": "medium",
            "text": ["This anagram reveals who to speak to next: El Ow"],
            "solution": {
                "type": "talkto",
                "spots": [{"range": {"topleft": {"x": 3230, "y": 3422}, "botright": {"x": 3236, "y": 3420}, "level": 0}}],
                "npc": "Lowe"
            }
        },
        {
            "id": 342,
            "type": "anagram",
            "tier": "medium",
            "text": ["This anagram reveals who to speak to next: Peaty Pert"],
            "solution": {
                "type": "talkto",
                "spots": [{"range": {"topleft": {"x": 3048, "y": 3378}, "botright": {"x": 3054, "y": 3372}, "level": 0}}],
                "npc": "Party Pete"
            }
        },
        {
            "id": 343,
            "type": "anagram",
            "tier": "medium",
            "text": ["This anagram reveals who to speak to next: Lark In Dog"],
            "challenge": [{"type": "challengescroll", "question": "How many bookcases are there in the Varrock Palace library?", "answers": [{"answer": 24}]}],
            "solution": {
                "type": "talkto",
                "npc": "King Roald",
                "spots": [{"range": {"topleft": {"x": 3217, "y": 3478}, "botright": {"x": 3224, "y": 3471}, "level": 0}}],
            }
        },
        {
            "id": 20,
            "type": "anagram",
            "tier": "hard",
            "text": [
                "This anagram reveals who to speak to next: Me Am The Calc",
                "This anagram reveals who to speak to next: Ace Match Elm",
                "This anagram reveals who to speak to next: The Cal Came",
            ],
            "challenge": [{"type": "slider"}],
            "solution": {
                "type": "talkto",
                "spots": [{"range": {"topleft": {"x": 3284, "y": 3241}, "botright": {"x": 3294, "y": 3234}, "level": 0}}],
                "npc": "Cam the Camel"
            }
        },
        {
            "id": 287,
            "type": "anagram",
            "tier": "hard",
            "text": ["This anagram reveals who to speak to next: I Eat Its Chart Hints Do U"],
            "challenge": [{"type": "slider"}],
            "solution": {
                "type": "talkto",
                "spots": [{"range": {"topleft": {"x": 3420, "y": 2930}, "botright": {"x": 3430, "y": 2926}, "level": 0}}],
                "npc": "Shiratti the Custodian"
            }
        },
        {
            "id": 288,
            "type": "anagram",
            "tier": "hard",
            "text": ["This anagram reveals who to speak to next: An Paint Tonic"],
            "challenge": [{"type": "slider"}],
            "solution": {
                "type": "talkto",
                "spots": [{"range": {"topleft": {"x": 2860, "y": 9883}, "botright": {"x": 2877, "y": 9873}, "level": 0}}],
                "npc": "Captain Ninto"
            }
        },
        {
            "id": 289,
            "type": "anagram",
            "tier": "hard",
            "text": ["This anagram reveals who to speak to next: Arr! So I am a crust, and?"],
            "challenge": [{"type": "slider"}],
            "solution": {
                "type": "talkto",
                "spots": [{"range": {"topleft": {"x": 2338, "y": 3678}, "botright": {"x": 2346, "y": 3673}, "level": 0}}],
                "npc": "Ramara du Croissant"
            }
        },
        {
            "id": 290,
            "type": "anagram",
            "tier": "hard",
            "text": ["This anagram reveals who to speak to next: C On Game Hoc"],
            "challenge": [{"type": "challengescroll", "question": "How many gnomes on the gnome ball field have red patches on their uniforms?", "answers": [{"answer": 6}]}],
            "solution": {
                "type": "talkto",
                "npc": "Gnome Coach",
                "spots": [
                    {"range": {"topleft": {"x": 2381, "y": 3497}, "botright": {"x": 2409, "y": 3479}, "level": 0}, "note": "The coach roams around the field."}
                ],
            }
        },
        {
            "id": 291,
            "type": "anagram",
            "tier": "hard",
            "text": ["This anagram reveals who to speak to next: He Do Pose. It Is Cultrrl, Mk?"],
            "challenge": [{"type": "slider"}],
            "solution": {
                "type": "talkto",
                "spots": [{"range": {"topleft": {"x": 2903, "y": 10208}, "botright": {"x": 2905, "y": 10206}, "level": 0}}],
                "npc": "Riki the sculptor's model"
            }
        },
        {
            "id": 292,
            "type": "anagram",
            "tier": "hard",
            "text": ["This anagram reveals who to speak to next: Profs Lose Wrong Pie"],
            "challenge": [{"type": "slider"}],
            "solution": {
                "type": "talkto",
                "spots": [{"range": {"topleft": {"x": 3103, "y": 3165}, "botright": {"x": 3114, "y": 3146}, "level": 0}}],
                "npc": "Professor Onglewip"
            }
        },
        {
            "id": 293,
            "type": "anagram",
            "tier": "hard",
            "text": ["This anagram reveals who to speak to next: O Birdz A Zany En Pc"],
            "challenge": [{"type": "challengescroll", "question": "How many banana trees are there in the plantation?", "answers": [{"answer": 33}]}],
            "solution": {
                "type": "talkto",
                "npc": "Cap'n Izzy No-Beard",
                "spots": [{"range": {"topleft": {"x": 2806, "y": 3192}, "botright": {"x": 2808, "y": 3190}, "level": 0}}],
            }
        },
        {
            "id": 295,
            "type": "anagram",
            "tier": "hard",
            "text": ["This anagram reveals who to speak to next: Red Art Tans"],
            "challenge": [{"type": "slider"}],
            "solution": {
                "type": "talkto",
                "spots": [{"range": {"topleft": {"x": 3032, "y": 3191}, "botright": {"x": 3034, "y": 3190}, "level": 0}}],
                "npc": "Trader Stan"
            }
        },
        {
            "id": 296,
            "type": "anagram",
            "tier": "hard",
            "text": ["This anagram reveals who to speak to next: Or Zinc Fumes Ward"],
            "challenge": [{"type": "slider"}],
            "solution": {
                "type": "talkto",
                "spots": [{"range": {"topleft": {"x": 2587, "y": 9489}, "botright": {"x": 2589, "y": 9488}, "level": 0}}],
                "npc": "Wizard Frumscone"
            }
        },
        {
            "id": 297,
            "type": "anagram",
            "tier": "hard",
            "text": ["This anagram reveals who to speak to next: By Look"],
            "challenge": [{"type": "challengescroll", "question": "How many flowers are there in the clearing below this platform?", "answers": [{"answer": 13}]}],
            "solution": {
                "type": "talkto",
                "npc": "Bolkoy",
                "spots": [{"range": {"topleft": {"x": 2525, "y": 3164}, "botright": {"x": 2531, "y": 3160}, "level": 1}}],
            }
        },
        {
            "id": 298,
            "type": "anagram",
            "tier": "hard",
            "text": ["This anagram reveals who to speak to next: Sequin Dirge"],
            "challenge": [{"type": "slider"}],
            "solution": {
                "type": "talkto",
                "spots": [
                    {"range": {"topleft": {"x": 2499, "y": 3864}, "botright": {"x": 2502, "y": 3861}, "level": 1}, "note": "After 'Blood Runs Deep'"},
                    {"range": {"topleft": {"x": 2612, "y": 3879}, "botright": {"x": 2617, "y": 3871}, "level": 1}, "note": "Before 'Blood Runs Deep'"}

                ],
                "npc": "Queen Sigrid"
            }
        },
        {
            "id": 299,
            "type": "anagram",
            "tier": "hard",
            "text": ["This anagram reveals who to speak to next: A Zen She"],
            "challenge": [{"type": "slider"}],
            "solution": {
                "type": "talkto",
                "spots": [{"range": {"topleft": {"x": 2657, "y": 3293}, "botright": {"x": 2661, "y": 3291}, "level": 0}}],
                "npc": "Zenesha"
            }
        },
        {
            "id": 300,
            "type": "anagram",
            "tier": "hard",
            "text": ["This anagram reveals who to speak to next: Gulag Run"],
            "challenge": [{"type": "slider"}],
            "solution": {
                "type": "talkto",
                "spots": [{"range": {"topleft": {"x": 2437, "y": 3057}, "botright": {"x": 2450, "y": 3047}, "level": 0}}],
                "npc": "Uglug Nar"
            }
        },
        {
            "id": 301,
            "type": "anagram",
            "tier": "hard",
            "text": ["This anagram reveals who to speak to next: Land Doomd"],
            "challenge": [{"type": "slider"}],
            "solution": {
                "type": "talkto",
                "spots": [{"range": {"topleft": {"x": 3358, "y": 3510}, "botright": {"x": 3364, "y": 3502}, "level": 0}}],
                "npc": "Odd Old Man"
            }
        },
        {
            "id": 302,
            "type": "anagram",
            "tier": "hard",
            "text": ["This anagram reveals who to speak to next: I Faffy Run"],
            "challenge": [{"type": "slider"}],
            "solution": {
                "type": "talkto",
                "spots": [{"range": {"topleft": {"x": 2384, "y": 4471}, "botright": {"x": 2389, "y": 4466}, "level": 0}}],
                "npc": "Fairy Nuff (North of the bank in Zanaris)"
            }
        },
        {
            "id": 303,
            "type": "anagram",
            "tier": "master",
            "text": ["This anagram reveals who to speak to next: An exile that isn't wholly free WE IRK OVER NA."],
            "solution": {
                "type": "talkto",
                "spots": [{"range": {"topleft": {"x": 4644, "y": 5386}, "botright": {"x": 4648, "y": 5382}, "level": 0}}],
                "npc": "Ramokee Skinweaver"
            }
        },
        {
            "id": 306,
            "type": "anagram",
            "tier": "master",
            "text": ["This anagram reveals who to speak to next: He often preaches of QUIT THY BRINE RAT ROLL"],
            "solution": {
                "type": "talkto",
                "spots": [
                    {"range": {"topleft": {"x": 3679, "y": 2964}, "botright": {"x": 3683, "y": 2960}, "level": 0}, "note": "Mos Le'Harmless"},
                    {"range": {"topleft": {"x": 3783, "y": 2829}, "botright": {"x": 3790, "y": 2822}, "level": 0}, "note": "Harmony"}
                ],
                "npc": "Brother Tranquility"
            }
        },
        {
            "id": 307,
            "type": "anagram",
            "tier": "master",
            "text": ["This anagram reveals who to speak to next: They seek spirits O EASTERN WISHES"],
            "challenge": [{"type": "towers"}],
            "solution": {
                "type": "talkto",
                "spots": [{"range": {"topleft": {"x": 1784, "y": 11954}, "botright": {"x": 1786, "y": 11952}, "level": 0}}],
                "npc": "Sensei Seaworth"
            }
        },
        {
            "id": 308,
            "type": "anagram",
            "tier": "master",
            "text": ["This anagram reveals who to speak to next: This lady wants me to find ancient scrolls ERGO I DIG CLAY"],
            "challenge": [{"type": "towers"}],
            "solution": {
                "type": "talkto",
                "spots": [
                    {"range": {"topleft": {"x": 3376, "y": 3405}, "botright": {"x": 3378, "y": 3403}, "level": 0}, "note": "Outside the empty throne room."},
                    {"range": {"topleft": {"x": 2825, "y": 12632}, "botright": {"x": 2827, "y": 12630}, "level": 2}, "note": "Inside the empty throne room."}
                ],
                "npc": "Celia Diggory"
            }
        },
        {
            "id": 309,
            "type": "anagram",
            "tier": "master",
            "text": ["This anagram reveals who to speak to next: Master of the elements, he may REIGN US IF IMMORTAL"],
            "challenge": [{"type": "lockbox"}],
            "solution": {
                "type": "talkto",
                "spots": [
                    {"range": {"topleft": {"x": 2997, "y": 3273}, "botright": {"x": 3004, "y": 3263}, "level": 0}, "note": "By Armadyl's tower."},
                    {"range": {"topleft": {"x": 1034, "y": 1764}, "botright": {"x": 1036, "y": 1762}, "level": 1}, "note": "City of Um Ritual site"}
                ],
                "npc": "Malignus mortifer"
            }
        },
        {
            "id": 310,
            "type": "anagram",
            "tier": "master",
            "text": ["This anagram reveals who to speak to next: If distracted from their work AH; WET ARM"],
            "challenge": [{"type": "lockbox"}],
            "solution": {
                "type": "talkto",
                "spots": [{"range": {"topleft": {"x": 2346, "y": 3165}, "botright": {"x": 2348, "y": 3163}, "level": 0}}],
                "npc": "Amaethwr"
            }
        },
        {
            "id": 311,
            "type": "anagram",
            "tier": "master",
            "text": ["This anagram reveals who to speak to next: Young but stylish PIN HEIR ALL IN PLACE"],
            "solution": {
                "type": "talkto",
                "npc": "Philippe Carnillean",
                "spots": [
                    {"range": {"topleft": {"x": 2564, "y": 3274}, "botright": {"x": 2575, "y": 3267}, "level": 0}, "note": "Before Carnillean Rising"},
                    {"range": {"topleft": {"x": 2514, "y": 3357}, "botright": {"x": 2521, "y": 3354}, "level": 0}, "note": "50 qp."},
                    {"range": {"topleft": {"x": 2752, "y": 3656}, "botright": {"x": 2759, "y": 3649}, "level": 0}, "note": "100 qp."},
                    {"range": {"topleft": {"x": 2857, "y": 3001}, "botright": {"x": 2865, "y": 2993}, "level": 1}, "note": "150 qp."},
                    {"range": {"topleft": {"x": 3671, "y": 3499}, "botright": {"x": 3681, "y": 3489}, "level": 0}, "note": "200 qp."},
                    {"range": {"topleft": {"x": 4643, "y": 5391}, "botright": {"x": 4650, "y": 5384}, "level": 0}, "note": "250 qp."},
                    {"range": {"topleft": {"x": 2709, "y": 5362}, "botright": {"x": 2714, "y": 5357}, "level": 0}, "note": "300 qp."},
                    {"range": {"topleft": {"x": 2338, "y": 3678}, "botright": {"x": 2346, "y": 3673}, "level": 0}, "note": "350 qp."},
                    {"range": {"topleft": {"x": 4610, "y": 5130}, "botright": {"x": 4617, "y": 5123}, "level": 0}, "note": "400 qp."}
                ]
            }
        },
        {
            "id": 312,
            "type": "anagram",
            "tier": "master",
            "text": ["This anagram reveals who to speak to next: In his youth, this adventurer was a WINSOME LAD"],
            "solution": {
                "type": "talkto",
                "spots": [{"range": {"topleft": {"x": 3087, "y": 3255}, "botright": {"x": 3089, "y": 3254}, "level": 0}}],
                "npc": "Wise Old Man"
            }
        },
        {
            "id": 313,
            "type": "anagram",
            "tier": "master",
            "text": ["This anagram reveals who to speak to next: The cabbage diet must work because he has A PURE GLOW"],
            "solution": {
                "type": "talkto",
                //"spots": {"x": 3253, "y": 3355, "level": 0},
                "npc": "Paul Gower"
            }
        },
        {
            "id": 314,
            "type": "anagram",
            "tier": "master",
            "text": ["This anagram reveals who to speak to next: Age allows a new perspective in this vital place TABOO RISES SHYLY"],
            "solution": {
                "type": "talkto",
                "spots": [{"range": {"topleft": {"x": 3197, "y": 6962}, "botright": {"x": 3199, "y": 6960}, "level": 1}}],
                "npc": "Soothsayer Sybil"
            }
        },
        {
            "id": 315,
            "type": "anagram",
            "tier": "master",
            "text": ["This anagram reveals who to speak to next: With her age, it's no surprise to HEAR A LADY RANT"],
            "solution": {
                "type": "talkto",
                "spots": [{"range": {"topleft": {"x": 2220, "y": 3299}, "botright": {"x": 2222, "y": 3297}, "level": 1}}],
                "npc": "Lady Trahaearn"
            }
        },
        {
            "id": 316,
            "type": "anagram",
            "tier": "master",
            "text": ["This anagram reveals who to speak to next: He claimed to be a human scholar but I SAW THE LIE"],
            "solution": {
                "type": "talkto",
                "spots": [{"range": {"topleft": {"x": 3416, "y": 2940}, "botright": {"x": 3421, "y": 2935}, "level": 0}}],
                "npc": "Ali The Wise"
            }
        },
        {
            "id": 317,
            "type": "anagram",
            "tier": "master",
            "text": ["This anagram reveals who to speak to next: His job leaves him kind of HATED"],
            "solution": {
                "type": "talkto",
                "spots": [
                    {"range": {"topleft": {"x": 414, "y": 674}, "botright": {"x": 414, "y": 674}, "level": 0}, "note": "Death's Office"},
                ],
                "npc": "Death"
            }
        }
    ]
    export const compass: Clues.Compass[] = [
        {
            "id": 399,
            "type": "compass",
            "tier": "elite",
            "text": ["The compass shows where you need to go."],
            "challenge": [{"type": "wizard"}, {"type": "slider"}, {"type": "celticknot"}],
            "spots": [
                {"x": 2413, "y": 2818, "level": 0},
                {"x": 2398, "y": 2862, "level": 0},
                {"x": 2476, "y": 2845, "level": 0},
                {"x": 2493, "y": 2875, "level": 0},
                {"x": 2546, "y": 2872, "level": 0},
                {"x": 2547, "y": 2826, "level": 0},
                {"x": 2617, "y": 2876, "level": 0},
                {"x": 2598, "y": 2838, "level": 0},
                {"x": 2445, "y": 2917, "level": 0},
                {"x": 2458, "y": 2893, "level": 0},
                {"x": 2541, "y": 2926, "level": 0},
                {"x": 2511, "y": 2936, "level": 0},
                {"x": 2578, "y": 2930, "level": 0},
                {"x": 2589, "y": 2898, "level": 0},
                {"x": 2482, "y": 2977, "level": 0},
                {"x": 2490, "y": 2949, "level": 0},
                {"x": 2511, "y": 2980, "level": 0},
                {"x": 2535, "y": 2958, "level": 0},
                {"x": 2590, "y": 2994, "level": 0},
                {"x": 2592, "y": 2956, "level": 0},
                {"x": 2640, "y": 2987, "level": 0},
                {"x": 2638, "y": 2948, "level": 0},
                {"x": 2330, "y": 3057, "level": 0},
                {"x": 2355, "y": 3038, "level": 0},
                {"x": 2393, "y": 3046, "level": 0},
                {"x": 2418, "y": 3040, "level": 0},
                {"x": 2481, "y": 3011, "level": 0},
                {"x": 2439, "y": 3057, "level": 0},
                {"x": 2564, "y": 3041, "level": 0},
                {"x": 2590, "y": 3063, "level": 0},
                {"x": 2629, "y": 3123, "level": 0},
                {"x": 2671, "y": 3109, "level": 0},
                {"x": 2579, "y": 3130, "level": 0},
                {"x": 2610, "y": 3076, "level": 0},
                {"x": 2519, "y": 3115, "level": 0},
                {"x": 2559, "y": 3102, "level": 0},
                {"x": 2449, "y": 3110, "level": 0},
                {"x": 2486, "y": 3134, "level": 0},
                {"x": 2433, "y": 3144, "level": 0},
                {"x": 2468, "y": 3177, "level": 0},
                {"x": 2498, "y": 3175, "level": 0},
                {"x": 2557, "y": 3164, "level": 0},
                {"x": 2619, "y": 3153, "level": 0},
                {"x": 2595, "y": 3192, "level": 0},
                {"x": 2651, "y": 3148, "level": 0},
                {"x": 2627, "y": 3172, "level": 0},
                {"x": 2457, "y": 3221, "level": 0},
                {"x": 2478, "y": 3254, "level": 0},
                {"x": 2543, "y": 3211, "level": 0},
                {"x": 2502, "y": 3249, "level": 0},
                {"x": 2583, "y": 3223, "level": 0},
                {"x": 2592, "y": 3251, "level": 0},
                {"x": 2634, "y": 3208, "level": 0},
                {"x": 2646, "y": 3251, "level": 0},
                {"x": 2492, "y": 3270, "level": 0},
                {"x": 2451, "y": 3283, "level": 0},
                {"x": 2506, "y": 3276, "level": 0},
                {"x": 2582, "y": 3266, "level": 0},
                {"x": 2582, "y": 3314, "level": 0},
                {"x": 2665, "y": 3266, "level": 0},
                {"x": 2650, "y": 3302, "level": 0},
                {"x": 2723, "y": 3277, "level": 0},
                {"x": 2700, "y": 3311, "level": 0},
                {"x": 2381, "y": 3388, "level": 0},
                {"x": 2410, "y": 3388, "level": 0},
                {"x": 2457, "y": 3331, "level": 0},
                {"x": 2485, "y": 3377, "level": 0},
                {"x": 2541, "y": 3389, "level": 0},
                {"x": 2513, "y": 3351, "level": 0},
                {"x": 2581, "y": 3340, "level": 0},
                {"x": 2576, "y": 3370, "level": 0},
                {"x": 2651, "y": 3351, "level": 0},
                {"x": 2662, "y": 3338, "level": 0},
                {"x": 2724, "y": 3360, "level": 0},
                {"x": 2739, "y": 3388, "level": 0},
                {"x": 2359, "y": 3448, "level": 0},
                {"x": 2392, "y": 3398, "level": 0},
                {"x": 2410, "y": 3419, "level": 0},
                {"x": 2438, "y": 3398, "level": 0},
                {"x": 2470, "y": 3404, "level": 0},
                {"x": 2522, "y": 3429, "level": 0},
                {"x": 2531, "y": 3405, "level": 0},
                {"x": 2583, "y": 3449, "level": 0},
                {"x": 2565, "y": 3395, "level": 0},
                {"x": 2677, "y": 3400, "level": 0},
                {"x": 2657, "y": 3451, "level": 0},
                {"x": 2726, "y": 3399, "level": 0},
                {"x": 2705, "y": 3418, "level": 0},
                {"x": 2765, "y": 3445, "level": 0},
                {"x": 2797, "y": 3428, "level": 0},
                {"x": 2835, "y": 3423, "level": 0},
                {"x": 2834, "y": 3451, "level": 0},
                {"x": 2926, "y": 3402, "level": 0},
                {"x": 2908, "y": 3431, "level": 0},
                {"x": 2950, "y": 3406, "level": 0},
                {"x": 2995, "y": 3429, "level": 0},
                {"x": 3055, "y": 3396, "level": 0},
                {"x": 3027, "y": 3454, "level": 0},
                {"x": 3089, "y": 3409, "level": 0},
                {"x": 3134, "y": 3423, "level": 0},
                {"x": 3158, "y": 3439, "level": 0},
                {"x": 3176, "y": 3400, "level": 0},
                {"x": 3228, "y": 3409, "level": 0},
                {"x": 3233, "y": 3446, "level": 0},
                {"x": 3276, "y": 3444, "level": 0},
                {"x": 3318, "y": 3426, "level": 0},
                {"x": 3390, "y": 3421, "level": 0},
                {"x": 3362, "y": 3403, "level": 0},
                {"x": 3411, "y": 3410, "level": 0},
                {"x": 3439, "y": 3454, "level": 0},
                {"x": 3473, "y": 3401, "level": 0},
                {"x": 3461, "y": 3432, "level": 0},
                {"x": 3538, "y": 3449, "level": 0},
                {"x": 3563, "y": 3408, "level": 0},
                {"x": 2356, "y": 3498, "level": 0},
                {"x": 2325, "y": 3510, "level": 0},
                {"x": 2394, "y": 3513, "level": 0},
                {"x": 2401, "y": 3458, "level": 0},
                {"x": 2489, "y": 3487, "level": 0},
                {"x": 2457, "y": 3511, "level": 0},
                {"x": 2504, "y": 3484, "level": 0},
                {"x": 2550, "y": 3475, "level": 0},
                {"x": 2588, "y": 3506, "level": 0},
                {"x": 2609, "y": 3470, "level": 0},
                {"x": 2649, "y": 3473, "level": 0},
                {"x": 2683, "y": 3491, "level": 0},
                {"x": 2707, "y": 3475, "level": 0},
                {"x": 2733, "y": 3502, "level": 0},
                {"x": 2777, "y": 3501, "level": 0},
                {"x": 2808, "y": 3474, "level": 0},
                {"x": 2832, "y": 3473, "level": 0},
                {"x": 2859, "y": 3508, "level": 0},
                {"x": 2937, "y": 3511, "level": 0},
                {"x": 2900, "y": 3501, "level": 0},
                {"x": 2956, "y": 3505, "level": 0},
                {"x": 2983, "y": 3473, "level": 0},
                {"x": 3035, "y": 3490, "level": 0},
                {"x": 3021, "y": 3470, "level": 0},
                {"x": 3103, "y": 3488, "level": 0},
                {"x": 3127, "y": 3469, "level": 0},
                {"x": 3145, "y": 3510, "level": 0},
                {"x": 3190, "y": 3464, "level": 0},
                {"x": 3254, "y": 3505, "level": 0},
                {"x": 3260, "y": 3460, "level": 0},
                {"x": 3317, "y": 3507, "level": 0},
                {"x": 3288, "y": 3460, "level": 0},
                {"x": 3329, "y": 3518, "level": 0},
                {"x": 3373, "y": 3483, "level": 0},
                {"x": 3420, "y": 3479, "level": 0},
                {"x": 3452, "y": 3476, "level": 0},
                {"x": 3487, "y": 3492, "level": 0},
                {"x": 3516, "y": 3473, "level": 0},
                {"x": 3529, "y": 3501, "level": 0},
                {"x": 3576, "y": 3481, "level": 0},
                {"x": 3598, "y": 3509, "level": 0},
                {"x": 3619, "y": 3485, "level": 0},
                {"x": 3649, "y": 3475, "level": 0},
                {"x": 3678, "y": 3518, "level": 0},
                {"x": 2336, "y": 3540, "level": 0},
                {"x": 2351, "y": 3572, "level": 0},
                {"x": 2418, "y": 3525, "level": 0},
                {"x": 2394, "y": 3574, "level": 0},
                {"x": 2491, "y": 3529, "level": 0},
                {"x": 2542, "y": 3562, "level": 0},
                {"x": 2677, "y": 3539, "level": 0},
                {"x": 2653, "y": 3578, "level": 0},
                {"x": 2699, "y": 3537, "level": 0},
                {"x": 2721, "y": 3577, "level": 0},
                {"x": 2757, "y": 3548, "level": 0},
                {"x": 2757, "y": 3581, "level": 0},
                {"x": 2878, "y": 3529, "level": 0},
                {"x": 2860, "y": 3575, "level": 0},
                {"x": 2928, "y": 3573, "level": 0},
                {"x": 2919, "y": 3535, "level": 0},
                {"x": 2979, "y": 3546, "level": 0},
                {"x": 2986, "y": 3583, "level": 0},
                {"x": 3052, "y": 3548, "level": 0},
                {"x": 3030, "y": 3520, "level": 0},
                {"x": 3096, "y": 3534, "level": 0},
                {"x": 3125, "y": 3578, "level": 0},
                {"x": 3153, "y": 3545, "level": 0},
                {"x": 3184, "y": 3559, "level": 0},
                {"x": 3229, "y": 3541, "level": 0},
                {"x": 3255, "y": 3576, "level": 0},
                {"x": 3289, "y": 3528, "level": 0},
                {"x": 3292, "y": 3574, "level": 0},
                {"x": 3376, "y": 3567, "level": 0},
                {"x": 3339, "y": 3572, "level": 0},
                {"x": 3418, "y": 3544, "level": 0},
                {"x": 3432, "y": 3544, "level": 0},
                {"x": 3460, "y": 3553, "level": 0},
                {"x": 3510, "y": 3530, "level": 0},
                {"x": 3571, "y": 3534, "level": 0},
                {"x": 3547, "y": 3524, "level": 0},
                {"x": 3624, "y": 3524, "level": 0},
                {"x": 3596, "y": 3541, "level": 0},
                {"x": 3655, "y": 3537, "level": 0},
                {"x": 2262, "y": 3605, "level": 0},
                {"x": 2295, "y": 3639, "level": 0},
                {"x": 2332, "y": 3610, "level": 0},
                {"x": 2347, "y": 3594, "level": 0},
                {"x": 2392, "y": 3599, "level": 0},
                {"x": 2374, "y": 3630, "level": 0},
                {"x": 2509, "y": 3634, "level": 0},
                {"x": 2559, "y": 3619, "level": 0},
                {"x": 2606, "y": 3635, "level": 0},
                {"x": 2586, "y": 3605, "level": 0},
                {"x": 2684, "y": 3612, "level": 0},
                {"x": 2669, "y": 3637, "level": 0},
                {"x": 2708, "y": 3589, "level": 0},
                {"x": 2737, "y": 3626, "level": 0},
                {"x": 2779, "y": 3594, "level": 0},
                {"x": 2780, "y": 3635, "level": 0},
                {"x": 2999, "y": 3606, "level": 0},
                {"x": 2965, "y": 3632, "level": 0},
                {"x": 3059, "y": 3620, "level": 0},
                {"x": 3028, "y": 3632, "level": 0},
                {"x": 3092, "y": 3605, "level": 0},
                {"x": 3127, "y": 3597, "level": 0},
                {"x": 3179, "y": 3612, "level": 0},
                {"x": 3146, "y": 3642, "level": 0},
                {"x": 3254, "y": 3624, "level": 0},
                {"x": 3247, "y": 3597, "level": 0},
                {"x": 3304, "y": 3605, "level": 0},
                {"x": 3278, "y": 3615, "level": 0},
                {"x": 3338, "y": 3638, "level": 0},
                {"x": 3342, "y": 3591, "level": 0},
                {"x": 3433, "y": 3639, "level": 0},
                {"x": 3403, "y": 3640, "level": 0},
                {"x": 2309, "y": 3669, "level": 0},
                {"x": 2332, "y": 3659, "level": 0},
                {"x": 2612, "y": 3658, "level": 0},
                {"x": 2643, "y": 3679, "level": 0},
                {"x": 2680, "y": 3676, "level": 0},
                {"x": 2712, "y": 3653, "level": 0},
                {"x": 2696, "y": 3695, "level": 0},
                {"x": 2756, "y": 3651, "level": 0},
                {"x": 2972, "y": 3682, "level": 0},
                {"x": 2999, "y": 3671, "level": 0},
                {"x": 2956, "y": 3705, "level": 0},
                {"x": 2965, "y": 3740, "level": 0},
                {"x": 3088, "y": 3678, "level": 0},
                {"x": 3107, "y": 3653, "level": 0},
                {"x": 3187, "y": 3661, "level": 0},
                {"x": 3142, "y": 3656, "level": 0},
                {"x": 3220, "y": 3667, "level": 0},
                {"x": 3210, "y": 3695, "level": 0},
                {"x": 3280, "y": 3664, "level": 0},
                {"x": 3315, "y": 3704, "level": 0},
                {"x": 3353, "y": 3664, "level": 0},
                {"x": 3378, "y": 3699, "level": 0},
                {"x": 3437, "y": 3682, "level": 0},
                {"x": 3423, "y": 3706, "level": 0},
                {"x": 3511, "y": 3670, "level": 0},
                {"x": 3470, "y": 3710, "level": 0},
                {"x": 2666, "y": 3717, "level": 0},
                {"x": 2686, "y": 3727, "level": 0},
                {"x": 2725, "y": 3751, "level": 0},
                {"x": 2744, "y": 3735, "level": 0},
                {"x": 2975, "y": 3762, "level": 0},
                {"x": 2985, "y": 3715, "level": 0},
                {"x": 3060, "y": 3767, "level": 0},
                {"x": 3046, "y": 3752, "level": 0},
                {"x": 3104, "y": 3745, "level": 0},
                {"x": 3116, "y": 3769, "level": 0},
                {"x": 3153, "y": 3744, "level": 0},
                {"x": 3193, "y": 3739, "level": 0},
                {"x": 3213, "y": 3756, "level": 0},
                {"x": 3255, "y": 3740, "level": 0},
                {"x": 3342, "y": 3732, "level": 0},
                {"x": 3367, "y": 3766, "level": 0},
                {"x": 3432, "y": 3752, "level": 0},
                {"x": 3430, "y": 3717, "level": 0},
                {"x": 3506, "y": 3734, "level": 0},
                {"x": 2737, "y": 3796, "level": 0},
                {"x": 2705, "y": 3822, "level": 1},
                {"x": 2960, "y": 3824, "level": 0},
                {"x": 2999, "y": 3791, "level": 0},
                {"x": 3059, "y": 3833, "level": 0},
                {"x": 3051, "y": 3804, "level": 0},
                {"x": 3101, "y": 3783, "level": 0},
                {"x": 3128, "y": 3822, "level": 0},
                {"x": 3151, "y": 3795, "level": 0},
                {"x": 3193, "y": 3783, "level": 0},
                {"x": 3250, "y": 3821, "level": 0},
                {"x": 3208, "y": 3792, "level": 0},
                {"x": 3363, "y": 3807, "level": 0},
                {"x": 3349, "y": 3823, "level": 0},
                {"x": 2958, "y": 3858, "level": 0},
                {"x": 2990, "y": 3883, "level": 0},
                {"x": 3037, "y": 3870, "level": 0},
                {"x": 3055, "y": 3895, "level": 0},
                {"x": 3088, "y": 3891, "level": 0},
                {"x": 3127, "y": 3891, "level": 0},
                {"x": 3157, "y": 3865, "level": 0},
                {"x": 3195, "y": 3877, "level": 0},
                {"x": 3250, "y": 3843, "level": 0},
                {"x": 3252, "y": 3887, "level": 0},
                {"x": 3294, "y": 3865, "level": 0},
                {"x": 3317, "y": 3896, "level": 0},
                {"x": 3383, "y": 3893, "level": 0},
                {"x": 3336, "y": 3898, "level": 0},
                {"x": 2971, "y": 3929, "level": 0},
                {"x": 2990, "y": 3948, "level": 0},
                {"x": 3055, "y": 3915, "level": 0},
                {"x": 3060, "y": 3941, "level": 0},
                {"x": 3128, "y": 3913, "level": 0},
                {"x": 3110, "y": 3954, "level": 0},
                {"x": 3155, "y": 3924, "level": 0},
                {"x": 3181, "y": 3944, "level": 0},
                {"x": 3244, "y": 3907, "level": 0},
                {"x": 3242, "y": 3956, "level": 0},
                {"x": 3306, "y": 3947, "level": 0},
                {"x": 3275, "y": 3915, "level": 0},
                {"x": 3360, "y": 3944, "level": 2},
                {"x": 3429, "y": 3924, "level": 0},
                {"x": 2901, "y": 3356, "level": 0},
                {"x": 2915, "y": 3335, "level": 0},
                {"x": 2972, "y": 3342, "level": 0},
                {"x": 2976, "y": 3386, "level": 0},
                {"x": 3027, "y": 3365, "level": 0},
                {"x": 3050, "y": 3348, "level": 0},
                {"x": 3125, "y": 3371, "level": 0},
                {"x": 3081, "y": 3363, "level": 0},
                {"x": 3158, "y": 3376, "level": 0},
                {"x": 3140, "y": 3343, "level": 0},
                {"x": 3243, "y": 3378, "level": 0},
                {"x": 3240, "y": 3351, "level": 0},
                {"x": 3312, "y": 3376, "level": 0},
                {"x": 3304, "y": 3335, "level": 0},
                {"x": 3352, "y": 3381, "level": 0},
                {"x": 3358, "y": 3353, "level": 0},
                {"x": 3438, "y": 3349, "level": 0},
                {"x": 3408, "y": 3390, "level": 0},
                {"x": 3474, "y": 3385, "level": 0},
                {"x": 3485, "y": 3362, "level": 0},
                {"x": 2915, "y": 3302, "level": 0},
                {"x": 2917, "y": 3271, "level": 0},
                {"x": 2976, "y": 3274, "level": 0},
                {"x": 2976, "y": 3316, "level": 0},
                {"x": 3033, "y": 3286, "level": 0},
                {"x": 3066, "y": 3322, "level": 0},
                {"x": 3128, "y": 3310, "level": 0},
                {"x": 3129, "y": 3268, "level": 0},
                {"x": 3188, "y": 3317, "level": 0},
                {"x": 3146, "y": 3312, "level": 0},
                {"x": 3210, "y": 3305, "level": 0},
                {"x": 3242, "y": 3268, "level": 0},
                {"x": 3265, "y": 3300, "level": 0},
                {"x": 3309, "y": 3298, "level": 0},
                {"x": 3347, "y": 3273, "level": 0},
                {"x": 3349, "y": 3312, "level": 0},
                {"x": 3450, "y": 3276, "level": 0},
                {"x": 3422, "y": 3302, "level": 0},
                {"x": 3488, "y": 3270, "level": 0},
                {"x": 3478, "y": 3292, "level": 0},
                {"x": 3538, "y": 3311, "level": 0},
                {"x": 3582, "y": 3312, "level": 0},
                {"x": 2920, "y": 3249, "level": 0},
                {"x": 2932, "y": 3216, "level": 0},
                {"x": 2982, "y": 3203, "level": 0},
                {"x": 2997, "y": 3241, "level": 0},
                {"x": 3042, "y": 3251, "level": 0},
                {"x": 3019, "y": 3242, "level": 0},
                {"x": 3091, "y": 3258, "level": 0},
                {"x": 3122, "y": 3227, "level": 0},
                {"x": 3137, "y": 3212, "level": 0},
                {"x": 3135, "y": 3257, "level": 0},
                {"x": 3210, "y": 3205, "level": 0},
                {"x": 3263, "y": 3253, "level": 0},
                {"x": 3271, "y": 3204, "level": 0},
                {"x": 3323, "y": 3225, "level": 0},
                {"x": 3486, "y": 3245, "level": 0},
                {"x": 3519, "y": 3246, "level": 0},
                {"x": 2986, "y": 3191, "level": 0},
                {"x": 2997, "y": 3149, "level": 0},
                {"x": 3028, "y": 3171, "level": 0},
                {"x": 3011, "y": 3195, "level": 0},
                {"x": 3119, "y": 3167, "level": 0},
                {"x": 3083, "y": 3155, "level": 0},
                {"x": 3146, "y": 3170, "level": 0},
                {"x": 3195, "y": 3163, "level": 0},
                {"x": 3240, "y": 3161, "level": 0},
                {"x": 3236, "y": 3193, "level": 0},
                {"x": 3272, "y": 3156, "level": 0},
                {"x": 3293, "y": 3183, "level": 0},
                {"x": 3391, "y": 3180, "level": 0},
                {"x": 3350, "y": 3162, "level": 0},
                {"x": 3418, "y": 3164, "level": 0},
                {"x": 3394, "y": 3149, "level": 0},
                {"x": 3465, "y": 3140, "level": 0},
                {"x": 3210, "y": 3092, "level": 0},
                {"x": 3257, "y": 3117, "level": 0},
                {"x": 3304, "y": 3126, "level": 0},
                {"x": 3303, "y": 3077, "level": 0},
                {"x": 3378, "y": 3078, "level": 0},
                {"x": 3344, "y": 3112, "level": 0},
                {"x": 3429, "y": 3106, "level": 0},
                {"x": 3410, "y": 3079, "level": 0},
                {"x": 3483, "y": 3108, "level": 0},
                {"x": 3509, "y": 3088, "level": 0},
                {"x": 3171, "y": 3028, "level": 0},
                {"x": 3189, "y": 3047, "level": 0},
                {"x": 3235, "y": 3048, "level": 0},
                {"x": 3215, "y": 3020, "level": 0},
                {"x": 3303, "y": 3050, "level": 0},
                {"x": 3320, "y": 3013, "level": 0},
                {"x": 3355, "y": 3044, "level": 0},
                {"x": 3383, "y": 3019, "level": 0},
                {"x": 3419, "y": 3017, "level": 0},
                {"x": 3422, "y": 3046, "level": 0},
                {"x": 3468, "y": 3044, "level": 0},
                {"x": 3509, "y": 3025, "level": 0},
                {"x": 3170, "y": 2982, "level": 0},
                {"x": 3142, "y": 3003, "level": 0},
                {"x": 3225, "y": 2986, "level": 0},
                {"x": 3256, "y": 2953, "level": 0},
                {"x": 3289, "y": 2957, "level": 0},
                {"x": 3319, "y": 2990, "level": 0},
                {"x": 3376, "y": 2988, "level": 0},
                {"x": 3346, "y": 2958, "level": 0},
                {"x": 3404, "y": 2992, "level": 0},
                {"x": 3442, "y": 2955, "level": 0},
                {"x": 3170, "y": 2914, "level": 0},
                {"x": 3177, "y": 2888, "level": 0},
                {"x": 3245, "y": 2935, "level": 0},
                {"x": 3205, "y": 2895, "level": 0},
                {"x": 3296, "y": 2891, "level": 0},
                {"x": 3316, "y": 2930, "level": 0},
                {"x": 3361, "y": 2921, "level": 0},
                {"x": 3373, "y": 2898, "level": 0},
                {"x": 3423, "y": 2916, "level": 0},
                {"x": 3434, "y": 2888, "level": 0},
                {"x": 3218, "y": 2843, "level": 0},
                {"x": 3247, "y": 2866, "level": 0},
                {"x": 3290, "y": 2840, "level": 0},
                {"x": 3321, "y": 2848, "level": 0},
                {"x": 3390, "y": 2841, "level": 0},
                {"x": 3341, "y": 2836, "level": 0},
                {"x": 3376, "y": 2790, "level": 0},
                {"x": 3351, "y": 2781, "level": 0},
                {"x": 3401, "y": 2758, "level": 0},
                {"x": 3394, "y": 2801, "level": 1},
                {"x": 2703, "y": 3204, "level": 0},
                {"x": 2746, "y": 3232, "level": 0},
                {"x": 2772, "y": 3217, "level": 0},
                {"x": 2805, "y": 3204, "level": 0},
                {"x": 2743, "y": 3174, "level": 0},
                {"x": 2734, "y": 3144, "level": 0},
                {"x": 2802, "y": 3156, "level": 0},
                {"x": 2762, "y": 3172, "level": 0},
                {"x": 2843, "y": 3153, "level": 0},
                {"x": 2874, "y": 3173, "level": 0},
                {"x": 2912, "y": 3168, "level": 0},
                {"x": 2906, "y": 3141, "level": 0},
                {"x": 2763, "y": 3125, "level": 0},
                {"x": 2786, "y": 3075, "level": 0},
                {"x": 2846, "y": 3078, "level": 0},
                {"x": 2831, "y": 3119, "level": 0},
                {"x": 2912, "y": 3116, "level": 0},
                {"x": 2881, "y": 3073, "level": 0},
                {"x": 2761, "y": 3057, "level": 0},
                {"x": 2779, "y": 3023, "level": 0},
                {"x": 2869, "y": 3026, "level": 0},
                {"x": 2835, "y": 3025, "level": 0},
                {"x": 2930, "y": 3029, "level": 0},
                {"x": 2901, "y": 3031, "level": 0},
                {"x": 2791, "y": 2969, "level": 0},
                {"x": 2757, "y": 2949, "level": 0},
                {"x": 2916, "y": 2992, "level": 0},
                {"x": 2881, "y": 2968, "level": 0},
                {"x": 2970, "y": 2979, "level": 0},
                {"x": 2958, "y": 2996, "level": 0},
                {"x": 2804, "y": 2924, "level": 0},
                {"x": 2793, "y": 2893, "level": 0},
                {"x": 2858, "y": 2890, "level": 0},
                {"x": 2841, "y": 2934, "level": 0},
                {"x": 2920, "y": 2888, "level": 0},
                {"x": 2932, "y": 2933, "level": 0},
                {"x": 2960, "y": 2928, "level": 0},
                {"x": 2964, "y": 2908, "level": 0},
                {"x": 3082, "y": 3475, "level": 0},
                {"x": 2778, "y": 3583, "level": 0},
                {"x": 3265, "y": 3270, "level": 0},
                {"x": 3508, "y": 3673, "level": 0},
                {"x": 2864, "y": 3589, "level": 0}
            ]

        },
        {
            "id": 400,
            "type": "compass",
            "tier": "master",
            "text": ["The compass shows where you need to go on the arc."],
            "challenge": [{"type": "wizard"}, {"type": "lockbox"}, {"type": "towers"}],
            "spots": [
                {"x": 1868, "y": 11649, "level": 0},
                {"x": 1904, "y": 11604, "level": 0},
                {"x": 1879, "y": 11559, "level": 0},
                {"x": 1812, "y": 11620, "level": 0},
                {"x": 2349, "y": 11182, "level": 0},
                {"x": 2283, "y": 11163, "level": 0},
                {"x": 2265, "y": 11223, "level": 0},
                {"x": 2323, "y": 11222, "level": 0},
                {"x": 2106, "y": 11279, "level": 0},
                {"x": 2069, "y": 11338, "level": 0},
                {"x": 2093, "y": 11354, "level": 0},
                {"x": 2117, "y": 11313, "level": 0},
                {"x": 2091, "y": 11296, "level": 0},
                {"x": 2449, "y": 11564, "level": 0},
                {"x": 2506, "y": 11593, "level": 0},
                {"x": 2508, "y": 11605, "level": 0},
                {"x": 2494, "y": 11553, "level": 0},
                {"x": 1779, "y": 11993, "level": 0},
                {"x": 1759, "y": 11986, "level": 0},
                {"x": 1759, "y": 11966, "level": 0},
                {"x": 1771, "y": 11919, "level": 0},
                {"x": 2040, "y": 11800, "level": 0},
                {"x": 2073, "y": 11813, "level": 0},
                {"x": 2035, "y": 11823, "level": 0},
                {"x": 2004, "y": 11801, "level": 0},
                {"x": 1966, "y": 11814, "level": 0},
                {"x": 1939, "y": 11801, "level": 0},
                {"x": 2278, "y": 11503, "level": 0},
                {"x": 2282, "y": 11464, "level": 0},
                {"x": 2193, "y": 11480, "level": 0},
                {"x": 2089, "y": 11432, "level": 0}
            ]
        }
    ]
    export const coordinate: Clues.Coordinate[] = [
        {
            "id": 402,
            "type": "coordinates",
            "tier": "medium",
            "text": ["00 degrees 05 minutes south,01 degrees 13 minutes east"],
            "coordinates": {
                "latitude": {
                    "degrees": 0,
                    "minutes": 5,
                    "direction": "south"
                },
                "longitude": {
                    "degrees": 1,
                    "minutes": 13,
                    "direction": "east"
                }
            }
        },
        {
            "id": 403,
            "type": "coordinates",
            "tier": "medium",
            "text": ["00 degrees 13 minutes south,14 degrees 00 minutes east"],
            "coordinates": {
                "latitude": {
                    "degrees": 0,
                    "minutes": 13,
                    "direction": "south"
                },
                "longitude": {
                    "degrees": 14,
                    "minutes": 0,
                    "direction": "east"
                }
            }
        },
        {
            "id": 404,
            "type": "coordinates",
            "tier": "medium",
            "text": ["00 degrees 18 minutes south,09 degrees 28 minutes east"],
            "coordinates": {
                "latitude": {
                    "degrees": 0,
                    "minutes": 18,
                    "direction": "south"
                },
                "longitude": {
                    "degrees": 9,
                    "minutes": 28,
                    "direction": "east"
                }
            }
        },
        {
            "id": 405,
            "type": "coordinates",
            "tier": "medium",
            "text": ["00 degrees 20 minutes south,23 degrees 15 minutes east"],
            "coordinates": {
                "latitude": {
                    "degrees": 0,
                    "minutes": 20,
                    "direction": "south"
                },
                "longitude": {
                    "degrees": 23,
                    "minutes": 15,
                    "direction": "east"
                }
            }
        },
        {
            "id": 406,
            "type": "coordinates",
            "tier": "medium",
            "text": ["00 degrees 31 minutes south,17 degrees 43 minutes east"],
            "coordinates": {
                "latitude": {
                    "degrees": 0,
                    "minutes": 31,
                    "direction": "south"
                },
                "longitude": {
                    "degrees": 17,
                    "minutes": 43,
                    "direction": "east"
                }
            }
        },
        {
            "id": 407,
            "type": "coordinates",
            "tier": "medium",
            "text": ["00 degrees 50 minutes north,24 degrees 16 minutes east"],
            "coordinates": {
                "latitude": {
                    "degrees": 0,
                    "minutes": 50,
                    "direction": "north"
                },
                "longitude": {
                    "degrees": 24,
                    "minutes": 16,
                    "direction": "east"
                }
            }
        },
        {
            "id": 408,
            "type": "coordinates",
            "tier": "medium",
            "text": ["01 degrees 18 minutes south,14 degrees 15 minutes east"],
            "coordinates": {
                "latitude": {
                    "degrees": 1,
                    "minutes": 18,
                    "direction": "south"
                },
                "longitude": {
                    "degrees": 14,
                    "minutes": 15,
                    "direction": "east"
                }
            }
        },
        {
            "id": 410,
            "type": "coordinates",
            "tier": "medium",
            "text": ["01 degrees 26 minutes north,08 degrees 01 minutes east"],
            "coordinates": {
                "latitude": {
                    "degrees": 1,
                    "minutes": 26,
                    "direction": "north"
                },
                "longitude": {
                    "degrees": 8,
                    "minutes": 1,
                    "direction": "east"
                }
            }
        },
        {
            "id": 411,
            "type": "coordinates",
            "tier": "medium",
            "text": ["01 degrees 35 minutes south,07 degrees 28 minutes east"],
            "coordinates": {
                "latitude": {
                    "degrees": 1,
                    "minutes": 35,
                    "direction": "south"
                },
                "longitude": {
                    "degrees": 7,
                    "minutes": 28,
                    "direction": "east"
                }
            }
        },
        {
            "id": 413,
            "type": "coordinates",
            "tier": "medium",
            "text": ["02 degrees 50 minutes north,06 degrees 20 minutes east"],
            "coordinates": {
                "latitude": {
                    "degrees": 2,
                    "minutes": 50,
                    "direction": "north"
                },
                "longitude": {
                    "degrees": 6,
                    "minutes": 20,
                    "direction": "east"
                }
            }
        },
        {
            "id": 414,
            "type": "coordinates",
            "tier": "medium",
            "text": ["02 degrees 50 minutes north,21 degrees 46 minutes east"],
            "coordinates": {
                "latitude": {
                    "degrees": 2,
                    "minutes": 50,
                    "direction": "north"
                },
                "longitude": {
                    "degrees": 21,
                    "minutes": 46,
                    "direction": "east"
                }
            }
        },
        {
            "id": 416,
            "type": "coordinates",
            "tier": "medium",
            "text": ["03 degrees 35 minutes south,13 degrees 35 minutes east"],
            "coordinates": {
                "latitude": {
                    "degrees": 3,
                    "minutes": 35,
                    "direction": "south"
                },
                "longitude": {
                    "degrees": 13,
                    "minutes": 35,
                    "direction": "east"
                }
            }
        },
        {
            "id": 419,
            "type": "coordinates",
            "tier": "medium",
            "text": ["04 degrees 00 minutes south,12 degrees 46 minutes east"],
            "coordinates": {
                "latitude": {
                    "degrees": 4,
                    "minutes": 0,
                    "direction": "south"
                },
                "longitude": {
                    "degrees": 12,
                    "minutes": 46,
                    "direction": "east"
                }
            }
        },
        {
            "id": 422,
            "type": "coordinates",
            "tier": "medium",
            "text": ["04 degrees 13 minutes north,12 degrees 45 minutes east"],
            "coordinates": {
                "latitude": {
                    "degrees": 4,
                    "minutes": 13,
                    "direction": "north"
                },
                "longitude": {
                    "degrees": 12,
                    "minutes": 45,
                    "direction": "east"
                }
            }
        },
        {
            "id": 425,
            "type": "coordinates",
            "tier": "medium",
            "text": ["05 degrees 20 minutes south,04 degrees 28 minutes east"],
            "coordinates": {
                "latitude": {
                    "degrees": 5,
                    "minutes": 20,
                    "direction": "south"
                },
                "longitude": {
                    "degrees": 4,
                    "minutes": 28,
                    "direction": "east"
                }
            }
        },
        {
            "id": 427,
            "type": "coordinates",
            "tier": "medium",
            "text": ["05 degrees 43 minutes north,23 degrees 05 minutes east"],
            "coordinates": {
                "latitude": {
                    "degrees": 5,
                    "minutes": 43,
                    "direction": "north"
                },
                "longitude": {
                    "degrees": 23,
                    "minutes": 5,
                    "direction": "east"
                }
            }
        },
        {
            "id": 431,
            "type": "coordinates",
            "tier": "medium",
            "text": ["06 degrees 31 minutes north,01 degrees 46 minutes west"],
            "coordinates": {
                "latitude": {
                    "degrees": 6,
                    "minutes": 31,
                    "direction": "north"
                },
                "longitude": {
                    "degrees": 1,
                    "minutes": 46,
                    "direction": "west"
                }
            }
        },
        {
            "id": 432,
            "type": "coordinates",
            "tier": "medium",
            "text": ["07 degrees 05 minutes north,30 degrees 56 minutes east"],
            "coordinates": {
                "latitude": {
                    "degrees": 7,
                    "minutes": 5,
                    "direction": "north"
                },
                "longitude": {
                    "degrees": 30,
                    "minutes": 56,
                    "direction": "east"
                }
            }
        },
        {
            "id": 434,
            "type": "coordinates",
            "tier": "medium",
            "text": ["07 degrees 33 minutes north,15 degrees 00 minutes east"],
            "coordinates": {
                "latitude": {
                    "degrees": 7,
                    "minutes": 33,
                    "direction": "north"
                },
                "longitude": {
                    "degrees": 15,
                    "minutes": 0,
                    "direction": "east"
                }
            }
        },
        {
            "id": 440,
            "type": "coordinates",
            "tier": "medium",
            "text": ["08 degrees 33 minutes north,01 degrees 39 minutes west"],
            "coordinates": {
                "latitude": {
                    "degrees": 8,
                    "minutes": 33,
                    "direction": "north"
                },
                "longitude": {
                    "degrees": 1,
                    "minutes": 39,
                    "direction": "west"
                }
            }
        },
        {
            "id": 442,
            "type": "coordinates",
            "tier": "medium",
            "text": ["09 degrees 33 minutes north,02 degrees 15 minutes east"],
            "coordinates": {
                "latitude": {
                    "degrees": 9,
                    "minutes": 33,
                    "direction": "north"
                },
                "longitude": {
                    "degrees": 2,
                    "minutes": 15,
                    "direction": "east"
                }
            }
        },
        {
            "id": 443,
            "type": "coordinates",
            "tier": "medium",
            "text": ["09 degrees 48 minutes north,17 degrees 39 minutes east"],
            "coordinates": {
                "latitude": {
                    "degrees": 9,
                    "minutes": 48,
                    "direction": "north"
                },
                "longitude": {
                    "degrees": 17,
                    "minutes": 39,
                    "direction": "east"
                }
            }
        },
        {
            "id": 444,
            "type": "coordinates",
            "tier": "medium",
            "text": ["11 degrees 03 minutes north,31 degrees 20 minutes east"],
            "coordinates": {
                "latitude": {
                    "degrees": 11,
                    "minutes": 3,
                    "direction": "north"
                },
                "longitude": {
                    "degrees": 31,
                    "minutes": 20,
                    "direction": "east"
                }
            }
        },
        {
            "id": 445,
            "type": "coordinates",
            "tier": "medium",
            "text": ["11 degrees 05 minutes north,00 degrees 45 minutes west"],
            "coordinates": {
                "latitude": {
                    "degrees": 11,
                    "minutes": 5,
                    "direction": "north"
                },
                "longitude": {
                    "degrees": 0,
                    "minutes": 45,
                    "direction": "west"
                }
            }
        },
        {
            "id": 446,
            "type": "coordinates",
            "tier": "medium",
            "text": ["11 degrees 41 minutes north,14 degrees 58 minutes east"],
            "coordinates": {
                "latitude": {
                    "degrees": 11,
                    "minutes": 41,
                    "direction": "north"
                },
                "longitude": {
                    "degrees": 14,
                    "minutes": 58,
                    "direction": "east"
                }
            }
        },
        {
            "id": 449,
            "type": "coordinates",
            "tier": "medium",
            "text": ["14 degrees 54 minutes north,09 degrees 13 minutes east"],
            "coordinates": {
                "latitude": {
                    "degrees": 14,
                    "minutes": 54,
                    "direction": "north"
                },
                "longitude": {
                    "degrees": 9,
                    "minutes": 13,
                    "direction": "east"
                }
            }
        },
        {
            "id": 462,
            "type": "coordinates",
            "tier": "medium",
            "text": ["22 degrees 30 minutes north,03 degrees 01 minutes east"],
            "coordinates": {
                "latitude": {
                    "degrees": 22,
                    "minutes": 30,
                    "direction": "north"
                },
                "longitude": {
                    "degrees": 3,
                    "minutes": 1,
                    "direction": "east"
                }
            }
        },
        {
            "id": 401,
            "type": "coordinates",
            "tier": "hard",
            "text": ["00 degrees 00 minutes north,07 degrees 13 minutes west"],
            "challenge": [{"type": "wizard"}],
            "coordinates": {
                "latitude": {
                    "degrees": 0,
                    "minutes": 0,
                    "direction": "north"
                },
                "longitude": {
                    "degrees": 7,
                    "minutes": 13,
                    "direction": "west"
                }
            }
        },
        {
            "id": 409,
            "type": "coordinates",
            "tier": "hard",
            "text": ["01 degrees 24 minutes north,08 degrees 05 minutes west"],
            "challenge": [{"type": "wizard"}],
            "coordinates": {
                "latitude": {
                    "degrees": 1,
                    "minutes": 24,
                    "direction": "north"
                },
                "longitude": {
                    "degrees": 8,
                    "minutes": 5,
                    "direction": "west"
                }
            }
        },
        {
            "id": 412,
            "type": "coordinates",
            "tier": "hard",
            "text": ["02 degrees 33 minutes north,28 degrees 45 minutes east"],
            "challenge": [{"type": "wizard"}],
            "coordinates": {
                "latitude": {
                    "degrees": 2,
                    "minutes": 33,
                    "direction": "north"
                },
                "longitude": {
                    "degrees": 28,
                    "minutes": 45,
                    "direction": "east"
                }
            }
        },
        {
            "id": 415,
            "type": "coordinates",
            "tier": "hard",
            "text": ["03 degrees 03 minutes south,05 degrees 03 minutes east"],
            "challenge": [{"type": "wizard"}],
            "coordinates": {
                "latitude": {
                    "degrees": 3,
                    "minutes": 3,
                    "direction": "south"
                },
                "longitude": {
                    "degrees": 5,
                    "minutes": 3,
                    "direction": "east"
                }
            }
        },
        {
            "id": 417,
            "type": "coordinates",
            "tier": "hard",
            "text": ["03 degrees 39 minutes south,13 degrees 58 minutes east"],
            "challenge": [{"type": "wizard"}],
            "coordinates": {
                "latitude": {
                    "degrees": 3,
                    "minutes": 39,
                    "direction": "south"
                },
                "longitude": {
                    "degrees": 13,
                    "minutes": 58,
                    "direction": "east"
                }
            }
        },
        {
            "id": 418,
            "type": "coordinates",
            "tier": "hard",
            "text": ["03 degrees 45 minutes south,22 degrees 45 minutes east"],
            "challenge": [{"type": "wizard"}],
            "coordinates": {
                "latitude": {
                    "degrees": 3,
                    "minutes": 45,
                    "direction": "south"
                },
                "longitude": {
                    "degrees": 22,
                    "minutes": 45,
                    "direction": "east"
                }
            }
        },
        {
            "id": 420,
            "type": "coordinates",
            "tier": "hard",
            "text": ["04 degrees 03 minutes south,03 degrees 11 minutes east"],
            "challenge": [{"type": "wizard"}],
            "coordinates": {
                "latitude": {
                    "degrees": 4,
                    "minutes": 3,
                    "direction": "south"
                },
                "longitude": {
                    "degrees": 3,
                    "minutes": 11,
                    "direction": "east"
                }
            }
        },
        {
            "id": 421,
            "type": "coordinates",
            "tier": "hard",
            "text": ["04 degrees 05 minutes south,04 degrees 24 minutes east"],
            "challenge": [{"type": "wizard"}],
            "coordinates": {
                "latitude": {
                    "degrees": 4,
                    "minutes": 5,
                    "direction": "south"
                },
                "longitude": {
                    "degrees": 4,
                    "minutes": 24,
                    "direction": "east"
                }
            }
        },
        {
            "id": 423,
            "type": "coordinates",
            "tier": "hard",
            "text": ["04 degrees 16 minutes south,16 degrees 16 minutes east"],
            "challenge": [{"type": "wizard"}],
            "coordinates": {
                "latitude": {
                    "degrees": 4,
                    "minutes": 16,
                    "direction": "south"
                },
                "longitude": {
                    "degrees": 16,
                    "minutes": 16,
                    "direction": "east"
                }
            }
        },
        {
            "id": 424,
            "type": "coordinates",
            "tier": "hard",
            "text": ["04 degrees 41 minutes north,03 degrees 09 minutes west"],
            "challenge": [{"type": "wizard"}],
            "coordinates": {
                "latitude": {
                    "degrees": 4,
                    "minutes": 41,
                    "direction": "north"
                },
                "longitude": {
                    "degrees": 3,
                    "minutes": 9,
                    "direction": "west"
                }
            }
        },
        {
            "id": 426,
            "type": "coordinates",
            "tier": "hard",
            "text": ["05 degrees 37 minutes north,31 degrees 15 minutes east"],
            "challenge": [{"type": "wizard"}],
            "coordinates": {
                "latitude": {
                    "degrees": 5,
                    "minutes": 37,
                    "direction": "north"
                },
                "longitude": {
                    "degrees": 31,
                    "minutes": 15,
                    "direction": "east"
                }
            }
        },
        {
            "id": 428,
            "type": "coordinates",
            "tier": "hard",
            "text": ["05 degrees 50 minutes south,10 degrees 05 minutes east"],
            "challenge": [{"type": "wizard"}],
            "coordinates": {
                "latitude": {
                    "degrees": 5,
                    "minutes": 50,
                    "direction": "south"
                },
                "longitude": {
                    "degrees": 10,
                    "minutes": 5,
                    "direction": "east"
                }
            }
        },
        {
            "id": 429,
            "type": "coordinates",
            "tier": "hard",
            "text": ["06 degrees 00 minutes south,21 degrees 48 minutes east"],
            "challenge": [{"type": "wizard"}],
            "coordinates": {
                "latitude": {
                    "degrees": 6,
                    "minutes": 0,
                    "direction": "south"
                },
                "longitude": {
                    "degrees": 21,
                    "minutes": 48,
                    "direction": "east"
                }
            }
        },
        {
            "id": 430,
            "type": "coordinates",
            "tier": "hard",
            "text": ["06 degrees 11 minutes south,15 degrees 07 minutes east"],
            "challenge": [{"type": "wizard"}],
            "coordinates": {
                "latitude": {
                    "degrees": 6,
                    "minutes": 11,
                    "direction": "south"
                },
                "longitude": {
                    "degrees": 15,
                    "minutes": 7,
                    "direction": "east"
                }
            }
        },
        {
            "id": 433,
            "type": "coordinates",
            "tier": "hard",
            "text": ["07 degrees 22 minutes north,14 degrees 15 minutes east"],
            "challenge": [{"type": "wizard"}],
            "coordinates": {
                "latitude": {
                    "degrees": 7,
                    "minutes": 22,
                    "direction": "north"
                },
                "longitude": {
                    "degrees": 14,
                    "minutes": 15,
                    "direction": "east"
                }
            }
        },
        {
            "id": 435,
            "type": "coordinates",
            "tier": "hard",
            "text": ["07 degrees 41 minutes north,06 degrees 00 minutes east"],
            "challenge": [{"type": "wizard"}],
            "coordinates": {
                "latitude": {
                    "degrees": 7,
                    "minutes": 41,
                    "direction": "north"
                },
                "longitude": {
                    "degrees": 6,
                    "minutes": 0,
                    "direction": "east"
                }
            }
        },
        {
            "id": 436,
            "type": "coordinates",
            "tier": "hard",
            "text": ["07 degrees 43 minutes south,12 degrees 26 minutes east"],
            "challenge": [{"type": "wizard"}],
            "coordinates": {
                "latitude": {
                    "degrees": 7,
                    "minutes": 43,
                    "direction": "south"
                },
                "longitude": {
                    "degrees": 12,
                    "minutes": 26,
                    "direction": "east"
                }
            }
        },
        {
            "id": 437,
            "type": "coordinates",
            "tier": "hard",
            "text": ["08 degrees 03 minutes north,31 degrees 16 minutes east"],
            "challenge": [{"type": "wizard"}],
            "coordinates": {
                "latitude": {
                    "degrees": 8,
                    "minutes": 3,
                    "direction": "north"
                },
                "longitude": {
                    "degrees": 31,
                    "minutes": 16,
                    "direction": "east"
                }
            }
        },
        {
            "id": 438,
            "type": "coordinates",
            "tier": "hard",
            "text": ["08 degrees 05 minutes south,15 degrees 56 minutes east"],
            "challenge": [{"type": "wizard"}],
            "coordinates": {
                "latitude": {
                    "degrees": 8,
                    "minutes": 5,
                    "direction": "south"
                },
                "longitude": {
                    "degrees": 15,
                    "minutes": 56,
                    "direction": "east"
                }
            }
        },
        {
            "id": 439,
            "type": "coordinates",
            "tier": "hard",
            "text": ["08 degrees 26 minutes south,10 degrees 28 minutes east"],
            "challenge": [{"type": "wizard"}],
            "coordinates": {
                "latitude": {
                    "degrees": 8,
                    "minutes": 26,
                    "direction": "south"
                },
                "longitude": {
                    "degrees": 10,
                    "minutes": 28,
                    "direction": "east"
                }
            }
        },
        {
            "id": 441,
            "type": "coordinates",
            "tier": "hard",
            "text": ["09 degrees 22 minutes north,02 degrees 24 minutes west"],
            "challenge": [{"type": "wizard"}],
            "coordinates": {
                "latitude": {
                    "degrees": 9,
                    "minutes": 22,
                    "direction": "north"
                },
                "longitude": {
                    "degrees": 2,
                    "minutes": 24,
                    "direction": "west"
                }
            }
        },
        {
            "id": 447,
            "type": "coordinates",
            "tier": "hard",
            "text": ["12 degrees 48 minutes north,20 degrees 20 minutes east"],
            "challenge": [{"type": "wizard"}],
            "coordinates": {
                "latitude": {
                    "degrees": 12,
                    "minutes": 48,
                    "direction": "north"
                },
                "longitude": {
                    "degrees": 20,
                    "minutes": 20,
                    "direction": "east"
                }
            }
        },
        {
            "id": 448,
            "type": "coordinates",
            "tier": "hard",
            "text": ["13 degrees 46 minutes north,21 degrees 01 minutes east"],
            "challenge": [{"type": "wizard"}],
            "coordinates": {
                "latitude": {
                    "degrees": 13,
                    "minutes": 46,
                    "direction": "north"
                },
                "longitude": {
                    "degrees": 21,
                    "minutes": 1,
                    "direction": "east"
                }
            }
        },
        {
            "id": 450,
            "type": "coordinates",
            "tier": "hard",
            "text": ["15 degrees 48 minutes north,13 degrees 52 minutes east"],
            "challenge": [{"type": "wizard"}],
            "coordinates": {
                "latitude": {
                    "degrees": 15,
                    "minutes": 48,
                    "direction": "north"
                },
                "longitude": {
                    "degrees": 13,
                    "minutes": 52,
                    "direction": "east"
                }
            }
        },
        {
            "id": 451,
            "type": "coordinates",
            "tier": "hard",
            "text": ["16 degrees 20 minutes north,12 degrees 45 minutes east"],
            "challenge": [{"type": "wizard"}],
            "coordinates": {
                "latitude": {
                    "degrees": 16,
                    "minutes": 20,
                    "direction": "north"
                },
                "longitude": {
                    "degrees": 12,
                    "minutes": 45,
                    "direction": "east"
                }
            }
        },
        {
            "id": 452,
            "type": "coordinates",
            "tier": "hard",
            "text": ["16 degrees 30 minutes north,16 degrees 28 minutes east"],
            "challenge": [{"type": "wizard"}],
            "coordinates": {
                "latitude": {
                    "degrees": 16,
                    "minutes": 30,
                    "direction": "north"
                },
                "longitude": {
                    "degrees": 16,
                    "minutes": 28,
                    "direction": "east"
                }
            }
        },
        {
            "id": 453,
            "type": "coordinates",
            "tier": "hard",
            "text": ["16 degrees 35 minutes north,27 degrees 01 minutes east"],
            "challenge": [{"type": "wizard"}],
            "coordinates": {
                "latitude": {
                    "degrees": 16,
                    "minutes": 35,
                    "direction": "north"
                },
                "longitude": {
                    "degrees": 27,
                    "minutes": 1,
                    "direction": "east"
                }
            }
        },
        {
            "id": 454,
            "type": "coordinates",
            "tier": "hard",
            "text": ["17 degrees 50 minutes north,08 degrees 30 minutes east"],
            "challenge": [{"type": "wizard"}],
            "coordinates": {
                "latitude": {
                    "degrees": 17,
                    "minutes": 50,
                    "direction": "north"
                },
                "longitude": {
                    "degrees": 8,
                    "minutes": 30,
                    "direction": "east"
                }
            }
        },
        {
            "id": 455,
            "type": "coordinates",
            "tier": "hard",
            "text": ["18 degrees 03 minutes north,25 degrees 16 minutes east"],
            "challenge": [{"type": "wizard"}],
            "coordinates": {
                "latitude": {
                    "degrees": 18,
                    "minutes": 3,
                    "direction": "north"
                },
                "longitude": {
                    "degrees": 25,
                    "minutes": 16,
                    "direction": "east"
                }
            }
        },
        {
            "id": 456,
            "type": "coordinates",
            "tier": "hard",
            "text": ["18 degrees 22 minutes north,16 degrees 33 minutes east"],
            "challenge": [{"type": "wizard"}],
            "coordinates": {
                "latitude": {
                    "degrees": 18,
                    "minutes": 22,
                    "direction": "north"
                },
                "longitude": {
                    "degrees": 16,
                    "minutes": 33,
                    "direction": "east"
                }
            }
        },
        {
            "id": 457,
            "type": "coordinates",
            "tier": "hard",
            "text": ["19 degrees 43 minutes north,25 degrees 07 minutes east"],
            "challenge": [{"type": "wizard"}],
            "coordinates": {
                "latitude": {
                    "degrees": 19,
                    "minutes": 43,
                    "direction": "north"
                },
                "longitude": {
                    "degrees": 25,
                    "minutes": 7,
                    "direction": "east"
                }
            }
        },
        {
            "id": 458,
            "type": "coordinates",
            "tier": "hard",
            "text": ["20 degrees 05 minutes north,21 degrees 52 minutes east"],
            "challenge": [{"type": "wizard"}],
            "coordinates": {
                "latitude": {
                    "degrees": 20,
                    "minutes": 5,
                    "direction": "north"
                },
                "longitude": {
                    "degrees": 21,
                    "minutes": 52,
                    "direction": "east"
                }
            }
        },
        {
            "id": 459,
            "type": "coordinates",
            "tier": "hard",
            "text": ["20 degrees 07 minutes north,18 degrees 33 minutes east"],
            "challenge": [{"type": "wizard"}],
            "coordinates": {
                "latitude": {
                    "degrees": 20,
                    "minutes": 7,
                    "direction": "north"
                },
                "longitude": {
                    "degrees": 18,
                    "minutes": 33,
                    "direction": "east"
                }
            }
        },
        {
            "id": 460,
            "type": "coordinates",
            "tier": "hard",
            "text": ["20 degrees 33 minutes north,15 degrees 48 minutes east"],
            "challenge": [{"type": "wizard"}],
            "coordinates": {
                "latitude": {
                    "degrees": 20,
                    "minutes": 33,
                    "direction": "north"
                },
                "longitude": {
                    "degrees": 15,
                    "minutes": 48,
                    "direction": "east"
                }
            }
        },
        {
            "id": 461,
            "type": "coordinates",
            "tier": "hard",
            "text": ["21 degrees 24 minutes north,17 degrees 54 minutes east"],
            "challenge": [{"type": "wizard"}],
            "coordinates": {
                "latitude": {
                    "degrees": 21,
                    "minutes": 24,
                    "direction": "north"
                },
                "longitude": {
                    "degrees": 17,
                    "minutes": 54,
                    "direction": "east"
                }
            }
        },
        {
            "id": 463,
            "type": "coordinates",
            "tier": "hard",
            "text": ["22 degrees 35 minutes north,19 degrees 18 minutes east"],
            "challenge": [{"type": "wizard"}],
            "coordinates": {
                "latitude": {
                    "degrees": 22,
                    "minutes": 35,
                    "direction": "north"
                },
                "longitude": {
                    "degrees": 19,
                    "minutes": 18,
                    "direction": "east"
                }
            }
        },
        {
            "id": 464,
            "type": "coordinates",
            "tier": "hard",
            "text": ["22 degrees 45 minutes north,26 degrees 33 minutes east"],
            "challenge": [{"type": "wizard"}],
            "coordinates": {
                "latitude": {
                    "degrees": 22,
                    "minutes": 45,
                    "direction": "north"
                },
                "longitude": {
                    "degrees": 26,
                    "minutes": 33,
                    "direction": "east"
                }
            }
        },
        {
            "id": 465,
            "type": "coordinates",
            "tier": "hard",
            "text": ["24 degrees 26 minutes north,26 degrees 24 minutes east"],
            "challenge": [{"type": "wizard"}],
            "coordinates": {
                "latitude": {
                    "degrees": 24,
                    "minutes": 26,
                    "direction": "north"
                },
                "longitude": {
                    "degrees": 26,
                    "minutes": 24,
                    "direction": "east"
                }
            }
        },
        {
            "id": 466,
            "type": "coordinates",
            "tier": "hard",
            "text": ["24 degrees 56 minutes north,22 degrees 28 minutes east"],
            "challenge": [{"type": "wizard"}],
            "coordinates": {
                "latitude": {
                    "degrees": 24,
                    "minutes": 56,
                    "direction": "north"
                },
                "longitude": {
                    "degrees": 22,
                    "minutes": 28,
                    "direction": "east"
                }
            }
        },
        {
            "id": 467,
            "type": "coordinates",
            "tier": "hard",
            "text": ["24 degrees 58 minutes north,18 degrees 43 minutes east"],
            "challenge": [{"type": "wizard"}],
            "coordinates": {
                "latitude": {
                    "degrees": 24,
                    "minutes": 58,
                    "direction": "north"
                },
                "longitude": {
                    "degrees": 18,
                    "minutes": 43,
                    "direction": "east"
                }
            }
        },
        {
            "id": 468,
            "type": "coordinates",
            "tier": "hard",
            "text": ["25 degrees 03 minutes north,17 degrees 05 minutes east"],
            "challenge": [{"type": "wizard"}],
            "coordinates": {
                "latitude": {
                    "degrees": 25,
                    "minutes": 3,
                    "direction": "north"
                },
                "longitude": {
                    "degrees": 17,
                    "minutes": 5,
                    "direction": "east"
                }
            }
        },
        {
            "id": 469,
            "type": "coordinates",
            "tier": "hard",
            "text": ["25 degrees 03 minutes north,23 degrees 24 minutes east"],
            "challenge": [{"type": "wizard"}],
            "coordinates": {
                "latitude": {
                    "degrees": 25,
                    "minutes": 3,
                    "direction": "north"
                },
                "longitude": {
                    "degrees": 23,
                    "minutes": 24,
                    "direction": "east"
                }
            }
        }
    ]
    export const cryptic: Clues.Cryptic[] = [
        {
            "id": 179,
            "type": "cryptic",
            "tier": "easy",
            "text": [
                "A crate found in the tower of a church is your next location.",
                "A crate in the tower of a church is your next location."   // This wording possibly doesn't exist anymore
            ],
            "solution": {
                "type": "search",
                "entity": "Crate",
                "spot": {"x": 2612, "y": 3306, "level": 1},
            }
        },
        {
            "id": 180,
            "type": "cryptic",
            "tier": "easy",
            "text": ["One of the sailors in Port Sarim is your next destination."],
            "solution": {
                "type": "talkto",
                "npc": "Captain Tobias.",
                "spots": [{"range": {"topleft": {"x": 3025, "y": 3221}, "botright": {"x": 3028, "y": 3215}, "level": 0}}]
            }
        },
        {
            "id": 182,
            "type": "cryptic",
            "tier": "easy",
            "text": ["Someone watching Het's Oasis is your next destination."],
            "solution": {
                "type": "talkto",
                "spots": [{"range": {"topleft": {"x": 3371, "y": 3278}, "botright": {"x": 3378, "y": 3271}, "level": 0}}],
                "npc": "Jeed"
            }
        },
        {
            "id": 29,
            "type": "cryptic",
            "tier": "medium",
            "text": ["Find a bar with a centre fountain in its city. Go upstairs and get changed."],
            "solution": {
                "type": "simple",
                "spot": {"x": 3227, "y": 3395, "level": 0},
                "answer": "You have to kill a guard dog to find the key, Guard dogs in Ardougne will do. After that you can search the locked drawers upstairs in the bar marked on the map."
            }
        },
        {
            "id": 181,
            "type": "cryptic",
            "tier": "medium",
            "text": ["You'll need to look for a city with a central fountain. Look for a locked chest in the city's chapel."],
            "solution": {
                "type": "simple",
                "spot": {"x": 3257, "y": 3487, "level": 0},
                "answer": "Kill a monk in the monastery south of ardougne for a key, then search the chests."
            }
        },
        {
            "id": 183,
            "type": "cryptic",
            "tier": "medium",
            "text": ["The socks in these drawers are holier than thine, according to the tonsured owners."],
            "solution": {
                "type": "simple",
                "spot": {"x": 3057, "y": 3498, "level": 0},
                "answer": "Kill a Monk of Zamorak in the Chaos Temple near the Goblin Village to get a key, then search the drawers."
            }
        },
        {
            "id": 184,
            "type": "cryptic",
            "tier": "medium",
            "text": ["Probably filled with wizards' socks."],
            "solution": {
                "type": "simple",
                "spot": {"x": 3113, "y": 3152, "level": 0},
                "answer": "Kill a Spellwisp north west of the tower to get a key, then search the cupboard on the second floor."
            }
        },
        {
            "id": 185,
            "type": "cryptic",
            "tier": "medium",
            "text": ["In a village made of bamboo, look for some crates under one of the houses."],
            "solution": {
                "type": "search",
                "entity": "Crate",
                "spot": {"x": 2800, "y": 3074, "level": 0},
            }
        },
        {
            "id": 186,
            "type": "cryptic",
            "tier": "medium",
            "text": ["The owner of this crate has a hunch that he put more than fish inside."],
            "solution": {
                "type": "search",
                "entity": "Crate",
                "spot": {"x": 2770, "y": 3172, "level": 0},
            }
        },
        {
            "id": 187,
            "type": "cryptic",
            "tier": "medium",
            "text": ["In a town where the guards are armed with maces, search the upstairs rooms of the public house."],
            "solution": {
                "type": "simple",
                "spot": {"x": 2574, "y": 3322, "level": 0},
                "answer": "Kill a guard dog get obtain a key, then search the drawers upstairs."
            }
        },
        {
            "id": 188,
            "type": "cryptic",
            "tier": "medium",
            "text": ["Try not to step on any aquatic nasties while searching this crate."],
            "solution": {
                "type": "search",
                "spot": {"x": 2764, "y": 3273, "level": 0},
            }
        },
        {
            "id": 189,
            "type": "cryptic",
            "tier": "medium",
            "text": ["After a hard day of spraying back the vegetation, you mite want to pop to the nearby forge and search the crates."],
            "solution": {
                "type": "search",
                "spot": {"x": 2399, "y": 4471, "level": 0},
            }
        },
        {
            "id": 190,
            "type": "cryptic",
            "tier": "medium",
            "text": ["For any aspiring mage, I'm sure searching this bookcase will be a rewarding experience."],
            "solution": {
                "type": "search",
                "spot": {"x": 3366, "y": 3319, "level": 1},
            }
        },
        {
            "id": 191,
            "type": "cryptic",
            "tier": "medium",
            "text": ["A town with a different sort of night-life is your destination. Search for some crates in one of the houses."],
            "solution": {
                "type": "search",
                "spot": {"x": 3498, "y": 3507, "level": 0},
            }
        },
        {
            "id": 192,
            "type": "cryptic",
            "tier": "medium",
            "text": ["Hay! Stop for a bit and admire the scenery, just like the tourism promoter says."],
            "solution": {
                "type": "search",
                "spot": {"x": 2524, "y": 3438, "level": 0},
            }
        },
        {
            "id": 193,
            "type": "cryptic",
            "tier": "medium",
            "text": ["North of the best monkey restaurant on Karamja, look for the centre of the triangle of boats and search there."],
            "solution": {
                "type": "search",
                "spot": {"x": 2905, "y": 3189, "level": 0},
            }
        },
        {
            "id": 194,
            "type": "cryptic",
            "tier": "medium",
            "text": ["Go to the village being attacked by trolls and search the drawers in one of the houses."],
            "solution": {
                "type": "simple",
                "spot": {"x": 2930, "y": 3550, "level": 0},
                "answer": "Pickpocket Penda (in the south-western most house) to get a key, then search the marked drawers."
            }
        },
        {
            "id": 195,
            "type": "cryptic",
            "tier": "medium",
            "text": ["In a town where everyone has perfect vision, seek some locked drawers in a house that sits opposite a workshop."],
            "solution": {
                "type": "simple",
                "spot": {"x": 2710, "y": 3479, "level": 0},
                "answer": "Kill a chicken to get the key, then search the drawers."
            }
        },
        {
            "id": 196,
            "type": "cryptic",
            "tier": "medium",
            "text": ["Being this far north has meant that these crates have escaped being battled over."],
            "solution": {
                "type": "search",
                "spot": {"x": 2519, "y": 3259, "level": 0},
                "entitiy": "Crates"
            }
        },
        {
            "id": 197,
            "type": "cryptic",
            "tier": "medium",
            "text": ["After trawling for bars, go to the nearest place to smith them and dig by the door."],
            "solution": {
                "type": "dig",
                "spot": {"x": 2656, "y": 3160, "level": 0},
            }
        },
        {
            "id": 198,
            "type": "cryptic",
            "tier": "medium",
            "text": ["Sophind yourself some treasure by searching these boxes."],
            "solution": {
                "type": "search",
                "spot": {"x": 3280, "y": 2787, "level": 0},
                "entity": "Crate"
            }
        },
        {
            "id": 199,
            "type": "cryptic",
            "tier": "medium",
            "text": ["Dig here if you are not feeling too well after travelling through the desert. Ali heartily recommends it."],
            "solution": {
                "type": "dig",
                "spot": {"x": 3358, "y": 2971, "level": 0},
            }
        },
        {
            "id": 200,
            "type": "cryptic",
            "tier": "medium",
            "text": ["You'll need to have Doug Deep into the distant past to get to these sacks"],
            "solution": {
                "type": "search",
                "spot": {"x": 3155, "y": 5727, "level": 0},
                "entity": "Sacks"
            }
        },
        {
            "id": 201,
            "type": "cryptic",
            "tier": "medium",
            "text": ["This crate holds a better reward than a broken arrow."],
            "solution": {
                "type": "search",
                "spot": {"x": 2671, "y": 3437, "level": 0},
                "entity": "Crate"
            }
        },
        {
            "id": 202,
            "type": "cryptic",
            "tier": "medium",
            "text": ["The rock cakes to the south are definitely more edible than the two rocks I buried the treasure between."],
            "solution": {
                "type": "dig",
                "spot": {"x": 2513, "y": 3041, "level": 0},
            }
        },
        {
            "id": 203,
            "type": "cryptic",
            "tier": "medium",
            "text": ["Search the upstairs drawers of a house in a village where pirates are known to have a good time."],
            "solution": {
                "type": "search",
                "spot": {"x": 2809, "y": 3165, "level": 1},
                "entity": "Drawers",
                "key": {
                    "instructions": "Shiver me timbers!",
                    "answer": "Kill a pirate in Brimhaven",
                    "area": {"topleft": {"x": 2766, "y": 3201}, "botright": {"x": 2810, "y": 3167}, "level": 0}
                },
            }
        },
        {
            "id": 204,
            "type": "cryptic",
            "tier": "medium",
            "text": ["Don't skip here, it's too muddy. You'll feel like a star if you dig here, though."],
            "solution": {
                "type": "dig",
                "spot": {"x": 3000, "y": 3110, "level": 0},
            }
        },
        {
            "id": 205,
            "type": "cryptic",
            "tier": "medium",
            "text": ["This crate is mine, all mine, even if it is in the middle of the desert."],
            "solution": {
                "type": "search",
                "entity": "Crate",
                "spot": {"x": 3289, "y": 3022, "level": 0},
            }
        },
        {
            "id": 206,
            "type": "cryptic",
            "tier": "medium",
            "text": ["The treasure is buried in a small building full of bones. Here's a Hint: It's not near a graveyard."],
            "solution": {
                "type": "dig",
                "spot": {"x": 3356, "y": 3507, "level": 0},
            }
        },
        {
            "id": 207,
            "type": "cryptic",
            "tier": "medium",
            "text": ["By the town of the dead, walk south down a rickety bridge, then dig near the spotted fungus."],
            "solution": {
                "type": "dig",
                "spot": {"x": 3644, "y": 3494, "level": 0},
            }
        },
        {
            "id": 208,
            "type": "cryptic",
            "tier": "medium",
            "text": ["This cupboard has treasure, pirate pots and corsair cutlery!"],
            "solution": {
                "type": "search",
                "entity": "Cupboard",
                "spot": {"x": 2811, "y": 3160, "level": 0},
            }
        },
        {
            "id": 209,
            "type": "cryptic",
            "tier": "medium",
            "text": ["The dead, red dragon watches over this chest. He must really dig the view."],
            "solution": {
                "type": "search",
                "spot": {"x": 3354, "y": 3349, "level": 0},
                "entity": "Closed chest",
                "key": {
                    "instructions": "The chest is locked!  Crude graffiti on the chest reads: 'Barbarians rule, okay!'",
                    "answer": "Kill a Barbarian in Barbarian Village.",
                    "area": {"topleft": {"x": 3073, "y": 3434}, "botright": {"x": 3094, "y": 3412}, "level": 0}
                }
            }
        },
        {
            "id": 210,
            "type": "cryptic",
            "tier": "medium",
            "text": ["This crate clearly marks the end of the line for coal."],
            "solution": {
                "type": "search",
                "spot": {"x": 2691, "y": 3508, "level": 0},
                "entity": "Crate"
            }
        },
        {
            "id": 211,
            "type": "cryptic",
            "tier": "medium",
            "text": ["Go to this building to be illuminated, and check the drawers while you are there."],
            "solution": {
                "type": "simple",
                "spot": {"x": 2509, "y": 3642, "level": 0},
                "answer": "Kill a Fremennik market guard to get the key, then search the drawers on the first floor of the Lighthouse."
            }
        },
        {
            "id": 212,
            "type": "cryptic",
            "tier": "medium",
            "text": ["Find a crate close to the monks that like to paaarty!"],
            "solution": {
                "type": "search",
                "spot": {"x": 2614, "y": 3204, "level": 0},
                "entity": "Crate"
            }
        },
        {
            "id": 213,
            "type": "cryptic",
            "tier": "medium",
            "text": ["In a town where wizards are known to gather, search upstairs in a large house to the north."],
            "solution": {
                "type": "simple",
                "spot": {"x": 2594, "y": 3104, "level": 0},
                "answer": "Kill the man downstairs to get a key, then search the chest upstairs."
            }
        },
        {
            "id": 214,
            "type": "cryptic",
            "tier": "medium",
            "text": ["This temple is rather sluggish. The chest just inside the entrance, however, is filled with goodies."],
            "solution": {
                "type": "search",
                "spot": {"x": 2698, "y": 9684, "level": 0},
                "entity": "Chest"
            }
        },
        {
            "id": 215,
            "type": "cryptic",
            "tier": "medium",
            "text": ["The gnomes' nearby cart must have collapsed under the weight of all the treasure in these boxes!"],
            "solution": {
                "type": "search",
                "spot": {"x": 2397, "y": 3355, "level": 0},
                "entity": "Gnome crates"
            }
        },
        {
            "id": 217,
            "type": "cryptic",
            "tier": "medium",
            "text": ["Brush off the sand and dig in the quarry. There is a wheely handy barrow to the east. Don't worry, it's coal to dig there - in fact, it's all oclay."],
            "solution": {
                "type": "dig",
                "spot": {"x": 3176, "y": 2916, "level": 0},
            }
        },
        {
            "id": 218,
            "type": "cryptic",
            "tier": "medium",
            "text": ["Observe: In the crate just North of the stairs leading down, you will find the answer."],
            "solution": {
                "type": "search",
                "spot": {"x": 2438, "y": 3165, "level": 0},
                "entity": "Crate"
            }
        },
        {
            "id": 220,
            "type": "cryptic",
            "tier": "medium",
            "text": ["In a town where thieves steal from stalls, search for some drawers in the upstairs of a house near the bank."],
            "solution": {
                "type": "search",
                "spot": {"x": 2610, "y": 3324, "level": 1},
                "entity": "Drawers",
                "key": {"instructions": "It's a guard's life", "answer": "Kill an ardougne guard."}
            }
        },
        {
            "id": 222,
            "type": "cryptic",
            "tier": "medium",
            "text": ["While a sea view is nice, it seems this church has not seen visitors in a while. Dig outside the rim of the round window for a reward."],
            "solution": {
                "type": "dig",
                "spot": {"x": 2992, "y": 3178, "level": 0},
            }
        },
        {
            "id": 28,
            "type": "cryptic",
            "tier": "hard",
            "text": ["Covered in shadows, the centre of the circle is where you will find the answer."],
            "solution": {
                "type": "dig",
                "spot": {"x": 3489, "y": 3288, "level": 0}
            }
        },
        {
            "id": 30,
            "type": "cryptic",
            "tier": "hard",
            "text": ["Generally speaking, his nose was very bent"],
            "solution": {
                "type": "talkto",
                "npc": "General Bentnoze",
                "spots": [{
                    "range": {
                        "level": 0,
                        "topleft": {
                            "x": 2954, "y": 3515
                        },
                        "botright": {
                            "x": 2960, "y": 3512
                        }
                    }
                }]
            },
            "challenge": [{"type": "slider"}]
        },
        {
            "id": 32,
            "type": "cryptic",
            "tier": "hard",
            "text": ["If you look closely enough, it seems that the archers have lost more than their needles."],
            "solution": {
                "type": "search",
                "entity": "Haystack",
                "spot": {"x": 2671, "y": 3416, "level": 0}
            }
        },
        {
            "id": 39,
            "type": "cryptic",
            "tier": "hard",
            "text": ["There is no 'worthier' lord."],
            "challenge": [{"type": "slider"}],
            "solution": {
                "type": "talkto",
                "spots": [
                    {"range": {"topleft": {"x": 2185, "y": 3285}, "botright": {"x": 2187, "y": 3283}, "level": 1}, "note": "After 'Plague's End'"},
                    {"range": {"topleft": {"x": 2198, "y": 3258}, "botright": {"x": 2209, "y": 3247}, "level": 0}, "note": "Before 'Plague's End'"}
                ],
                "npc": "Lord Iorwerth"
            }
        },
        {
            "id": 139,
            "type": "cryptic",
            "tier": "hard",
            "text": [
                "I am head of the abbey with a cold breeze from the west.",
                "'A bag belt only?' he asked his balding brothers" // Not sure if this is a
            ],
            "solution": {
                "type": "talkto",
                "spots": [{"range": {"topleft": {"x": 3055, "y": 3487}, "botright": {"x": 3059, "y": 3482}, "level": 0}}],
                "npc": "Abbot Langley"
            }
        },
        {
            "id": 140,
            "type": "cryptic",
            "tier": "hard",
            "text": [
                "My name's a tirade, fishing is my trade, by the docks is where my fortune is made.",
                "If a man carried my burden, he would break his back. I am not rich, but leave silver in my track. Speak to the keeper of my trail."
            ],
            "solution": {
                "type": "talkto",
                "spots": [{"range": {"topleft": {"x": 3011, "y": 3229}, "botright": {"x": 3017, "y": 3223}, "level": 0}}],
                "npc": "Gerrant"
            }
        },
        {
            "id": 141,
            "type": "cryptic",
            "tier": "hard",
            "text": ["Often sought out by scholars of histories past, find me where words of wisdom speak volumes."],
            "challenge": [{"type": "slider"}],
            "solution": {
                "type": "talkto",
                "npc": "Examiner",
                "spots": [{"range": {"topleft": {"x": 3351, "y": 3349}, "botright": {"x": 3359, "y": 3342}, "level": 0}}],
            }
        },
        {
            "id": 142,
            "type": "cryptic",
            "tier": "hard",
            "text": ["A great view: watch the rapidly drying hides get splashed. Check the box you are sitting on."],
            "solution": {
                "type": "search",
                "spot": {"x": 2523, "y": 3493, "level": 1},
                "entity": "Boxes"
            }
        },
        {
            "id": 143,
            "type": "cryptic",
            "tier": "hard",
            "text": ["You will need to wash the old ash off of your spade when you dig here, but the only water nearby is stagnant."],
            "solution": {
                "type": "dig",
                "spot": {"x": 2134, "y": 5162, "level": 0},
            }
        },
        {
            "id": 144,
            "type": "cryptic",
            "tier": "hard",
            "text": ["Identify the back of this over-acting brother. (He's a long way from home.)"],
            "challenge": [{"type": "slider"}],
            "solution": {
                "type": "talkto",
                "spots": [{"range": {"topleft": {"x": 3131, "y": 2804}, "botright": {"x": 3135, "y": 2800}, "level": 0}}],
                "npc": "Hamid"
            }
        },
        {
            "id": 145,
            "type": "cryptic",
            "tier": "hard",
            "text": ["As you desert this town, keep an eye out for a set of spines that could ruin nearby rugs: dig carefully around the greenery."],
            "solution": {
                "type": "dig",
                "spot": {"x": 3396, "y": 2918, "level": 0},
            }
        },
        {
            "id": 146,
            "type": "cryptic",
            "tier": "hard",
            "text": ["'Small Shoe.' Often found with rod on mushroom."],
            "challenge": [{"type": "slider"}],
            "solution": {
                "type": "talkto",
                "spots": [{"range": {"topleft": {"x": 2467, "y": 3440}, "botright": {"x": 2477, "y": 3426}, "level": 0}}],
                "npc": "Gnome trainer"
            }
        },
        {
            "id": 147,
            "type": "cryptic",
            "tier": "hard",
            "text": ["It seems to have reached the end of the line, and it's still empty."],
            "solution": {
                "type": "search",
                "spot": {"x": 3041, "y": 9820, "level": 0},
                "entity": "Mine Cart"
            }
        },
        {
            "id": 148,
            "type": "cryptic",
            "tier": "hard",
            "text": ["Read 'How to Breed Scorpions' By O.W. Thathurt."],
            "solution": {
                "type": "search",
                "spot": {"x": 2702, "y": 3409, "level": 1},
                "entity": "Bookcase"
            }
        },
        {
            "id": 149,
            "type": "cryptic",
            "tier": "hard",
            "text": ["Probably filled with books on magic."],
            "solution": {
                "type": "search",
                "spot": {"x": 3094, "y": 3153, "level": 0},
                "entity": "Bookcase"
            }
        },
        {
            "id": 150,
            "type": "cryptic",
            "tier": "hard",
            "text": ["Citric cellar."],
            "challenge": [{"type": "slider"}],
            "solution": {
                "type": "talkto",
                "spots": [{"range": {"topleft": {"x": 2487, "y": 3489}, "botright": {"x": 2493, "y": 3487}, "level": 1}}],
                "noc": "Heckel Funch"
            }
        },
        {
            "id": 151,
            "type": "cryptic",
            "tier": "hard",
            "text": ["I'm sure they will let ya buy some things here, as long as you are in good 'ealth."],
            "solution": {
                "type": "search",
                "spot": {"x": 2340, "y": 3187, "level": 0},
                "entity": "Crate"
            }
        },
        {
            "id": 152,
            "type": "cryptic",
            "tier": "hard",
            "text": ["Mine was the strangest birth under the sun. I left the crimson sack. Yet life had not begun. Entered the world and yet was seen by none."],
            "solution": {
                "type": "dig",
                "spot": {"x": 2832, "y": 9586, "level": 0},
            }
        },
        {
            "id": 153,
            "type": "cryptic",
            "tier": "hard",
            "text": ["His head might be hollow, but the crates nearby are filled with surprises."],
            "solution": {
                "type": "search",
                "spot": {"x": 3478, "y": 3091, "level": 0},
                "entity": "Crate"
            }
        },
        {
            "id": 154,
            "type": "cryptic",
            "tier": "hard",
            "text": ["My giant guardians below the market streets would be fans of rock and roll, if only they could grab hold of it. Dig near my purple smoke!"],
            "solution": {
                "type": "dig",
                "spot": {"x": 3161, "y": 9905, "level": 0},
            }
        },
        {
            "id": 155,
            "type": "cryptic",
            "tier": "hard",
            "text": ["You can cook food on me, but don't cook any foodles - That would just be wrong."],
            "solution": {
                "type": "dig",
                "spot": {"x": 2969, "y": 2975, "level": 0},
            }
        },
        {
            "id": 156,
            "type": "cryptic",
            "tier": "hard",
            "text": ["The beasts to my east snap claws and tails. The rest to my west can slide and eat fish. The force to my north will jump and they'll wail, Come dig by my fire and make a wish."],
            "solution": {
                "type": "dig",
                "spot": {"x": 2598, "y": 3266, "level": 0},
            }
        },
        {
            "id": 157,
            "type": "cryptic",
            "tier": "hard",
            "text": ["You don't need to go hopping mad - or take steps - to get to this treasure: just be totally shellfish."],
            "solution": {
                "type": "dig",
                "spot": {"x": 2519, "y": 3594, "level": 0},
            }
        },
        {
            "id": 158,
            "type": "cryptic",
            "tier": "hard",
            "text": ["When you get tired of fighting, go deep, deep down until you need an antidote."],
            "solution": {
                "type": "search",
                "spot": {"x": 2576, "y": 9583, "level": 0},
                "entity": "Crate"
            }
        },
        {
            "id": 159,
            "type": "cryptic",
            "tier": "hard",
            "text": ["'Throat mage seeks companionship. Seek answers inside my furniture if interested.'"],
            "solution": {
                "type": "search",
                "spot": {"x": 2666, "y": 3238, "level": 1},
            }
        },
        {
            "id": 160,
            "type": "cryptic",
            "tier": "hard",
            "text": ["Must be full of railings"],
            "solution": {
                "type": "search",
                "spot": {"x": 2576, "y": 3464, "level": 0},
            }
        },
        {
            "id": 161,
            "type": "cryptic",
            "tier": "hard",
            "text": ["You will need to under-cook to solve this one."],
            "solution": {
                "type": "search",
                "spot": {"x": 3219, "y": 9617, "level": 0},
            }
        },
        {
            "id": 162,
            "type": "cryptic",
            "tier": "hard",
            "text": ["The cheapest water for miles around, but they react badly to religious icons."],
            "solution": {
                "type": "search",
                "spot": {"x": 3178, "y": 2987, "level": 0},
            }
        },
        {
            "id": 163,
            "type": "cryptic",
            "tier": "hard",
            "text": ["You have all of the elements available to solve this clue. Fortunately you do not have to go as far as to stand in a draft."],
            "solution": {
                "type": "simple",
                "spot": {"x": 2710, "y": 3498, "level": 0},
                "answer": "Search the crates on the first level of the elemental workshop, east of the hatch."
            }
        },
        {
            "id": 164,
            "type": "cryptic",
            "tier": "hard",
            "text": ["Try not to let yourself be dazzled when you search these drawers."],
            "solution": {
                "type": "search",
                "spot": {"x": 2561, "y": 3323, "level": 0},
            }
        },
        {
            "id": 165,
            "type": "cryptic",
            "tier": "hard",
            "text": ["Aggie I see, Lonely and southern I feel, I am neither inside nor outside the house, yet no house would be complete without me. The treasure lies beneath me!"],
            "solution": {
                "type": "dig",
                "spot": {"x": 3084, "y": 3257, "level": 0},
            }
        },
        {
            "id": 166,
            "type": "cryptic",
            "tier": "hard",
            "text": ["I am a token of the greatest love. I have no beginning or end. My eye is red, I can fit like a glove. Go to the place where it's money they lend, And dig by the gate to be my friend."],
            "solution": {
                "type": "simple",
                "spot": {"x": 3189, "y": 3433, "level": 0},
                "answer": "Dig by the gates in the cellar."
            }
        },
        {
            "id": 167,
            "type": "cryptic",
            "tier": "hard",
            "text": ["Navigating to this crate will be a trial."],
            "solution": {
                "type": "search",
                "spot": {"x": 2648, "y": 3662, "level": 0},
            }
        },
        {
            "id": 168,
            "type": "cryptic",
            "tier": "hard",
            "text": ["This aviator is at the peak of his profession."],
            "challenge": [{"type": "slider"}],
            "solution": {
                "type": "talkto",
                "spots": [{"range": {"topleft": {"x": 2849, "y": 3494}, "botright": {"x": 2851, "y": 3492}, "level": 1}}],
                "npc": "Captain Bleemadge"
            }
        },
        {
            "id": 169,
            "type": "cryptic",
            "tier": "hard",
            "text": ["Snah? I feel all confused, like one of those cakes."],
            "solution": {
                "type": "talkto",
                "spots": [{"range": {"topleft": {"x": 3202, "y": 3232}, "botright": {"x": 3221, "y": 3205}, "level": 0}}],
                "npc": "Hans"
            }
        },
        {
            "id": 170,
            "type": "cryptic",
            "tier": "hard",
            "text": ["My home is grey, and made of stone, A castle with a search for a meal. Hidden in some drawers I am, across from a wooden wheel."],
            "solution": {
                "type": "search",
                "entity": "Drawers",
                "spot": {"x": 3213, "y": 3216, "level": 1},
            }
        },
        {
            "id": 171,
            "type": "cryptic",
            "tier": "hard",
            "text": [
                "Surprising? I bet he is...",
                "I bet he is..."
            ],
            "solution": {
                "type": "talkto",
                "spots": [{"range": {"topleft": {"x": 3202, "y": 3474}, "botright": {"x": 3206, "y": 3470}, "level": 0}}],
                "npc": "Sir Prysin"
            }
        },
        {
            "id": 173,
            "type": "cryptic",
            "tier": "hard",
            "text": ["Four blades I have, yet draw no blood, Still I turn my prey to powder. If you are brave, come search my roof, It is there my blades are louder."],
            "solution": {
                "type": "search",
                "entity": "Crate",
                "spot": {"x": 3166, "y": 3309, "level": 2},
            }
        },
        {
            "id": 174,
            "type": "cryptic",
            "tier": "hard",
            "text": ["My name is like a tree, yet it is spelt with a 'g'. Come see the fur which is right near me."],
            "challenge": [{"type": "slider"}],
            "solution": {
                "type": "talkto",
                "spots": [{"range": {"topleft": {"x": 3219, "y": 3438}, "botright": {"x": 3223, "y": 3434}, "level": 0}}],
                "npc": "Wilough"
            }
        },
        {
            "id": 175,
            "type": "cryptic",
            "tier": "hard",
            "text": ["A strange little man who sells armour only to those who've proven themselves to be unafraid of dragons."],
            "challenge": [{"type": "slider"}],
            "solution": {
                "type": "talkto",
                "spots": [{"range": {"topleft": {"x": 3066, "y": 3518}, "botright": {"x": 3070, "y": 3514}, "level": 0}}],
                "npc": "Oziach."
            }
        },
        {
            "id": 176,
            "type": "cryptic",
            "tier": "hard",
            "text": [
                "Come to the evil ledge, Yew know yew want to. Try not to get stung.",
                "Come to the Try not to get stung."
            ],
            "solution": {
                "type": "dig",
                "spot": {"x": 3088, "y": 3469, "level": 0},
            }
        },
        {
            "id": 178,
            "type": "cryptic",
            "tier": "hard",
            "text": ["When no weapons are at hand, then is the time to reflect. In Saradomin's name, redemption draws closer."],
            "solution": {
                "type": "search",
                "entity": "Drawers",
                "spot": {"x": 2818, "y": 3351, "level": 0},
            }
        },
        {
            "id": 216,
            "type": "cryptic",
            "tier": "hard",
            "text": ["46 is my number. My body is the colour of burnt orange and crawls among those with eight. Three mouths I have, yet I cannot eat. My blinking blue eye hides my grave."],
            "solution": {
                "type": "dig",
                "spot": {"x": 3169, "y": 3887, "level": 0},
            }
        },
        {
            "id": 219,
            "type": "cryptic",
            "tier": "hard",
            "text": ["If you didn't want to be here and in danger, you should lever things well enough alone."],
            "solution": {
                "type": "dig",
                "spot": {"x": 3154, "y": 3923, "level": 0},
            }
        },
        {
            "id": 221,
            "type": "cryptic",
            "tier": "hard",
            "text": ["I lie lonely and forgotten in mid wilderness, Where the dead rise from their beds. Feel free to quarrel and wind me up, and dig while you shoot their heads."],
            "solution": {
                "type": "dig",
                "spot": {"x": 3235, "y": 3673, "level": 0},
            }
        },
        {
            "id": 223,
            "type": "cryptic",
            "tier": "hard",
            "text": ["And so on, and so on, and so on. Walking from the land of many unimportant things leads to a choice of paths."],
            "solution": {
                "type": "dig",
                "spot": {"x": 2591, "y": 3879, "level": 0},
            }
        },
        {
            "id": 224,
            "type": "cryptic",
            "tier": "hard",
            "text": ["This village has a problem with cartloads of the undead. Try checking the bookcase to find the answer."],
            "solution": {
                "type": "search",
                "entity": "Bookcase",
                "spot": {"x": 2833, "y": 2992, "level": 0},
            }
        }
    ]
    export const emote: Clues.Emote[] = [
        {
            "id": 8,
            "type": "emote",
            "tier": "easy",
            "text": ["Dance in the shack in Lumbridge Swamp. Equip a bronze dagger, iron full helm and a gold ring."],
            "area": {"topleft": {"x": 3202, "y": 3170}, "botright": {"x": 3205, "y": 3167}, "level": 0},
            "items": ["Bronze Dagger", "Iron full helm", "Gold ring"],
            "emotes": ["Dance"],
            "double_agent": false,
            "hidey_hole": {"name": "Barrel (hidey-hole)", "location": {"x": 3204, "y": 3169, "level": 0}}
        },
        {
            "id": 259,
            "type": "emote",
            "tier": "easy",
            "text": ["Think in the middle of the wheat field by the Lumbridge mill. Equip a sapphire necklace, polar camo legs and an oak shortbow."],
            "area": {"topleft": {"x": 3155, "y": 3303}, "botright": {"x": 3159, "y": 3295}, "level": 0},
            "items": ["Sapphire necklace", "Polar camo legs", "Oak shortbow"],
            "emotes": ["Think"],
            "double_agent": false,
            "hidey_hole": {"name": "Sack of items (hidey-hole)", "location": {"x": 3165, "y": 3302, "level": 0}}
        },
        {
            "id": 260,
            "type": "emote",
            "tier": "easy",
            "text": ["Laugh at the crossroads south of Sinclair Mansion. Equip a leather cowl, amulet of strength and iron scimitar."],
            "area": {"topleft": {"x": 2737, "y": 3541}, "botright": {"x": 2744, "y": 3534}, "level": 0},
            "items": ["Leather cowl", "Amulet of strength", "Iron scimitar"],
            "emotes": ["Laugh"],
            "double_agent": false,
            "hidey_hole": {"name": "Rock (hidey-hole)", "location": {"x": 2734, "y": 3535, "level": 0}}
        },
        {
            "id": 261,
            "type": "emote",
            "tier": "easy",
            "text": ["Panic in the limestone mine. Equip bronze platelegs, a steel pickaxe and a steel helmet."],
            "area": {"topleft": {"x": 3365, "y": 3504}, "botright": {"x": 3376, "y": 3496}, "level": 0},
            "items": ["Bronze platelegs", "Steel pickaxe", "Steel helm"],
            "emotes": ["Panic"],
            "double_agent": false,
            "hidey_hole": {"name": "Crate (hidey-hole)", "location": {"x": 3376, "y": 3500, "level": 0}}
        },
        {
            "id": 262,
            "type": "emote",
            "tier": "easy",
            "text": ["Panic on the pier where you catch the Fishing Trawler. Have nothing equipped at all when you do."],
            "area": {"topleft": {"x": 2676, "y": 3174}, "botright": {"x": 2676, "y": 3163}, "level": 0},
            "items": ["Nothing"],
            "emotes": ["Panic"],
            "double_agent": false,
            "hidey_hole": null
        },
        {
            "id": 263,
            "type": "emote",
            "tier": "easy",
            "text": ["Blow a raspberry at the monkey cage in Ardougne Zoo. Equip a studded leather body, bronze platelegs and a mud pie."],
            "area": {"topleft": {"x": 2596, "y": 3284}, "botright": {"x": 2608, "y": 3272}, "level": 0},
            "items": ["Studded leather body", "Bronze platelegs", "Mud pie"],
            "emotes": ["Raspberry"],
            "double_agent": false,
            "hidey_hole": {"name": "Rock (hidey-hole)", "location": {"x": 2599, "y": 3280, "level": 0}}

        },
        {
            "id": 264,
            "type": "emote",
            "tier": "easy",
            "text": ["Clap on the causeway to the Wizards' Tower. Equip an iron helmet, emerald ring and leather gloves."],
            "area": {"topleft": {"x": 3101, "y": 3209}, "botright": {"x": 3104, "y": 3187}, "level": 0},
            "items": ["Iron helmet", "Emerald ring", "Leather gloves"],
            "emotes": ["Clap"],
            "double_agent": false,
            "hidey_hole": {"name": "Rock (hidey-hole)", "location": {"x": 3099, "y": 3188, "level": 0}}

        },
        {
            "id": 265,
            "type": "emote",
            "tier": "easy",
            "text": ["Twirl at the crossroads north of Rimmington. Equip a Sapphire ring, yellow flowers and leather chaps."],
            "area": {"topleft": {"x": 2953, "y": 3243}, "botright": {"x": 2956, "y": 3238}, "level": 0},
            "items": ["Sapphire ring", "Yellow flowers", "Leather chaps"],
            "emotes": ["Twirl"],
            "double_agent": false,
            "hidey_hole": {"name": "Rock (hidey-hole)", "location": {"x": 2959, "y": 3241, "level": 0}}
        },
        {
            "id": 266,
            "type": "emote",
            "tier": "easy",
            "text": ["Blow raspberries outside the entrance to Keep Le Faye. Equip a studded leather coif, iron platebody and leather gloves."],
            "area": {"topleft": {"x": 2755, "y": 3405}, "botright": {"x": 2763, "y": 3398}, "level": 0},
            "items": ["Studded leather coif", "Iron platebody", "Leather gloves"],
            "emotes": ["Raspberry"],
            "double_agent": false,
            "hidey_hole": {"name": "Rock (hidey-hole)", "location": {"x": 2756, "y": 3404, "level": 0}}
        },
        {
            "id": 267,
            "type": "emote",
            "tier": "easy",
            "text": ["Cheer for the monks at Port Sarim. Equip a studded leather coif, steel plateskirt and a sapphire necklace."],
            "area": {"topleft": {"x": 3044, "y": 3237}, "botright": {"x": 3049, "y": 3234}, "level": 0},
            "items": ["Studded Leather coif", "Steel plateskirt", "Sapphire necklace"],
            "emotes": ["Cheer"],
            "double_agent": false,
            "hidey_hole": {"name": "Crate (hidey-hole)", "location": {"x": 3042, "y": 3234, "level": 0}}
        },
        {
            "id": 268,
            "type": "emote",
            "tier": "easy",
            "text": ["Wave on Mudskipper Point. Equip a gold ring, leather chaps and a steel mace."],
            "area": {"topleft": {"x": 2981, "y": 3130}, "botright": {"x": 3005, "y": 3106}, "level": 0},
            "items": ["Gold ring", "Leather chaps", "Steel mace"],
            "emotes": ["Wave"],
            "double_agent": false,
            "hidey_hole": {"name": "Rock (hidey-hole)", "location": {"x": 3004, "y": 3123, "level": 0}}

        },
        {
            "id": 269,
            "type": "emote",
            "tier": "easy",
            "text": ["Shrug in the mine near Rimmington. Equip a gold necklace, gold ring and a bronze spear."],

            "area": {"topleft": {"x": 2970, "y": 3243}, "botright": {"x": 2981, "y": 3230}, "level": 0},
            "items": ["Gold necklace", "Gold ring", "Bronze spear"],
            "emotes": ["Shrug"],
            "double_agent": false,
            "hidey_hole": {"name": "Cart (hidey-hole)", "location": {"x": 2972, "y": 3235, "level": 0}}
        },
        {
            "id": 270,
            "type": "emote",
            "tier": "easy",
            "text": ["Clap in the main exam room of the Exam Centre. Equip a ruby amulet, blue flowers and leather gloves."],
            "area": {"topleft": {"x": 3351, "y": 3349}, "botright": {"x": 3359, "y": 3342}, "level": 0},
            "items": ["Ruby amulet", "Blue flowers", "Leather gloves"],
            "emotes": ["Clap"],
            "double_agent": false,
            "hidey_hole": {"name": "Crate (hidey-hole)", "location": {"x": 3351, "y": 3348, "level": 0}}
        },
        {
            "id": 271,
            "type": "emote",
            "tier": "easy",
            "text": ["Yawn in Varrock Palace library. Equip a holy symbol, leather vambraces and an iron warhammer."],
            "area": {"topleft": {"x": 3207, "y": 3497}, "botright": {"x": 3217, "y": 3490}, "level": 0},
            "items": ["Holy symbol", "Leather vamraces", "Iron warhammer"],
            "emotes": ["Yawn"],
            "double_agent": false,
            "hidey_hole": {"name": "Crate (hidey-hole)", "location": {"x": 3217, "y": 3494, "level": 0}}

        },
        {
            "id": 272,
            "type": "emote",
            "tier": "easy",
            "text": ["Dance in the Party Room. Equip a steel full helmet, steel platebody and an iron plateskirt."],
            "area": {"topleft": {"x": 3036, "y": 3385}, "botright": {"x": 3055, "y": 3371}, "level": 0},
            "items": ["Steel full helmet", "Steel platebody", "Iron plateskirt"],
            "emotes": ["Dance"],
            "double_agent": false,
            "hidey_hole": {"name": "Potted plant (hidey-hole)", "location": {"x": 3041, "y": 3372, "level": 0}}
        },
        {
            "id": 273,
            "type": "emote",
            "tier": "easy",
            "text": ["Twirl in Draynor Manor by the fountain. Equip an iron platebody, studded chaps and a bronze full helm."],
            "area": {"topleft": {"x": 3086, "y": 3337}, "botright": {"x": 3090, "y": 3333}, "level": 0},
            "items": ["Iron platebody", "Studden chaps", "Bronze full helm"],
            "emotes": ["Twirl"],
            "double_agent": false,
            "hidey_hole": {"name": "Dead tree (hidey-hole)", "location": {"x": 3091, "y": 3341, "level": 0}}
        },
        {
            "id": 274,
            "type": "emote",
            "tier": "easy",
            "text": ["Jump for joy at the beehives. Equip iron boots, an unholy symbol and a steel hatchet."],
            "area": {"topleft": {"x": 2752, "y": 3451}, "botright": {"x": 2766, "y": 3436}, "level": 0},
            "items": ["Iron boots", "Unholy smybol", "Steel hatchet"],
            "emotes": ["Jump for Joy"],
            "double_agent": false,
            "hidey_hole": {"name": "Beehive (hidey-hole)", "location": {"x": 2762, "y": 3447, "level": 0}}
        },
        {
            "id": 275,
            "type": "emote",
            "tier": "easy",
            "text": ["Headbang in the mine north of Al-kharid. Equip a Polar Camo Top, Leather Gloves and Leather Boots."],

            "area": null,
            "items": ["Polar Camo Top", "Leather Gloves", "Leather Boots"],
            "emotes": ["Headbang"],
            "double_agent": false,
        },
        {
            "id": 276,
            "type": "emote",
            "tier": "easy",
            "text": ["Bow or curtsy outside the entrance to the Legends' Guild. Equip iron platelegs, an emerald amulet and an oak shieldbow."],

            "area": null,
            "items": ["Iron platelegs", "Emerald Amulet", "Oak Shieldbow"],
            "emotes": ["Bow or Curtsy"],
            "double_agent": false,
        },
        {
            "id": 277,
            "type": "emote",
            "tier": "easy",
            "text": ["Cheer in the centre of the Burthorpe Games Room. Have nothing equipped at all when you do."],
            "area": null,
            "items": ["Nothing"],
            "emotes": ["Cheer"],
            "double_agent": false,
            "hidey_hole": null
        },
        {
            "id": 278,
            "type": "emote",
            "tier": "easy",
            "text": ["Dance at the crossroads north of Draynor. Equip an iron chainbody, sapphire ring and a shieldbow."],

            "area": null,
            "items": ["Iron Chainbody", "Sapphire Ring", "Shieldbow"],
            "emotes": ["Dance"],
            "double_agent": false,
        },
        {
            "id": 279,
            "type": "emote",
            "tier": "easy",
            "text": ["Dance a jig by the entrance to the Fishing Guild. Equip an emerald ring, sapphire amulet, and a bronze chainbody."],

            "area": null,
            "items": ["Emerald Ring", "Sapphire Amulet", "Bronze Chainbody"],
            "emotes": ["Jig"],
            "double_agent": false,
        },
        {
            "id": 280,
            "type": "emote",
            "tier": "easy",
            "text": ["Bow or curtsy at the entrance to Het's Oasis. Equip an iron chainbody, leather chaps and a studded leather coif."],

            "area": null,
            "items": ["Iron Chainbody", "Leather Chaps", "Leather Coif"],
            "emotes": ["Bow or Curtsy"],
            "double_agent": false,
        },
        {
            "id": 281,
            "type": "emote",
            "tier": "easy",
            "text": ["Cry outside the south gates of Fort Forinthry. Equip a hard leather body, leather chaps and a bronze hatchet."],

            "area": null,
            "items": ["Hard Leather Body", "Leather Chaps", "Bronze Hatchet"],
            "emotes": ["Cry"],
            "double_agent": false,
        },
        {
            "id": 282,
            "type": "emote",
            "tier": "easy",
            "text": ["Clap on the top level of the mill north of East Ardougne. Equip an emerald ring, wood camo top and an unenchanted tiara."],

            "area": null,
            "items": ["Emerald Ring", "Wood Camo Top", "Unenchanted Tiara"],
            "emotes": ["Clap"],
            "double_agent": false,
        },
        {
            "id": 283,
            "type": "emote",
            "tier": "easy",
            "text": ["Yawn in Draynor Marketplace. Equip an iron kiteshield, steel longsword and studded leather chaps."],

            "area": null,
            "items": ["Iron Kiteshield", "Steel Longsword", "Studded Leather Chaps"],
            "emotes": ["Yawn"],
            "double_agent": false,
        },
        {
            "id": 284,
            "type": "emote",
            "tier": "easy",
            "text": ["Cheer at the Druids' Circle. Equip an air tiara, bronze two-handed sword and a gold amulet."],

            "area": null,
            "items": ["Air Tiara", "Bronze 2h Sword", "Gold Amulet"],
            "emotes": ["Cheer"],
            "double_agent": false,
        },
        {
            "id": 7,
            "type": "emote",
            "tier": "medium",
            "text": ["Beckon in the Digsite, near the eastern winch. Bow or curtsy before you talk to me. Equip a pointed red and black snelm, snakeskin boots, and an iron pickaxe."],

            "area": null,
            "items": ["Pointed Red and Black Snelm", "Snakeskin Boots", "Iron Pickaxe"],
            "emotes": ["Beckon", "Bow or Curtsy"],
            "double_agent": false,
        },
        {
            "id": 247,
            "type": "emote",
            "tier": "medium",
            "text": ["Panic by the mausoleum in Morytania. Wave before you speak to me. Equip a mithril plateskirt, a maple shieldbow and no boots."],

            "area": null,
            "items": ["Mithril Plateskirt", "Maple Shieldbow", "No boots"],
            "emotes": ["Panic", "Wave"],
            "double_agent": false,
        },
        {
            "id": 248,
            "type": "emote",
            "tier": "medium",
            "text": ["Dance a jig under Shantay's Awning. Bow or curtsy before you talk to me. Equip a pointed blue snail helmet and an air staff."],

            "area": null,
            "items": ["Pointed Blue Snelm", "Air Staff"],
            "emotes": ["Jig", "Bow or Curtsy"],
            "double_agent": false,
        },
        {
            "id": 249,
            "type": "emote",
            "tier": "medium",
            "text": ["Think under the lens in the Observatory. Twirl before you talk to me. Equip a mithril chainbody, green dragonhide chaps and a ruby amulet."],

            "area": null,
            "items": ["Mithril Chainbody", "Green Dragonhide Chaps", "Ruby Amulet"],
            "emotes": ["Think", "Twirl"],
            "double_agent": false,
        },
        {
            "id": 250,
            "type": "emote",
            "tier": "medium",
            "text": ["Twirl on the bridge by Barbarian Village. Salute before you talk to me. Equip an iron hatchet, steel kiteshield and a mithril full helmet."],

            "area": null,
            "items": ["Iron Hatchet", "Steel Kiteshield", "Mithril Full Helm"],
            "emotes": ["Twirl", "Salute"],
            "double_agent": false,
        },
        {
            "id": 251,
            "type": "emote",
            "tier": "medium",
            "text": ["Jump for joy in Yanille bank. Dance a jig before you talk to me. Equip an iron crossbow, adamant helmet and snakeskin chaps."],

            "area": null,
            "items": ["", "", ""],
            "emotes": [""],
            "double_agent": false,
            "solution": {
                "type": "simple",
                "spot": {"x": 2612, "y": 3093, "level": 0},
                "answer": "<b>Emotes:</b> Jump for joy, then jig<br><b>Items:</b> Iron crossbow, Adamant med helmet, Snakeskin chaps"
            }
        },
        {
            "id": 252,
            "type": "emote",
            "tier": "medium",
            "text": ["Dance in the centre of Canifis. Bow or curtsy before you talk to me. Equip a spiny helmet, mithril platelegs and an iron two-handed sword."],

            "area": null,
            "items": ["", "", ""],
            "emotes": [""],
            "double_agent": false,
            "solution": {
                "type": "simple",
                "spot": {"x": 3492, "y": 3491, "level": 0},
                "answer": "<b>Emotes:</b> Dance, then bow or curtsy<br><b>Items:</b> Spiny helm, Mithril platelegs, Iron two-handed sword"
            }
        },
        {
            "id": 253,
            "type": "emote",
            "tier": "medium",
            "text": ["Cheer in the Barbarian Agility Arena. Headbang before you talk to me. Equip a steel platebody, maple shortbow and bronze boots."],

            "area": null,
            "items": ["", "", ""],
            "emotes": [""],
            "double_agent": false,
            "solution": {
                "type": "simple",
                "spot": {"x": 2548, "y": 3553, "level": 0},
                "answer": "<b>Emotes:</b> Cheer, then Headbang<br><b>Items:</b> Steel platebody, Maple shortbow, Bronze boots"
            }
        },
        {
            "id": 254,
            "type": "emote",
            "tier": "medium",
            "text": ["Cry on the platform of the south-west tree in the Gnome Agility Arena. Indicate 'no' before you talk to me. Equip a steel kiteshield, ring of forging and green dragonhide chaps."],

            "area": null,
            "items": ["", "", ""],
            "emotes": [""],
            "double_agent": false,
            "solution": {
                "type": "simple",
                "spot": {"x": 2474, "y": 3419, "level": 0},
                "answer": "<b>Emote:</b> Cry, then 'no' emote<br><b>Items:</b> Green d'hide chaps, Steel kiteshield, Ring of forging"
            }
        },
        {
            "id": 255,
            "type": "emote",
            "tier": "medium",
            "text": ["Beckon in Tai Bwo Wannai. Clap before you talk to me. Equip green dragonhide chaps, a ring of duelling and a mithril helmet."],
            "items": ["Green dragonhide chaps", "Ring of duelling", "Mithril helm"],
            "emotes": ["Becken", "Clap"],
            "double_agent": false,
            "area": null,
        },
        {
            "id": 256,
            "type": "emote",
            "tier": "medium",
            "text": ["Cheer in the Ogre Pen in the Training Camp. Show you are angry before you talk to me. Equip a green dragonhide body and chaps, and a steel squareshield."],
            "items": ["Green dragonhide body", "Green dragonhide chaps", "Steel square shield"],
            "emotes": ["Cheer", "Angry"],
            "double_agent": false,
            "area": null,
        },
        {
            "id": 257,
            "type": "emote",
            "tier": "medium",
            "text": ["Cry in the Catherby archery shop. Bow or curtsy before you talk to me. Equip a round red and black snelm, a hard leather body and an unblessed silver sickle."],
            "items": ["Round red and black snelm", "Hard leather body", "Unblessed silver sickle"],
            "emotes": ["Cry", "Bow or Curtsy"],
            "double_agent": false
            "area": null,
        },
        {
            "id": 258,
            "type": "emote",
            "tier": "medium",
            "text": ["Yawn in the Castle Wars lobby. Shrug before you talk to me. Equip a ruby amulet, mithril scimitar and an iron square shield."],
            "items": ["Ruby amulet", "Mithril scimitar", "Iron square shield"],
            "emotes": ["Yawn", "Shrug"],
            "double_agent": false
            "area": null,
        },
        {
            "id": 9,
            "type": "emote",
            "tier": "hard",
            "text": ["Shrug in the Zamorak temple found in the Eastern Wilderness. Beware of double agents! Equip bronze platelegs, an iron platebody, and blue d'hide vambraces"],
            "items": ["Bronze platelegs", "Iron platebody", "Blue dragonhide vambraces"],
            "emotes": ["Shrug"],
            "double_agent": true
            "area": null,
        },
        {
            "id": 225,
            "type": "emote",
            "tier": "hard",
            "text": ["Panic in the heart of the Haunted Woods. Beware of double agents! Have no items equipped when you do."],
            "emotes": ["Panic"],
            "items": ["Nothing"],
            "double_agent": true,
            "area": null,
        },
        {
            "id": 226,
            "type": "emote",
            "tier": "hard",
            "text": ["Laugh in the Jokul's tent in the Mountain Camp. Beware of double agents! Equip a rune full helmet, blue dragonhide chaps and a fire battlestaff."],
            "items": ["Rune full helm", "Blue dragonhide chaps", "Fire battlestaff"],
            "emotes": ["Laugh"],
            "double_agent": true,
            "area": null,
        },
        {
            "id": 227,
            "type": "emote",
            "tier": "hard",
            "text": ["Panic by the pilot on White Wolf Mountain. Beware of double agents! Equip mithril platelegs, a ring of life, and a rune hatchet."],
            "items": ["Mithril platelegs", "Ring of life", "Rune hatchet"],
            "emotes": ["Panic"],
            "double_agent": true
            "area": null,
        },
        {
            "id": 228,
            "type": "emote",
            "tier": "hard",
            "text": ["Salute in the banana plantation. Beware of double agents! Equip a diamond ring, amulet of power and nothing on your chest and legs."],
            "items": ["Diamond ring", "Amulet of power", "Nothing on your chest and legs"],
            "emotes": ["Salute"],
            "double_agent": true
            "area": null,
        },
        {
            "id": 229,
            "type": "emote",
            "tier": "hard",
            "text": ["Dance at the cat-doored pyramid in Sophanem. Beware of double agents! Equip a ring of life, an amulet of glory and an adamant two-handed sword."],
            "items": ["Ring of life", "Uncharged amulet of glory", "Adamant 2h sword"],
            "emotes": ["Dance"],
            "double_agent": true
            "area": null,
        },
        {
            "id": 230,
            "type": "emote",
            "tier": "hard",
            "text": ["Blow a raspberry in the Fishing Guild bank. Beware of double agents! Equip an elemental shield, blue dragonhide chaps and a rune warhammer."],
            "area": {"topleft": {"x": 2585, "y": 3423}, "botright": {"x": 2587, "y": 3420}, "level": 0},
            "items": ["Elemental shield", "Blue dragonhide chaps", "Rune warhammer"],
            "emotes": ["Raspberry"],
            "double_agent": true,
            "hidey_hole": {
                "location": {"topleft": {"x": 2585, "y": 3424}, "botright": {"x": 2585, "y": 3424}, "level": 0},
                "name": "Crate (hidey-hole)"
            }
        },
        {
            "id": 231,
            "type": "emote",
            "tier": "hard",
            "text": ["Blow a kiss between the tables in Shilo Village bank. Beware of double agents! Equip a splitbark helm, mud pie and rune platebody."],
            "items": ["Splitbark helmet", "Mud pie", "Rune platebofy"],
            "emotes": ["Blow kiss"],
            "double_agent": true,
            "area": null,
        },
        {
            "id": 232,
            "type": "emote",
            "tier": "hard",
            "text": ["Bow or curtsy at the top of the lighthouse. Beware of double agents! Equip a blue dragonhide body, blue dragonhide vambraces and no jewellery."],
            "area": {"topleft": {"x": 2504, "y": 3645}, "botright": {"x": 2513, "y": 3636}, "level": 2},
            "items": ["Blue dragonhide body", "Blue dragon vambraces", "No jewellry"],
            "emotes": ["Bow or Curtsy"],
            "double_agent": true,
            "hidey_hole": {
                "location": {"topleft": {"x": 2512, "y": 3639}, "botright": {"x": 2512, "y": 3639}, "level": 2},
                "name": "Crate (hidey-hole)"
            }
        },
        {
            "id": 235,
            "type": "emote",
            "tier": "hard",
            "text": ["Yawn near the Wilderness Bandit camp obelisk. Beware of double agents! Equip an iron square shield, blue dragon vambraces and an iron pickaxe."],
            "items": ["Iron square shield", "Blue dragonhide vambraces", "Iron pickaxe"],
            "emotes": ["Yawn"],
            "double_agent": true
        },
        {
            "id": 243,
            "type": "emote",
            "tier": "hard",
            "text": ["Shrug in the Zamorak temple, found in the eastern Wilderness. Beware of double agents! Equip bronze platelegs, an iron platebody and blue dragonhide vambraces."],
            "items": ["Bronze platelegs", "Iron platebody", "Blue dragonhide vambraces"],
            "emotes": ["Shrug"],
            "double_agent": true,
        },
        {
            "id": 233,
            "type": "emote",
            "tier": "master",
            "text": ["Cheer by the sulphur pit in the TzHaar City. Beware of double agents! Equip a fire cape, a Toktz-ket-xil and a spork."],
            "solution": {
                "type": "simple",
                "spot": {"x": 2845, "y": 3174, "level": 0},
                "answer": "<b>Emote:</b> Cheer<br><b>Items:</b> Fire cape, Toktz-ket-xil, Spork<br>(Inside the TzHaar City, southwest of the market square)"
            }
        },
        {
            "id": 234,
            "type": "emote",
            "tier": "master",
            "text": ["Headbang inside the Slayer Tower. Beware of double agents! Equip an imp-hide hood, a Prifddinian musician's robe top and an amulet of magic."],
            "solution": {
                "type": "simple",
                "spot": {"x": 3424, "y": 3544, "level": 0},
                "answer": "<b>Emote:</b> Headbang<br><b>Items:</b> Imp-hide hood, Prifddinian musician's robe top, Amulet of magic"
            }
        },
        {
            "id": 236,
            "type": "emote",
            "tier": "master",
            "text": ["Dare to laugh in the Green Ghost inn at Port Phasmatys. Beware of double agents! Equip an Iban's staff, a ghostly cloak and a cavalier."],
            "solution": {
                "type": "simple",
                "spot": {"x": 3674, "y": 3497, "level": 0},
                "answer": "<b>Emote:</b> Laugh<br><b>Items:</b> Iban's staff, Ghostly cloak, Cavalier"
            }
        },
        {
            "id": 237,
            "type": "emote",
            "tier": "master",
            "text": ["Blow a Raspberry at the celestial dragons on Dragontooth Isle. Beware of double agents! Equip a dragon mask, a Dragon Rider amulet and a dragon defender."],
            "solution": {
                "type": "simple",
                "spot": {"x": 3814, "y": 3530, "level": 0},
                "answer": "<b>Emote:</b> Raspberry<br><b>Items:</b> any Dragon mask, Dragon Rider amulet, Dragon defender"
            }
        },
        {
            "id": 238,
            "type": "emote",
            "tier": "master",
            "text": ["Wave in front of the entrance to the Grand Library of Menaphos. Beware of double agents! Equip an asylum surgeon's ring and the Scabaras mask."],
            "solution": {
                "type": "simple",
                "spot": {"x": 3172, "y": 2710, "level": 0},
                "answer": "<b>Emote:</b> Wave<br><b>Items:</b> Asylum surgeon's ring, Scabaras mask"
            }
        },
        {
            "id": 239,
            "type": "emote",
            "tier": "master",
            "text": ["Jig in the Edgeville Monastery garden. Beware of double agents! Equip a holy cithara, Saradomin's murmur and a ring of devotion."],
            "solution": {
                "type": "simple",
                "spot": {"x": 3052, "y": 3505, "level": 0},
                "answer": "<b>Emote:</b> Jig<br><b>Items:</b> Holy cithara, Saradomin's murmur, Ring of devotion"
            }
        },
        {
            "id": 240,
            "type": "emote",
            "tier": "master",
            "text": ["Bow or curtsy at the charm sprite hunter area. Beware of double agents! Equip an enhanced yaktwee stick, a Dagon-hai hat and an amulet of ranging."],
            "solution": {
                "type": "simple",
                "spot": {"x": 2404, "y": 3370, "level": 0},
                "answer": "<b>Emote:</b> Bow or curtsy<br><b>Items:</b> Enhanced yaktwee stick, Dagon-hai hat, Amulet of ranging"
            }
        },
        {
            "id": 241,
            "type": "emote",
            "tier": "master",
            "text": ["Think in the Hefin district of Prifddinas. Beware of double agents! Equip an ancient staff, Prifddinian worker's trousers and a berserker ring."],
            "solution": {
                "type": "simple",
                "spot": {"x": 2187, "y": 3412, "level": 0},
                "answer": "<b>Emote:</b> Think<br><b>Items:</b> Ancient staff, Prifddinian worker's trousers, Berserker ring"
            }
        },
        {
            "id": 242,
            "type": "emote",
            "tier": "master",
            "text": ["Shrug in the Lumbridge Fishing Supplies shop. Beware of double agents! Equip demon slayer gloves, a boater and the cape of legends."],
            "solution": {
                "type": "simple",
                "spot": {"x": 3195, "y": 3253, "level": 0},
                "answer": "<b>Emote:</b> Shrug<br><b>Items:</b> Demon slayer gloves, any Boater, Cape of legends"
            }
        },
        {
            "id": 244,
            "type": "emote",
            "tier": "master",
            "text": ["Have an idea inside the Invention Guild. Beware of double agents! Equip a lab coat top, lab coat legs and a staff of light."],
            "solution": {
                "type": "simple",
                "spot": {"x": 2998, "y": 3441, "level": 0},
                "answer": "<b>Emote:</b> Idea<br><b>Items:</b> Lab coat top, Lab coat legs, Staff of light"
            }
        },
        {
            "id": 245,
            "type": "emote",
            "tier": "master",
            "text": ["Dance on an Uncharted Isle. Beware of double agents! Equip a dark bow, some infinity boots and culinaromancer gloves 10."],
            "solution": {
                "type": "simple",
                "spot": {"x": 3053, "y": 3247, "level": 0},
                "answer": "<b>Emote:</b> Dance<br><b>Items:</b> Dark bow, Infinity boots, Culinaromancer gloves 10"
            }
        },
        {
            "id": 246,
            "type": "emote",
            "tier": "master",
            "text": ["Salute in the Max Guild Garden. Beware of double agents! Have no items equipped when you do."],
            "solution": {
                "type": "simple",
                "spot": {"x": 2276, "y": 3330, "level": 0},
                "answer": "<b>Emote:</b> Salute<br><b>Items:</b> <b>Nothing</b><br>(Requires any level 99 not all)"
            }
        }
    ]
    export const map: Clues.Map[] = [
        {
            "id": 49,
            "type": "map",
            "tier": "easy",
            "image_url": "assets/Map_clue_Wizards'_Tower.png",
            "text": ["X marks the spot south of the wizard's tower."],
            "ocr_data": [26, 74, 167, 26, 77, -17, 6, 8, 26, 77, -18, 8, 10, 25, 78, -17, 6, 7, 26, 80, -14, 5, 6, 25, 77, -15, 7, 8, 26, 77, -17, 7, 9, 26, 77, -18, 6, 8, 25, 80, -20, 7, 9, 25, 86, -19, 7, 8, 25, 82, -20, 6, 7, 26, 82, -18, 5, 6, 26, 82, -20, 4, 6, 25, 82, -19, 5, 7, 25, 85, -20, 6, 7, 26, 81, -21, 8, 10, 26, 78, -17, 7, 9, 25, 76, -21, 7, 9, 25, 79, -18, 5, 7, 26, 81, -15, 6, 8, 26, 79, -16, 7, 8, 26, 77, -19, 7, 8, 25, 78, -20, 6, 7, 24, 79, -15, 15, 20, 25, 80, -20, 8, 12, 26, 81, -11, 13, 17, 26, 79, -5, 18, 21, 26, 80, -15, 12, 17, 25, 79, -22, 5, 7, 25, 83, -23, 7, 8, 26, 80, -21, 6, 8, 25, 77, -19, 8, 10, 26, 78, -21, 6, 8, 26, 78, -20, 6, 7, 25, 82, -17, 5, 7, 26, 79, -20, 6, 7, 26, 77, -16, 10, 12, 26, 79, -18, 9, 14, 26, 64, 37, 40, 52, 26, 69, 24, 45, 56, 26, 68, 26, 41, 50, 26, 67, 40, 55, 67, 26, 67, 33, 52, 62, 26, 79, -20, 5, 7, 26, 80, -23, 6, 7, 26, 80, -22, 7, 8, 25, 78, -20, 5, 6, 25, 78, -20, 6, 8, 25, 77, -20, 4, 5, 26, 80, -19, 6, 8, 27, 71, 14, 39, 47, 26, 69, 17, 35, 46, 26, 68, 34, 60, 72, 26, 61, 43, 53, 66, 25, 64, 44, 68, 82, 26, 64, 32, 51, 62, 26, 72, 0, 26, 35, 27, 69, 18, 26, 36, 26, 80, -18, 6, 8, 25, 79, -22, 6, 8, 26, 79, -23, 5, 6, 25, 78, -17, 8, 10, 26, 78, -21, 6, 8, 25, 78, -22, 5, 6, 25, 76, -8, 20, 24, 27, 67, 27, 43, 50, 26, 69, 12, 34, 43, 27, 64, 38, 66, 77, 27, 57, 60, 53, 63, 27, 59, 66, 71, 84, 27, 59, 51, 64, 79, 26, 62, 42, 52, 61, 27, 74, -5, 16, 21, 25, 80, -18, 5, 6, 26, 81, -22, 6, 7, 26, 80, -25, 6, 7, 26, 77, -23, 5, 7, 25, 81, -21, 6, 7, 26, 78, -25, 6, 7, 26, 75, -9, 19, 25, 26, 61, 40, 57, 67, 27, 62, 37, 62, 72, 26, 59, 56, 60, 73, 26, 54, 44, 25, 33, 26, 55, 44, 31, 38, 26, 58, 60, 73, 89, 26, 64, 28, 48, 67, 27, 69, 24, 31, 43, 26, 80, -19, 5, 6, 26, 81, -22, 5, 6, 25, 80, -23, 6, 7, 26, 77, -23, 7, 9, 26, 78, -26, 7, 8, 25, 80, -23, 6, 8, 27, 67, 24, 48, 57, 27, 56, 69, 62, 80, 27, 58, 47, 64, 79, 26, 56, 45, 40, 46, 26, 53, 55, 40, 48, 26, 53, 46, 25, 30, 25, 60, 41, 42, 52, 27, 58, 61, 61, 76, 26, 70, 24, 30, 40, 25, 82, -16, 8, 9, 25, 80, -22, 5, 6, 26, 79, -24, 6, 7, 26, 79, -18, 6, 8, 26, 78, -26, 6, 7, 26, 78, -23, 6, 8, 25, 74, -7, 17, 21, 26, 64, 32, 40, 52, 27, 58, 52, 67, 84, 27, 58, 46, 42, 52, 26, 54, 44, 25, 29, 26, 55, 46, 19, 22, 26, 59, 51, 53, 64, 26, 59, 63, 66, 81, 26, 71, 14, 24, 32, 25, 83, -17, 6, 7, 26, 79, -23, 6, 7, 26, 81, -23, 6, 8, 26, 79, -16, 5, 6, 25, 80, -19, 6, 8, 26, 82, -22, 6, 8, 26, 80, -11, 12, 15, 26, 70, 4, 27, 33, 27, 59, 44, 64, 78, 27, 61, 40, 56, 69, 26, 57, 57, 71, 85, 26, 59, 54, 55, 67, 26, 60, 50, 66, 80, 26, 62, 46, 56, 70, 26, 76, -10, 12, 18, 26, 81, -18, 4, 6, 25, 79, -19, 5, 6, 26, 79, -24, 5, 6, 25, 81, -15, 7, 10, 25, 80, -17, 8, 10, 26, 81, -19, 6, 8, 25, 80, -11, 12, 14, 25, 74, -2, 16, 20, 26, 67, 20, 30, 38, 26, 63, 38, 51, 57, 26, 59, 55, 100, 119, 26, 60, 52, 71, 87, 26, 63, 37, 50, 59, 25, 73, -5, 19, 24, 26, 74, -21, 8, 10, 26, 79, -21, 4, 5, 26, 80, -22, 5, 7, 27, 77, -25, 5, 7, 26, 82, -15, 6, 8, 26, 82, -18, 7, 8, 25, 82, -16, 8, 10, 25, 80, -16, 8, 10, 26, 79, -11, 11, 13, 25, 80, -14, 10, 13, 25, 81, -11, 10, 13, 25, 77, 4, 22, 28, 26, 76, -6, 18, 24, 26, 77, -21, 9, 11, 26, 76, -20, 10, 12, 27, 77, -25, 6, 7, 26, 80, -21, 6, 8, 26, 79, -25, 6, 7, 27, 77, -27, 5, 7, 25, 84, -13, 9, 11, 24, 84, -15, 8, 10, 24, 85, -14, 9, 11, 25, 84, -12, 7, 9, 25, 84, -13, 7, 9, 25, 83, -14, 10, 12, 24, 84, -14, 8, 10, 25, 85, -16, 10, 12, 26, 80, -23, 6, 8, 26, 78, -24, 6, 8, 26, 77, -26, 6, 7, 27, 78, -26, 5, 6, 26, 80, -21, 6, 7, 26, 78, -25, 6, 8, 27, 76, -26, 6, 8],
            "solution": {
                "type": "dig",
                "spot": {"x": 3102, "y": 3133, "level": 0},
            }
        },
        {
            "id": 50,
            "type": "map",
            "tier": "easy",
            "image_url": "assets/Map_clue_Brother_Galahad's_house.png",
            "text": ["X marks the spot in front of a small house surrounded by trees and near a bridge."],
            "ocr_data": [26, 77, 175, 26, 77, -9, 6, 8, 26, 77, -10, 8, 10, 25, 78, -9, 6, 7, 26, 79, -1, 15, 19, 25, 77, -7, 7, 10, 26, 77, -9, 7, 9, 26, 77, -10, 6, 8, 25, 80, -12, 7, 9, 25, 86, -11, 7, 8, 25, 82, -12, 6, 7, 26, 82, -10, 5, 6, 26, 82, -12, 4, 6, 25, 82, -11, 5, 7, 25, 85, -12, 6, 7, 26, 81, -13, 8, 10, 26, 78, -9, 7, 9, 25, 76, -13, 7, 9, 25, 79, -10, 5, 14, 27, 70, 41, 40, 50, 26, 71, 37, 48, 59, 26, 77, -10, 9, 14, 25, 78, -12, 6, 7, 24, 80, -13, 6, 8, 25, 80, -14, 5, 7, 26, 84, -10, 5, 6, 26, 83, -8, 6, 8, 26, 82, -12, 6, 10, 27, 70, 16, 52, 59, 25, 83, -15, 7, 8, 26, 80, -13, 6, 8, 25, 77, -11, 8, 10, 26, 78, -13, 6, 8, 26, 78, -12, 6, 16, 26, 72, 36, 34, 42, 27, 70, 35, 45, 50, 26, 79, -12, 5, 7, 26, 80, -13, 5, 6, 26, 80, -12, 6, 8, 25, 79, -13, 7, 8, 26, 79, -12, 5, 7, 26, 81, -9, 6, 7, 27, 71, 17, 45, 51, 26, 76, -6, 22, 31, 26, 80, -15, 6, 7, 26, 80, -14, 7, 8, 25, 78, -12, 5, 6, 25, 78, -12, 6, 8, 25, 77, -12, 4, 9, 27, 69, 41, 39, 52, 27, 70, 38, 46, 57, 26, 80, -11, 8, 14, 27, 73, 17, 57, 64, 25, 80, -15, 10, 17, 24, 80, -10, 7, 8, 25, 78, -5, 21, 24, 26, 77, -3, 24, 27, 27, 71, 16, 41, 50, 27, 70, 21, 50, 61, 25, 79, -14, 6, 8, 26, 79, -15, 5, 6, 25, 78, -9, 8, 10, 26, 78, -13, 6, 8, 25, 78, -14, 5, 6, 26, 69, 41, 55, 61, 27, 75, 15, 40, 46, 27, 76, 9, 22, 26, 26, 79, -13, 13, 17, 28, 68, 18, 64, 76, 26, 77, -1, 25, 37, 26, 74, 22, 71, 89, 25, 75, 13, 66, 85, 27, 72, 21, 55, 87, 27, 71, 21, 57, 64, 26, 81, -14, 6, 7, 26, 80, -17, 6, 7, 26, 77, -15, 5, 7, 25, 81, -13, 6, 7, 26, 78, -17, 6, 7, 26, 70, 32, 31, 44, 26, 75, -4, 22, 38, 26, 68, 37, 40, 53, 27, 70, 17, 57, 66, 26, 77, 2, 45, 58, 26, 74, 6, 43, 68, 26, 70, 42, 108, 131, 25, 76, 0, 39, 50, 27, 78, -3, 24, 30, 27, 70, 28, 61, 85, 26, 81, -13, 6, 10, 25, 80, -15, 6, 7, 26, 77, -15, 7, 9, 26, 78, -18, 7, 8, 25, 80, -15, 6, 8, 27, 72, 19, 26, 31, 26, 72, 22, 53, 59, 27, 68, 42, 51, 63, 28, 67, 21, 58, 66, 25, 76, -11, 15, 22, 26, 77, 4, 43, 49, 25, 81, -9, 8, 10, 26, 79, -8, 8, 10, 26, 80, 9, 41, 46, 26, 78, 5, 36, 45, 25, 80, -13, 5, 9, 26, 79, -16, 6, 7, 26, 79, -10, 6, 8, 26, 78, -18, 6, 7, 26, 78, -15, 6, 8, 26, 72, 37, 27, 31, 27, 72, 53, 36, 45, 27, 68, 60, 53, 62, 27, 77, -7, 27, 32, 26, 79, 1, 45, 48, 26, 79, 7, 41, 47, 26, 80, -10, 7, 9, 25, 82, -8, 6, 8, 26, 78, 9, 43, 51, 25, 82, -7, 7, 12, 26, 79, -15, 6, 7, 26, 81, -15, 6, 8, 26, 79, -8, 5, 6, 25, 80, -11, 6, 8, 26, 82, -14, 6, 8, 26, 79, 4, 21, 27, 27, 72, 23, 41, 49, 27, 72, 7, 35, 42, 27, 66, 41, 62, 71, 26, 81, -13, 7, 11, 26, 78, 8, 50, 55, 26, 78, 4, 41, 47, 26, 78, 5, 42, 48, 27, 73, 18, 60, 76, 27, 75, 8, 27, 34, 25, 79, -11, 5, 6, 26, 79, -16, 5, 6, 25, 81, -7, 7, 10, 25, 80, -9, 8, 10, 26, 81, -11, 6, 8, 25, 81, 1, 18, 23, 26, 71, 36, 46, 56, 26, 79, -11, 6, 7, 25, 75, 9, 31, 37, 26, 66, 49, 58, 70, 26, 72, 23, 21, 25, 26, 72, 15, 26, 31, 25, 78, -10, 9, 16, 27, 67, 13, 48, 58, 27, 70, 17, 51, 57, 26, 80, -14, 5, 7, 27, 77, -17, 5, 7, 26, 82, -7, 6, 8, 26, 82, -10, 7, 8, 25, 82, -8, 8, 10, 25, 80, -7, 9, 14, 26, 80, -5, 12, 18, 25, 81, -10, 6, 8, 25, 83, -8, 8, 10, 25, 82, -5, 12, 19, 26, 77, 5, 29, 38, 27, 73, 13, 42, 52, 27, 66, 47, 59, 70, 27, 70, 16, 24, 30, 26, 78, -8, 18, 24, 26, 79, -17, 6, 7, 27, 77, -19, 5, 7, 25, 84, -5, 9, 11, 24, 84, -7, 8, 10, 24, 85, -6, 9, 11, 25, 84, -4, 7, 9, 25, 84, -5, 7, 9, 25, 83, -6, 10, 12, 24, 84, -6, 8, 10, 25, 85, -8, 10, 12, 26, 80, -15, 6, 8, 26, 78, -16, 6, 8, 26, 77, -17, 6, 12, 27, 72, 8, 37, 46, 26, 77, 0, 20, 25, 26, 78, -17, 6, 8, 27, 76, -18, 6, 8],
            "solution": {
                "type": "dig",
                "spot": {"x": 2612, "y": 3481, "level": 0},
            }
        },
        {
            "id": 54,
            "type": "map",
            "tier": "easy",
            "image_url": "assets/Map_clue_Falador_stones.png",
            "text": ["X marks the spot near some rocks and a tree."],
            "ocr_data": [26, 78, 182, 26, 77, -2, 6, 8, 26, 77, -3, 8, 10, 25, 78, -2, 6, 7, 26, 80, 1, 5, 6, 25, 77, 0, 7, 8, 26, 77, -2, 7, 9, 26, 77, -3, 6, 8, 25, 80, -5, 7, 9, 25, 86, -4, 7, 8, 25, 82, -5, 6, 7, 26, 82, -3, 5, 6, 26, 82, -5, 4, 6, 25, 82, -4, 5, 7, 25, 85, -5, 6, 7, 26, 81, -6, 8, 10, 26, 78, -2, 7, 9, 25, 76, -6, 7, 9, 25, 79, -3, 5, 7, 26, 79, 7, 14, 19, 26, 78, 1, 10, 15, 28, 68, 28, 53, 60, 26, 77, -3, 9, 14, 24, 80, -6, 6, 8, 25, 80, -7, 5, 7, 26, 84, -3, 5, 6, 26, 83, -1, 6, 8, 26, 82, -5, 5, 6, 25, 79, -7, 5, 7, 25, 83, -8, 7, 8, 26, 80, -6, 6, 8, 25, 77, -4, 8, 10, 26, 78, -6, 6, 8, 26, 78, -5, 6, 7, 26, 75, 16, 31, 42, 27, 78, 1, 13, 17, 26, 77, -1, 15, 18, 26, 80, -5, 7, 14, 26, 78, 13, 56, 65, 25, 78, -1, 19, 28, 26, 79, -5, 5, 7, 26, 81, -2, 6, 7, 26, 79, -3, 5, 6, 26, 79, -5, 5, 7, 26, 80, -8, 6, 7, 26, 80, -7, 7, 8, 25, 78, -5, 5, 6, 25, 78, -5, 6, 8, 25, 77, -5, 4, 5, 26, 81, -5, 4, 6, 27, 79, 7, 41, 44, 26, 79, 0, 22, 26, 26, 81, 8, 45, 53, 25, 80, -9, 6, 8, 24, 79, 9, 38, 46, 26, 76, 15, 68, 74, 26, 76, 12, 46, 53, 26, 78, 0, 7, 11, 26, 80, -3, 6, 8, 25, 79, -7, 6, 8, 26, 79, -8, 5, 6, 25, 78, -2, 8, 10, 26, 78, -6, 6, 8, 25, 78, -7, 5, 6, 25, 80, -5, 6, 8, 27, 78, 11, 67, 75, 26, 78, -3, 15, 18, 26, 75, 2, 20, 23, 26, 64, 24, 38, 43, 25, 75, 3, 18, 23, 26, 77, -5, 11, 21, 25, 76, -1, 12, 20, 27, 77, 13, 54, 61, 25, 80, -3, 5, 6, 26, 81, -7, 6, 7, 26, 80, -10, 6, 7, 26, 77, -8, 5, 7, 25, 81, -6, 6, 7, 26, 78, -10, 6, 7, 26, 78, 0, 37, 43, 26, 64, 28, 39, 48, 26, 75, 0, 18, 22, 26, 68, 26, 28, 37, 26, 75, 1, 17, 20, 26, 69, 5, 30, 35, 26, 68, 63, 130, 157, 27, 66, 33, 65, 83, 27, 78, 11, 43, 49, 28, 70, 25, 50, 54, 26, 81, -7, 5, 6, 25, 80, -8, 6, 7, 26, 77, -8, 7, 9, 26, 78, -11, 7, 8, 25, 80, -8, 6, 8, 26, 78, -6, 8, 12, 26, 77, -6, 6, 8, 26, 70, 3, 21, 29, 26, 78, -9, 6, 14, 25, 76, -5, 11, 15, 26, 78, -4, 8, 12, 25, 75, 12, 21, 29, 26, 79, 0, 8, 16, 26, 80, 18, 48, 56, 25, 80, 8, 28, 31, 25, 80, -7, 5, 6, 26, 79, -9, 6, 7, 26, 79, -3, 6, 8, 26, 78, -11, 6, 7, 26, 78, -8, 6, 8, 25, 78, 3, 29, 39, 26, 76, 8, 49, 63, 27, 77, -6, 14, 33, 27, 79, 6, 53, 60, 26, 79, 6, 41, 48, 26, 78, 6, 17, 21, 26, 70, 19, 21, 28, 26, 79, 17, 69, 78, 26, 80, 1, 7, 12, 25, 83, -2, 6, 7, 26, 79, -8, 6, 7, 26, 81, -8, 6, 8, 26, 79, -1, 5, 6, 25, 80, -4, 6, 8, 26, 82, -7, 6, 8, 26, 82, -2, 9, 11, 26, 79, -3, 12, 16, 27, 75, 1, 24, 31, 28, 68, 18, 46, 55, 26, 78, 10, 41, 52, 25, 78, 11, 43, 48, 26, 78, 11, 51, 59, 25, 80, -2, 6, 10, 26, 80, -3, 4, 5, 26, 81, -3, 4, 6, 25, 79, -4, 5, 6, 26, 79, -9, 5, 6, 25, 81, 0, 7, 10, 25, 80, -2, 8, 10, 26, 81, -4, 6, 8, 25, 82, 4, 22, 25, 25, 78, 14, 39, 45, 26, 77, 12, 41, 46, 26, 76, 17, 55, 65, 26, 79, -1, 11, 20, 25, 79, -5, 6, 7, 26, 78, -5, 6, 7, 26, 78, 6, 38, 46, 26, 74, 10, 44, 49, 26, 78, 8, 39, 42, 26, 80, -7, 5, 7, 27, 77, -10, 5, 7, 26, 82, 0, 6, 8, 26, 82, -3, 7, 8, 25, 82, -1, 8, 10, 25, 80, 1, 12, 17, 26, 81, 0, 7, 14, 25, 81, 0, 12, 16, 25, 82, 4, 29, 32, 25, 81, 15, 46, 57, 26, 79, 10, 41, 49, 27, 77, 11, 53, 58, 26, 77, 0, 26, 37, 27, 76, -7, 17, 21, 26, 80, -6, 6, 8, 26, 79, -10, 6, 7, 27, 77, -12, 5, 7, 25, 84, 2, 9, 11, 24, 84, 0, 8, 10, 24, 85, 1, 9, 11, 25, 84, 3, 7, 9, 25, 84, 2, 7, 9, 25, 83, 1, 10, 12, 24, 84, 1, 8, 10, 25, 85, -1, 10, 12, 26, 80, -8, 6, 8, 26, 78, -9, 6, 8, 26, 77, -11, 6, 7, 27, 78, -11, 5, 6, 26, 80, -6, 6, 7, 26, 78, -10, 6, 8, 27, 76, -11, 6, 8],
            "solution": {
                "type": "dig",
                "spot": {"x": 3043, "y": 3399, "level": 0},
            }
        },
        {
            "id": 55,
            "type": "map",
            "tier": "easy",
            "image_url": "assets/Map_clue_Falador_statue_crossroads.png",
            "text": ["X marks the spot near a statue."],
            "ocr_data": [26, 77, 180, 26, 77, -4, 6, 8, 26, 77, -5, 8, 10, 25, 78, -4, 6, 7, 26, 80, -1, 5, 6, 25, 77, -2, 7, 8, 26, 77, -4, 7, 9, 26, 77, -5, 6, 8, 25, 80, -7, 7, 9, 25, 86, -6, 7, 8, 25, 82, -7, 6, 7, 26, 82, -5, 5, 6, 26, 82, -7, 4, 6, 25, 82, -6, 5, 7, 25, 85, -7, 6, 7, 26, 81, -8, 8, 10, 26, 78, -4, 7, 9, 25, 76, -8, 7, 9, 25, 79, -5, 5, 7, 26, 81, -2, 6, 8, 26, 77, 4, 21, 28, 27, 71, 14, 32, 44, 25, 78, -7, 6, 7, 24, 80, -8, 6, 8, 26, 76, 2, 24, 29, 27, 75, 21, 31, 38, 26, 83, -3, 6, 8, 27, 76, 10, 24, 28, 25, 79, -9, 6, 10, 25, 83, -10, 7, 8, 26, 80, -8, 6, 8, 25, 77, -6, 8, 10, 26, 78, -8, 6, 8, 26, 78, -7, 6, 10, 27, 74, 20, 44, 51, 26, 80, -7, 5, 6, 26, 79, -7, 5, 8, 26, 78, -2, 16, 21, 26, 80, -7, 6, 8, 25, 79, -8, 7, 9, 26, 75, 3, 19, 29, 26, 81, -4, 6, 7, 27, 69, 24, 48, 52, 26, 78, -4, 11, 15, 26, 80, -10, 6, 7, 26, 80, -9, 7, 8, 25, 78, -7, 5, 6, 25, 78, -7, 6, 8, 25, 77, -7, 4, 5, 26, 79, -3, 14, 18, 27, 81, -8, 6, 7, 26, 80, -8, 6, 8, 26, 75, 14, 49, 54, 27, 69, 25, 44, 51, 24, 79, -1, 15, 19, 25, 78, -3, 12, 16, 26, 78, -4, 7, 9, 26, 78, -2, 7, 9, 26, 80, -5, 6, 8, 25, 79, -9, 6, 8, 26, 79, -10, 5, 6, 25, 78, -4, 8, 10, 26, 78, -8, 6, 8, 25, 78, -9, 5, 6, 25, 80, -3, 18, 22, 28, 71, 20, 56, 60, 26, 80, -8, 6, 8, 26, 81, -11, 5, 7, 25, 48, 31, 77, 85, 25, 64, 10, 29, 35, 27, 70, 19, 51, 57, 25, 77, -5, 6, 9, 27, 79, -3, 7, 9, 25, 80, -5, 5, 6, 26, 81, -9, 6, 7, 26, 80, -12, 6, 7, 26, 77, -10, 5, 7, 25, 81, -8, 6, 7, 26, 78, -12, 6, 9, 26, 77, 17, 71, 86, 26, 74, 17, 75, 86, 26, 78, -8, 10, 16, 25, 80, -10, 7, 8, 21, 36, 35, 49, 58, 23, 38, 37, 42, 51, 25, 78, -7, 7, 8, 25, 78, -7, 11, 16, 26, 76, 0, 16, 21, 26, 78, 13, 52, 60, 26, 81, -8, 5, 11, 25, 80, -10, 6, 7, 26, 77, -10, 7, 9, 26, 78, -13, 7, 8, 25, 80, -10, 6, 8, 26, 77, -2, 18, 27, 26, 75, 14, 66, 73, 27, 75, 15, 69, 87, 26, 77, 3, 44, 57, 24, 51, 34, 135, 153, 25, 52, 34, 63, 80, 26, 75, 32, 85, 97, 26, 76, 23, 58, 67, 26, 79, 26, 71, 88, 26, 80, 21, 62, 73, 25, 80, -3, 20, 24, 26, 79, -11, 6, 7, 26, 79, -5, 6, 8, 26, 78, -13, 6, 7, 26, 78, -10, 6, 8, 27, 71, 17, 48, 53, 26, 77, -6, 12, 17, 27, 77, 6, 52, 63, 27, 79, 9, 46, 59, 26, 80, -7, 6, 14, 26, 72, 14, 94, 107, 26, 74, 25, 67, 86, 26, 78, 28, 77, 89, 26, 79, 13, 44, 52, 25, 83, -4, 6, 7, 26, 79, -10, 6, 7, 26, 81, -10, 6, 8, 26, 79, -3, 5, 6, 25, 80, -6, 6, 8, 26, 82, -9, 6, 8, 26, 80, 0, 19, 23, 28, 66, 33, 62, 69, 27, 76, -14, 6, 7, 27, 75, 10, 58, 66, 26, 81, -8, 7, 8, 25, 75, 3, 26, 27, 26, 78, 15, 51, 59, 25, 80, -4, 7, 10, 26, 80, -5, 5, 8, 26, 76, 3, 21, 24, 25, 79, -6, 5, 6, 26, 79, -11, 5, 6, 25, 81, -2, 7, 10, 25, 80, -4, 8, 10, 26, 81, -6, 6, 8, 26, 77, 14, 31, 37, 25, 78, 3, 21, 27, 28, 66, 32, 60, 65, 25, 79, 1, 17, 26, 26, 78, 16, 57, 64, 26, 78, 12, 51, 57, 26, 77, 7, 40, 49, 25, 77, -3, 10, 13, 26, 69, 2, 23, 29, 25, 72, 4, 27, 28, 26, 80, -9, 5, 7, 27, 77, -12, 5, 7, 26, 82, -2, 6, 8, 26, 82, -5, 7, 8, 25, 82, -3, 8, 10, 25, 77, 3, 22, 27, 26, 81, -3, 7, 8, 27, 72, 21, 44, 52, 25, 83, -3, 8, 10, 26, 81, 20, 59, 69, 26, 79, 11, 44, 53, 26, 78, -10, 5, 6, 26, 78, -11, 5, 6, 27, 73, -5, 16, 19, 26, 80, -8, 6, 8, 26, 79, -12, 6, 7, 27, 77, -14, 5, 7, 25, 84, 0, 9, 11, 24, 84, -2, 8, 10, 24, 85, -1, 9, 11, 25, 84, 1, 7, 9, 25, 84, 0, 7, 9, 25, 80, 9, 29, 41, 24, 84, -1, 8, 10, 25, 83, 11, 44, 53, 26, 80, -10, 6, 8, 26, 78, -11, 6, 8, 26, 77, -13, 6, 7, 27, 78, -13, 5, 6, 26, 80, -8, 6, 7, 26, 78, -12, 6, 8, 27, 76, -13, 6, 8],
            "solution": {
                "type": "dig",
                "spot": {"x": 2971, "y": 3414, "level": 0},
            }
        },
        {
            "id": 56,
            "type": "map",
            "tier": "easy",
            "image_url": "assets/Map_clue_Varrock_east_mine.webp",
            "text": ["X marks the spot at the end of a path north of a mine."],
            "ocr_data": [26, 78, 181, 26, 77, -3, 6, 8, 26, 77, -4, 8, 10, 25, 78, -3, 6, 7, 26, 80, 0, 5, 6, 25, 77, -1, 7, 8, 26, 77, -3, 7, 9, 26, 77, -4, 6, 8, 25, 80, -6, 7, 9, 25, 86, -5, 7, 8, 25, 79, 12, 39, 46, 26, 79, 10, 36, 43, 26, 82, -6, 4, 6, 25, 82, -5, 5, 7, 25, 85, -6, 6, 7, 26, 81, -7, 8, 10, 26, 78, -3, 7, 9, 25, 76, -7, 7, 9, 25, 79, -4, 5, 7, 26, 81, -1, 6, 8, 26, 79, -2, 7, 8, 26, 78, -6, 7, 8, 25, 78, -6, 6, 7, 24, 80, -7, 6, 8, 25, 80, -8, 5, 7, 26, 77, 25, 58, 68, 26, 77, 21, 54, 64, 26, 82, -6, 5, 6, 25, 79, -8, 5, 7, 25, 83, -9, 7, 8, 26, 80, -7, 6, 8, 25, 77, -5, 8, 10, 26, 78, -7, 6, 8, 26, 78, -6, 6, 7, 25, 82, -3, 5, 7, 26, 80, -6, 5, 6, 26, 79, -6, 5, 7, 26, 72, 9, 49, 55, 26, 71, 16, 95, 106, 25, 73, 6, 43, 49, 26, 71, 11, 50, 56, 26, 79, -1, 9, 13, 26, 79, -4, 5, 6, 26, 79, -6, 5, 7, 26, 80, -9, 6, 7, 26, 80, -8, 7, 8, 25, 78, -6, 5, 6, 25, 78, -6, 6, 8, 25, 77, -6, 4, 5, 26, 81, -6, 4, 6, 27, 81, -6, 9, 13, 26, 80, -7, 6, 8, 25, 76, 9, 48, 58, 25, 73, 10, 34, 53, 24, 74, 7, 19, 27, 25, 78, -5, 6, 8, 26, 77, 3, 23, 27, 26, 78, -1, 7, 9, 26, 80, -4, 6, 8, 25, 79, -8, 6, 8, 26, 79, -9, 5, 6, 25, 78, -3, 8, 10, 26, 78, -7, 6, 8, 25, 78, -8, 5, 6, 25, 80, -6, 6, 7, 27, 77, 13, 43, 49, 26, 77, 3, 87, 97, 26, 69, 16, 54, 74, 26, 63, 24, 39, 51, 25, 74, 7, 23, 31, 26, 64, 26, 36, 40, 25, 75, 12, 42, 48, 27, 79, -2, 7, 9, 25, 80, -4, 5, 6, 26, 81, -8, 6, 7, 26, 80, -11, 6, 7, 26, 77, -9, 5, 7, 25, 81, -7, 6, 7, 26, 78, -11, 6, 7, 26, 79, -8, 6, 8, 26, 75, 10, 43, 49, 26, 66, 17, 46, 53, 26, 70, 12, 60, 84, 26, 72, 7, 85, 103, 26, 76, -7, 10, 19, 25, 78, -6, 7, 8, 25, 76, 9, 50, 58, 27, 79, -5, 7, 11, 26, 80, -5, 5, 6, 26, 81, -8, 5, 6, 25, 80, -9, 6, 7, 26, 77, -9, 7, 9, 26, 78, -12, 7, 8, 25, 80, -9, 6, 8, 26, 78, -7, 7, 9, 26, 75, 10, 44, 51, 26, 65, 16, 39, 46, 26, 76, -6, 16, 25, 25, 76, -6, 15, 21, 26, 64, 31, 91, 107, 25, 71, 21, 31, 35, 26, 79, -1, 8, 12, 26, 79, 16, 73, 82, 25, 82, -1, 8, 11, 25, 80, -8, 5, 6, 26, 79, -10, 6, 7, 26, 79, -4, 6, 8, 26, 78, -12, 6, 7, 26, 78, -9, 6, 8, 25, 78, -5, 8, 9, 26, 76, 7, 43, 49, 27, 78, -11, 5, 7, 27, 70, 15, 25, 31, 26, 69, 17, 53, 62, 26, 79, 1, 14, 18, 26, 80, -4, 7, 9, 25, 82, -2, 6, 8, 26, 79, 3, 17, 28, 26, 80, 14, 23, 27, 26, 79, -9, 6, 7, 26, 81, -9, 6, 8, 26, 79, -2, 5, 6, 25, 80, -5, 6, 8, 26, 82, -8, 6, 8, 26, 82, -3, 9, 11, 26, 77, 7, 47, 55, 27, 76, -9, 11, 19, 27, 74, -2, 20, 24, 26, 71, 16, 23, 26, 25, 80, -5, 6, 7, 25, 76, 2, 17, 20, 26, 71, 16, 26, 32, 26, 75, 10, 28, 38, 26, 79, 12, 22, 25, 25, 79, -5, 5, 6, 26, 79, -10, 5, 6, 25, 81, -1, 7, 10, 25, 80, -3, 8, 10, 26, 81, -5, 6, 8, 25, 83, -2, 8, 10, 25, 80, -3, 6, 7, 26, 76, 15, 68, 78, 25, 79, -2, 10, 18, 26, 79, -6, 5, 7, 25, 79, -6, 6, 7, 26, 69, 16, 22, 26, 25, 61, 35, 46, 55, 26, 71, 5, 29, 41, 26, 77, 8, 23, 26, 26, 80, -8, 5, 7, 27, 77, -11, 5, 7, 26, 82, -1, 6, 8, 26, 82, -4, 7, 8, 25, 82, -2, 8, 10, 25, 80, -3, 7, 9, 26, 81, -2, 7, 8, 25, 81, -4, 6, 8, 26, 80, 16, 46, 54, 26, 80, 16, 43, 49, 26, 78, 11, 42, 49, 27, 75, 15, 42, 56, 27, 74, 14, 42, 55, 27, 75, 11, 47, 52, 26, 79, -1, 16, 20, 26, 79, -11, 6, 7, 27, 77, -13, 5, 7, 25, 84, 1, 9, 11, 24, 84, -1, 8, 10, 24, 85, 0, 9, 11, 25, 84, 2, 7, 9, 25, 84, 1, 7, 9, 25, 83, 0, 10, 12, 24, 84, 0, 8, 10, 25, 85, -2, 10, 12, 26, 80, -9, 6, 8, 26, 78, -10, 6, 8, 26, 77, -12, 6, 7, 27, 78, -12, 5, 6, 26, 80, -7, 6, 7, 26, 78, -11, 6, 8, 27, 76, -12, 6, 8],
            "solution": {
                "type": "dig",
                "spot": {"x": 3290, "y": 3373, "level": 0},
            }
        },
        {
            "id": 63,
            "type": "map",
            "tier": "easy",
            "image_url": "assets/Map_clue_Varrock_west_mine.png",
            "text": ["X marks the spot east of a tree near a small island on a river."],
            "ocr_data": [26, 77, 177, 26, 77, -7, 6, 8, 26, 77, -8, 8, 10, 25, 78, -7, 6, 7, 26, 80, -4, 5, 6, 25, 77, -5, 7, 8, 26, 77, -7, 7, 10, 26, 77, -8, 6, 8, 25, 80, -10, 7, 9, 25, 86, -9, 7, 8, 25, 82, -10, 6, 7, 26, 82, -8, 5, 6, 26, 82, -10, 4, 9, 25, 82, -9, 5, 7, 25, 85, -10, 6, 7, 26, 81, -11, 8, 10, 26, 78, -7, 7, 9, 25, 76, -11, 7, 9, 25, 79, -8, 5, 7, 26, 81, -5, 6, 8, 27, 75, 7, 28, 36, 29, 62, 37, 59, 69, 25, 77, -9, 7, 12, 27, 66, 32, 55, 62, 25, 80, -12, 5, 7, 26, 84, -8, 5, 7, 26, 72, 13, 38, 45, 26, 68, 17, 39, 46, 25, 79, -11, 6, 11, 25, 83, -13, 7, 8, 26, 80, -11, 6, 8, 25, 77, -9, 8, 10, 26, 78, -11, 6, 8, 26, 78, -10, 6, 7, 26, 81, -5, 10, 15, 28, 64, 34, 51, 60, 27, 75, -3, 19, 23, 26, 80, -11, 5, 6, 26, 75, 2, 30, 34, 25, 76, -4, 18, 22, 26, 75, -1, 22, 28, 26, 66, 27, 28, 37, 25, 62, 29, 31, 39, 26, 75, -2, 16, 19, 26, 80, -13, 6, 7, 26, 80, -12, 7, 8, 25, 78, -10, 5, 6, 25, 78, -10, 6, 8, 25, 77, -10, 4, 5, 26, 81, -10, 4, 6, 27, 80, -8, 11, 14, 26, 80, -11, 6, 8, 25, 84, -11, 7, 9, 25, 77, -6, 19, 23, 24, 65, 27, 33, 39, 25, 72, 4, 20, 28, 26, 78, -7, 7, 9, 26, 77, -3, 9, 16, 26, 80, -8, 6, 8, 25, 79, -12, 6, 8, 26, 79, -13, 5, 6, 25, 78, -7, 8, 10, 26, 78, -11, 6, 8, 25, 78, -12, 5, 6, 25, 80, -10, 6, 7, 26, 80, -10, 6, 7, 26, 80, -11, 6, 8, 26, 81, -14, 5, 7, 26, 77, -16, 5, 7, 26, 71, 9, 21, 24, 26, 71, 5, 21, 24, 25, 77, -8, 6, 8, 27, 79, -6, 7, 9, 25, 80, -8, 5, 6, 26, 81, -12, 6, 7, 26, 80, -15, 6, 7, 26, 77, -13, 5, 7, 25, 81, -11, 6, 7, 26, 78, -15, 6, 7, 26, 79, -11, 7, 13, 29, 63, 33, 40, 53, 26, 78, -14, 5, 6, 25, 79, -2, 31, 40, 26, 79, -13, 7, 11, 26, 76, -12, 7, 8, 25, 78, -10, 7, 8, 25, 78, -11, 7, 9, 27, 79, -9, 7, 9, 26, 80, -9, 5, 6, 26, 81, -12, 5, 6, 25, 80, -13, 6, 7, 26, 77, -13, 7, 9, 26, 78, -16, 7, 8, 25, 80, -13, 6, 8, 26, 78, -11, 7, 11, 26, 70, 9, 41, 53, 26, 66, 11, 127, 130, 26, 71, 30, 106, 124, 26, 73, 9, 25, 31, 26, 75, 4, 21, 25, 25, 81, -6, 9, 14, 26, 79, -6, 8, 10, 26, 82, -4, 7, 8, 25, 82, -6, 8, 9, 25, 80, -12, 5, 6, 26, 79, -14, 6, 7, 26, 79, -8, 6, 8, 26, 78, -16, 6, 7, 26, 76, -4, 24, 29, 26, 69, 30, 49, 60, 26, 77, -10, 9, 16, 27, 69, 23, 44, 54, 27, 71, 29, 50, 60, 26, 77, 9, 33, 41, 26, 75, 19, 35, 40, 26, 70, 33, 53, 63, 26, 73, 27, 40, 49, 26, 80, -5, 7, 11, 25, 83, -7, 6, 7, 26, 79, -13, 6, 7, 26, 81, -13, 6, 8, 26, 79, -6, 5, 6, 25, 80, -9, 6, 8, 26, 82, -12, 6, 8, 26, 81, -1, 18, 26, 26, 69, 32, 61, 71, 27, 73, -3, 24, 31, 27, 75, -4, 22, 29, 27, 64, 50, 74, 86, 26, 67, 41, 63, 75, 26, 75, 7, 28, 35, 26, 77, 6, 26, 34, 27, 67, 56, 56, 63, 26, 72, 35, 39, 47, 25, 79, -9, 5, 6, 26, 79, -14, 5, 6, 25, 81, -5, 7, 10, 25, 80, -7, 8, 10, 26, 80, -7, 12, 18, 25, 83, -6, 8, 13, 25, 80, -7, 6, 7, 26, 79, -9, 6, 7, 25, 78, 0, 21, 28, 26, 66, 45, 75, 92, 26, 66, 36, 77, 87, 26, 72, 19, 46, 55, 25, 79, -10, 5, 6, 27, 70, 33, 27, 31, 26, 75, 19, 35, 55, 26, 80, -12, 5, 7, 27, 77, -15, 5, 7, 26, 82, -5, 6, 8, 26, 82, -8, 7, 8, 25, 80, 4, 17, 21, 26, 70, 34, 52, 61, 27, 71, 33, 47, 54, 26, 71, 31, 52, 61, 25, 81, 4, 28, 39, 25, 83, -6, 7, 21, 26, 80, -6, 14, 29, 26, 71, 22, 44, 54, 26, 68, 30, 58, 66, 27, 68, 32, 41, 52, 26, 74, 24, 27, 33, 26, 79, -15, 6, 7, 27, 77, -17, 5, 7, 25, 84, -3, 9, 11, 24, 84, -5, 8, 10, 24, 85, -4, 9, 11, 25, 84, -2, 7, 9, 25, 84, -3, 7, 9, 25, 82, 2, 16, 21, 25, 75, 26, 24, 30, 25, 74, 34, 28, 42, 26, 72, 25, 26, 36, 26, 76, -6, 15, 21, 26, 77, -16, 6, 7, 27, 78, -16, 5, 6, 26, 80, -11, 6, 7, 26, 78, -15, 6, 8, 27, 76, -16, 6, 8],
            "solution": {
                "type": "dig",
                "spot": {"x": 3166, "y": 3360, "level": 0},
            }
        },
        {
            "id": 44,
            "type": "map",
            "tier": "medium",
            "image_url": "assets/Map_clue_Clock_Tower.png",
            "text": ["A crate near a bridge over a river."],
            "ocr_data": [26, 78, 174, 26, 77, -10, 6, 8, 26, 77, -11, 8, 10, 25, 78, -10, 6, 7, 26, 80, -7, 5, 6, 25, 77, -8, 7, 8, 26, 77, -10, 7, 9, 26, 77, -9, 10, 15, 25, 76, 11, 21, 24, 26, 76, 29, 24, 34, 26, 79, 2, 18, 23, 26, 82, -11, 5, 6, 26, 82, -13, 4, 6, 25, 82, -12, 5, 7, 25, 85, -13, 6, 7, 26, 81, -14, 8, 10, 26, 78, -10, 7, 9, 25, 76, -14, 7, 9, 25, 79, -11, 5, 7, 26, 81, -8, 6, 8, 26, 79, -9, 7, 8, 26, 76, -3, 17, 22, 27, 69, 41, 63, 74, 25, 76, 18, 74, 92, 25, 78, -2, 29, 55, 26, 76, 29, 55, 63, 26, 74, 33, 50, 60, 26, 74, 26, 23, 33, 26, 71, 26, 23, 34, 26, 82, -10, 18, 23, 26, 80, -14, 6, 8, 25, 77, -12, 8, 10, 26, 78, -14, 6, 8, 26, 78, -13, 6, 7, 25, 82, -10, 5, 7, 27, 77, 14, 42, 51, 27, 71, 36, 52, 64, 26, 79, -7, 13, 28, 26, 70, 33, 48, 59, 26, 70, 39, 54, 70, 26, 76, 5, 33, 41, 26, 80, -1, 49, 55, 26, 78, 1, 27, 48, 26, 73, 17, 40, 66, 26, 79, -9, 15, 19, 26, 80, -15, 7, 8, 25, 78, -13, 5, 6, 25, 78, -13, 6, 8, 25, 77, -13, 4, 5, 26, 77, 4, 21, 25, 27, 72, 46, 79, 102, 27, 79, 6, 45, 51, 26, 81, 5, 36, 42, 26, 72, 17, 24, 29, 24, 80, -11, 7, 12, 26, 69, 36, 52, 60, 27, 70, 38, 60, 67, 27, 68, 40, 70, 81, 26, 72, 26, 29, 35, 25, 78, -12, 10, 13, 26, 79, -16, 5, 6, 25, 78, -10, 8, 10, 26, 78, -14, 6, 8, 25, 78, -15, 5, 8, 26, 72, 37, 58, 70, 27, 78, 8, 36, 55, 27, 74, 18, 51, 58, 27, 69, 41, 65, 75, 26, 75, -6, 17, 21, 26, 76, 24, 76, 94, 27, 75, 24, 85, 107, 25, 76, 5, 45, 55, 27, 79, -9, 7, 9, 25, 80, -11, 5, 6, 26, 81, -15, 6, 7, 26, 80, -18, 6, 7, 26, 77, -16, 5, 7, 25, 81, -14, 6, 7, 26, 75, 5, 39, 45, 26, 75, 11, 38, 44, 26, 73, 13, 44, 57, 26, 75, 4, 45, 54, 25, 80, -15, 7, 11, 26, 78, -1, 44, 52, 26, 76, -10, 14, 24, 26, 77, -8, 16, 25, 26, 76, 24, 85, 104, 27, 79, -12, 7, 9, 26, 80, -12, 5, 6, 26, 81, -15, 5, 6, 25, 80, -16, 6, 7, 26, 77, -16, 7, 9, 26, 78, -19, 7, 8, 25, 80, -16, 6, 8, 26, 78, -14, 7, 9, 27, 67, 43, 61, 72, 26, 76, -15, 11, 16, 28, 64, 25, 36, 42, 27, 71, 26, 70, 80, 26, 78, -13, 7, 9, 25, 81, -10, 8, 10, 26, 77, 16, 60, 70, 26, 82, -7, 7, 8, 25, 82, -9, 8, 9, 25, 80, -15, 5, 6, 26, 79, -17, 6, 7, 26, 79, -11, 6, 8, 26, 78, -19, 6, 7, 26, 78, -16, 6, 8, 26, 71, 22, 49, 60, 26, 73, 11, 24, 30, 27, 77, -17, 7, 18, 31, 55, 80, 41, 58, 28, 71, 47, 75, 84, 26, 79, 12, 53, 58, 26, 78, 8, 43, 48, 26, 79, 17, 56, 66, 26, 80, -8, 7, 15, 25, 83, -10, 6, 7, 26, 79, -16, 6, 7, 26, 81, -16, 6, 8, 26, 79, -9, 5, 6, 25, 80, -12, 6, 8, 26, 79, -3, 25, 32, 26, 69, 38, 48, 58, 26, 79, -15, 6, 8, 27, 76, -20, 6, 7, 27, 75, 4, 53, 60, 26, 79, 8, 47, 55, 26, 78, 10, 44, 51, 26, 78, 7, 43, 48, 26, 78, 11, 48, 57, 26, 78, 13, 50, 64, 26, 81, -11, 4, 6, 25, 79, -12, 5, 6, 26, 79, -17, 5, 6, 25, 81, -8, 7, 10, 25, 80, -10, 8, 10, 26, 79, -5, 15, 20, 25, 82, -6, 13, 16, 25, 80, -10, 6, 7, 26, 79, -12, 6, 7, 26, 78, 8, 44, 50, 26, 79, -8, 20, 27, 26, 76, 26, 89, 99, 26, 78, -13, 6, 7, 26, 77, 7, 43, 49, 26, 75, 3, 44, 49, 26, 79, -14, 4, 5, 26, 80, -15, 5, 7, 27, 77, -18, 5, 7, 26, 82, -8, 6, 8, 26, 82, -11, 7, 8, 25, 82, -9, 8, 10, 25, 80, -10, 7, 9, 26, 81, -9, 7, 8, 25, 81, -11, 6, 8, 26, 81, 10, 44, 49, 26, 81, 14, 53, 60, 26, 79, 6, 44, 49, 26, 77, 8, 54, 62, 27, 76, 4, 48, 57, 27, 75, 6, 63, 69, 26, 80, -14, 6, 8, 26, 79, -18, 6, 7, 27, 77, -20, 5, 7, 25, 84, -6, 9, 11, 24, 84, -8, 8, 10, 24, 85, -7, 9, 11, 25, 84, -5, 7, 9, 25, 84, -6, 7, 9, 25, 83, -7, 10, 12, 24, 84, -7, 8, 10, 25, 84, -5, 23, 27, 26, 80, -16, 6, 8, 26, 78, -13, 20, 24, 26, 77, -12, 29, 33, 27, 78, -19, 5, 6, 26, 80, -14, 6, 7, 26, 78, -18, 6, 8, 27, 76, -19, 6, 8],
            "solution": {
                "type": "search",
                "spot": {"x": 2565, "y": 3248, "level": 0},
                "entity": "Crate"
            }
        },
        {
            "id": 45,
            "type": "map",
            "tier": "medium",
            "image_url": "assets/Map_clue_McGrubor's_Wood.png",
            "text": ["A crate in the woods directly next to a building."],
            "ocr_data": [26, 78, 180, 26, 77, -4, 6, 8, 26, 77, -5, 8, 10, 25, 78, -4, 6, 7, 26, 80, -1, 5, 6, 25, 77, -2, 7, 8, 26, 77, -1, 18, 23, 26, 76, -2, 13, 17, 25, 80, -6, 10, 14, 25, 85, -3, 11, 15, 25, 82, -7, 6, 7, 26, 82, -5, 5, 6, 26, 82, -5, 10, 15, 25, 82, -6, 5, 7, 25, 85, -7, 6, 7, 26, 81, -8, 8, 10, 26, 78, -4, 7, 9, 25, 76, -8, 7, 9, 25, 79, -5, 5, 7, 26, 81, -2, 6, 8, 26, 79, -3, 7, 8, 26, 79, 7, 49, 56, 28, 68, 31, 57, 67, 25, 77, 7, 24, 37, 26, 77, 2, 21, 27, 27, 77, 14, 42, 50, 26, 82, 7, 37, 46, 28, 77, 20, 52, 65, 25, 79, -9, 5, 7, 25, 83, -10, 7, 8, 26, 80, -8, 6, 8, 25, 77, -6, 8, 10, 26, 78, -8, 6, 8, 26, 78, -7, 6, 7, 26, 80, 2, 15, 22, 27, 76, 5, 24, 30, 28, 74, 21, 58, 66, 26, 80, 4, 40, 49, 26, 79, -3, 11, 18, 25, 78, -5, 14, 18, 27, 73, 23, 57, 66, 26, 81, 4, 32, 40, 26, 76, 5, 24, 34, 26, 77, -1, 17, 21, 26, 80, -10, 6, 7, 26, 80, -9, 7, 8, 25, 78, -7, 5, 6, 25, 78, -7, 6, 8, 25, 77, -7, 4, 5, 26, 81, -7, 4, 7, 27, 81, -7, 8, 10, 26, 78, -2, 21, 24, 27, 81, 20, 56, 65, 26, 79, -3, 19, 24, 24, 80, -5, 7, 8, 26, 80, 7, 37, 41, 27, 74, 13, 28, 33, 27, 77, 3, 17, 21, 27, 74, 16, 42, 46, 25, 79, -9, 6, 8, 26, 79, -10, 5, 6, 25, 78, -4, 8, 10, 26, 78, -8, 6, 8, 26, 77, -6, 13, 17, 27, 74, 18, 41, 50, 27, 76, 8, 28, 33, 26, 80, -8, 6, 8, 26, 80, 8, 45, 56, 26, 77, -12, 6, 12, 25, 79, -7, 6, 8, 27, 77, 16, 52, 59, 25, 75, -1, 13, 20, 27, 79, -3, 7, 10, 25, 80, -5, 5, 6, 26, 81, -9, 6, 7, 26, 80, -12, 6, 7, 26, 77, -10, 5, 7, 25, 81, -8, 6, 7, 26, 78, -12, 6, 7, 26, 78, -6, 13, 18, 26, 75, -3, 21, 27, 27, 75, 4, 28, 34, 26, 82, 12, 54, 62, 26, 80, 3, 32, 48, 27, 78, 6, 48, 63, 27, 77, 26, 82, 94, 26, 74, 6, 24, 33, 28, 74, 12, 27, 33, 26, 80, -6, 5, 7, 26, 81, -9, 5, 6, 25, 80, -10, 6, 7, 26, 77, -10, 7, 9, 26, 78, -13, 7, 8, 25, 80, -10, 6, 8, 27, 73, 8, 30, 41, 26, 76, -4, 14, 17, 27, 74, -3, 21, 28, 26, 80, 0, 39, 46, 25, 77, -9, 8, 11, 26, 79, 7, 55, 61, 26, 83, 22, 51, 62, 26, 77, 4, 25, 32, 26, 79, 8, 25, 34, 25, 82, -2, 8, 9, 25, 80, -9, 5, 6, 26, 79, -11, 6, 7, 26, 79, -5, 6, 8, 26, 78, -13, 6, 7, 26, 77, -9, 9, 13, 27, 74, 10, 32, 37, 27, 74, 7, 31, 37, 27, 74, 2, 31, 37, 27, 82, 1, 44, 51, 26, 81, -2, 23, 31, 26, 81, 2, 21, 31, 26, 81, 7, 48, 55, 26, 76, 15, 36, 42, 26, 80, -2, 7, 9, 26, 81, 1, 14, 18, 26, 79, -10, 6, 7, 26, 81, -10, 6, 8, 26, 79, -3, 5, 6, 25, 80, -6, 6, 8, 26, 82, -9, 6, 8, 26, 81, -1, 15, 19, 26, 78, -5, 20, 23, 27, 76, -11, 14, 18, 28, 72, 10, 35, 41, 26, 82, 2, 33, 39, 28, 71, 41, 70, 80, 28, 73, 31, 47, 54, 26, 77, 8, 20, 25, 26, 80, -5, 5, 8, 27, 76, 10, 28, 34, 25, 79, -6, 5, 6, 26, 79, -11, 5, 6, 25, 81, -2, 7, 10, 25, 80, -4, 8, 10, 26, 81, -6, 6, 9, 26, 77, 15, 43, 48, 25, 80, -1, 14, 17, 28, 73, 16, 35, 41, 26, 76, 8, 33, 40, 27, 76, 7, 26, 35, 29, 69, 45, 56, 64, 29, 76, 37, 44, 52, 26, 74, 9, 32, 36, 28, 71, 12, 39, 43, 26, 79, -8, 4, 5, 26, 80, -9, 5, 7, 27, 77, -12, 5, 7, 26, 82, -2, 6, 8, 26, 82, -5, 7, 8, 25, 82, -3, 8, 10, 26, 78, 3, 17, 28, 27, 77, 11, 27, 34, 26, 80, -1, 13, 16, 26, 82, 0, 14, 19, 27, 77, 14, 29, 38, 26, 79, 0, 14, 22, 28, 74, 9, 27, 33, 27, 77, -7, 13, 17, 27, 75, -6, 22, 25, 26, 80, -8, 6, 8, 26, 79, -12, 6, 7, 27, 77, -14, 5, 7, 25, 84, 0, 9, 11, 24, 84, -2, 8, 10, 24, 85, -1, 9, 11, 25, 84, 1, 7, 9, 25, 84, 0, 7, 9, 25, 83, -1, 10, 12, 24, 84, -1, 8, 10, 25, 83, 1, 18, 26, 26, 80, -10, 6, 8, 26, 76, -5, 22, 27, 26, 77, -13, 6, 7, 27, 78, -13, 5, 6, 26, 80, -8, 6, 7, 26, 78, -12, 6, 8, 27, 76, -13, 6, 8],
            "solution": {
                "type": "search",
                "spot": {"x": 2658, "y": 3489, "level": 0},
                "entity": "Crate"
            }
        },
        {
            "id": 48,
            "type": "map",
            "tier": "medium",
            "image_url": "assets/Map_clue_Ourania_chaos_altar.png",
            "text": ["X marks the spot between lava lakes."],
            "ocr_data": [25, 89, 175, 26, 77, -9, 6, 8, 26, 77, -10, 8, 10, 25, 78, -9, 6, 7, 26, 80, -6, 5, 6, 25, 77, -7, 7, 8, 26, 77, -9, 7, 9, 26, 76, -7, 23, 36, 25, 78, -1, 47, 58, 25, 86, -11, 7, 8, 25, 82, -12, 6, 7, 26, 82, -10, 5, 6, 26, 82, -12, 4, 6, 25, 82, -11, 5, 7, 25, 85, -12, 6, 7, 26, 81, -13, 8, 10, 26, 78, -9, 7, 9, 25, 76, -13, 7, 9, 25, 79, -10, 5, 7, 26, 81, -7, 6, 8, 26, 79, -8, 7, 8, 26, 78, -12, 7, 8, 26, 77, 4, 50, 68, 24, 106, 29, 45, 59, 25, 84, 3, 43, 50, 26, 83, -8, 11, 14, 26, 83, -8, 6, 8, 26, 82, -12, 5, 6, 25, 79, -14, 5, 7, 25, 83, -15, 7, 8, 26, 80, -13, 6, 8, 25, 77, -11, 8, 10, 26, 78, -13, 6, 8, 26, 78, -12, 6, 7, 25, 82, -9, 5, 7, 26, 80, -12, 5, 6, 27, 79, -1, 47, 54, 26, 80, -11, 8, 19, 25, 112, 35, 47, 55, 25, 91, 10, 33, 41, 26, 79, -12, 5, 7, 26, 81, -9, 6, 7, 26, 79, -10, 5, 6, 26, 79, -12, 5, 7, 26, 80, -15, 6, 7, 26, 80, -14, 7, 8, 25, 78, -12, 5, 6, 25, 78, -12, 6, 8, 25, 77, -12, 4, 5, 26, 81, -12, 4, 6, 27, 81, -10, 17, 24, 27, 81, 3, 43, 54, 25, 104, 12, 31, 36, 22, 200, 55, 4, 6, 22, 187, 54, 17, 24, 25, 83, 3, 27, 46, 26, 78, -9, 7, 9, 26, 78, -7, 7, 9, 26, 80, -10, 6, 8, 25, 79, -14, 6, 8, 26, 79, -15, 5, 6, 25, 78, -9, 8, 10, 26, 78, -13, 6, 8, 25, 78, -14, 5, 6, 25, 80, -12, 6, 7, 27, 72, 18, 107, 132, 27, 79, 6, 60, 70, 25, 100, 14, 28, 32, 22, 187, 63, 2, 3, 22, 188, 62, 2, 3, 24, 129, 44, 55, 60, 25, 77, -10, 6, 10, 27, 79, -8, 7, 9, 25, 80, -10, 5, 6, 26, 81, -14, 6, 7, 26, 80, -17, 6, 7, 26, 77, -15, 5, 7, 25, 81, -13, 6, 7, 26, 78, -17, 6, 7, 26, 79, -14, 6, 8, 26, 72, 1, 46, 59, 26, 78, -1, 40, 45, 26, 83, 3, 45, 52, 24, 124, 46, 83, 95, 22, 171, 67, 13, 22, 22, 181, 66, 3, 4, 23, 126, 39, 46, 53, 27, 79, -10, 8, 13, 26, 80, -11, 5, 6, 26, 81, -14, 5, 6, 25, 80, -15, 6, 7, 26, 77, -15, 7, 9, 26, 78, -18, 7, 8, 25, 80, -15, 6, 8, 26, 78, -13, 7, 9, 26, 77, -13, 6, 8, 26, 77, 0, 41, 47, 26, 78, -1, 41, 46, 26, 72, 20, 101, 114, 23, 136, 58, 31, 42, 22, 171, 73, 2, 3, 22, 167, 67, 9, 12, 25, 90, 9, 42, 47, 25, 82, -8, 8, 9, 25, 80, -14, 5, 6, 26, 79, -16, 6, 7, 26, 79, -10, 6, 8, 26, 78, -18, 6, 7, 26, 78, -15, 6, 8, 25, 78, -11, 8, 9, 26, 81, -8, 18, 26, 27, 77, 1, 61, 71, 26, 89, 9, 51, 61, 26, 89, 8, 38, 44, 25, 93, 12, 32, 38, 23, 150, 58, 37, 47, 24, 115, 21, 19, 24, 26, 80, -7, 7, 9, 25, 83, -9, 6, 7, 26, 79, -15, 6, 7, 26, 81, -15, 6, 8, 26, 79, -8, 5, 6, 25, 80, -11, 6, 8, 26, 82, -14, 6, 8, 26, 82, -9, 9, 11, 24, 128, 27, 29, 36, 24, 111, 69, 98, 116, 24, 118, 58, 81, 98, 25, 105, 17, 32, 38, 26, 80, 18, 82, 92, 26, 80, 0, 24, 37, 26, 80, 1, 20, 33, 26, 78, -1, 47, 61, 26, 81, -9, 4, 7, 25, 79, -11, 5, 6, 26, 79, -16, 5, 6, 25, 81, -7, 7, 10, 25, 80, -9, 8, 10, 26, 81, -11, 6, 8, 25, 83, -8, 8, 10, 25, 95, 8, 29, 34, 22, 181, 58, 18, 27, 22, 186, 58, 16, 24, 25, 92, 8, 32, 40, 26, 80, 13, 65, 77, 26, 78, -9, 13, 16, 25, 79, -12, 5, 6, 27, 71, 2, 56, 70, 26, 79, -13, 4, 5, 26, 80, -14, 5, 7, 27, 77, -17, 5, 7, 26, 82, -7, 6, 8, 26, 82, -10, 7, 8, 25, 82, -8, 8, 10, 25, 80, -9, 7, 9, 26, 80, -6, 17, 22, 25, 88, 27, 105, 116, 25, 96, 11, 28, 33, 25, 83, -8, 7, 9, 26, 81, -12, 6, 7, 26, 76, -4, 52, 59, 27, 75, -3, 49, 64, 27, 77, -18, 5, 6, 26, 80, -13, 6, 8, 26, 79, -17, 6, 7, 27, 77, -19, 5, 7, 25, 84, -5, 9, 11, 24, 84, -7, 8, 10, 24, 85, -6, 9, 11, 25, 84, -4, 7, 9, 25, 84, -5, 7, 9, 25, 81, -1, 21, 24, 24, 84, -6, 8, 10, 25, 85, -8, 10, 12, 26, 80, -15, 6, 8, 26, 77, -14, 11, 14, 26, 76, -16, 10, 14, 27, 78, -18, 5, 6, 26, 80, -13, 6, 7, 26, 78, -17, 6, 8, 27, 76, -18, 6, 8],
            "solution": {
                "type": "dig",
                "spot": {"x": 2454, "y": 3230, "level": 0},
            }
        },
        {
            "id": 51,
            "type": "map",
            "tier": "medium",
            "image_url": "assets/Map_clue_Chemist's_house.png",
            "text": ["X marks the spot next to a building at the coast."],
            "ocr_data": [26, 78, 178, 26, 77, -6, 6, 8, 26, 77, -7, 8, 10, 25, 78, -6, 6, 7, 26, 80, -1, 8, 13, 26, 73, 17, 36, 44, 26, 77, -6, 7, 12, 26, 77, -7, 6, 8, 25, 80, -9, 7, 9, 25, 86, -8, 7, 8, 25, 82, -9, 6, 7, 26, 82, -7, 5, 6, 26, 82, -9, 4, 6, 25, 82, -8, 5, 7, 25, 85, -9, 6, 7, 26, 81, -10, 8, 10, 26, 78, -6, 7, 9, 25, 76, -10, 7, 9, 25, 79, -7, 5, 7, 26, 81, -3, 8, 11, 27, 73, 22, 22, 27, 27, 68, 47, 65, 76, 25, 78, -9, 6, 8, 26, 71, 19, 49, 53, 27, 71, 21, 55, 61, 26, 84, -7, 5, 6, 26, 83, -5, 6, 8, 26, 82, -9, 5, 6, 25, 79, -11, 5, 7, 25, 83, -12, 7, 8, 26, 80, -10, 6, 8, 25, 77, -8, 8, 10, 26, 78, -10, 6, 8, 26, 78, -9, 6, 7, 25, 82, -6, 5, 7, 26, 80, -9, 5, 6, 26, 76, 8, 19, 25, 27, 74, 29, 55, 64, 26, 77, 0, 27, 30, 27, 69, 22, 54, 66, 26, 76, 3, 27, 34, 26, 81, -6, 6, 7, 26, 79, -7, 5, 6, 26, 79, -9, 5, 7, 26, 80, -12, 6, 7, 26, 80, -11, 7, 8, 25, 78, -9, 5, 6, 25, 78, -9, 6, 8, 25, 77, -9, 4, 5, 26, 81, -9, 4, 6, 27, 81, -10, 6, 7, 26, 80, -10, 6, 8, 26, 75, 29, 35, 46, 25, 77, 7, 35, 46, 27, 67, 30, 53, 68, 27, 68, 25, 56, 62, 26, 78, -6, 7, 9, 26, 78, -4, 7, 9, 26, 80, -7, 6, 8, 25, 79, -11, 6, 8, 26, 79, -12, 5, 6, 25, 78, -6, 8, 10, 26, 78, -10, 6, 8, 25, 78, -11, 5, 6, 25, 80, -9, 6, 7, 26, 80, -9, 6, 7, 26, 80, -10, 6, 8, 26, 79, -3, 20, 27, 27, 71, 28, 42, 47, 26, 78, -7, 11, 14, 26, 78, -10, 6, 8, 25, 77, -7, 6, 8, 27, 79, -5, 7, 9, 25, 80, -7, 5, 6, 26, 81, -11, 6, 7, 26, 80, -14, 6, 7, 26, 77, -12, 5, 7, 25, 81, -10, 6, 7, 26, 78, -14, 6, 8, 26, 78, -3, 43, 48, 26, 76, -4, 42, 46, 26, 78, -13, 5, 6, 26, 72, 38, 60, 69, 26, 78, 2, 32, 40, 27, 75, 13, 48, 62, 25, 77, -7, 12, 21, 25, 78, -10, 7, 17, 27, 79, -8, 7, 18, 26, 80, -8, 5, 14, 26, 81, -11, 5, 6, 25, 80, -12, 6, 7, 26, 77, -12, 7, 9, 26, 78, -15, 7, 8, 25, 80, -12, 6, 8, 26, 78, -10, 7, 9, 26, 77, -10, 6, 8, 26, 75, -7, 17, 24, 26, 70, 36, 44, 51, 25, 76, 5, 42, 52, 26, 77, 4, 22, 42, 26, 79, 25, 42, 71, 26, 78, 15, 25, 41, 26, 80, 16, 25, 40, 26, 80, 26, 56, 71, 25, 80, -11, 5, 6, 26, 79, -13, 6, 7, 26, 79, -7, 6, 8, 26, 78, -15, 6, 7, 26, 78, -12, 6, 8, 25, 78, -8, 8, 11, 26, 78, -11, 6, 10, 27, 76, 0, 21, 26, 27, 74, 26, 40, 45, 26, 70, 62, 123, 140, 26, 77, 31, 58, 73, 26, 80, -2, 14, 21, 25, 82, -5, 6, 8, 26, 80, 2, 23, 29, 26, 80, 23, 60, 76, 26, 79, -12, 6, 7, 26, 81, -12, 6, 8, 26, 79, -5, 5, 6, 25, 80, -8, 6, 8, 26, 82, -11, 7, 9, 26, 82, 1, 43, 47, 26, 79, -3, 41, 46, 27, 76, -7, 44, 51, 27, 69, 39, 63, 75, 26, 81, -7, 14, 25, 26, 78, 12, 43, 49, 26, 78, 11, 42, 48, 26, 79, 13, 42, 48, 26, 79, 12, 41, 46, 26, 79, 13, 43, 48, 25, 79, -8, 5, 6, 26, 79, -13, 5, 6, 25, 81, -4, 7, 10, 25, 80, -6, 8, 10, 26, 81, -8, 6, 8, 25, 83, -5, 8, 10, 25, 80, -6, 6, 7, 26, 79, -8, 6, 7, 25, 77, 6, 17, 20, 26, 70, 40, 44, 55, 26, 70, 41, 56, 65, 26, 71, 28, 39, 45, 26, 75, 9, 31, 38, 26, 76, -14, 4, 5, 27, 72, 14, 33, 39, 26, 79, -8, 13, 17, 27, 77, -14, 5, 7, 26, 82, -4, 6, 8, 26, 82, -7, 7, 8, 25, 82, -5, 8, 10, 25, 80, -6, 7, 9, 26, 81, -5, 7, 8, 25, 81, -4, 18, 21, 25, 82, 5, 53, 58, 25, 83, -1, 23, 26, 26, 81, -9, 6, 9, 26, 76, 0, 20, 24, 27, 70, 24, 31, 41, 27, 68, 38, 59, 65, 26, 68, 35, 68, 79, 26, 79, -14, 6, 7, 27, 77, -16, 5, 7, 25, 84, -2, 9, 11, 24, 84, -4, 8, 10, 24, 85, -3, 9, 11, 25, 84, -1, 7, 9, 25, 84, -2, 7, 9, 25, 83, -3, 10, 12, 24, 84, -3, 8, 10, 25, 85, -5, 10, 12, 26, 80, -12, 6, 8, 26, 78, -13, 6, 8, 26, 77, -15, 6, 7, 27, 78, -15, 5, 6, 26, 72, 21, 29, 39, 26, 75, 4, 32, 38, 27, 76, -15, 6, 8],
            "solution": {
                "type": "dig",
                "spot": {"x": 2923, "y": 3210, "level": 0},
            }
        },
        {
            "id": 52,
            "type": "map",
            "tier": "medium",
            "image_url": "assets/Map_clue_Miscellania.png",
            "text": ["X marks the spot between some trees at the end of a path."],
            "ocr_data": [26, 79, 180, 26, 77, -4, 6, 8, 26, 77, -5, 8, 10, 25, 78, -4, 6, 7, 26, 80, -1, 5, 6, 25, 77, -2, 7, 8, 26, 77, -4, 7, 9, 26, 77, -5, 6, 8, 25, 80, -7, 7, 9, 25, 86, -6, 7, 8, 25, 82, -7, 6, 7, 26, 82, -5, 5, 6, 26, 82, -7, 4, 6, 25, 82, -6, 5, 7, 25, 85, -7, 6, 7, 26, 81, -8, 8, 10, 26, 78, -4, 7, 9, 25, 76, -8, 7, 9, 25, 79, -3, 11, 16, 26, 81, 2, 13, 21, 26, 79, -3, 7, 8, 26, 78, -7, 7, 8, 25, 78, -7, 6, 7, 25, 80, 6, 26, 32, 27, 78, 17, 33, 38, 26, 84, -5, 5, 6, 26, 83, -3, 6, 12, 27, 80, 14, 34, 42, 25, 79, -9, 5, 7, 25, 83, -10, 7, 8, 26, 80, -8, 6, 8, 25, 77, -6, 8, 10, 26, 78, -8, 6, 8, 26, 78, -4, 17, 23, 26, 81, 13, 52, 58, 27, 79, 7, 43, 49, 27, 78, 5, 24, 29, 27, 78, 15, 31, 35, 26, 80, 3, 22, 32, 26, 78, 18, 39, 46, 26, 79, -7, 5, 7, 26, 80, 0, 16, 22, 27, 75, 42, 62, 67, 26, 79, -7, 5, 7, 26, 80, -10, 6, 7, 26, 80, -9, 7, 8, 25, 78, -7, 5, 6, 25, 78, -7, 6, 8, 25, 77, -3, 11, 25, 27, 79, 12, 42, 57, 27, 80, 9, 56, 63, 27, 79, 3, 25, 34, 26, 80, 19, 41, 48, 25, 80, -11, 6, 8, 24, 80, -5, 7, 8, 25, 78, -6, 6, 8, 26, 78, -4, 7, 9, 26, 78, -2, 7, 9, 26, 80, -5, 6, 8, 25, 79, -9, 6, 8, 26, 79, -10, 5, 6, 25, 78, -4, 8, 10, 26, 78, -8, 6, 8, 25, 78, -9, 5, 6, 26, 79, 22, 62, 83, 26, 80, -7, 6, 7, 26, 80, -8, 6, 8, 26, 81, -11, 5, 7, 26, 77, -6, 18, 23, 26, 78, 8, 27, 32, 26, 78, -8, 6, 8, 25, 77, -5, 6, 8, 27, 79, -3, 7, 9, 25, 80, -5, 5, 6, 26, 81, -9, 6, 7, 26, 80, -12, 6, 7, 26, 77, -10, 5, 7, 25, 81, -8, 6, 7, 26, 78, -12, 6, 7, 26, 78, 21, 63, 85, 26, 77, -10, 6, 7, 27, 77, 15, 42, 49, 25, 77, 18, 59, 73, 26, 73, 35, 98, 119, 27, 75, 28, 45, 52, 25, 78, -7, 7, 8, 25, 78, -8, 7, 9, 27, 79, -6, 7, 9, 26, 80, -6, 5, 6, 26, 81, -9, 5, 6, 25, 80, -10, 6, 7, 26, 77, -10, 7, 9, 26, 78, -13, 7, 8, 25, 80, -10, 6, 8, 27, 77, 16, 62, 75, 26, 76, 13, 60, 66, 28, 75, 36, 64, 73, 26, 77, 2, 31, 47, 25, 61, 31, 149, 169, 26, 78, -7, 7, 9, 25, 81, -4, 8, 10, 26, 79, -2, 8, 17, 27, 78, 26, 36, 40, 26, 79, 17, 32, 36, 25, 80, -9, 5, 6, 26, 79, -11, 6, 7, 26, 79, -5, 6, 8, 26, 78, -13, 6, 7, 26, 78, -10, 6, 8, 26, 77, 10, 44, 50, 26, 78, 5, 41, 48, 27, 78, -12, 5, 7, 27, 81, -11, 6, 11, 26, 61, 31, 157, 169, 26, 70, 17, 120, 144, 26, 77, 5, 48, 70, 29, 75, 55, 54, 72, 26, 79, 9, 28, 34, 26, 82, 5, 25, 31, 26, 79, -10, 6, 7, 26, 81, -10, 6, 8, 26, 79, -3, 5, 6, 25, 80, -6, 6, 8, 26, 82, -9, 6, 8, 26, 81, 18, 60, 66, 26, 78, 11, 62, 69, 27, 76, -14, 6, 7, 27, 77, -12, 6, 8, 26, 79, -2, 16, 24, 26, 68, 33, 99, 138, 26, 68, 26, 83, 124, 26, 79, 17, 57, 66, 26, 79, 9, 39, 44, 26, 80, 6, 34, 37, 25, 79, -6, 5, 6, 26, 79, -11, 5, 6, 25, 81, -2, 7, 10, 25, 80, -4, 8, 10, 26, 81, -4, 9, 16, 26, 81, 25, 67, 86, 26, 79, 17, 50, 59, 26, 78, 20, 59, 78, 25, 80, -4, 11, 17, 26, 79, 14, 67, 75, 26, 78, 10, 46, 59, 26, 76, 11, 53, 66, 25, 79, -7, 5, 6, 26, 76, -12, 4, 5, 26, 79, -8, 4, 5, 26, 80, -9, 5, 7, 27, 77, -12, 5, 7, 26, 82, -2, 6, 8, 26, 82, -5, 7, 8, 25, 82, 2, 22, 28, 26, 80, 5, 30, 36, 26, 81, -3, 7, 10, 26, 80, 12, 48, 53, 26, 82, 13, 48, 53, 25, 83, -3, 7, 10, 26, 80, 8, 41, 48, 26, 78, 1, 36, 44, 26, 77, 0, 38, 46, 27, 77, -13, 5, 6, 26, 80, -8, 6, 8, 26, 79, -12, 6, 7, 27, 77, -14, 5, 7, 25, 84, 0, 9, 11, 24, 84, -2, 8, 10, 24, 85, -1, 9, 11, 25, 84, 1, 7, 9, 25, 84, 0, 7, 9, 25, 83, -1, 10, 12, 24, 84, -1, 8, 10, 25, 85, -3, 10, 12, 26, 80, -10, 6, 9, 26, 78, -11, 6, 8, 26, 77, -13, 6, 7, 27, 78, -13, 5, 6, 26, 80, -8, 6, 7, 26, 78, -12, 6, 8, 27, 76, -13, 6, 8],
            "solution": {
                "type": "dig",
                "spot": {"x": 2536, "y": 3865, "level": 0},
            }
        },
        {
            "id": 53,
            "type": "map",
            "tier": "medium",
            "image_url": "assets/Map_clue_Tower_of_Life.png",
            "text": ["X marks the spot on a surprisingly detailled map next to a statue on a road."],
            "ocr_data": [29, 69, 156, 28, 75, -7, 8, 11, 31, 64, 7, 30, 34, 28, 75, -3, 10, 14, 29, 74, -1, 15, 19, 28, 74, -2, 29, 36, 27, 67, -8, 36, 44, 27, 66, -29, 16, 19, 25, 72, -27, 43, 49, 26, 73, -28, 19, 25, 27, 73, -11, 37, 43, 30, 72, 10, 48, 57, 29, 79, -2, 6, 9, 28, 78, 13, 32, 37, 28, 79, 15, 36, 41, 29, 77, 13, 37, 42, 29, 76, -4, 9, 12, 28, 75, -8, 10, 12, 28, 77, -7, 8, 11, 30, 74, 2, 23, 29, 28, 64, -7, 34, 41, 27, 69, -33, 15, 19, 26, 72, -34, 13, 17, 25, 72, -25, 38, 45, 27, 72, -12, 38, 45, 28, 80, -8, 10, 13, 31, 70, 18, 36, 41, 29, 79, -1, 6, 8, 26, 59, 24, 32, 38, 25, 51, 16, 10, 11, 26, 56, 27, 31, 37, 28, 75, -7, 10, 15, 30, 71, -2, 17, 21, 29, 74, -3, 14, 19, 31, 68, 15, 43, 50, 29, 67, 0, 46, 54, 28, 62, -27, 16, 20, 27, 66, -29, 15, 20, 27, 68, -17, 26, 31, 28, 77, -7, 29, 37, 33, 66, 16, 31, 39, 29, 78, 1, 6, 7, 29, 77, 1, 6, 9, 25, 56, 28, 34, 40, 25, 51, 15, 8, 10, 26, 54, 26, 33, 40, 28, 66, 12, 23, 30, 30, 64, 10, 29, 33, 29, 71, 4, 21, 26, 30, 75, 1, 15, 20, 29, 80, -5, 13, 18, 28, 78, -6, 28, 33, 27, 82, -14, 21, 26, 27, 77, -20, 11, 14, 27, 77, -10, 10, 13, 30, 65, 6, 31, 37, 29, 76, -2, 10, 12, 29, 76, 0, 9, 13, 27, 61, 25, 47, 54, 26, 56, 21, 36, 42, 27, 59, 24, 53, 61, 28, 75, -3, 13, 17, 28, 67, 6, 18, 22, 31, 60, 11, 35, 42, 31, 63, 8, 34, 44, 29, 75, -2, 14, 18, 29, 77, -10, 11, 13, 28, 77, -16, 9, 12, 28, 74, -19, 9, 12, 30, 69, -3, 20, 26, 30, 69, 3, 25, 31, 28, 76, -1, 7, 9, 29, 75, -3, 11, 15, 28, 78, -5, 6, 8, 29, 77, -6, 11, 16, 31, 69, 3, 20, 25, 30, 72, -2, 18, 24, 31, 66, 11, 35, 42, 28, 66, 1, 19, 24, 32, 59, 10, 40, 46, 32, 63, 7, 27, 33, 29, 74, -6, 13, 18, 29, 47, 19, 73, 78, 29, 75, -8, 14, 18, 30, 71, -3, 22, 26, 31, 66, 12, 33, 40, 30, 71, 5, 26, 32, 32, 66, 7, 25, 29, 30, 69, 3, 20, 26, 31, 67, 3, 22, 28, 30, 71, 1, 24, 31, 31, 67, 10, 35, 40, 31, 66, 1, 44, 51, 29, 72, -6, 22, 28, 29, 67, 5, 25, 32, 29, 65, 11, 23, 30, 29, 66, 7, 21, 25, 21, 80, 6, 68, 78, 31, 64, 5, 26, 33, 32, 65, 14, 36, 44, 30, 72, 10, 26, 31, 33, 61, 15, 38, 41, 29, 79, 2, 8, 9, 29, 74, 6, 19, 22, 29, 75, -2, 15, 20, 30, 74, -1, 18, 24, 28, 76, -7, 13, 18, 32, 66, 8, 38, 46, 29, 70, -1, 28, 35, 30, 68, 9, 32, 40, 30, 72, 1, 20, 25, 29, 75, -6, 11, 17, 29, 67, 12, 10, 16, 29, 76, -3, 12, 16, 31, 67, 11, 55, 61, 29, 70, 4, 38, 46, 29, 76, 1, 19, 23, 29, 80, 6, 21, 27, 28, 82, 6, 26, 32, 31, 69, 9, 31, 36, 33, 67, 11, 34, 44, 28, 77, -4, 9, 12, 28, 77, -5, 16, 21, 32, 68, 8, 40, 48, 28, 79, -7, 11, 13, 29, 78, -8, 11, 16, 28, 65, 10, 49, 56, 26, 54, 19, 36, 42, 26, 59, 21, 40, 46, 29, 70, 15, 44, 60, 29, 74, 4, 22, 33, 29, 73, 8, 47, 54, 29, 61, -6, 37, 46, 29, 57, -8, 31, 39, 28, 79, 1, 28, 34, 29, 71, -7, 27, 32, 29, 76, 3, 16, 21, 32, 64, 10, 29, 37, 32, 70, 10, 24, 28, 28, 79, -5, 10, 12, 27, 68, 15, 40, 47, 25, 52, 12, 11, 15, 25, 53, 12, 30, 35, 25, 51, 16, 16, 20, 26, 56, 25, 41, 49, 29, 78, -1, 13, 19, 28, 63, -7, 34, 42, 27, 68, -38, 13, 17, 27, 67, -31, 19, 24, 28, 74, -2, 49, 56, 29, 78, -10, 27, 32, 32, 65, 11, 25, 31, 29, 76, -1, 14, 22, 28, 75, 1, 23, 29, 28, 77, -4, 10, 12, 28, 67, 16, 33, 39, 25, 52, 15, 11, 13, 26, 68, -13, 39, 47, 25, 54, 14, 30, 35, 26, 54, 27, 33, 41, 29, 78, 0, 12, 19, 29, 62, -6, 39, 48, 28, 70, -40, 10, 13, 27, 73, -36, 11, 14, 28, 68, -36, 19, 23, 29, 63, -36, 17, 21, 28, 80, 1, 12, 16, 28, 80, -1, 10, 13, 28, 78, 4, 17, 22, 32, 65, 16, 31, 39, 29, 70, 20, 49, 59, 25, 53, 23, 16, 23, 24, 51, 22, 10, 13, 24, 51, 21, 11, 14, 27, 62, 27, 48, 58, 29, 78, -1, 12, 18, 29, 62, -8, 43, 54, 28, 71, -41, 9, 12, 27, 74, -37, 7, 9, 27, 72, -40, 8, 10, 28, 70, -42, 9, 12],
            "solution": {
                "type": "dig",
                "spot": {"x": 2648, "y": 3231, "level": 0},
            }
        },
        {
            "id": 57,
            "type": "map",
            "tier": "medium",
            "image_url": "assets/Map_clue_Seers'_to_Rellekka_road.png",
            "text": ["X marks the spot on a narrow landstrip near a road and a lot of trees."],
            "ocr_data": [26, 77, 174, 26, 77, -10, 6, 8, 26, 77, -11, 8, 10, 25, 78, -10, 6, 7, 26, 80, -7, 5, 6, 25, 77, -8, 7, 8, 26, 77, -10, 7, 9, 26, 77, -11, 6, 8, 25, 80, -10, 16, 21, 25, 82, 3, 18, 23, 25, 82, -13, 6, 7, 26, 82, -11, 6, 9, 26, 82, -13, 4, 6, 25, 82, -12, 5, 7, 25, 85, -13, 6, 7, 26, 81, -14, 8, 10, 26, 78, -10, 7, 9, 25, 76, -14, 7, 9, 25, 79, -11, 5, 7, 27, 78, 13, 34, 42, 27, 73, 31, 117, 134, 26, 75, 2, 53, 67, 25, 78, -13, 6, 7, 24, 80, -14, 6, 12, 26, 68, 42, 63, 73, 26, 82, -6, 28, 32, 26, 81, 1, 47, 54, 26, 82, -12, 11, 14, 25, 79, -15, 5, 7, 25, 83, -16, 7, 8, 26, 80, -14, 6, 8, 25, 77, -12, 8, 10, 26, 78, -14, 6, 8, 26, 78, -13, 6, 7, 30, 62, 72, 35, 44, 29, 64, 63, 41, 46, 27, 74, 18, 106, 120, 27, 69, 21, 62, 68, 26, 77, -2, 23, 27, 26, 74, 13, 38, 46, 26, 71, 31, 49, 58, 26, 80, -9, 8, 12, 26, 79, -8, 15, 21, 26, 79, -13, 5, 9, 26, 80, -16, 6, 7, 26, 80, -15, 7, 8, 25, 78, -13, 5, 6, 25, 78, -13, 6, 8, 25, 77, -13, 4, 5, 26, 77, 15, 40, 49, 27, 78, 15, 49, 56, 27, 75, 16, 95, 110, 27, 75, 32, 50, 58, 27, 69, 21, 65, 77, 26, 71, 18, 44, 51, 25, 76, 2, 27, 39, 27, 69, 34, 42, 54, 26, 77, -2, 28, 34, 26, 79, -3, 39, 44, 25, 79, -15, 6, 8, 26, 79, -16, 5, 6, 25, 78, -10, 8, 10, 26, 78, -14, 6, 8, 25, 78, -15, 5, 6, 25, 80, -13, 6, 7, 28, 69, 19, 56, 60, 27, 72, 35, 126, 141, 31, 59, 84, 11, 22, 28, 70, 32, 44, 52, 26, 75, -4, 27, 33, 26, 78, -14, 6, 9, 26, 68, 32, 54, 64, 27, 73, 17, 26, 35, 26, 78, 1, 19, 22, 26, 80, -9, 12, 17, 26, 80, -18, 6, 7, 26, 77, -16, 5, 7, 25, 81, -14, 6, 7, 26, 78, -18, 6, 7, 27, 73, 4, 25, 30, 26, 74, -4, 29, 44, 26, 74, 14, 81, 104, 25, 75, 21, 50, 60, 26, 79, -12, 15, 24, 26, 66, 48, 121, 141, 25, 74, 9, 42, 55, 25, 78, -14, 7, 9, 27, 75, 10, 35, 43, 26, 73, 20, 35, 41, 26, 80, -10, 13, 18, 25, 80, -16, 6, 7, 26, 77, -16, 7, 9, 26, 78, -19, 7, 8, 25, 80, -13, 11, 15, 27, 70, 14, 54, 65, 26, 76, -12, 8, 12, 27, 72, 14, 111, 128, 26, 75, 4, 74, 91, 25, 77, -16, 7, 9, 27, 70, 16, 45, 57, 25, 79, -1, 21, 31, 28, 70, 22, 52, 60, 27, 71, 22, 46, 52, 25, 82, -9, 8, 9, 25, 80, -15, 5, 6, 26, 79, -17, 6, 7, 26, 79, -11, 6, 8, 26, 78, -19, 6, 7, 26, 78, -15, 7, 12, 26, 65, 46, 61, 72, 26, 78, -15, 6, 8, 27, 78, -18, 5, 7, 27, 78, 4, 62, 80, 26, 76, 19, 93, 114, 26, 73, 21, 71, 86, 26, 77, 11, 70, 84, 26, 76, 13, 71, 86, 27, 70, 18, 49, 57, 26, 78, 4, 22, 31, 26, 79, -16, 6, 7, 26, 81, -16, 6, 8, 26, 79, -9, 5, 6, 25, 80, -12, 6, 8, 26, 82, -15, 6, 8, 26, 76, 14, 26, 33, 27, 68, 35, 54, 66, 27, 74, -3, 34, 42, 27, 77, -17, 9, 13, 27, 70, 22, 54, 69, 26, 78, 3, 28, 54, 27, 71, 21, 42, 67, 28, 67, 42, 110, 136, 26, 77, 3, 42, 57, 26, 80, -9, 6, 10, 25, 79, -12, 5, 6, 26, 79, -17, 5, 6, 25, 81, -8, 7, 10, 25, 80, -10, 8, 10, 26, 81, -12, 6, 8, 25, 83, -8, 11, 19, 25, 78, 1, 29, 42, 26, 68, 37, 36, 48, 26, 71, 29, 52, 63, 26, 76, -2, 29, 37, 25, 79, -12, 6, 10, 27, 66, 24, 54, 70, 26, 72, 12, 54, 79, 26, 73, 5, 62, 76, 26, 79, -14, 4, 5, 26, 80, -15, 5, 7, 27, 77, -18, 5, 7, 26, 82, -8, 6, 8, 26, 82, -11, 7, 8, 25, 82, -9, 8, 10, 25, 79, -5, 19, 29, 26, 80, -3, 22, 31, 25, 81, -10, 7, 13, 25, 79, 9, 23, 31, 26, 69, 38, 44, 54, 26, 81, -13, 6, 7, 26, 74, -5, 29, 38, 26, 76, -6, 30, 46, 27, 74, -1, 61, 72, 26, 80, -14, 6, 8, 26, 79, -18, 6, 7, 27, 77, -20, 5, 7, 25, 84, -6, 9, 11, 24, 84, -8, 8, 10, 24, 85, -7, 9, 11, 25, 84, -5, 7, 9, 25, 84, -6, 7, 9, 25, 83, -7, 10, 12, 24, 84, -7, 8, 10, 25, 81, 2, 25, 30, 26, 80, -16, 6, 8, 26, 78, -17, 6, 8, 26, 77, -19, 6, 7, 27, 78, -19, 5, 6, 26, 80, -14, 6, 7, 26, 78, -18, 6, 8, 27, 76, -19, 6, 8],
            "solution": {
                "type": "dig",
                "spot": {"x": 2667, "y": 3562, "level": 0},
            }
        },
        {
            "id": 58,
            "type": "map",
            "tier": "medium",
            "image_url": "assets/Map_clue_Hobgoblin_peninsula.png",
            "text": ["X marks the spot near a rock on a peninsula."],
            "ocr_data": [26, 78, 177, 26, 77, -7, 6, 8, 26, 77, -8, 8, 10, 25, 78, -7, 6, 7, 26, 80, -4, 5, 6, 25, 77, -5, 7, 8, 26, 73, 14, 37, 43, 26, 77, -8, 6, 9, 25, 80, -10, 7, 9, 25, 86, -9, 7, 8, 25, 82, -10, 6, 7, 26, 82, -8, 5, 6, 26, 82, -10, 4, 6, 25, 82, -9, 5, 7, 25, 85, -10, 6, 7, 26, 81, -11, 8, 10, 26, 78, -7, 7, 9, 25, 76, -11, 7, 9, 25, 79, -8, 5, 7, 26, 81, -5, 6, 8, 26, 79, -6, 7, 10, 26, 73, 14, 24, 31, 26, 72, 23, 45, 56, 26, 72, 18, 49, 60, 29, 69, 29, 67, 78, 26, 78, 4, 18, 23, 26, 72, 19, 26, 30, 26, 82, -10, 5, 7, 25, 79, -12, 5, 7, 25, 83, -13, 7, 8, 26, 80, -11, 6, 8, 25, 77, -9, 8, 10, 26, 78, -11, 6, 8, 26, 78, -10, 6, 7, 26, 82, -2, 27, 31, 26, 79, -2, 39, 45, 26, 79, -10, 8, 11, 26, 71, 32, 46, 56, 26, 75, 11, 32, 42, 26, 73, 8, 40, 45, 26, 79, -10, 5, 7, 26, 75, 7, 22, 25, 26, 70, 16, 24, 28, 26, 79, -10, 5, 7, 26, 80, -13, 6, 7, 26, 80, -12, 7, 8, 25, 78, -10, 5, 6, 25, 78, -10, 6, 8, 25, 77, -10, 4, 5, 26, 81, -10, 4, 6, 27, 81, -11, 6, 7, 26, 80, -11, 6, 8, 25, 84, -10, 11, 18, 26, 69, 38, 43, 54, 24, 80, -8, 7, 8, 27, 71, 18, 52, 58, 29, 69, 26, 60, 67, 26, 78, -5, 7, 9, 26, 80, -8, 6, 8, 25, 79, -12, 6, 8, 26, 79, -13, 5, 6, 25, 78, -7, 8, 10, 26, 78, -11, 6, 8, 25, 78, -12, 5, 6, 25, 80, -10, 6, 7, 26, 80, -9, 10, 14, 26, 80, -11, 6, 9, 26, 78, 19, 40, 49, 27, 69, 45, 60, 76, 26, 74, 23, 52, 62, 27, 75, 0, 25, 31, 26, 72, 12, 30, 43, 28, 73, 12, 29, 37, 26, 79, -4, 12, 15, 26, 81, -12, 6, 7, 26, 80, -15, 6, 7, 26, 77, -13, 5, 7, 25, 81, -11, 6, 7, 26, 78, -15, 6, 7, 26, 79, -7, 24, 28, 26, 77, -5, 32, 40, 26, 77, 6, 27, 33, 26, 78, 13, 42, 50, 26, 74, 30, 57, 68, 27, 73, 24, 39, 49, 26, 74, 27, 51, 61, 25, 78, -10, 13, 18, 29, 70, 26, 58, 69, 26, 80, -9, 5, 6, 26, 81, -12, 5, 6, 25, 80, -13, 6, 7, 26, 77, -13, 7, 9, 26, 78, -16, 7, 8, 25, 80, -13, 6, 8, 26, 78, -11, 7, 9, 26, 77, -11, 6, 8, 26, 74, 23, 24, 36, 26, 77, 8, 43, 68, 25, 74, 33, 102, 122, 27, 74, 38, 59, 68, 26, 74, 37, 49, 63, 26, 78, 2, 20, 27, 26, 81, -3, 9, 12, 25, 82, -6, 8, 9, 25, 80, -12, 5, 6, 26, 79, -14, 6, 7, 26, 79, -8, 6, 8, 26, 78, -16, 6, 7, 26, 78, -13, 6, 8, 25, 78, -9, 8, 9, 26, 78, -12, 6, 7, 27, 77, 13, 24, 36, 27, 79, 8, 40, 54, 26, 76, 9, 38, 49, 26, 76, 22, 39, 45, 26, 71, 38, 38, 45, 25, 77, 16, 33, 40, 26, 80, -5, 7, 9, 25, 83, -7, 6, 7, 26, 79, -13, 6, 7, 26, 81, -13, 6, 8, 26, 79, -6, 5, 6, 25, 80, -9, 6, 8, 26, 82, -12, 6, 8, 26, 82, -7, 9, 11, 26, 79, -12, 6, 8, 27, 76, -16, 7, 10, 27, 75, 33, 63, 74, 26, 69, 18, 25, 35, 26, 72, 32, 43, 50, 26, 76, 19, 33, 46, 26, 77, 22, 44, 54, 26, 80, -8, 4, 5, 26, 81, -8, 4, 6, 25, 79, -9, 5, 6, 26, 79, -14, 5, 6, 25, 81, -5, 7, 10, 25, 80, -7, 8, 10, 26, 81, -9, 6, 8, 25, 83, -5, 12, 22, 25, 80, 1, 30, 42, 26, 79, -2, 36, 43, 25, 80, -2, 17, 23, 27, 79, 27, 58, 65, 25, 79, -6, 12, 19, 27, 69, 44, 59, 70, 26, 72, 27, 38, 52, 27, 71, 32, 52, 63, 26, 79, -9, 7, 13, 26, 80, -12, 5, 7, 27, 77, -15, 5, 7, 26, 82, -5, 6, 8, 26, 82, -8, 7, 8, 25, 82, -6, 8, 10, 26, 80, -2, 16, 24, 26, 81, -6, 7, 10, 25, 81, -6, 6, 14, 25, 83, -6, 8, 10, 26, 75, 39, 54, 60, 26, 81, -10, 6, 7, 26, 77, -2, 23, 31, 27, 68, 33, 46, 56, 27, 77, -13, 8, 14, 26, 80, -11, 6, 8, 26, 79, -15, 6, 7, 27, 77, -17, 5, 7, 25, 84, -3, 9, 11, 24, 84, -5, 8, 10, 24, 85, -4, 9, 11, 25, 84, -2, 7, 9, 25, 84, -3, 7, 9, 25, 83, -4, 10, 12, 24, 84, -4, 8, 10, 25, 80, 17, 26, 37, 26, 80, -9, 13, 20, 26, 78, -14, 6, 8, 26, 72, 11, 41, 46, 27, 78, -16, 5, 6, 26, 80, -11, 6, 7, 26, 78, -15, 6, 8, 27, 76, -16, 6, 8],
            "solution": {
                "type": "dig",
                "spot": {"x": 2906, "y": 3296, "level": 0},
            }
        },
        {
            "id": 60,
            "type": "map",
            "tier": "medium",
            "image_url": "assets/Map_clue_Lighthouse_peninsula.png",
            "text": ["X marks the spot on a small landmass surrounded by water."],
            "ocr_data": [26, 77, 176, 26, 77, -8, 6, 8, 26, 77, -9, 8, 10, 25, 78, -8, 6, 7, 26, 80, -5, 5, 6, 25, 77, -6, 7, 8, 26, 77, -8, 7, 9, 26, 77, -9, 6, 8, 25, 80, -11, 7, 9, 25, 86, -10, 7, 8, 25, 82, -11, 6, 7, 26, 82, -9, 5, 6, 26, 82, -11, 4, 6, 25, 82, -10, 5, 7, 25, 85, -11, 6, 7, 26, 81, -12, 8, 10, 26, 78, -8, 7, 9, 25, 76, -12, 7, 9, 25, 79, -9, 5, 7, 26, 81, -6, 6, 8, 26, 79, -7, 7, 8, 26, 77, -10, 8, 14, 26, 70, 28, 44, 58, 25, 72, 30, 64, 71, 26, 73, 18, 54, 62, 26, 76, 23, 45, 52, 26, 73, 31, 51, 59, 26, 81, -9, 8, 12, 26, 76, -1, 28, 33, 25, 83, -14, 7, 8, 26, 80, -12, 6, 8, 25, 77, -10, 8, 10, 26, 78, -12, 6, 8, 26, 78, -11, 6, 7, 25, 82, -8, 5, 7, 26, 77, 2, 61, 69, 26, 79, -11, 5, 7, 26, 78, -4, 15, 33, 26, 80, -11, 6, 8, 25, 79, -11, 8, 14, 26, 78, 0, 47, 63, 26, 75, 21, 109, 126, 27, 68, 55, 71, 88, 27, 64, 69, 100, 113, 26, 80, -14, 6, 7, 26, 80, -13, 7, 8, 25, 78, -11, 5, 6, 25, 78, -11, 6, 8, 25, 77, -11, 4, 5, 26, 81, -11, 4, 6, 27, 78, 4, 61, 78, 26, 76, 13, 101, 117, 27, 71, 29, 85, 99, 25, 79, -2, 52, 62, 25, 77, 17, 108, 129, 27, 69, 29, 67, 89, 26, 72, 15, 36, 40, 26, 68, 41, 58, 69, 26, 73, 22, 33, 45, 25, 78, -12, 7, 13, 26, 79, -14, 5, 6, 25, 78, -8, 8, 10, 26, 78, -12, 6, 8, 25, 78, -13, 5, 6, 25, 77, -2, 23, 32, 27, 72, 13, 33, 43, 26, 79, -8, 18, 29, 27, 74, 19, 66, 93, 27, 69, 29, 128, 153, 26, 78, -3, 20, 32, 26, 74, -2, 31, 38, 25, 75, -1, 21, 27, 27, 70, 35, 52, 59, 25, 80, -9, 5, 6, 26, 81, -13, 6, 7, 26, 80, -16, 6, 7, 26, 77, -14, 5, 7, 25, 81, -12, 6, 7, 26, 77, -11, 14, 17, 26, 75, 0, 23, 30, 26, 76, -11, 9, 12, 26, 78, -15, 5, 6, 26, 79, -4, 42, 58, 26, 74, 14, 113, 133, 26, 76, -12, 9, 16, 26, 68, 30, 52, 61, 26, 68, 36, 62, 71, 27, 75, 14, 33, 41, 26, 80, -9, 7, 10, 26, 81, -13, 5, 6, 25, 80, -14, 6, 7, 26, 77, -14, 7, 9, 26, 78, -17, 7, 8, 25, 80, -13, 9, 13, 27, 68, 33, 58, 66, 26, 67, 34, 58, 65, 26, 74, 4, 55, 64, 26, 75, 17, 110, 132, 25, 77, -12, 7, 13, 26, 77, -6, 17, 26, 26, 67, 48, 59, 71, 26, 68, 42, 61, 71, 26, 80, 1, 34, 40, 25, 81, 1, 40, 45, 25, 80, -13, 6, 9, 26, 79, -15, 6, 7, 26, 79, -9, 6, 8, 26, 78, -17, 6, 7, 26, 78, -14, 6, 8, 25, 73, 10, 24, 29, 26, 68, 30, 52, 62, 26, 69, 41, 106, 120, 27, 77, 9, 47, 64, 26, 71, 27, 54, 62, 26, 69, 39, 52, 60, 26, 72, 19, 54, 71, 27, 65, 51, 65, 79, 26, 78, 1, 16, 23, 25, 83, -8, 6, 7, 26, 79, -14, 6, 7, 26, 81, -14, 6, 8, 26, 79, -7, 5, 6, 25, 80, -10, 6, 8, 26, 82, -13, 6, 8, 26, 68, 45, 61, 71, 26, 79, -13, 6, 8, 27, 76, -18, 6, 7, 27, 68, 35, 66, 77, 26, 78, 3, 18, 22, 25, 79, -7, 11, 15, 26, 72, 24, 34, 44, 26, 72, 25, 35, 44, 26, 80, -9, 4, 5, 26, 81, -9, 4, 6, 25, 79, -10, 5, 6, 26, 79, -15, 5, 6, 25, 81, -6, 7, 10, 25, 80, -8, 8, 10, 26, 81, -10, 6, 8, 26, 69, 44, 56, 65, 25, 78, 2, 26, 36, 26, 75, 13, 37, 44, 26, 74, 20, 25, 33, 26, 78, -5, 30, 35, 26, 78, -2, 44, 52, 26, 78, -10, 9, 12, 25, 79, -11, 5, 6, 26, 76, -16, 4, 5, 26, 79, -12, 4, 5, 26, 80, -13, 5, 7, 27, 77, -16, 5, 7, 26, 82, -6, 6, 8, 26, 82, -9, 7, 8, 25, 82, -7, 8, 10, 25, 79, -3, 13, 17, 27, 71, 31, 35, 45, 26, 71, 37, 46, 56, 25, 83, -5, 10, 15, 25, 83, -7, 7, 9, 26, 81, -11, 6, 7, 26, 78, -13, 11, 13, 26, 76, -6, 45, 50, 27, 75, -7, 51, 58, 26, 79, -7, 25, 29, 26, 79, -16, 6, 7, 27, 77, -18, 5, 7, 25, 84, -4, 9, 11, 24, 84, -6, 8, 10, 24, 85, -5, 9, 11, 25, 84, -3, 7, 9, 25, 84, -4, 7, 9, 25, 83, -5, 10, 12, 24, 84, -5, 8, 10, 25, 85, -7, 10, 12, 26, 80, -14, 6, 8, 26, 78, -15, 6, 8, 26, 77, -17, 6, 7, 27, 78, -17, 5, 6, 26, 80, -12, 6, 7, 26, 78, -16, 6, 8, 27, 76, -17, 6, 8],
            "solution": {
                "type": "dig",
                "spot": {"x": 2579, "y": 3597, "level": 0},
            }
        },
        {
            "id": 61,
            "type": "map",
            "image_url": "assets/Map_clue_Haunted_Mine.png",
            "tier": "medium",
            "text": ["X marks the spot near some weird looking grass"],
            "ocr_data": [26, 76, 169, 26, 77, -15, 6, 8, 26, 77, -16, 8, 10, 25, 78, -15, 6, 8, 26, 80, -12, 5, 7, 25, 77, -13, 7, 9, 26, 77, -5, 24, 30, 26, 77, -16, 7, 12, 25, 79, -1, 32, 36, 25, 86, -17, 8, 12, 26, 79, 2, 31, 38, 26, 82, -16, 5, 6, 26, 81, 2, 27, 32, 25, 82, -16, 6, 10, 25, 85, -18, 6, 7, 26, 81, -19, 8, 10, 26, 78, -15, 7, 9, 25, 76, -19, 7, 9, 25, 78, -5, 27, 33, 26, 76, 20, 38, 47, 26, 79, -14, 7, 8, 27, 73, 28, 58, 67, 26, 78, -11, 41, 49, 25, 75, 25, 47, 56, 25, 80, -20, 6, 10, 26, 77, 28, 54, 65, 26, 83, -10, 26, 31, 26, 77, 13, 36, 43, 26, 78, -9, 17, 20, 25, 83, -21, 7, 8, 26, 80, -19, 6, 8, 25, 77, -17, 8, 10, 26, 78, -19, 6, 8, 26, 78, -18, 6, 7, 26, 76, 28, 47, 58, 29, 70, 17, 111, 128, 26, 78, -6, 15, 21, 26, 75, 27, 62, 71, 26, 76, 22, 49, 57, 25, 79, -18, 7, 9, 26, 74, 30, 54, 71, 26, 80, -7, 28, 39, 26, 77, 6, 35, 43, 26, 78, -1, 17, 20, 26, 80, -21, 6, 7, 26, 80, -20, 7, 8, 25, 78, -18, 5, 6, 25, 78, -18, 6, 8, 25, 77, -18, 4, 5, 27, 73, 31, 58, 68, 30, 68, 29, 137, 164, 27, 75, -3, 43, 57, 25, 84, -19, 7, 9, 25, 80, -18, 18, 23, 24, 80, -6, 17, 22, 26, 73, 28, 62, 73, 27, 70, 20, 39, 49, 26, 74, 20, 43, 53, 28, 72, 18, 94, 103, 25, 79, -20, 6, 8, 26, 79, -21, 5, 6, 25, 78, -15, 8, 10, 26, 78, -19, 6, 8, 26, 75, 11, 51, 60, 25, 79, -1, 46, 70, 29, 68, 46, 105, 135, 29, 73, 8, 73, 95, 26, 79, -9, 28, 42, 26, 75, 13, 30, 40, 25, 79, -14, 13, 18, 27, 73, 26, 60, 68, 26, 73, 27, 52, 58, 27, 76, 19, 47, 63, 30, 67, 32, 146, 175, 26, 79, -14, 21, 29, 26, 80, -23, 6, 7, 26, 77, -21, 5, 7, 25, 81, -19, 6, 7, 26, 76, 0, 20, 23, 26, 76, 4, 37, 49, 27, 74, 24, 53, 66, 31, 63, 36, 154, 186, 28, 68, 22, 91, 115, 26, 69, 2, 51, 59, 26, 64, 5, 106, 112, 26, 67, 3, 43, 54, 25, 78, -19, 7, 9, 27, 79, -16, 7, 12, 29, 68, 25, 132, 163, 28, 73, 8, 74, 91, 25, 80, -21, 6, 7, 26, 77, -21, 7, 9, 26, 78, -24, 7, 8, 26, 79, 2, 18, 23, 27, 77, 0, 41, 56, 27, 74, 26, 50, 57, 30, 65, 24, 142, 169, 28, 62, 36, 137, 171, 25, 72, -5, 92, 103, 26, 78, -18, 7, 9, 25, 70, 4, 38, 50, 26, 78, -12, 15, 22, 26, 81, -10, 14, 21, 27, 77, 5, 66, 86, 28, 70, 18, 102, 121, 26, 79, -22, 6, 7, 26, 79, -16, 6, 8, 26, 78, -24, 6, 8, 26, 75, 25, 62, 74, 26, 77, 8, 57, 73, 29, 66, 43, 121, 138, 31, 65, 30, 158, 188, 28, 68, 51, 152, 189, 28, 70, 20, 113, 138, 26, 79, -8, 21, 36, 26, 70, 3, 40, 50, 29, 69, 26, 116, 140, 29, 70, 23, 116, 134, 27, 75, 13, 90, 110, 28, 73, -1, 54, 70, 26, 81, -21, 6, 8, 26, 79, -14, 5, 6, 25, 80, -17, 6, 8, 26, 82, -17, 12, 18, 26, 76, 29, 57, 65, 28, 73, 5, 75, 98, 31, 64, 29, 148, 191, 31, 65, 30, 147, 187, 30, 67, 31, 147, 178, 28, 70, 17, 102, 116, 26, 64, 14, 134, 150, 29, 68, 24, 119, 144, 30, 66, 32, 141, 176, 30, 67, 30, 142, 169, 25, 79, -16, 6, 10, 26, 79, -22, 5, 6, 25, 81, -13, 7, 10, 25, 80, -15, 8, 10, 26, 81, -17, 6, 8, 26, 78, 25, 35, 52, 25, 79, -11, 16, 24, 28, 70, 18, 114, 128, 29, 67, 28, 132, 157, 30, 66, 33, 148, 183, 26, 75, -6, 36, 51, 26, 69, 1, 26, 42, 28, 71, 10, 87, 112, 29, 67, 15, 103, 134, 28, 71, 10, 80, 106, 26, 80, -20, 5, 8, 27, 77, -23, 5, 7, 26, 82, -13, 6, 8, 26, 82, -16, 7, 8, 25, 82, -8, 20, 31, 26, 76, 22, 25, 39, 26, 81, -14, 7, 8, 25, 81, -16, 6, 8, 25, 83, -14, 8, 10, 25, 83, -13, 8, 13, 27, 75, 1, 66, 78, 26, 68, -4, 36, 46, 26, 67, -2, 31, 41, 28, 74, -9, 52, 68, 27, 76, -4, 56, 67, 26, 79, -23, 6, 7, 27, 77, -25, 5, 7, 25, 84, -11, 9, 11, 24, 84, -13, 8, 10, 24, 84, -9, 13, 18, 25, 83, -7, 11, 14, 25, 84, -11, 7, 9, 25, 83, -12, 10, 12, 24, 84, -12, 8, 10, 25, 85, -14, 10, 12, 27, 75, -1, 72, 81, 26, 78, -22, 7, 11, 26, 76, -23, 8, 12, 27, 78, -24, 5, 6, 26, 80, -19, 6, 7, 26, 78, -23, 6, 8, 27, 76, -24, 6, 8],
            "solution": {
                "type": "dig",
                "spot": {"x": 3434, "y": 3265, "level": 0},
            }
        },
        {
            "id": 62,
            "type": "map",
            "tier": "medium",
            "image_url": "assets/Map_clue_Draynor.png",
            "text": ["X marks the spot at the end of a path starting from a rock and near a fishing spot."],
            "ocr_data": [26, 78, 180, 26, 77, -4, 6, 8, 26, 77, -5, 8, 10, 25, 78, -4, 6, 7, 26, 79, 3, 17, 23, 25, 77, -2, 7, 8, 26, 77, -4, 7, 9, 26, 77, -5, 6, 8, 25, 80, -7, 7, 9, 25, 86, -6, 7, 8, 25, 82, -7, 6, 7, 26, 82, -5, 5, 6, 26, 82, -7, 4, 6, 25, 82, -6, 5, 7, 25, 85, -7, 6, 7, 26, 81, -8, 8, 10, 26, 78, -4, 7, 9, 25, 76, -8, 7, 9, 25, 79, -5, 5, 7, 26, 73, 28, 35, 45, 27, 70, 36, 58, 67, 26, 78, -7, 7, 8, 26, 77, -3, 10, 14, 24, 80, -6, 9, 14, 25, 80, -9, 5, 7, 26, 84, -5, 5, 6, 26, 83, -3, 6, 8, 26, 82, -7, 5, 6, 25, 79, -9, 5, 7, 25, 83, -10, 7, 8, 26, 80, -8, 6, 8, 25, 77, -6, 8, 10, 26, 78, -8, 6, 8, 26, 78, -7, 6, 7, 25, 82, -4, 5, 7, 27, 75, 12, 21, 27, 27, 69, 38, 64, 74, 27, 73, 15, 33, 37, 27, 74, 14, 28, 41, 27, 73, 13, 23, 28, 29, 69, 32, 43, 53, 26, 75, 9, 90, 103, 26, 74, 6, 34, 43, 26, 74, 4, 16, 18, 26, 80, -10, 6, 7, 26, 80, -9, 7, 8, 25, 78, -7, 5, 6, 25, 78, -7, 6, 8, 25, 77, -7, 4, 5, 26, 81, -7, 4, 6, 27, 81, -8, 6, 7, 26, 75, 12, 22, 29, 26, 71, 41, 68, 80, 25, 78, -3, 20, 29, 26, 71, 20, 47, 51, 26, 73, 10, 49, 64, 26, 74, 4, 38, 41, 26, 66, 25, 25, 28, 26, 66, 29, 25, 28, 25, 79, -9, 6, 8, 26, 79, -10, 5, 6, 25, 78, -4, 8, 10, 26, 78, -8, 6, 8, 25, 78, -9, 5, 6, 25, 80, -7, 6, 8, 26, 80, 1, 41, 50, 26, 80, -6, 16, 21, 26, 78, 1, 17, 21, 27, 68, 41, 68, 78, 26, 78, -1, 19, 29, 29, 66, 39, 78, 98, 25, 71, 8, 79, 80, 27, 77, 2, 32, 41, 25, 80, -5, 5, 6, 26, 81, -9, 6, 7, 26, 80, -12, 6, 7, 26, 77, -10, 5, 7, 25, 81, -8, 6, 7, 26, 78, -12, 6, 7, 26, 79, -8, 10, 19, 26, 77, -6, 9, 16, 26, 78, -10, 5, 11, 25, 80, -10, 7, 8, 26, 77, 0, 17, 22, 27, 69, 41, 60, 73, 26, 73, 5, 30, 34, 25, 76, -3, 20, 32, 27, 72, 8, 48, 63, 26, 78, 0, 52, 58, 26, 81, -9, 5, 6, 25, 80, -10, 6, 7, 26, 77, -10, 7, 9, 26, 78, -13, 7, 8, 25, 80, -10, 6, 8, 26, 78, -8, 7, 9, 26, 77, -8, 6, 8, 26, 76, -11, 7, 8, 26, 78, -13, 6, 8, 26, 76, -3, 23, 28, 27, 58, 62, 41, 54, 27, 74, 31, 68, 82, 28, 72, 25, 39, 46, 26, 77, 25, 76, 91, 25, 80, 13, 60, 75, 25, 80, -9, 5, 6, 26, 79, -11, 6, 7, 26, 79, -5, 6, 8, 26, 78, -13, 6, 7, 26, 78, -10, 6, 8, 25, 78, -6, 8, 13, 26, 78, -6, 23, 33, 27, 78, -8, 29, 42, 27, 81, -11, 7, 14, 26, 81, -8, 6, 7, 26, 78, 11, 23, 27, 26, 72, 31, 41, 48, 25, 78, 5, 17, 25, 25, 77, 25, 68, 78, 25, 81, 9, 38, 44, 26, 79, -10, 6, 7, 26, 81, -10, 6, 8, 26, 79, -3, 5, 6, 25, 80, -6, 6, 8, 26, 82, -9, 6, 8, 26, 82, -2, 15, 24, 26, 79, -4, 16, 26, 27, 76, -9, 12, 19, 27, 77, -6, 17, 30, 26, 81, -8, 7, 8, 25, 80, -6, 7, 14, 26, 68, 44, 40, 52, 25, 80, -4, 6, 7, 26, 80, -5, 4, 5, 26, 81, -5, 4, 6, 25, 79, -6, 5, 6, 26, 79, -11, 5, 6, 25, 81, -2, 7, 10, 25, 80, -4, 8, 10, 26, 81, -6, 6, 8, 25, 83, -3, 8, 10, 25, 80, -4, 6, 7, 26, 79, -6, 6, 7, 25, 80, -5, 7, 12, 26, 79, -7, 5, 7, 25, 79, -7, 6, 7, 26, 68, 43, 57, 64, 25, 79, -7, 5, 6, 26, 76, -12, 4, 5, 26, 79, -8, 4, 5, 26, 80, -9, 5, 7, 27, 77, -12, 5, 7, 26, 82, -2, 6, 8, 26, 82, -5, 7, 8, 25, 82, -3, 8, 10, 25, 80, -4, 7, 9, 26, 81, -3, 7, 8, 25, 81, -3, 14, 16, 26, 83, 6, 44, 52, 25, 83, 1, 24, 28, 26, 81, -7, 6, 7, 27, 69, 37, 42, 53, 26, 76, -1, 19, 28, 27, 77, -13, 5, 6, 26, 80, -8, 6, 8, 26, 79, -12, 6, 7, 27, 77, -14, 5, 7, 25, 84, 0, 9, 11, 24, 84, -2, 8, 10, 24, 85, -1, 9, 11, 25, 84, 1, 7, 9, 25, 84, 0, 7, 9, 25, 83, -1, 10, 12, 24, 84, -1, 8, 10, 25, 85, -3, 10, 12, 26, 80, -10, 6, 8, 26, 77, -7, 13, 17, 26, 73, 11, 35, 42, 27, 78, -13, 5, 6, 26, 80, -8, 6, 7, 26, 78, -12, 6, 8, 27, 76, -13, 6, 8],
            "solution": {
                "type": "dig",
                "spot": {"x": 3092, "y": 3225, "level": 0},
            }
        },
        {
            "id": 40,
            "type": "map",
            "tier": "hard",
            "text": ["A crate at a group of three buildings."],
            "image_url": "assets/Map_clue_Observatory.png",
            "ocr_data": [26, 77, 185, 26, 77, 1, 6, 8, 26, 77, 0, 8, 10, 25, 78, 1, 6, 7, 26, 80, 4, 5, 6, 25, 77, 3, 7, 8, 26, 76, 5, 14, 20, 26, 73, 14, 19, 23, 25, 80, -2, 7, 9, 25, 86, -1, 7, 8, 25, 82, -2, 6, 7, 26, 82, 0, 5, 6, 26, 82, -2, 4, 6, 25, 82, 1, 13, 18, 25, 85, -2, 6, 7, 26, 81, -3, 8, 10, 26, 78, 1, 7, 9, 25, 76, -3, 7, 9, 25, 79, 0, 5, 7, 26, 81, 3, 6, 8, 27, 74, 18, 22, 27, 27, 74, 12, 24, 31, 27, 69, 25, 37, 53, 24, 80, -3, 6, 8, 25, 80, -4, 5, 7, 26, 84, 0, 5, 6, 26, 83, 2, 6, 8, 26, 81, 6, 18, 27, 26, 77, 12, 44, 55, 25, 83, -5, 7, 8, 26, 80, -3, 6, 8, 25, 77, -1, 8, 10, 26, 78, -3, 6, 8, 26, 78, -2, 6, 7, 25, 82, 1, 5, 7, 27, 71, 23, 40, 55, 27, 76, 6, 14, 25, 26, 76, 9, 17, 22, 28, 69, 35, 47, 61, 26, 75, 9, 26, 30, 26, 77, 20, 45, 51, 26, 76, 34, 59, 65, 26, 76, 21, 42, 47, 26, 79, -2, 5, 7, 26, 80, -5, 6, 7, 26, 80, -4, 7, 8, 25, 78, -2, 5, 6, 25, 78, -2, 6, 8, 25, 77, -2, 4, 5, 26, 81, -2, 4, 16, 29, 65, 50, 64, 76, 26, 79, 0, 15, 19, 26, 77, 17, 33, 38, 26, 72, 17, 34, 53, 25, 75, 33, 61, 73, 26, 76, 23, 46, 51, 26, 76, 21, 43, 49, 26, 75, 23, 43, 48, 26, 80, 0, 6, 8, 25, 79, -4, 6, 8, 26, 79, -5, 5, 6, 25, 78, 1, 8, 10, 26, 78, -3, 6, 8, 25, 78, -4, 5, 6, 25, 80, 1, 12, 34, 27, 75, 30, 47, 58, 27, 76, 25, 43, 49, 26, 78, 16, 38, 44, 26, 77, -8, 5, 7, 26, 75, 33, 60, 66, 26, 76, 13, 35, 39, 26, 73, 33, 65, 69, 27, 76, 22, 42, 49, 25, 80, 0, 5, 7, 26, 81, -4, 6, 7, 26, 80, -7, 6, 7, 26, 77, -5, 5, 7, 25, 81, -3, 6, 7, 26, 78, -7, 6, 7, 26, 76, 19, 60, 68, 26, 74, 18, 46, 55, 26, 78, -6, 5, 6, 26, 77, 20, 48, 54, 26, 78, 0, 15, 18, 26, 76, -4, 7, 8, 25, 78, -2, 7, 8, 25, 78, -3, 7, 9, 27, 78, 3, 12, 17, 26, 78, 16, 58, 63, 26, 81, -4, 5, 6, 25, 80, -5, 6, 7, 26, 77, -5, 7, 9, 26, 78, -8, 7, 8, 25, 80, -5, 6, 8, 27, 74, 25, 67, 78, 29, 62, 62, 86, 108, 29, 54, 71, 50, 60, 28, 67, 52, 65, 73, 26, 74, 21, 48, 54, 26, 78, -2, 7, 9, 25, 81, 1, 8, 10, 26, 79, 2, 8, 10, 26, 82, 4, 7, 8, 25, 82, 2, 8, 9, 25, 80, -4, 5, 6, 26, 79, -6, 6, 7, 26, 79, 0, 6, 8, 26, 78, -8, 6, 7, 26, 78, -5, 6, 8, 25, 78, 3, 14, 23, 27, 71, 45, 91, 106, 29, 57, 85, 72, 82, 28, 70, 52, 53, 61, 26, 79, 9, 28, 35, 26, 81, 2, 7, 9, 26, 79, 4, 20, 28, 26, 78, 29, 49, 54, 26, 78, 22, 37, 43, 25, 83, 1, 6, 7, 26, 79, -5, 6, 7, 26, 81, -5, 6, 8, 26, 79, 2, 5, 6, 25, 80, -1, 6, 8, 26, 82, -4, 6, 8, 26, 82, 1, 9, 11, 26, 77, 14, 42, 51, 27, 75, -1, 6, 29, 27, 76, 0, 6, 30, 26, 81, 0, 7, 18, 25, 80, -1, 6, 7, 26, 74, 47, 57, 83, 26, 77, 25, 43, 48, 26, 77, 21, 42, 47, 26, 81, 0, 4, 6, 25, 79, -1, 5, 6, 26, 79, -6, 5, 6, 25, 81, 3, 7, 10, 25, 80, 1, 8, 10, 26, 81, -1, 6, 8, 25, 83, 2, 8, 10, 25, 80, 1, 6, 7, 26, 79, -1, 6, 7, 25, 80, 0, 7, 8, 26, 79, -2, 5, 7, 25, 79, -2, 6, 7, 26, 76, 12, 24, 41, 25, 79, -2, 5, 6, 26, 74, 15, 43, 48, 26, 79, -3, 4, 5, 26, 80, -4, 5, 7, 27, 77, -7, 5, 7, 26, 82, 3, 6, 8, 26, 82, 0, 7, 8, 25, 82, 2, 8, 10, 25, 80, 1, 7, 9, 26, 81, 2, 7, 8, 25, 81, 1, 7, 12, 28, 70, 40, 53, 60, 25, 83, 2, 7, 9, 26, 81, -2, 6, 7, 27, 75, 24, 40, 51, 27, 75, 23, 43, 49, 27, 76, 4, 25, 30, 26, 80, -3, 6, 8, 26, 79, -7, 6, 7, 27, 77, -9, 5, 7, 25, 84, 5, 9, 11, 24, 84, 3, 8, 10, 24, 85, 4, 9, 11, 25, 84, 6, 7, 9, 25, 84, 5, 7, 9, 25, 83, 4, 10, 12, 24, 79, 16, 33, 38, 25, 85, 2, 10, 12, 26, 80, -5, 6, 8, 26, 78, -6, 6, 8, 26, 77, -8, 6, 7, 27, 78, -8, 5, 6, 26, 80, -3, 6, 7, 26, 78, -7, 6, 8, 27, 76, -8, 6, 8],
            "solution": {
                "type": "search",
                "entity": "Crate",
                "spot": {"x": 2457, "y": 3182, "level": 0},
            }
        },
        {
            "id": 41,
            "type": "map",
            "tier": "hard",
            "text": ["X marks the spot next to a tree behind a building in the corner of a city."],
            "image_url": "assets/Map_clue_Yanille_anvil.png",
            "ocr_data": [26, 77, 176, 26, 77, -8, 6, 8, 26, 77, -9, 8, 10, 25, 78, -8, 6, 7, 26, 80, -5, 5, 6, 25, 77, -6, 7, 8, 26, 76, 2, 28, 32, 26, 77, -9, 6, 8, 25, 79, -2, 25, 29, 25, 84, -1, 21, 25, 26, 80, -1, 22, 26, 26, 82, -9, 5, 6, 26, 82, -11, 4, 6, 25, 82, -10, 5, 7, 25, 85, -11, 6, 7, 26, 81, -12, 8, 10, 26, 78, -8, 7, 9, 25, 76, -12, 7, 9, 25, 79, -9, 5, 7, 26, 81, -6, 6, 8, 26, 79, -7, 7, 8, 26, 76, 7, 41, 47, 26, 76, 3, 43, 49, 25, 77, 11, 55, 61, 26, 76, 15, 43, 49, 26, 79, 19, 42, 47, 26, 79, 3, 17, 22, 26, 81, -9, 7, 13, 25, 79, -13, 5, 7, 25, 83, -14, 7, 8, 26, 80, -12, 6, 8, 25, 77, -10, 8, 10, 26, 78, -12, 6, 8, 26, 78, -11, 6, 7, 25, 82, -8, 5, 7, 26, 80, -11, 5, 6, 26, 77, 0, 37, 48, 26, 79, -5, 18, 28, 26, 80, -11, 6, 8, 26, 76, 17, 44, 50, 26, 76, 18, 42, 47, 27, 70, 21, 35, 48, 26, 75, 3, 17, 27, 26, 79, -11, 5, 7, 26, 80, -14, 6, 7, 26, 80, -13, 7, 8, 25, 78, -11, 5, 6, 25, 78, -11, 6, 8, 25, 77, -11, 4, 5, 26, 81, -11, 4, 6, 27, 81, -12, 6, 10, 26, 79, -1, 43, 48, 26, 81, 5, 51, 62, 25, 79, -1, 42, 52, 25, 77, 19, 43, 49, 26, 75, 19, 43, 48, 26, 78, -8, 7, 9, 26, 78, -6, 7, 9, 26, 80, -9, 6, 8, 25, 79, -13, 6, 8, 26, 79, -14, 5, 6, 25, 78, -8, 8, 10, 26, 78, -12, 6, 8, 26, 77, -5, 28, 32, 25, 78, 3, 45, 54, 27, 77, 13, 66, 80, 26, 80, -12, 6, 8, 26, 81, -15, 5, 7, 26, 75, 6, 66, 83, 26, 75, 21, 50, 60, 27, 75, 17, 43, 49, 25, 77, -9, 6, 8, 27, 79, -7, 7, 9, 28, 67, 31, 61, 66, 26, 81, -13, 6, 7, 26, 80, -16, 6, 7, 26, 77, -14, 5, 7, 25, 81, -12, 6, 7, 26, 78, -16, 6, 7, 26, 77, 1, 44, 50, 26, 75, 4, 51, 60, 26, 76, 0, 45, 55, 26, 78, 4, 47, 63, 27, 63, 56, 110, 137, 28, 68, 34, 67, 81, 26, 74, 17, 43, 49, 25, 78, -12, 7, 9, 27, 79, -10, 7, 9, 26, 76, -1, 23, 26, 26, 81, -13, 5, 6, 25, 80, -14, 6, 7, 26, 77, -14, 7, 9, 26, 78, -17, 7, 8, 25, 79, -7, 27, 42, 26, 76, 1, 41, 68, 26, 77, -12, 6, 29, 26, 75, -6, 30, 61, 26, 76, 4, 60, 99, 25, 67, 38, 121, 160, 26, 73, 20, 70, 82, 26, 76, 22, 55, 61, 26, 79, -7, 8, 10, 26, 82, -5, 7, 8, 25, 82, -7, 8, 9, 25, 80, -13, 5, 6, 26, 79, -15, 6, 7, 26, 79, -9, 6, 8, 26, 78, -17, 6, 7, 26, 75, 8, 41, 46, 26, 72, 43, 64, 71, 27, 71, 45, 63, 70, 27, 71, 43, 63, 71, 27, 73, 44, 64, 72, 27, 73, 45, 62, 69, 26, 75, 31, 72, 84, 26, 77, 7, 32, 48, 25, 74, 23, 34, 39, 26, 72, 24, 34, 40, 26, 73, 31, 47, 54, 26, 79, -14, 6, 7, 26, 81, -14, 6, 8, 26, 79, -7, 5, 6, 25, 80, -10, 6, 8, 27, 74, 8, 34, 48, 28, 71, 24, 64, 76, 27, 76, -3, 27, 35, 27, 76, -18, 6, 7, 27, 74, -5, 18, 22, 26, 78, -1, 18, 23, 25, 80, -10, 6, 7, 26, 66, 50, 64, 74, 26, 75, 10, 21, 25, 26, 76, 7, 24, 32, 26, 80, -4, 9, 14, 25, 79, -10, 5, 6, 26, 79, -15, 5, 6, 25, 81, -6, 7, 10, 25, 80, -8, 8, 10, 26, 80, -8, 10, 14, 26, 71, 22, 61, 76, 26, 72, 15, 45, 52, 27, 73, 6, 27, 31, 26, 76, 2, 28, 32, 26, 73, 7, 29, 35, 26, 70, 32, 59, 70, 26, 72, 20, 33, 44, 25, 79, -9, 15, 18, 26, 74, -5, 50, 59, 26, 79, -9, 21, 23, 26, 80, -13, 5, 7, 27, 77, -16, 5, 7, 26, 82, -6, 6, 8, 26, 82, -9, 7, 8, 25, 82, -7, 8, 10, 25, 80, -8, 7, 9, 26, 81, -7, 7, 10, 27, 69, 24, 53, 61, 26, 77, 18, 42, 50, 26, 69, 46, 65, 77, 26, 74, 16, 26, 32, 26, 77, -6, 43, 47, 26, 76, -4, 52, 59, 27, 77, -13, 21, 25, 26, 80, -12, 6, 8, 26, 79, -16, 6, 7, 27, 77, -18, 5, 7, 25, 84, -4, 9, 11, 24, 84, -6, 8, 10, 24, 85, -5, 9, 11, 25, 84, -3, 7, 9, 25, 84, -4, 7, 9, 25, 79, 13, 39, 46, 25, 76, 25, 30, 36, 25, 83, -1, 17, 23, 26, 80, -14, 6, 8, 26, 78, -15, 6, 8, 26, 77, -17, 6, 7, 27, 78, -17, 5, 6, 26, 80, -12, 6, 7, 26, 78, -16, 6, 8, 27, 76, -17, 6, 8],
            "solution": {
                "type": "dig",
                "spot": {"x": 2616, "y": 3077, "level": 0},
            }
        },
        {
            "id": 42,
            "type": "map",
            "tier": "hard",
            "text": ["X marks the spot between to tables."],
            "image_url": "assets/Map_clue_Legends'_Guild.png",
            "ocr_data": [26, 77, 176, 26, 77, -8, 6, 8, 26, 77, -9, 8, 10, 25, 78, -8, 6, 7, 26, 80, -5, 5, 6, 25, 77, -6, 7, 8, 26, 77, -8, 7, 9, 26, 77, -9, 6, 8, 25, 79, 0, 22, 26, 26, 81, 19, 40, 46, 25, 82, -11, 6, 7, 26, 82, -9, 5, 6, 26, 82, -11, 4, 6, 25, 82, -10, 5, 7, 25, 85, -11, 6, 7, 26, 81, -12, 8, 10, 26, 78, -8, 7, 9, 25, 76, -12, 7, 9, 25, 79, -9, 5, 9, 26, 76, 21, 67, 79, 27, 71, 43, 116, 133, 26, 70, 34, 99, 115, 26, 75, 2, 34, 47, 26, 70, 43, 40, 46, 31, 58, 88, 8, 17, 26, 81, 4, 27, 34, 27, 72, 24, 58, 62, 26, 76, 25, 60, 65, 26, 74, 17, 52, 57, 25, 83, -14, 7, 8, 26, 80, -12, 6, 8, 25, 77, -10, 8, 10, 26, 78, -12, 6, 8, 26, 78, -11, 6, 7, 27, 73, 35, 38, 43, 31, 59, 87, 12, 19, 27, 76, 9, 33, 46, 26, 72, 36, 101, 118, 26, 72, 38, 80, 113, 26, 72, 48, 76, 95, 26, 79, -11, 5, 7, 26, 78, -2, 20, 23, 26, 72, 34, 56, 68, 27, 70, 44, 75, 89, 26, 80, -14, 6, 7, 26, 80, -13, 7, 8, 25, 78, -11, 5, 6, 25, 78, -11, 6, 8, 25, 77, -10, 5, 12, 27, 74, 32, 55, 63, 27, 70, 64, 76, 87, 26, 80, -9, 10, 19, 27, 72, 21, 59, 66, 25, 76, 8, 41, 57, 25, 72, 43, 88, 105, 26, 71, 39, 99, 111, 27, 71, 41, 92, 113, 27, 71, 44, 111, 127, 26, 78, 4, 29, 35, 25, 79, -13, 6, 8, 26, 79, -14, 5, 6, 25, 78, -8, 8, 10, 26, 78, -12, 6, 8, 26, 73, 16, 40, 45, 31, 58, 87, 4, 5, 27, 73, 27, 41, 48, 28, 68, 23, 64, 70, 26, 79, -10, 17, 20, 26, 77, -17, 5, 7, 25, 79, -11, 6, 8, 26, 78, -12, 6, 8, 25, 77, -9, 6, 11, 28, 69, 23, 45, 55, 26, 79, -5, 14, 17, 26, 81, -13, 6, 7, 26, 80, -16, 6, 7, 26, 77, -14, 5, 7, 25, 81, -12, 6, 7, 26, 78, -14, 10, 14, 26, 71, 46, 78, 89, 26, 76, -8, 17, 24, 28, 68, 18, 60, 66, 25, 80, -14, 7, 8, 26, 74, -2, 26, 36, 27, 68, 9, 44, 64, 25, 78, -11, 7, 10, 25, 78, -12, 7, 9, 27, 78, -8, 12, 16, 26, 80, -10, 5, 6, 26, 81, -13, 5, 6, 25, 80, -14, 6, 7, 26, 77, -14, 7, 9, 26, 78, -17, 7, 8, 25, 80, -14, 6, 8, 26, 78, -12, 7, 9, 26, 77, -12, 6, 8, 26, 73, -6, 30, 33, 26, 78, -17, 6, 8, 26, 70, 4, 31, 34, 26, 68, 14, 30, 38, 25, 80, -5, 11, 18, 26, 79, -7, 8, 10, 26, 82, -5, 7, 8, 25, 82, -7, 8, 9, 25, 80, -13, 5, 6, 26, 79, -15, 6, 7, 26, 79, -9, 6, 8, 26, 78, -17, 6, 7, 26, 78, -14, 6, 8, 25, 78, -10, 8, 9, 26, 78, -13, 6, 7, 27, 78, -16, 5, 7, 27, 81, -15, 6, 8, 26, 77, 5, 72, 84, 26, 76, 22, 66, 81, 25, 73, 21, 79, 92, 25, 82, -7, 6, 8, 26, 80, -6, 7, 9, 26, 78, 8, 34, 37, 27, 72, 5, 31, 40, 26, 81, -14, 6, 8, 26, 79, -7, 5, 6, 25, 80, -10, 6, 8, 26, 82, -13, 6, 8, 26, 82, -8, 9, 11, 26, 75, 4, 90, 103, 27, 76, -14, 33, 39, 27, 77, -16, 6, 12, 26, 79, 4, 28, 64, 25, 76, 13, 42, 63, 25, 72, 23, 81, 93, 25, 80, -8, 6, 7, 26, 78, -3, 15, 20, 26, 80, -7, 9, 12, 25, 78, -8, 8, 11, 26, 79, -15, 5, 6, 25, 81, -6, 7, 10, 25, 80, -8, 8, 10, 26, 81, -10, 6, 8, 25, 83, -7, 8, 10, 25, 77, 0, 25, 29, 26, 79, -10, 6, 7, 25, 76, 2, 76, 88, 26, 78, 1, 25, 46, 25, 79, -11, 6, 7, 26, 78, -11, 6, 7, 25, 79, -11, 5, 6, 27, 68, 7, 43, 46, 26, 78, -8, 12, 16, 26, 80, -13, 5, 7, 27, 77, -16, 5, 7, 26, 82, -6, 6, 8, 26, 82, -9, 7, 8, 25, 82, -7, 8, 10, 25, 80, -8, 7, 9, 26, 81, -7, 7, 8, 25, 81, -9, 6, 8, 26, 77, 8, 31, 43, 26, 74, 17, 45, 71, 26, 81, -11, 6, 7, 26, 78, -14, 5, 6, 26, 78, -15, 5, 6, 27, 77, -17, 5, 6, 26, 80, -12, 6, 8, 26, 79, -16, 6, 7, 27, 77, -18, 5, 7, 25, 84, -4, 9, 11, 24, 84, -6, 8, 10, 24, 85, -5, 9, 11, 25, 84, -3, 7, 9, 25, 84, -4, 7, 9, 25, 83, -5, 10, 12, 24, 76, 14, 34, 37, 25, 74, 17, 41, 45, 26, 80, -14, 6, 8, 26, 78, -15, 6, 8, 26, 77, -17, 6, 7, 27, 78, -17, 5, 6, 26, 80, -12, 6, 7, 26, 78, -16, 6, 8, 27, 76, -17, 6, 8],
            "solution": {
                "type": "dig",
                "spot": {"x": 2723, "y": 3338, "level": 0},
            }
        },
        {
            "id": 43,
            "type": "map",
            "tier": "hard",
            "image_url": "assets/Map_clue_West_Ardougne.png",
            "text": ["X marks the spot in one of multiple column-like buildings."],
            "ocr_data": [26, 79, 181, 26, 77, -3, 6, 8, 26, 77, -4, 8, 10, 25, 78, -3, 6, 7, 26, 80, 0, 5, 6, 25, 77, -1, 7, 8, 26, 77, -3, 7, 9, 26, 77, -4, 6, 8, 25, 80, -6, 7, 9, 25, 86, -5, 7, 8, 25, 82, -6, 6, 7, 26, 82, -4, 5, 6, 26, 82, -6, 4, 6, 25, 82, -5, 5, 7, 25, 85, -6, 6, 7, 26, 81, -7, 8, 10, 26, 78, -3, 7, 9, 25, 76, -7, 7, 9, 25, 79, -4, 5, 7, 26, 81, -1, 6, 8, 26, 77, 15, 40, 44, 26, 75, 18, 73, 81, 26, 75, 15, 43, 50, 25, 77, 18, 62, 82, 25, 77, 13, 43, 49, 26, 78, 32, 78, 87, 26, 80, 15, 44, 49, 26, 79, 16, 63, 68, 25, 79, -8, 5, 7, 25, 83, -9, 7, 8, 26, 80, -7, 6, 8, 25, 77, -5, 8, 10, 26, 78, -7, 6, 8, 26, 78, -6, 6, 7, 25, 82, -3, 5, 7, 26, 78, 4, 37, 41, 27, 75, 21, 67, 75, 26, 77, 14, 43, 49, 26, 76, 24, 53, 72, 26, 77, 7, 44, 50, 26, 76, 25, 75, 87, 26, 79, 8, 38, 43, 26, 76, 21, 67, 73, 26, 79, -6, 5, 7, 26, 80, -9, 6, 7, 26, 80, -8, 7, 8, 25, 78, -6, 5, 6, 25, 78, -6, 6, 8, 25, 77, -6, 4, 5, 26, 81, -6, 4, 6, 27, 81, -7, 6, 7, 26, 80, -7, 6, 8, 25, 84, -7, 7, 9, 25, 80, -10, 6, 8, 24, 80, -4, 7, 8, 25, 78, -5, 6, 8, 26, 78, -3, 7, 9, 26, 78, -1, 7, 9, 26, 80, -4, 6, 8, 25, 79, -8, 6, 8, 26, 79, -9, 5, 6, 25, 78, -3, 8, 10, 26, 78, -7, 6, 8, 25, 78, -8, 5, 6, 25, 80, -6, 6, 7, 26, 80, -6, 6, 7, 26, 80, -7, 6, 8, 26, 81, -10, 5, 7, 26, 77, -12, 5, 7, 25, 79, -6, 6, 8, 26, 78, -7, 6, 8, 25, 77, -4, 6, 8, 27, 79, -2, 7, 9, 25, 80, -4, 5, 6, 26, 81, -8, 6, 7, 26, 80, -11, 6, 7, 26, 77, -9, 5, 7, 25, 81, -7, 6, 7, 26, 78, -11, 6, 7, 26, 79, -8, 6, 8, 26, 75, 13, 70, 76, 26, 76, 10, 59, 65, 25, 80, -9, 7, 8, 26, 76, 15, 58, 81, 26, 74, 7, 56, 61, 25, 77, -6, 8, 15, 25, 66, 65, 155, 190, 27, 77, 13, 53, 64, 26, 80, -5, 5, 6, 26, 81, -8, 5, 6, 25, 80, -9, 6, 7, 26, 77, -9, 7, 9, 26, 78, -12, 7, 8, 25, 80, -9, 6, 8, 26, 78, -7, 7, 9, 26, 75, 8, 47, 53, 26, 75, 5, 49, 56, 26, 78, -12, 6, 8, 26, 75, 6, 27, 53, 26, 76, 9, 46, 52, 25, 81, -3, 8, 10, 26, 77, 9, 25, 49, 26, 81, 5, 21, 28, 25, 82, -2, 8, 9, 25, 80, -8, 5, 6, 26, 79, -10, 6, 7, 26, 79, -4, 6, 8, 26, 78, -12, 6, 7, 26, 78, -9, 6, 8, 25, 78, -5, 8, 9, 26, 75, 17, 58, 80, 27, 75, 12, 56, 75, 27, 81, -10, 6, 8, 26, 78, 14, 35, 70, 26, 78, 17, 50, 65, 26, 80, -4, 7, 9, 26, 79, 18, 35, 67, 26, 78, 17, 52, 65, 25, 83, -3, 6, 7, 26, 79, -9, 6, 7, 26, 81, -9, 6, 8, 26, 79, -2, 5, 6, 25, 80, -5, 6, 8, 26, 82, -8, 6, 8, 26, 82, -3, 9, 11, 26, 77, 6, 46, 53, 27, 75, 2, 48, 53, 27, 77, -11, 6, 8, 26, 80, 3, 23, 40, 25, 79, 3, 31, 34, 25, 80, -6, 5, 7, 26, 79, 7, 21, 38, 26, 79, 3, 25, 28, 26, 81, -4, 4, 6, 25, 79, -5, 5, 6, 26, 79, -10, 5, 6, 25, 81, -1, 7, 10, 25, 80, -3, 8, 10, 26, 81, -5, 6, 8, 25, 83, -2, 8, 10, 26, 77, 21, 67, 76, 26, 76, 17, 61, 69, 25, 80, -4, 7, 8, 26, 76, 20, 60, 86, 26, 77, 10, 49, 56, 26, 78, -6, 6, 7, 26, 75, 21, 57, 84, 26, 74, 6, 50, 57, 26, 79, -7, 4, 5, 26, 80, -8, 5, 7, 27, 77, -11, 5, 7, 26, 82, -1, 6, 8, 26, 82, -4, 7, 8, 25, 82, -2, 8, 10, 25, 80, -3, 7, 9, 27, 79, 12, 50, 54, 26, 79, 11, 46, 52, 25, 83, -2, 8, 10, 26, 81, 11, 29, 51, 26, 79, 8, 46, 54, 26, 78, -9, 5, 6, 26, 76, 5, 30, 53, 27, 75, 4, 47, 55, 26, 80, -7, 6, 8, 26, 79, -11, 6, 7, 27, 77, -13, 5, 7, 25, 84, 1, 9, 11, 24, 84, -1, 8, 10, 24, 85, 0, 9, 11, 25, 84, 2, 7, 9, 25, 84, 1, 7, 9, 25, 83, 1, 10, 17, 24, 84, 0, 8, 10, 25, 85, -2, 10, 12, 26, 80, -8, 6, 13, 26, 78, -10, 6, 8, 26, 77, -12, 6, 7, 27, 78, -11, 5, 12, 26, 80, -7, 6, 7, 26, 78, -11, 6, 8, 27, 76, -12, 6, 8],
            "solution": {
                "type": "dig",
                "spot": {"x": 2488, "y": 3308, "level": 0},
            }
        },
        {
            "id": 46,
            "type": "map",
            "tier": "hard",
            "image_url": "assets/Map_clue_Dark_Warriors'_Fortress.png",
            "text": ["A crate in the courtyard of a castle."],
            "ocr_data": [26, 77, 170, 26, 77, -14, 6, 8, 26, 77, -15, 8, 10, 25, 78, -14, 6, 7, 26, 80, -11, 5, 6, 25, 77, -12, 7, 8, 26, 77, -14, 7, 9, 26, 77, -15, 10, 13, 25, 80, -17, 9, 11, 25, 86, -16, 7, 8, 25, 82, -17, 6, 7, 26, 82, -15, 5, 10, 26, 82, -16, 6, 10, 25, 82, -16, 5, 7, 25, 85, -17, 6, 7, 26, 81, -18, 8, 10, 26, 78, -14, 7, 9, 25, 76, -18, 7, 9, 25, 79, -15, 5, 7, 26, 75, 14, 31, 39, 27, 67, 37, 58, 66, 26, 67, 28, 35, 49, 26, 68, 27, 57, 69, 25, 72, 22, 56, 69, 26, 71, 27, 55, 66, 26, 73, 21, 23, 32, 27, 69, 43, 58, 68, 27, 67, 42, 58, 68, 26, 77, -11, 14, 18, 25, 83, -20, 7, 8, 26, 80, -18, 6, 8, 25, 77, -16, 8, 10, 26, 78, -18, 6, 8, 26, 78, -17, 6, 7, 27, 69, 38, 58, 66, 27, 78, 2, 37, 43, 27, 75, 17, 60, 74, 26, 76, 16, 55, 72, 26, 77, 1, 30, 37, 26, 77, -5, 20, 36, 26, 74, 22, 63, 78, 26, 78, 12, 45, 50, 26, 74, 13, 38, 50, 26, 74, 6, 20, 24, 26, 80, -20, 6, 7, 26, 80, -19, 7, 8, 25, 78, -17, 5, 6, 25, 78, -17, 6, 8, 25, 77, -17, 4, 5, 27, 69, 32, 48, 55, 27, 79, 8, 44, 49, 26, 80, -18, 6, 8, 26, 80, 16, 56, 64, 26, 78, 3, 45, 51, 25, 78, 7, 42, 48, 26, 75, 14, 46, 53, 26, 77, -2, 25, 28, 27, 69, 33, 52, 63, 26, 77, -1, 19, 22, 25, 79, -19, 6, 8, 26, 79, -20, 5, 6, 25, 78, -14, 8, 10, 26, 78, -18, 6, 8, 25, 78, -19, 5, 6, 26, 71, 27, 32, 49, 27, 76, 13, 52, 66, 27, 76, 11, 49, 57, 27, 76, 22, 67, 77, 26, 75, 1, 44, 50, 26, 77, 6, 42, 48, 27, 73, 24, 67, 83, 26, 74, 19, 54, 60, 27, 70, 30, 51, 60, 26, 77, 1, 20, 24, 26, 81, -19, 6, 7, 26, 80, -22, 6, 7, 26, 77, -20, 5, 7, 25, 81, -18, 6, 7, 26, 78, -17, 17, 21, 27, 71, 25, 47, 56, 26, 76, -9, 24, 33, 26, 76, 3, 44, 50, 26, 78, 3, 44, 50, 26, 79, -21, 7, 8, 26, 76, -19, 7, 8, 26, 76, 6, 44, 62, 26, 76, 5, 26, 39, 27, 72, 15, 37, 42, 26, 76, 0, 18, 21, 26, 81, -19, 5, 6, 25, 80, -20, 6, 7, 26, 77, -20, 7, 9, 26, 78, -23, 7, 8, 25, 79, -15, 17, 21, 27, 68, 39, 60, 74, 26, 76, -12, 15, 23, 26, 74, 3, 47, 53, 29, 58, 46, 57, 65, 28, 66, 32, 47, 52, 26, 78, -17, 7, 9, 25, 78, 9, 45, 67, 26, 77, 10, 27, 37, 26, 77, 7, 33, 40, 26, 73, 17, 21, 24, 25, 80, -19, 5, 6, 26, 79, -21, 6, 7, 26, 79, -15, 6, 8, 26, 78, -23, 6, 7, 26, 78, -20, 6, 8, 26, 67, 34, 54, 66, 26, 75, 8, 51, 57, 27, 75, 9, 50, 58, 29, 60, 52, 60, 69, 28, 70, 37, 50, 58, 26, 78, 9, 42, 48, 27, 75, 26, 66, 77, 26, 78, 16, 43, 53, 26, 78, 7, 29, 56, 26, 70, 32, 27, 41, 26, 79, -20, 6, 7, 26, 81, -20, 6, 8, 26, 79, -13, 5, 6, 25, 80, -16, 6, 8, 26, 82, -19, 6, 8, 26, 71, 33, 49, 56, 26, 76, 6, 45, 51, 27, 76, -24, 6, 7, 27, 74, 13, 51, 64, 26, 78, 5, 32, 49, 26, 77, 7, 31, 48, 26, 76, 13, 45, 53, 25, 80, -14, 6, 7, 26, 77, 9, 31, 48, 26, 69, 36, 55, 61, 25, 79, -16, 5, 6, 26, 79, -21, 5, 6, 25, 81, -12, 7, 10, 25, 80, -14, 8, 10, 26, 81, -16, 6, 8, 26, 71, 33, 53, 60, 26, 78, 3, 34, 40, 26, 77, 8, 43, 49, 26, 78, 5, 42, 56, 26, 79, -17, 5, 7, 25, 79, -17, 6, 15, 26, 77, 5, 40, 46, 26, 76, 6, 41, 47, 26, 74, -8, 26, 40, 26, 67, 38, 56, 65, 26, 80, -19, 5, 7, 27, 77, -22, 5, 7, 26, 82, -12, 6, 8, 26, 82, -15, 7, 8, 25, 82, -13, 8, 10, 26, 74, 10, 25, 32, 27, 70, 33, 52, 59, 26, 72, 29, 53, 60, 26, 70, 39, 42, 58, 26, 70, 39, 56, 70, 27, 69, 35, 42, 68, 27, 67, 32, 56, 64, 27, 68, 28, 57, 64, 27, 70, 18, 37, 48, 26, 78, -10, 14, 19, 26, 79, -22, 6, 7, 27, 77, -24, 5, 7, 25, 84, -10, 9, 11, 24, 84, -12, 8, 10, 24, 85, -11, 9, 11, 25, 84, -9, 7, 9, 25, 84, -10, 7, 9, 25, 83, -11, 10, 12, 24, 84, -11, 8, 10, 25, 84, -8, 21, 32, 26, 80, -13, 25, 35, 26, 78, -21, 6, 11, 26, 77, -23, 6, 7, 27, 78, -23, 5, 6, 26, 80, -18, 6, 7, 26, 78, -22, 6, 8, 27, 76, -23, 6, 8],
            "solution": {
                "type": "search",
                "entity": "Crate",
                "spot": {"x": 3026, "y": 3629, "level": 0},
            }
        },
        {
            "id": 47,
            "type": "map",
            "tier": "hard",
            "image_url": "assets/Map_clue_Fort_Forinthry.png",
            "text": ["A crate outside of some fort's walls."],
            "ocr_data": [26, 77, 176, 26, 77, -7, 6, 8, 26, 77, -9, 8, 10, 25, 78, -8, 6, 7, 26, 80, -5, 5, 6, 25, 77, -6, 7, 8, 26, 77, -8, 7, 9, 26, 77, -9, 6, 8, 25, 80, -11, 7, 9, 25, 86, -10, 7, 8, 25, 83, -11, 6, 7, 26, 81, -9, 5, 7, 26, 82, -11, 5, 6, 25, 82, -10, 5, 7, 25, 85, -11, 6, 7, 26, 81, -12, 8, 10, 26, 78, 0, 35, 41, 26, 75, 12, 89, 102, 25, 79, -8, 6, 11, 26, 81, -6, 6, 8, 26, 79, -7, 7, 8, 26, 77, -10, 7, 8, 26, 78, -11, 6, 7, 24, 80, -11, 6, 8, 25, 80, -14, 5, 7, 26, 84, -9, 5, 6, 26, 83, -7, 6, 7, 26, 82, -11, 5, 6, 26, 79, -3, 33, 42, 26, 82, 3, 64, 77, 26, 81, -9, 15, 21, 25, 77, -9, 8, 10, 26, 78, -2, 39, 49, 27, 78, 15, 75, 88, 26, 81, 17, 68, 77, 27, 80, 14, 68, 76, 27, 78, 13, 69, 77, 26, 80, -2, 33, 37, 26, 80, -11, 6, 8, 26, 79, 5, 55, 62, 26, 78, 22, 87, 102, 27, 80, 23, 85, 97, 27, 79, 18, 68, 77, 27, 79, 14, 72, 85, 26, 67, 11, 51, 64, 26, 69, 2, 24, 27, 25, 78, -11, 5, 6, 25, 78, -11, 6, 8, 26, 77, -11, 4, 6, 26, 81, -11, 5, 6, 27, 81, -12, 6, 7, 26, 80, -12, 7, 8, 25, 84, -12, 7, 8, 25, 81, -15, 6, 8, 25, 63, 14, 32, 39, 25, 67, 39, 95, 108, 26, 75, 18, 71, 86, 26, 78, -3, 13, 18, 32, 75, 41, 44, 51, 28, 73, 17, 44, 52, 26, 79, -14, 5, 6, 25, 78, -8, 8, 9, 26, 78, -12, 6, 8, 25, 78, -12, 5, 6, 25, 80, -12, 6, 7, 26, 80, -11, 6, 7, 26, 80, -12, 6, 8, 26, 81, -15, 5, 7, 26, 77, -17, 5, 7, 25, 79, -11, 6, 12, 27, 34, 39, 19, 23, 25, 55, 19, 18, 21, 27, 79, -1, 17, 24, 31, 74, 44, 40, 48, 28, 78, 14, 37, 42, 26, 80, -15, 6, 7, 26, 77, -13, 5, 7, 25, 81, -12, 6, 7, 26, 78, -16, 6, 7, 26, 79, -13, 6, 8, 26, 77, -13, 6, 8, 26, 78, -15, 5, 6, 26, 80, 0, 25, 37, 26, 78, -4, 27, 36, 26, 76, -12, 10, 16, 28, 21, 56, 7, 11, 27, 35, 38, 17, 20, 27, 79, -10, 7, 9, 26, 81, 2, 22, 28, 28, 81, 12, 42, 49, 27, 80, 4, 30, 35, 26, 77, -14, 7, 8, 26, 78, -16, 7, 8, 25, 80, -14, 6, 8, 26, 78, -13, 7, 9, 26, 77, -12, 6, 8, 26, 72, -8, 15, 19, 27, 76, 6, 40, 53, 26, 76, 10, 49, 55, 26, 78, -11, 7, 9, 26, 54, 15, 17, 20, 27, 70, 12, 32, 38, 26, 82, 5, 22, 28, 25, 82, -6, 7, 10, 32, 73, 50, 42, 53, 31, 73, 41, 45, 53, 26, 77, 8, 53, 58, 27, 76, 3, 31, 50, 26, 77, 4, 25, 40, 26, 77, 0, 25, 31, 27, 78, 3, 23, 31, 27, 71, 16, 34, 54, 28, 78, 23, 67, 80, 27, 78, 11, 46, 54, 26, 67, 9, 29, 33, 25, 80, -8, 10, 17, 33, 73, 49, 29, 36, 33, 70, 53, 28, 36, 25, 83, -3, 10, 17, 26, 80, 2, 32, 37, 27, 82, 0, 30, 40, 27, 78, 16, 46, 53, 26, 78, 11, 48, 57, 27, 78, 15, 48, 65, 27, 78, 26, 48, 72, 27, 78, 10, 24, 43, 27, 76, -11, 16, 27, 27, 77, -16, 6, 8, 26, 78, 12, 48, 54, 25, 68, 5, 15, 18, 26, 55, 16, 18, 21, 28, 78, 31, 46, 51, 30, 78, 34, 52, 58, 26, 81, -8, 5, 6, 25, 79, -10, 5, 6, 26, 79, -15, 5, 6, 25, 81, -6, 8, 10, 25, 80, -8, 9, 11, 26, 81, -10, 6, 8, 25, 83, -8, 8, 11, 25, 80, -1, 10, 25, 26, 78, 7, 25, 35, 26, 76, 19, 54, 65, 26, 77, 13, 45, 51, 26, 60, 11, 17, 20, 26, 43, 28, 15, 19, 26, 79, -4, 16, 23, 26, 77, -6, 19, 23, 26, 79, -12, 4, 5, 26, 80, -13, 5, 7, 27, 77, -16, 5, 7, 26, 82, -6, 6, 8, 26, 81, -9, 7, 8, 25, 82, -7, 8, 10, 25, 80, -8, 7, 9, 26, 81, -7, 7, 8, 25, 81, -8, 6, 8, 26, 80, 20, 43, 50, 26, 80, 16, 44, 49, 26, 81, -11, 6, 7, 26, 79, -14, 5, 6, 26, 78, -14, 5, 6, 27, 77, -17, 5, 6, 26, 79, -12, 6, 7, 26, 79, -16, 6, 7, 27, 77, -18, 6, 7, 25, 84, -4, 8, 10, 25, 84, -6, 9, 11, 24, 84, -5, 10, 12, 25, 83, -4, 7, 8, 25, 84, -5, 6, 8, 25, 83, -5, 10, 12, 25, 81, 20, 44, 50, 26, 83, 19, 40, 46, 26, 81, -14, 6, 8, 26, 78, -16, 6, 8, 26, 77, -17, 6, 7, 27, 78, -17, 5, 6, 26, 79, -12, 6, 7, 26, 78, -16, 6, 8, 27, 76, -17, 6, 8],
            "solution": {
                "type": "search",
                "entity": "Crate",
                "spot": {"x": 3312, "y": 3528, "level": 0},
            }
        },
        {
            "id": 59,
            "type": "map",
            "tier": "hard",
            "image_url": "assets/Map_clue_small_volcanoes.png",
            "text": ["X marks the spot between three small volcanoes."],
            "ocr_data": [26, 78, 184, 26, 77, 0, 6, 8, 26, 77, -1, 8, 10, 25, 78, 0, 6, 7, 26, 79, 8, 24, 32, 26, 77, 4, 10, 20, 26, 77, 0, 7, 9, 26, 77, -1, 6, 8, 25, 80, -3, 7, 9, 25, 86, -2, 7, 8, 25, 82, -3, 6, 7, 26, 82, -1, 5, 6, 26, 82, -3, 4, 6, 25, 82, -2, 5, 7, 25, 85, -3, 6, 7, 26, 81, -4, 8, 10, 26, 78, 0, 7, 9, 25, 76, -4, 7, 9, 25, 79, -1, 5, 7, 26, 75, 19, 61, 68, 26, 78, 4, 18, 25, 26, 78, -3, 7, 8, 25, 78, -3, 6, 7, 24, 80, -4, 6, 8, 25, 80, -5, 5, 7, 26, 84, -1, 5, 6, 26, 83, 1, 6, 8, 26, 82, -3, 5, 6, 25, 79, -5, 5, 7, 25, 83, -6, 7, 8, 26, 80, -4, 6, 8, 25, 77, -2, 8, 10, 26, 78, -4, 6, 8, 26, 78, -3, 6, 7, 25, 82, 0, 5, 7, 26, 80, -3, 5, 6, 26, 79, -3, 5, 7, 26, 80, -4, 5, 6, 26, 80, -3, 6, 8, 25, 79, -4, 7, 8, 26, 79, -3, 5, 7, 26, 81, 0, 6, 7, 26, 79, -1, 5, 6, 26, 79, -3, 5, 7, 26, 80, -6, 6, 7, 26, 80, -5, 7, 8, 25, 78, -3, 5, 6, 25, 78, -3, 6, 8, 25, 77, -3, 4, 5, 26, 81, -3, 4, 6, 27, 81, -4, 6, 7, 26, 80, 0, 14, 19, 25, 84, -2, 12, 17, 25, 80, -7, 6, 8, 24, 80, -1, 7, 8, 25, 78, -2, 6, 8, 26, 78, 0, 7, 9, 26, 78, 2, 7, 9, 26, 80, -1, 6, 8, 25, 79, -5, 6, 8, 26, 79, -6, 5, 6, 25, 78, 0, 8, 10, 26, 78, -4, 6, 8, 25, 78, -5, 5, 6, 25, 80, -3, 6, 7, 26, 80, -3, 6, 7, 25, 58, 36, 42, 47, 25, 63, 27, 36, 41, 26, 77, -9, 5, 7, 25, 79, -3, 6, 8, 26, 77, -3, 11, 22, 25, 77, -1, 6, 8, 27, 79, 1, 8, 12, 26, 76, 19, 96, 103, 26, 81, -5, 6, 7, 26, 80, -8, 6, 7, 26, 77, -6, 5, 7, 25, 81, -4, 6, 7, 26, 78, -8, 6, 7, 26, 79, -5, 6, 8, 26, 77, -6, 6, 7, 26, 78, -7, 5, 6, 25, 80, -4, 14, 23, 25, 71, 61, 122, 141, 26, 63, 20, 42, 55, 24, 46, 101, 37, 51, 25, 76, 0, 13, 20, 27, 79, -2, 7, 9, 26, 77, 5, 20, 23, 26, 81, -5, 5, 6, 25, 80, -6, 6, 7, 26, 77, -6, 7, 9, 26, 78, -9, 7, 8, 25, 80, -6, 6, 8, 26, 78, -4, 7, 9, 26, 77, -4, 6, 8, 26, 76, -7, 7, 8, 26, 78, -8, 7, 13, 25, 75, 15, 38, 47, 25, 63, 22, 31, 41, 23, 47, 47, 22, 26, 26, 71, 13, 22, 27, 26, 82, 3, 7, 8, 25, 82, 1, 8, 9, 25, 80, -5, 5, 6, 26, 79, -7, 6, 7, 26, 79, -1, 6, 8, 26, 78, -9, 6, 7, 26, 78, -6, 6, 8, 25, 78, -2, 8, 9, 26, 78, -5, 6, 7, 27, 78, -8, 5, 7, 27, 81, -7, 6, 8, 26, 81, -4, 6, 7, 26, 81, 1, 7, 9, 26, 80, -1, 7, 9, 25, 82, 1, 6, 8, 26, 80, 2, 7, 9, 25, 83, 0, 6, 7, 26, 79, -6, 6, 7, 26, 81, -6, 6, 8, 26, 79, 1, 5, 6, 25, 80, -2, 6, 8, 26, 82, -5, 6, 8, 26, 82, 0, 9, 11, 26, 79, -5, 6, 8, 27, 76, -10, 6, 7, 27, 77, -8, 6, 11, 24, 53, 58, 59, 66, 25, 79, -1, 7, 13, 25, 80, -3, 5, 7, 25, 80, 0, 6, 7, 26, 80, -1, 4, 5, 26, 81, -1, 4, 6, 25, 79, -2, 5, 6, 26, 79, -7, 5, 6, 25, 81, 2, 7, 10, 25, 80, 0, 8, 10, 26, 81, -2, 6, 8, 25, 83, 1, 8, 10, 25, 80, 0, 6, 7, 26, 79, -2, 6, 7, 25, 80, -1, 7, 11, 25, 70, 11, 21, 25, 25, 78, -2, 7, 11, 26, 78, -3, 6, 7, 25, 79, -3, 5, 6, 26, 76, -8, 4, 5, 26, 79, -4, 4, 5, 26, 80, -5, 5, 7, 27, 77, -8, 5, 7, 26, 82, 2, 6, 8, 26, 82, -1, 7, 8, 25, 82, 1, 8, 10, 25, 80, 0, 7, 9, 26, 80, 5, 25, 33, 26, 77, 17, 76, 86, 25, 83, 1, 8, 10, 25, 83, 1, 7, 9, 26, 81, -3, 6, 7, 26, 78, -6, 5, 6, 26, 78, -7, 5, 6, 27, 77, -9, 5, 6, 26, 80, -4, 6, 8, 26, 79, -8, 6, 7, 27, 77, -10, 5, 7, 25, 84, 4, 9, 11, 24, 84, 2, 8, 10, 24, 85, 3, 9, 11, 25, 84, 5, 7, 9, 25, 84, 4, 7, 9, 25, 81, 8, 18, 24, 24, 84, 3, 8, 10, 25, 85, 1, 10, 12, 26, 80, -6, 6, 8, 26, 78, -7, 6, 8, 26, 77, -9, 6, 7, 27, 78, -9, 5, 6, 26, 80, -4, 6, 7, 26, 78, -8, 6, 8, 27, 76, -9, 6, 8],
            "solution": {
                "type": "dig",
                "spot": {"x": 3021, "y": 3913, "level": 0},
            }
        }
    ]
    export const scan: Clues.Scan[] = [
        {
            "id": 36,
            "type": "scan",
            "tier": "elite",
            "text": ["This scroll will work in the deepest levels of the Wilderness. Orb scan range: 25 paces."],
            "spots": [
                {"x": 2958, "y": 3917, "level": 0},
                {"x": 2979, "y": 3962, "level": 0},
                {"x": 2998, "y": 3914, "level": 0},
                {"x": 2956, "y": 3908, "level": 0},
                {"x": 2944, "y": 3909, "level": 0},
                {"x": 2990, "y": 3924, "level": 0},
                {"x": 3055, "y": 3914, "level": 0},
                {"x": 3060, "y": 3941, "level": 0},
                {"x": 3029, "y": 3949, "level": 0},
                {"x": 3012, "y": 3959, "level": 0},
                {"x": 3057, "y": 3948, "level": 0},
                {"x": 3048, "y": 3926, "level": 0},
                {"x": 3037, "y": 3925, "level": 0},
                {"x": 3031, "y": 3926, "level": 0},
                {"x": 3021, "y": 3926, "level": 0},
                {"x": 3110, "y": 3954, "level": 0},
                {"x": 3125, "y": 3909, "level": 0},
                {"x": 3080, "y": 3911, "level": 0},
                {"x": 3160, "y": 3943, "level": 0},
                {"x": 3182, "y": 3926, "level": 0},
                {"x": 3193, "y": 3950, "level": 0},
                {"x": 3179, "y": 3943, "level": 0},
                {"x": 3175, "y": 3962, "level": 0},
                {"x": 3242, "y": 3956, "level": 0},
                {"x": 3241, "y": 3944, "level": 0},
                {"x": 3210, "y": 3910, "level": 0},
                {"x": 3216, "y": 3944, "level": 0},
                {"x": 3266, "y": 3936, "level": 0},
                {"x": 3307, "y": 3916, "level": 0},
                {"x": 3306, "y": 3947, "level": 0},
                {"x": 3281, "y": 3942, "level": 0},
                {"x": 3315, "y": 3914, "level": 0},
                {"x": 3269, "y": 3914, "level": 0},
                {"x": 3380, "y": 3960, "level": 0},
                {"x": 3342, "y": 3894, "level": 0},
                {"x": 3334, "y": 3906, "level": 0},
                {"x": 3363, "y": 3960, "level": 0},
                {"x": 3346, "y": 3976, "level": 0},
                {"x": 3408, "y": 3937, "level": 0}
            ],
            "range": 25,
            "scantext": "deepest levels of the Wilderness"
        },
        {
            "id": 349,
            "type": "scan",
            "tier": "elite",
            "text": ["This scroll will work in the desert, east of the Elid and north of Nardah. Orb scan range: 27 paces."],
            "spots": [
                {"x": 3421, "y": 2949, "level": 0},
                {"x": 3444, "y": 2952, "level": 0},
                {"x": 3447, "y": 2967, "level": 0},
                {"x": 3438, "y": 2960, "level": 0},
                {"x": 3417, "y": 2959, "level": 0},
                {"x": 3427, "y": 2970, "level": 0},
                {"x": 3442, "y": 2974, "level": 0},
                {"x": 3408, "y": 2986, "level": 0},
                {"x": 3426, "y": 2984, "level": 0},
                {"x": 3436, "y": 2989, "level": 0},
                {"x": 3406, "y": 3003, "level": 0},
                {"x": 3393, "y": 2997, "level": 0},
                {"x": 3419, "y": 3017, "level": 0},
                {"x": 3382, "y": 3015, "level": 0},
                {"x": 3385, "y": 3024, "level": 0},
                {"x": 3383, "y": 3018, "level": 0},
                {"x": 3423, "y": 3020, "level": 0},
                {"x": 3448, "y": 3019, "level": 0},
                {"x": 3411, "y": 3048, "level": 0},
                {"x": 3422, "y": 3051, "level": 0},
                {"x": 3448, "y": 3063, "level": 0},
                {"x": 3401, "y": 3064, "level": 0},
                {"x": 3460, "y": 3022, "level": 0},
                {"x": 3476, "y": 3018, "level": 0},
                {"x": 3462, "y": 3047, "level": 0},
                {"x": 3465, "y": 3034, "level": 0},
                {"x": 3502, "y": 3050, "level": 0},
                {"x": 3510, "y": 3041, "level": 0},
                {"x": 3476, "y": 3057, "level": 0},
                {"x": 3480, "y": 3090, "level": 0},
                {"x": 3473, "y": 3082, "level": 0},
                {"x": 3482, "y": 3108, "level": 0},
                {"x": 3499, "y": 3104, "level": 0},
                {"x": 3505, "y": 3093, "level": 0},
                {"x": 3401, "y": 3099, "level": 0},
                {"x": 3396, "y": 3110, "level": 0},
                {"x": 3406, "y": 3126, "level": 0},
                {"x": 3433, "y": 3122, "level": 0},
                {"x": 3444, "y": 3085, "level": 0},
                {"x": 3446, "y": 3128, "level": 0},
                {"x": 3360, "y": 3095, "level": 0},
                {"x": 3387, "y": 3123, "level": 0},
                {"x": 3373, "y": 3126, "level": 0},
                {"x": 3384, "y": 3081, "level": 0},
                {"x": 3405, "y": 3136, "level": 0},
                {"x": 3409, "y": 3119, "level": 0},
                {"x": 3432, "y": 3105, "level": 0},
                {"x": 3427, "y": 3141, "level": 0},
                {"x": 3444, "y": 3141, "level": 0},
                {"x": 3435, "y": 3129, "level": 0},
                {"x": 3456, "y": 3140, "level": 0}
            ],
            "range": 27,
            "scantext": "the desert, east of the Elid and north of Nardah"
        },
        {
            "id": 350,
            "type": "scan",
            "tier": "elite",
            "text": ["This scroll will work in Isafdar and Lletya. Orb scan range: 22 paces."],
            "spots": [
                {"x": 2173, "y": 3125, "level": 0},
                {"x": 2283, "y": 3265, "level": 0},
                {"x": 2217, "y": 3130, "level": 0},
                {"x": 2253, "y": 3118, "level": 0},
                {"x": 2247, "y": 3143, "level": 0},
                {"x": 2271, "y": 3165, "level": 0},
                {"x": 2287, "y": 3141, "level": 0},
                {"x": 2310, "y": 3187, "level": 0},
                {"x": 2331, "y": 3171, "level": 0},
                {"x": 2322, "y": 3190, "level": 0},
                {"x": 2348, "y": 3183, "level": 0},
                {"x": 2225, "y": 3145, "level": 0},
                {"x": 2186, "y": 3146, "level": 0},
                {"x": 2205, "y": 3155, "level": 0},
                {"x": 2216, "y": 3159, "level": 0},
                {"x": 2182, "y": 3192, "level": 0},
                {"x": 2226, "y": 3158, "level": 0},
                {"x": 2176, "y": 3201, "level": 0},
                {"x": 2225, "y": 3212, "level": 0},
                {"x": 2219, "y": 3221, "level": 0},
                {"x": 2194, "y": 3220, "level": 0},
                {"x": 2194, "y": 3237, "level": 0},
                {"x": 2229, "y": 3248, "level": 0},
                {"x": 2203, "y": 3254, "level": 0},
                {"x": 2258, "y": 3212, "level": 0},
                {"x": 2289, "y": 3220, "level": 0},
                {"x": 2302, "y": 3230, "level": 0},
                {"x": 2282, "y": 3262, "level": 0},
                {"x": 2232, "y": 3223, "level": 0}
            ],
            "range": 22,
            "scantext": "Isafdar and Lletya"
        },
        {
            "id": 351,
            "type": "scan",
            "tier": "elite",
            "text": ["This scroll will work within the walls of Varrock and the Grand Exchange Orb scan range: 16 paces"],
            "spots": [
                {"x": 3197, "y": 3383, "level": 0},
                {"x": 3211, "y": 3385, "level": 0},
                {"x": 3228, "y": 3383, "level": 0},
                {"x": 3240, "y": 3383, "level": 0},
                {"x": 3175, "y": 3404, "level": 0},
                {"x": 3175, "y": 3415, "level": 0},
                {"x": 3196, "y": 3415, "level": 0},
                {"x": 3197, "y": 3423, "level": 0},
                {"x": 3253, "y": 3393, "level": 0},
                {"x": 3228, "y": 3409, "level": 0},
                {"x": 3231, "y": 3439, "level": 0},
                {"x": 3220, "y": 3407, "level": 0},
                {"x": 3204, "y": 3409, "level": 0},
                {"x": 3273, "y": 3398, "level": 0},
                {"x": 3284, "y": 3378, "level": 0},
                {"x": 3185, "y": 3472, "level": 0},
                {"x": 3188, "y": 3488, "level": 0},
                {"x": 3180, "y": 3510, "level": 0},
                {"x": 3141, "y": 3488, "level": 0},
                {"x": 3213, "y": 3484, "level": 0},
                {"x": 3230, "y": 3494, "level": 0},
                {"x": 3241, "y": 3480, "level": 0},
                {"x": 3213, "y": 3462, "level": 0},
                {"x": 3248, "y": 3454, "level": 0}
            ],
            "range": 16,
            "scantext": "Varrock and the Grand Exchange"
        },
        {
            "id": 352,
            "type": "scan",
            "tier": "elite",
            "text": ["This scroll will work within the walls of East or West Ardougne. Orb scan range: 22 paces."],
            "spots": [
                {"x": 2442, "y": 3310, "level": 0},
                {"x": 2440, "y": 3319, "level": 0},
                {"x": 2462, "y": 3282, "level": 0},
                {"x": 2483, "y": 3313, "level": 0},
                {"x": 2467, "y": 3319, "level": 0},
                {"x": 2496, "y": 3282, "level": 0},
                {"x": 2517, "y": 3281, "level": 0},
                {"x": 2512, "y": 3267, "level": 0},
                {"x": 2529, "y": 3270, "level": 0},
                {"x": 2537, "y": 3306, "level": 0},
                {"x": 2520, "y": 3318, "level": 0},
                {"x": 2500, "y": 3290, "level": 0},
                {"x": 2540, "y": 3331, "level": 0},
                {"x": 2509, "y": 3330, "level": 0},
                {"x": 2475, "y": 3331, "level": 0},
                {"x": 2583, "y": 3265, "level": 0},
                {"x": 2589, "y": 3319, "level": 0},
                {"x": 2582, "y": 3314, "level": 0},
                {"x": 2623, "y": 3311, "level": 0},
                {"x": 2570, "y": 3321, "level": 0},
                {"x": 2662, "y": 3304, "level": 0},
                {"x": 2625, "y": 3292, "level": 0},
                {"x": 2635, "y": 3313, "level": 0},
                {"x": 2662, "y": 3338, "level": 0},
                {"x": 2633, "y": 3339, "level": 0},
                {"x": 2613, "y": 3337, "level": 0},
                {"x": 2589, "y": 3330, "level": 0},
                {"x": 2569, "y": 3340, "level": 0}
            ],
            "range": 22,
            "scantext": "East or West Ardougne"
        },
        {
            "id": 353,
            "type": "scan",
            "tier": "elite",
            "text": ["This scroll will work within the dwarven city of Keldagrim. Orb scan range: 11 paces."],
            "spots": [
                {"x": 2841, "y": 10189, "level": 0},
                {"x": 2856, "y": 10192, "level": 0},
                {"x": 2822, "y": 10193, "level": 0},
                {"x": 2873, "y": 10194, "level": 0},
                {"x": 2872, "y": 10181, "level": 0},
                {"x": 2846, "y": 10233, "level": 0},
                {"x": 2860, "y": 10215, "level": 0},
                {"x": 2837, "y": 10209, "level": 0},
                {"x": 2905, "y": 10162, "level": 0},
                {"x": 2924, "y": 10162, "level": 0},
                {"x": 2938, "y": 10162, "level": 0},
                {"x": 2936, "y": 10206, "level": 0},
                {"x": 2906, "y": 10202, "level": 0},
                {"x": 2937, "y": 10191, "level": 0},
                {"x": 2904, "y": 10193, "level": 0},
                {"x": 2924, "y": 10191, "level": 0},
                {"x": 2922, "y": 10179, "level": 0},
                {"x": 2938, "y": 10179, "level": 0}
            ],
            "range": 11,
            "scantext": "Keldagrim"
        },
        {
            "id": 354,
            "type": "scan",
            "tier": "elite",
            "text": ["This scroll will work in Menaphos. Orb scan range: 30 paces"],
            "spots": [
                {"x": 3099, "y": 2677, "level": 0},
                {"x": 3127, "y": 2643, "level": 0},
                {"x": 3095, "y": 2730, "level": 0},
                {"x": 3096, "y": 2692, "level": 0},
                {"x": 3108, "y": 2742, "level": 0},
                {"x": 3131, "y": 2791, "level": 0},
                {"x": 3135, "y": 2775, "level": 0},
                {"x": 3146, "y": 2659, "level": 0},
                {"x": 3155, "y": 2641, "level": 0},
                {"x": 3180, "y": 2669, "level": 0},
                {"x": 3180, "y": 2700, "level": 0},
                {"x": 3199, "y": 2750, "level": 0},
                {"x": 3145, "y": 2759, "level": 0},
                {"x": 3153, "y": 2799, "level": 0},
                {"x": 3165, "y": 2814, "level": 0},
                {"x": 3193, "y": 2797, "level": 0},
                {"x": 3237, "y": 2664, "level": 0},
                {"x": 3200, "y": 2709, "level": 0},
                {"x": 3210, "y": 2770, "level": 0},
                {"x": 3231, "y": 2770, "level": 0},
                {"x": 3238, "y": 2792, "level": 0}
            ],
            "range": 30,
            "scantext": "Menaphos"
        },
        {
            "id": 355,
            "type": "scan",
            "tier": "elite",
            "text": ["This scroll will work in the Piscatoris Hunter Area. Orb scan range: 14 paces."],
            "spots": [
                {"x": 2310, "y": 3518, "level": 0},
                {"x": 2336, "y": 3540, "level": 0},
                {"x": 2364, "y": 3547, "level": 0},
                {"x": 2353, "y": 3543, "level": 0},
                {"x": 2324, "y": 3553, "level": 0},
                {"x": 2361, "y": 3567, "level": 0},
                {"x": 2308, "y": 3560, "level": 0},
                {"x": 2313, "y": 3576, "level": 0},
                {"x": 2331, "y": 3574, "level": 0},
                {"x": 2342, "y": 3575, "level": 0},
                {"x": 2358, "y": 3557, "level": 0},
                {"x": 2363, "y": 3527, "level": 0},
                {"x": 2358, "y": 3580, "level": 0},
                {"x": 2388, "y": 3586, "level": 0},
                {"x": 2398, "y": 3582, "level": 0},
                {"x": 2392, "y": 3591, "level": 0},
                {"x": 2373, "y": 3612, "level": 0},
                {"x": 2372, "y": 3626, "level": 0},
                {"x": 2318, "y": 3601, "level": 0},
                {"x": 2339, "y": 3589, "level": 0},
                {"x": 2362, "y": 3612, "level": 0},
                {"x": 2347, "y": 3609, "level": 0},
                {"x": 2332, "y": 3632, "level": 0},
                {"x": 2320, "y": 3625, "level": 0},
                {"x": 2344, "y": 3645, "level": 0},
                {"x": 2310, "y": 3587, "level": 0}
            ],
            "range": 14,
            "scantext": "Piscatoris Hunter Area"
        },
        {
            "id": 356,
            "type": "scan",
            "tier": "elite",
            "text": ["This scroll will work in Brimhaven Dungeon. Orb scan range: 14 paces."],
            "spots": [
                {"x": 2703, "y": 9439, "level": 0},
                {"x": 2738, "y": 9456, "level": 0},
                {"x": 2737, "y": 9433, "level": 0},
                {"x": 2722, "y": 9444, "level": 0},
                {"x": 2729, "y": 9427, "level": 0},
                {"x": 2695, "y": 9457, "level": 0},
                {"x": 2739, "y": 9506, "level": 0},
                {"x": 2745, "y": 9488, "level": 0},
                {"x": 2707, "y": 9486, "level": 0},
                {"x": 2699, "y": 9481, "level": 0},
                {"x": 2730, "y": 9513, "level": 0},
                {"x": 2717, "y": 9517, "level": 0},
                {"x": 2712, "y": 9524, "level": 0},
                {"x": 2701, "y": 9516, "level": 0},
                {"x": 2713, "y": 9503, "level": 0},
                {"x": 2679, "y": 9479, "level": 0},
                {"x": 2650, "y": 9488, "level": 0},
                {"x": 2649, "y": 9499, "level": 0},
                {"x": 2665, "y": 9504, "level": 0},
                {"x": 2681, "y": 9505, "level": 0},
                {"x": 2647, "y": 9511, "level": 0},
                {"x": 2664, "y": 9522, "level": 0},
                {"x": 2672, "y": 9514, "level": 0},
                {"x": 2652, "y": 9528, "level": 0},
                {"x": 2640, "y": 9533, "level": 0},
                {"x": 2641, "y": 9541, "level": 0},
                {"x": 2680, "y": 9542, "level": 0},
                {"x": 2669, "y": 9573, "level": 0},
                {"x": 2675, "y": 9582, "level": 0},
                {"x": 2660, "y": 9589, "level": 0},
                {"x": 2642, "y": 9575, "level": 0},
                {"x": 2638, "y": 9594, "level": 2},
                {"x": 2630, "y": 9581, "level": 2},
                {"x": 2638, "y": 9566, "level": 2},
                {"x": 2634, "y": 9551, "level": 2},
                {"x": 2627, "y": 9530, "level": 2},
                {"x": 2631, "y": 9516, "level": 2},
                {"x": 2639, "y": 9504, "level": 2},
                {"x": 2628, "y": 9489, "level": 2},
                {"x": 2655, "y": 9475, "level": 2},
                {"x": 2703, "y": 9564, "level": 0},
                {"x": 2697, "y": 9563, "level": 0}
            ],
            "range": 14,
            "scantext": "Brimhaven Dungeon"
        },
        {
            "id": 357,
            "type": "scan",
            "tier": "elite",
            "text": ["This scroll will work in Taverley Dungeon. Orb scan range: 22 paces."],
            "spots": [
                {"x": 2858, "y": 9788, "level": 0},
                {"x": 2870, "y": 9791, "level": 0},
                {"x": 2875, "y": 9805, "level": 0},
                {"x": 2832, "y": 9813, "level": 0},
                {"x": 2835, "y": 9819, "level": 0},
                {"x": 2822, "y": 9826, "level": 0},
                {"x": 2892, "y": 9783, "level": 0},
                {"x": 2895, "y": 9769, "level": 0},
                {"x": 2914, "y": 9757, "level": 0},
                {"x": 2936, "y": 9764, "level": 0},
                {"x": 2905, "y": 9734, "level": 0},
                {"x": 2907, "y": 9718, "level": 0},
                {"x": 2907, "y": 9705, "level": 0},
                {"x": 2926, "y": 9692, "level": 0},
                {"x": 2968, "y": 9786, "level": 0},
                {"x": 2952, "y": 9786, "level": 0},
                {"x": 2949, "y": 9773, "level": 0},
                {"x": 2938, "y": 9812, "level": 0},
                {"x": 2904, "y": 9809, "level": 0},
                {"x": 2884, "y": 9799, "level": 0},
                {"x": 2895, "y": 9831, "level": 0},
                {"x": 2933, "y": 9848, "level": 0},
                {"x": 2907, "y": 9842, "level": 0},
                {"x": 2888, "y": 9846, "level": 0},
                {"x": 2945, "y": 9796, "level": 0}
            ],
            "range": 22,
            "scantext": "Taverley Dungeon"
        },
        {
            "id": 358,
            "type": "scan",
            "tier": "elite",
            "text": ["This scroll will work on the faraway island of Mos Le'Harmless. Orb scan range: 27 paces."],
            "spots": [
                {"x": 3702, "y": 2972, "level": 0},
                {"x": 3657, "y": 2955, "level": 0},
                {"x": 3699, "y": 2996, "level": 0},
                {"x": 3651, "y": 2991, "level": 0},
                {"x": 3692, "y": 2976, "level": 0},
                {"x": 3676, "y": 2981, "level": 0},
                {"x": 3773, "y": 2960, "level": 0},
                {"x": 3728, "y": 2973, "level": 0},
                {"x": 3730, "y": 2996, "level": 0},
                {"x": 3765, "y": 2995, "level": 0},
                {"x": 3717, "y": 2969, "level": 0},
                {"x": 3758, "y": 2956, "level": 0},
                {"x": 3752, "y": 3006, "level": 0},
                {"x": 3669, "y": 3055, "level": 0},
                {"x": 3695, "y": 3063, "level": 0},
                {"x": 3697, "y": 3052, "level": 0},
                {"x": 3687, "y": 3046, "level": 0},
                {"x": 3679, "y": 3018, "level": 0},
                {"x": 3702, "y": 3027, "level": 0},
                {"x": 3757, "y": 3063, "level": 0},
                {"x": 3742, "y": 3063, "level": 0},
                {"x": 3736, "y": 3041, "level": 0},
                {"x": 3726, "y": 3038, "level": 0},
                {"x": 3765, "y": 3030, "level": 0},
                {"x": 3769, "y": 3015, "level": 0},
                {"x": 3740, "y": 3018, "level": 0},
                {"x": 3802, "y": 3035, "level": 0},
                {"x": 3791, "y": 3023, "level": 0},
                {"x": 3818, "y": 3027, "level": 0},
                {"x": 3831, "y": 3031, "level": 0},
                {"x": 3843, "y": 2987, "level": 0},
                {"x": 3850, "y": 3010, "level": 0}
            ],
            "range": 27,
            "scantext": "Mos Le'Harmless"
        },
        {
            "id": 359,
            "type": "scan",
            "tier": "elite",
            "text": ["This scroll will work within the Haunted Woods. Orb scan range: 11 paces."],
            "spots": [
                {"x": 3534, "y": 3470, "level": 0},
                {"x": 3523, "y": 3460, "level": 0},
                {"x": 3551, "y": 3514, "level": 0},
                {"x": 3575, "y": 3511, "level": 0},
                {"x": 3562, "y": 3509, "level": 0},
                {"x": 3583, "y": 3484, "level": 0},
                {"x": 3583, "y": 3466, "level": 0},
                {"x": 3552, "y": 3483, "level": 0},
                {"x": 3573, "y": 3484, "level": 0},
                {"x": 3529, "y": 3501, "level": 0},
                {"x": 3544, "y": 3465, "level": 0},
                {"x": 3567, "y": 3475, "level": 0},
                {"x": 3609, "y": 3499, "level": 0},
                {"x": 3596, "y": 3501, "level": 0},
                {"x": 3637, "y": 3486, "level": 0},
                {"x": 3623, "y": 3476, "level": 0},
                {"x": 3604, "y": 3507, "level": 0},
                {"x": 3624, "y": 3508, "level": 0},
                {"x": 3616, "y": 3512, "level": 0},
                {"x": 3606, "y": 3465, "level": 0},
                {"x": 3590, "y": 3475, "level": 0}
            ],
            "range": 11,
            "scantext": "the Haunted Woods"
        },
        {
            "id": 360,
            "type": "scan",
            "tier": "elite",
            "text": ["This scroll will work in the Kharazi Jungle. Orb scan range: 14 paces."],
            "spots": [
                {"x": 2775, "y": 2891, "level": 0},
                {"x": 2786, "y": 2914, "level": 0},
                {"x": 2804, "y": 2924, "level": 0},
                {"x": 2762, "y": 2918, "level": 0},
                {"x": 2775, "y": 2936, "level": 0},
                {"x": 2766, "y": 2932, "level": 0},
                {"x": 2815, "y": 2887, "level": 0},
                {"x": 2859, "y": 2891, "level": 0},
                {"x": 2848, "y": 2907, "level": 0},
                {"x": 2827, "y": 2934, "level": 0},
                {"x": 2832, "y": 2935, "level": 0},
                {"x": 2852, "y": 2934, "level": 0},
                {"x": 2857, "y": 2919, "level": 0},
                {"x": 2841, "y": 2915, "level": 0},
                {"x": 2872, "y": 2901, "level": 0},
                {"x": 2920, "y": 2888, "level": 0},
                {"x": 2892, "y": 2907, "level": 0},
                {"x": 2931, "y": 2920, "level": 0},
                {"x": 2921, "y": 2937, "level": 0},
                {"x": 2892, "y": 2937, "level": 0},
                {"x": 2929, "y": 2894, "level": 0},
                {"x": 2927, "y": 2925, "level": 0},
                {"x": 2936, "y": 2917, "level": 0},
                {"x": 2944, "y": 2902, "level": 0},
                {"x": 2932, "y": 2935, "level": 0},
                {"x": 2942, "y": 2934, "level": 0}
            ],
            "range": 14,
            "scantext": "the Kharazi Jungle"
        },
        {
            "id": 361,
            "type": "scan",
            "tier": "elite",
            "text": ["This scroll will work in the city of Zanaris. Orb scan range: 16 paces."],
            "spots": [
                {"x": 2414, "y": 4378, "level": 0},
                {"x": 2423, "y": 4372, "level": 0},
                {"x": 2420, "y": 4381, "level": 0},
                {"x": 2389, "y": 4405, "level": 0},
                {"x": 2377, "y": 4410, "level": 0},
                {"x": 2404, "y": 4406, "level": 0},
                {"x": 2372, "y": 4467, "level": 0},
                {"x": 2402, "y": 4466, "level": 0},
                {"x": 2396, "y": 4457, "level": 0},
                {"x": 2410, "y": 4460, "level": 0},
                {"x": 2400, "y": 4441, "level": 0},
                {"x": 2380, "y": 4421, "level": 0},
                {"x": 2406, "y": 4428, "level": 0},
                {"x": 2429, "y": 4431, "level": 0},
                {"x": 2417, "y": 4444, "level": 0},
                {"x": 2417, "y": 4470, "level": 0},
                {"x": 2385, "y": 4447, "level": 0},
                {"x": 2439, "y": 4460, "level": 0},
                {"x": 2441, "y": 4428, "level": 0},
                {"x": 2468, "y": 4439, "level": 0},
                {"x": 2457, "y": 4443, "level": 0},
                {"x": 2453, "y": 4471, "level": 0}
            ],
            "range": 16,
            "scantext": "Zanaris"
        },
        {
            "id": 362,
            "type": "scan",
            "tier": "elite",
            "text": ["This scroll will work in the dark and damp caves below Lumbridge Swamp. Orb scan range: 11 paces."],
            "spots": [
                {"x": 3172, "y": 9570, "level": 0},
                {"x": 3167, "y": 9546, "level": 0},
                {"x": 3179, "y": 9559, "level": 0},
                {"x": 3191, "y": 9555, "level": 0},
                {"x": 3170, "y": 9557, "level": 0},
                {"x": 3210, "y": 9557, "level": 0},
                {"x": 3233, "y": 9547, "level": 0},
                {"x": 3246, "y": 9566, "level": 0},
                {"x": 3252, "y": 9577, "level": 0},
                {"x": 3227, "y": 9575, "level": 0},
                {"x": 3209, "y": 9587, "level": 0},
                {"x": 3210, "y": 9571, "level": 0}
            ],
            "range": 11,
            "scantext": "The caves beneath Lumbridge Swamp"
        },
        {
            "id": 363,
            "type": "scan",
            "tier": "elite",
            "text": ["This scroll will work on the Fremennik Isles of Jatizso and Neitiznot. Orb scan range: 16 paces."],
            "spots": [
                {"x": 2354, "y": 3790, "level": 0},
                {"x": 2360, "y": 3799, "level": 0},
                {"x": 2324, "y": 3808, "level": 0},
                {"x": 2322, "y": 3787, "level": 0},
                {"x": 2311, "y": 3801, "level": 0},
                {"x": 2340, "y": 3803, "level": 0},
                {"x": 2342, "y": 3809, "level": 0},
                {"x": 2330, "y": 3829, "level": 0},
                {"x": 2311, "y": 3835, "level": 0},
                {"x": 2376, "y": 3800, "level": 0},
                {"x": 2381, "y": 3789, "level": 0},
                {"x": 2402, "y": 3789, "level": 0},
                {"x": 2421, "y": 3792, "level": 0},
                {"x": 2397, "y": 3801, "level": 0},
                {"x": 2419, "y": 3833, "level": 0},
                {"x": 2395, "y": 3812, "level": 0},
                {"x": 2373, "y": 3834, "level": 0},
                {"x": 2314, "y": 3851, "level": 0},
                {"x": 2326, "y": 3866, "level": 0},
                {"x": 2326, "y": 3850, "level": 0},
                {"x": 2354, "y": 3853, "level": 0},
                {"x": 2349, "y": 3880, "level": 0},
                {"x": 2312, "y": 3894, "level": 0},
                {"x": 2352, "y": 3892, "level": 0},
                {"x": 2414, "y": 3848, "level": 0},
                {"x": 2418, "y": 3870, "level": 0},
                {"x": 2377, "y": 3850, "level": 0},
                {"x": 2400, "y": 3870, "level": 0},
                {"x": 2368, "y": 3870, "level": 0},
                {"x": 2417, "y": 3893, "level": 0},
                {"x": 2399, "y": 3888, "level": 0},
                {"x": 2389, "y": 3899, "level": 0}
            ],
            "range": 16,
            "scantext": "Fremennik Isles of Jatizso and Neitiznot"
        },
        {
            "id": 364,
            "type": "scan",
            "tier": "elite",
            "text": ["This scroll will work within the walls of Falador. Orb scan range: 22 paces."],
            "spots": [
                {"x": 2938, "y": 3322, "level": 0},
                {"x": 2976, "y": 3316, "level": 0},
                {"x": 2947, "y": 3316, "level": 0},
                {"x": 3005, "y": 3326, "level": 0},
                {"x": 2958, "y": 3379, "level": 0},
                {"x": 2972, "y": 3342, "level": 0},
                {"x": 2945, "y": 3339, "level": 0},
                {"x": 2948, "y": 3390, "level": 0},
                {"x": 2942, "y": 3388, "level": 0},
                {"x": 2939, "y": 3355, "level": 0},
                {"x": 3039, "y": 3331, "level": 0},
                {"x": 3050, "y": 3348, "level": 0},
                {"x": 3015, "y": 3339, "level": 0},
                {"x": 3027, "y": 3365, "level": 0},
                {"x": 3025, "y": 3379, "level": 0},
                {"x": 3059, "y": 3384, "level": 0},
                {"x": 3031, "y": 3379, "level": 0},
                {"x": 3011, "y": 3382, "level": 0}
            ],
            "range": 22,
            "scantext": "Falador"
        },
        {
            "id": 365,
            "type": "scan",
            "tier": "elite",
            "text": ["This scroll will work in the cave goblin city of Dorgesh-Kaan. Orb scan range: 16 paces."],
            "spots": [
                {"x": 2747, "y": 5263, "level": 0},
                {"x": 2731, "y": 5266, "level": 0},
                {"x": 2740, "y": 5273, "level": 0},
                {"x": 2723, "y": 5279, "level": 0},
                {"x": 2711, "y": 5271, "level": 0},
                {"x": 2729, "y": 5295, "level": 0},
                {"x": 2711, "y": 5284, "level": 0},
                {"x": 2730, "y": 5315, "level": 0},
                {"x": 2717, "y": 5311, "level": 0},
                {"x": 2739, "y": 5253, "level": 1},
                {"x": 2738, "y": 5301, "level": 1},
                {"x": 2700, "y": 5284, "level": 1},
                {"x": 2704, "y": 5321, "level": 0},
                {"x": 2732, "y": 5327, "level": 0},
                {"x": 2704, "y": 5349, "level": 0},
                {"x": 2701, "y": 5343, "level": 1},
                {"x": 2704, "y": 5357, "level": 1},
                {"x": 2734, "y": 5370, "level": 1},
                {"x": 2747, "y": 5327, "level": 1},
                {"x": 2698, "y": 5316, "level": 1}
            ],
            "range": 16,
            "scantext": "Dorgesh-Kaan"
        },
        {
            "id": 366,
            "type": "scan",
            "tier": "elite",
            "text": ["This scroll will work in the Fremennik Slayer Dungeons. Orb scan range: 16 paces."],
            "spots": [
                {"x": 2720, "y": 9969, "level": 0},
                {"x": 2741, "y": 9977, "level": 0},
                {"x": 2701, "y": 9978, "level": 0},
                {"x": 2724, "y": 9977, "level": 0},
                {"x": 2714, "y": 9990, "level": 0},
                {"x": 2731, "y": 9998, "level": 0},
                {"x": 2718, "y": 10000, "level": 0},
                {"x": 2722, "y": 10025, "level": 0},
                {"x": 2705, "y": 10027, "level": 0},
                {"x": 2745, "y": 10024, "level": 0},
                {"x": 2743, "y": 9986, "level": 0},
                {"x": 2751, "y": 9995, "level": 0},
                {"x": 2754, "y": 10009, "level": 0},
                {"x": 2804, "y": 10004, "level": 0},
                {"x": 2808, "y": 10018, "level": 0},
                {"x": 2789, "y": 10042, "level": 0},
                {"x": 2772, "y": 10030, "level": 0},
                {"x": 2757, "y": 10029, "level": 0},
                {"x": 2767, "y": 10002, "level": 0}
            ],
            "range": 16,
            "scantext": "Fremennik Slayer Dungeons"
        },
        {
            "id": 367,
            "type": "scan",
            "tier": "elite",
            "text": ["This scroll will work in the crater of the Wilderness volcano. Orb scan range: 11 paces."],
            "spots": [
                {"x": 3112, "y": 3678, "level": 0},
                {"x": 3124, "y": 3698, "level": 0},
                {"x": 3130, "y": 3672, "level": 0},
                {"x": 3120, "y": 3665, "level": 0},
                {"x": 3104, "y": 3704, "level": 0},
                {"x": 3087, "y": 3712, "level": 0},
                {"x": 3133, "y": 3717, "level": 0},
                {"x": 3118, "y": 3724, "level": 0},
                {"x": 3110, "y": 3735, "level": 0},
                {"x": 3096, "y": 3738, "level": 0},
                {"x": 3134, "y": 3741, "level": 0},
                {"x": 3169, "y": 3745, "level": 0},
                {"x": 3180, "y": 3713, "level": 0},
                {"x": 3163, "y": 3724, "level": 0},
                {"x": 3146, "y": 3738, "level": 0},
                {"x": 3174, "y": 3705, "level": 0},
                {"x": 3152, "y": 3698, "level": 0},
                {"x": 3145, "y": 3681, "level": 0},
                {"x": 3146, "y": 3698, "level": 0}
            ],
            "range": 11,
            "scantext": "The crater of the Wilderness volcano"
        },
        {
            "id": 368,
            "type": "scan",
            "tier": "master",
            "text": ["This scroll will work in the elven city of Prifddinas. Orb scan range: 30 paces."],
            "spots": [
                {"x": 2175, "y": 3291, "level": 1},
                {"x": 2133, "y": 3379, "level": 1},
                {"x": 2145, "y": 3381, "level": 1},
                {"x": 2148, "y": 3351, "level": 1},
                {"x": 2174, "y": 3398, "level": 1},
                {"x": 2180, "y": 3322, "level": 1},
                {"x": 2199, "y": 3268, "level": 1},
                {"x": 2212, "y": 3272, "level": 1},
                {"x": 2227, "y": 3295, "level": 1},
                {"x": 2224, "y": 3328, "level": 1},
                {"x": 2197, "y": 3433, "level": 1},
                {"x": 2222, "y": 3429, "level": 1},
                {"x": 2228, "y": 3424, "level": 1},
                {"x": 2247, "y": 3267, "level": 1},
                {"x": 2234, "y": 3265, "level": 1},
                {"x": 2275, "y": 3382, "level": 1},
                {"x": 2292, "y": 3361, "level": 1},
                {"x": 2268, "y": 3397, "level": 1}
            ],
            "range": 30,
            "scantext": "Prifddinas"
        },
        {
            "id": 369,
            "type": "scan",
            "tier": "master",
            "text": ["This scroll will work in the vampyre city of Darkmeyer. Orb scan range: 16 paces."],
            "spots": [
                {"x": 3599, "y": 3328, "level": 0},
                {"x": 3590, "y": 3344, "level": 0},
                {"x": 3588, "y": 3361, "level": 0},
                {"x": 3596, "y": 3375, "level": 0},
                {"x": 3631, "y": 3358, "level": 0},
                {"x": 3611, "y": 3328, "level": 0},
                {"x": 3606, "y": 3391, "level": 0},
                {"x": 3639, "y": 3390, "level": 0},
                {"x": 3651, "y": 3405, "level": 0},
                {"x": 3670, "y": 3373, "level": 0},
                {"x": 3632, "y": 3344, "level": 0},
                {"x": 3654, "y": 3335, "level": 0},
                {"x": 3666, "y": 3344, "level": 0},
                {"x": 3654, "y": 3357, "level": 0},
                {"x": 3671, "y": 3366, "level": 0},
                {"x": 3661, "y": 3374, "level": 0},
                {"x": 3676, "y": 3392, "level": 0}
            ],
            "range": 16,
            "scantext": "Darkmeyer"
        },
        {
            "id": 370,
            "type": "scan",
            "tier": "master",
            "text": ["This scroll will work on The Islands That Once Were Turtles. Orb scan range: 27 paces."],
            "spots": [
                {"x": 2103, "y": 11425, "level": 0},
                {"x": 2092, "y": 11427, "level": 0},
                {"x": 2100, "y": 11432, "level": 0},
                {"x": 2101, "y": 11440, "level": 0},
                {"x": 2099, "y": 11448, "level": 0},
                {"x": 2286, "y": 11452, "level": 0},
                {"x": 2285, "y": 11440, "level": 0},
                {"x": 2266, "y": 11455, "level": 0},
                {"x": 2221, "y": 11497, "level": 0},
                {"x": 2198, "y": 11481, "level": 0},
                {"x": 2183, "y": 11500, "level": 0},
                {"x": 2194, "y": 11500, "level": 0},
                {"x": 2200, "y": 11501, "level": 0},
                {"x": 2251, "y": 11428, "level": 0},
                {"x": 2267, "y": 11441, "level": 0},
                {"x": 2275, "y": 11453, "level": 0},
                {"x": 2283, "y": 11499, "level": 0},
                {"x": 2272, "y": 11428, "level": 0},
                {"x": 2286, "y": 11473, "level": 0}
            ],
            "range": 27,
            "scantext": "Islands That Once Were Turtles"
        },
        {
            "id": 371,
            "type": "scan",
            "tier": "master",
            "text": ["This scroll will work in the the Heart of Gielinor. Orb scan range: 49 paces."],
            "spots": [
                {"x": 3119, "y": 6905, "level": 1},
                {"x": 3124, "y": 6905, "level": 1},
                {"x": 3148, "y": 6913, "level": 1},
                {"x": 3131, "y": 6921, "level": 1},
                {"x": 3131, "y": 6932, "level": 1},
                {"x": 3156, "y": 6925, "level": 1},
                {"x": 3166, "y": 6910, "level": 1},
                {"x": 3165, "y": 6932, "level": 1},
                {"x": 3236, "y": 6924, "level": 1},
                {"x": 3257, "y": 6927, "level": 1},
                {"x": 3258, "y": 6913, "level": 1},
                {"x": 3248, "y": 6903, "level": 1},
                {"x": 3227, "y": 6982, "level": 1},
                {"x": 3217, "y": 7004, "level": 1},
                {"x": 3219, "y": 7023, "level": 1},
                {"x": 3180, "y": 6985, "level": 1},
                {"x": 3129, "y": 6998, "level": 1},
                {"x": 3141, "y": 7018, "level": 1},
                {"x": 3183, "y": 7015, "level": 1},
                {"x": 3194, "y": 7029, "level": 1},
                {"x": 3210, "y": 7028, "level": 1},
                {"x": 3229, "y": 6980, "level": 1},
                {"x": 3241, "y": 7039, "level": 1},
                {"x": 3147, "y": 7046, "level": 1},
                {"x": 3156, "y": 7040, "level": 1},
                {"x": 3274, "y": 7045, "level": 1}
            ],
            "range": 49,
            "scantext": "Heart of Gielinor"
        }
    ]
    export const simple: Clues.Simple[] = [
        {
            "id": 0,
            "type": "simple",
            "tier": "easy",
            "text": ["Search the drawers of Hild and Penda's house in Burthorpe."],
            "solution": {
                "type": "search",
                "entity": "Drawers",
                "spot": {"x": 2914, "y": 3521, "level": 0}
            }
        },
        {
            "id": 2,
            "type": "simple",
            "tier": "easy",
            "text": ["Search the drawers found upstairs in the Westernmost Inn of East Ardougne."],
            "solution": {
                "type": "search",
                "entity": "Drawers",
                "spot": {"x": 2575, "y": 3326, "level": 1}
            }
        },
        {
            "id": 65,
            "type": "simple",
            "tier": "easy",
            "text": ["Search the crates outside the bank in the north of east-ardougne"],
            "solution": {
                "type": "search",
                "entity": "Crate",
                "spot": {"x": 2620, "y": 3336, "level": 0}
            }
        },
        {
            "id": 66,
            "type": "simple",
            "tier": "easy",
            "text": ["Search the drawers in a house in Catherby."],
            "solution": {
                "type": "search",
                "entity": "Drawers",
                "spot": {"x": 2830, "y": 3448, "level": 0}
            }
        },
        {
            "id": 67,
            "type": "simple",
            "tier": "easy",
            "text": ["Search the crates in the chicken coop in the farm north of Port Sarim."],
            "solution": {
                "type": "search",
                "entity": "Crate",
                "spot": {"x": 3018, "y": 3287, "level": 0}
            }
        },
        {
            "id": 68,
            "type": "simple",
            "tier": "easy",
            "text": ["Speak to Hans to solve the clue."],
            "solution": {
                "type": "talkto",
                "spots": [{"range": {"topleft": {"x": 3202, "y": 3232}, "botright": {"x": 3221, "y": 3205}, "level": 0}}],
                "npc": "Hans"
            }
        },
        {
            "id": 69,
            "type": "simple",
            "tier": "easy",
            "text": ["Search the drawers above the shops in Varrock."],
            "solution": {
                "type": "search",
                "entity": "Drawers",
                "spot": {"x": 3206, "y": 3419, "level": 1}
            }
        },
        {
            "id": 71,
            "type": "simple",
            "tier": "easy",
            "text": ["Search chests found in the upstairs of shops in Port Sarim."],
            "solution": {
                "type": "search",
                "entity": "Chest", // TODO
                "spot": {"x": 3016, "y": 3205, "level": 1}
            }
        },
        {
            "id": 72,
            "type": "simple",
            "tier": "easy",
            "text": ["Search the drawers on the first floor of a building overlooking Ardougne market."],
            "solution": {
                "type": "search",
                "entity": "Drawers",
                "spot": {"x": 2655, "y": 3323, "level": 1}
            }
        },
        {
            "id": 73,
            "type": "simple",
            "tier": "easy",
            "text": ["Search the drawers in Ivy's house in Taverley."],
            "solution": {
                "type": "search",
                "entity": "Drawers",
                "spot": {"x": 2914, "y": 3448, "level": 0}
            }
        },
        {
            "id": 74,
            "type": "simple",
            "tier": "easy",
            "text": ["Search the crates in Canifis."],
            "solution": {
                "type": "search",
                "entity": "Crate", // TODO
                "spot": {"x": 2914, "y": 3448, "level": 0}
            }
        },
        {
            "id": 75,
            "type": "simple",
            "tier": "easy",
            "text": ["Search for a crate on the ground floor of a house in Seers' Village."],
            "solution": {
                "type": "search",
                "entity": "Crate",
                "spot": {"x": 2699, "y": 3470, "level": 0}
            }
        },
        {
            "id": 76,
            "type": "simple",
            "tier": "easy",
            "text": ["Search through chests found in the upstairs of houses in eastern Falador."],
            "solution": {
                "type": "search",
                "entity": "Chest", // TODO
                "spot": {"x": 3041, "y": 3364, "level": 1}
            }
        },
        {
            "id": 78,
            "type": "simple",
            "tier": "easy",
            "text": ["Search the chests in the Dwarven Mine."],
            "solution": {
                "type": "search",
                "entity": "Chest", // TODO,
                "spot": {"x": 3000, "y": 9798, "level": 0}
            }
        },
        {
            "id": 79,
            "type": "simple",
            "tier": "easy",
            "text": ["Search the drawers in a house in Draynor Village."],
            "solution": {
                "type": "search",
                "entity": "Drawers",
                "spot": {"x": 3097, "y": 3277, "level": 0}
            }
        },
        {
            "id": 80,
            "type": "simple",
            "tier": "easy",
            "text": ["Search for a crate in Varrock Palace."],
            "solution": {
                "type": "search",
                "entity": "Crate",
                "spot": {"x": 3224, "y": 3492, "level": 0}
            }
        },
        {
            "id": 81,
            "type": "simple",
            "tier": "easy",
            "text": ["Search the boxes in the house in Al Kharid with racks of silk."],
            "solution": {
                "type": "search",
                "spot": {"x": 3289, "y": 3202, "level": 0}
            }
        },
        {
            "id": 82,
            "type": "simple",
            "tier": "easy",
            "text": ["Search the boxes in the house near the south entrance of Varrock."],
            "solution": {
                "type": "search",
                "entity": "Boxes", // TODO
                "spot": {"x": 3203, "y": 3384, "level": 0}
            }
        },
        {
            "id": 83,
            "type": "simple",
            "tier": "easy",
            "text": ["Search the crates near a cart in Varrock."],
            "solution": {
                "type": "search",
                "entity": "Crate",
                "spot": {"x": 3226, "y": 3452, "level": 0}
            }
        },
        {
            "id": 84,
            "type": "simple",
            "tier": "easy",
            "text": ["Look in the ground floor crates of houses in Falador."],
            "solution": {
                "type": "search",
                "entity": "Crate",
                "spot": {"x": 3029, "y": 3355, "level": 0}
            }
        },
        {
            "id": 85,
            "type": "simple",
            "tier": "easy",
            "text": ["Search the crates in Draynor Manor."],
            "solution": {
                "type": "search",
                "entity": "Crate",
                "spot": {"x": 3106, "y": 3369, "level": 2}
            }
        },
        {
            "id": 86,
            "type": "simple",
            "tier": "easy",
            "text": ["Search for a crate in a building in Hemenster."],
            "solution": {
                "type": "search",
                "entity": "Crate",
                "spot": {"x": 2636, "y": 3453, "level": 0}
            }
        },
        {
            "id": 87,
            "type": "simple",
            "tier": "easy",
            "text": ["Search the crates in yard of Citharede Abbey."],
            "solution": {
                "type": "search",
                "entity": "Crate",
                "spot": {"x": 3415, "y": 3158, "level": 0}
            }
        },
        {
            "id": 88,
            "type": "simple",
            "tier": "easy",
            "text": ["Speak to the staff of Sinclair Mansion."],
            "solution": {
                "type": "talkto",
                "spots": [{"range": {"topleft": {"x": 2736, "y": 3580}, "botright": {"x": 2737, "y": 3574}, "level": 0}}],
                "npc": "Louisa"
            }
        },
        {
            "id": 89,
            "type": "simple",
            "tier": "easy",
            "text": ["Search in the south-east corner of the Artisan Dwarves' workshop in Falador."],
            "solution": {
                "type": "search",
                "entity": "Crate",
                "spot": {"x": 3060, "y": 3334, "level": 0}
            }
        },
        {
            "id": 90,
            "type": "simple",
            "tier": "easy",
            "text": ["Search through some drawers in the upstairs of a house in Rimmington."],
            "solution": {
                "type": "search",
                "entity": "Drawers",
                "spot": {"x": 2970, "y": 3213, "level": 1}
            }
        },
        {
            "id": 91,
            "type": "simple",
            "tier": "easy",
            "text": ["Search upstairs in the houses of Seers' Village for some drawers."],
            "solution": {
                "type": "search",
                "entity": "Drawers",
                "spot": {"x": 2716, "y": 3471, "level": 1}
            }
        },
        {
            "id": 92,
            "type": "simple",
            "tier": "easy",
            "text": ["Search the crates in a house in Yanille that has a piano."],
            "solution": {
                "type": "search",
                "entity": "Crate", // TODO
                "spot": {"x": 2598, "y": 3105, "level": 0}
            }
        },
        {
            "id": 93,
            "type": "simple",
            "tier": "easy",
            "text": ["Search the drawers in the ground floor of a shop in Yanille."],
            "solution": {
                "type": "search",
                "entity": "Drawers",
                "spot": {"x": 2570, "y": 3085, "level": 0}
            }
        },
        {
            "id": 95,
            "type": "simple",
            "tier": "easy",
            "text": ["Search the boxes in one of the tents in Al Kharid."],
            "solution": {
                "type": "search",
                "entity": "Boxes", // TODO
                "spot": {"x": 3308, "y": 3206, "level": 0}
            }
        },
        {
            "id": 96,
            "type": "simple",
            "tier": "easy",
            "text": ["Search the crate near a cart in Port Khazard."],
            "solution": {
                "type": "search",
                "entity": "Crate",
                "spot": {"x": 2660, "y": 3149, "level": 0}
            }
        },
        {
            "id": 99,
            "type": "simple",
            "tier": "easy",
            "text": ["Dig near some giant mushrooms behind the Grand Tree."],
            "solution": {
                "type": "dig",
                "spot": {"x": 2459, "y": 3505, "level": 0}
            }
        },
        {
            "id": 100,
            "type": "simple",
            "tier": "easy",
            "text": ["Search a barrel outside the Pick and Lute inn, in Taverley."],
            "solution": {
                "type": "search",
                "entity": "Barrel",
                "spot": {"x": 2886, "y": 3449, "level": 0}
            }
        },
        {
            "id": 101,
            "type": "simple",
            "tier": "easy",
            "text": ["Search the crates in the house at the north end of the East Ardougne Market."],
            "solution": {
                "type": "search",
                "entity": "Crate", // TODO
                "spot": {"x": 2658, "y": 3323, "level": 0}
            }
        },
        {
            "id": 102,
            "type": "simple",
            "tier": "easy",
            "text": ["Search a barrel outside the mill, in Taverley."],
            "solution": {
                "type": "search",
                "entity": "Barrel",
                "spot": {"x": 2894, "y": 3418, "level": 0}
            }
        },
        {
            "id": 103,
            "type": "simple",
            "tier": "easy",
            "text": ["Speak to Gaius in Burthorpe."],
            "solution": {
                "type": "talkto",
                "npc": "Gaius",
                "spots": [{"range": {"topleft": {"x": 2926, "y": 3552}, "botright": {"x": 2931, "y": 3546}, "level": 0}}]
            }
        },
        {
            "id": 105,
            "type": "simple",
            "tier": "easy",
            "text": ["Search a barrel east of Challenge Mistress Fara, in Burthorpe."],
            "solution": {
                "type": "search",
                "entity": "Barrel",
                "spot": {"x": 2912, "y": 3530, "level": 0}
            }
        },
        {
            "id": 106,
            "type": "simple",
            "tier": "easy",
            "text": ["Speak to Arhein in Catherby."],
            "solution": {
                "type": "talkto",
                "npc": "Arhein",
                "spots": [{"range": {"topleft": {"x": 2802, "y": 3427}, "botright": {"x": 2804, "y": 3425}, "level": 0}}]
            }
        },
        {
            "id": 107,
            "type": "simple",
            "tier": "easy",
            "text": ["Talk to the bartender of the Rusty Anchor in Port Sarim."],
            "solution": {
                "type": "talkto",
                "npc": "Bartender",
                "spots": [{"range": {"topleft": {"x": 3044, "y": 3258}, "botright": {"x": 3046, "y": 3255}, "level": 0}}]
            }
        },
        {
            "id": 108,
            "type": "simple",
            "tier": "easy",
            "text": ["Search the crates in Horvik's armoury."],
            "solution": {
                "type": "search",
                "entity": "Crate",
                "spot": {"x": 3228, "y": 3433, "level": 0}
            }
        },
        {
            "id": 110,
            "type": "simple",
            "tier": "easy",
            "text": ["Search the boxes in the Goblin house near Lumbridge."],
            "solution": {
                "type": "search",
                "entity": "Crate",
                "spot": {"x": 3247, "y": 3244, "level": 0}
            }
        },
        {
            "id": 111,
            "type": "simple",
            "tier": "easy",
            "text": ["Search the drawers in Falador's chainmail shop."],
            "solution": {
                "type": "search",
                "entity": "Drawers",
                "spot": {"x": 2969, "y": 3311, "level": 0}
            }
        },
        {
            "id": 112,
            "type": "simple",
            "tier": "easy",
            "text": ["Search the chests in Al Kharid palace."],
            "solution": {
                "type": "search",
                "entity": "Ornate chest",
                "spot": {"x": 3301, "y": 3164, "level": 0}
            }
        },
        {
            "id": 113,
            "type": "simple",
            "tier": "easy",
            "text": ["Search the crates just outside the armour shop in East Ardougne."],
            "solution": {
                "type": "search",
                "entity": "Crate",
                "spot": {"x": 2654, "y": 3299, "level": 0}
            }
        },
        {
            "id": 115,
            "type": "simple",
            "tier": "easy",
            "text": ["Search the crates in East Ardougne's general store."],
            "solution": {
                "type": "search",
                "entity": "Crate",
                "spot": {"x": 2615, "y": 3291, "level": 0}
            }
        },
        {
            "id": 116,
            "type": "simple",
            "tier": "easy",
            "text": ["Speak to Ellis in Al Kharid."],
            "solution": {
                "type": "talkto",
                "npc": "Ellis",
                "spots": [{"range": {"topleft": {"x": 3270, "y": 3198}, "botright": {"x": 3276, "y": 3193}, "level": 0}}]
            }
        },
        {
            "id": 117,
            "type": "simple",
            "tier": "easy",
            "text": ["Search the chest in the left-hand tower of Camelot Castle."],
            "solution": {
                "type": "search",
                "spot": {"x": 2748, "y": 3495, "level": 2}
            }
        },
        {
            "id": 118,
            "type": "simple",
            "tier": "easy",
            "text": ["Search the chest in the Duke of Lumbridge's bedroom."],
            "solution": {
                "type": "search",
                "spot": {"x": 3209, "y": 3218, "level": 1}
            }
        },
        {
            "id": 119,
            "type": "simple",
            "tier": "easy",
            "text": ["Search the crates near the Lumbridge Market."],
            "solution": {
                "type": "search",
                "spot": {"x": 3192, "y": 3257, "level": 0}
            }
        },
        {
            "id": 121,
            "type": "simple",
            "tier": "easy",
            "text": ["Speak to Doric, who lives north of Falador."],
            "solution": {
                "type": "talkto",
                "npc": "Doric",
                "spots": [{"range": {"topleft": {"x": 2955, "y": 3443}, "botright": {"x": 2963, "y": 3435}, "level": 0}}]
            }
        },
        {
            "id": 123,
            "type": "simple",
            "tier": "easy",
            "text": ["Search the drawers upstairs in the bank to the East of Varrock."],
            "solution": {
                "type": "search",
                "entity": "Drawers",
                "spot": {"x": 3250, "y": 3420, "level": 1}
            }
        },
        {
            "id": 124,
            "type": "simple",
            "tier": "easy",
            "text": ["Talk to Zeke in Al Kharid."],
            "solution": {
                "type": "talkto",
                "npc": "Zeke",
                "spots": [{"range": {"topleft": {"x": 3284, "y": 3192}, "botright": {"x": 3289, "y": 3186}, "level": 0}}]
            }
        },
        {
            "id": 125,
            "type": "simple",
            "tier": "easy",
            "text": ["Speak to the bartender of the Blue Moon Inn in Varrock."],
            "solution": {
                "type": "talkto",
                "npc": "Bartender",
                "spots": [{"range": {"topleft": {"x": 3223, "y": 3402}, "botright": {"x": 3226, "y": 3396}, "level": 0}}]
            }
        },
        {
            "id": 126,
            "type": "simple",
            "tier": "easy",
            "text": ["Search the crate in the left-hand tower of Lumbridge castle."],
            "solution": {
                "type": "search",
                "entity": "Crate",
                "spot": {"x": 3228, "y": 3212, "level": 1}
            }
        },
        {
            "id": 127,
            "type": "simple",
            "tier": "easy",
            "text": ["Search the drawers in one of Gertrude's bedrooms."],
            "solution": {
                "type": "search",
                "entity": "Drawers",
                "spot": {"x": 3156, "y": 3406, "level": 0}
            }
        },
        {
            "id": 130,
            "type": "simple",
            "tier": "easy",
            "text": ["Search the drawers in Catherby's Archery Shop."],
            "solution": {
                "type": "search",
                "entity": "Drawers",
                "spot": {"x": 2828, "y": 3457, "level": 0}
            }
        },
        {
            "id": 131,
            "type": "simple",
            "tier": "easy",
            "text": ["Search the drawers upstairs in Falador's shield shop."],
            "solution": {
                "type": "search",
                "entity": "Drawers",
                "spot": {"x": 2971, "y": 3386, "level": 1}
            }
        },
        {
            "id": 132,
            "type": "simple",
            "tier": "easy",
            "text": ["Talk to the Squire in the White Knights' castle in Falador."],
            "solution": {
                "type": "talkto",
                "npc": "Squire Asrol",
                "spots": [{"range": {"topleft": {"x": 2970, "y": 3346}, "botright": {"x": 2977, "y": 3339}, "level": 0}}]
            }
        },
        {
            "id": 133,
            "type": "simple",
            "tier": "easy",
            "text": ["Search the crates of Falador's general store."],
            "solution": {
                "type": "search",
                "entity": "Crate",
                "spot": {"x": 2955, "y": 3390, "level": 0}
            }
        },
        {
            "id": 134,
            "type": "simple",
            "tier": "easy",
            "text": ["Search the crates in the Barbarian Village helmet shop."],
            "solution": {
                "type": "search",
                "entity": "Crate",
                "spot": {"x": 3073, "y": 3430, "level": 0}
            }
        },
        {
            "id": 135,
            "type": "simple",
            "tier": "easy",
            "text": ["Search the crates in the Port Sarim fishing shop."],
            "solution": {
                "type": "search",
                "entity": "Crate",
                "spot": {"x": 3012, "y": 3222, "level": 0}
            }
        },
        {
            "id": 136,
            "type": "simple",
            "tier": "easy",
            "text": ["Speak to Sir Kay in Camelot Castle."],
            "solution": {
                "type": "talkto",
                "npc": "Sir Kay",
                "spots": [{"range": {"topleft": {"x": 2752, "y": 3503}, "botright": {"x": 2764, "y": 3493}, "level": 0}}]
            }
        },
        {
            "id": 137,
            "type": "simple",
            "tier": "easy",
            "text": ["Speak to Ned in Draynor Village."],
            "solution": {
                "type": "talkto",
                "npc": "Ned",
                "spots": [{"range": {"topleft": {"x": 3097, "y": 3260}, "botright": {"x": 3102, "y": 3255}, "level": 0}}]
            }
        },
        {
            "id": 138,
            "type": "simple",
            "tier": "easy",
            "text": ["Speak to the Challenge Mistress in Burthorpe."],
            "solution": {
                "type": "talkto",
                "npc": "Mission Mistress Fara",
                "spots": [{"range": {"topleft": {"x": 2887, "y": 3531}, "botright": {"x": 2889, "y": 3529}, "level": 0}}]
            }
        },
        {
            "id": 94,
            "type": "simple",
            "tier": "medium",
            "text": ["Speak to Donovan, the family handyman."],
            "solution": {
                "type": "talkto",
                "spots": [{"range": {"topleft": {"x": 2740, "y": 3582}, "botright": {"x": 2744, "y": 3577}, "level": 1}}],
                "npc": "Donovan the Family Handyman"
            }
        },
        {
            "id": 97,
            "type": "simple",
            "tier": "medium",
            "text": ["Speak to Brimstail."],
            "challenge": [{"type": "challengescroll", "question": "What is 19 to the power of 3?", "answers": [{"answer": 6859}]}],
            "solution": {
                "type": "talkto",
                "spots": [{"range": {"topleft": {"x": 2405, "y": 9822}, "botright": {"x": 2413, "y": 9815}, "level": 0}}],
                "npc": "Brimstail"
            }
        },
        {
            "id": 98,
            "type": "simple",
            "tier": "medium",
            "text": ["Speak to Roavar."],
            "solution": {
                "type": "talkto",
                "npc": "Roavar",
                "spots": [{"range": {"topleft": {"x": 3489, "y": 3475}, "botright": {"x": 3495, "y": 3471}, "level": 0}}]
            }
        },
        {
            "id": 109,
            "type": "simple",
            "tier": "medium",
            "text": ["Speak to Ulizius."],
            "solution": {
                "type": "talkto",
                "npc": "Ulizius",
                "spots": [{"range": {"topleft": {"x": 3440, "y": 3464}, "botright": {"x": 3446, "y": 3458}, "level": 0}}]
            }
        },
        {
            "id": 114,
            "type": "simple",
            "tier": "medium",
            "text": ["Speak to Hajedy."],
            "solution": {
                "type": "talkto",
                "npc": "Hajedy",
                "spots": [{"range": {"topleft": {"x": 2779, "y": 3213}, "botright": {"x": 2782, "y": 3210}, "level": 0}}]
            }
        },
        {
            "id": 120,
            "type": "simple",
            "tier": "medium",
            "text": ["Speak to Kangai Mau."],
            "solution": {
                "type": "talkto",
                "npc": "Kangai Mau",
                "spots": [{"range": {"topleft": {"x": 2790, "y": 3185}, "botright": {"x": 2795, "y": 3181}, "level": 0}}]
            }
        },
        {
            "id": 122,
            "type": "simple",
            "tier": "medium",
            "text": ["Speak to a referee."],
            "challenge": [{"type": "challengescroll", "question": "What is 57 x 89 + 23?", "answers": [{"answer": 5096}]}],
            "solution": {
                "type": "talkto",
                "npc": "Gnome ball referee",
                "spots": [{"range": {"topleft": {"x": 2384, "y": 3489}, "botright": {"x": 2386, "y": 3487}, "level": 0}}]
            },
        },
        {
            "id": 128,
            "type": "simple",
            "tier": "medium",
            "text": ["Speak to Hazelmere."],
            "challenge": [{"type": "challengescroll", "question": "What is 19 to the power of 3?", "answers": [{"answer": 6859}]}],
            "solution": {
                "type": "talkto",
                "npc": "Hazelmere",
                "spots": [{"range": {"topleft": {"x": 2675, "y": 3089}, "botright": {"x": 2679, "y": 3085}, "level": 0}}],
            }
        }
    ]

    export let all: Clues.Step[] = [
        ...clue_data.anagram,
        ...clue_data.compass,
        ...clue_data.coordinate,
        ...clue_data.cryptic,
        ...clue_data.emote,
        ...clue_data.map,
        ...clue_data.scan,
        ...clue_data.simple,
    ]

    export const index = ClueIndex.simple(all)

    /** TODO: Variant npcs
     * Death (Um + Office)
     * Paul Gower (life altar, farm)
     */
}


export function byType(type: ClueType): Clues.Step[] {
    return clue_data.all.filter((e) => e.type == type)
}
