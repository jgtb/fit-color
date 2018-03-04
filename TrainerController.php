<?php

namespace app\controllers;

use Yii;
use yii\web\Controller;
use yii\web\Response;
use yii\web\HttpException;
use yii\filters\Cors;
use app\models\Usuario;
use app\models\Aluno;
use app\models\Assinante;
use app\models\Plano;
use app\models\Serie;
use app\models\Avaliacao;
use app\models\AvaliacaoAluno;
use app\models\Treino;
use app\models\Exercicio;
use app\models\ExercicioUsuario;
use app\models\Aula;
use app\models\Preferencias;

class TrainerController extends Controller
{

  public $keysAluno = ['id_aluno', 'id_usuario', 'id_professor', 'nome', 'email', 'data_nascimento', 'data_matricula', 'sexo', 'grupo'];
  public $keysUsuario = ['id_usuario', 'login', 'player_id', 'link_foto'];
  public $keysAvaliacaoAluno = ['id_avaliacao_aluno', 'id_aluno', 'id_avaliacao', 'descricao', 'proxima_avaliacao', 'data'];
  public $keysAvaliacao = ['id_avaliacao'];
  public $keysSessao = ['id_avaliacao', 'id_sessao', 'descricao'];
  public $keysPergunta = ['id_pergunta', 'id_sessao', 'id_tipo_pergunta', 'descricao'];
  public $keysSerie = ['id_serie', 'id_aluno', 'descricao', 'data'];
  public $keysTreinos = ['id_treino', 'id_serie', 'data', 'tempo', 'borg', 'mensagem'];
  public $keysAssinante = ['id_assinante', 'id_usuario', 'id_plano'];
  public $keysPlano = ['id_plano', 'descricao', 'limite_alunos'];

  public $layout = false;

  public function init() {
      parent::init();
      Yii::$app->response->format = Response::FORMAT_JSON;
      $this->enableCsrfValidation = false;
  }

  // public function behaviors() {
  //   return [
  //       'corsFilter' => [
  //           'class' => Cors::className(),
  //           'cors' => [
  //               'Origin' => ['*'],
  //               'Access-Control-Request-Headers' => ['Content-Type'],
  //               'Access-Control-Allow-Headers' => ['Content-Type'],
  //               'Access-Control-Allow-Methods' => ['*']
  //           ],
  //       ],
  //   ];
  // }

  public function beforeAction($action) {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Request-Headers: Content-Type');
    header('Access-Control-Allow-Headers: Content-Type');
    header('Access-Control-Allow-Methods: *');

    // $headers = Yii::$app->request->headers;
    // $auth = $headers->get('Authorization');
    //
    // $model = Usuario::findOne(['auth' => $auth, 'ativo' => 1]);
    //
    // if ($model)
    //   return true;
    //
    // Yii::$app->response->statusCode = 401;
    // return false;

    return true;

    return parent::beforeAction($action);
  }

  public function actionIndex() {
    return 'Trainer API';
  }

  // ------ PROVIDER AUTH ------ //

  /**
   * Login de Personal
   */
  public function actionAuthLogin() {
    $params = json_decode(file_get_contents('php://input'), true);

    $login = $params['login'];
    $password = sha1($params['password']);

    $model = Usuario::find()
      ->select($this->getSelectFields($this->keysUsuario, 'usuario'))
      ->joinWith(['idAssinante' => function ($q) {
        $q->select($this->getSelectFields($this->keysAssinante, 'assinante'))
          ->joinWith(['idPlano' => function ($q) {
            $q->select($this->getSelectFields($this->keysPlano, 'plano'));
          }]);
      }])
      ->where(['login' => $login, 'senha'=> $password, 'id_tipo_usuario' => 2])
      ->asArray()
      ->one();

    if ($model)
      return $model;

    return -1;
  }

  /**
   * Envia e-mail de recuperação de senha (Personal & Aluno)
   */
  public function actionAuthForgotPassword($login) {
    $model = Usuario::findOne(['login' => $login]);

    if ($model->ativo) {
      $email = Yii::$app->mailer->compose()
        ->setFrom('fit@nexur.com.br')
        ->setTo($model->email)
        ->setSubject('Nexur Fit')
        ->setHtmlBody($this->emailBody(
          "Olá {$model->nome},
          <br>Altere sua senha <a href=\"{$this->url}/usuario/altera?hash={$model->hash}\">aqui</a> e faça seu login"))
        ->send();

      return 1;
    }

    return -1;
  }

  // ------ PROVIDER AUTH ------ //

  // ------ PROVIDER ALUNO ------ //

