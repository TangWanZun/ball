//https://my.oschina.net/u/1253039/blog/193752
function GRabbit(){
	this.$roll = 1;
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
		this.scaleX = Pro.scaleX || 1;
		this.scaleY = Pro.scaleY || 1;
		self.canvas.width = this.width;
		self.canvas.height = this.height;
		self.canvas.style.transform = "scale("+this.scaleX+","+this.scaleY+")";
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
		this.length = 0;
		this.herd.next = this.foot;
		this.foot.last = this.herd;
		//添加新元素方式
		this.push = function(obj){
			//记录链表长度
			this.length++;
			var $list = this; 
			//更改对象与前元素的关系
			this.foot.last.next = obj;
			obj.last = this.foot.last;
			//更改对象与后元素的关系
			obj.next = this.foot;
			this.foot.last = obj;
			//为元素添加一个删除自身的方法
			obj.remove = function(){
				//记录链表长度
				$list.length--;
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
	//单独的碰撞渲染
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
	self.canvas.ontouchend = function(e){
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
		this.onUpdata = Pro.onUpdata || function(){}
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
		this.px = Pro.px || 0;
		this.py = Pro.py || 0;
		this.pwidth = Pro.pwidth || undefined;
		this.pheight = Pro.pheight || undefined;
		this.imgObj = Pro.imgObj||(function(){console.error("图片未加载完成")})();
		//绘制精灵
		this.init = function(){
			self.ctx.drawImage(this.imgObj,this.px,this.py,this.pwidth,this.pheight,this.x-this.width/2,this.y-this.height/2,this.width,this.height);
			//drawReck(this.x-this.width/2,this.y-this.height/2,this.width,this.height,"rgb(255,255,255)");
		}
		//每次动画重绘进行的方法
		this.onUpdata = Pro.onUpdata || function(){}
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
			self.$roll++;
			if(self.$roll>100){self.$roll = 1;}
			//清除画布
//			ctx.fillStyle = "rgb(255,255,255)";
//			ctx.fillRect(0,0,self.canvas.width,self.canvas.height);
			self.ctx.clearRect(0,0,self.canvas.width,self.canvas.height);
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
	//街机碰撞
	var ArcadeCrashObject = function(){
		//创建街机舞台
		this.stage = [];
		//碰撞对象集
		this.crachArr = [];
		//添加碰撞对象
		this.addCrash = function(imgSpitit,name,him){//需要添加一个图片精灵的实例
			//创建一个临时的canvas，用来存放一个游戏对象的画面
			var arcadeCanvas = document.createElement("canvas");
			var arcadeCtx = arcadeCanvas.getContext("2d");
			arcadeCanvas.width = imgSpitit.width;
			arcadeCanvas.height = imgSpitit.height;
			arcadeCtx.drawImage(imgSpitit.imgObj,imgSpitit.px,imgSpitit.py,imgSpitit.pwidth,imgSpitit.pheight,0,0,imgSpitit.width,imgSpitit.height);
			//提取游戏对象中，透明处和不透明处，用来进行碰撞测试
			var stageObjData = arcadeCtx.getImageData(0,0,imgSpitit.width,imgSpitit.height).data;
			var stageObj = {
				index:this.crachArr.length,
				name:name,
				"imgSpitit":imgSpitit,
				plane:[],
				"him":him
			};
			//判断每个像素点，当像素点为不透明的时候，此处有碰撞体，当像素点透明度小于250时，为不碰撞体
			for(var i = 0; i < imgSpitit.width * imgSpitit.height; i ++){
			    var dot = i * 4;
			    if(stageObjData[dot] > 0||stageObjData[dot+1] > 0||stageObjData[dot+2] > 0){
			        stageObj.plane[i] = 1;
			    }else{
			        stageObj.plane[i] = 0;
			    }
			}
			this.crachArr.push(stageObj);
		}
		//初始化街机舞台
		this.init = function(){
			var i = 0;
			var n = self.canvas.width * self.canvas.height;
			for(i = 0; i < n; i ++){
	            this.stage[i] = 0;
	        }
		}
		this.canvas2 = document.getElementById("canvas2");
		this.stt = this.canvas2.getContext("2d");
		this.imgData_data = this.stt.getImageData(0,0,400,700);
		//往街机舞台中进行绘制所有对象
		this.action = function(){
			var that = this;
			this.init();
			//将所有成员的像素，写入数组中
			this.crachArr.forEach(function(val){
				var i = 0,
			        j = 0;
			        y = parseInt(val.imgSpitit.y);
			        x = parseInt(val.imgSpitit.x);
			    for(j = 0 ;j<val.imgSpitit.height;j++){
			    	for(i=0;i<val.imgSpitit.width;i++){
			    		n = (j+y-val.imgSpitit.height/2)*self.canvas.width+(i+x-val.imgSpitit.width/2);
			    		//像素表中的位置是不是为1
			    		if(val.plane[j*val.imgSpitit.width+i]==1){
			    			switch(that.stage[n]){
			    				//当大地图数据为0的时候，可以进行放置
			    				case 0:{
			    					that.stage[n] = val.name;
			    					break;
			    				}
			    				//为非0的时候，此处有像素点被占用
			    				default:{
			    					if(typeof val.him[that.stage[n]]=="function"){
			    						that.stage[n]=val.him[that.stage[n]]();
			    					}
			    					break;
			    				}
			    			}
			    		}
			    	}
			    }
			});
			var imgData_data = this.stt.createImageData(self.canvas.width,self.canvas.height);
			var i = 0,
		        j = 0;
		    for(i = 0,j = 0;i<self.canvas.width * self.canvas.height;i++,j+=4){
		    	switch(this.stage[i]){
		    		case 0:
		                this.imgData_data.data[j] = 0;
		                this.imgData_data.data[j + 1] = 0;
		                this.imgData_data.data[j + 2] = 0;
		                this.imgData_data.data[j + 3] = 255;
		                break;
		            case 1:
		                this.imgData_data.data[j] = 0;
		                this.imgData_data.data[j + 1] = 0;
		                this.imgData_data.data[j + 2] = 255;
		                this.imgData_data.data[j + 3] = 255;
		                break;
		            default:
		                this.imgData_data.data[j] = 255;
		                this.imgData_data.data[j + 1] = 0;
		                this.imgData_data.data[j + 2] = 0;
		                this.imgData_data.data[j + 3] = 255;
		                break;
	        	}
		    }
			this.stt.putImageData(this.imgData_data,0,0);
		}
		//启动街机舞台
		this.start = function(){
			self.spititList.push(self.ArcadeCrash);
		}
	}
	this.ArcadeCrash = new ArcadeCrashObject();
}
var GRbit = new GRabbit();
