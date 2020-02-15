// ==UserScript==
// @name		bro3rClick
// @namespace	bro3rClick
// @description	ブラウザ三国志 右クリック拡張
// @include		https://*.3gokushi.jp/*
// @exclude   https://*.3gokushi.jp/external/*
// @author		su-zan
// @version		1.2 + Yamasakin 2014.08.31
// @require		http://ajax.googleapis.com/ajax/libs/jquery/1.3.2/jquery.min.js
// @grant		GM_addStyle
// @grant		GM_log
// @grant		GM_setValue
// @grant		GM_getValue
// @grant		GM_deleteValue
// @grant		GM_listValues
// @grant		GM_xmlhttpRequest
// @grant		GM_openInTab
// @grant		GM_registerMenuCommand
// @priority	15
// @updateURL	https://dl.dropboxusercontent.com/s/xdeo31iouzc38kt/b3rclick.user.js?dl=1
// ==/UserScript==
// 2013.10.15	資源建設の最大レベル間違いを修正
// 2014.04.19	@priority @updateURL の設定追加
// 2018.12.26 ちょい改造Sol


(function () {

	var NAMESPACE = 'b3rClick';
	var crossBrowserUtility = initCrossBrowserSupport();

	var LordName = '君主名';
	var Flatland = '平地';
	var Info = '情報';
	var Deploy ='出兵';
	var CenterMap11 = '中央に表示(11×11)';
//	var CenterMap15 = '中央に表示(15×15)';
	var CenterMap21 = '中央に表示(21×21)';
	var CenterMap51 = '中央に表示(51×51)';
	var CenterMapS21 = 'スクロール(21×21)';
	var CenterMapS51 = 'スクロール(51×51)';
	var ConvertToVillage = 'この領地を拠点にする';
	var ConvertToFort = 'この領地を砦にする';
//	var LvUpTerritory = 'この領地をレベルアップ';
	var DiscardTerritory = 'この領地を破棄する';
	var LvUp = 'レベルアップ';
	var LvUpx2 = 'レベルアップx2';
	var Building = '建築 >>';
	var DeleteBuilding = '削除';
	var CancelDelete = '削除中止';
//	var CityField = '都市画面';
//	var MapField = '地図画面';
//	var GovernorField = '内政画面';

	var removeTxt = "%E5%BB%BA%E7%89%A9%E3%82%92%E5%A3%8A%E3%81%99";
	var cancelTxt = "%A5%AD%A5%E3%A5%F3%A5%BB%A5%EB%A4%B9%A4%EB";

	var $ = function (id,pd) {return pd ? pd.getElementById(id) : document.getElementById(id);};
	/**
	 * $x
	 * @description 以前の$a xpathを評価し結果を配列で返す
	 * @param {String} xp
	 * @param {HTMLElement|HTMLDocument} dc
	 * @returns {Array}
	 * @throws
	 * @function
	 */
	var $x = function (xp, dc) {function c (f) {var g = '';if (typeof f == 'string') {g = f;}var h = function (a) {var b = document.implementation.createHTMLDocument('');var c = b.createRange();c.selectNodeContents(b.documentElement);c.deleteContents();b.documentElement.appendChild(c.createContextualFragment(a));return b;};if (0 <= navigator.userAgent.toLowerCase().indexOf('firefox')) {h = function (a) {var b = document.implementation.createDocumentType('html', '-//W3C//DTD HTML 4.01//EN', 'http://www.w3.org/TR/html4/strict.dtd');var c = document.implementation.createDocument(null, 'html', b);var d = document.createRange();d.selectNodeContents(document.documentElement);var e = c.adoptNode(d.createContextualFragment(a));c.documentElement.appendChild(e);return c;};}return h(g);}var m = [], r = null, n = null;var o = dc || document.documentElement;var p = o.ownerDocument;if (typeof dc == 'object' && typeof dc.nodeType == 'number') {if (dc.nodeType == 1 && dc.nodeName.toUpperCase() == 'HTML') {o = c(dc.innerHTML);p = o;}else if (dc.nodeType == 9) {o = dc.documentElement;p = dc;}}else if (typeof dc == 'string') {o = c(dc);p = o;}try {r = p.evaluate(xp, o, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);for ( var i = 0, l = r.snapshotLength; i < l; i++)m.push(r.snapshotItem(i));}catch (e) {try {var q = p.evaluate(xp, o, null, XPathResult.ANY_TYPE, null);switch (q.resultType) {case XPathResult.NUMBER_TYPE:m.push(Number(q.numberValue));break;case XPathResult.STRING_TYPE:m.push(String(q.stringValue));break;case XPathResult.BOOLEAN_TYPE:m.push(Boolean(q.booleanValue));break;case XPathResult.UNORDERED_NODE_ITERATOR_TYPE:while (n = q.iterateNext()) {m.push(n);}break;}}catch (e) {throw new Error(e.message);}}return m;};
	
	/**
	 * $s
	 * @description 以前の$x xpathを評価し1つの結果を返す
	 * @param {String} xp
	 * @param {HTMLElement|HTMLDocument} dc
	 * @returns {Node}
	 * @throws
	 * @see $x
	 * @function
	 */
	var $s = function(xp, dc) { return $x(xp,dc).shift();};
	
	/**
	 * $e
	 * @param {HTMLElement|HTMLDocument|Window} doc
	 * @param {String|Object} event string or event.click=f or event.click=[f,f,f]
	 * @param {Function} event handler
	 * @param {Boolean} [useCapture=false]
	 * @function
	 */
	var $e = function(doc, event, func, useCapture) {var eventList = event;var eType = null;var capture = useCapture || false;if (typeof event == 'string') {eventList = {};eventList[event] = [func];} else {for (eType in eventList) {if (typeof eventList[eType] == 'object'&& eventList[eType] instanceof Array) {continue;}eventList[eType] = [ event[eType] ];}}for (eType in eventList) {var eventName = eType;for ( var i = 0; i < eventList[eType].length; i++) {doc.addEventListener(eventName, eventList[eType][i], capture);}}};
	
	//初期設定
	var menuWarp = createElement('div');
	var mainMenu = createElement('div', {
		'attribute' : {'class' : 'rMenu'},
		'css' : {
			'padding': '3px',
			'opacity': 0.8,
			'font-size': 'small',
			'color': '#333333',
			'background-color': '#000000',
			'border': '1px solid #7777FF',
			'position': 'absolute',
			'z-index': 1000000,
			'cursor': 'pointer',
			'display': 'none',
			'min-width': '75px'
		},
		'innerText' : 'none'
	});
	mainMenu.id = "rClickmainMenu";

	var subMenu = mainMenu.cloneNode(false);
	subMenu.setAttribute('ready','false');
	subMenu.innerHTML = '<ul><li>testdayo</li></ul>';

	document.body.appendChild(menuWarp);
	menuWarp.appendChild(mainMenu);
	menuWarp.appendChild(subMenu);

	$e(mainMenu, {
		'mouseover' : function(e){
			mainMenu.style.display = 'block';
		},
		'mouseout' : function(e){
			mainMenu.style.display = 'none';
		}
	});
	
	$e(subMenu, {
		'mouseover' : function(e){
			mainMenu.style.display = 'block';
			subMenu.style.display = 'block';
		},
		'mouseout' : function(e){
			mainMenu.style.display = 'none';
			subMenu.style.display = 'none';
		}
	});
	subMenu.innerHTML = '<ul><li>testdayo</li></ul>';

	var nowTime = +new Date();
	var userNameKey = NAMESPACE+'/'+location.hostname+'/UserName';
	var userName = GM_getValue(userNameKey,null);
	var preCheckTimeKey = NAMESPACE+'/'+location.hostname+'/UserName_PreCheckTime';
	var preCheckTime = GM_getValue(preCheckTimeKey,nowTime);

	if (userName === null || (preCheckTime + 24*60*60*1000) <= nowTime) {
		var getUserName = function(){
			GM_xmlhttpRequest({
				url:location.protocol + '//' + location.host+'/user/'+location.search,
				method : 'GET',
				onload : function(res){
					var dom = document.createElement('html');
					dom.innerHTML = res.responseText;
					var ret = $x('//table[contains(concat(" ",normalize-space(@class)," "), " commonTables ")]//tr[2]/td[2]',dom);
					ret.forEach(function(self){
						userName = self.innerHTML;
						GM_setValue(userNameKey,userName);
						GM_setValue(preCheckTimeKey,+new Date());
					});
					if (userName === null || userName.length === 0) {
						setTimeout(getUserName,100);
					}
				}
			});
		};
		setTimeout(getUserName,0);
	}

	// 右クリック時の動作
	function rightClickMenu(){
		this.init.apply(this,arguments);
	}

	rightClickMenu.prototype = {
		init:function(){
			this.ruleList = new Array();
			this.ruleList.length = 0;
			this.menu = new Array();
			this.menu.length = 0;
		},
		addMenu:function(menuName){
			this.menu[menuName] = eval(menuName);
		},
		addRule:function(){
			this.ruleList[this.ruleList.length] = {
				type:arguments[0],
				value:arguments[1],
				menu:arguments[2]
			};
		},
		setListener:function(){
			var callee = this;
	
			var mFunc = function(event){
				var resultMenu = callee.evaluate.apply(callee,arguments);
				if(resultMenu != false && event.button == '2'){
					if (typeof resultMenu.ready == 'function') {
						resultMenu.ready(event);
					}
	
					var addWarp = document.createElement('UL');
					for(var n=0;n < resultMenu.items.length;n++){
						var addDoc = null;
						var item = resultMenu.items[n];
						var name = callee.getValue(item,'name',arguments);
						if (!name) {
							continue;;
						}
						switch(item.type){
							case 'link':
								var match = null;
								var href = callee.getValue(item,'href',arguments);
								addDoc = document.createElement('A');
								if (0 < href.length) {
									if (href.lastIndexOf('&') == (href.length - 1)) {
										href = href.slice(0,-1);
									}
									if ((match = event.target.href.match(/[\?|&](([x|y]|SSID)=[\w,-]+)/ig)) != null) {
										if (href.lastIndexOf('?') != (href.length - 1)) {
											href += '&';
										}
										href += match.join('').replace('?','');
									}
									if (name==LvUp || name==LvUpx2 ){
										var cok = document.cookie;
										var ssid = cok.match(/(SSID=)[0-9a-zA-Z]+/)[0].replace(/(SSID=)/,'');
										href += '&ssid='+ssid+'#ptop'; //+'&village_id='+vlid;
									}
									if (name==DeleteBuilding) {
										href = "javascript:void(0);";
										$e(addDoc,'click',function() {
											var cok = document.cookie;
											var ssid = cok.match(/(SSID=)[0-9a-zA-Z]+/)[0].replace(/(SSID=)/,'');
											var c={};
											var j$ = jQuery;
											c['x'] = event.target.href.match(/x=(\d+)/)[1];
											c['y'] = event.target.href.match(/y=(\d+)/)[1];
											c['ssid']=ssid;
											c['remove']=removeTxt;
											var rst = j$.post("http://"+location.hostname+"/facility/facility.php?x=" + c['x'] + "&y=" + c['y'] + "#ptop",c,function(){setTimeout(location.href="http://"+location.hostname+"/village.php",500)});
										});
									}
									if (name==CancelDelete) {
										href = "javascript:void(0);";
										$e(addDoc,'click',function() {
											var cok = document.cookie;
											var ssid = cok.match(/(SSID=)[0-9a-zA-Z]+/)[0].replace(/(SSID=)/,'');
											var c={};
											var j$ = jQuery;
											c['x'] = event.target.href.match(/x=(\d+)/)[1];
											c['y'] = event.target.href.match(/y=(\d+)/)[1];
											c['ssid']=ssid;
											c['remove_cancel']=cancelTxt;
											j$.post("http://"+location.hostname+"/facility/facility.php?x=" + c['x'] + "&y=" + c['y'] + "#ptop",c,function(){setTimeout(location.href="http://"+location.hostname+"/village.php",500)});
										});
									}
									$e(addDoc,'click',function() {
										subMenu.style.display = 'none';
										mainMenu.style.display = 'none';
									});
								}
								else {
									href = 'javascript:void(0);';
								}
	
								addDoc.href = href;
								addDoc.appendChild(document.createTextNode(name));
								break;
							case 'text':
								addDoc = document.createElement('SPAN');
								addDoc.innerHTML = name;
								break;
						}
	
						if (typeof item.events == 'object') {
							$e(addDoc,item.events);
						}
	
						var li = document.createElement('LI');
						li.appendChild(addDoc);
						addWarp.appendChild(li);
	
					}
	
					mainMenu.replaceChild(addWarp,mainMenu.firstChild);
	
					mainMenu.style.display = 'block';
					mainMenu.style.top = event.pageY - 5 + 'px';
					mainMenu.style.left = event.pageX - 5  + 'px';
	
					var warpWidth = parseFloat(document.defaultView.getComputedStyle(addWarp, '').width);
					var bodyWidth = parseFloat(document.defaultView.getComputedStyle(mainMenu.parentNode, '').width);
	
					if (bodyWidth < (event.pageX + warpWidth + 10)) {
						mainMenu.style.left = (bodyWidth - warpWidth - 15) + 'px';
					}
	
				} else {
					mainMenu.style.display = 'none';
				}
	
				event.preventDefault();
				return false;
			};

			[
				'(id("mapOverlayMap") | id("map51-content")//div)/*[contains("aAareaAREA",name(.))][@href]',
				'//div[contains(concat(" ",normalize-space(@class)," "), " sideBoxInner ") and contains(concat(" ",normalize-space(@class)," "), " basename ")]//li/a' //,
				//'id("lodgment")/div[contains(concat(" ",normalize-space(@class)," "), " floatInner ")]//li/a[not(contains(concat(" ",normalize-space(@class)," "), " map-basing "))]'
			].forEach(function(xpath){
				$x(xpath).forEach(function(self){
					$e(self,'contextmenu',mFunc);
				 });
			});
		},
		evaluate : function (event) {
			for (var n=0;n<this.ruleList.length;n++) {
				if (this.ruleList[n].type != 'cond') {
					if (event.target[this.ruleList[n].type] == this.ruleList[n].value) {
						return this.menu[this.ruleList[n].menu];
					}
				} else {
				 if(this.ruleList[n].value(event)){
						return this.menu[this.ruleList[n].menu];
					}
				}
			}
			return false;
		},
		getValue : function(item,prop,orgArguments) {
			switch (typeof item[prop]) {
				case 'function':
					return item[prop].apply(item,orgArguments);
				case 'string':
					return item[prop];
			}
			return '';
		}
	};
	// ***************************メニューオブジェクト*********************
	
	var mapMenu = {
		items:[
		{
			name:function(e){
				var name = '<b>';
				if (e.target.nodeName.toUpperCase() == 'A') {
					$x('@onmouseover',e.target).forEach(function(mouseover){
						var doc = mouseover.value.replace(/^[^']+'|'[^']+$/g,'');
						name += $s('//dt[contains(concat(" ",normalize-space(@class)," "), " bigmap-caption ")]/text()',doc).data;
					});
				}
				else {
					name += e.target.alt;
				}
				return name + '</b>';
			},
			type:'text'
		},
		{
			name: Info,
			type:'link',
			href:'land.php?'
		},
		{
			name: Deploy,
			type:'link',
			href:'facility/castle_send_troop.php?'
		},
//		{
//		name: CenterMap11,
//		type:'link',
//			href:'map.php?type=1'
//		},
//		{
//			name: CenterMap15,
//			type:'link',
//			href:'map.php?type=2'
//		},
		{
			name: CenterMap21,
			type:'link',
			href:'map.php?type=5'
		},
		{
			name: CenterMap51,
			type:'link',
			href:'map.php?type=4'
		},
//		{
//			name: CenterMapS21,
//			type:'link',
//			href:'big_map.php?type=6&ssize=21'
//		},
		{
			name: CenterMapS51,
			type:'link',
			href:'big_map.php?type=6&ssize=51'
		},
		{
			name: ConvertToVillage,
			type:'link',
			href:'facility/select_type.php?'
		},
//		{
//			name: function(e){
//				return mapMenu.canCreateFacility(e) ? ConvertToFort : null;
//			},
//			type:'link',
//			href:'facility/select_type.php?mode=build&type=222'
//		},
//		{
//			name: LvUpTerritory,
//			type:'link',
//			href:'territory_proc.php?mode=lvup'
//		},
		{
			name: DiscardTerritory,
			type:'link',
			href:'territory_proc.php?mode=remove'
		}
		],
		canCreateFacility : (function () {
			var oldEvent = null,
				status = false,
				_canCreateFacility = (function () {
									var facilityCount = $x('count(id("lodgment")/div[contains(concat(" ",normalize-space(@class)," "), " floatInner ")]//li)')[0];
									//var maxFame = +$x('id("status_left")//img[contains(@src,"ico_fame")]/following-sibling::text()[1]')[0].nodeValue.match(/\d+\s*\/\s*(\d+)/)[1];
									var maxFame = +$x('id("status")//img[contains(@src,"ico_fame")]/following-sibling::text()[1]')[0].nodeValue.match(/\d+\s*\/\s*(\d+)/)[1];
									var canCreate = false;
									[0,17, 35, 54, 80, 112, 150, 195, 248, 310].forEach(function (fame,index) {
										if (fame <= maxFame && facilityCount <= index) {
											canCreate = true;
										}
									});
									return canCreate;
								})();
			return function (e) {
				if (e === oldEvent) {
					return status;
				}
				oldEvent = e,status = false;
				if (mapMenu.isMyTerritory(e) === true && _canCreateFacility === true) {
					status = true;
				}
				return status;
			};
		})(),
		isMyTerritory : (function () {
			var oldEvent = null,status = false;
			return function (e) {
				if (e === oldEvent) {
					return status;
				}
				oldEvent = e,status = false;
				if (e.target.nodeName.toUpperCase() == 'A') {
					$x('@onmouseover',e.target).forEach(function(mouseover){
						var doc = mouseover.value.replace(/^[^']+'|'[^']+$/g,'');
						var text = $s('//dt[contains(text(),"'+ LordName +'")]/following-sibling::dd[1]/text()',doc);
						if (text && text.data == userName) {
							status = true;
						}
					});
				}
				else {
					status = new RegExp("'[^']+'[^']+'"+userName+"'",'i').test(e.target.getAttribute('onmouseover'));
				}
				return status;
			};
		})()
	};

	var villageMenu = {
		items:[
		{
			name:function(event){
				return '<b>' + event.target.alt + '</b>';
				//return '<b>' + _sl(event.target.alt) + '</b>';
			},
			type:'text'
		},
		{
			name: Info,
			type:'link',
			href:'facility/select_facility.php?'
		},
		{
			name:function(event){
				if (event.target.alt == Flatland) {
					return null;
				}
				if(villageMenu.canBuildCount(event)<=1) { return LvUp } else {return null;};
			},
			type:'link',
			href:'facility/build.php?'
		},
		{
			name:function(event){
				if (event.target.alt == Flatland) {
					return null;
				}
				if(villageMenu.canBuildCount(event)==0) { return LvUpx2; } else {return null;};
			},
			type:'link',
			href:'facility/build.php?',
			events : {
				click : function (event) {
					subMenu.style.display = 'none';
					mainMenu.style.display = 'none';
					GM_xmlhttpRequest({url:event.target.href, method : 'GET'});
					GM_xmlhttpRequest({
						url:event.target.href,
						method : 'GET',
						onload:function(res){
							location.reload();
						}
					});
					event.preventDefault();
					return false;
				}
			}
		},
		{
			name:function(event){
				if (event.target.alt==Flatland || event.target.alt.match(/城|村|砦/)) {
					return null;
				}
				if(villageMenu.canDeleteCount(event)==0) { return DeleteBuilding } else {return null;};
			},
			type:'link',
			href:'facility/facility.php?remove=' + removeTxt
		},
		{
			name:function(event){
				if (event.target.alt==Flatland || event.target.alt.match(/城|村|砦/)) {
					return null;
				}
				if(villageMenu.canDeleteCount(event)>=1) {
					var _x = event.target.href.match(/x=(\d+)/)[1];
					var _y = event.target.href.match(/y=(\d+)/)[1];
					var _n = parseInt(parseInt(_y)+1+parseInt(_x)*7);
					if (_n <=9) {_n = "0"+_n;};
					var _m = "map"+_n;
					var maps = document.getElementsByClassName(_m);
					if (maps[0].src.match(/_deleting.png/)) {
						return CancelDelete;
					} else {return null;};
				}
			},
			type:'link',
			href:'facility/facility.php?remove_cancel=' + cancelTxt
		},
		{
			name:function(event){
				if (event.target.alt == Flatland) {
					return Building;
				}
				return '';
			},
			type:'link',
			href:'',
			events : {
				mouseover : function(event) {
					var enabled = function() {
						if (subMenu.getAttribute('ready') == 'false') {
							setTimeout(enabled,200);
							return;
						};
						var left = parseFloat(mainMenu.style.left) + ((mainMenu.clientWidth < 75) ? 75 : mainMenu.clientWidth) - 15;
						subMenu.style.display = 'block';
						subMenu.style.top = event.pageY + 'px';
						subMenu.style.left = left + 'px';
					};
					enabled();
				},
				mouseout: function(e) {
					subMenu.style.display = 'none';
				},
				click : function (e) {
					e.preventDefault();
					return false;
				}
			}
		}
		],
		canBuildCount : (function () {
			var oldEvent = null,cnt = 0;
			return function (event) {
				if (event === oldEvent) {
					return cnt;
				}
				oldEvent = event, cnt = 0;
				var bs = document.getElementsByClassName("buildStatus");
				for (i=0;i<bs.length;i++) {
					if (bs[i].innerHTML.match(/建設中|建設準備中/)) {cnt++;};
				}
				var lv = event.target.alt.match(/LV.(\d+)/)[1];
				var maxlv = 10;
				if (event.target.alt.match(/倉庫|見張り台|大宿舎|遠征訓練所|城/)) {
					maxlv = 20;
				}else if (event.target.alt.match(/兵舎|弓兵舎|厩舎|兵器工房|宿舎|伐採所|石切り場|製鉄所|畑|村|砦/)) {
					maxlv = 15;
				}else if (event.target.alt.match(/研究所|練兵所|訓練所|市場|銅雀台|鍛冶場|防具工場|水車|工場/)) {
				}
				if (lv==maxlv) {cnt=9};
				if ((maxlv-lv)==1 && cnt==0) {cnt=1};
				return cnt;
			};
		})(),
		canDeleteCount : (function () {
			var oldEvent = null,cnt = 0;
			return function (event) {
				if (event === oldEvent) {
					return cnt;
				}
				oldEvent = event, cnt = 0;
				var bs = document.getElementsByClassName("buildStatus");
				for (i=0;i<bs.length;i++) {
					if (bs[i].parentNode.innerHTML.match(/削除中/)) {cnt++;};
				}
				return cnt;
			};
		})(),
		ready : function(event) {
			var baseUrl = location.protocol + '//'+location.hostname+'/';
			subMenu.setAttribute('ready','false');
			GM_xmlhttpRequest({
				url:event.target.href,
				method : 'GET',
				onload:function(respons){
					subMenu.innerHTML = '';
					var addWarp = document.createElement('UL');
					subMenu.appendChild(addWarp);
					var dom = document.createElement('html');
					dom.innerHTML = respons.responseText;
					$x('//table[@summary="object"]',dom).forEach(function(self){
						var addDocWarp = document.createElement('LI');
						var addDoc = document.createElement('A');
						var fid ;
						var cok = document.cookie;
						var ssid = cok.match(/(SSID=)[0-9a-zA-Z]+/)[0].replace(/(SSID=)/,'');
						$x('.//th[contains(concat(" ",normalize-space(@class)," "), " mainTtl ")]',self).forEach(function(th){
							addDoc.innerHTML = th.innerHTML;
 //						   addDoc.innerHTML = _sl(th.innerHTML);
						});
						$x('.//td[@class="imgs"]//img',self).forEach(function(img){
							fid = img.src.match(/facility_(\d+).png/);
							if (fid!=null) {fid = fid[1];} else {fid ='';};
						});
						$x('.//div[contains(concat(" ",normalize-space(@class)," "), " lvupFacility ")]/p[contains(concat(" ",normalize-space(@class)," "), " main ")]/a',self).forEach(function(a){
							//addDoc.href = baseUrl + 'facility/' + (a.getAttribute('href').replace(baseUrl,''));
							addDoc.href = "http://"+location.hostname+"/facility/build.php"+event.target.href.match(/\?x=\d+&y=\d+/)[0]+"&ssid="+ssid+"&id="+fid;
						});
						$e(addDoc,'click',function(e){subMenu.style.display = 'none';mainMenu.style.display = 'none';});
						addDocWarp.appendChild(addDoc);
						addWarp.appendChild(addDocWarp);
					});
					subMenu.setAttribute('ready','true');
				}
			});
		}
	};
/*
	var sidebarVillageMenu = {
		items:[
		{
			name:function(event){
				return '<b>' + event.target.title + '</b>';
			},
			type:'text'
		},
		{
			name: CityField,
			type:'link',
			href:function(event){
				var res = null;
				var query = '';
				if((res = event.target.href.match(/village_id=([^&]*)/i)) != null){
					query = res[1];
				}
				return '/village_change.php?page=%2Fvillage.php&village_id=' + query;
			}
		},
		{
			name: MapField,
			type:'link',
			href:function(event){
				var res = null;
				var query = '';
				if((res = event.target.href.match(/village_id=([^&]*)/i)) != null){
					query = res[1];
				}
				return '/village_change.php?page=%2Fmap.php&village_id=' + query;
			}
		},
		{
			name: GovernorField,
			type:'link',
			href:function(event){
				var res = null;
				var query = '';
				if((res = event.target.href.match(/village_id=([^&]*)/i)) != null){
					query = res[1];
				}
				return '/village_change.php?page=%2Fcard%2Fdomestic_setting.php&village_id=' + query;
			}
		}
		]
	};
*/
	// ***************************メニューオブジェクトここまで***************

	// **************************全体*************************
	var rMenu = new rightClickMenu();
	rMenu.setListener();

//	rMenu.addMenu('sidebarVillageMenu');
//	rMenu.addRule('cond',function(event){
//		if (!(event.target.href===undefined)){
//			if(event.target.href != 'undefined' && event.target.href.match(/village_change.php/i)){
//				return true;
//			}
//		}
//	},'sidebarVillageMenu');

	// **************************地図画面*************************
	if(document.URL.match(/(?:big_)?map\.php/i)){
		rMenu.addMenu('mapMenu');
		rMenu.addRule('tagName','AREA','mapMenu');
		rMenu.addRule('tagName','A','mapMenu');
	}
	
	// **************************都市画面*************************
	if(document.URL.match(/village.php/i)){
		rMenu.addMenu('villageMenu');
		rMenu.addRule('tagName','AREA','villageMenu');
	}
	
	GM_addStyle([
					'.rMenu li b{ color:#FFAAAA;list-style :none outside none;white-space: nowrap;}',
					'.rMenu li{ color:#FFFFFF;list-style :none outside none;white-space: nowrap;}',
					'.rMenu a:link{text-decoration:none;padding-right:2px;padding-left:1px}',
					'.rMenu a:visited {text-decoration:none;padding-right:2px;padding-left:1px}',
					'.rMenu a:hover {background-color:#DDDDDD;color:#333333;text-decoration:none;}',
					'.rMenu a:active {background-color:#DDDDDD;color:#333333;text-decoration:none;}',
					'.rMenu a {display: block;width: 98%;margin-right: 1px;}',
					'#headerArea{ display:none; }',
					].join('\n')
				);

	/**
	*
	* @param {String} text
	* @returns {Element}
	*/
	function createText(text) {
	   return document.createTextNode(text);
	}
	
	/**
	* Function createElement
	*
	* @param {String} elementName
	* @param {Object} [option]
	* @param {HTMLDocument} [doc]
	* @returns {Element}
	*/
	function createElement(elementName, option, doc) {
	   var pageDocument = doc ? doc : document;
	   var retElement = elementName == 'img' ? new Image() : pageDocument
			   .createElement(elementName);
	
	   if (typeof option == 'object') {
		   if (typeof option.attribute == 'object') {
			   for ( var attrName in option.attribute) {
				   retElement.setAttribute(attrName, option.attribute[attrName]);
			   }
		   }
		   if (typeof option.events == 'object') {
			   $e(retElement, option.events);
		   }
		   if (typeof option.innerText == 'string') {
			   retElement.appendChild(pageDocument.createTextNode(option.innerText));
		   }
		   if (typeof option.css == 'object') {
			   var cssString = '';
			   for ( var cssProp in option.css) {
				   retElement.style.setProperty(cssProp, option.css[cssProp], '');
			   }
		   } else if (option.css == 'string') {
			   retElement.style.cssText = option.css;
		   }
	   }
	   return retElement;
	}


	/**
	 * initGMFunctions
	 * @description GM関数初期化
	 */
	function initGMFunctions() {
		var hasGM = (function () {
			var result = {},
				notSupportReg = /not\s*support/i,
				existsAPI = function (func) {
					return typeof func === 'function' && (Object.prototype.hasOwnProperty.call(func, 'prototype') === false || notSupportReg.test(String(func)) === false);
				};
			
			[
					'GM_getValue', 'GM_setValue', 'GM_listValues', 'GM_deleteValue',
					'GM_addStyle', 'GM_log', 'GM_xmlhttpRequest', 'GM_openInTab', 'GM_getResourceURL',
					'GM_getResourceText', 'GM_registerMenuCommand'
			].forEach(function (methodName) {
				var resName = methodName.substr(3),that = Function('return this')();
				result[resName] = false;
				// window != Greasemonkey window
				if (Object.prototype.hasOwnProperty.call(that, methodName) && existsAPI(that[methodName])) {
					result[resName] = true;
				}
			});
			return result;
		})();
	
		/**
		 * GM_addStyle
		 * @param {String} css css text
		 * @function
		 */
		if (hasGM.addStyle === false) {
			GM_addStyle = function(css) {
				var style = document.evaluate('//head/style[not(@src) and last()]', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
				style = style && style.singleNodeValue || document.createElement('style');
				style.type = 'text/css';
				style.appendChild(document.createTextNode(css));
				if (!(style.parentNode || style.parentElement)) {
					document.getElementsByTagName('head')[0].appendChild(style);
				}
			};
		}
		
		/**
		 * GM_setValue
		 * @param {String} name storage key
		 * @param {String|Number|Boolean} value storage saved object
		 * @throws {TypeError}
		 * @see localStorage
		 * @function
		 */
		if (hasGM.setValue === false) {
			GM_setValue = function(name, value) {
				switch (typeof value) {
					case 'string':
					case 'number':
					case 'boolean':
						break;
					default:
						throw new TypeError();
				}
	
				value = (typeof value)[0] + value;
				localStorage.setItem(name, value);
			};
		}
	
		/**
		 * GM_getValue
		 * @param {String} key storage key
		 * @param {Object} [defaultValue] any Object
		 * @returns {Object}
		 * @see localStorage
		 * @function
		 */
		if (hasGM.getValue === false) {
			GM_getValue = function(key, defaultValue) {
				var value = localStorage.getItem(key);
				if (!value) {
					return defaultValue;
				}
				var type = value[0];
				value = value.substring(1);
				switch (type) {
					case 'b':
						return value == 'true';
					case 'n':
						return Number(value);
					default:
						return value;
				}
			};
		}
	
		/**
		 * GM_deleteValue
		 * @param {String} key storage key
		 * @see localStorage
		 * @function
		 */
		if (hasGM.deleteValue === false) {
			GM_deleteValue = function(key) {
				localStorage.removeItem(key);
			};
		}
	
		/**
		 * GM_listValues
		 * @returns {Array}
		 * @see localStorage
		 * @function
		 */
		if (hasGM.listValues === false) {
			GM_listValues = function() {
				var len = localStorage.length;
				var res = [];
				var key = '';
				for ( var i = 0; i < len; i++) {
					key = localStorage.key(i);
					res[key] = key;
				}
				return res;
			};
		}
	
		/**
		 * GM_log
		 * @param {Object} message any Object
		 * @function
		 * @see console
		 */
		if (hasGM.log === false) {
			GM_log = function(message) {
				if (typeof console === 'object' && Object.prototype.hasOwnProperty.call(console, 'log')) {
					console.log(message);
				}
				else if (typeof opera == 'object' && Object.prototype.hasOwnProperty.call(opera, 'postError')) {
					opera.postError(message);
				}
				else {
					window.alert(message);
				}
			};
		}
	
		/**
		 * function GM_registerMenuCommand
		 * @param {String} caption
		 * @param {Function} commandFunc
		 * @param {String} [accelKey]
		 * @param {String} [accelModifiers]
		 * @param {String} [accessKey]
		 * @function
		 */
		if (hasGM.registerMenuCommand === false) {
			GM_registerMenuCommand = function(caption, commandFunc, accelKey, accelModifiers, accessKey) {
				throw new Error('not supported');
			};
		}
	
		/**
		 * GM_openInTab
		 * @param {String} url uri strings
		 * @function
		 */
		if (hasGM.openInTab === false) {
			GM_openInTab = function(uri) {
				window.open(uri, '');
			};
		}
	
		/**
		 * GM_xmlhttpRequest
		 * @param requestParam Object request parameter settings
		 * @param requestParam.url request url string
		 * @param [requestParam.method="GET"] request method. default is GET
		 * @param [requestParam.data] request data
		 * @param [requestParam.headers] request headers object
		 * @param [requestParam.onload] request complite event handler
		 * @param [requestParam.onerror] request error event handler
		 * @param [requestParam.onreadystatechange] request readystatechange event handler
		 * @returns {XMLHttpRequest}
		 */
		if (hasGM.xmlhttpRequest === false) {
			GM_xmlhttpRequest = function(requestParam) {
				var xhr;
				if (typeof XMLHttpRequest == 'function') {
					xhr = XMLHttpRequest;
				}
				else {
					return null;
				}
				var req = new xhr();
				[
						'onload', 'onerror', 'onreadystatechange'
				].forEach(function(event) {
					if ((event in requestParam) == false) {
						return;
					}
					req[event] = function() {
						var isComplete = (req.readyState == 4);
						var responseState = {
							responseText : req.responseText,
							readyState : req.readyState,
							responseHeaders : isComplete ? req.getAllResponseHeaders() : '',
							status : isComplete ? req.status : 0,
							statusText : isComplete ? req.statusText : '',
							finalUrl : isComplete ? requestParam.url : ''
						};
						requestParam[event](responseState);
					};
				});
		
				try {
					req.open(requestParam.method ? requestParam.method : 'GET', requestParam.url, true);
				}
				catch (e) {
					if (requestParam.onerror) {
						requestParam.onerror({
							readyState : 4,
							responseHeaders : '',
							responseText : '',
							status : 403,
							statusText : 'Forbidden',
							finalUrl : ''
						});
					}
					return null;
				}
		
				if ('headers' in requestParam && typeof requestParam.headers == 'object') {
					for ( var name in requestParam.headers) {
						req.setRequestHeader(name, requestParam.headers[name]);
					}
				}
		
				req.send(('data' in requestParam) ? requestParam.data : null);
				return req;
			};
		}
	
	}
	
	/**
	 * initJSON
	 * @description JSONがない場合とprototype.jsとJSONオブジェクトの衝突回避用(forOpera)
	 * @returns {Object}
	 */
	function initJSON() {
		var myJSON = function() {
			if (typeof JSON !== 'object' || typeof Prototype === 'object') {
				this.__proto__ = (function() {
					// parser and stringify from json.js https://github.com/douglascrockford/JSON-js
					
					var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
						escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
						gap,
						indent,
						meta = {
							'\b' : '\\b',
							'\t' : '\\t',
							'\n' : '\\n',
							'\f' : '\\f',
							'\r' : '\\r',
							'"' : '\\"',
							'\\' : '\\\\'
						},
						rep,result = {};
	
					function quote(string) {
						escapable.lastIndex = 0;
						return escapable.test(string) ? '"' + string.replace(escapable, function(a) {
							var c = meta[a];
							return typeof c === 'string' ? c : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
						}) + '"' : '"' + string + '"';
					}
					
					function str(key, holder) {
						var i, k, v, length, mind = gap, partial, value = holder[key];
						if (value && typeof value === 'object' && typeof value.toJSON === 'function') {
							value = value.toJSON(key);
						}
						if (typeof rep === 'function') {
							value = rep.call(holder, key, value);
						}
						switch (typeof value) {
							case 'string':
								return quote(value);
							case 'number':
								return isFinite(value) ? String(value) : 'null';
							case 'boolean':
							case 'null':
								return String(value);
							case 'object':
								if (!value) {
									return 'null';
								}
								gap += indent;
								partial = [];
								if (Object.prototype.toString.apply(value) === '[object Array]') {
									length = value.length;
									for (i = 0; i < length; i += 1) {
										partial[i] = str(i, value) || 'null';
									}
									v = partial.length === 0 ? '[]' : gap ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']' : '[' + partial.join(',') + ']';
									gap = mind;
									return v;
								}
								if (rep && typeof rep === 'object') {
									length = rep.length;
									for (i = 0; i < length; i += 1) {
										if (typeof rep[i] === 'string') {
											k = rep[i];
											v = str(k, value);
											if (v) {
												partial.push(quote(k) + (gap ? ': ' : ':') + v);
											}
										}
									}
								}
								else {
									for (k in value) {
										if (Object.prototype.hasOwnProperty.call(value, k)) {
											v = str(k, value);
											if (v) {
												partial.push(quote(k) + (gap ? ': ' : ':') + v);
											}
										}
									}
								}
								v = partial.length === 0 ? '{}' : gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}' : '{' + partial.join(',') + '}';
								gap = mind;
								return v;
						}
					}
					result.stringify = function(value, replacer, space) {
						var i;
						gap = '';
						indent = '';
						if (typeof space === 'number') {
							for (i = 0; i < space; i += 1) {
								indent += ' ';
							}
						}
						else if (typeof space === 'string') {
							indent = space;
						}
						rep = replacer;
						if (replacer && typeof replacer !== 'function' && (typeof replacer !== 'object' || typeof replacer.length !== 'number')) {
							throw new Error('JSON.stringify');
						}
						return str('', { '' : value });
					};
					
					result.parse = (function() {
						var at, ch, escapee = {
								'"' : '"',
								'\\' : '\\',
								'/' : '/',
								b : 'b',
								f : '\f',
								n : '\n',
								r : '\r',
								t : '\t'
							}, text, error = function(m) {
								throw {
									name : 'SyntaxError',
									message : m,
									at : at,
									text : text
								};
							}, next = function(c) {
								if (c && c !== ch) {
									error("Expected '" + c + "' instead of '" + ch + "'");
								}
								ch = text.charAt(at);
								at += 1;
								return ch;
							}, number = function() {
								var num, str = '';
								if (ch === '-') {
									str = '-';
									next('-');
								}
								while (ch >= '0' && ch <= '9') {
									str += ch;
									next();
								}
								if (ch === '.') {
									str += '.';
									while (next() && ch >= '0' && ch <= '9') {
										str += ch;
									}
								}
								if (ch === 'e' || ch === 'E') {
									str += ch;
									next();
									if (ch === '-' || ch === '+') {
										str += ch;
										next();
									}
									while (ch >= '0' && ch <= '9') {
										str += ch;
										next();
									}
								}
								num = +str;
								if (isNaN(num)) {
									error("Bad number");
								}
								else {
									return num;
								}
							}, string = function() {
								var hex, i, str = '', uffff;
								if (ch === '"') {
									while (next()) {
										if (ch === '"') {
											next();
											return str;
										}
										else if (ch === '\\') {
											next();
											if (ch === 'u') {
												uffff = 0;
												for (i = 0; i < 4; i += 1) {
													hex = parseInt(next(), 16);
													if (!isFinite(hex)) {
														break;
													}
													uffff = uffff * 16 + hex;
												}
												str += String.fromCharCode(uffff);
											}
											else if (typeof escapee[ch] === 'string') {
												str += escapee[ch];
											}
											else {
												break;
											}
										}
										else {
											str += ch;
										}
									}
								}
								error("Bad string");
							}, white = function() {
								while (ch && ch <= ' ') {
									next();
								}
							}, word = function() {
								switch (ch) {
									case 't':
										next('t');
										next('r');
										next('u');
										next('e');
										return true;
									case 'f':
										next('f');
										next('a');
										next('l');
										next('s');
										next('e');
										return false;
									case 'n':
										next('n');
										next('u');
										next('l');
										next('l');
										return null;
								}
								error("Unexpected '" + ch + "'");
							}, value, array = function() {
								var ary = [];
								if (ch === '[') {
									next('[');
									white();
									if (ch === ']') {
										next(']');
										return ary;
									}
									while (ch) {
										ary.push(value());
										white();
										if (ch === ']') {
											next(']');
											return ary;
										}
										next(',');
										white();
									}
								}
								error("Bad array");
							}, object = function() {
								var key, obj = {};
								if (ch === '{') {
									next('{');
									white();
									if (ch === '}') {
										next('}');
										return obj;
									}
									while (ch) {
										key = string();
										white();
										next(':');
										obj[key] = value();
										white();
										if (ch === '}') {
											next('}');
											return obj;
										}
										next(',');
										white();
									}
								}
								error("Bad object");
							};
							value = function() {
								white();
								switch (ch) {
									case '{':
										return object();
									case '[':
										return array();
									case '"':
										return string();
									case '-':
										return number();
									default:
										return ch >= '0' && ch <= '9' ? number() : word();
								}
							};
						return function(source, reviver) {
							var res;
							text = source;
							at = 0;
							ch = ' ';
							res = value();
							white();
							if (ch) {
								error("Syntax error");
							}
							
							return typeof reviver === 'function' ? function (holder, key) {
								var k, v, val = holder[key];
								if (val && typeof val === 'object') {
									for (k in val) {
										if (Object.hasOwnProperty.call(val, k)) {
											v = arguments.callee(val, k);
											if (v !== undefined) {
												val[k] = v;
											}
											else {
												delete val[k];
											}
										}
									}
								}
								return reviver.call(holder, key, val);
							}({ '' : res }, '') : res;
						};
					})();
					return result;
				})();
			}
		};
		if (typeof JSON == 'object') {
			myJSON.prototype = JSON;
		}
		return new myJSON();
	}
	
	/**
	 * initCrossBrowserSupport
	 * @returns {Object}
	 */
	function initCrossBrowserSupport() {
		var crossBrowserUtility = {'JSON':null};
		// 配列のindexOf対策 from MDC
		if (!Array.prototype.indexOf) {
			Array.prototype.indexOf = function(elt /*, from*/) {
				var len = this.length;
	
				var from = Number(arguments[1]) || 0;
				from = (from < 0) ? Math.ceil(from) : Math.floor(from);
				if (from < 0) {
					from += len;
				}
	
				for (; from < len; from++) {
					if (from in this && this[from] === elt) {
						return from;
					}
				}
	
				return -1;
			};
		}
		// ArrayのforEach対策 from MDC
		if (!Array.prototype.forEach) {
			Array.prototype.forEach = function(fun /*, thisp*/) {
				var len = this.length;
				if (typeof fun != 'function') {
					throw new TypeError();
				}
	
				var thisp = arguments[1];
				for (var i = 0; i < len; i++) {
					if (i in this) {
						fun.call(thisp, this[i], i, this);
					}
				}
			};
		}
	
		// JSONのサポート
		crossBrowserUtility.JSON = initJSON();
	
		// GM関数の初期化
		initGMFunctions();
	
		return crossBrowserUtility;
	}
})();