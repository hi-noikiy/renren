
Array.prototype.range = function (start, end) {
  var _self = this;
  var length = end - start + 1;
  var step = start - 1;
  return Array.apply(null, { length: length }).map(function (v, i) { step++; return step; });
}

var t = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (t) {
	return typeof t
}
 : function (t) {
	return t && "function" == typeof Symbol && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t
}, 
e = getApp(), a = e.requirejs("core"), i = e.requirejs("foxui"), d = e.requirejs("biz/diyform"), r = e.requirejs("jquery");
Page({
	data : {
    items: [
      { id: 1, txt: '是'},
      { id: 2, txt: '否', checked: 'true'},
    ],
		icons : e.requirejs("icons"),
		list : {},
		goodslist : {},
    totalhandlingfee: 0,
		data : {
			dispatchtype : 0
		},
		showPicker : !1,
		pvalOld : [0, 0, 0],
		pval : [0, 0, 0],
		areas : [],
		noArea : !0,
    status: '',
    show_floor: false,
    floor_array: [],
    floor_index: 0,
	},
  bindPickerChange: function (e) {
    var index = parseInt(e.detail.value)
    this.setData({
      floor_index: e.detail.value
    })
    this.caculate(this.data.list)
  },
  //获取单选按钮的值
  radioChange: function (e) {
    var type = e.detail.value
    console.log(type)
    //是
    if (type == '1') {
      this.setData({
        type: '1',
        show_floor:true
      })
    }
    //否
    if (type == '2') {
      this.setData({
        type: '2',
        show_floor:false
      })
    }
  },

	onLoad : function (t) {
		var i = this;
    var arr = [];
    arr = arr.range(1, 60)
		var d = {};
    this.setData({
      floor_array: arr,
			options : t,
			areas : e.getCache("cacheset").areas
		}),
		e.url(t),
		a.get("order/create", i.data.options, function (t) {
			0 == t.error ? (r.each(t.goods, function (t, e) {
					r.each(e.goods, function (t, e) {
						d[e.id] = e
					})
				}), i.setData({
					list : t,
          totalhandlingfee: t.totalhandlingfee,
					show : !0,
					goodslist : d,
					diyform : {
						f_data : t.f_data,
						fields : t.fields
					}
				}), e.setCache("goodsInfo", {
					goodslist : d,
					merchs : t.merchs
				}, 1800)) : (a.toast(t.message, "loading"), setTimeout(function () {
					wx.navigateBack()
				}, 1e3))
		}),
		e.setCache("coupon", "")
	},
	onShow : function () {
		var i = this,
		d = e.getCache("orderAddress"),
		s = e.getCache("orderShop");
		d && (this.setData({
				"list.address" : d
			}), i.caculate(i.data.list)),
		s && this.setData({
			"list.carrierInfo" : s
		});
		var o = e.getCache("coupon");
		"object" == (void 0 === o ? "undefined" : t(o)) && 0 != o.id ? (this.setData({
				"data.couponid" : o.id,
				"data.couponname" : o.name
			}), a.post("order/create/getcouponprice", {
				couponid : o.id,
				goods : i.data.goodslist,
        goodsprice: i.data.list.goodsprice,
        floor: i.data.show_floor ? 1 : i.data.floor_array[i.data.floor_index],
				discountprice : i.data.list.discountprice,
				isdiscountprice : i.data.list.isdiscountprice
			}, function (t) {
				0 == t.error ? (delete t.$goodsarr, i.setData({
						coupon : t
					}), i.caculate(i.data.list)) : a.alert(t.message)
			}, !0)) : (this.setData({
				"data.couponid" : 0,
				"data.couponname" : null,
				coupon : null
			}), r.isEmptyObject(i.data.list) || i.caculate(i.data.list))
	},
	toggle : function (t) {
		var e = a.pdata(t),
		i = e.id,
		d = e.type,
		r = {};
		r[d] = 0 == i || void 0 === i ? 1 : 0,
		this.setData(r)
	},
	phone : function (t) {
		a.phone(t)
	},
	dispatchtype : function (t) {
		var e = a.data(t).type;
		this.setData({
			"data.dispatchtype" : e
		}),
		this.caculate(this.data.list)
	},
	number : function (t) {
		var e = this,
		d = a.pdata(t),
		s = i.number(this, t),
		o = d.id,
		c = e.data.list,
		n = e.data.goodslist,
		u = 0,
		l = 0;
		r.each(c.goods, function (t, e) {
			r.each(e.goods, function (e, a) {
				a.id == o && (c.goods[t].goods[e].total = s, n[o].total = s),
				u += parseInt(c.goods[t].goods[e].total),
				l += parseFloat(u * c.goods[t].goods[e].price)
			})
		}),
		c.total = u,
		c.goodsprice = Math.round(100*l)/100,
		e.setData({
			list : c,
			goodslist : n
		}),
		this.caculate(c)
	},
	caculate : function (t) {
		var e = this;
		a.post("order/create/caculate", {
      goods: e.data.goodslist,
      dflag: e.data.data.dispatchtype,
      floor: e.data.show_floor ? e.data.floor_array[e.data.floor_index]:1,
      addressid: e.data.list.address ? e.data.list.address.id : 0
		}, function (a) {
			t.dispatch_price = a.price,
			t.enoughdeduct = a.deductenough_money,
			t.enoughmoney = a.deductenough_enough,
			t.taskdiscountprice = a.taskdiscountprice,
			t.discountprice = a.discountprice,
			t.isdiscountprice = a.isdiscountprice,
			e.data.data.deduct && (a.realprice -= a.deductcredit),
			e.data.data.deduct2 && (a.realprice -= a.deductcredit2),
			e.data.coupon && void 0 !== e.data.coupon.deductprice && (a.realprice -= e.data.coupon.deductprice),
			t.realprice = a.realprice,
			e.setData({
				list : t,
        totalhandlingfee: a.totalhandlingfee
			})
		}, !0)
	},
	submit : function () {
		var t = this.data,
		e = this,
		i = this.data.diyform;
		if (!t.submit) {
			if (d.verify(this, i)) {
				t.list.carrierInfo = t.list.carrierInfo || {};
				var s = {
					id : t.options.id ? t.options.id : 0,
					goods : t.goodslist,
					giftid : "",
					gdid : t.options.gdid,
          dispatchtype: t.data.dispatchtype,
          floor: t.show_floor ?  t.floor_array[t.floor_index] : 1,
					fromcart : t.list.fromcart,
					carrierid : 1 == t.data.dispatchtype && t.list.carrierInfo ? t.list.carrierInfo.id : 0,
					addressid : t.list.address ? t.list.address.id : 0,
					carriers : 1 == t.data.dispatchtype || t.list.isvirtual || t.list.isverify ? {
						carrier_realname : t.list.member.realname,
						carrier_mobile : t.list.member.mobile,
						realname : t.list.carrierInfo.realname,
						mobile : t.list.carrierInfo.mobile,
						storename : t.list.carrierInfo.storename,
						address : t.list.carrierInfo.address
					}
					 : "",
					remark : t.data.remark,
					deduct : t.data.deduct,
					deduct2 : t.data.deduct2,
					couponid : t.data.couponid,
					invoicename : t.list.invoicename,
					submit : !0,
					packageid : t.list.packageid,
					diydata : t.diyform.f_data
				};
				if (1 == t.data.dispatchtype || t.list.isvirtual || t.list.isverify) {
					if ("" == r.trim(t.list.member.realname))
						return void a.alert("请填写联系人!");
					if ("" == r.trim(t.list.member.mobile))
						return void a.alert("请填写联系方式!");
					s.addressid = 0
				} else if (!s.addressid)
					return void a.alert("地址没有选择!");
				e.setData({
					submit : !0
				}),
				a.post("order/create/submit", s, function (t) {
					if (e.setData({
							submit : !1
						}), 0 != t.error)
						return void a.alert(t.message);
					wx.navigateTo({
						url : "/pages/order/pay/index?id=" + t.orderid
					})
				}, !0)
			}
		}
	},
	dataChange : function (t) {
		var e = this.data.data,
		a = this.data.list;
		switch (t.target.id) {
		case "remark":
			e.remark = t.detail.value;
			break;
		case "deduct":
			e.deduct = t.detail.value,
			a.realprice += e.deduct ? -a.deductmoney : a.deductmoney;
			break;
		case "deduct2":
			e.deduct2 = t.detail.value,
			a.realprice += e.deduct2 ? -a.deductcredit2 : a.deductcredit2
		}
		this.setData({
			data : e,
			list : a
		})
	},
	listChange : function (t) {
		var e = this.data.list;
		switch (t.target.id) {
		case "invoicename":
			e.invoicename = t.detail.value;
			break;
		case "realname":
			e.member.realname = t.detail.value;
			break;
		case "mobile":
			e.member.mobile = t.detail.value
		}
		this.setData({
			list : e
		})
	},
	url : function (t) {
		var e = a.pdata(t).url;
		wx.redirectTo({
			url : e
		})
	},
	onChange : function (t) {
		return d.onChange(this, t)
	},
	DiyFormHandler : function (t) {
		return d.DiyFormHandler(this, t)
	},
	selectArea : function (t) {
		return d.selectArea(this, t)
	},
	bindChange : function (t) {
		return d.bindChange(this, t)
	},
	onCancel : function (t) {
		return d.onCancel(this, t)
	},
	onConfirm : function (t) {
		return d.onConfirm(this, t)
	},
	getIndex : function (t, e) {
		return d.getIndex(t, e)
	}
})