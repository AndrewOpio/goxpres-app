import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Icon from 'react-native-vector-icons/FontAwesome';
import {Actions} from 'react-native-router-flux';
import Geocoder from 'react-native-geocoding';
navigator.geolocation = require('@react-native-community/geolocation');

import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableHighlight,
  View,
  Image
} from 'react-native';

class PlacesInput extends Component {
  state = {
    query: this.props.query || '',
    places: [],
    showList: false,
    isLoading: false,
    lat : '',
    lng : '',
    name : ''
  };

  timeout = null;

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.query !== this.props.query) {
      this.setState({
        query: this.props.query
      }, () => {
        this.fetchPlaces()
      })
    }
  }


  componentDidMount() {
    if (this.props.query) {
      this.fetchPlaces()
    }
  }

  
  //Gettting users' location
  getYourLocation = () =>{
    navigator.geolocation.getCurrentPosition(
      (position) => {
         var latitude = position.coords.latitude;
         var longitude = position.coords.longitude; 
         const API_KEY = "AIzaSyCtP83M_as6WCFor-AYOqX_2RawYqxThMg";
         Geocoder.init(API_KEY);

         Geocoder.from( latitude, longitude)
         .then(json => {
           var place = json.results[0].formatted_address;
           this.props.place(place, latitude, longitude);
         })
         .catch(error =>{
            //console.warn(error)
           }
         );

        },
      (error) => {
         //console.warn(error)
      },
      {enableHighAccuracy : false, timeout : 15000, maximumAge : 10000 }
    );
  }




  render() {
    return (
      <View style={[styles.container, this.props.stylesContainer]}>
        <View style = {{flexDirection : "row", alignSelf : "center"}}>

          <TouchableHighlight underlayColor = {"#fff"} style = {styles.back} onPress = {() => {Actions.deliveryhome()}}>
            <Image  style = {{height : 18, width : 18, alignSelf : "center"}} source = {require('../Resources/arrow.png')}/>
          </TouchableHighlight>
          <TextInput
            placeholder={this.props.placeHolder}
            style={[styles.input, this.props.stylesInput]}
            onChangeText={query => {
              this.setState({query}, () => {
                this.onPlaceSearch();
                this.props.onChangeText && this.props.onChangeText(query, this);
              });
            }}
            value={this.state.query}
            onFocus={() => this.setState({showList: true})}
            onBlur={() => this.setState({showList: false})}
            {...this.props.textInputProps}
            clearButtonMode="always"
          />
           <View style = {styles.add}>
            <Icon name = "map-marker" size = {20}color = {"#00ace6"} />
          </View>
        </View>
        {this.state.showList && (
          <View
            style={[styles.scrollView, this.props.stylesList]}
            keyboardShouldPersistTaps="always"
          >
            {this.props.contentScrollViewTop}
            {this.state.isLoading && (
              /*<ActivityIndicator
                size="small"
                style={[styles.loading, this.props.stylesLoading]}
              /> */   
              this.state.places.length > 0 ?      
                <Text style = {{color : "#999999", textAlign : "center", marginBottom : 15}}>Loading...</Text>
              :
              <Text style = {{color : "#999999", textAlign : "center", marginBottom : 15}}>Searching...</Text>  
          )}
            
            {this.state.places.length > 0 ?
              <TouchableOpacity
              style={[styles.place, this.props.stylesItem]}
              onPress={() => this.getYourLocation()}
              >
                <Text style={[styles.placeText, this.props.stylesItemText]}>
                  Your location
                </Text>
                <View style = {{flex : 1}}>
                   {this.props.iconResult}
                </View>
               </TouchableOpacity>
            :<View></View>
            }

            {this.state.places.map(place => {
              return (
                <TouchableOpacity
                  key={`place-${place.place_id || place.id}`}
                  style={[styles.place, this.props.stylesItem]}
                  onPress={() => this.onPlaceSelect(place.place_id, place)}
                >
                  <Text style={[styles.placeText, this.props.stylesItemText]}>
                    {this.props.resultRender(place)}
                  </Text>
                  <View style = {{flex : 1}}>
                     {this.props.iconResult}
                  </View>
                </TouchableOpacity>
              );
            })}
            {this.props.contentScrollViewBottom}
          </View>
        )}
      </View>
    );
  }

  onPlaceSearch = () => {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(this.fetchPlaces, this.props.requiredTimeBeforeSearch);
  };

  buildCountryQuery = () => {
    const {queryCountries} = this.props;

    if (!queryCountries) {
      return '';
    }

    return `&components=${queryCountries.map(countryCode => {
      return `country:${countryCode}`;
    }).join('|')}`;
  };

  buildLocationQuery = () => {
    const {searchLatitude, searchLongitude, searchRadius} = this.props;

    if (!searchLatitude || !searchLongitude || !searchRadius) {
      return '';
    }

    return `&location=${searchLatitude},${searchLongitude}&radius=${searchRadius}`;
  };

  buildTypesQuery = () => {
    const {queryTypes} = this.props;

    if (!queryTypes) {
      return '';
    }

    return `&types=${queryTypes}`;
  };

  buildSessionQuery = () => {
    const {querySession} = this.props;

    if (querySession) {
      return `&sessiontoken=${querySession}`
    }

    return ''
  };

  fetchPlaces = async () => {
    if (
      !this.state.query ||
      this.state.query.length < this.props.requiredCharactersBeforeSearch
    ) {
      return;
    }
    this.setState(
      {
        showList: true,
        isLoading: true,
      },
      async () => {
        const places = await fetch(
          `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${
            this.state.query
          }&key=${this.props.googleApiKey}&inputtype=textquery&language=${
            this.props.language
          }&fields=${
            this.props.queryFields
          }${this.buildLocationQuery()}${this.buildCountryQuery()}${this.buildTypesQuery()}${this.buildSessionQuery()}`
        ).then(response => response.json());

        this.setState({
          isLoading: false,
          places: places.predictions,
        });
      }
    );
  };

  onPlaceSelect = async (id, passedPlace) => {
    const {clearQueryOnSelect} = this.props;
    this.setState({
      isLoading: true,
    }, async () => {
      try {
        const place = await fetch(
          `https://maps.googleapis.com/maps/api/place/details/json?placeid=${id}&key=${this.props.googleApiKey}&fields=${this.props.queryFields}&language=${this.props.language}${this.buildSessionQuery()}`
        ).then(response => response.json());

        var lat = place.result.geometry.location.lat;
        var lng = place.result.geometry.location.lng;
        //var nme = place.result.formatted_address;
        var name = place.result.name;

        this.props.place(name, lat, lng);

        return this.setState(
          {
            showList: false,
            isLoading: false,
            query: clearQueryOnSelect ? '' :
              place &&
              place.result &&
              (place.result.formatted_address || place.result.name),
          },
          () => {
            return this.props.onSelect && this.props.onSelect(place);

          }

          
        );
      } catch (e) {
        return this.setState(
          {
            isLoading: false,
            showList: false,
            query: passedPlace.description,
          },
          () => {
            return this.props.onSelect && this.props.onSelect(passedPlace);
          }
        );
      }
    });
  };
}

