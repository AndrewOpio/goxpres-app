/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React from 'react';
import {BacKAndroid, View, Alert, Text, StyleSheet, TouchableOpacity, Image, TouchableHighlight, TextInput, Dimensions} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import PopupMenu from './menu';
navigator.geolocation = require('@react-native-community/geolocation');
import {Actions} from 'react-native-router-flux';

const { width, height } = Dimensions.get('window');

class Heading extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      propic : "",
      email : '',
      user : '',
      circle : [],
      notification : '',
      latitude : '',
      longitude : '',
      screen : ""
    };
  }
  


  componentWillMount(){
    AsyncStorage.getItem("user", (err, res) => {
      if (res){ 
          this.setState({user : res});
       }
    });
  }

  
  componentDidMount() {
    AsyncStorage.getItem("email", (err, res) => {
      if (res){ 
        /*this.socket = io("https://retinah.herokuapp.com");
        this.socket.on(res, msg =>{
          this.setState({propic : msg});
        });*/
       }
    });
  }
  

  messageIdGenerator = () =>{
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c =>{
      let r = (Math.random()* 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }


  render(){
    return (
      <View>
        <View style = {{alignItems : "center", backgroundColor : "#3399ff", height : 50, flexDirection : "row" }}>
            <TouchableHighlight onPress={this.props.show} underlayColor = "#3399ff">
                <Image  style = {styles.img} source = {require('../Resources/go.jpg')}/>
            </TouchableHighlight>
            <View>
              <Text style = {{fontWeight : "bold", marginLeft : 10, color : "white", fontSize : 16}}>{this.props.title}</Text>
            </View>
            <View style ={{flex : 1}}>
              <View style = {{flex : 1, width : "100%", alignItems : "flex-end"}}>
              <PopupMenu screen = {this.props.screen} support = {this.props.support} user = {this.state.user} openModal = {this.props.openModal}/>
              </View>
            </View>
        </View>
      </View>
    );
  }
}


const styles = StyleSheet.create({
header : {
   marginTop : 11.5,
   marginLeft : 10,
   color : "#ffffff",
   fontSize : 20,
   fontFamily : "Zocial"
  },
img : {
   width : 40,
   height : 40,
   resizeMode : "cover",
   borderRadius : 20,
   marginLeft : 10,
   marginTop : -5,
   backgroundColor : "white"
 },
});

export default Heading;
