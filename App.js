import React, {Component} from 'react';
import { BackHandler,  PermissionsAndroid, View, Text, StyleSheet, Alert} from 'react-native';
import { Router, Scene, Actions } from 'react-native-router-flux';
import DeliveryHome from './screens/home';
//import Support from './screens/inbox';
import Details from './screens/details';
import CMap from './screens/customermap';
import RMap from './screens/ridermap';
import Previous from './screens/previous';
import Scheduled from './screens/scheduled';
import Scheduled1 from './screens/scheduled1';
import Login from './screens/login';
import Signup from './screens/signup';
import Waiting from './screens/waiting';
//import Confirmation from './screens/confirmation';
import Places from './screens/places';
import Password from './screens/forgotpass';
//navigator.geolocation = require('@react-native-community/geolocation');
//import Icon from 'react-native-vector-icons/FontAwesome';
//import Icon from 'react-native-vector-icons/MaterialIcons';
//import Geocoder from 'react-native-geocoding';
import AsyncStorage from '@react-native-community/async-storage';
import Profile from './screens/profile';
import Index from './screens/home1';
import Orders from './screens/orders';
import simpleIcon from './components/simpleicons'; 
import SplashScreen from 'react-native-splash-screen';
import axios from 'axios';
import {base_url, server} from './components/links';


/*async function requestGeolocationPermission(){
  try{
     const granted = await PermissionsAndroid.request(
       PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
       {
         title : 'GoXpres geolocation permission',
         message : 'GoXpres needs to access your location services in order to display and track riders'
       }
     );

     if(granted == PermissionsAndroid.RESULTS.GRANTED){
       //alert("Done");
     }else{
       //alert("Failed")
     }

  }catch(err){
    console.warn(err);
  }
}*/



class App extends Component {
 constructor(props){
    super(props);

    this.state = {
      color : '',
      login : true
    };
  }
  

  componentWillMount(){

    //requestGeolocationPermission();
    AsyncStorage.getItem("contact", (err, res) => {
      if (res){ 
        AsyncStorage.getItem("user", (err1, res1) => {
          if (res1 == "user" || res1 == "business" ){ 
            this.Activity(res, "other");

          }else if(res1 == "rider"){
            this.Activity(res, "rider");
          }
        }); 
      }else{
        this.setState({login : true});
        SplashScreen.hide();
      }
    });
  }


  //checking if account is active
  Activity = (contact, status) =>{
    var self = this;
    //SplashScreen.hide();
    axios.post(base_url + 'activity.php', {
      contact : contact,
    })
    .then(function (response) {
      //handle request
      //console.log(response.data);
      if(response.data == "Active"){
        if(status == "other"){
          self.checkStatus(contact);
        }else if(status == "rider"){
          Actions.index();
          SplashScreen.hide();
        }
      }else if(response.data == "Blocked"){
        //this.setState({login : true});
        SplashScreen.hide();
        Alert.alert(
          "Sorry",
          "Your account has been blocked"
        );
      }else{
        SplashScreen.hide();
      }
    })
    .catch(function (error){
      //hanadle error
      alert("No connection");

      setTimeout(() =>{
        BackHandler.exitApp();    
      }, 3000)

    })
  }



  //Checking for any ongoing trips
  checkStatus = (contact) =>{
    var self = this;

    axios.post(base_url + 'check.php', {
      contact : contact,
    })
    .then(function (response) {
      //handle request
      //console.log(response.data);
      if(response.data == "None"){
        Actions.deliveryhome();
        SplashScreen.hide();

      }else{
        Actions.cmap({tracking : "true", code : '', contact : response.data.CContact, quantity : 1,
        began : response.data.TStatus == "started" ? true : false, 
        ended : response.data.TStatus == "ended" ? true : false,
        confirmed : response.data.TStatus == "confirmed" ? true : false,
      });
        SplashScreen.hide();
      }
    })
    .catch(function (error){
      //hanadle error
      //alert(error.message);
    })
  }
  


