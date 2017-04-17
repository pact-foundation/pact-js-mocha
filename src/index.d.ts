/// <reference types="mocha" />

declare module "pact-js-mocha" {}

declare interface Interaction {
  state: string,
  uponReceiving: string,
  withRequest: {
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS',
    path: string,
    query?: any;
    headers?: {[name: string]: string;},
    body?: any;
  },
  willRespondWith: {
    status: number,
    headers?: {[name: string]: string;},
    body?: any;
  }
}

declare interface PactMochaOptions {
    consumer: string;
    provider: string;
}

declare interface PactMochaConsumerOptions extends PactMochaOptions {
    providerPort: number;
}

declare type PactMochaCallback = (this: Mocha.ISuite, arg: {}) => void;

declare type DataCallback = (data: any, done: () => void) => void;

declare interface VerifyPactsOptions {
    name?: string;
    [name: string]: any;
}

declare function PactConsumer(opts: PactMochaConsumerOptions, fn: PactMochaCallback): Mocha.ISuite;
declare function PactProvider(opts: PactMochaOptions, fn: PactMochaCallback): Mocha.ISuite;
declare function xPact(consumer: string, provider: string, fn: PactMochaCallback): Mocha.ISuite;
declare function xPactProvider(consumer: string, provider: string, fn: PactMochaCallback): Mocha.ISuite;
declare function addInteractions(interactions: Interaction[]): void;
declare function finalizePact(): void;
declare function verify(title: string, clientRequestFn: () => Promise<any>, fn: DataCallback): Mocha.ITest;
declare function honourPact(opts: VerifyPactsOptions, fn: DataCallback): Mocha.ITest;
