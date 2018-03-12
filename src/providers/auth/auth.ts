import { Injectable } from '@angular/core';

import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

import { Util } from '../../util';

@Injectable()
export class AuthProvider {

  constructor(
    public http: Http,
    public util: Util) {}

  login(data) {
    const loginURL = '/usuario/log';
    const url = this.util.baseUrl + loginURL;
    data.usuario = 'aluno';
    data.senha = 'aluno';
    return this.http.post(url, data).map(res => res.json());
  }

  forgotPassword(data) {
    const forgotPasswordURL = '/usuario/senha-app';
    const url = this.util.baseUrl + forgotPasswordURL;

    return this.http.post(url, data).map(res => res.json());
  }

  playerId(userId, playerId) {
    const oneSignalURL = '/usuario/player-id?id=' + userId + '&player_id=' + playerId;
    const url = this.util.baseUrl + oneSignalURL;

    return this.http.get(url);
  }

  isActive() {
    const ativoURL = '/usuario/ativo?id=';
    const url = this.util.baseUrl + ativoURL + this.util.getStorage('id_aluno');

    return this.http.get(url);
  }

  appConfig() {
    const url = 'assets/one-signal/data.json';

    return this.http.get(url).map(res => res.json());
  }

}
