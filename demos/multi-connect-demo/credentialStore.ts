import EncryptedStorage from 'react-native-encrypted-storage';
import { CredentialStore } from '@lightninglabs/lnc-rn';

const STORAGE_KEY = 'lnc-rn';

/**
 * A wrapper around `EncryptedStorage` used to store sensitive data required
 * by LNC to reconnect after the initial pairing process has been completed.
 */
export default class LncCredentialStore implements CredentialStore {
    // the data to store in EncryptedStorage
    private persisted = {
        serverHost: '',
        localKey: '',
        remoteKey: '',
        pairingPhrase: ''
    };
    // the decrypted credentials in plain text. these fields are separate from the
    // persisted encrypted fields in order to be able to set the password at any
    // time. we may have plain text values that we need to hold onto until the
    // password is set, or may load encrypted values that we delay decrypting until
    // the password is provided.
    private _localKey: string = '';
    private _remoteKey: string = '';
    private _pairingPhrase: string = '';
    // namespace
    public namespace: string = '';

    /**
     * Constructs a new `LncCredentialStore` instance
     */
    constructor(namespace: string = 'default') {
        this.namespace = namespace;

        this.load();
    }

    //
    // Public fields which implement the `CredentialStore` interface
    //

    /** Stores the host:port of the Lightning Node Connect proxy server to connect to */
    get serverHost() {
        return this.persisted.serverHost;
    }

    /** Stores the host:port of the Lightning Node Connect proxy server to connect to */
    set serverHost(host: string) {
        this.persisted.serverHost = host;
        this._save();
    }

    /** Stores the LNC pairing phrase used to initialize the connection to the LNC proxy */
    get pairingPhrase() {
        return this._pairingPhrase;
    }

    /** Stores the LNC pairing phrase used to initialize the connection to the LNC proxy */
    set pairingPhrase(phrase: string) {
        this._pairingPhrase = phrase;
        this.persisted.pairingPhrase = phrase;
        this.load();
    }

    /** Stores the local private key which LNC uses to reestablish a connection */
    get localKey() {
        return this._localKey;
    }

    /** Stores the local private key which LNC uses to reestablish a connection */
    set localKey(key: string) {
        this._localKey = key;
        this.persisted.localKey = key;
        this._save();
    }

    /** Stores the remote static key which LNC uses to reestablish a connection */
    get remoteKey() {
        return this._remoteKey;
    }

    /** Stores the remote static key which LNC uses to reestablish a connection */
    set remoteKey(key: string) {
        this._remoteKey = key;
        this.persisted.remoteKey = key;
        this._save();
    }

    /**
     * Read-only field which should return `true` if the client app has prior
     * credentials persisted in teh store
     */
    get isPaired() {
        return !!this.persisted.remoteKey || !!this.persisted.pairingPhrase;
    }

    /** Clears any persisted data in the store */
    clear() {
        const key = `${STORAGE_KEY}:${this.namespace}`;
        EncryptedStorage.removeItem(key);
        this.persisted = {
            serverHost: this.persisted.serverHost,
            localKey: '',
            remoteKey: '',
            pairingPhrase: ''
        };
        this._localKey = '';
        this._remoteKey = '';
        this._pairingPhrase = '';
    }

    /** Loads persisted data from EncryptedStorage */
    async load() {
        try {
            const key = `${STORAGE_KEY}:${this.namespace}`;
            const json = await EncryptedStorage.getItem(key);
            if (!json) return this._save();
            this.persisted = JSON.parse(json);
            this._localKey = this.persisted.localKey;
            this._remoteKey = this.persisted.remoteKey;
        } catch (error) {
            const msg = (error as Error).message;
            throw new Error(`Failed to load secure data: ${msg}`);
        }
    }

    //
    // Private functions only used internally
    //

    /** Saves persisted data to EncryptedStorage */
    private _save() {
        // only save if namespace is set
        if (!this.namespace) return;
        const key = `${STORAGE_KEY}:${this.namespace}`;
        EncryptedStorage.setItem(key, JSON.stringify(this.persisted));
    }
}
