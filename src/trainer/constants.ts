export namespace Constants {
    // TODO: This is hardcoded, because I cant dynamically get the current version from runeapps because of CORS.
    export const map_version: number = 1686910882

    export const icons = {
        tiers: {
            "easy": "assets/icons/sealedeasy.png",
            "medium": "assets/icons/sealedmedium.png",
            "hard": "assets/icons/sealedhard.png",
            "elite": "assets/icons/sealedelite.png",
            "master": "assets/icons/sealedmaster.png",
        },
        types: {
            "anagram": "assets/icons/activeclue.png",
            "compass": "assets/icons/arrow.png",
            "coordinates": "assets/icons/sextant.png",
            "cryptic": "assets/icons/activeclue.png",
            "emote": "assets/icons/emotes.png",
            "image": "assets/icons/map.png",
            "scan": "assets/icons/scan.png",
            "simple": "assets/icons/activeclue.png",
            "skilling": "assets/icons/activeclue.png"
        }
    }

    export const colors = {
        dig_spot_number: "gold",
        scan_area: "#00FF21",
        shortcuts: {
            interactive_area: "#FFFF00",
            clickable_area: "#35540f"
        }
    }
}
