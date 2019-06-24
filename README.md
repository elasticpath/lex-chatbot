# EP Conversational Interface Quickstart Guide
This document exists as a work in progress, and will be continually expanded as more information becomes available.

## Table Of Contents
--

## Documentation Introduction
The EP Conversational Interface is an AWS Lex-based model that allows flexible deployment to a variety of conversational interfaces, including Facebook Messenger and Slack. This model communicates with Elastic Path's RESTful API, Cortex API, to leverage the e-commerce capabilities provided by Elastic Path.

This document is not a primer for JavaScript and is intended for professionals who are familiar with the following technologies:
* [Git](https://git-scm.com/downloads)
* [AWS Lambda Functions](https://aws.amazon.com/lambda/)
* [AWS Lex Models](https://aws.amazon.com/lex/)

## Overview

### Prerequisites
Ensure the following technologies have been installed:

* [Git](https://git-scm.com/downloads)
* [Node.js](https://nodejs.org/en/download/)
* A valid [Amazon Web Services (AWS) Account](https://us-west-2.console.aws.amazon.com/console/)
* A valid [Amazon Developer Account](https://developer.amazon.com/)

### Setting Up the Lambda Function
1. Clone or pull the `lex-chatbot` repository.
2. Navigate to the `ep-lambda-function` directory.
3. Zip up the contents of the current directory, including the `node_modules` folder.
4. In the Amazon Lambda Console, create a new Function called `EPConversationalLambda`.
5. Select Author From Scratch template.
6. Choose `Node.js 10.x` as the runtime language.
7. Under the Function Code pane, change Code Entry Type to "Upload a .zip folder".
8. Upload the newly zipped folder.
9. Under Environment Variables, add and set the following values:
  * CACHE_TABLE:    lex-cache
  * CORTEX_URL:     http://reference.epdemos.com/cortex
  * GRANT_TYPE:     password
  * GUID:           036e45fe-7003-4b9a-99f3-1c14944bf728
  * PASSWORD:       AlexaTest123
  * ROLE:           REGISTERED
  * SCOPE:          VESTRI
  * USERNAME:       jeff.wasty@elasticpath.com
10. Save the function.

### Setting Up the Lex Model
1. Clone or pull the `lex-chatbot` repository.
2. Send the `lex-model.json` file to a zip folder.
3. Navigate to the Amazon Lex console to view your bots.
  * NOTE: You must have at least one bot available in order to import an existing model.
            Simply create one of the pre-existing bots as a sample to access this feature.
4. Under the `Actions` dropdown, select "Import".
5. Upload the `lex-model.zip` file.

## Terms And Conditions
- Any changes to this project must be reviewed and approved by the repository owner. For more information about contributing, see the [Contribution Guide](https://github.com/elasticpath/facebook-chat/blob/master/.github/CONTRIBUTING.md).
- For more information about the license, see [GPLv3 License](https://github.com/elasticpath/facebook-chat/blob/master/LICENSE).