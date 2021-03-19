import { fromIO } from '@typed/fp/Fx'
import { Alt2 } from 'fp-ts/dist/Alt'
import { Applicative2 } from 'fp-ts/dist/Applicative'
import { Apply2 } from 'fp-ts/dist/Apply'
import { Alt as Alt_ } from 'fp-ts/dist/Either'
import { FromIO2 } from 'fp-ts/dist/FromIO'
import { pipe } from 'fp-ts/dist/function'
import { Functor2 } from 'fp-ts/dist/Functor'
import { Monad2 } from 'fp-ts/dist/Monad'
import { Pointed2 } from 'fp-ts/dist/Pointed'
import { traverse } from 'fp-ts/dist/ReadonlyArray'

import { ap, chain, doEither, EitherFx, GetLeft, GetResult, map, of, toEither } from './EitherFx'

export const URI = '@typed/fp/EitherFx'
export type URI = typeof URI

declare module 'fp-ts/dist/HKT' {
  export interface URItoKind2<E, A> {
    [URI]: EitherFx<E, A>
  }
}

export const Functor: Functor2<URI> = {
  URI,
  map,
}

export const Pointed: Pointed2<URI> = {
  of,
}

export const Apply: Apply2<URI> = {
  ...Functor,
  ap: ap as Apply2<URI>['ap'],
}

export const Applicative: Applicative2<URI> = {
  ...Apply,
  ...Pointed,
}

export const Monad: Monad2<URI> = {
  ...Functor,
  ...Pointed,
  chain: chain as Monad2<URI>['chain'],
}

export const FromIO: FromIO2<URI> = {
  URI,
  fromIO,
}

export const Alt: Alt2<URI> = {
  ...Functor,
  alt: ((snd) => (fst) =>
    doEither(function* (_) {
      return yield* pipe(
        fst,
        toEither,
        Alt_.alt(() => toEither(snd())),
        _,
      )
    })) as Alt2<URI>['alt'],
}

export const zip = (traverse(Applicative)(of) as unknown) as <
  Effs extends readonly EitherFx<any, any>[]
>(
  envs: Effs,
) => EitherFx<GetLeft<Effs[number]>, { readonly [K in keyof Effs]: GetResult<Effs[K]> }>
