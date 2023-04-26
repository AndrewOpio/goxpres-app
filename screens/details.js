import  React, { Component } from "react";
import {
    Text,
    View,
    ScrollView,
    FlatList,
    Picker,
    TextInput,
    StyleSheet,
    TouchableHighlight,
    TouchableOpacity,
    ActivityIndicator,
    Image,
    Modal,
    Alert,
    KeyboardAvoidingView,
    BackHandler,
    AsyncStorage
} from "react-native";
import {Button} from 'native-base';
import Heading from '../components/heading';
import Icon from "react-native-vector-icons/FontAwesome";
import MapView, {PROVIDER_GOOGLE, MapMarker} from 'react-native-maps';
import {Actions} from "react-native-router-flux";
import MapViewDirections from 'react-native-maps-directions';
import {connect} from 'react-redux';
import DatePicker from 'react-native-datepicker';

class Details extends Component {
  constructor(props){
      super(props);
      this.state = {
          loading : false,
          quantity : 1,
          modalVisible : false,
          disabled : false,
          pickup : "",
          dropoff : "",
          size : "",
          status : "",
          pcontact : "",
          dcontact : "",
          date : "",
          mode : "",
          when : "",
          means : this.props.id,
          commission : 0,
          contact : "",
      };
  }

  componentWillMount(){                             

    AsyncStorage.getItem("contact", (err, res) => {
      if (res){    
        this.setState({contact : res});
      }
    })


    this.Commission();
    this.Size();
    BackHandler.addEventListener('hardwareBackPress', this.Back);
  }


  componentWillUnmount(){
    BackHandler.removeEventListener('hardwareBackPress', this.Back);
  }

  Back = () =>{
    Actions.pop();
    return true;
  }

  //calculating Commission
  Commission = () =>{
    if(this.props.points.id == "motorcycle"){
      var commission = 0.2*this.props.points.cost;
      this.setState({commission : commission});
    }else{
      var commission = 0.1*this.props.points.cost;
      this.setState({commission : commission});
    }
  }


  //Incrementing quantity of means of transport
  Increase = () =>{
    var num = this.state.quantity+1;
    this.setState({quantity : num});
  }


  //Decreasing quantity of mans of transport ordered
  Decrease = () =>{
    if(this.state.quantity > 1){
      var num = this.state.quantity-1;
      this.setState({quantity : num});
    }
  }


  //Operations on modal
  setModalVisible(visible) {
    if(visible == false){
      this.setState({section : "", modalVisible: visible});
    }else{
      this.setState({modalVisible: visible});
    }
  }
    
  //Checking quantity selected for the number of rides
  inputCheck = () =>{

    this.setState({
      disabled: true,
    });
    
    // enable after 5 second
    setTimeout(()=>{
       this.setState({
        disabled: false,
      });
    }, 3000)

    if(this.state.pickup != "" && this.state.dropoff != "" && this.state.size != "" &&
      this.state.pcontact != "" && this.state.dcontact != "" && this.state.status != ""
    ){
        if((this.state.status == "schedule" && this.state.date != "") || this.state.status == "immediate"){
          Actions.cmap({quantity : this.state.quantity, commission  : Math.round(this.state.commission),
            pickup_more : this.state.pickup, dropoff_more : this.state.dropoff,
            size : this.state.size, pcontact : this.state.pcontact,
            dcontact : this.state.dcontact, status : this.state.status, date : this.state.date});
        }else{
          Alert.alert(
            "Incomplete",
            "Please fill in all details"
          );
        }
      }else{
      Alert.alert(
        "Incomplete",
        "Please fill in all details"
      );
    }
  }


  //Setting the size
  Size = () =>{
    this.props.points.id == "motorcycle"?
    this.setState({size : "Weight range 0-15kgs"})
    :
    this.props.points.id == "small_pickup"?
    this.setState({size : "Weight range 50-250kgs"})
    :
    this.setState({size : "Weight range 250-3000kgs"})
  }
  
