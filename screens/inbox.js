
import React, { Component } from 'react';
import {StyleSheet, ActivityIndicator, Text, View, TouchableOpacity, Image, Alert, ScrollView, TextInput, FlatList, Button, Dimensions, KeyboardAvoidingView} from 'react-native';
import {GiftedChat, } from 'react-native-gifted-chat';
import AsyncStorage from '@react-native-community/async-storage';
const { width, height } = Dimensions.get('window');
import Heading from '../components/heading';
import {Actions} from 'react-native-router-flux';
//navigator.geolocation = require('@react-native-community/geolocation');

export default class Support extends Component {
  constructor(props){
    super(props);
    
    this.state = {
      myId : 1,
      senderId : 2,
      user : '',
      latitude : '',
      longitude : '',
      sender : this.props.sender,
      receiver : this.props.receiver,
      messageId : 0,
      messages: [],
      content : [],
      loading : false
    };
  }


  UNSAFE_componentWillMount(){
    AsyncStorage.getItem("user", (err, res) => {
      if (res){
        this.setState({user : res});
      }
    })
    this.getPosition();
  }

   //Getting user's initial position.
   getPosition = () =>{
      navigator.geolocation.getCurrentPosition(
        (position) => {
          var latitude = position.coords.latitude;
          var longitude = position.coords.longitude;
          this.setState({latitude : latitude, longitude : longitude});
        },
        (error) => {
          //alert("Please turn on your gps to continue");
        },
        {enableHighAccuracy : false, timeout : 15000, maximumAge : 10000 }
      );   
    }


  fetch = () =>{
    this.setState({loading : true});

    fetch(//'https://agencyforadolescents.org/RetinahBackend/RetinahBackend/messages.php',
        'http://192.168.67.1/RetinahBackend/messages.php',
    {
      method : 'post',
      header : {
        'Accept' : 'application/json',
        'Content-type' : 'application/json'
      },

      body:JSON.stringify({
        sender : this.state.sender,
        receiver : this.state.receiver,
       })
     })
      .then((response) => response.json())
      
      .then((responseJson) => {
       //alert(responseJson);
          if(responseJson == "Error"){
            //alert("System Error");
            this.setState({loading : false});
          }else{

           this.setState({content : responseJson});

           this.socket.emit('update', {email : this.state.sender});

           this.state.content.map((cont) =>{
             
             if(cont.sender == this.state.sender){
               var id = this.state.myId;
             }else{
               var id = this.state.senderId;
             }
           if(cont.messagetype == "text"){

              message = [
                {
                _id : cont.messageid,
                text : <Text onPress = {cont.circle != "" && id == 2 ? () => Actions.map({title : "Sender's Location", lat : cont.lat, lng : cont.lng}) :
                 this.state.user != "citizen"  && id == 2 ? () => Actions.map({title : "Sender's Location", lat : cont.lat, lng : cont.lng}) : ()=>{}}>{cont.message}</Text>,
                createdAt: cont.period,
                user : {
                  _id : id,
                  name : this.props.title,
                  }
                },
              ]

              this.state.messages.unshift(message[0]);

           }else if(cont.messagetype == "image"){

              message = [
                {
                _id : cont.messageid,
                image : cont.message,
                createdAt: cont.period,
                user : {
                  _id : id,
                  name : this.props.title,
                  }
                },
              ]
              this.state.messages.unshift(message[0]);

              
           }else if(cont.messagetype == "video"){

              message = [
                {
                _id : cont.messageid,
                video : cont.message,
                createdAt: cont.period,
                user : {
                  _id : id,
                  name : this.props.title,
                  }
                },
              ]
              this.state.messages.unshift(message[0]);

           }else if(cont.messagetype == "audio"){

              message = [
                {
                _id : cont.messageid,
                audio : cont.message,
                createdAt: cont.period,
                user : {
                  _id : id,
                  name : this.props.title,
                  }
                },
              ]
              this.state.messages.unshift(message[0]);
           }
         })
         this.setState({loading : false});        
       }
    })
      .catch((error) => {
        console.warn(error);
        this.setState({loading : false});
       })
      }

