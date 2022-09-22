import { NativeModules } from 'react-native';
import { FaradayApi, LndApi, LoopApi, PoolApi } from './api';
import { CredentialStore, LncConfig } from './types/lnc';
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
            this.credentials = new LncCredentialStore(config.pairingPhrase);
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

        NativeModules.LncModule.registerLocalPrivCreateCallback(
            this.onLocalPrivCreate
        );
        NativeModules.LncModule.registerRemoteKeyReceiveCallback(
            this.onRemoteKeyReceive
        );
        NativeModules.LncModule.registerAuthDataCallback(this.onAuthData);

        NativeModules.LncModule.initLNC();
    }

    onLocalPrivCreate = (keyHex: string) => {
        log.debug('local private key created: ' + keyHex);
        this.credentials.localKey = keyHex;
    };

    onRemoteKeyReceive = (keyHex: string) => {
        log.debug('remote key received: ' + keyHex);
        this.credentials.remoteKey = keyHex;
    };

    onAuthData = (keyHex: string) => {
        log.debug('auth data received: ' + keyHex);
    };

    async isConnected() {
        return await NativeModules.LncModule.isConnected();
    }

    async status() {
        return await NativeModules.LncModule.status();
    }

    async expiry() {
        const expiry = await NativeModules.LncModule.expiry();
        return new Date(expiry * 1000);
    }

    async isReadOnly() {
        return await NativeModules.LncModule.isReadOnly();
    }

    async hasPerms(permission: string) {
        return await NativeModules.LncModule.hasPerms(permission);
    }

    /**
     * Connects to the LNC proxy server
     * @returns a promise that resolves when the connection is established
     */
    async connect() {
        // do not attempt to connect multiple times
        let connected = await this.isConnected();
        if (connected) return;

        const { pairingPhrase, localKey, remoteKey, serverHost } =
            this.credentials;

        // connect to the server
        NativeModules.LncModule.connectServer(
            serverHost,
            false,
            pairingPhrase,
            localKey,
            remoteKey
        );

        // repeatedly check if the connection was successful
        return new Promise<void>((resolve, reject) => {
            let counter = 0;
            const interval = setInterval(async () => {
                counter++;
                connected = await this.isConnected();
                if (connected) {
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
        NativeModules.LncModule.disconnect();
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
            NativeModules.LncModule.invokeRPC(
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
    subscribe(method: string, request?: object): string {
        log.debug(`${method} request`, request);
        const reqJSON = JSON.stringify(request || {});
        NativeModules.LncModule.initListener(method, reqJSON);
        return method;
    }
}
