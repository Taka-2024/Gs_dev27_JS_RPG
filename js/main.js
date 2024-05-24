"use strict";                               //strictモードとは、javascriptのコードをより厳しくエラーチェックすることができる仕組み　ref:https://developer.mozilla.org/ja/docs/Glossary/Strict_mode

const       CHRHEIGHT       = 9;                        //キャラの高さ
const       CHRWIDTH        = 8;                        //キャラの幅
const       FONT            ="12px monospace";          //使用フォント
const       FONTSTYLE       ="#ffffff";                  //文字の色
const       HEIGHT          = 120;                      //仮想画面高さ 120/8=15マス
const       WIDTH           = 128;                      //仮想画面幅　128/8=16マス
const       INTERVAL        = 33;                       //フレーム呼び出し間隔    
const       SMOOTH          = 0;                        //補間処理  imageSmoothingEnabledプロパティの真偽値を偽に指定　※平滑化 (true、既定値) 平準化しない (false)
const       START_HP        =20;                        //開始HP
const       START_X         =15;                        //開始時のX座標
const       START_Y         =17;                        //開始時のX座標
const       TILESIZE        = 8;                        //タイルサイズ（ドット）
const       TILECOLUMN      = 4;                        //タイル桁数　(4*8)*（4*8）のpngマップのため
const       TILEROW         = 4;                        //タイル行数　(4*8)*（4*8）のpngマップのため
const       MAP_WIDTH       = 32;                       //マップ幅
const       MAP_HEIGHT      = 32;                       //マップ高さ
const       SCR_WIDTH       = 8;                        //画面タイルサイズの半分の幅
const       SCR_HEIGHT      = 8;                        //画面タイルサイズの半分の高さ
const       SCROLL          = 1;                        //スクロール速度
const       WNDSTYLE       ="rgba( 0, 0, 0, 0.75)";    //ウィンドウの色

const       gKey  = new Uint8Array(0x100);                   //キー入力バッファ

let         gAngle = 0;                                     //プレイヤーの向き
let         gEx = 0;                                        //プレイヤーの経験値
let         gHP = START_HP                                  //プレイヤーのHP
let         gMHP = START_HP                                 //プレイヤーの最大HP
let         gLv = 1                                         //プレイヤーのレベル
let         gCursor = 0;                                    //カーソル位置
let         gEnemyHP;
let         gEnemyType;                                       //エネミー種別
let         gFrame = 0;                                     //内部カウンタ
let         gHeight;                                        //実画面の高さ
let         gWidth;                                         //実画面の幅
let         gMessage1 = null;                               //表示メッセージ1
let         gMessage2 = null;                               //表示メッセージ2
let         gMoveX = 0;                                     //移動量X
let         gMoveY = 0;                                     //移動量Y
let         gOrder;                                         //行動順
let         gImgBoss;                                       //画像‗ラスボス
let         gImgMap;                                        //画像_マップ
let         gImgPlayer;                                     //画像_プレイヤー
let         gImgMonster;                                    //画像_モンスター
let         gItem = 0;                                      //所持アイテム 
let         gPhase = 0;                                     //戦闘フェーズ        
let         gPlayerX =  START_X * TILESIZE + TILESIZE / 2 ;        //プレイヤーX座標
let         gPlayerY =  START_Y * TILESIZE + TILESIZE / 2 ;        //プレイヤーY座標
let         gScreen;                                        //仮想画面
let         isPlaying = false;                              //初期状態は音楽あり
let         audio     = new Audio(" ");  

const       gFileBoss    =  "img/boss.png";
const       gFileMap    =  "img/map.png";
const       gFileMonster =  "img/monster.png";
const       gFilePlayer =  "img/player.png";
const       mField1 = "mp3/field_1.mp3";           //フィールド音楽1
const       mBattle1 ="mp3/battle_1.mp3";           //バトル音楽1
// const       mBattle2 ="";
const       mEnding ="mp3/Ending.mp3"; 


const       gEncounter  = [0, 0, 0, 1, 0, 0, 2, 3, 0, 0, 0, 0, 0, 0, 0, 0];         //エンカウント確率

const       gMonsterName = ["スライム","ラビット","ナイト","ドラゴンベビー", "魔王"];         //モンスター名

