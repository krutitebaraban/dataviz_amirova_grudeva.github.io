let getJSON = async function(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';
    xhr.onload = function() {
      var status = xhr.status;
      if (status === 200) {
        callback(null, xhr.response);
      } else {
        callback(status, xhr.response);
      }
    };
    xhr.send();
};


    
getJSON('https://api.npoint.io/7d2c9a4dfcf4337827a4',
function(err, data) {
  if (err !== null) {
    alert('Something went wrong: ' + err);
  } else {
   
    const lowerYear = 2010;
    const upperYear= 2022;
    let yearObject = {}
    for (let year = lowerYear; year < upperYear + 1; year++) {
      yearObject = {
        ...yearObject,
        [year]: {}
      }
    }

    let allData = yearObject;
    
    for (const dataItem of data) {
       for (const year of Object.keys(yearObject)) {
          const currentCountryName =  dataItem["Страна"].substr(0,dataItem["Страна"].indexOf(','));
          allData[year] = {
              ...allData[year],
              [currentCountryName]: dataItem[year]
          }
       }
    }
    
    
let root = am5.Root.new("chartdiv");

root.numberFormatter.setAll({
  numberFormat: "#a",

  bigNumberPrefixes: [
    { number: 1e6, suffix: "M" },
    { number: 1e3, suffix: "K" }
  ],

  smallNumberPrefixes: []
});

let stepDuration = 2000;


root.setThemes([am5themes_Animated.new(root)]);


let chart = root.container.children.push(am5xy.XYChart.new(root, {
  panX: 'none',
  panY: 'none',
  wheelX: "none",
  wheelY: "none"
}));


chart.zoomOutButton.set("forceHidden", true);


let yRenderer = am5xy.AxisRendererY.new(root, {
  minGridDistance: 20,
  inversed: true,
});
yRenderer.grid.template.set("visible", false);

let yAxis = chart.yAxes.push(am5xy.CategoryAxis.new(root, {
  maxDeviation: 0,
  categoryField: "network",
  renderer: yRenderer,
  maxZoomCount: 10,
  maxZoomFactor: 'none',
  zoomY: false,
  autoZoom: false
}));

let xAxis = chart.xAxes.push(am5xy.ValueAxis.new(root, {
  maxDeviation: 0,
  min: 0,
  extraMax: 0.1,
  renderer: am5xy.AxisRendererX.new(root, {})
}));

xAxis.set("interpolationDuration", stepDuration / 10);
xAxis.set("interpolationEasing", am5.ease.linear);


let series = chart.series.push(am5xy.ColumnSeries.new(root, {
  xAxis: xAxis,
  yAxis: yAxis,
  valueXField: "value",
  categoryYField: "network"
}));

series.columns.template.setAll({ cornerRadiusBR: 5, cornerRadiusTR: 5 });

series.columns.template.adapters.add("fill", function (fill, target) {
  return chart.get("colors").getIndex(series.columns.indexOf(target));
});

series.columns.template.adapters.add("stroke", function (stroke, target) {
  return chart.get("colors").getIndex(series.columns.indexOf(target));
});

series.bullets.push(function () {
  return am5.Bullet.new(root, {
    locationX: 1,
    sprite: am5.Label.new(root, {
      text: "{valueXWorking.formatNumber('#.# a')}",
      fill: root.interfaceColors.get("alternativeText"),
      centerX: am5.p100,
      centerY: am5.p50,
      populateText: true
    })
  });
});

let label = chart.plotContainer.children.push(am5.Label.new(root, {
  text: lowerYear,
  fontSize: "8em",
  opacity: 0.2,
  x: am5.p100,
  y: am5.p100,
  centerY: am5.p100,
  centerX: am5.p100
}));

function getSeriesItem(category) {
  for (var i = 0; i < series.dataItems.length; i++) {
    let dataItem = series.dataItems[i];
    if (dataItem.get("categoryY") == category) {
      return dataItem;
    }
  }
}

function sortCategoryAxis() {
  series.dataItems.sort(function (x, y) {
    return y.get("valueX") - x.get("valueX"); 
  });

  am5.array.each(yAxis.dataItems, function (dataItem) {
    let seriesDataItem = getSeriesItem(dataItem.get("category"));

    if (seriesDataItem) {
      let index = series.dataItems.indexOf(seriesDataItem);
      let deltaPosition =
        (index - dataItem.get("index", 0)) / series.dataItems.length;
      if (dataItem.get("index") != index) {
        dataItem.set("index", index);
        dataItem.set("deltaPosition", -deltaPosition);
        dataItem.animate({
          key: "deltaPosition",
          to: 0,
          duration: stepDuration / 2,
          easing: am5.ease.out(am5.ease.cubic)
        });
      }
    }
  });
 
  yAxis.dataItems.sort(function (x, y) {
    return x.get("index") - y.get("index");
  });
}

let year = lowerYear;

let interval = setInterval(function () {
  year++;

  if (year > upperYear) {
    clearInterval(interval);
    clearInterval(sortInterval);
  }

  updateData();
}, stepDuration);

let sortInterval = setInterval(function () {
  sortCategoryAxis();
}, 100);

function setInitialData() {
  let d = allData[year];

  for (var n in d) {
    series.data.push({ network: n, value: d[n] });
    yAxis.data.push({ network: n });
  }
}

function updateData() {
  let itemsWithNonZero = 0;

  if (allData[year]) {
    label.set("text", year.toString());

    am5.array.each(series.dataItems, function (dataItem) {
      let category = dataItem.get("categoryY");
      let value = allData[year][category];

      if (value > 0) {
        itemsWithNonZero++;
      }

      dataItem.animate({
        key: "valueX",
        to: value,
        duration: stepDuration,
        easing: am5.ease.linear
      });
      dataItem.animate({
        key: "valueXWorking",
        to: value,
        duration: stepDuration,
        easing: am5.ease.linear
      });
    });
  }
}

setInitialData();
setTimeout(function () {
  year++;
  updateData();
  yAxis.zoom(0, 0.8);
  
}, 50);


series.appear(1000);
chart.appear(1000, 100);
  } });




