import React, { Component } from 'react';
//import react in our code.
import {Linking, View, Text, TouchableHighlight } from 'react-native';
//import all the components we are going to use.
import Menu, { MenuItem, MenuDivider } from 'react-native-material-menu';
//import menu and menu item
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-community/async-storage';
import {Actions} from 'react-native-router-flux';
import RNImmediatePhoneCall from 'react-native-immediate-phone-call';
import {base_url, server} from '../components/links';
import axios from 'axios';

export default class PopupMenu extends Component {
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
  option1Click = () => {
    this._menu.hide();
    this.props.option1Click();
  };
  option2Click = () => {
    this._menu.hide();
    this.props.option2Click();
  };
  option3Click = () => {
    this._menu.hide();
    this.props.option3Click();
  };
  option4Click = () => {
    this._menu.hide();
    this.props.option4Click();
  };

  
  render() {
    return (
       <View style = {{flexDirection : "row"}}>
         {this.props.user != "rider" ? 
           this.state.screen ?
            <TouchableHighlight underlayColor = {"#3399ff"} style = {{ marginTop : 11, marginRight : 15, flexDirection : "row"}} onPress ={this.props.openModal}>
              <Icon name = "search" size = {25} style = {{ color : "white", }}/> 
           </TouchableHighlight> : <View></View>
          :

          <TouchableHighlight
            underlayColor = {"#3399ff"}
            style = {{ marginTop : 11, marginRight : 20, flexDirection : "row"}}
            onPress ={this.props.support}
           >
              <Icon name = "phone" size = {25} style = {{ color : "white", }}/> 
           </TouchableHighlight>
          }
           
          <View>
            <Menu
              ref={this.setMenuRef}
              button={
              <TouchableHighlight underlayColor = "#00ace6" onPress = {this.showMenu} style = {{alignSelf : "flex-end", justifyContent : "center", marginRight : 10, marginTop : 12}}>
                <Icon name = "more-vert" size = {25} style = {{color : "white"}}/>
              </TouchableHighlight>
              }>
              {/*<MenuItem onPress = {() =>{
                this._menu.hide();
                Linking.openURL("https://www.google.com")
              }}>Privacy Policy</MenuItem>*/}

              <MenuItem onPress = {() =>{
                this._menu.hide();
                this.state.user == "rider" ? 
                Linking.openURL("https://www.goxpres.com/terms-riders.html")
                :
                Linking.openURL("https://www.goxpres.com/terms-conditions.html")
              }}>Terms and Conditions</MenuItem>
              <MenuDivider />
            </Menu>
          </View>
        </View>
      );
   }
}