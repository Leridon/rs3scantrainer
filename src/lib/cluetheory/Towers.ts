export namespace Towers {
  export type Tower = typeof towers[number]
  export const towers = [1, 2, 3, 4, 5] as const

  export type Street = [Tower, Tower, Tower, Tower, Tower]
  export type StreetLabel = [number, number]

  export type LabelledStreet = {
    street: Street,
    label: StreetLabel
  }

  export namespace Street {
    let _all: Street[] = null

    export function all(): Towers.Street[] {
      if (!_all) {
        _all = (() => {
          function all_permutations<T>(elements: T[]): T[][] {
            if (elements.length == 0) return [[]]

            return elements.flatMap((next, i) =>
              all_permutations(elements.filter((e, idx) => idx != i)).map(perm => [next, ...perm])
            )
          }

          return all_permutations([1, 2, 3, 4, 5]) as Street[]
        })()
      }

      return _all
    }

    function line_of_sight(street: Street): number {
      let n = 0

      let highest = 0
      for (let i = 0; i < street.length; i++) {
        if (street[i] > highest) {
          n++
          highest = street[i]
        }
      }

      return n
    }

    export function reverse(street: Street): Street {
      return street.slice().reverse() as Street
    }

    export function label(street: Street): StreetLabel {
      return [line_of_sight(street), line_of_sight(reverse(street))]
    }
  }

  export namespace LabelledStreet {
    let _all: LabelledStreet[] = null

    export function all(): LabelledStreet[] {
      if (!_all) _all = Street.all().map(street => ({street, label: Street.label(street)}))

      return _all
    }
  }

  export namespace StreetLabel {
    export function equals(a: StreetLabel, b: StreetLabel): boolean {
      return a[0] == b[0] && a[1] == b[1]
    }

    let _candidates: Street[][][] = null

    export function candidateMap(): Street[][][] {
      return towers.map(a => towers.map(b => LabelledStreet.all().filter(l => StreetLabel.equals([a, b], l.label)).map(i => i.street)))
    }

    export function getCandidates(label: StreetLabel): Street[] {
      if (!_candidates) {
        _candidates = candidateMap()
      }

      return _candidates[label[0] - 1][label[1] - 1]
    }
  }


  export type Hints = {
    rows: [StreetLabel, StreetLabel, StreetLabel, StreetLabel, StreetLabel],
    columns: [StreetLabel, StreetLabel, StreetLabel, StreetLabel, StreetLabel],
  }

  export type Blocks = {
    rows: [Street, Street, Street, Street, Street]
  }

  export namespace Puzzle {
    function col<T>(matrix: T[][], i: number): T[] {
      return matrix.map(row => row[i])
    }

    export function solve(puzzle: Hints): Blocks {
      function valid(rows: Street[], column_hints: Hints["columns"]): boolean {
        const row_count = rows.length

        // Check for duplicates.
        // Only compare with last row because it's the only one that changed since the last step
        for (let i = 0; i < 5; i++) {
          for (let j = 0; j < row_count - 1; j++) {
            if (rows[j][i] == rows[row_count - 1][i]) return false
          }
        }

        if (rows.length == 5) {
          if (![0, 1, 2, 3, 4].every(i =>
            StreetLabel.equals(Street.label(col(rows, i) as Street), column_hints[i])
          )) return false
        }

        return true
      }

      function backtrack(hints: StreetLabel[], streets_so_far: Street[]): Blocks {
        if (!valid(streets_so_far, puzzle.columns)) return null

        if (hints.length == 0) return {rows: streets_so_far as Blocks["rows"]}

        for (const candidate of StreetLabel.getCandidates(hints[0])) {
          const res = backtrack(hints.slice(1), [...streets_so_far, candidate])

          if (res) return res
        }

        return null
      }

      return backtrack(puzzle.rows, [])
    }
  }
}