import { Injectable } from '@angular/core';
import * as firebase from 'firebase';

@Injectable()
export class MessagingService {

    private messaging: any;

    constructor() {
        this.messaging = firebase.messaging();
        navigator.serviceWorker.getRegistration()
            .then(registration => this.messaging.useServiceWorker(registration))
            .catch(error => console.log('Messaging error - no service worker found', error));

        this.messaging.requestPermission()
            .then(() => {
                console.log('Notification permission granted.');
                this.getToken();
            })
            .catch(err => {
                console.log('Unable to get permission to notify.', err);
            });

        this.messaging.onTokenRefresh(function () {
            this.messaging.getToken()
                .then(function (refreshedToken) {
                    console.log('Token refreshed.');
                    // Indicate that the new Instance ID token has not yet been sent to the
                    // app server.
                    // setTokenSentToServer(false);
                    // // Send Instance ID token to app server.
                    // sendTokenToServer(refreshedToken);
                    // ...
                })
                .catch(function (err) {
                    console.log('Unable to retrieve refreshed token ', err);
                    // showToken('Unable to retrieve refreshed token ', err);
                });
        });

    }

    getToken() {
        return this.messaging.getToken()
            .then(function (currentToken) {
                if (currentToken) {
                    console.log(currentToken);
                    //   sendTokenToServer(currentToken);
                    //   updateUIForPushEnabled(currentToken);
                } else {
                    // Show permission request.
                    console.log('No Instance ID token available. Request permission to generate one.');
                    // Show permission UI.
                    //   updateUIForPushPermissionRequired();
                    //   setTokenSentToServer(false);
                }
            })
            .catch(function (err) {
                console.log('An error occurred while retrieving token. ', err);
                // showToken('Error retrieving Instance ID token. ', err);
                // setTokenSentToServer(false);
            });
    }

}

