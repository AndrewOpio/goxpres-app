import  React, { Component } from "react";
import {
    Text,
    View,
    StyleSheet,
    TouchableOpacity,
} from "react-native";

export default class Radio extends Component{
    constructor(props){
        super(props);
        this.state = {

        };
    }

    render(){
        return(
            <View style ={{
                height : 20,
                width : 20, 
                borderRadius : 12,
                borderWidth : 1.5,
                borderColor : '#004d99',
                alignItems : "center",
                justifyContent : "center",
                marginTop : 2
                }}>
                <View style = {{
                    height : 10,
                    width : 10,
                    borderRadius : 6,
                    backgroundColor : '#004d99'
                }}/>
            </View>
        );
    }
}