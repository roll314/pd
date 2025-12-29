export type WithoutNestedField<T, K1 extends keyof T, K2 extends keyof T[K1]> =
  & Omit<T, K1>
  & {
    [P in K1]: Omit<T[K1], K2>;
  };
