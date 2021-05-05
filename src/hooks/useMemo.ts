import { Env } from '@fp/Env'
import { CurrentFiber, usingFiberRefs } from '@fp/Fiber'
import { Do } from '@fp/Fx/Env'
import { getRef, setRef } from '@fp/Ref'
import { pipe } from 'cjs/function'

import { DepsArgs, useDeps } from './Deps'
import { useRef } from './useRef'

export const useMemo = <E, A, Deps extends ReadonlyArray<any> = []>(
  env: Env<E, A>,
  ...args: DepsArgs<Deps>
): Env<E & CurrentFiber, A> =>
  usingFiberRefs(
    Do(function* (_) {
      const ref = yield* _(useRef(env))
      const isEqual = yield* _(useDeps(...args))

      if (!isEqual) {
        yield* pipe(yield* _(env), setRef(ref), _)
      }

      return yield* _(getRef(ref))
    }),
  )
