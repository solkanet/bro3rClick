// ==UserScript==
// @name           bro3_calc_EM-1-plus
// @namespace      http://3g-ws.com/
// @include  https://w40.3gokushi.jp/facility/castle_send_troop.php*
// @description    <内蔵版>ブラ三 領地民兵計算機（Map EM-1） by BSE（Calc1.6.1m Map EM-1）
// @author         BSE
// @version        1.6.2 Map EM-1-plus
// @grant GM_xmlhttpRequest
// @connect *.3gokushi.jp
// ==/UserScript==
//  2010年～2012年の更新情報は省略します。見たい人は、サイトへGo！
//  2013.01.31  ver1.4.b10  mixi10期対応暫定計算人柱版発行
//  2013.01.31  ver1.4.b11  mixi10期対応暫定版
//  2013.02.01  ver1.4.b12  mixi10期対応版
//  2013.03.03  ver1.4.b13  ☆6(2-2-2-0)基準値修正
//  2013.03.13  ver1.4.b14  基準値の再確認・再計算完了
//  2013.08.02  ver1.4.b19  （Map f-1）
//  2013.11.18  ver1.5.b1 Map e-2t
//  2013.11.28 08:20  ver1.5.b1 Map f-1t 人柱。一部同盟に配布。
//  2013.11.28 10:30  ver1.5.b2 Map f-1t 人柱。一部同盟に配布。
//  2013.11.28 11:45  ver1.5.b3 Map f-1t 数値確定。諸要素調整のため、一部同盟に配布。
//  2013.12.01 23:40  ver1.5.b5 Map f-1t
//  2013.12.03 02:00  ver1.5.1 Map f-1t 標準経験値表記の追加、更新インジケータ正式搭載、中間値
//  2013.12.03 19:59  ver1.5.2 Map f-1t 中間値を各自で設定しやすくしました。一部色彩変更
//  2013.12.05 16:40  S
//  2014.09.05 g-1tうぇーぃ！
//  2014.09.07 g-1tいぇーぃ！
//  2014.09.16 g-1t ☆4修正
//  2015.02.20 ver1.5.3
//  2015.06.04 h-1tうぇーい！
//  2016.02.18 20:00 i-1tうぇーい！
//  2016.02.18 20:50 ver1.5.31 MAP i-1t 緊急修正版
//  2016.03.12 b1 UI検討しましょう！
//  2016.03.13 b2 UI検討しましょう！
//  2016.03.13 Ver1.6.1 リリース
//  2017.07.27 Ver1.6.2 GreaseMonkey Ver.3.11並びにFireFox Ver.54.0.1上での不具合修正
//  2026.03.24 Ver1.6.2  EM-1新マップ版試作 https://dev.3g-ws.com/より敵兵データ引用
//　　　　　　　　　　　 鋭の追加で狭くなったので中間値表示なし、乱数使用無し、配布先リンク等非表示

//  ※※※基準数を流用し派生版等を公開もしくは配布する方へ、状況把握のため、ご一報願います。※※※
//  ※※※Beyondへの当ツールまたは、派生物の混載は推奨しません。※※※
//

//各自設定用

	//各自設定用～乱数中間値とか、状況に応じて自由な値を設定したい旨の提案が有ったためこうなりました。
		var sifon_j = 2;//デフォルト「2」。1.2～2.8まで、0.2刻みの9段階自由にどうぞ！
								//参考情報：：MIN「1.0」MAX「3.0」
		var sifon_txt = "Mid　" ;//デフォルト中間値なのでその様に表記。後は趣味にお任せ。

	//表示部分フォント追加分
	var red_f = "</b></font>\n";//太字フォント閉じる。
	var fon_f = "</font>\n";//フォント閉じる
	var red_s = "<font color=red><b>";//最大値用フォント
	var gre_s = "<font color=blue>";//最小値用フォント
	var whi_s = "<font color=thistle>";//中間値・経験値表記系の薄い色の設定
	var whi2_s = "<font color=white>";//表示しない系設定
	var nazeka ="<font color=crimson>■</font>";

