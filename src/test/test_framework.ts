export namespace ScuffedTesting {
  export type Test = (() => Promise<boolean> | boolean) | TestSet

  export class TestSet {
    constructor(public name: string, public sub_tests: Test[]) {}

    run() {
      return run(this, 0)
    }
  }

  export function testset(name: string, ...tests: Test[]) {
    return new TestSet(name, tests)
  }

  export async function run(test: Test, indent: number = 0): Promise<boolean> {
    if (test instanceof TestSet) {
      console.log(`${" ".repeat(indent)}Running '${test.name}'`)

      let success = true

      for (let sub of test.sub_tests) {
        success &&= await run(sub, indent + 2)
      }

      console.log(`${" ".repeat(indent)}Result of '${test.name}' ${success ? "✓" : "FAILURE"}`)

      return success
    } else {
      const success = await (async () => {
        try {
          return await test()
        } catch (e) {
          return false
        }
      })()

      console.log(`${" ".repeat(indent)}'Running ${test.name}': ${success ? "✓" : "FAILURE"}`)

      return success
    }
  }
}