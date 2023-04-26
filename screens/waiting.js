import {AsyncStorage, Alert, BackHandler, ScrollView, StyleSheet, View, Text, TextInput, Picker, Image, TouchableOpacity, ActivityIndicator} from 'react-native';
import React, {Component} from 'react';
import {Button} from 'native-base';
import {Actions} from 'react-native-router-flux';


export default class Waiting extends Component {
  constructor(props){
      super(props);
      this.state = {
        loading : false,
      }
  }


  componentWillMount(){
    BackHandler.addEventListener('hardwareBackPress', this.Back);
  }


  componentWillUnmount(){
    BackHandler.removeEventListener('hardwareBackPress', this.Back);
  }

  //Exit app when phone back TouchableOpacity is pressed
  Back = () =>{
    if(Actions.currentScene == "waiting"){
        Actions.login();
    }else{
      //alert(Actions.currentScene);
    }
    return true;
  }

  
  render() {
    return (
      <View style={{flex:1, justifyContent : "center"}}>
          <Text style = {styles.text}>Welcome to GoXpres.</Text>
          <Text style = {styles.text}>Your account is not active.</Text>
          <Text style = {styles.text}>Please contact admin for your next step.</Text>
      </View>
    );
  }  
}

const styles= StyleSheet.create({
  text : {
    fontSize : 16,
    alignSelf : "center",
    color : "#999999"
  },
})