//マップ
const       gMap = [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 0, 3, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 3, 3, 7, 7, 7, 7, 7, 7, 7, 7, 7, 6, 6, 3, 6, 3, 6, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 3, 3, 6, 6, 7, 7, 7, 2, 2, 2, 7, 7, 7, 7, 7, 7, 7, 6, 3, 0, 0, 0, 3, 3, 0, 6, 6, 6, 0, 0, 0,
    0, 0, 3, 3, 6, 6, 6, 7, 7, 2, 2, 2, 7, 7, 2, 2, 2, 7, 7, 6, 3, 3, 3, 6, 6, 3, 6,13, 6, 0, 0, 0,
    0, 3, 3,10,11, 3, 3, 6, 7, 7, 2, 2, 2, 2, 2, 2, 1, 1, 7, 6, 6, 6, 6, 6, 3, 0, 6, 6, 6, 0, 0, 0,
    0, 0, 3, 3, 3, 0, 3, 3, 3, 7, 7, 2, 2, 2, 2, 7, 7, 1, 1, 6, 6, 6, 6, 3, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 7, 7, 7, 7, 2, 7, 6, 3, 1, 3, 6, 6, 6, 3, 0, 0, 0, 3, 3, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 6, 6, 7, 2, 7, 6, 3, 1, 3, 3, 6, 6, 3, 0, 0, 0, 3, 3, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 6, 7, 7, 7, 6, 3, 1, 1, 3, 3, 6, 3, 3, 0, 0, 3, 3, 3, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 6, 6, 7, 7, 7, 6, 3, 1, 1, 3, 3, 6, 3, 3, 0, 3,12, 3, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 6, 6, 6, 7, 7, 6, 3, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 6, 6, 6, 6, 3, 1, 1, 1, 1, 3, 3, 3, 3, 3, 3, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 6, 6, 3, 3, 3, 3, 1, 1, 3, 3, 3, 1, 1, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 4, 5, 3, 3, 3, 6, 6, 6, 3, 3, 3, 1, 1, 1, 1, 1, 3, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 8, 9, 3, 3, 3, 6, 6, 6, 6, 3, 3, 3, 3, 3, 3, 1, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 6, 6, 6, 3, 3, 3, 3, 3, 3, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 6, 6, 6, 6, 3, 3, 3, 3, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 6, 6, 6, 6, 3, 3, 3, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 6, 6, 6, 3, 3, 3, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 6, 6, 6, 3, 6, 6, 6, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 6, 6, 3, 6, 6, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 6, 6, 3, 6, 6, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 6, 3, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 6, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,14, 6, 0, 0, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 6, 6, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 6, 7, 0, 0, 0, 0, 0, 0, 0, 0,
    7,15, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 7, 7, 7, 0, 0, 0, 0, 0,
    7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 7, 7, 7, 7, 7,

];




//戦闘行動処理
function Action ()
{

    gPhase ++;                                  //フェーズ経過　05/24_現在自分の攻撃のみ実施自分の攻撃で相手が倒れたかの判定を実施し、行動を継続するように開発予定。

        if(((gPhase + gOrder ) & 1 ) == 0 ){                                                                       //
            const     d =  GetDamage( gEnemyType + 2 ) ;
            SetMessage( gMonsterName[ gEnemyType ]+ "の攻撃！", d + "　のダメージ！"  );
            gHP -= d;                                                                           //プレイヤーのHPの減少処理
            if ( gHP <=0 ){                                                                      //プレイヤーが負けた場合
                gPhase = 7;
            }
            return;
        } 

        //プレイヤーの行動フェーズ
        if( gCursor == 0 ){                                                                  //「戦う」選択時
            const   d = GetDamage(gLv + 1)
            SetMessage("あなたの攻撃！", d + "　のダメージ！" );
            gEnemyHP -= d;
            if (gEnemyHP <=0 ){
                gPhase = 5;
            }
            return;
        }



    if(gCursor == 1){
        if(Math.random() < 0.7){                            //「逃げる」成功時
            SetMessage( "あなたは逃げ出した" , null);
        gPhase = 6;
            return;
        }
        SetMessage( "あなたは逃げ出した", "しかし回り込まれた！");    //「逃げる」失敗時
    }
}
//経験値処理
function AddExp(val){
    gEx += val;
    while(gLv * (gLv + 1) * 2 <= gEx) {
        gLv++;                                              //レベルアップ
        gMHP += 4 + Math.floor( Math.random() * 3);         //最大HP上昇4～6
    }
}


