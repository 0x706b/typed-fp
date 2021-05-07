import { doEnv, toEnv } from '@fp/Fx/Env'
import { createReferences, RefValue } from '@fp/Ref'
import * as R from '@fp/Resume'
import { delay } from '@fp/Scheduler'
import { skip } from '@most/core'
import { Scheduler, Stream } from '@most/types'
import { describe, given, it } from '@typed/test'
import { left, right } from 'fp-ts/Either'
import { constVoid, pipe } from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import { createVirtualScheduler } from 'most-virtual-scheduler'

import { fork, pause } from '../Fiber'
import { Status } from '../Status'
import { createFiber } from './createFiber'
import { FiberChildren } from './FiberChildren'
import { runAsFiber } from './runAsFiber'

export const test = describe(`createFiber`, [
  given(`Env CurrentFiber a -> Option (Fiber *) -> Scheduler`, [
    describe(`queued`, [
      it(`creates a fiber w/ queued status`, ({ equal }) => {
        const resume = R.sync(() => 1)
        const [, scheduler] = createVirtualScheduler()
        const fiber = createFiber(() => resume, { scheduler })

        pipe(fiber.status, R.start(equal({ type: 'queued' })))
      }),
    ]),

    describe(`running`, [
      it(`starts running as soon as possible`, ({ equal }) => {
        const [timer, scheduler] = createVirtualScheduler()
        const fiber = createFiber(delay(100), { scheduler })

        timer.progressTimeBy(1)

        pipe(fiber.status, R.start(equal({ type: 'running' })))
      }),

      it(`sends a running event`, ({ equal }, done) => {
        const [timer, scheduler] = createVirtualScheduler()
        const fiber = createFiber(delay(100), { scheduler })

        runStream(fiber.statusEvents, scheduler, (status) => {
          try {
            equal({ type: 'running' }, status)

            done()
          } catch (err) {
            done(err)
          }
        })

        timer.progressTimeBy(1)
      }),
    ]),

    describe(`completed`, [
      describe(`when an error is thrown`, [
        it(`returns a completed status with Left<Error>`, ({ equal }) => {
          const error = new Error('Unable to complete')
          const [timer, scheduler] = createVirtualScheduler()
          const resume = R.sync(() => {
            throw error

            return 1
          })
          const fiber = createFiber(() => resume, { scheduler })

          timer.progressTimeBy(1)

          const expected: Status<number> = { type: 'completed', value: left<Error, number>(error) }

          pipe(fiber.status, R.start(equal<Status<number>>(expected)))
        }),

        it(`sends a completed event with Left<Error>`, ({ equal }, done) => {
          const error = new Error('Unable to complete')
          const [timer, scheduler] = createVirtualScheduler()
          const resume = R.sync(() => {
            throw error

            return 1
          })
          const fiber = createFiber(() => resume, { scheduler })
          const expected: Status<number> = {
            type: 'completed',
            value: left<Error, number>(error),
          }

          // Skip over running + failure events
          runStream(skip(2, fiber.statusEvents), scheduler, (status) => {
            try {
              equal(expected, status)

              done()
            } catch (err) {
              done(err)
            }
          })

          timer.progressTimeBy(1)
        }),
      ]),

      describe(`when no error is thrown`, [
        it(`returns a completed status with Right<A>`, ({ equal }) => {
          const [timer, scheduler] = createVirtualScheduler()
          const value = 1
          const resume = R.sync(() => value)
          const fiber = createFiber(() => resume, { scheduler })

          timer.progressTimeBy(1)

          const expected: Status<number> = { type: 'completed', value: right(value) }

          pipe(fiber.status, R.start(equal<Status<number>>(expected)))
        }),

        it(`returns send completed status event with Right<A>`, ({ equal }, done) => {
          const [timer, scheduler] = createVirtualScheduler()
          const value = 1
          const resume = R.sync(() => value)
          const fiber = createFiber(() => resume, { scheduler })
          const expected: Status<number> = { type: 'completed', value: right(value) }

          // Skip over running + finished events
          runStream(skip(2, fiber.statusEvents), scheduler, (status) => {
            try {
              equal(expected, status)

              done()
            } catch (err) {
              done(err)
            }
          })

          timer.progressTimeBy(1)
        }),
      ]),
    ]),

    describe(`failed`, [
      given(`an error is thrown and but there are running child fibers`, [
        it(`returns expected status`, ({ equal }) => {
          const error = new Error('Unable to complete')
          const [timer, scheduler] = createVirtualScheduler()
          const resume = R.sync(() => {
            throw error

            return 1
          })
          const child = createFiber(delay(100), { scheduler })
          const children: RefValue<typeof FiberChildren> = new Map([[child.id, child]])
          const fiber = createFiber(() => resume, {
            scheduler,
            refs: createReferences([[FiberChildren.id, children]]),
          })

          const expected: Status<number> = { type: 'failed', error }

          timer.progressTimeBy(1)

          pipe(fiber.status, R.start(equal<Status<number>>(expected)))
        }),

        it(`emits expected status event`, ({ equal }, done) => {
          const error = new Error('Unable to complete')
          const [timer, scheduler] = createVirtualScheduler()
          const resume = R.sync(() => {
            throw error

            return 1
          })
          const child = createFiber(delay(100), { scheduler })
          const children: RefValue<typeof FiberChildren> = new Map([[child.id, child]])
          const fiber = createFiber(() => resume, {
            scheduler,
            refs: createReferences([[FiberChildren.id, children]]),
          })

          const expected: Status<number> = { type: 'failed', error }

          // Skip over running event
          runStream(skip(1, fiber.statusEvents), scheduler, (status) => {
            try {
              equal(expected, status)

              done()
            } catch (err) {
              done(err)
            }
          })

          timer.progressTimeBy(1)
        }),
      ]),
    ]),

    describe(`finished`, [
      given(`fiber returns a value but there are running child fibers`, [
        it(`returns expected status`, ({ equal }) => {
          const [timer, scheduler] = createVirtualScheduler()
          const value = 1
          const resume = R.sync(() => value)
          const child = createFiber(delay(100), { scheduler })
          const children: RefValue<typeof FiberChildren> = new Map([[child.id, child]])
          const fiber = createFiber(() => resume, {
            scheduler,
            refs: createReferences([[FiberChildren.id, children]]),
          })

          const expected: Status<number> = { type: 'finished', value }

          timer.progressTimeBy(1)

          pipe(fiber.status, R.start(equal<Status<number>>(expected)))
        }),

        it(`emits expected status event`, ({ equal }, done) => {
          const [timer, scheduler] = createVirtualScheduler()
          const value = 1
          const resume = R.sync(() => value)
          const child = createFiber(delay(100), { scheduler })
          const children: RefValue<typeof FiberChildren> = new Map([[child.id, child]])
          const fiber = createFiber(() => resume, {
            scheduler,
            refs: createReferences([[FiberChildren.id, children]]),
          })

          const expected: Status<number> = { type: 'finished', value }

          // Skip over running event
          runStream(skip(1, fiber.statusEvents), scheduler, (status) => {
            try {
              equal(expected, status)

              done()
            } catch (err) {
              done(err)
            }
          })

          timer.progressTimeBy(1)
        }),
      ]),
    ]),

    describe(`pause/play`, [
      it(`allows cooperative scheduling`, ({ equal }, done) => {
        const value = 2
        const [timer, scheduler] = createVirtualScheduler()
        const child = doEnv(function* (_) {
          // Returns the parent fiber's status
          equal(O.some({ type: 'running' }), yield* _(pause))

          return value
        })

        const test = doEnv(function* (_) {
          try {
            const fiber = yield* pipe(child, toEnv, fork, _)

            equal({ type: 'queued' }, yield* _(() => fiber.status))

            // Start fiber
            timer.progressTimeBy(1)

            equal({ type: 'paused' }, yield* _(() => fiber.status))

            equal({ type: 'completed', value: right(value) }, yield* _(() => fiber.play))

            done()
          } catch (error) {
            done(error)
          }
        })

        pipe(test, toEnv, runAsFiber(scheduler))

        timer.progressTimeBy(1)
      }),

      it(`emits the expected events`, ({ equal }, done) => {
        const value = 2
        const [timer, scheduler] = createVirtualScheduler()
        const child = doEnv(function* (_) {
          // Returns the parent fiber's status
          equal(O.some({ type: 'running' }), yield* _(pause))

          return value
        })

        const expectedEvents: Array<Status<number>> = [
          { type: 'running' },
          { type: 'paused' },
          { type: 'running' },
          { type: 'finished', value },
          { type: 'completed', value: right(value) },
        ]

        const test = doEnv(function* (_) {
          const fiber = yield* pipe(child, toEnv, fork, _)

          runStream(fiber.statusEvents, scheduler, (status) => {
            try {
              const nextExpected = expectedEvents.shift()!

              equal(nextExpected, status)

              if (expectedEvents.length === 0) {
                return done()
              }
            } catch (e) {
              done(e)
            }
          })

          // Start fiber
          timer.progressTimeBy(1)

          yield* _(() => fiber.play)
        })

        pipe(test, toEnv, runAsFiber(scheduler))

        timer.progressTimeBy(1)
      }),
    ]),
  ]),
])

const runStream = <A>(stream: Stream<A>, scheduler: Scheduler, event: (value: A) => void) =>
  stream.run(
    {
      event: (_, x) => event(x),
      error: constVoid,
      end: constVoid,
    },
    scheduler,
  )
