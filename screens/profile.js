import {RefreshControl, Alert, ScrollView, StyleSheet, View, Text, TextInput, Picker, Image, TouchableOpacity, ActivityIndicator, Modal, AsyncStorage} from 'react-native';
import React, {Component} from 'react';
import {Button} from 'native-base';
import {Actions} from 'react-native-router-flux';
import Icon from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';
import {base_url, server} from '../components/links';
import PopMenu from '../components/menu1';

export default class Profile extends Component{
  constructor(props){
    super(props);

    this.state = {
      loading : true,
      refreshing : false,
      modalVisible : false,
      initcontact : '',
      contact : '',
      fname : '',
      lname : '',
      email : '',
      gender : '',
      means : '',
      user : '',
      businessname : '',
      address : '',
      location : '',
      popup : '',
      old : '',
      new : '',
      data : []
    }
  }


  componentWillMount(){
    AsyncStorage.getItem("contact", (err, res) =>{
      if(res){
        this.setState({initcontact : res});

        AsyncStorage.getItem("user", (err1, res1) => {
          if (res1){ 
            this.Profile(res, res1);
            this.setState({user : res1});
          }
        });
      }
    });
  }
  
    
  //Fetch users
  Profile = (contact, user) =>{
    var self = this;
    self.setState({loading : true});

    axios.post(base_url + 'profile.php', {
      contact : contact,
      user : user
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
      self.setState({loading : true});
    })
  }


  //Fetch users
  Edit = () =>{
    var self = this;
    //alert(this.state.email);

    self.setState({loading : true});

    axios.post(base_url + 'edit.php', {
      initcontact : this.state.initcontact,
      contact : this.state.contact,
      fname : this.state.fname,
      lname : this.state.lname,
      email : this.state.email,
      gender : this.state.gender,
      means : this.state.means,
      user : this.state.user,
      businessname : this.state.businessname,
      address : this.state.address,
      location : this.state.location
    })
    .then((response) => {
      //console.log(response.data);
      //alert(response.data);

      if(response.data == "Error"){
        alert("An error occured")
        self.setState({loading : false});
        this.setModalVisible(false) 
      }else{

        if(this.state.contact != ""){
          AsyncStorage.removeItem('contact');
          AsyncStorage.setItem('contact', response.data.Contact);

          self.setState({initcontact : response.data.Contact, data : response.data, loading : false});
        }else{
          self.setState({data : response.data, loading : false});
        }
        
        this.setModalVisible(false) 
      }
    })
    .catch(function (error){
      //hanadle error
      //alert(error.message);
      self.setState({loading : false});
      this.setModalVisible(false) 
    })
  }

  
  //Change password
  Change = () =>{
    var self = this;
    //alert(this.state.email);

    self.setState({loading : true});

    axios.post(base_url + 'change.php', {
      initcontact : this.state.initcontact,
      old : this.state.old,
      new : this.state.new,
      user : this.state.user
    })
    .then((response) => {
      //console.log(response.data);
      if(response.data == "Error"){
        alert("An error occured")
        self.setState({loading : false});
        this.setModalVisible(false) 
      }else{
        alert("Changed Successfully")
        self.setState({loading : false});
        this.setModalVisible(false) 
      }
    })
    .catch(function (error){
      //hanadle error
      //alert(error.message);
      self.setState({loading : false});
      this.setModalVisible(false) 
    })
  }

    
  //Operations on modal
  setModalVisible(visible) {
    if(visible == false){
      this.setState({modalVisible: visible});
    }else{
      this.setState({modalVisible: visible});
    }
  }


  //setting the gender
  Gender = (gender) =>{
    this.setState({gender : gender});
  }


  //Delete Account
  Del = () =>{
    var self = this;
    self.setState({loading : true});
    axios.post(base_url + 'delete.php', {
      initcontact : this.state.initcontact,
      user : this.state.user
    })
    .then((response) => {
      //console.log(response.data);
      if(response.data == "Error"){
        alert("An error occured")
        self.setState({loading : false});
      }else{
        alert("Account Deleted")
        Actions.login();
      }
    })
    .catch(function (error){
      self.setState({loading : false});
    })
  }


