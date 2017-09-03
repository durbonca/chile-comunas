var statistics = [
    'Commune Area in km²',
    'Population (2016)',
    'Population (2014)',
    'Household icome PC (2006)',
    'Population below poverty line (2005)',
    'Regional quality of Life (2003)',
    'Human Development Index (2003)'
];

//Compiled from data found on Wikipedia
//TODO: add the extra digit for the HDI||QL
var communeData = [
    ['Cerrillos',21,71906,84437,22234,0.083,72.93,0.743],
    ['Cerro Navia',11,148312,158046,13778,0.175,71.33,0.683],
    ['Conchalí',71,133256,140950,17396,0.08,78.61,0.707],
    ['El Bosque',14,175594,193185,'x','x',73.65,0.711],
    ['Estación Central',14,130394,144188,21601,0.073,76.38,0.735],
    ['Huechuraba',45,74070,94342,22904,0.145,73.23,0.737],
    ['Independencia',7,65479,81755,20355,0.06,78.95,0.709],
    ['La Cisterna',10,85118,92289,24305,0.086,81.87,0.775],
    ['La Florida',71,365674,388119,'x',0.031,80.21,0.773],
    ['La Granja',10,132520,142862,14662,0.142,77.93,0.689],
    ['La Pintana',31,190085,211536,13576,0.172,73.29,0.679],
    ['La Reina',23,96762,101459,42248,0.078,86.23,0.883],
    ['Las Condes',99,249893,281623,67627,0.023,87.42,0.933],
    ['Lo Barnechea',1024,74749,101651,23183,0.166,80.73,0.912],
    ['Lo Espejo',7,112800,119842,13881,0.201,71.9,0.657],
    ['Lo Prado',7,104316,112579,16950,0.116,81.8,0.715],
    ['Macul',13,112535,123506,19004,0.134,80.3,0.806],
    ['Maipú',133,468390,544876,25664,0.091,76.67,0.782],
    ['Ñuñoa',17,163511,216452,34409,0.043,87.66,0.86],
    ['Padre Hurtado',81,38768,54541,14278,0.187,'x','x'],
    ['Pedro Aguirre Cerda',10,114560,122093,18199,0.063,81.08,0.708],
    ['Peñalolén',54,216060,241576,23856,0.087,74.35,0.743],
    ['Pirque',445,16565,21595,21537,0.091,'x','x'],
    ['Providencia',14,120874,145869,53767,0.035,83.01,0.911],
    ['Pudahuel',197,195653,230833,19766,0.071,71.61,0.735],
    ['Puente Alto',88,492915,602203,23362,0.106,'x','x'],
    ['Quilicura',58,126518,202151,9302,0.099,72.53,0.782],
    ['Quinta Normal',12,104012,114297,17919,0.108,77.01,0.723],
    ['Recoleta',16,148220,167258,45513,0.024,89.77,0.797],
    ['Renca',24,133518,150546,17278,0.192,63.39,0.709],
    ['San Bernardo',155,246762,294019,16035,0.209,'x','x'],
    ['San Joaquín',10,97625,104040,19089,0.074,76.84,0.719],
    ['San José de Maipo',4995,13376,14922,'x','x','x','x'],
    ['San Miguel',10,78872,107797,39670,0.025,82.17,0.765],
    ['San Ramón',7,94906,99615,13878,0.167,70.16,0.679],
    ['Santiago',22,200792,344711,28648,'x','x','x'],
    ['Vitacura',28,81499,88065,76155,0.044,86.74,0.949]
];

var COMMUNE_COUNT = communeData.length;

var currentStatisticShadow = document.getElementById("current-statistic-shadow");
var currentStatisticElement = document.getElementById("current-statistic");
var statChoosers = document.getElementById("stat-chooser").getElementsByTagName("li");

var activeStatElement;
var map = document.getElementById('map');
var communeMapElements = map.getElementsByClassName("commune");
var communeList = document.getElementById('commune-list');
var communeListItems = communeList.getElementsByTagName("li");

