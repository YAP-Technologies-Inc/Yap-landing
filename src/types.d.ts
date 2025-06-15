// This file is used to provide TypeScript type declarations for external modules
// that don't have their own type definitions or where installed types aren't being recognized

declare module 'three' {
  export class WebGLRenderer {
    constructor(parameters?: any);
    setSize(width: number, height: number): void;
    setPixelRatio(ratio: number): void;
    render(scene: Scene, camera: Camera): void;
  }

  export class Scene {
    add(object: Object3D): this;
  }

  export class Camera extends Object3D {
    matrixWorldInverse: any;
    projectionMatrix: any;
    projectionMatrixInverse: any;
  }

  export class PerspectiveCamera extends Camera {
    constructor(fov?: number, aspect?: number, near?: number, far?: number);
    updateProjectionMatrix(): void;
    aspect: number;
    position: Vector3;
  }

  export class Object3D {
    position: Vector3;
    rotation: any;
    scale: Vector3;
  }

  export class Vector3 {
    constructor(x?: number, y?: number, z?: number);
    x: number;
    y: number;
    z: number;
  }

  export class Mesh extends Object3D {
    constructor(geometry?: BufferGeometry, material?: Material);
    geometry: BufferGeometry;
    material: Material;
  }

  export class BufferGeometry {
    constructor();
  }

  export class PlaneGeometry extends BufferGeometry {
    constructor(width?: number, height?: number, widthSegments?: number, heightSegments?: number);
  }

  export class Material {
    constructor();
    transparent: boolean;
    uniforms: any;
  }

  export class ShaderMaterial extends Material {
    constructor(parameters?: any);
    uniforms: any;
  }

  export class Color {
    constructor(r?: number, g?: number, b?: number);
    toArray(): number[];
  }
}

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

// Crypto module declarations for YAP Landing
declare module 'bip39' {
  export function generateMnemonic(strength?: number): string;
  export function validateMnemonic(mnemonic: string): boolean;
  export function mnemonicToSeedSync(mnemonic: string, password?: string): Buffer;
  export function mnemonicToSeed(mnemonic: string, password?: string): Promise<Buffer>;
}

declare module 'crypto-js' {
  export namespace lib {
    export class WordArray {
      static random(bytes: number): WordArray;
      toString(encoder?: any): string;
    }
  }
  export namespace enc {
    export const Base64: any;
    export const Utf8: any;
  }
  export namespace mode {
    export const CTR: any;
  }
  export namespace pad {
    export const NoPadding: any;
  }
  export function PBKDF2(passphrase: string, salt: any, options: any): any;
  export namespace AES {
    export function encrypt(message: string, key: any, options: any): any;
    export function decrypt(ciphertext: string, key: any, options: any): any;
  }
}

declare module '@cosmjs/proto-signing' {
  export class DirectSecp256k1HdWallet {
    static fromMnemonic(mnemonic: string, options?: any): Promise<DirectSecp256k1HdWallet>;
    getAccounts(): Promise<any[]>;
    privkey: Uint8Array;
    pubkey: Uint8Array;
  }
}

declare module '@cosmjs/encoding' {
  export function toBech32(prefix: string, data: Uint8Array): string;
  export function fromBech32(address: string): { prefix: string; data: Uint8Array };
}

declare module 'ethers' {
  export class Wallet {
    static fromMnemonic(mnemonic: string, path?: string): Wallet;
    static fromPhrase(mnemonic: string, path?: string): Wallet;
    readonly address: string;
    readonly publicKey: string;
  }
  export function isAddress(address: string): boolean;
}
