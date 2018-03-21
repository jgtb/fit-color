import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { Facebook } from '@ionic-native/facebook';
import { IonicImageLoader } from 'ionic-image-loader';

import { LoginPage } from '../../pages/login/login';

import { SeriePage } from '../../pages/serie/serie';
import { CalendarioPage } from '../../pages/calendario/calendario';
import { AvaliacaoPage } from '../../pages/avaliacao/avaliacao';
import { GraficoPage } from '../../pages/grafico/grafico';
import { ReservaPage } from '../../pages/reserva/reserva';
import { RankingPage } from '../../pages/ranking/ranking';
import { InformacaoPage } from '../../pages/informacao/informacao';

import { AuthProvider } from '../../providers/auth/auth';
import { SerieProvider } from '../../providers/serie/serie';
import { AvaliacaoProvider } from '../../providers/avaliacao/avaliacao';
import { AvaliacaoFormProvider } from '../../providers/avaliacao-form/avaliacao-form';
import { GraficoProvider } from '../../providers/grafico/grafico';
import { CalendarioProvider } from '../../providers/calendario/calendario';
import { ReservaProvider } from '../../providers/reserva/reserva';
import { RankingProvider } from '../../providers/ranking/ranking';
import { InformacaoProvider } from '../../providers/informacao/informacao';

import { Util } from '../../util';
import { Layout } from '../../layout';

@IonicPage()
@Component({
  selector: 'page-dashboard',
  templateUrl: 'dashboard.html',
})
export class DashboardPage {

  userImg: string;

  pontos: number;

  showPontos: boolean;
  showRanking: boolean;

  menu: Array<{title: string, component: any, icon: string, class: string}>;

  width: number;

  height: number;

  constructor(
    public facebook: Facebook,
    public layout: Layout,
    public navCtrl: NavController,
    public navParams: NavParams,
    public authProvider: AuthProvider,
    public serieProvider: SerieProvider,
    public avaliacaoProvider: AvaliacaoProvider,
    public avaliacaoFormProvider: AvaliacaoFormProvider,
    public informacaoProvider: InformacaoProvider,
    public calendarioProvider: CalendarioProvider,
    public reservaProvider: ReservaProvider,
    public rankingProvider: RankingProvider,
    public graficoProvider: GraficoProvider,
    public util: Util) {
      this.initMenu();
      this.doLogin();
    }

  initMenu() {
    this.menu = [];
    this.menu.push({ title: 'Treinos', component: SeriePage, icon: 'ios-man', class: '' }); //ion-ios-body
    this.menu.push({ title: 'Avaliações', component: AvaliacaoPage, icon: 'ios-document', class: '' });
    this.menu.push({ title: 'Gráficos', component: GraficoPage, icon: 'md-trending-up', class: '' });
    this.menu.push({ title: 'Calendário', component: CalendarioPage, icon: 'ios-calendar', class: '' });
    this.menu.push({ title: 'Ranking', component: RankingPage, icon: 'md-podium', class: '' });
    this.menu.push({ title: 'Informações', component: InformacaoPage, icon: 'ios-information-circle', class: '' })
    this.userImg = this.util.getStorage('facebookId');
    this.pontos = 235;
    
  }

  openPage(component) {
    this.navCtrl.push(component);
  }

  doLogin() {
    const id_aluno = 18;
    const id_professor = this.util.getStorage('logo');
    const id_usuario = 30;
    const facebookId = 'https://graph.facebook.com/1515069531891815/picture';
    const grupo = 1;

    this.util.setStorage('isLogged', 'true');
    this.util.setStorage('showReserva', 'true');
    this.util.setStorage('showRanking', 'true');
    this.util.setStorage('id_aluno', id_aluno);
    this.util.setStorage('id_usuario', id_usuario);
    this.util.setStorage('id_professor', id_professor);
    this.util.setStorage('facebookId', facebookId === null ? 'assets/img/facebook.png' : facebookId);

    this.serieProvider.index(id_aluno).subscribe(
      data => {
        this.util.setStorage('dataSerie', data);
    });
    this.avaliacaoProvider.index(id_aluno).subscribe(
      data => {
        this.util.setStorage('dataAvaliacao', data);
    });
    this.avaliacaoFormProvider.index(id_professor).subscribe(
      data => {
        this.util.setStorage('dataAvaliacaoForm', data);
    });
    this.graficoProvider.index(id_aluno).subscribe(
      data => {
        this.util.setStorage('dataGrafico', data);
    });
    this.calendarioProvider.index(id_aluno).subscribe(
      data => {
        this.util.setStorage('dataTreino', data);
    });
    this.reservaProvider.index(id_aluno).subscribe(
      data => {
        this.util.setStorage('dataReserva', data);
    });
    this.rankingProvider.index().subscribe(
      data => {
        this.util.setStorage('ranking', data);
      });
    this.informacaoProvider.indexInformacao(id_professor).subscribe(
      data => {
        this.util.setStorage('dataInformacao', data);
    });
    this.informacaoProvider.indexMensagem(id_aluno).subscribe(
      data => {
        this.util.setStorage('dataMensagem', data);
    });
  }

}
