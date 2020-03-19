# orlanda-nodejs-backend

This project was created as part of my bachelor thesis. It is a facebook chatbot, which can access your google calendar and create new appointments.
Here you can find the nodejs backend, how you build the whole project, I have explained briefly.

This is a nodejs backend for a chatbot. The backend takes care of the connection to the GoogleCalenderAPI and stores the oauth2 token in a database.


## Getting Started
- create your own NPL with dialogflow
- create your own facebook Page 
- connect Facebook Page with your own Dialogflow Webhook
- receive post from the dialogflow npl and create events with the google calender api


## Create your own Dialogflow Webhook
[Dialogflow Setup](https://dialogflow.com/docs/integrations/actions/setup)

## First build your onw Facebook Page
To build a Facebook bot, you first need a Facebook account, with which you log in to Facebook and create a new Facebook page or use an existing one. 
A Facebook account is linked to a private profile. The difference between a private Facebook profile and a Facebook page is that a private profile requires a real full name. 
A page represents a company, a brand, an organization or a famous person. To manage a page, the administrator needs a private account. 
To create a Facebook bot, a Facebook developer account is required. You have to verify this with your private Facebook account.

## Connect Facebook Page with your own Webhook
The Facebook developer portal also offers Webhooks. A webhook refers to a non-standard communication to a server.  
The Webhook forwards the messages, which are sent to the Facebook page in JSON format, to a registered serve, this JSON object contains a text message with the text content 
"hello world!" and information about sender and recipient. For the implementation of the concept, 
the Facebook page is linked with the Webhook of Dialogflow. This means that all messages sent to the Facebook page are forwarded in JSON format to the Dialogflow Webhook.

## Connect the Dialogflow to the nodejs backend (this git repo)
The Web service receives a POST request from Dialogflow, to which the Web service can respond within 60 seconds. 
The URL of the Web hook must be publicly available and the Web service must have the following endpoint:\webhook.
Now the server can get a message from Dialogflow.


#### Useful links
- [Google Calendar](https://developers.google.com/calendar)
- [OAuth2](https://console.developers.google.com/apis)
- [MongoDB](https://www.mongodb.com/de)
- [Dialogflow](https://dialogflow.com/)

### Written by

Isabella Caspari
