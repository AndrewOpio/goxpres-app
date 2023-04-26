export const addPickup = (pickup, lat, lng) =>({
  type : "ADD_PICKUP",
  payload : {
    pickup,
    lat,
    lng
  }
});

export const addDropoff = (dropoff, lat, lng) =>({
  type : "ADD_DROPOFF",
  payload : {
    dropoff,
    lat,
    lng
  }
});

export const addParties = (driver, customer) =>({
  type : "ADD_PARTIES",
  payload : {
    driver,
    customer
  }
});


export const deleteParties = () =>({
  type : "DELETE_PARTIES", 
});


export const addDetails = (id, cost, distance) =>({
  type : "ADD_DETAILS",
  payload : {
   id,
   cost,
   distance
  }
});

export const addCoords = (lat, lng) =>({
  type : "ADD_COORDS",
  payload : {
   lat,
   lng,
  }
});

export const connStatus = (connection) =>({
  type : "CONN_STATUS",
  payload : {
    connection,
  }
});
