import { Injectable } from '@angular/core';

import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

import { Util } from '../../util';

@Injectable()
export class RankingProvider {

  constructor(
    public http: Http,
    public util: Util) {}

  index() {
    const indexURL = '/ranking/ranking?id_aluno=';
    const url = this.util.baseUrl + indexURL + this.util.getStorage('id_aluno');

    return this.http.get(url).map(res => res.json());
  }

  getGrupo() {
    const ativoURL = '/aluno/get-grupo?id_aluno=';
    const url = this.util.baseUrl + ativoURL + this.util.getStorage('id_aluno');

    return this.http.get(url);
  }


}
