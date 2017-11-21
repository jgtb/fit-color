import { BrowserModule } from '@angular/platform-browser'
import { ErrorHandler, NgModule } from '@angular/core'
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular'
import { SplashScreen } from '@ionic-native/splash-screen'
import { StatusBar } from '@ionic-native/status-bar'

import { Network } from '@ionic-native/network'
import { InAppBrowser } from '@ionic-native/in-app-browser'

import { MyApp } from './app.component'

import { PagesModule } from '../pages/pages.module'
import { ProvidersModule } from '../providers/providers.module'

import { HttpModule } from '@angular/http'

import { Util } from '../util'
import { Layout } from '../layout'

@NgModule({
  declarations: [
    MyApp
  ],
  imports: [
    BrowserModule,
    HttpModule,
    PagesModule,
    ProvidersModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Util,
    Layout,
    Network,
    InAppBrowser,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
