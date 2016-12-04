var Common = require('JoystickCommon');

cc.Class({
    extends: cc.Component,

    properties: {
        stick: {
            default: null,
            type: cc.Node,
            displayName: '摇杆节点',
        },

        _joyCom: {
            default: null,
            displayName: 'joy Node',

        },
        _playerNode: {
            default: null,
            displayName: '被操作的目标Node',
        },

        _angle: {
            default: null,
            displayName: '当前触摸的角度',

        },
       
        _radian: {
            default: null,
            displayName: '弧度',
        },      


        _speed: 0,          //实际速度
        _speed1: 1,         //一段速度
        _speed2: 2,         //二段速度
        _opacity: 0,        //透明度
    },


    onLoad: function()
    {
        //对圆圈的触摸监听
        this._initTouchEvent();
        // joy下的Game组件
        this._joyCom = this.node.parent.getComponent('Game');
        // game组件下的player节点
        this._playerNode = this._joyCom.sprite;
    },


    //对圆圈的触摸监听
    _initTouchEvent: function()
    {
        var self = this;
        self.node.on(cc.Node.EventType.TOUCH_START, function (event) {
            // 获取触摸位置的世界坐标转换成圆圈的相对坐标（以圆圈的锚点为基准）
            var touchPos = self.node.convertToNodeSpaceAR(event.getLocation());
            //触摸点与圆圈中心的距离
            var distance = self._getDistance(touchPos,cc.p(0,0));
            //圆圈半径
            var radius = self.node.width / 2;
             //手指在圆圈内触摸,控杆跟随触摸点
            if(radius > distance)
            {
                cc.log(touchPos);
                self.stick.setPosition(touchPos);   
                return true;
            }
            return false;
        }, self);

        self.node.on(cc.Node.EventType.TOUCH_MOVE, function (event) {
            var touchPos = self.node.convertToNodeSpaceAR(event.getLocation());
            var distance = self._getDistance(touchPos,cc.p(0,0));
            var radius = self.node.width / 2;
            if(radius > distance)
            {
                self.stick.setPosition(touchPos);
            }
            else
            {
                //控杆永远保持在圈内，并在圈内跟随触摸更新角度
                //cc.log(self.node.getPosition());
                var x = self.node.getPositionX() + Math.cos(self._getRadian(touchPos)) * radius;
                var y = self.node.getPositionY() + Math.sin(self._getRadian(touchPos)) * radius;
                self.stick.setPosition(cc.p(x, y));
            }
            //更新角度
            this._getAngle(touchPos);
            //设置实际速度
            this._setSpeed(touchPos);
        }, self);

        // 触摸在圆圈内离开或在圆圈外离开后，摇杆归位，player速度为0
        self.node.on(cc.Node.EventType.TOUCH_END, function (event) {
            self.stick.setPosition(self.node.getPosition());
            self._speed = 0;
        }, self);
        self.node.on(cc.Node.EventType.TOUCH_CANCEL, function (event) {
            self.stick.setPosition(self.node.getPosition());
            self._speed = 0;
        }, self);
    },

    //更新移动目标
    update: function(dt)
    {
        switch (this._joyCom.directionType)
        {
            case Common.DirectionType.ALL:   
                this._allDirectionsMove();
                break;
            default :
                break;
        }
    },
     //全方向移动
    _allDirectionsMove: function()
    {
        this._playerNode.x += Math.cos(this._angle * (Math.PI/180)) * this._speed;
        this._playerNode.y += Math.sin(this._angle * (Math.PI/180)) * this._speed;
    },

     //计算两点间的距离并返回
    _getDistance: function(pos1, pos2)
    {
        return Math.sqrt(Math.pow(pos1.x - pos2.x, 2) +
        Math.pow(pos1.y - pos2.y, 2));
    },

     //计算弧度并返回
    _getRadian: function(point)
    {
        this._radian = Math.PI / 180 * this._getAngle(point);
        return this._radian;
    },

    //计算角度并返回
    _getAngle: function(point)
    {
        
        var pos = this.node.getPosition();
        this._angle = Math.atan2(point.y - pos.y, point.x - pos.x) * (180/Math.PI);
        cc.log(pos);
        cc.log(Math.atan2(point.y - pos.y, point.x - pos.x));
        return this._angle;
    },

     //设置实际速度
    _setSpeed: function(point)
    {
        //触摸点和遥控杆中心的距离
        var distance = this._getDistance(point, this.node.getPosition());

        //如果半径
        if(distance < this._radius)
        {
            this._speed = this._speed1;
        }
        else
        {
            this._speed = this._speed2;
        }
    },

});
