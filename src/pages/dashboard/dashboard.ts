import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { Facebook } from '@ionic-native/facebook';
import { IonicImageLoader } from 'ionic-image-loader';

import { AuthProvider } from '../../providers/auth/auth';
import { SerieProvider } from '../../providers/serie/serie';
import { AvaliacaoProvider } from '../../providers/avaliacao/avaliacao';
import { AvaliacaoFormProvider } from '../../providers/avaliacao-form/avaliacao-form';
import { GraficoProvider } from '../../providers/grafico/grafico';
import { CalendarioProvider } from '../../providers/calendario/calendario';
import { ReservaProvider } from '../../providers/reserva/reserva';
import { RankingProvider } from '../../providers/ranking/ranking';
import { InformacaoProvider } from '../../providers/informacao/informacao';

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

  menu: Array<{title: string, component: any, icon: string, class: string}>;

  constructor(
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
    public facebook: Facebook,
    public util: Util,
    public layout: Layout) {
    this.initMenu();
  }

  ionViewDidEnter() {
    this.userImg = this.util.getStorage('facebookId');
    this.doRefresh();
    this.initMenu();
  }

  ionViewDidLoad() {
    if (this.util.getStorage('isLogged') === 'false') {
      this.doLogin([18, 18, 2, ,10, 30, 'https://graph.facebook.com/10156165879280972/picture', , 2]);
    }
  }

  doLogin(data) {
    const id_aluno = data[0];
    const id_professor = data[1];
    const id_tipo_professor = data[2];
    const id_usuario = data[5];
    const facebookId = data[6];
    const grupo = data[8];

    this.util.setStorage('isLogged', 'true');
    this.util.setStorage('showReserva', id_tipo_professor === 4 ? 'true' : 'false');
    this.util.setStorage('showRanking', grupo !== 0? 'true': 'false');
    this.util.setStorage('logo', id_professor);
    this.util.setStorage('id_aluno', id_aluno);
    this.util.setStorage('id_professor', id_professor);
    this.util.setStorage('facebookId', facebookId==''?'assets/img/facebook.png':facebookId);

    //this.playerId(id_usuario);

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

  initMenu() {
    this.menu = [];
    this.menu.push({ title: 'Treinos', component: SeriePage, icon: 'ios-man', class: '' });
    this.menu.push({ title: 'Avaliações', component: AvaliacaoPage, icon: 'ios-document', class: '' });
    this.menu.push({ title: 'Gráficos', component: GraficoPage, icon: 'md-trending-up', class: '' });
    this.menu.push({ title: 'Calendário', component: CalendarioPage, icon: 'ios-calendar', class: '' });

    if (this.util.getStorage('showReserva') === 'true')
      this.menu.push({ title: 'Reservas', component: ReservaPage, icon: 'ios-create', class: '' });

    if (this.util.getStorage('showRanking') === 'true')
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

  doRefresh() {
    this.rankingProvider.getGrupo().subscribe(
      data=>{
        if(data['_body']==='0'){
          this.showPontos = false;
          this.util.setStorage('showRanking','false');
        }
        else{
          this.showPontos = true;
          this.util.setStorage('showRanking', 'true');
          this.updatePontos();
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
    this.util.setLogout();
  }

}
