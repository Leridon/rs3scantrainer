import {Vector2} from "../lib/math";

export type CTRIcon = {
  id: string
  name: string,
  file_name: string,
  size_on_map: Vector2,
  map_anchor?: Vector2,
  search_term?: string
}

export namespace CTRIcon {
  export type ID = (typeof all)[number]["id"]

  export const all: CTRIcon[] = [
    {id: "ability-surge" as const, name: "Surge", file_name: "surge.png", size_on_map: {x: 20, y: 20}},
    {id: "ability-escape" as const, name: "Escape", file_name: "escape.png", size_on_map: {x: 20, y: 20}},
    {id: "ability-barge" as const, name: "Barge", file_name: "barge.png", size_on_map: {x: 20, y: 20}},
    {id: "ability-dive-combined" as const, name: "(Bladed) Dive", file_name: "dive.png", size_on_map: {x: 20, y: 20}},
    {id: "notes" as const, name: "Note", file_name: "notes.png", size_on_map: {x: 20, y: 20}},
    {id: "item/fetch-casket" as const, name: "Fetch Casket", file_name: "fetch_casket.png", size_on_map: {x: 20, y: 20}},
    {id: "item/meerkats" as const, name: "Meerkats Pouch", file_name: "Meerkats_pouch.png", size_on_map: {x: 20, y: 20}},
    {id: "item/spade" as const, name: "Spade", file_name: "spade.webp", size_on_map: {x: 20, y: 20}},
    {id: "item/powerburst-of-acceleration" as const, name: "Powerburst of Acceleration", file_name: "accel.png", size_on_map: {x: 18, y: 24}},
    {id: "item/rotten-potato" as const, name: "Rotten Potato", file_name: "Rotten_potato.png", size_on_map: {x: 20, y: 20}},
  ]

  const map: Record<ID, CTRIcon> = Object.fromEntries(all.map(e => [e.id as ID, e])) as Record<ID, CTRIcon>

  export function search_term(icon: CTRIcon): string {
    const list: string[] = []

    list.push(icon.file_name.split(".")[0])
    list.push(icon.id)
    if (icon.search_term) list.push(icon.search_term)

    return list.join("")
  }

  export function url(icon: CTRIcon): string {
    return `assets/icons/${icon.file_name}`
  }

  export function get(id: ID): CTRIcon {
    return map[id]
  }
}