// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';

const functions = require('firebase-functions');
const { dialogflow, BasicCard, Image } = require('actions-on-google');
const fetch = require('isomorphic-fetch');

process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements

const URL = 'https://mercuryretrogradeapi.com';
const BACKGROUND_IMAGE =
  'https://cdn.dribbble.com/users/940359/screenshots/4129769/mercury.jpg';

const app = dialogflow({ debug: true });

app.intent('Is mercury in retrograde?', (conv) => {
  // Note: Moving this fetch call outside of the app intent callback will
  // cause it to become a global var (i.e. it's value will be cached across
  // function executions).
  return fetch(URL)
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
      conv.close(message);
      if (conv.screen) {
        conv.close(
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
});

exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);
