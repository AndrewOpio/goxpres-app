import React, { Component } from 'react';
import {BackHandler, Alert, TextInput, Picker, Platform, StyleSheet, Text, View, FlatList, ActivityIndicator, Dimensions, Image, TouchableOpacity, ScrollView } from 'react-native';
import MapView, {PROVIDER_GOOGLE, MapMarker} from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import AsyncStorage from '@react-native-community/async-storage';
import {Actions} from 'react-native-router-flux';
import Icon from "react-native-vector-icons/FontAwesome";
import BottomSheet from 'react-native-bottomsheet-reanimated';
import {Button} from 'native-base';
import {Rating, AirbnbRating} from 'react-native-ratings';
import axios from 'axios';
import io from 'socket.io-client';
import {connect} from 'react-redux';
import RNImmediatePhoneCall from 'react-native-immediate-phone-call';
import {addCoords} from  '../Actions/actions';
import {base_url, server} from '../components/links';
import {getPreciseDistance } from 'geolib';
import BackgroundTimer from 'react-native-background-timer';

//const snapPoints = [0, '55%', '70%', '100%'];

const snapPoints = [0, 350, '70%', '100%'];

let timer;

class CMap extends React.Component {
  constructor(props){
    super(props);

    //... Rest of the constructor including state object
    this.state = {
      loading : false,
      selected: [], 
      number : 0,
      confirmed  : false,
      started : false,
      cancelled : false,
      finished : false,
      riderlat : 0,
      riderlng : 0,
      action : "View map",
      paired : false,
      payment : "cash",
      transaction : "pending",
      payment_status : "done",
      title : "Pairing...",
      contact : '',
      rider : [],
      riders : [],
      rating : 0,
      rider_who_cancelled : [],
      user : "",
      dta : []
    };
  }



  onOpenBottomSheetHandler = (index) => {
    this.refs.BottomSheet.snapTo(index);
  };

  
  UNSAFE_componentWillMount() {

    this.socket = io(server);
    //alert(this.props.contact);

    AsyncStorage.getItem("contact", (err, res) => { 
      if (res) {
        if (this.props.tracking) {
            this.Track(this.props.contact, this.props.began, this.props.ended, this.props.confirmed);
        } else {
          this.getRiders();
        }
    
        this.setState({contact : res});
      }
    })


    AsyncStorage.getItem("user", (err, res) => {
      if (res){
        this.setState({user : res});
       }
    })

    BackHandler.addEventListener('hardwareBackPress', this.Back);
  }


  componentWillUnmount(){
    BackHandler.removeEventListener('hardwareBackPress', this.Back);
    //BackgroundTimer.clearInterval(timer);
  }


  componentDidMount(){
  }

