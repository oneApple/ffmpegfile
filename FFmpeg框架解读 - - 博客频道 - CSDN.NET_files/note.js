/*
 * 【全站通知】全站通知类。
 *  by: zhaoxin@csdn.net
 *  2012-11-30 AM
 */
(function(window) {

  //登录用户对象
  var USER = {};

  USER.username = "";

  var HOST = location.href;

  var SERVERHOST = 'http://notice.csdn.net';

  var SPACE = "http://my.csdn.net/";
  
  var BASEPATH = "http://static.csdn.net/rabbit/note/";

  var csdn = window.csdn || {};

  var currUser = {};

  var setReadedIds = [];




  //List最多显示条数
  var MAXCOUNT = 5;

  /*
   * icons list
   * rev_tick :回帖
   * rev_conn :社交
   * rev_blog ：博客
   * rev_message ：留言
   * re_upres ：系统信息
   */
  var icons = ['rev_tick', 'rev_conn', 'rev_blog', 'rev_message', 're_upres'];

  //动画中。。。
  var inProcess = false;

  var click = false;

  csdn.note = function(conf) {

    //配置项
    this.conf = conf;

    //Dom节点
    this.Dom = {};

    //存储notice内容数组
    this.currData = [];

    //初始化
    this.init.apply(this, []);
  };

  csdn.note.prototype = {

    /*
     * 【初始化入口】
     * @param <Object>
     * @param <Object>
     */
    init: function() {
      SERVERHOST = this.conf.serverHost||SERVERHOST;
      BASEPATH = this.conf.basePath||BASEPATH;
      var that = this;
      this.checkLogin(function(data) {
        that.conf.wrap.hide();
        // 暂时隐藏样式
        //that.loadCss(BASEPATH+that.conf.cssUrl,'head',function(){});
        that.getSocket(BASEPATH+that.conf.socketUrl , function(){
          that.getNoticeCount(function(data) {
            that.getDoms(data);
            data && that.keepAlive(function(num){
              /*if(num) {
                that.setMainBtn(num);
              }*/
            });
          });
        }); 
      });
    },

    /*
    * 异步加载CSS
    */
    loadCss : function(src, target, callback){
        var node = document.createElement('link'),outEl;
        switch (target) {
            case 'body':
                outEl = document.body;
                break;
            case 'head':
                outEl = document.getElementsByTagName('head')[0];
                break;
            default:
                outEl = document.getElementsByTagName('head')[0];
        }
        node.rel = "stylesheet";
        node.type = 'text/css';
        if (node.addEventListener) {
            node.addEventListener('load', callback, false);
            node.addEventListener('error', function () {

            }, false);
        }
        else { // for IE6-8
            node.onreadystatechange = function () {
                var rs = node.readyState;
                if (rs === 'loaded' || rs === 'complete') {
                    node.onreadystatechange = null;
                    callback();
                }
            };
        }
        node.href = src;
        outEl.appendChild(node);
    },

    /*
     * 【UI】获取所有DomHook
     * @param <Object>
     * @param <Object>
     */
    getDoms: function(data) {
      this.Dom.wrap = this.conf.wrap;
      this.Dom.btn = this.conf.btn;
      var btnLeft = this.Dom.btn.offset().left;
      var btnTop = this.Dom.btn.offset().top;
      this.renderPos(btnLeft,btnTop);
      this.openTip(data.data.count);
      this.Dom.wrap.css('zIndex','999');
      $('<iframe src="about:blank" frameborder="none" style="z-index:-1;position:absolute;top:20px;left:0;width:100%;height:100%;background:transparent"></iframe>').appendTo(this.Dom.wrap);
      
      return this;
    },


    /*
     * 【UI】获取Dom.btn的位置,渲染Dom.wrap && csdn_notice_tip 的位置
     * @param btnLeft <String> btn可视范围左边距
     * @param btnTop <String> btn可视范围上边距
     */
     renderPos : function(btnLeft,btnTop){
        
        this.Dom.wrap.css({
          position : "absolute",
          left : btnLeft -215 + 'px',
          top : btnTop + 15 + 'px',
          zIndex : 9999,
          overflow : "hidden",
          width : "440px",
          padding : "20px 0 0"
        });
        
        $('.csdn_notice_tip').css({
          position : "absolute",
          left : btnLeft - 72 + 'px',
          top : btnTop + 22 + 'px'

        });
     },

    /*
     * 【logic】加载socket.io.js
     * @param <Object>
     * @param <Object>
     */

     getSocket : function(url,callback){
        $.getScript(url,function(){
          if(typeof callback === "function"){
            callback();
          }
        });
     },

    /*
     * 【UI】
     * @param <Object>
     * @param <Object>
     */

     showNoticeBox : function(){
        var that = this;
        if(!click){
          this.getData(function(data){
            that.toggleShow(function() {
              var _wrap = that.Dom.wrap;
              that.Dom.list = _wrap.find(".list");
              that.Dom.content = _wrap.find(".notice_content");
              that.initList();
              that.initDetail();
              that.slideReset();
              if($('.csdn_notice_tip strong').html()*1){
                that.setReaded(that.currData,function(data){
                 $('.csdn_notice_tip strong').html(0);
                });
              } 
              click = true;  
            });
          });
        }else{
          if($('.csdn_notice_tip strong').html()*1){
            that.setReaded(that.currData,function(data){
             $('.csdn_notice_tip strong').html(0);
            });
          } 
          this.toggleShow();
        }
        
     },

     getSocket : function(url,callback){
        $.getScript(url,function(){
          if(typeof callback === "function"){
            callback();
          }
        });
     },

    /*
     * 【UI】显示详细项
     * @param <Object>
     * @param <Object>
     */
    addEvent: function() {

      var that = this;

      this.Dom.btn.bind("click", function() {
        if(!click){
          that.showNoticeBox();
        }else{
          that.toggleShow(function(){
            var _content = $(that.Dom.wrap).find(".notifications");
            if($(_content[1]).is(':visible')){
              $(_content[1]).css('display','none'), 
              $(_content[0]).css('display','block');
              $('.remove').css("display","block");
            }
            
          });
        }
        that.Dom.wrap.find('.unread').removeClass('unread');    
        return false;
      });

      $(window).bind("resize",function(e){
        var btnLeft = that.Dom.btn.offset().left;
        var btnTop = that.Dom.btn.offset().top;
        that.renderPos(btnLeft,btnTop);
        return false;
      });


      $(document).bind("click", function(e) {
        var target = e.target;
        if($(target).parents().filter(that.Dom.wrap).length <= 0) {
          that.Dom.wrap.hide();
          that.Dom.wrap.find('.remove').css('display','');
        }
      });

      this.Dom.wrap.bind("mouseup", function(e) {
        if ((e.which || e.button) === 1) {
          e.preventDefault();
          that.eventHandler(e);
          return false;
        }
      });


      $('.csdn_notice_tip').bind("click",function(e){
        e.preventDefault();
        that.eventHandler(e);
        return false;
      });

      return this;

      
    },

    
    /*
     * 【UI】事件处理
     * @param <Object>
     * @param <Object>
     */
    eventHandler: function(e) {
      var that = this;
      var el = e.target;
      e.stopPropagation();

      //点击list
      if(wrapList = $(el).hasClass("list")[0] || $(el).parents().filter(".list")[0]) {
        var children = $(wrapList.parentNode).children();
        that.currIndex = 0;
        for(var i = 0, len = children.length; i < len; i++) {
          if(children[i] == wrapList) {
            that.currIndex = i;
            break;
          }
        }
        var i = that.currIndex;

        if($('.csdn_notice_tip strong').html()*1){
          that.setReaded(that.currData, function(data) {
            $(wrapList).removeClass("unread");
            $('.csdn_notice_tip strong').html($('.csdn_notice_tip strong').html()*1-1);
            that.initDetail(i);
            that.setNavBtn(i);
            var _content = $(that.Dom.wrap).find(".notifications");
            that.goSlide($(_content[0]), $(_content[1]));
          });
        }else{
          $(wrapList).removeClass("unread");
          that.initDetail(i);
          that.setNavBtn(i);
          var _content = $(that.Dom.wrap).find(".notifications");
          that.goSlide($(_content[0]), $(_content[1]));
        }
        
        $('.remove').css("display","none");
        return;
      }

      //点击关闭
      if($(el).hasClass("remove")) {
        this.doClose();
        return;
      }

      //点击返回
      if($(el).hasClass("go_back")) {
        var _content = $(that.Dom.wrap).find(".notifications");
        this.goSlide($(_content[1]), $(_content[0]));
        $('.remove').css("display","block");
        return;
      }

      //点击上一条
      if($(el).hasClass("prvnote") && !($(el).hasClass("disabled"))) {
        that.prv();
        return;
      }

      //点击下一条
      if($(el).hasClass("nextnote") && !$(el).hasClass("disabled")) {
        that.next();
        return;
      }

      // 关闭消息提示层
      if($(el).hasClass("remove2")){
        $('.csdn_notice_tip').css('display','none');
        that.getData(function(data){
          that.setReaded(that.currData,function(){

          });
        });
        return;
      }

      // 点击消息提示层，打开通知列表
      if($(el).hasClass("tip_text")){
        that.showNoticeBox()
        $('.csdn_notice_tip').css('display','none');
        return;
      }

    },
    goSlide: function(from, to) {
      if(inProcess) {
        return
      };
      inProcess = true;
      var that = this;
      var _wrap = this.conf.wrap;
      var fwidth = $(from).width();
      var twidth = $(to).width();
      var fromH = from.height();
      var posLeft = "-" + fwidth;
      var posCurr = 0;
      var posRight = fwidth;

      _wrap.height(to.height());
      var isNext = false;
      from.css({
        position: "relative",
        top: 0,
        left: posCurr
      });

      //查找from以后的节点，看看是否包含from,判断方向

      function setPos(el, pos, width) {
        var _pos = {
          left: function() {
            el.css({
              position: "absolute",
              width: fwidth,
              top: 0,
              left: "-" + width + "px"
            });
          },
          center: function() {
            el.css({
              position: "relative",
              width: fwidth,
              top: 0,
              left: 0
            });
          },
          right: function() {
            el.css({
              position: "absolute",
              width: fwidth,
              top: 0,
              left: width
            });
          }
        }
        _pos[pos]();
      }

      //向下一个滚动
      if($(from).nextAll().filter(to).length) {
        setPos(from, "center", fwidth);
        setPos(to, "right", fwidth);
        var targetPos = posLeft + "px";
      }

      //向上一个滚动
      else {
        setPos(from, "center", fwidth);
        setPos(to, "left", fwidth);
        var targetPos = posRight + "px";
      }

      from.parent().children().removeClass("curr");
      from.show();
      to.addClass("curr");
      to.show();
      _wrap.height(to.height());
      inProcess = true;
      var speed = 110;
      from.animate({
        left: targetPos
      }, speed, function() {
        from.removeAttr("style");
        from.hide();
        to.animate({
          left: 0
        }, speed, function() {
          to.siblings().hide();
          to.removeAttr("style");
          _wrap.height("");
          inProcess = false;
        });
      });


      to.animate({
        left: 0
      }, speed, function() {
        to.siblings().hide();
        to.removeAttr("style");
        _wrap.height("");
        inProcess = false;
      });
      inProcess = false;
    },

    slideReset: function() {
      inProcess = false;
      var curr = $(this.conf.wrap.find(".notifications")[0]);
      curr.addClass("curr");
      curr.nextAll().hide();
      curr.show();
      this.conf.wrap.scrollLeft(0);
      this.setOverFlow();
    },
    /*
     * 【UI】提供主模板
     * @param <Object>  是否是列表容器
     * @param <Object>  数据对象
     * @param <STRING>  内容列表
     * @param <STRING>  顶部导航
     */
    renderTpl: function(islist, data, list, nav) {
      var _data = data;
      nav = nav || '<a href="'+SERVERHOST+'/dashboard" target="_blank" class="go_all">查看所有通知</a>';
      var wrapClass = (islist) ? "notice_list_con" : "detail_con";

      list = list || this.renderListTpl(_data);
      //页面模板
      var tpl = '\
          <div class="notifications ' + wrapClass + '">\
          <div class="menu_title">\
                <span class="title">\
                ' + nav + '\
                </span>\
          </div>\
          <div class="notice_content">\
          ' + list + '\
          </div>\
        </div>';

      return tpl;
    },

    /*
     * 【UI】提供list模板
     * @param <Object>
     * @param <Object>
     */
    renderListTpl: function(data) {
      //list模板

      if(!data.length){
        return '<div class="nothing">暂没有新通知</div>';
      }
      function getTpl(item) {
        var title = item.title,
          time = item.time,
          type = item.type,
          id = item.id;
        var unreadClass = "";
        unreadClass = (!item.details.isReaded || item.details.isReaded == '0') ? " unread " : "";
        var tpl = '\
            <dl class="list ' + (icons[type] || 'rev_type' + type) + unreadClass + '">\
                <dt>\
                <i></i>\
                <a href="javascript:void(0);"><span class="count_down">' + time + '</span>' + title + '</a>\
                </dt>\
            </dl>';
        return tpl;
      }
      var tpl = "";
      var i = 0,
        len = data.length,
        item;
      while(i < len) {
        item = data[i];
        tpl += getTpl(item);
        i++;
      }
      return tpl;
    },

    /*
     * 【UI】提供item模板
     *
     *1.没有title的同时没有图片的，不显示主标题的时间
     *2.没有imgUrl且没有body的，只显示一条合并后的消息
     *（p.s:蛋疼的规则，我也不想这么写，产品线说，"这样使用起来方便"，于是暂时迁就，忍不了再改吧。）
     * @param <Object>
     * @param <Object>
     */
    renderItemTpl: function(data, index, curr) {
      var _this = this;
      var tpl = "";
      var i = 0,
        _data = data.items,
        len = _data.length,
        item;
      
      while(i < len) {
        item = _data[i];
        tpl += getTpl(item);
        i++;
      }

      var type = data.type;
      
      /*
       没有title的同时没有图片的，不显示主标题的时间
      （p.s:蛋疼的规则，我也不想这么写，但产品线说，"这样使用起来方便"，于是暂时迁就，忍不了再改吧。）
      */
      var _time = (!data.items[0].title&&!data.items[0].imgurl)?data.items[0].time:"";
      var header = '<dt><i></i><span class="item_title">' + data.title + '</span><span class="count_down">'+_time+'</span></dt>';
      var remain = data.remain || "0";
      var url = data.url || "javascript:void(0)";
      var isCurr = curr == index ? 'class="curr"' : '';
      var more = "";
      if(!data.items[0].content || !data.remain  || !data.type) {
        more = '';
      }else{
        more = '<a class="notifications_moer" target="_blank" href="' + url + '">查看其它 ' + remain + ' 条</a>';
      }
      
      tpl = '<div ' + isCurr + '><dl class="' + (icons[type] || 'rev_type' + type) + '">' + header + tpl + '</dl>' + more + '</div>';

      //list模板
      function getTpl(item) {
        
        //没有imgUrl且没有body的，只显示一条合并后的消息
        if(!data.imgUrl&&!data.items[0].content){
          return '';
        }
        
        var fromuser = item.fromuser;
        var fromuserLink = '<a href="' + SPACE + fromuser + '" target="_blank" class="usrlink">' + fromuser + '</a>';
        var content = item.content,
          time = item.time,
          id = item.id,
          tpl="";
        
        //如果有imgurl，则模板为图文显示
        if(item.imgurl){
          var img = !item.imglink?'<img src="'+item.imgurl+'" height="32" width="32"/>':'<a href="'+item.imglink+'" target="_blank"><img src="'+item.imgurl+'" height="32" width="32"/></a>';
          var imgtitle = item.imgtitle || "";
          tpl = '\
            <dd class="item" lang = "' + id + '">\
                <span class="count_down">' + time + '</span>' + img + imgtitle + '\
            </dd>';
            return tpl;
        }
        // 对BBCODE语法进行转换
        content = _this.ubbDecode(content);
        tpl = '\
          <dd class="item" lang = "' + id + '">\
              <div class="notice_txt">' + fromuserLink + '<span class="fenge">:</span>' + content + '</div><span class="count_down">' + time + '</span>\
          </dd>';
        return tpl;
      }

      return tpl;
    },

    /*
     * 【UI】设置导航
     * @param <Object>
     * @param <Object>
     */
    renderNav: function(isDetail) {
      isDetail = isDetail || "true";
      var _details;
      if(isDetail) {
        _details = '\
          <a class="go_back" href="javascript:void(0);">返回通知列表</a>\
          <a class=" notifications_page_none nextnote" href="javascript:void(0);">下一条</a>\
          <a class=" notifications_page prvnote" href="javascript:void(0);">上一条</a>\
          ';

      } else {
        _details = '<a href="javascript:void(0)">查看所有通知</a></span>';
      }
      return _details;
    },

    /*
     * 【UI】点击关闭
     * @param <Object>
     * @param <Object>
     */
    doClose: function() {
      this.Dom.wrap.css('display','none');
    },

    /*
     * 【UI】点击 显示/关闭
     * @param <Object>
     * @param <Object>
     */
    toggleShow: function(callback) {
      var that = this;
      if($('.csdn_notice_tip').is(':visible')){
        $('.csdn_notice_tip').hide();
      } 
      this.Dom.wrap.toggle();
      if(typeof callback == 'function') {
        callback();
      }
      return false;
    },

    /*
     * 【UI】设置上一条，下一条按钮
     * @param <Object>
     * @param <Object>
     */
    setMainBtn: function() {
      var num = 0;
      var len = this.currData.length;
      while(len--) {
        if(this.currData[len].details.isReaded === 0) {
          num++;
        }
      }
        
      this.openTip(num);
      
      
    },

    /*
     * 【UI】渲染新消息弹出提示层
     * @param <number> 新收到的消息数量
     * 
     */

    openTip : function(num){
      num += $('.csdn_notice_tip strong').html()*1 ;
      $('.csdn_notice_tip strong').html(num);
      if(this.conf.wrap.is(':visible')){
        return;
      }
      /*if(num){
        $('.csdn_notice_tip').css('display','block');
      }else{
        $('.csdn_notice_tip').css('display','none');
      }*/
      
      

    },

    /*
     * 【UI】设置上一条，下一条按钮
     * @param <Object>
     * @param <Object>
     */
    setNavBtn: function(i) {
      var index = this.currIndex = i;
      var prv = this.Dom.wrap.find(".prvnote");
      var next = this.Dom.wrap.find(".nextnote");
      this.isEnd(index, {
        top: function() {
          //禁用上一条
          prv.addClass("disabled");
          next.removeClass("disabled");
        },
        middle: function() {
          //解除禁用
          next.removeClass("disabled");
          prv.removeClass("disabled");
        },
        end: function() {
          //禁用下一条
          next.addClass("disabled");
          prv.removeClass("disabled");
        },
        only: function() {
          // 只有一条
          next.addClass("disabled");
          prv.addClass("disabled");
        }
      });
    },

    /*
     * 【UI】超出n条后，出滚动条
     * @param <NUMBER> index
     * @param <Object> 回调对象
     */
    setOverFlow: function(n) {
       n = n || MAXCOUNT;
       var oContent = $(this.Dom.wrap.find(".notice_content")[0]);
       var len = oContent.children().length;
       var Jsoncss = {},isOverFolw = len>n-1;
          Jsoncss = {
            "overflow":isOverFolw?"auto":"",
            "height":isOverFolw? (oContent.height()? oContent.height() :"255px"):""

          }       
       oContent.css(Jsoncss);
    },

    /*
     * 【LOGIC】判断是否是上一条并执行相应回调
     * @param <NUMBER> index
     * @param <Object> 回调对象
     */
    isEnd: function(i, conf) {
      var _data = this.currData;
      this.isEndTop = false;

      if((i == 0) && (i == _data.length - 1)) {
        conf.only();
        this.isEndTop = true;
      } else if(i == 0) {
        conf.top();
        this.isEndTop = true;
      } else if(i == _data.length - 1) {
        conf.end();
        this.isEndTop = true;
      } else {
        conf.middle();
        this.isEndTop = false;
      }
    },

    /*
     * 【LOGIC】上一条
     * @param <Object>
     * @param <Object>
     */
    prv: function() {
      if(inProcess) {
        return
      }
      var _currIndex = this.currIndex;
      var i = this.currIndex - 1 ;
      this.setNavBtn(i);
      if(this.Dom.wrap.find('.notice_list_con  dl:nth-child('+(i+1)+')').hasClass('unread')){
        this.Dom.wrap.find('.notice_list_con  dl:nth-child('+(i+1)+')').removeClass('unread');
      }  
      
      var _content = this.conf.wrap.find(".detail_con .notice_content");
      _content.css({
        position: "relative"
      });
      var _list = _content.children();
      var from = $(_list[_currIndex]);
      var to = $(_list[i]);
      this.goSlide(from, to);
    },

    /*
     * 【LOGIC】下一条
     * @param <Object>
     * @param <Object>
     */
    next: function() {
      if(inProcess) {
        return
      };
      var _currIndex = this.currIndex;
      var i = this.currIndex + 1;
      this.setNavBtn(i);
      if(this.Dom.wrap.find('.notice_list_con  dl:nth-child('+(i+1)+')').hasClass('unread')){
        this.Dom.wrap.find('.notice_list_con  dl:nth-child('+(i+1)+')').removeClass('unread');
      }  
            
      var _content = this.conf.wrap.find(".detail_con .notice_content");
      _content.css({
        position: "relative"
      });
      var _list = _content.children();
      var from = $(_list[_currIndex]);
      var to = $(_list[i]);
      this.goSlide(from, to);
    },

    /*
     * 【LOGIC】显示详细项
     * @param <Object>
     * @param <Object>
     */
    initList: function(i) {
      var data = this.currData;
      var wrap = this.conf.wrap;
      var listCon = wrap.find(".notice_list_con");
      if(listCon.length > 0) {
        $(this.renderTpl(1, data)).replaceAll(listCon);
      } else {
        wrap.find('.box').append($(this.renderTpl(1, data)));
      }
    },

    /*
     * 【LOGIC】显示详细项
     * @param <Object>
     * @param <Object>
     */
    initDetail: function(i) {
      i = i || "0";
      i *= 1;
      var data = this.currData,
        el = this.conf.wrap.find('.notifications'),
        nav = this.renderNav();
      var wrap = this.conf.wrap;
      var j = 0,
        len = data.length,
        detail = "";
      while(j < len) {
        detail += this.renderItemTpl(data[j].details, j, i);
        j++;
      }
      var tpl = $(this.renderTpl('', data, detail, nav));
      var detailCon = wrap.find(".detail_con");
      if(detailCon.length > 0) {
        tpl.replaceAll(detailCon);
      } else {
        wrap.find('.box').append($(this.renderTpl('', data, detail, nav)));
      }

      content = this.conf.wrap.find(".notice_content");
      wrap.find(".detail_con .curr").siblings().hide();
      
    },

    /*
     * 【LOGIC】添加一条信息
     * @param <array> data 消息数组
     * @param <Object>
     */
    addItem: function(data) {
        this.currData = data.concat(this.currData);

    },


    /*
     * 【LOGIC】显示详细项
     * @param <Object>
     * @param <Object>
     */
    addMoreItemsBtn: function() {

    },

    /*
     * 【LOGIC】检查登录
     */
    checkLogin: function(callback) {
      var that = this;
      var url = "http://ptcms.csdn.net/comment/js/login.js";
      $.getScript(url, function(data) {
        currUser.username = csdn.getCookie("UserName") || currUser.username;
        currUser.userInfo = csdn.getCookie("UserInfo") || currUser.userInfo;
        var data = currUser.username ? true : false;
        that.setLogin(currUser.username,function(){
          if(data&& typeof callback ==="function"){
            callback(data);
          }
          
        });
      });
    },

    /*
     * 【LOGIC】设置登录
     */
    setLogin: function(nickname, callback) {
      nickname = nickname || currUser.username;
      if(typeof callback === "function"){
        callback();
      }
      
    },

    /*
     * 【DATA】建立长连接
     */
    keepAlive: function(callback) {
      var _this = this;
      var socket = io.connect(SERVERHOST);

      var nickname = currUser.username;

      var onConn = function() {
          socket.emit('nickname', currUser, function(set) {

          });
        };
      var userEvent = function(data) {
          if(typeof callback == 'function') {
            callback(data);
          }
        };

        //连接
        socket.on('connect', function(data) {
          onConn();
        });
        
      //监听设为已读
      socket.on(nickname+"onSetReaded", function(msg) {
        var unReadedCount = $('.csdn_notice_tip strong').html()*1;
        var data = _this.currData;
        var len = data.length;
        var arrIds = [];
        while(len--){
          if(data[len]['details']['isReaded'] == '0' || typeof data[len]['details']['isReaded'] == 'undefined'){
            var l=data[len]['details']['items'].length;
            while(l--){
              if(!data[len]['details']['items'][l]['status']){
                arrIds.push(data[len]['details']['items'][l]['id']);
              }
              
            }          
          }  
        }
        msg = msg.length ? msg : arrIds;
        $.each(msg,function(i,value){
          var n = $.inArray(value,setReadedIds);
          if(n>-1){
            setReadedIds.splice(n,1);
          }
          unReadedCount--;
        });
        unReadedCount = unReadedCount <0 ? 0 : unReadedCount;
        if(!unReadedCount){
          $('.csdn_notice_tip').css('display','none');
        }
        $('.csdn_notice_tip strong').html(unReadedCount);
        
      });


      socket.on(nickname, function(msg) {
        _this.addItem(msg);
        _this.Dom.wrap.find('.nothing').remove();
        var listItemHTML = $(_this.renderListTpl(msg));
        var oContent = $(_this.Dom.wrap.find(".notice_content")[0]);
        if(!oContent.children().length){
          oContent.append(listItemHTML);
        }else{
          listItemHTML.insertBefore(oContent.children()[0]);
        }
        
        listItemHTML.hide().slideDown("fast",function(){
          if(_this.Dom.wrap.is(":visible")){
            _this.setReaded(_this.currData,function(){
              var num = $('.csdn_notice_tip strong').html()*1-1;
              $('.csdn_notice_tip strong').html(num);
            });
            
          }
        });
        _this.setOverFlow();
        var num = msg.length;
        if(num) {
          _this.openTip(num);
        }
      });

      // 出错
      socket.on('error', function(e) {

      });
      // 断线
      socket.on('disconnect', function() {
        socket.disconnect();
      });

      //onGetMsg

      function onGetMsg(from, msg) {

      };


    },

    /*
     * 【DATA】获取全部未读数据的具体内容
     * @param <Object>
     * @param <Object>
     */
    getData: function(callback) {
      var that = this,
        username = currUser.username,
        userinfo = currUser.userInfo,
        count = this.conf.count || 5,
        subCount = this.conf.subCount || 5,
        _url = SERVERHOST + "/get_all?username=" + username + "&count=" + count + "&subcount=" + subCount;
      $.ajax({
        url: _url,
        dataType: "jsonp",
        jsonp: "jsonpcallback",
        scriptCharset: "utf-8",
        success: function(data) {
          that.currData = data.data;
          var arrIds = [],
            len = data.data.length;
          while(len--){
            if(data.data[len]['details']['isReaded'] == '0' || data.data[len]['details']['isReaded'] == 'undefined'){
              var l=data.data[len]['details']['items'].length;
              while(l--){
                if(data.data[len]['details']['items'][l]['status'] == '0' || typeof data.data[len]['details']['items'][l]['status'] == 'undefined'){
                  arrIds.push(data.data[len]['details']['items'][l]['id']);
                }
              }          
            }  
          }
          //删除重复ID
          $.each(arrIds,function(i,value){
            if($.inArray(value,setReadedIds)<0){
              setReadedIds.push(value);
            }
          });
          if(typeof callback == "function" && data.status == 200) {
            callback(data);
          }
        }
      });
    },

    /*
     * 【DATA】获取全部未读数据的条数
     * @param <Object>
     * @param <Object>
     */

     getNoticeCount : function(callback){
        var that = this,
          username = currUser.username,
          userinfo = currUser.userinfo,
          _url = SERVERHOST + '/get_unread_count?username=' + username;
        $.ajax({
          url : _url,
          dataType: "jsonp",
          jsonp: "jsonpcallback",
          scriptCharset: "utf-8",
          success : function(data){
            if(typeof callback == "function" && data.status == 200){
              callback(data);
            }
          }
        });
     },

    /*
     * 【DATA】设置已读
     * @param <Object>
     * @param <Object>
     */
    setReaded: function(data, callback) {
      //todo
      var that = this,
        username = currUser.username,
        userinfo = currUser.userInfo,
        arrIds = [],
        len = data.length;
      while(len--){
        if(data[len]['details']['isReaded'] == '0' || typeof data[len]['details']['isReaded'] == 'undefined'){
          var l=data[len]['details']['items'].length;
          while(l--){
            if(!data[len]['details']['items'][l]['status']){
              arrIds.push(data[len]['details']['items'][l]['id']);
            }
            
          }          
        }  
      }

      //删除重复ID
      $.each(arrIds,function(i,value){
        if($.inArray(value,setReadedIds)<0){
          setReadedIds.push(value);
        }
      });
      var ids = setReadedIds.join(',');      
      var _url = SERVERHOST + "/set_readed?username=" + username + "&ids=" + ids;
      $.ajax({
        url: _url,
        dataType: "jsonp",
        jsonp: "jsonpcallback",
        scriptCharset: "utf-8",
        success: function(data) {
          if(typeof callback == "function" && data.status == 200) {
            $.each(that.currData, function() { this["details"]["isReaded"] = 1; });
            callback && callback(data);

          }
        }
      });

    },

    /*
    * UBB转义
    */
    ubbDecode : function(content){
    var _this = this;
    content = $.trim(content);
    //if(content.length>100) content = content.slice(0,100)+'...';

      //content = this.HTMLEncode(content);

      var re = /\[code=([\w#\.]+)\]([\s\S]*?)\[\/code\]/ig;

      function replaceQuote(str) {
        var m = /\[quote=([^\]]+)]([\s\S]*)\[\/quote\]/gi.exec(str);
        if (m) {
            return str.replace(m[0], '<fieldset><legend>引用“' + m[1] + '”的评论：</legend>' + replaceQuote(m[2]) + '</fieldset>');
        } else {
            return str;
        }
      }
      var codelist = [];
      while ((mc = re.exec(content)) != null) {
          codelist.push(mc[0]);
          content = content.replace(mc[0], "--code--");
      }
      content = replaceQuote(content);
      content = content.replace(/\[reply]([\s\S]*?)\[\/reply\][\r\n]{0,2}/gi, "回复$1：");
      content = content.replace(/\[url=([^\]]+)]([\s\S]*?)\[\/url\]/gi, '<a href="$1" target="_blank">$2</a>');
      content = content.replace(/\[img(=([^\]]+))?]([\s\S]*?)\[\/img\]/gi, '<img src="$3" style="max-width:200px;max-height:100px;" border="0" title="$2" />');
      content = content.replace(/\r?\n/ig, "<br />");

      if (codelist.length > 0) {
          var re1 = /--code--/ig;
          var i = 0;
          while ((mc = re1.exec(content)) != null) {
              content = content.replace(mc[0], codelist[i]);
              i++;
          }
      }
      content = content.replace(/\[code=([\w#\.]+)\]([\s\S]*?)\[\/code\]/ig, function (m0, m1, m2) {
          if ($.trim(m2) == "") return '';
          return '<pre name="code2" class="' + m1 + '">' + _this.HTMLEncode(m2) + '</pre>';
      });
      
      content = content.replace(/(<br\s\S*>|<br>)/ig, function (m0) {
          if ($.trim(m0) == "") return '';
          //return _this.HTMLEncode(m0);
          return "&nbsp;&nbsp;";
      });
      //针对转义的"做处理
      content = content.replace(/(\\&quote\;|\&quote\;)/ig, function (m0) {
          if ($.trim(m0) == "") return '';
          //return _this.HTMLEncode(m0);
          return "";
      });
      
      
      return content;
    },
    HTMLEncode : function(str) {
      var s = "";
      if(str.length == 0) return "";
      s = str.replace(/&/g, "&amp;");
      s = s.replace(/</g, "&lt;");
      s = s.replace(/>/g, "&gt;");
      s = s.replace(/\'/g, "&#39;");
      s = s.replace(/\"/g, "&quot;");
      return s;
   }
  };

  //公开CSDN 对象
  window["csdn"] = csdn;

})(window);


(function($,window){
  if(!$){
    return ;
  }
  var script = $("#noticeScript");
  var btnId =  script.attr("btnId")||"header_notice_num";
  if(!$("#"+btnId).length){
    return false;
  }
  var instance = script.attr("instance")||"csdn_note"; 
  var wrapId =  script.attr("wrapId")||"note1";
  var count =  script.attr("count")||5;
  var basePath =  script.attr("basepath");
  var serverHost = script.attr("serverhost");
  var subCount =  script.attr("subcount")||5;
  if(instance === "csdn_note"){
    $('<div id="note1" class="csdn_note"><span class="notice_top_arrow"><span class="inner"></span></span><a href="javascript:void(0)" class="remove"></a><div class="box"></div></div>').appendTo($('body'));
  }
  $('<div class="csdn_notice_tip"><div class="tip_text">您有<strong>0</strong>条新通知</div><a href="javascript:void(0)" class="remove2"></a></div>').appendTo($('body')).hide();
  window[instance] = new csdn.note({
    btn:$("#"+btnId),
    wrap:$("#"+wrapId),
    count:count,
    subCount:subCount,
    basePath : basePath,
    cssUrl : "css/style.css",
    socketUrl : "js/socket.io.js",
    serverHost: serverHost
  });
})((typeof jQuery=="undefined")? "" :jQuery,window);
