//bbs 
var cloudad_type = 'ms502';
var cloudad_urls = [
'http://ad.csdn.net/adsrc/ibm-mianfei-eis-downloadhomepage-728-90-0403.swf'
];
var cloudad_clks = [
'http://e.cn.miaozhen.com/r.gif?k=1005239&p=3yNnY0&rt=2&ns=[M_ADIP]&ni=[M_IESID]&na=[M_MAC]&o=http://www.ibm.com/systems/cn/ads/2012q4_flexsystem.shtml?csr=apch_cfg1_20130329_1364536725191&ck=csdn&cmp=132ff&ct=132ff02w&cr=csdn&cm=b&csot=-&ccy=cn&cpb=-&cd=2013-03-29&cot=a&cpg=ofin&cn=intel_rebate_flex_system_(eis)_bbs_homepage&csz=728*90'
];

var can_swf = (function () {
    if (document.all) swf = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
    else if (navigator.plugins) swf = navigator.plugins["Shockwave Flash"];
    return !!swf;
})();

function cloudad_show() {
    var rd = Math.random();
    var ad_url, log_url;
    if (rd < 0.5 && can_swf) {
        ad_url = cloudad_urls[0];

        log_url = 'http://ad.csdn.net/log.ashx';
        log_url += '?t=view&adtype=' + cloudad_type + '&adurl=' + encodeURIComponent(ad_url);
        cloudad_doRequest(log_url, true);
    }
    if (rd < 0.002) {
        ad_url = cloudad_clks[0];

        log_url = 'http://ad.csdn.net/log.ashx';
        log_url += '?t=click&adtype=' + cloudad_type + '&adurl=' + encodeURIComponent(ad_url);
        cloudad_doRequest(log_url, true);
    }
}

function cloudad_doRequest(url, useFrm) {
    var e = document.createElement(useFrm ? "iframe" : "img");

    e.style.width = "1px";
    e.style.height = "1px";
    e.style.position = "absolute";
    e.style.visibility = "hidden";

    if (url.indexOf('?') > 0) url += '&r_m=';
    else url += '?r_m=';
    url += new Date().getMilliseconds();
    e.src = url;

    document.body.appendChild(e);
}

setTimeout(function () {
    cloudad_show();
}, 1000);
