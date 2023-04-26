import React, { Component } from 'react';
import {AppState, RefreshControl, Alert, BackHandler, Platform, StyleSheet, Text, View, FlatList, ActivityIndicator, Dimensions, Image, TouchableOpacity, ScrollView, TextInput} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import {Actions} from 'react-native-router-flux';
import Heading from '../components/heading';
import axios from 'axios';
import io from 'socket.io-client';
import {base_url, server} from '../components/links';
import RNImmediatePhoneCall from 'react-native-immediate-phone-call';
import RNAndroidLocationEnabler from 'react-native-android-location-enabler';

const Screen = {
  width: Dimensions.get('window').width,
  height: Dimensions.get('window').height,
};

export default class Index extends React.Component {
  constructor(props){
    super(props);

    //... Rest of the constructor including state object
    this.state = {
      loading : true,
      contact : '',
      support : "",
      refreshing : false,
      data : [],
      appState : AppState.currentState
    };
  }



  onOpenBottomSheetHandler = (index) => {
    this.refs.BottomSheet.snapTo(index);
  };


 
  UNSAFE_componentWillMount() {
    this.Enable();
    //AsyncStorage.removeItem('pickup');
    AsyncStorage.getItem("contact", (err, res) => {
      if (res){
        this.setState({contact : res});
        this.Fetch(res);
        this.Support();
      }
    })

    AppState.addEventListener('change', this.handleChange);
    BackHandler.addEventListener('hardwareBackPress', this.Back);

  }


  componentWillUnmount(){
    AppState.removeEventListener('change', this.handleChange);
    BackHandler.removeEventListener('hardwareBackPress', this.Back);
  }
  

  componentDidMount(){
    this.socket = io(server);

      AsyncStorage.getItem("contact", (err, res) => {
        if (res){
          this.socket.on(res + "rider", (msg, callback) =>{

            callback()
            if(msg.title == "reload"){
              this.Fetch(res);
            }
          })
        }
     })
  }
  

  //Changing rider status
  State = (state) =>{
    self = this;

    axios.post(base_url + 'availability.php', {
      contact : self.state.contact,
      status : state
    })
    .then(function (response) {
      //console.log(response.data);
      if(response.data == "Error"){
        alert("An Error occured");
      }else{
      }
    })
    .catch(function (error){
      //console.log(error.message);
      alert("Network Error");
    })  

  }


  //Detect if app is in background
  handleChange = (nextAppState) =>{
    if(this.state.appState.match(/inactive|background/) && nextAppState === "active"){
       this.State('available');
    }else{
      this.State('unavailable');
    }
    
    this.setState({appState : nextAppState});
  }



  //Turning on location in android
  Enable = () =>{
    RNAndroidLocationEnabler.promptForEnableLocationIfNeeded({
      interval: 10000,
      fastInterval: 5000,
    })
      .then((data) => {
        //alert(data);
      })
      .catch((err) => {
        //alert(err);
      });
  }
  


  //Device back button
  Back = () =>{
    if(Actions.currentScene == "_index"){
      Alert.alert(
        'Exit App',
        'Are you sure you want to exit ?',
        [{
          text : 'Cancel',
          onPress : () => {},
          style : 'cancel'
        },
        {
          text : "Yes",
          onPress : () => BackHandler.exitApp()
        }],
        {
          cancelable : false
        }
      );       
    }else{
      Actions.pop()
    }
    return true;
  }



  //Fetch data from the database
  Fetch = (contact) =>{
    var self = this;

    self.setState({loading : true});

    axios.post(base_url + 'home1.php', {
      rcontact : contact,
    })
    .then((response) => {
      //alert(response.data);
      if(response.data == "Error"){
        alert("An error occured")
        self.setState({loading : false});
      }else{
        self.setState({data : response.data, loading : false});
      }
    })
    .catch(function (error){
      //hanadle error
      //alert(error.message);
      self.setState({loading : false});
    })
  }