  //Setting status
  Status = (s) =>{
    if(s != "S"){
      this.setState({status : s});
    }
  }

  //Select when to pay
  When = (w) =>{
    if(w != "W"){
      this.setState({when : w});
    }
  }
  
  //Setting payment mode
  Mode = (m) =>{
    if(m != "M"){
      this.setState({mode : m});
    }
  }

  //Setting date
  setDate = (date) =>{
    alert(date);
    this.setState({date : date});
  }

    
  render(){
    //alert(this.props.id);
    var date = new Date();
    var dRef = date.getFullYear()+"-"+date.getMonth()+"-"+date.getDay(); 
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

    return(
      <View style = {styles.main}>
        <Heading screen = {""} title = "Details"/>
        <View style = {{height : "90%"}}>
          <View style = {styles.container}>
            <MapView
                style = {styles.map}
                provider = {PROVIDER_GOOGLE}
                mapType = "standard"
                customMapStyle = {mapStyle}
                initialRegion ={{           
                  latitude : this.props.points.plat,
                  longitude : this.props.points.plng,
                  latitudeDelta: 0,
                  longitudeDelta: 0.003,
                }}             
              >
              <MapViewDirections
                origin={{latitude : this.props.points.plat, longitude: this.props.points.plng}}
                destination={{latitude : this.props.points.dlat , longitude: this.props.points.dlng}}
                strokeWidth={4}
                strokeColor ="#3399ff"
                apikey={'AIzaSyCtP83M_as6WCFor-AYOqX_2RawYqxThMg'}
                optimizeWaypoints = {true}
                timePrecision ="now"
                mode = "DRIVING"
              />
              
              
              <MapView.Marker
                coordinate ={{latitude: this.props.points.plat , longitude: this.props.points.plng}}
                title = {"Pick-up Point - "+ this.props.points.pickup}
                //pinColor = {pinColor}
                >                                                    
              </MapView.Marker>

              <MapView.Marker
                coordinate ={{latitude: this.props.points.dlat , longitude: this.props.points.dlng}}
                title = {"Drop-off Point - "+ this.props.points.dropoff}
                pinColor = {"#3399ff"}
                >                                                    
              </MapView.Marker>
          </MapView> 
          </View> 
          <View style= {styles.info}> 
            <View style = {{height : "90%",}}>              
              <TouchableOpacity style = {styles.card} onPress = {() => {
                  this.setState({section : "details"})
                  this.setModalVisible(true);
                }}>
                  <View style = {styles.row}>
                    <Text style = {styles.head}>Details</Text>
                    <View style = {{flex : 1, marginTop : -9, justifyContent : "center"}}>
                      { this.state.section == "details" ? <ActivityIndicator color = "#3399ff" style = {{marginRight : 8, color : "#3399ff",alignSelf : "flex-end"}}/> :
                      <Icon name = "chevron-right" size = {18}  style = {{color : "#3399ff", marginRight : 8, alignSelf : "flex-end"}}/>}                      
                    </View>
                  </View>
              </TouchableOpacity>

            
              {/*<View style = {styles.card}>
                  <View style = {styles.row}>
                    <Text numberOfLines = {1} style = {styles.head}>Quantity ({this.props.means})</Text>
                    <View style = {{marginRight : 10, flex : 1, marginTop : -10, alignItems : "flex-end"}}>
                      <View style= {{flexDirection : "row"}}>
                        <Button onPress = {() => {this.Decrease()}} style = {{padding : 12, height : "100%", borderWidth : 1, borderColor : "#3399ff", backgroundColor : "white"}}>
                          <Icon name = "minus" size = {15} style = {{color : "#3399ff", }}/>
                        </Button>
                        <Text style = {{fontSize : 20, paddingLeft : 8, paddingRight : 8}}>{this.state.quantity}</Text>
                        <Button onPress = {() => {this.Increase()}} style = {{padding : 12, height : "100%", borderWidth : 1, borderColor : "#3399ff", backgroundColor : "white"}}>
                          <Icon name = "plus" size = {15} style = {{ color : "#3399ff",}}/>
                        </Button>
                      </View>
                    </View>
                  </View>               
              </View>*/}
            

              <View style = {styles.card}>
                <View style = {{flexDirection : "row"}}>
                    <Text style = {{ marginLeft : 10, fontSize : 15}}>Amount to pay</Text>
                    <View style = {{flex : 1, justifyContent : "center"}}>
                      <Text  style = {{marginRight : 8, alignSelf : "flex-end"}}>UGX <Text style = {{color : "black"}}>{this.state.quantity * this.props.points.cost}</Text></Text>
                    </View>
                </View>                
              </View>
              <Button block disabled={this.state.disabled} style = {styles.continueButton}  onPress={() => this.inputCheck()}>
                  {this.state.loading == false ? <Text style ={{marginTop : "0%",  alignSelf : "center", color : "white"}}>Place your order</Text> :
                  <ActivityIndicator color = "white"/>}
              </Button>

              <Modal
                animationType={'slide'}
                transparent={true}
                onRequestClose={() => this.setModalVisible(false)}
                visible={this.state.modalVisible}>

                <View  style={styles.popupOverlay}>
                <View style={styles.popup}>
                    <View style= {{borderTopRightRadius : 7, borderTopLeftRadius : 7, backgroundColor : "#3399ff", borderTopRadius : 20}}>
                      <Text style = {{padding : 5,  alignSelf : "center", fontSize : 16, color : "white"}}>{this.state.section == "details" ? "Delivery Details" : "Method of payment"}</Text>
                    </View>
                    <View style = {styles.separator}/>
                  <ScrollView style={styles.popupContent} keyboardShouldPersistTaps = {'handled'}>
                    <View style={styles.modalInfo} showsVerticalScrollIndicator = {false}> 
                      <View>                              
                        <TextInput placeholder="Specific pickup location..." placeholderColor="#c4c3cb" style={styles.input} value = {this.state.pickup} onChangeText = {(text) => this.setState({pickup : text})}/>            
                        <TextInput placeholder="Specific dropoff location..." placeholderColor="#c4c3cb" style={styles.input1} value = {this.state.dropoff} onChangeText = {(text) => this.setState({dropoff : text})}/>            
                        <TextInput placeholder="Pick-up contact" keyboardType="number-pad"  placeholderColor="#c4c3cb" style={styles.input1} value = {this.state.pcontact} onChangeText = {(text) => this.setState({pcontact : text})}/>            
                        <TextInput placeholder="Drop-off contact" keyboardType="number-pad" placeholderColor="#c4c3cb" style={styles.input1} value = {this.state.dcontact} onChangeText = {(text) => this.setState({dcontact : text})}/>            
                        
                        {/*<View style={styles.input1}>
                          <Picker selectedValue = {this.state.mode}
                            onValueChange={this.Mode}
                            mode = 'dropdown'
                          >
                            <Picker.Item label = "Mode of payment" value = "M" color = "#c4c3cb"/>
                            <Picker.Item label = "Cash" value = "cash"/>
                            <Picker.Item label = "Credit Card" value = "ccard"/>
                            <Picker.Item label = "Mobile Money" value = "mmoney"/>
                          </Picker>
                       </View>

                       {this.state.mode == "mmoney" ?  
                        <View style = {{flexDirection : "row", alignSelf : "center",}}>                              
                          <TextInput placeholder="Contact.." placeholderColor="#c4c3cb" style={styles.input2} value = {this.state.contact}/>            
                          <TextInput placeholder="Enter pin.." placeholderColor="#c4c3cb" style={styles.input3} value = {this.state.dropoff} onChangeText = {(text) => this.setState({dropoff : text})}/>            
                        </View>
                       : 
                         <View></View>
                       }

                       {this.state.mode == "ccard" ?  
                        <View>
                          <TextInput placeholder="Card Number..." placeholderColor="#c4c3cb" style={styles.input1} value = {this.state.dropoff} onChangeText = {(text) => this.setState({dropoff : text})}/>            
                          <View style = {{flexDirection : "row", alignSelf : "center",}}>                              
                            <TextInput placeholder="Exp date" placeholderColor="#c4c3cb" style={styles.input2} value = {this.state.contact}/>            
                            <TextInput placeholder="CVC" placeholderColor="#c4c3cb" style={styles.input3} value = {this.state.dropoff} onChangeText = {(text) => this.setState({dropoff : text})}/>            
                          </View>
                        </View>
                       :
                        <View></View>
                      } */}

                        {/*<View style={styles.input1}>
                          <Picker selectedValue = {this.state.when}
                            onValueChange={this.When}
                            mode = 'dropdown'
                          >
                            <Picker.Item label = "When to pay" value = "W" color = "#c4c3cb"/>
                            <Picker.Item label = "Before delivery" value = "before"/>
                            <Picker.Item label = "After delivery" value = "after"/>
                          </Picker>
                        </View>*/}

                        <View style={styles.input1}>
                          <Picker selectedValue = {this.state.status}
                            onValueChange={this.Status}
                            mode = 'dropdown'
                          >
                            <Picker.Item label = "Status" value = "S" color = "#c4c3cb"/>
                            <Picker.Item label = "Schedule" value = "schedule"/>
                            <Picker.Item label = "Immediate" value = "immediate"/>
                          </Picker>
                        </View>

                        { this.state.status == "schedule" ?
                            <DatePicker
                              style={styles.date}
                              date={this.state.date}
                              mode="date"
                              placeholder="select date"
                              format="YYYY-MM-DD"
                              //minDate="2016-05-01"
                              //maxDate="2016-06-01"
                              confirmBtnText="Confirm"
                              cancelBtnText="Cancel"
                              customStyles={{
                                dateIcon: {
                                  position: 'absolute',
                                  left: 0,
                                  top: 4,
                                  marginLeft: 0
                                },
                                dateInput: {
                                  marginLeft: 36
                                }
                                // ... You can check the source to find the other keys.
                              }}
                              onDateChange={(date) => {this.setState({date: date})}}
                          />
                        : <View></View>}

                        {
                        this.props.points.id == "motorcycle"?
                            <TextInput editable={false} placeholder="" placeholderColor="#c4c3cb" style={styles.input1} value = "Weight 0-15kgs (not editable)" />            
                        :this.props.points.id == "small_pickup"?
                            <TextInput editable={false} placeholder="" placeholderColor="#c4c3cb" style={styles.input1} value = "Weight 50-250kgs (not editable)" />            
                        :
                            <TextInput editable={false} placeholder="" placeholderColor="#c4c3cb" style={styles.input1} value = "Weight 250-3000kgs (not editable)" />            
                        }
                        <Button block style = {styles.saveButton} onPress = {() => {this.setModalVisible(false)}}>
                            <Text style ={styles.btntxt}>Save</Text>
                        </Button>
                      </View>                     
                    </View>                      
                  </ScrollView>  
                </View>
              </View>
            </Modal>
            </View>
          </View>             
        </View>     
      </View>
    );
  }
}