  //Delete Account
  Delete = () =>{
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account ?',
      [{
        text : 'Cancel',
        onPress : () => {},
        style : 'cancel'
      },
      {
        text : "Yes",
        onPress : () => {this.Del()}
      }],
      {
        cancelable : false
      }
    );       
  }

   
  //Log out
  logout = () =>{
    Alert.alert(
      'Logout',
      'Are you sure you want to logout ?',
      [{
        text : 'Cancel',
        onPress : () => {},
        style : 'cancel'
      },
      {
        text : "Yes",
        onPress : () => {
          AsyncStorage.removeItem("contact", (err, res) => { 
          });
          AsyncStorage.removeItem("user", (err, res) => { 
          });
          Actions.login(); 
        }
      }],
      {
        cancelable : false
      }
    );       
  }

  //setting the means of transport
  Vehicle = (means) =>{
    this.setState({means : means});
  }
  

  render(){
    if(this.state.loading != true){
      //var url = base_url + this.state.data.Propic;
      //alert(this.state.user);
    }

    return(
      this.state.loading == true ? 

        <ActivityIndicator size = {"large"} style = {{marginTop : "60%"}} color = {"#33ccff"} />
        
      :

        <ScrollView 
          style = {styles.main}
          refreshControl = {
            <RefreshControl
              onRefresh = {() => this.Profile(this.state.initcontact, this.state.user)}
              refreshing={this.state.refreshing}
            />
          }   
        >
          <View style = {{flexDirection : "row"}}>

            <TouchableOpacity style = {styles.edit} onPress = {() => {this.setModalVisible(true); this.setState({popup : "edit"})}}>
              <Icon name = "edit" size = {25} style = {{color : "#00ace6"}}/>
            </TouchableOpacity>

            <View style = {{flex : 1, marginTop : 10}}>
              <Text style = {styles.heading}>Profile</Text>
              {/*<TouchableOpacity style = {styles.out} onPress = {() => this.logout()}>
                <Image  style = {{height : 25, width : 25}} source = {require('../Resources/logout.png')}/>
             </TouchableOpacity>*/}
             <PopMenu style = {styles.out} delete = {this.Delete} logout = {this.logout}/>
            </View>
          </View>

          <View style = {styles.imgcover}>
            <Image  style = {styles.img} source = {this.state.user == "rider" && this.state.data.Propic != "" ?
              {uri : 'https://www.goxpres.com/gxp%ad/' + this.state.data.Propic} :  require('../Resources/avatar.png')}/>
            {/*<Icon name = "camera" size = {25} style = {styles.camera}/>*/}
          </View>
          <View style = {{backgroundColor : "#e2e2e2", height : 15, marginTop  : 10}}></View>

          <View style = {styles.card}>
            {this.state.user == "user" || this.state.user == "rider" ?
            <View>
              <View style = {{flexDirection : "row"}}>
                <Text style = {{fontSize : 15}}>Name</Text>
                <View style = {{flex : 1}}>
                  <Text  style = {{alignSelf : "flex-end"}}>{this.state.data.FirstName + " " + this.state.data.LastName}</Text>
                </View>                   
              </View>
              <View style = {{backgroundColor : "#fff", height : 1, marginTop  : 10, marginBottom  : 10}}></View>

              <View style = {{flexDirection : "row"}}>
                <Text style = {{fontSize : 15}}>Email</Text>
                <View style = {{flex : 1}}>
                  <Text numberOfLines={1} style = {{alignSelf : "flex-end"}}>{this.state.data.Email}</Text>
                </View>
              </View>
              <View style = {{backgroundColor : "#fff", height : 1, marginTop  : 10, marginBottom  : 10}}></View>

              <View style = {{flexDirection : "row"}}>
                <Text style = {{fontSize : 15}}>Contact</Text>
                <View style = {{flex : 1}}>
                  <Text  style = {{alignSelf : "flex-end"}}>{this.state.data.Contact}</Text>
                </View>     
              </View>
              <View style = {{backgroundColor : "#fff", height : 1, marginTop  : 10, marginBottom  : 10}}></View>

              <View style = {{flexDirection : "row"}}>
                <Text style = {{fontSize : 15}}>Gender</Text>
                <View style = {{flex : 1}}>
                  <Text  style = {{alignSelf : "flex-end"}}>{this.state.data.Gender}</Text>
                </View>     
              </View>
              <View style = {{backgroundColor : "#fff", height : 1, marginTop  : 10, marginBottom  : 10}}></View>

              {this.state.user == "rider" ? 
              <View>
                <View style = {{flexDirection : "row"}}>
                  <Text style = {{fontSize : 15}}>Vehicle</Text>
                  <View style = {{flex : 1}}>
                    <Text  style = {{alignSelf : "flex-end"}}>{this.state.data.Vehicle}</Text>
                  </View>     
                </View>
                <View style = {{backgroundColor : "#fff", height : 1, marginTop  : 10, marginBottom  : 10}}></View>

                <View style = {{flexDirection : "row"}}>
                  <Text style = {{fontSize : 15}}>Rating</Text>
                  <View style = {{flex : 1}}>
                    <Text  style = {{alignSelf : "flex-end"}}>{Math.round(this.state.data.avRating*100)/100}</Text>
                  </View>     
                </View> 
                <View style = {{backgroundColor : "#fff", height : 1, marginTop  : 10, marginBottom  : 10}}></View>

              </View>

              :<View></View>}
            </View>
            :<View></View>}
            
            {this.state.user == "business" ? 
            <View>
              <View style = {{flexDirection : "row"}}>
                <Text style = {{fontSize : 15}}>Business Name</Text>
                <View style = {{flex : 1}}>
                  <Text  style = {{alignSelf : "flex-end"}}>{this.state.data.BusinessName}</Text>
                </View>     
              </View>
              <View style = {{backgroundColor : "#fff", height : 1, marginTop  : 10, marginBottom  : 10}}></View>

              <View style = {{flexDirection : "row"}}>
                <Text style = {{fontSize : 15}}>Email</Text>
                <View style = {{flex : 1}}>
                  <Text  style = {{alignSelf : "flex-end"}}>{this.state.data.Email}</Text>
                </View>     
              </View> 
              <View style = {{backgroundColor : "#fff", height : 1, marginTop  : 10, marginBottom  : 10}}></View>

              <View style = {{flexDirection : "row"}}>
                <Text style = {{fontSize : 15}}>Contact</Text>
                <View style = {{flex : 1}}>
                  <Text  style = {{alignSelf : "flex-end"}}>{this.state.data.Contact}</Text>
                </View>     
              </View> 
              <View style = {{backgroundColor : "#fff", height : 1, marginTop  : 10, marginBottom  : 10}}></View>

              <View style = {{flexDirection : "row"}}>
                <Text style = {{fontSize : 15}}>Address : </Text>
                <View style = {{flex : 1}}>
                  <Text  style = {{alignSelf : "flex-end"}}>{this.state.data.Address}</Text>
                </View>     
              </View> 
              <View style = {{backgroundColor : "#e2e2e2", height : 1, marginTop  : 10, marginBottom  : 10}}></View>

              <View style = {{flexDirection : "row"}}>
                <Text style = {{fontSize : 15}}>Location</Text>
                <View style = {{flex : 1}}>
                  <Text  style = {{alignSelf : "flex-end"}}>{this.state.data.Location}</Text>
                </View>     
              </View> 

              <View style = {{backgroundColor : "#fff", height : 1, marginTop  : 5, marginBottom  : 10}}></View>
            </View> : <View></View>}

          <View style = {{flexDirection : "row", alignSelf :"center",}}>
            <TouchableOpacity onPress = {() => {this.setModalVisible(true); this.setState({popup : "pass"})}}
              style = {{
                alignSelf : "center", 
                //marginTop : 5,
                borderWidth : 1,
                borderColor : "#3399ff",
                paddingTop : 5,
                paddingBottom : 5,
                paddingLeft : 10,
                paddingRight : 10,
                borderRadius : 20

              }}>
              <Text style = {{fontSize : 12, color: "#3399ff"}}>Change Password</Text>
            </TouchableOpacity>
          </View>
          </View>

          <Modal
              animationType={'fade'}
              transparent={true}
              onRequestClose={() => this.setModalVisible(false)}
              visible={this.state.modalVisible}>

              <View style={styles.popupOverlay}>
                <View style={styles.popup}>
                    <View style= {{borderTopRightRadius : 7, borderTopLeftRadius : 7, backgroundColor : "#3399ff", borderTopRadius : 20}}>
                      <Text style = {{padding : 5, alignSelf : "center", fontSize : 17, color : "white"}}>{this.state.popup == "edit" ? "Edit Profile" : "Change Password"}</Text>
                    </View>
                    <View style = {styles.separator}/>
                  <View style={styles.popupContent}>
                    
                    <ScrollView contentContainerStyle={styles.modalInfo} keyboardShouldPersistTaps = {'handled'}> 
                      {(this.state.user == "user" || this.state.user == "rider") && this.state.popup == "edit" ?                
                      <View>              
                        <TextInput placeholder="First Name.." placeholderColor="#c4c3cb" defaultValue={this.state.data.FirstName} style={styles.input} onChangeText = {(text) => this.setState({fname : text})}/>            
                        <TextInput placeholder="Last Name.." placeholderColor="#c4c3cb" defaultValue={this.state.data.LastName} style={styles.input} onChangeText = {(text) => this.setState({lname : text})}/>            
                        <TextInput placeholder="Contact.." placeholderColor="#c4c3cb" defaultValue={this.state.data.Contact} style={styles.input} onChangeText = {(text) => this.setState({contact : text})}/>            
                        <TextInput placeholder="Email.." placeholderColor="#c4c3cb" defaultValue={this.state.data.Email} style={styles.input} onChangeText = {(text) => this.setState({email : text})}/>            
                        
                        <View style={styles.input}>
                          <Picker selectedValue = {this.state.gender ? this.state.gender : this.state.data.Gender}
                            onValueChange={this.Gender}
                            mode = 'dropdown'
                          >
                            <Picker.Item label = "Male" value = "M"/>
                            <Picker.Item label = "Female" value = "F"/>
                          </Picker>
                        </View>

                        {this.state.user == "rider" ?
                            <View style={styles.input}>
                              <Picker selectedValue = {this.state.means ? this.state.means : this.state.data.Vehicle}
                                onValueChange={this.Vehicle}
                                mode = 'dropdown'
                              >
                                <Picker.Item label = "Motorcycle" value = "motorcycle"/>
                                {/*<Picker.Item label = "Tricycle" value = "tricycle"/>*/}
                                <Picker.Item label = "Small pickup/lorry" value = "small_pickup"/>
                                <Picker.Item label = "Medium Lorry" value = "medium_lorry"/>
                              </Picker>
                            </View>
                        :<View></View>}
                      </View> : <View></View> }     

                      {this.state.user == "business" && this.state.popup == "edit"  ?                
                      <View>              
                        <TextInput placeholder="Business Name.." placeholderColor="#c4c3cb" defaultValue={this.state.data.BusinessName} style={styles.input} onChangeText = {(text) => this.setState({businessname : text})}/>            
                        <TextInput placeholder="Email.." placeholderColor="#c4c3cb" defaultValue={this.state.data.Email} style={styles.input} onChangeText = {(text) => this.setState({email : text})}/>            
                        <TextInput placeholder="Contact.." placeholderColor="#c4c3cb" defaultValue={this.state.data.Contact} style={styles.input} onChangeText = {(text) => this.setState({contact : text})}/>            
                        <TextInput placeholder="Address.." placeholderColor="#c4c3cb" defaultValue={this.state.data.Address} style={styles.input} onChangeText = {(text) => this.setState({address : text})}/>            
                        <TextInput placeholder="Location.." placeholderColor="#c4c3cb" defaultValue={this.state.data.Location} style={styles.input} onChangeText = {(text) => this.setState({location : text})}/>            
                      </View> : <View></View> }    

                      {this.state.popup == "pass" ?  
                      <View>  
                        <TextInput placeholder="Old Password.." placeholderColor="#c4c3cb"  style={styles.input} onChangeText = {(text) => this.setState({old : text})}/>            
                        <TextInput placeholder="New Password.." placeholderColor="#c4c3cb"  style={styles.input} onChangeText = {(text) => this.setState({new : text})}/>            
                      </View>
                      : <View></View>}

                      <View style={styles.popupButtons}>
                        <TouchableOpacity onPress={() => {this.setModalVisible(false)}} style={styles.btnClose}>
                          <Text style = {{color : "white"}}>Cancel</Text>
                        </TouchableOpacity>
                        <View style = {{width : "20%"}}/>
                        <TouchableOpacity onPress={() => {this.state.popup == "edit" ? this.Edit() : this.state.old && this.state.new ? this.Change(): {}}} style={styles.btnClose}>
                          <Text style = {{color : "white"}}>Save</Text>
                        </TouchableOpacity>
                      </View>
                    </ScrollView>
                  </View>
                  
                </View>
              </View>
            </Modal>
        </ScrollView>
    );
  }
}


