var test = require('./source.js');
var fs = require('fs');
var googleMapsClient = require('@google/maps').createClient({
    key: 'AIzaSyCYznzc9-ziRBYJ4gJ5kexB2ypESGfzrLo'
})


function groupPostcodes() {
    const regex = /BT\d+/g;
    postcodes = {};
    test.forEach((source) => {
        let match = regex.exec(source);
        if (match) {
            if (match[0].indexOf('0') == 2) {
                match = match[0].replace('0', '');
            }
            if (postcodes[match]) {
                postcodes[match].push(source);
            } else {
                postcodes[match] = [source];
            }
        }

    });
    console.log(Object.keys(postcodes).length);
    return postcodes;
}

function postcodeMoney() {
    let money = {};
    let postcodes = groupPostcodes();
    Object.keys(postcodes).forEach((postcode) => {
      money[postcode] = {
          claimants: postcodes[postcode]
      };
      let total = 0;
      postcodes[postcode].forEach((claimant) => {
          let regex = /\£.+/;
          let value = regex.exec(claimant);

          if (value) {
              value = parseFloat(value[0].substr(1).replace(/,/g, ''));
              total = total + value;
          } else {
              console.log('error', claimant);
          }
      });
        money[postcode].total = total.toString();
    });
    return money;
}


function checkValid () {
    let regex = /\£.+/;
    test.forEach((source) => {
        let match = regex.exec(source);

        if (!match) {
            console.log('*** no match ***', source, match);
        }
    });
}


function geocode() {
    var postCodes = postcodeMoney();
    console.log(Object.keys(postCodes).length);
    var locations = [];
    for (let i = 0; i < Object.keys(postCodes).length; i++) {
        if ((i+1) % 49 == 0) {
            sleep(1000);
        }
        let postcode = Object.keys(postCodes)[i];

        console.log('getting', postcode);
        googleMapsClient.geocode({address: postcode}, (err, response) => {
           if (!err) {
               results = response.json.results;
               locations.push({
                   locationData: results,
                   postCode: postcode,
                   claimants: postCodes[postcode].claimants,
                   total: postCodes[postcode].total
               })
           } else {
               console.log("error ", err);
           }

           if ((i + 1) == Object.keys(postCodes).length) {
               console.log(locations.length + ' requests made');
               fs.writeFile("./output.json", JSON.stringify(locations), function(err) {
                   if(err) {
                       return console.log(err);
                   }
                   console.log("The file was saved!");
               });
           }
        });

    }

}

function sleep(time) {
    console.log('sleeping');
    var stop = new Date().getTime();
    while(new Date().getTime() < stop + time) {
        ;
    }
}

function getData() {
    fs = require('fs')
    fs.readFile('./output.json', 'utf8', function (err,data) {
        if (err) {
            return console.log(err);
        }
        let places = JSON.parse(data);

        console.log(places.length);
        places.forEach((place => {
            if (place.locationData.length !== 1)
                console.log(place.locationData.length, place.postCode);
        }))
    });
}


geoCodeSingle("BT9 Belfast");

function geoCodeSingle(postcode){
    console.log('getting', postcode);
    googleMapsClient.geocode({address: postcode}, (err, response) => {
        if (!err) {
            console.log(response.json.results,  JSON.stringify(response.json.results));
        } else {
            console.log("error ", err);
        }

    });
}