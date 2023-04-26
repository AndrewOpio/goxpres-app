import React, {useState} from 'react';
import {SafeAreaView, Text, StyleSheet, View, TouchableOpacity, ScrollView} from 'react-native';
import RNOtpVerify from 'react-native-otp-verify';

import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from 'react-native-confirmation-code-field';


const CELL_COUNT = 5;

export default class Confirmation extends React.Component {
  constructor(props){
      super(props);
      this.state = {
        value : "12345"
      }
  }
  
  componentWiilMount(){
    this.getHash();
    this.startListeningForOtp();
  }

  getHash = () =>
    RNOtpVerify.getHash()
    .then(console.log)
    .catch(console.log);

  startListeningForOtp = () =>
    RNOtpVerify.getOtp()
    .then(p => RNOtpVerify.addListener(this.otpHandler))
    .catch(p => console.log(p));

  otpHandler = () =>{
   const otp = /(\d{4})/g.exec(message)[1];
   //this.setState({otp});
   RNOtpVerify.removeListener();
   KeyboardEvent.dismiss();
   }


  setValue = (value) =>{
    this.setState({value : value})
  }

  render(){

    //const ref = useBlurOnFulfill({this.value, cellCount: CELL_COUNT});
   // const [props, getCellOnLayoutHandler] = useClearByFocusCell({
      //value,
      //setValue,
    //});

  return (
    <SafeAreaView style={styles.root}>
      <Text style={styles.title}>Verifcation</Text>
      <Text style={{fontFamily : 'Rounded_Elegance', color: "white", textAlign : "center"}}>A verification code has been sent to your registered number</Text>
      <CodeField
        //ref={ref}
        //{...props}
        value={this.state.value}
        onChangeText={this.setValue}
        cellCount={CELL_COUNT}
        rootStyle={styles.codeFieldRoot}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        renderCell={({index, symbol, isFocused}) => (
          <Text
            key={index}
            style={[styles.cell, isFocused && styles.focusCell]}>
            {symbol || (isFocused ? <Cursor /> : null)}
          </Text>
        )}
      />
      <View style = {styles.resend}>
        <Text style = {{fontFamily : 'Rounded_Elegance', color : "white"}}>Didnt get the code ?  |  </Text>
        <TouchableOpacity onPress = {() => {Actions.login()}}>
           <Text style = {{fontFamily : 'Rounded_Elegance', color : "orange"}}>Resend</Text>
        </TouchableOpacity>
       </View>
    </SafeAreaView>
  );
 }
}


const styles = StyleSheet.create({
  root: {
    flex: 1,
    padding: 20, 
    backgroundColor : "#00ace6",
    justifyContent : "center"
  },

  resend : {
    marginTop : 30,
    alignSelf : "center",
    flexDirection : "row",
    fontFamily : 'Rounded_Elegance',
  },

  title: {
      fontFamily : 'Rounded_Elegance',
      textAlign: 'center',
      fontSize: 30,
      color : "white",
      marginTop : -250
    },
  codeFieldRoot: {marginTop: 20},
  cell: {
    width: 40,
    height: 40,
    lineHeight: 38,
    fontSize: 24,
    borderWidth: 2,
    borderColor: '#ffffff',
    textAlign: 'center',
    backgroundColor : 'white'
  },
  focusCell: {
    borderColor: '#00ace6',
  },
});
  

