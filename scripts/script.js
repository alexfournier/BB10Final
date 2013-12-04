

var db;
var multiArray = [];
var contactDetails = {};
var thisId = null;
var campusServices=[];
var serviceId;

// CONTACT VARs:
var firstName;
var lastName;
var homePhone;
var cellPhone;
var homeEmail;
var schoolEmail;
var description;
var contactID;
var initials;

// CALENDER VARs:
var courseName;
var classNumber;
var weekDay;
var time;
var eventLength;
var labChoice;
var reminderLength;
var reminderChoice;

function showTab(id) {
    
    //contacts page
    if (id == 'contactList') {
        document.getElementById('contactList').style.display = 'inline';
        document.getElementById('addContact').style.display = 'none';
    }
    if (id == 'addContact') {
        document.getElementById('contactList').style.display = 'none';
        document.getElementById('addContact').style.display = 'inline';
    }
    
    // timetable page
    if (id == 'addTimeTable') {
        document.getElementById('addTimeTable').style.display = 'inline';
        document.getElementById('myTimetable').style.display = 'none';
    }
    if (id == 'myTimetable') {
        document.getElementById('addTimeTable').style.display = 'none';
        document.getElementById('myTimeTable').style.display = 'inline';
    }
}

/***********************
    CREATE DB
***********************/

function createDB(){

    db = dbNamespace.db;
    db.transaction(function(tx) {
        tx.executeSql(
            "CREATE TABLE IF NOT EXISTS contacts(contact_ID INTEGER PRIMARY KEY, contactNote VARCHAR, imagePath text)", 
            [],

            function(trans, result) {
                showContacts();
               //handle  the success
               //alert("DB CREATED");
            }, 
            
            function(trans, error) {
                // handle the error
                alert("ERROR creating DB: " + error);
            }
        )
    });
}

function insertImagePath (path) {

    db.transaction(function(tx) {
        tx.executeSql(
            "UPDATE contacts SET imagePath = '" + path + "' WHERE contact_ID = " + thisId , 
            [],

            function(tx, result){
                //alert("contact was added");
            },
            function(tx, error){
                alert(error.code);
            }
        )
    });
}

function selectImage(){

    db.transaction(function(tx) {
        tx.executeSql(
            "SELECT imagePath FROM contacts WHERE contact_ID = " + thisId ,
            [],
            
            function(tx, result) {
                var contactResult = result;
                multiArray = [];
                if(contactResult.rows){
                    for(var i=0; i < contactResult.rows.length; i++){
                        var filepath = 'file://' + contactResult.rows.item(i).imagePath;
                        document.getElementById("contactImage").src = filepath;                             
                    }
                }                
            },         
            function(trans, error) {
                // handle the error
                alert("ERROR selcting: " + error);
            }
        )
    });
}

/***********************
        CALENDER
***********************/

    function onSaveSuccessCal(created) {
        // set evt to the object returned in save success callback, which
        // contains the persisted event id
        evt = created.id;
        alert("Event saved to device: " + evt);
    }

    function onSaveErrorCal(error) {
        alert("Error saving event to device: " + error.code);
    }

    function saveEvent(description) {
        courseName = document.getElementById("courseName").value;
        classNumber = document.getElementById("classNumber").value;
        weekDay = document.getElementById("weekDay").value;
        time = document.getElementById("time").value;
        eventLength = document.getElementById("eventLength").value;
        labChoice = document.getElementById("labChoice").setChecked(true);
        reminderLength = document.getElementById("reminderLength").value;
        reminderChoice = document.getElementById("reminderChoice").setChecked(true);
        
        if(courseName.length != 0){
            var calendar = blackberry.pim.calendar; CalendarEvent = calendar.CalendarEvent,
            calFields = {},

            courseName = {
                type: CalendarEvent.description,
                value: courseName
            },
            classNumber = {
                type: CalendarEvent.description,
                value: classNumber
            },
            weekDay = {
                type: CalendarEvent.description,
                value: weekDay
            },
            time = {
                type: CalendarEvent.description,
                value: time
            },
            eventLength = {
                type: CalendarEvent.description,
                value: eventLength
            },
            labChoice = {
                type: CalendarEvent.description,
                value: labChoice
            },
            reminderLength = {
                type: CalendarEvent.description,
                value: reminderLength
            },
            reminderChoice = {
                type: CalendarEvent.description,
                value: reminderChoice
            },
            evt;

            evt = calendar.createEvent({
                "description": [weekDay],
                "subject": [courseName],
                "venue": [classNumber],
                "start": new Date("Dec 06, 2013, 12:00"),
                "end": new Date("Dec 06, 2013, 12:30"),

                // if timezone is specified explicitly, then the times will be
                // for that particular timezone; otherwise, the times will be
                // for the current device timezone
                "timezone": "America/New_York"
             });
             evt.save(onSaveSuccessCal, onSaveErrorCal);
        }else{
            alert("error: Please enter the course name");
        }
    }

