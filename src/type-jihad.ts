
export type AssertTrue<T extends true> = T
export type TypeEq<A, B> = [A, B] extends [B, A] ? true : false
