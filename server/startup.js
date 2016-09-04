if(Meteor.isServer){
    Meteor.startup(function(){
          const admins = ['s@s.pl'].map(email => Accounts.findUserByEmail(email));
          Roles.addUsersToRoles(admins, 'admin', Roles.GLOBAL_GROUP);
    });
}                   