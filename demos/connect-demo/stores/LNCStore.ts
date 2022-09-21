import { action, makeObservable, observable } from 'mobx';
import LNC from '@lightninglabs/lnc-rn';
import CredentialStore from './../credentialStore';

export default class LNCStore {
    @observable public connected: boolean = false;
    @observable public loading: boolean = false;
    @observable public lnc: any;
    @observable public info: any;

    constructor() {
        makeObservable(this);
    }

    @action
    public connect = async (pnemonic: string) => {
        this.loading = true;
        this.lnc = new LNC({
            credentialStore: new CredentialStore()
        });
        this.lnc.credentials.pairingPhrase = pnemonic;
        this.lnc.credentials.serverHost =
            'mailbox.terminal.lightning.today:443';
        console.log(this.lnc.credentials.pairingPhrase);
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
