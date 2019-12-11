//创建连接
var connection = new WebIM.connection({
  url: WebIM.config.xmppURL
});

// console.log('connection ==> ', connection);
//我的id
var myid = null;

//申请人
var applyid = null;

//保存好友花名册
var allRoster = null;

//监听
connection.listen({

  //监听用户登录
  onOpened: function (message) {
    console.log('message ==> ', message);
    console.log('登录成功');

    //获取好友列表
    connection.getRoster({

      success: function (roster) {

        //获取本地存储聊天记录
        var chatMsg = localStorage.getItem(myid);

        chatMsg = chatMsg ? JSON.parse(chatMsg) : [];
        console.log('chatMsg ==> ', chatMsg);

        //roster: 好友花名册
        // console.log('roster ==> ', roster);
        allRoster = roster;
        //both: 双方都是好友
        //to: 你是我的好友，你拉黑我
        //from: 我是你的好友，我拉黑你

        var fragment = document.createDocumentFragment();
        for (var i = 0; i < roster.length; i++) {

          //添加好友消息字段
          allRoster[i].allMsg = {};


          if (chatMsg.length == 0) {
            allRoster[i].allMsg[roster[i].name] = [];
          } else {
            for (var j = 0; j < chatMsg.length; j++) {
              //查找当前好友的聊天信息
              if (roster[i].name == chatMsg[j].name) {
                allRoster[i].allMsg[roster[i].name] = chatMsg[j].allMsg[chatMsg[j].name];
                break;
              }
            }
          }

          if (roster[i].name == WebIM.config.appkey) {
            continue;
          }


          if (roster[i].subscription == 'both' || roster[i].subscription == 'to') {
            console.log('aa');
            //创建单个好友列表
            var li = createFriedList(roster[i].name);

            fragment.appendChild(li);
          }


        }

        //将fragment添加到 ul.innerbox
        getId('innerbox').appendChild(fragment);

        //好友列表事件
        addFriendListEvent();



        //将allRoster写入到本地存储中
        localStorage.setItem(myid, JSON.stringify(allRoster));

        console.log('allRoster ppp ==> ', allRoster);

      }

    })

  },

  //监听好友申请
  onPresence: function (e) {

    //（发送者希望订阅接收者的出席信息），即别人申请加你为好友
    if (e.type === 'subscribe') {
      //若e.status中含有[resp:true],则表示为对方同意好友后反向添加自己为好友的消息，demo中发现此类消息，默认同意操作，完成双方互为好友；如果不含有[resp:true]，则表示为正常的对方请求添加自己为好友的申请消息。
      console.log('有人加你为好友');

      //写入好友申请信息
      getId('uname').textContent = e.from;

      getId('uinfo').textContent = e.status;

      //显示好友申请框
      getId('friend-apply').style.display = 'block';

      //保存申请人id
      applyid = e.from;

    } else if (e.type === 'subscribed') {
      //(发送者允许接收者接收他们的出席信息)，即别人同意你加他为好友
      console.log('别人同意你的申请');

      console.log('subscribed e ==> ', e);

      //更新我的好友列表
      var li = createFriedList(e.from);
      //将li添加到 ul.innerbox
      getId('innerbox').appendChild(li);

      //好友列表事件
      addFriendListEvent();

      //构造新加好友
      var ros = {
        jid: e.fromJid,
        groups: [],
        name: e.from,
        subscription: 'both',
        allMsg: {

        }
      };

      //初始化当前好友消息列表
      ros.allMsg[e.from] = [];

      allRoster.push(ros);

      //写入本地存储
      localStorage.setItem(myid, JSON.stringify(allRoster));
      console.log('allRoster ==> ', allRoster);

    } else if (e.type === 'unsubscribe') {
      //（发送者取消订阅另一个实体的出席信息）,即删除现有好友

    } else if (e.type === 'unsubscribed') {
      //（订阅者的请求被拒绝或以前的订阅被取消），即对方单向的删除了好友

    }
  },

  //监听文本消息
  onTextMessage: function (message) {
    console.log('消息message ==> ', message);

    //保存聊天消息
    // 获取发消息人的id
    var sendMsgId = message.from;
    for (var i = 0; i < allRoster.length; i++) {
      if (allRoster[i].name == sendMsgId) {
        //保存当前好友发送的消息
        allRoster[i].allMsg[sendMsgId].push({
          id: sendMsgId,
          msg: message.data
        })
        break;
      }
    }


    //音频提示
    audio.play();

    //如果没切换当前聊天列表，显示小红点
    var currentLi = document.querySelector('#innerbox>li[data-id="' + sendMsgId + '"]');
    if (currentLi.className != 'clearfix active') {
      //显示当前列表的小红点
      currentLi.querySelector('.point').style.display = 'block';
    } else {
      //生成别人的气泡
      var div = document.createElement('div');
      div.className = 'other clearfix';

      var str = `<div class="other-content fl clearfix">
              <div class="avatar fl">
                <img class="auto-img" src="./images/bb.jpg" alt="" />
              </div>
              <div class="fl bubble l-bubble">
                <i class="caret l-caret"></i>
                ${message.data}
              </div>
            </div>`;

      div.innerHTML = str;

      getId('chat-content').appendChild(div);
    }

    console.log('allRoster ==> ', allRoster);
    //写入本地存储
    localStorage.setItem(myid, JSON.stringify(allRoster));

  }

})


