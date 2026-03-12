/// <reference types="vite/client" />

declare module "virtual:source-hashes" {
  const hashes: Record<string, string>;
  export default hashes;
}