/***********************
    CREATE CONTACT
***********************/

function onSaveSuccess(contact) {
    
    contactID = contact.id;
    thisId = contact.id;

    db.transaction(function(tx) {
        tx.executeSql(
            "INSERT INTO contacts( contact_ID, contactNote ) VALUES (?,?)",
            [contactID, description],

            function(trans, result) {
                // handle  the success
                showContacts();
            }, 
                
            function(trans, error) {
                // handle the error
                alert("ERROR creating DB: " + error);
            }
        )
    });
}

function onSaveError(error) {
    alert("Error saving contact: " + error.message);
}

function createContact() {
    // find elemetn id
    firstName = document.getElementById("fName").value;
    lastName = document.getElementById("lName").value;
    homePhone = document.getElementById("hPhone").value;
    cellPhone = document.getElementById("cPhone").value;
    homeEmail = document.getElementById("hEmail").value;
    schoolEmail = document.getElementById("sEmail").value;
    description = document.getElementById("cNote").value;

    // validate that the minimum required fields
    if (firstName.length != 0) {
        if (lastName.length != 0) {
            if (homePhone.length != 0 || cellPhone.length != 0) {
                if (homeEmail.length != 0 || schoolEmail.length != 0) {
                    
                    var contacts = blackberry.pim.contacts, ContactField = contacts.ContactField,
                        name = {},
                        
                        hPhone = {
                            type: ContactField.HOME,
                            value: homePhone
                        },
                        cPhone = {
                            type: ContactField.MOBILE,
                            value: cellPhone
                        },
                        hEmail = {
                            type: ContactField.HOME,
                            value: homeEmail
                        },
                        sEmail = {
                            type: ContactField.WORK,
                            value: schoolEmail
                        },
                        contact;

                    name.familyName = lastName;
                    name.givenName = firstName;

                    contact = contacts.create({
                        "name": name,
                        "phoneNumbers": [cPhone, hPhone],
                        "emails": [hEmail, sEmail]
                    });
                    contact.save(onSaveSuccess, onSaveError);
                } else {
                    alert("error: Please enter at lease one email");
                }
            } else {
                alert("error: Please enter at lease one phone number");
            }
        } else {
            alert("error: Please enter a last name");
        }
    } else {
        alert("error: Please enter a first name");
    }
}

/***********************
    SHOW CONTACTS
***********************/

function showContacts(){
    
    db.transaction(function(tx) {
        tx.executeSql(
            "SELECT contact_ID, contactNote FROM contacts",
            [],

            function(tx, result) {
                //alert("in show contacts!!");
                var contactResult = result;
                var idCount;
                var notes;
                multiArray = [];
                if(contactResult.rows){
                    for(var i=0; i < contactResult.rows.length; i++){
                        idCount = contactResult.rows.item(i).contact_ID;
                        notes = contactResult.rows.item(i).contactNote;
                        grabContPIM(String(idCount), notes); //call func and pass the ID as a string and the DESC
                    }
                    buildContactList();
                }
            },
            
            function(tx, error) {
                // handle the error
                alert("ERROR creating DB: " + error);
            }
        )
    });
}

