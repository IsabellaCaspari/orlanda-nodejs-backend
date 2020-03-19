  const username = "Lena";
  const text = new Object({
      welcomeEvent: {
          speech: "Hallo " + username + ", ich helfe dir deinen Kalender zu managen. Bitte gebe deinen Kalender für mich frei. Ich behandele deine Daten vertraulich. Verwende folgenden Link %s",
          displayText: "Hallo " + username + ", ich helfe dir deinen Kalender zu managen. Bitte gebe deinen Kalender für mich frei. Ich behandele deine Daten vertraulich. Verwende folgenden Link  %s",
          button: {
              title: "Willkommen, ich bin Orlanda \n",
              subtitle: "ich helfe dir deinen Kalender zu managen.\n Bitte gebe deinen Kalender frei.",
              buttonText: "Kalender freigeben"
          }
      },
      comeAgainEvent: {
          speech: "Hallo " + username + ", schön dass du wieder da bist. Was möchtest du machen?",
          displayText: "Hallo " + username + ", schön dass du wieder da bist. Was möchtest du machen?",
          quickReplay: {
              title: "Hallo " + username + ", schön dass du wieder da bist. Was möchtest du machen?",
              replie: [{
                  text: "Einführung"
              }, {
                  text: "Termine anzeigen"
              }, {
                  text: "Event erstellen"
              }]
          }
      },
      receiveAuthcode: {
          speech: "Herzlichen Dank " + username + ", du hast Orlanda Zugriff auf deine Kalenderdaten gewährt",
          displayText: "Herzlichen Dank " + username + ", du hast Orlanda Zugriff auf deinen Kalenderdaten gewährt.",
          quickReplay: {
              title: "Herzlichen Dank " + username + ", du hast Orlanda Zugriff auf deinen Kalenderdaten gewährt. Um zurück ins Menü zukommen sage 'Hallo', und ich weiß bescheid. Was möchtest du nun machen?",
              replie: [{
                  text: "Einführung"
              }, {
                  text: "Termine anzeigen"
              }, {
                  text: "Event erstellen"
              }]
          }
      },
      listEvents: {
          error: {
              speech: "Leider konnte der Termin nicht erfolgreich erstellt werden, probiere es nochmal :-(.",
              displayText: "Leider konnte der Termin nicht erfolgreich erstellt werden, probiere es nochmal :-(.",
          },
          speech: "Hier findest du deine Events:",
          displayText: "Hier findest du deine Events"
      },
      createGoogleEvent: {
          error: {
              speech: "Leider konnte der Termin nicht erfolgreich erstellt werden, probiere es nochmal :-(.",
              displayText: "Leider konnte der Termin nicht erfolgreich erstellt werden, probiere es nochmal :-(.",
          },
          button: {
              title: "Du hast erfolgreich ein Event erstellt\n",
              buttonText: "Hier gehts zum Event"
          }
      }
  });

  module.exports = {
      text
  };