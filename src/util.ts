import { Injectable } from '@angular/core';
import { AlertController, LoadingController } from 'ionic-angular';

import { Network } from  "@ionic-native/network";

import { Layout } from './layout';

@Injectable()
export class Util {

  //baseUrl = 'http://fit.nexur.com.br';
  //baseUrl = 'http://localhost/personal/web';
  baseUrl = 'http://homolog.nexur.com.br/web';

  logo: any;

  loading: any;

  constructor(
    public network: Network,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    public layout: Layout) {}

  setStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  getStorage(key) {
    return JSON.parse(localStorage.getItem(key));
  }

  isLogged() {
    if (this.getStorage('isLogged') === 'true')
      return true;

    return false;
  }

  logout(){
    this.setStorage('isLogged', 'false');
  }

  showLoading() {
    this.loading = this.loadingCtrl.create();
    this.loading.present();
  }

  endLoading() {
    this.loading.dismiss();
  }

  showAlert(title, subTitle, buttons, colorsType) {
    const alert = this.alertCtrl.create({
      title: title,
      subTitle: subTitle,
      buttons: [buttons]
    });

    alert.present().then(data => this.layout.setAlertColor(colorsType));
  }

  showConfirmationAlert(title, message, inputs, buttons, colorsType) {
    const alert = this.alertCtrl.create({
      title: title,
      message: message,
      inputs: inputs,
      buttons: buttons,
    });

    alert.present().then(data => this.layout.setAlertColor(colorsType));
  }

  checkNetwork() {
    return this.network.type !== "none" ? true : false;
  }

  toArray(data) {
    let arr = [];

    for (let i = 0; i < data.rows.length; i++)
      arr.push(data.rows.item(i));

    return arr;
  }

  unserialize(data) {
    const unserialize = data.split(';')
      .filter((elem, i) => !(i%2 === 0))
      .map(elem => elem.split(':').reverse()[0].replace(/"/g, ""));

    return unserialize;
  }

}