//以下、配布関連情報
//バージョン配置用
var ver_rack = "ver1.6.2 【Map EM-1試作】</b>";

//配布管理系
var se_rack = "<b><内蔵版>ブラ三 領地民兵計算機 by BSE ";
var url_rack = "http://dev.3g-ws.com/";
var com_rack = nazeka + "【Map EM-1試作】"+nazeka;
var img_URL = "http://ms.3g-ws.com/calc/k-1t.png";
var img_alt = "※※非常連絡用※※";
var img_txt = whi2_s + "←青ロゴ：通常　　緑ロゴ：一部に異常　　赤ロゴ：異常事態" +fon_f ;



//　出兵距離格納変数
var length;

//　出兵先のタイル数格納変数（平地、木、岩、鉄、穀、荒地）の順。
var tile = new Array(0,0,0,0,0,0);

//　出兵先のパネル構成ごとの兵数計算パラメータ
var point = {
//["凡例",剣,盾,槍,弓,馬,大剣,重盾,矛,弩,近衛,戦斧,双剣,大錘],備考
"100016":["☆1(1-0-0-0)EM-1",6,0,0,0,0,0,0,0,0,0,0,0,0],//EM-1
"010016":["☆1(0-1-0-0)",6,0,0,0,0,0,0,0,0,0,0,0,0],//
"001016":["☆1(0-0-1-0)",6,0,0,0,0,0,0,0,0,0,0,0,0],//
"000116":["☆1(0-0-0-1)",6,0,0,0,0,0,0,0,0,0,0,0,0],//
"300016":["☆2(3-0-0-0)",0,7.5,0,25,0,0,0,0,0,0,0,5,0],//
"030016":["☆2(0-3-0-0)",0,7.5,25,0,0,0,0,0,0,0,7,0,0],//
"003016":["☆2(0-0-3-0)",0,7.5,0,0,25,0,0,0,0,0,0,0,6],//
"200114":["☆2(2-0-0-1)",0,15,0,11,0,0,0,0,0,0,0,6,0],//
"020114":["☆2(0-2-0-1)",0,15,11,0,0,0,0,0,0,0,8.5,0,0],//
"002114":["☆2(0-0-2-1)",0,15,0,0,11,0,0,0,0,0,0,0,7.5],//
"000411":["☆3(0-0-0-4)",0,15,61,61,61,0,0,0,0,0,8,4,7],//
"111022":["☆3(1-1-1-0)",0,13.5,54.5,54.5,54.5,0,0,0,0,0,8,4,7],//
"000126":["☆3(0-0-0-1)",0,51.5,40.5,40.5,40.5,0,0,0,0,0,8,4,7],//
"200215":["☆3(2-0-0-2)",0,34,0,102,0,0,0,0,0,0,0,27,0],//
"020215":["☆3(0-2-0-2)",0,34,102,0,0,0,0,0,0,0,38,0,0],//
"002215":["☆3(0-0-2-2)",0,34,0,0,102,0,0,0,0,0,0,0,32.5],//
"222023":["☆4(2-2-2-0)空22",0,24,96,96,96,0,0,0,0,0,15.5,8.5,12],//空22
"222020":["☆4(2-2-2-0)空19",0,24,108,108,108,0,0,0,0,0,15.5,8.5,12],//空19
"000813":["☆4(0-0-0-8)",0,132,54,54,54,0,0,0,0,0,15.5,8.5,12],//
"600022":["☆5(6-0-0-0)",0,0,0,0,0,0,48,0,143.5,0,0,59.5,0],//
"060022":["☆5(0-6-0-0)",0,0,0,0,0,0,48,99.5,0,0,99.5,0,0],//
"006022":["☆5(0-0-6-0)",0,0,0,0,0,0,48,0,0,120,0,0,80],//
"000129":["☆5(0-0-0-1)",0,0,0,0,0,0,41.5,62,62,62,24.5,11.5,18],//
"1000020":["☆6(10-0-0-0)",0,0,0,0,0,0,201.5,0,592.5,0,0,249,0],//
"0100020":["☆6(0-10-0-0)",0,0,0,0,0,0,201.5,0,0,497.5,0,0,332],//
"0010020":["☆6(0-0-10-0)",0,0,0,0,0,0,201.5,414.5,0,0,414.5,0,0],//
"222024":["☆6(2-2-2-0)",0,0,0,0,0,0,177.5,272.5,272.5,272.5,106.5,47.5,71],//
"442025":["☆7(4-4-2-0)",0,0,0,0,0,0,411,411,411,63,316,316,0],//
"424025":["☆7(4-2-4-0)",0,0,0,0,0,0,411,63,411,411,0,189.5,442.5],//
"244025":["☆7(2-4-4-0)",0,0,0,0,0,0,411,411,63,411,506,0,126.5],//
"000033":["☆7(0-0-0-0)",0,0,0,0,0,0,316,468,468,468,189.5,88.5,139],//
"0001216":["☆7(0-0-0-12)",0,0,0,0,0,0,632.5,265.5,265.5,265.5,316,76,152],//
"1400022":["☆8(14-0-0-0)",0,0,0,0,0,0,629,0,1834,0,0,786,0],//
"0140022":["☆8(0-14-0-0)",0,0,0,0,0,0,629,1310,0,0,1310,0,0],//
"0014022":["☆8(0-0-14-0)",0,0,0,0,0,0,629,0,0,1572,0,0,1048],//
"412028":["☆8(4-1-2-0)※？？？",0,0,0,0,0,0,453,405.5,547,405.5,207.5,151,151],//※？？？
"241028":["☆8(2-4-1-0)",0,0,0,0,0,0,629,760,563.5,563.5,367,131,209.5],//
"124027":["☆8(1-2-4-0)",0,0,0,0,0,0,629,563.5,563.5,760,288,131,288],//
"10009":["☆9(1-0-0-0)",0,0,0,0,0,0,1505.5,0,4391,0,0,1882,0],//
"01009":["☆9(0-1-0-0)",0,0,0,0,0,0,1505.5,3136.5,0,0,3136.5,0,0],//
"00109":["☆9(0-0-1-0)",0,0,0,0,0,0,1505.5,0,0,3763.5,0,0,2509],//
"111240":["☆9(1-1-1-2)",0,0,0,0,0,0,1254.5,1882,1882,1882,752.5,376.5,564.5],//
"0001815":["☆9(0-0-0-18)",0,0,0,0,0,0,2987,950,950,950,684.5,684.5,684.5],//
"444429":["☆9(4-4-4-4)",0,0,0,0,0,0,1505.5,1505.5,1505.5,1505.5,752.5,376.5,564.5],//
"000049":["NPC拠点<font color=red size=＋4><br><b>NPC拠点と推測されます。中身をうかがい知ることは出来ません。</b></font>"],
"333337":["君主城：プレイヤー本拠地<font color=red size=＋4><br><b>誰かの本拠地と推測されます。中身をうかがい知ることは出来ません。</b></font>"]
};