 //Device back button
  Back = () =>{
    if(Actions.currentScene == "cmap" && (this.state.started == true || this.state.finished == true)){
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


  //Getting shortest distance between two coordinates on the map.
  getDistanceOfRiders = (data) => {
       /*data.map((rider)=>{
      var details = [rider];
      var riderprofile = this.state.rider.concat(details);
      this.setState({rider : riderprofile, paired : true});
    });

    this.Init(this.state.rider[0].Contact);*/

   // this.Insert(this.state.rider[0].Contact);

      var distance = [];
      var i = 0;

      data.map((rider)=>{
        if(rider.Status == "available" && rider.Permission == "available"){
          if(this.state.rider_who_cancelled.length > 0){
            this.state.rider_who_cancelled.map((rider_cancel)=>{
              if(rider_cancel.Contact != rider.Contact){
                var pdis = getPreciseDistance(
                { latitude: this.props.points.plat, longitude: this.props.points.plng},
                { latitude: rider.CLat, longitude: rider.CLng}
                );
                
                distance[i] = pdis;
                i++;
            }
          })
         }else{
          //alert(this.props.points.plat);

            var pdis = getPreciseDistance(
              { latitude: this.props.points.plat, longitude: this.props.points.plng},
              { latitude: rider.CLat, longitude: rider.CLng }
            );

            distance[i] = pdis;

            i++;
          }
        }
      })
    
      var min = Math.min(...distance);

      data.map((rider)=>{
        if(rider.Status == "available" && rider.Permission == "available"){
          if(this.state.rider_who_cancelled.length > 0){
            this.state.rider_who_cancelled.map((rider_cancel)=>{
              if(rider_cancel.Contact != rider.Contact){

                var pdis = getPreciseDistance(
                {latitude: this.props.points.plat, longitude: this.props.points.plng},
                {latitude: rider.CLat, longitude: rider.CLng}
                );
                
                if(pdis == min){
                  if((pdis <= 2000 && this.props.points.id == "motorcycle") ||
                  this.props.points.id == "small_pickup" || this.props.points.id == "medium_lorry"){
                       var details = [rider];
                    var riderprofile = this.state.rider.concat(details);
                    this.setState({rider : riderprofile, paired : true});
                  }else{
                    Alert.alert(
                      "Oopps.. Sorry",
                      "There are no rides around you in a 2-km distance, lets try again ten seconds"
                    )
                  }  
                }
              }
          })
         }else{
            var pdis = getPreciseDistance(
              { latitude: this.props.points.plat, longitude: this.props.points.plng},
              { latitude: rider.CLat, longitude: rider.CLng }
            );
            //alert(pdis/1000);

            if(pdis == min){
              if((pdis <= 2000 && this.props.points.id == "motorcycle") ||
               this.props.points.id == "small_pickup" || this.props.points.id == "medium_lorry"){
                var details = [rider];
                var riderprofile = this.state.rider.concat(details);
                this.setState({rider : riderprofile, paired : true});
              }else{
                Alert.alert(
                  "Oopps.. Sorry",
                  "There are no rides around you in a 2-km distance, lets try again in ten seconds"
                )
              }  
            }  
         }
      }
    })


    if(this.state.rider.length == 0){
      //Trying again ten seconds
      setTimeout(() =>{
        this.getRiders();
      }, 10000)
      
    }else{
      this.pairedRide(this.state.rider[0].Contact, this.state.contact);

      this.Init(this.state.rider[0].Contact);
      
      this.Insert(this.state.rider[0].Contact);
    }
  }



  //Fetching riders from the database
  getRiders = () => {
    var self = this;
    if(Actions.currentScene == "cmap"){
      self.setState({title : "Pairing..."});

      axios.post(base_url + 'cmap.php', {
        contact : "contact",
        vehicle : this.props.points.id
      })
      .then(function (response) {
        //handle request
        //console.log(response.data);
        if(response.data == "Error"){
          alert("An Error occured");
        }else{
          self.setState({riders : response.data});

          self.getDistanceOfRiders(response.data);
        }
      })
      .catch(function (error){
        //hanadle error
        //console.log(error.message);
      })
    }  
  }



  //Inserting data into the database
  Insert = (contact) =>{
    var self = this;
    axios.post(base_url + 'details.php', {
      ccontact : this.state.contact,
      rcontact : contact,
      date : this.props.date ? this.props.date : "",
      //date : this.props.date ? this.props.date : date.getFullYear()+"-"+date.getMonth()+"-"+date.getDay(),
      pickup : this.props.points.pickup,
      dropoff : this.props.points.dropoff,
      plat : this.props.points.plat,
      plng : this.props.points.plng,
      dlat : this.props.points.dlat,
      dlng : this.props.points.dlng,
      distance : this.props.points.distance,
      quantity : this.props.quantity,
      cost : this.props.points.cost,
      pextra : this.props.pickup_more,
      dextra : this.props.dropoff_more,
      pcontact : this.props.pcontact,
      dcontact : this.props.dcontact,
      size : this.props.size,
      tstatus : "request",
      commission : this.props.commission
    })
    .then(function (response) {
      //handle request
      //alert(response.data);
      if(response.data == "Error"){
        alert("An Error occured");
      }else{
        self.setState({dta : response.data});
       // this.getDistance();
      }
    })
    .catch(function (error){
      //hanadle error
      //console.log(error.message);
    })
  }



  //Repeating after the rider has cancelled the ride
  Repeat = () =>{
    var cancelled = this.state.rider_who_cancelled.concat(this.state.rider);
    this.setState({rider : [], rider_who_cancelled : cancelled});
    this.getRiders();
  }


  //Resume tracking the ride when app had closed or you are using a tracking code
  Track = (contact, began, ended, confirmed) =>{
    var self = this;
    axios.post(base_url + 'resume.php', {
      contact : contact,
      code  : this.props.code
    })
    .then(function (response) {
      //handle request
      //console.log(response.data);
      if(response.data == "Error"){
        alert("An Error occured");
      }else{

        /*timer = BackgroundTimer.setInterval(() => {
          this.getCoords();
        }, 1500);*/
    
       self.setState({rider : response.data, paired : true, started : began, 
         finished : ended, confirmed : confirmed, title : ended == true ? "Make a payment.." :"Your Ride"});
         self.Init(response.data[0].Contact);
        //console.log(this.state.rider);
      }
    })
    .catch(function (error){
      //hanadle error
      //console.log(error.message);
    })
  }


  //Listening in to the rider in real time
  Init = (contact) =>{   
    var self = this;

    this.socket.on(contact + "client", (msg, callback) =>{

      callback();

      if (msg.title == "confirm") {
        this.setState({title : "Your Ride", confirmed : true});

      } else if(msg.title == "start") {
        this.setState({started : true, cancelled : false});

      } else if(msg.title == "finish") {

        //BackgroundTimer.clearInterval(timer);

        this.setState({paired : true, started : false, finished : true, title : "Make a Payment...",});
      
      } else if(msg.title == "scheduled") {
        Alert.alert(
          "Done",
          "Ride scheduled successfully"
        )

        //BackgroundTimer.clearInterval(timer);

        self.onOpenBottomSheetHandler(0);
        Actions.deliveryhome();

      } else if(msg.title == "paid") {
        this.setState({payment_status : "done"});
      
      } else if(msg.title == "cancel") {

        //BackgroundTimer.clearInterval(timer);

        this.setState({cancelled : true, paired : false});
        this.Repeat();
        Alert.alert(
          "Oopps.. Sorry",
          "This ride has been cancelled please hold for a new ride"
        )

      } else if(msg.title == "location") {
        this.props.addCoords(msg.latitude, msg.longitude);
      }
    })
  }


  //get coordinates as rider moves
  getCoords  = () =>{
    var self = this;
    axios.post(base_url + 'coords.php', {
      contact : this.state.rider[0].Contact,
    })
    .then(function (response) {
      //alert(response.data);
      if(response.data == "Error"){
        alert("An Error occured");
      }else{
        self.props.addCoords(response.data.CLat, response.data.CLng);
      }
    })
    .catch(function (error){
      //console.log(error.message);
    })
  }
  

  //Saving the rider rating
  saveRating = () =>{
    var self = this;
    if(this.state.rating){
      axios.post(base_url + 'rating.php', {
        contact : this.state.rider[0].Contact,
        rating : this.state.rating,
        id : this.state.dta ? this.state.dta[1] : this.state.rider[0].id
      })
      .then(function (response) {
        //handle request
        //alert(response.data);
        if(response.data == "Failed"){
          alert("An Error occured");
        }else{
          Alert.alert(
            "Trip is done",
            "Thank you for choosing GoXpres"
          );
          self.onOpenBottomSheetHandler(0);
          Actions.deliveryhome();
        }
      })
      .catch(function (error){
        //hanadle error
        //console.log(error.message);
      })
    }else{
      alert("Please slide to rate");
    }
  }

  
  //Updating trip status
  Status = (status)  => {    
    axios.post(base_url + 'status.php', {
      transporter : this.state.rider[0].Contact,
      customer : this.state.contact,
      status : status,
      user : this.state.user
    })
    .then(function (response) {
      //handle request
      //alert(response.data);
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

  
  //Cancelling a ride by the customer
  Cancel = () =>{    
    //BackgroundTimer.clearInterval(timer);

    cancel = "";

    this.socket.emit('client_cancel', {title : "cancel", contact : this.state.rider[0].Contact},
    function(response){
      cancel = "true";
    });

    setTimeout(() => {
      if (cancel != "true") {
        this.socket.emit('client_cancel', {title : "cancel", contact : this.state.rider[0].Contact},
        function(response){});
      }
    }, 3000);

    this.onOpenBottomSheetHandler(0);
    this.Status("cancelled");
    alert("Ride cancelled");
    Actions.deliveryhome();

  }


  //informing the rider about the ride request
  pairedRide = (rider_contact, client_contact) => {

    this.setState({title : "Request Sent"});

    request = "";
    this.socket.emit('request', {client_contact : client_contact, rider_contact : rider_contact, title : "request", status : this.props.status == "schedule" ?  "schedule" : ""},
    function(response) {
      request = "true";
    });

    setTimeout(() => {
      if (request != "true") {
        this.socket.emit('request', {client_contact : client_contact, rider_contact : rider_contact, title : "request", status : this.props.status == "schedule" ?  "schedule" : ""}, 
        function(response) {});
      }
    }, 3000);


    this.Status('request');

    setTimeout(() =>{
      if(this.state.confirmed == false){

        this.Status('missed');

        this.onOpenBottomSheetHandler(1);
        this.setState({paired : false, title : "Pairing..."})
        Alert.alert(
          "Oopps..",
          "Rider not responding, please hold for another ride"
        )

        this.Repeat();
      }
    }, 23000)
  }
  
  
  //Opening and closing Bottom drawer
  Action = () =>{
    if(this.state.action == "View map"){
      this.setState({action : "Open drawer"});
      this.onOpenBottomSheetHandler(0);
    }else {
      this.setState({action : "View map"});
      this.onOpenBottomSheetHandler(1);
    }
  }


  //Mode of payment
  Payment = (type) =>{
    this.setState({pay4ment : type}); 
    this.socket.emit('mode', {title : "mode", mode : type, contact : this.state.rider[0].Contact});
  }


  //Record rating
  Rating = (value) =>{
    this.setState({rating : value}); 
  }

  //calling
  Call(num){
    RNImmediatePhoneCall.immediatePhoneCall(num);
  }

  Event = () =>{
    this.socket.emit('request', { client_contact : "078", title : "request", rider_contact : "0787561488", status : this.props.status == "schedule" ?  "schedule" : ""});
  }

  
  renderContent = () =>{
    return(
      <View>            
        {this.props.quantity == 1 ?
          //Paired start
          this.state.paired == true && this.state.rider.length > 0 ?
          //Finished start
            this.state.finished == false ?
                <View style = {styles.rider}>
                <View style = {{backgroundColor : "#e6e6e6", borderColor : "#e6e6e6", borderRadius : 20, borderWidth : 1, width : "95%", alignItems : "center",marginTop : 45, marginLeft : 5, marginRight : 5}}>
                <View style = {{alignItems : "center"}}>                 
                  <Text style = {styles.info1}>{this.state.rider[0].realId}</Text>
                </View>
                <View style = {{marginTop : 5, width : "80%", height : 1, backgroundColor : "#e2e2e2"}}/>
                <Text style = {styles.info}>{this.state.rider[0].FirstName + " " + this.state.rider[0].LastName}</Text>
                <View style = {{marginTop : 5, width : "80%", height : 1, backgroundColor : "#e2e2e2"}}/>
                <Text style = {styles.info}>Tracking code  -  {this.state.dta ? this.state.dta[0] : this.state.rider[0].code}</Text>
                <View style = {{fontFamily : 'Neutrous',marginTop : 5, width : "80%", height : 1, backgroundColor : "#e2e2e2"}}/>
                <View style = {{flexDirection : "row", alignItems : "center", paddingLeft : 5, marginRight : 5}}>
                  
                  <Rating
                    imageSize = {20}
                    fractions = {1}
                  //showRating
                    readonly = {true}
                    startingValue = {this.state.rider[0].Rating}
                  />
                </View>
                <View style = {{marginTop : 5, width : "80%", height : 1, backgroundColor : "#e2e2e2"}}/>
                </View> 
                <Image source = {require('../Resources/avatar.png')} style = {styles.img}/>
                
                {
                  //Begining of start
                  this.state.started == false ? 
                    <Button block style = {styles.cancel}   onPress={() => this.Cancel()}>
                      <Text style ={styles.btntxt}>Cancel</Text> 
                    </Button>
                :
                <View style= {{marginTop : 10}}>
                  <Text style= {{color : "red"}}>Delivery in progress...</Text>
                </View>
                //End of start
              }
              </View> 
            :
              this.state.transaction == "pending"?
              <View>
                  <View style = {{borderColor : "#e2e2e2", borderWidth : 1, marginLeft : 10, marginRight : 10}}>                              
                  <Picker selectedValue = {this.state.payment}
                    onValueChange={this.Payment}
                    mode = 'dropdown'
                    color = "#c4c3cb"
                  >
                    <Picker.Item label = "Cash" value = "cash"/>
                    {/*<Picker.Item label = "MTN Mobile Money" value = "M"/>
                    <Picker.Item label = "Select payment method" value = "S" color = "#c4c3cb" />
                    <Picker.Item label = "Airtel Mobile Money" value = "A"/>
                    <Picker.Item label = "Visa Card" value = "VC"/>
                    <Picker.Item label = "MasterCard" value = "MC"/>*/}
                  </Picker>
                </View> 

                {this.state.payment == "cash" ?
                  <Text style = {{textAlign : "center", color : "red", marginTop : 5}}>Please pay UGX {this.props.points.cost ? this.props.points.cost : this.state.rider[0].price}</Text>
                  :<View></View>}

                {this.state.payment == "M" || this.state.payment == "A" ?
                  <View>
                    <TextInput disabled required   placeholder="" placeholderColor="#c4c3cb" value = "0782597147" style={styles.input} onChangeText = {(text) => this.setState({contact : text})}/>            
                    <TextInput disabled required  placeholder="" placeholderColor="#c4c3cb" value = "25000" style={styles.input} onChangeText = {(text) => this.setState({contact : text})}/>            
                  </View>
                :<View></View>}

                {this.state.payment == "VC" ?
                  <View>
                    <View style = {{flexDirection : "row", width : "95%", alignSelf : "center"}}>
                      <TextInput  required   placeholder="Enter date.." placeholderColor="#c4c3cb"  style={styles.card} onChangeText = {(text) => this.setState({contact : text})}/>            
                      <View style ={{width : "5%"}}/>
                      <TextInput  required  placeholder="Security code" placeholderColor="#c4c3cb"  style={styles.card} onChangeText = {(text) => this.setState({contact : text})}/>            
                    </View>
                    <TextInput  required  placeholder="Card Number" placeholderColor="#c4c3cb"  style={styles.input} onChangeText = {(text) => this.setState({contact : text})}/>            
                  </View>
                :<View></View>}   

                <Button block style = {{
                   justifyContent : "center",
                   backgroundColor: this.state.payment_status ? '#3399ff' : "#999999",
                   marginBottom : 20,
                   borderRadius: 5,
                   borderWidth : 1, 
                   borderColor : "#3399ff",
                   height: 45,
                   width : "95%",
                   alignSelf : 'center',
                   marginTop : 10,
                }}
               
               onPress={this.state.payment_status ? () => this.setState({transaction : "done", title : "Rating"}) : () => {}}>
                    {this.state.loading == false ? <Text style ={styles.btntxt}>Finish transaction</Text> :
                    <ActivityIndicator color = "white"/>}
                </Button>               
              </View>
              : 
              <View>
                <Text style ={{textAlign : "center"}}>Rate your overall experience</Text>
                <Rating
                  imageSize = {35}
                  fractions = {1}
                  showRating
                  startingValue = {0}
                  onFinishRating = {this.Rating}
                />
                <View style ={{marginTop : 10}}>
                  <Button block style = {styles.button}   onPress={() => this.saveRating()}>
                      {this.state.loading == false ? <Text style ={styles.btntxt}>Finish</Text> :
                      <ActivityIndicator color = "white"/>}
                  </Button>  
                </View>
              </View>
            //Finished end
          : <View style = {{marginTop : "25%"}}>
              <ActivityIndicator color = "#00ace6" size = {30}/>
            </View>
          //Paired end
        :
        <ScrollView style = {{height : "50%", paddingBottom : 15}}>
          {this.state.selected.map((rider) => 
            <View style = {styles.riders}>
              <Image source = {require('../Resources/pro.jpg')} style ={styles.more}/>
              <View style = {styles.details}>
                <Text style = {styles.info}>{rider.name}</Text>
                <Rating
                  imageSize = {15}
                />
              </View>
              <Button style = {{alignSelf : "flex-end", height : 20}}>
                <Text style = {{fontSize : 12, color : "white"}}>Cancel</Text>
              </Button>
            </View>
          )}
        </ScrollView>}
        </View>
    );
  }



  render() {

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

        {this.state.paired == true && this.state.rider.length > 0 ?

          <MapView
            style = {styles.map}
            provider = {PROVIDER_GOOGLE}
            mapType ="standard"
            customMapStyle = {mapStyle}
            initialRegion ={{
              latitude : this.props.points.riderlat != 0?  this.props.points.riderlat : parseFloat(this.state.rider[0].CLat),
              longitude : this.props.points.riderlng != 0 ?  this.props.points.riderlng : parseFloat(this.state.rider[0].CLng),
              latitudeDelta: 0,
              longitudeDelta: 0.002, 
            }}             
          >

          <MapViewDirections
            origin={{
              latitude : this.props.points.riderlat != 0?  this.props.points.riderlat : parseFloat(this.state.rider[0].CLat),
              longitude: this.props.points.riderlng != 0 ?  this.props.points.riderlng : parseFloat(this.state.rider[0].CLng)
            }}
            destination={{
               latitude : this.state.started == true || this.state.finished == true ? this.props.points.dlat : this.props.points.plat,
               longitude: this.state.started == true || this.state.finished == true ? this.props.points.dlng : this.props.points.plng 
            }}
            strokeWidth={4}
            strokeColor ="#00ace6"
            apikey={'AIzaSyCtP83M_as6WCFor-AYOqX_2RawYqxThMg'}
          />

            <MapView.Marker
              coordinate ={{
                latitude : this.props.points.riderlat != 0 ?  this.props.points.riderlat : parseFloat(this.state.rider[0].CLat),
                longitude: this.props.points.riderlng != 0 ?  this.props.points.riderlng : parseFloat(this.state.rider[0].CLng)
                }}
              title = {"Rider"}
              //pinColor = {"orange"}
              flat = {false}
              //style = {{transform : [{rotate: '-20deg'}]}}
              >
                {/*<Image
                  source={require("../Resources/mb.png")}
                  style={{height : 50, width : 50}}
                />*/}              
            </MapView.Marker>

            <MapView.Marker
              coordinate ={{
                latitude: this.props.points.plat != 0 ? this.props.points.plat : parseFloat(this.state.rider[0].plat),
                longitude: this.props.points.plng != 0 ? this.props.points.plng : parseFloat(this.state.rider[0].plng)
              }}
              pinColor = {"#00ace6"}
              title = {"Pick-up Point"}
              >                                                    
            </MapView.Marker>

            <MapView.Marker
              coordinate ={{
                latitude: this.props.points.dlat != 0 ? this.props.points.dlat : parseFloat(this.state.rider[0].dlat),
                longitude: this.props.points.dlng != 0 ? this.props.points.dlng : parseFloat(this.state.rider[0].dlng)
              }}
              title = {"Drop-off Point"}
              pinColor = {"#00ace6"}
              >                                                    
          </MapView.Marker>
        </MapView>

        : <View></View>}
   
        <BottomSheet
            bottomSheerColor="#FFFFFF"
            ref="BottomSheet"
            initialPosition={350}//200, 300
            snapPoints={snapPoints}
            isBackDrop={true}
            isBackDropDismissByPress={true}
            isRoundBorderWithTipHeader={true}
            //backDropColor="#00ace6"
            //isModal
            containerStyle={{backgroundColor:"white"}}
            tipStyle={{backgroundColor:"#00ace6"}}
              //headerStyle={{backgroundColor:"red"}}
              //bodyStyle={{backgroundColor:"red",flex:1}}
            header={
              <View>
                <View style = {{flexDirection : "row"}}>
                  <Image source = {require('../Resources/go.jpg')} style = {{borderWidth : 0, borderColor : "#00ace6", width : 25, height : 25, borderRadius : 15}}/>
                  <View style = {{flex : 1}}>
                    <Text style={styles.text}>{this.state.title}</Text>
                  </View>
                  
                    <TouchableOpacity onPress = {this.state.paired == true ? () => this.Call(this.state.rider[0].Contact) : () => {}} style = {{borderRadius : 30, backgroundColor : this.state.paired == true ?"#00ace6" : "#999999", width : 35, height : 35, alignItems : "center", justifyContent : "center"}}>
                      <Icon name = "phone" size = {25} style = {{color : 'white'}}/> 
                    </TouchableOpacity> 
                  
                </View>
              </View>
            }
            body={this.renderContent()}
          />
      </View>

        {this.state.paired == true && this.state.rider.length > 0 ?
        <TouchableOpacity onPress = {() => {this.Action()}} style = {{marginTop : 200, borderTopLeftRadius : 15, borderBottomLeftRadius : 15, alignSelf : "flex-end", position : "absolute", backgroundColor : "#00ace6"}}>
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
  addCoords : (lat, lng) => dispatch(addCoords(lat, lng)),
});

const styles = StyleSheet.create({
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
 input : {
  height: 45,
  width : "95%",
  fontSize: 14,
  borderRadius: 5,
  borderWidth: 1,
  borderColor: '#e2e2e2',
  backgroundColor: '#e2e2e2',
  marginTop : 10,
  alignSelf : "center",
  paddingLeft : 10      
},
card : {
  height: 45,
  width : "47.5%",
  fontSize: 14,
  borderRadius: 5,
  borderWidth: 1,
  borderColor: '#e2e2e2',
  backgroundColor: '#e2e2e2',
  marginTop : 10,
  alignSelf : "center",
  paddingLeft : 10      
},
 pic : {
  borderRadius : 50,
  width : 40,
  height : 40
 },
 more : {
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
  //alignSelf : "flex-end",
  fontSize : 12
 },

 info1 : {
  alignSelf : "flex-end",
  fontSize : 12,
  marginTop : 38
 },

  rider : {
    alignItems : "center",
  },
  
  riders : {
    flexDirection : "row",
    marginLeft : 10,
    marginTop : 10
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

  img1 : {
    borderRadius : 50,
    width : 80,
    height : 80,
    //position : "absolute",
    borderWidth : 1,
    borderColor : "orange"
  },
  text : {
    alignSelf : "center",
    marginLeft : 10,
    fontWeight : "bold",
    fontSize : 15,
    marginTop : 2
  },

  cancel: {
    justifyContent : "center",
    //marginLeft : 10,
    backgroundColor: '#00ace6',
    marginBottom : 90,
    borderRadius: 5,
    borderWidth : 1, 
    borderColor : "#00ace6",
    height: 45,
    width : "95%",
    alignSelf : 'center',
    marginTop : 10,
    
  },
  call: {
    justifyContent : "center",
    marginRight  : 10,
    backgroundColor: '#00ace6',
    marginBottom : 90,
    borderRadius: 5,
    borderWidth : 1, 
    borderColor : "#00ace6",
    height: 45,
    width : "40%",
    alignSelf : 'flex-end',
    marginTop : 10,
    
  },

  button: {
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
});

export default connect(mapStateToProps, mapDispatchToProps)(CMap);












































