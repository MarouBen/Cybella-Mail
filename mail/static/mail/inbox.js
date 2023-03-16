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
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Container for the emails
  const list = document.createElement('ul')
  list.className = "list-group emails-list"
  document.querySelector('#emails-view').append(list)

  // Load the emails
  if (mailbox === 'inbox'){
    load_inbox(list)
  }
  if (mailbox === 'archive'){
    load_archive(list)
  }
  if (mailbox === 'sent'){
    load_sent(list)
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
  document.querySelector('#email-view').style.display = 'block';
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  const email_view = document.querySelector('#email-view');

  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
      // Print email
      console.log(email);

      // archive button and unarchive button
      if (email.archived === false){
        email_view.innerHTML = `<button class="btn btn-sm btn-outline-primary" type="button" onclick="archive_email(${email.id},'archive')">Archive</button>`;
      }
      else if (email.archived === true){
        email_view.innerHTML = `<button class="btn btn-sm btn-outline-primary" type="button" onclick="archive_email(${email.id},'unarchive')">Unarchive</button>`;
      }

      // Show the email data
      email_view.innerHTML += `<h3>${email.subject}</h3>`;
      email_view.innerHTML += `<h5>From: ${email.sender}</h5>`;
      email_view.innerHTML += `<h5>To: ${email.recipients}</h5>`;
      email_view.innerHTML += `<h5>Timestamp: ${email.timestamp}</h5>`;
      email_view.innerHTML += `<h5>Subject: ${email.subject}</h5>`;
      email_view.innerHTML += `<h5>Body: ${email.body}</h5>`;
      // mark email as read
      fetch(`/emails/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
            read: true
        })
      })
      // reply button
      email_view.innerHTML += `<button class="btn btn-sm btn-outline-primary" type="button" onclick="reply_email(${email.id})">Reply</button>`;
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
  load_mailbox('inbox');
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


// function to show emails
function show_emails(emails, list){
  emails.forEach(email => {
    const element = document.createElement('li');
    element.className = "list-group-item email";
    if (email.read === true){
      element.classList.add("read")
    }
    
    const checkbox = document.createElement('input');
    checkbox.className = "form-check-input";
    checkbox.type = "checkbox";

    const contentDiv = document.createElement('div');
    contentDiv.className = "content d-flex justify-content-between ps-3";
    contentDiv.innerHTML = `<span class="me-2">${email.sender}</span><span class="me-2">${email.subject}</span><span>${email.timestamp}</span>`

    contentDiv.append(checkbox)
    element.append(contentDiv)
    list.append(element)
    // add event listener to the email
    element.addEventListener('click', () => view_email(email.id));
  });
}