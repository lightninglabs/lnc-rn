import * as React from 'react';
import { Provider } from 'mobx-react';
import { View, StyleSheet } from 'react-native';
import Navigation from './Navigation';
import Stores from './stores/Stores';

export default class App extends React.PureComponent {
    render() {
        return (
            <Provider LNCStore={Stores.lncStore}>
                <View style={styles.container}>
                    <Navigation />
                </View>
            </Provider>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    }
});
