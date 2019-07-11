import React, { Component } from 'react';
import Amplify, { Interactions } from 'aws-amplify'
import { ChatFeed, Message } from 'react-chat-ui'
// import { ChatBot, AmplifyTheme } from 'aws-amplify-react';
import awsmobile from './aws-exports';

Amplify.configure(awsmobile);

// Global values
const botName = "EPConversationalInterface";
// let currentImage = 'https://media.glassdoor.com/sqll/335095/elastic-path-software-squarelogo-1560283402257.png';

// TEMP - Sets a local storage variable for consumption.
localStorage.setItem('oauth', 'd3df9ce9-42c2-4a62-8e7a-2e216bdcec69');
// const authInput = "ep-auth " + localStorage.getItem('oauth');

// Imported default theme can be customized by overloading attributes
// const myTheme = {
//   ...AmplifyTheme,
//   sectionHeader: {
//     ...AmplifyTheme.sectionHeader,
//     backgroundColor: '#00A2DE'
//   }
// };

class App extends Component {
  // Set intial state of chatbot
  state = {
    input: '',
    finalMessage: '',
    messages: [
      new Message({
        id: 1,
        message: "Welcome back to EP! How may I assist?",
      })
    ]
  }

  // Handle the enter key sending messages
  _handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      this.submitMessage()
    }
  }

  // Track the active state of the bot
  onChange(e) {
    this.setState({
      input: e.target.value
    })
  }

  // Performs actions of using Interactions.send(botName, targetInput)
  async submitMessage() {
    // Get the current message from input field
    const { input } = this.state
    if (input === '') return

    // Create new user Message component, add it to the array
    const message = new Message({
      id: 0,
      message: input,
    })
    let messages = [...this.state.messages, message]

    // Clear input field and update message array
    this.setState({
      messages,
      input: ''
    })

    // Send input to Lex
    const response = await InvokeIntent(input);

    // CUSTOM - Check for response card, log imageUrl
    if (response.responseCard) {
      console.log(response.responseCard.genericAttachments[0].imageUrl);
      // currentImage = response.responseCard.genericAttachments[0].imageUrl;
    }

    // Create new bot message from response, add it to the array
    const responseMessage = new Message({
      id: 1,
      message: response.message
    })
    messages  = [...this.state.messages, responseMessage]
    this.setState({ messages })

    // CUSTOM - Display final message upon transaction completion.
    if (response.dialogState === 'Fulfilled') {
      if (response.intentName === 'CheckoutCartIntent') {
        const finalMessage = response.message
        this.setState({ finalMessage })
      }
    }
  }

  // <img style={styles.img} src={currentImage} alt="Product" />

  render() {
    // Model authentication can no longer be performed during render time.
    // InvokeIntent(authInput);
    return (
      <div className="App">
        <header style={styles.header}>
          <p style={styles.headerTitle}>Elastic Path Assistant</p>
        </header>
        <div style={styles.messagesContainer}>
        <h2>{this.state.finalMessage}</h2>
        <ChatFeed
          messages={this.state.messages}
          hasInputField={false}
          bubbleStyles={styles.bubbleStyles}
        />
        
        <input
          onKeyPress={this._handleKeyPress}
          onChange={this.onChange.bind(this)}
          style={styles.input}
          value={this.state.input}
        />
        </div>
      </div>
    );
  }
}

// This function calls the intent defined by @param modelInput.
async function InvokeIntent(utterance) {
  const response = await Interactions.send(botName, utterance);
  console.log("Coming from InvokeIntent", response);
  Interactions.onComplete(botName, handleCompleteIntent);
  return response;
}

// Function for handling external fulfillent of Lex Intents
const handleCompleteIntent = function (err, confirmation) {
  if (err) {
      console.log('Conversation failed...');
      return;
  }
  return 'Conversation success!';
}

const styles = {
  bubbleStyles: {
    userBubble: {
      borderRadius: 10,
      padding: 12,
      backgroundColor: '#FFFFFF'
    },
    chatbubble: {
      borderRadius: 10,
      padding: 12
    },
    text: {
      fontSize: 20,
      color: `black`
    }
  },
  headerTitle: {
    color: 'white',
    fontSize: 22
  },
  header: {
    backgroundColor: 'rgb(0, 132, 255)',
    padding: 20,
    borderTop: '12px solid rgb(0,100,222)'
  },
  messagesContainer: {
    display: 'flex',
    flexDirection: 'column',
    padding: 10,
    alignItems: 'center',
  },
  input: {
    fontSize: 16,
    padding: 10,
    outline: 'none',
    width: 350,
    border: 'none',
    borderBottom: '2px solid rgb(0, 132, 255)'
  },
  img: {
    height: `200px`,
    width : `200px`,
    alignItems: 'center',
  }
}

export default App;