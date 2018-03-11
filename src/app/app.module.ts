import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';

import { Vibration } from '@ionic-native/vibration'
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { Network } from '@ionic-native/network';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { OneSignal } from '@ionic-native/onesignal';
import { Facebook } from '@ionic-native/facebook';
import { NativeAudio } from '@ionic-native/native-audio';
import { Badge } from '@ionic-native/badge';

import { IonicImageLoader } from 'ionic-image-loader';
import { NgCalendarModule  } from 'ionic2-calendar';

import { MyApp } from './app.component';

import { PagesModule } from '../pages/pages.module';
import { ProvidersModule } from '../providers/providers.module';

import { HttpModule } from '@angular/http';

import { Util } from '../util';
import { Layout } from '../layout';

@NgModule({
  declarations: [
    MyApp
  ],
  imports: [
    BrowserModule,
    HttpModule,
    PagesModule,
    ProvidersModule,
    NgCalendarModule,
    IonicImageLoader.forRoot(),
    IonicModule.forRoot(MyApp, {backButtonText: ''})
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Network,
    OneSignal,
    InAppBrowser,
    Facebook,
    Util,
    Layout,
    Vibration,
    NativeAudio,
    Badge,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
