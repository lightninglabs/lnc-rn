import { action, configure, makeObservable, observable } from 'mobx';
import LNC from '@lightninglabs/lnc-rn';
import { lnrpc } from '@lightninglabs/lnc-core';
import CredentialStore from './../credentialStore';

export default class LNCStore {
    @observable public connected: boolean = false;
    @observable public loading: boolean = false;
    @observable public error: string | null;
    @observable public lnc: any;
    @observable public info: lnrpc.GetInfoResponse;

    constructor() {
        makeObservable(this);

        configure({
            enforceActions: 'never'
        });
    }

    @action
    public connect = async (mnemonic: string) => {
        this.error = null;
        this.loading = true;
        this.lnc = new LNC({
            credentialStore: new CredentialStore()
        });
        this.lnc.credentials.pairingPhrase = mnemonic;
        this.lnc.credentials.serverHost =
            'mailbox.terminal.lightning.today:443';

        const error = await this.lnc.connect();
        if (error) {
            this.loading = false;
            this.error = error;
            return error;
        }

        return new Promise<void>((resolve) => {
            let counter = 0;
            const interval = setInterval(async () => {
                counter++;
                const connected = await this.lnc.isConnected();
                if (connected) {
                    clearInterval(interval);
                    this.loading = false;
                    this.connected = true;
                    resolve();
                } else if (counter > 20) {
                    clearInterval(interval);
                    this.error =
                        'Failed to connect the LNC client to the proxy server';
                    this.loading = false;
                    resolve(this.error);
                }
            }, 500);
        });
    };

    @action
    public disconnect = () => {
        this.lnc.disconnect();
        this.connected = false;
        this.lnc = null;
    };

    @action
    public getInfo = async () => {
        this.loading = true;
        this.info = await this.lnc.lnd.lightning.getInfo({});
        this.loading = false;
    };
}
