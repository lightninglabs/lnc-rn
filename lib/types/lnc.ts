export interface ClientGlobal {
    /*
     * Returns true if the LNC client is currently connected to the proxy server
     */
    lncClientIsConnected: () => boolean;
    /**
     * Attempts to connect to the proxy server
     */
    lncClientConnectServer: (
        serverHost: string,
        isDevServer: boolean,
        pairingPhrase: string,
        localKey?: string,
        remoteKey?: string
    ) => void;
    /**
     * disconnects from the proxy server
     */
    lncClientDisconnect: () => void;
    /**
     * Invokes an RPC command with a request object and executes the provided callback
     * with the response
     */
    lncClientInvokeRPC: (
        rpcName: string,
        request: any,
        callback: (response: string) => any
    ) => void;
    /**
     * Returns true if client has specific permissions
     * e.g. 'lnrpc.Lightning.GetInfo'
     */
    lncClientHasPerms: (permission: string) => boolean;
    /**
     * Returns true if the LNC client is read only
     */
    lncClientIsReadOnly: () => boolean;
    /**
     * Returns the LNC client status
     */
    lncClientStatus: () => string;
    /**
     * Returns the LNC client expiry time
     */
    lncClientGetExpiry: () => number;
}

export interface LncConfig {
    /**
     * Specify a custom Lightning Node Connect proxy server. If not specified we'll
     * default to `mailbox.terminal.lightning.today:443`.
     */
    serverHost?: string;
    /**
     * The LNC pairing phrase used to initialize the connection to the LNC proxy.
     * This value will be passed along to the credential store.
     */
    pairingPhrase?: string;
    /**
     * By default, this module will handle storage of your local and remote keys
     * for you in local storage. This password ise used to encrypt the keys for
     * future use. If the password is not provided here, it must be
     * set directly via `lnc.credentials.password` in order to persist data
     * across page loads
     */
    password?: string;
    /**
     * Custom store used to save & load the pairing phrase and keys needed to
     * connect to the proxy server.
     */
    credentialStore?: CredentialStore;
}

/**
 * The interface that must be implemented to provide `LNC` instances with storage
 * for its persistent data. These fields will be read and written to during the
 * authentication and connection process.
 */
export interface CredentialStore {
    /**
     * Stores the optional password to use for encryption of the data. LNC does not
     * read or write the password. This is just exposed publicly to simplify access
     * to the field via `lnc.credentials.password`
     */
    password?: string;
    /** Stores the LNC pairing phrase used to initialize the connection to the LNC proxy */
    pairingPhrase: string;
    /** Stores the host:port of the Lightning Node Connect proxy server to connect to */
    serverHost: string;
    /** Stores the local private key which LNC uses to reestablish a connection */
    localKey: string;
    /** Stores the remote static key which LNC uses to reestablish a connection */
    remoteKey: string;
    /**
     * Read-only field which should return `true` if the client app has prior
     * credentials persisted in the store
     */
    isPaired: boolean;
    /** Clears any persisted data in the store */
    clear(): void;
}