PlacesInput.propTypes = {
  clearQueryOnSelect: PropTypes.bool,
  contentScrollViewBottom: PropTypes.node,
  contentScrollViewTop: PropTypes.node,
  stylesInput: PropTypes.object,
  stylesContainer: PropTypes.object,
  stylesList: PropTypes.object,
  stylesItem: PropTypes.object,
  stylesItemText: PropTypes.object,
  stylesLoading: PropTypes.object,
  resultRender: PropTypes.func,
  query: PropTypes.string,
  queryFields: PropTypes.string,
  queryCountries: PropTypes.array,
  queryTypes: PropTypes.string,
  querySession: PropTypes.string,
  searchRadius: PropTypes.number,
  searchLatitude: PropTypes.number,
  searchLongitude: PropTypes.number,
  googleApiKey: PropTypes.string.isRequired,
  placeHolder: PropTypes.string,
  textInputProps: PropTypes.object,
  iconResult: PropTypes.any,
  iconInput: PropTypes.any,
  language: PropTypes.string,
  onSelect: PropTypes.func,
  onChangeText: PropTypes.func,
  requiredCharactersBeforeSearch: PropTypes.number,
  requiredTimeBeforeSearch: PropTypes.number,
};

PlacesInput.defaultProps = {
  stylesInput: {},
  stylesContainer: {},
  stylesList: {},
  stylesItem: {},
  stylesLoading: {},
  stylesItemText: {},
  queryFields: 'formatted_address,geometry,name',
  placeHolder: 'Search places...',
  textInputProps: {},
  language: 'en',
  resultRender: place => place.description,
  requiredCharactersBeforeSearch: 2,
  requiredTimeBeforeSearch: 1000,
};

const styles = StyleSheet.create({
  container: {
    alignSelf : "center",
    position: 'absolute',
    top: 10,
    //left: 10,
    //right: 10,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  input: {
    height: 50,
    backgroundColor: '#fff',
    //paddingHorizontal: 10,
    paddingTop: 10
  },
  
  scrollView: {
    backgroundColor: '#fff',
  },
  place: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    padding: 15,
    position: 'relative',
    zIndex: 10001,
  },
  placeIcon: {
    position: 'absolute',
    top: 10,
    right: 15,
    color: 'rgba(0,0,0,0.3)',
  },
  placeText: {
    color: 'rgba(0,0,0,0.8)',
    paddingRight: 60,
  },
  loading: {
    margin: 10,
  },
  back : {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    //elevation: 5,
    backgroundColor:"#fff",
    width : "10%",
    height : 50,
    borderTopLeftRadius:5,
    borderBottomLeftRadius:5,
    alignItems : 'center',
    justifyContent : "center",
  },

  add : {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    //elevation: 5,
    backgroundColor:"#fff",
    width : "12%",
    height : 50,
    borderTopRightRadius:5,
    borderBottomRightRadius:5,
    alignItems : 'center',
    justifyContent : "center",
  }
});

export default PlacesInput;













































