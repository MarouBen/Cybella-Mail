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
}


function load_inbox(list){
  fetch('/emails/inbox')
  .then(response => response.json())
  .then(emails => {
      // Print emails
      console.log(emails);
      
      // Show the emails
      
      emails.forEach(email => {
        const element = document.createElement('li');
        element.className = "list-group-item";
        if (email.read){
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
      });
      });
  }


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