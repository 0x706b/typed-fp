---
title: ReaderTask.ts
nav_order: 48
parent: Modules
---

## ReaderTask overview

Added in v0.9.2

---

<h2 class="text-delta">Table of contents</h2>

- [Combinator](#combinator)
  - [chainRec](#chainrec)
  - [provideAll](#provideall)
  - [provideSome](#providesome)
  - [useAll](#useall)
  - [useSome](#usesome)
- [Instance](#instance)
  - [ChainRec](#chainrec)
  - [MonadRec](#monadrec)
  - [Provide](#provide)
  - [ProvideAll](#provideall)
  - [ProvideSome](#providesome)
  - [UseAll](#useall)
  - [UseSome](#usesome)

---

# Combinator

## chainRec

**Signature**

```ts
export declare const chainRec: <A, R, B>(
  f: (value: A) => RT.ReaderTask<R, E.Either<A, B>>,
) => (value: A) => RT.ReaderTask<R, B>
```

Added in v0.9.2

## provideAll

**Signature**

```ts
export declare const provideAll: <R1>(
  provided: R1,
) => <A>(readerTask: RT.ReaderTask<R1, A>) => RT.ReaderTask<unknown, A>
```

Added in v0.9.2

## provideSome

**Signature**

```ts
export declare const provideSome: <R1>(
  provided: R1,
) => <R2, A>(readerTask: RT.ReaderTask<R1 & R2, A>) => RT.ReaderTask<R2, A>
```

Added in v0.9.2

## useAll

**Signature**

```ts
export declare const useAll: <R1>(
  provided: R1,
) => <A>(readerTask: RT.ReaderTask<R1, A>) => RT.ReaderTask<unknown, A>
```

Added in v0.9.2

## useSome

**Signature**

```ts
export declare const useSome: <R1>(
  provided: R1,
) => <R2, A>(readerTask: RT.ReaderTask<R1 & R2, A>) => RT.ReaderTask<R2, A>
```

Added in v0.9.2

# Instance

## ChainRec

**Signature**

```ts
export declare const ChainRec: ChainRec2<'ReaderTask'>
```

Added in v0.9.2

## MonadRec

**Signature**

```ts
export declare const MonadRec: MonadRec2<'ReaderTask'>
```

Added in v0.9.2

## Provide

**Signature**

```ts
export declare const Provide: Provide2<'ReaderTask'>
```

Added in v0.9.2

## ProvideAll

**Signature**

```ts
export declare const ProvideAll: ProvideAll2<'ReaderTask'>
```

Added in v0.9.2

## ProvideSome

**Signature**

```ts
export declare const ProvideSome: ProvideSome2<'ReaderTask'>
```

Added in v0.9.2

## UseAll

**Signature**

```ts
export declare const UseAll: UseAll2<'ReaderTask'>
```

Added in v0.9.2

## UseSome

**Signature**

```ts
export declare const UseSome: UseSome2<'ReaderTask'>
```

Added in v0.9.2
