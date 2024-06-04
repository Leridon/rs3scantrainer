export default interface Property<T> {
  set(v: T): this

  get(): T
}