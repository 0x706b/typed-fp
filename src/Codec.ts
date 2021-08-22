/**
 * Codec is an abstraction that combines Decoder + Encoder
 * @since 0.14.1
 */
import { identity, pipe } from 'fp-ts/function'
import { Invariant3 } from 'fp-ts/Invariant'
import { Refinement } from 'fp-ts/Refinement'

import * as D from './Decoder'
import * as E from './Encoder'
import { Literal } from './Schemable'

/**
 * Laws:
 *
 * 1. `pipe(codec.decode(u), E.fold(() => u, codec.encode)) = u` for all `u` in `unknown`
 * 2. `codec.decode(codec.encode(a)) = E.right(a)` for all `a` in `A`
 *
 * @category Model
 * @since 0.14.1
 */
export interface Codec<I, O, A> extends D.Decoder<I, A>, E.Encoder<O, A> {}

/**
 * @category Constructor
 * @since 0.14.1
 */
export function make<I, O, A>(decoder: D.Decoder<I, A>, encoder: E.Encoder<O, A>): Codec<I, O, A> {
  return {
    decode: decoder.decode,
    encode: encoder.encode,
  }
}

/**
 * @category Constructor
 * @since 0.14.1
 */
export function fromDecoder<I, A>(decoder: D.Decoder<I, A>): Codec<I, A, A> {
  return {
    decode: decoder.decode,
    encode: identity,
  }
}

/**
 * @category Constructor
 * @since 0.14.1
 */
export function literal<A extends readonly [Literal, ...Array<Literal>]>(
  ...values: A
): Codec<unknown, A[number], A[number]> {
  return fromDecoder(D.literal(...values))
}

/**
 * @category Primitive
 * @since 0.14.1
 */
export const string: Codec<unknown, string, string> =
  /*#__PURE__*/
  fromDecoder(D.string)

/**
 * @category Primitive
 * @since 0.14.1
 */
export const number: Codec<unknown, number, number> =
  /*#__PURE__*/
  fromDecoder(D.number)

/**
 * @category Primitive
 * @since 0.14.1
 */
export const boolean: Codec<unknown, boolean, boolean> =
  /*#__PURE__*/
  fromDecoder(D.boolean)

/**
 * @category Primitive
 * @since 0.14.1
 */
export const unknownArray: Codec<unknown, readonly unknown[], readonly unknown[]> =
  /*#__PURE__*/
  fromDecoder(D.unknownArray)

/**
 * @category Primitive
 * @since 0.14.1
 */
export const unknownRecord: Codec<unknown, Record<string, unknown>, Record<string, unknown>> =
  /*#__PURE__*/
  fromDecoder(D.unknownRecord)

/**
 * @category Combinator
 * @since 0.14.1
 */
export const refine = <A, B extends A>(
  refinement: Refinement<A, B>,
  id: string,
): (<I, O>(from: Codec<I, O, A>) => Codec<I, O, B>) => {
  const refine = D.refine(refinement, id)
  return (from) => make(refine(from), from)
}

/**
 * @category Combinator
 * @since 0.14.1
 */
export function nullable<I, O, A>(or: Codec<I, O, A>): Codec<null | I, null | O, null | A> {
  return make(D.nullable(or), E.nullable(or))
}

/**
 * @category Combinator
 * @since 0.14.1
 */
export function fromStruct<P extends Record<string, Codec<any, any, any>>>(
  properties: P,
): Codec<
  { [K in keyof P]: InputOf<P[K]> },
  { [K in keyof P]: OutputOf<P[K]> },
  { [K in keyof P]: TypeOf<P[K]> }
> {
  return make(D.fromStruct(properties) as any, E.struct(properties))
}

/**
 * @category Combinator
 * @since 0.14.1
 */
export function struct<P extends Record<string, Codec<unknown, any, any>>>(
  properties: P,
): Codec<unknown, { [K in keyof P]: OutputOf<P[K]> }, { [K in keyof P]: TypeOf<P[K]> }> {
  return pipe(unknownRecord, compose(fromStruct(properties as any))) as any
}

/**
 * @category Combinator
 * @since 0.14.1
 */
export function fromPartial<P extends Record<string, Codec<any, any, any>>>(
  properties: P,
): Codec<
  Partial<{ [K in keyof P]: InputOf<P[K]> }>,
  Partial<{ [K in keyof P]: OutputOf<P[K]> }>,
  Partial<{ [K in keyof P]: TypeOf<P[K]> }>
> {
  return make(D.fromStruct(properties) as any, E.partial(properties))
}

/**
 * @category Combinator
 * @since 0.14.1
 */
export function partial<P extends Record<string, Codec<unknown, any, any>>>(
  properties: P,
): Codec<
  unknown,
  Partial<{ [K in keyof P]: OutputOf<P[K]> }>,
  Partial<{ [K in keyof P]: TypeOf<P[K]> }>
> {
  return pipe(unknownRecord, compose(fromPartial(properties as any))) as any
}

/**
 * @category Combinator
 * @since 0.14.1
 */
