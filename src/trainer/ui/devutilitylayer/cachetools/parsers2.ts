import {Vector2} from "lib/math/Vector2";
import {TileArea} from "lib/runescape/coordinates/TileArea";
import {direction} from "lib/runescape/movement";
import ignore = TransportParser.ignore;
import {MovementBuilder} from "./util/MovementBuilder";
import offset = MovementBuilder.offset;
import simple = TransportParser.simple;
import fixed = MovementBuilder.fixed;
import {TileCoordinates} from "../../../../lib/runescape/coordinates";
import door = TransportParser.door;
import {Lazy} from "../../../../lib/properties/Lazy";
import {util} from "../../../../lib/util/util";
import { TransportParser } from "./TransportParser";

export namespace TransportParsers {
    import Order = util.Order;

    function constructCustomParsers(): TransportParser<any, any>[] {
        return [
            ignore("Not a transportation")
                .loc()(
                    // Trees
                    69144, 38760, 70060, 38783, 38785, 1282, 69139, 69142, 58140, 69141, 1276, 70063, 38787, 1278, 1286, 58108, 1289, 58121, 47596, 1291, 58135, 47594, 47598, 4818, 47600, 4820, 38782, 51843, 38786, 69554, 2289, 38788, 58141, 11866, 37477, 38784, 2889, 1283, 58109, 9366, 1383, 9387, 2890, 4060, 69556, 37478, 9355, 70068, 2410, 70071, 42893, 63176, 2887, 9354, 24168, 1284, 58142, 122440, 70066, 110930, 119459, 110926, 119457, 1365, 9388, 46277, 110932, 3300, 37482, 110927, 110928, 16604, 119460, 99822, 110931, 110933, 124998, 37481, 92440, 110929, 2409, 16265, 79813, 107507, 124996, 2411, 28951, 61191, 99823, 107506, 125510, 61192, 77095, 93384, 119458, 125502, 1384, 2023, 41713, 61190, 61193, 93385, 99825, 100637, 122439, 125504, 125506, 3293, 4135, 5904, 32294, 99824, 125514, 1292, 1330, 1331, 1332, 4674, 18137, 28952, 37483, 37654, 37821, 70001, 70002, 70003, 70005, 70099, 87512, 87514, 87516, 87518, 87520, 87522, 87524, 87526, 87528, 87530, 94314, 100261, 111254, 125508, 125512, 125516, 125533,
                    // More Trees
                    38731, 54787, 38732, 38616, 54778, 57964, 38627, 38755, 70057, 57934, 104007, 9036, 104350, 104351, 104352, 111303, 114099, 58006, 104356, 104358, 104348, 37479, 1281, 104357, 92442, 104347, 46275, 104349, 104355, 111302, 111304, 111305, 114098, 114100, 114101, 70076, 11999, 104647, 2210, 70075, 1315, 12000, 46274, 125530, 139, 1309, 37480, 70077, 104353, 111307, 114102, 125518, 125522, 142, 2372, 15062, 43874, 104354, 125520, 125524, 125526, 127400,
                )(),
            ignore("Closing doors")
                .loc()(
                    1240, 1515, 1517, 1520, 1529, 1531,
                    1534, 2417, 3764, 4248, 4251, 5888,
                    5890, 6109, 10261, 11537, 11617, 11708,
                    11712, 11715, 15535, 21343, 21402, 24375,
                    24379, 24383, 25820, 26207, 34043, 34045,
                    34353, 34808, 36737, 36912, 36914, 37000,
                    37003, 40109, 40185, 45477, 52475, 72005,
                    72009, 85009, 85078, 85079, 112223, 112224,
                )(),
            ignore("Transportations but no parser yet")
                .loc()(
                    77745, // Chaos tunnel portals
                    70480, 70478, 70489, 70491, 70476, 70481, 70490, 70493, // Runespan, potentially easy to parse
                    103472, // Small portal in behind the scenes
                    43595, 64698, 69526, // Agility courses
                    3610, // Rope, maybe works like a ladder
                    29057, 29004, // OoGlog pools
                    119969, // Senntisten
                    116736, // Chaos portal infernal source
                    10782, // Magic Training Arena
                    3309, // underground pass
                    27129, 27130, 27152, // Vine area near shilo
                    91974, 91975, 91972, 91973, // Poison Swamp rocks (should be easy to parse)
                    16005, // rum minigame
                    16947, 16945, //Lunar isle boat stairs
                    83731, // castle wars jumping stones
                    5269, // jumping stones north of morytania herb
                )(),

            ignore("Miscellanious")
                .loc()(
                    53948, 55762, 50343, 50342, 50344, 12974, 49693, 3779, 3724, 70156, 70238, // Dungeoneering and saga doors
                    70235, 3782, 70237, 49337,
                    15326, 15327, // POH Doors
                    93922, 93924, 93813, // Doors in the Broken Home mansion
                    5002,
                    64674, 9323, 35998,
                    37268, 37211, 37212, 57895, 57899, 57903, 57907, // Clan Citadel stairs
                    3626, // Walls in the maze random event
                    29476, 29477, 29478, // Tiles in the vinesweeper minigame
                    85447,
                    112989, // Lava Flow mine
                    85446, 85449,
                    16189, 16187, // Gorak plane
                    17119,
                    15810, // no idea
                    5138, // Some quest
                    95373, // Quest probably
                    20224, 20225, 20244, 20248, 81199,
                    38693,
                    66313, // Some quest area
                    85442, // Battle of lumbridge
                    49089, // Weird inaccessible ladder at the fishing guild
                    1752,
                )(),

            simple<{ length: number }>("Fremmenik Rope Bridges")
                .loc({length: 9})(21306, 21307, 21308, 21309, 21310, 21311, 21312, 21313, 21314, 21315)()
                .loc({length: 5})(21316, 21317, 21318, 21319)()
                .map((builder, {per_loc}) => {
                    builder
                        .planeOffset(-1)
                        .action(
                            {interactive_area: TileArea.init({x: 0, y: -1, level: 0})},
                            offset({x: 0, y: per_loc.length, level: 0})
                                .time(per_loc.length + 1)
                        )
                }),
            ignore("Unsupported ladders", 32015),
            simple<{
                single_side?: direction, move_across?: boolean,
                actions: { up?: number, down?: number },
            }>("Ladders")
                .loc({actions: {up: 0}})(1746)()
                .loc({actions: {up: 0}})(1747)()
                .loc({actions: {down: 0}, single_side: direction.north})(24355, 36770, 34396, 24362)()
                .loc({actions: {up: 0}, single_side: direction.north})(24354, 36768, 34394, 69499)()
                .loc({actions: {up: 1, down: 2}, single_side: direction.north})(36769)()
                .loc({actions: {down: 0}, single_side: direction.east})(4778)()
                .loc({actions: {up: 0}, single_side: direction.east})(4772)()
                .loc({actions: {down: 0}, single_side: direction.south})(10494)()
                .loc({actions: {up: 0}, single_side: direction.south})(21395)()
                .loc({actions: {down: 0}, single_side: direction.north, move_across: true})(17975)()
                .loc({actions: {up: 0}, single_side: direction.north, move_across: true})(17974)()
                .map((builder, {per_loc}) => {
                    const off = per_loc.single_side && per_loc.move_across
                        ? Vector2.scale(-2, direction.toVector(per_loc.single_side))
                        : {x: 0, y: 0}

                    const interactive = per_loc.single_side
                        ? TileArea.init({...direction.toVector(per_loc.single_side), level: 0})
                        : undefined

                    if (per_loc.actions.up != null) {
                        builder.action({
                                index: per_loc.actions.up,
                                interactive_area: interactive
                            },
                            offset({...off, level: 1})
                                .orientation("toentitybefore")
                                .time(3)
                        )
                    }

                    if (per_loc.actions.down != null) {
                        builder.action({
                                index: per_loc.actions.up,
                                interactive_area: interactive
                            },
                            offset({...off, level: -1})
                                .time(3)
                        )
                    }
                }),

            simple("Stiles")
                .loc()(112215)()
                .map((builder) => {

                    builder.action({interactive_area: TileArea.init({x: 0, y: 0, level: 0}, {x: 1, y: 2})},
                        offset({x: 0, y: 1, level: 0})
                            .time(7)
                            .restrict(TileArea.init({x: 0, y: 0, level: 0}))
                            .orientation("toentitybefore"),
                        offset({x: 0, y: -1, level: 0})
                            .time(7)
                            .restrict(TileArea.init({x: 0, y: 1, level: 0}))
                            .orientation("toentitybefore"),
                    )
                }),
            simple<{
                level: 1 | -1,
                length?: number
            }>("Simple Staircase")
                .loc({level: 1})(45483, 2347)()
                .loc({level: -1})(45484, 2348)()
                .loc({level: -1, length: 3})(24359)()
                .map((transport, {per_loc}, instance) => {
                    transport.action({
                            interactive_area: TileArea.init(
                                per_loc.level > 0
                                    ? {x: 0, y: 2, level: 0}
                                    : {x: 0, y: -1, level: 0}
                            )
                        },
                        offset({x: 0, y: -per_loc.level * ((per_loc.length ?? instance.prototype.length ?? 1) + 1), level: per_loc.level})
                            .time(3)
                            .orientation("toentitybefore")
                    )
                }),

            simple<{ length: number, ticks: number, direction?: direction }>
            ("Log Balances")
                .loc({length: 5, ticks: 7, direction: direction.south})(2296)()
                .loc({length: 6, ticks: 7})(3931, 3932)()
                .loc({length: 7, ticks: 9})(3933)()
                .loc({length: 4, ticks: 6, direction: direction.south, plane_offset: -1})(9322)()
                .loc({length: 4, ticks: 6, direction: direction.north, plane_offset: -1})(9324)()
                .loc({length: 4, ticks: 5, direction: direction.south, plane_offset: -1})(35997)()
                .loc({length: 4, ticks: 5, direction: direction.north, plane_offset: -1})(35999)()
                .map((transport, data, instance) => {

                    const dir = data.per_loc.direction ?? direction.north

                    const start = direction.toVector(direction.invert(dir))

                    transport.action({
                            interactive_area: TileArea.init({...start, level: 0}),
                        },
                        offset({...Vector2.scale(data.per_loc.length, direction.toVector(dir)), level: 0})
                            .time(data.per_loc.ticks)
                    )

                }),

            simple("Isafdar Dense Forest")
                .loc()(3937, 3938, 3939, 3998, 3999)()
                .map((transport, data, instance) => {

                    // TODO: Quick-travel with quiver equipped
                    transport.action({},
                        offset({x: 0, y: (instance.prototype.length ?? 1) + 1, level: 0})
                            .restrict(TileArea.init({x: 1, y: -1, level: 0}))
                            .time(6),

                        offset({x: 0, y: -((instance.prototype.length ?? 1) + 1), level: 0})
                            .restrict(TileArea.init({x: 1, y: (instance.prototype.length ?? 1), level: 0}))
                            .time(6)
                    )
                }),

            simple("Lletya Tree")
                .loc()(8742)()
                .map((transport, data, instance) => {
                    transport.action({
                            interactive_area: TileArea.init({x: -1, y: 3, level: 0}, {x: 3, y: 1}),
                        },
                        offset({x: 2, y: 0, level: 0})
                            .time(6)
                            .restrict(TileArea.init({x: -1, y: 3, level: 0})),
                        offset({x: -2, y: 0, level: 0})
                            .time(6)
                            .restrict(TileArea.init({x: 1, y: 3, level: 0}))
                    )
                }),
            door("Single Doors (West)")
                .loc({base_direction: direction.west})(
                    24384, 15536, 1530, 24376, 45476, 17600, 22914, 24381, 34807,
                    36846, 11714, 64831, 47512, 4250, 66758, 77969, 34046, 34811,
                    1239, 36022, 11993, 67138, 67692)(),

            simple<{
                time?: number
            }, {
                target: TileCoordinates
            }>("Simple Entrances")
                .requireInstanceData()
                .loc()(34395)(
                    [{x: 2796, y: 3614, level: 0}, {target: {"x": 2808, "y": 10002, "level": 0}}],
                    [{"x": 2857, "y": 3578, "level": 0}, {target: {"x": 2269, "y": 4752, "level": 0}}],
                    [{"x": 2847, "y": 3688, "level": 0}, {target: {"x": 2837, "y": 10090, "level": 2}}],
                    [{"x": 2910, "y": 3637, "level": 0}, undefined],
                    [{"x": 2885, "y": 3673, "level": 0}, {target: {"x": 2893, "y": 10074, "level": 2}}],
                    [{"x": 2920, "y": 3654, "level": 0}, undefined],
                )
                .loc({time: 9})(110591)([{"x": 2136, "y": 7105, "level": 0}, {target: {"x": 2595, "y": 3412, "level": 0}}])
                .loc()(56989)([{"x": 2176, "y": 5663, "level": 1}, {target: {"x": 2939, "y": 10198, "level": 0}}])
                .map((transport, data, instance) => {
                    transport.action({},
                        fixed(data.per_instance?.target!!)
                            .orientation("toentitybefore")
                            .time(data.per_loc?.time ?? 1)
                    )
                })
        ]
    }

    let custom_parsers: TransportParser<any, any>[] = undefined

    export function getCustomParsers(): TransportParser<any, any>[] {
        if (!custom_parsers) custom_parsers = constructCustomParsers()

        return custom_parsers
    }

    export function getAllParsers(): TransportParser<any, any>[] {
        return getCustomParsers()
    }

    let _parser_index_by_locid = new Lazy<TransportParser<any, any>[]>(() => {
        let max_id = Math.max(...getAllParsers().flatMap(p => {
            return p.locs.flatMap(group => {
                return group.for
            })
        }))

        const lookup_table = new Array(max_id + 1)

        getAllParsers().forEach(p => {
            p.locs.forEach(group => {
                group.for.forEach(loc_id => {
                    lookup_table[loc_id] = p
                })
            })
        })

        return lookup_table
    })

    export function lookup_parser(loc_id: number) {
        return _parser_index_by_locid.get()[loc_id]
    }
}