function Command(label, desc, usage) {
  this.label = label;
  this.desc = desc;
  this.usage = usage;
  this.onExecute = function(args) { }
  commands.push(this);
}