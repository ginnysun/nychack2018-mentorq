Template.userCreation.onCreated(function(){
  this.csv = new ReactiveVar("");
  this.ready = new ReactiveVar(false);
  this.error = new ReactiveVar(false);
  this.users = new ReactiveVar([]);
});

Template.userCreation.helpers({
  error: function(){
    return Template.instance().error.get();
  },
  ready: function(){
    return Template.instance().ready.get();
  },
  formattedUsers: function(){
    return Template.instance().users.get();
  }
});

Template.userCreation.events({
  "click #checkFormat": function(e, t){
    // Reset the error
    t.error.set(false);

    // Grab the csv text
    var csv = $('#usersCsv').val();

    try {
      t.users.set(formatCsv(csv, t));
      t.ready.set(true);
    } catch(err){
      t.error.set(err);
      t.ready.set(false);
    }
  },
  "click #createUsers": function(e, t){
    // Create the users one by one
    t.users.get().forEach(function(user, idx){
      Meteor.call("createAccount",
          user.username,
          user.password,
          user.profile,
          function(error){
            if (error){
              user.failed = true;
            } else {
              user.success = true;
            }
            var u = t.users.get();
            u[idx] = user;
            t.users.set(u);
          });
    });
  }
});

function formatCsv(csv, t){
  var rows = csv.split('\n');

  if (csv.length == 0){
    throw "There's nothing here.";
  }

  var users = {};

  return rows.map(function(row, i){
    var columns = row.split(',');

    if (columns.length < 2 || columns.length > 2){
      throw "Row " + i + " has " + columns.length + " values, expected 2";
    }

    var firstName = columns[0].trim(),
        lastName = columns[1].trim();

    // Create the mentor's username
    var firstNameSanitized = firstName.toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
    var lastNameSanitized = lastName.toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
    var trackSanitized = "Mentor".toLowerCase().replace(/[^a-zA-Z0-9]/g, '');

    var username = firstNameSanitized + '-' + lastNameSanitized + '-' + trackSanitized;
    var password = Meteor.settings.public.password;

    // Keep track of this username
    users[username] = true;

    return {
      username: username,
      password: password,
      profile: {
        name: firstName,
        mentor: true,
        track: "Mentor"
      }
    }
  })

}
