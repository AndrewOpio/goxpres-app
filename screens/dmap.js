  import React, { Component } from 'react';
  import { Platform, StyleSheet, Text, View, FlatList, ActivityIndicator } from 'react-native';
  import MapView, {PROVIDER_GOOGLE, MapMarker} from 'react-native-maps';
  import MapViewDirections from 'react-native-maps-directions';
  import AsyncStorage from '@react-native-community/async-storage';
  import {Actions} from 'react-native-router-flux';
  import BottomDrawer from "rn-bottom-drawer";
  import {Button} from 'native-base';

  class DMap extends React.Component {
    constructor(props){
      super(props);
      this.state = {
        loading : false,
        riders : [],
        selected: [], 
      };
    }


   //Getting shortest distance between two coordinates on the map.
   getDistance = () => {
     var distance = [];
     var i = 0;
     this.state.hospitals.map((hospital)=>{
      var pdis = getPreciseDistance(
      { latitude: this.state.latitude, longitude: this.state.longitude},
      { latitude: hospital.lat, longitude: hospital.lng }
     );
      distance[i] = pdis;
      i++;
    })
      
     var min = Math.min(...distance);

       this.state.hospitals.map((hospital)=>{
        var pdis = getPreciseDistance(
        { latitude: this.state.latitude, longitude: this.state.longitude},
        { latitude: hospital.lat, longitude: hospital.lng }
      );
        if(pdis == min){
          nearlat = hospital.lat;
          nearlng = hospital.lng;
        }
        i++;
      })
    }

 

    UNSAFE_componentWillMount() {
       AsyncStorage.getItem("email", (err, res) => {
       if (res){
          this.setState({email : res});
        }})
      this.fetch();
    }



    fetch = () =>{  
    this.setState({loading : true});   
     AsyncStorage.getItem("location", (err, res) => {
      if (res){ 
      id = "hospitals";
      fetch('https://agencyforadolescents.org/RetinahBackend/RetinahBackend/help.php',
      {
        method : 'post',
        header : {
          'Accept' : 'application/json',
          'Content-type' : 'application/json'
        },
        body:JSON.stringify({
            location : res,
            id : id
          })
        })

      .then((response) => response.json())
      .then((responseJson) => {
       //alert(responseJson);
        if(responseJson == "System Error"){
          this.setState({loading : false});   
        }else{
          this.setState({riders : responseJson, loading : false});
          //alert(this.state.hospitals);
          }    
        })
      .catch((error) => {
       //alert("error");
          this.setState({loading : false});   
        }) 
       }
     })
   }

    componentDidMount(){
      
    }

    //Displaying markers on the map from the database
    markers = () => {
      return(
       this.state.riders.map((rider)=>{
        return (
         <MapView.Marker 
          coordinate = {{
            latitude : parseFloat(rider.lat),
            longitude : parseFloat(rider.lng),
          }}
          title = {hospital.name}
          description = {"Chat with"+" "+hospital.name}
          onCalloutPress = {() => Actions.inbox({title : hospital.name, sender : this.state.email, receiver : hospital.email})}
          >
            <MapView.Callout>
              <Text>{hospital.name}</Text>
              <Text>{"Chat with"+" "+hospital.name}</Text>
            </MapView.Callout>
          </MapView.Marker>
          )
        }
      )    
    );
  }

    renderContent = () =>{
      return(
        <View>            
          <Text>Rides available</Text>
          {this.props.quantity == 1 ?
            <View style = {style.rider}>
              <Image source = {require('../Resources/go.jpg')} style = {styles.img}/>
              <Text>{this.state.selected[0].id}</Text>
              <Text>{this.state.selected[0].name}</Text>
              <Text>{this.state.selected[0].rating}</Text>
              <Button block style = {styles.cancel}   onPress={() => this.continue()}>
                <Text style ={styles.btntxt}>Cancel</Text> 
              </Button>
            </View> 
          :
          this.state.selected.map((rider) => 
            <View style = {styles.riders}>
              <Image source = {require('../Resources/go.jpg')}/>
              <View style = {styles.details}>
                <Text>{rider.id}</Text>
                <Text>{rider.name}</Text>
              </View>
            </View>
          )}
          </View>
      );
    }


    render() {
     //0.3362
     //32.5723
     this.getDistance();
      const pinColor = 'indigo';
      //alert(nearlat);
      return (
        this.state.loading == true ? <ActivityIndicator color = "#ff33cc" size = "large" style = {{marginTop : "50%"}}/>:
        <View style = {styles.container} >
         {this.state.latitude ?
          <MapView
              style = {styles.map}
              provider = {PROVIDER_GOOGLE}
              initialRegion ={{
                latitude : this.state.latitude,
                longitude : this.state.longitude,
                latitudeDelta : 0.0922,
                longitudeDelta : 0.0421,                
              }}             
            >
            <MapViewDirections
              origin={{latitude :this.state.latitude, longitude: this.state.longitude}}
              destination={{latitude : this.props.lat ? this.props.lat : nearlat, longitude: this.props.lng ? this.props.lng : nearlng}}
              strokeWidth={4}
              strokeColor ="hotpink"
              apikey={'AIzaSyB753snaAQ0ku3ufna7qSj4FxKp0XdVO24'}
            />
              <MapView.Marker
                coordinate ={{latitude: this.state.latitude , longitude: this.state.longitude}}
                title = {"Your location"}
                pinColor = {pinColor}
                >                                                    
              </MapView.Marker> 

              {this.props.lat ? <MapView.Marker
                coordinate ={{latitude: parseFloat(this.props.lat) , longitude: parseFloat(this.props.lng)}}
                title = {"sender location"}
                >                                                    
              </MapView.Marker>: <View></View>} 
              {!this.props.lat ? this.markers() : <View></View>}                     
          </MapView> : <View></View>}
          <BottomDrawer 
            containHeight = {100}
            offset ={TAB_BAR_HEIGHT}
          >
              {this.renderContent()}
          </BottomDrawer>
        </View>
      );
    }
  }

const styles = StyleSheet.create({
 container : {
   position : 'absolute',
   top : 0,
   left : 0,
   bottom : 0,
   right : 0, 
   justifyContent : 'flex-end',
   alignItems : 'center'
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
 
  rider : {
    alignItems : "center",
  },
  
  riders : {
    flexDirection : "row",
  },

  img : {
    borderRadius : 20,
    width : 50,
    height : 50
  }
});

export default DMap;












































