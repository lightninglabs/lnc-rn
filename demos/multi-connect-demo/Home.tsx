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
    mnemonic1: string;
    mnemonic2: string;
}

@inject('LNCStore')
@observer
export default class Home extends React.Component<HomeProps, HomeStore> {
    constructor(props: any) {
        super(props);
        this.state = {
            mnemonic1:
                'drop sell moment shift doll pull october gold squeeze gas',
            mnemonic2:
                'prosper brother journey park peanut ten exact photo harbor picnic'
        };
    }

    onChangeMnemonic1 = (text) => this.setState({ mnemonic1: text });
    onChangeMnemonic2 = (text) => this.setState({ mnemonic2: text });

    attemptConnect = async () => {
        const { mnemonic1, mnemonic2 } = this.state;
        await this.props.LNCStore.connect(mnemonic1, mnemonic2);
        this.props.LNCStore.getInfo();
    };

    disconnect = () => this.props.LNCStore.disconnect();

    render() {
        const { mnemonic1, mnemonic2 } = this.state;
        const { LNCStore } = this.props;
        const { lnc1, lnc2, loading, connected, info1, info2 } = LNCStore;

        return (
            <View style={styles.container}>
                {!!loading && <ActivityIndicator />}
                {!connected && !loading && (
                    <>
                        <Text style={{ fontWeight: 'bold' }}>
                            lnc-rn multiple connection demo app
                        </Text>
                        <TextInput
                            onChangeText={this.onChangeMnemonic1}
                            placeholder="Mnemonic 1"
                            value={mnemonic1}
                        />
                        <TextInput
                            onChangeText={this.onChangeMnemonic2}
                            placeholder="Mnemonic 2"
                            value={mnemonic2}
                        />
                        <Button title="Connect" onPress={this.attemptConnect} />
                    </>
                )}
                {connected && (
                    <>
                        {!!info1 && (
                            <View style={{ paddingBottom: 10 }}>
                                <Text style={{ fontWeight: 'bold' }}>
                                    Node 1: {info1.alias}
                                </Text>
                                <Text>Block height: {info1.blockHeight}</Text>
                                <Text>
                                    Active channel count:{' '}
                                    {info1.numActiveChannels}
                                </Text>
                                <Text>
                                    Inactive channel count:{' '}
                                    {info1.numInactiveChannels}
                                </Text>
                                <Text>
                                    Chain in sync:{' '}
                                    {info1.syncedToChain.toString()}
                                </Text>
                                <Text>
                                    Graph in sync:{' '}
                                    {info1.syncedToGraph.toString()}
                                </Text>
                                <Text>
                                    Is Read-only: {info1.isReadOnly.toString()}
                                </Text>
                            </View>
                        )}
                        {!!info2 && (
                            <View style={{ paddingBottom: 10 }}>
                                <Text style={{ fontWeight: 'bold' }}>
                                    Node 2: {info2.alias}
                                </Text>
                                <Text>Block height: {info2.blockHeight}</Text>
                                <Text>
                                    Active channel count:{' '}
                                    {info2.numActiveChannels}
                                </Text>
                                <Text>
                                    Inactive channel count:{' '}
                                    {info2.numInactiveChannels}
                                </Text>
                                <Text>
                                    Chain in sync:{' '}
                                    {info2.syncedToChain.toString()}
                                </Text>
                                <Text>
                                    Graph in sync:{' '}
                                    {info2.syncedToGraph.toString()}
                                </Text>
                                <Text>
                                    Is Read-only: {info2.isReadOnly.toString()}
                                </Text>
                            </View>
                        )}
                        {!!lnc1 && !!lnc2 && (
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