//　兵科に対する各ユニットの防御値
var def = {
//:[剣,盾,槍,弓,騎,大剣,重盾,矛,弩,近衛,戦斧,双剣,大錘],
"ken":[15,24,50,52,54,85,60,140,145,151,139,147,150],//剣兵防御
"yari":[10,108,40,58,28,56,270,100,145,70,54,105,58],//槍兵防御
"yumi":[10,104,25,42,60,56,260,63,105,150,52,102,55],//yumi兵防御
"ki":[10,112,55,26,44,56,280,137,65,110,50,100,53],//騎兵防御
"ono":[7,16,18,22,24,43,48,51,54,59,142,81,200],//斧兵防御
"sou":[9,20,23,26,28,50,56,60,65,70,155,105,70],//双剣兵防御
"sui":[6,13,15,18,20,37,40,42,46,52,105,298,185]//錘兵防御
};

//　各ユニットの攻撃力
var atk = {
	"ken":15,
	"tate":5,
	"yari":40,
	"yumi":42,
	"ki":44,
	"dai":85,
	"jt":10,
	"hoko":100,
	"do":105,
	"kono":110,
	"ono":142,
	"sou":105,
	"sui":185
};



(function(){
		//　出兵拠点座標の取得
		var areas = document.evaluate('//li[@class="gnavi02"]//a/@href', document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
		basecord = areas.snapshotItem(0).value;
		basecord = basecord.replace(/^.*x=(-?[0-9]+).*y=(-?[0-9]+)/, "$1,$2");
		bcordx = RegExp.$1;
		bcordy = RegExp.$2;

		//　出兵先座標(x)の取得
		areas = document.evaluate('//input[@name="village_x_value"]/@value',
		document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
		tocordx = areas.snapshotItem(0).value;

		//　出兵先座標(y)の取得
		areas = document.evaluate('//input[@name="village_y_value"]/@value',
		document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
		tocordy = areas.snapshotItem(0).value;

		//　距離の計算
		length = Math.sqrt((bcordx-tocordx)*(bcordx-tocordx)+(bcordy-tocordy)*(bcordy-tocordy));

		//　出兵先タイルパターン取得のためのHTTP要求　starに★数、tile[]に各タイル数を格納。
		var url = "https://"+location.hostname+"/land.php?x="+tocordx+"&y="+tocordy;
		GM_xmlhttpRequest({
			method:"GET",
			url:url,
			onload:function(x){
				//　読み込み後の処理は関数 getFieldType() 内で行う。
				getFieldType(x.responseText);
			}
		});
})();

//　タイルパターンの取得 及び 兵力計算・表示用関数
function getFieldType(x){

	//　ページ内のタイル数をカウントするための変数 初期化
	var panel = {
		"平地":0,
		"森林":0,
		"岩山":0,
		"鉄鉱山":0,
		"穀物":0,
		"荒地":0
	};

	//　GM_xmlhttpRequestの取得データをxml形式に変換
    var responseXML = document.createElement('div');
    responseXML.innerHTML = x;

	//　ソース中のタイルの行からtitleの文字列を取得
	var panels = document.evaluate('.//*[@id="mapOverlayMap"]//area/@title',
	responseXML, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

	//　1行ずつ対応するタイルの変数を加算していく
	for (var i = 0; i < panels.snapshotLength; i++) {
		panel[panels.snapshotItem(i).value]++;
	}

	//　タイル数→キー（"111116"など）の作成
	var key = String(panel["森林"])+String(panel["岩山"])+String(panel["鉄鉱山"])+String(panel["穀物"])+String(panel["平地"]);

	//　兵力パラメータの取得
	var list = point[key];

	var i;
	var tmp = 0;
	var sum = 0;
	var kenk = 0;
	var yarik = 0;
	var yumik = 0;
	var kik = 0;
	var onok = 0;
	var souk =0;
	var suik =0;

	var tmp2 = 0;
	var sum2 = 0;
	var kenk2 = 0;
	var yarik2 = 0;
	var yumik2 = 0;
	var kik2 = 0;
	var onok2 =0;
	var souk2 =0;
	var suik2 =0;


	//表示距離
	var mal_length = Math.floor(length*100+0.5)/100;
	//表示URL
	var mal_url = "https://"+location.hostname+"/land.php?x="+tocordx+"&y="+tocordy;
	var map_url = "https://"+location.hostname+"/map.php?x="+tocordx+"&y="+tocordy;
	//表示部分Non
	var msg = "";

	if(list==undefined){
		//　キーに対応するデータが見つからない場合。ex.NPC拠点、データがないもの
		msg = msg + "<table class="+ "commonTables" +"><tr><td align=left>出兵元から、" + mal_length + "の距離にある 目的地<a href=" + mal_url + ">(" + tocordx +"," + tocordy + ")</a>　<a href=" + map_url + ">MAP</a>について、有効なデータはありません。<br>※未知のMAPであるか、ツールがこのMAPに対応していない可能性が有ります。</td></tr>\n";
		msg = msg + "<tr><td align=left>" + se_rack + ver_rack + "<br>\n";
		msg = msg + "単一兵科以外での攻撃の場合は別のツールを使いましょ！<br>\n";
//		msg = msg + "苦情・文句・情報提供などは→<a href="+ url_rack+" target=" + "_blank"+">こちら（配布元）</a>まで御願いします。\n";
		msg = msg + "</td></tr></table>\n";



	}else{
		//MAX計算用
		for(i=0;i<list.length;i++){
	//距離最大時乗数
	var hentai = (1+length/10)*3;
	//最大出現数計算
	var kenmax = Math.floor(list[1]*hentai);
	var tatemax = Math.floor(list[2]*hentai);
	var yarimax = Math.floor(list[3]*hentai);
	var yumimax = Math.floor(list[4]*hentai);
	var kimax = Math.floor(list[5]*hentai);
	var daimax = Math.floor(list[6]*hentai);
	var jtmax = Math.floor(list[7]*hentai);
	var hokomax = Math.floor(list[8]*hentai);
	var domax = Math.floor(list[9]*hentai);
	var konomax = Math.floor(list[10]*hentai);
	var onomax = Math.floor(list[11]*hentai);
	var soumax = Math.floor(list[12]*hentai);
	var suimax = Math.floor(list[13]*hentai);

	//最大防御力集計
	var sum = kenmax+(tatemax+yarimax+yumimax+kimax)*2+daimax*3+(jtmax+hokomax+domax+konomax)*4+(onomax+soumax+suimax)*6;
	var kenk = kenmax*def["ken"][0]+tatemax*def["ken"][1]+yarimax*def["ken"][2]+yumimax*def["ken"][3]+kimax*def["ken"][4]+daimax*def["ken"][5]+jtmax*def["ken"][6]+hokomax*def["ken"][7]+domax*def["ken"][8]+konomax*def["ken"][9]+onomax*def["ken"][10]+soumax*def["ken"][11]+suimax*def["ken"][12];
	var yarik = kenmax*def["yari"][0]+tatemax*def["yari"][1]+yarimax*def["yari"][2]+yumimax*def["yari"][3]+kimax*def["yari"][4]+daimax*def["yari"][5]+jtmax*def["yari"][6]+hokomax*def["yari"][7]+domax*def["yari"][8]+konomax*def["yari"][9]+onomax*def["yari"][10]+soumax*def["yari"][11]+suimax*def["yari"][12];
	var yumik = kenmax*def["yumi"][0]+tatemax*def["yumi"][1]+yarimax*def["yumi"][2]+yumimax*def["yumi"][3]+kimax*def["yumi"][4]+daimax*def["yumi"][5]+jtmax*def["yumi"][6]+hokomax*def["yumi"][7]+domax*def["yumi"][8]+konomax*def["yumi"][9]+onomax*def["yumi"][10]+soumax*def["yumi"][11]+suimax*def["yumi"][12];
	var kik = kenmax*def["ki"][0]+tatemax*def["ki"][1]+yarimax*def["ki"][2]+yumimax*def["ki"][3]+kimax*def["ki"][4]+daimax*def["ki"][5]+jtmax*def["ki"][6]+hokomax*def["ki"][7]+domax*def["ki"][8]+konomax*def["ki"][9]+onomax*def["ki"][10]+soumax*def["ki"][11]+suimax*def["ki"][12];
	var onok = kenmax*def["ono"][0]+tatemax*def["ono"][1]+yarimax*def["ono"][2]+yumimax*def["ono"][3]+kimax*def["ono"][4]+daimax*def["ono"][5]+jtmax*def["ono"][6]+hokomax*def["ono"][7]+domax*def["ono"][8]+konomax*def["ono"][9]+onomax*def["ono"][10]+soumax*def["ono"][11]+suimax*def["ono"][12];
	var souk = kenmax*def["sou"][0]+tatemax*def["sou"][1]+yarimax*def["sou"][2]+yumimax*def["sou"][3]+kimax*def["sou"][4]+daimax*def["sou"][5]+jtmax*def["sou"][6]+hokomax*def["sou"][7]+domax*def["sou"][8]+konomax*def["sou"][9]+onomax*def["sou"][10]+soumax*def["sou"][11]+suimax*def["sou"][12];
	var suik = kenmax*def["sui"][0]+tatemax*def["sui"][1]+yarimax*def["sui"][2]+yumimax*def["sui"][3]+kimax*def["sui"][4]+daimax*def["sui"][5]+jtmax*def["sui"][6]+hokomax*def["sui"][7]+domax*def["sui"][8]+konomax*def["sui"][9]+onomax*def["sui"][10]+soumax*def["sui"][11]+suimax*def["sui"][12];

	//距離最小時乗数
	var hentai2 = (1+length/10);
	//最小出現数計算
	var kenmin = Math.floor(list[1]*hentai2);
	var tatemin = Math.floor(list[2]*hentai2);
	var yarimin = Math.floor(list[3]*hentai2);
	var yumimin = Math.floor(list[4]*hentai2);
	var kimin = Math.floor(list[5]*hentai2);
	var daimin = Math.floor(list[6]*hentai2);
	var jtmin = Math.floor(list[7]*hentai2);
	var hokomin = Math.floor(list[8]*hentai2);
	var domin = Math.floor(list[9]*hentai2);
	var konomin = Math.floor(list[10]*hentai2);
	var onomin = Math.floor(list[11]*hentai2);
	var soumin = Math.floor(list[12]*hentai2);
	var suimin = Math.floor(list[13]*hentai2);

	//最小防御力集計
	var sum2 = kenmin+(tatemin+yarimin+yumimin+kimin)*2+daimin*3+(jtmin+hokomin+domin+konomin)*4+(onomin+soumin+suimin)*6;
	var kenk2 = kenmin*def["ken"][0]+tatemin*def["ken"][1]+yarimin*def["ken"][2]+yumimin*def["ken"][3]+kimin*def["ken"][4]+daimin*def["ken"][5]+jtmin*def["ken"][6]+hokomin*def["ken"][7]+domin*def["ken"][8]+konomin*def["ken"][9]+onomin*def["ken"][10]+soumin*def["ken"][11]+suimin*def["ken"][12];
	var yarik2 = kenmin*def["yari"][0]+tatemin*def["yari"][1]+yarimin*def["yari"][2]+yumimin*def["yari"][3]+kimin*def["yari"][4]+daimin*def["yari"][5]+jtmin*def["yari"][6]+hokomin*def["yari"][7]+domin*def["yari"][8]+konomin*def["yari"][9]+onomin*def["yari"][10]+soumin*def["yari"][11]+suimin*def["yari"][12];
	var yumik2 = kenmin*def["yumi"][0]+tatemin*def["yumi"][1]+yarimin*def["yumi"][2]+yumimin*def["yumi"][3]+kimin*def["yumi"][4]+daimin*def["yumi"][5]+jtmin*def["yumi"][6]+hokomin*def["yumi"][7]+domin*def["yumi"][8]+konomin*def["yumi"][9]+onomin*def["yumi"][10]+soumin*def["yumi"][11]+suimin*def["yumi"][12];
	var kik2 = kenmin*def["ki"][0]+tatemin*def["ki"][1]+yarimin*def["ki"][2]+yumimin*def["ki"][3]+kimin*def["ki"][4]+daimin*def["ki"][5]+jtmin*def["ki"][6]+hokomin*def["ki"][7]+domin*def["ki"][8]+konomin*def["ki"][9]+onomin*def["ki"][10]+soumin*def["ki"][11]+suimin*def["ki"][12];
	var onok2 = kenmin*def["ono"][0]+tatemin*def["ono"][1]+yarimin*def["ono"][2]+yumimin*def["ono"][3]+kimin*def["ono"][4]+daimin*def["ono"][5]+jtmin*def["ono"][6]+hokomin*def["ono"][7]+domin*def["ono"][8]+konomin*def["ono"][9]+onomin*def["ono"][10]+soumin*def["ono"][11]+suimin*def["ono"][12];
	var souk2 = kenmin*def["sou"][0]+tatemin*def["sou"][1]+yarimin*def["sou"][2]+yumimin*def["sou"][3]+kimin*def["sou"][4]+daimin*def["sou"][5]+jtmin*def["sou"][6]+hokomin*def["sou"][7]+domin*def["sou"][8]+konomin*def["sou"][9]+onomin*def["sou"][10]+soumin*def["sou"][11]+suimin*def["sou"][12];
	var suik2 = kenmin*def["sui"][0]+tatemin*def["sui"][1]+yarimin*def["sui"][2]+yumimin*def["sui"][3]+kimin*def["sui"][4]+daimin*def["sui"][5]+jtmin*def["sui"][6]+hokomin*def["sui"][7]+domin*def["sui"][8]+konomin*def["sui"][9]+onomin*def["sui"][10]+soumin*def["sui"][11]+suimin*def["sui"][12];

	//指定乱数用-乗数
	var kanaeri = (1+length/10)*sifon_j;
	//指定乱数用-出現数計算
	var ken_sifon = Math.floor(list[1]*kanaeri);
	var tate_sifon = Math.floor(list[2]*kanaeri);
	var yari_sifon = Math.floor(list[3]*kanaeri);
	var yumi_sifon = Math.floor(list[4]*kanaeri);
	var ki_sifon = Math.floor(list[5]*kanaeri);
	var dai_sifon = Math.floor(list[6]*kanaeri);
	var jt_sifon = Math.floor(list[7]*kanaeri);
	var hoko_sifon = Math.floor(list[8]*kanaeri);
	var do_sifon = Math.floor(list[9]*kanaeri);
	var kono_sifon = Math.floor(list[10]*kanaeri);
	var ono_sifon = Math.floor(list[11]*kanaeri);
	var sou_sifon = Math.floor(list[12]*kanaeri);
	var sui_sifon = Math.floor(list[13]*kanaeri);

	//指定乱数用-防御力集計
	var sumM = ken_sifon+(tate_sifon+yari_sifon+yumi_sifon+ki_sifon)*2+dai_sifon*3+(jt_sifon+hoko_sifon+do_sifon+kono_sifon)*4+(ono_sifon+sou_sifon+sui_sifon)*6;
	var kenkM = ken_sifon*def["ken"][0]+tate_sifon*def["ken"][1]+yari_sifon*def["ken"][2]+yumi_sifon*def["ken"][3]+ki_sifon*def["ken"][4]+dai_sifon*def["ken"][5]+jt_sifon*def["ken"][6]+hoko_sifon*def["ken"][7]+do_sifon*def["ken"][8]+kono_sifon*def["ken"][9]+ono_sifon*def["ken"][10]+sou_sifon*def["ken"][11]+sui_sifon*def["ken"][12];
	var yarikM = ken_sifon*def["yari"][0]+tate_sifon*def["yari"][1]+yari_sifon*def["yari"][2]+yumi_sifon*def["yari"][3]+ki_sifon*def["yari"][4]+dai_sifon*def["yari"][5]+jt_sifon*def["yari"][6]+hoko_sifon*def["yari"][7]+do_sifon*def["yari"][8]+kono_sifon*def["yari"][9]+ono_sifon*def["yari"][10]+sou_sifon*def["yari"][11]+sui_sifon*def["yari"][12];
	var yumikM = ken_sifon*def["yumi"][0]+tate_sifon*def["yumi"][1]+yari_sifon*def["yumi"][2]+yumi_sifon*def["yumi"][3]+ki_sifon*def["yumi"][4]+dai_sifon*def["yumi"][5]+jt_sifon*def["yumi"][6]+hoko_sifon*def["yumi"][7]+do_sifon*def["yumi"][8]+kono_sifon*def["yumi"][9]+ono_sifon*def["yumi"][10]+sou_sifon*def["yumi"][11]+sui_sifon*def["yumi"][12];
	var kikM = ken_sifon*def["ki"][0]+tate_sifon*def["ki"][1]+yari_sifon*def["ki"][2]+yumi_sifon*def["ki"][3]+ki_sifon*def["ki"][4]+dai_sifon*def["ki"][5]+jt_sifon*def["ki"][6]+hoko_sifon*def["ki"][7]+do_sifon*def["ki"][8]+kono_sifon*def["ki"][9]+ono_sifon*def["ki"][10]+sou_sifon*def["ki"][11]+sui_sifon*def["ki"][12];


}
		//表示部分
		msg = msg + "<table class="+ "commonTables" +"><tr><td align=left colspan="+1+">\n";
		msg = msg + com_rack + "<br> <u>地形：" + String(list[0]) +"</u><br>\n";
		msg = msg + "(" + bcordx +"," + bcordy + ")<br>▼<u>距離：" + mal_length + "</u>▼<br>"+ "(" + tocordx +"," + tocordy + ")<br>\n";
		msg = msg + "<b>対剣兵科：</b><br>MAX "+ red_s + kenk.toLocaleString() + red_f +  gre_s +"<br>MIN "+ kenk2.toLocaleString() +"</font><br>";
		msg = msg + "<b>対槍兵科：</b><br>MAX "+ red_s + yarik.toLocaleString() + red_f + gre_s +"<br>MIN "+ yarik2.toLocaleString() +"</font><br>";
		msg = msg + "<b>対弓兵科：</b><br>MAX "+ red_s + yumik.toLocaleString() + red_f + gre_s +"<br>MIN "+ yumik2.toLocaleString() +"</font><br>";
		msg = msg + "<b>対騎兵科：</b><br>MAX "+ red_s + kik.toLocaleString() + red_f + gre_s +"<br>MIN "+ kik2.toLocaleString() +"</font><br>";
		msg = msg + "<b>対斧兵科：</b><br>MAX "+ red_s + onok.toLocaleString() + red_f + gre_s +"<br>MIN "+ onok2.toLocaleString() +"</font><br>";
		msg = msg + "<b>対双兵科：</b><br>MAX "+ red_s + souk.toLocaleString() + red_f + gre_s +"<br>MIN "+ souk2.toLocaleString() +"</font><br>";
		msg = msg + "<b>対錘兵科：</b><br>MAX "+ red_s + suik.toLocaleString() + red_f + gre_s +"<br>MIN "+ suik2.toLocaleString() +"</font><br></td></tr><tr><td align=left colspan="+1+">\n";
		msg = msg +  red_s+"§期待撃破スコア§</b></font><br>MAX<b> "+red_s + sum.toLocaleString()+ red_f + " <br></b> MIN "+ gre_s + sum2.toLocaleString()+ "<br>"+ red_f + whi_s  +sifon_txt + sumM.toLocaleString()+ fon_f +"<br>\n";


		msg = msg + "</td></tr>\n";



		msg = msg + "<tr><td align=left colspan="+1+">\n";
		msg = msg + se_rack + ver_rack + "<br>\n";
//		msg = msg + "単一兵科専用！　　苦情・文句・情報提供などは↓まで御願いします。<br><a href="+ url_rack+" target=" + "_blank"+"><img src="+ img_URL +" alt="+ img_alt +"></a>\n";
		msg = msg + "</td></tr>\n";



	}

	var insertHtml = "<tr><td>" + msg + "</td></tr>";

	var insertElem = document.createElement('div');
	insertElem.innerHTML = insertHtml;
	insertElem = insertElem.firstChild;



	var containerElem = document.evaluate('//*[@class=\"sideBoxInner basename\"]',
 document, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);

	containerElem.snapshotItem(0).appendChild(insertElem);




}

