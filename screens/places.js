import {AsyncStorage, ScrollView, StyleSheet, View, Text, FlatList, TextInput, Picker, Image, TouchableOpacity, ActivityIndicator} from 'react-native';
import React, {Component} from 'react';
import {Button} from 'native-base';
import {Actions} from 'react-native-router-flux';
import Icon from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';
import {connect} from 'react-redux';
import PlacesInput from '../components/input';
import {addPickup, addDropoff} from  '../Actions/actions';

class Places extends Component {
  constructor(props){
    super(props);
    
    this.state = {
      loading : false,
      contact : "",
      pickup : "",
      plat : 0,
      plng : 0,
      dropoff : "",
      dlat : 0,
      dlng : 0,

      dropoff : [],
      input : this.props.field,
    }
  }

   
  
  //Retrieve trip details
  Place = (name, lat, lng) =>{
    if(this.state.input == "pickup"){
      this.setState({pickup : name, plat : lat, plng : lng});
      this.props.addPickup(name, lat, lng)

      Actions.deliveryhome();

    }else if(this.state.input == "dropoff"){
      this.setState({dropoff : name, dlat : lat, dlng : lng});
      this.props.addDropoff(name, lat, lng)

      Actions.deliveryhome();

      /*var place = [{
        name : name,
        lat : lat,
        lng : lng
      }];

      var places = this.state.dropoff.concat(place);
      this.setState({dropoff : places});*/
    }
  }
    

    
  render() {
    return (
      <View style={{backgroundColor:'#e2e2e2', height : "100%", width : "100%"}}>

        <PlacesInput
          placeHolder = {this.props.holder}
          //searchRadius = {50000}
          searchLatitude = {1.3733}
          searchLongitude = {32.2903}
          queryCountries = {['ug']}
          //stylesContainer = {styles.container}
          stylesInput = {styles.input}
          stylesList = {styles.list}
          stylesItem = {styles.item}
          stylesItemText = {styles.txt}
          stylesLoading = {{color : "blue"}}
          googleApiKey = {'AIzaSyCtP83M_as6WCFor-AYOqX_2RawYqxThMg'}
          onSelect = {place => {
            this.setState({place});
          }}
          place = {this.Place}
          iconResult = {<Icon name = "map-marker" size = {20} style = {{color : "red", alignSelf : "flex-end"}}/>}
          iconInput = {<Icon name = "map-marker" size = {20} style = {{color : "red"}}/>}
        />

        {/*{this.state.pickup != "" ?   
        <View style={styles.names}>
          <Text style={styles.name}><Icon name = "map-marker" size = {16} color = {"red"}/><View style = {{width : 8}}/>{this.state.pickup}</Text>
          <View style = {{alignSelf : "center", width : "95%", backgroundColor : "#bfbfbf", height : 1, marginTop  : 5}}></View>
        </View> : <View></View> }

        <FlatList 
          style={styles.names}
          columnWrapperStyle={styles.listContainer}
          data={this.state.dropoff}
          keyExtractor= {(item) => {
            return item.id;
          }}
          renderItem={({item}) => {
          return (
              <View style={styles.cardContent}>
                <Text style={styles.name}><Icon name = "map-marker" size = {16} color = {"red"}/><View style = {{width : 8}}/>{item.name}</Text>
                <View style = {{alignSelf : "center", width : "95%", backgroundColor : "#bfbfbf", height : 1, marginTop  : 5}}></View>
              </View>
          )}}/>

            <Button block style = {styles.nxt}  onPress={this.Save}>
              <Text style ={styles.btntxt}>Next</Text> 
          </Button>*/}
      </View>
    );
  }    
}


const mapStateToProps = (state) =>{
  const {points} = state;
  return { points }
}


const mapDispatchToProps = (dispatch) => ({
  addPickup : (name, lat, lng) => dispatch(addPickup(name, lat, lng)),
  addDropoff : (name, lat, lng) => dispatch(addDropoff(name, lat, lng)),
});

const styles= StyleSheet.create({
  item  :{
    flexDirection : "row"
  },

  txt : {
    width : "90%"
  },

  btntxt : {
    color : "white"
  },

  names : {
    marginTop : 70,
  },
  name : {
   marginTop : 14,
   marginLeft : 10
  },

  container : {
    position : "relative",
    alignSelf : "stretch",
    margin : 0,
    top : 0,
    left : 0,
    right : 0,
    bottom : 0,
    shadowOpacity : 0,
    borderColor : "#dedede",
    borderWidth : 1,
    marginBottom : 10, 
  },

  nxt: {
    justifyContent : "center",
    backgroundColor: '#3399ff',
    marginBottom : 10,
    borderRadius: 5,
    borderWidth : 0.5, 
    borderColor : "black",
    height: 45,
    width : "95%",
    alignSelf : 'center',
    //marginTop : "170%",
    
  },
  list : {
    shadowColor: '#fff',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
    //elevation: 5,
    backgroundColor:"#fff",
    width: "95%",
    //position : "absolute",
    // borderRadius:5,
    alignSelf : 'center',
  },

  input : {
    shadowColor: '#fff',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
   // elevation: 5,
    backgroundColor:"#fff",
    width : "75%",
   // borderRadius:5,
    alignSelf : 'center',
  },
  
  back : {
    shadowColor: '#fff',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
    elevation: 5,
    backgroundColor:"#000",
    width : 40,
    height : 40,
    borderRadius:5,
    alignItems : 'center',
    justifyContent : "center",
    position : "absolute"
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(Places);