import {AsyncStorage, Alert, BackHandler, ScrollView, StyleSheet, View, Text, TextInput, Picker, Image, TouchableOpacity, ActivityIndicator} from 'react-native';
import React, {Component} from 'react';
import {Button} from 'native-base';
import {Actions} from 'react-native-router-flux';
import Icon from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';
import {base_url, server} from '../components/links';


export default class Login extends Component {
  constructor(props){
      super(props);
      this.state = {
        loading : false,
        contact : "",
        password : ""
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
    if(Actions.currentScene == "login"){
      BackHandler.exitApp();    
    }else{
      //alert(Actions.currentScene);
    }
    return true;
  }


  componentDidMount(){
    //SplashScreen.hide();
  }

    
  //Log in users
  Login = () =>{
    //Actions.deliveryhome();
    var x = this.state.contact;
    let isnum = /^\d+$/.test(x);
    //alert(isnum);

    if(x.charAt(0)!='0' || x.charAt(1)!='7' || x.length != 10 || isnum == false){
      Alert.alert(
        "Error",
        "Please enter a valid contact"
      );
    }else{
      if(this.state.password != ""){
        var self = this;
        this.setState({loading : true});

        axios.post(base_url + 'login.php', {
          contact : this.state.contact,
          password : this.state.password
        })
        .then((response) => {
          //handle request
          //alert(response.data);

          if(response.data == "User"){
            self.setState({loading : false});
            AsyncStorage.removeItem('contact');
            AsyncStorage.removeItem('user');
            AsyncStorage.removeItem('status');

            AsyncStorage.setItem('contact', this.state.contact);
            AsyncStorage.setItem('user', 'user');
            AsyncStorage.setItem('status', 'new');


            Actions.deliveryhome();

          }else if(response.data == "Transporter"){

            self.setState({loading : false});
            AsyncStorage.removeItem('contact');
            AsyncStorage.removeItem('user');
            AsyncStorage.removeItem('status');

            AsyncStorage.setItem('contact', this.state.contact);
            AsyncStorage.setItem('user', 'rider');
            AsyncStorage.setItem('status', 'new');

            Actions.index();

          }else if(response.data == "Business"){

            self.setState({loading : false});
            AsyncStorage.removeItem('contact');
            AsyncStorage.removeItem('user');
            AsyncStorage.removeItem('status');

            AsyncStorage.setItem('contact', this.state.contact);
            AsyncStorage.setItem('user', 'business');
            AsyncStorage.setItem('status', 'new');

            Actions.deliveryhome();

          }else if(response.data == "Blocked"){
            Alert.alert(
              "Sorry",
              "Your account has been blocked"
            );
            self.setState({loading : false});

          }else if(response.data == "Inactive"){
            self.setState({loading : false});
            Actions.waiting();

          }else if(response.data == "Failed"){
            Alert.alert(
              'Oopps..',
              'Wrong Contact and Password'
            )
            self.setState({loading : false});
          }
        })
        .catch(function (error){
          //hanadle error
          self.setState({loading : false});
          alert('No connection');
  
        //console.log(error);
        })
      }else{
        Alert.alert(
          'Hi there',
          'Please enter all fields'
        )
      }
    }
  }
    


  render() {
    return (
      <View style={{flex:1, backgroundColor:'#ffffff', justifyContent : "center"}}>
        <ScrollView keyboardShouldPersistTaps = {'handled'} contentContainerStyle={{backgroundColor:'#ffffff', justifyContent : "center"}}>
          <Image  style = {styles.img} source = {require('../Resources/go.jpg')}/>
          <Text style = {styles.heading}>GoXpres</Text>
          <Text style = {styles.title}>Moving the easy way</Text>
          <View>                       
            <View style = {styles.bundle}>
              <View style = {styles.in}>
                <Icon name = "phone" size = {20} style = {{color : "orange"}}/>
              </View>
              <TextInput required keyboardType="number-pad"  placeholder="Enter your contact.." placeholderColor="#c4c3cb" style={styles.input} onChangeText = {(text) => this.setState({contact : text})}/>            
            </View> 
            <View style = {styles.bundle}>
              <View style = {styles.in}>
                <Icon name = "lock" size = {20} style = {{color : "orange"}}/>
              </View>
              <TextInput required   placeholder="Enter your password.." secureTextEntry = {true} placeholderColor="#c4c3cb" style={styles.input} onChangeText = {(text) => this.setState({password : text})}/>            
            </View>
            <Button block style = {styles.loginButton}   onPress={() => this.Login()}>
                {this.state.loading == false ? <Text style ={styles.btntxt}>Login</Text> :
                <ActivityIndicator color = "white"/>}
            </Button>

            <View style = {styles.forgot}>
              <TouchableOpacity onPress = {() => {/*Actions.pass()*/}}>
                <Text>Forgot Password ? </Text>
              </TouchableOpacity>
            </View>   

            <View style = {styles.signup}>
              <Text>Dont have an account?    |    </Text>
              <TouchableOpacity onPress = {() => {Actions.signup()}}>
                <Text style = {{ color : "orange"}}>Sign up</Text>
              </TouchableOpacity>
            </View>   
          </View>
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
  forgot : {
    alignSelf : "center",
    marginBottom: 15,
  },

  in : {
    justifyContent : "center",
    alignItems : "center",
    height : 40,
    width : 30,
    //backgroundColor : "white",
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },

  signup : {
    alignSelf : "center",
    flexDirection : "row",
    fontFamily : 'Rounded_Elegance',
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
    
  heading : {
    textAlign : "center",
    fontWeight : "bold",
    //fontFamily : "TypoSlab Irregular shadowed_demo",
    fontSize : 25,
    marginTop : 5,
    color : "#3399FF"
  },

  input : {
    height: 45,
    width : "90%",
    fontSize: 14,
    borderBottomColor: "white",
    paddingTop: 15,
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