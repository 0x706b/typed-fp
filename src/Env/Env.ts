import { Arity1 } from '@typed/fp/lambda'
import {
  Apply,
  chainRec as chainRec_,
  Functor,
  Monad,
  Pointed,
  race as race_,
  Resume,
} from '@typed/fp/Resume'
import { Widen } from '@typed/fp/Widen'
import { Either } from 'fp-ts/dist/Either'
import { identity, pipe } from 'fp-ts/dist/function'
import { Reader } from 'fp-ts/dist/Reader'
import {
  ap as ap_,
  chain as chain_,
  fromReader as fromReader_,
  map as map_,
  of as of_,
} from 'fp-ts/dist/ReaderT'

/**
 * Env<E, A> has the requirements E on the environment and will eventually Resume
 * with some value A. Resume<A> can be synchronous or asynchronous.
 *
 * This is a powerful combination which can be used to create various async
 * patterns like coroutines.
 */
export interface Env<E, A> extends Reader<E, Resume<A>> {}

export type GetRequirements<A> = A extends Env<infer R, any> ? R : never

export type GetResume<A> = A extends Env<any, infer R> ? R : never

export const of: <A, R>(a: A) => Env<R, A> = of_(Pointed)

export const asks: <R, A>(f: (r: R) => A) => Env<R, A> = fromReader_(Pointed)

export const ask: <R>() => Env<R, R> = () => asks(identity)

export const chain = chain_(Monad) as <A, R1, B>(
  f: (a: A) => Env<R1, B>,
) => <R2>(ma: Env<R2, A>) => Env<Widen<R1 | R2, 'intersection'>, B>

export const fromReader: <R, A>(ma: Reader<R, A>) => Env<R, A> = fromReader_(Pointed)

export const map: <A, B>(f: (a: A) => B) => <R>(fa: Env<R, A>) => Env<R, B> = map_(Functor)

export const ap = ap_(Apply) as <R1, A>(
  fa: Env<R1, A>,
) => <R2, B>(fab: Env<R2, Arity1<A, B>>) => Env<Widen<R1 | R2, 'intersection'>, B>

export const chainRec = <A, R, B>(f: (a: A) => Env<R, Either<A, B>>) => (value: A): Env<R, B> => (
  r,
) =>
  pipe(
    value,
    chainRec_((a: A) => f(a)(r)),
  )

export const race = <R1, A>(enva: Env<R1, A>) => <R2, B>(envb: Env<R2, B>) => (r: R1 & R2) =>
  pipe(enva(r), race_(envb(r)))
