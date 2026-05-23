/// <reference types="vite/client" />
/// <reference types="@crxjs/vite-plugin/client" />

declare module "*.css?inline" {
  const css: string;
  export default css;
}
