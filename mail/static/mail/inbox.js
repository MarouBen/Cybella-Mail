document.addEventListener('DOMContentLoaded', function() {
  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').addEventListener('submit', send_mail);
  
  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {
  // Show compose view and hide other views
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#emails-section').style.display = 'none';
  document.querySelector('#Title').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#title-change').innerHTML = `<h3>Compose Email</h3>`;
  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#emails-section').style.display = 'block';
  document.querySelector('#Title').style.display = 'block';
  // Show the mailbox name
  document.querySelector('#title-change').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Container for the emails
  const tableBody = document.querySelector('#emails-view');

  // Load the emails
  if (mailbox === 'inbox'){
    setTimeout(function() {load_inbox(tableBody);}, 10);
  }
  if (mailbox === 'archive'){
    setTimeout(function() {load_archive(tableBody);}, 10);
  }
  if (mailbox === 'sent'){
    setTimeout(function() {load_sent(tableBody);}, 10);
  }
}

// load inbox emails
function load_inbox(list){
  fetch('/emails/inbox')
  .then(response => response.json())
  .then(emails => {
      // Print emails
      console.log(emails);
      
      // Show the emails
      show_emails(emails, list);
      });
  }

// load archive emails
function load_archive(list){
  fetch('/emails/archive')
  .then(response => response.json())
  .then(emails => {
      // Print emails
      console.log(emails);

      // show the emails
      show_emails(emails, list)
      });
  }

//load sent emails
function load_sent(list){
  fetch('/emails/sent')
  .then(response => response.json())
  .then(emails => {
      // Print emails
      console.log(emails);

      // show the emails
      show_emails(emails, list)
      });
  }

// function to view email
function view_email(id){
  document.querySelector('#emails-section').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#Title').style.display = 'none';
  document.querySelector('#email-view').style.display = 'block';
  
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
      // Print email
      console.log(email);
      // Show the email data
      document.querySelector('#email-subject').innerHTML = email.subject;
      document.querySelector('#email-sender').innerHTML = email.sender;
      document.querySelector('#time').innerHTML = email.timestamp;
      document.querySelector('#email-body').innerHTML = email.body;
      // archive button and unarchive button
      if (email.archived === true){
        document.querySelector("#archive_Icon").classList.add("text-rose-500");
      } else {
        document.querySelector("#archive_Icon").classList.remove("text-rose-500");
      }
      // mark email as read
      fetch(`/emails/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
            read: true
        })
      })
      // add event listener to buttons
      //// Archive Icon
      document.querySelector("#archive_Icon").addEventListener('click', () => {
        console.log("archive button clicked");
        if (email.archived === false){
          archive_email(email.id, "archive");
        }
        else if (email.archived === true){
          archive_email(email.id, "unarchive");
        }
      });
      //// Reply button
      document.querySelectorAll("#reply_btn,#reply").forEach((element)=>{
        element.addEventListener('click', () => {
        console.log("reply button clicked");
        reply_email(email.id);
        });
      });
      //// Forward button
      document.querySelectorAll("#forward_btn,#forward").forEach((element)=>{
        element.addEventListener('click', () => {
        console.log("forward button clicked");
        forward_email(email.id);
        });
      });
      //// Delete button
      document.querySelector("#delete").addEventListener('click', () => {
        console.log("delete button clicked");
        delete_email(email.id);
      });
  });
}


// function to archive email
function archive_email(id,action){
  if (action === "archive"){
    fetch(`/emails/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
          archived: true
      })
    })
  }
  else if (action === "unarchive"){
    fetch(`/emails/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
          archived: false
      })
    })
  }
  setTimeout(function() {load_mailbox('inbox');}, 10);
}

// function to reply email
function reply_email(id){
  compose_email();
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
      // Print email
      console.log(email);
      // Show the email data
      document.querySelector('#compose-recipients').value = email.sender;
      document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
      document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote: ${email.body}
      \n ------------------------------------------------------\n`;
  });
}

// function to forward email
function forward_email(id){
  compose_email();
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
      // Print email
      console.log(email);
      // Show the email data
      document.querySelector('#compose-recipients').value = "";
      document.querySelector('#compose-subject').value = `Forwarded: ${email.subject}`;
      document.querySelector('#compose-body').value = email.body;
  });
}

// function to send email
function send_mail(){
  event.preventDefault()
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: document.querySelector('#compose-recipients').value,
        subject: document.querySelector('#compose-subject').value,
        body: document.querySelector('#compose-body').value
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
  });
  setTimeout(function() {load_mailbox('sent');}, 10);
}


// function to show emails in a table format
function show_emails(emails, tableBody){
  // clear the table
  tableBody.innerHTML = '';

  emails.forEach(email => {
    // create a row for each email
    const element = document.createElement('tr');
    element.className = "border-b hover:bg-gray-50 cursor-pointer hover:shadow-lg"; 

    // add a checkbox
    const checkbox = document.createElement('input');
    checkbox.className = "w-4 h-4 text-sky-700 rounded bg-gray-100 border-gray-500";
    checkbox.type = "checkbox";

    const checkkboxtd = document.createElement('td');
    checkkboxtd.className = "p-4 w-1 leading-3";
    checkkboxtd.append(checkbox);
    element.append(checkkboxtd);
    

    // data for the row
    const sender = document.createElement('td');
    sender.className = "p-2";
    sender.innerHTML = email.sender;

    const subject = document.createElement('td');
    subject.className = "p-2";
    subject.innerHTML = email.subject;

    const timestamp = document.createElement('td');
    timestamp.className = "p-2 text-right";
    timestamp.innerHTML = email.timestamp;

    const id = document.createElement('td');
    id.className = "hidden";
    id.value = email.id;

    // append data to the row
    element.append(sender);
    element.append(subject);
    element.append(timestamp);
    element.append(id);

    // append row to the table
    tableBody.append(element);
    // add event listener to the email
    element.addEventListener('click', () => view_email(email.id));
     // add event listener to checkbox
     checkbox.addEventListener('click', (event) => {
      // prevent click event from propagating to row element
      event.stopPropagation();
    });
  });
}

//function to delete email
function delete_email(id){
  fetch(`/emails/delete/${id}`, {
    method: 'DELETE',
  })
  setTimeout(function() {load_mailbox('inbox');}, 10);
}

// function to refresh the section
function refresh(){
  var location = document.querySelector("TITLE").innerHTML;
  if (location === "Inbox"){
    load_mailbox('inbox');
  }
  else if (location === "Sent"){
    load_mailbox('sent');
  }
  else if (location === "Archive"){
    load_mailbox('archive');
  }
}

// function to select all
function select_all(){
  var checkboxes = document.querySelectorAll('input[type=checkbox]');
  checkboxes.forEach((checkbox) => {
    checkbox.toggleAttribute("checked");
  });
}

//function that deletes all selected emails
function delete_selected(){
  var checkboxes = document.querySelectorAll('input[type=checkbox]');
  checkboxes.forEach((checkbox) => {
    if (checkbox.checked){
      var id = checkbox.parentElement.parentElement.lastElementChild.value;
      delete_email(id);
    }
  });
}

//function that search for emails
