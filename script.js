var commands = [];
var historyElement;
var his = []; 
var cmdInput;
var historyNum = -1;
var dir = "C:\\";
var dirElement;
var hasMovedDir;

function init() {
  cmdInput = document.getElementById("commandInput");
  cmdInput.focus();
  document.onclick = function() {
    if(isEmpty(window.getSelection().toString())) {
      cmdInput.focus();
    }
  }
  dirElement = document.getElementById("dir");
  updateDir();
  hasMovedDir = false;
  document.onkeydown = function(event) {
    if(event.keyCode == 38) {
      var a = historyNum+1;
      if(a >= his.length) return;
      historyNum = a;
      updateLine();
    } else if(event.keyCode == 40) {
      var a = historyNum-1;
      if(his.length == 0 || a < 0) return;
      historyNum = a;
      updateLine();
    }
  };
  cmdInput.addEventListener("keypress", function(event) {
    if(event.keyCode == 13) {
      sendCommand(cmdInput.value);
    }
  });
  historyElement = document.getElementById("commandOutput");
  loadCommands();
}

function updateDir() {
  dirElement.innerHTML = `${dir}>`;
  hasMovedDir = true;
  if(dir == "C:\\") {
    hasMovedDir = false;
  }
}

function removeDupes(list) {
  var output = [];
  list.forEach(a => {
    var c = false;
    output.forEach(b => {
      if(b.c == a.c) c = true;
    });
    if(!c) output.push(a);
  })
  return output;
}

function updateLine() {
  //todo make list of command history that removes duplicates to make moving up and down easier
  //var list = 
  cmdInput.value = his[his.length-1 - historyNum].c;
  var len = cmdInput.value.length * 2;
      
  setTimeout(function() {
    cmdInput.setSelectionRange(len, len);
  }, 1);
}

function loadCommands() {
  //todo add more commands
  var QuitCommand = new Command("quit", "Closes the command line", "quit");
  QuitCommand.onExecute = function() {
    getResponse("Are you sure? (Y or N)", function(res) {
      var a = res.toLowerCase();
      if(a.startsWith("y")) {
        window.close();
        return "Closing window..."
      } else return "Quit cancelled";
    });
  }

  var ClearCommand = new Command("clear", "Clears the all of the command history in the console.", "clear (silent)");
  ClearCommand.onExecute = function(args) {
    his = [];
    while (historyElement.firstChild) {
      historyElement.removeChild(historyElement.firstChild);
    } 
    
    return args.length > 0 ? "" : "Console cleared.";
  }

  var CdCommand = new Command("cd", "Changes directory", "cd (directory)");
  CdCommand.onExecute = function(args) {
    if(args.length < 1) {
      return "Invaid directory.";
    }
    var arg = args[0];
    var lower = arg.toLowerCase();
    switch(lower) {
      case "..":
        if(!hasMovedDir) {
          return "You cannot move backward any further.";
        }
        var list = dir.split("\\");
        var a = list[list.length-2];
        dir = dir.replace(`${a}\\`, "");
        list.splice(list.length);
        break;
      case "./":
      break;
      default:
        if(lower.startsWith("c:\\")) {
          dir = arg;
        }
        else dir += `${arg}\\`;
        break;
    }
    updateDir();
    return "Directory updated.";
  }
  
  var HelpCommand = new Command("help", "Shows you a list of usable commands", "help");
  HelpCommand.onExecute = function() {
    var a = '<div class="commandHistory" style="margin-top: 0px;">';
    
    commands.forEach(c => {
      a += "<span>" + c.usage + " - " + c.desc + "</span>";
    });
    a += "</div>";
    return a;
  }
}

var waiting = false;
var callb;

function getResponse(msg, callback) {
  var element = document.createElement("div");
  element.className = "commandHistory";
  element.innerHTML = "<span>" + msg + "</span>";
  historyElement.appendChild(element);
  waiting = true;
  callb = callback;
}

function isEmpty(str) {
  var list = str.split("");
  for(var i = 0; i < list.length; i++) {
    if(list[i] === " ") continue;
    else return false;
  }
  return true;
}

function pushHistory(command, response) {
  var element = document.createElement("div");
  element.className = "commandHistory";
  element.innerHTML = `<span>${dir}>   ` + command + "</span> <span>" + response + "</span>";
  historyElement.appendChild(element);
  if(his.length == 0) {
    element.style.marginTop = "";
  }
  his.push({e: element, c: command});
  historyNum = -1;
}

function sendCommand(cmd) {
  cmd = cmd.replace("<", "");
  cmd = cmd.replace(">", "");
  if(isEmpty(cmd)) return;
  cmdInput.value = "";
  if(waiting) {
    pushHistory(cmd, callb(cmd));
    waiting = false;
    return;
  }
  var a = cmd;
  var args = a.split(' ');
  var label = args[0];
  args.splice(0, 1);
  for(var i = 0; i < commands.length; i++) {
    var command = commands[i];
    if(command.label == label) {
      var res = command.onExecute(args);
      if(res === "" || res === undefined) return;
      pushHistory(cmd, res);
      return;
    }
  }
  pushHistory(cmd, "Command not found.");
}