var selectedCityID;
var selectedCityName;
var currentTemp;
var todayTemp;
var tomorrowTemp;
var preferredUnits = "c";
var requestedTemp = false;

document.addEventListener('tizenhwkey', function(e) {
    console.log("Tizen HW Event!");
    //var activePage = $.mobile.activePage().attr('id'); // read current page
    switch(e.keyName)
    {
            case 'back':
                    console.log("Back button pressed. Exiting Application");
                    tizen.application.getCurrentApplication().exit();
                    break;
            case 'menu':
                    console.log("Menu button not yet supported.");
                    break;
            default:
                    console.log("Not supported.");
    }
});
function btnCancelSettingsClick()
{
	$("#settings_overlay").hide();
}

function btnSearchClick ()
{
	//Query openweather API for location
	//console.log("btn Clicked with fragment: " + $("#locationSetting").val());
	
	var cityFragment = $("#locationSetting").val();
	
	var cityurl = "http://api.openweathermap.org/data/2.1/find/name?q="+cityFragment;

	$.ajax({
	  dataType:"jsonp",
	  url:cityurl,
	  success: citySearchCallback
	
	});

	//$("#settings_overlay").show();
	return false;
}

function unitSelectChange()
{
	//Change units
	// console.log("Units changed to " + $("#unitSelect").val());
	preferredUnits = $("#unitSelect").val();
	cacheSettings();
	
	updateWeather();
}

function citySearchCallback(data)
{

	//Clear out
	$("#potentialCityList option").remove();
	
	var options = "<option value=\"\">Select Below</option>";
	$.each(data.list, 
	  function(index, item) { // Iterates through a collection
	  //Create a string of options
	  options += "<option value=\"" + item.id + "\">" + item.name + ", " + item.sys.country + " ("+item.coord.lat +","+ item.coord.lon + ")" +  "</option>";
	
	 });

	//Append operation is expensive/slow. 
	//It's faster to append this as a full string instead of appending each one. 
	 $("#potentialCityList").append(options);
	 $("#potentialCandidateSet").show();
}

function citySelectChange()
{ 
	if ($("#potentialCityList").val() == null)
	{
		return;
	}

  //Manipulate the string
  var fullString = $("#potentialCityList option:selected").text();  
  
  var indexOfFirstBracket = fullString.indexOf("(");
  var fullName = fullString.substring(0,indexOfFirstBracket);

  selectedCityName = fullName;
  $("#currentLocationText").html(selectedCityName);

  selectedCityID = $("#potentialCityList").val();

  updateWeather();

  cacheSettings();

  //Cleanup
  $("#potentialCandidateSet").hide();
  $("#locationSetting").val('');
  
  $("#settings_overlay").hide();
}

function cacheSettings()
{
  //Store
  localStorage.setItem("currentCityName", selectedCityName);
  localStorage.setItem("currentCityId", selectedCityID);
  localStorage.setItem("currentUnitPreferences", preferredUnits);
}

function cacheTemperature()
{
  localStorage.setItem("currentTemp", currentTemp);
  localStorage.setItem("todayTemp", todayTemp);
  localStorage.setItem("tomorrowTemp", tomorrowTemp);
}

function updateWeather()
{
  startCurrentWeatherCall();
  startWeatherforecastCall();

}

function startCurrentWeatherCall()
{
    if (requestedTemp == true)
    {
      return;
    }
    var currentWeatherurl = "http://api.openweathermap.org/data/2.5/weather?id="+selectedCityID;

    $.ajax({
      dataType:"jsonp",
      url:currentWeatherurl,
      success: currentWeatherCallback
    });

}

function currentWeatherCallback(data)
{
    currentTemp = convertTemperatureToString(data.main.temp);
    $("#currentVerticalWeatherIcon").attr("src", "img/icon/300/"+ data.weather[0].icon + ".png");
    $("#currentHorizontalWeatherIcon").attr("src", "img/icon/300/"+ data.weather[0].icon + ".png");
    updateViews();
    cacheTemperature();

    requestedTemp = false;
}


function startWeatherforecastCall()
{
  if (requestedTemp == true)
  {
    return;
  }

  var forecastWeatherurl = "http://api.openweathermap.org/data/2.5/forecast/daily?id="+selectedCityID;

    $.ajax({
      dataType:"jsonp",
      url:forecastWeatherurl,
      success: weatherforecastCallback
    });
}

function weatherforecastCallback(data)
{
  todayTemp = convertTemperatureToString(data.list[0].temp.day);
  $("#todayVerticalWeatherIcon").attr("src", "img/icon/300/"+ data.list[0].weather[0].icon + ".png");
  $("#todayHorizontalWeatherIcon").attr("src", "img/icon/300/"+ data.list[0].weather[0].icon + ".png");

  tomorrowTemp = convertTemperatureToString(data.list[1].temp.day);
  $("#tomorrowVerticalWeatherIcon").attr("src", "img/icon/300/"+ data.list[0].weather[0].icon + ".png");
  $("#tomorrowHorizontalWeatherIcon").attr("src", "img/icon/300/"+ data.list[0].weather[0].icon + ".png");

  updateViews();
  cacheTemperature();

  requestedTemp = false;
}

function convertTemperatureToString(tempFromSource)
{
  //DOC:Assume that temperature from source is always in Kelvin (273.15)
  switch(preferredUnits)
  {
    case "k":
      return Math.round(tempFromSource) + "K";
    case "c":
      return Math.round(tempFromSource - 273.15) + "C"; 
    case "f":
      return Math.round(((tempFromSource - 273) * 1.8 ) + 32) + "F";
    default:
      return Math.round(tempFromSource - 273.15) + "C"; 
  }

}

function updateViews()
{
  $(".city").html(selectedCityName);
  $("#currentLocationText").html(selectedCityName);
  $("#verticalCurrentTemp").html(currentTemp);
  $("#horizontalCurrentTemp").html(currentTemp);
  $("#unitSelect").val(preferredUnits);

  $("#verticalTodayTemp").html(todayTemp);
  $("#horizontalTodayTemp").html(todayTemp);

  $("#verticalTomorrowTemp").html(tomorrowTemp);
  $("#horizontalTomorrowTemp").html(tomorrowTemp); 
}


function loadFromCache ()
{
  selectedCityID = localStorage.getItem("currentCityId");
  if (selectedCityID == null )
  {
    selectedCityID = "2988507";
  }
  selectedCityName = localStorage.getItem("currentCityName");
  if (selectedCityName == null)
  {
    selectedCityName = "Paris, FR";
  }

  preferredUnits = localStorage.getItem("currentUnitPreferences");
  if (preferredUnits == null)
  {
    preferredUnits = "c";
  }

  currentTemp = localStorage.getItem("currentTemp");
  todayTemp = localStorage.getItem("todayTemp");
  tomorrowTemp = localStorage.getItem("tomorrowTemp");


  updateViews();

  updateWeather();
}

function refreshWeatherInterval() {
//Every 30 minutes
window.setInterval(function(){updateWeather();},1000*60*30);

}

function openSettings()
{
	$("#settings_overlay").show();
}


$(document).ready(function(){

	$('#btnCancelSettings').bind('click', btnCancelSettingsClick);
	$('#btnSearch').bind('click', btnSearchClick);
	
	$('#unitSelect').bind('change', unitSelectChange);
	$("#btnSetNewCity").bind('click', citySelectChange);

	$("#potentialCandidateSet").hide();
	
	$("#potentialCityList").bind('change', citySelectChange);

	$(".btnOpenSettings").bind('click', openSettings);

	loadFromCache();

	updateWeather();
	refreshWeatherInterval();
	
});