Template.tickets.helpers({
  activeTickets: function () {
    // Figure out what column this ticket viewer is in, defaults to 1.
    const column = this.column ? this.column : 1;

    if (Meteor.user()) {

    // Check if we have any tickets that have been claimed by us or are owned by us.
    var myTickets = Tickets.find({
      status: {
        $in: ['CLAIMED']
      }, // Narrow down selection by grouping based on table number because columns
      location: {
        $gt: column*100, $lt: (column+1)*100
      },
      $or: [ {userId: Meteor.user()._id }, {claimId: Meteor.user()._id} ]
    }).fetch();

    // console.log(myTickets);

    var openTickets = Tickets.find({
      status: {
        $in: ['OPEN']
      }, // Narrow down selection by grouping based on table number.
      location: {
        $gt: column*100, $lt: (column+1)*100
      }
    }).fetch();

    // console.log(openTickets);

    var concattedArray = myTickets.concat(openTickets);

  } else {
    // Do not freak out if the user is not logged in.
    var concattedArray = [];
  }

  return concattedArray;
  }
});