//敵出現処理
function AppearEnemy( t ){
    // t = Math.floor( Math.random() * 4) ;
    gPhase = 1;
    gEnemyHP = t * 3 + 5;                   //敵HP
    gEnemyType = t ;                                    //     
    SetMessage("モンスターが現れた！" , null);
    if (isPlaying){
       PlayMusic();
    }
    // setTimeout(function() {
    //     gPhase = 2;
    // }, 2000);
    }



//戦闘コマンド
function CommandFight()
{
    gPhase = 2;                             //戦闘コマンド選択フェーズ
    gCursor = 0;
    SetMessage ("　戦う" , "　逃げる");[
    
    ]
} 

//戦闘画面描画処理
function DrawFight( g )
{
    g.fillStyle = "#000000";                    //背景色
    g.fillRect( 0, 0, WIDTH, HEIGHT);        //画面全体を黒

    if( gPhase <=5 ){                            //敵が生存している場合
        if( IsBoss()){                              //ラスボスの場合
            let scale = Math.min(WIDTH / gImgBoss.width, HEIGHT / gImgBoss.height);
            let offsetX = (WIDTH - gImgBoss.width * scale) / 2;
            let offsetY = (HEIGHT - gImgBoss.height * scale) / 2;
            g.drawImage(gImgBoss, 0, 0, gImgBoss.width, gImgBoss.height, offsetX, offsetY, gImgBoss.width * scale, gImgBoss.height * scale);
        }else{                                      //通常モンスターの場合
            let     w = gImgMonster.width / 4    ;
            let     h = gImgMonster.height       ;
            g.drawImage( gImgMonster, gEnemyType * w, 0, w, h, Math.floor( WIDTH / 2 - w / 2 ), Math.floor( HEIGHT / 2 - h / 2 ), w, h );	//	
        }
    }

    DrawStatus( g );	
    DrawMessage( g );                                   //メッセージ描画

    if(gPhase == 2 ){                                   //戦闘フェーズがコマンド選択中の場合
        g.fillText( "⇒", 6 ,96 + 14 * gCursor );            // カーソル描画
    }
    
}



//フィールド画面描画処理
function DrawField( g )
{    
    let         mx = Math.floor (gPlayerX / TILESIZE );                 //プレイヤーのタイル座標X
    let         my = Math.floor (gPlayerY / TILESIZE );                 //プレイヤーのタイル座標Y
    
    for( let dy = -SCR_HEIGHT; dy <= SCR_HEIGHT ; dy++ ){
        let     ty = my +dy;                                            //タイル座標Y
        let     py = ( ty + MAP_HEIGHT )  % MAP_HEIGHT;                 //ループ後タイル座標Y
        for (let dx = -SCR_WIDTH ; dx <= SCR_WIDTH; dx++){
            let     tx = mx + dx;                                       //タイル座標X
            let     px = ( tx + MAP_WIDTH  )  % MAP_WIDTH;              //ループ後タイル座標X
            DrawTile( g,
                        // x                                * TILESIZE
                        // (tx + 8 -mx)                     * TILESIZE,
                        // (tx + 8 -gPlayerX / TILESIZE)    * TILESIZE,
                        // (tx + 8                        )    * TILESIZE -gPlayerX,
                        // tx * TILESIZE + 8 * TILESIZE                      -gPlayerX,
                        tx * TILESIZE + WIDTH / 2                      -gPlayerX,
                        // y                                * TILESIZE                              
                        // (ty + 7 -my)                     * TILESIZE,                                     //仮想画面の幅が偶数のため、暫定的にキャラクターのX座標の開始位置を「-TILESIZE / 2」で引いている　※ドット単位で動く仕様に変更する際に削除「part9」
                        // (ty + 7 -gPlayerY / TILESIZE)    * TILESIZE,                                     
                        // (ty + 7                        )    * TILESIZE - gPlayerY,                          //○○のため[x]ではなく[xy]を用いで記述          
                        // ty * TILESIZE  + 7 * TILESIZE                     - gPlayerY,                          //○○のため[x]ではなく[xy]を用いで記述          
                        ty * TILESIZE  + HEIGHT / 2                     - gPlayerY,                          //○○のため[x]ではなく[xy]を用いで記述          
                        gMap[ py * MAP_WIDTH + px ]);              
        }
    }
    //プレイヤー位置確認用
    // g.fillStyle = "#ff0000";                                            //2Dキャンバスのメソッド　ref:https://developer.mozilla.org/ja/docs/Web/API/CanvasRenderingContext2D/fillref:
    // g.fillRect( 0, HEIGHT / 2 - 1, WIDTH, 2 );                          //2Dキャンバスのメソッド　塗りつぶした矩形を、 (x, y) を始点とし、 width と height でサイズを指定しで描画
    // g.fillRect( WIDTH / 2 -1, 0, 2, HEIGHT );                           //2Dキャンバスのメソッド　塗りつぶした矩形を、 (x, y) を始点とし、 width と height でサイズを指定しで描画

    // プレイヤー
    g.drawImage( gImgPlayer,
                 (gFrame >> 4 & 1 ) * CHRWIDTH, gAngle * CHRHEIGHT , CHRWIDTH, CHRHEIGHT, 
                 WIDTH / 2 - CHRWIDTH / 2 , HEIGHT / 2 - CHRHEIGHT + TILESIZE / 2, CHRWIDTH, CHRHEIGHT);    
}

