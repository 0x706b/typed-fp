import * as E from '@fp/Env'
import * as RS from '@fp/ReaderStream'
import * as RSO from '@fp/ReaderStreamOption'
import * as Ref from '@fp/Ref'
import * as RefArray from '@fp/RefArray'
import { flow, pipe } from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import * as RA from 'fp-ts/ReadonlyArray'

import { createTodo, isActiveTodo, isCompletedTodo, Todo, TodoId } from './domain'

// Current Todo Filter

export type TodoFilter = 'all' | 'active' | 'completed'

export const getCurrentFilter = E.op<() => E.Of<TodoFilter>>()('getCurrentFilter')()

export const CurrentFilter = Ref.kv(getCurrentFilter)

// Currently selected Todo

export const SelectedTodo = Ref.kv(E.of<O.Option<TodoId>>(O.none))

export const isSelectedTodo = (todo: Todo) =>
  pipe(
    SelectedTodo.get,
    E.map(
      flow(
        O.map((selectedId) => selectedId === todo.id),
        O.getOrElseW(() => false),
      ),
    ),
  )

export const selectTodo = (todo: Todo) => SelectedTodo.set(O.some(todo.id))

export const deselectTodo = SelectedTodo.set(O.none)

// Todos

export const loadTodos = E.op<() => E.Of<readonly Todo[]>>()('loadTodos')()

export const Todos = Ref.kv(loadTodos)

export const clearCompleted = pipe(Todos, RefArray.filter(isActiveTodo))

export const removeTodoById = (id: TodoId) =>
  pipe(
    Todos,
    RefArray.filter((todo) => todo.id !== id),
  )

export const toggleAll = (completed: boolean) =>
  pipe(
    Todos,
    RefArray.endoMap((todo) => ({ ...todo, completed })),
  )

export const updateTodoDescription = (todo: Todo, description: string) =>
  pipe(
    Todos,
    RefArray.endoMap((t) => (t.id === todo.id ? { ...t, description } : t)),
  )

export const updateTodoCompleted = (todo: Todo, completed: boolean) =>
  pipe(
    Todos,
    RefArray.endoMap((t) => (t.id === todo.id ? { ...t, completed } : t)),
  )

export const createNewTodo = flow(
  createTodo,
  E.chainW((todo) => pipe(Todos, RefArray.append(todo))),
)

export const filterTodos =
  (filter: TodoFilter) =>
  (todos: readonly Todo[]): readonly Todo[] => {
    if (filter === 'active') {
      return todos.filter(isActiveTodo)
    }

    if (filter === 'completed') {
      return todos.filter(isCompletedTodo)
    }

    return todos
  }

export const getTodos = pipe(filterTodos, E.of, E.apW(CurrentFilter.get), E.apW(Todos.get))

export const getNumActiveTodos = pipe(Todos.get, E.map(flow(RA.filter(isActiveTodo), RA.size)))

export const getNumCompletedTodos = pipe(
  Todos.get,
  E.map(flow(RA.filter(isCompletedTodo), RA.size)),
)

export const saveTodos = E.op<(todos: readonly Todo[]) => E.Of<void>>()('saveTodos')

export const saveTodosOnChange = pipe(
  Todos.values,
  RSO.getOrElseW((): readonly Todo[] => []),
  RS.chainEnvK(saveTodos),
)
