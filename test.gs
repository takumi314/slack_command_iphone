function promptForMessage() {
  Browser.msgBox("Hello World.", Browser.Buttons.OK)
}

/**
 * Postリクエストを受け付けるとコールされる
 *
 * @param {String} command arguments
 * @return {TextOutput} 
 */
function doPost(e) {
  var verificationToken = e.parameter.token;
  if (verificationToken != 'OMFEGCneYulhdHfsa9AdUIev') { // AppのVerification Tokenを入れる
     throw new Error('Invalid token');
  }
  
  var command = e.parameter.text.split(' ');
  // コマンド不正
  if (isInvalidCommand(command)) {
    return throwMessage('Invalid command');
  }
  
  // 全デバイス数
  const numberOfDevices = 10;
  
  var result ='';
  var listStartRow = 1;
  var listStartColumn = 1;
  var listEndRow = 1 + numberOfDevices;
  var listEndColumn = 5;
  var deviceList = getListRange(listStartRow, listStartColumn, listEndRow, listEndColumn).getValues();

  // オプション "list" のとき
  // 貸出一覧を表示する  
  if (command[0]　== 'list') {
    result = getList(listStartRow, listStartColumn, listEndRow, listEndColumn);
    
  } else if (isEnableDeviceName(command, 0, 0, deviceList, listEndRow) && isInOrOut(command, 2)) {
    var deviceNo = command[0];
    var name = command[1];
    var inout = command[2];
    var updated = new Date();
    updateInoutSheet(deviceNo, name, inout, updated)
    
    var status = command[2] == 'in' ? '返却' : '貸出' 
    
    result = command[1] + "さん😄 \n端末No." + command[0] + "の" + status + "を受け付けました。";
    
  } else {
    result = 'usage:\n/order_device_test list\ndevice一覧を表示します。\n\n/order_device_test device端末ID 名前 in|out\nout（貸出）in（返却）を登録します。';
  }
 
  var response = {text: result};
  return ContentService.createTextOutput(JSON.stringify(response)).setMimeType(ContentService.MimeType.JSON);
}

function updateInoutSheet(deviceNo, name, inout, date) {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('inout');
  var lastRow = spreadsheet.getLastRow() + 1;

  spreadsheet.getRange(lastRow, 1).setValue(deviceNo);
  spreadsheet.getRange(lastRow, 2).setValue(name);
  spreadsheet.getRange(lastRow, 3).setValue(inout);
  spreadsheet.getRange(lastRow, 4).setValue(date);
}

function throwMessage(message) {
  var response = {text: message};
  return ContentService.createTextOutput(JSON.stringify(response)).setMimeType(ContentService.MimeType.JSON);
}

function isInvalidCommand(command) {
  if (command.length == 3 || command.length == 1) {
    return false;
  }
  return true;
}

function isInOrOut(command, column) {
  var result = false;
  
  if(command[column] == 'in' || command[column] == 'out'){
     result = true;
  }
  
  return result;
}

function isEnableDeviceName(command, commandColumn, listColumn, deviceList, listEndRow) {
  var result = false;
  
  for (var i=0; i<listEndRow; i++) {
      if (command[commandColumn] == deviceList[i][listColumn]) {
        result = true;
      }
  }

  return result;
}

function getList(listStartRow, listStartColumn, listEndRow, listEndColumn){
  var result = '';
  var range;
  
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('list');
  range = spreadsheet.getRange(listStartRow, listStartColumn, listEndRow, listEndColumn);
  
  for(var i=0; i<listEndRow; i++){
    for(var j=0; j<listEndColumn; j++){
      result = result + range.getValues()[i][j] + ' | ';
    }
    result = result + '\n';
  }
  
  return result;
}

function getListRange(listStartRow, listStartColumn, listEndRow, listEndColumn){
  var result;
  var range;
  
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('inout');
  range = spreadsheet.getRange(listStartRow, listStartColumn, listEndRow, listEndColumn);
  
  return range;
}
