import { Meteor } from 'meteor/meteor';

Meteor.startup(() => {/*
process.env.MAIL_URL = "smtp://postmaster%40sandbox6bc3fa5e9e7547afb9e268a53e4dad65.mailgun.org:a0fe8af8f974f805d5a3ab29daf262e4@smtp.mailgun.org:587";
*/});

Meteor.publish('allEmails',function(){
  return  Meteor.users.find();
});

  Meteor.publish('contacts', function tasksPublication() {
    return Contacts.find();
  });

Meteor.methods({

  sendVerificationLink() {
    let userId = Meteor.userId();
    if ( userId ) {
      return Accounts.sendVerificationEmail( userId );
    }
  },
  'changeArrowsStatus':function(value){
    if(value == true){
        Meteor.users.update({_id:Meteor.user()._id},
        {$set: {'profile.showarrows': true}});
    }else{
        Meteor.users.update({_id:Meteor.user()._id},
        {$set: {'profile.showarrows': false}});
    }
  },
  'changeEmail':function(email){
    Meteor.users.update({_id:Meteor.user()._id},
        {$set: {'emails.0.address': email}});
  },
  'countUsers':function(){
    var count = Contacts.find().count();
    return count;
  },
  'countAccounts':function(){
    var count = Meteor.users.find().count();
    return count;
  },
  'deleteAccount':function(accountid){
    Meteor.users.remove({_id:accountid});
  },
  'changeEmail':function(email, confirm, oldemail){
    var check = Meteor.user().emails[0].address;
        if( email === confirm && oldemail===check){
           Meteor.users.update({_id:Meteor.user()._id},
           {$set: {'emails.0.address': email}});
        }else{
           throw new Meteor.Error(403, "Emails have to match");
           return false;
        }
  },
  'changePass':function(currentPassword, newPassword, confirmNewPassword){
        if(newPassword === confirmNewPassword){
        Accounts.setPassword(Meteor.user()._id, newPassword, {logout: false});
        }else{
           throw new Meteor.Error(403, "Check fields , passowrd change failed");
           return false;
      }
  }

});



Accounts.emailTemplates.siteName = "Contacts.com";
Accounts.emailTemplates.from     = "Contacts.com <admin@contacts.com>";

Accounts.emailTemplates.verifyEmail = {
  subject() {
    return "[Contacts.com] Verify Your Email Address";
  },
  text( user, url ) {
    let emailAddress   = user.emails[0].address,
        urlWithoutHash = url.replace( '#/', '' ),
        supportEmail   = "support@contacts.com",
        emailBody      = `To verify your email address 
        (${emailAddress}) visit the following 
        link:\n\n${urlWithoutHash}\n\n 
        If you did not request this 
        verification, please ignore this email. 
        If you feel something is wrong, please contact our 
        support team: ${supportEmail}.`;

    return emailBody;
  }
};