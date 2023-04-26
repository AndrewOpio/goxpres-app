/**
 * @format
 */
import React from 'react';
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import {Provider} from 'react-redux';
import {createStore} from 'redux';
import pointsReducer from './Reducers/pointsReducer';
import Toast from 'react-native-toast-message';

const store = createStore(pointsReducer);

const app = () =>(
    <Provider  store = {store}>
        <App/>
        <Toast ref={(ref) => Toast.setRef(ref)} />
    </Provider>
)

AppRegistry.registerComponent(appName, () => app);
