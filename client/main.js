import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';

var currentId;

	Router.configure({
	layoutTemplate: 'maintemplate'

	});

Router.route('/', function(){
	this.render('topNavbar', {to:"topnavbar"});
	this.render('mainContent', {to:"main"});
	if(Meteor.user()){
	this.render('contactItem', {to:"contacts"});	
	}else{
		this.render(null, {to:"contacts"});
	}
	
});

Router.route('/veryfiescreen', function(){
	this.render('topNavbar', {to:"topnavbar"});
	this.render('veryfiescreen', {to:"main"});
	this.render(null, {to:"contacts"});
});

Router.route('/createaccount', function(){
	this.render('topNavbar', {to:"topnavbar"});
	this.render('register', {to:"main"});
});

Router.route('/forgotpassword', function(){
	this.render('topNavbar', {to:"topnavbar"});
	this.render('forgotpassword', {to:"main"});
});


Router.route('/:_id', function(){
	this.render('topNavbar', {to:"topnavbar"});
	this.render(null, {to:"main"});
	this.render('contactItemDetails', {to:"contacts",
		data:function(){
			return Contacts.findOne({_id:this.params._id});
		}
	});

});

Router.route('/:_id/edit', function(){
	this.render('topNavbar', {to:"topnavbar"});
	this.render('contactItemEditDetails', {to:"contacts",
	data:function(){
			var con = Contacts.findOne({_id:this.params._id});
			return con;
		}
});
});

Meteor.autorun(function(event){
	if( Meteor.user() ){
	$('body').css('background', '#FFFFFF');
	$('body').css('background-image','none');	
	}
});

Template.mainContent.events({
	'keyup #search': function(event) {
		Session.set('key', event.target.value);
	},
	'click .resend-verification-link' ( event, template ) {
    Meteor.call( 'sendVerificationLink', ( error, response ) => {
      if ( error ) {
        Bert.alert( error.reason, 'danger' );
      } else {
        let email = Meteor.user().emails[ 0 ].address;
        Bert.alert( `Verification sent to ${ email }!`, 'success' );
      }
    });
}
});

Template.contactItem.helpers({
		contactsList:function(){
			var checkId = Meteor.user()._id;
			if (!Session.get('key')){
				return Contacts.find({creatorid:checkId},{sort:{rating:-1}});
			}else{
			var regex = new RegExp(Session.get('key'),'i');
				return Contacts.find({$or:[{firstname:regex}, {lastname:regex}]});
			}
		}
});


Template.contactItem.events({
		'click .contactitem': function(events){
			if(events.target.id == this._id){
			currentId = this._id;
			Router.go("/"+this._id);	
		}
		},
		'click .glyphicon-arrow-up':function(events){
			var elementId = this._id;
			var currentRating = Contacts.findOne({_id:elementId});
			var count = currentRating.rating + 1;
			Contacts.update({_id:elementId},{$set:{rating:count}});
		},
				'click .glyphicon-arrow-down':function(events){
			var elementId = this._id;
			var currentRating = Contacts.findOne({_id:elementId});
			var count = currentRating.rating - 1;
			if(count <= 0){
				Contacts.update({_id:elementId},{$set:{rating:0}});
			}else{
				Contacts.update({_id:elementId},{$set:{rating:count}});
			}
			
		}

});

Template.forgotpassword.events({
	'submit form': function(event){
		event.preventDefault();
		var email = event.target.resetEmail.value;
		Accounts.forgotPassword({email: email}, function(err){
			if(err){
				Bert.alert(event.reason, 'danger');
			}else{
				Bert.alert( 'Check your email', 'success' );
			}
		});
	}
});


Template.register.events({
	'submit form': function(event){
		event.preventDefault();
		var userName = event.target.userName.value;
		var emailVar = event.target.registerEmail.value;
		var passwordVar = event.target.registerPassword.value;
		
		Accounts.createUser(
			{username:userName, email:emailVar,password:passwordVar}, function(event){
				if(event){
					Bert.alert(event.reason, 'danger');
				}else{
					Meteor.call('sendVerificationLink', function(event){
						if(event){
							Bert.alert(event.reason, 'danger');
						}else{
							Bert.alert('Account created, verify your email', 'success');
							Meteor.logout();
							Meteor._reload.reload();
							Router.go('/veryfiescreen');
						}
					});
				}
			});

	}
});

