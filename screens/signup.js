import {AsyncStorage, Linking, CheckBox, BackHandler, Alert, StyleSheet, View, Text, TextInput, Picker, TouchableOpacity, ScrollView, ActivityIndicator} from 'react-native';
import React, {Component} from 'react';
import {Button} from 'native-base';
import {Actions} from 'react-native-router-flux';
import Icon from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';
import {base_url, server} from '../components/links';

export default class Signup extends Component {
  constructor(props){
      super(props);
      this.state = {
        loading : false,
        type : "",
        gender : "",
        fname : "",
        lname : "",
        contact : "",
        bname : "",
        location :"",
        address : "",
        email : "",
        means : "",
        password : "",
        confirm : "",
        color : '#3399ff',
        terms : false
      }
  }


  componentWillMount(){
    BackHandler.addEventListener('hardwareBackPress', this.Back);
  }


  componentWillUnmount(){
    BackHandler.removeEventListener('hardwareBackPress', this.Back);
  }


  Back = () =>{
    Actions.pop()
    return true;
  }

  
  //type of account
  Type = (type) =>{
    this.setState({type : type});
  }

  //setting the gender
  Gender = (gender) =>{
    this.setState({gender : gender});
  }

  //setting the means of transport
  Means = (means) =>{
    this.setState({means : means});
  }
    
    
  //Registering new users
  Register = () =>{
    //Actions.confirmation()
    var self = this;

    this.setState({loading : true});
    
    axios.post(base_url + 'signup.php', {
        type : this.state.type,
        gender : this.state.gender,
        fname : this.state.fname,
        lname : this.state.lname,
        contact : this.state.contact,
        bname : this.state.bname,
        location :this.state.location,
        address : this.state.address,
        email : this.state.email,
        means : this.state.means,
        password : this.state.password 
    })
    .then((response) => {
      //handle request
      //alert(response.data);
      self.setState({loading : false});

      if(response.data == "Successful"){

        self.Login();

        self.setState({loading : false});
        
      }else if(response.data == "Exists"){
        Alert.alert(
          'Oopps..',
          'Contact already exists'
        )

        self.setState({loading : false});
      }
    })
    .catch(function (error){
      //hanadle error
      //alert(error.message);
      self.setState({loading : false});
    })
  }

  
  //Redirect after signup
  Login = () =>{

    if(this.state.type == "P"){
      AsyncStorage.setItem('contact', this.state.contact);
      AsyncStorage.setItem('user', 'user');
      AsyncStorage.setItem('status', 'new');

      Actions.deliveryhome();

    }else if(this.state.type == "R"){

      Actions.waiting();

    }else if(this.state.type == "B"){

      AsyncStorage.setItem('contact', this.state.contact);
      AsyncStorage.setItem('user', 'business');
      AsyncStorage.setItem('status', 'new');

      Actions.deliveryhome();

    }
  }

    
  //Check whether input is empty
  Check = () => {

    var x = this.state.contact;
    let isnum = /^\d+$/.test(x);

    if(this.state.type == "P"){
      if(this.state.gender != "" && this.state.fname != "" && this.state.lname != "" && this.state.contact != "" && this.state.email != "" && this.state.password != ""){
      
        if(this.state.terms == true){
          if(x.charAt(0)!='0' || x.charAt(1)!='7' || x.length != 10 || isnum == false){
            Alert.alert(
              "Error",
              "Please enter a valid contact"
            );
          }else{
            this.Register();
          }
        }else{
          Alert.alert(
            'Incomplete Submission',
            'Pease agree to our terms and conditions'
          )
        } 

      }else{
        alert("Please fill in all fields");
      }
    }else if(this.state.type == "B"){
      if(this.state.bname != "" && this.state.contact != "" && this.state.location != "" && this.state.address != "" && this.state.email != "" && this.state.password != ""){
        
        if(this.state.terms == true){
          if(x.charAt(0)!='0' || x.charAt(1)!='7' || x.length != 10 || isnum == false){
            Alert.alert(
              "Error",
              "Please enter a valid contact"
            );
          }else{
            this.Register();
          }
        }else{
          Alert.alert(
            'Incomplete Submission',
            'Pease agree to our terms and conditions'
          )
        } 
      }else{
        alert("Please fill in all fields");
      }
    }else if(this.state.type == "R"){
      if(this.state.gender != "" && this.state.gender != "" && this.state.fname != "" && this.state.lname != "" && this.state.contact != "" && this.state.email != "" && this.state.password != ""){
        
        if(this.state.terms == true){
          if(x.charAt(0)!='0' || x.charAt(1)!='7' || x.length != 10 || isnum == false){
            Alert.alert(
              "Error",
              "Please enter a valid contact"
            );
          }else{
             this.Register();
          }
        }else{
          Alert.alert(
            'Incomplete Submission',
            'Pease agree to our terms and conditions'
          )
        } 
      }else{
        alert("Please fill in all fields");
      }
    }
  }


