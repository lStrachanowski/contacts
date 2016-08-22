Contacts = new Mongo.Collection("contacts");

Contacts.allow({
	insert: function (userId, doc) {
    if (Meteor.user() ){
  		if(userId != doc.creatorid){
  			return false;
  		}else{
  			return true;
  		}
  	}else{
  		return false;
  	}
	},

	update: function (userId, doc) {
    if (Meteor.user() ){
  		if(userId != doc.creatorid){
  			return false;
  		}else{
  			return true;
  		}
  	}else{
  		return false;
  	}
	},

	remove: function (userId, doc) {
    if (Meteor.user() ){
  		if(userId != doc.creatorid){
  			return false;
  		}else{
  			return true;
  		}
  	}else{
  		return false;
  	}
	}

		
});