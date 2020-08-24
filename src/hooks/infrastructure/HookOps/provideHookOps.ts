import { filter } from '@most/core'
import { Stream } from '@most/types'
import { ask, doEffect } from '@typed/fp/Effect'
import { SchedulerEnv } from '@typed/fp/fibers'
import { provideOpGroup } from '@typed/fp/Op/provideOpGroup'
import { pipe } from 'fp-ts/lib/function'

import { HookEvent, HookOps, isRemovedHookEnvironmentEvent } from '../../domain'
import { HooksManagerEnv } from '../HooksManagerEnv'
import { createEventSink } from './createEventSink'
import { createGetKeyedEnv } from './createGetKeyedEnv'
import { createProvideChannel } from './createProvideChannel'
import { createRemoveKeyedEnv } from './createRemoveKeyedEnv'
import { createRunWithHooks } from './createRunWithHooks'
import { createUseChannel } from './createUseChannel'
import { createUseRefByIndex } from './createUseRefByIndex'
import { createUseStateByIndex } from './createUseStateByIndex'
import { handleRemoveEvent } from './handleRemoveEvent'

/**
 * Provides a default implementation of all of the base hook operations around a `HookEnv`
 */
export const provideHookOps = provideOpGroup(
  HookOps,
  doEffect(function* () {
    const {
      hookEnvironment,
      hookPositions,
      channelConsumers,
      channelProviders,
      hookEvents,
      scheduler,
    } = yield* ask<HooksManagerEnv & SchedulerEnv>()

    const [sink, stream] = hookEvents

    const removeEvents = pipe(stream, filter(isRemovedHookEnvironmentEvent))

    const sendEvent = (event: HookEvent) => sink.event(scheduler.currentTime(), event)

    const listenTo = <A>(stream: Stream<A>, f: (value: A) => void) =>
      hookEnvironment.addDisposable(stream.run(createEventSink(f), scheduler))

    listenTo(removeEvents, handleRemoveEvent(hookPositions, channelConsumers, channelProviders))

    const useRefByIndex = createUseRefByIndex(hookPositions)
    const useStateByIndex = createUseStateByIndex(hookPositions, sendEvent)
    const provideChannel = createProvideChannel(channelProviders, sendEvent)
    const useChannel = createUseChannel(hookEnvironment, channelConsumers, provideChannel)
    const runWithHooks = createRunWithHooks(hookPositions, sendEvent)
    const getKeyedEnv = createGetKeyedEnv(sendEvent)
    const removeKeyedEnv = createRemoveKeyedEnv(sendEvent)

    return [
      useRefByIndex,
      useStateByIndex,
      useChannel,
      provideChannel,
      runWithHooks,
      getKeyedEnv,
      removeKeyedEnv,
    ] as const
  }),
)
