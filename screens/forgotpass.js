import {AsyncStorage, Alert, BackHandler, ScrollView, StyleSheet, View, Text, TextInput, Picker, Image, TouchableOpacity, ActivityIndicator} from 'react-native';
import React, {Component} from 'react';
import {Button} from 'native-base';
import {Actions} from 'react-native-router-flux';
import axios from 'axios';
import {base_url, server} from '../components/links';

export default class Password extends Component {
  constructor(props){
    super(props);
    this.state = {
      loading : false,
      email : "",
      code : "",
      input : "enterpassword",
      color : "#3399ff",
      password : "",
      pass : ""
    }
  }

  componentWillMount(){
    BackHandler.addEventListener('hardwareBackPress', this.Back);
  }


  componentWillUnmount(){
    BackHandler.removeEventListener('hardwareBackPress', this.Back);
  }

  //Previous screen
  Back = () =>{
    Actions.login();
    return true;
  }


  componentDidMount(){
    //SplashScreen.hide();
  }
  

  //send reset code
  sendCode = () =>{
    var self = this;

    self.setState({loading : true});

    axios.post(base_url + 'reset.php', {
      email : this.state.email,
      code : this.state.code,
    })
    .then((response) => {
      //alert(response.data);
      if(response.data == "Error"){
        alert("An error occured")
        self.setState({loading : false});

      }else if(response.data == "Sent"){
        self.setState({input : "entercode", loading : false});
      
      }else if(response.data == "Failed"){
        self.setState({loading : false});
        /*Alert.alert(
          "Sorry..",
          "Email not found"
        );*/
      }
    })
    .catch(function (error){
      //hanadle error
      //alert(error.message);
      self.setState({loading : false});
    })
  }


  //Confirm code
  Confirm = () =>{
    var self = this;

    self.setState({loading : true});

    axios.post(base_url + 'reset.php', {
      email : this.state.email,
      code : this.state.code,
    })
    .then((response) => {
      //alert(response.data);
      if(response.data == "Error"){
        alert("An error occured")
        self.setState({loading : false});
      }else{
        self.setState({input : "enterpassword", loading : false});
      }
    })
    .catch(function (error){
      //hanadle error
      //alert(error.message);
      self.setState({loading : false});
    })
  }


  //Confirm code
  Password = () =>{
    var self = this;

    if(this.state.color == "red"){
      Alert.alert(
        "Error",
        "Password mismatch"
      );

    }else{
      self.setState({loading : true});

      axios.post(base_url + 'reset.php', {
        email : this.state.email,
        password : this.state.password,
        code : this.state.code,
      })
      .then((response) => {
        //alert(response.data);
        if(response.data == "Error"){
          alert("An error occured")
          self.setState({loading : false});
        }else{
          self.setState({loading : false});
          Actions.deliveryhome();
        }
      })
      .catch(function (error){
        //hanadle error
        //alert(error.message);
        self.setState({loading : false});
      })
    }
  }
  



  render() {
    return (
      <View style={{flex:1, backgroundColor:'#ffffff', justifyContent : "center"}}>
          <ScrollView keyboardShouldPersistTaps = {'handled'} contentContainerStyle={{ paddingTop : "10%", backgroundColor:'#ffffff', justifyContent : "center"}}>
            {this.state.input == "sendcode" ? 
              <View>                       
                  <View style = {styles.bundle}>
                    <TextInput required  placeholder="Enter your email.." placeholderColor="#c4c3cb" style={styles.input} onChangeText = {(text) => this.setState({email : text})}/>            
                  </View> 
                  <Button block style = {styles.loginButton}   onPress={() => this.sendCode()}>
                      {this.state.loading == false ? <Text style ={styles.btntxt}>Submit</Text> :
                      <ActivityIndicator color = "white"/>}
                  </Button>
              </View>
              
            : this.state.input == "entercode" ?
              <View>                       
                  <View style = {styles.bundle}>
                    <TextInput required keyboardType="number-pad"  placeholder="Enter code sent to your email.." placeholderColor="#c4c3cb" style={styles.input} onChangeText = {(text) => this.setState({code : text})}/>            
                  </View> 
                  <Button block style = {styles.loginButton}   onPress={() => this.Confirm()}>
                      {this.state.loading == false ? <Text style ={styles.btntxt}>Submit</Text> :
                      <ActivityIndicator color = "white"/>}
                  </Button>
              </View>
            :
              <View>                       
                <View style = {styles.bundle}>
                  <TextInput  placeholder="Enter your new password.." placeholderColor="#c4c3cb" style={styles.input} onChangeText = {(text) => {
                    this.setState({password : text});

                    if(text == this.state.pass && this.state.pass != ""){
                      this.setState({color : "green"});
                    }else if(text != this.state.pass && this.state.pass != ""){
                      this.setState({color : "red"}); 
                    }
                  }}/>            
                </View> 
                <View  style = {{
                  borderColor : this.state.color,
                  borderWidth : 1,
                  borderRadius : 10,
                  flexDirection : "row",
                  width : "95%",
                  alignItems : "center",
                  alignSelf : "center",
                  marginTop: 5,
                  marginBottom: 5,
                }}>
                  <TextInput  placeholder="Confirm password.." placeholderColor="#c4c3cb" style={styles.input}
                      onChangeText = {(text) => {
                        this.setState({pass : text});
                      if(this.state.password == text && this.state.password != ""){
                        this.setState({color : "green"});
                      }else if(this.state.password != text && this.state.password != ""){
                        this.setState({color : "red"});
                      }
                    }}/>            
                </View> 

                <Button block style = {styles.loginButton}   onPress={() => {this.Password()}}>
                    {this.state.loading == false ? <Text style ={styles.btntxt}>Submit</Text> :
                    <ActivityIndicator color = "white"/>}
                </Button>
              </View>
          }  
          </ScrollView>    
      </View>
    );
  }
}


const styles= StyleSheet.create({
  bundle : {
    flexDirection : "row",
    width : "95%",
    alignItems : "center",
    alignSelf : "center",
    marginTop: 5,
    marginBottom: 5,
    borderWidth : 1,
    borderColor : "#3399ff",
    borderRadius : 10,
  },

  title : {
    //fontFamily : 'Rounded_Elegance',
    color : "#3399FF",
    textAlign : "center",
    fontSize : 14,
    marginBottom: 5,      
  },
  img : {
      width : 70,
      height : 70,
      resizeMode : "cover",
      borderTopRightRadius : 30,
      borderBottomLeftRadius : 30,
      alignSelf : "center",
      borderColor : "orange",
      marginTop : "30%",
      borderWidth : 2
    },
    

  input : {
    height: 40,
    width : "90%",
    fontSize: 14,
    //borderTopRightRadius: 10,
    //borderBottomRightRadius: 10,
    //backgroundColor: '#fafafa',
    paddingLeft: 10,      
  },

  loginButton: {
      justifyContent : "center",
      backgroundColor: '#3399ff',
      marginBottom : 20,
      borderRadius: 5,
      borderWidth : 1, 
      borderColor : "#3399ff",
      height: 45,
      width : "95%",
      alignSelf : 'center',
      marginTop : 10,
  },
    
  btntxt : {
    //fontFamily : 'Rounded_Elegance',
    color : "white"
  }
})