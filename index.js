// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';

const functions = require('firebase-functions');
const { dialogflow, BasicCard, Image } = require('actions-on-google');
const fetch = require('isomorphic-fetch');

process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements

const BACKGROUND_IMAGE =
  'https://cdn.dribbble.com/users/940359/screenshots/4129769/mercury.jpg';

const app = dialogflow({ debug: true });

const getRetrogradeStatus = (conv) => {
  console.log('Fetching retrograde status.');
  return fetch('https://mercuryretrogradeapi.com')
    .then((response) => {
      if (response.status < 200 || response.status >= 300) {
        throw new Error(response.statusText);
      } else {
        return response.json();
      }
    })
    .then((data) => {
      const message = data.is_retrograde
        ? 'Mercury is in retrograde.'
        : "Mercury is not in retrograde. It's your fault.";
      conv.ask(message);
      if (conv.screen) {
        conv.ask(
          new BasicCard({
            text: message,
            image: new Image({
              url: BACKGROUND_IMAGE,
              alt: 'Image of Mercury in retrograde',
            }),
          })
        );
      }
    });
};
const getNextRetrogradeDate = (conv) => {
  console.log('Fetching next retrograde date.');
  return fetch('https://www.ismercuryinretrograde.com/')
    .then((response) => {
      if (response.status < 200 || response.status >= 300) {
        throw new Error(response.statusText);
      } else {
        return response.text();
      }
    })
    .then((data) => {
      const startIndex = data.indexOf('<strong>') + 8;
      const endIndex = data.indexOf('</strong>');
      const message = data.substring(startIndex, endIndex);
      conv.ask(message);
    });
};

app.intent('Is mercury in retrograde?', getRetrogradeStatus);
app.intent('When will it be in retrograde?', getNextRetrogradeDate);
app.fallback((conv) => {
  conv.ask(`I couldn't understand. Can you say that again?`);
});

exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);
