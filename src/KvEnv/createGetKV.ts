import { KV, KV2, KV3, KV4 } from '@typed/fp/KV'
import {
  ask,
  MonadReader,
  MonadReader2,
  MonadReader3,
  MonadReader3C,
  MonadReader4,
} from '@typed/fp/MonadReader'
import { chainFirst } from 'fp-ts/dist/Chain'
import { FromIO, FromIO2, FromIO3, FromIO3C, FromIO4 } from 'fp-ts/dist/FromIO'
import { pipe } from 'fp-ts/dist/function'
import { HKT2, Kind2, Kind3, Kind4, URIS2, URIS3, URIS4 } from 'fp-ts/dist/HKT'
import { match } from 'fp-ts/dist/Option'

import { WidenI } from '../Widen'
import { createSendKvEvent } from './createSendKvEvent'
import { KvEnv, KvOf } from './KvEnv'
import { lookup } from './lookup'

export function createGetKV<F extends URIS4>(
  M: MonadReader4<F> & FromIO4<F>,
): <K, S, R, E, A>(kv: KV4<F, K, S, R, E, A>) => Kind4<F, S, WidenI<KvEnv<F, K, A> | R>, E, A>

export function createGetKV<F extends URIS3>(
  M: MonadReader3<F> & FromIO3<F>,
): <K, R, E, A>(kv: KV3<F, K, R, E, A>) => Kind3<F, WidenI<KvEnv<F, K, A> | R>, E, A>

export function createGetKV<F extends URIS3, E>(
  M: MonadReader3C<F, E> & FromIO3C<F, E>,
): <K, R, A>(kv: KV3<F, K, R, E, A>) => Kind3<F, WidenI<KvEnv<F, K, A> | R>, E, A>

export function createGetKV<F extends URIS2>(
  M: MonadReader2<F> & FromIO2<F>,
): <K, E, A>(kv: KV2<F, K, E, A>) => Kind2<F, WidenI<KvEnv<F, K, A> | E>, A>

export function createGetKV<F>(
  M: MonadReader<F> & FromIO<F>,
): <K, E, A>(kv: KV<F, K, E, A>) => HKT2<F, WidenI<KvEnv<F, K, A> | E>, A>

export function createGetKV<F>(M: MonadReader<F> & FromIO<F>) {
  const sendEvent = createSendKvEvent(M)
  const chainF = chainFirst(M)
  const get = ask(M)

  return <K, E, A>(kv: KV<F, K, E, A>) =>
    pipe(
      get<KvEnv<F, K, A>>(),
      M.chain(({ kvMap }) =>
        pipe(
          kvMap,
          lookup(kv.key),
          match(
            // If there is no value already in the kvMap, run the KV's initial value effect
            // and send an event that lets the runtime know that it should record this value.
            () =>
              pipe(
                kv.initial,
                chainF((value) => sendEvent({ type: 'kv/created', kv: kv as KvOf<F>, value })),
              ),
            M.of,
          ),
        ),
      ),
    )
}
