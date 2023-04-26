import  React, { Component } from "react";
import {BacKAndroid, View, Alert, Text, StyleSheet, TouchableOpacity, Image, TouchableHighlight, TextInput, Dimensions} from 'react-native';
import Slideshow from 'react-native-slideshow';
import axios from 'axios';

export default class Slider extends Component {
    constructor(props) {
      super(props);
  
      this.state = {
        position: 1,
        interval: null,
        dataSource: [
          {
            title: 'MTN',
            caption: 'Everywhere you go',
            url: 'http://placeimg.com/640/480/any',
          },
          {
            title: 'MTN',
            caption: 'Everywhere you go',
            url: 'http://placeimg.com/640/480/any',
          }, {
            title: 'Title 2',
            caption: 'Caption 2',
            url: 'http://placeimg.com/640/480/any',
          }, {
            title: 'Title 3',
            caption: 'Caption 3',
            url: 'http://placeimg.com/640/480/any',
          },
        ],
      };
    }

    //getting adverts
    Adverts = () =>{
      axios.post('url', {
      })
      .then(function (response) {
        //handle request
        alert(JSON.stringify(response.data));
      })
      .catch(function (error){
        //hanadle error
        alert(error.message);
      })
    }
    
    componentWillMount() {
      this.Adverts();
      
      this.setState({
        interval: setInterval(() => {
          this.setState({
            position: this.state.position === this.state.dataSource.length-1 ? 0 : this.state.position + 1
          });
        }, 4000)
      });
    }
  
    componentWillUnmount() {
      clearInterval(this.state.interval);
    }
  
    render() {
      return (
      <Slideshow 
          dataSource={this.state.dataSource}
          height = {150}
          arrowSize = {0}
          indicatorColor = {"#ffffff"}
          indicatorSelectedColor = {"#00ccff"}
          position={this.state.position}
          onPositionChanged={position => this.setState({ position })} />
      );
    }
  }