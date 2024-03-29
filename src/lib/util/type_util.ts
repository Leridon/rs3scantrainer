export namespace TypeUtil {

  export function sEnum<Q extends string>(...v: Q[]): Q[] {
    return v;
  }

  export type Tuple<T, N extends number> = N extends N ? number extends N ? T[] : _TupleOf<T, N, []> : never;
  type _TupleOf<T, N extends number, R extends unknown[]> = R['length'] extends N ? R : _TupleOf<T, N, [T, ...R]>;

}