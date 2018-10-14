// Startup Functions
Meteor.startup(function(){
  // Grab the config
  // This should be autograbbed by meteor based on value of --settings
  var config = Meteor.settings;

  // Create admins
  // Coffeescript code
  // for admin in config.admins
  // createAdmin(admin.username, config.public.password, admin.profile)
  var admin, i, len, ref;

  ref = config.admin;
  for (i = 0, len = ref.length; i < len; i++) {
    admin = ref[i];
    createAdmin(admin.username, config["public"].password, admin.profile);
  }

  // Pre-populate mentor users

  // Clear Service integrations
  ServiceConfiguration.configurations.remove({});

  // Add Service Integrations
  addServiceIntegration('github', config.github);
  addFacebookIntegration(config.facebook);
  addServiceIntegration('google', config.google);

  // Add Base Settings
  setBasicSettings(config);

  Accounts.onCreateUser(function(options, user){
    if (options.profile){
      user.profile = options.profile;

      if (config.defaultMentor){
        user.profile.mentor = true;
      }
    }

    return user;
  });

});

function createAdmin(username, password, profile){
  var newUser = {
    username: username,
    password: password,
    profile: profile
  };

  var user = Meteor.users.findOne({
    username: username
  });

  // Set to be mentor AND admin.
  newUser.profile.admin = true;
  newUser.profile.mentor = true;

  // Only overwrite user if it does not exist.
  if (!user){
    Accounts.createUser(newUser);
  }
  };


function addServiceIntegration(service, config){
  if (config.enable){
    ServiceConfiguration.configurations.upsert({
      service: service
    },{
      $set: {
        clientId: config.clientId,
        secret: config.secret
      }
    });
  }
}

function addFacebookIntegration(fb){
  if (fb.enable){
    ServiceConfiguration.configurations.upsert({
      service: 'facebook'
    },{
      $set: {
        appId: fb.appId,
        secret: fb.secret
      }
    });
  }
}

function setBasicSettings(config){
  // Check if the settings document already exists
  var settings = Settings.find({}).fetch();
  if (settings.length == 0 || settings.length > 1){
    // Remove all documents and then create the singular settings document.
    Settings.remove({});
    Settings.insert(config.settings);
  }
}
