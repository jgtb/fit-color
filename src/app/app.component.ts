import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { OneSignal } from '@ionic-native/onesignal';

import { AuthProvider } from '../providers/auth/auth';

import { LoginPage } from '../pages/login/login';
import { DashboardPage } from '../pages/dashboard/dashboard';

import { Util } from '../util';
import { Layout } from '../layout';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage: any = DashboardPage;

  constructor(
    platform: Platform,
    statusBar: StatusBar,
    splashScreen: SplashScreen,
    public oneSignal: OneSignal,
    public authProvider: AuthProvider,
    public util: Util,
    public layout: Layout) {
    platform.ready().then(() => {
      this.setLogo();
      this.setColor();
      this.setRoot();
      this.appConfig();
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
    this.oneSignal.endInit();
  }

  setRoot() {}

  setColor() {
    const ref = window.location.href;
    const url = new URL(ref);

    if (url.searchParams.get('colors')) {
      const colors = url.searchParams.get('colors').split(',');
      const keys = Object.keys(this.layout.colors);

      let layout = {dark: '', primary: '', secondary: '', terciary: '', danger: '', light: '', darklight: ''};
      keys.map((key, i) => layout[key] = colors[i]);

      this.layout.colors = layout;
    }
  }

  setLogo() {
    const ref = window.location.href;
    const url = new URL(ref);

    const logo = url.searchParams.get('id');

    this.util.setStorage('logo', logo);
  }

}
