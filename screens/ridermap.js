import React, { Component } from 'react';
import {Alert, Modal, Platform, StyleSheet, Text, View, FlatList, ActivityIndicator, Dimensions, Image, TouchableOpacity, ScrollView } from 'react-native';
import MapView, {PROVIDER_GOOGLE, MapMarker} from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import AsyncStorage from '@react-native-community/async-storage';
import {Actions} from 'react-native-router-flux';
import Icon from "react-native-vector-icons/FontAwesome";
import BottomSheet from 'react-native-bottomsheet-reanimated';
import {Button} from 'native-base';
import axios from 'axios';
import {connect} from 'react-redux';
import {deleteParties, addCoords} from  '../Actions/actions';
import io from 'socket.io-client';
import RNImmediatePhoneCall from 'react-native-immediate-phone-call';
import {base_url, server} from '../components/links';
import Toast from 'react-native-toast-message';
import NotificationSounds, {playSampleSound} from 'react-native-notification-sounds'

//const snapPoints = [0, "78%", '70%', '100%'];

const snapPoints = [0, 500, '70%', '100%'];


class RMap extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      latitude : '',
      longitude : '',
      loading : true,
      modalVisible : false,
      riders : [],
      selected: [], 
      number : 0,
      started : false,
      finished : false,
      cancelled : false,
      confirmed : false,
      paired : false,
      schedule : false,
      scheduled : false,
      point : '',
      action : "Close",
      title : "Loading...",
      cash : false,
      online : false,
      user : '',
      contact : '',
      data : [],
      payment_mode : "cash"
    };
  }
  

  static onExit = () =>{
    axios.post(base_url + 'availability.php', {
      contact : self.state.contact,
      status : 'unavailable'
    })
    .then(function (response) {
      //console.log(response.data);
      if(response.data == "Error"){
        alert("An Error occured");
  
      }else{
        Toast.show({
          type: 'info',
          text1: 'Hello',
          text2: 'You are offline'
        });
      }
    })
    .catch(function (error){
      //console.log(error.message);
      alert("Network Error");
    })  
  }

  
  static onEnter = () =>{
    axios.post(base_url + 'availability.php', {
      contact : self.state.contact,
      status : 'available'
    })
    .then(function (response) {
      //console.log(response.data);
      if(response.data == "Error"){
        alert("An Error occured");
  
      }else{
        Toast.show({
          type: 'info',
          text1: 'Hello',
          text2: 'You are online'
        });
      }
    })
    .catch(function (error){
      //console.log(error.message);
      alert("Network Error");
    })  
  }
  

  onOpenBottomSheetHandler = (index) => {
    this.refs.BottomSheet.snapTo(index);
  };


  UNSAFE_componentWillMount() {
    //this.Notification();
    self = this;

    AsyncStorage.getItem("contact", (err, res) => {
      if (res){        
        this.setState({contact : res}); 
        this.checkStatus(res);
      }
    })

    if(this.props.points.customer != ""){
      this.Fetch(this.props.points.customer);
    }
    
    this.getYourLocation();
                                   
    AsyncStorage.getItem("user", (err, res) => {
      if (res){
        this.setState({user : res});
      }
    })
  }


  watchID : ?number = null;

  componentDidMount(){

    this.socket = io(server);

    AsyncStorage.getItem("contact", (err, res) => {
      if (res){    
        this.socket.on(res + "rider", (msg, callback) =>{
           
          callback();

          if(msg.title == "request"){

            this.Notification();

            this.setState({scheduled : false});

            if(msg.status != "") {
              this.setState({schedule : true, title : "Schedule", loading : false, paired : true});
              
              this.Fetch(msg.client_contact, true);

              setTimeout(() =>{
                if(this.state.scheduled == false){
                  this.Status('missed');
                  this.setState({schedule : false, data : [], title : "Listening for requests", loading : true, paired : false});
                  Alert.alert(
                    "Oopps.. sorry",
                    "You have missed your client"
                  )
                 }
              }, 20000)
  
            }else{
              this.setState({schedule : false, title : "Request", loading : false, paired : true});
              
              this.Fetch(msg.client_contact, false);

              setTimeout(() =>{
                if(this.state.confirmed == false){
                  this.Status('missed');
                  this.setState({data : [], title : "Listening for requests" , schedule : false, loading : true, paired : false});

                  Alert.alert(
                    "Oopps.. sorry",
                    "You have missed your client"
                  )
                 }
              }, 20000)
            }

          }else if(msg.title == "cancel"){
            this.onOpenBottomSheetHandler(1);
            this.setState({cancelled : true, loading : true, paired : false, data : []});
            Alert.alert(
              "Oopps.. sorry",
              "Client has cancelled"
            )
          }else if(msg.title == "mode"){
            this.setState({payment_mode : msg.mode, title : 'Recieve payment'});
          }
        });


        //sensing change in position
        //this.watchID = 
        this.watchID = navigator.geolocation.watchPosition(
          position => {
            //alert(position.coords.latitude);
            this.updateLocation(position.coords.latitude, position.coords.longitude);
            this.props.addCoords(position.coords.latitude, position.coords.longitude);

            location = "";
            this.socket.emit("location", {title : "location", contact : res, latitude: position.coords.latitude, longitude: position.coords.longitude},
            function(response){
              location = "true";
            });

            setTimeout(() => {
              if (location != "true") {
                this.socket.emit("location", {title : "location", contact : res, latitude: position.coords.latitude, longitude: position.coords.longitude},
                function(response){});
              }
            }, 3000);
  
          },  
          error => console.log("Maps Error: ", error),
          {
            enableHighAccuracy: true,
            timeout : 20000,
            maximumAge: 0,
            distanceFilter: 20
          }
        );
      }
    })  
  }


  componentWillUnmount(){
    navigator.geolocation.clearWatch(this.watchID);
  }

  //Notification sound when request comes in
  Notification = () =>{
    NotificationSounds.getNotifications('notification').then(sounds =>{
      playSampleSound(sounds[0]);
    })
  }


  //Checking for ongoing trips
  checkStatus = (contact) =>{
    var self = this;
    
    self.setState({loading : true});

    axios.post(base_url + 'rider_check.php', {
      contact : contact,
    })
    .then(function (response) {
      //console.log(response.data);
      if(response.data == "None"){
        //alert("An Error occured");
        self.setState({title : "Listening for requests",});
      }else{
      self.setState({
        data : [response.data], loading : false, paired : true,
        started : response.data.TStatus == "started" ? true : false,
        finished : response.data.TStatus != "ended" ? false : true,
        confirmed : response.data.TStatus != "confirmed" ? false : true,
        title : response.data.TStatus == "started" || response.data.TStatus == "confirmed" ? "Your Customer" : "Receive Payment..."
      });
      }
    })
    .catch(function (error){
      //hanadle error
      //console.log(error.message);
    })
  }


  
  //Fetching request
  Fetch = (contact, schedule) => {
    var self = this;
    self.setState({loading : true});

    axios.post(base_url + 'rmap.php', {
      ccontact : contact,
      rcontact : this.props.points.driver ? this.props.points.driver : this.state.contact,
      scheduled : this.props.points.driver ? "yes" : ""
    })
    .then(function (response) {
      //console.log(response.data);
      if(response.data == "Error"){
        alert("An Error occured");
        //self.setState({loading : false});
      }else{
        self.setState({
          data : [response.data], loading : false, paired : true,
        title : response.data.TStatus == "confirmed" ?  "Your Customer" : response.data.TStatus == "request" && self.state.schedule == false ?  "Request" : "Schedule",
        confirmed : response.data.TStatus == "confirmed" ? true : false
        });
      }
    })
    .catch(function (error) {
      //hanadle error
      //console.log(error.message);
    })
  }


  //Updating rider location
  updateLocation = (lat, lng) =>{
    axios.post(base_url + 'location.php', {
      contact : this.state.contact,
      lat : lat,
      lng : lng
    })
    .then(function (response) {
      //console.log(response.data);
      if(response.data == "Error"){
        alert("An Error occured");
        //self.setState({loading : false});

      }else{
        //self.setState({data : response.data, loading : false, paired : true});
      }
    })
    .catch(function (error){
      //hanadle error
      alert("Network Error, your location was not updated. Please go back to Home and click Map again");
    })
  }


  //Gettting riders' location
  getYourLocation = () =>{
    navigator.geolocation.getCurrentPosition(
      (position) => {
          var latitude = position.coords.latitude;
          var longitude = position.coords.longitude; 

          this.props.addCoords(latitude, longitude);
          this.updateLocation(latitude, longitude);
        },
      (error) => {
          //console.warn(error)
      },
      {enableHighAccuracy : true, timeout : 15000, maximumAge : 10000 }
    );
  }



  //Updating trip status
  Status = (status)  => {
    axios.post(base_url + 'status.php', {
      transporter : this.state.contact,
      customer : this.state.data.length > 0 ? this.state.data[0].CContact : "",
      status : status,
      user : this.state.user
    })
    .then(function (response) {
      //console.log(response.data);
      if(response.data == "Error"){
        alert("An Error occured");
      }else{
        //self.setState({data : response.data});
      }
    })
    .catch(function (error){
      //hanadle error
      //console.log(error.message);
    })
  }



  //Toggling this bottom sheet
  Action = () =>{
    if(this.state.action == "Open"){
      this.setState({action : "Close"});
      this.onOpenBottomSheetHandler(1);
    }else {
      this.setState({action : "Open"});
      this.onOpenBottomSheetHandler(0);
    }
  }

  
  //Cancelling a ride by the customer
  cancelRide = () =>{

    cancel_rd = "";

    this.socket.emit('rider_cancel', { title : "cancel", contact : this.state.data[0].RContact},
    function(response){
      cancel_rd = "true";
    });

    setTimeout(() => {
      if (cancel_rd != "true") {
        this.socket.emit('rider_cancel', { title : "cancel", contact : this.state.data[0].RContact},
        function(response){});
      }
    }, 3000);

    this.setState({loading : true, paired : false, data : [], title : "Listening for requests"});
    this.Status("cancelled");
    Actions.index();
  }



  //Confirming the ride
  confirmRide = () =>{

    confirm_rd = "";
    this.socket.emit('confirm', {title : "confirm", contact : this.state.data[0].RContact},
    function(response){
      confirm_rd = "true";
    });

    setTimeout(() => {
      if (confirm_rd != "true") {
        this.socket.emit('confirm', {title : "confirm", contact : this.state.data[0].RContact},
        function(response){});
      }
    }, 3000);
   
    this.setState({title : "Your Customer", confirmed : true});
    this.Status("confirmed");
  }



  //Rider starting the ride from pick up to drop off
  startRide = () =>{

    start_rd = "";
    this.socket.emit('start', {title : "start", contact : this.state.data[0].RContact},
    function(response){
      start_rd = "true";
    });

    setTimeout(() => {
      if (start_rd != "true") {
        this.socket.emit('start', {title : "start", contact : this.state.data[0].RContact},
        function(response){});
      }
    }, 3000);

    this.setState({started : true});
    this.Status("started");
  }



  //Rider finishing ride at drop off
  finishRide = () =>{

    finish_rd = "";

    this.socket.emit('finish', {title : "finish", contact : this.state.data[0].RContact},
    function(response){
      finish_rd = "true";
    });

    setTimeout(() => {
      if (finish_rd != "true") {
        this.socket.emit('finish', {title : "finish", contact : this.state.data[0].RContact},
        function(response){});
      }
    }, 3000);
  
    this.setState({title : "Waiting for Payment...", finished : true});
    this.Status("ended");
  }



  //Rider confirming payment by client
  paidRide = () =>{
    this.Status("finished");

    paid_rd = "";
    this.socket.emit('paid', {title : "paid", contact : this.state.data[0].RContact},
    function(response){
      paid_rd = "true";
    });

    setTimeout(() => {
      if (paid_rd != "true") {
        this.socket.emit('paid', {title : "paid", contact : this.state.data[0].RContact},
        function(response){});
      }
    }, 3000);

    this.setState({started : false, finished : false, confirmed : false, loading : true, paired : false, data : [], title : "Listening for requests",});

    reload_rd = "";

    this.socket.emit('reload', {title : "reload", contact : this.state.data[0].RContact},
    function(response){
      reload_rd = "true";
    });

    setTimeout(() => {
      if (reload_rd != "true") {
        this.socket.emit('reload', {title : "reload", contact : this.state.data[0].RContact},
        function(response){});
      }
    }, 3000);
  }


  //Confirm schedule of a give rider
  scheduleRide = () =>{
    this.Status("scheduled");

    scheduled_rd = "";
    this.socket.emit('scheduled', {title : "scheduled", contact : this.state.data[0].RContact},
     function(response){
        scheduled_rd = "true";
    });

    setTimeout(() => {
      if (scheduled_rd != "true") {
        this.socket.emit('scheduled', {title : "scheduled", contact : this.state.data[0].RContact},
        function(response){});
      }
    }, 3000);

    this.setState({ scheduled : true, loading : true, paired : false, data : [], title : "Listening for requests",});
    Alert.alert(
      "Status",
      "Ride has been scheduled successfully"
    )

    reload_rd = "";

    this.socket.emit('reload', {title : "reload", contact : this.state.data[0].RContact},
    function(response){
      reload_rd = "true";
    });

    setTimeout(() => {
      if (reload_rd != "true") {
        this.socket.emit('reload', {title : "reload", contact : this.state.data[0].RContact},
        function(response){});
      }
    }, 3000);
  }


  //calling
  Call(num){
    RNImmediatePhoneCall.immediatePhoneCall(num);
  }


  //Operations on modal
  setModalVisible(visible) {
      this.setState({modalVisible : visible});
  }


  openModal = (value) =>{
    this.setState({point : value});
    this.setModalVisible(true);
  }


  Event = () =>{
    this.socket.emit("location", {title : "location", contact : this.state.contact, latitude: 0.3375, longitude: 32.6469});
  }



  renderContent = () =>{

    return(
      this.state.loading == true && this.state.data.length == 0 ? 
        <ActivityIndicator size = {"large"} style = {{marginTop : "30%"}} color = {"#33ccff"} />
        
      :

      this.state.finished != true?
      <View> 
         <View style = {{flexDirection : "row", marginLeft : 10}}>
            <View style = {{width : "98%"}}>
              <TouchableOpacity style = {{flexDirection : "row"}} onPress = {() => this.openModal("pickup")}>
                <Text numberOfLines = {1} style = {{marginLeft : 8}}>Pick-up Details</Text>
                <View style = {{flex : 1, marginTop : 5,}}>
                  <Image  style = {{height : 18, width : 18, alignSelf : "flex-end", marginRight : 15}} source = {require('../Resources/chevron.png')}/>
                </View>
              </TouchableOpacity>
              <View style = {{backgroundColor : "#e2e2e2", height : 1, marginTop  : 10, marginBottom  : 5}}></View>

              <TouchableOpacity onPress = {() => this.openModal("dropoff")} style = {{ marginTop : 5, flexDirection : "row"}}>
                <Text style = {{ marginLeft : 8}}>Drop-off Details</Text>
                <View style = {{flex : 1}}>
                  <Image  style = {{height : 18, width : 18, alignSelf : "flex-end", marginRight : 15}} source = {require('../Resources/chevron.png')}/>
                </View>
              </TouchableOpacity>
              <View style = {{backgroundColor : "#e2e2e2", height : 1, marginTop  : 10, marginBottom  : 5}}></View>

            </View>
          </View>

           <View style = {styles.card}>
              <View style = {{width : "50%", alignItems : "center", flexDirection : "row"}}>
                <Image  style = {{height : 28, width : 28, marginLeft : 10}} source = {require('../Resources/direction.png')}/>
                <Text style = {{fontSize : 15, marginLeft : 10}}>Distance  :  </Text>
                <Text style = {{fontSize : 15}}>{this.state.data.length > 0 ? this.state.data[0].Distance : "" } KM</Text>
              </View>
           </View>

           <View style = {styles.card}>
              <View style = {{width : "50%", alignItems : "center", flexDirection : "row"}}>
                <Image  style = {{height : 28, width : 28, marginLeft : 10}} source = {require('../Resources/calendar.png')}/>
                <Text style = {{fontSize : 15, marginLeft : 10}}>Date  :  </Text>
                <Text style = {{fontSize : 15}}>{this.state.data.length > 0 ? this.state.data[0].Date : "" }</Text>
              </View>
           </View>

           <View style = {styles.card}>
              <View style = {{width : "50%", alignItems : "center", flexDirection : "row"}}>
                <Image  style = {{height : 28, width : 28, marginLeft : 10}} source = {require('../Resources/price.png')}/>
                <Text style = {{fontSize : 15, marginLeft : 10}}>Amount  :  </Text>
                <Text style = {{fontSize : 15}}>UGX {this.state.data.length > 0 ? this.state.data[0].Cost : "" }</Text>
              </View>
           </View>


          <View style = {styles.rider}> 
          {this.state.started != true ?          
            <View style = {{flexDirection : 'row'}}>
              <Button block style = {styles.cancel}  onPress={() => this.cancelRide()}>
                <Text style ={styles.btntxt}>Cancel</Text> 
              </Button>

              {this.state.confirmed == true ? 
                <View style = {{flex : 1}}>
                  <Button block style = {styles.confirm}  onPress={() => this.startRide()}>
                    <Text style ={styles.btntxt}>Start</Text> 
                  </Button>
                </View>
              :
                <View style = {{flex : 1}}>
                  <Button block style = {styles.confirm}  onPress={
                      this.state.schedule == false ? () => this.confirmRide() : () => this.scheduleRide()}>
                    <Text style ={styles.btntxt}>Confirm</Text> 
                  </Button> 
                </View>
              }
            </View>
          :

          <Button block style = {styles.finish}   onPress={() => this.finishRide()}>
            <Text style ={styles.btntxt}>Finish</Text> 
          </Button> 
          }
          </View> 
        </View>
      :
        this.state.payment_mode == "" ?
          <View style = {{marginTop : "25%"}}>
            <ActivityIndicator color = "#00ace6" size = {30}/>
          </View>
        :
          this.state.payment_mode == "cash" ?
            <View>
              <Text style = {{textAlign : "center", color : "red", marginTop : 15}}>Please receive UGX {this.state.data.length > 0 ?  this.state.data[0].Cost : "" }/=</Text>
              <Button block style = {styles.finish}   onPress={() => this.paidRide()}>
                <Text style ={styles.btntxt}>Done</Text> 
              </Button> 
            </View>
          :<View></View>
    );       
  }


  render() {
    if(this.props.points.customer){
      this.getYourLocation();
      this.Fetch(this.props.points.customer)
      this.props.deleteParties();
    }
    
    mapStyle = [
      {
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#1d2c4d"
          }
        ]
      },
      {
        "elementType": "labels.text.fill",
        "stylers": [
          {
            "color": "#8ec3b9"
          }
        ]
      },
      {
        "elementType": "labels.text.stroke",
        "stylers": [
          {
            "color": "#1a3646"
          }
        ]
      },
      {
        "featureType": "administrative.country",
        "elementType": "geometry.stroke",
        "stylers": [
          {
            "color": "#4b6878"
          }
        ]
      },
      {
        "featureType": "administrative.land_parcel",
        "elementType": "labels.text.fill",
        "stylers": [
          {
            "color": "#64779e"
          }
        ]
      },
      {
        "featureType": "administrative.province",
        "elementType": "geometry.stroke",
        "stylers": [
          {
            "color": "#4b6878"
          }
        ]
      },
      {
        "featureType": "landscape.man_made",
        "elementType": "geometry.stroke",
        "stylers": [
          {
            "color": "#334e87"
          }
        ]
      },
      {
        "featureType": "landscape.natural",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#023e58"
          }
        ]
      },
      {
        "featureType": "poi",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#283d6a"
          }
        ]
      },
      {
        "featureType": "poi",
        "elementType": "labels.text.fill",
        "stylers": [
          {
            "color": "#6f9ba5"
          }
        ]
      },
      {
        "featureType": "poi",
        "elementType": "labels.text.stroke",
        "stylers": [
          {
            "color": "#1d2c4d"
          }
        ]
      },
      {
        "featureType": "poi.park",
        "elementType": "geometry.fill",
        "stylers": [
          {
            "color": "#023e58"
          }
        ]
      },
      {
        "featureType": "poi.park",
        "elementType": "labels.text.fill",
        "stylers": [
          {
            "color": "#3C7680"
          }
        ]
      },
      {
        "featureType": "road",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#304a7d"
          }
        ]
      },
      {
        "featureType": "road",
        "elementType": "labels.text.fill",
        "stylers": [
          {
            "color": "#98a5be"
          }
        ]
      },
      {
        "featureType": "road",
        "elementType": "labels.text.stroke",
        "stylers": [
          {
            "color": "#1d2c4d"
          }
        ]
      },
      {
        "featureType": "road.highway",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#2c6675"
          }
        ]
      },
      {
        "featureType": "road.highway",
        "elementType": "geometry.stroke",
        "stylers": [
          {
            "color": "#255763"
          }
        ]
      },
      {
        "featureType": "road.highway",
        "elementType": "labels.text.fill",
        "stylers": [
          {
            "color": "#b0d5ce"
          }
        ]
      },
      {
        "featureType": "road.highway",
        "elementType": "labels.text.stroke",
        "stylers": [
          {
            "color": "#023e58"
          }
        ]
      },
      {
        "featureType": "transit",
        "elementType": "labels.text.fill",
        "stylers": [
          {
            "color": "#98a5be"
          }
        ]
      },
      {
        "featureType": "transit",
        "elementType": "labels.text.stroke",
        "stylers": [
          {
            "color": "#1d2c4d"
          }
        ]
      },
      {
        "featureType": "transit.line",
        "elementType": "geometry.fill",
        "stylers": [
          {
            "color": "#283d6a"
          }
        ]
      },
      {
        "featureType": "transit.station",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#3a4762"
          }
        ]
      },
      {
        "featureType": "water",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#0e1626"
          }
        ]
      },
      {
        "featureType": "water",
        "elementType": "labels.text.fill",
        "stylers": [
          {
            "color": "#4e6d70"
          }
        ]
      }
    ];

    return (
      <View>
        <View style = {styles.container}>         
          <MapView
            style = {styles.map}
            provider = {PROVIDER_GOOGLE}
            mapType ="standard"
            customMapStyle = {mapStyle}
            initialRegion ={{
              latitude : this.props.points.riderlat,
              longitude: this.props.points.riderlng,
              latitudeDelta: 0,
              longitudeDelta: 0.002,
            }}             
          >

          { this.state.data.length > 0 ?
          <MapViewDirections
            origin={{
              latitude : this.props.points.riderlat,
              longitude: this.props.points.riderlng
            }}
            destination={{
               latitude : this.state.started == true || this.state.finished == true ?
                parseFloat(this.state.data[0].DLat) : parseFloat(this.state.data[0].PLat),
               longitude: this.state.started == true || this.state.finished == true ?
               parseFloat(this.state.data[0].DLng) : parseFloat(this.state.data[0].PLng) 
            }}
            strokeWidth={4}
            strokeColor ="#00ace6"
            apikey={'AIzaSyCtP83M_as6WCFor-AYOqX_2RawYqxThMg'}
          />: <View></View>}

           { this.props.points.riderlat != 0 ?
            <MapView.Marker
              coordinate ={{
                latitude : this.props.points.riderlat,
                longitude: this.props.points.riderlng
                }}
              title = {"Your location"}
              //pinColor = {"orange"}
              flat = {false}
              //style = {{transform : [{rotate: '-20deg'}]}}
              >
                {/*<Image
                  source={require("../Resources/mb.png")}
                  style={{height : 50, width : 50}}
                />*/}              
            </MapView.Marker>: <View></View>}

            { this.state.data.length > 0 ?
            <MapView.Marker
              coordinate ={{latitude: parseFloat(this.state.data[0].PLat) , longitude: parseFloat(this.state.data[0].PLng)}}
              pinColor = {"#00ace6"}
              title = {"Pick-up Point"}
              >                                                    
            </MapView.Marker> : <View></View>}

            { this.state.data.length > 0 ?
            <MapView.Marker
              coordinate ={{latitude: parseFloat(this.state.data[0].DLat) , longitude: parseFloat(this.state.data[0].DLng)}}
              title = {"Drop-off Point"}
              pinColor = {"#00ace6"}
              >                                                    
          </MapView.Marker>: <View></View>}
         </MapView>

          <Modal
            animationType={'slide'}
            transparent={true}
            onRequestClose={() => this.setModalVisible(false)}
            visible={this.state.modalVisible}>

            <View style={styles.popupOverlay}>
              <View style={styles.popup}>
                <TouchableOpacity  underlayColor = "#fff" style = {{width : 35, height : 30, margin : 10}} onPress = {() => {this.setModalVisible(false)}}>
                  <Image  style = {{height : 20, width : 20}} source = {require('../Resources/cancel.png')}/> 
                </TouchableOpacity>
                <View style={styles.popupContent}>

                {this.state.loading == false && this.state.data.length > 0 ? 

                  this.state.point == "pickup" ? 

                  <ScrollView contentContainerStyle={styles.modalInfo}>
                      <Text style = {styles.hd}>Start Point : </Text>
                      <Text style = {styles.more}>{this.state.data[0].Pickup}</Text> 
                      <Text style = {styles.hd}>More Details : </Text>

                      <Text style = {styles.more}>{this.state.data[0].PEXtra}</Text> 

                      <Button style = {styles.call} onPress={() => this.Call(this.state.data[0].PContact)}>                
                        <Text style = {styles.btntxt}>Call start point</Text>                 
                      </Button>
                  </ScrollView>
                 
                 :
                  
                  <ScrollView contentContainerStyle={styles.modalInfo}>
                      <Text style = {styles.hd}>End Point : </Text>
                      <Text style = {styles.more}>{this.state.data[0].Dropoff}</Text> 
                      <Text style = {styles.hd}>More Details : </Text>

                      <Text style = {styles.more}>{this.state.data[0].DExtra}</Text> 

                      <Button style = {styles.call} onPress={() => this.Call(this.state.data[0].DContact)}>                
                        <Text style = {styles.btntxt}>Call end point</Text>                 
                      </Button>
                  </ScrollView>: <View></View>}
                </View>
              </View>
            </View>
          </Modal>

          <BottomSheet
              bottomSheerColor="#eeeeee"
              ref="BottomSheet"
              initialPosition={500} //200, 300
              snapPoints={snapPoints}
              isBackDrop={true}
              isBackDropDismissByPress={true}
              isRoundBorderWithTipHeader={true}
              //backDropColor="#00ace6"
              // isModal
              containerStyle={{backgroundColor:"#fff"}}
              tipStyle={{backgroundColor:"#00ace6"}}
              //headerStyle={{backgroundColor:"#eeeeee"}}
              //bodyStyle={{backgroundColor:"#eeeeee",flex:1}}
              header={
                <View>
                  <View style = {{flexDirection : "row"}}>
                    <Image source = {require('../Resources/go.jpg')} style = {{borderWidth : 1,width : 25, height : 25, borderRadius : 15}}/>
                    <View style = {{flex : 1}}>
                      <Text style={styles.text}>{this.state.title}</Text>
                    </View>
                    <TouchableOpacity onPress = {this.state.paired == true ? () => this.Call(this.state.data[0].CContact) : () => {}} style = {{borderRadius : 30, backgroundColor : this.state.loading == true ? "#999999" : "#00ace6", width : 35, height : 35, alignItems : "center", justifyContent : "center"}}>
                      <Icon name = "phone" size = {25} style = {{color : 'white'}}/> 
                    </TouchableOpacity> 
                  </View>
                </View>
              }
              body={this.renderContent()}
            />
        </View>

        {this.state.paired == true && this.state.data.length > 0? 
        <TouchableOpacity onPress = {() => {this.Action()}} style = {{marginTop : 80, borderTopLeftRadius : 15, borderBottomLeftRadius : 15, alignSelf : "flex-end", position : "absolute", backgroundColor : "#00ace6"}}>
          <Text style ={{fontFamily : "Rounded_Elegance", textAlign : "center", color : "white", paddingTop : 3, paddingRight : 8, paddingLeft : 8,}}>{this.state.action}</Text>
        </TouchableOpacity> : <View></View>}
      </View>
    );
  }
}



