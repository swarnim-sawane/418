// config/geofirestore.js
const { GeoFirestore } = require('geofirestore');
const { db } = require('./firebase');  // import Firebase instance

const geofirestore = new GeoFirestore(db);

module.exports = { geofirestore };
