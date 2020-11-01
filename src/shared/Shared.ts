import { Effect, EnvOf as EffEnv, ReturnOf } from '@typed/fp/Effect/exports'
import { createSchema } from '@typed/fp/io/exports'
import { Eq, eqStrict } from 'fp-ts/Eq'
import { HKT } from 'fp-ts/HKT'

/**
 * A shared value that can be used to dynamically keep track of state
 */
export interface Shared<K extends PropertyKey = PropertyKey, E = any, A = any> {
  readonly key: K
  readonly initial: Effect<E, A>
  readonly eq: Eq<A>
}

export namespace Shared {
  export const schema = createSchema<Shared>((t) =>
    t.type({
      key: t.union(t.string, t.number, t.symbol),
      initial: t.unknown as HKT<any, Shared['initial']>,
      eq: t.unknown as HKT<any, Shared['eq']>,
    }),
  )
}

/**
 * Get the key of a shared value type
 */
export type KeyOf<A extends Shared> = A['key']

/**
 * Get the value of a shared value type
 */
export type ValueOf<A extends Shared> = ReturnOf<A['initial']>

/**
 * Get the requirements for a Shared value to satisfy it's
 * type-signature.
 */
export type EnvOf<A extends Shared> = EffEnv<A['initial']>

/**
 * Contstruct a share value
 */
export function shared<K extends PropertyKey, E, A>(
  key: K,
  initial: Effect<E, A>,
  eq: Eq<A> = eqStrict,
): Shared<K, E, A> {
  return {
    key,
    initial,
    eq,
  }
}

/**
 * Provide a new initial value for a Shared key.
 */
export function provideInitial<S extends Shared>(s: S, initial: S['initial']): S {
  return shared(s.key, initial, s.eq) as S
}

/**
 * Provide a new Eq instance for a Shared key.
 */
export function provideEq<S extends Shared>(s: S, eq: S['eq']): S {
  return shared(s.key, s.initial, eq) as S
}
