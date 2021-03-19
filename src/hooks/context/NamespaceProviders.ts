import { MonadReader, MonadReader2, MonadReader3, MonadReader4 } from '@typed/fp/MonadReader'
import { Namespace } from '@typed/fp/Namespace'
import {
  createShared,
  getShared,
  RuntimeEnv,
  Shared,
  Shared2,
  Shared3,
  Shared4,
} from '@typed/fp/Shared'
import { WidenI } from '@typed/fp/Widen'
import { EqStrict } from 'fp-ts/dist/Eq'
import { FromIO, FromIO2, FromIO3, FromIO4 } from 'fp-ts/dist/FromIO'
import { HKT2, Kind2, Kind3, Kind4, URIS2, URIS3, URIS4 } from 'fp-ts/dist/HKT'

export const NAMESPACE_PROVIDERS = Symbol('NamespaceProviders')

export function createNamespaceProviders<F extends URIS2, E = never>(
  M: FromIO2<F>,
): Shared2<F, typeof NAMESPACE_PROVIDERS, E, Set<Namespace>>

export function createNamespaceProviders<F extends URIS3, R = never, E = never>(
  M: FromIO3<F>,
): Shared3<F, typeof NAMESPACE_PROVIDERS, R, E, Set<Namespace>>

export function createNamespaceProviders<F extends URIS4, S = never, R = never, E = never>(
  M: FromIO3<F>,
): Shared4<F, typeof NAMESPACE_PROVIDERS, S, R, E, Set<Namespace>>

export function createNamespaceProviders<F, E = never>(
  M: FromIO<F>,
): Shared<F, typeof NAMESPACE_PROVIDERS, E, Set<Namespace>>

export function createNamespaceProviders<F>(M: FromIO<F>) {
  return createShared<F>()(
    NAMESPACE_PROVIDERS,
    M.fromIO((): Set<Namespace> => new Set()) as HKT2<F, any, Set<Namespace>>,
    EqStrict,
  )
}
export function createGetNamespaceProviders<F extends URIS2, E = never>(
  M: MonadReader2<F> & FromIO2<F>,
): Kind2<F, WidenI<RuntimeEnv<F> | E>, Set<Namespace>>

export function createGetNamespaceProviders<F extends URIS3, R = never, E = never>(
  M: MonadReader3<F> & FromIO3<F>,
): Kind3<F, WidenI<RuntimeEnv<F> | R>, E, Set<Namespace>>

export function createGetNamespaceProviders<F extends URIS4, S = never, R = never, E = never>(
  M: MonadReader4<F> & FromIO4<F>,
): Kind4<F, S, WidenI<RuntimeEnv<F> | R>, E, Set<Namespace>>

export function createGetNamespaceProviders<F, E = never>(
  M: MonadReader<F> & FromIO<F>,
): HKT2<F, WidenI<RuntimeEnv<F> | E>, Set<Namespace>>

export function createGetNamespaceProviders<F, E = never>(
  M: MonadReader<F> & FromIO<F>,
): HKT2<F, WidenI<RuntimeEnv<F> | E>, Set<Namespace>> {
  return getShared(M)(createNamespaceProviders(M))
}
