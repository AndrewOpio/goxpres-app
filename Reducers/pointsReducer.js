import {combineReducers} from 'redux';

const INITIAL_STATE = {
    pickup : '',
    plat : 0,
    plng : 0,
    //dropoff :[],
    dropoff : '',
    dlat : 0,
    dlng : 0,
    driver : "",
    customer : "",
    id : "",
    distance : 0.0,
    cost : 0.0,
    riderlat : 0,
    riderlng : 0,
    connection : "false"
};

const pointsReducer = (state = INITIAL_STATE, action) =>{
    switch(action.type){
        case 'ADD_PICKUP':
            return {
               ...state,
               pickup : action.payload.pickup,
               plat : action.payload.lat,
               plng : action.payload.lng,
            };  

        case 'ADD_DROPOFF':
            return {
               ...state,
               dropoff : action.payload.dropoff,
               dlat : action.payload.lat,
               dlng : action.payload.lng,
            }; 

        case 'ADD_PARTIES':
            return {
                ...state,
                driver : action.payload.driver,
                customer : action.payload.customer,
            };

        case 'DELETE_PARTIES':
            return {
                ...state,
                driver : "",
                customer : "",
            }; 

        case 'ADD_DETAILS':
            return {
                ...state,
                id : action.payload.id,
                cost : action.payload.cost,
                distance : action.payload.distance,
            };

        case 'ADD_COORDS':
            return {
                ...state,
                riderlat : action.payload.lat,
                riderlng : action.payload.lng,
            };

        case 'CONN_STATUS':
            return {
                ...state,
                connection : action.payload.connection,
            };
    
        default:
          return state;
    }
};

export default combineReducers({
  points : pointsReducer
});







































































