//Activate the first item in the list
statChoosers[0].setAttribute('data-active', '');
activeStatElement = statChoosers[0];

var shadowSet = false;

//Hide the shadow for the title when scrolled to top
document.body.onscroll = function() {
    var scrollTop = document.body.scrollTop;
    if (scrollTop >= 10 && !shadowSet) {
        currentStatisticShadow.style.visibility = "visible";
        shadowSet = true;
    } else if (scrollTop < 10 & shadowSet) {
        currentStatisticShadow.style.visibility = "hidden";
        shadowSet = false;
    }
}

/**
 * (Event Listeners)
 * Map commune elements
 */
for (let i = 0; i < COMMUNE_COUNT; i++) {
    var name = communeData[i][0].replace(/\s/g, '-'); //Replace spaces with a hyphen
    //var mapCommuneElement = document.querySelector('#map .commune[data-name="' + name + '"]');
    
    //First element will be the list
    //Second element will be the map object
    var communeElements = document.querySelectorAll('[data-name="' + name + '"]');
    var listElement = communeElements[0];
    var mapElement = communeElements[1];


    mapElement.onmouseover = function(e) {
        var targetName = e.target.getAttribute('data-name');
        var respectiveListElement = communeList.querySelector('[data-name="' + targetName + '"]');
                
        //Highlight commune in list
        maskAllExcept(targetName);
        
        //remove the attribute that maskAllExcept() previously set on active element
        respectiveListElement.removeAttribute('data-masked');
        respectiveListElement.setAttribute('data-active', 'true');

        //Bring map element to front
        e.target.parentNode.appendChild(e.target)
        e.target.removeAttribute('data-masked');
    }

    mapElement.onmouseout = function(e) {
        var targetName = e.target.getAttribute('data-name');;
        var respectiveListElement = communeList.querySelector('[data-name="' + targetName + '"]');
        
        //Reset the state of the active sector being departed
        respectiveListElement.removeAttribute('data-active');
        //e.target.removeAttribute("data-active");
        //Remove all masks as the cursor has left the map
        //Done to avoid costly resetting when commune-hopping
        if (e.relatedTarget == map) {
            resetMasks();
        }       
    }
}

/**
 * (Event Listeners)
 * Commune List elements
 * 
 * Event listener on UL, not LI as the LI elements are moved around, loosing refference.
 */
communeList.onmouseover = function(e) {
    if (e.target.nodeName == "LI") {
        var targetName = e.target.getAttribute('data-name');
        maskAllExcept(targetName);
        e.target.removeAttribute('data-masked');
        
        var respectiveMapElement = map.querySelector('[data-name="' + targetName + '"]');
        respectiveMapElement.setAttribute('data-active', '');
        respectiveMapElement.removeAttribute('data-masked');
        //Bring to front
        respectiveMapElement.parentNode.appendChild(respectiveMapElement);
    }
}

communeList.onmouseout = function(e) {
    if(e.target.nodeName != "LI") {
        resetMasks();
    } else {
        var targetName = e.target.getAttribute('data-name');
        var respectiveMapElement = map.querySelector('[data-name="' + targetName + '"]');
        respectiveMapElement.removeAttribute('data-active');
        e.target.removeAttribute('data-active');
    }
}


/**
 * Events for the statistic option buttons
 */
for (let i = 0; i < statChoosers.length; i++) {
    statChoosers[i].onclick = function(e) {
        console.log('Changing statistic to ' + statistics[i]);
        //Remove the state from the previously active item
        activeStatElement.removeAttribute('data-active');

        //Set the active state for the new item
        activeStatElement = e.target;
        activeStatElement.setAttribute('data-active', '');

        currentStatisticElement.textContent = statistics[i];
        
        //Update the new list of commune elements
        communeListItems = communeList.getElementsByTagName("li");

        //i+1 as column index starts at 1, not 0
        sortList(i+1)
        updateMap(i+1);
    }
}