//メインコンテンツの描画
function DrawMain()
{
    const g = gScreen.getContext("2d");                                 //getContext() メソッド、引数に"2d"を渡している。仮想画面の2D描画コンテキストを取得　ref:https://developer.mozilla.org/ja/docs/Web/API/HTMLCanvasElement/getContext
    
    if( gPhase <= 1){
        DrawField( g );           //フィールド画面描画
    }else{
        DrawFight( g );
    }
    
    //ステータスウィンドウ
	g.fillStyle = WNDSTYLE;							//	ウィンドウの色
	g.fillRect( 2, 2, 44, 37 );						//	矩形描画

    DrawStatus ( g );                                  //ステータス描画
    DrawMessage( g );                                  //メッセージ描画

    // document.addEventListener('keydown', function(event) {
    //     if (event.code === 'Space') {  // スペースキーが押された場合
    //         DrawConfig( g );
    //     }
    // });

    //デバッグウィンドウ
    // g.fillStyle = WNDSTYLE;                                //ウィンドウの色        
    // g.fillRect( 20 , 3 , 105, 15);                        //ウィンドウの大きさ

    // g.font = FONT;                                          //文字フォントの設定
    // g.fillStyle = FONTSTYLE;                                //文字の色
    // g.fillText( "x=" + gPlayerX +  " y=" +gPlayerY  + " m=" +  gMap [ my * MAP_WIDTH + mx], 25, 15);
}

//メッセージ描画
function DrawMessage( g )
{
        if( !gMessage1 ){                                        //メッセージがない場合
            return;
        }
        g.fillStyle = WNDSTYLE;                                //ウィンドウの色        
        g.fillRect( 4 , 84 , 120, 30);                          //ウィンドウの大きさ

        g.font = FONT;                                          //文字フォントの設定
        g.fillStyle = FONTSTYLE;                                //文字の色
        g.fillText( gMessage1, 6, 96);
        if (gMessage2){                                         //gMessage2の真偽値をチェックし真でなければ実行される
            g.fillText( gMessage2, 6, 110);
        }

}

//ステータス描画
function DrawStatus( g )
    {
        g.font = FONT;                                          //文字フォントの設定
        g.fillStyle = FONTSTYLE;                                //文字の色
        g.fillText( "LV " , 4, 13);     DrawTextR( g , gLv, 36, 13) ;                        //Lv
        g.fillText( "HP " , 4, 25);     DrawTextR( g , gHP, 36, 25) ;                         //HP
        g.fillText( "EX " , 4, 37);     DrawTextR( g , gEx, 36, 37) ;                         //Ex
}

function DrawTextR( g, str, x, y)
{
    g.textAlign = "right";
    g.fillText( str, x, y);
    g.textAlign = "left";
}
//セーブ画面
// function DrawConfig( g )
// {
    // document.addEventListener('keydown', function(event) {
    //     if (event.code !== 'Space') {  // スペースキーが押されていない場合
    //         return;
    //     }
//         g.fillStyle = WNDSTYLE;                               //ウィンドウの色        
//         g.fillRect( 84 , 2 , 40, 20);                          //ウィンドウの大きさ

//         g.font = FONT;                                          //文字フォントの設定
//         g.fillStyle = FONTSTYLE;                                //文字の色
//         g.fillText( "セーブ", 95, 13);
//         g.fillText( "ロード", 95, 25);
//     // });
// }


