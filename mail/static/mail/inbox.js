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
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

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
    load_inbox(tableBody)
  }
  if (mailbox === 'archive'){
    load_archive(tableBody)
  }
  if (mailbox === 'sent'){
    load_sent(tableBody)
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
  const email_view = document.querySelector('#email-view');
  
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
      // mark email as read
      fetch(`/emails/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
            read: true
        })
      })
      
      // reply button
      email_view.innerHTML += `<button class="btn btn-sm btn-outline-primary" type="button" onclick="reply_email(${email.id})">Reply</button>`;
       
      // archive button and unarchive button
       if (email.archived === true){
        document.querySelector("#archive_Icon").classList.toggle("text-rose-500");
       }
      
       // add event listener to archive button
      document.querySelector("#archive_Icon").addEventListener('click', () => {
        console.log("archive button clicked");
        if (email.archived === false){
          archive_email(email.id, "archive");
        }
        else if (email.archived === true){
          archive_email(email.id, "unarchive");
        }
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
      document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote: ${email.body}`;
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
  load_mailbox('sent');
}


// function to show emails in a table format
function show_emails(emails, tableBody){
  // clear the table
  tableBody.innerHTML = '';

  emails.forEach(email => {
    // create a row for each email
    const element = document.createElement('tr');
    element.className = "border-b hover:bg-gray-50 cursor-pointer "; 

    // add a checkbox
    const checkbox = document.createElement('input');
    checkbox.className = "w-4 h-4 text-blue-600 rounded  ring-offset-gray-800 bg-gray-700 border-gray-600";
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

    // append data to the row
    element.append(sender);
    element.append(subject);
    element.append(timestamp);

    // append row to the table
    tableBody.append(element);
    // add event listener to the email
    element.addEventListener('click', () => view_email(email.id));
  });
}