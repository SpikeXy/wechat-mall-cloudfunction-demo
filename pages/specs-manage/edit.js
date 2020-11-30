const app = getApp();
Page({
  data: {
    name:"",
    _id:"",
    spaceInnerClass:""
  },
  onLoad: function (options) {
    var that = this;
    var _id = options.id
    this.setData({
      _id:_id
    })
    var isSupport = !!wx.getMenuButtonBoundingClientRect;
      //动态设置高度
      wx.getSystemInfo({
        success: function success(res) {
            that.setData({
              spaceInnerClass: isSupport ? 'height:' + (res.windowHeight - 210 ) + 'px' : 'width:400px',
            });
        }
    });


    wx.cloud.callFunction({
      name: 'GetItemById',
      data: {
        collectionName:"specs",
        id:_id
      }
    }).then(res=>{
      that.setData({
        name: res.result.name
      });
    
      var factor = {
          parentId:_id
      }

      wx.cloud.callFunction({
        name: 'GetItemByFactor',
        data:  {
          collectionName: "specsModel",
          factor:factor
        }
      }).then(subRes=>{

        that.setData({
          subSpecs: subRes.result
        });
        
      })
    })

  },
  addSubSpecs(e){
    var id= e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/specs-manage/subAdd?id='+ id ,
    })
  },
  submitSpecs(){
    var updateEntity = {
      name:this.data.name
    }
    wx.cloud.callFunction({
      name: 'EditItem',
      data: {
        item:updateEntity,
        _id : this.data._id,
        collectionName:"specsModel"
      }
    }).then(res=>{
      wx.navigateBack({
        delta: 0,
      })
    })
  },
  nameInputChange(e){
    let that = this;
    if (e.detail.value.length >= 1) {
      that.setData({
        name: e.detail.value,
      })
    }
  },
  deleteSpecs(e){
    wx.cloud.callFunction({
      name: 'DeleteItemById',
      data: {
        _id: this.data._id,
        collectionName:"specs"
      }
    }).then(res => {
      wx.reLaunch({
        url: '/pages/specs-manage/index'
      })
    })
  }
})