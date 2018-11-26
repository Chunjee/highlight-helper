// ==UserScript==
// @name				Ultimate Search Highlighter
// @namespace		http://my.opera.com/community/forums/findpost.pl?id=1648805
// @version			1.57
// @description	Highlights search terms on page, with summaries of results, and search engine integration.
// @download		http://files.myopera.com/Stoen/uhb/highlighter.js
// @include			*
// ==/UserScript==

if( !window.opera ) {
	window.opera = {
		isFF: true,
		version: function() { return 10.5; },
		postError: function() {},
		addEventListener: function(a,b,c) { window.addEventListener(a.slice(a.indexOf('.')+1),b,c); },
		removeEventListener: function(a,b,c) { window.removeEventListener(a.slice(a.indexOf('.')+1),b,c); }
	};
}
(opera.USH = new function() {
	var preferences = {
		runOnLoad: /*@runOnLoad: Run script on page load based on search engine referrer@bool@*/true/*@*/,
		runOnKeyPress:  /*@runOnKeyPress: Run script on any key press@bool@*/false/*@*/,
		autoHideDelay: /*@autoHideDelay: Time in ms after which the toolbar will hide if not in use. 0 to disable@int@*/0/*@*/,
		highlightOnLoad: /*@highlightOnLoad: Highlight page automatically or just show toolbar@bool@*/true/*@*/,
		toolbarHiddenOnLoad: /*@toolbarHiddenOnLoad: Toolbar is initially hidden@bool@*/false/*@*/,
		toolbarAtBottom: /*@toolbarAtBottom: Show the toolbar at the bottom of the screen@bool@*/false/*@*/,
		toolbarOverText: /*@toolbarOverText: Show the toolbar over text@bool@*/true/*@*/,
		useStopwords: /*@useStopwords: Highlight words ignored by search engines. Only used for search engine highlights@bool@*/false/*@*/,
		useCookies: /*@useCookies: Use cookies to store searches@bool@*/true/*@*/,
		useDOMStorage: /*@useDOMStorage: Use HTML5 localStorage instead of cookies to store searches@bool@*/true/*@*/,
		enableSearchHistory: /*@enableSearchHistory: Number of previous searches to save. 0 to disable@int@*/3/*@*/,
		hideColour: /*@hideColour: Hide coloured highlights for search terms@bool@*/false/*@*/,
		embedStyle: /*@embedStyle: Embed CSS via javascript. False if using external CSS@bool@*/true/*@*/,
		checkDocChanges: /*@checkDocChanges: Re-highlights when scripts dynamically change document content@bool@*/true/*@*/,
		inputDelay: /*@inputDelay: Time in ms after which text typed into the toolbar will be used for highlighting. 0 to disable@int@*/0/*@*/,
		keyShortcuts: [
			['run',				/*@runKey: Keyboard shortcut to run script@string@*/'/?'/*@*/,
										/*@_runKey+Optional modifier@bool@*/false/*@*/,
										/*@_runKey+Ctrl@bool@*/true/*@*/,
										/*@_runKey+Shift@bool@*/false/*@*/],
			['closeBttn',	/*@closeBttnKey: Keyboard shortcut for the 'Close' button@string@*/'\\|'/*@*/,
										/*@_closeBttnKey+Optional modifier@bool@*/true/*@*/,
										/*@_closeBttnKey+Ctrl@bool@*/false/*@*/,
										/*@_closeBttnKey+Shift@bool@*/false/*@*/],							
			['enable',		/*@enableKey: Keyboard shortcut toggle. Enables or disables the following shortcuts@string@*/'`~'/*@*/,
										/*@_enableKey+Optional modifier@bool@*/true/*@*/,
										/*@_enableKey+Ctrl@bool@*/false/*@*/,
										/*@_enableKey+Shift@bool@*/false/*@*/],
			['mOver',			/*@mOverKey: Keyboard shortcut to toggle toolbar visibility@string@*/'9('/*@*/,
										/*@_mOverKey+Optional modifier@bool@*/true/*@*/,
										/*@_mOverKey+Ctrl@bool@*/false/*@*/,
										/*@_mOverKey+Shift@bool@*/false/*@*/],
			['optsBttn',	/*@optsBttnKey: Keyboard shortcut for the 'Options' button@string@*/'0)'/*@*/,
										/*@_optsBttnKey+Optional modifier@bool@*/true/*@*/,
										/*@_optsBttnKey+Ctrl@bool@*/false/*@*/,
										/*@_optsBttnKey+Shift@bool@*/false/*@*/],
			['newBttn',		/*@newBttnKey: Keyboard shortcut for the 'New' button@string@*/'-_'/*@*/,
										/*@_newBttnKey+Optional modifier@bool@*/true/*@*/,
										/*@_newBttnKey+Ctrl@bool@*/false/*@*/,
										/*@_newBttnKey+Shift@bool@*/false/*@*/],
			['hideBttn',	/*@toggleBttnKey: Keyboard shortcut for the 'Toggle' button@string@*/'=+'/*@*/,
										/*@_toggleBttnKey+Optional modifier@bool@*/true/*@*/,
										/*@_toggleBttnKey+Ctrl@bool@*/false/*@*/,
										/*@_toggleBttnKey+Shift@bool@*/false/*@*/],
			//['closeBttn',	/*@closeBttnKey: Keyboard shortcut for the 'Close' button@string@*/'\\|'/*@*/,
			//							/*@_closeBttnKey+Optional modifier@bool@*/true/*@*/,
			//							/*@_closeBttnKey+Ctrl@bool@*/false/*@*/,
			//							/*@_closeBttnKey+Shift@bool@*/false/*@*/], 
			[0,	/*@term1Key: Keyboard shortcut for search term 1@string@*/'1!'/*@*/,true],
			[1,	/*@term2Key: Keyboard shortcut for search term 2@string@*/'2@'/*@*/,true],
			[2,	/*@term3Key: Keyboard shortcut for search term 3@string@*/'3#'/*@*/,true],
			[3,	/*@term4Key: Keyboard shortcut for search term 4@string@*/'4$'/*@*/,true],
			[4,	/*@term5Key: Keyboard shortcut for search term 5@string@*/'5%'/*@*/,true],
			[5,	/*@term6Key: Keyboard shortcut for search term 6@string@*/'6^'/*@*/,true],
			[6,	/*@term7Key: Keyboard shortcut for search term 7@string@*/'7&'/*@*/,true],
			[7,	/*@term8Key: Keyboard shortcut for search term 8@string@*/'8*'/*@*/,true]
		],
		usePunctuation: /*@usePunctuation: Allow matching of search terms regardless of punctuation@bool@*/false/*@*/,
		wholeWordsOnly: /*@wholeWordsOnly: Only highlight whole words@bool@*/false/*@*/,
		matchCase: /*@matchCase: Highlights are case sensitive@bool@*/false/*@*/,
		useRegExp: /*@useRegExp: Search using a Regular Expression@bool@*/false/*@*/
	},
	colours = ['#ffff66','#A0FFFF','#99ff99','#ff9999','#ff66ff','#FF7F50','#00BFFF','#FF00FF','#FFD700','#CD5C5C','#C0C0C0','#B0C4DE','#808000','#FFA500','#ADD8E6'],
	searchEngines = [null
		,[1,,,'#USH:(.+)$']
		,[2,'\\w+\\.+google\\.[^.]{2,3}(?:\\.[^.]{2})?/(?:(?:search)|(?:url))\\?.*',,'[&?]q=([^&]+)']
		,[2,'\\w+\\.bing\\.com',,'[&?]q=([^&]+)']
		,[2,'search\\.yahoo\\.com',,'[&?]p=([^&]+)']
		,[2,'\\w+\\.wikipedia\\.org/wiki/Special:Search',,'[&?]search=([^&]+)']
		,[2,'(?:www\\.)??ask\\.com',,'[&?]q=([^&]+)']
		,[2,'my\\.opera\\.com/community/forums/search\\.dml.*',,'[&?]term=([^&]+)']
		,[4,,,'UserJS-USH=(.*?)(?:;|$)']
	],
	strings = {
		_opts: 'Options',
		_new: 'New highlight',
		_hide: 'Toggle highlights',
		_close: 'Close',
		_goto: 'Goto next instance of',
		_gotoPrev: 'Goto previous instance of',
		_nfound: 'not found',
		_error: 'Ultimate Search Highlighter:\nFailed to create RegExp. Check syntax\n',
		_usePunctuation: 'Match punctuation',
		_wholeWordsOnly: 'Match whole words only',
		_matchCase: 'Match case',
		_useRegExp: 'Match as RegExp',
		_clearHistory: 'Clear search history'
	},
	evenes = opera.version() >= 10.5,
	frameIndex = 0,
	frames = [null],
	iID = setTimeout(function(){},0),
	merlin = opera.version() < 9.5,
	query = null,
	running = 0,
	USH = this,
	highlight = {
		add: function(e) {
			if( !results.terms ) { return; }
			var excElems = ['userjs-ush-toolbar','userjs-ush-highlight','head','applet','object','embed','param','script','noscript','style','frameset','frame','iframe','textarea','input','option','select','img','map'],
					textNodes = document.evaluate('.//text()[normalize-space() and not(ancestor::text() or ancestor::*[contains(" '+excElems.join(' ')+' ",concat(" ",local-name()," "))])]',e&&e.srcElement||document,null,7,null),
					hFind, hElem, i, k, textNode, term;

			if( !(i = textNodes.snapshotLength) ) { return; }
			toolbar.bar.setAttribute('busy','');

			(hElem = document.createElementNS(resolver.xhtmlNS,'userjs-ush-highlight')).tabIndex = 0;
			hElem.setAttribute('iID',iID);
			hElem.setAttribute(preferences.hideColour?'off':'on','');

			while( i-- ) {
				if( (textNode = textNodes.snapshotItem(i)).nodeType != 3 ) { continue; }
				while(hFind = results.regExp.exec(textNode.data)) {
					if( !hFind[0] ) { break; }
					for( k = 1; !hFind[k++]; );
					term = results.terms[k-=2];

					(hElem = hElem.cloneNode(false)).style.background = term.colour;
					hElem.setAttribute('term',k);

					textNode = textNode.splitText(hFind.index+hFind[0].length-hFind[k+1].length);
					textNode.deleteData(0,(hElem.textContent=hFind[k+1]).length);
					textNode.parentNode.insertBefore(hElem,textNode);
				}
			}
			toolbar.bar.removeAttribute('busy');
		},
		get: function(expr,el) {
			if( (el = el||document).querySelectorAll ) {
				el = el.querySelectorAll('userjs-ush-highlight'+expr.replace(/@/g,''));
				el.snapshotLength = el.length;
				el.snapshotItem = function(i) { return this[i]; }
				return el;
			}
			return document.evaluate('.//*[local-name()="userjs-ush-highlight"]'+expr,el,null,7,null);
		},
		remove: function(toggle,idx) {
			var i, j, node, nodes = this.get('[@iID="'+iID+'"][@term'+(idx!==undefined?'="'+idx+'"]':']'));
			i = nodes.snapshotLength; while( i-- ) {
				node = nodes.snapshotItem(i);
				if( toggle ) { node.setAttribute((j = node.hasAttribute('on'))?'off':'on',''); node.removeAttribute(j?'on':'off'); }
				else { j = node.parentNode; j.replaceChild(node.firstChild,node); j.normalize(); }
			}
		}
	},
	mutation = {
		timer: null,
		types: [
			['DOMNodeInsertedIntoDocument',true],
			['DOMNodeRemovedFromDocument',true],
			['DOMCharacterDataModified',false]
		],
		handlers: {
			DOMNodeInsertedIntoDocument: [highlight.add],
			DOMNodeRemovedFromDocument: [],
			DOMCharacterDataModified: [highlight.add]
		},
		handleEvent: function(e) {
			var i, handler;
			clearTimeout(this.timer);
			USH.running(1);
			for( i = 0; handler = this.handlers[e.type][i++]; ) {
				if( handler instanceof Function || (handler = handler.handleEvent) instanceof Function ) { handler(e); }
			}
			this.timer = setTimeout(function(el) { USH.running(1); toolbar.update(); USH.running(0); },500);
			USH.running(0);
		}
	},
	resolver = {
		xhtmlNS: 'http://www.w3.org/1999/xhtml',
		lookupNamespaceURI: function() { return this.xhtmlNS; }
	},
	results = {
		regExp: null,
		terms: null,
		timer: null,
		clear: function() { clearTimeout(this.timer); this.terms = this.regExp = null; },
		handleEvent: function(e) {
			var	el = e.target, idx = el.getAttribute('idx'), term = this.terms[idx], d, t = toolbar, o, x, xT, y, yT;
			if( !term || !term.total ) { return }
			clearTimeout(this.timer);

			if( e.ctrlKey ) { if( --term.current < 0 ) { term.current = term.total-1; } }
			else if( ++term.current >= term.total ) { term.current = 0; }
			USH.running(1); el.childNodes[1].data = term.text+' ['+(Math.pow(10,(term.total+'').length)+term.current+1+'').substring(1)+'/'+term.total+'] '; USH.running(0);

			if( !(el = highlight.get('[@iID="'+iID+'"][@term="'+idx+'"]').snapshotItem(term.current)) ) { return; }
			t.mOver.className = t.bar.className = 'userjs-ush-hide';
			d = getDim(el);
			t.mOver.className = t.bar.className = '';
			if( !d.visible ) { return (e.run = term.current||!e.run)?this.handleEvent(e):0; }

			this.timer = setTimeout(function(el) { var r = document.createRange(); r.selectNodeContents(el); getSelection().addRange(r); results.timer = null; },500,el);
			el.focus();

			el.scrollIntoView(!preferences.toolbarAtBottom);
			d = getDim(el); o = getDim(t.input).height; t = getDim(t.bar);
			x = d.left-o; xT = t.left; y = d.bottom+o; yT = t.visible?t.top:0;
			scrollBy(0,-1);
			scrollBy((x<xT || (x=d.right+o)>(xT=t.right))?x-xT:0,1+(preferences.toolbarAtBottom?(y>yT?y-yT:0):((y=d.top-o)<(yT=t.visible?t.bottom:0)?y-yT:0)));
		},
		init: function() {
			if( query === null ) { return; }
			var i, j, k, qArr, q = query, isRE = preferences.useRegExp, term, terms = [], tmp = [],
			punc = /[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/g,
			wb = (preferences.wholeWordsOnly && /[^\x20-\x7e]/.test(q))?/[\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\xa9\xab-\xb4\xb6-\xb9\xbb-\xbf\xd7\xf7\u02C2-\u02C5\u02D2-\u02DF\u02E5-\u02ED\u02EF-\u02FF\u0374\u0375\u037E-\u0385\u0387\u03F6\u0482\u055A-\u055F\u0589\u058A\u05BE\u05C0\u05C3\u05C6\u05F3-\u060F\u061B-\u061F\u066A-\u066D\u06D4\u06DD\u06E9\u06FD\u06FE\u0700-\u070F\u07F6-\u07F9\u0964\u0965\u0970\u09F2-\u09FA\u0AF1\u0B70\u0BF0-\u0BFA\u0CF1\u0CF2\u0DF4\u0E3F\u0E4F\u0E5A\u0E5B\u0F01-\u0F17\u0F1A-\u0F1F\u0F2A-\u0F34\u0F36\u0F38\u0F3A-\u0F3D\u0F85\u0FBE-\u0FC5\u0FC7-\u0FD1\u104A-\u104F\u10FB\u1360-\u137C\u1390-\u1399\u166D\u166E\u1680\u169B\u169C\u16EB-\u16F0\u1735\u1736\u17B4\u17B5\u17D4-\u17D6\u17D8-\u17DB\u17F0-\u180A\u180E\u1940-\u1945\u19DE-\u19FF\u1A1E\u1A1F\u1B5A-\u1B6A\u1B74-\u1B7C\u1FBD\u1FBF-\u1FC1\u1FCD-\u1FCF\u1FDD-\u1FDF\u1FED-\u1FEF\u1FFD-\u2070\u2074-\u207E\u2080-\u208E\u20A0-\u20B5\u2100\u2101\u2103-\u2106\u2108\u2109\u2114\u2116-\u2118\u211E-\u2123\u2125\u2127\u2129\u212E\u213A\u213B\u2140-\u2144\u214A-\u214D\u2153-\u2182\u2190-\u2B23\u2CE5-\u2CFF\u2E00-\u3004\u3007-\u3029\u3030\u3036-\u303A\u303D-\u303F\u309B\u309C\u30A0\u30FB\u3190-\u319F\u31C0-\u31CF\u3200-\u33FF\u4DC0-\u4DFF\uA490-\uA716\uA720\uA721\uA828-\uA82B\uA874-\uA877\uD800-\uF8FF\uFB29\uFD3E\uFD3F\uFDFC\uFDFD\uFE10-\uFE19\uFE30-\uFE6B\uFEFF-\uFF0F\uFF1A-\uFF20\uFF3B-\uFF40\uFF5B-\uFF65\uFFE0-\uFFFD]/.source:'\\b',
			sw = searchEngines[0]&2 && !preferences.useStopwords && /(?:^|\s)(?:intext:|(?:filetype|site|related|info|daterange|link|inurl|inanchor|intitle):\S*|(?:I|a|about|an|are|as|at|be|by|com|for|from|how|in|is|it|of|on|or|that|the|this|to|was|what|when|where|who|will|with|and|the|www)(?=$|\s))/gi;

			if( !q.indexOf('USHRegExp ') ) { isRE = true; q = q.substring(10); }
			if( isRE ) { qArr = [,,q]; }
			else {
				qArr = (searchEngines[0]&2?query=q.replace(/\++?(\+)?/g,' $1'):q).split(/([\s+|\-]*)"([^"]*)"/);
				for( i = 0; (term = qArr[i]) != null; i+=3 ) {
					if( !term ) { qArr[i] = 1; continue; }
					term = (' '+(sw?term.replace(sw,' '):term)).split(/([\s+|][\s+|\-]*)/);
					for( j = 0, k = (term.length-1)/2; j < k; j++ ) { qArr.splice(i+3*j,0,0,term[2*j+1],term[2*j+2]); }
					qArr[i+=3*j] = 1;
				}
			}
			for( i = 2, j = 0; (term = qArr[i]) != null; i += 3 ) {
				if( !term || terms['_'+term] || (/-$/).test(qArr[i-1]) ) { continue; }
				terms[j] = isRE?term:term.replace(punc,qArr[i-2]||preferences.usePunctuation||term.length<2?'\\$&':punc.source+'?');
				terms['_'+term] = true;
				tmp[j] = { text: qArr[i-2]?'"'+term+'"':term, colour: colours[j++%colours.length], total: 0, current: -1 };
			}

			term = (!isRE && preferences.wholeWordsOnly?'(?:^|'+wb+')(?:('+terms.join(')|(')+'))(?='+wb+'|$)':'('+terms.join(')|(')+')');
			try { this.regExp = new RegExp(term,preferences.matchCase?'':'i'); }
			catch(e) { return opera.postError(strings._error+term); }
			this.terms = tmp.length?tmp:null;
			if( searchEngines[0]&(self==top?13:15) ) { return; }
			saveVal('query',query);
			if( !toolbar.onInput.timer ) { setTimeout(function() { searchData.historyAdd(query); },0); }
		}
	},
	searchData = {
		hash: location.hash,
		keys: ['hash','location','referrer','storage'],
		location: location,
		referrer: document.referrer,
		storage: (evenes && localStorage.getItem('UserJS-USH'))||document.cookie,
		history: null,
		assign: function(data) {
			var i, key, sE, rE = new RegExp();
			if( data && (data = data.split('|')) ) {
				for( i = 0; key = this.keys[i]; this[key] = decodeURIComponent(data[i++])||this[key] );
			}
			for( i = 1; sE = searchEngines[i++]; ) {
				switch( searchEngines[0] = sE[0] ) {
					case 1:
						data = this.hash;
						break;
					case 2: case 3:
						if( !preferences.runOnLoad ) { }
						else if( (rE.compile('^https?://'+sE[1])||rE).test(this.location) ) { data = (sE[0]==3)&&this.location; }
						else if( rE.test(this.referrer) ) { data = (sE[0]==2)&&this.referrer; }
						break;
					case (preferences.useDOMStorage||preferences.useCookies)&&4:
						data = this.storage;
				}

				if( data && (data = (rE.compile(sE[3])||rE).exec(data)) ) {
					query = decodeURIComponent(data[1]);
					if( sE[4] instanceof Function ) { query = sE[4](query); }
					break;
				}
			}
		},
		historyAdd: function(val) {
			if( this.history && val ) {
				this.historyDel(val);
				this.history.setItem(toolbar.list.insertBefore(new Option(),toolbar.list.firstChild).value = val,0);
				if( this.history.length > preferences.enableSearchHistory ) { this.historyDel(toolbar.list.lastChild.value); }
			}
		},
		historyDel: function(val) {
			if( this.history && (val = document.evaluate('./option[@value=../@val]',toolbar.list.setAttribute('val',val)||toolbar.list,null,9,null).singleNodeValue) ) {
				this.history.removeItem(val.value);
				toolbar.list.removeChild(val);
			}
		},
		historyClear: function() {
			if( this.history ) {
				toolbar.list.textContent = '';
				this.history.clear();
			}
		},
		toString: function() { for( var data = '', key, i = 0; key = this.keys[i++]; data += encodeURIComponent(this[key])+'|' ); return data; }
	},
	toolbar = {
		enabled: false,
		timer: null,
		visible: false,
		bar: null,
		buttons: [],
		closeBttn: null,
		list: null,
		hideBttn: null,
		input: null,
		mOver: null,
		newBttn: null,
		optsBttn: null,
		optsMenu: null,
		styles: null,
		create: function() {
			var d = document, xhtmlNS = resolver.xhtmlNS, divEl, elem, i, term, terms;

			if( !this.bar ) {
				(divEl = this.bar = d.createElementNS(xhtmlNS,'userjs-ush-toolbar')).tabIndex = 0;
				divEl.focus = function(oF) { return function() {
					this.className = 'userjs-ush-hide';
					oF.call(this);
					this.className = '';
				}}(divEl.focus);

				function createButton(id,fn) {
					var el = d.createElementNS(xhtmlNS,'label');
					el.className = 'userjs-ush-bttn-icon-'+id; el.title = strings['_'+id];
					el.addEventListener('click',fn||function(e){ USH.run(e,this.className); },false);
					return toolbar.bar.appendChild(toolbar[id+'Bttn'] = el);
				}

				function createPref(id,fn) {
					var el = d.createElementNS(xhtmlNS,'label');
					el.appendChild(d.createElementNS(xhtmlNS,'input')).type = 'checkbox';
					el.firstChild.setAttribute('prefIdx',id);
					el.firstChild.checked = preferences[id];
					el.firstChild.addEventListener('change',fn||function(e) { saveVal(this.getAttribute('prefIdx'),this.checked); USH.run(e,'userjs-ush-bttn-icon-new'); },false);
					el.appendChild(d.createTextNode(strings['_'+id]));
					return toolbar.optsMenu.appendChild(el);
				}

				createButton('close');
				createButton('hide');
				createButton('opts',function(e) {
					var active = this.hasAttribute('active');
					this[active?'removeAttribute':'setAttribute']('active','');
					toolbar.optsMenu.className = (active||e.ctrlKey?'userjs-ush-hide':'');
				});

				(this.input = i = this.bar.appendChild(d.createElementNS(xhtmlNS,'input'))).className = 'userjs-ush-input';
				i.setAttribute('form','');
				i.addEventListener('input',this.onInput,false);

				createButton('new');

				(this.bar.appendChild(this.optsMenu = d.createElementNS(xhtmlNS,'optgroup'))).className = 'userjs-ush-hide';
				createPref('usePunctuation');
				createPref('wholeWordsOnly');
				createPref('matchCase');
				createPref('useRegExp');

				if( searchData.history ) {
					i.setAttribute('list',(this.list = this.bar.appendChild(d.createElementNS(xhtmlNS,'datalist'))).id = 'userjs-ush-list');
					createPref('clearHistory',function() { searchData.historyClear(); this.checked = false; });
					setTimeout(function(h) { for( var i = h.length; i; toolbar.list.appendChild(new Option()).value = h.key(--i) ); },0,searchData.history);
				}

				(this.mOver = d.createElementNS(xhtmlNS,'userjs-ush-mouseover')).addEventListener('click',this,false);
				if( !preferences.autoHideDelay ) { preferences.toolbarOverText = false; }
				else {
					divEl.addEventListener('DOMFocusOut',this,false);
					divEl.addEventListener('mouseout',this,false);
					divEl.addEventListener('mouseover',this,false);
					this.mOver.addEventListener('mouseover',this,false);
				}

				if( preferences.embedStyle || !preferences.toolbarOverText ) {
					(this.styles = d.createElementNS(xhtmlNS,"style")).textContent = 'html { position: relative !important; }'+(preferences.embedStyle?'\
					userjs-ush-mouseover { height: 1em !important; z-index: 99980 !important; }\
					userjs-ush-toolbar { background: -o-skin("Viewbar Skin") #f2f2ee !important; -moz-appearance: statusbar; border: 1px solid #999 !important; z-index: 99990 !important; }\
					userjs-ush-toolbar[mini=on], userjs-ush-mouseover[mini=on] { right: auto !important; min-width: 26.5em !important; }\
					userjs-ush-toolbar[top], userjs-ush-mouseover[top] { bottom: auto !important; top: -1px !important; }\
					#userjs-ush-list, .userjs-ush-hide { display: none !important; }\
					userjs-ush-toolbar, userjs-ush-mouseover { display: block !important; position: fixed !important; bottom: -1px !important; left: -1px !important; right: -1px !important; min-width: 100% !important; font: 12px/18px Arial, sans-serif !important; }\
					userjs-ush-toolbar, userjs-ush-toolbar *, userjs-ush-highlight[on] { text-align: left !important; text-indent: 0 !important; margin: 0 !important; padding: 0 !important; min-height: 0 !important; height: auto !important; max-height: none !important; min-width: 0 !important; width: auto !important; max-width: none !important; float: none !important; clear: none !important; color: #000 !important; }\
					userjs-ush-toolbar * { display: inline-block !important; font: inherit !important; vertical-align: middle !important; border: none !important; box-sizing: border-box !important; margin: .2em !important; text-shadow: #FFF 0 0 5px !important; }\
					userjs-ush-highlight[off] { background: transparent !important; color: inherit !important; }\
					userjs-ush-highlight:focus { outline: -o-highlight-border !important; }\
					[class^=userjs-ush-bttn] { background: -o-skin("Addressbar Button Skin") !important; -moz-appearance: toolbarbutton; padding: .2em .3em !important; cursor: hand !important; }\
					[class^=userjs-ush-bttn]:hover { background: -o-skin("Addressbar Button Skin.hover") !important; }\
					[class^=userjs-ush-bttn]:active, [class^=userjs-ush-bttn][active] { background: -o-skin("Addressbar Button Skin.pressed") !important; }\
					[class^=userjs-ush-bttn]>userjs-ush-icon { width: 1em !important; height: 1em !important; border: 1px #666 solid !important; }\
					[class^=userjs-ush-bttn]>.userjs-ush-icon-prev { background: url("chrome://global/skin/icons/collapse.png") 50% 50% no-repeat !important; background: -o-skin("Find Previous") !important; }\
					[class^=userjs-ush-bttn-icon], [class^=userjs-ush-bttn-icon]::before { content: "" !important; float: right !important; min-height: 1.5em !important; min-width: 1.5em !important; }\
					.userjs-ush-bttn-icon-opts::before { background: url("chrome://global/skin/icons/question-16.png") 50% 50% no-repeat !important; background: -o-skin("Panel Info") !important; }\
					.userjs-ush-bttn-icon-new::before { background: url("chrome://global/skin/icons/Search-glass.png") 50% 50% no-repeat !important; background: -o-skin("Find") !important; }\
					userjs-ush-toolbar[busy]>.userjs-ush-bttn-icon-new::before { background: url("chrome://global/skin/icons/loading-16.png") 50% 50% no-repeat !important; background: -o-skin("Thumbnail Busy Image") !important; }\
					.userjs-ush-bttn-icon-hide::before { background: url("chrome://global/skin/icons/Restore.gif") 50% 50% no-repeat !important; background: -o-skin("Caption Restore") !important; }\
					.userjs-ush-bttn-icon-close::before { background: url("chrome://global/skin/icons/Close.gif") 50% 50% no-repeat !important; background: -o-skin("Caption Close") !important; }\
					.userjs-ush-bttn-icon-opts, .userjs-ush-bttn-icon-new { float: none !important; }\
					.userjs-ush-input { min-width: 16em !important; background: -o-skin("Edit Skin") !important; padding: .3em !important; }\
					userjs-ush-toolbar>optgroup { position: absolute !important; bottom: 100% !important; background: inherit !important; border: 1px solid #999 !important; margin: 0 .2em !important; }\
					userjs-ush-toolbar>optgroup>* { display: block !important; }\
					userjs-ush-toolbar[top]>optgroup { bottom: auto !important; top: 100% !important; }':'');
				}
			}

			this.visible = false;
			if( this.enabled ) { return; }
			if( this.styles ) { d.documentElement.appendChild(this.styles); }
			if( !preferences.toolbarAtBottom ) {
				this.bar.setAttribute('top','');
				this.mOver.setAttribute('top','');
			}
			if( preferences.toolbarOverText ) {
				this.bar.setAttribute('mini','on');
				this.mOver.setAttribute('mini','on');
			}
			d.documentElement.appendChild(this.mOver);
			d.documentElement.appendChild(this.bar);
			if( !preferences.toolbarOverText ) { self.addEventListener('resize',this,false); }
			this.enabled = true;
		},
		handleEvent: function(e,state) {
			clearTimeout(this.timer);
			if( e ) { switch( e.type||e ) {
				case 'click':	this.bar.focus(); break;
				case 'DOMFocusOut':
					if( e.target == this.input && !this.onInput.timer && e.target.hasAttribute('pattern') ) {
						searchData.historyAdd(e.target.value);
						e.target.removeAttribute('pattern');
					}
					if( results.timer || contains(this.bar,document.activeElement||document.body) ) { return; }
				case 'mouseout':
					return this.timer = (document.activeElement==this.input?null:setTimeout(function(t) { t.handleEvent(null,false); },preferences.autoHideDelay,this));
				case 'resize':
					if( !this.styles.parentNode ) { USH.running(1); document.documentElement.appendChild(this.styles); USH.running(0); }
					this.styles.sheet.cssRules[0].style[e = 'margin'+(preferences.toolbarAtBottom?'Bottom':'Top')] = '';
					return this.visible && (this.styles.sheet.cssRules[0].style[e] = parseInt(getComputedStyle(document.documentElement,'')[e])+getDim(this.bar).height+'px !important');
				default: state = true;
			}}
			this.bar.style.visibility = (state = (state===undefined?!this.visible:state)||this.optsBttn.hasAttribute('active'))?'':'hidden';
			if( this.visible != (this.visible = state) && !preferences.toolbarOverText ) { this.handleEvent('resize'); }
		},
		onInput: {
			oVal: '',
			timer: null,
			triggered: false,
			handleEvent: function(e,fill) {
				this.timer = clearTimeout(this.timer);
				if( this.triggered ) { return this.triggered = false; }
				var i = toolbar.input, val = i.value, uVal = val.toUpperCase(), lVal = val.toLowerCase(), opt = '';

				this.timer = (fill === undefined)&&preferences.inputDelay&&setTimeout(function(i,val) {
					USH.run(val,document.activeElement==i?'newEdit':'new');
					toolbar.onInput.handleEvent(null,opt);
				},preferences.inputDelay,i,val);

				if( !toolbar.list ) { return; }
				i.setAttribute('pattern',lVal.replace(/[a-z]/g,function(l,i){ return '['+l+uVal[i]+']'; })+'.*');
				toolbar.list.setAttribute('uVal',uVal); toolbar.list.setAttribute('lVal',lVal);
				if( fill || val.length > this.oVal.length && (opt = document.evaluate('./option[starts-with(translate(@value,../@uVal,../@lVal),../@lVal)]',toolbar.list,null,9,null).singleNodeValue) ) {
					opt = fill||opt.value;
					i.value += opt.substring(val.length);
					i.setSelectionRange(val.length,opt.length);
				}
				this.oVal = val;
			}
		},
		remove: function() {
			clearTimeout(this.timer);
			clearTimeout(this.onInput.timer);
			document.removeEventListener('resize',this,false);
			if( this.styles ) { this.styles.parentNode.removeChild(this.styles); }
			this.bar.parentNode.removeChild(this.bar);
			this.mOver.parentNode.removeChild(this.mOver);
			this.update();
			this.visible = this.enabled = false;
		},
		update: function() {
			if( !this.enabled ) { return; }
			var bttn, icon, pIcon, i, term, terms, total, text;

			this.input.value = query||this.input.value||'';
			i = (terms=this.bar.children).length; while( i > (this.list?7:6) ) { this.bar.removeChild(terms[--i]); }
			i = (terms=this.optsMenu.children).length; while( i ) { (term = terms[--i].firstChild).checked = preferences[term.getAttribute('prefIdx')]; }

			if( preferences.toolbarOverText ) {
				this.bar.setAttribute('mini',results.terms?'':'on');
				this.mOver.setAttribute('mini',results.terms?'':'on');
			}

			if( !results.terms ) { return; }
			(bttn = document.createElementNS(resolver.xhtmlNS,'label')).className = 'userjs-ush-bttn';
			icon = document.createElementNS(resolver.xhtmlNS,'userjs-ush-icon');

			for( i = 0; term = results.terms[i]; i++ ) {
				(this.buttons[i] = bttn = bttn.cloneNode(false)).setAttribute('idx',i);
				text = bttn.textContent = term.text;
				total = highlight.get('[@iID="'+iID+'"][@term="'+i+'"]').snapshotLength;
				bttn.title = total?strings._goto+' "'+text+'"':'"'+text+'" '+strings._nfound;
				if( total ) {
					if( term.current >= total ) { term.current -= term.total - total; }
					bttn.addEventListener('click',results,false);
					bttn.textContent += ' ['+(Math.pow(10,(total+'').length)+term.current+1+'').substring(1)+'/'+total+'] ';
					(pIcon = bttn.insertBefore((pIcon||icon).cloneNode(false),bttn.firstChild)).className = 'userjs-ush-icon-prev';
					pIcon.addEventListener('click',function() { results.handleEvent({target: this.parentNode, ctrlKey: true}); },false);
					pIcon.title = strings._gotoPrev+' "'+text+'"';
					(icon = bttn.appendChild(icon.cloneNode(false))).setAttribute('style','background: '+term.colour+' !important');
					icon.addEventListener('click',function() { highlight.remove(true,this.parentNode.getAttribute('idx')); },false);
					icon.title = strings._hide;
				}
				term.total = total;
				this.bar.appendChild(bttn);
			}
		}
	},
	contains = function(el1,el2) { return el1 == el2 || !!(el1.contains?el1.contains(el2):el1.compareDocumentPosition(el2)&16); },
	exit = function() {
		USH.running(1);
		highlight.remove();
		saveVal('query',query='');
		results.clear();
		toolbar.remove();
		USH.running(0);
	},
	getDim = function(el) {
		var t1 = -self.pageYOffset, t = t1, l1 = -self.pageXOffset, l = l1, d, oEl = el, h = el.offsetHeight, w = el.offsetWidth;
		if( el.getBoundingClientRect ) { d = el.getBoundingClientRect(); }
		else { while( el ) { t += el.offsetTop; l += el.offsetLeft; el = el.offsetParent; } }
		d = {left:d?d.left:l, top:d?d.top:t, right:d?d.right:w+l, bottom:d?d.bottom:h+t, height:h, width:w};
		d.visible = h && w && d.bottom>t1 && d.right>l1 && (contains(oEl,el=document.elementFromPoint((evenes?0:-l1)+(d.left+d.right)/2,(evenes?0:-t1)+(d.top+d.bottom)/2)||oEl) || contains(el,oEl));
		return d;
	},
	run = function() {
		USH.running(1);
		toolbar.create();
		if( !searchEngines[0] || preferences.highlightOnLoad ) {
			results.init();
			highlight.remove();
			highlight.add();
		}
		toolbar.update();
		toolbar.handleEvent(searchEngines[0] && self!=top?null:'click',!preferences.autoHideDelay||!searchEngines[0]||!preferences.toolbarHiddenOnLoad);
		searchEngines[0] = 0;
		USH.running(0);
	},
	saveVal = function(key,val) {
		preferences[key] = val;
		if( key != 'query' ) { return; }
		if( preferences.useDOMStorage && evenes ) {
			val?localStorage.setItem('UserJS-USH','UserJS-USH='+val):localStorage.removeItem('UserJS-USH');
		}
		else if( preferences.useCookies ) {
			document.cookie = 'UserJS-USH='+encodeURIComponent(val)+';path=/;'+(val?'':'expires='+new Date(0).toGMTString());
		}
	};

	this.init = function(prefs,store) {
		if( !(document.documentElement instanceof HTMLHtmlElement) && !opera.isFF ) { return; }
		var loadFn = {handleEvent: function(oE) {
			if( oE ) { opera.removeEventListener(oE.type,this,false); }
			(merlin?top.document:top).postMessage(self==top?'USH|load|':'USH|loadFrame','*');
		}};

		delete this.init;
		delete opera.USHprefs;

		if( prefs instanceof Function ) {
			preferences = prefs('preferences');
			colours = prefs('colours');
			searchEngines = prefs('searchEngines');
			strings = prefs('strings');
		}
		if( preferences.checkDocChanges ) {
			this.addEventListener = function(type,handler) {
				USH.running(1); USH.running(0);
				if( mutation.handlers[type] && handler ) { mutation.handlers[type].push(handler); }
			}
		}
		searchData.history = preferences.enableSearchHistory && store;

		opera.addEventListener('BeforeEvent.message',function(oE) {
			var e = oE.event||oE, msg = e.data.toString(), data;
			if( !!msg.indexOf('USH|') ) { return; }
			oE.preventDefault();
			switch( msg = msg.substring(4) )	{
				case 'loadFrame':
					e.source.postMessage('USH|frameIndex|'+frames.length,'*');
					e.source.postMessage('USH|load|'+searchData,'*');
					frames[frames.length] = e.source;
					break;
				case 'frameIndex|'+(data=msg.substring(11)):
					frameIndex = data;
					break;
				case 'load|'+(data=msg.substring(5)):
					searchData.assign(data);
					if( !query && USH.query ) {
						query = USH.query;
						searchEngines[0] = 8;
						delete USH.query;
					}
					if( query && searchEngines[0] ) { run(); }
					break;
				case 'run|'+(data=msg.substring(4)):
					data = data.split('|');
					USH.run(data[0],data[1],data[2]^0);
			}
		},false);

		opera.addEventListener('BeforeEvent.keypress',({
			enabled: false,
			keys: {},
			event: document.createEvent('UIEvents'),
			init: function() {
				var i, j, key, code;
				for( i = j = 0; key = preferences.keyShortcuts[i++]; j = 0 ) {
					if( key[1] ) {
						while( code = key[1].charCodeAt(j++) ) { this.keys['_'+code] = key[0]; }
						this.keys[key[0]] = (key[2]<<0) + (key[3]<<1) + (key[4]<<2);
					}
				}
				this.enabled = (this.keys.enable === undefined);
				this.event.initEvent('click',true,true);
				return this;
			},
			handleEvent: function(oE) {
				var e = oE.event||oE, el = e.target, key = e.keyCode||e.charCode, bttn = this.keys['_'+key],
						keyChk = (this.keys[bttn]&1 || this.keys[bttn] == (e.ctrlKey<<1) + (e.shiftKey<<2))&&bttn;
				if( keyChk == 'run' ) { return USH.run(getSelection().toString()||null,'newSelect'); }
				if( el == toolbar.input ) {
					toolbar.onInput.triggered = !e.which;
					switch( key ) {
						case 13: USH.run(e,'userjs-ush-bttn-icon-new'); break;
						case 27: el.blur(); break;
					//	case 8:
					//		if( !e.ctrlKey ) { break; }
					//		searchData.historyDel(el.value);
					//		USH.run(el.value = '','newEdit');
					}
				}
				if( el.forms instanceof NodeList ) { return; }
				if( preferences.runOnKeyPress && e.which ) { return USH.run(null,'newEdit'); }
				if( !toolbar.enabled ) { return; }

				if( keyChk == 'enable' ) { this.enabled = !this.enabled; }
				if( this.enabled && keyChk !== false && (bttn = ((typeof bttn == 'number')?toolbar.buttons:toolbar)[bttn]) ) {
					oE.preventDefault(); e.preventDefault();
					this.event.shiftKey = e.shiftKey; this.event.ctrlKey = e.ctrlKey;
					bttn.dispatchEvent(this.event);
				}
			}
		}).init(),false);

		if( opera.isFF ) { return loadFn.handleEvent(); }
		opera.addEventListener('AfterEvent.DOMContentLoaded',loadFn,false);
		if( self == top ) {
			searchData.assign();
			if( query ) { saveVal('query',query); }
		}
	}

	this.run = function(e,action,frame) {
		var i = toolbar.enabled && toolbar.input, f;
		frame = frame || e&&e.shiftKey;
		switch( action ) {
			case 'userjs-ush-bttn-icon-close':
				i && exit();
				break;
			case 'userjs-ush-bttn-icon-hide':
				i && highlight.remove(true);
				break;
			case 'userjs-ush-bttn-icon-new':
				return i && USH.run(i.value.replace(/^\s*(USHRegExp\s)?\s*/,e&&e.ctrlKey?'USHRegExp ':'$1'),'new',frame);
			case 'newSearch':
				if( !e || e == location ) { return; }
				searchEngines[0] = 2;
			case 'new'+action.substring(3):
				query = e;
				run();
				i = toolbar.input;
				if( action == 'newSelect' ) { setTimeout(function() { i && i.focus(); i.value+=" ";},0); }
				if( action != 'newEdit' ) { break; }
			case 'edit':
				//run();
				i && i.focus();
				i.value+=" ";
		}
		if( !frame ) { return; }
		if( self != top ) { return (merlin?top.document:top).postMessage('USH|run|'+query+'|'+action+'|'+frameIndex,'*'); }
		for( i = 0; f = frames[++i]; ) {
			if( i !== frame ) { (merlin?f.document:f).postMessage('USH|run|'+query+'|'+action,'*'); }
		}
	}

	this.running = function(val) {
		var i, type;
		if( val === undefined ) { return running; }
		val = val?1:running?2:0;
		if( preferences.checkDocChanges && val ) {
			for( i = 0; type = mutation.types[i++]; ) { document[val&1?'removeEventListener':'addEventListener'](type[0],mutation,type[1]); }
		}
		return running = !!(val&1);
	}
}).init(opera.USHprefs,opera.scriptStorage);