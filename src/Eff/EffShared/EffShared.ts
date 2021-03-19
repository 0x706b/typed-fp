import {
  createShared as createShared_,
  deleteShared as deleteShared_,
  DeleteShared2,
  fromKey as fromKey_,
  getShared as getShared_,
  GetShared2,
  modifyShared as modifyShared_,
  setShared as setShared_,
  SetShared2,
  Shared2,
} from '@typed/fp/Shared'
import { WidenI } from '@typed/fp/Widen'
import { Eq } from 'fp-ts/dist/Eq'
import { Option } from 'fp-ts/dist/Option'

import { Eff } from '../Eff'
import { FromReader, Functor, MonadReader, URI } from '../fp-ts'

export interface EffShared<K, E, A> extends Shared2<URI, K, E, A> {}

export const createShared: <K, E, A>(
  key: K,
  initial: Eff<E, A>,
  eq?: Eq<A>,
) => EffShared<K, E, A> = createShared_<URI>()

export const modifyShared: <A>(
  f: (value: A) => A,
) => <K, E>(
  shared: EffShared<K, E, A>,
) => Eff<WidenI<E | SetShared2<URI> | GetShared2<URI>>, A> = modifyShared_(MonadReader)

export const getShared: <K, E, A>(
  shared: EffShared<K, E, A>,
) => Eff<WidenI<E | GetShared2<URI>>, A> = getShared_(MonadReader)

export const setShared: <A>(
  value: A,
) => <K, E>(shared: EffShared<K, E, A>) => Eff<WidenI<E | SetShared2<URI>>, A> = setShared_(
  MonadReader,
)

export const deleteShared: <K, E, A>(
  shared: EffShared<K, E, A>,
) => Eff<WidenI<E | DeleteShared2<URI>>, Option<A>> = deleteShared_(MonadReader)

export const fromKey: <A>(
  eq?: Eq<A>,
) => <K extends string | number | symbol>(
  key: K,
) => EffShared<K, Readonly<Record<K, A>>, A> = fromKey_({ ...FromReader, ...Functor })
