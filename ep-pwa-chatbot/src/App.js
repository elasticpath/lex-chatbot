import React, { Component } from 'react';
import Amplify, { Interactions } from 'aws-amplify';
import { ChatBot, AmplifyTheme } from 'aws-amplify-react';
import awsmobile from './aws-exports';

Amplify.configure(awsmobile);

// Imported default theme can be customized by overloading attributes
const myTheme = {
  ...AmplifyTheme,
  sectionHeader: {
    ...AmplifyTheme.sectionHeader,
    backgroundColor: '#00A2DE'
  }
};

class App extends Component {
  handleComplete(err, confirmation) {
    if (err) {
      alert('Conversation failed...');
      return;
    }
    return 'Conversation success!';
  }

  render() {
    // Model authentication can be performed during render time.
    // AuthenticateModel();
    return (
      <div className="App">
        <ChatBot
          title="Elastic Path Assistant"
          theme={myTheme}
          botName="EPConversationalInterface"
          onComplete={this.handleComplete.bind(this)}
          welcomeMessage={"Welcome back to EP! How may I assist?"}
          clearOnComplete={true}
          voiceEnabled={false}
          conversationModeOn={false}
        />
      </div>
    );
  }
}

// This function should be called upon render to initiate an auth intent.
// If not called, the chatbot service will require initialization to generate a bearer token as a public shopper
async function AuthenticateModel() {
  // TEMP - Sets a local storage variable for consumption.
  localStorage.setItem('oauth', 'e96b9ab6-c834-48f3-a40a-1574a5175f38');

  // The required format for an auth request (with a given token) is [ep-auth authToken].
  let authInput = "ep-auth " + localStorage.getItem('oauth');

  // Interactions.send(targetBot, textInput) is used to interact with the model programatically
  const response = await Interactions.send("EPConversationalInterface", authInput);
  console.log(response.message);

  Interactions.onComplete("EPConversationalInterface", handleComplete);
}

// Function for handling external fulfillent of Lex Intents
const handleComplete = function (err, confirmation) {
  if (err) {
      console.log('Conversation failed...');
      return;
  }
  console.log('done: ' + JSON.stringify(confirmation, null, 2));

  return 'Conversation success!';
}

export default App;
