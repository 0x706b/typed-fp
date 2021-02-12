import { Alt as Alt_ } from '@fp/Env'
import { fromIO } from '@fp/Fx'
import { fromTask } from '@fp/Resume'
import { Widen } from '@fp/Widen'
import { Alt2 } from 'fp-ts/Alt'
import { Applicative2 } from 'fp-ts/Applicative'
import { Apply2 } from 'fp-ts/Apply'
import { FromIO2 } from 'fp-ts/FromIO'
import { FromTask2 } from 'fp-ts/FromTask'
import { pipe } from 'fp-ts/function'
import { Functor2 } from 'fp-ts/Functor'
import { Monad2 } from 'fp-ts/Monad'
import { Pointed2 } from 'fp-ts/Pointed'
import { sequence } from 'fp-ts/ReadonlyArray'

import { ap, chain, doEff, Eff, fromEnv, GetRequirements, GetResult, map, of, toEnv } from './Eff'

export const URI = '@typed/fp/Eff'
export type URI = typeof URI

declare module 'fp-ts/HKT' {
  export interface URItoKind2<E, A> {
    [URI]: Eff<E, A>
  }
}

export const Functor: Functor2<URI> = {
  URI,
  map,
}

export const Pointed: Pointed2<URI> = {
  ...Functor,
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

export const FromTask: FromTask2<URI> = {
  ...FromIO,
  fromTask: (task) => fromEnv(() => fromTask(task)),
}

export const Alt: Alt2<URI> = {
  ...Functor,
  alt: ((snd) => (fst) =>
    doEff(function* (_) {
      return yield* pipe(
        fst,
        toEnv,
        Alt_.alt(() => toEnv(snd())),
        _,
      )
    })) as Alt2<URI>['alt'],
}

export const zip = (sequence(Applicative) as unknown) as <Effs extends readonly Eff<any, any>[]>(
  envs: Effs,
) => Eff<
  Widen<GetRequirements<Effs[number]>, 'intersection'>,
  { readonly [K in keyof Effs]: GetResult<Effs[K]> }
>
