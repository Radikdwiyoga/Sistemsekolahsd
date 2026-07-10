// Minimal shims for this project to unblock TypeScript build in case React types
// are missing or not picked up.
// NOTE: This file intentionally provides loose types only for compilation.

declare module 'react' {
  export type ReactNode = any;
  export type FormEvent<T = any> = any;
  export type ChangeEvent<T = any> = any;
  export type SVGProps<T = any> = any;

  export const StrictMode: any;

  export function useState<T = any>(initial: T): [T, (v: T | ((prev: T) => T)) => void];
  export function useEffect(effect: any, deps?: any[]): void;
}

declare module 'react/jsx-runtime';

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}