/***
 * Masks all the list entries and map sectors that aren't already masked.
 * Doesn't mask the target commune.
 * 
 * @param {string} name Name of the commune to highlight
 */
function maskAllExcept(name) {
    //var qualifiedMapElements = map.querySelectorAll(':not([data-name="' + name + '"]):not([data-masked])');
    //var qualifiedListElements = communeList.querySelectorAll(':not([data-name="' + name + '"]):not([data-masked])');

    //All but one commune (active one) gets masked
    for (var i = 0; i < COMMUNE_COUNT; i++) {
        communeMapElements[i].setAttribute('data-masked', '');
        //qualifiedListElements[i].setAttribute('data-masked', '');
    }

    for (var i = 0; i < COMMUNE_COUNT; i++) {
        communeListItems[i].setAttribute('data-masked', '');
    }
}
/***
 * Unmasks all the map sectors and list entires.
 */
function resetMasks() {
    for (var i = 0; i < COMMUNE_COUNT; i++) {
        communeMapElements[i].removeAttribute('data-masked');
        communeMapElements[i].removeAttribute('data-active');

        communeListItems[i].removeAttribute('data-masked');
        communeListItems[i].removeAttribute('data-active');
    }
}

/**
 * Formats the value of a column, based on the type of value.
 * Adds a comma for the thousand's separator and the symbols '%' and '$' where needed
 * 
 * @param {number} The index of the column to format against
 * @param {number} The input value
 */
function formatValue(columnIndex, inputValue) {
    if (isNaN(inputValue)) {
        //Dealing with null values in data
        inputValue = "-";
    } else {
        if (columnIndex <= 4) {
            //Column 1,2,3,4 use delimiters
            var delimiter = ',';
            inputValue = inputValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, delimiter);
        }            
        if (columnIndex == 4) { //Income
            inputValue = '$' + inputValue;
        } else if (columnIndex == 5) { //Poverty
            inputValue = Math.trunc(inputValue * 100) + '%';
        }
    }
    return inputValue;
}

/***
 * Sort the commune data table, per column
 * Updates the commune list.
 * 
 * @param {number} colIndex the index of the column to sort the table against.
 */
function sortList(colIndex) {
    console.log("Sorting data table against column " + colIndex);
    communeData.sort(function (a, b) {
        if (a[colIndex] === b[colIndex]) {
            return 0;
        } else if (isNaN(b[colIndex])) {
            return -1;
        } else if (isNaN(a[colIndex])) {
            return 1;
        } else {
            return (a[colIndex] > b[colIndex]) ? -1 : 1;
        }
    });

    var htmlString = "";
    
    for (var i = 0; i < COMMUNE_COUNT; i++) {
        var name = communeData[i][0];
        var value = formatValue(colIndex, communeData[i][colIndex]);
        var encodedName = communeData[i][0].replace(/\s/g, '-');
                
        htmlString += '<li data-name="' + encodedName + '" data-rank="' + (i + 1) + '">' + name + '<div class="value">' + value + '</div></li>\n';
    }
    communeList.innerHTML = htmlString;  
}

function updateMap(newColumnIndex) {
    console.log("Updating map")

    var htmlString = "";

    for (var i = 0; i < COMMUNE_COUNT; i++) {
        var value = communeData[i][newColumnIndex];
        var encodedName = communeData[i][0].replace(/\s/g, '-');
        var mapElement = document.querySelector('#map .commune[data-name="' + encodedName + '"]');

        if (isNaN(value)) {
            //CSS sets the color based on rank.
            mapElement.setAttribute("data-rank", "-");
        } else {            
            //CSS sets the color based on rank.
            mapElement.setAttribute("data-rank", i+1)
        }
    }
}

//Initiate map
sortList(1)
updateMap(1);
