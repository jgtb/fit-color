import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, AlertController } from 'ionic-angular';

import { DashboardPage } from '../../pages/dashboard/dashboard';

import { CalendarioProvider } from '../../providers/calendario/calendario';

import { TreinoFormPage } from '../../pages/treino-form/treino-form';

import { Util } from '../../util';
import { Layout } from '../../layout';

@IonicPage()
@Component({
  selector: 'page-calendario',
  templateUrl: 'calendario.html',
})
export class CalendarioPage {

  data: any = [];

  _toggle: any = 1;

  eventSource: any;
  title: any;

  calendar = {
    mode: 'month',
    locale: 'pt-BR',
    noEventsLabel: 'Nenhum Treino',
    currentDate: new Date()
  };

  hasNewTreino: boolean = false;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public calendarioProvider: CalendarioProvider,
    public modalCtrl: ModalController,
    public alertCtrl: AlertController,
    public util: Util,
    public layout: Layout) {
      this.data = this.util.getStorage('dataTreino');
      this.hasNewTreino = this.navParams.get('hasNewTreino');
    }

  ionViewDidLoad() {
    this.refreshData();
    this.select(this.data);
  }

  ionViewDidEnter() {
    if (this.hasNewTreino) {
      this.util.showAlert('Atenção', 'Treino Registrado!', 'Ok', true);
      this.refreshData();
    }
  } 

  select(result) {
    this.data = result;
    this.eventSource = this.loadTreinos();
  }

  create() {
    const modal = this.modalCtrl.create(TreinoFormPage);
    modal.present();
    modal.onDidDismiss(data => {
      if (data != null) {
        this.util.showAlert('Atenção', 'Treino Registrado.', 'Ok', true);
        this.refreshData();
      }
    });
  }

  loadTreinos() {
    return this.data.map(obj => {
      let id = obj.id;
      let title = obj.title;
      let start = obj.start;
      let end = obj.end;
      let borg = obj.borg;
      let comentario = obj.description;
      let ser = obj.ser;
      let rep = obj.rep;
      let obs = obj.obs;
      let tipo = obj.tipo;

      let startTime = new Date(start.replace(/-/g,'/'));
      let endTime = new Date(end.replace(/-/g,'/'));

      return {
        id: id,
        title: title,
        startTime: startTime,
        endTime: endTime,
        borg: borg,
        comentario: comentario,
        tipo: tipo,
        ser: ser,
        rep: rep,
        obs: obs,
        allDay: obj.tipo === 'p' ? true : false //Se for planejado configura como allDay pra ter label diferente
      }
    });
  }

  onViewTitleChanged(title) {
    this.title = title;
  }

  onEventSelected(event) {
    const title = event.title;
    const subtitle = this.getSubtitle(event);
    const button = 'Ok';

    if(event.tipo=='h'){
      const alert = this.alertCtrl.create({
        title: title,
        subTitle: subtitle,
        buttons: [ {
          text: 'Apagar',
          handler: () => {
            this.apagar(event);
          }
        },
        {
          text: 'Ok',
          role: 'cancel',
          handler: () => {}
        }]
      });
      alert.present().then(data => this.layout.setAlertColor(true));
    }
    else{
      this.util.showAlert(title, subtitle, button , true);
    }
  }

  apagar(event){
    const alert = this.alertCtrl.create({
      title: 'Atenção',
      subTitle: 'Deseja realmente apagar esse treino?',
      buttons: [ {
        text: 'Não',
        role: 'cancel',
        handler: () => {}
      },
      {
        text: 'Sim',
        handler: () => {
          this.calendarioProvider.delete(event.id).subscribe(
            data => {
              if (data['_body']==1) {
                this.util.showAlert('Atenção', 'Treino apagado.', 'Ok', true);
                this.refreshData();
              } else {
                this.util.showAlert('Atenção', 'Erro ao salvar. Tente mais tarde.', 'Ok', true);
              }
          });
        }
      }]
    });
    alert.present().then(data => this.layout.setAlertColor(true));

  }

  getSubtitle(event) {
    let html = '';

    if (event.tipo === 'h') {
      if (!event.borg) event.borg = '-1';
      html += '<p align="left">';
      html += 'Tempo: ' + this.time(event.startTime, event.endTime) + '<br />';
      html += event.comentario !== '' ? 'Mensagem: ' + event.comentario + '<br />' : '';
      html += '</p>';
      html += event.borg !== '-1' ? '<img src="assets/img/treino-modal/' + event.borg + '.png"><br />' : '';
    } else {
      html += '<p align="left">';
      html += event.ser !== '' ? 'Número de Séries: ' + event.ser + '<br />' : '';
      html += event.rep !== '' ? 'Número de Repetições: ' + event.rep + '<br />' : '';
      html += event.obs !== '' ? 'Observações: ' + event.obs + '<br />' : '';
      html += '</p>';
    }

    return html;
  }

  time(startTime, endTime) {
    const date = new Date(null);
    const seconds = (endTime.getTime() - startTime.getTime()) / 1000;

    date.setSeconds(seconds);
    const result = date.toISOString().substr(11, 8);
    return result;
  }

  refreshData() {
    this.calendarioProvider.index(this.util.getStorage('id_aluno')).subscribe(
      data => {
        this.util.setStorage('dataTreino', data);
        this.select(data);
      });
  }

  doRefresh(event) {
    if (this.util.checkNetwork()) {
      this.refreshData();
    } else {
      this.util.showAlert('Atenção', 'Internet Offline', 'Ok', true);
    }
    setTimeout(() => { event.complete(); }, 2000);
  }

  goToDashboard() {
    this.navCtrl.popToRoot();
  }

}
