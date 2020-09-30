

process.env.CORTEX_URL = 'https://reference80.epdemos.com/cortex';
process.env.SCOPE = 'vestri';

const index = require('./index');

function sendEvent(event, context) {
  console.log();
  console.log('======== Sending event ========');

  const result = index.handler(event, context, (err, cbResult) => {
    console.log();
    console.log('Callback:');

    if (err) {
      console.log(`  Error:`);
      console.log(`  ${err.stack}`);
    } else {
      console.log(JSON.stringify(cbResult, null, 2));
    }
  });

  console.log();
  console.log(`Final result: ${JSON.stringify(result, null, 2)}`);
}

// sendEvent({
//   sessionAttributes: {
//     sum: 3
//   },
//   currentIntent: {
//     name: 'AddNumbers',
//     slots: {
//       numValue: 2
//     }
//   }
// });

sendEvent({
  sessionAttributes: {
    token: '8fdbe84c-9625-4be7-9055-e91d6a2fedbd'
  },
  currentIntent: {
    // confirmationStatus: 'Confirmed',
    name: 'ReorderIntent',
    slots: {
      numValue: 2
    }
  }
});