Template.contactItemDetails.events({
	'click #close':function(event){
		Router.go('/');
	},
	'click #edit':function(event){
		Router.go('/'+this._id+'/edit');
	},
	'click #delete':function(event){
		var click = confirm("Do you really want ot delete this contact ?");
		if(click == true){
			Contacts.remove({_id:this._id});
			Router.go('/');	
		} 
	}
});


Template.login.events({
	'submit form':function(event){
		event.preventDefault();
		var emailVar = event.target.loginEmail.value;
		var loginPassword = event.target.loginPassword.value;
		Meteor.loginWithPassword(emailVar,loginPassword, function(event){	 
			  if (event) {
        Bert.alert( event.reason, 'danger' );
      } else {
      	if(Meteor.user().emails[0].verified){
      		Bert.alert( 'Logged', 'success' );
        	Router.go('/');
      	}

      }
		});
	}
	
});


Template.topNavbar.events({
    'click .logout': function(event){
    	var click = confirm("Do you want to logout?");
    	if(click == true){
    	event.preventDefault();
        Meteor.logout();
        Router.go('/');
        Meteor._reload.reload();
    	}
    },
    'click .js-settings':function(event){
    	$('#settings').modal('show');

    },
    'click .js-change-email':function(event){
    	var email = $('#new-email').val();
    	var confirm = $('#confirm-email').val();
    	var oldemail = $('#old-email').val();
    	var check = Meteor.user().emails[0].address;
    		if( email === confirm && oldemail===check){
    		   Meteor.call('changeEmail',email, function(err){
    		   	if(err){
    		   		Bert.alert( event.reason, 'danger' );
    		   	}else{
    		   		Bert.alert( 'Email changed', 'success' );
    		   	}
    		   }); 
    		   $('#new-email').val('');
    		   $('#confirm-email').val('');
    		   $('#old-email').val('');
	    	}else{
	    		alert("Emails have to match");
	    	}

    },
    'click .js-change-pass':function(event){
    	var currentPassword = $('#current-password').val();
    	var newPassword = $('#new-password').val();
    	var confirmNewPassword = $('#confirm-new-password').val();
    	if(newPassword === confirmNewPassword){
    		Accounts.changePassword(currentPassword,newPassword , function(err){
    			if (err){
    				Bert.alert( event.reason, 'danger' );
    			}else{
    				Bert.alert( 'Password changed', 'success' );
    			}
    		});
    	}else{
    		Alert('Check password');
    	}
    	
    }

});

Template.dashboard.events({
    'click .js-add-contact':function(event){
		$('#addform').modal('show');
	},
	'click .js-add-contact-click':function(event){
		var creatorId =  Meteor.user()._id
		var firstname = $('#firstname').val();
		var lastname = $('#lastname').val();
		var company = $('#company').val();
		var address = $('#address').val();
		var phone = $('#phone').val();
		var mobile = $('#mobile').val();
		var fax = $('#fax').val();
		var email = $('#email').val();
		var others = $('#others').val();
		var comments = $('#comments').val();
		
		Contacts.insert({
			creatorid:creatorId,
			firstname:firstname,
			lastname:lastname,
			company:company,
			address:address,
			phone:phone,
			mobile:mobile,
			fax:fax,
			email:email,
			others:others,
			comments:comments,
			rating:0
		});

		 $('#addform').modal('hide');
	},

});

Template.contactItemEditDetails.events({
	'click #save':function(event){
		var firstname = $('#firstname').val();
		var lastname = $('#lastname').val();
		var company = $('#company').val();
		var address = $('#address').val();
		var phone = $('#phone').val();
		var mobile = $('#mobile').val();
		var fax = $('#fax').val();
		var email = $('#email').val();
		var others = $('#others').val();
		var comments = $('#comments').val();
		Contacts.update({_id:this._id},{$set: {
					firstname:firstname,
					lastname:lastname,
					company:company,
					address:address,
					phone:phone,
					mobile:mobile,
					fax:fax,
					email:email,
					others:others,
					comments:comments
				}});
		Router.go('/'+this._id);
	}
});


Template.contactItemEditDetails.events({
	'click #cancel':function(event){
		Router.go('/'+currentId);
	}
});

FlowRouter.route( '/verify-email/:token', {
  name: 'verify-email',
  action( params ) {
    Accounts.verifyEmail( params.token, ( error ) =>{
      if ( error ) {
        Bert.alert( error.reason, 'danger' );
      } else {
      	Router.go('/');
        Bert.alert( 'Email verified! Thanks!', 'success' );
      }
    });
  }
});


