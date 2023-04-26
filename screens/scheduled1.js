import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Modal,
  ScrollView,
  AsyncStorage,
  ActivityIndicator
} from 'react-native';
import Heading from '../components/heading';
import Icon from 'react-native-vector-icons/FontAwesome';
import {Button} from 'native-base';
import axios from 'axios';
import { Actions } from 'react-native-router-flux';
import {connect} from 'react-redux';
import {addParties} from  '../Actions/actions';
import io from 'socket.io-client';
import {base_url, server} from '../components/links';

class Scheduled1 extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      modalVisible:false,
      loading : false,
      userSelected:[],
      contact : '',
      user : '',
      data: []
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
      if(res == "transporter"){
        this.setState({user : res});
      }
    });
  }


  componentDidMount(){
    this.socket = io(server);
  }


  //Fetch data from the database
  Scheduled = (contact) =>{
    var self = this;

    self.setState({loading : true});

    axios.post(base_url + 'scheduled1.php', {
      rcontact : contact,
      cancel : '',
      start : ''
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
     // alert(error);
      self.setState({loading : false});
    })
  }


  //Cancel Ride
  Cancel = (contact, id) =>{
    var self = this;

    self.setState({loading : true});

    axios.post(base_url + 'scheduled1.php', {
      rcontact : this.state.contact,
      ccontact : contact,
      cancel : 'true',
      id : id,
      start : ''
    })
    .then((response) => {
      //alert(response.data);
      if(response.data == "Error"){
        alert("An error occured")
        self.setState({loading : false});
      }else{
        self.setState({data : response.data, loading : false});
        this.socket.emit('reload', {title : "reload", contact : this.state.contact});
      }
    })
    .catch(function (error){
      //hanadle error
      //alert(error.message);
      self.setState({loading : false});
    })
  }
  

  //Start Ride
  Start = (contact, id) =>{
    var self = this;

    self.setState({loading : true});

    axios.post(base_url + 'scheduled1.php', {
      rcontact : this.state.contact,
      ccontact : contact,
      cancel : '',
      start : 'true',
      id : id,
    })
    .then((response) => {
      //alert(response.data);
      if(response.data == "Error"){
        alert("An error occured")
        self.setState({loading : false});
      }else{
        self.setState({data : response.data, loading : false});
        this.props.addParties(this.state.contact, contact)
        this.socket.emit('reload', {title : "reload", contact : this.state.contact});
        Actions.rmap()
      }
    })
    .catch(function (error){
      //hanadle error
      //alert(error.message);
      self.setState({loading : false});
    })
  }
  

  render() {
    return (
      <View style={styles.container}>

         {this.state.loading == true ? 
           <ActivityIndicator size = {"large"} style = {{marginTop : "60%"}} color = {"#33ccff"} />
           
         :

        <FlatList 
          style={styles.userList}
          columnWrapperStyle={styles.listContainer}
          data={this.state.data}
          keyExtractor= {(item) => {
            return item.id;
          }}
          renderItem={({item}) => {
          return (
            <TouchableOpacity style={styles.card} onPress={() => {}}>
                    
                    <View style = {{flexDirection : "row",}}>
                        <Image style={styles.image} source={
                          item.vehicle == "motorcycle" ? require("../Resources/mb.png") :
                          item.vehicle == "small_pickup" ? require("../Resources/small.png"):
                          require("../Resources/medium.png")
                        }/>
                        <View style={styles.cont}>
                          <View style={styles.cardContent}>
                            <Text style={styles.position}><Text style = {{fontWeight : "bold" }}>From :</Text> {item.Pickup}</Text>
                            <Text style={styles.position}><Text style = {{fontWeight : "bold" }}>To :</Text> {item.Dropoff}</Text>
                            <Text style={styles.position}><Text style = {{fontWeight : "bold" }}>Cost :</Text> UGX {item.Cost}</Text>
                            <Text style={styles.position}><Text style = {{fontWeight : "bold" }}>Date :</Text> {item.Date}</Text>
                            <Text style={styles.position}><Text style = {{fontWeight : "bold" }}>By :</Text> {item.fname + " " + item.lname}</Text>
                            
                            <View style = {{flexDirection : "row", alignSelf : "flex-end", marginTop : 5}}>
                              <Button style = {styles.button} onPress = {() => {this.Start(item.CContact, item.Id)}}>
                                <Text style = {styles.txt}>Start</Text>
                              </Button>

                              <Button style = {styles.button} onPress = {() => {this.Cancel(item.CContact, item.Id)}}>
                                <Text style = {styles.txt}>Cancel</Text>
                              </Button>
                            </View>
                          </View>
                        </View>
                    </View>
            </TouchableOpacity>
          )}}/>}
      </View>
    );
  }
}



const mapStateToProps = (state) =>{
  const {points} = state;
  return { points }
}



const mapDispatchToProps = (dispatch) => ({
  addParties : (driver, customer) => dispatch(addParties(driver, customer)),
});


const styles = StyleSheet.create({
  container:{
    flex:1,
    //marginTop:10,
    backgroundColor:"#eeeeee"
  },

  button : {
    height : 30,
    borderRadius : 5,
    alignSelf : "flex-end",
    backgroundColor : "#3399ff",
    marginRight : 10,
    marginBottom : 5
  },

  cont:{
    flex:1,
  },

  txt : {
    color : "white",
    paddingBottom : 5,
    paddingTop : 5,
    paddingLeft : 5,
    paddingRight : 5
  },

  header:{
    backgroundColor: "#00CED1",
    height:200
  },
  headerContent:{
    padding:30,
    alignItems: 'center',
    flex:1,
  },
  detailContent:{
    top:80,
    height:500,
    width:Dimensions.get('screen').width - 90,
    marginHorizontal:30,
    flexDirection: 'row',
    position:'absolute',
    backgroundColor: "#ffffff"
  },
  userList:{
    flex:1,
  },
  cardContent: {
    marginLeft:20,
    marginTop:0,
    width : "93%"
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
    flexBasis: '46%',
    padding: 10,
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

export default connect(mapStateToProps, mapDispatchToProps)(Scheduled1);