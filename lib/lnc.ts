import { NativeModules } from 'react-native';
import { FaradayApi, LndApi, LoopApi, PoolApi } from './api';
import { CredentialStore, LncConfig, ClientGlobal } from './types/lnc';
import LncCredentialStore from './util/credentialStore';
import { wasmLog as log } from './util/log';
import { snakeKeysToCamel } from './util/objects';

/** The default values for the LncConfig options */
const DEFAULT_CONFIG = {
    serverHost: 'mailbox.terminal.lightning.today:443'
} as Required<LncConfig>;

export default class LNC {
    result?: any;

    _lncClientCode: any;
    credentials: CredentialStore;

    lnd: LndApi;
    loop: LoopApi;
    pool: PoolApi;
    faraday: FaradayApi;

    constructor(lncConfig?: LncConfig) {
        // merge the passed in config with the defaults
        const config = Object.assign({}, DEFAULT_CONFIG, lncConfig);

        if (config.credentialStore) {
            this.credentials = config.credentialStore;
        } else {
            this.credentials = new LncCredentialStore(
                config.password
            );
            // don't overwrite an existing serverHost if we're already paired
            if (!this.credentials.isPaired)
                this.credentials.serverHost = config.serverHost;
            if (config.pairingPhrase)
                this.credentials.pairingPhrase = config.pairingPhrase;
        }

        this.lnd = new LndApi(this);
        this.loop = new LoopApi(this);
        this.pool = new PoolApi(this);
        this.faraday = new FaradayApi(this);
    }

    private get client() {
        return NativeModules.LncBridge.Client;
    }

    get isConnected() {
        return (
            this.client &&
            this.client.lncClientIsConnected &&
            this.client.lncClientIsConnected()
        );
    }

    get status() {
        return (
            this.client &&
            this.client.lncClientStatus &&
            this.client.lncClientStatus()
        );
    }

    get expiry(): Date {
        return (
            this.client &&
            this.client.lncClientGetExpiry &&
            new Date(this.client.lncClientGetExpiry() * 1000)
        );
    }

    get isReadOnly() {
        return (
            this.client &&
            this.client.lncClientIsReadOnly &&
            this.client.lncClientIsReadOnly()
        );
    }

    hasPerms(permission: string) {
        return (
            this.client &&
            this.client.lncClientHasPerms &&
            this.client.lncClientHasPerms(permission)
        );
    }

    /**
     * Loads keys from storage and runs the Wasm client binary
     */
    // TODO remove async?
    async run() {
        global.onLocalPrivCreate = (keyHex: string) => {
            log.debug('local private key created: ' + keyHex);
            this.credentials.localKey = keyHex;
        };

        global.onRemoteKeyReceive = (keyHex: string) => {
            log.debug('remote key received: ' + keyHex);
            this.credentials.remoteKey = keyHex;
        };

        global.onAuthData = (keyHex: string) => {
            log.debug('auth data received: ' + keyHex);
        };

        // TODO intialize client with args

        // this.go.argv = [
        //     'wasm-client',
        //     '--debuglevel=trace',
        //     '--onlocalprivcreate=onLocalPrivCreate',
        //     '--onremotekeyreceive=onRemoteKeyReceive',
        //     '--onauthdata=onAuthData'
        // ];

        // if (this.result) {
        //     this.go.run(this.result.instance);
        //     await WebAssembly.instantiate(
        //         this.result.module,
        //         this.go.importObject
        //     );
        // } else {
        //     throw new Error("Can't find WASM instance.");
        // }
    }

    /**
     * Connects to the LNC proxy server
     * @returns a promise that resolves when the connection is established
     */
    async connect() {
        // do not attempt to connect multiple times
        if (this.isConnected) return;

        const { pairingPhrase, localKey, remoteKey, serverHost } =
            this.credentials;

        // connect to the server
        this.client.lncClientConnectServer(
            serverHost,
            false,
            pairingPhrase,
            localKey,
            remoteKey
        );

        // add an event listener to disconnect if the page is unloaded
        // TODO remove window
        // window.addEventListener('unload', this.client.lncClientDisconnect);

        // repeatedly check if the connection was successful
        return new Promise<void>((resolve, reject) => {
            let counter = 0;
            const interval = setInterval(() => {
                counter++;
                if (this.isConnected) {
                    clearInterval(interval);
                    resolve();
                    log.info('The LNC client is connected to the server');
                } else if (counter > 20) {
                    clearInterval(interval);
                    reject(
                        'Failed to connect the LNC client to the proxy server'
                    );
                }
            }, 500);
        });
    }

    /**
     * Disconnects from the proxy server
     */
    disconnect() {
        this.client.lncClientDisconnect();
    }

    /**
     * Emulates a GRPC request but uses the WASM client instead to communicate with the LND node
     * @param method the GRPC method to call on the service
     * @param request The GRPC request message to send
     */
    request<TRes>(method: string, request?: object): Promise<TRes> {
        return new Promise((resolve, reject) => {
            log.debug(`${method} request`, request);
            const reqJSON = JSON.stringify(request || {});
            this.client.lncClientInvokeRPC(
                method,
                reqJSON,
                (response: string) => {
                    try {
                        const rawRes = JSON.parse(response);
                        const res = snakeKeysToCamel(rawRes);
                        log.debug(`${method} response`, res);
                        resolve(res as TRes);
                    } catch (error) {
                        log.debug(`${method} raw response`, response);
                        reject(new Error(response));
                        return;
                    }
                }
            );
        });
    }

    /**
     * Subscribes to a GRPC server-streaming endpoint and executes the `onMessage` handler
     * when a new message is received from the server
     * @param method the GRPC method to call on the service
     * @param request the GRPC request message to send
     * @param onMessage the callback function to execute when a new message is received
     * @param onError the callback function to execute when an error is received
     */
    subscribe<TRes>(
        method: string,
        request?: object,
        onMessage?: (res: TRes) => void,
        onError?: (res: Error) => void
    ) {
        log.debug(`${method} request`, request);
        const reqJSON = JSON.stringify(request || {});
        this.client.lncClientInvokeRPC(method, reqJSON, (response: string) => {
            try {
                const rawRes = JSON.parse(response);
                const res = snakeKeysToCamel(rawRes);
                log.debug(`${method} response`, res);
                if (onMessage) onMessage(res as TRes);
            } catch (error) {
                log.debug(`${method} error`, error);
                const err = new Error(response);
                if (onError) onError(err);
            }
        });
    }
}
