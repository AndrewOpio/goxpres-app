
import React from 'react';
import {Linking, BacKAndroid, Alert, View, Text, StyleSheet, TouchableOpacity, Image, TouchableHighlight} from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import {Actions} from 'react-native-router-flux';
import Icon from 'react-native-vector-icons/FontAwesome';
import {FloatingAction} from 'react-native-floating-action';
import AsyncStorage from '@react-native-community/async-storage';

class Float extends React.Component {
constructor(props){
    super(props);
    this.state = {
     user : '',
     circle : [],
    };
  }
  
  componentWillMount(){
    AsyncStorage.getItem("user", (err, res) => {
      if (res){ 
        this.setState({user : res});
      }
    });

    AsyncStorage.getItem("email", (err, res) => {
      if (res){ 
        this.setState({email : res});
      }
    });
  }
  
  componentDidMount(){
  }
  

//Random id generator
messageIdGenerator = () =>{
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c =>{
    let r = (Math.random()* 16) | 0,
    v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}



  render(){
    return (
        <FloatingAction
          //actions={actions}
          color={'#4fce5d'}
          showBackground = {false}
          //distanceToEdge = {55}
          position = {"right"}
          floatingIcon = {<Icon name = "comment" size = {25} style = {{color : "white"}}/>}
          //onPressMain = {() => {Linking.openURL('whatsapp://send?phone=0787561488&text=hey')}}  
          onPressMain = {() => {Linking.openURL('https://wa.me/256771882604')}}  
        />
       );
     }
   }


const styles = StyleSheet.create({
header : {
   marginTop : 11.5,
   marginLeft : 8,
   color : "#ffffff",
   fontSize : 20
  },


 img : {
   width : 35,
   height : 36,
   borderRadius : 63,
   marginLeft : 10,
   marginTop : 5,
   backgroundColor : "white"
 },

});

export default Float;


















































