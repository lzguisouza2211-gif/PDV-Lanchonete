/// <reference types="react" />

// Minimal JSX global declarations to satisfy TS2503 in current CRA setup.
declare namespace JSX {
  type Element = any;
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}
