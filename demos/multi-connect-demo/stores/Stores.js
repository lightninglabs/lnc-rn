import LNCStore from './LNCStore';

class Stores {
    constructor() {
        this.lncStore = new LNCStore();
    }
}

const stores = new Stores();
export default stores;