function SwitchAudio()
{
    SwitchMusic ()

}

function PlayMusic()
{
    if (gPhase == 0 ) {
        audio.pause();
        audio.src = mField1;
        audio.volume = 0.05;  //
        audio.loop = true;    // ループ再生をオン
        audio.play();
        isPlaying = true;
    }
    
    if (gPhase ==1 ) {
        audio.pause();
        audio.src = mBattle1;
        audio.volume = 0.05;  //
        audio.loop = true;    // ループ再生をオン
        audio.play();
        isPlaying = true;
    }
    
    if (gPhase == 6 ) {
        audio.pause();
        audio.src = mEnding;
        audio.volume = 0.05;  //
        audio.loop = true;    // ループ再生をオン
        audio.play();
        isPlaying = true;
    }    
}


function PauseMusic(){
    audio.pause();
    audio.currentTime = 0;  // 停止後音楽を最初から再生するために設定
    isPlaying = false;
}

//音楽切り替え処理
function SwitchMusic (){
    if (isPlaying) {            // 音楽が再生中の場合は停止
        PauseMusic();
    } else {            // 音楽が停止中の場合は再生
        PlayMusic();
    }
}




function DrawTile( g, x,  y, idx )
{
    const       ix = (idx % TILECOLUMN ) *  TILESIZE; 
    const       iy = Math.floor(idx / TILECOLUMN ) *  TILESIZE;
    g.drawImage(gImgMap, ix, iy, TILESIZE, TILESIZE, x, y, TILESIZE, TILESIZE );    // drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight) ※sx,sy,sWidth,sHeightは省略可　ref:https://developer.mozilla.org/ja/docs/Web/API/CanvasRenderingContext2D/drawImage
}


//ダメージ算出式
function GetDamage( a )
{
    return(Math.floor( a * ( 1 + Math.random())));  //攻撃力の1～2倍
}


function    IsBoss()
{
    return( gEnemyType == gMonsterName.length - 1 ) ;
}
function LoadImage()
{
    gImgBoss    = new Image(); gImgBoss.src = gFileBoss;          //ラスボス画像読み込み
    gImgMap     = new Image(); gImgMap.src = gFileMap;          //マップ画像読み込み
    gImgMonster = new Image(); gImgMonster.src=gFileMonster;    //モンスター画像読み込み
    gImgPlayer  = new Image(); gImgPlayer.src =gFilePlayer;    //プレイヤー画像読み込み
}

//function SetMessage( v1, v2 = null )	//	IE対応
function SetMessage( v1, v2 )
{
    gMessage1 = v1;
    gMessage2 = v2;
}

//IE対応（signメソッドがないため）
function Sign( val )
{
    if (val == 0){
        return( 0 );
    }
    if (val < 0){
        return( -1);
    }
    return ( 1);
}


