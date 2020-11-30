const AUTH = require('../../utils/auth')
Page({
  data: {
    //商品id
    tempId: '',
    //商品名称
    name: "",
    //原价
    originalPrice: undefined,
    //售价
    minPrice: undefined,
    //最多可使用券的数量
    //maxCoupons: 0,
    //商品分类
    categoryId: 1,
    //商品规格
    specs: [],
    //已经有的商品规格
    specsModels: [],
    //商品图片
    pic: [],
    //商品状态  上架/库存
    status: 1,
    //库存数量
    stores: undefined,
    //长
    spaceX: 0,
    //宽
    spaceY: 0,
    //高
    spaceZ: 0,
    //重量
    weight: 0,
    //图片文件列表
    fileList: [],
    //图片内容文件列表
    fileContentList: [],
    //商品类型数组
    goodStatusOption: [{
        text: '上架',
        value: 1
      },
      {
        text: '库存',
        value: 2
      },
    ],
    recommendStatus: 0,
    //商品是否推荐
    recommendStatusOption: [{
        text: '否',
        value: 0
      },
      {
        text: '是',
        value: 1
      },
    ],
    //商品分类下拉数组
    goodCategoryOptions: []
  },

  nameInputChange(e) {
    let that = this;
    if (e.detail.value.length >= 1) {
      that.setData({
        name: e.detail.value,
      })
    }
  },
  originalPriceInputChange(e) {
    let that = this;
    if (e.detail.value.length >= 1) {
      that.setData({
        originalPrice: e.detail.value,
      })
    }
  },
  minPriceInputChange(e) {
    let that = this;
    if (e.detail.value.length >= 1) {
      that.setData({
        minPrice: e.detail.value,
      })
    }
  },
  storesInputChange(e) {
    let that = this;
    if (e.detail.value.length >= 1) {
      that.setData({
        stores: e.detail.value,
      })
    }
  },
  //选择分类点击
  changeCategoryClick(e) {
    let id = e.currentTarget.dataset.id
    let tempArr = this.data.goodCategoryOptions
    tempArr.forEach(ele => {
      if (ele.value == id) {
        ele.checked = !ele.checked
      }
    })
    this.setData({
      goodCategoryOptions: tempArr
    })
  },
  spaceXInputChange(e) {
    let that = this;
    if (e.detail.value.length >= 1) {
      that.setData({
        spaceX: e.detail.value,
      })
    }
  },
  spaceYInputChange(e) {
    let that = this;
    if (e.detail.value.length >= 1) {
      that.setData({
        spaceY: e.detail.value,
      })
    }
  },
  spaceZInputChange(e) {
    let that = this;
    if (e.detail.value.length >= 1) {
      that.setData({
        spaceZ: e.detail.value,
      })
    }
  },
  weightInputChange(e) {
    let that = this;
    if (e.detail.value.length >= 1) {
      that.setData({
        weight: e.detail.value,
      })
    }
  },
  changeStatus(e) {
    this.setData({
      status: e.detail
    })
  },
  changeCategory(e) {
    this.setData({
      categoryId: e.detail
    })
  },
  //提交表单
  async bindSubmit(e) {
    if (this.data.name == '' || this.data.name == undefined || this.data.name == NaN) {
      wx.showToast({
        title: '请填写商品名称',
        icon: 'none'
      })
      return
    }
    if (this.data.originalPrice == '' || this.data.originalPrice == undefined || this.data.originalPrice == NaN) {
      wx.showToast({
        title: '请填写原价',
        icon: 'none'
      })
      return
    }
    if (this.data.minPrice == '' || this.data.minPrice == undefined || this.data.minPrice == NaN) {
      wx.showToast({
        title: '请填写售价',
        icon: 'none'
      })
      return
    }
    if (this.data.stores == '' || this.data.stores == undefined || this.data.stores == NaN) {
      wx.showToast({
        title: '请填库存数量',
        icon: 'none'
      })
      return
    }
    if (this.data.fileList == [] || this.data.fileList.length == 0) {
      wx.showToast({
        title: '请上传商品图片',
        icon: 'none'
      })
      return
    }
    let picArray = []
    this.data.fileList.forEach(element => {
      picArray.push(element.url)
    })
    let contentArray = []
    this.data.fileContentList.forEach(element => {
      contentArray.push(element.url)
    })
    let specsModelArray = []
    this.data.specs.forEach(element => {
      element.subSpecs.forEach(ele => {
        if (ele.active) {
          specsModelArray.push(ele._id)
        }
      })
    })
    var updateEntity = {

      name: this.data.name,
      originalPrice: parseInt(this.data.originalPrice),
      minPrice: parseInt(this.data.minPrice),
      categoryId: this.data.categoryId,
      status: this.data.status,
      stores: parseInt(this.data.stores),
      spaceX: parseFloat(this.data.spaceX),
      spaceY: parseFloat(this.data.spaceY),
      spaceZ: parseFloat(this.data.spaceZ),
      weight: parseFloat(this.data.weight),
      pic: picArray,
      content: contentArray,
      specsModels: specsModelArray,
      recommandChecked: parseInt(this.data.recommendStatus) == 1 ? true : false,
      dateAdd: Date.parse(new Date()),
      dateUpdate: Date.parse(new Date())
    }
    wx.cloud.callFunction({
      name: 'EditItem',
      data: {
        _id: this.data.tempId,
        item: updateEntity,
        collectionName: "good"
      }
    }).then(res => {
      wx.showToast({
        title: '编辑成功',
        icon: 'success',
        success: function () {
          wx.navigateBack()
        }
      })
    })


  },
  async onLoad(e) {
    //初始化
    var _this = this
    var _id = e.id
    this.setData({
      tempId: _id
    })
    let categories = [];
    //初始化分类
    wx.cloud.callFunction({
      name: 'GetCollection',
      data: {
        collectionName: "category"
      }
    }).then(res => {
      const _categories = res.result.filter(ele => {
        return ele.level == 1
      })
      categories = categories.concat(_categories);
      var categoryArray = []
      for (let i = 0; i < categories.length; i++) {
        let item = categories[i];
        categoryArray.push({
          text: item.name,
          value: item.id,
          icon: item.icon,
          checked: false
        })
      }
      _this.setData({
        goodCategoryOptions: categoryArray
      })
    })

    //获取规格参数
    let specs = []
    await wx.cloud.callFunction({
      name: 'GetCollection',
      data: {
        collectionName: "specs"
      }
    }).then(res => {
      specs = res.result
    })
    //获取子规格参数
    let subSpecs = []
    await wx.cloud.callFunction({
      name: 'GetCollection',
      data: {
        collectionName: "specsModel"
      }
    }).then(res => {
      subSpecs = res.result
    })
    if (specs != [] && specs != undefined && specs.length > 0) {
      specs.forEach(element => {
        if (element.subSpecs == undefined || element.subSpecs == null || element.subSpecs == NaN) {
          element.subSpecs = []
        }
        var parentId = element._id
        subSpecs.forEach(ele2 => {
          if (parentId == ele2.parentId) {

            if (_this.data.specsModels != [] && _this.data.specsModels != undefined && _this.data.specsModels.length > 0 && _this.data.specsModels.indexOf(ele2._id) > -1) {
              ele2.active = true;
            } else {
              ele2.active = false;
            }
            element.subSpecs.push(ele2);
          }
        })
      })
    }
    this.setData({
      specs: specs
    })


    //初始化内容数据
    wx.cloud.callFunction({
      name: 'GetItemById',
      data: {
        id: this.data.tempId,
        collectionName: "good",
      }
    }).then(res => {
      var obj = res.result

      _this.setData({
        name: obj.name,
        originalPrice: obj.originalPrice,
        minPrice: obj.minPrice,
        categoryId: obj.categoryId,
        pic: obj.pic,
        stores: obj.stores,
        spaceX: obj.spaceX,
        spaceY: obj.spaceY,
        spaceZ: obj.spaceZ,
        weight: obj.weight,
        status: obj.status,
        stores: obj.stores,
        content: obj.content,
        specsModels: obj.specsModels
      })
      if (obj.pic != null && obj.pic != undefined && obj.pic.length > 0) {
        obj.pic.forEach(element => {
          var imageFileTemp = {}
          imageFileTemp.url = element
          const path = element;
          const fileNameTemp = path.substr(String(path).lastIndexOf('/') + 1)
          const fileSuffix = fileNameTemp.substr(fileNameTemp.lastIndexOf('.'))
          const dateTimeFileName = "good-image/" + (new Date().getFullYear()) + (new Date().getMonth()) + (new Date().getDay()) + String(parseInt(Math.random() * 1000000000)) + fileSuffix
          imageFileTemp.name = dateTimeFileName
          imageFileTemp.isImage = true
          imageFileTemp.deletable = true
          _this.data.fileList.push(imageFileTemp);
        })
        _this.setData({
          fileList: _this.data.fileList
        });
      }
      if (obj.content != null && obj.content != undefined && obj.content.length > 0) {
        obj.content.forEach(element => {
          var imageFileTemp = {}
          imageFileTemp.url = element
          const path = element;
          const fileNameTemp = path.substr(String(path).lastIndexOf('/') + 1)
          const fileSuffix = fileNameTemp.substr(fileNameTemp.lastIndexOf('.'))
          const dateTimeFileName = "good-image/" + (new Date().getFullYear()) + (new Date().getMonth()) + (new Date().getDay()) + String(parseInt(Math.random() * 1000000000)) + fileSuffix
          imageFileTemp.name = dateTimeFileName
          imageFileTemp.isImage = true
          imageFileTemp.deletable = true
          _this.data.fileContentList.push(imageFileTemp);
        })
        _this.setData({
          fileContentList: _this.data.fileContentList
        });
      }
    })
  },

  onShow() {

  },
  afterRead(event) {
    const {
      file
    } = event.detail;
    // 当设置 mutiple 为 true 时, file 为数组格式，否则为对象格式
    const path = file.path;
    const fileNameTemp = path.substr(String(path).lastIndexOf('/') + 1)
    const fileSuffix = fileNameTemp.substr(fileNameTemp.lastIndexOf('.'))
    const dateTimeFileName = "good-image/" + (new Date().getFullYear()) + (new Date().getMonth()) + (new Date().getDay()) + String(parseInt(Math.random() * 1000000000)) + fileSuffix

    var _this = this
    wx.cloud.uploadFile({
      cloudPath: dateTimeFileName,
      filePath: file.path, // 文件路径
    }).then(res => {
      var imageFileTemp = {}
      imageFileTemp.url = res.fileID
      imageFileTemp.name = dateTimeFileName
      imageFileTemp.isImage = true
      imageFileTemp.deletable = true

      _this.data.fileList.push(imageFileTemp);
      // 上传完成需要更新 fileList
      _this.setData({
        fileList: _this.data.fileList
      });

    }).catch(error => {
      // handle error
    })

  },
  delete(e) {
    var fileId = e.detail.file.url
    wx.cloud.deleteFile({
      fileList: [fileId]
    })
    //删除云存储中的文件
    var index = e.detail.index
    //删除页面中的数据
    let fileArray = this.data.fileList
    fileArray.splice(index, 1)
    this.setData({
      fileList: fileArray
    })
  },
  afterContentRead(event) {
    const {
      file
    } = event.detail;
    // 当设置 mutiple 为 true 时, file 为数组格式，否则为对象格式
    const path = file.path;
    const fileNameTemp = path.substr(String(path).lastIndexOf('/') + 1)
    const fileSuffix = fileNameTemp.substr(fileNameTemp.lastIndexOf('.'))
    const dateTimeFileName = "good-image/" + (new Date().getFullYear()) + (new Date().getMonth()) + (new Date().getDay()) + String(parseInt(Math.random() * 1000000000)) + fileSuffix

    var _this = this
    wx.cloud.uploadFile({
      cloudPath: dateTimeFileName,
      filePath: file.path, // 文件路径
    }).then(res => {
      var imageFileTemp = {}
      imageFileTemp.url = res.fileID
      imageFileTemp.name = dateTimeFileName
      imageFileTemp.isImage = true
      imageFileTemp.deletable = true
      _this.data.fileContentList.push(imageFileTemp);
      // 上传完成需要更新 fileList
      _this.setData({
        fileContentList: _this.data.fileContentList
      });

    }).catch(error => {
      // handle error
    })

  },
  deleteContent(e) {
    var fileId = e.detail.file.url
    wx.cloud.deleteFile({
      fileContentList: [fileId]
    })
    //删除云存储中的文件
    var index = e.detail.index
    //删除页面中的数据
    let fileArray = this.data.fileContentList
    fileArray.splice(index, 1)
    this.setData({
      fileContentList: fileArray
    })
  },
  labelItemTap(event) {
    const _subId = event.currentTarget.dataset.subspecid
    const _specId = event.currentTarget.dataset.specid
    let spescTemp = this.data.specs
    spescTemp.forEach(element => {
      if (element._id == _specId) {
        element.subSpecs.forEach(ele2 => {
          if (_subId == ele2._id) {
            ele2.active = !ele2.active;
          }
        })
      }
      this.setData({
        specs: spescTemp
      })
    })
  }
})