import {Method} from "./methods";

export enum ClueTier {
    easy = 0,
    medium,
    hard,
    elite,
    master
}

export enum ClueType {
    anagram = 0,
    compass,
    coordinates,
    cryptic,
    emote,
    map,
    scan,
    simple,
    skilling,
}

type ClueSolution = string

type Coordinate = {
    x: number,
    y: number
}

type SimpleSolution = { coordinates: Coordinate, answer?: string }
type SetSolution = { candidates: Coordinate[] }

type Solution = SimpleSolution | SetSolution

type ClueBase = { id: number, clue: string, tier: ClueTier, type: ClueType, solution?: any, methods: Method[] }

type SimpleStep = ClueBase & { type: ClueType.simple }
type ScanSte = ClueBase & { type: ClueType.scan, scantext: string, range: number, candidates: Coordinate[] }
type EmoteStep = ClueBase & { type: ClueType.emote }
type AnagramStep = ClueBase & { type: ClueType.anagram }
type ImageStep = ClueBase & { type: ClueType.map }
type CrypticStep = ClueBase & { type: ClueType.cryptic }
type CompassStep = ClueBase & { type: ClueType.compass }
type CoordinateStep = ClueBase & { type: ClueType.coordinates, candidates: Coordinate[] }
type SkillingStep = ClueBase & { type: ClueType.skilling }

/*
    ScanStep: xy[]
    Simple: xy + Text
    EmoteStep: xy
    AnagramStep: xy + Text
    ImageStep: xy + Text
    Cryptic: xy + Text
    SkillingStep: Text + xy?
    Compassstep: xy[]
    CoordinateStep: xy
 */

export class ClueStep {
    solution?: ClueSolution = null
    methods: Method[] = []

    constructor(public id: string,
                public tier: ClueTier,
                public type: ClueType,
                public clue: string,
                public searchText: string,
    ) {
    }
}

export class ScanStep extends ClueStep {
    constructor(public id: string,
                public clue: string,
                public scantext: string,
                public scanrange: number
    ) {
        super(id,
            ClueTier.elite,
            ClueType.scan,
            clue,
            `Scan ${scantext}`
        );
    }
}