  render(){
     return (
  //Central Routing System
       <Router>
         <Scene key = "root">
           <Scene key = "signup" title ="Signup"  component = {Signup} hideNavBar = {true}/>
           <Scene key = "login" type="reset" title ="Login"  component = {Login} initial = {this.state.login == true ? true : false}  hideNavBar = {true}/>

           {/*
                      <Scene key = "confirmation" title ="Confirmation"  component = {Confirmation} hideNavBar = {true}/>
           <Scene key = "login" title ="Login"  component = {Login} initial = {this.state.login == true ? true : false}  hideNavBar = {true}/>
           */}
           <Scene key = "pass" title ="Password Reset"  component = {Password} titleStyle = {{color : "#ffffff"}} navigationBarStyle = {{backgroundColor: "#3399ff"}} backButtonTintColor ='#ffffff'  backButtonTextStyle = {{color : "#ffffff"}}/>
           <Scene key = "details" title ="Details"  component = {Details} hideNavBar = {true}/>
           <Scene key = "cmap" title ="CMap" component = {CMap} hideNavBar = {true}/>
           <Scene key = "places" title ="Places" component = {Places}  hideNavBar = {true}/>
           <Scene key = "orders" title ={this.props.title} component = {Orders}  hideNavBar = {false} titleStyle = {{color : "#ffffff"}} navigationBarStyle = {{backgroundColor: "#3399ff"}} backButtonTintColor ='#ffffff'  backButtonTextStyle = {{color : "#ffffff"}}/>
           <Scene key = "scheduled1" title ="Scheduled" component = {Scheduled1} hideNavBar = {false} icon = {simpleIcon} titleStyle = {{color : "#ffffff"}} navigationBarStyle = {{backgroundColor: "#3399ff"}} backButtonTintColor ='#ffffff'  backButtonTextStyle = {{color : "#ffffff"}}/>
           <Scene key = "waiting" title ="Pending Activation.." component = {Waiting} hideNavBar = {false} icon = {simpleIcon} titleStyle = {{color : "#ffffff"}} navigationBarStyle = {{backgroundColor: "#3399ff"}} backButtonTintColor ='#ffffff'  backButtonTextStyle = {{color : "#ffffff"}}/>
           
           <Scene
              key = "tabbar"
              lazy = {true}
              tabs
              tabBarStyle = {{backgroundColor : "#ffffff", color:"white"}}
              navBarStyle = {{backgroundColor : "#ffffff"}}
              hideNavBar = {true}
              activeBackgroundColor = {"#ffffff"}
              activeTintColor = {"#3399ff"}
              swipeEnabled = {true}
            >
              <Scene key = "deliveryhome" title ="Home" component = {DeliveryHome} hideNavBar = {true} icon = {simpleIcon}/>
              <Scene key = "previous" title ="History & Current" component = {Previous} hideNavBar = {true} icon = {simpleIcon}/>
              <Scene key = "scheduled" title ="Scheduled" component = {Scheduled} hideNavBar = {true} icon = {simpleIcon}/>
              <Scene key = "profile" title ="Profile" component = {Profile} hideNavBar = {true} icon = {simpleIcon}/>
            </Scene>   

            <Scene
              key = "tabbar1"
              lazy = {true}
              tabs
              tabBarStyle = {{backgroundColor : "#ffffff", color:"white"}}
              navBarStyle = {{backgroundColor : "#ffffff"}}
              hideNavBar = {true}
              activeBackgroundColor = {"#ffffff"}
              activeTintColor = {"#3399ff"}
              swipeEnabled = {true}
              >
              <Scene key = "index"  title ="Home" component = {Index}  hideNavBar = {true} icon = {simpleIcon}/>
              <Scene key = "rmap" onEnter ={this.onEnter} onExit = {this.onExit} title ="Map" component = {RMap} hideNavBar = {true} icon = {simpleIcon}/>
              <Scene key = "profile" title ="Profile" component = {Profile} hideNavBar = {true} icon = {simpleIcon}/>
            </Scene>   
          </Scene>
       </Router>
     );
  }
}


const styles = StyleSheet.create({

});

export default App;