function grabContPIM(id, notes){

    var contacts = blackberry.pim.contacts;
    var contact = contacts.getContact(id);

    if (contact){
        
        contactDetails = {};
        contactDetails.firstName = contact.name.givenName;
        contactDetails.lastName = contact.name.familyName;
        contactDetails.howWeMet = notes;
        contactDetails.Id = id;
        contactDetails.initials = contactDetails.lastName.charAt(0).toUpperCase() + contactDetails.lastName.slice(1) + ", " + contactDetails.firstName.charAt(0).toUpperCase();
        
        if(contact.emails){
            for(i=0; i<contact.emails.length; i++){
                switch (contact.emails[i].type){
                    case 'home':
                    contactDetails.hEmail = contact.emails[i].value;
                    break;
                    case 'work':
                    contactDetails.sEmail = contact.emails[i].value;
                    break;
                }
            }
        }

        if(contact.phoneNumbers){
            for(x=0; x<contact.phoneNumbers.length; x++){
                switch (contact.phoneNumbers[x].type){
                    case "home":
                    contactDetails.hPhone = contact.phoneNumbers[x].value;
                    break;
                    case "mobile":
                    contactDetails.cPhone = contact.phoneNumbers[x].value;
                    
                }
            }
        }
        multiArray.push(contactDetails);
    }else{
        //call func to delete missing contact from db
        db.transaction(function(tx) {
            tx.executeSql(
                "DELETE from contacts WHERE contact_ID = ?",
                [id],
                function(){
                    alert("contact " + id + ": was deleted");
                },
                function(){
                    alert("not deleted");
                }
            )
        });
    }
}

/***********************
    BUILD CONTACT LIST
***********************/

function buildContactList() {
    
    var getDivListHolder = document.getElementById("allContacts");
    var items = [];
    
    for(var z = 0; z < multiArray.length; z++) {

        var contactDiv = document.createElement("div");
        contactDiv.setAttribute("data-bb-type","item");
        contactDiv.setAttribute("id", multiArray[z].Id);
        contactDiv.setAttribute("data-bb-title", multiArray[z].initials);
        contactDiv.setAttribute("onclick", "contactDetail(" + multiArray[z].Id + ")");
        items.push(contactDiv);
    }
    getDivListHolder.refresh(items);
    showTab('contactList');
}

/***********************
 BUILD CONTACT DETAILS
***********************/

function contactDetail(id){
    currentContactId = id;
    thisId = id;
    bb.pushScreen('contactDetails.html', 'contactDetails');
}