const mapStateToProps = (state) =>{
  const {points} = state;
  return { points }
}

const styles = StyleSheet.create({
  input : {
    backgroundColor : "#e2e2e2",
    borderRadius : 0,
    paddingLeft : 10
  },

  input1 : {
    backgroundColor : "#e2e2e2",
    borderRadius : 0,
    paddingLeft : 10,
    marginTop : 10
  },

  input2 : {
    backgroundColor : "#e2e2e2",
    borderRadius : 0,
    paddingLeft : 10,
    paddingRight : 10,
    marginTop : 10,
    width : "50%",
    marginRight : 10,
  },

  input3 : {
    backgroundColor : "#e2e2e2",
    borderRadius : 0,
    paddingLeft : 10,
    paddingRight : 10,
    width : "50%",
    marginTop : 10
  },

  date : {
    width : "100%",
    backgroundColor : "#e2e2e2",
    borderRadius : 0,
    paddingLeft : 10,
    marginTop : 10,
    height : 53,
    alignSelf: "center",
    paddingLeft : 50,
    justifyContent : "center"

  },

  container : {
    //height : 290,
    height : "70%", 
    justifyContent : 'flex-end',
    alignItems : 'center'
  },
  
  map : {
    flex : 1,
    width : "100%",
    //position : 'absolute',
    //top : 0,
    //left : 0,
    //bottom : 0,
    //right : 0, 
  },
  
  main : {
    backgroundColor:"#e2e2e2",
    height : "100%"
  },

  info : {
   marginTop : 0,
   height : "30%", 
   //position : 'absolute',
   //backgroundColor : "#000000",
   paddingBottom : 15,
  },
  
  row : {
   flexDirection : "row"
  },

  btntxt : {
    marginTop : "0%",
    alignSelf : "center",
    color : "white"
  },

  head : {
    marginLeft : 10,
    fontSize : 15,
    //color : "#3399ff",
   // width : "58%"
   marginTop : -10
  },

  separator : {
    height : 1.5,
    width : "100%",
    backgroundColor : "#e2e2e2",
    marginLeft : 0,
    marginRight : 5,
    marginTop : 2,
  },

  quantity : {
    height : 35,
    width : 35,
    backgroundColor : "#fff",
    borderWidth : 1,
    borderColor : "#3399ff",
    alignItems : "center",
  },
   card:{
    shadowColor: '#474747',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
    alignSelf : 'center',
    elevation: 5,
    backgroundColor:"#fff",
    width:"95%",
    height : "30%", 
    borderRadius:5,
    justifyContent:'center',
    marginLeft : 20,
    marginRight : 20,
    marginTop : 15,
    //flexDirection : "row"
  },
  continueButton: {
    justifyContent : "center",
    backgroundColor: '#3399ff',
    marginBottom : 10,
    borderRadius: 5,
    borderWidth : 0.5, 
    //borderColor : "black",
    height : "30%", 
    width : "95%",
    alignSelf : 'center',
    marginTop : 15,
  },

  saveButton: {
    justifyContent : "center",
    backgroundColor: '#3399ff',
    marginBottom : 0,
    borderRadius: 5,
    borderWidth : 0.5, 
    //borderColor : "black",
    height: 45,
    width : "100%",
    alignSelf : 'center',
    marginTop : 20,
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
    marginTop: "10%",
    marginHorizontal: 20,
    borderRadius: 7,
  },
  popupOverlay: {
    backgroundColor: "#00000057",
    flex: 1,
    marginTop: 0,
    position : "relative"
  },
  popupContent: {
    //position : "absolute"
    //alignItems: 'center',
    margin: 5,
    //height : "85%",
    marginBottom: 20
  },
  popupHeader: {
    marginBottom: 45
  },
  popupButtons: {
    marginTop: 0,
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: "#eee",
    justifyContent:'center',
  },
  popupButton: {
    flex: 1,
    marginVertical: 16
  },
  btnClose:{
    width:"100%",
    backgroundColor:'#3399ff',
    paddingLeft :30,
    paddingRight : 30,
    paddingTop : 10,
    paddingBottom : 10,
    borderRadius : 5,
    marginBottom : 5,
    marginTop : 10,
    alignSelf : "center",
    alignItems : "center"

  },
  modalInfo:{
    //alignItems:'center',
    height : "100%",
    //justifyContent:'center',
  }
});
export default connect(mapStateToProps)(Details)