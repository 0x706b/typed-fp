import { Branded, BrandValue } from '@fp/Branded'
import * as E from '@fp/Env'
import { CurrentFiber } from '@fp/Fiber'
import { AnyFn, ArgsOf } from '@fp/function'
import * as R from '@fp/Resume'
import { FunctionN } from 'fp-ts/function'

import { useMemo } from './useMemo'

export function useOp<F extends AnyFn<E.Env<any, any>>>(
  op: F,
): E.Env<
  CurrentFiber & E.GetRequirements<ReturnType<F>>,
  F extends Op<infer _, infer R> ? R : FunctionN<ArgsOf<F>, R.Resume<E.GetValue<ReturnType<F>>>>
> {
  return E.asksE((e: E.GetRequirements<ReturnType<F>>) =>
    useMemo(
      E.fromIO(() => (...args: ArgsOf<F>) => op(...args)(e)),
      [e],
    ),
  ) as F extends Op<infer _, infer R>
    ? R
    : FunctionN<ArgsOf<F>, R.Resume<E.GetValue<ReturnType<F>>>>
}

/**
 * The Op brand is capable of helping a user preserve the type parameters of
 * the return of useOp
 */
export type Op<F, G> = Branded<{ readonly Op: G }, F>

/**
 * Helper for constructing operations branded to keep their type parameters
 * @example
 * const foo = Op<<A>(value: A) => R.Resume<A>>()(E.of)
 * const useFoo = useOp(foo)
 */
export const Op = <G extends AnyFn<R.Resume<any>>>() => <
  F extends (...args: ArgsOf<G>) => E.Env<any, R.GetValue<ReturnType<G>>>
>(
  f: F,
) => Branded<Op<F, G>>()(f as BrandValue<Op<F, G>>)
