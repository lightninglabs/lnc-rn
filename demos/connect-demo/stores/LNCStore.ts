import { action, configure, makeObservable, observable } from 'mobx';
import LNC from '@lightninglabs/lnc-rn';
import { lnrpc } from '@lightninglabs/lnc-core';
import CredentialStore from './../credentialStore';

export default class LNCStore {
    @observable public connected: boolean = false;
    @observable public loading: boolean = false;
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
        this.loading = true;
        this.lnc = new LNC({
            credentialStore: new CredentialStore()
        });
        this.lnc.credentials.pairingPhrase = mnemonic;
        this.lnc.credentials.serverHost =
            'mailbox.terminal.lightning.today:443';
        await this.lnc.connect();
        this.loading = false;
        this.connected = true;
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
