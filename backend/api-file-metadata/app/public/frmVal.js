
document.addEventListener('DOMContentLoaded',function() {
    document.querySelector('input[name="dt"]').onchange=changeEventHandler;
},false);

function changeEventHandler(event) {
  var valid=false
  
  if(event.target.value.length != 10) {
    return valid;
  } else {  
  
    var month = Number.parseInt(event.target.value.substr(0,2))
    var day = Number.parseInt(event.target.value.substr(3,2))
    var year = Number.parseInt(event.target.value.substr(6,4))
    
    if( Number.isNaN(month) || month < 1 || month > 12){
      console.log('invalid month')
    }
    if( Number.isNaN(day) || day < 1 || day > 31){
      console.log('invalid day')
    }
    
    if( Number.isNaN(year) || year < 1917 ){
      console.log('invalid year')
    }
    //is month numeric, between 1 and 12
  }
  
}