//获取id元素
function getId(id) {
  return document.getElementById(id);
}



//好友列表事件
function addFriendListEvent() {
  //好友列表事件
  var lis = document.querySelectorAll('#innerbox>li');
  var title = document.getElementsByClassName('title')[0];
  console.log('title==>',title);



  for (var i = 0; i < lis.length; i++) {
    lis[i].onclick = function () {
      // title.textContent = clearfix.dataset.id;
      if (this.className == 'clearfix active') {
        console.log('当前已是激活的');
        return;
      }

      var activeLi = document.querySelector('#innerbox>li.active');
      if (activeLi) {
        activeLi.className = 'clearfix';

      }

      this.className = 'clearfix active';
      var clearfixAct = document.getElementsByClassName('clearfix active')[0];
      console.log('clearfixAct ==>',clearfixAct);
      console.log('a ==>',clearfixAct.dataset.id);
      title.textContent = clearfixAct.dataset.id;

      getId('chat-right').style.display = 'block';

      //清空聊天内容
      getId('chat-content').innerHTML = '';

      //显示消息
      // 获取列表id
      var id = this.dataset.id;
      for (var i = 0; i < allRoster.length; i++) {
        if (allRoster[i].name == id) {
          var msgData = allRoster[i].allMsg[id];

          console.log('msgData ==> ', msgData);
          // if (msgData === undefined) {
          //   return;
          // }

          //创建一个临时文档片段，减少DOM操作次数
          var fragment = document.createDocumentFragment();

          //生成消息内容
          for (var j = 0; j < msgData.length; j++) {
            var div = document.createElement('div');
            div.className = 'other clearfix';

            var str = id == msgData[j].id ? `<div class="other-content fl clearfix">
            <div class="avatar fl">
              <img class="auto-img" src="./images/bb.jpg" alt="" />
            </div>
            <div class="fl bubble l-bubble">
              <i class="caret l-caret"></i>
              ${msgData[j].msg}
            </div>
          </div>` : `<div class="other-content fr clearfix">
          <div class="fl bubble r-bublle">
            <i class="caret r-caret"></i>
            ${msgData[j].msg}
          </div>
          <div class="avatar fl">
            <img class="auto-img" src="./images/bb.jpg" alt="" />
          </div>
        </div>`;

            div.innerHTML = str;

            fragment.appendChild(div);
          }

          getId('chat-content').appendChild(fragment);


          break;

        }
      }

      //隐藏小红点
      this.querySelector('.point').style.display = 'none';

    }
  }

}

//创建单个好友列表
function createFriedList(rosterName) {
  var li = document.createElement('li');
  li.className = 'clearfix';
  li.dataset.id = rosterName;
  var str = `<i class="line"></i>
            <div class="user-img fl">
              <img class="auto-img" src="./images/bb.jpg" alt="">
            </div>
            <div class="fl user-text">
              <div class="user-name one-text">${rosterName}</div>
              <div class="one-text"></div>
            </div><i class="point"></i>`;

  li.innerHTML = str;

  return li;
}

//获取音频元素
var audio = getId('audio');

