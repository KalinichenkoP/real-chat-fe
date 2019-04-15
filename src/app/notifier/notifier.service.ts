import {NotificationsService} from 'angular2-notifications';
import { Injectable } from '@angular/core';
import {Message} from "../models/message";

/**
 * Service that allows to show notification toasts.
 * Actually is just a wrapper above 'angular2-notifications'.
 */
@Injectable({
  providedIn: 'root'
})
export class NotifierService {
    constructor (
        private notificationService: NotificationsService
    ) {
    }

    /**
     * Show notification about action that succeeded.
     */
    message (message: Message, icon: string) {
      console.log(message);
        Notification.requestPermission()
          .then(permission =>  {
            console.log(permission);
            if (permission === 'granted') {
              console.log(icon);
              new Notification(message.text, {icon: icon});
          } else {
              this.notificationService.info("", message, {
                timeOut: 3000,
                showProgressBar: false
              });
            }
          });
    }    /**
     * Show notification about action that succeeded.
     */
    success (message: string) {
        this.notificationService.success("", message, {
            timeOut: 3000,
            showProgressBar: false
        });
    }

    /**
     * Show notification about action that failed.
     */
    failure (message: string) {
        this.notificationService.error("", message, {
            timeOut: 3000,
            showProgressBar: false
        });
    }

    // noinspection JSMethodCanBeStatic
    /**
     * Print information to console.
     */
    debug (message: string) {
        console.info(message);
    }
}
