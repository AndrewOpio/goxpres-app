
import React, {Component} from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';
import {
  TouchableHighlight, 
} from 'react-native';

export default class simpleIcon extends Component {
    render(){
        return(
            <Icon
              name = {this.props.title == "Home" ? 'home' : this.props.title == "History & Current" ? "history" : this.props.title == "Scheduled" ? 'clock-o' : this.props.title == "Profile" ? 'user' : this.props.title == "Map" ? 'map' : ''}
              size = {this.props.focused ? 20 : 15}
              style = {{color : this.props.focused ? "#3399ff" : "#4d4d4d"}}
            />
        );
    }
}