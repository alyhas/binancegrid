export type Maybe<T> = T | null;

export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== undefined && value !== null;
}

export function assertNever(x: never): never {
  throw new Error(
    `Unexpected value ${JSON.stringify(x)}. Should have been never.`
  );
}