  /**
   * Retorna TODAS as informações de TODOS os Alunos
   */
  public function actionAlunoIndex($id) {
    $models = Aluno::find()
      ->select($this->getSelectFields($this->keysAluno, 'aluno'))
      ->joinWith(['idUsuario' => function($q) {
        $q->select($this->getSelectFields($this->keysUsuario, 'usuario'));
       }])
      ->joinWith(['avaliacaoAlunos' => function ($q) {
        $q->select($this->getSelectFields($this->keysAvaliacaoAluno, 'avaliacao_aluno'))
          ->where(['avaliacao_aluno.ativo' => 1])
          ->joinWith(['idAvaliacao' => function ($q) {
            $q->select($this->getSelectFields($this->keysAvaliacao, 'avaliacao'))
              ->joinWith(['sessaos' => function ($q) {
                $q->select($this->getSelectFields($this->keysSessao, 'sessao'))
                  ->where(['sessao.ativo' => 1])
                  ->joinWith(['perguntas' => function($q) {
                    $q->select($this->getSelectFields($this->keysPergunta, 'pergunta'));
                  }]);
              }]);
          }])
          ->joinWith(['respostas']);
      }])
      ->joinWith(['series' => function ($q) {
        $q->select($this->getSelectFields($this->keysSerie, 'serie'));
      }])
      ->joinWith(['treinos' => function ($q) {
        $q->select($this->getSelectFields($this->keysTreinos, 'treino'));
      }])
      ->where(['aluno.id_professor' => $id, 'aluno.ativo' => 1])
      ->asArray()
      ->all();

    return $models;
  }

  /**
   * Retorna TODAS as informações de UM Aluno
   */
  public function actionAlunoView($id) {
    $model = Aluno::find()
      ->select($this->getSelectFields($this->keysAluno, 'aluno'))
      ->joinWith(['idUsuario' => function($q) {
        $q->select($this->getSelectFields($this->keysUsuario, 'usuario'));
       }])
      ->joinWith(['avaliacaoAlunos' => function ($q) {
        $q->select($this->getSelectFields($this->keysAvaliacaoAluno, 'avaliacao_aluno'))
          ->where(['avaliacao_aluno.ativo' => 1])
          ->joinWith(['idAvaliacao' => function ($q) {
            $q->select($this->getSelectFields($this->keysAvaliacao, 'avaliacao'))
              ->joinWith(['sessaos' => function ($q) {
                $q->select($this->getSelectFields($this->keysSessao, 'sessao'))
                  ->where(['sessao.ativo' => 1])
                  ->joinWith(['perguntas' => function($q) {
                    $q->select($this->getSelectFields($this->keysPergunta, 'pergunta'));
                  }]);
              }]);
          }])
          ->joinWith(['respostas']);
      }])
      ->joinWith(['series' => function ($q) {
        $q->select($this->getSelectFields($this->keysSerie, 'serie'));
      }])
      ->joinWith(['treinos' => function ($q) {
        $q->select($this->getSelectFields($this->keysTreinos, 'treino'));
      }])
      ->where(['aluno.id_aluno' => $id, 'aluno.ativo' => 1])
      ->asArray()
      ->one();

    return $model;
  }

  /**
   * Cadastra um Aluno
   */
  public function actionAlunoCreate() {

  }

  /**
   * Altera um Aluno
   */
  public function actionAlunoUpdate() {

  }

  /**
   * Verifica se o login já existe
   */
  public function actionAlunoCheckLogin($login) {
    $model = Usuario::findOne(['login' => $login]);

    if (!$model)
      return true;

    return false;
  }

  /**
   * Desativa um Aluno
   */
  public function actionAlunoDelete($id) {
    $model = Usuario::find()
      ->joinWith('idUsuario')
      ->where(['usuario.id_usuario' => $id])
      ->one();

    $model->ativo = 0;

    if ($model->save())
      return true;

    return false;
  }

  // ------ PROVIDER ALUNO ------ //

  // ------ PROVIDER ALUNO TREINO ------ //

  /**
   * Retorna TODOS os Treinos de UM Aluno
   */
  public function actionAlunoTreinoIndex($id) {
    $models = Aluno::find()
      ->joinWith(['series' => function ($q) {
        $q->where(['serie.ativo' => 1]);
      }])
      ->where(['aluno.id_aluno' => $id, 'aluno.ativo' => 1])
      ->asArray()
      ->one();

    return $models;
  }

  /**
   * Retorna UM Treino de UM Aluno
   */
  public function actionAlunoTreinoView($id) {
    $model = Serie::find()
      ->joinWith('exercicioSeries')
      ->where(['serie.id_serie' => $id])
      ->asArray()
      ->one();

    return $model;
  }

