import { WidenI } from '@typed/fp/Widen'
import { pipe } from 'fp-ts/dist/function'
import { HKT, Kind2, Kind3, Kind4, URIS2, URIS3, URIS4 } from 'fp-ts/dist/HKT'
import { Monad, Monad2, Monad3, Monad4 } from 'fp-ts/dist/Monad'
import { RuntimeEnv } from './RuntimeEnv'

export function createGetOrInsert<F extends URIS2>(
  M: Monad2<F>,
): <A, B, E>(
  map: Map<A, B>,
  key: A,
  insert: Kind2<F, E, B>,
) => Kind2<F, WidenI<RuntimeEnv<F> | E>, B>

export function createGetOrInsert<F extends URIS3>(
  M: Monad3<F>,
): <A, B, R, E>(
  map: Map<A, B>,
  key: A,
  insert: Kind3<F, R, E, B>,
) => Kind3<F, WidenI<RuntimeEnv<F> | R>, E, B>

export function createGetOrInsert<F extends URIS4>(
  M: Monad4<F>,
): <A, B, S, R, E>(
  map: Map<A, B>,
  key: A,
  insert: Kind4<F, S, R, E, B>,
) => Kind4<F, S, WidenI<RuntimeEnv<F> | R>, E, B>

export function createGetOrInsert<F>(
  M: Monad<F>,
): <A, B>(map: Map<A, B>, key: A, insert: HKT<F, B>) => HKT<F, B>

export function createGetOrInsert<F>(M: Monad<F>) {
  return <A, B>(map: Map<A, B>, key: A, insert: HKT<F, B>) =>
    pipe(
      map,
      M.of,
      M.chain((map) => {
        if (map.has(key)) {
          return M.of(map.get(key)!)
        }

        return pipe(
          insert,
          M.map((value) => {
            map.set(key, value)

            return value
          }),
        )
      }),
    )
}
