import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Icon,
  Modal,
  ScrollView,
  ActivityIndicator,
  AsyncStorage,
} from 'react-native';
import Heading from '../components/heading';
import axios from 'axios';
import {base_url, server} from '../components/links';
import {Button} from 'native-base';

export default class Previous extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible:false,
      contact : "",
      userSelected:[],
      data: [],
      isFetching : false,
      loading : true,  
    };
  }


  componentWillMount(){
    AsyncStorage.getItem("contact", (err, res) =>{
      if(res){
        this.setState({contact : res});
        this.Previous(res);
      }
    });
  }



  Previous = (contact) =>{
    var self = this;

    self.setState({loading : true});

    axios.post(base_url + 'previous.php', {
      contact : contact,
    })
    .then((response) => {
      //console.log(response.data);
      if(response.data == "Error"){
        alert("An error occured")
        self.setState({loading : false});
      }else{
        self.setState({data : response.data, loading : false});
      }
    })
    .catch(function (error){
      //hanadle error
      //alert(error);
      self.setState({loading : false});
    })
  }



  render() {
    return (
      <View style={styles.container}>
         <Heading screen = {""} title = "History & Current"/> 

         {this.state.loading == true ? 
         
           <ActivityIndicator size = {"large"} style = {{marginTop : "60%"}} color = {"#33ccff"} />
           
         :

        this.state.data.length > 0 ?
        <FlatList 
          onRefresh={() => this.Previous(this.state.contact)}
          refreshing={this.state.isFetching}
          style={styles.userList}
          columnWrapperStyle={styles.listContainer}
          data={this.state.data}
          keyExtractor= {(item) => {
            return item.id;
          }}
          renderItem={({item}) => {
          return (
            <TouchableOpacity style={styles.card} onPress={() => {}}>
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
                    {item.TStatus == "ended" || item.TStatus == "started" ?
                      <Text style={styles.position}><Text style = {{fontWeight : "bold" }}>Tracking code :</Text> {item.TCode}</Text> 
                    : <View></View>
                    }
                    <Text style={styles.position}><Text style = {{fontWeight : "bold" }}>Status :</Text> <Text style={styles.position1}>{item.TStatus}</Text></Text>
                </View>
              </View>
            </TouchableOpacity>
          )}}/>
          
          :

           <View style = {styles.wrap}>
              <Text style = {styles.hist}>No history or ongoing trips</Text>
              <Button style = {styles.refresh} onPress = {() => {this.Previous(this.state.contact)}}>
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
  cont:{
    flex:1,
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
    //marginTop:10
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
    flexDirection:'row'
  },

  name:{
    fontSize:15,
    flex:1,
    alignSelf:'center',
    color:"#008080",
    fontFamily : 'Sansation_Bold',
  },
  position:{
    fontSize:12.5,
    flex:1,
    //alignSelf:'center',
    color:"#696969",
    paddingBottom : 2,
    //width : "90%",
  },

  position1:{
    fontSize:12.5,
    flex:1,
    //alignSelf:'center',
    color:"green",
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