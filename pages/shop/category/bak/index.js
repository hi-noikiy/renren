var t = getApp(), e = t.requirejs("core"), i = t.requirejs("foxui"),a = (t.requirejs("icons"), t.requirejs("jquery"));

Page({
  data: {
    loaded: false,
    city: t.globalData.city,
    category: {},
    navBars: [],
    carrentNavbar: 0,
    leftNavs: [],
    currentLeftNav: 0,
    currentTab: 0,
    cates: [],
    allBrands: {},
    brands: [],
    cateIdSelected: '',
    brandIdSelected: '',
    cate: '',
    goods: [],
    loading: 1
	},
  submit: function (e) {
    var cateId = this.data.cateIdSelected;
    var brandId = this.data.brandIdSelected;
    wx.navigateTo({
      url: '/pages/goods/index/index'+'?cate='+cateId+'&brand='+brandId,
    })
  },
	showCategory : function () {
		var t = this;
		e.get("shop/get_category", {}, function (e) {
       t.setData({
         category: e.category,
         navBars: e.category,
         allBrands: e.brands,
         loaded: true,
       })
       t.tapNavBar();
		})
	},
  tapNavBar: function(e){
    var t = this;
    var currentNavBar = (e && e.currentTarget && e.currentTarget.dataset.id);
    if(currentNavBar === undefined) {
      currentNavBar = 0;
    }
    var category = t.data.category;
    var navBars = category;
    var leftNavs = navBars[currentNavBar].child;
    var currentLeftNav = 0;
    var cates = leftNavs[currentLeftNav].child;
    t.setData({
      leftNavs: leftNavs,
      cates: cates,
      currentNavBar: currentNavBar,
      currentLeftNav: currentLeftNav,
      currentTab: 0,
      cateIdSelected: '',
      brandIdSelected: '',
      cate: leftNavs[currentLeftNav].id,
    })
    t.showGoods();
  }, 
  tapLeftNav: function (e) {
    var t = this;
    var currentNavBar = t.data.currentNavBar;
    var currentLeftNav = (e && e.currentTarget && e.currentTarget.dataset.id) || 0;
    var category = t.data.category;
    var navBars = category;
    var leftNavs = navBars[currentNavBar].child;
    var cates = leftNavs[currentLeftNav].child; 
    t.setData({
      cates: cates,
      currentLeftNav: currentLeftNav,
      currentTab: 0,
      cateIdSelected: '',
      brandIdSelected: '',
      cate: leftNavs[currentLeftNav].id,
    })
    t.showGoods();
  },
  tapTab: function(e) {
    var index = e.currentTarget.dataset.index;
    var currentTab = this.data.currentTab;
    if(currentTab == index){
      index = 0;
    }
    this.setData({
      currentTab: index
    })
  },
  tapCate:function (e) {
    var cateId = e.currentTarget.dataset.id
    this.setData({
      cateIdSelected: cateId,
      cate: cateId,
      currentTab: 0
    })
    this.showGoods()
  },
  tapBrand: function (e) {
    var brandId = e.currentTarget.dataset.id;
    this.setData({
      brandIdSelected: brandId,
      currentTab: 0
    })
    this.showGoods()
  },
  tapPlus: function(ev){
    var that = this;
    var goodId = ev.currentTarget.dataset.id;
    var goods = this.data.goods;
    for(var i=0,len=goods.length; i<len; i++){
      if(goods[i].id == goodId){
        goods[i].total++;
      }
    } 
    var params = {
      id: goodId,
      total: 1
    }
    e.post('member/cart/add', params, function (a) {
      that.setData({
        goods: goods
      });
      wx.showToast({
        title: '已加入购物车',
        icon: 'success',
        duration: 1000
      });
      
    });
  },
  tapMinus: function (ev) {
    var that = this;
    var goodId = ev.currentTarget.dataset.id;
    var goods = this.data.goods;
    for (var i = 0, len = goods.length; i < len; i++) {
      if (goods[i].id == goodId) {
        if (goods[i].total--<0){
          goods[i].total=0;
        }
      }
    }
    var params = {
      id: goodId,
      total: 1
    }
    e.post('member/cart/minus', params, function(a){
        that.setData({
          goods: goods
        });
        wx.showToast({
          title: '已移除商品',
          icon: 'success',
          duration: 1000
        });
       
    });
  },
  showGoods: function(){
    var t = this;
    var leftNavs = t.data.leftNavs;
    var cate = leftNavs[t.data.currentLeftNav];
    t.setData({
      loading: !0
    })
    var params = {
      cate: t.data.cate,
      brand: t.data.brandIdSelected,
    }
    e.get("goods/get_list", params, function (a) {
      var goods = a.list;
      var allBrands = t.data.allBrands;
      var brands = [];
      for(var i=0,len=goods.length; i<len; i++){
        goods[i].total = 0;
        var brandId = goods[i].brand;
        if (brandId){
          brands.push({
            'id': brandId,
            'brand': allBrands[brandId]
            })
        }
      }
      t.setData({
        goods: goods,
        brands: brands,
        loading: 0
      })
    })
  },
  get_cart: function () {
    var t, i = this;
    e.get("member/cart/get_cart", {}, function (e) {
      t = {
        show: !0,
        ismerch: !1,
        ischeckall: e.ischeckall,
        total: e.total,
        cartcount: e.total,
        totalprice: e.totalprice,
        empty: e.empty || !1
      }, void 0 === e.merch_list ? (t.list = e.list || [], i.setData(t)) : (t.merch_list = e.merch_list || [], t.ismerch = !0, i.setData(t))
    })
  },
	onShow : function () {
    this.setData({
      city: t.globalData.city
    }),
    this.get_cart()
	},
  edit: function (t) {
    var i, s = e.data(t),
      c = this;
    switch (s.action) {
      case "edit":
        this.setData({
          edit: !0
        });
        break;
      case "complete":
        this.allgoods(!1), this.setData({
          edit: !1
        });
        break;
      case "move":
        i = this.checked_allgoods().data, a.isEmptyObject(i) || e.post("member/cart/tofavorite", {
          ids: i
        }, function (t) {
          c.get_cart()
        });
        break;
      case "delete":
        i = this.checked_allgoods().data, a.isEmptyObject(i) || e.confirm("是否确认删除该商品?", function () {
          e.post("member/cart/remove", {
            ids: i
          }, function (t) {
            c.get_cart()
          })
        });
        break;
      case "pay":
        wx.navigateTo({
          url: "/pages/member/cart/index"
        })
    }
  },
  number: function (t) {
    var a = this,
      s = e.pdata(t),
      c = i.number(this, t),
      r = s.id,
      o = s.optionid;
    1 == c && 1 == s.value && "minus" == t.target.dataset.action || s.value == s.max && "plus" == t.target.dataset.action || e.post("member/cart/update", {
      id: r,
      optionid: o,
      total: c
    }, function (t) {
      a.get_cart()
    })
  },
  edt: function (e) {
    wx.switchTab({
      url: '../../member/cart/index'
    })
  },
	onShareAppMessage : function () {
		return e.onShareAppMessage()
	},
  onLoad: function (options) {
    this.showCategory()
  } 
})