const styles = StyleSheet.create({

  input : {
    backgroundColor : "#e2e2e2",
    borderRadius : 0,
    paddingLeft : 10,
    marginTop : 10
  },

  card : {
    shadowColor: '#00000021',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
    elevation: 5,
    marginVertical: 5,
    marginHorizontal:12,
    backgroundColor:"white",
    //flexBasis: '46%',
    padding: 10,
    borderRadius : 10,
    marginTop  : 10
  },

  main : {
    //backgroundColor : "#e2e2e2"
  },

  heading :{
      alignSelf : "center",
      //fontFamily : "Rounded_Elegance",
      fontSize : 20,
      marginRight : 45,

      color : "#00ace6"
  },

  edit : {
      //alignSelf : "flex-end",
      marginTop : 10,
      marginLeft : 15,
      color : "#00ace6"

  },

  out : {
    alignSelf : "flex-end",
    marginTop : -42,
    marginRight : 0,
    color : "#00ace6"
  },
  
  chevron : {
    alignSelf : "flex-end",
    color : "#00ace6",
  },

  camera : {
    position : "absolute",
    color : "#00ace6",
    //alignSelf : "center",
    marginTop : 150,
    marginLeft : "59%"
  },

  img : {
      height : 120,
      width : 120,
      borderRadius : 80,

  },

  imgcover : {
    borderRadius : 80,
    alignSelf : "center",
    marginTop : 30,
    borderWidth : 2,
    borderColor : "orange"
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
      marginTop: 2,
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
      backgroundColor:'#3399ff',
      paddingLeft :30,
      paddingRight : 30,
      paddingTop : 10,
      paddingBottom : 10,
      borderRadius : 10,
      marginBottom : 5,
      marginTop : 5,
    },
    modalInfo:{
      //alignItems:'center',
      justifyContent:'center',
    }  
});