window.onload = function () {

  //初始化表情
  function initFaces() {
    var faces = 35;
    var fragment = document.createDocumentFragment();
    for (var i = 1; i <= faces; i++) {
      var li = document.createElement('li');
      li.dataset.face = './images/face/ee_' + i + '.png';

      //创建图片对象
      var img = new Image();
      img.className = 'auto-img';
      img.src = './images/face/ee_' + i + '.png';

      li.appendChild(img);
      fragment.appendChild(li);
    }

    document.getElementsByClassName('faces')[0].appendChild(fragment);

    var facesLi = document.querySelectorAll('#ul-faces>li');
    for (var i = 0; i < facesLi.length; i++) {
      facesLi[i].onclick = function () {
        var faceUrl = this.dataset.face;
        var img = new Image();
        img.className = 'ff';
        img.src = faceUrl;
        img.style.width = '20px';
        img.style.height = '20px';

        console.log('img ==> ', img);

        getId('input-content').appendChild(img);
      }
    }
  }

  initFaces();

  //切换登录注册
  getId('gologin').onclick = function () {

    //显示登录
    getId('login-box').style.display = 'block';

    //隐藏注册
    getId('register-box').style.display = 'none';
  }

  getId('goregister').onclick = function () {
    //隐藏登录
    getId('login-box').style.display = 'none';

    //显示注册
    getId('register-box').style.display = 'block';
  }

  //注册
  getId('register').onclick = function () {

    var self = this;

    //修改按钮文本
    this.textContent = '注册中...';

    var username = getId('reguser').value;
    var pwd = getId('regpwd').value;
    var nickname = getId('regnickname').value;

    //注册用户
    connection.registerUser({

      //用户名，登录名
      username: username,

      //密码
      password: pwd,

      //匿名
      nickname: nickname,

      //应用密钥
      appKey: WebIM.config.appkey,

      //注册成功
      success: function (data) {
        console.log('data ==> ', data);

        self.textContent = '注册';

        //显示登录
        getId('login-box').style.display = 'block';

        //隐藏注册
        getId('register-box').style.display = 'none';
      },

      //注册失败
      error: function () {
        self.textContent = '注册';
      },

      //请求地址
      apiUrl: WebIM.config.apiURL
    });

  }

  //用户登录
  getId('login').onclick = function () {
    var self = this;

    //修改按钮文本
    this.textContent = '登录中...';

    var username = getId('loguser').value;
    var pwd = getId('logpwd').value;

    //用户登录
    connection.open({
      //请求地址
      apiUrl: WebIM.config.apiURL,

      //用户名
      user: username,

      //密码
      pwd: pwd,

      //应用密钥
      appKey: WebIM.config.appkey,

      //登录成功执行
      success: function (data) {
        console.log('data ==> ', data);
        this.textContent = '登录';

        //隐藏登录
        getId('login-box').style.display = 'none';

        //显示聊天面板
        getId('chat-box').style.display = 'block';

        //保存我的id
        myid = data.user.username;
      },

      //登录失败
      error: function () {
        self.textContent = '登录';
      }

    });

  }

  //显示隐藏表情
  getId('faces-icons').onclick = function () {
    var ulfaces = getId('ul-faces');
    //设置name属性标记表情元素是否显示，name = 1表示显示
    if (ulfaces.getAttribute('name') == 1) {
      ulfaces.style.display = 'none';
      ulfaces.removeAttribute('name');
    } else {
      ulfaces.setAttribute('name', 1);
      ulfaces.style.display = 'block';
    }


  }

  //添加好友
  getId('add').onclick = function () {
    getId('add-friend').style.display = 'block';
  }

  //取消添加好友
  getId('cancel').onclick = function () {
    getId('add-friend').style.display = 'none';
  }

  //确认添加好友
  getId('commit').onclick = function () {
    getId('add-friend').style.display = 'none';

    var userid = getId('userid').value;

    //添加好友申请
    connection.subscribe({
      to: userid,
      // Demo里面接收方没有展现出来这个message，在status字段里面
      message: '膜拜你很久了，我是你的黑粉'
    });
  }

  //同意好友申请
  getId('agree').onclick = function () {

    //同意好友申请
    connection.subscribed({
      to: applyid,
      message: '[resp:true]'
    });

    getId('friend-apply').style.display = 'none';


  }

  //发送消息
  function sendmassage() {
    var textElem = getId('input-content');

    var sendMsg = textElem.innerHTML;

    console.log('sendMsg ==> ', sendMsg);

    //获取接收消息的用户id
    var userid = document.querySelector('#innerbox>li.active').dataset.id;

    var id = connection.getUniqueId(); // 生成本地消息id
    var msg = new WebIM.message('txt', id); // 创建文本消息
    msg.set({
      msg: sendMsg, // 消息内容
      to: userid, // 接收消息对象（用户id）
      roomType: false,
      success: function (id, serverMsgId) {
        console.log('发送消息成功');

        //清除输入文本内容
        textElem.innerHTML = '';

        //创建我的气泡
        var div = document.createElement('div');
        div.className = 'other clearfix';

        var str = `<div class="other-content fr clearfix">
        <div class="fl bubble r-bublle">
          <i class="caret r-caret"></i>
          ${sendMsg}
        </div>
        <div class="avatar fl">
          <img class="auto-img" src="./images/bb.jpg" alt="" />
        </div>
      </div>`;

        div.innerHTML = str;

        getId('chat-content').appendChild(div);

        //保存自己发送的消息
        for (var i = 0; i < allRoster.length; i++) {
          if (allRoster[i].name == userid) {
            console.log('执行');
            allRoster[i].allMsg[userid].push({
              id: myid,
              msg: sendMsg
            });
            break;
          }
        }

        //写入本地存储
        localStorage.setItem(myid, JSON.stringify(allRoster));

        console.log('allRoster 发送消息==> ', allRoster);

      },
      error: function () {
        console.log('发送消息失败');
      }
    });

    //单聊：singleChat
    msg.body.chatType = 'singleChat';

    //发送消息
    connection.send(msg.body);
  }

  // 点击发送信息
  getId('send').onclick = function () {
    sendmassage();
  }

  // 回车发送事件：
  getId('input-content').onkeydown = function (event) {
    var e = event || window.event;
    if (e && e.keyCode == 13) {
      sendmassage();
    }
  }
}
