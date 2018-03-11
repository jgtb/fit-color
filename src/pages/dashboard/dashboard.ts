import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { Facebook } from '@ionic-native/facebook';
import { IonicImageLoader } from 'ionic-image-loader';

import { AuthProvider } from '../../providers/auth/auth';
import { RankingProvider } from '../../providers/ranking/ranking';

import { LoginPage } from '../../pages/login/login';

import { SeriePage } from '../../pages/serie/serie';
import { CalendarioPage } from '../../pages/calendario/calendario';
import { AvaliacaoPage } from '../../pages/avaliacao/avaliacao';
import { GraficoPage } from '../../pages/grafico/grafico';
import { ReservaPage } from '../../pages/reserva/reserva';
import { RankingPage } from '../../pages/ranking/ranking';
import { InformacaoPage } from '../../pages/informacao/informacao';

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
    public navCtrl: NavController,
    public navParams: NavParams,
    public authProvider: AuthProvider,
    public rankingProvider: RankingProvider,
    public facebook: Facebook,
    public util: Util,
    public layout: Layout) {}

  ionViewWillLeave(){
    this.doRefresh();
  }

  ionViewWillEnter(){
    this.doRefresh();
  }

  initMenu() {
    this.menu = [];
    this.menu.push({ title: 'Treinos', component: SeriePage, icon: 'ios-man', class: '' }); //ion-ios-body
    this.menu.push({ title: 'Avaliações', component: AvaliacaoPage, icon: 'ios-document', class: '' });
    this.menu.push({ title: 'Gráficos', component: GraficoPage, icon: 'md-trending-up', class: '' });
    this.menu.push({ title: 'Calendário', component: CalendarioPage, icon: 'ios-calendar', class: '' });

    if (this.util.getStorage('showReserva') === 'true')
      this.menu.push({ title: 'Reservas', component: ReservaPage, icon: 'ios-create', class: '' });

    if (this.showRanking === true)
      this.menu.push({ title: 'Ranking', component: RankingPage, icon: 'md-podium', class: '' });

    const classe = this.menu.length%2==0?'m-l-25p':'';
    this.menu.push({ title: 'Informações', component: InformacaoPage, icon: 'ios-information-circle', class: classe })

  }

  openPage(component) {
    this.navCtrl.push(component);
  }

  goToFacebook () {
    this.facebook.login(['public_profile', 'email']).then((res) => {
      this.facebook.api('/me?fields=name,email', []).then(res => {
        this.userImg = 'http://graph.facebook.com/' + res.id + '/picture';
        this.util.setStorage('facebookId', this.userImg);
      })
    });
  }

  isActive() {
    this.authProvider.isActive().subscribe(
      data => {
        if (data['_body']=="") {
          this.util.logout();
          this.navCtrl.setRoot(LoginPage);
        }
      });
  }

  doRefresh() {
    this.isActive();
    
    this.userImg = this.util.getStorage('facebookId');

    this.rankingProvider.getGrupo().subscribe(
      data=>{
        if(data['_body']==='0' || data['_body']===''){
          this.showPontos = false;
          this.showRanking = false;
          this.util.setStorage('showRanking','false');
          this.initMenu();
        }
        else{
          this.showPontos = true;
          this.showRanking = true;
          this.util.setStorage('showRanking', 'true');
          this.updatePontos();
          this.initMenu();
        }
    });

  }

  updatePontos(){
    this.rankingProvider.index().subscribe(
      data => {
        this.util.setStorage('ranking', data);
        if(data[1].length!=0){
          const item = data[1].find(el => el.id_aluno == this.util.getStorage('id_aluno'));
          this.pontos = item ? item.pontos : 0;
        }
      });
  }

  logout() {
    if (this.util.checkNetwork()) {
      this.authProvider.playerId(this.util.getStorage('id_usuario'), '').subscribe(res => {
        this.util.logout();
        this.navCtrl.setRoot(LoginPage);
      });
    } else {
      this.util.showAlert('Atenção', 'Internet Offline', 'Ok', false);
    }
  }

}
