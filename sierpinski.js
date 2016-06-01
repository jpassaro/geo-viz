// relies on raphael.js
console.log = function(){}

transformations = {
  r: "rotate",
  t: "translate",
  s: "scale"
}

function __makeTransform(elt,transformArray){
  console.log("__makeTransform "+elt.transform()+" + "+transformArray);
  var m=elt.matrix.clone(), t=transformArray[0], params=transformArray.slice(1);
  m[transformations[t]].apply(m,params);
  return m.toTransformString();
}

function makeTransform(elt,transformArray){
  console.log("makeTransform "+elt.transform()+" + "+transformArray);
  var val =  elt.transform()+transformArray;
  console.log("(result = "+val+")");
  return val;
}

function makeAnimation(elt,params,n,callback){
  console.log("makeAnimation");
  return Raphael.animation(
      {transform:makeTransform(elt,params.transforms[n])},
      params.animateTime,
      params.easing,
      callback);
}

function sierpinskiClick(oldset,clickable,params){
  console.log("sierpinskiClick");
  var st;
  function ending(){
    console.log("ending");
    st.animate(params.restingAttrs,params.animateTime,"linear");
    oldset.animate({opacity:0},params.animateTime,"linear",function(){
      oldset.remove();
    });
    sierpinskiClick(st,clickable.toFront(),params);
  }
  function move(n){
    console.log("move("+n+")");
    var lastone = (n==params.transforms.length-1),
      callback = (lastone)?ending:function(){move(n+1);};
    function doit(){
      console.log("move("+n+").doit");
      // assume the first one is a scale, which requires no clone
      if(n) {
        oldset.clone().toFront().animate(params.cloneAttrs,params.animateTime)
          .forEach(function(elt){st.push(elt);});
      }
      var item1=null, anim1=null, t=params.transforms[n];
      oldset.forEach(function(elt){
        var anim;
        if (anim1===null){
          anim1=anim=makeAnimation(item1=elt,params,n,callback)
                      .delay(params.animDelay);
          elt.animate(anim);
        } else {
          anim = makeAnimation(elt,params,n,null);
          elt.animateWith(item1,anim1,anim);
        }
      });


      // animate({transform: makeTransform(oldset,params.transforms[n])},
      //             params.animateTime,params.easing,callback);
    }
    setTimeout(doit,n?params.delay:0);
  }
  clickable.click(function() {
    console.log("Sierpinski onclick");
    clickable.unclick();
    st = oldset.paper.set();
    oldset.attr(params.movingAttrs);
    move(0);
  });
}

function setupSierpinski(paper, params){
  console.log("setupSierpinski: ");
  for(var i=0;i<params.transforms.length;i++){
    console.log("transform #"+i+" is '"+params.transforms[i]+"'");
  }

  var startingItem = params.start(paper).attr(params.restingAttrs)
     .click(function() {console.log("damn thing won't start")});
  var startingSet = paper.set();
  startingSet.push(startingItem);
  var cBox = startingItem.getBBox();
  var clickable = paper.rect(cBox.x,cBox.y,cBox.width,cBox.height).toFront()
    // .attr({fill:"#f00","fill-opacity":0.1,})
    .attr({fill:"#fff","fill-opacity":0.05});
  sierpinskiClick(startingSet,clickable,params);
}

var scl = 1.0/3;
var demoSierpinskiSquareParams = {
  start: function(paper){ return paper.rect(0,0,300,300); },
  restingAttrs: {fill:"#000", "fill-opacity": 1, opacity: 1, "stroke-opacity":0},
  animateTime: 1000, // millis
  delay: 200, // also millis
  movingAttrs: {opacity: 0.4},
  cloneAttrs: {fill:"#f00", "fill-opacity": 0.7, opacity: 0.7},
  easing: "bounce",
  transforms: Raphael.parseTransformString(
    "S"+scl+","+scl+",0,0T,100,0T100,0T0,100T0,100T-100,0T-100,0T0,-100T0,-100"),
  animDelay:5
};

var otherSierpinskiParams = {
  start: function(paper){ return paper.rect(50,50,300,300); },
  restingAttrs: {fill:"#000", "fill-opacity": 1, opacity: 1, "stroke-opacity":0},
  animateTime: 1250, // millis
  delay: 0, // also millis
  movingAttrs: {opacity: 0.4},
  cloneAttrs: {fill:"#f00", "fill-opacity": 0.7, opacity: 0.7},
  easing: "linear",
  transforms: Raphael.parseTransformString("S"+scl+","+scl+",50,50"+
                  "R-270,150,150R-270,250,150"+
                  "R-270,250,150R-270,250,250"+
                  "R-270,250,250R-270,150,250"+
                  "R-270,150,250R-270,150,150"
                ),
  animDelay:0
};

var rt3 = Math.sqrt(3),
  triTop=300-(150*rt3),
  triMid=300-(75*rt3);

var triangleParams  = {
  start: function(paper){ return paper.path("M50,300L350,300,200,"+triTop); },
  restingAttrs: {fill:"#000", "fill-opacity": 1, opacity: 1, "stroke-opacity":0},
  animateTime: 750,
  delay: 0,
  movingAttrs: {apacity: 0.4},
  cloneAttrs: {fill:"#f00","fill-opacity":0.7,opacity:0.7},
  easing: "linear",
  animDelay:5,
  transforms: Raphael.parseTransformString("S0.5,0.5,50,300"+
              "R120,200,300R120,275,"+triMid+"R120,125,"+triMid)
};