  componentDidMount(){

      this.fetch();

      this.socket = io("https://retinah.herokuapp.com");

      AsyncStorage.getItem("user", (err, res) => {
       if (res){
        this.socket.on(this.state.sender, (elem1, elem2, elem3, elem4, elem5) =>{
        if(elem3 == this.state.receiver){
         this.setState({messageId : this.state.messageId + 1});

         if(elem2 == "text"){
          message = [
          {
          _id : this.state.messageId,
          text : <Text onPress = {res != "citizen" ? () => Actions.map({title : "Sender's Location", lat : elem4, lng : elem5}) : () =>{}}>{elem1}</Text>,
          createdAt: new Date(),
          user : {
            _id : this.state.senderId,
            name : this.props.title,
            }
          },
        ]
        this.state.messages.unshift(message[0]);

       }else if(elem2 == "image"){
          message = [
          {
          _id : this.state.messageId,
          image : elem1,
          createdAt: new Date(),
          user : {
            _id : this.state.senderId,
            name : this.props.title,
            }
          },
        ]
        this.state.messages.unshift(message[0]);

        } else if(elem2 == "video"){
          message = [
          {
          _id : this.state.messageId,
          video : elem1,
          createdAt: new Date(),
          user : {
            _id : this.state.senderId,
            name : this.props.title,
            }
          },
        ]
        this.state.messages.unshift(message[0]);
         }else if(elem2 == "audio"){
          message = [
          {
          _id : this.state.messageId,
          audio : elem1,
          createdAt: new Date(),
          user : {
            _id : this.state.senderId,
            name : this.props.title,
            }
          },
        ]
        this.state.messages.unshift(message[0]);
         }
        }
       });
      }
    });
   }

  //Sending message to the database
  onSend(messages = []){
    if(messages[0].image){
      this.socket.emit('message', {text : messages[0].image, sender : this.state.sender, receiver : this.state.receiver, type : 'image', lat : "", lng : ""});
      this.socket.emit('sent', {email : this.state.sender});
      var message = messages[0].image;
      var messagetype = "image";
    }else if(messages[0].text){
      var message = messages[0].text;
      var messagetype = "text";
      this.socket.emit('message', {text : messages[0].text, sender : this.state.sender, receiver : this.state.receiver, type : 'text', lat : this.state.latitude, lng : this.state.longitude});
      this.socket.emit('sent', {email : this.state.sender});
    }else if(messages[0].video){
      var message = messages[0].video;
      var messagetype = "video";
      this.socket.emit('message', {text : messages[0].video, sender : this.state.sender, receiver : this.state.receiver, type : 'video', lat : "", lng : ""});
      this.socket.emit('sent', {email : this.state.sender}); 
    }else if(messages[0].audio){
      var message = messages[0].audio;
      var messagetype = "audio";
      this.socket.emit('message', {text : messages[0].audio, sender : this.state.sender, receiver : this.state.receiver, type : 'audio', lat : "", lng : ""});
      this.socket.emit('sent', {email : this.state.sender}); 
    }
    fetch(//'https://agencyforadolescents.org/RetinahBackend/RetinahBackend/chat.php',
          'http://192.168.67.1/RetinahBackend/chat.php',
    {
      method : 'post',
      header : {
        'Accept' : 'application/json',
        'Content-type' : 'application/json'
      },

      body:JSON.stringify({
        sender : this.state.sender,
        receiver : this.state.receiver,
        messageid : messages[0]._id,
        period : messages[0].createdAt,
        messagetype : messagetype,
        message : message,
        latitude : this.state.latitude,
        longitude : this.state.longitude,
        circle : ""
       })
     })
      .then((response) => response.json())
      .then((responseJson) => {
       })
      .catch((error) => {
        alert(error);
      })

    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, messages)
    }))
  }
  
  
  render(){
    return(
      this.state.loading == true ?

      <ActivityIndicator color = "#ff33cc" size = "large" style = {{marginTop : "50%"}} /> : 

      <GiftedChat
        messages = {this.state.messages}
        onSend={messages => this.onSend(messages)}
        user = {{
          _id : this.state.myId,
        }}
       />
    ); 
  }
}


