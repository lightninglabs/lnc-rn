import { action, configure, makeObservable, observable } from 'mobx';
import LNC from '@lightninglabs/lnc-rn';
import { lnrpc } from '@lightninglabs/lnc-core';
import CredentialStore from './../credentialStore';

export default class LNCStore {
    @observable public connected: boolean = false;
    @observable public loading: boolean = false;
    @observable public lnc1: any;
    @observable public lnc2: any;
    @observable public info1: lnrpc.GetInfoResponse;
    @observable public info2: lnrpc.GetInfoResponse;

    constructor() {
        makeObservable(this);

        configure({
            enforceActions: 'never'
        });
    }

    @action
    public connect = async (mnemonic1: string, mnemonic2: string) => {
        this.loading = true;

        this.lnc1 = new LNC({
            namespace: 'one',
            credentialStore: new CredentialStore('one')
        });
        this.lnc2 = new LNC({
            namespace: 'two',
            credentialStore: new CredentialStore('two')
        });

        this.lnc1.credentials.pairingPhrase = mnemonic1;
        this.lnc1.credentials.serverHost =
            'mailbox.terminal.lightning.today:443';

        this.lnc2.credentials.pairingPhrase = mnemonic2;
        this.lnc2.credentials.serverHost =
            'mailbox.terminal.lightning.today:443';

        await this.lnc1.connect();
        await this.lnc2.connect();

        this.loading = false;
        this.connected = true;

        return;
    };

    @action
    public disconnect = () => {
        this.lnc1.disconnect();
        this.lnc2.disconnect();
        this.connected = false;
        this.lnc1 = null;
        this.lnc2 = null;
    };

    @action
    public getInfo = async () => {
        this.loading = true;
        const info1 = await this.lnc1.lnd.lightning.getInfo({});
        const info2 = await this.lnc2.lnd.lightning.getInfo({});

        // grab isReadOnly status so someone can test with an admin
        // and with a read-only session connected to the same node
        const isReadOnly1 = await this.lnc1.isReadOnly();
        const isReadOnly2 = await this.lnc2.isReadOnly();

        this.info1 = { ...info1, isReadOnly: isReadOnly1 };
        this.info2 = { ...info2, isReadOnly: isReadOnly2 };
        this.loading = false;
    };
}