  /**
   * Cadastra um Treino
   */
  public function actionAlunoTreinoCreate() {

  }

  /**
   * Altera um Treino
   */
  public function actionAlunoTreinoUpdate() {

  }

  /**
   * Desativa um Treino
   */
  public function actionAlunoTreinoDelete($id) {
    $model = Serie::findOne($id);

    $model->ativo = 0;

    if ($model->save())
      return true;

    return false;
  }

  // ------ PROVIDER ALUNO TREINO ------ //

  // ------ PROVIDER ALUNO AVALIACAO ------ //

  /**
   * Retorna TODAS as Avaliações de UM Aluno
   */
  public function actionAlunoAvaliacaoIndex($id) {
    $models = Aluno::find()
      ->joinWith(['avaliacaoAlunos' => function ($q) {
        $q->where(['avaliacao_aluno.ativo' => 1])
          ->joinWith(['idAvaliacao' => function($q) {
            $q->joinWith(['sessaos' => function ($q) {
              $q->where(['sessao.ativo' => 1])
                ->joinWith(['perguntas' => function ($q) {
                  $q->joinWith('opcaos');
            }]);
          }]);
        }]);
      }])
      ->where(['aluno.id_aluno' => $id, 'aluno.ativo' => 1])
      ->asArray()
      ->all();

    return $models;
  }

  /**
   * Retorna UMA Avaliação de UM Aluno
   */
  public function actionAlunoAvaliacaoView($id) {
    $model = AvaliacaoAluno::find()
      ->joinWith(['idAvaliacao' => function($q) {
        $q->joinWith(['sessaos' => function ($q) {
          $q->where(['sessao.ativo' => 1])
            ->joinWith(['perguntas' => function ($q) {
              $q->joinWith('opcaos');
          }]);
        }]);
      }])
      ->where(['avaliacao_aluno.id_avaliacao_aluno' => $id, 'avaliacao_aluno.ativo' => 1])
      ->asArray()
      ->one();

    return $model;
  }

  /**
   * Cadastra uma AvaliaçãoAluno
   */
  public function actionAlunoAvaliacaoCreate() {

  }

  /**
   * Altera uma AvaliaçãoAluno
   */
  public function actionAlunoAvaliacaoUpdate() {

  }

  /**
   * Desativa uma AvaliaçãoAluno
   */
  public function actionAlunoAvaliacaoDelete($id) {
    $model = AvaliacaoAluno::findOne($id);

    $model->ativo = 0;

    if ($model->save())
      return true;

    return false;
  }

  // ------ PROVIDER ALUNO AVALIACAO ------ //

  // ------ PROVIDER ALUNO CALENDARIO ------ //

  /**
   * Retorna TODOS os Calendários de UM Aluno
   */
  public function actionAlunoCalendarioIndex($id) {
    $models = Treino::find()
      ->joinWith(['idSerie'])
      ->where(['serie.id_aluno' => $id])
      ->asArray()
      ->all();

    return $models;
  }

  /**
   * Retorna UM Calendário de UM Aluno
   */
  public function actionAlunoCalendarioView($id) {
    $model = Treino::find()
      ->joinWith(['idSerie'])
      ->where(['treino.id_treino' => $id])
      ->asArray()
      ->one();

    return $model;
  }

  /**
   * Cadastra um Calendário
   */
  public function actionAlunoCalendarioCreate() {

  }

  /**
   * Altera um Calendário
   */
  public function actionAlunoCalendarioUpdate() {

  }

  /**
   * Desativa um Calendário
   */
  public function actionAlunoCalendarioDelete($id) {
    $model = Treino::findOne($id);

    if ($model->delete())
      return true;

    return false;
  }

  // ------ PROVIDER ALUNO CALENDARIO ------ //

  // ------ PROVIDER ALUNO GRAFICO ------ //

  /**
   * Retorna TODAS as informações do Gráfico de UM Aluno
   */
  public function actionAlunoGraficoIndex() {

  }

  // ------ PROVIDER ALUNO GRAFICO ------ //

  // ------ PROVIDER AVALIACAO ------ //

  /**
   * Retorna TODAS as Avaliações de UM Personal
   */
  public function actionAvaliacaoIndex($id) {
    $models = Avaliacao::find()
      ->joinWith(['sessaos' => function ($q) {
        $q->where(['sessao.ativo' => 1])
          ->joinWith(['perguntas' => function ($q) {
              $q->joinWith(['opcaos']);
          }]);
      }])
      ->where(['avaliacao.id_usuario' => $id, 'avaliacao.ativo' => 1])
      ->orWhere(['avaliacao.id_avaliacao' => 1])
      ->asArray()
      ->all();

    return $models;
  }

