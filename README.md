## NOTE: Clue Trainer is currently in beta and not fully functional yet. Expect incomplete/missing guides, errors and bugs.

# Clue Trainer

Clue Trainer is a plugin for the [Alt1 toolkit](https://runeapps.org/) by Skillbert.
Its main function is guiding players through efficiently solving scan steps in elite and master clues.

![](.github/readmeassets/screenshot.png)

## How to use

Use the search bar to select a scan clue, or use the screen reader with the buttons to the right to automatically read your active clue from screen.

![](.github/readmeassets/searchbar.png)

After selecting a clue, a method panel on the left will open.

![](.github/readmeassets/scantree.png)

Follow the directions in the method panel and click the button corresponding to what ping you receive at that spot.
The search tree will advance, ruled out spots will gray out in the map and it will zoom into the remaining relevant area. 

![img.png](.github/readmeassets/advancedtree.png)

Also note how the tree path you are in is displayed above the current instructions.
Use the links there to navigate back up the search tree if you need to.

Continue to follow the directions until you receive a triple ping and have found the spot, or the plugin tells you to dig at a specific spot because only one candidate remains.

**The included methods only work when you have summoned a Meerkats familiar to boost your scan range by 5 tiles. This is NOT optional.**


### How does this work?

All possible spots for scan clues are publically known.
This allows us to find scan routes that can narrow down the spots that need to be considered quickly without having to search the entire area. 
At any given point, you can see if the spot you are looking for is within 1x the scan range (triple ping), within 2x the scan range (double ping) or beyond 2x the scan range (single ping). 
By chaining together standing spots strategically, a [ternary search tree](https://en.wikipedia.org/wiki/Ternary_search_tree) can be created for each scan area.
Smart people like Fiery have done so and kindly provided optimal strategies to the public.

The plugin visualizes these trees by highlighting where to stand, telling you how to efficiently get there, and visually removing the dig spots that no longer need to be considered. It is intended to be used as a tool to help memorize the paths to solve elite clues faster than ever before.

## Getting Started

The live version can be viewed at https://leridon.github.io/cluetrainer-live/.

To install Scan Trainer into Alt1, open this (full) link in your browser:

```alt1://addapp/https://leridon.github.io/cluetrainer-live/appconfig.json```

or open https://leridon.github.io/cluetrainer-live/ inside of the Alt1 browser.

## Feedback and Contributions

To provide feedback, get support with issues or provide contributions, you can reach out to me at [Clue Chasers Discord/#scan-trainer](https://discord.com/channels/332595657363685377/1103737270114209825).

You can also use the issue system directly here at GitHub.

## Credits

A huge thanks to [Skillbert](https://github.com/skillbert) for creating Alt1 in the first place and especially for allowing me to use code and data from the official clue solver, as well as for providing high quality map data for the world map.

Also thanks to the guide writers and theorycrafters over at the [Clue Chasers Discord](https://discord.gg/cluechasers) for providing the clue knowledge, especially Fiery whose scan routes are visualized in this plugin.

## Future Plans

Plans for the immediate future are to finish mapping the remaining scan routes and improve the readability of instructions, allow configuring and filtering teleports and embed an explanation for how the methods work directly into the app.

Longer term plans (no guarantees) include embedding solving methods for other clue types than just scans.