export function fromArray<I, O, A>(
  item: Codec<I, O, A>,
): Codec<ReadonlyArray<I>, ReadonlyArray<O>, ReadonlyArray<A>> {
  return make(D.fromArray(item), E.array(item))
}

/**
 * @category Combinator
 * @since 0.14.1
 */
export function array<O, A>(
  item: Codec<unknown, O, A>,
): Codec<unknown, ReadonlyArray<O>, ReadonlyArray<A>> {
  return pipe(unknownArray, compose(fromArray(item))) as any
}

/**
 * @category Combinator
 * @since 0.14.1
 */
export function fromRecord<I, O, A>(
  codomain: Codec<I, O, A>,
): Codec<Record<string, I>, Readonly<Record<string, O>>, Readonly<Record<string, A>>> {
  return make(D.fromRecord(codomain), E.record(codomain))
}

/**
 * @category Combinator
 * @since 0.14.1
 */
export function record<O, A>(
  codomain: Codec<unknown, O, A>,
): Codec<unknown, Readonly<Record<string, O>>, Readonly<Record<string, A>>> {
  return pipe(unknownRecord, compose(fromRecord(codomain))) as any
}

/**
 * @category Combinator
 * @since 0.14.1
 */
export const fromTuple = <C extends ReadonlyArray<Codec<any, any, any>>>(
  ...components: C
): Codec<
  { [K in keyof C]: InputOf<C[K]> },
  { [K in keyof C]: OutputOf<C[K]> },
  { [K in keyof C]: TypeOf<C[K]> }
> => make(D.fromTuple(...components) as any, E.tuple(...components)) as any

/**
 * @category Combinator
 * @since 0.14.1
 */
export function tuple<C extends ReadonlyArray<Codec<unknown, any, any>>>(
  ...components: C
): Codec<unknown, { [K in keyof C]: OutputOf<C[K]> }, { [K in keyof C]: TypeOf<C[K]> }> {
  return pipe(unknownArray as any, compose(fromTuple(...components) as any)) as any
}

/**
 * @category Combinator
 * @since 0.14.1
 */
export const intersect = <IB, OB, B>(
  right: Codec<IB, OB, B>,
): (<IA, OA, A>(left: Codec<IA, OA, A>) => Codec<IA & IB, OA & OB, A & B>) => {
  const intersectD = D.intersect(right)
  const intersectE = E.intersect(right)
  return (left) => make(intersectD(left), intersectE(left))
}

/**
 * @category Combinator
 * @since 0.14.1
 */
export const fromSum = <T extends string>(
  tag: T,
): (<MS extends Record<string, Codec<any, any, any>>>(
  members: MS,
) => Codec<InputOf<MS[keyof MS]>, OutputOf<MS[keyof MS]>, TypeOf<MS[keyof MS]>>) => {
  const decoder = D.sum(tag)
  const encoder = E.sum(tag)
  return (members) => make(decoder(members) as any, encoder(members))
}

/**
 * @category Combinator
 * @since 0.14.1
 */
export function sum<T extends string>(
  tag: T,
): <M extends Record<string, Codec<unknown, any, any>>>(
  members: M,
) => Codec<unknown, OutputOf<M[keyof M]>, TypeOf<M[keyof M]>> {
  const sum = fromSum(tag)
  return (members) => pipe(unknownRecord, compose(sum(members) as any)) as any
}

/**
 * @category Combinator
 * @since 0.14.1
 */
export function lazy<I, O, A>(id: string, f: () => Codec<I, O, A>): Codec<I, O, A> {
  return make(D.lazy(id, f), E.lazy(f))
}

/**
 * @category Combinator
 * @since 0.14.1
 */
export const readonly: <I, O, A>(codec: Codec<I, O, A>) => Codec<I, O, Readonly<A>> = identity

/**
 * @category Combinator
 * @since 0.14.1
 */
export const compose =
  <L, A extends L, P extends A, B>(to: Codec<L, P, B>) =>
  <I, O>(from: Codec<I, O, A>): Codec<I, O, B> =>
    make(D.compose(to)(from), E.compose(to)(from))

/**
 * @category Invariant
 * @since 0.14.1
 */
export const imap: Invariant3<URI>['imap'] = (f, g) => (fa) =>
  make(D.Functor.map(f)(fa), E.Contravariant.contramap(g)(fa))

/**
 * @category URI
 * @since 0.14.1
 */
export const URI = '@typed/fp/Codec'

/**
 * @category URI
 * @since 0.14.1
 */
export type URI = typeof URI

declare module 'fp-ts/HKT' {
  interface URItoKind3<R, E, A> {
    readonly [URI]: Codec<R, E, A>
  }
}

/**
 * @category Instance
 * @since 0.14.1
 */
export const Invariant: Invariant3<URI> = {
  imap,
}

/**
 * @category Type-level
 * @since 0.14.1
 */
export type InputOf<C> = D.InputOf<C>

/**
 * @category Type-level
 * @since 0.14.1
 */
export type OutputOf<C> = E.OutputOf<C>

/**
 * @category Type-level
 * @since 0.14.1
 */
export type TypeOf<C> = E.TypeOf<C>
