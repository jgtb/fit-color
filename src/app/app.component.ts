import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { OneSignal } from '@ionic-native/onesignal';

import { AuthProvider } from '../providers/auth/auth';

import { LoginPage } from '../pages/login/login';
import { DashboardPage } from '../pages/dashboard/dashboard';

import { Util } from '../util';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage: any = LoginPage;

  constructor(
    platform: Platform,
    statusBar: StatusBar,
    splashScreen: SplashScreen,
    public oneSignal: OneSignal,
    public authProvider: AuthProvider,
    public util: Util) {
    platform.ready().then(() => {
      this.appConfig();
      this.setRoot();
      statusBar.styleDefault();
      splashScreen.hide();
    });
  }

  appConfig() {
    const key = 'Moov';

    this.authProvider.appConfig().subscribe(
      data => {
        const config = data.filter(elem => elem.key === key)[0];
        this.allowPushNotification(config);
      });
  }

  allowPushNotification(config) {
    this.oneSignal.startInit(config.oneSignalId, config.fireBaseId);

    this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.InAppAlert);

    //this.oneSignal.handleNotificationReceived().subscribe(data => {
      //alert('Received');
    //});

    //this.oneSignal.handleNotificationOpened().subscribe(data => {
      //alert('Opened');
    //});

    this.oneSignal.endInit();
  }

  setRoot() {
    if (!this.util.isLogged()) {
      this.rootPage = LoginPage;
      return true;
    }

    this.rootPage = DashboardPage;
  }

}
