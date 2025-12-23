declare namespace JSX {
  // Basic JSX types to satisfy TSX compilation in this project setup
  // These are permissive (any) to avoid build errors; consider installing
  // `@types/react` and enabling proper JSX libs for stricter typing.
  type Element = any;
  type ElementClass = any;
  interface ElementAttributesProperty {
    // use `props` property on components
    props: any;
  }
  interface IntrinsicAttributes {
    [key: string]: any;
  }
  interface IntrinsicClassAttributes<T> {
    [key: string]: any;
  }
  interface IntrinsicElements {
    [elemName: string]: any;
  }
  interface Fragment {
    [key: string]: any;
  }
}
