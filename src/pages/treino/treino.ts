import { Component, ViewChild } from '@angular/core';
import { IonicPage, Platform, NavController, NavParams, ModalController, Navbar} from 'ionic-angular';

import { InAppBrowser } from '@ionic-native/in-app-browser';
import { IonicImageLoader } from 'ionic-image-loader';

import { TreinoTimerPage } from '../../pages/treino-timer/treino-timer';
import { TreinoModalPage } from '../../pages/treino-modal/treino-modal';
import { CalendarioPage } from '../../pages/calendario/calendario';

import { SerieProvider } from '../../providers/serie/serie';

import { Util } from '../../util';
import { Layout } from '../../layout';

@IonicPage()
@Component({
  selector: 'page-treino',
  templateUrl: 'treino.html',
})

export class TreinoPage {

  @ViewChild(Navbar) navBar: Navbar;

  data: any = [];
  dataExercicios: any = [];

  _done: any = [];
  _toggle: boolean = true;

  timer: any = [];

  constructor(
    platform: Platform,
    public navCtrl: NavController,
    public navParams: NavParams,
    public serieProvider: SerieProvider,
    public iab: InAppBrowser,
    public modalCtrl: ModalController,
    public util: Util,
    public layout: Layout) {
      this.data = this.navParams.get('item');
      this.timer.time=0;
      this.timer.display = this.getSecondsAsDigitalClock(this.timer.time);
    }

  ionViewDidLoad() {
    const data = this.util.getStorage('dataSerie');
    this.select(data);
    this.setBackButtonAction();
  }

  setBackButtonAction(){
    this.navBar.backButtonClick = () => {
      if (this.timer.time > 0) {
        const buttons = [
          {
            text: 'Cancelar',
            role: 'cancel'
          },
          {
            text: 'Confirmar',
            handler: () => {
              this.navCtrl.pop();
              },
          }
        ];
        this.util.showConfirmationAlert('Abandonar treino?', '', '', buttons, true);
      } else {
        this.navCtrl.pop();
      }
    }
  }

  select(result) {
    this.dataExercicios = result.filter((elem, index, arr) => { return elem.id === this.data.id });
    this.data = this.dataExercicios[0];
  }

  create() {
    const modal = this.modalCtrl.create(TreinoModalPage, {id_serie: this.data.id_serie, time: this.timer.display});
    modal.present();
    modal.onDidDismiss(data => {
      if(data!=null){
        this.navCtrl.push(CalendarioPage, {hasNewTreino: true});
      }
    });
  }

  update(item) {
    const title = item.descricao_ex;
    const message = 'Alterar Carga';
    const inputs = [
      {
        name: 'carga',
        value: item.carga,
        placeholder: 'Carga'
      }
    ];
    const buttons = [
      {
        text: 'Cancelar',
        role: 'cancel',
      },
      {
        text: 'Confirmar',
        handler: dataCarga => {
          this.doUpdate(item, dataCarga)
        }
      }
    ];
    this.util.showConfirmationAlert(title, message, inputs, buttons, true);
  }

  doUpdate(item, dataCarga) {
    if (this.util.checkNetwork()) {
      const data = JSON.stringify({id: item.id_exercicio_serie, carga: dataCarga.carga });

      this.serieProvider.updateCarga(data).subscribe(
        data => {
          if (data['_body']) {
            this.getData();
            this.util.showAlert('Atenção', 'Carga Alterada', 'Ok', true);
          } else {
            this.util.showAlert('Atenção', 'Não foi possível alterar a carga', 'Ok', true);
          }
        });
    } else {
      this.util.showAlert('Atenção', 'Internet Offline', 'Ok', true);
    }
  }

  start() {
    this.timer.start = (new Date()).getTime()/1000;
    if(this.timer.time!=0)
      this.timer.start -= this.timer.time;
    this.timer.running = true;
    this.time();
  }

  stop() {
    this.timer.running = false;
  }

  time() {
    setTimeout(() => {
      if (!this.timer.running) { return; }
      this.timer.now = (new Date()).getTime()/1000;
      this.timer.time = this.timer.now-this.timer.start;
      this.timer.display = this.getSecondsAsDigitalClock(this.timer.time);
      this.time();
    }, 1000);
  }

  getSecondsAsDigitalClock(inputSeconds: number) {
    var sec_num = parseInt(inputSeconds.toString(), 10); // don't forget the second param
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);
    var hoursString = '';
    var minutesString = '';
    var secondsString = '';
    hoursString = (hours < 10) ? "0" + hours : hours.toString();
    minutesString = (minutes < 10) ? "0" + minutes : minutes.toString();
    secondsString = (seconds < 10) ? "0" + seconds : seconds.toString();
    return hoursString + ':' + minutesString + ':' + secondsString;
  }

  done(index) {
    const pos = this._done.indexOf(index);

    if (pos > -1) {
      this._done.splice(pos, 1);
      return true;
    }

    this._done.push(index);
  }

  isDone(index) {
    const pos = this._done.indexOf(index);

    if (pos > -1)
      return true;

    return false;
  }

  video(item) {
    this.iab.create(item.video).show();
  }

  intervalo(item) {
    this.navCtrl.push(TreinoTimerPage, { item: item });
  }

  getData() {
    this.serieProvider.index(this.util.getStorage('id_aluno')).subscribe(
      data => {
        this.util.setStorage('dataSerie', data);
        this.select(data);
      });
  }

  doRefresh(event) {
    if (this.util.checkNetwork()) {
      this.getData();
    } else {
      this.util.showAlert('Atenção', 'Internet Offline', 'Ok', true);
    }
    setTimeout(() => { event.complete(); }, 2000);
  }

}
