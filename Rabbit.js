function GRabbit(){
	//画笔对象
	this.ctx = null;
	//运行帧的返回值,通过他可以暂停运行
	this.raf = null;
	//返回一个canvas
	this.canvas = document.createElement("canvas");
	var self = this;
	//创建一个舞台
	this.Stage = function(Pro){
		this.width = Pro.width || 0;
		this.height = Pro.height || 0;
		self.canvas.width = this.width;
		self.canvas.height = this.height;
		//拿取画笔
		self.ctx = self.canvas.getContext('2d');
		//添加到页面
		document.body.appendChild(self.canvas);
	}
	//全部的底层库，是私有属性，外界无法调用
	//底层链表
	var List = function(){
		this.herd = {};
		this.foot = {};
		this.herd.next = this.foot;
		this.foot.last = this.herd;
		//添加新元素方式
		this.push = function(obj){
			//更改对象与前元素的关系
			this.foot.last.next = obj;
			obj.last = this.foot.last;
			//更改对象与后元素的关系
			obj.next = this.foot;
			this.foot.last = obj;
			//为元素添加一个删除自身的方法
			obj.remove = function(){
				obj.last.next = obj.next;
				obj.next.last = obj.last;
			}
		}
		//遍历方式
		this.forEach = function(fun){
			var obj = this.herd.next;
			while(obj.next!=null){
				fun(obj);
				obj = obj.next;
			}
		}
		//清空数据链表
		this.remoteAll = function(){
			this.herd.next = this.foot;
			this.foot.last = this.herd;
		}
	}
	//底层绘制矩形
	var drawReck = function(x, y, width, height, color){
	    self.ctx.beginPath();
	    self.ctx.moveTo(x, y);
	    self.ctx.lineTo(x, y+height);
	    self.ctx.lineTo(x+width, y+height);
	    self.ctx.lineTo(x+width, y);
	    self.ctx.lineTo(x, y);
	    self.ctx.strokeStyle = color || "rgb(0,0,0)";
	    self.ctx.closePath();
	    self.ctx.stroke();
	}
	//底层绘制圆形
	var drawCircle = function(x,y,r,color){
		self.ctx.beginPath();
		self.ctx.arc(x,y,r,0,Math.PI*2,true);
		self.ctx.closePath();
		self.ctx.fillStyle = color;
		self.ctx.fill();
	}
	//精灵族
	this.spititList = new List();
	//手势开始点击
	this.touchstartList = new List();
	//手势滑动
	this.touchmoveList = new List();
	//手势离开屏幕
	this.touchendList = new List();
	//添加自定义事件
	this.addEventListener = function(eventType,fun){
		//事件类型
		//touchstart touchmove touchend
		var obj = new function(){};
		obj.eventShow = fun;
		self[eventType+"List"].push(obj);
	};
	//注册一个组件自定义的事件，拖动事件
	this.onDrag = function(spitit){
		spitit.$NX = 0;
		spitit.$NY = 0;
		self.addEventListener("touchstart",function(e){
			spitit.$NX = e.touches[0].pageX - spitit.x;
			spitit.$NY = e.touches[0].pageY - spitit.y;
		});
		self.addEventListener("touchmove",function(e){
			spitit.x = e.touches[0].pageX - spitit.$NX;
			spitit.y = e.touches[0].pageY - spitit.$NY;
		});
		self.addEventListener("touchend",function(e){
			spitit.$NX = 0;
			spitit.$NY = 0;
		});
	}
	//事件管理机制
	self.canvas.ontouchstart = function(e){
		self.touchstartList.forEach(function(val){
			val.eventShow(e);
		});
		event.preventDefault();  
	}
	self.canvas.ontouchmove = function(e){
		self.touchmoveList.forEach(function(val){
			val.eventShow(e);
		});
		event.preventDefault();  
	}
	self.canvas,ontouchend = function(e){
		self.touchendList.forEach(function(val){
			val.eventShow(e);
		});
		event.preventDefault();  
	}
	//基础精灵
	this.Spitit = function(Pro){
		//精灵的坐标
		this.x = Pro.x || 0;
		this.y = Pro.y || 0;
		//精灵类型
		this.type = Pro.type || "RECK";
		//精灵颜色
		this.color = Pro.color || "rgb(0,0,0)";
		//绘制精灵
		this.init = function(){}
		switch(this.type){
			//类型为矩形时进行矩形属性记录
			case "RECK":{
				this.width = Pro.width || 0;
				this.height = Pro.height || 0;
				this.init = function(){
					drawReck(this.x,this.y,this.width,this.height,this.color);
				}
				break;
			}
			//类型为圆进行圆形属性记录
			case "CIRCLE":{
				this.r = Pro.r||0;
				this.init = function(){
					drawCircle(this.x,this.y,this.r,this.color);
				}
				break;
			}
		}
		//每次动画重绘进行的方法
		this.onUpdata = function(){}
		//默认精灵活动
		this.action = function(){
			this.onUpdata();
			this.init();
		}
	}
	this.ImgSpitit = function(Pro){
		//精灵的坐标
		this.x = Pro.x || 0;
		this.y = Pro.y || 0;
		this.width = Pro.width || 0;
		this.height = Pro.height || 0;
//		this.px = Pro.px || undefined;
//		this.py = Pro.py || undefined;
//		this.pwidth = Pro.pwidth || undefined;
//		this.pheight = Pro.pheight || undefined;
		this.img = Pro.img||null;
		this.imgObj = new Image();
		this.imgObj.src = this.img;
		//绘制精灵
		this.init = function(){
			self.ctx.drawImage(this.imgObj,this.x-this.width/2,this.y-this.height/2,this.width,this.height);
			drawReck(this.x-this.width/2,this.y-this.height/2,this.width,this.height);
		}
		//每次动画重绘进行的方法
		this.onUpdata = function(){}
		//默认精灵活动
		this.action = function(){
			this.onUpdata();
			this.init();
		}
	}
	//游戏主时间轴
	this.MainTime = function(){
		//帧运行
		function draw(){
			//清除画布
			self.ctx.clearRect(0,0,self.canvas.width,self.canvas.height)
			//运行所有精灵族中的精灵行为
			self.spititList.forEach(function(val){
				val.action();
			});
			self.raf=window.requestAnimationFrame(draw);
		}
		//运行主时间轴
		this.start = function(){
			//初始化所有精灵族中的精灵
			self.spititList.forEach(function(val){
				val.init();
			});
			draw();	
		}
	}
}
var GRbit = new GRabbit();
