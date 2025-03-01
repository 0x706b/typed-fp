import { mergeArray } from '@most/core'
import { newDefaultScheduler } from '@most/scheduler'
import { deepStrictEqual } from 'assert'

import { pipe } from './function'
import * as R from './Resume'
import * as S from './Stream'
import { runEffects, tap } from './Stream'

export const test = describe(`Stream`, () => {
  describe(S.fromResume.name, () => {
    describe(`given a Resume<A>`, () => {
      it(`returns a Stream<A> of that value`, async () => {
        const value = 1
        const stream = pipe(
          value,
          R.of,
          S.fromResume,
          tap((x) => deepStrictEqual(x, value)),
        )

        await runEffects(stream, newDefaultScheduler())
      })
    })
  })

  describe(S.exhaustLatest.name, () => {
    describe(`given, Stream<Stream<A>>`, () => {
      it(`subscribes to only one stream at a time`, async () => {
        let subscriptions = 0
        const increment = 1
        const numberOfItems = 10
        const delay = increment * numberOfItems

        const stream = mergeArray(
          Array.from({ length: numberOfItems }, (_, i) =>
            pipe(
              S.at(
                i * increment,
                pipe(
                  S.at(delay, i + 1),
                  S.tap(() => deepStrictEqual(++subscriptions, 1)),
                  S.concatMap(() => {
                    deepStrictEqual(--subscriptions, 0)

                    return S.empty()
                  }),
                ),
              ),
            ),
          ),
        )

        await pipe(stream, S.exhaustLatest, S.collectEvents(newDefaultScheduler()))
      })

      it(`resamples when ongoing stream completes`, async () => {
        const increment = 1
        const numberOfItems = 10
        const delay = increment * numberOfItems
        const stream = mergeArray(
          Array.from({ length: numberOfItems }, (_, i) => S.at(i * increment, S.at(delay, i + 1))),
        )
        const actual = await pipe(stream, S.exhaustLatest, S.collectEvents(newDefaultScheduler()))

        deepStrictEqual(actual, [1, numberOfItems])
      })
    })
  })
})
