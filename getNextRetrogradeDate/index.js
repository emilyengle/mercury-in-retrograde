'use strict';

const functions = require('firebase-functions');
const { dialogflow } = require('actions-on-google');
const fetch = require('isomorphic-fetch');

process.env.DEBUG = 'dialogflow:debug';

const app = dialogflow({ debug: true });

const getNextRetrogradeDate = (conv) => {
  console.log('Fetching next retrograde date.');
  return fetch('https://www.ismercuryinretrograde.com/')
    .then((response) => {
      if (response.status < 200 || response.status >= 300) {
        throw new Error(response.statusText);
      } else {
        console.log('raw response', response);
        return response.json();
      }
    })
    .then((data) => {
      console.log('returned from page: ', data);
      conv.close('Working on it');
    });
};

app.intent('When is mercury in retrograde next?', getNextRetrogradeDate);
app.intent('When is it next?', getNextRetrogradeDate);
app.intent('When is mercury next in retrograde?', getNextRetrogradeDate);
app.intent('When is next?', getNextRetrogradeDate);
app.intent('When will it be in retrograde?', getNextRetrogradeDate);

exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);
