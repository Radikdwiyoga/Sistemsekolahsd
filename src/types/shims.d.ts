// Minimal shims for this project to unblock TypeScript build in case React types
// are missing or not picked up.

declare module 'react' {
  export type FormEvent<T = any> = any;
  export type ReactNode = any;
  export function useState<T = any>(initial: T): [T, (v: T) => void];
}

declare module 'react/jsx-runtime';

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}