function buildContactDetails() {

    if(multiArray.length>0){

        var items = [];
        for(var i = 0; i < multiArray.length; i++) {

            if(multiArray[i].Id == currentContactId){
                
                document.getElementById("detailsTitle").setCaption(multiArray[i].firstName + ' ' + multiArray[i].lastName);
                
                var myPath = selectImage();
                

                if(multiArray[i].cPhone){    

                    var item;
                    div = document.createElement('div');
                    div.setAttribute('data-bb-type', 'header');
                    div.innerHTML='Mobile';
                    div.setAttribute('style', 'color: #fff;');
                    items.push(div);
                    
                    div = document.createElement('div');
                    div.setAttribute('data-bb-type', 'item');
                    div.setAttribute('data-bb-title', multiArray[i].cPhone);
                    div.setAttribute('data-bb-img', 'images/phone.png');
                    div.setAttribute('style', 'color: #fff;');
                    items.push(div);
                }
                
                if(multiArray[i].sEmail ){
                        
                    var item;
                    div = document.createElement('div');
                    div.setAttribute('data-bb-type', 'header');
                    div.innerHTML='School';
                    div.setAttribute('style', 'color: #fff;');
                    items.push(div);

                    div = document.createElement('div');
                    div.setAttribute('data-bb-type', 'item');
                    div.setAttribute('data-bb-title', multiArray[i].sEmail);
                    div.setAttribute('data-bb-img', 'images/mail.png');
                    div.setAttribute('style', 'color: #fff;');
                    items.push(div);
                }

                if( multiArray[i].hPhone || multiArray[i].hEmail ){
                    
                    div = document.createElement('div');
                    div.setAttribute('data-bb-type', 'header');
                    div.innerHTML='Home';
                    div.setAttribute('style', 'color: #fff;');
                    items.push(div);

                    if (multiArray[i].hEmail)
                    {
                        div = document.createElement('div');
                        div.setAttribute('data-bb-type', 'item');
                        div.setAttribute('data-bb-title', multiArray[i].hEmail);
                        div.setAttribute('data-bb-img', 'images/mail.png');
                        div.setAttribute('style', 'color: #fff;');
                        items.push(div);
                    }
                    if (multiArray[i].hPhone) 
                    {
                        div = document.createElement('div');
                        div.setAttribute('data-bb-type', 'item');
                        div.setAttribute('data-bb-title', multiArray[i].hPhone);
                        div.setAttribute('data-bb-img', 'images/phone.png');
                        div.setAttribute('style', 'color: #fff;');
                        items.push(div);
                    }
                }
                div = document.getElementById("description");
                div.setAttribute('data-bb-type', 'header');
                div.innerHTML='Contact Notes';
                div.setAttribute('style', 'color: #fff;');
                items.push(div);

                div = document.createElement('div');
                div.setAttribute('data-bb-type', 'item');
                div.setAttribute('data-bb-title', multiArray[i].howWeMet);
                div.setAttribute('data-bb-img', 'images/note.png');
                div.setAttribute('style', 'color: #fff; width: 100%;');
                items.push(div);
            }
        } 
        document.getElementById("cDetail").refresh(items);
    }
}

/***********************
    OC TRANSPO MOBILE
***********************/

function onInvokeSuccess() {
    console.log("Invocation successful!");
}

function onInvokeError(error) {
    console.log("Invocation failed, error: " + error);
}

function invokeBrowser() {
    // invoke web link - allows the system to choose an appropriate target that handles http://
    blackberry.invoke.invoke({
    uri: "http://www.octranspo.com/mobi"
    }, onInvokeSuccess, onInvokeError);
}

/***********************
    CAMERA CARD
***********************/

function invokeCameraCard() {

    var mode = blackberry.invoke.card.CAMERA_MODE_PHOTO;
    blackberry.invoke.card.invokeCamera(mode, function (path) {
        //alert("saved "+ path);
        var filepath = 'file://' + path;
        insertImagePath(path);
        document.getElementById("contactImage").src = filepath;
    },
         
    function (reason) {
        alert("cancelled " + reason);
    },
    
    function (error) {
        if (error) {
            alert("invoke error "+ error);
        } else {
            console.log("invoke success " );
        }
    });
}

/***********************
      JSON LOADING
***********************/

function fetch(){
    $.getJSON("campusServices.json", function(data) {
        
        campusServices = data.services;
        listItems=[]
        var item;

        for(i=0;i<campusServices.length;i++){
            item=document.createElement('div');
            item.setAttribute('data-bb-type', 'item');
            item.setAttribute('data-bb-title', campusServices[i].locationName );
            item.setAttribute('onclick', 'showServiceDetails(' + i +')');
            item.setAttribute('style', 'margin-left:-110px;');
            listItems.push(item);
        }
        document.getElementById("imageList").refresh(listItems);
    });
}

function showServiceDetails(id){
    serviceId = id;
    bb.pushScreen('serviceDetails.html', 'serviceDetails');    
}

function populatServiceDetails(){
    listItems=[];
    var item;

    for(i=0;i<campusServices[serviceId].locations.length;i++){
        document.getElementById("servicesDetailsTitle").setCaption(campusServices[serviceId].locationName); 
        
        item=document.createElement('div');
        item.setAttribute('data-bb-type', 'item');
        item.setAttribute('data-bb-title', campusServices[serviceId].locations[i].locationName );
        item.innerHTML = campusServices[serviceId].locations[i].building;
        item.setAttribute('style', 'color: #fff; margin-left:-100px;');
        listItems.push(item);
    }
    document.getElementById("imageListDetails").refresh(listItems);
}