  render() {
    return (
      <View style={{flex:1, justifyContent : "center", backgroundColor:'#ffffff', height : "100%", paddingBottom : 20}}>
        <ScrollView keyboardShouldPersistTaps = {'handled'}> 
          <Text style = {{marginTop : "10%", textAlign : "center", fontSize : 25}}>Open an account</Text>
            <View style={{justifyContent : "center",}}>             
                <View style = {styles.bundle}>
                  <View style = {styles.in}>
                    <Icon name = "list" size = {20} style = {{color : "orange"}}/>
                  </View> 
                  <View style={styles.picker}>
                    <Picker selectedValue = {this.state.type}
                        onValueChange={this.Type}
                        mode = 'dropdown'
                        color = "#c4c3cb"
                        style = {{marginBottom : 10}}
                    >
                      <Picker.Item label = "Type of Account" value = "G" color = "#c4c3cb"/>
                      <Picker.Item label = "Personal" value = "P"/>
                      <Picker.Item label = "Rider/Driver" value = "R"/>
                      <Picker.Item label = "Business" value = "B"/>
                    </Picker>
                  </View>   
                </View>

              {this.state.type != "B" ?
              <View>
                <View style = {styles.bundle}>
                  <View style = {styles.in}>
                    <Icon name = "user" size = {20} style = {{color : "orange"}}/>
                  </View> 
                  <View style={styles.picker}>
                    <Picker selectedValue = {this.state.gender}
                        onValueChange={this.Gender}
                        mode = 'dropdown'
                        color = "#c4c3cb"
                        style = {{marginBottom : 10}}
                    >
                      <Picker.Item label = "Gender" value = "G" color = "#c4c3cb"/>
                      <Picker.Item label = "Male" value = "M"/>
                      <Picker.Item label = "Female" value = "F"/>
                    </Picker>
                  </View>   
                </View>

                <View style = {styles.bundle}>
                  <View style = {styles.in}>
                    <Icon name = "user" size = {20} style = {{color : "orange"}}/>
                  </View>
                  <TextInput  placeholder="First Name" placeholderColor="#c4c3cb" style={styles.input} onChangeText = {(text) => this.setState({fname : text})}/>            
                </View>

                <View style = {styles.bundle}>
                  <View style = {styles.in}>
                    <Icon name = "user" size = {20} style = {{color : "orange"}}/>
                  </View>
                  <TextInput placeholder="Last Name" placeholderColor="#c4c3cb" style={styles.input} onChangeText = {(text) => this.setState({lname : text})}/>            
                </View> 
                </View>
                :
                <View>
                  <View style = {styles.bundle}>
                    <View style = {styles.in}>
                      <Icon name = "user" size = {20} style = {{color : "orange"}}/>
                    </View>
                    <TextInput placeholder="Business Name" placeholderColor="#c4c3cb" style={styles.input} onChangeText = {(text) => this.setState({bname : text})}/>            
                  </View> 
                </View>}

                {this.state.type == "R"?
                <View style = {styles.bundle}>
                  <View style = {styles.in}>
                    <Icon name = "car" size = {20} style = {{color : "orange"}}/>
                  </View> 
                  <View style={styles.picker}>
                    <Picker selectedValue = {this.state.means}
                        onValueChange={this.Means}
                        mode = 'dropdown'
                        color = "#c4c3cb"
                        style = {{marginBottom : 10}}
                    >
                      <Picker.Item label = "Type of transport" value = "T" color = "#c4c3cb"/>
                      <Picker.Item label = "Motorcycle" value = "motorcycle"/>
                      {/*<Picker.Item label = "Tricycle" value = "tricycle"/>*/}
                      <Picker.Item label = "Small pickup/lorry" value = "small_pickup"/>
                      <Picker.Item label = "Medium Lorry" value = "medium_lorry"/>
                      {/*<Picker.Item label = "Large lorry" value = "large"/>
                      <Picker.Item label = "Trailors" value = "trailor"/>*/}
                    </Picker>
                  </View>   
                </View>
                : <View></View>}

                <View style = {styles.bundle}>
                  <View style = {styles.in}>
                    <Icon name = "phone" size = {20} style = {{color : "orange"}}/>
                  </View>
                  <TextInput placeholder="Contact" placeholderColor="#c4c3cb" style={styles.input} onChangeText = {(text) => this.setState({contact : text})}/>            
                </View> 

                
                {this.state.type == "B" ?
                <View>
                  <View style = {styles.bundle}>
                    <View style = {styles.in}>
                      <Icon name = "home" size = {20} style = {{color : "orange"}}/>
                    </View>
                    <TextInput placeholder="Location e.g Kampala" placeholderColor="#c4c3cb" style={styles.input} onChangeText = {(text) => this.setState({location : text})}/>            
                  </View>

                  <View style = {styles.bundle}>
                    <View  style = {styles.in}>
                      <Icon name = "map-marker" size = {20} style = {{color : "orange"}}/>
                    </View>
                    <TextInput placeholder="Address e.g Ham Tower shop no.1" placeholderColor="#c4c3cb" style={styles.input} onChangeText = {(text) => this.setState({address : text})}/>            
                  </View>  
                </View>
                : <View></View>}

                <View style = {styles.bundle}>
                  <View style = {styles.in}>
                    <Icon name = "envelope" size = {20} style = {{color : "orange"}}/>
                  </View>
                  <TextInput placeholder="Email" placeholderColor="#c4c3cb" style={styles.input} onChangeText = {(text) => this.setState({email : text})}/>            
                </View>

                <View style = {styles.bundle}>
                  <View style = {styles.in}>
                    <Icon name = "lock" size = {20} style = {{color : "orange"}}/>
                  </View>
                  <TextInput placeholder="Password" secureTextEntry = {true} placeholderColor="#c4c3cb" style={styles.input} onChangeText = {(text) => this.setState({password : text})}/>            
                </View>

                <View style = {{
                  borderColor : this.state.color,
                  borderWidth : 1,
                  borderRadius : 10,
                  flexDirection : "row",
                  width : "95%",
                  alignItems : "center",
                  alignSelf : "center",
                  marginTop: 5,
                  marginBottom: 5,
                }}>
                  <View style = {styles.in}>
                    <Icon name = "lock" size = {20} style = {{color : "orange"}}/>
                  </View>
                  <TextInput placeholder="Confirm Password" secureTextEntry = {true} placeholderColor="#c4c3cb" style={styles.input} 
                  onChangeText = {(text) => {
                    if(this.state.password == text){
                      this.setState({color : "green"});
                    }else{
                      this.setState({color : "red"});
                    }
                  }}/>            
                </View>

                <View style = {styles.terms}>
                  <CheckBox
                    value = {this.state.terms}
                    tintColors = {true ? "#3399ff" : "#3399ff" }
                    onValueChange = {(text) => {this.setState({terms : text})}}
                  />
                  <Text style = {{color : "#3399ff"}} onPress = {() => Linking.openURL("https://www.goxpres.com/terms-conditions.html")}>Agree to our terms and conditions</Text>            
                </View>

                <Button block style = {styles.signupButton}   onPress={this.state.color == "green" ? () => this.Check() : () => {}}>
                {this.state.loading == false ? <Text style ={styles.btntxt}>Sign up</Text> :
                <ActivityIndicator color = "white"/>}
                </Button>

                <View style = {styles.signup}>
                  <Text>Already have an account?  |  </Text>
                  <TouchableOpacity onPress = {() => {Actions.login()}}>
                    <Text style = {{color : "orange"}}>Sign in</Text>
                  </TouchableOpacity>
                </View>
            </View>
        </ScrollView>           
      </View>
    );
  }
}