//フィールド進行処理
function TickField()
{
    if ( gPhase != 0){
        return;
    }

    if( gMoveX !=0 || gMoveY != 0 || gMessage1 ){}              //移動中またはメッセージ表示中の場合
    else if( gKey[ 37 ]) {gAngle = 1; gMoveX = - TILESIZE;}     //左
    else if( gKey[ 38 ]) {gAngle = 3; gMoveY = - TILESIZE;}     //上
    else if( gKey[ 39 ]) {gAngle = 2; gMoveX =   TILESIZE;}     //右
    else if( gKey[ 40 ]) {gAngle = 0; gMoveY =   TILESIZE;}     //下

    //移動後のタイル座標判定
    let     mx = Math.floor( (gPlayerX + gMoveX) / TILESIZE ); //タイル座標X
    let     my = Math.floor( (gPlayerY + gMoveY) / TILESIZE ); //タイル座標Y
    mx += MAP_WIDTH;                                         //マップループ処理X
    mx %= MAP_WIDTH;                                         //マップループ処理X
    my += MAP_HEIGHT;                                         //マップループ処理Y
    my %= MAP_HEIGHT;                                         //マップループ処理Y
    let m = gMap[ my * MAP_WIDTH + mx];                         //タイル番号
    if( m < 3){                                                 //侵入不可の地形の場合
        gMoveX = 0;                                             //移動禁止X
        gMoveY = 0;                                             //移動禁止Y    
    }

    if( Math.abs (gMoveX) + Math.abs(gMoveY) == SCROLL){                                        //スクロール処理が終わる直前に移動後のマップの判定を実施しメッセージ等を表示
  
        if( m == 8 || m == 9){     
            gHP = gMHP;                                                                             //HP全回復
            SetMessage("魔王を倒して！", null );                                                     //城  
        }

        if( m == 10 || m == 11){                                                                    //街
            gHP = gMHP;                                                                             //HP全回復
            SetMessage("西の果てにも", "村があります" );                                                  
        }

        if( m == 12 ){                                                                              //村
            gHP = gMHP;                                                                             //HP全回復
            SetMessage("カギは", "洞窟にあります" );                                                  
        }

        if( m == 13 ){                                                                              //洞窟
            SetMessage("カギを手に入れた！", null );
            gItem = 1;                                                                              //鍵入手
        }

        if( m == 14 ){
            if( gItem == 0){
            gPlayerY -= TILESIZE;                                                                   //1マス上へ移動
            SetMessage("カギが必要です", null)
            }else                                                       
            SetMessage("扉が開いた！", null );                                                  
        }

        if( m == 15 ){                                                                              //魔王
            AppearEnemy( gMonsterName.length - 1);                                     
        }
        
        if (Math.random() * 16 < gEncounter[ m ]){               //マップの処理に応じてランダムエンカウント     
            gPhase = 1;
            let     t = Math.abs( gPlayerX / TILESIZE - START_X) +
                        Math.abs( gPlayerY / TILESIZE - START_Y) ;                  //開始位置からの距離で敵のレベルを変更
            if( m == 6 ){                                                           //林なら敵レベルを0.5上昇
                t += 8;
            }
            if( m == 7 ){                                                           //山なら敵レベルを1上昇
                t += 16;
            }
            t+= Math.random() * 5 ;                                                  //敵レベルをランダムに0.5上昇
            t = Math.floor ( t / 16);
            t = Math.min( t, gMonsterName.length - 2 );                                            //出現モンスターの上限処理
            AppearEnemy( t )  ;                                                  //戦闘フェーズ [0＝スライム、1＝ラビット、、、4＝魔王
        }
        
        

    }

    gPlayerX += Sign( gMoveX ) * SCROLL;         //プレイヤー座標移動X   
    gPlayerY += Sign( gMoveY ) * SCROLL;        //プレイヤー座標移動Y
    gMoveX   -= Sign( gMoveX ) * SCROLL;           //移動量消費X
    gMoveY   -= Sign( gMoveY ) * SCROLL;           //移動量消費Y

    //マップループ処理
    gPlayerX += (MAP_WIDTH  * TILESIZE ); 
    gPlayerX %= (MAP_WIDTH  * TILESIZE ); 
    gPlayerY += (MAP_HEIGHT * TILESIZE ); 
    gPlayerY %= (MAP_HEIGHT * TILESIZE ); 
}

//描画処理
function WmPaint()
{
	DrawMain();

	const	ca = document.getElementById( "main" );	//	mainキャンバスの要素を取得
	const	g = ca.getContext( "2d" );				//	2D描画コンテキストを取得
	g.drawImage( gScreen, 0, 0, gScreen.width, gScreen.height, 0, 0, gWidth, gHeight );	//	仮想画面のイメージを実画面へ転送
}



//ブラウザのサイズ変更イベント
function WmSize()
{
    const    ca = document.getElementById("main");      //mainキャンバスの要素を取得
    ca.width = window.innerWidth;                   //キャンパスの幅をブラウザの幅へ    ref:https://developer.mozilla.org/ja/docs/Web/API/Window
    ca.height = window.innerHeight;                 //キャンパスの幅をブラウザの高さへ

    const    g  = ca.getContext("2d");              //2D描画コンテキストを取得
    g.imageSmoothingEnabled =g.imageSmoothingEnabled =  SMOOTH;  //補間処理


    //実画面サイズを計測。ドットのアスペクト比を維持したままでのサイズを計測する。
    gWidth =ca.width;      //実画面の幅
    gHeight = ca.height;   //実画面の高さ
    if(gWidth / WIDTH < gHeight / HEIGHT ){
        gHeight = gWidth * HEIGHT / WIDTH;
    }else{
        gWidth = gHeight * WIDTH / HEIGHT;
    }
}

//タイマーイベント発生時の処理
function WmTimer()
{
    if ( !gMessage1){
        gFrame++;                                       //内部カウンタの増加
        TickField();                                    //フィールド進行処理
    }
    WmPaint(); 
}