  /**
   * Retorna UMA Avaliação de UM Personal
   */
  public function actionAvaliacaoView($id) {
    $model = Avaliacao::find()
      ->joinWith(['sessaos' => function ($q) {
        $q->where(['sessao.ativo' => 1])
          ->joinWith(['perguntas' => function ($q) {
            $q->joinWith(['opcaos']);
          }]);
      }])
      ->where(['avaliacao.id_avaliacao' => $id, 'avaliacao.ativo' => 1])
      ->asArray()
      ->one();

    return $model;
  }

  public function actionAvaliacaoCreate() {

  }

  public function actionAvaliacaoUpdate() {

  }

  public function actionAvaliacaoDelete($id) {
    $model = Avaliacao::findOne($id);

    $model->ativo = 0;

    if ($model->save())
      return true;

    return false;
  }

  // ------ PROVIDER AVALIACAO ------ //

  // ------ PROVIDER EXERCICIO ------ //

  public function actionExercicioIndex($id) {
    $models = ExercicioUsuario::find()
      ->joinWith('idExercicio')
      ->where(['exercicio_usuario.id_usuario' => $id, 'exercicio_usuario.ativo' => 1])
      ->asArray()
      ->all();

    return $models;
  }

  public function actionExercicioView($id) {
    $model = ExercicioUsuario::find()
      ->joinWith('idExercicio')
      ->where(['exercicio_usuario.id_exercicio_usuario' => $id, 'exercicio_usuario.ativo' => 1])
      ->asArray()
      ->one();

    return $model;
  }

  public function actionExercicioCreate() {

  }

  public function actionExercicioUpdate() {

  }

  public function actionExercicioDelete($id) {
    $model = ExercicioUsuario::findOne($id);

    $model->ativo = 0;

    if ($model->save())
      return true;

    return false;
  }

  // ------ PROVIDER EXERCICIO ------ //

  // ------ PROVIDER AULA ------ //

  public function actionAulaIndex() {

  }

  public function actionAulaView() {

  }

  public function actionAulaCreate() {

  }

  public function actionAulaUpdate() {

  }

  public function actionAulaDelete($id) {
    $model = Aula::findOne($id);

    $model->ativo = 0;

    if ($model->save())
      return true;

    return false;
  }

  // ------ PROVIDER AULA ------ //

  // ------ PROVIDER RANKING ------ //

  public function actionRankingIndex() {

  }

  // ------ PROVIDER RANKING ------ //

  // ------ PROVIDER CONFIGURACAO ------ //

  public function actionConfiguracaoIndex($id) {
    $model = Preferencias::findOne($id);
    $modelUsuario = Usuario::findOne($id);

    $cores = explode(',', $model->cores);

    $res = [
      'informacoes' => [
        'descricao' => $modelUsuario->nome,
        'resumo' => $model->resumo,
        'logo' => $id,
        'tolerancia' => $model->tolerancia,
        'desativar' => $model->desativar_aluno
      ],
      'cores' => [
        'primary' => $cores[0],
        'secondary' => $cores[1],
        'light' => $cores[2],
        'dark' => $cores[3],
        'darklight' => $cores[4]
      ],
      'ranking' => [
        'perido' => $model->periodo_meta,
        'frequencia' => $model->frequencia,
        'peso' => $model->peso,
        'pg' => $model->pg,
        'massa' => $model->massa
      ],
      'notificacoes' => [
        'aniversario' => $model->push_niver,
        'treino' => $model->push_treino
      ]
    ];

    return $res;
  }

  public function actionConfiguracaoUpdate() {

  }

  // ------ PROVIDER CONFIGURACAO ------ //

  // ------ METHODS ------ //

  public function emailBody($texto) {
    return
      '<div style="margin: auto; width: 80%; border-style: solid; border-width: thin; border-color: #B0B0B0; border-radius: 5px;">
        <div style="text-align: justify; font-family: calibri; font-size: 17px; margin: 10px;">
          <div style="text-align: right;">
            <img src="' . $this->url . '/logos/1.png" width="50" height="50"/>
          </div>
          <hr>' . $texto . '
          <div>
            <br><br><img src="' . $this->url . '/logos/assinatura.png" width="500" height="130"/>
          </div>
        </div>
      </div>';
  }

  // ------ METHODS ------ //

  // ------ HELPERS ------ //

  public function getSelectFields($arr, $key) {
    $str = array_reduce($arr, function($acc, $e) use ($key) {
      return $acc . $key . '.' . $e . ', ';
    }, '');

    return substr($str, 0, -2);
  }

  // ------ HELPERS ------ //

}
