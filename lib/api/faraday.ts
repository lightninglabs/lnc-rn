import LNC from '../lnc';
import { FaradayServer } from '../types/proto/faraday/faraday';
import { serviceNames as sn } from '../types/proto/schema';
import { createRpc } from './createRpc';

/**
 * An API wrapper to communicate with the Faraday node via GRPC
 */
class FaradayApi {
    faradayServer: FaradayServer;

    constructor(lnc: LNC) {
        this.faradayServer = createRpc(sn.frdrpc.FaradayServer, lnc);
    }
}

export default FaradayApi;