//キー入力（DOWN）イベント
window.onkeydown = function( ev )                   //キーを押したときの処理
{
    let     c = ev.keyCode;                         //キーコードをイベント時に取得 ref:https://developer.mozilla.org/ja/docs/Web/API/KeyboardEvent/keyCode
    if( gKey[ c ] != 0){                            //既にキーを押している場合
        return;
    }
    gKey[ c ] = 1;

    if( c == 83 ){               //Sキーの場合
        localStorage.setItem("X座標", gPlayerX.toString())
        localStorage.setItem("Y座標", gPlayerY.toString())
        return;
    }

    if( c == 76 ){               //Lキーの場合
        let storedX = parseInt(localStorage.getItem('X座標'));
        let storedY = parseInt(localStorage.getItem('Y座標'));
        gPlayerX = storedX;c
        gPlayerY = storedY;
        return;
    }

    if( c == 67 ){               //Cキーの場合
        localStorage.removeItem('X座標');
        localStorage.removeItem('Y座標');
        return;
    }
    if( c == 77 ){               //Cキーの場合
        SwitchAudio()
        return;
    }



    // if (gPhase == 0){                               //フィールド上で
    //     if( c == 32 ){                              //スペースキーの場合
    //     DrawConfig();
    //     return;
    //     }    
    // }



    if (gPhase == 1){                               //敵が現れた場合
        CommandFight();
        return;
    }   


    if (gPhase == 2){                           //戦闘コマンド選択フェーズ
        if( c == 13 || c == 90 ){               //Enterキー、又はZキーの場合
            gOrder = Math.floor( Math.random() * 2 );               //戦闘行動順決定
            Action();                           //戦闘行動処理　※Action内でフェーズを進行させている
        }else{
            gCursor = 1 - gCursor; //カーソル移動
        }
        return
    }

    if( gPhase == 3 ){          //戦闘実施フェーズ
        Action();               //戦闘行動処理
        return;
    }

    if( gPhase == 4 ){
        CommandFight();                         //戦闘コマンド
        return;

    }

    if( gPhase == 5 ){
        gPhase = 6;
        AddExp(gEnemyType + 1);
        gHP -=  gEnemyType + 1;
        SetMessage ("モンスターを倒した！", null);
        return;
    }

    if( gPhase == 6 ){
        if( IsBoss() && gCursor == 0){          //敵がラスボスで、かつ「戦う」を選択したとき
            SetMessage("魔王を倒し", "世界に平和が訪れた" );
            if (isPlaying){
            PlayMusic();
            return;
            }             
        }
        gPhase = 0;
        if(isPlaying){
        PlayMusic();
        }
        return;
    }
    
    if( gPhase == 7){
        gPhase = 8;
        SetMessage( "負けてしまった", null);
        return;
    }

    if( gPhase == 8){
        SetMessage( "ゲームオーバー", null);
        return;
    }

    

    gMessage1 = null;
}


//キー入力（UP）イベント
window.onkeyup = function( ev )                     //キーを離したときの処理
{
    gKey [ ev.keyCode ]  =0;
}


// browser起動イベント
window.onload =function()                                                   //onload ref:https://qiita.com/s_ryota/items/ac26a2fb9a62c16561ce
{


    LoadImage();
    gScreen = document.createElement("canvas");                             //tagName で指定された HTML 要素を生成し、または tagName が認識できない場合は HTMLUnknownElement を生成 ref: https://developer.mozilla.org/ja/docs/Web/API/Document/createElement
    gScreen.width = WIDTH;                                                  //実画面の幅を仮想画面の幅に
    gScreen.height = HEIGHT;                                                //実画面の高さを仮想画面の高さに

    WmSize();                                                               //画面サイズ初期化
    window.addEventListener("resize", function(){WmSize()});                //ブラウザサイズ変更時の処理　ここでは"resize"イベントがおこった際、"WmSize"関数が実行される　　ref:https://developer.mozilla.org/ja/docs/Web/API/EventTarget/addEventListener
    setInterval(function(){WmTimer()}, INTERVAL);                                  //33ms間隔で、WmTimer()を呼び出す（約30.3fps）　ref:https://developer.mozilla.org/ja/docs/Web/API/setInterval

    alert("「m」キーを押すと音楽が流れます。もう一度押すと音楽が止まります。")
}