const styles= StyleSheet.create({
    signup : {
        alignSelf : "center",
        flexDirection : "row",
        fontFamily : 'Rounded_Elegance',
      },
  
    bundle : {
      borderColor : "#3399ff",
      borderRadius : 10,
      borderWidth : 1,
      flexDirection : "row",
      width : "95%",
      alignItems : "center",
      alignSelf : "center",
      marginTop: 5,
      marginBottom: 5,
    },

    terms : {
      flexDirection : "row",
      width : "95%",
      alignItems : "center",
      marginTop: 5,
      marginBottom: 5,
    },

    in : {
     justifyContent : "center",
     alignItems : "center",
     height : 40,
     width : 30,
     //backgroundColor : "white",
     borderTopLeftRadius: 10,
     borderBottomLeftRadius: 10,
    },

    heading : {
      textAlign : "center",
      fontFamily : "TypoSlab Irregular shadowed_demo",
      fontSize : 35,
      marginTop : 25,
      color : "#00ace6"
    },

    input : {
        height: 45,
        width : "90%",
        fontSize: 14,
        paddingTop: 15,
        borderTopRightRadius: 10,
        borderBottomRightRadius: 10,
        //backgroundColor: '#fafafa',
        paddingLeft: 10,              
    },

    picker : {
      height: 40,
      width : "90%",
      fontSize: 14,
      borderTopRightRadius: 10,
      borderBottomRightRadius: 10,
      //backgroundColor: '#fafafa',
      paddingLeft: 10,  
      marginTop : -10    
    },


    signupButton: {
        justifyContent : "center",
        backgroundColor: '#3399ff',
        marginBottom : 18,
        borderRadius: 5,
        borderWidth : 1, 
        borderColor : "#3399ff",
        height: 45,
        width : "95%",
        alignSelf : 'center',
        marginTop : 10,    
      },
      
      btntxt : {
          //fontFamily : 'Rounded_Elegance',
          color : "white"
      }
})