const mapStateToProps = (state) =>{
  const {points} = state;
  return { points }
}


const mapDispatchToProps = (dispatch) => ({
  deleteParties : () => dispatch(deleteParties()),
  addCoords : (lat, lng) => dispatch(addCoords(lat, lng)),
});

const styles = StyleSheet.create({
more : {
  fontSize:14,
  //alignSelf:'center',
  color:"#696969",
  marginBottom : 5,
  //width : "90%",
  marginLeft : 10
},

hd : {
  marginLeft : 10,
  color:"red",
},

call : {
  justifyContent : "center",
  backgroundColor: '#00ace6',
  borderRadius: 5,
  borderWidth : 1, 
  borderColor : "#00ace6",
  height: 45,
  width : "95%",
  alignSelf : 'center',
  marginTop : 8,
},

container : {
 //position : 'absolute',
 //top : 0,
 //left : 0,
 //bottom : 0,
 //right : 0, 
 height : "100%",
 justifyContent : 'flex-end',
 alignItems : 'center',
 //marginTop : 20
},
pic : {
borderRadius : 50,
width : 40,
height : 40
},

map : {
  position : 'absolute',
 top : 0,
 left : 0,
 bottom : 0,
 right : 0, 
},
button : {
 backgroundColor : "#ffffff",
 height : 20, 
 marginLeft : 2,
 marginRight : 2
},

btntxt : {
color : "white",
},

info : {
fontFamily : 'Rounded_Elegance',
alignSelf : "flex-end",
fontSize : 12
},

info1 : {
fontFamily : 'Rounded_Elegance',
alignSelf : "flex-end",
fontSize : 12,
marginTop : 35
},

rider : {
  alignItems : "center",
},

riders : {
  flexDirection : "row",
  marginLeft : 10,
  marginTop : 5
},

details : {
  marginLeft : 10
},

img : {
  borderRadius : 50,
  width : 80,
  height : 80,
  position : "absolute",
  borderWidth : 1,
  borderColor : "orange"
},
text : {
  alignSelf : "center",
  marginLeft : 10,
  fontWeight : "bold",
  fontSize : 15
},

card:{
  width:"95%",
  //height:70,
  borderRadius:10,
  borderColor : "#3399ff",
  borderWidth : 0.1,
  //justifyContent:'center',
  alignSelf : 'center',
  flexDirection : "row",
  marginTop : 10,
  marginBottom : 10,
    //flex : 1
  shadowColor: '#00000021',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
    elevation: 2,

    marginVertical: 5,
    marginHorizontal:12,
    backgroundColor:"white",
    //flexBasis: '46%',
    paddingTop: 10,
    paddingBottom: 10,
    flexDirection:'row'
},

cancel: {
  justifyContent : "center",
  marginLeft : 10,
  backgroundColor: '#00ace6',
  marginBottom : 90,
  borderRadius: 5,
  borderWidth : 1, 
  borderColor : "#00ace6",
  height: 45,
  width : "40%",
  //alignSelf : 'center',
  marginTop : 10,
},

confirm: {
  justifyContent : "center",
  marginRight  : 10,
  backgroundColor: '#00ace6',
  marginBottom : 90,
  borderRadius: 5,
  borderWidth : 1, 
  borderColor : "#00ace6",
  height: 45,
  width : "50%",
  alignSelf : 'flex-end',
  marginTop : 10,
},

finish: {
  justifyContent : "center",
  backgroundColor: '#00ace6',
  marginBottom : 100,
  borderRadius: 5,
  borderWidth : 1, 
  borderColor : "#00ace6",
  height: 45,
  width : "95%",
  alignSelf : 'center',
  marginTop : 8,
},


/************ modals ************/
icon : {
  color : "#3399ff",
  marginTop : 3,
  marginLeft : 3
 },

  title : {
    fontFamily : 'Rounded_Elegance',
    marginLeft : 10,
    marginTop : 3,
    fontSize : 13
  },
  row : {
    flexDirection : "row",
    marginTop : 10  
  },

  popup: {
    backgroundColor: 'white',
    marginTop: 100,
    marginHorizontal: 20,
    borderRadius: 7,
  },
  popupOverlay: {
    backgroundColor: "#00000057",
    flex: 1,
    marginTop: 0
  },
  popupContent: {
    //alignItems: 'center',
    margin: 5,
    //height:200,
  },
  popupHeader: {
    marginBottom: 45
  },
  popupButtons: {
    marginTop: 0,
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: "#eee",
    justifyContent:'center'
  },
  popupButton: {
    flex: 1,
    marginVertical: 16
  },
  
  btnClose:{
    //height:20,
    //backgroundColor:'#3399ff',
    paddingLeft :18,
    paddingRight : 15,
    paddingTop : 10,
    //paddingBottom : 10,
    borderRadius : 30,
    marginBottom : 5,
    marginTop : 5,
  },
  modalInfo:{
    //alignItems:'center',
    justifyContent:'center',
  } 
});

export default connect(mapStateToProps, mapDispatchToProps)(RMap);












