  //Fetch data from the database
  Support = () =>{
    var self = this;
    self.setState({loading : true});

    axios.post(base_url + 'support.php', {
    })
    .then((response) => {
      //alert(response.data.Contact);
      if(response.data == "Error"){
        alert("An error occured")
        self.setState({loading : false});
      }else{
        self.setState({support : response.data.Contact, loading : false});
      }
    })
    .catch(function (error){
      //alert(error.message);
      self.setState({loading : false});
    })
  }


  //calling
  Call = () =>{
    RNImmediatePhoneCall.immediatePhoneCall(this.state.support);
  }



  render() {    
    return (
      <View style = {{backgroundColor : "#f2f2f2", height : "100%"}}>  
      <Heading title = "Home" support = {this.Call}/>

      {this.state.loading == true ? 
      
        <ActivityIndicator size = {"large"} style = {{marginTop : "60%"}} color = {"#33ccff"} />
   
      :

      <ScrollView
       style = {{ height : "100%"}}
       refreshControl = {
         <RefreshControl
           onRefresh = {() => this.Fetch(this.state.contact)}
           refreshing={this.state.refreshing}
         />
       }
       >
       <View style = {styles.container}>
       <Text style = {styles.title}>Dashboard</Text>
       <View style = {styles.card}>
         <Image source = {require('../Resources/schedule.png')} style = {styles.image}/>
         <View style = {styles.stats}>
           <Text style = {styles.figure}>{this.state.data[0]}</Text>
           <Text style = {styles.heading}>Scheduled</Text>
         </View>
         <View style = {{flex : 1}}>
            <TouchableOpacity  style = {styles.all} onPress = {() => Actions.scheduled1({title : "Scheduled"})}>
              <Text style = {styles.txt}>View all</Text>
              <View style = {styles.icon}>
                 <Image source = {require('../Resources/arrow-white.png')} style = {styles.arrow}/>
              </View>
            </TouchableOpacity>
         </View>
       </View>
       
       <View style = {styles.card}>
         <Image source = {require('../Resources/file.png')} style = {styles.image}/>
         <View style = {styles.stats}>
           <Text style = {styles.figure}>{this.state.data[2]}</Text>
           <Text style = {styles.heading}>Cancelled/Missed</Text>
         </View>
         <View style = {{flex : 1}}>
            <TouchableOpacity  style = {styles.all} onPress = {() => Actions.orders({title : "Cancelled/Missed", page : "missed"})}>
              <Text style = {styles.txt}>View all</Text>
              <View style = {styles.icon}>
                 <Image source = {require('../Resources/arrow-white.png')} style = {styles.arrow}/>
              </View>
            </TouchableOpacity>
         </View>
       </View>

       
       <View style = {styles.card}>
         <Image source = {require('../Resources/sigma.png')} style = {styles.image}/>
         <View style = {styles.stats}>
           <Text style = {styles.figure}>{this.state.data[1]}</Text>
           <Text style = {styles.heading}>Total Orders</Text>
         </View>
         <View style = {{flex : 1}}>
            <TouchableOpacity  style = {styles.all} onPress = {() => Actions.orders({title : "Total Orders", page : "total"})}>
              <Text style = {styles.txt}>View all</Text>
              <View style = {styles.icon}>
                 <Image source = {require('../Resources/arrow-white.png')} style = {styles.arrow}/>
              </View>
            </TouchableOpacity>
         </View>
       </View>
       </View>

       <View style = {styles.boundary}>
         <Text style = {styles.headtext}>Finances</Text>
         <View style = {styles.row}>
            <Text style = {styles.key}>Total amount : </Text>
            <View style = {styles.amount}>
              <Text style = {styles.ugx}>UGX {this.state.data[3]}</Text>
            </View>
         </View>
         <View style = {{backgroundColor : "#e2e2e2", height : 1, marginTop  : 5, marginBottom  : 10}}></View>

         <View style = {styles.row}>
            <Text style = {styles.key}>Driver's earnings : </Text>
            <View style = {styles.amount}>
              <Text style = {styles.ugx}>UGX {this.state.data[5]}</Text>
            </View>
         </View>
         <View style = {{backgroundColor : "#e2e2e2", height : 1, marginTop  : 5, marginBottom  : 10}}></View>

          <View style = {styles.row}>
            <Text style = {styles.key}>Company commission : </Text>
            <View style = {styles.amount}>
              <Text style = {styles.ugx}>UGX {this.state.data[4]}</Text>
            </View>
          </View>
       </View>
      </ScrollView>}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container : {
    backgroundColor : "#3399ff",
    paddingBottom : 50,
    borderBottomRightRadius : 20,
    borderBottomLeftRadius : 20,

  },

  boundary : {
    borderWidth : 1,
    borderRadius : 10,
    marginTop : 20,
    width : "96%",
    padding :10, 
    paddingTop : 25,
    marginBottom : 20,
    alignSelf : "center",
    borderColor : "orange",
    shadowColor: '#e2e2e2',
      shadowOffset: {
        width: 0,
        height: 6,
      },
      shadowOpacity: 0.37,
      shadowRadius: 7.49,
      elevation: 5,
      backgroundColor:"#fff",
  },

  headtext : {
    position : "absolute",
    paddingLeft :20,  
    paddingRight :20, 
    //paddingBottom :5,
    //paddingTop :5,      
    marginTop: -14,
    backgroundColor : "#3399ff",
    borderRadius : 12,
    borderColor : "#3399ff",
    borderWidth : 1,
    marginLeft : 18,
    color : "white",
    alignSelf : "center"
    //fontFamily : 'Rounded_Elegance',
  },

  ugx : {
    alignSelf : "flex-end",
    //fontFamily : 'Rounded_Elegance',
  },

  key : {
    //fontFamily : 'Rounded_Elegance',
  },

  row : {
    flexDirection : "row",
  },

  all : {
    flexDirection : "row",
    alignSelf : "flex-end",
    justifyContent : "center"
  },

  amount : {
    flex : 1
  },

  stats : {
    marginLeft : 5
  },

  title : {
    fontSize : 18,
    color : "#fff",
    fontWeight : "bold",
    marginLeft : 5,
    alignSelf : "center",
  },

  sub : {
    color : "white",
    marginLeft : 5
  },

  figure : {
    fontWeight : "bold",
    fontSize : 18
  },

  heading : {
    fontSize : 13
  },

  icon : {
    padding : 8,
    borderRadius : 20,
    marginRight : 10,
    marginLeft : 10,
    backgroundColor : "orange"
  },

  card : {
    flexDirection : "row",
    borderRadius:10,
    paddingLeft : 5,
    paddingRight : 5,
    paddingTop : 15,
    marginTop : 10,
    paddingBottom : 15,
    shadowColor: '#e2e2e2',
      shadowOffset: {
        width: 0,
        height: 6,
      },
      shadowOpacity: 0.37,
      shadowRadius: 7.49,
      elevation: 5,
      backgroundColor:"#fff",
      width : "97%",
      borderColor : "#004d99",
      alignSelf : 'center'
  },

  txt : {
    color : "orange",
    alignSelf : "center",

  },

  image : {
    width : 50,
    height : 50,
    //borderRadius : 25
  },

  arrow : {
    width : 15,
    height : 15
  },


  list : {
  // backgroundColor : "#f2f2f2",
    paddingHorizontal : 0,
    borderRadius : 20,
  },

  button : {
      //backgroundColor : "#e6e6e6",
      borderColor : "#004d99",
      margin : 10,
      alignItems : "center",
      justifyContent : "center",
      backgroundColor: '#ffffff',
      borderRadius: 5,
      borderWidth : 1, 
      height: 45,
      width : "45%",
      alignSelf : 'center',
      marginTop : 10,
  },
});
