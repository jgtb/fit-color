import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { DashboardPage } from '../../pages/dashboard/dashboard';

import { ReservaProvider } from '../../providers/reserva/reserva';

import { Util } from '../../util';
import { Layout } from '../../layout';

@IonicPage()
@Component({
  selector: 'page-reserva',
  templateUrl: 'reserva.html',
})
export class ReservaPage {

  data: any = [];

  eventSource: any;
  title: any;

  calendar: any = {
    mode: 'week',
    locale: 'pt-BR',
    noEventsLabel: 'Nenhuma Reserva',
    currentDate: new Date(),
    formatWeekViewDayHeader: 'EEE',
  };

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public reservaProvider: ReservaProvider,
    public util: Util,
    public layout: Layout) {}

  ionViewDidLoad() {
    this.data = this.util.getStorage('dataReserva');
    this.select(this.data);
  }

  select(result) {
    this.data = result;
    this.eventSource = this.loadReservas();
  }

  loadReservas() {
    if(this.data){
      return this.data.map(obj => {

        let id = obj.id,
            title = obj.title,
            time = obj.tempo,
            start = obj.start,
            end = obj.end,
            vagas = obj.vagas;

        let startTime = new Date(start.replace(/-/g,'/')),
            endTime = new Date(end.replace(/-/g,'/'));

        return {
          id: id,
          title: title,
          startTime: startTime,
          endTime: endTime,
          time: time,
          vagas: vagas,
          allDay: false
        }
      });
    }
  }

  canReserva(item) {
    let start,
        end,
        now;

    this.data.map(obj => {
      if (item.id === obj.id) {
        start = new Date(obj.start.replace(/-/g,'/'));
        end = new Date(obj.end.replace(/-/g,'/'));
        now = new Date();

        if (obj.tempo !== null)
          start.setMinutes(start.getMinutes() - parseInt(obj.tempo));
      }
    });

    if(now >= start && now <= end)
      return true;

    return false;
  }

  onEventSelected(item) {
    if (this.util.checkNetwork()) {
      if(this.canReserva(item)) {
        this.reservaProvider.checkIsReservado(item).subscribe(
          data => {
            if (data['_body']==1) {
              this.cancelar(item);
            } else if (data['_body']==0){
              this.reservaProvider.checkIsLotado(item).subscribe(
                data => {
                  if (item.vagas !== data.length) {
                    item.id_aula = item.id;
                    item.id_aluno = this.util.getStorage('id_aluno');
                    this.create(item);
                  } else {
                    this.util.showAlert('Atenção', 'Aula lotada', 'Ok', true);
                  }
              });
            }
          });
      } else {
        this.util.showAlert('Atenção', 'Horário inválido para reserva', 'Ok', true);
      }
    } else {
      this.util.showAlert('Atenção', 'Internet Offline', 'Ok', true);
    }
  }

  create(item) {
    const title = item.title;
    const message = this.getMessage(item);
    const buttons = [
      {
        text: 'Cancelar',
        role: 'cancel',
      },
      {
        text: 'Confirmar',
        handler: data => {
          this.reservaProvider.create(item).subscribe(
            data => {
              if (data['_body']==1)
                this.util.showAlert('Atenção', 'Aula reservada.', 'Ok', true);
              else
                this.util.showAlert('Atenção', 'Erro ao reservar aula.', 'Ok', true);
            }
          )
        }
      }
    ]
    this.util.showConfirmationAlert(title, message, [], buttons, true);
  }

  cancelar(item) {
    const title = item.title;
    const message = 'Deseja cancelar a reserva?';
    const buttons = [
      {
        text: 'Não',
        role: 'cancel',
      },
      {
        text: 'Sim',
        handler: data => {
          item.id_aula = item.id;
          item.id_aluno = this.util.getStorage('id_aluno');
          this.reservaProvider.delete(item).subscribe(
            data => {
              if(data['_body']==1)
                this.util.showAlert('Atenção', 'Reserva cancelada.', 'Ok', true);
              else
                this.util.showAlert('Atenção', 'Erro ao cancelar reserva.', 'Ok', true);
            });
          }
      }
    ]
    this.util.showConfirmationAlert(title, message, [], buttons, true);
  }

  getMessage(item) {
    const startTime = item.startTime.toTimeString().split(' ')[0];
    const endTime = item.endTime.toTimeString().split(' ')[0];

    const message = 'Deseja reservar esta aula ?' + '<br />' + startTime.toString().substring(0,5) + ' - ' + endTime.toString().substring(0,5);

    return message;
  }

  onViewTitleChanged(title) {
    this.title = 'Aulas';
  }

  doRefresh(event) {
    if (this.util.checkNetwork()) {
      this.reservaProvider.index(this.util.getStorage('id_professor')).subscribe(
        data => {
          this.util.setStorage('dataReserva', data);
          this.select(data);
        });
    } else {
      this.util.showAlert('Atenção', 'Internet Offline', 'Ok', true);
    }
    setTimeout(() => { event.complete(); }, 2000);
  }

  goToDashboard() {
    this.navCtrl.popToRoot();
  }

}
