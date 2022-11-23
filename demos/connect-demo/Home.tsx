import React from 'react';
import {
    ActivityIndicator,
    Button,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';
import { inject, observer } from 'mobx-react';
import LNCStore from './stores/LNCStore';

interface HomeProps {
    LNCStore: LNCStore;
}

interface HomeStore {
    mnemonic: string;
}

@inject('LNCStore')
@observer
export default class Home extends React.Component<HomeProps, HomeStore> {
    constructor(props: any) {
        super(props);
        this.state = {
            mnemonic: ''
        };
    }

    onChangeMnemonic = (text) => this.setState({ mnemonic: text });

    attemptConnect = async () => {
        const error = await this.props.LNCStore.connect(this.state.mnemonic);
        if (!error) this.props.LNCStore.getInfo();
    };

    disconnect = () => this.props.LNCStore.disconnect();

    render() {
        const { mnemonic } = this.state;
        const { LNCStore } = this.props;
        const { lnc, loading, connected, info, error } = LNCStore;

        return (
            <View style={styles.container}>
                {!!loading && <ActivityIndicator />}
                {!!error && !loading && (
                    <Text style={{ color: 'red' }}>{error}</Text>
                )}
                {!connected && !loading && (
                    <>
                        <Text>lnc-mobile demo app</Text>
                        <TextInput
                            onChangeText={this.onChangeMnemonic}
                            placeholder="Enter pairing mnemonic here"
                            value={mnemonic}
                        />
                        <Button title="Connect" onPress={this.attemptConnect} />
                    </>
                )}
                {connected && (
                    <>
                        {!!info && (
                            <View style={{ paddingBottom: 10 }}>
                                <Text>Alias: {info.alias}</Text>
                                <Text>Block height: {info.blockHeight}</Text>
                                <Text>
                                    Active channel count:{' '}
                                    {info.numActiveChannels}
                                </Text>
                                <Text>
                                    Inactive channel count:{' '}
                                    {info.numInactiveChannels}
                                </Text>
                                <Text>
                                    Chain in sync:{' '}
                                    {info.syncedToChain.toString()}
                                </Text>
                                <Text>
                                    Graph in sync:{' '}
                                    {info.syncedToGraph.toString()}
                                </Text>
                            </View>
                        )}
                        {!!lnc && (
                            <Button
                                title="Disconnect"
                                onPress={this.disconnect}
                            />
                        )}
                    </>
                )}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center'
    }
});
