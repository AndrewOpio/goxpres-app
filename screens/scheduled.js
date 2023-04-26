import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  FlatList,
  AsyncStorage,
  ActivityIndicator
} from 'react-native';
import Heading from '../components/heading';
import {Button} from 'native-base';
import axios from 'axios';
import RNImmediatePhoneCall from 'react-native-immediate-phone-call';
import {base_url, server} from '../components/links';

export default class Scheduled extends Component {

  constructor(props) {
    super(props);
    this.state = {
      modalVisible:false,
      loading : false,
      userSelected:[],
      contact : '',
      user : '',
      data: [],
      isFetching : false,
    };
  }


  componentWillMount(){
    AsyncStorage.getItem("contact", (err, res) =>{
      if(res){
        this.setState({contact : res});
        this.Scheduled(res);
      }
    });

    AsyncStorage.getItem("user", (err, res) =>{
      if(res == "rider"){
        this.setState({user : res});
      }
    });
  }


  //Fetch data from the database
  Scheduled = (contact) =>{
    var self = this;
    self.setState({loading : true});

    axios.post(base_url + 'scheduled.php', {
      ccontact : contact,
      cancel : '',
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


  //Cancel Ride
  Cancel = (contact, id) =>{
    var self = this;

    self.setState({loading : true});

    axios.post(base_url + 'scheduled.php', {
      ccontact : this.state.contact,
      rcontact : contact,
      cancel : 'true',
      id : id
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
  

  //calling
  Call(num){
    RNImmediatePhoneCall.immediatePhoneCall(num);
  }
  

  render() {
    return (
      <View style={styles.container}>
         <Heading screen = {""} title = "Scheduled"/> 

         {this.state.loading == true ? 
         
           <ActivityIndicator size = {"large"} style = {{marginTop : "60%"}} color = {"#33ccff"} />
           
         :

         this.state.data.length > 0 ?
          <FlatList 
            onRefresh={() => this.Scheduled(this.state.contact)}
            refreshing={this.state.isFetching}
            //style={styles.userList}
            //columnWrapperStyle={styles.listContainer}
            data={this.state.data}
            keyExtractor= {(item) => {
              return item.id;
            }}
            renderItem={({item}) => {
            return (
              <TouchableOpacity style={styles.card} onPress={() => {}}>
                      
                      <View style = {{flexDirection : "row"}}>
                          <View>
                            <Image style={styles.image} source={
                              item.vehicle == "motorcycle" ? require("../Resources/mb.png") :
                              item.vehicle == "small_pickup" ? require("../Resources/small.png"):
                              require("../Resources/medium.png")
                            }/>
                          </View>
                          <View style={styles.cont}>
                            <View style={styles.cardContent}>
                              <View>
                                <Text style={styles.position}><Text style = {{fontWeight : "bold" }}>From :</Text> {item.Pickup}</Text>
                                <Text style={styles.position}><Text style = {{fontWeight : "bold" }}>To :</Text> {item.Dropoff}</Text>
                                <Text style={styles.position}><Text style = {{fontWeight : "bold" }}>Cost :</Text> UGX {item.Cost}</Text>
                                <Text style={styles.position}><Text style = {{fontWeight : "bold" }}>Tracking code :</Text> {item.TCode}</Text>
                                <Text style={styles.position}><Text style = {{fontWeight : "bold" }}>Date :</Text> {item.Date}</Text>
                                <Text style={styles.position}><Text style = {{fontWeight : "bold" }}>By :</Text> {item.fname + " " + item.lname}</Text>
                              </View>
                              <View style = {styles.buttons}>
                                <Button style = {styles.button} onPress = {() => {this.Call(item.RContact)}}>
                                  <Text style = {styles.txt}>Call</Text>
                                </Button>
                                <View style={{width : 10}}/>
                                <Button style = {styles.button} onPress = {() => {this.Cancel(item.RContact, item.Id)}}>
                                  <Text style = {styles.txt}>Cancel</Text>
                                </Button>
                              </View>
                            </View>
                          </View>
                      </View>
              </TouchableOpacity>
            )}}/>
          
          :

           <View style = {styles.wrap}>
             <Text style = {styles.hist}>No scheduled rides</Text>
             <Button style = {styles.refresh} onPress = {() => {this.Scheduled(this.state.contact)}}>
                <Text style = {styles.ref}>Refresh</Text>
              </Button>
           </View>
          }
      </View>
    );
  }
}


const styles = StyleSheet.create({
  refresh : {
    backgroundColor : "#3399ff",
    height : 30,
    paddingRight : 5,
    paddingLeft : 5,
    alignSelf  :  "center",
    marginTop : 10,
    borderRadius : 5 
  },

  ref : {
     color : "#fff",
  },

  container:{
    flex:1,
    //marginTop:10,
    backgroundColor:"#eeeeee"
  },
  wrap : {
    justifyContent : "center",
    alignItems : "center",
    height : "100%"
 },

 hist : {
   color : "#999999",
   fontSize : 15
 },

  button : {
    height : 28,
    borderRadius : 5,
    backgroundColor : "#3399ff",
    //marginRight : 80,
    marginBottom : 5
  },
  
  buttons : {
    flexDirection : "row",
    alignSelf : "flex-end",
    marginTop : 5
  },

  txt : {
    color : "white",
    paddingBottom : 6,
    paddingTop : 6,
    paddingLeft : 6,
    paddingRight : 6
  },

  header:{
    backgroundColor: "#00CED1",
    height:200
  },

  cont:{
    flex:1,
  },

  cardContent: {
    marginLeft:0,
    //backgroundColor:"green",
    paddingLeft: 10,
    paddingRight: 5,
    //alignSelf:'flex-end',
    //width : "95%"
  },

  image:{
    width:70,
    height:70,
    //borderRadius:45,
  },


  card:{
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
    padding: 5,
    //width : "93%"

  },

  name:{
    fontSize:15,
    flex:1,
    //alignSelf:'center',
    color:"#008080",
    fontFamily : 'Sansation_Bold',
    width : "90%",
    marginTop : 5
  },

  
  position:{
    fontSize:12.5,
    flex:1,
    //alignSelf:'center',
    color:"#696969",
    paddingBottom : 2,
    //width : "90%",
  },
  about:{
    marginHorizontal:10
  },

  followButton: {
    marginTop:10,
    height:35,
    width:100,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius:30,
    backgroundColor: "#00BFFF",
  },
  followButtonText:{
    color: "#FFFFFF",
    fontSize:20,
  },
 /************ modals ************/
  popup: {
    backgroundColor: 'white',
    marginTop: 80,
    marginHorizontal: 20,
    borderRadius: 7,
  },
  popupOverlay: {
    backgroundColor: "#00000057",
    flex: 1,
    marginTop: 30
  },
  popupContent: {
    //alignItems: 'center',
    margin: 5,
    height:250,
  },
  popupHeader: {
    marginBottom: 45
  },
  popupButtons: {
    marginTop: 15,
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
    height:20,
    backgroundColor:'#20b2aa',
    padding:20
  },
  modalInfo:{
    alignItems:'center',
    justifyContent:'center',
  }
});