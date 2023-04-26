import  React, { Component } from "react";
import {
    Text,
    View,
    ScrollView,
    FlatList,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    TouchableHighlight,
    Image,
    Modal,
    Alert,
    BackHandler,
    AsyncStorage,
    RefreshControl
} from "react-native";
import Heading from '../components/heading';
import {Actions} from 'react-native-router-flux';
import {Button} from 'native-base';
import Icon from "react-native-vector-icons/FontAwesome";
import {connect} from 'react-redux';
import {addDetails, connStatus} from  '../Actions/actions';
import {base_url, server} from '../components/links';
import Float from '../components/message';
import {getPreciseDistance } from 'geolib';
import axios from 'axios';
import io from 'socket.io-client';
import RNAndroidLocationEnabler from 'react-native-android-location-enabler';

class DeliveryHome extends Component{
  constructor(props){
    super(props);
    this.state = {
      categories: [
          {id:1, title: "Motorcycle", name : "motorcycle", icon :require("../Resources/mb.png")},
          {id:2, title: "Small Pickup", name : "small_pickup",icon :require("../Resources/small.png")},
          {id:3, title: "Medium Lorry", name : "medium_lorry", icon :require("../Resources/medium.png")} ,
          //{id:4, title: "Large Lorries", icon :require("../Resources/trailor.png")} ,
          //{id:5, title: "Bicycle", icon :require("../Resources/bike.png")} ,
          //{id:6, title: "Car", icon :require("../Resources/bike.png")} ,
        ],
      selected : "",
      loading : false,
      refreshing : false,
      tloading : false,
      track : false,
      disabled : false,
      prices : [],
      modalVisible : false,
      contact : "",
      code : "",
    }
  }


  
  componentWillMount(){
    this.Prices();
    this.Enable();

    AsyncStorage.getItem("status", (err, res) => {
      if (res){    
        this.setState({modalVisible : true});
      }
    })

    AsyncStorage.removeItem('status');

    BackHandler.addEventListener('hardwareBackPress', this.Back);

    this.socket = io(server);

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



  componentWillUnmount(){
    BackHandler.removeEventListener('hardwareBackPress', this.Back);
  }


  //Exit app when phone back TouchableOpacity is pressed
  Back = () =>{
    if(Actions.currentScene == "_deliveryhome"){
      BackHandler.exitApp();    
    }else{
      //alert(Actions.currentScene);
    }
    return true;
  }


  setModalVisible(visible) {
    if(visible == false){
      this.setState({section : "", modalVisible: visible});
    }else{
      this.setState({modalVisible: visible});
    }
  }
    

  clickEventListener = (name) =>{

    if(name == "motorcycle"){
      if(name == this.state.selected){
        this.setState({selected : ""});
      }else{
        this.setState({selected : name});
      }
    } else {
      Alert.alert(
        "Not available",
        "Coming Soon.."
      );
    }
  }
  

  //Next screen
  continue = () =>{
    //Actions.cmap();

    this.setState({
      disabled: true,
    });
    
    // enable after 5 second
    setTimeout(()=>{ 
       this.setState({
        disabled: false,
      });
    }, 3000)

    if(this.state.selected == "" || this.props.points.plat == 0 || this.props.points.dlat == 0){
       Alert.alert(
         "Invalid submission",
         "Please enter all required information"
       );
    }else{

      var pdis = getPreciseDistance(
        { latitude: this.props.points.plat, longitude: this.props.points.plng},
        { latitude: this.props.points.dlat, longitude: this.props.points.dlng }
      );

      var distance = pdis/1000;

      if(this.state.selected == "motorcycle"){
        if(distance <= 3){
          var price = parseInt(this.state.prices.boda.ot3km);

        } else if(distance > 3 && distance <=5) {
          var price = parseInt(this.state.prices.boda.tt5km);

        }else if(distance > 5){
          var price = ((distance-5)*parseInt(this.state.prices.boda.gt5km)) + parseInt(this.state.prices.boda.tt5km);
        }

      }else if(this.state.selected == "small_pickup"){
        if(distance <= 3){
          var price = parseInt(this.state.prices.small.ot3km);
          mode
        }else if(distance > 3 && distance <=5){
          var price = parseInt(this.state.prices.small.tt5km);

        }else if(distance > 5){
          var price = ((distance-5)*parseInt(this.state.prices.small.gt5km)) + parseInt(this.state.prices.small.tt5km);
        }

      }else if(this.state.selected == "medium_lorry"){
        if(distance <= 3){
          var price = parseInt(this.state.prices.medium.ot3km);

        }else if(distance > 3 && distance <=5){
          var price = parseInt(this.state.prices.medium.tt5km);

        }else if(distance > 5){
          var price = ((distance-5)*parseInt(this.state.prices.medium.gt5km)) + parseInt(this.state.prices.medium.tt5km);
        }
      }

      //var price = 3000;

      this.props.addDetails(this.state.selected, Math.round(price), distance);
      Actions.details();
   }
  }


  //tracking a rider
  codeTracking = () =>{
    var self = this;
    if(this.state.contact != "" || this.state.code != "" ){

      self.setState({tloading : true});

      axios.post(base_url + 'tracking.php', {
        contact : this.state.contact,
        code : this.state.code,
      })
      .then((response) => {
        //console.log(response.data);
        if(response.data == "Error"){
          alert("Wrong contact or code")
          self.setState({tloading : false});
        }else{
          self.setState({tloading : false});
          this.setModalVisible(false);
          Actions.cmap({tracking : true, code : this.state.code, contact : response.data.CContact, quantity : 1,
          began : response.data.TStatus == "started" ? true : false, confirmed : false, ended : response.data.TStatus != "started" ? true : false });
        }
      })
      .catch(function (error){
        //hanadle error
        //alert(error.message);
        self.setState({tloading : false});
      })

    }else{
      Alert.alert(
        "Incomplete",
        "Please fill in all fields"
      );
    }
  } 


  //getting prices
  Prices = () =>{
    var self = this;

    self.setState({loading : true});

    axios.post(base_url + 'prices.php', {
      contact : this.state.contact,
    })
    .then((response) => {
      //console.log(response.data);
      if(response.data == "Error"){
        alert("An error occured")
        self.setState({loading : false});
      }else{
        self.setState({prices : response.data, loading : false});
      }
    })
    .catch(function (error){
      //handle error
      //alert(error.message);
      self.setState({loading : false});
    })
  } 
  

  //opening popup
  openModal = () =>{
    this.setState({track : true});
    this.setModalVisible(true);
  }

  
  Test = () =>{
    var self = this;
    this.socket.emit('test', {title : "test"}, function(response){
      self.props.connStatus("true");
      console.log(response);
    });
    

    if(self.props.points.connection == "false"){
      this.socket.emit('test', {title : "test"});  
      
    }else{
      self.props.connStatus("false");
    }


    this.socket.on("test", (msg, callback) =>{
      callback("server");
    }); 
  }


  
  render(){
    return(
      <View style = {{backgroundColor : "#3399ff", height : "100%"}}>
        <Heading screen = {"home"} title = "Home" openModal = {this.openModal}/>
        <Modal
          animationType={'fade'}
          transparent={true}
          onRequestClose={() => this.setModalVisible(false)}
          visible={this.state.modalVisible}>

          <View style={styles.popupOverlay}>
            <View style={ {
              backgroundColor: 'white',
              marginTop: this.state.track == false ? "10%" : "45%",
              marginHorizontal: 45,
              borderRadius: 7,
            }}>

              {this.state.track == true ? 
              <TouchableHighlight style = {{borderRadius: 7, width : 30}} underlayColor = "#fff" onPress = {() => {this.setModalVisible(false)}}>
                  <Image  style = {{marginLeft : 10, marginTop : 10, height : 18, width : 18, alignSelf : "center"}} source = {require('../Resources/cancel.png')}/>        
              </TouchableHighlight> : <View></View>}

              <View style={{
                //marginTop: 5,
                marginLeft : 5,
                marginRight: 5,
                height:this.state.track == false ? "80%" : 200,
                //width : "95%",
                justifyContent : 'center'
              }}>
                {this.state.track == false ? 
                  <View style = {styles.wview}>
                    <Text style = {{ marginTop : "40%", fontSize : 20, fontWeight : "bold", marginBottom : 5}}>Welcome</Text>
                    <Text style = {styles.wtext}>Welcome to GoXpres, the only legitimate and secure logistics service in the region. Book your preferred means of delivery ranging from motorcycles to trucks</Text>             
                    <View style = {{flexDirection : "row", marginTop : 10}}>
                      <Icon name = "motorcycle" size = {20}/>
                      <Icon name = "truck" size = {20} style = {{marginLeft :10}}/>
                    </View>

                    <TouchableHighlight underlayColor = {"#3399ff"} style = {styles.aws} onPress = {() => this.setModalVisible(false)}>
                      <Text style = {{color : "white" }}>Awesome</Text>
                    </TouchableHighlight>
                  </View>
                  
                  :

                  <View style = {{alignItems : 'center'}}>
                    <TextInput keyboardType="number-pad" placeholder="Enter sender's contact..." style = {styles.input} onChangeText = {(text) => this.setState({contact : text})}/>   
                    <TextInput keyboardType="number-pad" placeholder="Enter code..." style = {styles.input} onChangeText = {(text) => this.setState({code : text})}/>             
                    <Button block style = {styles.trackButton} onPress={() => this.codeTracking()}>
                        {this.state.tloading == false ? <Text style ={styles.btntxt}>Track</Text> :
                        <ActivityIndicator color = "white"/>}
                    </Button>
                  </View>

                }
              </View>
            </View>
          </View>
        </Modal>

        <View style = {styles.welcome}>
          <Text style = {styles.text}>Moving the easy way</Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator = {false}
          style = {styles.main}
          refreshControl = {
            <RefreshControl
              onRefresh = {() => this.Prices()}
              refreshing={this.state.refreshing}
            />
          }   
        >
          <View style = {styles.row1}>          
            <View style = {{marginTop : 25}}>
              <Icon name = "circle" size = {16} color = {"white"}/>
              
              <View style = {{alignSelf : "center", borderRadius : 5, width : 3, height : 3, backgroundColor : "#fff", marginTop : 0}}/>
              <View style = {{alignSelf : "center", borderRadius : 5, width : 3, height : 3, backgroundColor : "#fff", marginTop : 5}}/>
              <View style = {{alignSelf : "center", borderRadius : 5, width : 3, height : 3, backgroundColor : "#fff", marginTop : 5}}/>
              <View style = {{alignSelf : "center", borderRadius : 5, width : 3, height : 3, backgroundColor : "#fff", marginTop : 5}}/>
              <View style = {{alignSelf : "center", borderRadius : 5, width : 3, height : 3, backgroundColor : "#fff", marginTop : 5}}/>

              <Icon name = "map-marker" size = {20} color = {"red"} style = {{alignSelf : "center"}} />
            </View>
            <View style = {styles.names}>   
              <TouchableHighlight underlayColor = {"#f2f2f2"} onPress = {()=>Actions.places({holder : "Pick-up Point...", field : "pickup"})} style = {styles.field}>
                <Text style = {{color : "#999999", fontWeight : "bold"}} numberOfLines = {1}>{this.props.points.plat == 0 ? "Pick-up Point..." : this.props.points.pickup}</Text>
              </TouchableHighlight>  
              <TouchableHighlight underlayColor = {"#f2f2f2"} onPress = {()=>Actions.places({holder : "Drop-off Point...", field : "dropoff"})} style = {styles.field}>
                <Text style = {{color : "#999999", fontWeight : "bold"}} numberOfLines = {1}>{this.props.points.dlat == 0 ? "Drop-off Point..." : this.props.points.dropoff}</Text>
              </TouchableHighlight>
            </View>
            <Image  style = {{marginTop : 18, height : 18, width : 18, alignSelf : "center"}} source = {require('../Resources/double.png')}/>        
          </View>

          <View style = {styles.row2}>
            <View style = {styles.heading}>
              <View style = {styles.separator}/> 
              <Text style ={styles.txt}>Choose means of delivery</Text>
              <View style = {styles.separator1}/> 
            </View>
            
              <View style = {styles.wrapper}>

              {this.state.loading == true ? 
                <ActivityIndicator size = {"large"} style = {{marginTop : "40%"}} color = {"#33ccff"} />
              :

                <View>
                  <FlatList
                    style={styles.list}
                    contentContainerStyle={styles.listContainer}
                    data={this.state.categories}
                    horizontal={false}
                    nestedScrollEnabled={true}
                    numColumns={3}
                    keyExtractor= {(item) => {
                        return item.id;
                    }}
                    renderItem={({item}) => {
                      return (
                        <View style={{flex:1, paddingTop : 15}}>
                            <TouchableOpacity style={{
                                shadowColor: '#fff',
                                shadowOffset: {
                                  width: 0,
                                  height: 6,
                                },
                                shadowOpacity: 0.37,
                                shadowRadius: 7.49,
                                elevation: 5,
                                backgroundColor:"#fff",
                                width:"90%",
                                height:100,
                                borderRadius:5,
                                borderColor : item.name == this.state.selected ? "orange" : "#fff",
                                borderWidth : 3,
                                justifyContent:'center',
                                alignSelf : 'center',
                              
                            }} onPress={() => {this.clickEventListener(item.name)}}>

                                <Image source = {item.icon} style = {{alignSelf : 'center', resizeMode : "contain", width : "60%", height : "60%"}}/>
                            </TouchableOpacity>

                            <View style={{justifyContent:"center"}}>
                                <Text style={styles.title}>{item.title}</Text>
                            </View>
                        </View>
                      )
                  }}/>
                  <Button block disabled={this.state.disabled} style = {styles.continueButton}   onPress={() => /*this.Test()*/ this.continue()}>
                      {this.state.loading == false ? <Text style ={styles.btntxt}>Continue</Text> :
                      <ActivityIndicator color = "white"/>}
                  </Button>
                </View>
              }
              </View>
            </View>
        </ScrollView>
        <Float/>

      </View>
    );
  }
}


const mapStateToProps = (state) =>{
  const {points} = state;
  return { points }
}

const mapDispatchToProps = (dispatch) => ({
  addDetails : (name, price, distance) => dispatch(addDetails(name, price, distance)),
  connStatus : (connection) => dispatch(connStatus(connection)),
});


const styles = StyleSheet.create({

  list : {
    backgroundColor : "#f2f2f2",
    //backgroundColor : "red",
    paddingHorizontal : 10,
    borderTopRightRadius : 15,
    borderTopLeftRadius : 15,
    paddingBottom : 20
  },
  
  main : {
   backgroundColor : "#f2f2f2",
   height :"100%",
  },


  input : {
    backgroundColor : "#e2e2e2",
    borderRadius : 2,
    paddingLeft : 10,
    marginTop : 10,
    width : "95%",
  },

  row1 : {
    flexDirection : "row",
    justifyContent : "center",
    backgroundColor : "#3399ff",
  },

  row2 : {
    backgroundColor : "#3399ff",
  },

  aws : {
    backgroundColor : "#3399ff",
    paddingLeft : 20,
    paddingRight : 20,
    paddingBottom : 10,
    paddingTop : 10,
    borderRadius : 15,
    width:"85%",
    alignItems : "center",
    marginTop : 20
  },

  names : {
    width:"85%",
  },

  wrapper : {
    borderTopRightRadius : 20,
    borderTopLeftRadius : 20,
    //height :"80%",
    paddingBottom : "5%",
    backgroundColor : "#f2f2f2",
    //backgroundColor : "red",
  },

  
  field : {
    marginTop : 10,
    paddingLeft : 10,
    shadowColor: '#fff',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
    elevation: 5,
    backgroundColor:"#fff",
    width:"90%",
    height:45,
    borderRadius:5,
    justifyContent:'center',
    alignSelf : 'center',

  },

  wtext : {
    fontSize : 16,
    color : "#004d99",
    textAlign : "center",
    paddingLeft : 10,
    paddingRight : 10
  },

  wview : {
    alignItems : "center",
    justifyContent : "center"
  },

  icon2 : {
    marginTop : 0,
    color : "red"
  },
  
  slider : {
    marginRight : 3,
    marginLeft : 3,
    marginTop : 10
  },
  
  welcome : {
    alignItems : "center",
    backgroundColor : "#3399ff"
  },

  text : {
    marginBottom : 5,
    color : "white",
    fontSize : 15,
  },

  heading : {
    marginTop : 10,
    flexDirection : "row",
    alignSelf : "center"
  },
  
  txt : {
    alignSelf : "center",
    marginBottom : 15,
    fontSize : 12,
    color : "white",
    borderColor : "white",
    borderRadius : 15,
    borderWidth : 1,
    paddingLeft : 6,
    paddingRight : 5,
    marginTop : 5
  },
  
  btntxt : {
    marginTop : "0%",
    alignSelf : "center",
    color : "white"
  },

  separator : {
    height : 1.5,
    width : "13%",
    backgroundColor : "#fff",
    //marginLeft : 0,
    marginRight : 5,
    marginTop : 15
  },
   
   separator1 : {
    height : 1.5,
    width : "13%",
    backgroundColor : "#fff",
    marginLeft : 5,
    //paddingRight : 5,
    marginTop : 15,
  },

  from : {
      height : 3,
      width : 10,
      backgroundColor : "green",
      marginTop : 40,
    },
  
  from1 : {
      height : 4,
      width : 3,
      backgroundColor : "green",
      marginTop : 40,
    },

  direction: {
      height : 5,
      width : 2,
      backgroundColor : "green",
      marginLeft : 5,
      marginTop : 5,
    },

  title:{
    fontSize:10,
    color:"#000",
    marginTop : 10,
    alignSelf : 'center',
  },

  listContainer : {
    justifyContent : "center"
  },

  continueButton: {
    justifyContent : "center",
    backgroundColor: '#3399ff',
    borderRadius: 5,
    borderWidth : 0.5,
    //borderColor : "black",
    height: 45,
    width : "95%",
    alignSelf : 'center',
    //marginTop : 5,
  },


  trackButton: {
    justifyContent : "center",
    backgroundColor: '#3399ff',
    marginBottom : 10,
    borderRadius: 5,
    borderWidth : 0.5, 
    //borderColor : "black",
    height: 45,
    width : "95%",
    alignSelf : 'center',
    marginTop : 8,
    
  },


  /************ modals ************/
 icon : {
  width:"190%",
  color : "#004d99",
  marginTop : 3,
  marginLeft : 3
 },

  ttle : {
    marginLeft : 10,
    fontSize : 18
  },
  row : {
    flexDirection : "row",
    marginTop : 10  
  },
  
  popupOverlay: {
    backgroundColor: "#00000057",
    flex: 1,
    marginTop: 0
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
    paddingLeft :10,
    paddingTop : 5,
  },
  modalInfo:{
   // justifyContent:'center',
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(DeliveryHome);