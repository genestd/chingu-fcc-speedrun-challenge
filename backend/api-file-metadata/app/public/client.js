document.getElementById('upfile').addEventListener('change', handleFileSelect, false);

function handleFileSelect(e){
  var files = e.target.files
  var filename = document.getElementById('filename')
  var filetype = document.getElementById('filetype')
  var filesize = document.getElementById('filesize')
  
  filename.value= files[0].name
  filetype.value= files[0].type
  filesize.value= files[0].size
}