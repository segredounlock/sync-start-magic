/// <reference types="vite/client" />

declare module "virtual:source-hashes" {
  const hashes: Record<string, string>;
  export default hashes;
}

// requestIdleCallback types for Safari fallback
declare function requestIdleCallback(callback: (deadline: IdleDeadline) => void, options?: { timeout: number }): number;
declare function cancelIdleCallback(handle: number): void;
interface IdleDeadline {
  didTimeout: boolean;
  timeRemaining(): number;
}
