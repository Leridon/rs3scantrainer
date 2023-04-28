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