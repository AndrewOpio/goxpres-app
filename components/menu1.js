import React, { Component } from 'react';
//import react in our code.
import {Linking, View, Text, TouchableHighlight } from 'react-native';
//import all the components we are going to use.
import Menu, { MenuItem, MenuDivider } from 'react-native-material-menu';
//import menu and menu item
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-community/async-storage';
import {Actions} from 'react-native-router-flux';

export default class PopMenu extends Component {
  constructor(props){
    super(props);
    this.state = {
        user : '',
        data : [],
        screen : this.props.screen
    };
  }
 
  componentWillMount(){
    AsyncStorage.getItem("user", (err, res) => {
      if (res){ 
        this.setState({user : res});
      }
    });
  }


  _menu = null;
  setMenuRef = ref => {
    this._menu = ref;
  };

  showMenu = () => {
    this._menu.show();
  };
  hideMenu = () => {
    this._menu.hide();
  };

  render() {
    return (
       <View style = {this.props.style}>           
            <Menu
              ref={this.setMenuRef}
              button={
              <TouchableHighlight underlayColor = "#fff" onPress = {this.showMenu} style = {{alignSelf : "flex-end", justifyContent : "center", marginRight : 10, marginTop : 12}}>
                <Icon name = "more-vert" size = {25} style = {{color : "#3399ff"}}/>
              </TouchableHighlight>
              }>
              <MenuItem onPress = {() =>{
                this.props.delete();
                this._menu.hide();
              }}>Delete account</MenuItem>
              <MenuDivider />
              <MenuItem onPress = {() =>{
               this.props.logout();
                this._menu.hide();
              }}>Logout</MenuItem>
            </Menu>
        </View>
      );
   }
}
















