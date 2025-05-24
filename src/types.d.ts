// This file is used to provide TypeScript type declarations for external modules
// that don't have their own type definitions or where installed types aren't being recognized

// Fix for circular reference errors in @types/node
declare module '@types/node/stream/web' {
  // Bypass the circular reference issues by providing simplified types
  export interface ReadableByteStreamController {
    close(): void;
    enqueue(chunk: ArrayBufferView): void;
    error(reason?: any): void;
    readonly byobRequest: ReadableStreamBYOBRequest | null;
    readonly desiredSize: number | null;
  }

  export interface ReadableStreamBYOBReader {
    readonly closed: Promise<void>;
    cancel(reason?: any): Promise<void>;
    releaseLock(): void;
    read<T extends ArrayBufferView>(view: T): Promise<ReadableStreamReadResult<T>>;
  }

  export interface ReadableStreamBYOBRequest {
    readonly view: ArrayBufferView;
    respond(bytesWritten: number): void;
    respondWithNewView(view: ArrayBufferView): void;
  }

  export interface ReadableStreamReadResult<T> {
    done: boolean;
    value: T | undefined;
  }
}
