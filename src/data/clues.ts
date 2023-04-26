import {ScanStep} from "../clues";

function scan(id: string, where: string, scantext: string, range: number) {
    return new ScanStep(id, `This scroll will work ${where}. Orb scan range: ${range} paces.`, scantext, range)
}

export let clues = [
    scan("scandeser", "in the desert, east of the Elid and north of Nardah", "the desert, east of the Elid and north of Nardah", 27),
    scan("scanelven", "in Isafdar and Lletya", "Isafdar and Lletya", 22),
    scan("scanvarrock", "within the walls of Varrock and the Grand Exchange", "Varrock and the Grand Exchange", 16),
    scan("scanardounge", "within the walls of East or West Ardougne", "East or West Ardougne", 22),
    scan("scankeldagrim", "within the dwarven city of Keldagrim", "Keldagrim", 11),
    scan("scanmenaphos", "in Menaphos", "Menaphos", 30),
    scan("scanpiscatoris Hunter Area", "in the Piscatoris Hunter Area", "Piscatoris Hunter Area", 14),
    scan("scanbrimhavendungeon", "in Brimhaven Dungeon", "Brimhaven Dungeon", 14),
    scan("scantaverleydungeon", "in Taverley Dungeon", "Taverley Dungeon", 22),
    scan("scanmosleharmless", "on the faraway island of Mos Le'Harmless", "Mos Le'Harmless", 27),
    scan("scanthauntedwoods", "within the Haunted Woods", "the Haunted Woods", 11),
    scan("scankharazijungle", "in the Kharazi Jungle", "the Kharazi Jungle", 14),
    scan("scanzanaris", "in the city of Zanaris", "Zanaris", 16),
    scan("scanlumbridgecavern", "in the dark and damp caves below Lumbridge Swamp", "The caves beneath Lumbridge Swamp", 11),
    scan("scanfremennikisles", "on the Fremennik Isles of Jatizso and Neitiznot", "Fremennik Isles of Jatizso and Neitiznot", 16),
    scan("scanfalador", "within the walls of Falador", "Falador", 22),
    scan("scandorgeshkaan", "in the cave goblin city of Dorgesh-Kaan", "Dorgesh-Kaan", 16),
    scan("scanfremennikslayerdungeon", "in the Fremennik Slayer Dungeons", "Fremennik Slayer Dungeons", 16),
    scan("scanwildernesscrater", "in the crater of the Wilderness volcano", "The crater of the Wilderness volcano", 11),
    scan("scanprifddinas", "in the elven city of Prifddinas", "Prifddinas", 30),
    scan("scandarkmeyer", "in the vampyre city of Darkmeyer", "Darkmeyer", 16),
    scan("scanturtleislands", "on The Islands That Once Were Turtles", "Islands That Once Were Turtles", 27),
    scan("scanheartofgielinor", "in the the Heart of Gielinor", "Heart of Gielinor", 49),
]

export let cluesById = Object.assign({}, ...clues.map((c) => ({[c.id]: c})))