/***** Ajax 4.2.1 *****/

/* require tools 4.1.5 */

(function (udf){
  //// Import ////
  
  var fnp = $.fnp;
  var udfp = $.udfp;
  var arrp = $.arrp;
  var inp = $.inp;
  var map = $.map;
  var las = $.las;
  var str = $.str;
  var emp = $.emp;
  var foldi = $.foldi;
  var att = $.att;
  var lat = $.lat;
  var err = $.err;
  var evl = $.evl;
  
  //// Processing ////
  
  function prms(o){
    return foldi(function (s, x, i){
      if (emp(s))return i + "=" + str(x);
      return s + "&" + i + "=" + str(x);
    }, "", o);
  }
  
  //// Main ////
  
  function ajax(){
    if (window.XMLHttpRequest)return new XMLHttpRequest();
    return new ActiveXObject("Microsoft.XMLHTTP");
  }
    
  function get(a, o){
    if (udfp(o))o = {};
    
    var x = ajax();
    x.open("GET", emp(o)?a:(a+"?"+prms(o)), false);
    x.send();
    if (!inp(x.status, 200, 304)){
      err(get, "Can't get a = $1 with o = $2 due to status $3", a, o, x.status);
    }
    return x.responseText;
  }
  
  function post(a, o){
    if (udfp(o))o = {};
    
    var x = ajax();
    x.open("POST", a);
    x.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    x.send(prms(o));
    if (!inp(x.status, 200, 304)){
      err(post, "Can't post a = $1 with o = $2 due to status $3", a, o, x.status);
    }
    return x.responseText;
  }
  
  function aget(a, of, f){
    if (udfp(of))return aget3(a, {}, function (){});
    if (fnp(of))return aget3(a, {}, of);
    return aget3(a, of, udfp(f)?function (){}:f);
  }
  
  function aget3(a, o, f){
    var x = ajax();
    x.onreadystatechange = function (){
      if (x.readyState == 4){
        if (x.status == 200){
          f(x.responseText);
        } else if (inp(x.status, 0, 12029)){
          lat(function (){aget3(a, o, f);}, 1000);
        } else {
          err(aget3, "Can't aget a = $1 with o = $2 and f = $3 due to status $4", a, o, f, x.status);
        }
      }
    }
    x.open("GET", emp(o)?a:(a+"?"+prms(o)), true);
    x.send();
  }
  
  function apost(a, of, f){
    if (udfp(of))return apost3(a, {}, function (){});
    if (fnp(of))return apost3(a, {}, of);
    return apost3(a, of, udfp(f)?function (){}:f);
  }
  
  function apost3(a, o, f){
    var x = ajax();
    x.onreadystatechange = function (){
      if (x.readyState == 4){
        if (x.status == 200){
          f(x.responseText);
        } else if (inp(x.status, 0, 12029)){
          lat(function (){apost3(a, o, f);}, 1000);
        } else {
          err(apost3, "Can't apost a = $1 with o = $2 and f = $3 due to status $4", a, o, f, x.status);
        }
      }
    }
    x.open("POST", a, true);
    x.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    x.send(prms(o));
  }
  
  function load(a){
    if (arrp(a)){
      return las(map(load1, a));
    }
    return load1(a);
  }
  
  function load1(a){
    return evl(get(a));
  }
  
  //// Export ////
  
  att({
    get: get,
    post: post,
    aget: aget,
    apost: apost,
    
    load: load,
    load1: load1,
  }, $);
  
})();
